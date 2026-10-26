import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";

import { isEmailDeliveryConfigured, sendVerificationEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";

const allowedRoles = new Set(["STUDENT", "TEACHER", "PARENT"]);

export async function POST(request) {
  let body;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return Response.json({ error: "Invalid registration details" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const role = typeof body.role === "string" ? body.role.trim().toUpperCase() : "STUDENT";

  if (!name || !email || !password) {
    return Response.json({ error: "All fields are required" }, { status: 400 });
  }

  if (name.length < 2 || name.length > 100) {
    return Response.json({ error: "Name must be between 2 and 100 characters" }, { status: 400 });
  }

  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: "Enter a valid email address" }, { status: 400 });
  }

  if (password.length < 8 || Buffer.byteLength(password, "utf8") > 72) {
    return Response.json(
      { error: "Password must be at least 8 characters and no more than 72 bytes" },
      { status: 400 }
    );
  }

  if (!allowedRoles.has(role)) {
    return Response.json({ error: "Choose a valid account type" }, { status: 400 });
  }

  if (!isEmailDeliveryConfigured()) {
    return Response.json(
      { error: "Email verification is not configured yet. Please contact the EduNexa administrator." },
      { status: 503 }
    );
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return Response.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const requestedRole = role === "STUDENT" ? null : role;
    const now = new Date();
    const recentTokens = await prisma.verificationToken.count({
      where: { identifier: email, createdAt: { gte: new Date(now.getTime() - 60 * 60 * 1000) } },
    });
    if (recentTokens >= 3) {
      return Response.json(
        { error: "Too many verification emails were requested. Please try again later." },
        { status: 429 }
      );
    }

    const token = randomBytes(32).toString("base64url");
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const expires = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const user = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: "STUDENT",
          requestedRole,
        },
      });
      await tx.verificationToken.create({ data: { identifier: email, token: tokenHash, expires } });
      return createdUser;
    });

    let verificationSent = true;
    try {
      const verificationUrl = new URL(
        `/auth/verify-email?token=${encodeURIComponent(token)}`,
        process.env.AUTH_URL || request.url
      );
      await sendVerificationEmail({ email, name, url: verificationUrl.toString() });
    } catch (mailError) {
      verificationSent = false;
      console.error("VERIFICATION EMAIL DELIVERY ERROR:", mailError);
    }

    return Response.json(
      {
        message: verificationSent
          ? "Check your email for a verification link to finish creating your account."
          : "Your account is ready for verification, but the email could not be sent. Request another link from the verification page.",
        verificationSent,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          requestedRole: user.requestedRole,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error?.code === "P2002") {
      return Response.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    console.error("REGISTER ERROR:", error);
    return Response.json(
      { error: "Something went wrong while creating the account" },
      { status: 500 }
    );
  }
}

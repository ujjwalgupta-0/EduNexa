import { createHash, randomBytes } from "node:crypto";

import { isEmailDeliveryConfigured, sendVerificationEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";

const genericMessage = "If this address has an unverified EduNexa account, a verification email will be sent.";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }

  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: "Enter a valid email address" }, { status: 400 });
  }

  if (!isEmailDeliveryConfigured()) {
    return Response.json({ message: genericMessage });
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { email: true, emailVerified: true, name: true, password: true },
  });
  if (!user?.password || user.emailVerified) return Response.json({ message: genericMessage });

  const pendingToken = await prisma.verificationToken.findFirst({
    where: { identifier: email },
    select: { token: true },
  });
  if (!pendingToken) return Response.json({ message: genericMessage });

  const now = new Date();
  const recentTokens = await prisma.verificationToken.count({
    where: { identifier: email, createdAt: { gte: new Date(now.getTime() - 60 * 60 * 1000) } },
  });
  if (recentTokens >= 3) return Response.json({ message: genericMessage });

  const token = randomBytes(32).toString("base64url");
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const expires = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  await prisma.$transaction(async (tx) => {
    await tx.verificationToken.updateMany({
      where: { identifier: email, expires: { gt: now } },
      data: { expires: now },
    });
    await tx.verificationToken.create({ data: { identifier: email, token: tokenHash, expires } });
  });

  try {
    const verificationUrl = new URL(
      `/auth/verify-email?token=${encodeURIComponent(token)}`,
      process.env.AUTH_URL || request.url
    );
    await sendVerificationEmail({ email, name: user.name, url: verificationUrl.toString() });
  } catch (error) {
    console.error("VERIFICATION EMAIL RESEND ERROR:", error);
  }

  return Response.json({ message: genericMessage });
}

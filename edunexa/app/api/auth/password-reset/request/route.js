import { createHash, randomBytes } from "node:crypto";

import { prisma } from "@/lib/prisma";

const hashToken = (token) => createHash("sha256").update(token).digest("hex");
const genericMessage = "If a password-enabled account matches that email, recovery instructions are available.";

export async function POST(request) {
  if (process.env.NODE_ENV === "production") {
    return Response.json({ error: "Password recovery email is not configured. Contact the EduNexa administrator." }, { status: 503 });
  }

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

  const user = await prisma.user.findUnique({ where: { email }, select: { id: true, password: true } });
  if (!user?.password) return Response.json({ message: genericMessage });

  const now = new Date();
  const token = randomBytes(32).toString("base64url");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(now.getTime() + 30 * 60 * 1000);
  const withinLimit = await prisma.$transaction(async (tx) => {
    const requestsInLastHour = await tx.passwordResetToken.count({
      where: { userId: user.id, createdAt: { gte: new Date(now.getTime() - 60 * 60 * 1000) } },
    });
    if (requestsInLastHour >= 3) return false;

    await tx.passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null } });
    await tx.passwordResetToken.create({ data: { userId: user.id, tokenHash, expiresAt } });
    return true;
  });

  if (withinLimit) {
    const resetUrl = new URL(`/forgot-password?token=${encodeURIComponent(token)}`, request.url);
    console.info("[password-reset] Development-only reset URL:", resetUrl.toString());
  }

  return Response.json({ message: genericMessage });
}

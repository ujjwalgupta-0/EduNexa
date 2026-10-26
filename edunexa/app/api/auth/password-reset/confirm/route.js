import { createHash } from "node:crypto";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }

  const token = typeof body?.token === "string" ? body.token.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  if (token.length < 32 || token.length > 100) {
    return Response.json({ error: "This password reset link is invalid or expired" }, { status: 400 });
  }
  if (password.length < 8 || Buffer.byteLength(password, "utf8") > 72) {
    return Response.json({ error: "Password must be at least 8 characters and no more than 72 bytes" }, { status: 400 });
  }

  const tokenHash = createHash("sha256").update(token).digest("hex");
  const passwordHash = await bcrypt.hash(password, 12);
  const now = new Date();

  try {
    await prisma.$transaction(async (tx) => {
      const resetToken = await tx.passwordResetToken.findUnique({ where: { tokenHash } });
      if (!resetToken || resetToken.usedAt || resetToken.expiresAt <= now) {
        throw new Error("RESET_LINK_INVALID");
      }

      const claimed = await tx.passwordResetToken.updateMany({
        where: { id: resetToken.id, usedAt: null, expiresAt: { gt: now } },
        data: { usedAt: now },
      });
      if (claimed.count !== 1) throw new Error("RESET_LINK_INVALID");

      await tx.user.update({ where: { id: resetToken.userId }, data: { password: passwordHash } });
      await tx.passwordResetToken.updateMany({
        where: { userId: resetToken.userId, id: { not: resetToken.id }, usedAt: null },
        data: { usedAt: now },
      });
    });
  } catch (error) {
    if (error?.message === "RESET_LINK_INVALID") {
      return Response.json({ error: "This password reset link is invalid or expired" }, { status: 400 });
    }
    throw error;
  }

  return Response.json({ message: "Password updated successfully" });
}

import { createHash } from "node:crypto";

import { prisma } from "@/lib/prisma";

export async function GET(request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token") || "";
  const loginUrl = new URL("/login", request.url);

  if (token.length < 32 || token.length > 100) {
    loginUrl.searchParams.set("emailVerification", "invalid");
    return Response.redirect(loginUrl);
  }

  const tokenHash = createHash("sha256").update(token).digest("hex");
  const now = new Date();
  const verified = await prisma.$transaction(async (tx) => {
    const storedToken = await tx.verificationToken.findUnique({ where: { token: tokenHash } });
    if (!storedToken || storedToken.expires <= now) return false;

    const user = await tx.user.findUnique({
      where: { email: storedToken.identifier },
      select: { id: true, emailVerified: true },
    });
    if (!user) return false;

    const claimed = await tx.verificationToken.updateMany({
      where: { token: tokenHash, expires: { gt: now } },
      data: { expires: now },
    });
    if (claimed.count !== 1) return false;

    if (!user.emailVerified) {
      await tx.user.update({
        where: { id: user.id },
        data: { emailVerified: now },
      });
    }
    return true;
  });

  loginUrl.searchParams.set("emailVerification", verified ? "success" : "invalid");
  return Response.redirect(loginUrl);
}

import { createHash, randomBytes } from "node:crypto";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const hashCode = (code) => createHash("sha256").update(code).digest("hex");

export async function POST(request) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Authentication required" }, { status: 401 });
  if (session.user.role !== "STUDENT") return Response.json({ error: "Student access required" }, { status: 403 });

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }

  const email = typeof body?.parentEmail === "string" ? body.parentEmail.trim().toLowerCase() : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: "Enter a valid parent email address" }, { status: 400 });
  }

  const student = await prisma.user.findUnique({ where: { id: session.user.id }, select: { email: true } });
  if (student?.email?.toLowerCase() === email) {
    return Response.json({ error: "Use a different email for your parent or guardian" }, { status: 400 });
  }

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentCount = await prisma.parentLinkInvitation.count({
    where: { studentId: session.user.id, createdAt: { gte: since } },
  });
  if (recentCount >= 5) return Response.json({ error: "You have reached the daily code limit. Try again tomorrow." }, { status: 429 });

  const code = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await prisma.parentLinkInvitation.create({
    data: { studentId: session.user.id, parentEmail: email, tokenHash: hashCode(code), expiresAt },
  });

  return Response.json({ code, expiresAt: expiresAt.toISOString() }, { status: 201 });
}

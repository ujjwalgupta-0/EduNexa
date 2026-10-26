import { createHash } from "node:crypto";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Authentication required" }, { status: 401 });
  if (session.user.role !== "PARENT") return Response.json({ error: "Approved parent access is required" }, { status: 403 });

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }

  const code = typeof body?.code === "string" ? body.code.trim() : "";
  if (code.length < 20 || code.length > 200 || !session.user.email) {
    return Response.json({ error: "This invitation code is invalid or unavailable" }, { status: 400 });
  }

  const tokenHash = createHash("sha256").update(code).digest("hex");
  const invitation = await prisma.parentLinkInvitation.findUnique({ where: { tokenHash } });
  if (!invitation || invitation.acceptedAt || invitation.expiresAt <= new Date()) {
    return Response.json({ error: "This invitation code is invalid or expired" }, { status: 400 });
  }
  if (invitation.parentEmail !== session.user.email.trim().toLowerCase()) {
    return Response.json({ error: "Sign in with the email address this code was created for" }, { status: 403 });
  }

  try {
    await prisma.$transaction(async (tx) => {
      const claimed = await tx.parentLinkInvitation.updateMany({
        where: { id: invitation.id, acceptedAt: null, expiresAt: { gt: new Date() } },
        data: { acceptedAt: new Date(), acceptedById: session.user.id },
      });
      if (claimed.count !== 1) throw new Error("INVITATION_ALREADY_USED");
      await tx.parentChild.create({ data: { parentId: session.user.id, studentId: invitation.studentId } });
    });
  } catch (error) {
    if (error?.message === "INVITATION_ALREADY_USED" || error?.code === "P2002") {
      return Response.json({ error: "This invitation has already been used or this student is already linked" }, { status: 409 });
    }
    throw error;
  }

  return Response.json({ message: "Student linked successfully" });
}

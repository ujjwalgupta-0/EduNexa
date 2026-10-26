import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const approvableRoles = ["TEACHER", "PARENT"];

export async function PATCH(request) {
  const session = await auth();

  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  if (session.user.role !== "ADMIN") {
    return Response.json({ error: "Administrator access required" }, { status: 403 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }

  const { userId, decision } = body ?? {};
  if (typeof userId !== "string" || !["approve", "deny"].includes(decision)) {
    return Response.json({ error: "Invalid role request action" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { requestedRole: true, emailVerified: true },
  });

  if (!user || !user.emailVerified || !approvableRoles.includes(user.requestedRole)) {
    return Response.json({ error: "This role request is no longer available" }, { status: 404 });
  }

  const update = await prisma.user.updateMany({
    where: { id: userId, requestedRole: user.requestedRole, emailVerified: { not: null } },
    data:
      decision === "approve"
        ? { role: user.requestedRole, requestedRole: null }
        : { requestedRole: null },
  });

  if (update.count !== 1) {
    return Response.json({ error: "This role request has already been handled" }, { status: 409 });
  }

  return Response.json({
    message: decision === "approve" ? "Role request approved" : "Role request declined",
    role: decision === "approve" ? user.requestedRole : null,
  });
}

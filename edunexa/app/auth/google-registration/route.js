import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const requestableRoles = new Set(["TEACHER", "PARENT"]);

export async function GET(request) {
  const session = await auth();

  if (!session?.user?.id) {
    return Response.redirect(new URL("/login", request.url));
  }

  const requestedRole = new URL(request.url).searchParams.get("role")?.toUpperCase();
  const destination = new URL("/dashboard", request.url);
  const existingAccountUrl = new URL("/create-account?googleSignup=existing", request.url);

  const [googleAccount, user] = await Promise.all([
    prisma.account.findFirst({
      where: { userId: session.user.id, provider: "google" },
      select: { userId: true },
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, requestedRole: true },
    }),
  ]);

  // This endpoint is for an authenticated Google identity only. Do not let a
  // credentials-only session submit a role request by visiting the URL.
  if (!googleAccount || !user) {
    return Response.redirect(existingAccountUrl);
  }

  if (user.role === requestedRole || user.requestedRole === requestedRole) {
    return Response.redirect(destination);
  }

  if (user.role === "STUDENT" && user.requestedRole === null && requestableRoles.has(requestedRole)) {
    const updated = await prisma.user.updateMany({
      where: {
        id: session.user.id,
        role: "STUDENT",
        requestedRole: null,
      },
      data: { requestedRole },
    });

    if (updated.count === 1) {
      return Response.redirect(destination);
    }
  }

  return Response.redirect(existingAccountUrl);
}

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const loginRoles = new Set(["STUDENT", "TEACHER", "PARENT", "ADMIN"]);

export async function GET(request) {
  const session = await auth();
  const url = new URL(request.url);

  if (!session?.user?.id) {
    return Response.redirect(new URL("/login?googleError=failed", request.url));
  }

  const requestedRole = url.searchParams.get("role")?.toUpperCase() ?? "STUDENT";
  const loginRole = loginRoles.has(requestedRole) ? requestedRole : "STUDENT";

  // Auth.js creates a user record on a first Google login. Continue through
  // the same registration handler so teacher/parent requests are recorded
  // and the new account gets the expected onboarding flow.
  if (session.user.isNewGoogleSignup) {
    return Response.redirect(
      new URL(`/auth/google-registration?role=${loginRole.toLowerCase()}`, request.url)
    );
  }

  const account = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, requestedRole: true },
  });
  if (!account) {
    return Response.redirect(new URL("/login?googleError=failed", request.url));
  }

  const actualRole = account.role;
  const matchesRole = actualRole === loginRole ||
    (actualRole === "STUDENT" && account.requestedRole === loginRole && ["TEACHER", "PARENT"].includes(loginRole));

  if (!matchesRole) {
    return Response.redirect(
      new URL(`/login?role=${loginRole.toLowerCase()}&googleError=role`, request.url)
    );
  }

  return Response.redirect(new URL("/dashboard", request.url));
}

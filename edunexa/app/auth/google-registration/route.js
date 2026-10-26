import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const requestableRoles = new Set(["TEACHER", "PARENT"]);

export async function GET(request) {
  const session = await auth();
  const destination = new URL("/dashboard", request.url);

  if (!session?.user?.id) {
    return Response.redirect(new URL("/login", request.url));
  }

  if (!session.user.isNewGoogleSignup) {
    return Response.redirect(new URL("/create-account?googleSignup=existing", request.url));
  }

  const requestedRole = new URL(request.url).searchParams.get("role")?.toUpperCase();

  if (requestableRoles.has(requestedRole)) {
    await prisma.user.updateMany({
      where: {
        id: session.user.id,
        role: "STUDENT",
        requestedRole: null,
      },
      data: { requestedRole },
    });
  }

  return Response.redirect(destination);
}

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Authentication required" }, { status: 401 });
  if (session.user.role !== "STUDENT") return Response.json({ error: "Student access required" }, { status: 403 });

  const enrollments = await prisma.enrollment.findMany({
    where: { studentId: session.user.id },
    include: { course: { select: { id: true, title: true, subject: true, description: true, teacher: { select: { name: true } } } } },
    orderBy: { createdAt: "desc" },
  });
  return Response.json({ courses: enrollments.map(({ course, createdAt }) => ({ ...course, enrolledAt: createdAt })) });
}

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

  const joinCode = typeof body?.joinCode === "string" ? body.joinCode.trim().toUpperCase() : "";
  if (!/^[A-F0-9]{24}$/.test(joinCode)) return Response.json({ error: "Enter a valid course join code" }, { status: 400 });

  const course = await prisma.course.findUnique({ where: { joinCode }, select: { id: true } });
  if (!course) return Response.json({ error: "No course was found for that code" }, { status: 404 });

  try {
    await prisma.enrollment.create({ data: { studentId: session.user.id, courseId: course.id } });
  } catch (error) {
    if (error?.code === "P2002") return Response.json({ error: "You are already enrolled in this course" }, { status: 409 });
    throw error;
  }
  return Response.json({ message: "You are now enrolled" }, { status: 201 });
}

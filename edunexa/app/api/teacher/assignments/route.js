import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Sign in to create an assignment." }, { status: 401 });
  if (session.user.role !== "TEACHER") return Response.json({ error: "Teacher access is required." }, { status: 403 });

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Enter the assignment details and try again." }, { status: 400 });
  }

  const title = typeof body.title === "string" ? body.title.trim() : "";
  const instructions = typeof body.instructions === "string" ? body.instructions.trim() : "";
  const points = Number(body.maxPoints);
  const dueAt = body.dueAt ? new Date(body.dueAt) : null;
  if (!body.courseId || !title || title.length > 160 || instructions.length < 10 || instructions.length > 10000) {
    return Response.json({ error: "Add a course, a title under 160 characters, and instructions between 10 and 10,000 characters." }, { status: 400 });
  }
  if (!Number.isInteger(points) || points < 1 || points > 1000) {
    return Response.json({ error: "Points must be a whole number from 1 to 1,000." }, { status: 400 });
  }
  if (body.dueAt && Number.isNaN(dueAt.getTime())) {
    return Response.json({ error: "Choose a valid due date." }, { status: 400 });
  }

  const course = await prisma.course.findFirst({
    where: { id: body.courseId, teacherId: session.user.id },
    select: { id: true },
  });
  if (!course) return Response.json({ error: "Choose one of your courses." }, { status: 404 });

  const assignment = await prisma.assignment.create({
    data: { courseId: course.id, teacherId: session.user.id, title, instructions, maxPoints: points, dueAt },
    select: { id: true },
  });
  return Response.json({ assignment }, { status: 201 });
}

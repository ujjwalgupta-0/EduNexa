import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { validateQuizPayload } from "@/lib/quizzes";

export async function POST(request) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Authentication required" }, { status: 401 });
  if (session.user.role !== "TEACHER") return Response.json({ error: "Teacher access required" }, { status: 403 });

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }

  const validated = validateQuizPayload(body);
  if (validated.error) return Response.json({ error: validated.error }, { status: 400 });

  const course = await prisma.course.findFirst({
    where: { id: validated.data.courseId, teacherId: session.user.id },
    select: { id: true },
  });
  if (!course) return Response.json({ error: "Choose a course you teach." }, { status: 404 });

  const quiz = await prisma.quiz.create({
    data: {
      courseId: course.id,
      teacherId: session.user.id,
      title: validated.data.title,
      description: validated.data.description,
      status: "DRAFT",
      questions: { create: validated.data.questions },
    },
    select: { id: true },
  });

  return Response.json({ quiz }, { status: 201 });
}

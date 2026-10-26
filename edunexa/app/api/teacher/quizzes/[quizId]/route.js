import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { validateQuizPayload } from "@/lib/quizzes";

export async function PATCH(request, { params }) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Authentication required" }, { status: 401 });
  if (session.user.role !== "TEACHER") return Response.json({ error: "Teacher access required" }, { status: 403 });

  const { quizId } = await params;
  const quiz = await prisma.quiz.findFirst({
    where: { id: quizId, teacherId: session.user.id },
    select: { id: true, status: true },
  });
  if (!quiz) return Response.json({ error: "Quiz not found" }, { status: 404 });
  if (quiz.status !== "DRAFT") return Response.json({ error: "Published quizzes cannot be edited." }, { status: 409 });

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }

  const validated = validateQuizPayload(body);
  if (validated.error) return Response.json({ error: validated.error }, { status: 400 });
  const status = body?.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT";

  const course = await prisma.course.findFirst({
    where: { id: validated.data.courseId, teacherId: session.user.id },
    select: { id: true },
  });
  if (!course) return Response.json({ error: "Choose a course you teach." }, { status: 404 });

  await prisma.$transaction(async (tx) => {
    await tx.quizQuestion.deleteMany({ where: { quizId } });
    await tx.quiz.update({
      where: { id: quizId },
      data: {
        courseId: course.id,
        title: validated.data.title,
        description: validated.data.description,
        status,
        publishedAt: status === "PUBLISHED" ? new Date() : null,
        questions: { create: validated.data.questions },
      },
    });
  });

  return Response.json({ message: status === "PUBLISHED" ? "Quiz published" : "Draft saved", status });
}

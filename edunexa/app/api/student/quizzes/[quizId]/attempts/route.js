import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request, { params }) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Authentication required" }, { status: 401 });
  if (session.user.role !== "STUDENT") return Response.json({ error: "Student access required" }, { status: 403 });

  const { quizId } = await params;
  const quiz = await prisma.quiz.findFirst({
    where: { id: quizId, status: "PUBLISHED" },
    include: { questions: { orderBy: { position: "asc" } } },
  });
  if (!quiz) return Response.json({ error: "Quiz not found or not published" }, { status: 404 });

  const enrollment = await prisma.enrollment.findUnique({
    where: { studentId_courseId: { studentId: session.user.id, courseId: quiz.courseId } },
    select: { studentId: true },
  });
  if (!enrollment) return Response.json({ error: "You must be enrolled in this course to take its quiz." }, { status: 403 });

  const previousAttempt = await prisma.quizAttempt.findUnique({
    where: { quizId_studentId: { quizId, studentId: session.user.id } },
    select: { id: true },
  });
  if (previousAttempt) return Response.json({ error: "You have already submitted this quiz." }, { status: 409 });

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }

  if (!Array.isArray(body?.answers) || body.answers.length !== quiz.questions.length) {
    return Response.json({ error: "Answer every question before submitting." }, { status: 400 });
  }

  const submittedAnswers = new Map();
  for (const answer of body.answers) {
    if (typeof answer?.questionId !== "string" || !Number.isInteger(answer?.selectedOptionIndex)) {
      return Response.json({ error: "One or more answers are invalid." }, { status: 400 });
    }
    submittedAnswers.set(answer.questionId, answer.selectedOptionIndex);
  }

  if (submittedAnswers.size !== quiz.questions.length || quiz.questions.some((question) => {
    const selected = submittedAnswers.get(question.id);
    return !Number.isInteger(selected) || selected < 0 || selected >= question.options.length;
  })) {
    return Response.json({ error: "Answer every question with one of its available options." }, { status: 400 });
  }

  const answers = quiz.questions.map((question) => ({
    questionId: question.id,
    selectedOptionIndex: submittedAnswers.get(question.id),
    isCorrect: submittedAnswers.get(question.id) === question.correctOptionIndex,
  }));
  const score = answers.filter((answer) => answer.isCorrect).length;

  try {
    const attempt = await prisma.$transaction(async (tx) => {
      const createdAttempt = await tx.quizAttempt.create({
        data: {
          quizId,
          studentId: session.user.id,
          score,
          totalQuestions: quiz.questions.length,
          answers: { create: answers },
        },
        select: { id: true, score: true, totalQuestions: true, submittedAt: true },
      });

      await tx.learningActivity.create({
        data: {
          studentId: session.user.id,
          courseId: quiz.courseId,
          quizId: quiz.id,
          type: "QUIZ_SUBMITTED",
        },
      });

      return createdAttempt;
    });

    return Response.json({
      attempt,
      review: quiz.questions.map((question, index) => ({
        id: question.id,
        prompt: question.prompt,
        options: question.options,
        selectedOptionIndex: answers[index].selectedOptionIndex,
        correctOptionIndex: question.correctOptionIndex,
        isCorrect: answers[index].isCorrect,
        explanation: question.explanation,
        topic: question.topic,
      })),
    }, { status: 201 });
  } catch (error) {
    if (error?.code === "P2002") return Response.json({ error: "You have already submitted this quiz." }, { status: 409 });
    throw error;
  }
}

import { notFound, redirect } from "next/navigation";
import WorkspacePageHeader from "@/app/components/WorkspacePageHeader";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import QuizRunner from "./QuizRunner";

export default async function StudentQuizPage({ params }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "STUDENT") redirect("/dashboard");

  const { quizId } = await params;
  const quiz = await prisma.quiz.findFirst({
    where: {
      id: quizId,
      status: "PUBLISHED",
      course: { enrollments: { some: { studentId: session.user.id } } },
    },
    include: {
      course: { select: { id: true, title: true, subject: true } },
      questions: { orderBy: { position: "asc" } },
      attempts: {
        where: { studentId: session.user.id },
        include: { answers: { include: { question: true } } },
        take: 1,
      },
    },
  });
  if (!quiz) notFound();

  const previousAttempt = quiz.attempts[0];
  const initialResult = previousAttempt ? {
    attempt: {
      score: previousAttempt.score,
      totalQuestions: previousAttempt.totalQuestions,
      submittedAt: previousAttempt.submittedAt,
    },
    review: previousAttempt.answers
      .sort((a, b) => a.question.position - b.question.position)
      .map(({ question, selectedOptionIndex, isCorrect }) => ({
        id: question.id,
        prompt: question.prompt,
        options: question.options,
        selectedOptionIndex,
        correctOptionIndex: question.correctOptionIndex,
        isCorrect,
        explanation: question.explanation,
        topic: question.topic,
      })),
  } : null;

  const safeQuestions = quiz.questions.map(({ id, prompt, options, topic }) => ({ id, prompt, options, topic }));

  return (
    <main className="ui-page min-h-screen px-5 py-7 sm:px-8 sm:py-9">
      <div className="mx-auto max-w-4xl">
        <WorkspacePageHeader href="/student/quizzes" backLabel="Back to quizzes" />
        <p className="ui-eyebrow">{quiz.course.subject} · {quiz.course.title}</p>
        <h1 className="ui-page-title mt-2 text-3xl">{quiz.title}</h1>
        {quiz.description && <p className="mt-3 max-w-2xl whitespace-pre-wrap text-sm leading-6 text-subtle">{quiz.description}</p>}
        <p className="mt-3 text-xs text-stone-500">{quiz.questions.length} questions · one submission</p>
        <QuizRunner quizId={quiz.id} questions={safeQuestions} initialResult={initialResult} />
      </div>
    </main>
  );
}

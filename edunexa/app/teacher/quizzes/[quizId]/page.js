import { notFound, redirect } from "next/navigation";
import WorkspacePageHeader from "@/app/components/WorkspacePageHeader";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import QuizEditor from "../QuizEditor";

export default async function EditTeacherQuizPage({ params }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "TEACHER") redirect("/dashboard");

  const { quizId } = await params;
  const [quiz, courses] = await Promise.all([
    prisma.quiz.findFirst({
      where: { id: quizId, teacherId: session.user.id },
      include: { questions: { orderBy: { position: "asc" } } },
    }),
    prisma.course.findMany({
      where: { teacherId: session.user.id },
      select: { id: true, title: true, subject: true },
      orderBy: { title: "asc" },
    }),
  ]);
  if (!quiz) notFound();

  return (
    <main className="ui-page min-h-screen px-5 py-7 sm:px-8 sm:py-9">
      <div className="mx-auto max-w-4xl">
        <WorkspacePageHeader href="/teacher/quizzes" backLabel="Back to quizzes" />
        <p className="ui-eyebrow">Quiz review</p>
        <h1 className="ui-page-title mt-2 text-3xl">Review and publish</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-subtle">Check each question, answer, and explanation. Publishing makes this quiz available to students enrolled in its course.</p>
        <QuizEditor courses={courses} initialQuiz={quiz} />
      </div>
    </main>
  );
}

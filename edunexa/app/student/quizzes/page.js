import Link from "next/link";
import { ArrowRight, CheckCircle2, ClipboardList } from "lucide-react";
import { redirect } from "next/navigation";
import WorkspacePageHeader from "@/app/components/WorkspacePageHeader";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function StudentQuizzesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "STUDENT") redirect("/dashboard");

  const quizzes = await prisma.quiz.findMany({
    where: {
      status: "PUBLISHED",
      course: { enrollments: { some: { studentId: session.user.id } } },
    },
    include: {
      course: { select: { title: true, subject: true } },
      _count: { select: { questions: true } },
      attempts: {
        where: { studentId: session.user.id },
        select: { id: true, score: true, totalQuestions: true, submittedAt: true },
        take: 1,
      },
    },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <main className="ui-page min-h-screen px-5 py-7 sm:px-8 sm:py-9">
      <div className="mx-auto max-w-5xl">
        <WorkspacePageHeader href="/student/dashboard" backLabel="Back to dashboard" />
        <p className="ui-eyebrow">Practice</p>
        <h1 className="ui-page-title mt-2 text-3xl">My quizzes</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-subtle">Quizzes published by your teachers appear here. Your answers are checked on the server and the results are saved to your learning record.</p>

        <section className="mt-8 space-y-3">
          {quizzes.length ? quizzes.map((quiz) => {
            const attempt = quiz.attempts[0];
            return (
              <article key={quiz.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-white p-5 sm:p-6">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-amber-800">{quiz.course.subject}</p>
                  <h2 className="mt-1 font-semibold tracking-tight">{quiz.title}</h2>
                  <p className="mt-1 text-sm text-subtle">{quiz.course.title} · {quiz._count.questions} questions</p>
                  {attempt && <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-emerald-800"><CheckCircle2 size={14} />Submitted {attempt.score}/{attempt.totalQuestions} · {attempt.submittedAt.toLocaleDateString()}</p>}
                </div>
                <Link href={`/student/quizzes/${quiz.id}`} className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2.5 text-sm font-semibold transition hover:bg-stone-50">
                  {attempt ? "View result" : "Take quiz"}<ArrowRight size={15} />
                </Link>
              </article>
            );
          }) : (
            <div className="rounded-2xl border border-dashed border-line bg-white px-6 py-12 text-center">
              <ClipboardList size={24} className="mx-auto text-stone-400" />
              <h2 className="mt-4 font-semibold">No quizzes available yet</h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-subtle">When a teacher publishes a quiz for one of your enrolled courses, you’ll find it here.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

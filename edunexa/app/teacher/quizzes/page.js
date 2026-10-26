import Link from "next/link";
import { FilePlus2, Pencil, Users } from "lucide-react";
import { redirect } from "next/navigation";
import WorkspacePageHeader from "@/app/components/WorkspacePageHeader";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function TeacherQuizzesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "TEACHER") redirect("/dashboard");

  const quizzes = await prisma.quiz.findMany({
    where: { teacherId: session.user.id },
    include: {
      course: { select: { title: true, subject: true } },
      _count: { select: { questions: true, attempts: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <main className="ui-page min-h-screen px-5 py-7 sm:px-8 sm:py-9">
      <div className="mx-auto max-w-5xl">
        <WorkspacePageHeader href="/teacher/dashboard" backLabel="Back to dashboard" />
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div><p className="ui-eyebrow">Teaching</p><h1 className="ui-page-title mt-2 text-3xl">Quizzes</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-subtle">Create a draft, review every question and answer, then publish it to students enrolled in that course.</p></div>
          <Link href="/teacher/quizzes/new" className="inline-flex items-center gap-2 rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"><FilePlus2 size={16} />Create quiz</Link>
        </div>

        <section className="mt-8 space-y-3">
          {quizzes.length ? quizzes.map((quiz) => (
            <article key={quiz.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-white p-5 sm:p-6">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold tracking-tight">{quiz.title}</h2><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${quiz.status === "PUBLISHED" ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-900"}`}>{quiz.status === "PUBLISHED" ? "Published" : "Draft"}</span></div>
                <p className="mt-1 text-sm text-subtle">{quiz.course.title} · {quiz.course.subject}</p>
                <p className="mt-2 flex items-center gap-3 text-xs text-stone-500"><span>{quiz._count.questions} questions</span><span className="inline-flex items-center gap-1"><Users size={13} />{quiz._count.attempts} submissions</span></p>
              </div>
              {quiz.status === "DRAFT" ? <Link href={`/teacher/quizzes/${quiz.id}`} className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2.5 text-sm font-semibold hover:bg-stone-50"><Pencil size={14} />Review draft</Link> : <span className="text-xs text-stone-400">Published {quiz.publishedAt?.toLocaleDateString()}</span>}
            </article>
          )) : (
            <div className="rounded-2xl border border-dashed border-line bg-white px-6 py-12 text-center">
              <h2 className="font-semibold">No quizzes yet</h2>
              <p className="mt-2 text-sm text-subtle">Create a quiz for one of your courses. Students enrolled in that course will see it here.</p>
              <Link href="/teacher/quizzes/new" className="mt-5 inline-flex items-center gap-2 rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white"><FilePlus2 size={15} />Create your first quiz</Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

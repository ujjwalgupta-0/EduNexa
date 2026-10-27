import Link from "next/link";
import BrandLink from "@/app/components/BrandLink";
import { redirect } from "next/navigation";
import { ArrowRight, UsersRound } from "lucide-react";

import ParentDashboardHeader from "@/app/components/dashboard/ParentDashboardHeader";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function ParentDashboard() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "PARENT") redirect("/dashboard");

  const children = await prisma.parentChild.findMany({
    where: { parentId: session.user.id },
    include: {
      student: {
        select: {
          id: true,
          name: true,
          email: true,
          quizAttempts: {
            select: {
              id: true,
              score: true,
              totalQuestions: true,
              submittedAt: true,
              quiz: { select: { title: true } },
            },
            orderBy: { submittedAt: "desc" },
            take: 5,
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  const firstName = session.user.name?.trim().split(/\s+/)[0] || "there";
  const quizCount = children.reduce((sum, { student }) => sum + student.quizAttempts.length, 0);

  return (
    <div className="min-h-screen bg-[#f5f3ee] text-[#292622]">
      <ParentDashboardHeader />
      <main className="px-5 py-8 sm:px-7 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-sm font-semibold text-amber-800">PARENT DASHBOARD</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight">Welcome, {firstName}</h1>
          <p className="mt-2 text-gray-500">Stay connected to your family&apos;s learning progress.</p>
        </div>

        <section aria-label="Family overview" className="grid gap-4 sm:grid-cols-2">
          <article className="rounded-2xl border border-stone-200 bg-white p-5">
            <div className="flex items-start justify-between"><div><p className="text-sm text-stone-500">Linked students</p><p className="mt-3 text-3xl font-semibold tracking-tight tabular-nums">{children.length}</p></div><span className="rounded-xl bg-amber-50 p-2.5 text-amber-900"><UsersRound size={19} /></span></div>
            <p className="mt-4 text-xs text-stone-500">Students connected to your account</p>
          </article>
          <article className="rounded-2xl border border-stone-200 bg-white p-5">
            <div className="flex items-start justify-between"><div><p className="text-sm text-stone-500">Recent quiz results</p><p className="mt-3 text-3xl font-semibold tracking-tight tabular-nums">{quizCount}</p></div><span className="rounded-xl bg-amber-50 p-2.5 text-amber-900"><ArrowRight size={19} /></span></div>
            <p className="mt-4 text-xs text-stone-500">Across your linked students</p>
          </article>
        </section>

        <section className="mt-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div><h2 className="text-xl font-bold">Your students</h2><p className="mt-1 text-sm text-gray-500">Recent learning progress for each linked student.</p></div>
            {children.length > 0 && <Link href="/parent/link-child" className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-4 py-2.5 text-sm font-semibold text-stone-950 hover:bg-amber-400"><UsersRound size={16} />Link another student</Link>}
          </div>

        {children.length ? (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {children.map(({ student, createdAt }) => {
              const attempts = student.quizAttempts;
              const average = attempts.length
                ? Math.round(attempts.reduce((sum, attempt) => sum + (attempt.score / attempt.totalQuestions) * 100, 0) / attempts.length)
                : null;
              return (
              <article key={student.id} className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-800"><UsersRound size={21} /></div>
                <h2 className="mt-4 text-lg font-semibold">{student.name || "Student"}</h2>
                {student.email && <p className="mt-1 text-sm text-gray-500">{student.email}</p>}
                <p className="mt-4 text-xs text-gray-400">Linked {createdAt.toLocaleDateString()}</p>
                <div className="mt-5 border-t border-stone-100 pt-4">
                  <div className="flex items-center justify-between"><h3 className="text-sm font-semibold">Recent learning</h3><span className="text-xs text-stone-500">{average === null ? "No quiz results" : `${average}% recent average`}</span></div>
                  {attempts.length ? <ul className="mt-3 space-y-2">{attempts.slice(0, 3).map((attempt) => <li key={attempt.id} className="flex items-center justify-between gap-3 text-sm"><span className="truncate text-stone-600">{attempt.quiz.title}</span><span className="shrink-0 font-medium tabular-nums">{Math.round((attempt.score / attempt.totalQuestions) * 100)}%</span></li>)}</ul> : <p className="mt-2 text-xs text-stone-500">Quiz results will appear here when they submit a quiz.</p>}
                </div>
              </article>
            );})}
          </div>
        ) : (
          <div className="mt-5 rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-800"><UsersRound size={21} /></div>
            <h2 className="mt-4 text-lg font-semibold">No students linked yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">Use a one-time invitation code shared by your student to connect their account.</p>
            <Link href="/parent/link-child" className="mt-6 inline-flex items-center gap-2 rounded-full bg-amber-500 px-5 py-3 text-sm font-semibold text-stone-950 hover:bg-amber-400">Enter invitation code <ArrowRight size={16} /></Link>
          </div>
        )}
        </section>
      </div>
      </main>
    </div>
  );
}

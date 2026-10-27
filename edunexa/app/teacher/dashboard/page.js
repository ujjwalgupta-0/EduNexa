import Link from "next/link";
import { ArrowRight, BookOpen, ClipboardCheck, Plus, TrendingUp, Users } from "lucide-react";
import { redirect } from "next/navigation";
import BrandLink from "@/app/components/BrandLink";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function TeacherDashboard() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "TEACHER") redirect("/dashboard");

  const [courses, enrollments, quizzes, attempts, assignmentCount, submissionsToGradeCount, submissionsToGrade, recentAssignments] = await Promise.all([
    prisma.course.findMany({
      where: { teacherId: session.user.id },
      include: { _count: { select: { enrollments: true, quizzes: true } } },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.enrollment.findMany({
      where: { course: { teacherId: session.user.id } },
      select: { studentId: true },
    }),
    prisma.quiz.findMany({
      where: { teacherId: session.user.id },
      select: { id: true, status: true },
    }),
    prisma.quizAttempt.findMany({
      where: { quiz: { teacherId: session.user.id } },
      include: {
        student: { select: { name: true } },
        quiz: { select: { title: true, course: { select: { title: true } } } },
      },
      orderBy: { submittedAt: "desc" },
      take: 100,
    }),
    prisma.assignment.count({ where: { teacherId: session.user.id } }),
    prisma.assignmentSubmission.count({ where: { grade: null, assignment: { teacherId: session.user.id } } }),
    prisma.assignmentSubmission.findMany({
      where: { grade: null, assignment: { teacherId: session.user.id } },
      include: {
        student: { select: { name: true } },
        assignment: { select: { id: true, title: true, course: { select: { title: true } } } },
      },
      orderBy: { submittedAt: "desc" },
      take: 6,
    }),
    prisma.assignment.findMany({
      where: { teacherId: session.user.id },
      include: { course: { select: { title: true } }, _count: { select: { submissions: true } } },
      orderBy: { updatedAt: "desc" },
      take: 6,
    }),
  ]);

  const studentCount = new Set(enrollments.map(({ studentId }) => studentId)).size;
  const publishedQuizCount = quizzes.filter(({ status }) => status === "PUBLISHED").length;
  const averageScore = attempts.length
    ? `${Math.round(attempts.reduce((sum, attempt) => sum + (attempt.score / attempt.totalQuestions) * 100, 0) / attempts.length)}%`
    : "—";
  const firstName = session.user.name?.trim().split(/\s+/)[0] || "Teacher";
  const stats = [
    { title: "Enrolled students", value: studentCount, note: "Across your courses", icon: Users },
    { title: "Courses", value: courses.length, note: "Courses you manage", icon: BookOpen },
    { title: "Published quizzes", value: publishedQuizCount, note: "Available to students", icon: ClipboardCheck },
    { title: "Assignments", value: assignmentCount, note: "Work set for your students", icon: ClipboardCheck },
    { title: "Average quiz score", value: averageScore, note: `Based on ${attempts.length} recent submissions`, icon: TrendingUp },
  ];

  return (
    <main className="min-h-screen bg-[#f5f3ee] p-5 text-[#292622] sm:p-7 md:p-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-7 border-b border-stone-200 pb-4"><BrandLink size={32} /></div>

        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-800">Teacher workspace</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Good to see you, {firstName}</h1>
            <p className="mt-2 text-sm text-stone-600">Courses, quizzes, and student results in one place.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/teacher/courses" className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-4 py-3 text-sm font-semibold hover:bg-stone-50"><BookOpen size={16} />Manage courses</Link>
            <Link href="/teacher/assignments" className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-4 py-3 text-sm font-semibold hover:bg-stone-50">Manage assignments</Link>
            <Link href="/teacher/assignments/new" className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-4 py-3 text-sm font-semibold text-stone-950 hover:bg-amber-400"><Plus size={17} />Create assignment</Link>
            <Link href="/teacher/quizzes/new" className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-4 py-3 text-sm font-semibold text-stone-950 hover:bg-amber-400"><Plus size={17} />Create quiz</Link>
          </div>
        </div>

        <section aria-label="Teaching overview" className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {stats.map(({ title, value, note, icon: Icon }) => {
            const content = <>
              <div className="flex items-start justify-between"><div><p className="text-sm text-stone-500">{title}</p><p className="mt-3 text-3xl font-semibold tracking-tight tabular-nums">{value}</p></div><span className="rounded-xl bg-amber-50 p-2.5 text-amber-900"><Icon size={19} /></span></div>
              <p className="mt-4 text-xs text-stone-500">{note}{title === "Enrolled students" && <span className="ml-2 font-semibold text-amber-900">View list →</span>}</p>
            </>;
            return title === "Enrolled students"
              ? <Link key={title} href="/teacher/students" className="rounded-2xl border border-stone-200 bg-white p-5 transition hover:border-amber-300 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700">{content}</Link>
              : <article key={title} className="rounded-2xl border border-stone-200 bg-white p-5">{content}</article>;
          })}
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3"><div><h2 className="font-semibold">Your courses</h2><p className="mt-1 text-xs text-stone-500">Current enrolment and quiz totals</p></div><Link href="/teacher/courses" className="text-xs font-semibold text-amber-900 hover:underline">All courses</Link></div>
            {courses.length ? <div className="mt-5 divide-y divide-stone-100">{courses.slice(0, 6).map((course) => <article key={course.id} className="flex flex-wrap items-center justify-between gap-3 py-4 first:pt-0 last:pb-0"><div><p className="font-medium">{course.title}</p><p className="mt-1 text-xs text-stone-500">{course.subject}</p></div><div className="flex items-center gap-4 text-xs text-stone-500"><span>{course._count.enrollments} students</span><span>{course._count.quizzes} quizzes</span></div></article>)}</div> : <div className="mt-5 rounded-xl bg-stone-50 px-5 py-8 text-center"><p className="text-sm font-medium">No courses yet</p><p className="mt-1 text-xs text-stone-500">Create a course to organize your students and quizzes.</p><Link href="/teacher/courses" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-amber-900">Manage courses <ArrowRight size={14} /></Link></div>}
          </section>

          <section className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3"><div><h2 className="font-semibold">Recent quiz submissions</h2><p className="mt-1 text-xs text-stone-500">Scores from your students</p></div><Link href="/teacher/quizzes" className="text-xs font-semibold text-amber-900 hover:underline">Manage quizzes</Link></div>
            {attempts.length ? <div className="mt-5 space-y-2">{attempts.slice(0, 6).map((attempt) => <article key={attempt.id} className="flex items-center justify-between gap-3 rounded-xl bg-stone-50 px-4 py-3"><div className="min-w-0"><p className="truncate text-sm font-medium">{attempt.student.name || "Student"}</p><p className="mt-0.5 truncate text-xs text-stone-500">{attempt.quiz.title} · {attempt.quiz.course.title}</p></div><span className="shrink-0 text-sm font-semibold tabular-nums">{Math.round((attempt.score / attempt.totalQuestions) * 100)}%</span></article>)}</div> : <div className="mt-5 rounded-xl bg-stone-50 px-5 py-8 text-center"><p className="text-sm font-medium">No submissions yet</p><p className="mt-1 text-xs text-stone-500">Published quiz results will appear here.</p><Link href="/teacher/quizzes/new" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-amber-900">Create a quiz <ArrowRight size={14} /></Link></div>}
          </section>
        </div>

        <section className="mt-6 rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><h2 className="font-semibold">Assignment submissions to grade</h2><p className="mt-1 text-xs text-stone-500">{submissionsToGrade.length ? "Open a response to review it and leave feedback." : "New student work will appear here."}</p></div>
            <Link href="/teacher/assignments" className="text-xs font-semibold text-amber-900 hover:underline">Manage assignments{submissionsToGradeCount ? ` · ${submissionsToGradeCount} waiting` : ""}</Link>
          </div>
          {submissionsToGrade.length ? <div className="mt-5 divide-y divide-stone-100">{submissionsToGrade.map((submission) => <Link key={submission.id} href={`/teacher/assignments/${submission.assignment.id}`} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"><span className="min-w-0"><span className="block truncate text-sm font-medium">{submission.student.name || "Student"} · {submission.assignment.title}</span><span className="mt-0.5 block truncate text-xs text-stone-500">{submission.assignment.course.title}</span></span><span className="shrink-0 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-900">Needs grading</span></Link>)}</div> : recentAssignments.length ? <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{recentAssignments.map((assignment) => <Link key={assignment.id} href={`/teacher/assignments/${assignment.id}`} className="rounded-xl bg-stone-50 px-4 py-3 transition hover:bg-amber-50"><span className="block truncate text-sm font-medium">{assignment.title}</span><span className="mt-1 block truncate text-xs text-stone-500">{assignment.course.title} · {assignment._count.submissions} submissions</span></Link>)}</div> : <div className="mt-5 rounded-xl bg-stone-50 px-5 py-7 text-center"><p className="text-sm font-medium">No assignments yet</p><p className="mt-1 text-xs text-stone-500">Create work for a course and student submissions will be organized here.</p><Link href="/teacher/assignments/new" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-amber-900">Create an assignment <ArrowRight size={14} /></Link></div>}
        </section>
      </div>
    </main>
  );
}

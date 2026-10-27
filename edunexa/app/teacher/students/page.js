import Link from "next/link";
import { ArrowLeft, BookOpen, CalendarDays, ClipboardCheck, Mail, Users } from "lucide-react";
import { redirect } from "next/navigation";

import BrandLink from "@/app/components/BrandLink";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function TeacherStudentsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "TEACHER") redirect("/dashboard");

  const students = await prisma.user.findMany({
    where: {
      role: "STUDENT",
      enrollments: { some: { course: { teacherId: session.user.id } } },
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      enrollments: {
        where: { course: { teacherId: session.user.id } },
        select: {
          createdAt: true,
          course: { select: { title: true, subject: true } },
        },
        orderBy: { createdAt: "desc" },
      },
      quizAttempts: {
        where: { quiz: { teacherId: session.user.id } },
        select: {
          score: true,
          totalQuestions: true,
          submittedAt: true,
          quiz: { select: { title: true } },
        },
        orderBy: { submittedAt: "desc" },
      },
      assignmentSubmissions: {
        where: { assignment: { teacherId: session.user.id } },
        select: { id: true, submittedAt: true, assignment: { select: { title: true } } },
        orderBy: { submittedAt: "desc" },
      },
    },
    orderBy: [{ name: "asc" }, { email: "asc" }],
  });

  return (
    <main className="ui-page min-h-screen px-5 py-8 sm:px-8 sm:py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-7 border-b border-stone-200 pb-4"><BrandLink size={32} /></div>
        <Link href="/teacher/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-amber-900 hover:underline"><ArrowLeft size={16} />Back to dashboard</Link>
        <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="ui-eyebrow">Teacher workspace</p>
            <h1 className="ui-page-title mt-2">Enrolled students</h1>
            <p className="mt-2 text-sm text-stone-600">Student profiles and learning records from courses you teach.</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-700"><Users size={16} className="text-amber-800" />{students.length} {students.length === 1 ? "student" : "students"}</div>
        </div>

        {students.length ? (
          <div className="mt-7 grid gap-4 lg:grid-cols-2">
            {students.map((student) => {
              const average = student.quizAttempts.length
                ? Math.round(student.quizAttempts.reduce((sum, attempt) => sum + (attempt.totalQuestions ? attempt.score / attempt.totalQuestions : 0), 0) / student.quizAttempts.length * 100)
                : null;
              return (
                <article key={student.id} className="ui-panel p-5 sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold text-stone-900">{student.name || "Student"}</h2>
                      <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-stone-600"><Mail size={14} />{student.email || "No email on account"}</p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-900"><CalendarDays size={14} />Account created {student.createdAt.toLocaleDateString("en-IN", { dateStyle: "medium" })}</span>
                  </div>

                  <div className="mt-5 border-t border-stone-100 pt-4">
                    <h3 className="inline-flex items-center gap-2 text-sm font-semibold text-stone-800"><BookOpen size={15} className="text-amber-800" />Your courses ({student.enrollments.length})</h3>
                    <ul className="mt-2 flex flex-wrap gap-2">
                      {student.enrollments.map((enrollment) => <li key={`${student.id}-${enrollment.course.title}`} className="rounded-lg bg-stone-50 px-3 py-2 text-xs text-stone-700">{enrollment.course.title}<span className="ml-1 text-stone-500">· {enrollment.course.subject}</span></li>)}
                    </ul>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl bg-stone-50 p-4">
                      <h3 className="inline-flex items-center gap-2 text-sm font-semibold text-stone-800"><ClipboardCheck size={15} className="text-amber-800" />Quiz performance</h3>
                      <p className="mt-3 text-2xl font-semibold tabular-nums text-stone-900">{average === null ? "—" : `${average}%`}</p>
                      <p className="mt-1 text-xs text-stone-500">Average across {student.quizAttempts.length} submitted {student.quizAttempts.length === 1 ? "quiz" : "quizzes"}</p>
                      {student.quizAttempts.length > 0 && <p className="mt-3 truncate text-xs text-stone-600">Latest: {student.quizAttempts[0].quiz.title}</p>}
                    </div>
                    <div className="rounded-xl bg-stone-50 p-4">
                      <h3 className="text-sm font-semibold text-stone-800">Assignments</h3>
                      <p className="mt-3 text-2xl font-semibold tabular-nums text-stone-900">{student.assignmentSubmissions.length}</p>
                      <p className="mt-1 text-xs text-stone-500">Submitted for your courses</p>
                      {student.assignmentSubmissions.length > 0 && <p className="mt-3 truncate text-xs text-stone-600">Latest: {student.assignmentSubmissions[0].assignment.title}</p>}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <section className="ui-panel mt-7 px-6 py-14 text-center">
            <Users size={28} className="mx-auto text-amber-800" />
            <h2 className="mt-4 text-lg font-semibold text-stone-900">No enrolled students yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-stone-600">Students will appear here after they enroll in one of your courses.</p>
            <Link href="/teacher/courses" className="ui-primary mt-5 inline-flex">Manage courses</Link>
          </section>
        )}
      </div>
    </main>
  );
}

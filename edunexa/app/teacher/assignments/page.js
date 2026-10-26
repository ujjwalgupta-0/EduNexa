import Link from "next/link";
import { FileText, Plus } from "lucide-react";
import { redirect } from "next/navigation";
import WorkspacePageHeader from "@/app/components/WorkspacePageHeader";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function TeacherAssignmentsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "TEACHER") redirect("/dashboard");

  const assignments = await prisma.assignment.findMany({
    where: { teacherId: session.user.id },
    include: { course: { select: { title: true, subject: true } }, _count: { select: { submissions: true } } },
    orderBy: [{ dueAt: "asc" }, { createdAt: "desc" }],
  });

  return (
    <main className="ui-page min-h-screen px-5 py-7 sm:px-8 sm:py-9">
      <div className="mx-auto max-w-5xl">
        <WorkspacePageHeader href="/teacher/dashboard" backLabel="Back to dashboard" />
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div><p className="ui-eyebrow">Teaching</p><h1 className="ui-page-title mt-2 text-3xl">Assignments</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-subtle">Set work for a course, choose a due date, and review student submissions.</p></div>
          <Link href="/teacher/assignments/new" className="inline-flex items-center gap-2 rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"><Plus size={16} />Create assignment</Link>
        </div>
        <section className="mt-8 space-y-3">
          {assignments.length ? assignments.map((assignment) => (
            <Link key={assignment.id} href={`/teacher/assignments/${assignment.id}`} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-white p-5 transition hover:border-amber-300 sm:p-6">
              <div className="min-w-0"><h2 className="font-semibold tracking-tight">{assignment.title}</h2><p className="mt-1 text-sm text-subtle">{assignment.course.title} · {assignment.course.subject}</p><p className="mt-2 text-xs text-stone-500">{assignment.dueAt ? `Due ${assignment.dueAt.toLocaleString()}` : "No due date"} · {assignment.maxPoints} points · {assignment._count.submissions} submissions</p></div>
              <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-900">Review work</span>
            </Link>
          )) : (
            <div className="rounded-2xl border border-dashed border-line bg-white px-6 py-12 text-center"><FileText size={25} className="mx-auto text-stone-400" /><h2 className="mt-3 font-semibold">No assignments yet</h2><p className="mt-2 text-sm text-subtle">Create an assignment to share work with students in one of your courses.</p><Link href="/teacher/assignments/new" className="mt-5 inline-flex items-center gap-2 rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white"><Plus size={15} />Create your first assignment</Link></div>
          )}
        </section>
      </div>
    </main>
  );
}

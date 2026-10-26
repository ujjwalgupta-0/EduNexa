import Link from "next/link";
import { ClipboardCheck } from "lucide-react";
import { redirect } from "next/navigation";
import Sidebar from "@/app/components/dashboard/Sidebar";
import WorkspacePageHeader from "@/app/components/WorkspacePageHeader";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function StudentAssignmentsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "STUDENT") redirect("/dashboard");

  const assignments = await prisma.assignment.findMany({
    where: { course: { enrollments: { some: { studentId: session.user.id } } } },
    include: {
      course: { select: { title: true, subject: true } },
      submissions: { where: { studentId: session.user.id }, select: { id: true, grade: true, submittedAt: true } },
    },
  });
  assignments.sort((a, b) => (a.dueAt?.getTime() ?? Infinity) - (b.dueAt?.getTime() ?? Infinity));

  return (
    <div className="min-h-screen bg-[#f5f3ee] text-[#292622]"><Sidebar isConfigured={Boolean(process.env.GEMINI_API_KEY)} /><main className="px-5 py-7 sm:px-8 sm:py-9 lg:ml-64"><div className="mx-auto max-w-5xl">
      <WorkspacePageHeader href="/student/dashboard" backLabel="Back to dashboard" />
      <p className="ui-eyebrow">Learning</p><h1 className="ui-page-title mt-2 text-3xl">Assignments</h1><p className="mt-3 text-gray-600">Work set by teachers in your enrolled courses.</p>
      <section className="mt-7 space-y-3">
        {assignments.length ? assignments.map((assignment) => {
          const submission = assignment.submissions[0];
          const isLate = assignment.dueAt && assignment.dueAt < new Date() && !submission;
          const label = submission?.grade !== null && submission?.grade !== undefined ? `Graded · ${submission.grade}/${assignment.maxPoints}` : submission ? "Submitted · awaiting grade" : isLate ? "Past due" : "Not submitted";
          return <Link key={assignment.id} href={`/student/assignments/${assignment.id}`} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-stone-200 bg-white p-5 transition hover:border-amber-300 sm:p-6">
            <div className="min-w-0"><h2 className="font-semibold">{assignment.title}</h2><p className="mt-1 text-sm text-stone-500">{assignment.course.title} · {assignment.course.subject}</p><p className="mt-2 text-xs text-stone-500">{assignment.dueAt ? `Due ${assignment.dueAt.toLocaleString()}` : "No due date"} · {assignment.maxPoints} points</p></div>
            <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${submission?.grade !== null && submission?.grade !== undefined ? "bg-emerald-50 text-emerald-800" : isLate ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-900"}`}>{label}</span>
          </Link>;
        }) : <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-12 text-center"><ClipboardCheck size={26} className="mx-auto text-stone-400" /><h2 className="mt-3 font-semibold">No assignments yet</h2><p className="mt-2 text-sm text-stone-500">Your teachers’ assignments will appear here.</p><Link href="/student/courses" className="mt-4 inline-flex rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-stone-950">Browse courses</Link></div>}
      </section>
    </div></main></div>
  );
}

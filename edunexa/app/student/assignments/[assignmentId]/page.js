import { notFound, redirect } from "next/navigation";
import Sidebar from "@/app/components/dashboard/Sidebar";
import OpenDoubtSolverButton from "@/app/components/dashboard/OpenDoubtSolverButton";
import WorkspacePageHeader from "@/app/components/WorkspacePageHeader";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AssignmentSubmissionForm from "./AssignmentSubmissionForm";

export default async function StudentAssignmentPage({ params }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "STUDENT") redirect("/dashboard");
  const { assignmentId } = await params;
  const assignment = await prisma.assignment.findFirst({
    where: { id: assignmentId, course: { enrollments: { some: { studentId: session.user.id } } } },
    include: {
      course: { select: { title: true, subject: true } },
      submissions: { where: { studentId: session.user.id }, take: 1, select: { id: true, response: true, submittedAt: true, grade: true, feedback: true } },
    },
  });
  if (!assignment) notFound();
  const submission = assignment.submissions[0] || null;
  const isLate = assignment.dueAt && assignment.dueAt < new Date();

  return (
    <div className="min-h-screen bg-[#f5f3ee] text-[#292622]"><Sidebar isConfigured={Boolean(process.env.GEMINI_API_KEY)} assignmentContext={{ id: assignment.id, title: assignment.title, courseTitle: assignment.course.title }} /><main className="px-5 py-7 sm:px-8 sm:py-9 lg:ml-64"><div className="mx-auto max-w-4xl">
      <WorkspacePageHeader href="/student/assignments" backLabel="Back to assignments" />
      <p className="ui-eyebrow">{assignment.course.title} · {assignment.course.subject}</p><h1 className="ui-page-title mt-2 text-3xl">{assignment.title}</h1>
      <p className="mt-3 text-sm text-stone-600">{assignment.dueAt ? `Due ${assignment.dueAt.toLocaleString()}${isLate ? " · Past due" : ""}` : "No due date"} · {assignment.maxPoints} points</p>
      <section className="mt-6 whitespace-pre-wrap rounded-2xl border border-stone-200 bg-white p-5 text-sm leading-7 sm:p-6"><h2 className="mb-2 font-semibold">Teacher’s instructions</h2>{assignment.instructions}</section>
      <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950"><strong className="block">Need a hint or help with a calculation?</strong><span className="mt-0.5 block text-amber-900/80">Ask the AI tutor to explain a method and guide you through the next step.</span><OpenDoubtSolverButton compact assignmentContext={{ id: assignment.id, title: assignment.title, courseTitle: assignment.course.title }} /></div>
      <AssignmentSubmissionForm assignmentId={assignment.id} dueAt={assignment.dueAt?.toISOString() || null} submission={submission ? { ...submission, submittedAt: submission.submittedAt.toISOString() } : null} maxPoints={assignment.maxPoints} />
    </div></main></div>
  );
}

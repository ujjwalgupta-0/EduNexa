import { notFound, redirect } from "next/navigation";
import WorkspacePageHeader from "@/app/components/WorkspacePageHeader";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import SubmissionReview from "./SubmissionReview";

export default async function TeacherAssignmentDetailPage({ params }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "TEACHER") redirect("/dashboard");
  const { assignmentId } = await params;
  const assignment = await prisma.assignment.findFirst({
    where: { id: assignmentId, teacherId: session.user.id },
    include: { course: { select: { title: true, subject: true } }, submissions: { include: { student: { select: { name: true, email: true } } }, orderBy: { submittedAt: "desc" } } },
  });
  if (!assignment) notFound();

  return (
    <main className="ui-page min-h-screen px-5 py-7 sm:px-8 sm:py-9"><div className="mx-auto max-w-5xl">
      <WorkspacePageHeader href="/teacher/assignments" backLabel="Back to assignments" />
      <p className="ui-eyebrow">{assignment.course.title} · {assignment.course.subject}</p>
      <h1 className="ui-page-title mt-2 text-3xl">{assignment.title}</h1>
      <p className="mt-3 text-sm text-subtle">{assignment.dueAt ? `Due ${assignment.dueAt.toLocaleString()}` : "No due date"} · {assignment.maxPoints} points</p>
      <section className="mt-6 whitespace-pre-wrap rounded-2xl border border-line bg-white p-5 text-sm leading-7 sm:p-6"><h2 className="mb-2 font-semibold">Instructions</h2>{assignment.instructions}</section>
      <section className="mt-8"><div className="mb-4"><h2 className="text-xl font-semibold">Student submissions</h2><p className="mt-1 text-sm text-subtle">Review responses and enter a score with optional feedback.</p></div><SubmissionReview assignmentId={assignment.id} maxPoints={assignment.maxPoints} submissions={assignment.submissions.map((submission) => ({ ...submission, submittedAt: submission.submittedAt.toISOString() }))} /></section>
    </div></main>
  );
}

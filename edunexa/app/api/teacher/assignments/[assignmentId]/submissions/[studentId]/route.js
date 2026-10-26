import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(request, { params }) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Sign in to grade this work." }, { status: 401 });
  if (session.user.role !== "TEACHER") return Response.json({ error: "Teacher access is required." }, { status: 403 });

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Enter a valid grade and try again." }, { status: 400 });
  }

  const { assignmentId, studentId } = await params;
  const assignment = await prisma.assignment.findFirst({
    where: { id: assignmentId, teacherId: session.user.id },
    select: { id: true, maxPoints: true },
  });
  if (!assignment) return Response.json({ error: "Assignment not found." }, { status: 404 });

  const grade = body.grade === "" || body.grade === null ? null : Number(body.grade);
  const feedback = typeof body.feedback === "string" ? body.feedback.trim() : "";
  if ((grade !== null && (!Number.isInteger(grade) || grade < 0 || grade > assignment.maxPoints)) || feedback.length > 2000) {
    return Response.json({ error: `Enter a whole-number grade from 0 to ${assignment.maxPoints} and feedback under 2,000 characters.` }, { status: 400 });
  }

  const submission = await prisma.assignmentSubmission.findUnique({
    where: { assignmentId_studentId: { assignmentId, studentId } },
    select: { id: true },
  });
  if (!submission) return Response.json({ error: "This student has not submitted the assignment." }, { status: 404 });

  const updated = await prisma.assignmentSubmission.update({
    where: { id: submission.id },
    data: { grade, feedback: feedback || null },
    select: { grade: true, feedback: true },
  });
  return Response.json({ submission: updated });
}

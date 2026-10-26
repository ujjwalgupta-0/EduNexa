import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request, { params }) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Sign in to submit your work." }, { status: 401 });
  if (session.user.role !== "STUDENT") return Response.json({ error: "Student access is required." }, { status: 403 });

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Enter your work and try again." }, { status: 400 });
  }
  const response = typeof body.response === "string" ? body.response.trim() : "";
  if (response.length < 1 || response.length > 20000) {
    return Response.json({ error: "Your response must be between 1 and 20,000 characters." }, { status: 400 });
  }

  const { assignmentId } = await params;
  const assignment = await prisma.assignment.findFirst({
    where: { id: assignmentId, course: { enrollments: { some: { studentId: session.user.id } } } },
    select: { id: true },
  });
  if (!assignment) return Response.json({ error: "This assignment is not available in your courses." }, { status: 404 });

  const existing = await prisma.assignmentSubmission.findUnique({
    where: { assignmentId_studentId: { assignmentId, studentId: session.user.id } },
    select: { grade: true },
  });
  if (existing?.grade !== null && existing?.grade !== undefined) {
    return Response.json({ error: "This submission has been graded and can no longer be changed." }, { status: 409 });
  }

  const submission = await prisma.assignmentSubmission.upsert({
    where: { assignmentId_studentId: { assignmentId, studentId: session.user.id } },
    create: { assignmentId, studentId: session.user.id, response },
    update: { response, submittedAt: new Date() },
    select: { id: true, response: true, submittedAt: true, grade: true, feedback: true },
  });
  return Response.json({ submission });
}

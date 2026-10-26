import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Sidebar from "@/app/components/dashboard/Sidebar";
import DoubtSolver from "./DoubtSolver";

export default async function StudentDoubtSolverPage({ searchParams }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "STUDENT") redirect("/dashboard");

  const params = await searchParams;
  let assignmentContext = null;
  if (params?.assignmentId) {
    assignmentContext = await prisma.assignment.findFirst({
      where: { id: params.assignmentId, course: { enrollments: { some: { studentId: session.user.id } } } },
      select: { id: true, title: true, course: { select: { title: true } } },
    });
    if (!assignmentContext) redirect("/student/assignments");
  }

  return (
    <div className="min-h-screen bg-[#f5f3ee] text-[#292622]">
      <Sidebar isConfigured={Boolean(process.env.GEMINI_API_KEY)} assignmentContext={assignmentContext ? { id: assignmentContext.id, title: assignmentContext.title, courseTitle: assignmentContext.course.title } : null} />
      <main className="px-5 py-7 sm:px-8 sm:py-9 lg:ml-64">
        <div className="mx-auto max-w-4xl">
          <p className="ui-eyebrow">Learning support</p>
          <h1 className="ui-page-title mt-2 text-3xl">AI doubt solver</h1>
          <p className="mt-3 text-gray-600">Ask a question from class and get a patient, step-by-step explanation.</p>
          <DoubtSolver isConfigured={Boolean(process.env.GEMINI_API_KEY)} assignmentContext={assignmentContext ? { id: assignmentContext.id, title: assignmentContext.title, courseTitle: assignmentContext.course.title } : null} />
        </div>
      </main>
    </div>
  );
}

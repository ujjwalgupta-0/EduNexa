import { redirect } from "next/navigation";
import WorkspacePageHeader from "@/app/components/WorkspacePageHeader";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import QuizEditor from "../QuizEditor";

export default async function NewTeacherQuizPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "TEACHER") redirect("/dashboard");

  const courses = await prisma.course.findMany({
    where: { teacherId: session.user.id },
    select: { id: true, title: true, subject: true },
    orderBy: { title: "asc" },
  });

  return (
    <main className="ui-page min-h-screen px-5 py-7 sm:px-8 sm:py-9">
      <div className="mx-auto max-w-4xl">
        <WorkspacePageHeader href="/teacher/quizzes" backLabel="Back to quizzes" />
        <p className="ui-eyebrow">Quiz builder</p>
        <h1 className="ui-page-title mt-2 text-3xl">Create a quiz</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-subtle">Write and check the questions, select the correct answers, then save a draft for review before publishing.</p>
        <QuizEditor courses={courses} />
      </div>
    </main>
  );
}

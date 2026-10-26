import { redirect } from "next/navigation";
import WorkspacePageHeader from "@/app/components/WorkspacePageHeader";

import CourseManager from "./CourseManager";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function TeacherCoursesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "TEACHER") redirect("/dashboard");

  const courses = await prisma.course.findMany({
    where: { teacherId: session.user.id },
    include: { _count: { select: { enrollments: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="ui-page px-5 py-7 sm:px-8 sm:py-9">
      <div className="mx-auto max-w-5xl">
        <WorkspacePageHeader href="/teacher/dashboard" backLabel="Back to dashboard" />
        <p className="ui-eyebrow">Teaching</p>
        <h1 className="ui-page-title mt-2 text-3xl">Course management</h1>
        <p className="mt-3 text-gray-600">Create courses and share their join codes with your students.</p>
        <CourseManager courses={courses} />
      </div>
    </main>
  );
}

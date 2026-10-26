import { redirect } from "next/navigation";
import WorkspacePageHeader from "@/app/components/WorkspacePageHeader";

import CourseEnrollment from "./CourseEnrollment";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function StudentCoursesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "STUDENT") redirect("/dashboard");

  const enrollments = await prisma.enrollment.findMany({
    where: { studentId: session.user.id },
    include: { course: { include: { teacher: { select: { name: true } } } } },
    orderBy: { createdAt: "desc" },
  });
  const courses = enrollments.map(({ course }) => course);

  return (
    <main className="ui-page px-5 py-7 sm:px-8 sm:py-9">
      <div className="mx-auto max-w-5xl">
        <WorkspacePageHeader href="/student/dashboard" backLabel="Back to dashboard" />
        <p className="ui-eyebrow">Learning</p>
        <h1 className="ui-page-title mt-2 text-3xl">My courses</h1>
        <p className="mt-3 text-gray-600">Join a class with a code from your teacher and find your enrolled courses here.</p>
        <CourseEnrollment courses={courses} />
      </div>
    </main>
  );
}

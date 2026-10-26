import { redirect } from "next/navigation";
import WorkspacePageHeader from "@/app/components/WorkspacePageHeader";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AssignmentForm from "../AssignmentForm";

export default async function NewAssignmentPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "TEACHER") redirect("/dashboard");
  const courses = await prisma.course.findMany({ where: { teacherId: session.user.id }, select: { id: true, title: true, subject: true }, orderBy: { title: "asc" } });

  return <main className="ui-page min-h-screen px-5 py-7 sm:px-8 sm:py-9"><div className="mx-auto max-w-4xl"><WorkspacePageHeader href="/teacher/assignments" backLabel="Back to assignments" /><p className="ui-eyebrow">Teaching</p><h1 className="ui-page-title mt-2 text-3xl">Create assignment</h1><p className="mt-3 text-gray-600">Students enrolled in the selected course will see this assignment.</p><AssignmentForm courses={courses} /></div></main>;
}

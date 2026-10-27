import { redirect } from "next/navigation";

import AdminWorkspace from "@/app/components/admin/AdminWorkspace";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  const [totalUsers, studentsCount, teachersCount, parentsCount, coursesCount, enrollmentsCount, pendingCount, accounts, teachers, parents, courses, enrollments, requests] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.user.count({ where: { role: "TEACHER" } }),
    prisma.user.count({ where: { role: "PARENT" } }),
    prisma.course.count(),
    prisma.enrollment.count(),
    prisma.user.count({ where: { requestedRole: { in: ["TEACHER", "PARENT"] }, emailVerified: { not: null } } }),
    prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, requestedRole: true, createdAt: true, updatedAt: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findMany({
      where: { role: "TEACHER" },
      select: { id: true, name: true, email: true, updatedAt: true, _count: { select: { taughtCourses: true } } },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.user.findMany({
      where: { role: "PARENT" },
      select: { id: true, name: true, email: true, updatedAt: true, _count: { select: { parentLinks: true } } },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.course.findMany({
      select: { id: true, title: true, subject: true, createdAt: true, teacher: { select: { name: true, email: true } }, _count: { select: { enrollments: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.enrollment.findMany({
      select: { studentId: true, courseId: true, createdAt: true, student: { select: { name: true, email: true } }, course: { select: { title: true, subject: true, teacher: { select: { name: true } } } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findMany({
      where: { requestedRole: { in: ["TEACHER", "PARENT"] }, emailVerified: { not: null } },
      select: { id: true, name: true, email: true, requestedRole: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const stats = [
    { id: "accounts", label: "Total accounts", value: totalUsers, description: "View account directory" },
    { id: "students", label: "Students", value: studentsCount, description: "View student list" },
    { id: "teachers", label: "Approved teachers", value: teachersCount, description: "View teacher list" },
    { id: "parents", label: "Approved parents", value: parentsCount, description: "View parent list" },
    { id: "courses", label: "Courses", value: coursesCount, description: "View course catalog" },
    { id: "enrollments", label: "Enrollments", value: enrollmentsCount, description: "View enrollment list" },
    { id: "requests", label: "Pending requests", value: pendingCount, description: "Review teacher and parent access" },
  ];

  return (
    <AdminWorkspace
      admin={{ name: session.user.name, email: session.user.email }}
      stats={stats}
      accounts={accounts.map((account) => ({ ...account, createdAt: account.createdAt.toISOString(), updatedAt: account.updatedAt.toISOString() }))}
      teachers={teachers.map((teacher) => ({ ...teacher, courseCount: teacher._count.taughtCourses, updatedAt: teacher.updatedAt.toISOString() }))}
      parents={parents.map((parent) => ({ ...parent, studentCount: parent._count.parentLinks, updatedAt: parent.updatedAt.toISOString() }))}
      courses={courses.map((course) => ({ ...course, studentCount: course._count.enrollments, createdAt: course.createdAt.toISOString() }))}
      enrollments={enrollments.map((enrollment) => ({ ...enrollment, createdAt: enrollment.createdAt.toISOString() }))}
      requests={requests.map((request) => ({ ...request, createdAt: request.createdAt.toISOString() }))}
    />
  );
}

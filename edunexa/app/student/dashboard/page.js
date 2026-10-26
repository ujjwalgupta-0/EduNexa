import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import StudentDashboard from "@/app/components/dashboard/StudentDashboard";
import { prisma } from "@/lib/prisma";

export default async function StudentDashboardPage() {
    const session = await auth()
    
    if (!session?.user) {
        redirect("/login");
    }
    
    if (session.user.role !== "STUDENT") {
        redirect("/dashboard");
    }

    const activitySince = new Date();
    activitySince.setUTCHours(0, 0, 0, 0);
    activitySince.setUTCDate(activitySince.getUTCDate() - 29);

    const [enrollments, attempts, activities, assignments] = await Promise.all([
        prisma.enrollment.findMany({
            where: { studentId: session.user.id },
            include: {
                course: {
                    include: {
                        teacher: { select: { name: true } },
                        quizzes: {
                            where: { status: "PUBLISHED" },
                            select: {
                                id: true,
                                title: true,
                                attempts: { where: { studentId: session.user.id }, select: { id: true } },
                            },
                            orderBy: { publishedAt: "desc" },
                        },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        }),
        prisma.quizAttempt.findMany({
            where: { studentId: session.user.id },
            select: { score: true, totalQuestions: true },
        }),
        prisma.learningActivity.findMany({
            where: { studentId: session.user.id, occurredAt: { gte: activitySince } },
            select: { occurredAt: true },
        }),
        prisma.assignment.findMany({
            where: { course: { enrollments: { some: { studentId: session.user.id } } } },
            include: {
                course: { select: { title: true } },
                submissions: { where: { studentId: session.user.id }, select: { grade: true } },
            },
            orderBy: { dueAt: "asc" },
        }),
    ]);

    const courses = enrollments.map(({ course }) => ({
        id: course.id,
        title: course.title,
        subject: course.subject,
        teacherName: course.teacher.name,
        availableQuizCount: course.quizzes.length,
        completedQuizCount: course.quizzes.filter((quiz) => quiz.attempts.length > 0).length,
    }));
    const pendingQuizzes = enrollments.flatMap(({ course }) => course.quizzes
        .filter((quiz) => quiz.attempts.length === 0)
        .map((quiz) => ({ id: quiz.id, title: quiz.title, courseTitle: course.title, subject: course.subject })));
    const pendingAssignments = assignments
        .filter((assignment) => assignment.submissions[0]?.grade === null || assignment.submissions[0]?.grade === undefined)
        .map((assignment) => ({
            id: assignment.id,
            title: assignment.title,
            courseTitle: assignment.course.title,
            dueAt: assignment.dueAt?.toISOString() || null,
            submitted: assignment.submissions.length > 0,
        }));
    const averageScore = attempts.length
        ? `${Math.round(attempts.reduce((sum, attempt) => sum + (attempt.score / attempt.totalQuestions) * 100, 0) / attempts.length)}%`
        : "No scores yet";
    const activeDays = new Set(activities.map(({ occurredAt }) => occurredAt.toISOString().slice(0, 10))).size;
    const activityCounts = new Map();
    for (const { occurredAt } of activities) {
        const day = occurredAt.toISOString().slice(0, 10);
        activityCounts.set(day, (activityCounts.get(day) || 0) + 1);
    }
    const activityHeatmap = Array.from({ length: 30 }, (_, index) => {
        const date = new Date(activitySince);
        date.setUTCDate(activitySince.getUTCDate() + index);
        const day = date.toISOString().slice(0, 10);
        return { day, count: activityCounts.get(day) || 0 };
    });

    return(
        <StudentDashboard
            studentName={session.user.name}
            courses={courses}
            pendingQuizzes={pendingQuizzes}
            pendingAssignments={pendingAssignments}
            aiConfigured={Boolean(process.env.GEMINI_API_KEY)}
            activityHeatmap={activityHeatmap}
            stats={{ courseCount: courses.length, averageScore, pendingQuizCount: pendingQuizzes.length, activeDays }}
        />

    )
}

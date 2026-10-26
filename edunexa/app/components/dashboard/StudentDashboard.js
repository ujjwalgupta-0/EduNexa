import Link from "next/link";
import { BookOpen, ClipboardCheck, Flame, TrendingUp } from "lucide-react";
import Sidebar from "./Sidebar";
import DashboardHeader from "./DashboardHeader";
import StatCard from "./StatCard";
import CourseCard from "./CourseCard";
import UpcomingTasks from "./UpcomingTasks";

export default function StudentDashboard({ studentName, courses, pendingQuizzes, pendingAssignments, activityHeatmap, stats, aiConfigured }) {
  const displayName = studentName?.trim().split(/\s+/)[0] || "Student";

  return (
    <div className="min-h-screen bg-[#f5f3ee] text-[#292622]">
      <Sidebar isConfigured={aiConfigured} />
      <main className="lg:ml-64">
        <DashboardHeader />
        <div className="px-6 py-8 lg:px-8">
          <div className="mb-8">
            <p className="text-sm font-semibold text-amber-800">STUDENT DASHBOARD</p>
            <h1 className="mt-1 text-3xl font-black tracking-tight">Welcome back, {displayName}</h1>
            <p className="mt-2 text-gray-500">Here&apos;s what&apos;s happening with your learning today.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard title="My Courses" value={stats.courseCount} description="Courses you are enrolled in" icon={BookOpen} />
            <StatCard title="Average Quiz Score" value={stats.averageScore} description="Across your submitted quizzes" icon={TrendingUp} />
            <StatCard title="Quizzes to Take" value={stats.pendingQuizCount} description="Published quizzes awaiting your attempt" icon={ClipboardCheck} />
            <StatCard title="Active Days" value={stats.activeDays} description="Days with learning activity in the last 30 days" icon={Flame} />
          </div>

          <section className="mt-10">
            <div className="flex items-center justify-between gap-4">
              <div><h2 className="text-xl font-bold">Continue Learning</h2><p className="mt-1 text-sm text-gray-500">Your enrolled courses and quiz progress.</p></div>
              <Link href="/student/courses" className="text-sm font-semibold text-amber-800 hover:text-amber-900">View all</Link>
            </div>
            {courses.length ? (
              <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {courses.slice(0, 6).map((course) => <CourseCard key={course.id} course={course} />)}
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-10 text-center">
                <BookOpen className="mx-auto text-stone-400" size={24} />
                <h3 className="mt-3 font-semibold">No courses yet</h3>
                <p className="mt-1 text-sm text-stone-500">Join a course to see lessons and quizzes here.</p>
                <Link href="/student/courses" className="mt-4 inline-flex rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-stone-950 hover:bg-amber-400">Browse courses</Link>
              </div>
            )}
          </section>

          <section className="mt-8 rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-bold">Assignments</h2><p className="mt-1 text-sm text-stone-500">Work assigned by your teachers.</p></div><Link href="/student/assignments" className="text-sm font-semibold text-amber-800 hover:text-amber-900">All assignments</Link></div>
            {pendingAssignments.length ? <div className="mt-4 divide-y divide-stone-100">{pendingAssignments.slice(0, 4).map((assignment) => <Link key={assignment.id} href={`/student/assignments/${assignment.id}`} className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0 last:pb-0"><span><span className="block text-sm font-medium">{assignment.title}</span><span className="mt-0.5 block text-xs text-stone-500">{assignment.courseTitle}</span></span><span className={`text-xs font-semibold ${assignment.submitted ? "text-emerald-700" : "text-amber-900"}`}>{assignment.submitted ? "Submitted" : assignment.dueAt ? `Due ${new Date(assignment.dueAt).toLocaleDateString()}` : "Not submitted"}</span></Link>)}</div> : <p className="mt-4 rounded-xl bg-stone-50 px-4 py-5 text-sm text-stone-500">No current assignments. New work from your teachers will appear here.</p>}
          </section>

          <section className="mt-8 rounded-2xl border border-stone-200 bg-white p-6" aria-labelledby="activity-title">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div><h2 id="activity-title" className="font-bold">Learning activity</h2><p className="mt-1 text-sm text-stone-500">Quiz submissions over the last 30 days</p></div>
              <p className="text-sm text-stone-600"><span className="font-semibold text-stone-900">{stats.activeDays}</span> active {stats.activeDays === 1 ? "day" : "days"}</p>
            </div>
            <div className="mt-5 grid grid-cols-10 gap-2 sm:grid-cols-[repeat(15,minmax(0,1fr))] lg:grid-cols-[repeat(30,minmax(0,1fr))]">
              {activityHeatmap.map(({ day, count }) => {
                const level = count === 0 ? 0 : count === 1 ? 1 : count <= 3 ? 2 : count <= 5 ? 3 : 4;
                const colors = ["bg-stone-100", "bg-amber-200", "bg-amber-300", "bg-amber-500", "bg-amber-700"];
                return <span key={day} title={`${day}: ${count} ${count === 1 ? "submission" : "submissions"}`} aria-label={`${day}: ${count} ${count === 1 ? "submission" : "submissions"}`} className={`aspect-square rounded-sm ${colors[level]}`} />;
              })}
            </div>
            <div className="mt-3 flex items-center justify-end gap-2 text-xs text-stone-500"><span>Less</span><span className="h-3 w-3 rounded-sm bg-stone-100" /><span className="h-3 w-3 rounded-sm bg-amber-200" /><span className="h-3 w-3 rounded-sm bg-amber-300" /><span className="h-3 w-3 rounded-sm bg-amber-500" /><span className="h-3 w-3 rounded-sm bg-amber-700" /><span>More</span></div>
          </section>

          <div className="mt-10">
            <UpcomingTasks quizzes={pendingQuizzes} />
          </div>
        </div>
      </main>
    </div>
  );
}

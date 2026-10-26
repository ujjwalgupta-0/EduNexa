import Link from "next/link";
import { ArrowRight, BookOpen, ClipboardCheck } from "lucide-react";

export default function CourseCard({ course }) {
  const completion = course.availableQuizCount
    ? Math.round((course.completedQuizCount / course.availableQuizCount) * 100)
    : 0;

  return (
    <article className="rounded-2xl border border-stone-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <span className="rounded-xl bg-amber-50 p-2.5 text-amber-900"><BookOpen size={19} /></span>
        <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600">{course.subject}</span>
      </div>
      <h3 className="mt-4 line-clamp-1 font-semibold">{course.title}</h3>
      <p className="mt-1 text-sm text-stone-500">Teacher: {course.teacherName || "Not listed"}</p>
      <div className="mt-5 flex items-center justify-between text-xs text-stone-500">
        <span className="inline-flex items-center gap-1.5"><ClipboardCheck size={14} />{course.completedQuizCount} of {course.availableQuizCount} quizzes complete</span>
        <span className="font-semibold tabular-nums text-stone-700">{completion}%</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-stone-100" aria-label={`${completion}% of available quizzes completed`}>
        <div className="h-full rounded-full bg-amber-500" style={{ width: `${completion}%` }} />
      </div>
      <Link href="/student/quizzes" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-amber-900 hover:text-amber-700">View quizzes <ArrowRight size={15} /></Link>
    </article>
  );
}

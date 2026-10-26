import Link from "next/link";
import { ArrowRight, ClipboardCheck } from "lucide-react";

export default function UpcomingTasks({ quizzes }) {
  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-6">
      <div className="flex items-center justify-between gap-4">
        <div><h2 className="font-bold">Quizzes to take</h2><p className="mt-1 text-xs text-stone-500">Published quizzes for your enrolled courses.</p></div>
        <Link href="/student/quizzes" className="text-xs font-bold text-amber-800 hover:text-amber-900">All quizzes</Link>
      </div>
      {quizzes.length ? (
        <div className="mt-5 divide-y divide-stone-100">
          {quizzes.slice(0, 6).map((quiz) => (
            <Link key={quiz.id} href={`/student/quizzes/${quiz.id}`} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-900"><ClipboardCheck size={18} /></span>
              <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-stone-800">{quiz.title}</span><span className="mt-1 block truncate text-xs text-stone-500">{quiz.courseTitle} · {quiz.subject}</span></span>
              <ArrowRight size={16} className="shrink-0 text-stone-400" />
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-xl bg-stone-50 px-5 py-8 text-center">
          <p className="text-sm font-medium">You&apos;re all caught up</p>
          <p className="mt-1 text-xs text-stone-500">New published quizzes will appear here.</p>
        </div>
      )}
    </section>
  );
}

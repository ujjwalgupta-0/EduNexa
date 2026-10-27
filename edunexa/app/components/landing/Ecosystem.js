import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  BookOpen,
  BrainCircuit,
  ClipboardCheck,
  Lightbulb,
  UsersRound,
} from "lucide-react";

const stages = [
  { number: "01", label: "Learn", detail: "Start with a shared course space.", icon: BookOpen, live: true },
  { number: "02", label: "Assess", detail: "Take teacher-published quizzes.", icon: ClipboardCheck, live: true },
  { number: "03", label: "Analyze", detail: "Turn answers into visible progress.", icon: Activity, live: true },
  { number: "04", label: "Recommend", detail: "Find a useful next step from learning gaps.", icon: Lightbulb, live: false },
  { number: "05", label: "Monitor", detail: "Keep students, teachers, and families in sync.", icon: UsersRound, live: true },
  { number: "06", label: "Improve", detail: "Build understanding with guided AI support.", icon: BrainCircuit, live: false },
];

export default function Ecosystem() {
  return (
    <section id="how-it-works" className="scroll-mt-20 bg-[#f1eee7] py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-end lg:gap-16">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">The EduNexa learning loop</p>
            <h2 className="mt-4 text-4xl font-semibold leading-[1.08] tracking-[-0.05em] sm:text-5xl">Progress should lead to a next step.</h2>
            <p className="mt-5 text-base leading-7 text-neutral-600">EduNexa brings the parts of learning into one connected cycle. Each result can help a student, teacher, or family decide what to do next.</p>
            <div className="mt-7 inline-flex items-center gap-2 text-sm font-medium text-neutral-600"><span className="h-2 w-2 rounded-full bg-amber-600" />Built around real learning activity</div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {stages.map(({ number, label, detail, icon: Icon }, index) => (
              <article key={number} className="relative rounded-2xl border border-stone-200 bg-white p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold tabular-nums text-stone-400">{number}</span>
                  <Icon size={19} strokeWidth={1.7} className="text-amber-800" aria-hidden="true" />
                </div>
                <h3 className="mt-5 text-lg font-semibold tracking-tight">{label}</h3>
                <p className="mt-1.5 min-h-10 text-sm leading-5 text-stone-600">{detail}</p>
                {index < stages.length - 1 && <ArrowRight className="absolute -right-[13px] top-1/2 z-10 hidden -translate-y-1/2 text-stone-400 xl:block" size={20} aria-hidden="true" />}
                {index === 2 && <ArrowDownRight className="absolute -bottom-[17px] right-1/2 z-10 hidden translate-x-1/2 text-stone-400 sm:block xl:hidden" size={20} aria-hidden="true" />}
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

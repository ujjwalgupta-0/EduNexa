import {
  Activity,
  BrainCircuit,
  CheckCheck,
  Compass,
  GraduationCap,
  LockKeyhole,
  Sparkles,
  UsersRound,
} from "lucide-react";

const innovations = [
  {
    icon: Activity,
    number: "01",
    title: "A heatmap with real meaning",
    description: "A 30-day view of quiz submissions makes learning activity visible over time, without dressing sample data up as progress.",
  },
  {
    icon: CheckCheck,
    number: "02",
    title: "Assessment that closes the loop",
    description: "Teachers publish quizzes, students answer them, and results with explanations are saved for review and follow-up.",
  },
  {
    icon: UsersRound,
    number: "03",
    title: "One journey, three perspectives",
    description: "Students see their work, teachers see submissions from their classes, and parents see recent results for linked children.",
  },
  {
    icon: Sparkles,
    number: "04",
    title: "AI drafts. Teachers decide.",
    description: "Generate practice-question drafts from course topics, then let teachers review and edit every question before students see it.",
  },
  {
    icon: BrainCircuit,
    number: "05",
    title: "A patient AI learning companion",
    description: "A guided space where students can ask questions and work through difficult ideas at their own pace.",
  },
  {
    icon: Compass,
    number: "06",
    title: "Next steps grounded in evidence",
    description: "Use quiz topics and answer patterns to surface learning gaps and suggest focused practice—not one-size-fits-all advice.",
  },
  {
    icon: LockKeyhole,
    number: "07",
    title: "The right insight for the right person",
    description: "Role-based access keeps student, teacher, and parent workspaces distinct, including parent views limited to linked students.",
  },
  {
    icon: GraduationCap,
    number: "08",
    title: "A learning loop, not another feed",
    description: "Connect learning, assessment, analysis, recommendations, and follow-up so progress can lead to meaningful action.",
  },
];

export default function Features() {
  return (
    <section id="features" className="scroll-mt-20 bg-[#fbfaf7] py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-8 border-b border-stone-200 pb-9 md:grid-cols-[1fr_auto] md:items-end">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">What makes EduNexa different</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">A clearer picture. A better next move.</h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-neutral-600">The idea is simple: use real learning evidence to help the people around a student move forward together.</p>
          </div>
        </div>

        <div className="mt-3 grid gap-x-8 md:grid-cols-2 lg:grid-cols-4">
          {innovations.map(({ icon: Icon, number, title, description }) => (
            <article key={number} className="border-b border-stone-200 py-6 lg:min-h-[240px]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold tabular-nums text-stone-400">{number}</span>
                <Icon size={19} strokeWidth={1.7} className="text-amber-800" aria-hidden="true" />
              </div>
              <h3 className="mt-5 text-base font-semibold tracking-tight">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-stone-600">{description}</p>
            </article>
          ))}
        </div>
        <div className="mt-8 flex flex-col gap-2 border-l-2 border-amber-500 pl-4 sm:flex-row sm:items-center sm:gap-4">
          <p className="text-sm font-semibold text-stone-800">Consistency and performance, kept in context.</p>
          <p className="text-sm leading-6 text-stone-600">The activity heatmap tracks when learning happens; quiz results show how understanding is developing.</p>
        </div>
      </div>
    </section>
  );
}

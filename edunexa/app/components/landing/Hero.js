import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  MoveDown,
  UsersRound,
} from "lucide-react";

const perspectives = [
  {
    label: "FOR STUDENTS",
    title: "Keep moving forward",
    icon: BookOpen,
    position: "left-[5%] top-[15%]",
  },
  {
    label: "FOR TEACHERS",
    title: "Make progress visible",
    icon: GraduationCap,
    position: "right-[4%] top-[39%]",
  },
  {
    label: "FOR FAMILIES",
    title: "Stay part of the journey",
    icon: UsersRound,
    position: "bottom-[9%] left-[16%]",
  },
];

function LearningIllustration() {
  return (
    <div
      className="relative mx-auto aspect-[1.08] w-full max-w-[600px]"
      role="img"
      aria-label="Students, teachers, and families connected through one learning community"
    >
      <div className="absolute inset-[4%] overflow-hidden rounded-[2rem] bg-[#e5a332] shadow-[0_28px_80px_-38px_rgba(83,58,17,0.42)] sm:rounded-[2.5rem]">
        <div className="absolute -right-[15%] -top-[24%] h-[68%] w-[68%] rounded-full border border-stone-950/10" />
        <div className="absolute -right-[6%] -top-[13%] h-[48%] w-[48%] rounded-full border border-stone-950/10" />
        <div className="absolute -bottom-[38%] -left-[10%] h-[75%] w-[75%] rounded-full bg-white/10" />
        <div className="absolute bottom-7 right-8 text-right text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-950/50 sm:bottom-9 sm:right-10 sm:text-xs">
          Learn · Guide · Grow
        </div>
      </div>

      <svg
        className="absolute inset-[4%] h-[92%] w-[92%]"
        viewBox="0 0 600 550"
        fill="none"
        aria-hidden="true"
      >
        <path d="M145 145C190 145 208 206 270 233" stroke="#292622" strokeOpacity=".3" strokeWidth="1.5" strokeDasharray="4 7" />
        <path d="M424 258C381 258 374 272 333 278" stroke="#292622" strokeOpacity=".3" strokeWidth="1.5" strokeDasharray="4 7" />
        <path d="M211 413C241 384 252 350 279 323" stroke="#292622" strokeOpacity=".3" strokeWidth="1.5" strokeDasharray="4 7" />
        <circle cx="145" cy="145" r="4" fill="#292622" />
        <circle cx="424" cy="258" r="4" fill="#292622" />
        <circle cx="211" cy="413" r="4" fill="#292622" />
      </svg>

      <div className="absolute left-1/2 top-1/2 z-10 flex h-32 w-32 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border-[7px] border-[#f5f3ee] bg-stone-950 text-center text-white shadow-xl sm:h-40 sm:w-40 sm:border-[9px]">
        <BookOpen size={26} strokeWidth={1.6} className="text-amber-400 sm:h-8 sm:w-8" />
        <span className="mt-2 text-sm font-semibold tracking-tight sm:text-base">One community</span>
        <span className="mt-0.5 text-[9px] text-white/60 sm:text-[10px]">many ways to grow</span>
      </div>

      {perspectives.map(({ label, title, icon: Icon, position }) => (
        <div
          key={label}
          className={`absolute z-20 w-[58%] max-w-[245px] rounded-2xl border border-stone-200/80 bg-[#fffefa] p-3.5 shadow-[0_16px_40px_-24px_rgba(41,38,34,0.48)] sm:w-[52%] sm:rounded-[1.25rem] sm:p-4 ${position}`}
        >
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fbf0d9] text-amber-900 sm:h-11 sm:w-11">
              <Icon size={20} strokeWidth={1.7} />
            </span>
            <span className="min-w-0">
              <span className="block text-[8px] font-bold tracking-[0.15em] text-stone-400 sm:text-[9px]">{label}</span>
              <span className="mt-1 block text-xs font-semibold leading-4 tracking-tight text-stone-900 sm:text-sm">{title}</span>
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#f5f3ee] pt-[72px] text-[#292622]">
      <div className="pointer-events-none absolute -right-32 top-12 h-96 w-96 rounded-full bg-amber-200/25 blur-3xl" />

      <div className="relative mx-auto grid min-h-[calc(100svh-72px)] max-w-7xl items-center gap-12 px-5 py-14 sm:px-8 sm:py-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-10 lg:py-20">
        <div className="relative z-10 max-w-xl">
          <div className="mb-6 inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.19em] text-stone-600 sm:text-xs">
            <span className="h-px w-9 bg-amber-700" />
            Learning, connected from the first step
          </div>

          <h1 className="text-[3.4rem] font-semibold leading-[0.98] tracking-[-0.065em] sm:text-7xl xl:text-[5.25rem]">
            Learning should
            <br />
            lead somewhere.
          </h1>

          <p className="mt-7 max-w-lg text-base leading-7 text-stone-600 sm:text-lg sm:leading-8">
            EduNexa connects learning activity, quiz results, teachers, and families in one shared picture of progress.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-x-5 gap-y-3">
            <Link
              href="#role-selector"
              className="group inline-flex items-center gap-3 rounded-full bg-stone-950 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-stone-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900"
            >
              Get started
              <ArrowRight size={17} className="transition group-hover:translate-x-1" />
            </Link>

            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 rounded-full px-3 py-3 text-sm font-semibold text-stone-700 transition hover:text-amber-800"
            >
              See how it works <MoveDown size={15} />
            </a>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-stone-300/80 pt-5 text-xs font-medium text-stone-500 sm:text-sm">
            <span>Made for the whole learning community</span>
            <span className="hidden h-1 w-1 rounded-full bg-amber-600 sm:block" />
            <span>Students</span>
            <span className="text-stone-300">/</span>
            <span>Teachers</span>
            <span className="text-stone-300">/</span>
            <span>Families</span>
          </div>
        </div>

        <LearningIllustration />
      </div>
    </section>
  );
}

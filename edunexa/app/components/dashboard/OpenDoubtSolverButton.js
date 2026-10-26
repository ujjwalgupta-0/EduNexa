"use client";

import { MessageCircleQuestion, Sparkles } from "lucide-react";

export default function OpenDoubtSolverButton({ assignmentContext = null, compact = false }) {
  function openTutor() {
    window.dispatchEvent(new CustomEvent("edunexa:open-ai-tutor", { detail: { assignmentContext } }));
  }

  if (compact) return <button type="button" onClick={openTutor} className="mt-5 inline-flex items-center gap-2 rounded-full bg-amber-500 px-5 py-3 text-sm font-semibold text-stone-950 transition hover:bg-amber-400"><Sparkles size={16} />Ask AI for a hint</button>;

  return <button type="button" onClick={openTutor} className="mt-7 flex w-full flex-col gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-left transition hover:border-amber-400 sm:flex-row sm:items-center sm:justify-between">
    <span className="flex items-start gap-4"><span className="rounded-xl bg-white p-3 text-amber-800"><MessageCircleQuestion size={22} /></span><span><span className="block font-bold">Need help with a question?</span><span className="mt-1 block text-sm text-stone-600">Ask the AI doubt solver for a clear, step-by-step explanation.</span></span></span>
    <span className="text-sm font-semibold text-amber-900">Ask a question →</span>
  </button>;
}

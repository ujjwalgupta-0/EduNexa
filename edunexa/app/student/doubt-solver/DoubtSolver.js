"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Bot, MessageCircleQuestion, RotateCcw, Send, Sparkles, X } from "lucide-react";

const welcomeMessage = {
  role: "assistant",
  content: "Hi! Tell me what you’re stuck on. I’ll explain it step by step and help you understand the idea.",
};

const suggestions = [
  "Explain a difficult topic in simple words",
  "Help me solve a problem step by step",
  "Give me an example to understand this concept",
];

export default function DoubtSolver({ isConfigured, assignmentContext = null, mode = "page", onClose, isOpen = true }) {
  const isDrawer = mode === "drawer";
  const [messages, setMessages] = useState([welcomeMessage]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (isDrawer && isOpen) inputRef.current?.focus();
  }, [isDrawer, isOpen]);

  async function askQuestion(question = draft) {
    const content = question.trim();
    if (!content || loading || !isConfigured) return;

    const nextMessages = [...messages, { role: "user", content }];
    setMessages(nextMessages);
    setDraft("");
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/student/doubt-solver", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages.slice(-10), assignmentId: assignmentContext?.id || null }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "I couldn’t answer that just now. Please try again.");
      setMessages((current) => [...current, { role: "assistant", content: result.answer }]);
    } catch (requestError) {
      setError(requestError.message || "I couldn’t reach the AI tutor. Please try again.");
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function resetConversation() {
    setMessages([welcomeMessage]);
    setError("");
    setDraft("");
  }

  return (
    <section className={isDrawer ? "flex h-full min-h-0 flex-col bg-white" : "mt-7 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm"}>
      <div className="flex min-h-[68px] flex-wrap items-center justify-between gap-3 border-b border-stone-200 px-5 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="rounded-xl bg-amber-100 p-2.5 text-amber-900"><Sparkles size={20} /></span>
          <div><h2 className="font-bold">{isDrawer ? "Your AI study coach" : "Your learning companion"}</h2><p className="text-xs text-stone-500">Ask follow-up questions anytime</p></div>
        </div>
        <div className="flex items-center gap-1">
          <button type="button" onClick={resetConversation} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100" aria-label="Start a new conversation"><RotateCcw size={15} /> <span className="hidden sm:inline">New chat</span></button>
          {isDrawer && <button type="button" onClick={onClose} className="rounded-full p-2 text-stone-500 transition hover:bg-stone-100 hover:text-stone-900" aria-label="Close AI tutor"><X size={18} /></button>}
        </div>
      </div>

      {!isConfigured && (
        <div role="status" className="border-b border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-950 sm:px-6">
          The AI solver needs a Gemini API key before it can answer. Add <code className="rounded bg-white px-1.5 py-0.5">GEMINI_API_KEY</code> to your local <code className="rounded bg-white px-1.5 py-0.5">.env</code> file, then restart the server.
        </div>
      )}

      {assignmentContext && <div className="border-b border-amber-100 bg-amber-50/70 px-5 py-3 text-sm text-amber-950 sm:px-6"><span className="font-semibold">Assignment help:</span> {assignmentContext.title} <span className="text-amber-900/70">· {assignmentContext.courseTitle}</span></div>}

      <div className={`flex min-h-0 flex-col gap-4 overflow-y-auto bg-stone-50/70 p-5 sm:p-6 ${isDrawer ? "flex-1" : "h-[min(58vh,520px)]"}`} aria-live="polite" aria-label="Conversation">
        {messages.map((message, index) => (
          <div key={`${message.role}-${index}`} className={`flex items-start gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}>
            <span className={`mt-0.5 shrink-0 rounded-full p-2 ${message.role === "user" ? "bg-stone-800 text-white" : "bg-amber-100 text-amber-900"}`}>
              {message.role === "user" ? <MessageCircleQuestion size={16} /> : <Bot size={16} />}
            </span>
            <p className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-6 ${message.role === "user" ? "rounded-tr-sm bg-stone-800 text-white" : "rounded-tl-sm border border-stone-200 bg-white text-stone-800"}`}>
              {message.content}
            </p>
          </div>
        ))}
        {loading && <div className="flex items-center gap-3 text-sm text-stone-500"><span className="rounded-full bg-amber-100 p-2 text-amber-900"><Bot size={16} /></span><span>Working through that with you…</span></div>}
        <div ref={endRef} />
      </div>

      {messages.length === 1 && (
        <div className="flex flex-wrap gap-2 border-t border-stone-100 px-5 py-4 sm:px-6">
          {suggestions.map((suggestion) => (
            <button key={suggestion} type="button" onClick={() => { setDraft(suggestion); inputRef.current?.focus(); }} disabled={!isConfigured || loading} className="rounded-full border border-stone-200 bg-white px-3 py-2 text-left text-xs text-stone-600 transition hover:border-amber-400 hover:text-amber-900 disabled:cursor-not-allowed disabled:opacity-50">{suggestion}</button>
          ))}
        </div>
      )}

      <form onSubmit={(event) => { event.preventDefault(); askQuestion(); }} className="border-t border-stone-200 p-4 sm:p-5">
        {error && <p role="alert" className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <label className="sr-only" htmlFor="doubt-question">Your question</label>
        <div className="flex items-end gap-3">
          <textarea ref={inputRef} id="doubt-question" value={draft} onChange={(event) => setDraft(event.target.value.slice(0, 2000))} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); askQuestion(); } }} placeholder="Type your question…" rows={2} maxLength={2000} disabled={!isConfigured || loading} className="min-h-12 flex-1 resize-y rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-stone-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-100 disabled:bg-stone-100" />
          <button type="submit" disabled={!draft.trim() || !isConfigured || loading} className="inline-flex h-12 shrink-0 items-center gap-2 rounded-xl bg-stone-900 px-4 text-sm font-semibold text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-40"><Send size={16} /><span className="hidden sm:inline">Ask</span></button>
        </div>
        <p className="mt-2 text-xs text-stone-400">AI can make mistakes. Use it to support your learning and check important details with your teacher.</p>
      </form>
      {!isDrawer && <div className="border-t border-stone-100 px-5 py-3 sm:px-6"><Link href="/student/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-stone-900"><ArrowLeft size={15} /> Back to dashboard</Link></div>}
    </section>
  );
}

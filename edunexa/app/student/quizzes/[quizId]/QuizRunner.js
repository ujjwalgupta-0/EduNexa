"use client";

import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function QuizRunner({ quizId, questions, initialResult = null }) {
  const router = useRouter();
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(initialResult);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError("");
    if (Object.keys(answers).length !== questions.length) {
      setError("Choose an answer for every question before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/student/quizzes/${quizId}/attempts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: questions.map((question) => ({ questionId: question.id, selectedOptionIndex: answers[question.id] })) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not submit the quiz.");
      setResult(data);
      router.refresh();
    } catch (cause) {
      setError(cause.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    const percent = Math.round((result.attempt.score / result.attempt.totalQuestions) * 100);
    return (
      <section className="mt-6 space-y-5">
        <div className="rounded-2xl border border-line bg-white p-6 sm:p-8">
          <p className="ui-eyebrow">Your result</p>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
            <div><h2 className="text-3xl font-semibold tracking-tight">{result.attempt.score}<span className="text-stone-400">/{result.attempt.totalQuestions}</span></h2><p className="mt-1 text-sm text-subtle">{percent}% correct · submitted {new Date(result.attempt.submittedAt).toLocaleString()}</p></div>
            <Link href="/student/quizzes" className="rounded-full bg-stone-950 px-4 py-2.5 text-sm font-semibold text-white">Back to quizzes</Link>
          </div>
        </div>

        {result.review.map((question, index) => (
          <article key={question.id} className="rounded-2xl border border-line bg-white p-5 sm:p-6">
            <div className="flex items-start gap-3">
              {question.isCorrect ? <CheckCircle2 size={19} className="mt-0.5 shrink-0 text-emerald-700" /> : <XCircle size={19} className="mt-0.5 shrink-0 text-red-600" />}
              <div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-wide text-stone-400">Question {index + 1}{question.topic ? ` · ${question.topic}` : ""}</p><h3 className="mt-1 font-semibold leading-6">{question.prompt}</h3></div>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {question.options.map((option, optionIndex) => {
                const correct = optionIndex === question.correctOptionIndex;
                const selected = optionIndex === question.selectedOptionIndex;
                return <div key={optionIndex} className={`rounded-xl border px-4 py-3 text-sm ${correct ? "border-emerald-300 bg-emerald-50 text-emerald-900" : selected ? "border-red-200 bg-red-50 text-red-800" : "border-stone-200 text-stone-600"}`}><span className="mr-2 font-semibold">{String.fromCharCode(65 + optionIndex)}.</span>{option}{selected && <span className="ml-2 text-xs font-semibold">Your answer</span>}{correct && <span className="ml-2 text-xs font-semibold">Correct</span>}</div>;
              })}
            </div>
            {question.explanation && <p className="mt-4 rounded-xl bg-stone-50 px-4 py-3 text-sm leading-6 text-stone-700"><span className="font-semibold">Why: </span>{question.explanation}</p>}
          </article>
        ))}
      </section>
    );
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-5">
      {questions.map((question, index) => (
        <fieldset key={question.id} className="rounded-2xl border border-line bg-white p-5 sm:p-6">
          <legend className="sr-only">Question {index + 1}</legend>
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">Question {index + 1}{question.topic ? ` · ${question.topic}` : ""}</p>
          <h2 className="mt-2 font-semibold leading-6">{question.prompt}</h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {question.options.map((option, optionIndex) => (
              <label key={optionIndex} className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition ${answers[question.id] === optionIndex ? "border-amber-500 bg-amber-50" : "border-stone-200 hover:bg-stone-50"}`}>
                <input type="radio" name={question.id} value={optionIndex} checked={answers[question.id] === optionIndex} onChange={() => setAnswers((current) => ({ ...current, [question.id]: optionIndex }))} className="accent-amber-700" />
                <span><span className="mr-2 font-semibold text-stone-400">{String.fromCharCode(65 + optionIndex)}.</span>{option}</span>
              </label>
            ))}
          </div>
        </fieldset>
      ))}
      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      <button type="submit" disabled={submitting} className="rounded-full bg-stone-950 px-6 py-3 text-sm font-semibold text-white hover:bg-stone-800 disabled:opacity-60">{submitting ? "Submitting..." : "Submit answers"}</button>
      <p className="text-xs text-stone-500">You can submit this quiz once. Your score and answer explanations will appear after submission.</p>
    </form>
  );
}

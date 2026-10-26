"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AssignmentSubmissionForm({ assignmentId, dueAt, submission, maxPoints }) {
  const router = useRouter();
  const [answer, setAnswer] = useState(submission?.response || "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const locked = submission?.grade !== null && submission?.grade !== undefined;
  const isLate = dueAt && new Date(dueAt) < new Date();

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/student/assignments/${assignmentId}/submission`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ response: answer }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not submit your work.");
      router.refresh();
    } catch (cause) {
      setError(cause.message || "Could not submit your work.");
    } finally {
      setBusy(false);
    }
  }

  return <section className="mt-7 rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
    <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-semibold">Your work</h2>{submission && <span className={`rounded-full px-3 py-1 text-xs font-semibold ${locked ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-900"}`}>{locked ? `Graded · ${submission.grade}/${maxPoints}` : "Submitted · awaiting grade"}</span>}</div>
    {submission && <p className="mt-1 text-xs text-stone-500">Last submitted {new Date(submission.submittedAt).toLocaleString()}{isLate ? " · Submitted after the due date" : ""}</p>}
    <form onSubmit={submit} className="mt-4 space-y-4">
      <label htmlFor="assignment-response" className="block text-sm font-medium">Your response<textarea id="assignment-response" value={answer} onChange={(event) => setAnswer(event.target.value.slice(0, 20000))} rows={9} maxLength={20000} disabled={locked} required className="ui-field mt-2 w-full resize-y border px-4 py-3 font-normal disabled:bg-stone-50" placeholder="Write your answer or paste your completed work here…" /></label>
      {submission?.feedback && <div className="rounded-xl bg-stone-50 p-4"><h3 className="text-sm font-semibold">Teacher feedback</h3><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-stone-700">{submission.feedback}</p></div>}
      {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {!locked && <div><button disabled={busy || !answer.trim()} className="rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white hover:bg-stone-800 disabled:opacity-50">{busy ? "Submitting…" : submission ? "Update submission" : "Submit assignment"}</button>{isLate && <p className="mt-2 text-xs text-red-700">This work is past the due date. You can still submit it.</p>}</div>}
    </form>
  </section>;
}

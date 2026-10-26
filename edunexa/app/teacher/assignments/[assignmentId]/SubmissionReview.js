"use client";

import { useState } from "react";

export default function SubmissionReview({ assignmentId, maxPoints, submissions }) {
  const [items, setItems] = useState(submissions);
  const [errors, setErrors] = useState({});
  const [busyId, setBusyId] = useState("");

  async function save(studentId, formData) {
    setBusyId(studentId);
    setErrors((current) => ({ ...current, [studentId]: "" }));
    try {
      const response = await fetch(`/api/teacher/assignments/${assignmentId}/submissions/${studentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ grade: formData.get("grade"), feedback: formData.get("feedback") }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not save this grade.");
      setItems((current) => current.map((item) => item.studentId === studentId ? { ...item, ...result.submission } : item));
    } catch (cause) {
      setErrors((current) => ({ ...current, [studentId]: cause.message }));
    } finally {
      setBusyId("");
    }
  }

  if (!items.length) return <div className="rounded-2xl border border-dashed border-line bg-white p-8 text-center text-sm text-subtle">No students have submitted this assignment yet.</div>;

  return <div className="space-y-4">{items.map((submission) => (
    <article key={submission.id} className="rounded-2xl border border-line bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-semibold">{submission.student.name || "Student"}</h3><p className="mt-1 text-xs text-stone-500">{submission.student.email} · Submitted {new Date(submission.submittedAt).toLocaleString()}</p></div>{submission.grade !== null && <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800">Graded: {submission.grade}/{maxPoints}</span>}</div>
      <div className="mt-4 whitespace-pre-wrap rounded-xl bg-stone-50 p-4 text-sm leading-6">{submission.response}</div>
      <form onSubmit={(event) => { event.preventDefault(); save(submission.studentId, new FormData(event.currentTarget)); }} className="mt-4 grid gap-4 sm:grid-cols-[140px_1fr_auto] sm:items-end">
        <label className="text-sm font-medium">Score / {maxPoints}<input name="grade" type="number" min="0" max={maxPoints} defaultValue={submission.grade ?? ""} className="ui-field mt-2 w-full border px-3 py-2.5" placeholder="—" /></label>
        <label className="text-sm font-medium">Feedback<textarea name="feedback" maxLength={2000} rows={2} defaultValue={submission.feedback || ""} className="ui-field mt-2 w-full resize-y border px-3 py-2.5 font-normal" placeholder="Optional feedback for the student" /></label>
        <button disabled={busyId === submission.studentId} className="rounded-full bg-stone-950 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{busyId === submission.studentId ? "Saving…" : "Save grade"}</button>
        {errors[submission.studentId] && <p role="alert" className="text-sm text-red-700 sm:col-span-3">{errors[submission.studentId]}</p>}
      </form>
    </article>
  ))}</div>;
}

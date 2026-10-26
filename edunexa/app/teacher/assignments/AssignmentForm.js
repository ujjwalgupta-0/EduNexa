"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import AiMaterialGenerator from "../AiMaterialGenerator";

export default function AssignmentForm({ courses }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");

  async function submit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);
    const form = new FormData(event.currentTarget);
    const localDueAt = form.get("dueAt");
    try {
      const response = await fetch("/api/teacher/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: form.get("courseId"),
          title,
          instructions,
          maxPoints: form.get("maxPoints"),
          dueAt: localDueAt ? new Date(localDueAt).toISOString() : null,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not create this assignment.");
      router.push(`/teacher/assignments/${result.assignment.id}`);
      router.refresh();
    } catch (cause) {
      setError(cause.message || "Could not create this assignment.");
    } finally {
      setBusy(false);
    }
  }

  if (courses.length === 0) return <div className="mt-6 rounded-2xl border border-dashed border-line bg-white p-8 text-center"><h2 className="font-semibold">Create a course first</h2><p className="mt-2 text-sm text-subtle">Assignments are shared with students through one of your courses.</p><a href="/teacher/courses" className="mt-5 inline-flex rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white">Manage courses</a></div>;

  return (
    <div className="mt-6 space-y-5">
      <AiMaterialGenerator kind="assignment" onGenerated={(generated) => {
        setTitle(generated.title);
        setInstructions(generated.instructions);
        setError("");
      }} />
      <form onSubmit={submit} className="space-y-5 rounded-2xl border border-line bg-white p-6 sm:p-7">
        <label className="block text-sm font-semibold">Course<select name="courseId" required className="ui-field mt-2 w-full border px-4 py-3 font-normal">{courses.map((course) => <option key={course.id} value={course.id}>{course.title} · {course.subject}</option>)}</select></label>
        <label className="block text-sm font-semibold">Assignment title<input name="title" value={title} onChange={(event) => setTitle(event.target.value)} required maxLength={160} className="ui-field mt-2 w-full border px-4 py-3 font-normal" placeholder="e.g. Fractions practice" /></label>
        <label className="block text-sm font-semibold">Instructions<textarea name="instructions" value={instructions} onChange={(event) => setInstructions(event.target.value)} required minLength={10} maxLength={10000} rows={7} className="ui-field mt-2 w-full resize-y border px-4 py-3 font-normal" placeholder="Explain the task, what students should submit, and any requirements." /></label>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block text-sm font-semibold">Due date <span className="font-normal text-stone-500">(optional)</span><input type="datetime-local" name="dueAt" className="ui-field mt-2 w-full border px-4 py-3 font-normal" /></label>
          <label className="block text-sm font-semibold">Points<input type="number" name="maxPoints" min="1" max="1000" defaultValue="100" required className="ui-field mt-2 w-full border px-4 py-3 font-normal" /></label>
        </div>
        {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        <button disabled={busy} className="rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white hover:bg-stone-800 disabled:opacity-50">{busy ? "Creating…" : "Publish assignment"}</button>
      </form>
    </div>
  );
}

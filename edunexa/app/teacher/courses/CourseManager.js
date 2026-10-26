"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CourseManager({ courses }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    try {
      const response = await fetch("/api/teacher/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: form.get("title"), subject: form.get("subject"), description: form.get("description") }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not create this course.");
      formElement.reset();
      router.refresh();
    } catch (cause) {
      setError(cause.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <form onSubmit={submit} className="mt-6 grid gap-4 rounded-2xl border border-gray-200 bg-white p-6 sm:grid-cols-2">
        <label className="text-sm font-medium">Course title<input name="title" required maxLength={120} className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 font-normal outline-none focus:border-gray-600" placeholder="Introduction to Biology" /></label>
        <label className="text-sm font-medium">Subject<input name="subject" required maxLength={80} className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 font-normal outline-none focus:border-gray-600" placeholder="Biology" /></label>
        <label className="text-sm font-medium sm:col-span-2">Description <span className="font-normal text-gray-500">(optional)</span><textarea name="description" maxLength={1000} rows={3} className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 font-normal outline-none focus:border-gray-600" placeholder="What will students learn?" /></label>
        <div className="sm:col-span-2"><button disabled={loading} className="rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white hover:bg-gray-700 disabled:opacity-60">{loading ? "Creating…" : "Create course"}</button>{error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}</div>
      </form>
      <section className="mt-10">
        <h2 className="text-lg font-semibold">Courses you teach</h2>
        {courses.length ? <div className="mt-4 space-y-3">{courses.map((course) => <article key={course.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-5"><div><p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{course.subject}</p><h3 className="mt-1 text-lg font-semibold">{course.title}</h3>{course.description && <p className="mt-1 text-sm text-gray-600">{course.description}</p>}<p className="mt-2 text-xs text-gray-500">{course._count.enrollments} enrolled</p></div><div className="rounded-xl bg-gray-100 px-4 py-3"><p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Join code</p><p className="mt-1 font-mono text-sm font-bold tracking-widest">{course.joinCode}</p></div></article>)}</div> : <p className="mt-3 text-sm text-gray-500">You haven’t created a course yet.</p>}
      </section>
    </>
  );
}

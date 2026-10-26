"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CourseEnrollment({ courses }) {
  const router = useRouter();
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const response = await fetch("/api/student/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ joinCode }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not enroll in this course.");
      setJoinCode("");
      setMessage("You’re enrolled. Your course list has been updated.");
      router.refresh();
    } catch (cause) {
      setError(cause.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <form onSubmit={submit} className="mt-6 flex max-w-xl flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5 sm:flex-row">
        <label className="sr-only" htmlFor="course-code">Course join code</label>
        <input id="course-code" required minLength={24} maxLength={24} value={joinCode} onChange={(event) => setJoinCode(event.target.value.toUpperCase())} placeholder="Enter 24-character join code" className="min-w-0 flex-1 rounded-xl border border-gray-300 px-4 py-3 font-mono text-sm uppercase outline-none focus:border-gray-600" />
        <button disabled={loading} className="rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white hover:bg-gray-700 disabled:opacity-60">{loading ? "Joining…" : "Join course"}</button>
      </form>
      {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
      {message && <p role="status" className="mt-3 text-sm text-gray-600">{message}</p>}
      <section className="mt-8">
        <h2 className="text-lg font-semibold">Your courses</h2>
        {courses.length ? <div className="mt-4 grid gap-4 sm:grid-cols-2">{courses.map((course) => <article key={course.id} className="rounded-2xl border border-gray-200 bg-white p-5"><p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{course.subject}</p><h3 className="mt-2 text-lg font-semibold">{course.title}</h3>{course.description && <p className="mt-2 text-sm leading-6 text-gray-600">{course.description}</p>}<p className="mt-4 text-xs text-gray-500">Teacher: {course.teacher.name || "Teacher"}</p></article>)}</div> : <div className="mt-4 rounded-2xl border border-dashed border-gray-300 px-6 py-10 text-center"><h3 className="font-medium">You haven’t joined a course yet</h3><p className="mt-2 text-sm text-gray-500">Ask your teacher for a course join code.</p></div>}
      </section>
    </>
  );
}

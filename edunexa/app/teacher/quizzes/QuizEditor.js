"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Send, Trash2 } from "lucide-react";
import { useState } from "react";
import AiMaterialGenerator from "../AiMaterialGenerator";

const blankQuestion = () => ({
  prompt: "",
  options: ["", "", "", ""],
  correctOptionIndex: 0,
  explanation: "",
  topic: "",
});

export default function QuizEditor({ courses, initialQuiz = null }) {
  const router = useRouter();
  const [quizId, setQuizId] = useState(initialQuiz?.id || null);
  const [courseId, setCourseId] = useState(initialQuiz?.courseId || courses[0]?.id || "");
  const [title, setTitle] = useState(initialQuiz?.title || "");
  const [description, setDescription] = useState(initialQuiz?.description || "");
  const [questions, setQuestions] = useState(
    initialQuiz?.questions?.length
      ? initialQuiz.questions.map((question) => ({
          prompt: question.prompt,
          options: Array.isArray(question.options) ? question.options : ["", "", "", ""],
          correctOptionIndex: question.correctOptionIndex,
          explanation: question.explanation || "",
          topic: question.topic || "",
        }))
      : [blankQuestion()]
  );
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const isPublished = initialQuiz?.status === "PUBLISHED";

  function updateQuestion(index, updates) {
    setQuestions((current) => current.map((question, questionIndex) =>
      questionIndex === index ? { ...question, ...updates } : question
    ));
  }

  function updateOption(questionIndex, optionIndex, value) {
    const question = questions[questionIndex];
    const options = question.options.map((option, index) => index === optionIndex ? value : option);
    updateQuestion(questionIndex, { options });
  }

  async function save(status) {
    setError("");
    setNotice("");
    setBusy(true);

    const payload = { courseId, title, description, questions, status };
    try {
      let id = quizId;
      if (!id) {
        const createdResponse = await fetch("/api/teacher/quizzes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const created = await createdResponse.json();
        if (!createdResponse.ok) throw new Error(created.error || "Could not save the quiz draft.");
        id = created.quiz.id;
        setQuizId(id);
      }

      const response = await fetch(`/api/teacher/quizzes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not update this quiz.");

      setNotice(status === "PUBLISHED" ? "Quiz published. Enrolled students can now take it." : "Draft saved.");
      router.refresh();
      if (!initialQuiz?.id && status === "DRAFT") {
        router.replace(`/teacher/quizzes/${id}`);
      }
      if (status === "PUBLISHED") {
        router.push("/teacher/quizzes");
      }
    } catch (cause) {
      setError(cause.message || "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (isPublished) {
    return (
      <section className="mt-6 rounded-2xl border border-line bg-white p-6">
        <p className="font-semibold">This quiz is published and locked.</p>
        <p className="mt-2 text-sm leading-6 text-subtle">Students may already have submitted answers, so its questions cannot be changed.</p>
        <Link href="/teacher/quizzes" className="mt-5 inline-flex text-sm font-semibold text-amber-800 hover:underline">Back to quizzes</Link>
      </section>
    );
  }

  return (
    <div className="mt-6 space-y-6">
      {courses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-white p-8 text-center">
          <h2 className="font-semibold">Create a course first</h2>
          <p className="mt-2 text-sm text-subtle">Quizzes belong to a course so only its enrolled students can take them.</p>
          <Link href="/teacher/courses" className="mt-5 inline-flex rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white">Manage courses</Link>
        </div>
      ) : (
        <>
          <section className="rounded-2xl border border-line bg-white p-6 sm:p-7">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="text-sm font-semibold text-stone-800">
                Course
                <select value={courseId} onChange={(event) => setCourseId(event.target.value)} className="ui-field mt-2 w-full border px-4 py-3 font-normal">
                  {courses.map((course) => <option key={course.id} value={course.id}>{course.title} · {course.subject}</option>)}
                </select>
              </label>
              <label className="text-sm font-semibold text-stone-800">
                Quiz title
                <input value={title} onChange={(event) => setTitle(event.target.value)} required maxLength={160} placeholder="For example, Fractions check-in" className="ui-field mt-2 w-full border px-4 py-3 font-normal" />
              </label>
              <label className="text-sm font-semibold text-stone-800 sm:col-span-2">
                Instructions <span className="font-normal text-stone-400">(optional)</span>
                <textarea value={description} onChange={(event) => setDescription(event.target.value)} maxLength={2000} rows={2} placeholder="Add any guidance students need before they begin." className="ui-field mt-2 w-full border px-4 py-3 font-normal" />
              </label>
            </div>
          </section>

          <AiMaterialGenerator kind="quiz" onGenerated={(generated) => {
            setTitle(generated.title);
            setDescription(generated.description);
            setQuestions(generated.questions);
            setError("");
            setNotice("AI draft added. Review every question and answer before saving or publishing.");
          }} />

          {questions.map((question, questionIndex) => (
            <section key={questionIndex} className="rounded-2xl border border-line bg-white p-6 sm:p-7">
              <div className="flex items-center justify-between gap-4">
                <h2 className="font-semibold">Question {questionIndex + 1}</h2>
                {questions.length > 1 && <button type="button" onClick={() => setQuestions((current) => current.filter((_, index) => index !== questionIndex))} className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-red-700"><Trash2 size={14} />Remove</button>}
              </div>

              <label className="mt-4 block text-sm font-semibold text-stone-800">
                Question
                <textarea value={question.prompt} onChange={(event) => updateQuestion(questionIndex, { prompt: event.target.value })} required maxLength={1000} rows={2} placeholder="Write a clear question" className="ui-field mt-2 w-full border px-4 py-3 font-normal" />
              </label>

              <fieldset className="mt-5">
                <legend className="text-sm font-semibold text-stone-800">Answer options <span className="font-normal text-stone-500">· select the correct answer</span></legend>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {question.options.map((option, optionIndex) => (
                    <label key={optionIndex} className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 ${question.correctOptionIndex === optionIndex ? "border-amber-400 bg-amber-50/60" : "border-stone-200"}`}>
                      <input type="radio" name={`correct-${questionIndex}`} checked={question.correctOptionIndex === optionIndex} onChange={() => updateQuestion(questionIndex, { correctOptionIndex: optionIndex })} aria-label={`Mark option ${optionIndex + 1} as correct`} className="accent-amber-700" />
                      <span className="w-5 shrink-0 text-xs font-semibold text-stone-400">{String.fromCharCode(65 + optionIndex)}</span>
                      <input value={option} onChange={(event) => updateOption(questionIndex, optionIndex, event.target.value)} required maxLength={300} placeholder={`Option ${optionIndex + 1}`} className="min-w-0 flex-1 border-0 bg-transparent p-1 text-sm outline-none focus:ring-0" />
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-semibold text-stone-800">Topic <span className="font-normal text-stone-400">(for later performance insights)</span><input value={question.topic} onChange={(event) => updateQuestion(questionIndex, { topic: event.target.value })} maxLength={100} placeholder="e.g. Fractions" className="ui-field mt-2 w-full border px-4 py-3 font-normal" /></label>
                <label className="text-sm font-semibold text-stone-800">Answer explanation <span className="font-normal text-stone-400">(shown after submission)</span><textarea value={question.explanation} onChange={(event) => updateQuestion(questionIndex, { explanation: event.target.value })} maxLength={1200} rows={2} placeholder="Explain why the correct answer is right." className="ui-field mt-2 w-full border px-4 py-3 font-normal" /></label>
              </div>
            </section>
          ))}

          <button type="button" disabled={questions.length >= 30} onClick={() => setQuestions((current) => [...current, blankQuestion()])} className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 hover:border-stone-500 disabled:opacity-50">
            <Plus size={16} />Add question
          </button>

          {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
          {notice && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</p>}

          <div className="flex flex-wrap items-center gap-3 border-t border-line pt-5">
            <button type="button" disabled={busy} onClick={() => save("DRAFT")} className="rounded-full border border-stone-300 bg-white px-5 py-3 text-sm font-semibold text-stone-800 hover:bg-stone-50 disabled:opacity-60">{busy ? "Saving..." : "Save draft"}</button>
            {quizId && <button type="button" disabled={busy} onClick={() => save("PUBLISHED")} className="inline-flex items-center gap-2 rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white hover:bg-stone-800 disabled:opacity-60">{busy ? "Publishing..." : "Publish quiz"}<Send size={15} /></button>}
            {!quizId && <p className="text-xs text-stone-500">Save the draft first, review it, then publish it for enrolled students.</p>}
          </div>
        </>
      )}
    </div>
  );
}

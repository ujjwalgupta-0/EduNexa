"use client";

import { useState } from "react";
import { Sparkles, Upload, X } from "lucide-react";

function encodeImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ mimeType: file.type, data: String(reader.result).split(",")[1] || "" });
    reader.onerror = () => reject(new Error("Could not read that image. Please try another file."));
    reader.readAsDataURL(file);
  });
}

export default function AiMaterialGenerator({ kind, onGenerated }) {
  const [topic, setTopic] = useState("");
  const [request, setRequest] = useState("");
  const [difficulty, setDifficulty] = useState("intermediate");
  const [count, setCount] = useState(5);
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function generate() {
    setError("");
    if (!topic.trim() && !file) {
      setError("Enter a topic or upload a photo of lesson material.");
      return;
    }
    setBusy(true);
    try {
      const image = file ? await encodeImage(file) : undefined;
      const response = await fetch("/api/teacher/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, topic, request, difficulty, count, ...(image ? { image } : {}) }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Could not generate material.");
      onGenerated(payload.result);
    } catch (cause) {
      setError(cause.message || "Could not generate material.");
    } finally {
      setBusy(false);
    }
  }

  function chooseFile(event) {
    const picked = event.target.files?.[0] || null;
    setError("");
    if (picked && (! ["image/jpeg", "image/png", "image/webp"].includes(picked.type) || picked.size > 4 * 1024 * 1024)) {
      setError("Choose a JPEG, PNG, or WebP image up to 4 MB.");
      event.target.value = "";
      setFile(null);
      return;
    }
    setFile(picked);
  }

  return (
    <section className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5 sm:p-6">
      <div>
        <h2 className="font-semibold text-stone-900">Create with AI</h2>
        <p className="mt-1 text-sm leading-5 text-stone-600">Generate a {kind} from a topic or a photo of your lesson material. Review and edit the draft before saving.</p>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold text-stone-800 sm:col-span-2">
          Topic <span className="font-normal text-stone-500">(optional when a photo is uploaded)</span>
          <input value={topic} onChange={(event) => setTopic(event.target.value)} maxLength={300} placeholder="e.g. The water cycle, fractions, or photosynthesis" className="ui-field mt-2 w-full border px-4 py-3 font-normal" />
        </label>
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-amber-300 bg-white px-4 py-3 text-sm font-medium text-stone-700 hover:border-amber-500">
          <Upload size={18} className="text-amber-800" />
          <span className="min-w-0 flex-1 truncate">{file ? file.name : "Upload a lesson photo"}<small className="mt-0.5 block text-xs font-normal text-stone-500">JPEG, PNG, or WebP · up to 4 MB</small></span>
          {file && <button type="button" aria-label="Remove image" onClick={(event) => { event.preventDefault(); setFile(null); }} className="rounded-full p-1 text-stone-500 hover:bg-stone-100"><X size={16} /></button>}
          <input type="file" accept="image/jpeg,image/png,image/webp" capture="environment" onChange={chooseFile} className="sr-only" />
        </label>
        <label className="text-sm font-semibold text-stone-800">Difficulty
          <select value={difficulty} onChange={(event) => setDifficulty(event.target.value)} className="ui-field mt-2 w-full border px-4 py-3 font-normal"><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></select>
        </label>
        {kind === "quiz" ? (
          <label className="text-sm font-semibold text-stone-800">Number of questions
            <select value={count} onChange={(event) => setCount(Number(event.target.value))} className="ui-field mt-2 w-full border px-4 py-3 font-normal">{[3, 5, 8, 10, 15].map((n) => <option key={n} value={n}>{n} questions</option>)}</select>
          </label>
        ) : (
          <label className="text-sm font-semibold text-stone-800 sm:col-span-2">Extra guidance <span className="font-normal text-stone-500">(optional)</span>
            <textarea value={request} onChange={(event) => setRequest(event.target.value)} maxLength={1000} rows={2} placeholder="What should students make, explain, or submit?" className="ui-field mt-2 w-full border px-4 py-3 font-normal" />
          </label>
        )}
      </div>
      {error && <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      <button type="button" disabled={busy} onClick={generate} className="mt-5 inline-flex items-center gap-2 rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white hover:bg-stone-800 disabled:cursor-wait disabled:opacity-60"><Sparkles size={16} />{busy ? "Generating draft…" : `Generate ${kind}`}</button>
      <p className="mt-3 text-xs text-stone-500">AI can make mistakes. Check every question, answer, and instruction before publishing.</p>
    </section>
  );
}

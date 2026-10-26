"use client";

import { useState } from "react";

export default function AcceptInvitationForm() {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/parent/accept-invitation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not accept this invitation.");
      setCode("");
      setMessage("Student linked. Their dashboard now lists them below.");
    } catch (cause) {
      setError(cause.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-6 max-w-xl space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <label htmlFor="invite-code" className="block text-sm font-semibold">Invitation code</label>
      <textarea id="invite-code" required value={code} onChange={(event) => setCode(event.target.value)} rows={3} className="w-full resize-y rounded-xl border border-gray-300 px-4 py-3 font-mono text-sm outline-none focus:border-gray-600" placeholder="Paste the code shared by your student" />
      <p className="text-sm leading-6 text-gray-500">Use the same email address the student invited. Codes expire after seven days and can be used once.</p>
      <button disabled={loading} className="rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white hover:bg-gray-700 disabled:opacity-60">{loading ? "Linking…" : "Link student"}</button>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      {message && <p role="status" className="text-sm text-gray-700">{message}</p>}
    </form>
  );
}

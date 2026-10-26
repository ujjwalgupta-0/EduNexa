"use client";

import { useState } from "react";

export default function LinkParentForm() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    setCode("");
    try {
      const response = await fetch("/api/student/parent-invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parentEmail: email }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not create an invitation.");
      setCode(result.code);
      setMessage(`Code expires ${new Date(result.expiresAt).toLocaleDateString()}.`);
      setEmail("");
    } catch (cause) {
      setError(cause.message);
    } finally {
      setLoading(false);
    }
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      setMessage("Code copied. Share it only with your parent or guardian.");
    } catch {
      setError("Copy was unavailable. Select and copy the code manually.");
    }
  }

  return (
    <div className="mt-6 max-w-xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <form onSubmit={submit} className="space-y-4">
        <label className="block text-sm font-semibold text-gray-800" htmlFor="parent-email">Parent or guardian email</label>
        <input id="parent-email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="guardian@example.com" className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-600" />
        <p className="text-sm leading-6 text-gray-500">They need an approved Parent account with this email address to redeem the code.</p>
        <button disabled={loading} className="rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:opacity-60">
          {loading ? "Creating code…" : "Create one-time code"}
        </button>
      </form>
      {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
      {message && <p role="status" className="mt-4 text-sm text-gray-600">{message}</p>}
      {code && (
        <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <p className="break-all font-mono text-sm text-gray-900">{code}</p>
          <button type="button" onClick={copyCode} className="mt-3 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-800 hover:bg-white">Copy code</button>
          <p className="mt-3 text-xs leading-5 text-gray-500">This code is shown only once. Send it directly to the invited person.</p>
        </div>
      )}
    </div>
  );
}

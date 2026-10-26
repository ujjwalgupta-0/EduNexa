"use client";

import Link from "next/link";
import { useState } from "react";

export default function ResendVerificationForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/email-verification/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Unable to request a verification email.");
        return;
      }
      setMessage(data.message);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="ui-panel p-6 shadow-sm sm:p-8">
      <label htmlFor="verification-email" className="mb-2 block text-sm font-medium text-gray-700">
        Email address
      </label>
      <input
        id="verification-email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
        maxLength={254}
        placeholder="you@example.com"
        className="ui-field mb-5 w-full border px-4 py-3 outline-none"
      />

      {error && <p role="alert" className="mb-4 text-sm text-gray-700">{error}</p>}
      {message && <p role="status" className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-sm leading-6 text-gray-700">{message}</p>}

      <button type="submit" disabled={loading} className="ui-primary w-full py-3 font-semibold disabled:opacity-60">
        {loading ? "Sending..." : "Send verification link"}
      </button>
      <p className="mt-5 text-center text-sm text-gray-500">
        <Link href="/login" className="font-semibold text-gray-900 hover:underline">Back to sign in</Link>
      </p>
    </form>
  );
}

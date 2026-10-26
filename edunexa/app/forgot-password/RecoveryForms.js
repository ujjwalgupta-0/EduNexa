"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function RequestPasswordResetForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const response = await fetch("/api/auth/password-reset/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not start password recovery.");
      setMessage(result.message);
      setEmail("");
    } catch (cause) {
      setError(cause.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <form onSubmit={submit} className="mt-8 space-y-5">
        <label htmlFor="recovery-email" className="block text-sm font-semibold text-gray-700">Email address</label>
        <input id="recovery-email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-sm outline-none focus:border-gray-600" />
        <button disabled={loading} className="w-full rounded-xl bg-gray-900 px-5 py-3.5 text-sm font-bold text-white hover:bg-gray-700 disabled:opacity-60">{loading ? "Preparing recovery…" : "Continue"}</button>
      </form>
      {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
      {message && <p role="status" className="mt-4 rounded-xl border border-gray-200 bg-white p-4 text-sm leading-6 text-gray-700">{message}</p>}
      <p className="mt-4 rounded-xl bg-gray-100 p-4 text-sm leading-6 text-gray-600">Email delivery is not configured yet. In local development, the reset link appears in the terminal running EduNexa.</p>
      <p className="mt-6 text-center text-sm"><Link href="/login" className="font-semibold text-gray-700 hover:text-gray-950">Back to sign in</Link></p>
    </>
  );
}

export function ResetPasswordForm({ token }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError("");
    if (password !== confirmation) {
      setError("The passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/auth/password-reset/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not reset your password.");
      router.replace("/login?passwordReset=true");
    } catch (cause) {
      setError(cause.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <form onSubmit={submit} className="mt-8 space-y-5">
        <label htmlFor="new-password" className="block text-sm font-semibold text-gray-700">New password</label>
        <input id="new-password" type="password" autoComplete="new-password" required minLength={8} maxLength={72} value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-sm outline-none focus:border-gray-600" />
        <label htmlFor="confirm-password" className="block text-sm font-semibold text-gray-700">Confirm new password</label>
        <input id="confirm-password" type="password" autoComplete="new-password" required minLength={8} maxLength={72} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-sm outline-none focus:border-gray-600" />
        <button disabled={loading} className="w-full rounded-xl bg-gray-900 px-5 py-3.5 text-sm font-bold text-white hover:bg-gray-700 disabled:opacity-60">{loading ? "Updating password…" : "Set new password"}</button>
      </form>
      {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
      <p className="mt-6 text-center text-sm"><Link href="/forgot-password" className="font-semibold text-gray-700 hover:text-gray-950">Request another reset link</Link></p>
    </>
  );
}

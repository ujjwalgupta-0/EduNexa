"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, signOut } from "next-auth/react";
import BrandLink from "../components/BrandLink";

const roleHelp = {
  STUDENT: "Create your student account and start learning.",
  TEACHER: "Teacher accounts begin with student access. An administrator must approve your teacher request before you can manage courses.",
  PARENT: "Parent accounts begin with student access. An administrator must approve your parent request before you can connect to a student.",
};

export default function CreateAccountForm({ initialRole = "STUDENT", googleAccountExists = false, emailVerificationAvailable = true }) {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: initialRole });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!googleAccountExists) return;

    // The Google callback may have left an existing account signed in. Clear
    // that session so the signup page does not continue as that account.
    signOut({ redirect: false }).catch((signOutError) => {
      console.error("Unable to clear existing Google session:", signOutError);
    });
  }, [googleAccountExists]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleGoogleSignup() {
    setError("");
    setGoogleLoading(true);

    try {
      const role = form.role.toLowerCase();
      await signIn("google", {
        redirectTo: `/auth/google-registration?role=${role}`,
      });
    } catch (error) {
      console.error("GOOGLE SIGNUP ERROR:", error);
      setError("Unable to continue with Google. Please try again.");
      setGoogleLoading(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Unable to create account");
        return;
      }

      const loginUrl = `/login?verificationSent=${data.verificationSent ? "true" : "failed"}`;
      // A previous admin/student session in this browser must not be reused
      // after registering another account.
      await signOut({ callbackUrl: loginUrl });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="ui-page flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="mb-7 flex flex-col items-center text-center">
          <BrandLink className="mb-7" />
          <p className="ui-eyebrow">A place for your learning</p>
          <h1 className="ui-page-title mt-2 text-3xl">Create your account</h1>
          <p className="mt-2 text-gray-500">Get started with your EduNexa account</p>
        </div>

        <form onSubmit={handleSubmit} className="ui-panel p-6 shadow-sm sm:p-8">
          {googleAccountExists && (
            <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
              This Google account already has an EduNexa account. <Link href="/login" className="font-semibold text-red-800 underline underline-offset-2 hover:text-red-900">Sign in</Link> with it, or choose a different Google account to create a new account.
            </div>
          )}

          <div className="mb-5">
            <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-700">Full name</label>
            <input id="name" type="text" name="name" value={form.name} onChange={handleChange} minLength={2} maxLength={100} autoComplete="name" placeholder="Enter your full name" className="ui-field w-full border px-4 py-3 outline-none" required />
          </div>

          <div className="mb-5">
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">Email</label>
            <input id="email" type="email" name="email" value={form.email} onChange={handleChange} maxLength={254} autoComplete="email" placeholder="you@example.com" className="ui-field w-full border px-4 py-3 outline-none" required />
            <p className="mt-2 text-xs leading-5 text-gray-500">We&apos;ll send a verification link. You must open it before signing in with a password.</p>
          </div>

          <div className="mb-5">
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700">Create a password</label>
            <input id="password" type="password" name="password" value={form.password} onChange={handleChange} minLength={8} maxLength={72} autoComplete="new-password" placeholder="Choose your own (at least 8 characters)" className="ui-field w-full border px-4 py-3 outline-none" required />
          </div>

          <div className="mb-6">
            <label htmlFor="role" className="mb-2 block text-sm font-medium text-gray-700">I am a</label>
            <select id="role" name="role" value={form.role} onChange={handleChange} className="ui-field w-full border px-4 py-3 outline-none">
              <option value="STUDENT">Student</option>
              <option value="TEACHER">Teacher</option>
              <option value="PARENT">Parent</option>
            </select>
            <p className="mt-2 text-sm leading-6 text-gray-500">{roleHelp[form.role]}</p>
          </div>

          {error && <div role="alert" className="mb-5 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">{error}</div>}

          <button type="submit" disabled={loading || googleLoading || !emailVerificationAvailable} className="ui-primary w-full py-3 font-semibold disabled:cursor-not-allowed disabled:opacity-60">
            {loading ? "Creating account…" : form.role === "STUDENT" ? "Create account" : `Create account and request ${form.role.toLowerCase()} access`}
          </button>

          <div className="my-6 flex items-center gap-4" aria-hidden="true">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs font-medium text-gray-400">OR</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          <button
            type="button"
            onClick={handleGoogleSignup}
            disabled={loading || googleLoading}
            className="flex w-full items-center justify-center gap-3 rounded-full border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="text-lg font-bold text-[#4285f4]">G</span>
            {googleLoading ? "Connecting to Google..." : "Continue with Google"}
          </button>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account? <Link href="/login" className="font-semibold text-gray-900 hover:underline">Sign in</Link>
          </p>
        </form>
      </div>
    </main>
  );
}

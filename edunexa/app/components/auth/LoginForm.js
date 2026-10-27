"use client";

import BrandMark from "../BrandMark";

import Link from "next/link";
import { useEffect, useState } from "react";
import { signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

import {
  Eye,
  EyeOff,
  ArrowRight,
  GraduationCap,
  Users,
  ShieldCheck,
} from "lucide-react";

const roleConfig = {
  student: {
    label: "Student",
    icon: GraduationCap,
    color: "text-slate-600",
    bg: "bg-slate-50",
  },

  teacher: {
    label: "Teacher",
    icon: Users,
    color: "text-gray-600",
    bg: "bg-gray-50",
  },

  parent: {
    label: "Parent",
    icon: ShieldCheck,
    color: "text-slate-600",
    bg: "bg-slate-50",
  },
  admin: {
    label: "Administrator",
    icon: ShieldCheck,
    color: "text-gray-700",
    bg: "bg-gray-100",
  },
};

export default function LoginForm({
  role,
  registered = false,
  requestedRole = null,
  passwordReset = false,
  verificationSent = null,
  emailVerification = null,
  googleError = null,
  oauthError = null,
}) {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (googleError === "role") {
      signOut({ redirect: false }).catch((signOutError) => {
        console.error("Unable to clear mismatched Google session:", signOutError);
      });
    }
  }, [googleError]);

  const selectedRole = role?.toLowerCase() || "student";

  const currentRole =
    roleConfig[selectedRole] || roleConfig.student;

  const Icon = currentRole.icon;
  const requestedRoleLabel = requestedRole
    ? `${requestedRole[0].toUpperCase()}${requestedRole.slice(1)}`
    : null;

  // EMAIL + PASSWORD LOGIN
  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      console.error("LOGIN ERROR:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // GOOGLE LOGIN
  async function handleGoogleLogin() {
    setError("");
    setGoogleLoading(true);

    try {
      // The browser may still hold a previous administrator session. Clear it
      // before starting a different Google login so a failed callback cannot
      // fall back to that account's dashboard.
      await signOut({ redirect: false });
      await signIn("google", {
        redirectTo: `/auth/google-login?role=${encodeURIComponent(selectedRole)}`,
      });
    } catch (error) {
      console.error("GOOGLE LOGIN ERROR:", error);
      setError("Unable to sign in with Google.");
      setGoogleLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      {passwordReset && (
        <div role="status" className="mb-6 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm leading-6 text-gray-700">
          Your password has been updated. Sign in with your new password.
        </div>
      )}
      {verificationSent && (
        <div role="status" className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-gray-700">
          {verificationSent === "failed"
            ? "Your account was created, but the verification email could not be sent. You can request another link."
            : "Check your inbox for a verification link. You must verify your email before signing in."}
          {" "}<Link href="/verify-email" className="font-semibold text-amber-900 underline">Resend verification email</Link>
        </div>
      )}
      {emailVerification === "success" && (
        <div role="status" className="mb-6 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm leading-6 text-gray-700">
          Your email is verified. You can sign in now.
        </div>
      )}
      {emailVerification === "invalid" && (
        <div role="alert" className="mb-6 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm leading-6 text-gray-700">
          This verification link is invalid or expired. <Link href="/verify-email" className="font-semibold text-amber-900 underline">Request a new link</Link>.
        </div>
      )}
      {googleError === "role" && (
        <div role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
          This Google account does not have {currentRole.label.toLowerCase()} access. Choose the correct sign-in page or use a different Google account.
        </div>
      )}
      {googleError === "failed" && (
        <div role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
          Google sign-in could not be completed. Please try again, and check that the Google account is connected to EduNexa.
        </div>
      )}
      {oauthError && (
        <div role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
          {oauthError === "Configuration"
            ? <>EduNexa&apos;s auth server reported a configuration error. Check its terminal logs for the underlying cause. For local Google sign-in, the Google OAuth client must allow <code className="rounded bg-red-100 px-1">http://localhost:3000/api/auth/callback/google</code> as an authorized redirect URI.</>
            : oauthError === "OAuthAccountNotLinked"
              ? "This Google address belongs to an existing EduNexa account. Sign in with that account's original method, or ask an administrator for help linking it."
              : "Google sign-in could not complete. Please try again, or sign in with your email and password. If this continues, check the Google OAuth settings and server logs."}
        </div>
      )}
      {registered && (
        <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm leading-6 text-gray-700">
          {requestedRoleLabel
            ? `Your account is ready with student access. Your ${requestedRoleLabel} access request is waiting for administrator approval.`
            : "Your account is ready. Sign in to continue."}
        </div>
      )}

      {/* Mobile Logo */}
      <div className="mb-10 flex justify-center lg:hidden">
        <Link href="/" className="flex items-center gap-2">
          <BrandMark size={36} />

          <span className="text-xl font-bold text-[#172b3a]">
            EduNexa
          </span>
        </Link>
      </div>

      {/* Header */}
      <div className="text-center">

        <div
          className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-900"
        >
          <Icon size={30} />
        </div>

        <h1 className="ui-page-title mt-6 text-3xl">
          Welcome back
        </h1>

        <p className="mt-2 text-gray-500">
          {selectedRole === "admin" ? "Sign in to the EduNexa admin workspace" : `Sign in to your ${currentRole.label.toLowerCase()} account`}
        </p>

      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="mt-9 space-y-5">

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-semibold text-gray-700"
          >
            Email address
          </label>

          <input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="ui-field w-full border px-4 py-3.5 text-sm outline-none transition placeholder:text-gray-400"
            required
          />
        </div>

        {/* Password */}
        <div>

          <div className="mb-2 flex items-center justify-between">
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-gray-700"
            >
              Password
            </label>

            <Link
              href="/forgot-password"
              className="text-sm font-semibold text-amber-800 transition hover:text-amber-900"
            >
              Forgot password?
            </Link>
          </div>

          <div className="relative">

            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="ui-field w-full border px-4 py-3.5 pr-12 text-sm outline-none transition placeholder:text-gray-400"
              required
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-gray-400 transition hover:text-gray-700"
              aria-label={
                showPassword
                  ? "Hide password"
                  : "Show password"
              }
            >
              {showPassword ? (
                <EyeOff size={19} />
              ) : (
                <Eye size={19} />
              )}
            </button>

          </div>
        </div>

        {/* Remember */}
        <div className="flex items-center">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-slate-600 focus:ring-slate-500"
            />
            Remember me
          </label>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl border-l-2 border-gray-700 bg-gray-100 px-4 py-3 text-sm font-medium text-gray-700">
            {error}
          </div>
        )}

        {/* Login Button */}
        <button
          type="submit"
          disabled={loading}
          className="ui-primary group flex w-full items-center justify-center gap-2 px-5 py-3.5 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign In"}

          {!loading && (
            <ArrowRight
              size={18}
              className="transition group-hover:translate-x-1"
            />
          )}
        </button>

      </form>

      {/* Divider */}
      <div className="my-7 flex items-center gap-4">
        <div className="h-px flex-1 bg-gray-200" />

        <span className="text-xs font-medium text-gray-400">
          OR
        </span>

        <div className="h-px flex-1 bg-gray-200" />
      </div>

      {/* Google */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={loading || googleLoading}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-5 py-3.5 text-sm font-semibold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className="text-lg font-bold">
          G
        </span>

        {googleLoading ? "Connecting to Google..." : "Continue with Google"}
      </button>

      {/* Register */}
      {selectedRole === "admin" ? (
        <p className="mt-8 text-center text-sm text-gray-500">Admin access is provisioned by the system owner. Contact them if you need an account.</p>
      ) : (
        <p className="mt-8 text-center text-sm text-gray-500">
          Don&apos;t have an account?{" "}
          <Link href={`/create-account?role=${selectedRole}`} className="font-bold text-amber-800 hover:text-amber-900">Create an Account</Link>
        </p>
      )}

      {selectedRole !== "admin" && (
        <p className="mt-3 text-center text-xs text-gray-400">
          <Link href="/admin/login" className="hover:text-gray-700">Administrator sign in</Link>
        </p>
      )}

      {/* Security */}
      <div className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-400">
        <ShieldCheck size={14} />

        <span>
          Your information is securely protected
        </span>
      </div>

    </div>
  );
}

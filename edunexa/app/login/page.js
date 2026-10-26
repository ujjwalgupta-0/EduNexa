// "use client"

// import { useSearchParams } from "next/navigation";
import LoginBranding from "../components/auth/LoginBranding";
import LoginForm from "../components/auth/LoginForm";

// const searchParams = useSearchParams();

// const role = searchParams.get("role") || "student";

export default async function LoginPage({ searchParams }) {
  const params = await searchParams;

  const role = params?.role || "student";
  const registered = params?.registered === "true";
  const requestedRole = params?.requestedRole || null;
  const passwordReset = params?.passwordReset === "true";
  const verificationSent = params?.verificationSent || null;
  const emailVerification = params?.emailVerification || null;
  const googleError = params?.googleError || null;
  const oauthError = params?.error || null;

  return (
    <main className="ui-page">
      <div className="grid min-h-screen lg:grid-cols-2">

        <LoginBranding />

        <div className="flex items-center justify-center px-6 py-12 sm:px-10 lg:px-16">
         
          <LoginForm role={role} registered={registered} requestedRole={requestedRole} passwordReset={passwordReset} verificationSent={verificationSent} emailVerification={emailVerification} googleError={googleError} oauthError={oauthError} />
          
        </div>

      </div>
    </main>
  );
}

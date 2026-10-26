import BrandLink from "../components/BrandLink";

import { RequestPasswordResetForm, ResetPasswordForm } from "./RecoveryForms";

export const metadata = { robots: { index: false, follow: false } };

export default async function ForgotPasswordPage({ searchParams }) {
  const params = await searchParams;
  const token = typeof params?.token === "string" ? params.token : "";

  return (
    <main className="ui-page flex items-center justify-center px-6 py-12">
      <section className="ui-panel w-full max-w-md p-6 shadow-sm sm:p-8">
        <BrandLink size={30} />
        <p className="ui-eyebrow mt-8">Account recovery</p>
        <h1 className="ui-page-title mt-2 text-2xl">{token ? "Choose a new password" : "Reset your password"}</h1>
        <p className="mt-3 text-sm leading-6 text-gray-600">{token ? "Choose a new password for your account. Reset links expire after 30 minutes and can only be used once." : "Enter the email address associated with your account to start password recovery."}</p>
        {token ? <ResetPasswordForm token={token} /> : <RequestPasswordResetForm />}
      </section>
    </main>
  );
}

import BrandLink from "@/app/components/BrandLink";
import ResendVerificationForm from "./ResendVerificationForm";

export default function VerifyEmailPage() {
  return (
    <main className="ui-page flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="mb-7 flex flex-col items-center text-center">
          <BrandLink className="mb-7" />
          <p className="ui-eyebrow">One last step</p>
          <h1 className="ui-page-title mt-2 text-3xl">Verify your email</h1>
          <p className="mt-2 text-gray-500">
            Enter the address you used to create your account and we&apos;ll send a fresh verification link.
          </p>
        </div>
        <ResendVerificationForm />
      </div>
    </main>
  );
}

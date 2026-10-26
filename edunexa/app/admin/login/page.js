import LoginBranding from "@/app/components/auth/LoginBranding";
import LoginForm from "@/app/components/auth/LoginForm";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminLoginPage() {
  const session = await auth();
  if (session?.user?.role === "ADMIN") redirect("/admin");

  return (
    <main className="ui-page">
      <div className="grid min-h-screen lg:grid-cols-2">
        <LoginBranding />
        <div className="flex items-center justify-center px-6 py-12 sm:px-10 lg:px-16">
          <LoginForm role="admin" />
        </div>
      </div>
    </main>
  );
}

import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

export default async function DashboardRedirectPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  switch (session.user.role) {
    case "STUDENT":
      redirect("/student/dashboard");
    case "TEACHER":
      redirect("/teacher/dashboard");
    case "PARENT":
      redirect("/parent/dashboard");
    case "ADMIN":
      redirect("/admin");
    default:
      redirect("/");
  }
}

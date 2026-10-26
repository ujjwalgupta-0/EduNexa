import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

export default async function RoleRequestsPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");
  redirect("/admin");
}

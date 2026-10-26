import { redirect } from "next/navigation";
import WorkspacePageHeader from "@/app/components/WorkspacePageHeader";

import AcceptInvitationForm from "./AcceptInvitationForm";
import { auth } from "@/lib/auth";

export default async function LinkChildPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "PARENT") redirect("/dashboard");

  return (
    <main className="ui-page px-5 py-7 sm:px-8 sm:py-9">
      <div className="mx-auto max-w-4xl">
        <WorkspacePageHeader href="/parent/dashboard" backLabel="Back to parent dashboard" />
        <p className="ui-eyebrow">Parent portal</p>
        <h1 className="ui-page-title mt-2 text-3xl">Link a student</h1>
        <p className="mt-3 max-w-2xl leading-7 text-gray-600">Ask your student to create an invitation using this account’s email address. Linking only works with the email the invitation was sent to.</p>
        <AcceptInvitationForm />
      </div>
    </main>
  );
}

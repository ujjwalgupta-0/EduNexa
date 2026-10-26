import { redirect } from "next/navigation";
import WorkspacePageHeader from "@/app/components/WorkspacePageHeader";

import LinkParentForm from "./LinkParentForm";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function StudentParentLinkPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "STUDENT") redirect("/dashboard");

  const [links, invitations] = await Promise.all([
    prisma.parentChild.findMany({ where: { studentId: session.user.id }, include: { parent: { select: { name: true, email: true } } }, orderBy: { createdAt: "desc" } }),
    prisma.parentLinkInvitation.findMany({ where: { studentId: session.user.id, acceptedAt: null, expiresAt: { gt: new Date() } }, select: { id: true, parentEmail: true, expiresAt: true }, orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <main className="ui-page px-5 py-7 sm:px-8 sm:py-9">
      <div className="mx-auto max-w-4xl">
        <WorkspacePageHeader href="/student/dashboard" backLabel="Back to dashboard" />
        <p className="ui-eyebrow">Student settings</p>
        <h1 className="ui-page-title mt-2 text-3xl">Parent and guardian access</h1>
        <p className="mt-3 max-w-2xl leading-7 text-gray-600">Invite a trusted adult to follow your learning. The code is tied to their email and expires after seven days.</p>
        <LinkParentForm />

        <section className="mt-10">
          <h2 className="text-lg font-semibold">Linked parents and guardians</h2>
          {links.length ? <ul className="mt-4 divide-y divide-gray-200 rounded-2xl border border-gray-200 bg-white">{links.map(({ parentId, parent }) => <li key={parentId} className="px-5 py-4"><p className="font-medium">{parent.name || "Parent or guardian"}</p><p className="mt-1 text-sm text-gray-500">{parent.email}</p></li>)}</ul> : <p className="mt-3 text-sm text-gray-500">No parent or guardian is linked yet.</p>}
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-semibold">Pending invitations</h2>
          {invitations.length ? <ul className="mt-4 divide-y divide-gray-200 rounded-2xl border border-gray-200 bg-white">{invitations.map((invite) => <li key={invite.id} className="flex flex-wrap justify-between gap-2 px-5 py-4 text-sm"><span className="font-medium">{invite.parentEmail}</span><span className="text-gray-500">Expires {invite.expiresAt.toLocaleDateString()}</span></li>)}</ul> : <p className="mt-3 text-sm text-gray-500">No pending invitations.</p>}
        </section>
      </div>
    </main>
  );
}

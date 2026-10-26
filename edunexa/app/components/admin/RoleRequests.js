"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RoleRequests({ requests: initialRequests }) {
  const router = useRouter();
  const [requests, setRequests] = useState(initialRequests);
  const [pendingId, setPendingId] = useState(null);
  const [message, setMessage] = useState("");

  async function handleDecision(userId, decision) {
    setPendingId(userId);
    setMessage("");

    try {
      const response = await fetch("/api/admin/role-requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, decision }),
      });
      const result = await response.json();

      if (!response.ok) {
        setMessage(result.error || "Unable to update this request.");
        return;
      }

      setRequests((current) => current.filter((request) => request.id !== userId));
      setMessage(result.message);
      router.refresh();
    } catch {
      setMessage("Unable to update this request. Please try again.");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <section aria-live="polite">
      {message && <p role="status" className="mb-3 border-l-2 border-gray-700 bg-gray-50 px-3 py-2.5 text-sm text-gray-700">{message}</p>}

      {requests.length === 0 ? (
        <p className="py-8 text-sm text-gray-500">No requests are waiting for review.</p>
      ) : (
        <div className="divide-y divide-gray-200">
          {requests.map((request) => (
            <article key={request.id} className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center border border-gray-200 text-xs font-semibold uppercase text-gray-600">{request.requestedRole.slice(0, 1)}</span>
                <div className="min-w-0">
                  <h2 className="text-sm font-semibold text-gray-900">{request.name || "Name not provided"}</h2>
                  <p className="mt-0.5 truncate text-sm text-gray-500">{request.email}</p>
                  <p className="mt-1 text-xs text-gray-400">Requested {request.requestedRole.toLowerCase()} · {new Date(request.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>
                </div>
              </div>
              <div className="flex shrink-0 gap-2 sm:pl-4">
                <button type="button" disabled={pendingId !== null} onClick={() => handleDecision(request.id, "deny")} className="border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50">
                  Decline
                </button>
                <button type="button" disabled={pendingId !== null} onClick={() => handleDecision(request.id, "approve")} className="ui-primary px-4 py-2 text-xs font-semibold disabled:opacity-50">
                  {pendingId === request.id ? "Saving…" : "Approve"}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

import { useState } from "react";
import { useApp } from "../context/AppContext";
import { ReceivedRequestCard, SentRequestCard } from "../components/FriendRequest";
import EmptyState from "../components/EmptyState";

export default function FriendRequests() {
  const { received, sent } = useApp();
  const [tab, setTab] = useState("received");

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 pb-28 md:pb-10 flex flex-col gap-5">
      <h1 className="text-xl md:text-2xl font-display font-extrabold text-ink-900">Friend Requests</h1>

      <div className="flex gap-2 bg-sky-50 rounded-full p-1 w-fit">
        {[
          { id: "received", label: `Received${received.length ? ` (${received.length})` : ""}` },
          { id: "sent", label: `Sent${sent.length ? ` (${sent.length})` : ""}` },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`text-sm font-medium px-4 py-1.5 rounded-full transition-colors ${
              tab === t.id ? "bg-white text-sky-700 shadow-card" : "text-ink-500"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "received" ? (
        received.length === 0 ? (
          <EmptyState icon="📩" title="No pending requests" message="New friend requests will show up here." />
        ) : (
          <div className="flex flex-col gap-3">
            {received.map((r) => (
              <ReceivedRequestCard key={r.requestId} request={r} />
            ))}
          </div>
        )
      ) : sent.length === 0 ? (
        <EmptyState icon="📤" title="No sent requests" message="Requests you send will appear here until accepted." />
      ) : (
        <div className="flex flex-col gap-3">
          {sent.map((r) => (
            <SentRequestCard key={r.requestId} request={r} />
          ))}
        </div>
      )}
    </div>
  );
}

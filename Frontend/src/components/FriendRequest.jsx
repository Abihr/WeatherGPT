import { Check, X, ShieldOff } from "lucide-react";
import { useApp } from "../context/AppContext";

function Avatar({ name }) {
  const initials = name.split(" ").map((n) => n[0]).slice(0, 2).join("");
  return (
    <div className="h-11 w-11 rounded-full bg-sky-100 text-sky-700 font-display font-semibold flex items-center justify-center text-sm shrink-0">
      {initials}
    </div>
  );
}

export function ReceivedRequestCard({ request }) {
  const { acceptRequest, rejectRequest, blockUserById } = useApp();

  return (
    <div className="rounded-xl2 bg-white shadow-card p-4 flex items-center gap-3 animate-enter">
      <Avatar name={request.name} />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-ink-800 truncate">{request.name}</p>
        <p className="text-xs text-ink-400">wants to add you as a friend · {request.location}</p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={() => acceptRequest(request)}
          title="Accept"
          className="h-9 w-9 rounded-full bg-sky-500 text-white flex items-center justify-center hover:bg-sky-600 transition-colors"
        >
          <Check size={16} />
        </button>
        <button
          onClick={() => rejectRequest(request.requestId)}
          title="Reject"
          className="h-9 w-9 rounded-full bg-sky-50 text-ink-500 flex items-center justify-center hover:bg-sky-100 transition-colors"
        >
          <X size={16} />
        </button>
        <button
          onClick={() => blockUserById({ id: request.senderId, name: request.name, username: request.username, location: request.location })}
          title="Block"
          className="h-9 w-9 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors"
        >
          <ShieldOff size={15} />
        </button>
      </div>
    </div>
  );
}

export function SentRequestCard({ request }) {
  const { cancelRequest } = useApp();
  return (
    <div className="rounded-xl2 bg-white shadow-card p-4 flex items-center gap-3 animate-enter">
      <Avatar name={request.name} />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-ink-800 truncate">{request.name}</p>
        <p className="text-xs text-sun-500 font-medium">Request Pending</p>
      </div>
      <button
        onClick={() => cancelRequest(request.requestId)}
        className="text-sm font-medium px-3.5 py-1.5 rounded-full bg-sky-50 text-ink-500 hover:bg-sky-100 transition-colors shrink-0"
      >
        Cancel Request
      </button>
    </div>
  );
}

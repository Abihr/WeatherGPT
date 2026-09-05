import { Check, X, ShieldOff } from "lucide-react";
import { useApp } from "../context/AppContext";

function Avatar({ name }) {
  const safeName = name || "User";

  const initials = safeName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="h-11 w-11 rounded-full bg-sky-100 text-sky-700 font-display font-semibold flex items-center justify-center text-sm shrink-0">
      {initials}
    </div>
  );
}

/* ============================================
   Helper: Convert location object to text
============================================ */

function getLocationText(location) {
  if (!location) {
    return "Location unavailable";
  }

  // If Firebase stores location as a string
  if (typeof location === "string") {
    return location;
  }

  // If Firebase stores:
  // { city, lat, lng }
  if (typeof location.city === "string" && location.city.trim()) {
    return location.city;
  }

  // Fallback to coordinates
  if (
    typeof location.lat === "number" &&
    typeof location.lng === "number"
  ) {
    return `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`;
  }

  return "Location unavailable";
}

/* ============================================
   RECEIVED FRIEND REQUEST
============================================ */

export function ReceivedRequestCard({ request }) {
  const {
    acceptRequest,
    rejectRequest,
    blockUserById,
  } = useApp();

  const locationText = getLocationText(request?.location);

  return (
    <div className="rounded-xl2 bg-white shadow-card p-4 flex items-center gap-3 animate-enter">

      {/* Avatar */}
      <Avatar name={request?.name} />

      {/* User Information */}
      <div className="flex-1 min-w-0">

        <p className="font-semibold text-ink-800 truncate">
          {request?.name || "User"}
        </p>

        <p className="text-xs text-ink-400 truncate">
          wants to add you as a friend ·
        </p>

      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 shrink-0">

        {/* Accept */}
        <button
          onClick={() => acceptRequest(request)}
          title="Accept"
          className="h-9 w-9 rounded-full bg-sky-500 text-white flex items-center justify-center hover:bg-sky-600 transition-colors"
        >
          <Check size={16} />
        </button>

        {/* Reject */}
        <button
          onClick={() => rejectRequest(request?.requestId)}
          title="Reject"
          className="h-9 w-9 rounded-full bg-sky-50 text-ink-500 flex items-center justify-center hover:bg-sky-100 transition-colors"
        >
          <X size={16} />
        </button>

        {/* Block */}
        <button
          onClick={() =>
            blockUserById({
              id: request?.senderId,
              name: request?.name,
              username: request?.username,
              location: request?.location,
            })
          }
          title="Block"
          className="h-9 w-9 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors"
        >
          <ShieldOff size={15} />
        </button>

      </div>
    </div>
  );
}

/* ============================================
   SENT FRIEND REQUEST
============================================ */

export function SentRequestCard({ request }) {
  const { cancelRequest } = useApp();

  return (
    <div className="rounded-xl2 bg-white shadow-card p-4 flex items-center gap-3 animate-enter">

      {/* Avatar */}
      <Avatar name={request?.name} />

      {/* User Information */}
      <div className="flex-1 min-w-0">

        <p className="font-semibold text-ink-800 truncate">
          {request?.name || "User"}
        </p>

        <p className="text-xs text-sun-500 font-medium">
          Request Pending
        </p>

      </div>

      {/* Cancel */}
      <button
        onClick={() => cancelRequest(request?.requestId)}
        className="text-sm font-medium px-3.5 py-1.5 rounded-full bg-sky-50 text-ink-500 hover:bg-sky-100 transition-colors shrink-0"
      >
        Cancel Request
      </button>

    </div>
  );
}
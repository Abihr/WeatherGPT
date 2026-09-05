import { useState, useRef, useEffect } from "react";

import {
  MoreVertical,
  Lock,
  MapPin,
  User,
  Eye,
  RefreshCw,
  UserMinus,
  ShieldOff,
} from "lucide-react";

import { weatherIcon } from "../data/mockData";
import { useApp } from "../context/AppContext";

export default function FriendCard({ friend, onCompare, onBlock }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const menuRef = useRef(null);

  const { removeFriend, pushToast } = useApp();

  // Close menu when clicking outside
  useEffect(() => {
    function onClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", onClick);

    return () => {
      document.removeEventListener("mousedown", onClick);
    };
  }, []);

  // Safe initials
  const initials = (friend?.name || "User")
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  // Friend weather from Firestore
  const weather = friend?.weather;

  // Weather exists = weather can be displayed
  const weatherShared = !!weather;

  // Firestore location is a map
  const locationText =
    typeof friend?.location === "string"
      ? friend.location
      : friend?.location?.city ||
        weather?.locationName ||
        "";

  // Firestore uses "temperature"
  const temperature =
    weather?.temperature ?? weather?.temp;

  return (
    <div className="rounded-xl2 bg-white shadow-card p-5 flex flex-col gap-4 animate-enter">

      {/* Friend Header */}
      <div className="flex items-start gap-3">

        {/* Avatar */}
        <div className="h-11 w-11 rounded-full bg-sky-100 text-sky-700 font-display font-semibold flex items-center justify-center text-sm shrink-0">
          {initials}
        </div>

        {/* Friend Information */}
        <div className="flex-1 min-w-0">

          <p className="font-semibold text-ink-800 truncate">
            {friend?.name || "User"}
          </p>

          <p className="text-xs text-ink-400">
            @{friend?.username || "username"}
          </p>

          {locationText && (
            <p className="text-xs text-ink-400 flex items-center gap-1 mt-0.5">
              <MapPin size={11} />
              {locationText}
            </p>
          )}

        </div>

        {/* Menu */}
        <div className="relative" ref={menuRef}>

          <button
            onClick={() => setMenuOpen((value) => !value)}
            className="h-8 w-8 rounded-full flex items-center justify-center text-ink-400 hover:bg-sky-50 hover:text-ink-700 transition-colors"
          >
            <MoreVertical size={16} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-9 z-20 w-48 bg-white rounded-xl2 shadow-pop border border-sky-100 py-1.5 animate-enter">

              <MenuItem
                icon={User}
                label="View Profile"
                onClick={() => {
                  setMenuOpen(false);
                  pushToast(
                    `Viewing ${friend?.name || "User"}'s profile`
                  );
                }}
              />

              <MenuItem
                icon={Eye}
                label="View Weather"
                onClick={() => {
                  setMenuOpen(false);

                  if (weatherShared) {
                    pushToast(
                      `${friend?.name || "User"}'s weather is available`
                    );
                  } else {
                    pushToast(
                      `${friend?.name || "User"}'s weather is not shared`,
                      "error"
                    );
                  }
                }}
              />

              <MenuItem
                icon={RefreshCw}
                label="Compare Weather"
                onClick={() => {
                  setMenuOpen(false);
                  onCompare?.(friend);
                }}
              />

              <MenuItem
                icon={UserMinus}
                label="Remove Friend"
                onClick={() => {
                  setMenuOpen(false);
                  removeFriend(friend?.id);
                }}
              />

              <MenuItem
                icon={ShieldOff}
                label="Block User"
                tone="danger"
                onClick={() => {
                  setMenuOpen(false);
                  onBlock?.(friend);
                }}
              />

            </div>
          )}

        </div>
      </div>

      {/* Friend Weather */}
      {weatherShared ? (
        <div className="rounded-xl2 bg-sky-50 px-4 py-3 flex items-center gap-3">

          {/* Weather Icon */}
          <span className="text-2xl leading-none">
            {weatherIcon?.[weather.icon] || "🌤️"}
          </span>

          {/* Weather Details */}
          <div className="flex-1 min-w-0">

            <p className="text-sm font-semibold text-ink-800">
              {weather.condition || "Current Weather"}
            </p>

            {weather.humidity !== undefined && (
              <p className="text-xs text-ink-400">
                Humidity {weather.humidity}%
              </p>
            )}

            {locationText && (
              <p className="text-xs text-ink-400 truncate">
                {locationText}
              </p>
            )}

          </div>

          {/* Temperature */}
          <p className="text-xl font-display font-bold text-ink-900">
            {temperature !== undefined
              ? `${temperature}°`
              : "--"}
          </p>

        </div>
      ) : (
        /* Weather Not Shared */
        <div className="rounded-xl2 bg-ink-50 px-4 py-3.5 flex items-center gap-2.5 text-ink-400">

          <Lock size={14} />

          <div>
            <p className="text-sm font-medium text-ink-500">
              Weather Not Shared
            </p>

            <p className="text-xs">
              {(friend?.name || "This user").split(" ")[0]}
              {" hasn't shared weather data yet."}
            </p>
          </div>

        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">

        <button
          onClick={() => {
            if (weatherShared) {
              pushToast(
                `Showing ${friend?.name || "User"}'s weather`
              );
            } else {
              pushToast(
                `${friend?.name || "User"}'s weather is not shared`,
                "error"
              );
            }
          }}
          className="flex-1 text-sm font-medium py-2 rounded-xl2 bg-sky-50 text-sky-700 hover:bg-sky-100 transition-colors"
        >
          View Weather
        </button>

        <button
          onClick={() => onCompare?.(friend)}
          className="flex-1 text-sm font-medium py-2 rounded-xl2 bg-sky-500 text-white hover:bg-sky-600 transition-colors"
        >
          Compare
        </button>

      </div>

    </div>
  );
}

function MenuItem({ icon: Icon, label, onClick, tone }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-sm hover:bg-sky-50 transition-colors ${
        tone === "danger"
          ? "text-red-500 hover:bg-red-50"
          : "text-ink-700"
      }`}
    >
      <Icon size={15} />
      {label}
    </button>
  );
}
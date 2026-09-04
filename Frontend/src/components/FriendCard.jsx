import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MoreVertical, Lock, MapPin, User, Eye, RefreshCw, UserMinus, ShieldOff } from "lucide-react";
import { weatherIcon } from "../data/mockData";
import { useApp } from "../context/AppContext";

export default function FriendCard({ friend, onCompare, onBlock }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const { removeFriend, pushToast } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    function onClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const initials = friend.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");

  return (
    <div className="rounded-xl2 bg-white shadow-card p-5 flex flex-col gap-4 animate-enter">
      <div className="flex items-start gap-3">
        <div className="h-11 w-11 rounded-full bg-sky-100 text-sky-700 font-display font-semibold flex items-center justify-center text-sm shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-ink-800 truncate">{friend.name}</p>
          <p className="text-xs text-ink-400">@{friend.username}</p>
          <p className="text-xs text-ink-400 flex items-center gap-1 mt-0.5">
            <MapPin size={11} /> {friend.location} · {friend.distanceKm} km away
          </p>
        </div>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="h-8 w-8 rounded-full flex items-center justify-center text-ink-400 hover:bg-sky-50 hover:text-ink-700 transition-colors"
          >
            <MoreVertical size={16} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-9 z-20 w-48 bg-white rounded-xl2 shadow-pop border border-sky-100 py-1.5 animate-enter">
              <MenuItem icon={User} label="View Profile" onClick={() => { setMenuOpen(false); pushToast(`Viewing ${friend.name}'s profile`); }} />
              <MenuItem icon={Eye} label="View Weather" onClick={() => { setMenuOpen(false); pushToast(`${friend.name}'s weather refreshed`); }} />
              <MenuItem icon={RefreshCw} label="Compare Weather" onClick={() => { setMenuOpen(false); onCompare?.(friend); }} />
              <MenuItem icon={UserMinus} label="Remove Friend" onClick={() => { setMenuOpen(false); removeFriend(friend.id); }} />
              <MenuItem icon={ShieldOff} label="Block User" tone="danger" onClick={() => { setMenuOpen(false); onBlock?.(friend); }} />
            </div>
          )}
        </div>
      </div>

      {friend.weatherSharing && friend.weather ? (
        <div className="rounded-xl2 bg-sky-50 px-4 py-3 flex items-center gap-3">
          <span className="text-2xl leading-none">{weatherIcon[friend.weather.icon]}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-ink-800">{friend.weather.condition}</p>
            <p className="text-xs text-ink-400">Humidity {friend.weather.humidity}%</p>
          </div>
          <p className="text-xl font-display font-bold text-ink-900">{friend.weather.temp}°</p>
        </div>
      ) : (
        <div className="rounded-xl2 bg-ink-50 px-4 py-3.5 flex items-center gap-2.5 text-ink-400">
          <Lock size={14} />
          <div>
            <p className="text-sm font-medium text-ink-500">Weather Not Shared</p>
            <p className="text-xs">{friend.name.split(" ")[0]} hasn't enabled weather sharing.</p>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => pushToast(`Showing ${friend.name}'s weather`)}
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
        tone === "danger" ? "text-red-500 hover:bg-red-50" : "text-ink-700"
      }`}
    >
      <Icon size={15} />
      {label}
    </button>
  );
}

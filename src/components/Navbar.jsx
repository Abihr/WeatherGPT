import { useNavigate } from "react-router-dom";
import { CloudSun, Bell } from "lucide-react";
import { useApp } from "../context/AppContext";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

export default function Navbar() {
  const { user, alerts } = useApp();
  const navigate = useNavigate();

  return (
    <header className="md:hidden sticky top-0 z-30 bg-white/85 backdrop-blur-sm border-b border-sky-100 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="h-8 w-8 rounded-xl bg-hero-gradient flex items-center justify-center">
          <CloudSun size={16} className="text-white" />
        </span>
        <div>
          <p className="text-[11px] text-ink-400 leading-none">{greeting()}</p>
          <p className="text-sm font-display font-bold text-ink-900 leading-tight">{user.name}</p>
        </div>
      </div>
      <button
        onClick={() => navigate("/alerts")}
        className="relative h-9 w-9 rounded-full bg-sky-50 flex items-center justify-center text-ink-500 hover:bg-sky-100 transition-colors"
      >
        <Bell size={16} />
        {alerts.length > 0 && (
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-sun-500" />
        )}
      </button>
    </header>
  );
}

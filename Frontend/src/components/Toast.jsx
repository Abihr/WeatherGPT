import { Check, X, AlertTriangle } from "lucide-react";
import { useApp } from "../context/AppContext";

const toneStyles = {
  success: { icon: Check, bg: "bg-ink-900", iconBg: "bg-sky-400" },
  error: { icon: AlertTriangle, bg: "bg-ink-900", iconBg: "bg-sun-500" },
};

export default function ToastStack() {
  const { toasts, dismissToast } = useApp();
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-[min(92vw,360px)]">
      {toasts.map((t) => {
        const style = toneStyles[t.tone] || toneStyles.success;
        const Icon = style.icon;
        return (
          <div
            key={t.id}
            className={`${style.bg} text-white rounded-full pl-2 pr-4 py-2 flex items-center gap-2.5 shadow-pop animate-enter`}
          >
            <span className={`${style.iconBg} h-6 w-6 rounded-full flex items-center justify-center shrink-0`}>
              <Icon size={13} strokeWidth={3} className="text-ink-900" />
            </span>
            <span className="text-sm font-medium flex-1">{t.message}</span>
            <button onClick={() => dismissToast(t.id)} className="text-white/50 hover:text-white transition-colors">
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

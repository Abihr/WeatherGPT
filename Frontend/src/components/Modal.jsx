import { X } from "lucide-react";

export default function Modal({ open, onClose, title, children, maxWidth = "max-w-sm" }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-ink-900/40 backdrop-blur-[2px]" onClick={onClose} />
      <div
        className={`relative w-full ${maxWidth} bg-white rounded-t-xl3 sm:rounded-xl3 shadow-pop p-6 animate-enter max-h-[85vh] overflow-y-auto`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-lg text-ink-900">{title}</h3>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full flex items-center justify-center text-ink-400 hover:bg-sky-50 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function EmptyState({ icon = "🌤️", title, message, action }) {
  return (
    <div className="flex flex-col items-center text-center py-14 px-6 rounded-xl2 bg-white/60 border border-dashed border-sky-200 animate-enter">
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="text-ink-800 font-display font-semibold text-base mb-1">{title}</h3>
      {message && <p className="text-ink-400 text-sm max-w-xs">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

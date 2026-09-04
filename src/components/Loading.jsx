export function WeatherCardSkeleton() {
  return (
    <div className="rounded-xl3 p-6 bg-white shadow-card">
      <div className="skeleton h-4 w-24 rounded-full mb-4" />
      <div className="skeleton h-12 w-28 rounded-lg mb-3" />
      <div className="skeleton h-4 w-36 rounded-full mb-6" />
      <div className="grid grid-cols-3 gap-3">
        <div className="skeleton h-14 rounded-xl2" />
        <div className="skeleton h-14 rounded-xl2" />
        <div className="skeleton h-14 rounded-xl2" />
      </div>
    </div>
  );
}

export function FriendCardSkeleton() {
  return (
    <div className="rounded-xl2 p-5 bg-white shadow-card">
      <div className="flex items-center gap-3 mb-4">
        <div className="skeleton h-11 w-11 rounded-full" />
        <div className="flex-1">
          <div className="skeleton h-3.5 w-28 rounded-full mb-2" />
          <div className="skeleton h-3 w-20 rounded-full" />
        </div>
      </div>
      <div className="skeleton h-16 rounded-xl2" />
    </div>
  );
}

export default function Loading({ label = "Loading" }) {
  return (
    <div className="flex items-center justify-center gap-2 py-10 text-ink-400 text-sm">
      <span className="h-2 w-2 rounded-full bg-sky-400 animate-bounce [animation-delay:-0.2s]" />
      <span className="h-2 w-2 rounded-full bg-sky-400 animate-bounce [animation-delay:-0.1s]" />
      <span className="h-2 w-2 rounded-full bg-sky-400 animate-bounce" />
      <span className="ml-1">{label}</span>
    </div>
  );
}

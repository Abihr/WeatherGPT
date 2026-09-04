import { useApp } from "../context/AppContext";

const OPTIONS = [
  { value: "off", label: "Don't Share", desc: "Friends won't see your location." },
  { value: "approximate", label: "Approximate Location", desc: "Shows your general area, not the exact point." },
  { value: "exact", label: "Exact Location", desc: "Shows your precise location on the map." },
];

export default function LocationSharing() {
  const { user, updateLocationSharing } = useApp();

  return (
    <div className="rounded-xl2 bg-white shadow-card p-5">
      <h3 className="font-display font-semibold text-ink-900 mb-1">Location Sharing</h3>
      <p className="text-sm text-ink-400 mb-4">Your location is only shared with accepted friends.</p>

      <div className="flex flex-col gap-2.5">
        {OPTIONS.map((opt) => (
          <label
            key={opt.value}
            className={`flex items-start gap-3 p-3 rounded-xl2 border cursor-pointer transition-colors ${
              user.locationSharing === opt.value ? "border-sky-300 bg-sky-50" : "border-sky-100 hover:bg-sky-50/60"
            }`}
          >
            <input
              type="radio"
              name="locationSharing"
              className="mt-1 accent-sky-500"
              checked={user.locationSharing === opt.value}
              onChange={() => updateLocationSharing(opt.value)}
            />
            <div>
              <p className="text-sm font-medium text-ink-800">{opt.label}</p>
              <p className="text-xs text-ink-400">{opt.desc}</p>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}

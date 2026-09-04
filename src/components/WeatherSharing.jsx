import { useApp } from "../context/AppContext";

const FIELDS = ["Temperature", "Weather Condition", "Humidity", "Wind", "Rain Probability", "Weather Alerts"];

export default function WeatherSharing() {
  const { user, updateWeatherSharing } = useApp();

  return (
    <div className="rounded-xl2 bg-white shadow-card p-5">
      <h3 className="font-display font-semibold text-ink-900 mb-1">Weather Sharing</h3>
      <p className="text-sm text-ink-400 mb-4">Share your current weather information with your friends.</p>

      <div className="flex items-center justify-between py-3 border-y border-sky-50">
        <span className="text-sm font-medium text-ink-700">Share My Weather</span>
        <Toggle checked={user.weatherSharing} onChange={updateWeatherSharing} />
      </div>

      <div className={`mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5 transition-opacity ${user.weatherSharing ? "opacity-100" : "opacity-40 pointer-events-none"}`}>
        {FIELDS.map((f) => (
          <div key={f} className="flex items-center gap-2 text-sm text-ink-600">
            <span className="h-4 w-4 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center text-[10px] font-bold">✓</span>
            {f}
          </div>
        ))}
      </div>
    </div>
  );
}

export function Toggle({ checked, onChange }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`w-11 h-6 rounded-full flex items-center px-0.5 transition-colors ${checked ? "bg-sky-500 justify-end" : "bg-ink-100 justify-start"}`}
    >
      <span className="h-5 w-5 rounded-full bg-white shadow-sm transition-transform" />
    </button>
  );
}

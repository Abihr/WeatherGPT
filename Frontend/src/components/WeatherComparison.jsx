import { weatherIcon } from "../data/mockData";

function Delta({ label, icon, you, friend, unit, higherIsMore = true }) {
  const diff = friend - you;
  const positive = diff >= 0;
  const max = Math.max(you, friend, 1);
  const youPct = Math.max((you / max) * 100, 4);
  const friendPct = Math.max((friend / max) * 100, 4);

  return (
    <div className="py-3">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm text-ink-600 flex items-center gap-1.5">
          <span>{icon}</span> {label}
        </span>
        <span className={`text-sm font-semibold ${positive ? "text-sky-600" : "text-ink-400"}`}>
          {positive ? "+" : ""}
          {diff}
          {unit}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 rounded-full bg-sky-100 overflow-hidden">
          <div className="h-full bg-ink-300 rounded-full" style={{ width: `${youPct}%`, backgroundColor: "#9BB2C9" }} />
        </div>
        <div className="flex-1 h-2 rounded-full bg-sky-100 overflow-hidden">
          <div className="h-full bg-sky-500 rounded-full" style={{ width: `${friendPct}%` }} />
        </div>
      </div>
    </div>
  );
}

export default function WeatherComparison({ you, youLabel, friend, friendLabel }) {
  const tempDiff = friend.weather.temp - you.weather.temp;
  const warmer = tempDiff === 0 ? null : tempDiff > 0;

  return (
    <div className="rounded-xl3 bg-white shadow-card p-6 animate-enter">
      <h3 className="font-display font-bold text-lg text-ink-900 mb-5">Compare Weather</h3>

      <div className="grid grid-cols-2 gap-3 mb-2">
        <div className="rounded-xl2 bg-sky-50 p-4 text-center">
          <p className="text-xs font-semibold text-ink-500 uppercase tracking-wide mb-1">{youLabel}</p>
          <p className="text-xs text-ink-400 mb-2">{you.location}</p>
          <p className="text-3xl mb-1">{weatherIcon[you.weather.icon]}</p>
          <p className="text-2xl font-display font-bold text-ink-900">{you.weather.temp}°C</p>
        </div>
        <div className="rounded-xl2 bg-hero-gradient p-4 text-center text-white">
          <p className="text-xs font-semibold text-sky-50 uppercase tracking-wide mb-1">{friendLabel}</p>
          <p className="text-xs text-sky-100 mb-2">{friend.location}</p>
          <p className="text-3xl mb-1">{weatherIcon[friend.weather.icon]}</p>
          <p className="text-2xl font-display font-bold">{friend.weather.temp}°C</p>
        </div>
      </div>

      {warmer !== null && (
        <p className="text-center text-sm text-ink-500 my-4">
          {friendLabel}'s area is <span className="font-semibold text-ink-800">{Math.abs(tempDiff)}°C {warmer ? "warmer" : "cooler"}</span>
        </p>
      )}

      <div className="flex items-center gap-4 text-xs text-ink-400 mb-1 px-0.5">
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: "#9BB2C9" }} /> {youLabel}</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-sky-500" /> {friendLabel}</span>
      </div>

      <div className="divide-y divide-sky-50">
        <Delta label="Temperature" icon="🌡️" you={you.weather.temp} friend={friend.weather.temp} unit="°C" />
        <Delta label="Humidity" icon="💧" you={you.weather.humidity} friend={friend.weather.humidity} unit="%" />
        <Delta label="Wind" icon="💨" you={you.weather.wind} friend={friend.weather.wind} unit=" km/h" />
        <Delta label="Rain Probability" icon="🌧️" you={you.weather.rain} friend={friend.weather.rain} unit="%" />
      </div>
    </div>
  );
}

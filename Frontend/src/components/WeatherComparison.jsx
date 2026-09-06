
import { weatherIcon } from "../data/mockData";

function getLocationText(location) {
  if (!location) return "Unknown location";

  if (typeof location === "string") {
    return location;
  }

  if (location.locationName) {
    return location.locationName;
  }

  if (location.name) {
    return location.name;
  }

  if (
    typeof location.lat === "number" &&
    typeof location.lng === "number"
  ) {
    return `${location.lat.toFixed(2)}, ${location.lng.toFixed(2)}`;
  }

  return "Unknown location";
}

function Delta({
  label,
  icon,
  you,
  friend,
  unit,
}) {
  const youValue = Number(you) || 0;
  const friendValue = Number(friend) || 0;

  const diff = friendValue - youValue;
  const positive = diff >= 0;

  const max = Math.max(youValue, friendValue, 1);

  const youPct = Math.max((youValue / max) * 100, 4);
  const friendPct = Math.max((friendValue / max) * 100, 4);

  return (
    <div className="py-3">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm text-ink-600 flex items-center gap-1.5">
          <span>{icon}</span>
          {label}
        </span>

        <span
          className={`text-sm font-semibold ${
            positive ? "text-sky-600" : "text-ink-400"
          }`}
        >
          {positive ? "+" : ""}
          {diff}
          {unit}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {/* Your value */}
        <div className="flex-1 h-2 rounded-full bg-sky-100 overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              width: `${youPct}%`,
              backgroundColor: "#9BB2C9",
            }}
          />
        </div>

        {/* Friend value */}
        <div className="flex-1 h-2 rounded-full bg-sky-100 overflow-hidden">
          <div
            className="h-full bg-sky-500 rounded-full"
            style={{
              width: `${friendPct}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default function WeatherComparison({
  you,
  youLabel,
  friend,
  friendLabel,
}) {
  const yourWeather = you?.weather || {};
  const friendWeather = friend?.weather || {};

  // Firebase uses "temperature", not "temp"
  const yourTemperature = Number(yourWeather.temperature) || 0;
  const friendTemperature = Number(friendWeather.temperature) || 0;

  const tempDiff = friendTemperature - yourTemperature;

  const warmer =
    tempDiff === 0 ? null : tempDiff > 0;

  const yourIcon =
    weatherIcon?.[yourWeather.icon] || "🌤️";

  const friendIcon =
    weatherIcon?.[friendWeather.icon] || "🌤️";

  return (
    <div className="rounded-xl3 bg-white shadow-card p-6 animate-enter">
      <h3 className="font-display font-bold text-lg text-ink-900 mb-5">
        Compare Weather
      </h3>

      {/* Weather cards */}
      <div className="grid grid-cols-2 gap-3 mb-2">
        {/* You */}
        <div className="rounded-xl2 bg-sky-50 p-4 text-center">
          <p className="text-xs font-semibold text-ink-500 uppercase tracking-wide mb-1">
            {youLabel}
          </p>

          <p className="text-xs text-ink-400 mb-2">
            {getLocationText(you?.location)}
          </p>

          <p className="text-3xl mb-1">
            {yourIcon}
          </p>

          <p className="text-2xl font-display font-bold text-ink-900">
            {yourTemperature}°C
          </p>
        </div>

        {/* Friend */}
        <div className="rounded-xl2 bg-hero-gradient p-4 text-center text-white">
          <p className="text-xs font-semibold text-sky-50 uppercase tracking-wide mb-1">
            {friendLabel}
          </p>

          <p className="text-xs text-sky-100 mb-2">
            {getLocationText(friend?.location)}
          </p>

          <p className="text-3xl mb-1">
            {friendIcon}
          </p>

          <p className="text-2xl font-display font-bold">
            {friendTemperature}°C
          </p>
        </div>
      </div>

      {/* Temperature difference */}
      {warmer !== null && (
        <p className="text-center text-sm text-ink-500 my-4">
          {friendLabel}'s area is{" "}
          <span className="font-semibold text-ink-800">
            {Math.abs(tempDiff)}°C{" "}
            {warmer ? "warmer" : "cooler"}
          </span>
        </p>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-ink-400 mb-1 px-0.5">
        <span className="flex items-center gap-1.5">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: "#9BB2C9" }}
          />
          {youLabel}
        </span>

        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-sky-500" />
          {friendLabel}
        </span>
      </div>

      {/* Comparison rows */}
      <div className="divide-y divide-sky-50">
        <Delta
          label="Temperature"
          icon="🌡️"
          you={yourTemperature}
          friend={friendTemperature}
          unit="°C"
        />

        <Delta
          label="Humidity"
          icon="💧"
          you={yourWeather.humidity}
          friend={friendWeather.humidity}
          unit="%"
        />

        <Delta
          label="Wind"
          icon="💨"
          you={yourWeather.wind}
          friend={friendWeather.wind}
          unit=" km/h"
        />

        <Delta
          label="Rain Probability"
          icon="🌧️"
          you={yourWeather.rain}
          friend={friendWeather.rain}
          unit="%"
        />
      </div>
    </div>
  );
}


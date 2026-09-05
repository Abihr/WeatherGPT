import { Droplets, Wind, CloudRain, MapPin } from "lucide-react";
import { weatherIcon } from "../data/mockData";

export default function WeatherCard({
  location,
  weather,
  size = "hero",
  locating,
}) {
  if (locating) {
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

  if (!weather) return null;

  // Firestore may store temperature as either `temperature` or `temp`
  const temperature = weather.temperature ?? weather.temp ?? "--";

  // Convert Firestore location object into a readable string
  const locationText =
    typeof location === "string"
      ? location
      : location?.city ||
        weather?.locationName ||
        "Unknown location";

  const icon = weatherIcon[weather.icon] || "🌤️";

  if (size === "compact") {
    return (
      <div className="rounded-xl2 bg-sky-50 px-4 py-3 flex items-center gap-3">
        <span className="text-2xl leading-none">{icon}</span>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-ink-800">
            {weather.condition || "Unknown"}
          </p>

          <p className="text-xs text-ink-400">
            Humidity {weather.humidity ?? "--"}% · Wind{" "}
            {weather.wind ?? "--"} km/h
          </p>
        </div>

        <p className="text-xl font-display font-bold text-ink-900">
          {temperature}°
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl3 p-6 sm:p-7 bg-hero-gradient text-white shadow-pop relative overflow-hidden animate-enter">
      <div className="absolute -right-8 -top-10 text-[160px] opacity-15 leading-none select-none">
        {icon}
      </div>

      <div className="relative">
        {/* Location */}
        <p className="flex items-center gap-1 text-sm text-sky-100 font-medium mb-4">
          <MapPin size={14} />
          {locationText}
        </p>

        {/* Temperature */}
        <div className="flex items-end gap-4 mb-1">
          <span className="text-6xl leading-none">{icon}</span>

          <span className="text-6xl font-display font-extrabold leading-none tracking-tight">
            {temperature}
            <span className="text-3xl align-top">°C</span>
          </span>
        </div>

        {/* Condition */}
        <p className="text-lg font-medium text-sky-50 mt-2">
          {weather.condition || "Unknown"}
        </p>

        {/* Feels Like */}
        <p className="text-sm text-sky-100/90">
          Feels like {weather.feelsLike ?? "--"}°C
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mt-6">
          <Stat
            icon={Droplets}
            label="Humidity"
            value={`${weather.humidity ?? "--"}%`}
          />

          <Stat
            icon={Wind}
            label="Wind"
            value={`${weather.wind ?? "--"} km/h`}
          />

          <Stat
            icon={CloudRain}
            label="Rain"
            value={`${weather.rain ?? 0}%`}
          />
        </div>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl2 bg-white/15 backdrop-blur-sm px-3 py-2.5 text-center">
      <Icon
        size={15}
        className="mx-auto mb-1 text-sky-50"
      />

      <p className="text-sm font-semibold leading-none">
        {value}
      </p>

      <p className="text-[10px] text-sky-100/80 mt-1">
        {label}
      </p>
    </div>
  );
}
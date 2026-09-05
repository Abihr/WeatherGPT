import { useNavigate } from "react-router-dom";

import { MapPin, RefreshCw } from "lucide-react";

import { useApp } from "../context/AppContext";

import WeatherCard from "../components/WeatherCard";

import { weatherIcon } from "../data/mockData";

import EmptyState from "../components/EmptyState";

function greeting() {
  const h = new Date().getHours();

  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";

  return "Good Evening";
}

export default function Home() {
  const {
    user,
    friendsList,
    detectLocation,
    locating,
  } = useApp();

  const navigate = useNavigate();

  const nearby = [...friendsList]
    .sort(
      (a, b) =>
        a.distanceKm - b.distanceKm
    )
    .slice(0, 4);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 pb-28 md:pb-10 flex flex-col gap-6">

      {/* ------------------------------------------------ */}
      {/* DESKTOP GREETING */}
      {/* ------------------------------------------------ */}

      <div className="hidden md:flex items-center justify-between">
        <div>
          <p className="text-sm text-ink-400">
            {greeting()},
          </p>

          <h1 className="text-2xl font-display font-extrabold text-ink-900">
            {user?.name || "User"}
          </h1>
        </div>

        <button
          onClick={detectLocation}
          disabled={locating}
          className="flex items-center gap-2 text-sm font-medium text-sky-600 bg-sky-50 px-4 py-2 rounded-full hover:bg-sky-100 transition-colors disabled:opacity-60"
        >
          <RefreshCw
            size={14}
            className={
              locating ? "animate-spin" : ""
            }
          />

          Refresh location
        </button>
      </div>

      {/* ------------------------------------------------ */}
      {/* YOUR WEATHER */}
      {/* ------------------------------------------------ */}

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-semibold text-ink-800">
            Your Weather
          </h2>

          <button
            onClick={detectLocation}
            disabled={locating}
            className="md:hidden flex items-center gap-1 text-xs font-medium text-sky-600 disabled:opacity-60"
          >
            <RefreshCw
              size={12}
              className={
                locating ? "animate-spin" : ""
              }
            />

            Refresh
          </button>
        </div>

        <WeatherCard
          location={
            user?.location || "Your Location"
          }
          weather={user?.weather}
          locating={locating}
        />
      </div>

      {/* ------------------------------------------------ */}
      {/* FRIENDS NEARBY */}
      {/* ------------------------------------------------ */}

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-semibold text-ink-800">
            Friends Nearby
          </h2>

          <button
            onClick={() => navigate("/map")}
            className="text-xs font-medium text-sky-600 hover:text-sky-700"
          >
            View map
          </button>
        </div>

        {nearby.length === 0 ? (
          <EmptyState
            icon="🧭"
            title="No nearby friends"
            message="Add friends to see how the weather looks around you."
          />
        ) : (
          <div className="flex flex-col gap-3">

            {nearby.map((f) => (
              <div
                key={f.id}
                className="rounded-xl2 bg-white shadow-card p-4 flex items-center gap-3 animate-enter"
              >

                {/* FRIEND AVATAR */}
                <div className="h-11 w-11 rounded-full bg-sky-100 text-sky-700 font-display font-semibold flex items-center justify-center text-sm shrink-0">
                  {f.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("") || "U"}
                </div>

                {/* FRIEND INFORMATION */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-ink-800 truncate">
                    {f.name || "User"}
                  </p>

                  <p className="text-xs text-ink-400 flex items-center gap-1">
                    <MapPin size={11} />

                    {f.location || "Unknown location"}

                    {" · "}

                    {f.distanceKm ?? "--"} km away
                  </p>
                </div>

                {/* FRIEND WEATHER */}
                {f.weatherSharing &&
                f.weather ? (
                  <div className="text-right shrink-0">
                    <p className="text-lg leading-none">
                      {weatherIcon[
                        f.weather.icon
                      ] || "🌤️"}{" "}
                      {f.weather.temp}°C
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-ink-400 shrink-0">
                    🔒 Hidden
                  </p>
                )}

                {/* VIEW FRIEND */}
                <button
                  onClick={() =>
                    navigate("/friends")
                  }
                  className="text-xs font-medium px-3 py-1.5 rounded-full bg-sky-50 text-sky-700 hover:bg-sky-100 transition-colors shrink-0"
                >
                  View
                </button>

              </div>
            ))}

          </div>
        )}
      </div>

    </div>
  );
}
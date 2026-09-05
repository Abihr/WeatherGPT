import { useApp } from "../context/AppContext";
import WeatherMap from "../components/WeatherMap";

export default function MapPage() {
  const { user, friendsList } = useApp();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-28 md:pb-10 flex flex-col gap-4">

      {/* HEADER */}
      <div>
        <h1 className="text-xl md:text-2xl font-display font-extrabold text-ink-900">
          Friends Map
        </h1>

        <p className="text-sm text-ink-400 mt-0.5">
          See where your friends are and what the weather looks like there.
        </p>
      </div>

      {/* FRIENDS MAP */}
      <WeatherMap
        user={user}
        friends={friendsList}
      />

    </div>
  );
}
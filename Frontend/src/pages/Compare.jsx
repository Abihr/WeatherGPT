import { useLocation } from "react-router-dom";
import { useMemo, useState } from "react";
import { useApp } from "../context/AppContext";
import WeatherComparison from "../components/WeatherComparison";
import EmptyState from "../components/EmptyState";

export default function Compare() {
  const { user, friendsList } = useApp();
  const routerLocation = useLocation();
  const shareable = friendsList.filter((f) => f.weatherSharing && f.weather);

  const [friendId, setFriendId] = useState(
    routerLocation.state?.friendId || shareable[0]?.id || ""
  );

  const friend = useMemo(() => friendsList.find((f) => f.id === friendId), [friendsList, friendId]);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 pb-28 md:pb-10 flex flex-col gap-5">
      <h1 className="text-xl md:text-2xl font-display font-extrabold text-ink-900">Compare Weather</h1>

      {shareable.length === 0 ? (
        <EmptyState
          icon="🔄"
          title="Nothing to compare yet"
          message="Once a friend enables weather sharing, you can compare conditions here."
        />
      ) : (
        <>
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            {shareable.map((f) => (
              <button
                key={f.id}
                onClick={() => setFriendId(f.id)}
                className={`shrink-0 text-sm font-medium px-4 py-2 rounded-full border transition-colors ${
                  friendId === f.id
                    ? "bg-sky-500 text-white border-sky-500"
                    : "bg-white text-ink-600 border-sky-100 hover:bg-sky-50"
                }`}
              >
                {f.name}
              </button>
            ))}
          </div>

          {friend && (
            <WeatherComparison
              you={{ location: user.location, weather: user.weather }}
              youLabel="You"
              friend={{ location: friend.location, weather: friend.weather }}
              friendLabel={friend.name.split(" ")[0]}
            />
          )}
        </>
      )}
    </div>
  );
}

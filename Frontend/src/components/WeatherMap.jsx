import { useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { X, MapPin } from "lucide-react";
import { weatherIcon } from "../data/mockData";

function pin(label, tone) {
  const bg = tone === "you" ? "#3874B8" : "#4A90D9";
  return L.divIcon({
    className: "",
    html: `<div style="
      background:${bg};color:white;width:38px;height:38px;border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;
      box-shadow:0 6px 14px rgba(34,73,111,0.35);border:2px solid white;">
      <span style="transform:rotate(45deg);font-size:16px;line-height:1;">${label}</span>
    </div>`,
    iconSize: [38, 38],
    iconAnchor: [19, 36],
  });
}

function FlyTo({ position }) {
  const map = useMap();
  if (position) map.setView(position, map.getZoom() < 8 ? 9 : map.getZoom());
  return null;
}

export default function WeatherMap({ user, friends, radiusKm = 5 }) {
  const [selected, setSelected] = useState(null);
  const [radiusOnly, setRadiusOnly] = useState(false);

  const center = [user.latitude, user.longitude];

  const visibleFriends = useMemo(
    () => (radiusOnly ? friends.filter((f) => f.distanceKm <= radiusKm) : friends),
    [friends, radiusOnly, radiusKm]
  );

  return (
    <div className="relative rounded-xl3 overflow-hidden shadow-card h-[420px] sm:h-[520px] w-full">
      <MapContainer center={center} zoom={9} scrollWheelZoom className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FlyTo position={selected ? [selected.latitude ?? center[0], selected.longitude ?? center[1]] : null} />

        <Marker position={center} icon={pin("👤", "you")} eventHandlers={{ click: () => setSelected({ ...user, isYou: true }) }} />
        {user.locationSharing !== "exact" && (
          <Circle center={center} radius={4000} pathOptions={{ color: "#4A90D9", fillOpacity: 0.08, weight: 1 }} />
        )}

        {visibleFriends.map((f) => {
          // Spread friends around the user's location for map demo purposes.
          const angle = (f.id.charCodeAt(f.id.length - 1) * 37) % 360;
          const dist = Math.min(f.distanceKm, 40) / 400;
          const lat = center[0] + dist * Math.cos((angle * Math.PI) / 180);
          const lng = center[1] + dist * Math.sin((angle * Math.PI) / 180);
          return (
            <Marker
              key={f.id}
              position={[lat, lng]}
              icon={pin("👥", "friend")}
              eventHandlers={{ click: () => setSelected({ ...f, latitude: lat, longitude: lng }) }}
            />
          );
        })}
      </MapContainer>

      <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-[400]">
        <span className="bg-white/95 backdrop-blur-sm text-xs font-medium text-ink-600 px-3 py-1.5 rounded-full shadow-card">
          {visibleFriends.length} friend{visibleFriends.length !== 1 ? "s" : ""} shown
        </span>
        <button
          onClick={() => setRadiusOnly((v) => !v)}
          className={`text-xs font-semibold px-3 py-1.5 rounded-full shadow-card transition-colors ${
            radiusOnly ? "bg-sky-500 text-white" : "bg-white/95 text-ink-600"
          }`}
        >
          {radiusKm} km radius
        </button>
      </div>

      {selected && (
        <div className="absolute bottom-3 left-3 right-3 z-[400] bg-white rounded-xl2 shadow-pop p-4 flex items-start gap-3 animate-enter">
          <div className="h-10 w-10 rounded-full bg-sky-100 text-sky-700 font-display font-semibold flex items-center justify-center text-sm shrink-0">
            {selected.isYou ? "You" : selected.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-ink-800">{selected.isYou ? "Your Location" : selected.name}</p>
            <p className="text-xs text-ink-400 flex items-center gap-1">
              <MapPin size={11} /> {selected.location} {!selected.isYou && `· ${selected.distanceKm} km away`}
            </p>
            {selected.weather && (selected.isYou || selected.weatherSharing) ? (
              <p className="text-sm mt-1.5">
                {weatherIcon[selected.weather.icon]} {selected.weather.temp}°C · {selected.weather.condition}
              </p>
            ) : (
              <p className="text-xs mt-1.5 text-ink-400">🔒 Weather not shared</p>
            )}
          </div>
          <button onClick={() => setSelected(null)} className="text-ink-400 hover:text-ink-700 transition-colors">
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

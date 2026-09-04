// Weather API integration point.
//
// Swap WEATHER_API_KEY / BASE_URL for a real provider (OpenWeatherMap,
// WeatherAPI, Tomorrow.io, etc.) and replace the body of getCurrentWeather
// with a fetch/axios call. Until then this returns randomized-but-plausible
// data so the UI has something to render.

import { weatherIcon } from "../data/mockData";

const WEATHER_API_KEY = "YOUR_WEATHER_API_KEY";
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

const CONDITIONS = [
  { icon: "sunny", condition: "Sunny" },
  { icon: "partly-cloudy", condition: "Partly Cloudy" },
  { icon: "cloudy", condition: "Cloudy" },
  { icon: "rain", condition: "Light Rain" },
];

/**
 * Fetch current weather for a lat/lng pair.
 * Real implementation:
 *   const res = await axios.get(BASE_URL, { params: { lat, lon: lng, appid: WEATHER_API_KEY, units: "metric" } });
 *   return normalizeResponse(res.data);
 */
export async function getCurrentWeather(latitude, longitude) {
  await new Promise((r) => setTimeout(r, 600));
  const pick = CONDITIONS[Math.floor(Math.random() * CONDITIONS.length)];
  const temp = Math.round(22 + Math.random() * 10);
  return {
    icon: pick.icon,
    condition: pick.condition,
    temp,
    feelsLike: temp + Math.round(Math.random() * 3),
    humidity: Math.round(55 + Math.random() * 30),
    wind: Math.round(5 + Math.random() * 15),
    rain: Math.round(Math.random() * 80),
  };
}

export function iconFor(key) {
  return weatherIcon[key] || "🌤️";
}

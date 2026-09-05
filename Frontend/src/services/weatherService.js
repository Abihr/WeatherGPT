import { weatherIcon } from "../data/mockData";

export async function getCurrentWeather(latitude, longitude) {
  const response = await fetch(
    `http://localhost:5000/api/weather?lat=${latitude}&lon=${longitude}`
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    throw new Error(
      errorData.error || "Failed to fetch weather"
    );
  }

  const data = await response.json();

  return {
    // Weather information
    icon: mapWeatherIcon(data.weather?.[0]?.main),
    condition: data.weather?.[0]?.description || "Unknown",
    temp: Math.round(data.main?.temp ?? 0),
    feelsLike: Math.round(data.main?.feels_like ?? 0),
    humidity: data.main?.humidity ?? 0,

    // OpenWeather wind speed is m/s → km/h
    wind: Math.round((data.wind?.speed ?? 0) * 3.6),

    // Rain in last 1 hour
    rain: data.rain?.["1h"] || 0,

    // Location
    locationName: data.name || "Unknown location",
    country: data.sys?.country || "",
  };
}

function mapWeatherIcon(condition) {
  const value = condition?.toLowerCase() || "";

  if (value.includes("clear")) return "sunny";
  if (value.includes("cloud")) return "partly-cloudy";
  if (value.includes("rain")) return "rain";
  if (value.includes("storm") || value.includes("thunder")) return "rain";

  return "cloudy";
}

export function iconFor(key) {
  return weatherIcon[key] || "🌤️";
}
import { weatherIcon } from "../data/mockData";

export async function getCurrentWeather(latitude, longitude) {
  const response = await fetch(
    `http://localhost:5000/api/weather?lat=${latitude}&lon=${longitude}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch weather");
  }

  const data = await response.json();

  return {
    // Weather information
    icon: mapWeatherIcon(data.weather[0].main),
    condition: data.weather[0].description,
    temp: Math.round(data.main.temp),
    feelsLike: Math.round(data.main.feels_like),
    humidity: data.main.humidity,
    wind: Math.round(data.wind.speed * 3.6),
    rain: data.rain?.["1h"] || 0,

    // Actual location information
    locationName: data.name,
    country: data.sys?.country || "",
  };
}

function mapWeatherIcon(condition) {
  const value = condition.toLowerCase();

  if (value.includes("clear")) return "sunny";
  if (value.includes("cloud")) return "partly-cloudy";
  if (value.includes("rain")) return "rain";
  if (value.includes("storm")) return "rain";

  return "cloudy";
}

export function iconFor(key) {
  return weatherIcon[key] || "🌤️";
}
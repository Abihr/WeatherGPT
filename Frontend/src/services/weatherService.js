function mapWeatherIcon(weatherMain) {
    const condition = weatherMain.toLowerCase();

    if (condition.includes("thunderstorm")) {
        return "storm";
    }

    if (condition.includes("drizzle")) {
        return "rain";
    }

    if (condition.includes("rain")) {
        return "rain";
    }

    if (condition.includes("snow")) {
        return "snow";
    }

    if (
        condition.includes("mist") ||
        condition.includes("fog") ||
        condition.includes("haze")
    ) {
        return "fog";
    }

    if (condition.includes("cloud")) {
        return "cloudy";
    }

    if (condition.includes("clear")) {
        return "sunny";
    }

    return "cloudy";
}


export async function getCurrentWeather(
    latitude,
    longitude
) {
    const response = await fetch(
        `http://localhost:5000/api/weather?lat=${latitude}&lon=${longitude}`
    );

    if (!response.ok) {
        const errorData = await response.json();

        throw new Error(
            errorData.error ||
            "Failed to fetch weather"
        );
    }

    const data = await response.json();

    console.log(
        "🌍 RAW WEATHER DATA:",
        data
    );

    return {
        icon: mapWeatherIcon(
            data.weather[0].main
        ),

        condition:
            data.weather[0].description,

        temp: Math.round(
            data.main.temp
        ),

        feelsLike: Math.round(
            data.main.feels_like
        ),

        humidity:
            data.main.humidity,

        wind: Math.round(
            data.wind.speed * 3.6
        ),

        pressure:
            data.main.pressure,

        rain:
            data.rain?.["1h"] ?? 0,

        locationName:
            data.name,

        country:
            data.sys.country,
    };
}
export async function GET(request) {
    const { searchParams } = new URL(request.url);

    const city = searchParams.get("city");
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");

    if (
        !city &&
        (!lat || !lon)
    ) {
        return Response.json(
            {
                error:
                    "City or coordinates are required",
            },
            {
                status: 400,
            }
        );
    }

    try {
        let url;

        if (city) {
            url =
                `https://api.openweathermap.org/data/2.5/weather` +
                `?q=${encodeURIComponent(city)}` +
                `&appid=${process.env.WEATHER_API_KEY}` +
                `&units=metric`;
        } else {
            url =
                `https://api.openweathermap.org/data/2.5/weather` +
                `?lat=${lat}` +
                `&lon=${lon}` +
                `&appid=${process.env.WEATHER_API_KEY}` +
                `&units=metric`;
        }

        const response = await fetch(url);

        const data = await response.json();

        if (!response.ok) {
            return Response.json(
                {
                    error:
                        data.message ||
                        "Weather API request failed",
                },
                {
                    status: response.status,
                }
            );
        }

        return Response.json(data);
    } catch (error) {
        console.error(
            "Weather API error:",
            error
        );

        return Response.json(
            {
                error:
                    "Failed to fetch weather",
            },
            {
                status: 500,
            }
        );
    }
}
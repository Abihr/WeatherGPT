const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/weather", async (req, res) => {
    const { city, lat, lon } = req.query;

    // Require either city OR both latitude and longitude
    if (!city && (!lat || !lon)) {
        return res.status(400).json({
            error: "City or coordinates are required"
        });
    }

    try {
        let url;

        // If a city was provided
        if (city) {
            url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${process.env.WEATHER_API_KEY}&units=metric`;
        }

        // If coordinates were provided
        else {
            url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.WEATHER_API_KEY}&units=metric`;
        }

        const response = await fetch(url);
        const data = await response.json();

        // Handle errors returned by OpenWeather
        if (!response.ok) {
            return res.status(response.status).json({
                error: data.message || "Weather API request failed"
            });
        }

        // Send weather data back to frontend
        res.json(data);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Failed to fetch weather"
        });
    }
});

app.listen(5000, () => {
    console.log("Backend running on http://localhost:5000");
});
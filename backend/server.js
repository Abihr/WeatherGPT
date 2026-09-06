const express = require("express");
const cors = require("cors");
require("dotenv").config();

const Groq = require("groq-sdk");

const app = express();

app.use(cors());
app.use(express.json());


// ==================== WEATHER API ====================

app.get("/api/weather", async (req, res) => {
    const { city, lat, lon } = req.query;

    // Require either city OR both latitude and longitude
    if (!city && (!lat || !lon)) {
        return res.status(400).json({
            error: "City or coordinates are required",
        });
    }

    try {
        let url;

        // City weather
        if (city) {
            url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
                city
            )}&appid=${process.env.WEATHER_API_KEY}&units=metric`;
        }

        // Location weather
        else {
            url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.WEATHER_API_KEY}&units=metric`;
        }

        console.log(
            "Requesting OpenWeather:",
            url.replace(
                process.env.WEATHER_API_KEY,
                "HIDDEN_KEY"
            )
        );

        const response = await fetch(url);
        const data = await response.json();

        console.log("OpenWeather response:", data);

        // OpenWeather error
        if (!response.ok) {
            return res.status(response.status).json({
                error: data.message || "Weather API request failed",
            });
        }

        // Send weather data to frontend
        res.json(data);

    } catch (error) {
        console.error("Weather server error:", error);

        res.status(500).json({
            error: "Failed to fetch weather",
        });
    }
});


// ==================== GROQ CHATBOT ====================

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

app.post("/api/chat", async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({
            error: "Message is required",
        });
    }

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content:
                        "You are WeatherGPT, a helpful AI weather assistant. Answer clearly and concisely.",
                },
                {
                    role: "user",
                    content: message,
                },
            ],
          model: "openai/gpt-oss-20b",
        });

        const reply = completion.choices[0]?.message?.content;

        res.json({
            reply,
        });

    } catch (error) {
        console.error("Chat server error:", error);

        res.status(500).json({
            error: "Failed to get AI response",
        });
    }
});

//Temporary route to test the server
app.get("/api/test", (req, res) => {
    res.json({
        message: "Chatbot backend is running!"
    });
});
// ==================== START SERVER ====================

app.listen(5000, () => {
    console.log("Backend running on http://localhost:5000");
});
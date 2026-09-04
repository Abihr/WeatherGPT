const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/test", (req, res) => {
    res.json({
        message: "Backend is connected!"
    });
});

app.listen(5000, () => {
    console.log("Backend running on http://localhost:5000");
});
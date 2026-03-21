require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const connectDB = require("./config/db");

const app = express();

// ✅ Connect DB
connectDB();

// ✅🔥 FINAL CORS FIX (IMPORTANT)
app.use(
    cors({
        origin: "*", // allow ALL (fixes your error)
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

// ✅ Middleware
app.use(express.json());

// ✅ Logger
app.use((req, res, next) => {
    console.log(`📡 ${new Date().toLocaleTimeString()} - ${req.method} ${req.url}`);
    next();
});

// ================= ROUTES =================

// Home
app.get("/", (req, res) => {
    res.send("🚀 Express server is running");
});

// Test route
app.get("/api/test-route", (req, res) => {
    res.json({ msg: "✅ API is working and routes are mounted" });
});

// Health check
app.get("/api/health", (req, res) => {
    res.json({
        status: "ok",
        db: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
        env: process.env.NODE_ENV || "development",
    });
});

// ================= MAP PROXY =================

// 🔍 Search
app.get("/api/map/search", async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.status(400).json({ msg: "Query required" });

        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5`,
            {
                headers: { "User-Agent": "RideX-App" },
            }
        );

        const data = await response.json();
        res.json(data);
    } catch (err) {
        console.error("❌ Proxy search error:", err);
        res.status(500).json({ msg: "Map search failed" });
    }
});

// 📍 Reverse
app.get("/api/map/reverse", async (req, res) => {
    try {
        const { lat, lon } = req.query;
        if (!lat || !lon)
            return res.status(400).json({ msg: "Lat and Lon required" });

        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
            {
                headers: { "User-Agent": "RideX-App" },
            }
        );

        const data = await response.json();
        res.json(data);
    } catch (err) {
        console.error("❌ Proxy reverse error:", err);
        res.status(500).json({ msg: "Reverse geocoding failed" });
    }
});

// ================= API ROUTES =================

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/driver", require("./routes/driverRoutes"));
app.use("/api/rating", require("./routes/ratingRoutes"));
app.use("/api/trip", require("./routes/tripRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

// ================= ERROR HANDLER =================

app.use((err, req, res, next) => {
    console.error("🔥 Server Error:", err.stack);
    res.status(500).json({ msg: "Something went wrong!" });
});

// ================= SERVER =================

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});
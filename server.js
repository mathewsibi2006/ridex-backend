require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Connect to Database
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    console.log(`📡 ${new Date().toLocaleTimeString()} - ${req.method} ${req.url}`);
    next();
});

app.get('/', (req, res) => {
    res.send('Express server is running');
});

app.get('/api/test-route', (req, res) => {
    res.json({ msg: "API is working and routes are mounted" });
});

app.get('/api/health', (req, res) => {
    const mongoose = require('mongoose');
    res.json({
        status: "ok",
        db: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
        env: process.env.NODE_ENV || "development"
    });
});

// 🗺️ Nominatim Proxy (Fixes CORS)
app.get('/api/map/search', async (req, res) => {
    console.log("🔍 Map search hit with query:", req.query.q);
    try {
        const { q } = req.query;
        if (!q) return res.status(400).json({ msg: "Query required" });

        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5`, {
            headers: { 'User-Agent': 'RideX-App' }
        });
        const data = await response.json();
        res.json(data);
    } catch (err) {
        console.error("Proxy search error:", err);
        res.status(500).json({ msg: "Map search failed" });
    }
});

app.get('/api/map/reverse', async (req, res) => {
    try {
        const { lat, lon } = req.query;
        if (!lat || !lon) return res.status(400).json({ msg: "Lat and Lon required" });

        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`, {
            headers: { 'User-Agent': 'RideX-App' }
        });
        const data = await response.json();
        res.json(data);
    } catch (err) {
        console.error("Proxy reverse error:", err);
        res.status(500).json({ msg: "Reverse geocoding failed" });
    }
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/driver', require('./routes/driverRoutes'));
app.use('/api/rating', require('./routes/ratingRoutes'));
app.use('/api/trip', require('./routes/tripRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

const PORT = 5001;
app.listen(PORT, () => console.log(`🚀 Server is running on port ${PORT}`));
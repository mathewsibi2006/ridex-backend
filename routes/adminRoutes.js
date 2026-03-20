const router = require("express").Router();
const Trip = require("../models/Trip");
const Rating = require("../models/Rating");

// 📊 Route: Get Driver Stats
router.get("/driver-stats", async (req, res) => {
    try {
        const trips = await Trip.find();
        const ratings = await Rating.find();

        // Get unique drivers from trips
        const driversList = [...new Set(trips.map(t => t.driver || "Rahul Sharma"))];

        const stats = driversList.map(driverName => {
            const driverTrips = trips.filter(t => t.driver === driverName || (!t.driver && driverName === "Rahul Sharma"));
            const driverRatings = ratings.filter(r => r.driver === driverName);

            const totalRides = driverTrips.filter(t => t.status === "completed").length;
            const cancelledRides = driverTrips.filter(t => t.status === "cancelled").length;
            const totalBooked = driverTrips.length;

            const totalEarnings = driverTrips
                .filter(t => t.status === "completed")
                .reduce((sum, t) => sum + (t.fare || 0), 0);

            const avgRating = driverRatings.length > 0
                ? (driverRatings.reduce((sum, r) => sum + r.rating, 0) / driverRatings.length).toFixed(1)
                : "5.0";

            const cancellationRate = totalBooked > 0
                ? ((cancelledRides / totalBooked) * 100).toFixed(1)
                : "0.0";

            // Simulated performance graph data (last 7 days/rides)
            const performanceData = driverTrips
                .slice(-7)
                .map(t => t.status === "completed" ? 100 : 0);

            return {
                name: driverName,
                totalRides,
                avgRating,
                totalEarnings,
                cancellationRate,
                performanceData
            };
        });

        res.json(stats);
    } catch (err) {
        console.error("❌ Admin Stats Error:", err);
        res.status(500).json({ msg: "Server Error fetching stats" });
    }
});

module.exports = router;

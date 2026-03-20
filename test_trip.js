require('dotenv').config();
const mongoose = require("mongoose");
const Trip = require("./models/Trip");
const User = require("./models/User");

async function test() {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Connected to DB");

        const testTrip = {
            userId: "65d000000000000000000000", // dummy id
            pickup: "Test Pickup",
            drop: "Test Drop",
            fare: 100,
            rideType: "RideX Go",
            paymentMethod: "upi",
            date: new Date().toLocaleString()
        };

        console.log("Creating trip...");
        const newTrip = await Trip.create(testTrip);
        console.log("Trip created:", newTrip);

        console.log("Finding user...");
        const user = await User.findById(testTrip.userId);
        console.log("User found:", user);

        process.exit(0);
    } catch (err) {
        console.error("Test Error:", err);
        process.exit(1);
    }
}

test();

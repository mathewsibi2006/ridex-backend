require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Trip = require('./models/Trip');

async function testBooking() {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Connected to DB:", process.env.MONGO_URL);

        const user = await User.findOne();
        if (!user) {
            console.log("No user found");
            return;
        }

        console.log("Testing with user:", user._id);

        try {
            const newTrip = await Trip.create({
                userId: user._id.toString(),
                pickup: "kalamassery",
                drop: "edappally",
                fare: 100,
                rideType: "RideX Go",
                paymentMethod: "upi",
                date: new Date().toLocaleString()
            });
            console.log("Trip Created:", newTrip._id);

            const foundUser = await User.findById(user._id);
            console.log("User found:", foundUser.firstName);

            console.log("TEST SUCCESSFUL");
        } catch (err) {
            console.error("DEBUG ERROR:", err);
        }

        await mongoose.connection.close();
    } catch (err) {
        console.error("CONNECTION ERROR:", err);
    }
}

testBooking();

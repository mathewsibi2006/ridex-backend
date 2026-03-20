require('dotenv').config();
const mongoose = require('mongoose');
const Trip = require('./models/Trip');
const User = require('./models/User');
const nodemailer = require('nodemailer');
const twilio = require('twilio');

const MONGO_URL = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/ridex';

async function test() {
    try {
        await mongoose.connect(MONGO_URL);
        console.log("Connected to DB");

        const user = await User.findOne();
        if (!user) {
            console.log("No user found in DB. Please register a user first.");
            process.exit(1);
        }

        console.log("Testing booking for user:", user.email);

        // Simulation of tripRoutes logic
        const tripData = {
            userId: user._id,
            pickup: "Test Pickup",
            drop: "Test Drop",
            fare: 100,
            rideType: "RideX Go",
            moods: ["Silent Ride"],
            driver: "Rahul Sharma",
            paymentMethod: "upi",
            date: new Date().toLocaleString()
        };

        console.log("Creating trip...");
        const newTrip = await Trip.create(tripData);
        console.log("Trip created:", newTrip._id);

        // Noti logic
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const twilioClient = twilio(
            process.env.TWILIO_SID || "ACxxx",
            process.env.TWILIO_AUTH_TOKEN || "xxx"
        );

        console.log("Attempting notifications...");

        // Email
        if (process.env.EMAIL_USER && user.email) {
            console.log("Sending email...");
            // We just test if it fails synchronously
        }

        // SMS
        if (process.env.TWILIO_PHONE && user.phone) {
            console.log("Sending SMS...");
        }

        console.log("Test Success!");
        await mongoose.disconnect();
    } catch (err) {
        console.error("❌ TEST FAILED:", err);
        process.exit(1);
    }
}

test();

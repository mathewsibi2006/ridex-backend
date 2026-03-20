const router = require("express").Router();
const Trip = require("../models/Trip");
const User = require("../models/User");
const nodemailer = require("nodemailer");
const twilio = require("twilio");
const mongoose = require("mongoose");

// 📧 Helper: Send Email
const sendEmailNoti = async (user, trip) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || !user.email) {
        console.log("ℹ️ Skipping email: Credentials or user email missing");
        return;
    }
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
        });
        await transporter.sendMail({
            from: `"RideX" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: "🚖 Trip Booked! OTP: " + trip.otp,
            text: `Hi ${user.firstName}, your trip from ${trip.pickup} to ${trip.drop} for ₹${trip.fare} is confirmed. \n\nYOUR RIDE OTP: ${trip.otp} \nShare this with your driver to start the ride.`
        });
        console.log("📧 Email sent to:", user.email);
    } catch (e) { console.error("❌ Email error:", e.message); }
};

// 📱 Helper: Send SMS
const sendSMSNoti = async (user, trip) => {
    if (!process.env.TWILIO_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE || !user.phone) {
        console.log("ℹ️ Skipping SMS: Twilio credentials or phone missing");
        return;
    }
    try {
        const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
        await client.messages.create({
            body: `RideX: Trip confirmed! OTP: ${trip.otp}. Amount: ₹${trip.fare}. Share OTP with driver.`,
            from: process.env.TWILIO_PHONE,
            to: user.phone
        });
        console.log("📱 SMS sent to:", user.phone);
    } catch (e) { console.error("❌ SMS error:", e.message); }
};

// 📧 Helper: Send Cancellation Email
const sendCancelEmailNoti = async (user, trip) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || !user.email) return;
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
        });
        await transporter.sendMail({
            from: `"RideX" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: "❌ Trip Cancelled",
            text: `Hi ${user.firstName}, your trip from ${trip.pickup} to ${trip.drop} has been successfully cancelled. We hope to see you again soon!`
        });
        console.log("📧 Cancellation Email sent to:", user.email);
    } catch (e) { console.error("❌ Cancel Email error:", e.message); }
};

// 📱 Helper: Send Cancellation SMS
const sendCancelSMSNoti = async (user, trip) => {
    if (!process.env.TWILIO_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE || !user.phone) return;
    try {
        const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
        await client.messages.create({
            body: `RideX: Your trip to ${trip.drop} has been cancelled as requested.`,
            from: process.env.TWILIO_PHONE,
            to: user.phone
        });
        console.log("📱 Cancellation SMS sent to:", user.phone);
    } catch (e) { console.error("❌ Cancel SMS error:", e.message); }
};

router.post("/", async (req, res) => {
    console.log("📝 [TripRoute] Booking Request Received");
    try {
        const { userId, pickup, drop, fare, carType, moods, driver, paymentMethod, coords, distance, stops: stopNames } = req.body;
        console.log(`📍 Booking from ${pickup} to ${drop} (Distance: ${distance}km)`);

        // 1. Validate User ID
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            console.warn("⚠️ Invalid User ID:", userId);
            return res.status(400).json({ msg: "Invalid User ID. Please log in again." });
        }

        // 2. Generate OTP (4-digit)
        const otp = Math.floor(1000 + Math.random() * 9000).toString();

        // 3. Create Trip
        const newTrip = await Trip.create({
            userId,
            pickup,
            drop,
            fare,
            rideType: carType || "RideX Go",
            moods: moods || [],
            driver: driver || "Rahul Sharma",
            paymentMethod: paymentMethod || "cash",
            coords: coords || null,
            distance: distance || 0,
            stopNames: stopNames || [],
            otp,
            status: "booked",
            date: new Date().toLocaleString()
        });
        console.log("✅ Trip persisted to DB:", newTrip._id);
        console.log("✅ Trip created successfully with OTP:", otp);

        // 3. Notifications (Non-blocking)
        User.findById(userId).then(user => {
            if (user) {
                sendEmailNoti(user, newTrip);
                sendSMSNoti(user, newTrip);
            }
        }).catch(err => console.error("❌ Notification setup error:", err.message));

        return res.json(newTrip);

    } catch (err) {
        console.error("❌ [TripRoute] CRITICAL ERROR DETAILS:", err);
        return res.status(500).json({
            msg: "Server Error",
            error: err.message,
            details: err.errors ? Object.keys(err.errors).map(key => ({ field: key, message: err.errors[key].message })) : null
        });
    }
});

// ✅ Route: Complete Trip
router.patch("/complete/:id", async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id);
        if (!trip) return res.status(404).json({ msg: "Trip not found" });

        trip.status = "completed";
        await trip.save();
        console.log("✅ Trip marked as COMPLETED:", trip._id);
        res.json({ msg: "Trip completed", status: "completed" });
    } catch (err) {
        console.error("❌ Completion Error:", err);
        res.status(500).json({ msg: "Server Error during completion" });
    }
});
router.patch("/cancel/:id", async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id);
        if (!trip) return res.status(404).json({ msg: "Trip not found" });

        trip.status = "cancelled";
        await trip.save();

        // Trigger notifications
        const user = await User.findById(trip.userId);
        if (user) {
            sendCancelEmailNoti(user, trip);
            sendCancelSMSNoti(user, trip);
            console.log("✅ Cancellation notifications triggered for trip:", trip._id);
        }

        res.json({ msg: "Cancellation notifications sent", status: "cancelled" });
    } catch (err) {
        console.error("❌ Cancellation Error:", err);
        res.status(500).json({ msg: "Server Error during cancellation" });
    }
});

router.get("/user/:userId", async (req, res) => {
    try {
        const trips = await Trip.find({ userId: req.params.userId }).sort({ date: -1 });
        res.json(trips);
    } catch (err) {
        console.error("Fetch User Trips Error:", err);
        res.status(500).json({ msg: "Server Error fetching history" });
    }
});

module.exports = router;

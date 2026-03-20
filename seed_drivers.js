require('dotenv').config();
const mongoose = require('mongoose');

// Connect to MongoDB
const MONGO_URL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/ridex";

const DriverSchema = new mongoose.Schema({
    name: String,
    age: Number,
    phone: String,
    vehicleType: String,
    vehicleNumber: String,
    licenseNumber: String,
    city: String,
    status: { type: String, default: "Approved" }
});

const Driver = mongoose.model("Driver", DriverSchema);

const sampleDrivers = [
    {
        name: "Arun Kumar",
        age: 32,
        phone: "9876543210",
        vehicleType: "Sedan",
        vehicleNumber: "KL-07-CD-1234",
        city: "Kochi",
        status: "Approved"
    },
    {
        name: "Rahul Nair",
        age: 28,
        phone: "8765432109",
        vehicleType: "SUV",
        vehicleNumber: "KL-07-XY-5678",
        city: "Kochi",
        status: "Approved"
    }
];

async function seed() {
    try {
        await mongoose.connect(MONGO_URL);
        console.log("Connected to MongoDB for seeding...");

        // Only add if no drivers exist
        const count = await Driver.countDocuments();
        if (count === 0) {
            await Driver.insertMany(sampleDrivers);
            console.log("✅ Sample drivers seeded successfully!");
        } else {
            console.log("ℹ️ Drivers already exist, skipping seed.");
        }

        mongoose.connection.close();
    } catch (err) {
        console.error("Seeding error:", err);
    }
}

seed();

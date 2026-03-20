require('dotenv').config();
const mongoose = require('mongoose');

const TripSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    pickup: { type: String, required: true },
    drop: { type: String, required: true },
    fare: { type: Number, required: true },
});
const Trip = mongoose.model("TripTest", TripSchema);

const MONGO_URL = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/ridex';

async function test() {
    try {
        await mongoose.connect(MONGO_URL);
        console.log("Connected");
        await Trip.create({
            userId: "65ce205ce205ce205ce205ce",
            pickup: "A",
            drop: "B",
            fare: 100
        });
        console.log("Created Success");
        process.exit(0);
    } catch (err) {
        console.error("FAILED:", err.message);
        process.exit(1);
    }
}
test();

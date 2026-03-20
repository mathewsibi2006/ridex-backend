const mongoose = require("mongoose");

const TripSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  pickup: { type: String, required: true },
  drop: { type: String, required: true },
  driver: { type: String },
  fare: { type: Number, required: true },
  rideType: { type: String },
  moods: { type: [String], default: [] },
  distance: { type: Number },
  stopNames: { type: [String], default: [] },
  eta: { type: String },
  paymentMethod: { type: String },
  coords: {
    pickup: [Number],
    drop: [Number],
    stops: [[Number]]
  },
  otp: { type: String, required: true },
  status: { type: String, enum: ['booked', 'completed', 'cancelled'], default: 'booked' },
  date: { type: String, default: () => new Date().toLocaleString() }
});

module.exports = mongoose.model("Trip", TripSchema);

const mongoose = require("mongoose");

const RatingSchema = new mongoose.Schema({
  userId: { type: String, index: true },
  tripId: String,
  driver: String,
  rating: Number,
  feedback: String,
  date: String
});

module.exports = mongoose.model("Rating", RatingSchema);

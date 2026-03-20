const mongoose = require("mongoose");

module.exports = mongoose.model("Driver", {
  name: String,
  age: Number,
  phone: String,
  vehicleType: String,
  vehicleNumber: String,
  licenseNumber: String,
  city: String,
  userPhoto: String,
  licensePhoto: String,
  vehiclePhoto: String,
  status: { type: String, default: "Pending" }
});

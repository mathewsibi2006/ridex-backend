require('dotenv').config();
const mongoose = require("mongoose");
const axios = require("axios");

async function testInvalidId() {
    try {
        console.log("Testing invalid userId...");
        const response = await axios.post("http://localhost:5000/api/trip", {
            userId: "invalid-id",
            pickup: "Test",
            drop: "Test",
            fare: 100,
            carType: "RideX Go",
            paymentMethod: "upi"
        }).catch(err => err.response);

        console.log("Response status:", response.status);
        console.log("Response data:", response.data);

        if (response.status === 400 && response.data.msg === "Invalid User ID") {
            console.log("✅ Validation test passed!");
        } else {
            console.error("❌ Validation test failed!");
        }

        process.exit(0);
    } catch (err) {
        console.error("Test Error:", err);
        process.exit(1);
    }
}

testInvalidId();

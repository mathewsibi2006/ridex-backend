require('dotenv').config();
const nodemailer = require('nodemailer');
const twilio = require('twilio');

const fs = require('fs');

async function testNoti() {
    let log = "--- TEST START ---\n";

    // 1. Email
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
        });
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject: "RideX Test Email",
            text: "Success"
        });
        log += "✅ Email: SUCCESS\n";
    } catch (e) { log += "❌ Email: " + e.message + "\n"; }

    // 2. SMS
    try {
        const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
        const m = await client.messages.create({
            body: "RideX Test SMS",
            from: process.env.TWILIO_PHONE,
            to: "+919037703154"
        });
        log += "✅ SMS: SUCCESS (" + m.sid + ")\n";
    } catch (e) {
        log += "❌ SMS: " + e.message + " (Code: " + e.code + ")\n";
    }

    fs.writeFileSync('noti_log.txt', log);
    console.log("Results written to noti_log.txt");
}

testNoti();

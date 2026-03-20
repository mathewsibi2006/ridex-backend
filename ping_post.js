const http = require('http');

const data = JSON.stringify({
    userId: "65c33fb8f3a38a1698e33fb8", // dummy format
    pickup: "kalamassery",
    drop: "edappally",
    fare: 100,
    carType: "RideX Go",
    paymentMethod: "upi"
});

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/trip',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
        console.log(`BODY: ${chunk}`);
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.write(data);
req.end();

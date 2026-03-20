const axios = require('axios');

async function test() {
    try {
        console.log("Testing /api/map/search?q=Kochi...");
        const res1 = await axios.get('http://localhost:5001/api/map/search?q=Kochi');
        console.log("Search Result Status:", res1.status);
        console.log("First Result Name:", res1.data[0]?.display_name);

        console.log("\nTesting /api/map/reverse?lat=10.0159&lon=76.3419...");
        const res2 = await axios.get('http://localhost:5001/api/map/reverse?lat=10.0159&lon=76.3419');
        console.log("Reverse Result Status:", res2.status);
        console.log("Result Name:", res2.data?.display_name);

        process.exit(0);
    } catch (err) {
        console.error("Test Failed:", err.message);
        if (err.response) console.error("Response Data:", err.response.data);
        process.exit(1);
    }
}

test();

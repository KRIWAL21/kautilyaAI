const https = require('https');

https.get('https://api.ikey.in/customers', (resp) => {
    let data = '';

    resp.on('data', (chunk) => {
        data += chunk;
    });

    resp.on('end', () => {
        try {
            const parsed = JSON.parse(data);
            if (parsed.data && parsed.data.customers) {
                const targetMobile = "9022041332";
                const found = parsed.data.customers.find(c => c.phoneNumber && c.phoneNumber.includes(targetMobile));

                if (found) {
                    console.log("Found User:", JSON.stringify(found, null, 2));
                } else {
                    console.log("User with mobile " + targetMobile + " NOT found.");
                    console.log("Total customers:", parsed.data.customers.length);
                    console.log("First 5 numbers in DB:", parsed.data.customers.slice(0, 5).map(c => c.phoneNumber));
                }
            } else {
                console.log("No customers found or invalid structure.");
            }
        } catch (e) {
            console.log("Error parsing JSON:", e.message);
        }
    });

}).on("error", (err) => {
    console.log("Error: " + err.message);
});

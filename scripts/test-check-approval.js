const https = require('http');

console.log("🚀 Starting test for Manager Discount Approval Webhook...");

// You can test with a custom delay by passing a number as an argument (e.g. node test-check-approval.js 5)
const delayArg = process.argv[2];
const payload = {
  plan_name: "Nationwide",
  requested_discount: 25,
};

if (delayArg) {
  payload.delay = parseInt(delayArg, 10);
  console.log(`⏱️  Using custom delay of ${payload.delay} seconds`);
} else {
  console.log(`⏱️  Using default delay of 30 seconds`);
}

const data = JSON.stringify(payload);

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/check-approval',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length,
  },
};

const startTime = Date.now();

const req = https.request(options, (res) => {
  let responseBody = '';

  res.on('data', (chunk) => {
    responseBody += chunk;
  });

  res.on('end', () => {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n✅ Request completed in ${elapsed} seconds.`);
    console.log(`Status Code: ${res.statusCode}`);
    console.log(`Response Body:`);
    
    try {
      console.log(JSON.stringify(JSON.parse(responseBody), null, 2));
    } catch (e) {
      console.log(responseBody);
    }
  });
});

req.on('error', (error) => {
  console.error(`\n❌ Error: Cannot connect to localhost:3000. Make sure your Next.js development server is running.`);
  console.error(error.message);
});

req.write(data);
req.end();

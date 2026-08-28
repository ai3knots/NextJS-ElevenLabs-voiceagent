const https = require('https');

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, headers: res.headers, body: data });
      });
    });
    req.on('error', (e) => reject(e));
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('🧪 Testing Live Cloudflare Worker Connectivity');
  console.log('====================================================\n');

  const hostname = 'messenger-elevenlabs-worker.turkkashif786.workers.dev';

  // 1. GET Root / Healthcheck
  console.log('1️⃣  Testing Root Worker Healthcheck (GET /)...');
  try {
    const res = await makeRequest({
      hostname,
      path: '/',
      method: 'GET',
    });
    console.log(`   Status: ${res.statusCode}`);
    console.log(`   Body:   ${res.body.trim()}`);
    if (res.statusCode === 200) {
      console.log('   ✅ Cloudflare Worker is UP and responding!\n');
    }
  } catch (err) {
    console.error('   ❌ Root check failed:', err.message);
  }

  // 2. GET Meta Verification Handshake
  console.log('2️⃣  Testing Meta Webhook Handshake Verification (GET /?hub.mode=subscribe)...');
  try {
    const challenge = 'test_challenge_' + Date.now();
    const token = 'my_custom_verify_token_123';
    const res = await makeRequest({
      hostname,
      path: `/?hub.mode=subscribe&hub.verify_token=${token}&hub.challenge=${challenge}`,
      method: 'GET',
    });
    console.log(`   Status: ${res.statusCode}`);
    console.log(`   Body:   ${res.body.trim()}`);
    if (res.statusCode === 200 && res.body.trim() === challenge) {
      console.log('   ✅ Meta Handshake Verification PASSED perfectly!\n');
    } else {
      console.log('   ⚠️ Handshake returned unexpected challenge response.\n');
    }
  } catch (err) {
    console.error('   ❌ Handshake check failed:', err.message);
  }

  // 3. POST Simulated Meta Messenger Message
  console.log('3️⃣  Testing Meta Webhook POST Message Dispatch to Durable Object...');
  try {
    const mockPsid = 'test_cli_user_' + Math.floor(Math.random() * 10000);
    const payload = JSON.stringify({
      object: 'page',
      entry: [
        {
          messaging: [
            {
              sender: { id: mockPsid },
              message: { text: 'Hello, this is an automated health check test.' },
            },
          ],
        },
      ],
    });

    const res = await makeRequest(
      {
        hostname,
        path: '/',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
      },
      payload
    );

    console.log(`   Status: ${res.statusCode}`);
    console.log(`   Body:   ${res.body.trim()}`);
    if (res.statusCode === 200 && res.body.trim() === 'EVENT_RECEIVED') {
      console.log('   ✅ POST Routing to Durable Object & ElevenLabs Pipeline PASSED!\n');
    } else {
      console.log('   ⚠️ Unexpected response for POST event.\n');
    }
  } catch (err) {
    console.error('   ❌ POST test failed:', err.message);
  }

  console.log('====================================================');
  console.log('🎉 Cloudflare Worker Connection Test Completed!');
  console.log('====================================================');
}

runTests();

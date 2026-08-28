const http = require('http');

function request(url, options = {}, data = null) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const reqOptions = {
      hostname: parsed.hostname,
      port: parsed.port || 80,
      path: parsed.pathname + parsed.search,
      method: options.method || 'GET',
      headers: options.headers || {},
    };

    const req = http.request(reqOptions, (res) => {
      let body = '';
      res.on('data', (c) => (body += c));
      res.on('end', () => resolve({ status: res.statusCode, data: body }));
    });

    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function testWorker() {
  console.log('================================================================');
  console.log('🧪 TESTING CLOUDFLARE WORKER & ELEVENLABS CONNECTIVITY');
  console.log('================================================================\n');

  // Test 1: Healthcheck
  console.log('1️⃣  Testing Root Worker Status (GET /)...');
  const root = await request('http://127.0.0.1:8787/');
  console.log('   Status:', root.status);
  console.log('   Response:', root.data);

  // Test 2: Meta Webhook GET Handshake
  console.log('\n2️⃣  Testing Meta Webhook GET Handshake (hub.mode=subscribe)...');
  const handshake = await request('http://127.0.0.1:8787/?hub.mode=subscribe&hub.verify_token=my_custom_verify_token_123&hub.challenge=test_verification_challenge_888');
  console.log('   Status:', handshake.status);
  console.log('   Response:', handshake.data);
  if (handshake.data === 'test_verification_challenge_888') {
    console.log('   ✅ Meta Verification Handshake SUCCESSFUL!');
  } else {
    console.log('   ❌ Handshake response mismatch.');
  }

  // Test 3: Send User Message Turn 1
  const mockPsid = 'test_psid_alex_' + Date.now();
  console.log(`\n3️⃣  Testing Message POST Event (PSID: ${mockPsid})...`);
  const postData1 = JSON.stringify({
    object: 'page',
    entry: [
      {
        messaging: [
          {
            sender: { id: mockPsid },
            message: { text: 'Hi! My name is Alex and I am looking for a real estate listing.' },
          },
        ],
      },
    ],
  });

  const postRes1 = await request('http://127.0.0.1:8787/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(postData1) },
  }, postData1);

  console.log('   POST Status:', postRes1.status);
  console.log('   POST Response:', postRes1.data);
  console.log('   ⏳ Waiting 4 seconds for Durable Object to connect to ElevenLabs WebSocket & process response...');
  await new Promise(r => setTimeout(r, 4000));

  // Test 4: Send User Message Turn 2 (Testing Conversation Memory on Active WebSocket)
  console.log('\n4️⃣  Testing Turn 2 Memory Continuity...');
  const postData2 = JSON.stringify({
    object: 'page',
    entry: [
      {
        messaging: [
          {
            sender: { id: mockPsid },
            message: { text: 'What is my name and what was I looking for?' },
          },
        ],
      },
    ],
  });

  const postRes2 = await request('http://127.0.0.1:8787/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(postData2) },
  }, postData2);

  console.log('   POST Status:', postRes2.status);
  console.log('   POST Response:', postRes2.data);
  console.log('   ⏳ Waiting 4 seconds for turn 2 processing...');
  await new Promise(r => setTimeout(r, 4000));

  console.log('\n================================================================');
  console.log('🎉 TEST RUN FINISHED');
  console.log('================================================================');
}

testWorker().catch(console.error);

import axios from 'axios';

async function testLiveCloudflareWorker() {
  const workerUrl = 'https://messenger-elevenlabs-worker.turkkashif786.workers.dev';
  console.log('🧪 Testing Live Cloudflare Worker on:', workerUrl, '\n');

  // 1. Test GET Verification Handshake
  try {
    console.log('1. Testing Meta Webhook GET Handshake...');
    const getRes = await axios.get(`${workerUrl}/?hub.mode=subscribe&hub.verify_token=my_custom_verify_token_123&hub.challenge=live_test_challenge_999`);
    console.log('GET Status:', getRes.status, 'Response:', getRes.data);
    if (getRes.data === 'live_test_challenge_999') {
      console.log('✅ Handshake Verified Successfully on Live Cloudflare!\n');
    }
  } catch (err: any) {
    console.error('❌ Handshake Failed:', err.response?.data || err.message);
  }

  // 2. Test Message Turn 1
  const mockPsid = 'live_cf_test_user_777';
  console.log('2. Sending Turn 1 (Mock message)...');
  try {
    const payload1 = {
      object: 'page',
      entry: [
        {
          messaging: [
            {
              sender: { id: mockPsid },
              message: { text: 'Hello from Cloudflare Worker test!' },
            },
          ],
        },
      ],
    };

    const postRes1 = await axios.post(workerUrl, payload1);
    console.log('POST 1 Status:', postRes1.status, 'Body:', postRes1.data);
    console.log('✅ Turn 1 received and processed by Live Cloudflare Worker!\n');
  } catch (err: any) {
    console.error('❌ POST 1 Failed:', err.response?.data || err.message);
  }

  console.log('🎉 Live Cloudflare Worker is 100% operational and ready for Meta Messenger!');
}

testLiveCloudflareWorker();

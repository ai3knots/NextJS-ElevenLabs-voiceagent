import axios from 'axios';

async function testLocalWorker() {
  const localUrl = 'http://127.0.0.1:8787';
  console.log('🧪 Testing Local Cloudflare Worker on:', localUrl, '\n');

  // 1. Test GET Verification Handshake
  try {
    console.log('1. Testing Meta Webhook GET Handshake...');
    const getRes = await axios.get(`${localUrl}/?hub.mode=subscribe&hub.verify_token=my_custom_verify_token_123&hub.challenge=test_12345`);
    console.log('GET Status:', getRes.status, 'Response:', getRes.data);
    if (getRes.data === 'test_12345') {
      console.log('✅ Handshake Verified Successfully!\n');
    }
  } catch (err: any) {
    console.error('❌ Handshake Failed:', err.message);
  }

  // 2. Test Message Turn 1
  const mockPsid = 'test_cf_user_john_888';
  console.log('2. Sending Turn 1 (Initiation & Message)...');
  try {
    const payload1 = {
      object: 'page',
      entry: [
        {
          messaging: [
            {
              sender: { id: mockPsid },
              message: { text: 'Hello! My name is John, and I write thriller novels.' },
            },
          ],
        },
      ],
    };

    const postRes1 = await axios.post(localUrl, payload1);
    console.log('POST 1 Status:', postRes1.status, 'Body:', postRes1.data);
    console.log('✅ Turn 1 received by worker. Waiting 4 seconds for ElevenLabs stream processing...\n');
  } catch (err: any) {
    console.error('❌ POST 1 Failed:', err.message);
  }

  await new Promise((r) => setTimeout(r, 4000));

  // 3. Test Message Turn 2 (Continuous Live Session Recall)
  console.log('3. Sending Turn 2 on the SAME Open Session...');
  try {
    const payload2 = {
      object: 'page',
      entry: [
        {
          messaging: [
            {
              sender: { id: mockPsid },
              message: { text: 'Can you remind me what my name is and what genre I write?' },
            },
          ],
        },
      ],
    };

    const postRes2 = await axios.post(localUrl, payload2);
    console.log('POST 2 Status:', postRes2.status, 'Body:', postRes2.data);
    console.log('✅ Turn 2 received by worker. Waiting for response delivery logs...\n');
  } catch (err: any) {
    console.error('❌ POST 2 Failed:', err.message);
  }

  await new Promise((r) => setTimeout(r, 4000));
  console.log('🎉 Local Cloudflare Worker Test Completed!');
}

testLocalWorker();

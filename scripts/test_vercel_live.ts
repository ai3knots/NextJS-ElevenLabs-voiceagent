import axios from 'axios';

async function testVercelMessengerWebhook() {
  const vercelUrl = 'https://next-js-eleven-labs-voiceagent.vercel.app/api/webhook/messenger';
  console.log('🧪 Testing Vercel Messenger Webhook:', vercelUrl);

  const payload = {
    object: 'page',
    entry: [
      {
        messaging: [
          {
            sender: { id: '61555543210' }, // mock sender
            message: { text: 'Hello, what publishing packages do you have?' },
          },
        ],
      },
    ],
  };

  try {
    const res = await axios.post(vercelUrl, payload);
    console.log('Vercel Webhook Status:', res.status, 'Data:', res.data);
  } catch (err: any) {
    console.error('Error hitting Vercel webhook:', err.response?.data || err.message);
  }
}

testVercelMessengerWebhook();

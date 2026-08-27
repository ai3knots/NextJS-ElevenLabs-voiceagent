import axios from 'axios';

async function testLiveWebhook() {
  const webhookUrl = 'https://next-js-eleven-labs-voiceagent.vercel.app/api/webhook/messenger';

  const mockPayload = {
    object: 'page',
    entry: [
      {
        messaging: [
          {
            sender: {
              id: '1234567890', // Fake PSID for testing
            },
            message: {
              text: 'Hello from the live test script!',
            },
          },
        ],
      },
    ],
  };

  console.log(`Sending mock payload to live webhook: ${webhookUrl}`);
  
  try {
    const response = await axios.post(webhookUrl, mockPayload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log(`\n✅ Webhook responded with status: ${response.status}`);
    console.log('Response body:', response.data);
    console.log('\nSuccess! The Vercel app received the request. You can check the Vercel Logs dashboard to see the ElevenLabs response and Meta API delivery attempt.');
    
  } catch (error: any) {
    console.error('\n❌ Error hitting live webhook:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      console.log('Note: If this is an Unauthorized error, make sure the Vercel app has finished deploying and that the middleware update is live.');
    }
  }
}

testLiveWebhook();

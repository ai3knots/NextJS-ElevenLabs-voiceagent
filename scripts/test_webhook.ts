import axios from 'axios';

async function testWebhook() {
  const webhookUrl = 'http://localhost:3000/api/webhook/messenger';

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
              text: 'Hello from the test script!',
            },
          },
        ],
      },
    ],
  };

  console.log('Sending mock payload to webhook...');
  
  try {
    const response = await axios.post(webhookUrl, mockPayload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log(`Webhook responded with status: ${response.status}`);
    console.log('Response body:', response.data);
    console.log('\nCheck your Next.js server terminal! You should see logs indicating that the webhook received the message, got a response from ElevenLabs, and attempted to send it to Meta (the Meta send will likely fail with a "user not found" error because the PSID "1234567890" is fake, but it proves the whole pipeline works).');
    
  } catch (error: any) {
    console.error('Error hitting webhook:', error.response?.data || error.message);
  }
}

testWebhook();

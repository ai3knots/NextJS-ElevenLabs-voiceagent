import axios from 'axios';

const META_API_TOKEN = process.env.META_API;

/**
 * Sends a text message to a user via the Meta Graph API.
 * @param psid The Page Scoped User ID of the recipient.
 * @param text The text message to send.
 */
export async function sendMessageToMeta(psid: string, text: string) {
  if (!META_API_TOKEN) {
    console.error('Missing META_API in environment variables.');
    return { success: false, error: 'Missing META_API token' };
  }

  try {
    const url = `https://graph.facebook.com/v19.0/me/messages?access_token=${META_API_TOKEN}`;
    
    const payload = {
      recipient: {
        id: psid,
      },
      message: {
        text: text,
      },
      messaging_type: 'RESPONSE',
    };

    const response = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return {
      success: true,
      data: response.data,
    };
  } catch (error: any) {
    console.error('Error sending message to Meta:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data || error.message,
    };
  }
}

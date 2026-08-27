import axios from 'axios';
import fs from 'fs';
import path from 'path';

// Parse .env file manually
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  envConfig.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...values] = trimmed.split('=');
      if (key && values.length > 0) {
        let val = values.join('=').trim();
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        process.env[key.trim()] = val;
      }
    }
  });
}

async function checkAndSubscribe() {
  const token = process.env.META_API;
  console.log('Using Token:', token?.slice(0, 25) + '...');

  try {
    console.log('\n1. Checking existing subscribed apps for the Page:');
    const getRes = await axios.get(`https://graph.facebook.com/v20.0/me/subscribed_apps?access_token=${token}`);
    console.log('Current Subscribed Apps:', JSON.stringify(getRes.data, null, 2));

    console.log('\n2. Explicitly subscribing Page to App Webhook with fields: messages, messaging_postbacks:');
    const postRes = await axios.post(
      `https://graph.facebook.com/v20.0/me/subscribed_apps`,
      {
        subscribed_fields: ['messages', 'messaging_postbacks'],
      },
      {
        params: { access_token: token }
      }
    );
    console.log('Subscribe Result:', JSON.stringify(postRes.data, null, 2));

    console.log('\n3. Re-verifying subscribed apps:');
    const verifyRes = await axios.get(`https://graph.facebook.com/v20.0/me/subscribed_apps?access_token=${token}`);
    console.log('Verified Subscribed Apps:', JSON.stringify(verifyRes.data, null, 2));

  } catch (err: any) {
    console.error('Error during Graph API check:', err.response?.data || err.message);
  }
}

checkAndSubscribe();

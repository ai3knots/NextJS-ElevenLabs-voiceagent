require('dotenv').config();
const https = require('https');

const req = https.request({
  hostname: 'api.elevenlabs.io',
  path: '/v1/convai/phone-numbers',
  method: 'GET',
  headers: {
    'xi-api-key': process.env.ELEVENLABS_API_KEY
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(data));
});

req.on('error', e => console.error(e));
req.end();

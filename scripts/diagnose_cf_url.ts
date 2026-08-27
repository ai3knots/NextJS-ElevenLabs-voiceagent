import https from 'https';

const url = 'https://messenger-elevenlabs-worker.turkkashif786.workers.dev';

async function testWithNativeFetch() {
  console.log('Testing Cloudflare Live URL:', url);
  try {
    const res = await fetch(url, {
      method: 'GET',
    });
    console.log('Fetch Status:', res.status);
    const text = await res.text();
    console.log('Fetch Response Body:', text);
  } catch (e: any) {
    console.error('Fetch Error:', e.cause || e.message);
  }
}

testWithNativeFetch();

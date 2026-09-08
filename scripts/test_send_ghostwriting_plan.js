const email = 'ai.3knots@gmail.com';

async function testGhostwritingEmail() {
  console.log(`Sending ghostwriting plan test email to ${email}...`);
  try {
    const response = await fetch('http://localhost:3000/api/send-ghostwriting-plan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: email,
        name: 'Kashif Ghostwriter Test',
        price_visible: true,
        price: 1099
      }),
    });

    const data = await response.json();
    console.log(`Response:`, data);
  } catch (error) {
    console.error(`Error:`, error.message);
  }
}

testGhostwritingEmail();

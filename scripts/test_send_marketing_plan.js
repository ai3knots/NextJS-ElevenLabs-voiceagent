const email = 'ai.3knots@gmail.com';

async function testEmail(planType) {
  console.log(`Sending ${planType} plan test email to ${email}...`);
  try {
    const response = await fetch('http://localhost:3000/api/send-marketing-plan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: email,
        name: 'Kashif',
        planType: planType,
        price_visible: true,
        silverPrice: 4999, // Custom price example (defaults to 6299 if omitted)
        goldPrice: 8999    // Custom price example (defaults to 10499 if omitted)
      }),
    });

    const data = await response.json();
    console.log(`Response for ${planType}:`, data);
  } catch (error) {
    console.error(`Error for ${planType}:`, error.message);
  }
}

async function runAll() {
  await testEmail('all');
  await new Promise(r => setTimeout(r, 1000));
  await testEmail('silver');
  await new Promise(r => setTimeout(r, 1000));
  await testEmail('gold');
}

runAll();

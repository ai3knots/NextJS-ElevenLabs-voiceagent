const testEmail = async (endpoint, planName) => {
  try {
    const response = await fetch(\`http://localhost:3000/api/send-email/\${endpoint}\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: 'sairaayoub14022000@gmail.com',
        name: 'Saira Ayoub',
      }),
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log(\`✅ [\${planName}] Success: \`, data);
    } else {
      console.error(\`❌ [\${planName}] Failed with status: \${response.status}\`);
      const text = await response.text();
      console.error(text);
    }
  } catch (error) {
    console.error(\`❌ [\${planName}] Error hitting API (Is dev server running?):\`, error.message);
  }
};

const runAllTests = async () => {
  console.log('Testing Global Plan API...');
  await testEmail('global', 'Global');
  
  console.log('\\nTesting Nationwide Plan API...');
  await testEmail('nationwide', 'Nationwide');
  
  console.log('\\nTesting Kickstarter Plan API...');
  await testEmail('kickstarter', 'Kickstarter');
};

runAllTests();

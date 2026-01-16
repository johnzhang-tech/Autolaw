// Debug script to test authentication flow
const fetch = require('node-fetch');

async function testAuthFlow() {
  console.log('Testing authentication flow...');
  
  // Step 1: Login
  const email = process.env.TEST_LOGIN_EMAIL || 'demo@docuai.com';
  const password = process.env.TEST_LOGIN_PASSWORD || '';
  if (!password) {
    throw new Error(
      'Missing TEST_LOGIN_PASSWORD. Set TEST_LOGIN_EMAIL/TEST_LOGIN_PASSWORD in your environment before running this script.'
    );
  }

  const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email,
      password
    })
  });
  
  console.log('Login status:', loginResponse.status);
  console.log('Login headers:', [...loginResponse.headers.entries()]);

  const loginData = await loginResponse.json();
  console.log('Login response:', loginData);
}

testAuthFlow().catch(console.error);
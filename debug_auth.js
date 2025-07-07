// Debug script to test authentication flow
const fetch = require('node-fetch');

async function testAuthFlow() {
  console.log('Testing authentication flow...');
  
  // Step 1: Login
  const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: 'legalai@altosera.com',
      password: 'Ztop123!'
    })
  });
  
  console.log('Login status:', loginResponse.status);
  console.log('Login headers:', [...loginResponse.headers.entries()]);
  
  const cookies = loginResponse.headers.get('set-cookie');
  console.log('Set cookies:', cookies);
  
  const loginData = await loginResponse.json();
  console.log('Login response:', loginData);
  
  // Step 2: Check auth with cookies
  if (cookies) {
    const authResponse = await fetch('http://localhost:5000/api/auth/user', {
      headers: {
        'Cookie': cookies
      }
    });
    
    console.log('Auth status:', authResponse.status);
    const authData = await authResponse.json();
    console.log('Auth response:', authData);
  }
}

testAuthFlow().catch(console.error);
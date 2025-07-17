// Test N8N filename preservation with different methods

const BASE_URL = 'https://beeed428-ed5d-4903-bc62-3ba70ac303df-00-38fn65dx21909.kirk.replit.dev';
const API_KEY = 'docuai_demo_key_123';
const TRANSACTION_ID = 88;

// Method 1: Query parameter filename
async function testQueryParameterMethod() {
  console.log('\n=== Testing Query Parameter Method ===');
  
  const response = await fetch(`${BASE_URL}/api/transactions/${TRANSACTION_ID}/upload-single?filename=Query-Param-Test.pdf`, {
    method: 'POST',
    headers: {
      'X-API-Key': API_KEY,
      'Content-Type': 'application/pdf'
    },
    body: Buffer.from('%PDF-1.4 test content') // Simple PDF content
  });
  
  const result = await response.json();
  console.log('Response:', result);
  return result.success;
}

// Method 2: Header filename 
async function testHeaderMethod() {
  console.log('\n=== Testing Header Method ===');
  
  const response = await fetch(`${BASE_URL}/api/transactions/${TRANSACTION_ID}/upload-single`, {
    method: 'POST',
    headers: {
      'X-API-Key': API_KEY,
      'X-Filename': 'Header-Method-Test.pdf',
      'Content-Type': 'application/pdf'
    },
    body: Buffer.from('%PDF-1.4 test content') // Simple PDF content
  });
  
  const result = await response.json();
  console.log('Response:', result);
  return result.success;
}

// Run tests
async function runTests() {
  try {
    console.log('Testing N8N filename preservation methods...');
    
    const queryResult = await testQueryParameterMethod();
    const headerResult = await testHeaderMethod();
    
    console.log('\n=== Test Results ===');
    console.log('Query Parameter Method:', queryResult ? 'PASS' : 'FAIL');
    console.log('Header Method:', headerResult ? 'PASS' : 'FAIL');
    
    if (queryResult && headerResult) {
      console.log('\n✅ All filename preservation methods working!');
    } else {
      console.log('\n❌ Some methods failed. Check logs above.');
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  runTests();
}

module.exports = { testQueryParameterMethod, testHeaderMethod };
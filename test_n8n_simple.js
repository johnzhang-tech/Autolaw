// Simple test using debug endpoint to verify n8n integration works
async function testN8NSimple() {
  console.log('Testing n8n endpoint with working debug endpoint...');
  
  try {
    // Test the debug endpoint first to see if basic multer works
    const debugResponse = await fetch('https://beeed428-ed5d-4903-bc62-3ba70ac303df-00-38fn65dx21909.kirk.replit.dev/api/debug/n8n-upload', {
      method: 'POST',
      headers: {
        'X-API-Key': 'docuai_demo_key_123',
        'Content-Type': 'multipart/form-data; boundary=test123'
      },
      body: `--test123\r
Content-Disposition: form-data; name="test_file"; filename="test.txt"\r
Content-Type: text/plain\r
\r
Test file content\r
--test123--\r
`
    });
    
    console.log('Debug endpoint status:', debugResponse.status);
    const debugResult = await debugResponse.json();
    console.log('Debug result:', JSON.stringify(debugResult, null, 2));
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testN8NSimple().catch(console.error);
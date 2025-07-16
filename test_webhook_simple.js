const https = require('https');
const fs = require('fs');

// Test the new simple webhook endpoint
async function testWebhookSimple() {
  console.log('=== Testing Simple Webhook Endpoint ===');
  
  // Mock email data similar to what N8N would send
  const mockEmailData = {
    subject: "Test-my-6", // This should map to transaction ID 81
    from: "test@example.com",
    to: "demo@docuai.com",
    attachment_0: {
      filename: "Test Document 1.pdf",
      data: fs.readFileSync('test.pdf').toString('base64'),
      mimeType: "application/pdf"
    },
    attachment_1: {
      filename: "Test Document 2.pdf", 
      data: fs.readFileSync('test.pdf').toString('base64'),
      mimeType: "application/pdf"
    }
  };
  
  const postData = JSON.stringify(mockEmailData);
  
  const options = {
    hostname: 'beeed428-ed5d-4903-bc62-3ba70ac303df-00-38fn65dx21909.kirk.replit.dev',
    path: '/api/webhook/upload-attachments',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': postData.length,
      'X-API-Key': 'docuai_demo_key_123'
    }
  };
  
  console.log('Sending webhook request...');
  console.log('Subject:', mockEmailData.subject);
  console.log('Attachments:', Object.keys(mockEmailData).filter(k => k.startsWith('attachment_')));
  
  const req = https.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers:`, res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('\n=== Response ===');
      try {
        const response = JSON.parse(data);
        console.log(JSON.stringify(response, null, 2));
      } catch (e) {
        console.log('Raw response:', data);
      }
    });
  });
  
  req.on('error', (error) => {
    console.error('Request error:', error);
  });
  
  req.write(postData);
  req.end();
}

testWebhookSimple();
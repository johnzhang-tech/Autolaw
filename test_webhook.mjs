import https from 'https';

// Test the webhook endpoint
const data = JSON.stringify({
  "subject": "Test-my-6",
  "from": "test@example.com",
  "to": "demo@docuai.com",
  "attachment_0": {
    "filename": "Test Document.pdf",
    "data": "filesystem-v2",
    "mimeType": "application/pdf"
  }
});

const options = {
  hostname: 'beeed428-ed5d-4903-bc62-3ba70ac303df-00-38fn65dx21909.kirk.replit.dev',
  path: '/api/webhook/upload-attachments',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'docuai_demo_key_123',
    'Content-Length': data.length
  }
};

console.log('Testing webhook endpoint...');
console.log('URL:', `https://${options.hostname}${options.path}`);

const req = https.request(options, (res) => {
  console.log('Status:', res.statusCode);
  console.log('Headers:', res.headers);
  
  let responseData = '';
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  
  res.on('end', () => {
    console.log('Response:', responseData);
    try {
      const parsed = JSON.parse(responseData);
      console.log('Parsed response:', JSON.stringify(parsed, null, 2));
    } catch (e) {
      console.log('Could not parse JSON response');
    }
  });
});

req.on('error', (e) => {
  console.error('Request error:', e);
});

req.write(data);
req.end();
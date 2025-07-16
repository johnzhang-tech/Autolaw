import https from 'https';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create a simple text file for testing
const testContent = `This is a test document for webhook upload testing.
Date: ${new Date().toISOString()}
Transaction: Test-my-6
Purpose: Testing N8N webhook integration with multipart/form-data
`;

const testFileName = 'test-webhook-upload.txt';
const testFilePath = join(__dirname, testFileName);

// Write test file
fs.writeFileSync(testFilePath, testContent);

// Create multipart form data
const boundary = '----WebKitFormBoundary' + Math.random().toString(16).substring(2);
const fileData = fs.readFileSync(testFilePath);

const multipartData = [
  `--${boundary}`,
  'Content-Disposition: form-data; name="subject"',
  '',
  'Test-my-6',
  `--${boundary}`,
  'Content-Disposition: form-data; name="from"',
  '',
  'test@example.com',
  `--${boundary}`,
  'Content-Disposition: form-data; name="to"',
  '',
  'demo@docuai.com',
  `--${boundary}`,
  `Content-Disposition: form-data; name="test_attachment"; filename="${testFileName}"`,
  'Content-Type: text/plain',
  '',
  fileData.toString(),
  `--${boundary}--`,
  ''
].join('\r\n');

const options = {
  hostname: 'beeed428-ed5d-4903-bc62-3ba70ac303df-00-38fn65dx21909.kirk.replit.dev',
  path: '/api/webhook/upload-attachments',
  method: 'POST',
  headers: {
    'Content-Type': `multipart/form-data; boundary=${boundary}`,
    'X-API-Key': 'docuai_demo_key_123',
    'Content-Length': Buffer.byteLength(multipartData)
  }
};

console.log('Testing webhook endpoint with multipart/form-data...');
console.log('URL:', `https://${options.hostname}${options.path}`);
console.log('File:', testFileName);

const req = https.request(options, (res) => {
  console.log('Status:', res.statusCode);
  console.log('Headers:', JSON.stringify(res.headers, null, 2));
  
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
    
    // Clean up test file
    fs.unlinkSync(testFilePath);
  });
});

req.on('error', (e) => {
  console.error('Request error:', e);
  // Clean up test file
  fs.unlinkSync(testFilePath);
});

req.write(multipartData);
req.end();
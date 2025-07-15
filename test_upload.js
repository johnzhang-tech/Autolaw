import FormData from 'form-data';
import fs from 'fs';
import https from 'https';

// Create test file
const testContent = 'This is a test PDF file for upload testing';
fs.writeFileSync('test.pdf', testContent);

// Create form data
const form = new FormData();
form.append('test-file', fs.createReadStream('test.pdf'), {
  filename: 'test.pdf',
  contentType: 'application/pdf'
});

// Make request
const options = {
  hostname: 'beeed428-ed5d-4903-bc62-3ba70ac303df-00-38fn65dx21909.kirk.replit.dev',
  port: 443,
  path: '/api/transactions/52/upload-single',
  method: 'POST',
  headers: {
    'X-API-Key': 'docuai_demo_key_123',
    ...form.getHeaders()
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('Response Status:', res.statusCode);
    console.log('Response:', data);
  });
});

req.on('error', (e) => {
  console.error('Error:', e);
});

form.pipe(req);
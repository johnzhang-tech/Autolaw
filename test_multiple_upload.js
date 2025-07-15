import FormData from 'form-data';
import fs from 'fs';
import https from 'https';

// Create 6 different test files
const files = [
  { name: 'HOA-Declaration.pdf', content: 'HOA Declaration content - this is file 1' },
  { name: 'HOA-BY-LAWS.pdf', content: 'HOA Bylaws content - this is file 2' },
  { name: 'ArticlesOfIncorporation.pdf', content: 'Articles of Incorporation content - this is file 3' },
  { name: 'Contract.pdf', content: 'Contract content - this is file 4' },
  { name: 'Assessment.pdf', content: 'Assessment content - this is file 5' },
  { name: 'Minutes.pdf', content: 'Meeting Minutes content - this is file 6' }
];

// Create test files
files.forEach(file => {
  fs.writeFileSync(file.name, file.content);
});

// Create form data with multiple files
const form = new FormData();
files.forEach((file, index) => {
  form.append(`file${index + 1}`, fs.createReadStream(file.name), {
    filename: file.name,
    contentType: 'application/pdf'
  });
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
    
    // Cleanup test files
    files.forEach(file => {
      if (fs.existsSync(file.name)) {
        fs.unlinkSync(file.name);
      }
    });
  });
});

req.on('error', (e) => {
  console.error('Error:', e);
});

form.pipe(req);
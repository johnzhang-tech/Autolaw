import fs from 'fs';
import FormData from 'form-data';

// Test the new n8n endpoint with 6 different files to simulate the real scenario
const form = new FormData();

// Create different file content to simulate actual different files
const createTestFile = (content, filename) => {
  const buffer = Buffer.from(content, 'utf8');
  return { buffer, filename };
};

// Simulate 6 different files with different content
const files = [
  createTestFile('HOA Declaration Document Content - Article 1...', 'HOA-Declaration.pdf'),
  createTestFile('HOA Bylaws Document Content - Section 1...', 'HOA-BY-LAWS.pdf'),
  createTestFile('Articles of Incorporation Content - Clause 1...', 'ArticlesOfIncorporation.pdf'),
  createTestFile('Contract Document Content - Terms 1...', 'Contract.pdf'),
  createTestFile('Assessment Document Content - Fee Schedule...', 'Assessment.pdf'),
  createTestFile('Meeting Minutes Content - Date: Jan 2025...', 'Minutes.pdf')
];

// Add files with different field names (simulating n8n dynamic attachments)
files.forEach((file, index) => {
  form.append(`attachment_${index}`, file.buffer, { 
    filename: file.filename,
    contentType: 'application/pdf' 
  });
});

console.log('Testing N8N endpoint with 6 different files...');
console.log('Endpoint: /api/transactions/56/upload-n8n');

fetch('https://beeed428-ed5d-4903-bc62-3ba70ac303df-00-38fn65dx21909.kirk.replit.dev/api/transactions/53/upload-n8n', {
  method: 'POST',
  headers: {
    'X-API-Key': 'docuai_demo_key_123',
    ...form.getHeaders()
  },
  body: form
})
.then(async response => {
  console.log('Response Status:', response.status);
  const data = await response.json();
  console.log('Response:', JSON.stringify(data, null, 2));
})
.catch(error => {
  console.error('Error:', error.message);
});
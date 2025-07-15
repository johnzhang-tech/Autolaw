import fs from 'fs';
import FormData from 'form-data';

// Create test with the same file but different field names to simulate n8n issue
const form = new FormData();

// Simulate what n8n is doing - sending the same file 6 times with different field names
const fileBuffer = fs.readFileSync('test.pdf');

form.append('file1', fileBuffer, { 
  filename: 'Document1.pdf',
  contentType: 'application/pdf' 
});

form.append('file2', fileBuffer, { 
  filename: 'Document2.pdf', 
  contentType: 'application/pdf' 
});

form.append('file3', fileBuffer, { 
  filename: 'Document3.pdf',
  contentType: 'application/pdf' 
});

form.append('file4', fileBuffer, { 
  filename: 'Document4.pdf',
  contentType: 'application/pdf' 
});

form.append('file5', fileBuffer, { 
  filename: 'Document5.pdf',
  contentType: 'application/pdf' 
});

form.append('file6', fileBuffer, { 
  filename: 'Document6.pdf',
  contentType: 'application/pdf' 
});

console.log('Testing with same file content but different filenames...');
console.log('This simulates what n8n is doing in your workflow');

fetch('https://beeed428-ed5d-4903-bc62-3ba70ac303df-00-38fn65dx21909.kirk.replit.dev/api/transactions/55/upload-single', {
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
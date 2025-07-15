// Test to simulate N8N sending 6 different files

async function testN8NSixFiles() {
  console.log('Testing N8N with 6 different files...\n');
  
  // Step 1: Create a transaction
  console.log('Step 1: Creating transaction...');
  const transactionResponse = await fetch('http://localhost:5000/api/transactions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': 'docuai_demo_key_123'
    },
    body: JSON.stringify({
      name: 'N8N Six Files Test',
      address: '123 Test Street, Test City',
      transactionType: 'purchase'
    })
  });
  
  const transaction = await transactionResponse.json();
  console.log('Transaction created:', transaction.Tranx_id);
  
  // Step 2: Send 6 different files in multipart form
  console.log('\nStep 2: Uploading 6 different files...');
  const boundary = 'boundary123456789';
  
  const formData = [
    `--${boundary}`,
    'Content-Disposition: form-data; name="file1"; filename="Document1.pdf"',
    'Content-Type: application/pdf',
    '',
    'PDF content for Document1 - HOA Declaration',
    `--${boundary}`,
    'Content-Disposition: form-data; name="file2"; filename="Document2.pdf"',
    'Content-Type: application/pdf',
    '',
    'PDF content for Document2 - Meeting Minutes',
    `--${boundary}`,
    'Content-Disposition: form-data; name="file3"; filename="Document3.pdf"',
    'Content-Type: application/pdf',
    '',
    'PDF content for Document3 - Budget Report',
    `--${boundary}`,
    'Content-Disposition: form-data; name="file4"; filename="Document4.pdf"',
    'Content-Type: application/pdf',
    '',
    'PDF content for Document4 - Bylaws',
    `--${boundary}`,
    'Content-Disposition: form-data; name="file5"; filename="Document5.pdf"',
    'Content-Type: application/pdf',
    '',
    'PDF content for Document5 - Insurance Policy',
    `--${boundary}`,
    'Content-Disposition: form-data; name="file6"; filename="Document6.pdf"',
    'Content-Type: application/pdf',
    '',
    'PDF content for Document6 - Maintenance Schedule',
    `--${boundary}--`
  ].join('\r\n');

  const response = await fetch(`http://localhost:5000/api/transactions/${transaction.Tranx_id}/upload-n8n`, {
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'X-API-Key': 'docuai_demo_key_123'
    },
    body: formData
  });

  const result = await response.json();
  console.log('Upload status:', response.status);
  console.log('Upload result:', JSON.stringify(result, null, 2));
}

testN8NSixFiles().catch(console.error);
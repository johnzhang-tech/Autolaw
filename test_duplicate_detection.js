// ES module duplicate detection test

async function testDuplicateDetection() {
  console.log('Testing duplicate detection across multiple requests...\n');
  
  // Step 1: Create a transaction once
  console.log('Step 1: Creating transaction...');
  const transactionResponse = await fetch('http://localhost:5000/api/transactions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': 'docuai_demo_key_123'
    },
    body: JSON.stringify({
      name: 'Duplicate Test Transaction',
      address: '123 Test Street, Test City',
      transactionType: 'purchase'
    })
  });
  
  const transaction = await transactionResponse.json();
  console.log('Transaction created:', transaction.Tranx_id);
  
  const transactionId = transaction.Tranx_id;
  
  // Step 2: First upload - should succeed
  console.log('\nStep 2: First upload (should succeed)...');
  const firstResult = await uploadToTransaction(transactionId);
  console.log('First upload result:', JSON.stringify(firstResult, null, 2));
  
  // Step 3: Second upload - should detect duplicates
  console.log('\nStep 3: Second upload (should detect duplicates)...');
  const secondResult = await uploadToTransaction(transactionId);
  console.log('Second upload result:', JSON.stringify(secondResult, null, 2));
  
  // Step 4: Third upload - should still detect duplicates
  console.log('\nStep 4: Third upload (should still detect duplicates)...');
  const thirdResult = await uploadToTransaction(transactionId);
  console.log('Third upload result:', JSON.stringify(thirdResult, null, 2));
}

async function uploadToTransaction(transactionId) {
  const boundary = 'boundary' + Math.random().toString(36).substr(2, 15);
  
  const formData = [
    `--${boundary}`,
    'Content-Disposition: form-data; name="test_file"; filename="Test-Document.pdf"',
    'Content-Type: application/pdf',
    '',
    'PDF test content for duplicate detection',
    `--${boundary}`,
    'Content-Disposition: form-data; name="another_file"; filename="Another-Doc.pdf"',
    'Content-Type: application/pdf',
    '',
    'Another PDF test content',
    `--${boundary}--`
  ].join('\r\n');

  const response = await fetch(`http://localhost:5000/api/transactions/${transactionId}/upload-n8n`, {
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'X-API-Key': 'docuai_demo_key_123'
    },
    body: formData
  });

  return await response.json();
}

testDuplicateDetection().catch(console.error);
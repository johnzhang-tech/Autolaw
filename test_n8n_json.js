// Test the new JSON endpoint with multiple files

async function testN8NJsonEndpoint() {
  console.log('Testing N8N JSON endpoint with multiple files...\n');
  
  // Step 1: Create a transaction
  console.log('Step 1: Creating transaction...');
  const transactionResponse = await fetch('http://localhost:5000/api/transactions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': 'docuai_demo_key_123'
    },
    body: JSON.stringify({
      name: 'JSON Upload Test',
      address: '123 JSON Street, Test City',
      transactionType: 'purchase'
    })
  });
  
  const transaction = await transactionResponse.json();
  console.log('Transaction created:', transaction.Tranx_id);
  
  // Step 2: Create sample files as base64 (simulating N8N's file handling)
  const sampleFiles = [
    {
      filename: 'HOA-Declaration.pdf',
      content: 'Sample HOA Declaration content for testing',
      mimeType: 'application/pdf'
    },
    {
      filename: 'Meeting-Minutes.pdf', 
      content: 'Sample meeting minutes content for testing',
      mimeType: 'application/pdf'
    },
    {
      filename: 'Budget-Report.pdf',
      content: 'Sample budget report content for testing',
      mimeType: 'application/pdf'
    },
    {
      filename: 'Bylaws.pdf',
      content: 'Sample bylaws content for testing',
      mimeType: 'application/pdf'
    },
    {
      filename: 'Insurance-Policy.pdf',
      content: 'Sample insurance policy content for testing',
      mimeType: 'application/pdf'
    },
    {
      filename: 'Maintenance-Schedule.pdf',
      content: 'Sample maintenance schedule content for testing',
      mimeType: 'application/pdf'
    }
  ];
  
  // Step 3: Build JSON payload like N8N would
  console.log('\nStep 3: Building JSON payload...');
  const jsonPayload = {};
  
  sampleFiles.forEach((file, index) => {
    jsonPayload[`attachment_${index}`] = {
      filename: file.filename,
      data: Buffer.from(file.content).toString('base64'),
      mimeType: file.mimeType
    };
  });
  
  console.log('JSON payload keys:', Object.keys(jsonPayload));
  
  // Step 4: Send to JSON endpoint
  console.log('\nStep 4: Sending JSON to upload endpoint...');
  const response = await fetch(`http://localhost:5000/api/transactions/${transaction.Tranx_id}/upload-n8n-json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': 'docuai_demo_key_123'
    },
    body: JSON.stringify(jsonPayload)
  });

  const result = await response.json();
  console.log('Upload status:', response.status);
  console.log('Upload result:', JSON.stringify(result, null, 2));
  
  if (result.success) {
    console.log(`\n✅ SUCCESS: ${result.uploaded.length} files uploaded successfully!`);
    console.log('Files uploaded:', result.uploaded.map(f => f.fileName));
  } else {
    console.log(`\n❌ FAILED: ${result.error}`);
  }
}

testN8NJsonEndpoint().catch(console.error);
// Test the n8n endpoint using working multipart format
async function testN8NWorking() {
  console.log('Step 1: Creating transaction...');
  
  // Create transaction
  const createResponse = await fetch('https://beeed428-ed5d-4903-bc62-3ba70ac303df-00-38fn65dx21909.kirk.replit.dev/api/transactions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': 'docuai_demo_key_123'
    },
    body: JSON.stringify({
      name: 'N8N Working Test ' + Date.now(),
      transactionType: 'purchase',
      propertyType: 'condo'
    })
  });
  
  const transaction = await createResponse.json();
  console.log('Transaction created:', transaction.Tranx_id);
  
  console.log('\nStep 2: Testing n8n upload with manual multipart...');
  
  // Test n8n upload with working multipart format
  const boundary = 'boundary123456789';
  const multipartBody = `--${boundary}\r
Content-Disposition: form-data; name="hoa_document"; filename="HOA-Declaration.pdf"\r
Content-Type: application/pdf\r
\r
HOA Declaration Document Content - Article 1...\r
--${boundary}\r
Content-Disposition: form-data; name="bylaws"; filename="Bylaws.pdf"\r
Content-Type: application/pdf\r
\r
HOA Bylaws Document Content - Section 1...\r
--${boundary}--\r
`;

  const uploadResponse = await fetch(`https://beeed428-ed5d-4903-bc62-3ba70ac303df-00-38fn65dx21909.kirk.replit.dev/api/transactions/${transaction.Tranx_id}/upload-n8n`, {
    method: 'POST',
    headers: {
      'X-API-Key': 'docuai_demo_key_123',
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Content-Length': multipartBody.length.toString()
    },
    body: multipartBody
  });

  console.log('Upload Status:', uploadResponse.status);
  const uploadResult = await uploadResponse.json();
  console.log('Upload Result:', JSON.stringify(uploadResult, null, 2));
}

testN8NWorking().catch(console.error);
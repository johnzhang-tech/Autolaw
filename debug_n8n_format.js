// Debug what N8N is actually sending to the JSON endpoint

async function debugN8NFormat() {
  console.log('Testing what N8N should send to JSON endpoint...\n');
  
  // Test with larger, more realistic PDF content
  const testPayload = {
    attachment_0: {
      filename: "Jan Meeting Minutes Revised.pdf",
      data: Buffer.from("Sample PDF content for Jan Meeting Minutes".repeat(100)).toString('base64'),
      mimeType: "application/pdf"
    },
    attachment_1: {
      filename: "HOA Assessment Delinquency Policy.pdf", 
      data: Buffer.from("Sample PDF content for HOA Assessment".repeat(100)).toString('base64'),
      mimeType: "application/pdf"
    }
  };
  
  console.log('Test payload structure:');
  console.log('Keys:', Object.keys(testPayload));
  console.log('Attachment 0 structure:', {
    filename: testPayload.attachment_0.filename,
    hasData: !!testPayload.attachment_0.data,
    dataLength: testPayload.attachment_0.data.length,
    mimeType: testPayload.attachment_0.mimeType
  });
  
  // Send to JSON endpoint
  const response = await fetch('http://localhost:5000/api/transactions/81/upload-n8n-json', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': 'docuai_demo_key_123'
    },
    body: JSON.stringify(testPayload)
  });

  const result = await response.json();
  console.log('\nResponse status:', response.status);
  console.log('Response result:', JSON.stringify(result, null, 2));
}

debugN8NFormat().catch(console.error);
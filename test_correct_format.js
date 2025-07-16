async function testCorrectFormat() {
  // Create a simple test file
  const testContent = "This is a test document for webhook upload";
  const base64Content = Buffer.from(testContent).toString('base64');
  
  const payload = {
    subject: "Test-my-6", // This should match your transaction name
    attachment_0: {
      filename: "test-document.txt",
      data: base64Content,
      mimeType: "text/plain"
    }
  };
  
  console.log('Testing correct webhook format...');
  console.log('Payload:', JSON.stringify(payload, null, 2));
  
  try {
    const response = await fetch('https://beeed428-ed5d-4903-bc62-3ba70ac303df-00-38fn65dx21909.kirk.replit.dev/api/webhook/upload-attachments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'docuai_demo_key_123'
      },
      body: JSON.stringify(payload)
    });
    
    console.log('Status:', response.status);
    const result = await response.json();
    console.log('Response:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testCorrectFormat();
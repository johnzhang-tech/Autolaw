async function testUploadMultipleJSON() {
  // Create test files with base64 data
  const file1Content = "This is test document 1 for JSON upload";
  const file2Content = "This is test document 2 for JSON upload";
  const file3Content = "This is test document 3 for JSON upload";
  
  const payload = {
    files: [
      {
        filename: "test-doc-1.txt",
        mimeType: "text/plain",
        data: Buffer.from(file1Content).toString('base64')
      },
      {
        filename: "test-doc-2.txt",
        mimeType: "text/plain", 
        data: Buffer.from(file2Content).toString('base64')
      },
      {
        filename: "test-doc-3.pdf",
        mimeType: "application/pdf",
        data: Buffer.from(file3Content).toString('base64') // Fake PDF for testing
      }
    ]
  };
  
  console.log('Testing JSON-based upload-multiple endpoint...');
  console.log(`Uploading ${payload.files.length} files to transaction 81`);
  
  try {
    const response = await fetch('https://beeed428-ed5d-4903-bc62-3ba70ac303df-00-38fn65dx21909.kirk.replit.dev/api/transactions/81/upload-multiple', {
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
    
    if (result.success) {
      console.log(`✅ Success: ${result.uploadedFiles.length} files uploaded`);
      result.uploadedFiles.forEach(file => {
        console.log(`   - ${file.filename} (ID: ${file.documentId}, Size: ${file.size})`);
      });
    } else {
      console.log('❌ Upload failed:', result.message);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testUploadMultipleJSON();
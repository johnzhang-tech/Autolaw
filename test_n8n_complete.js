import fs from 'fs';
import FormData from 'form-data';

// Complete test: Create transaction + Upload files
async function testN8NComplete() {
  
  // Step 1: Create a transaction
  console.log('Step 1: Creating transaction...');
  const createResponse = await fetch('https://beeed428-ed5d-4903-bc62-3ba70ac303df-00-38fn65dx21909.kirk.replit.dev/api/transactions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': 'docuai_demo_key_123'
    },
    body: JSON.stringify({
      name: 'N8N Test Transaction ' + Date.now(),
      transactionType: 'purchase',
      propertyType: 'condo'
    })
  });
  
  const transaction = await createResponse.json();
  console.log('Transaction created:', transaction.Tranx_id);
  
  // Step 2: Upload multiple different files to test duplicate detection
  console.log('\nStep 2: Uploading 6 different files...');
  
  const form = new FormData();

  // Create 6 different files with different content
  const files = [
    { content: 'HOA Declaration Document Content - Article 1...', filename: 'HOA-Declaration.pdf' },
    { content: 'HOA Bylaws Document Content - Section 1...', filename: 'HOA-BY-LAWS.pdf' },
    { content: 'Articles of Incorporation Content - Clause 1...', filename: 'ArticlesOfIncorporation.pdf' },
    { content: 'Contract Document Content - Terms 1...', filename: 'Contract.pdf' },
    { content: 'Assessment Document Content - Fee Schedule...', filename: 'Assessment.pdf' },
    { content: 'Meeting Minutes Content - Date: Jan 2025...', filename: 'Minutes.pdf' }
  ];

  // Add files with different field names
  files.forEach((file, index) => {
    const buffer = Buffer.from(file.content, 'utf8');
    form.append(`attachment_${index}`, buffer, { 
      filename: file.filename,
      contentType: 'application/pdf' 
    });
  });

  const uploadResponse = await fetch(`https://beeed428-ed5d-4903-bc62-3ba70ac303df-00-38fn65dx21909.kirk.replit.dev/api/transactions/${transaction.Tranx_id}/upload-n8n`, {
    method: 'POST',
    headers: {
      'X-API-Key': 'docuai_demo_key_123',
      ...form.getHeaders()
    },
    body: form
  });

  console.log('Upload Status:', uploadResponse.status);
  const uploadResult = await uploadResponse.json();
  console.log('Upload Result:', JSON.stringify(uploadResult, null, 2));
}

testN8NComplete().catch(console.error);
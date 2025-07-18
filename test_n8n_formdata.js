import FormData from 'form-data';
import fetch from 'node-fetch';

const BASE_URL = 'https://beeed428-ed5d-4903-bc62-3ba70ac303df-00-38fn65dx21909.kirk.replit.dev';
const API_KEY = 'docuai_demo_key_123';
const TRANSACTION_ID = 88;

async function testFormDataUpload() {
  console.log('=== Testing N8N Form-Data Method ===');
  
  // Create form data exactly like N8N would
  const form = new FormData();
  
  // Add the file (simulate PDF content)
  const pdfContent = Buffer.from('%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n>>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000010 00000 n \n0000000079 00000 n \n0000000173 00000 n \ntrailer\n<<\n/Size 4\n/Root 1 0 R\n>>\nstartxref\n253\n%%EOF');
  
  // Method 1: N8N Form-Data approach
  form.append('document', pdfContent, {
    filename: 'HOA-Assessment-Policy.pdf',
    contentType: 'application/pdf'
  });
  
  // Add the filename parameter as N8N would
  form.append('filename', 'HOA-Assessment-Policy.pdf');
  
  try {
    const response = await fetch(`${BASE_URL}/api/transactions/${TRANSACTION_ID}/upload-single`, {
      method: 'POST',
      headers: {
        'X-API-Key': API_KEY,
        ...form.getHeaders()
      },
      body: form
    });
    
    const result = await response.json();
    console.log('Form-Data Upload Response:');
    console.log('Status:', response.status);
    console.log('Result:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('\n✅ SUCCESS: Form-data method preserved filename!');
      console.log('Original filename:', result.document?.originalFileName);
      console.log('Stored filename:', result.document?.fileName);
    } else {
      console.log('\n❌ FAILED:', result.error);
    }
    
  } catch (error) {
    console.error('Form-data test error:', error.message);
  }
}

// Test header method for comparison
async function testHeaderMethod() {
  console.log('\n=== Testing Header Method ===');
  
  const pdfContent = Buffer.from('%PDF-1.4 test content for header method');
  
  try {
    const response = await fetch(`${BASE_URL}/api/transactions/${TRANSACTION_ID}/upload-single`, {
      method: 'POST',
      headers: {
        'X-API-Key': API_KEY,
        'X-Filename': 'Header-Method-Test.pdf',
        'Content-Type': 'application/pdf'
      },
      body: pdfContent
    });
    
    const result = await response.json();
    console.log('Header Upload Response:');
    console.log('Status:', response.status);
    console.log('Result:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('\n✅ SUCCESS: Header method preserved filename!');
      console.log('Original filename:', result.document?.originalFileName);
    } else {
      console.log('\n❌ FAILED:', result.error);
    }
    
  } catch (error) {
    console.error('Header test error:', error.message);
  }
}

// Run tests
async function runTests() {
  await testFormDataUpload();
  await testHeaderMethod();
  
  console.log('\n=== Test Summary ===');
  console.log('Both methods should now preserve original filenames instead of generating random names like "raw-binary-1752721581912.pdf"');
}

runTests().catch(console.error);
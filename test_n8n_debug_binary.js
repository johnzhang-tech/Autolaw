import FormData from 'form-data';
import fetch from 'node-fetch';

// Test N8N Form-Data method with debugging for binary field detection
async function testN8NFormDataDebug() {
  console.log('=== N8N Form-Data Binary Field Debug Test ===');
  
  try {
    // Create test file
    const testContent = '%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000010 00000 n \n0000000060 00000 n \n0000000120 00000 n \ntrailer\n<< /Size 4 /Root 1 0 R >>\nstartxref\n200\n%%EOF';
    
    // Test with common N8N binary field names
    const binaryFieldNames = ['data', 'attachment', 'file', 'binary_data', 'document'];
    
    for (const fieldName of binaryFieldNames) {
      console.log(`\n--- Testing with field name: "${fieldName}" ---`);
      
      const form = new FormData();
      
      // Add the file with current field name
      form.append(fieldName, Buffer.from(testContent), {
        filename: 'Test-Original-Filename.pdf',
        contentType: 'application/pdf'
      });
      
      // Add filename parameter
      form.append('filename', 'Test-Original-Filename.pdf');
      
      const response = await fetch(
        'http://localhost:5000/api/transactions/88/upload-single',
        {
          method: 'POST',
          headers: {
            'X-API-Key': 'docuai_demo_key_123',
            ...form.getHeaders()
          },
          body: form
        }
      );
      
      const result = await response.json();
      
      console.log(`Field "${fieldName}" Response:`, {
        status: response.status,
        success: result.success,
        filename: result.document?.fileName,
        error: result.error
      });
      
      if (result.success) {
        console.log(`✅ SUCCESS with field name: "${fieldName}"`);
        console.log(`📁 Preserved filename: ${result.document.fileName}`);
        break;
      } else {
        console.log(`❌ FAILED with field name: "${fieldName}"`);
      }
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

// Test different filename parameter approaches
async function testFilenameParameters() {
  console.log('\n=== Testing Different Filename Parameter Methods ===');
  
  const testContent = '%PDF-1.4\nTest content for filename preservation testing';
  
  const methods = [
    { name: 'Form parameter', field: 'filename', value: 'FormParam-Test.pdf' },
    { name: 'Custom header', field: 'X-Filename', value: 'HeaderParam-Test.pdf' },
    { name: 'Query parameter', url: '?filename=QueryParam-Test.pdf', value: 'QueryParam-Test.pdf' }
  ];
  
  for (const method of methods) {
    console.log(`\n--- Testing: ${method.name} ---`);
    
    const form = new FormData();
    form.append('document', Buffer.from(testContent), {
      filename: 'OriginalName.pdf',
      contentType: 'application/pdf'
    });
    
    const headers = {
      'X-API-Key': 'docuai_demo_key_123',
      ...form.getHeaders()
    };
    
    // Add custom header if specified
    if (method.field && method.field.startsWith('X-')) {
      headers[method.field] = method.value;
    } else if (method.field) {
      // Add as form parameter
      form.append(method.field, method.value);
    }
    
    const url = 'http://localhost:5000/api/transactions/88/upload-single' + (method.url || '');
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: form
      });
      
      const result = await response.json();
      
      console.log(`${method.name} Result:`, {
        status: response.status,
        success: result.success,
        expectedFilename: method.value,
        actualFilename: result.document?.fileName,
        matches: result.document?.fileName === method.value
      });
      
      if (result.success && result.document?.fileName === method.value) {
        console.log(`✅ ${method.name} method works perfectly!`);
      }
      
    } catch (error) {
      console.log(`❌ ${method.name} failed:`, error.message);
    }
  }
}

// Run both tests
async function runAllTests() {
  await testN8NFormDataDebug();
  await testFilenameParameters();
}

runAllTests();
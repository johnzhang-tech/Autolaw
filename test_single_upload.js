import fs from 'fs';
import FormData from 'form-data';
import axios from 'axios';

async function testSingleUpload() {
  try {
    const form = new FormData();
    
    // Test with a custom field name that n8n might use
    form.append('attachment_0', fs.createReadStream('test.pdf'), {
      filename: 'test.pdf',
      contentType: 'application/pdf'
    });
    
    console.log('Testing single file upload with custom field name...');
    
    const response = await axios.post(
      'https://beeed428-ed5d-4903-bc62-3ba70ac303df-00-38fn65dx21909.kirk.replit.dev/api/transactions/54/upload-single',
      form,
      {
        headers: {
          'X-API-Key': 'docuai_demo_key_123',
          ...form.getHeaders()
        }
      }
    );
    
    console.log('Response Status:', response.status);
    console.log('Response:', response.data);
    
  } catch (error) {
    console.log('Response Status:', error.response?.status);
    console.log('Response:', error.response?.data);
  }
}

testSingleUpload();
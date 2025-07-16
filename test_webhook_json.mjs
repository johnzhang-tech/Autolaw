import fetch from 'node-fetch';
import fs from 'fs';

async function testWebhookJSON() {
  try {
    console.log('Testing webhook endpoint with JSON format...');
    
    // Read a test file and convert to base64
    const testFile = 'test-webhook-upload.txt';
    const fileContent = fs.readFileSync(testFile);
    const base64Content = fileContent.toString('base64');
    
    // Create JSON payload similar to N8N format
    const jsonPayload = {
      subject: 'Test-my-6',
      from: 'test@example.com',
      to: 'demo@docuai.com',
      attachment_0: {
        filename: 'test-webhook-upload.txt',
        data: base64Content,
        mimeType: 'text/plain'
      }
    };
    
    const url = 'https://beeed428-ed5d-4903-bc62-3ba70ac303df-00-38fn65dx21909.kirk.replit.dev/api/webhook/upload-attachments';
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'docuai_demo_key_123'
      },
      body: JSON.stringify(jsonPayload)
    });
    
    console.log('URL:', url);
    console.log('Payload:', JSON.stringify(jsonPayload, null, 2));
    console.log('Status:', response.status);
    console.log('Headers:', Object.fromEntries(response.headers));
    
    const responseText = await response.text();
    console.log('Response:', responseText);
    
    try {
      const parsedResponse = JSON.parse(responseText);
      console.log('Parsed response:', JSON.stringify(parsedResponse, null, 2));
    } catch (e) {
      console.log('Could not parse response as JSON');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testWebhookJSON();
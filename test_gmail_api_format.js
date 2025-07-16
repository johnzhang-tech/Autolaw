import fetch from 'node-fetch';

async function testGmailAPIFormat() {
    const url = 'https://beeed428-ed5d-4903-bc62-3ba70ac303df-00-38fn65dx21909.kirk.replit.dev/api/webhook/upload-attachments';
    
    // Simulate Gmail API response format that N8N might send
    const payload = {
        id: "test-message-id",
        threadId: "test-thread-id",
        labelIds: ["INBOX"],
        sizeEstimate: 1234,
        headers: [
            { name: "From", value: "test@example.com" },
            { name: "To", value: "demo@docuai.com" },
            { name: "Subject", value: "Test-my-6" }
        ],
        html: "<p>Test email with attachment</p>",
        text: "Test email with attachment",
        textAsHtml: "<p>Test email with attachment</p>",
        subject: "Test-my-6",
        date: "2025-07-16T00:00:00.000Z",
        to: "demo@docuai.com",
        from: "test@example.com",
        messageId: "test-message-id"
    };
    
    console.log('Testing Gmail API format webhook...');
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': 'docuai_demo_key_123'
            },
            body: JSON.stringify(payload)
        });
        
        const result = await response.json();
        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(result, null, 2));
        
        if (result.suggestion) {
            console.log('\n📋 Suggestion for N8N workflow:');
            console.log(result.suggestion);
        }
        
        if (result.expectedFormat) {
            console.log('\n📝 Expected format:');
            console.log(JSON.stringify(result.expectedFormat, null, 2));
        }
        
    } catch (error) {
        console.error('Error:', error);
    }
}

testGmailAPIFormat();
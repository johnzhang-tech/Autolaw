import fetch from 'node-fetch';

async function debugWebhook() {
    const url = 'https://beeed428-ed5d-4903-bc62-3ba70ac303df-00-38fn65dx21909.kirk.replit.dev/api/webhook/upload-attachments';
    
    const payload = {
        subject: "Test-my-6",
        from: "test@example.com",
        to: "demo@docuai.com",
        attachment_0: {
            filename: "debug-test.txt",
            data: Buffer.from("Debug test content").toString('base64'),
            mimeType: "text/plain"
        }
    };
    
    console.log('Sending payload:', JSON.stringify(payload, null, 2));
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': 'docuai_demo_key_123'
            },
            body: JSON.stringify(payload)
        });
        
        console.log('Status:', response.status);
        console.log('Headers:', response.headers.raw());
        
        const responseText = await response.text();
        console.log('Response:', responseText);
        
        if (response.ok) {
            try {
                const jsonResponse = JSON.parse(responseText);
                console.log('Parsed response:', JSON.stringify(jsonResponse, null, 2));
            } catch (e) {
                console.log('Could not parse as JSON:', e.message);
            }
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

debugWebhook();
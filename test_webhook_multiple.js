import fetch from 'node-fetch';

async function testMultipleFiles() {
    const url = 'https://beeed428-ed5d-4903-bc62-3ba70ac303df-00-38fn65dx21909.kirk.replit.dev/api/webhook/upload-attachments';
    
    const payload = {
        subject: "Test-my-6",
        from: "test@example.com",
        to: "demo@docuai.com",
        attachment_0: {
            filename: "document-1.txt",
            data: Buffer.from("First document content").toString('base64'),
            mimeType: "text/plain"
        },
        attachment_1: {
            filename: "document-2.txt",
            data: Buffer.from("Second document content").toString('base64'),
            mimeType: "text/plain"
        },
        attachment_2: {
            filename: "document-3.txt",
            data: Buffer.from("Third document content").toString('base64'),
            mimeType: "text/plain"
        }
    };
    
    console.log('Testing multiple file upload...');
    
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
        
        if (result.success) {
            console.log(`✅ Success: ${result.uploadedFiles.length} files uploaded successfully`);
            result.uploadedFiles.forEach(file => {
                console.log(`  - ${file.filename} (ID: ${file.documentId}, Size: ${file.size})`);
            });
        } else {
            console.log('❌ Error:', result.error);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

testMultipleFiles();
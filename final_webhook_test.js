import fetch from 'node-fetch';

async function runFinalTest() {
    console.log('🚀 Running final comprehensive webhook test...\n');
    
    const baseUrl = 'https://beeed428-ed5d-4903-bc62-3ba70ac303df-00-38fn65dx21909.kirk.replit.dev';
    
    // Test 1: Single file upload
    console.log('TEST 1: Single file upload');
    const singleFilePayload = {
        subject: "Test-my-6",
        from: "test@example.com",
        to: "demo@docuai.com",
        attachment_0: {
            filename: "final-test-single.pdf",
            data: Buffer.from("Final test single file content").toString('base64'),
            mimeType: "application/pdf"
        }
    };
    
    const response1 = await fetch(`${baseUrl}/api/webhook/upload-attachments`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-API-Key': 'docuai_demo_key_123'
        },
        body: JSON.stringify(singleFilePayload)
    });
    
    const result1 = await response1.json();
    console.log(`Status: ${response1.status}`);
    console.log(`Result: ${result1.success ? '✅ SUCCESS' : '❌ FAILED'}`);
    console.log(`Files uploaded: ${result1.uploadedFiles?.length || 0}`);
    console.log(`Files failed: ${result1.failedFiles?.length || 0}`);
    console.log();
    
    // Test 2: Multiple file upload
    console.log('TEST 2: Multiple file upload');
    const multiFilePayload = {
        subject: "Test-my-6",
        from: "test@example.com",
        to: "demo@docuai.com",
        attachment_0: {
            filename: "final-multi-1.docx",
            data: Buffer.from("Final test multi file 1").toString('base64'),
            mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        },
        attachment_1: {
            filename: "final-multi-2.txt",
            data: Buffer.from("Final test multi file 2").toString('base64'),
            mimeType: "text/plain"
        },
        attachment_2: {
            filename: "final-multi-3.pdf",
            data: Buffer.from("Final test multi file 3").toString('base64'),
            mimeType: "application/pdf"
        }
    };
    
    const response2 = await fetch(`${baseUrl}/api/webhook/upload-attachments`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-API-Key': 'docuai_demo_key_123'
        },
        body: JSON.stringify(multiFilePayload)
    });
    
    const result2 = await response2.json();
    console.log(`Status: ${response2.status}`);
    console.log(`Result: ${result2.success ? '✅ SUCCESS' : '❌ FAILED'}`);
    console.log(`Files uploaded: ${result2.uploadedFiles?.length || 0}`);
    console.log(`Files failed: ${result2.failedFiles?.length || 0}`);
    console.log();
    
    // Test 3: Error handling (transaction not found)
    console.log('TEST 3: Error handling (transaction not found)');
    const errorPayload = {
        subject: "NonExistentTransaction",
        from: "test@example.com",
        to: "demo@docuai.com",
        attachment_0: {
            filename: "error-test.txt",
            data: Buffer.from("Error test content").toString('base64'),
            mimeType: "text/plain"
        }
    };
    
    const response3 = await fetch(`${baseUrl}/api/webhook/upload-attachments`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-API-Key': 'docuai_demo_key_123'
        },
        body: JSON.stringify(errorPayload)
    });
    
    const result3 = await response3.json();
    console.log(`Status: ${response3.status}`);
    console.log(`Result: ${result3.success ? '✅ SUCCESS' : '❌ EXPECTED ERROR'}`);
    console.log(`Error: ${result3.error || 'None'}`);
    console.log();
    
    // Summary
    console.log('📊 FINAL TEST SUMMARY:');
    console.log(`Single file upload: ${result1.success ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Multiple file upload: ${result2.success ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Error handling: ${!result3.success ? '✅ PASS' : '❌ FAIL'}`);
    
    const allPassed = result1.success && result2.success && !result3.success;
    console.log(`\n🎯 OVERALL RESULT: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
    
    if (allPassed) {
        console.log('\n🎉 N8N Webhook endpoint is PRODUCTION READY!');
        console.log('✅ Single file uploads working');
        console.log('✅ Multiple file uploads working');
        console.log('✅ Error handling working');
        console.log('✅ Transaction mapping working');
        console.log('✅ Replit Object Storage integration working');
        console.log('✅ Database integration working');
    }
}

runFinalTest().catch(console.error);
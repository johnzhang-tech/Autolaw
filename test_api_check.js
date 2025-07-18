// Quick test to check transactions and test form-data upload

import https from 'https';

const BASE_URL = 'beeed428-ed5d-4903-bc62-3ba70ac303df-00-38fn65dx21909.kirk.replit.dev';
const API_KEY = 'docuai_demo_key_123';

// Function to make API calls
function makeRequest(path, method = 'GET', data = null, isFormData = false) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: BASE_URL,
      path: path,
      method: method,
      headers: {
        'X-API-Key': API_KEY
      }
    };

    if (data && !isFormData) {
      options.headers['Content-Type'] = 'application/json';
      options.headers['Content-Length'] = Buffer.byteLength(JSON.stringify(data));
    }

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data && !isFormData) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function checkTransactions() {
  try {
    console.log('Checking transactions...');
    const result = await makeRequest('/api/transactions');
    console.log('Transactions response:', JSON.stringify(result, null, 2));
    
    // Find transaction 88 or show available transactions
    if (result.data && Array.isArray(result.data)) {
      const trans88 = result.data.find(t => t.Tranx_id === 88 || t.id === 88);
      if (trans88) {
        console.log('\nTransaction 88 found:', trans88);
        return 88;
      } else {
        console.log('\nTransaction 88 not found. Available transactions:');
        result.data.slice(0, 5).forEach(t => {
          console.log(`- ID: ${t.Tranx_id || t.id}, Name: ${t.name}`);
        });
        return result.data[0]?.Tranx_id || result.data[0]?.id || null;
      }
    }
    return null;
  } catch (error) {
    console.error('Error checking transactions:', error.message);
    return null;
  }
}

async function testFormDataUpload(transactionId) {
  if (!transactionId) {
    console.log('No transaction ID available for testing');
    return;
  }

  console.log(`\nTesting form-data upload to transaction ${transactionId}...`);
  
  // Note: This is a simplified test. In N8N, you would use actual form-data
  // with multipart/form-data content type and proper boundaries
  try {
    const result = await makeRequest(`/api/transactions/${transactionId}/upload-single`, 'POST', {
      filename: 'Test-Form-Data-File.pdf'
    });
    console.log('Form-data test result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Form-data test error:', error.message);
  }
}

// Run the checks
async function main() {
  const transactionId = await checkTransactions();
  await testFormDataUpload(transactionId);
}

main().catch(console.error);
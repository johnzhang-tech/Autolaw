// Quick script to fix document count discrepancy
const fetch = require('node-fetch');

async function fixDocumentCounts() {
  try {
    const response = await fetch('http://localhost:5000/api/admin/recalculate-document-counts', {
      method: 'POST',
      headers: {
        'X-API-Key': 'docuai_demo_key_123',
        'Content-Type': 'application/json'
      }
    });
    
    const result = await response.json();
    console.log('Document count fix result:', result);
  } catch (error) {
    console.error('Error fixing document counts:', error);
  }
}

fixDocumentCounts();
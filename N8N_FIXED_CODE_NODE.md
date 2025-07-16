# N8N Fixed Code Node - Alternative Approach

The issue is that `this.helpers.getBinaryData()` might not be working as expected. Let's try a different approach that uses N8N's built-in binary data handling:

```javascript
// DocuAI File Upload - Fixed Code for N8N Binary Data
const files = [];

console.log('=== PROCESSING FILES FOR DOCUAI ===');

// Process all input items
for (const item of $input.all()) {
  console.log('Processing item...');
  
  // Check if item has binary data
  if (item.binary) {
    console.log(`Found ${Object.keys(item.binary).length} binary files`);
    
    // Process each binary attachment
    for (const [key, binaryData] of Object.entries(item.binary)) {
      try {
        console.log(`Processing file: ${binaryData.fileName}`);
        console.log(`Binary ID: ${binaryData.id}`);
        
        // Try different methods to get binary data
        let base64Data;
        
        // Method 1: Try getBinaryData with the full ID
        try {
          console.log('Trying getBinaryData method...');
          const binaryBuffer = await this.helpers.getBinaryData(binaryData.id);
          base64Data = binaryBuffer.toString('base64');
          console.log(`✓ getBinaryData success: ${Math.round(base64Data.length/1024)}KB`);
        } catch (error1) {
          console.log(`getBinaryData failed: ${error1.message}`);
          
          // Method 2: Try with just the UUID part
          try {
            console.log('Trying with UUID only...');
            const uuid = binaryData.id.split('/').pop();
            const binaryBuffer = await this.helpers.getBinaryData(uuid);
            base64Data = binaryBuffer.toString('base64');
            console.log(`✓ UUID method success: ${Math.round(base64Data.length/1024)}KB`);
          } catch (error2) {
            console.log(`UUID method failed: ${error2.message}`);
            
            // Method 3: Try reading from input binary directly
            try {
              console.log('Trying direct binary access...');
              const inputBinary = $input.item(0).binary[key];
              const binaryBuffer = await this.helpers.getBinaryData(inputBinary.id);
              base64Data = binaryBuffer.toString('base64');
              console.log(`✓ Direct access success: ${Math.round(base64Data.length/1024)}KB`);
            } catch (error3) {
              console.log(`Direct access failed: ${error3.message}`);
              console.log('All methods failed, skipping this file');
              continue;
            }
          }
        }
        
        if (base64Data) {
          const fileInfo = {
            filename: binaryData.fileName,
            mimeType: binaryData.mimeType,
            data: base64Data
          };
          
          files.push(fileInfo);
          console.log(`✓ Added: ${binaryData.fileName} (${Math.round(base64Data.length/1024)}KB base64)`);
        }
        
      } catch (error) {
        console.error(`✗ Error processing ${binaryData.fileName}:`, error.message);
        console.error('Full error:', error);
      }
    }
  } else {
    console.log('No binary data found in item');
  }
}

console.log(`=== TOTAL FILES PROCESSED: ${files.length} ===`);

// Return the properly formatted data for DocuAI API
return [{ 
  json: { 
    files: files 
  } 
}];
```

This code tries three different methods to access the binary data:

1. **Full ID method**: Uses the complete filesystem ID
2. **UUID method**: Extracts just the UUID portion
3. **Direct access**: Accesses binary data directly from input

The extensive logging will show us exactly what's happening and which method works with your N8N setup.

Try this code and share the console output - it will tell us exactly why the binary data isn't being accessed correctly.
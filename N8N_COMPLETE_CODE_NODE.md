# Complete N8N Code Node for DocuAI Integration

## Code Node Configuration

**Operation**: Run code once for all input items

**Complete JavaScript Code**:

```javascript
// DocuAI File Upload - Complete Code Node
// This code converts N8N binary data to DocuAI's expected JSON format

const files = [];

// Helper function to get extension from MIME type
function getExtensionFromMimeType(mimeType) {
  const mimeMap = {
    'application/pdf': '.pdf',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
    'text/plain': '.txt',
    'text/csv': '.csv',
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif'
  };
  return mimeMap[mimeType] || '.bin';
}

// Process all input items
for (const item of $input.all()) {
  console.log('Processing item:', JSON.stringify(item, null, 2));
  
  // Check if item has binary data
  if (item.binary) {
    console.log(`Found ${Object.keys(item.binary).length} binary files`);
    
    // Process each binary attachment
    for (const [key, binaryData] of Object.entries(item.binary)) {
      try {
        let filename = binaryData.fileName;
        
        // If no original filename, create one with proper extension
        if (!filename) {
          const ext = getExtensionFromMimeType(binaryData.mimeType);
          filename = `attachment_${key}${ext}`;
        }
        
        // Read binary data using N8N's getBinaryData function
        const binaryBuffer = await this.helpers.getBinaryData(binaryData.id);
        const base64Data = binaryBuffer.toString('base64');
        
        const fileInfo = {
          filename: filename,
          mimeType: binaryData.mimeType || 'application/octet-stream',
          data: base64Data
        };
        
        files.push(fileInfo);
        
        console.log(`Added file: ${filename} (${binaryData.mimeType}, ${base64Data.length} chars base64)`);
        
      } catch (error) {
        console.error(`Error processing file ${key}:`, error);
      }
    }
  } else {
    console.log('No binary data found in item');
  }
}

console.log(`Total files processed: ${files.length}`);

// Return the properly formatted data for DocuAI API
return [{ 
  json: { 
    files: files 
  } 
}];
```

## What This Code Does

1. **Processes all input items** from the previous N8N node
2. **Finds binary data** in each item (attachments, uploaded files, etc.)
3. **Preserves original filenames** when available
4. **Generates proper filenames** with correct extensions if missing
5. **Converts filesystem references** to actual base64 data using N8N's helper function
6. **Creates the exact JSON structure** that DocuAI expects
7. **Provides detailed logging** for debugging

## Expected Output Format

The code produces this JSON structure:

```json
{
  "files": [
    {
      "filename": "Jan Meeting Minutes Revised.pdf",
      "mimeType": "application/pdf", 
      "data": "JVBERi0xLjQKJcfs..." // base64 encoded file content
    },
    {
      "filename": "HOA Assessment Delinquency Policy (Approved Aug 2006).pdf",
      "mimeType": "application/pdf",
      "data": "JVBERi0xLjQKJcfs..." // base64 encoded file content
    }
  ]
}
```

## Important Notes

- **Use this exact code** - it handles the filesystem-v2 references properly
- **Enable logging** in your N8N workflow to see the console.log outputs
- **Make sure your Code node is set to** "Run code once for all input items"
- **The code is async** - it uses `await` to properly read binary data

## Next Steps

1. **Copy this exact code** into your N8N Code node
2. **Set the operation** to "Run code once for all input items"
3. **Run the workflow** and check the logs to verify file processing
4. **Connect the Code node** to your HTTP Request node
5. **Use `{{ $json }}`** as the HTTP Request body

This code will properly convert your N8N binary data to the format DocuAI expects, resolving the "filesystem-v2" issue you encountered.
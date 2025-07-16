# N8N Correct JSON Configuration Guide

## Problem Identified

The error "JSON parameter needs to be valid JSON" occurs because N8N is trying to reference binary data directly in the JSON body like this:

```json
{
  "files": {{$item("xxx").binary_key_you_may_have}}
}
```

This is **invalid JSON syntax** and causes the error you're seeing.

## Solution: Proper N8N Workflow Setup

### Step 1: Add a Code Node (Before HTTP Request)

Insert a **Code Node** between your file input and HTTP Request node with this JavaScript:

```javascript
// Convert binary attachments to the required JSON format
const files = [];

// Helper function to get extension from MIME type
function getExtensionFromMimeType(mimeType) {
  const mimeMap = {
    'application/pdf': '.pdf',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'text/plain': '.txt',
    'image/jpeg': '.jpg',
    'image/png': '.png'
  };
  return mimeMap[mimeType] || '.bin';
}

// Process all input items  
for (const item of $input.all()) {
  // Check if item has binary data
  if (item.binary) {
    // Process each binary attachment
    for (const [key, binaryData] of Object.entries(item.binary)) {
      let filename = binaryData.fileName;
      
      // If no original filename, create one with proper extension
      if (!filename) {
        const ext = getExtensionFromMimeType(binaryData.mimeType);
        filename = `attachment_${key}${ext}`;
      }
      
      // Read binary data using N8N's getBinaryData function
      const binaryBuffer = await this.helpers.getBinaryData(binaryData.id);
      const base64Data = binaryBuffer.toString('base64');
      
      files.push({
        filename: filename,
        mimeType: binaryData.mimeType || 'application/octet-stream',
        data: base64Data
      });
    }
  }
}

console.log(`Processed ${files.length} files:`, files.map(f => f.filename));

// Return the properly formatted data
return [{ 
  json: { 
    files: files 
  } 
}];
```

### Step 2: Configure HTTP Request Node

**URL**: `https://your-domain.replit.dev/api/transactions/123/upload-multiple`

**Method**: POST

**Authentication**: None (we'll use headers)

**Headers**:
```
Content-Type: application/json
X-API-Key: docuai_demo_key_123
```

**Send Body**: Yes

**Body Content Type**: JSON

**Specify Body**: Using JSON

**JSON Body**: 
```json
{{ $json }}
```

**Send Binary Data**: ❌ **OFF** (This is crucial!)

### Step 3: Verify the Flow

Your N8N workflow should look like:

```
[File Input] → [Code Node] → [HTTP Request3] → [Output]
```

## Complete Example Workflow

### Code Node Configuration

**Operation**: Run code once for all input items

**JavaScript Code**:
```javascript
// Handle multiple file uploads for DocuAI
const files = [];

console.log(`Processing ${$input.all().length} input items`);

for (const item of $input.all()) {
  if (item.binary) {
    console.log(`Found ${Object.keys(item.binary).length} binary files`);
    
    for (const [key, binaryData] of Object.entries(item.binary)) {
      const file = {
        filename: binaryData.fileName || `document_${key}.txt`,
        mimeType: binaryData.mimeType || 'application/octet-stream',
        data: binaryData.data
      };
      
      files.push(file);
      console.log(`Added file: ${file.filename} (${file.mimeType})`);
    }
  }
}

console.log(`Total files to upload: ${files.length}`);

return [{ 
  json: { 
    files: files
  } 
}];
```

### HTTP Request Node Configuration

**Parameters Tab**:
- URL: `https://your-domain.replit.dev/api/transactions/81/upload-multiple`
- Method: POST

**Headers Tab**:
```
Content-Type: application/json
X-API-Key: docuai_demo_key_123
```

**Body Tab**:
- Send Body: ✅ Yes
- Body Content Type: JSON
- Specify Body: Using JSON
- JSON: `{{ $json }}`

**Options Tab**:
- Send Binary Data: ❌ **OFF**

## Expected Success Response

When configured correctly, you should receive:

```json
{
  "success": true,
  "message": "3 files uploaded successfully",
  "transactionId": 81,
  "transactionName": "Test-my-6",
  "uploadedFiles": [
    {
      "filename": "document1.pdf",
      "documentId": 401,
      "size": 1234,
      "mimeType": "application/pdf"
    }
  ],
  "failedFiles": [],
  "totalProcessed": 3
}
```

## Troubleshooting Common Issues

### 1. "JSON parameter needs to be valid JSON"
**Cause**: Direct binary reference in JSON body
**Solution**: Use the Code node as shown above

### 2. "No token provided" 
**Cause**: Missing X-API-Key header
**Solution**: Add header `X-API-Key: docuai_demo_key_123`

### 3. "Transaction not found"
**Cause**: Wrong transaction ID in URL
**Solution**: Use correct transaction ID (e.g., 81 for "Test-my-6")

### 4. Empty files array
**Cause**: No binary data in input
**Solution**: Ensure previous node produces binary output

### 5. "File size exceeds limit"
**Cause**: File larger than 10MB
**Solution**: Split large files or compress

## Testing Your Configuration

### Test with cURL (for verification):

```bash
curl -X POST "https://your-domain.replit.dev/api/transactions/81/upload-multiple" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: docuai_demo_key_123" \
  -d '{
    "files": [
      {
        "filename": "test.txt",
        "mimeType": "text/plain",
        "data": "VGhpcyBpcyBhIHRlc3Q="
      }
    ]
  }'
```

## Key Points to Remember

1. **Never reference binary data directly in JSON** - Use a Code node first
2. **Always use `{{ $json }}`** in HTTP Request body - not `{{ $item() }}`
3. **Turn OFF "Send Binary Data"** in HTTP Request options
4. **Include proper headers** - Content-Type and X-API-Key
5. **Use correct transaction ID** in the URL

This configuration will resolve the JSON validation error and enable successful file uploads to DocuAI.
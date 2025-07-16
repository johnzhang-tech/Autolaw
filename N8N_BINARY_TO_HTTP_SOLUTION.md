# N8N Binary to HTTP Solution - Working Method

Since `this.helpers.getBinaryData` is not available in N8N Code nodes, we need to use a different approach. Here's the solution:

## Method 1: Use Binary Data Directly in HTTP Request

**Skip the Code node entirely** and configure your HTTP Request node to handle binary data directly:

### HTTP Request Node Configuration:

**URL**: `https://your-domain.replit.dev/api/transactions/85/upload-single`

**Method**: POST

**Authentication**: None

**Headers**:
```
X-API-Key: docuai_demo_key_123
```

**Body**:
- **Send Body**: Yes
- **Body Content Type**: Form-Data Multipart
- **Body Parameters**:
  - **Name**: `document`
  - **Value**: `{{ $binary.attachment_0 }}`

**Options**:
- **Send Binary Data**: ✅ **ON**

### For Multiple Files:

Since you have 7 files, you'll need to either:

1. **Use 7 separate HTTP Request nodes** (one for each attachment)
2. **Or use the single upload endpoint multiple times**

## Method 2: Alternative Code Node (if you must use code)

If you absolutely need to use a Code node, try this approach that works with N8N's limitations:

```javascript
// Alternative approach - create multipart form data manually
const files = [];

console.log('=== CREATING MULTIPART DATA ===');

for (const item of $input.all()) {
  if (item.binary) {
    console.log(`Found ${Object.keys(item.binary).length} binary files`);
    
    for (const [key, binaryData] of Object.entries(item.binary)) {
      // Create a reference to the binary data for HTTP node
      const fileRef = {
        filename: binaryData.fileName,
        mimeType: binaryData.mimeType,
        binaryRef: key  // Reference to the binary data key
      };
      
      files.push(fileRef);
      console.log(`Added reference: ${binaryData.fileName}`);
    }
  }
}

console.log(`=== TOTAL FILE REFERENCES: ${files.length} ===`);

// Return binary data as-is for HTTP node to handle
return $input.all();
```

## Method 3: Use N8N's Built-in Binary Data Handling

Configure your workflow like this:

```
[Gmail] → [HTTP Request] → [Output]
```

**Skip the Code node** and use N8N's native binary data handling in the HTTP Request node.

## Recommended Solution

I recommend **Method 1** - using the HTTP Request node directly with binary data. Here's the exact configuration:

### Single File Upload (Repeat for each file):

**HTTP Request Node 1**:
- URL: `https://your-domain.replit.dev/api/transactions/85/upload-single`
- Method: POST
- Headers: `X-API-Key: docuai_demo_key_123`
- Body: Form-Data Multipart
- Parameter: `document` = `{{ $binary.attachment_0 }}`
- Send Binary Data: ON

**HTTP Request Node 2**:
- Same config but use `{{ $binary.attachment_1 }}`

Continue for all 7 attachments.

This approach bypasses the Code node limitations and uses N8N's built-in binary data handling, which is much more reliable.

Would you like me to help you configure the HTTP Request nodes this way?
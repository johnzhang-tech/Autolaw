# N8N Fixed Code Node for Binary Data

## Problem
Your N8N code node might not be properly converting binary data to base64 format.

## Solution: Updated Code Node

Replace your current code node with this corrected version:

```javascript
// Get the input data
const input = $input.all()[0].json;
const payload = {};

// Find all attachment fields and convert binary data properly
Object.keys(input).forEach(key => {
  if (key.startsWith('attachment_') && input[key]) {
    const attachment = input[key];
    
    // Handle different data formats from N8N
    let base64Data = null;
    
    if (attachment.data) {
      // If data is already base64 string
      base64Data = attachment.data;
    } else if (attachment.buffer) {
      // If data is in buffer format
      base64Data = Buffer.from(attachment.buffer).toString('base64');
    } else if (attachment.binary) {
      // If data is in binary format
      base64Data = attachment.binary;
    } else {
      // Try to access the binary data directly
      const binaryData = $binary[key];
      if (binaryData) {
        base64Data = binaryData.toString('base64');
      }
    }
    
    if (base64Data) {
      payload[key] = {
        filename: attachment.filename || attachment.fileName || key,
        data: base64Data,
        mimeType: attachment.mimeType || attachment.type || 'application/pdf'
      };
    }
  }
});

// Debug output
console.log('Payload keys:', Object.keys(payload));
console.log('First attachment:', payload.attachment_0 ? {
  filename: payload.attachment_0.filename,
  hasData: !!payload.attachment_0.data,
  dataLength: payload.attachment_0.data ? payload.attachment_0.data.length : 0
} : 'Not found');

return [payload];
```

## Alternative: Simpler Binary Access

If the above doesn't work, try this simpler approach:

```javascript
const input = $input.all()[0];
const payload = {};

// Access binary data directly
for (const key in input.binary) {
  if (key.startsWith('attachment_')) {
    const binaryData = input.binary[key];
    payload[key] = {
      filename: binaryData.fileName || key,
      data: binaryData.data,
      mimeType: binaryData.mimeType || 'application/pdf'
    };
  }
}

return [payload];
```

## Test Your Code Node

Before sending to the HTTP Request, add a debug step to verify the payload structure:

1. Add a "Set" node after your Code node
2. Set a value called `debug` to `{{ JSON.stringify($json, null, 2) }}`
3. Check the output to ensure it matches the expected format

## Expected Output Format

Your code node should produce:
```json
{
  "attachment_0": {
    "filename": "Jan Meeting Minutes Revised.pdf",
    "data": "base64encodedcontent...",
    "mimeType": "application/pdf"
  },
  "attachment_1": {
    "filename": "HOA Assessment Policy.pdf",
    "data": "base64encodedcontent...",
    "mimeType": "application/pdf"
  }
}
```

## Key Points

- `data` field must be base64 encoded string
- `filename` should be the original filename
- `mimeType` should be the correct MIME type
- Each attachment must have its own key (`attachment_0`, `attachment_1`, etc.)

Try the updated code node and let me know what the debug output shows.
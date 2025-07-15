# N8N Binary Upload Fix - Real File Content Issue

## Problem Identified
The log shows that N8N is sending `"filesystem-v2"` as the data instead of actual file content:

```
"attachment_0": {
  "filename": "Jan Meeting Minutes Revised.pdf",
  "data": "filesystem-v2",
  "mimeType": "application/pdf"
}
```

This results in 9-byte corrupted files that cannot be opened.

## Root Cause
N8N's code node is accessing `input.binary.attachment_X.data` which returns a filesystem reference, not the actual base64 content.

## Solution: Use N8N's $binary Helper

Replace your current code node with this corrected version:

```javascript
const payload = {};

// Access binary data using N8N's $binary helper
for (const key in $binary) {
  if (key.startsWith('attachment_')) {
    const binaryData = $binary[key];
    payload[key] = {
      filename: binaryData.fileName,
      data: binaryData.data,
      mimeType: binaryData.mimeType || 'application/pdf'
    };
  }
}

return [payload];
```

## Alternative: Direct Binary Access

If the above doesn't work, try this approach:

```javascript
const input = $input.all()[0];
const payload = {};

// Try to access the actual binary content
for (const key in input.binary) {
  if (key.startsWith('attachment_')) {
    const binary = input.binary[key];
    
    // Get the actual binary data buffer and convert to base64
    const buffer = binary.buffer || binary.data;
    const base64Data = buffer ? buffer.toString('base64') : null;
    
    if (base64Data) {
      payload[key] = {
        filename: binary.fileName,
        data: base64Data,
        mimeType: binary.mimeType || 'application/pdf'
      };
    }
  }
}

return [payload];
```

## Debug: Check What's Available

If both fail, use this debug version to see what's actually available:

```javascript
const input = $input.all()[0];

return [{
  "debug_binary_keys": Object.keys(input.binary || {}),
  "debug_binary_attachment_0": input.binary.attachment_0,
  "debug_dollar_binary": typeof $binary !== 'undefined' ? Object.keys($binary) : 'undefined',
  "debug_dollar_binary_attachment_0": typeof $binary !== 'undefined' ? $binary.attachment_0 : 'undefined'
}];
```

## Expected Fix
Once the correct binary data is accessed, files should upload with proper sizes (not 9 bytes) and be readable as valid PDFs.

The filename suffix issue has also been fixed - files will now keep their original names without "_12345678" suffixes.
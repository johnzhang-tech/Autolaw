# n8n Multi-File Upload Solution

## Problem Analysis
You have 4 attachments (attachment_0 to attachment_3) but only 1 file gets uploaded at a time. This is because n8n's HTTP Request node with "Attach Binary File" processes files individually by design.

## Solution Options

### Option 1: Loop Through Files (Recommended)
Instead of using a single HTTP Request node, use a loop to upload each file individually:

1. **Add "Split In Batches" Node**:
   - Input: Your current data with 4 attachments
   - Batch Size: 1
   - This creates 4 separate executions

2. **Update HTTP Request Node**:
   - URL: `https://beeed428-ed5d-4903-bc62-3ba70ac303df-00-38fn65dx21909.kirk.replit.dev/api/transactions/{{$json.Tranx_id}}/upload-single`
   - Method: POST
   - Send Body: Attach Binary File
   - Input Data Field Name: `{{$json.attachment_name}}` (dynamic)
   - Headers: 
     - `X-API-Key`: `docuai_demo_key_123`
     - `X-Filename`: `{{$binary[Object.keys($binary)[0]].fileName}}`

### Option 2: Use Code Node to Process All Files
Add a Code node before the HTTP Request to handle multiple files:

```javascript
// Code node to prepare multiple file uploads
const items = [];
const binaryKeys = Object.keys($input.first().binary);

for (const key of binaryKeys) {
  if (key.startsWith('attachment_')) {
    items.push({
      json: {
        Tranx_id: $input.first().json.Tranx_id,
        attachment_field: key
      },
      binary: {
        file: $input.first().binary[key]
      }
    });
  }
}

return items;
```

Then use HTTP Request with:
- Input Data Field Name: `file`
- X-Filename header: `{{$binary.file.fileName}}`

### Option 3: Use the New Bulk Upload Endpoint
I've created a special endpoint that handles multiple files if n8n can send them in one request:

**URL**: `/api/transactions/{{$json.Tranx_id}}/upload-n8n`

But this requires n8n to send all files in a single multipart request, which may not be happening.

## Quick Test
First, let's debug what n8n is actually sending. Update your URL temporarily to:

```
https://beeed428-ed5d-4903-bc62-3ba70ac303df-00-38fn65dx21909.kirk.replit.dev/api/debug/n8n-upload
```

This will show us exactly what files n8n is sending in each request.

## Recommended Workflow Structure

```
[Your Current Data] 
    ↓
[Split In Batches - Batch Size: 1]
    ↓
[HTTP Request - Upload Single File]
    ↓
[Optional: Merge Back Results]
```

This ensures all 4 files get uploaded individually with their original filenames preserved.
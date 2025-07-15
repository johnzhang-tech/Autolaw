# N8N Final Solution: JSON Upload for Dynamic Attachments

## ✅ WORKING SOLUTION

Use the **JSON endpoint** instead of multipart form data. This completely eliminates the need for loops and complex field mapping.

## N8N Configuration (Simple!)

### Step 1: Remove All Loops
- Remove any "Loop Over Items" or "Split In Batches" nodes
- Connect your data source directly to the HTTP Request node

### Step 2: Configure HTTP Request Node

**URL**: `https://your-app.replit.dev/api/transactions/{transactionId}/upload-n8n-json`

**Method**: `POST`

**Headers**:
- `X-API-Key`: `docuai_demo_key_123`
- `Content-Type`: `application/json`

**Body Type**: `Raw/JSON`

**Body Content**:
```json
{
  "attachment_0": {
    "filename": "{{ $json.attachment_0.filename }}",
    "data": "{{ $json.attachment_0.data }}",
    "mimeType": "{{ $json.attachment_0.mimeType || 'application/pdf' }}"
  },
  "attachment_1": {
    "filename": "{{ $json.attachment_1.filename }}",
    "data": "{{ $json.attachment_1.data }}",
    "mimeType": "{{ $json.attachment_1.mimeType || 'application/pdf' }}"
  },
  "attachment_2": {
    "filename": "{{ $json.attachment_2.filename }}",
    "data": "{{ $json.attachment_2.data }}",
    "mimeType": "{{ $json.attachment_2.mimeType || 'application/pdf' }}"
  },
  "attachment_3": {
    "filename": "{{ $json.attachment_3.filename }}",
    "data": "{{ $json.attachment_3.data }}",
    "mimeType": "{{ $json.attachment_3.mimeType || 'application/pdf' }}"
  },
  "attachment_4": {
    "filename": "{{ $json.attachment_4.filename }}",
    "data": "{{ $json.attachment_4.data }}",
    "mimeType": "{{ $json.attachment_4.mimeType || 'application/pdf' }}"
  },
  "attachment_5": {
    "filename": "{{ $json.attachment_5.filename }}",
    "data": "{{ $json.attachment_5.data }}",
    "mimeType": "{{ $json.attachment_5.mimeType || 'application/pdf' }}"
  }
}
```

### Alternative: Dynamic JSON (If your attachments are variable)

If you can't predict the attachment field names, use a Code node before the HTTP Request:

```javascript
// Code node to prepare JSON payload
const input = $input.all()[0].json;
const payload = {};

// Find all attachment fields dynamically
Object.keys(input).forEach(key => {
  if (key.startsWith('attachment_')) {
    payload[key] = {
      filename: input[key].filename || key,
      data: input[key].data,
      mimeType: input[key].mimeType || 'application/pdf'
    };
  }
});

return [payload];
```

Then in HTTP Request body, simply use: `{{ $json }}`

## Expected Response

```json
{
  "success": true,
  "message": "6 unique files uploaded successfully",
  "uploaded": [
    {
      "fieldName": "attachment_0",
      "fileName": "HOA-Declaration.pdf",
      "documentId": 355
    },
    {
      "fieldName": "attachment_1", 
      "fileName": "Meeting-Minutes.pdf",
      "documentId": 356
    }
  ],
  "failed": [],
  "duplicatesRemoved": 0,
  "transactionId": 82
}
```

## Benefits

- ✅ **No loops required** - Send all files in one request
- ✅ **Works with any number of attachments** - Dynamic field detection
- ✅ **Preserves original filenames** - Exact filename preservation
- ✅ **Simple configuration** - Just JSON, no complex multipart handling
- ✅ **Reliable** - No dependency on N8N's multipart form limitations

## Why This Works

The JSON endpoint processes all attachments from the JSON body, regardless of how many there are. It automatically detects `attachment_0`, `attachment_1`, etc. and handles them all in one atomic operation.

## Production URL

Replace `your-app.replit.dev` with your actual Replit deployment URL.

**That's it!** No more loops, no more complex configurations. Just simple JSON upload that handles all your files at once.
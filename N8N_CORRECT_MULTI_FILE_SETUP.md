# N8N Multi-File Upload - Correct Setup

## The Problem
Your current n8n setup is uploading the same file 4 times because the `X-Filename` header is hardcoded to `{{$binary.attachment_0.filename}}` for all uploads.

## The Solution: Split In Batches + Dynamic Headers

### Step 1: Add Split In Batches Node
1. Add "Split In Batches" node after your data preparation
2. Set **Batch Size**: 1
3. This creates 4 separate workflow executions, one for each attachment

### Step 2: Add Code Node (Dynamic File Selection)
Add a Code node that selects the correct attachment for each batch:

```javascript
// This code dynamically selects the correct attachment based on batch index
const batchIndex = $input.context.currentRunIndex || 0;
const attachmentKey = `attachment_${batchIndex}`;

// Get the binary data for the current attachment
const currentAttachment = $input.first().binary[attachmentKey];

if (!currentAttachment) {
  throw new Error(`No attachment found for ${attachmentKey}`);
}

return [{
  json: {
    ...$input.first().json,
    current_attachment: attachmentKey,
    filename: currentAttachment.fileName
  },
  binary: {
    file: currentAttachment
  }
}];
```

### Step 3: Update HTTP Request Node
Configure your HTTP Request node:

- **URL**: `https://beeed428-ed5d-4903-bc62-3ba70ac303df-00-38fn65dx21909.kirk.replit.dev/api/transactions/{{$json.Tranx_id}}/upload-single`
- **Method**: POST
- **Send Body**: Attach Binary File
- **Input Data Field Name**: `file`
- **Headers**:
  - `X-API-Key`: `docuai_demo_key_123`
  - `X-Filename`: `{{$json.filename}}`

### Alternative: Simple Loop Solution
If the code node is too complex, use this simpler approach:

1. **Split In Batches**: Batch Size = 1
2. **Set Node**: Add these fields:
   - `attachment_index`: `{{$json.$index}}`
   - `attachment_key`: `attachment_{{$json.$index}}`
3. **HTTP Request**: 
   - Input Data Field Name: `{{$json.attachment_key}}`
   - X-Filename: `{{$binary[item.json.attachment_key].fileName}}`

## Current Database Status
Your transaction 48 currently has 3 documents, but they might be duplicates due to the filename issue.

## Test First
To verify this works, test with the debug endpoint:
```
https://beeed428-ed5d-4903-bc62-3ba70ac303df-00-38fn65dx21909.kirk.replit.dev/api/debug/n8n-upload
```

This will show you exactly what each request is sending without actually uploading files.

## Expected Result
After fixing this setup, you should see 4 different files uploaded with their original filenames:
- `file1.pdf`
- `file2.pdf` 
- `file3.pdf`
- `file4.pdf`

Instead of 4 copies of the same file.
# N8N Multiple Files Upload Configuration Guide

## Problem Analysis
Your N8N workflow has an array of attachments but is only sending one file (`attachment_0`) instead of all files in the array.

## Solution: Configure N8N to Send All Files in Array

### Method 1: Use HTTP Request Node with Loop (Recommended)

1. **Add a "Split In Batches" node** before your HTTP Request node:
   - Input: `{{ $json.attachments }}`
   - Batch Size: 1
   - This will process each attachment individually

2. **Configure HTTP Request node**:
   - Method: POST
   - URL: `https://your-app.replit.dev/api/transactions/{{$json.transactionId}}/upload-n8n`
   - Headers:
     - `X-API-Key`: `docuai_demo_key_123`
     - `Content-Type`: `multipart/form-data`
   - Body: Form-Data
   - Parameters:
     - Name: `{{ $json.filename }}` (use the actual filename as field name)
     - Parameter Type: `n8n Binary File`
     - Input Data Field Name: `attachment` (or whatever your attachment field is called)

### Method 2: Single HTTP Request with Multiple Files

If you want to send ALL files in one request, configure the HTTP Request node as follows:

1. **Body Type**: Form-Data
2. **Parameters** (add one for each file):
   - Parameter 1:
     - Name: `attachment_0`
     - Parameter Type: `n8n Binary File`
     - Input Data Field Name: `{{ $json.attachments[0].fieldName }}`
   - Parameter 2:
     - Name: `attachment_1`
     - Parameter Type: `n8n Binary File`
     - Input Data Field Name: `{{ $json.attachments[1].fieldName }}`
   - Continue for all files...

### Method 3: Dynamic Field Names (Most Flexible)

Use this configuration for dynamic field names:

```javascript
// In a Code node before HTTP Request:
const attachments = $input.all()[0].json.attachments;
const formData = {};

for (let i = 0; i < attachments.length; i++) {
  formData[`file_${i}`] = attachments[i];
}

return { formData };
```

Then in HTTP Request:
- Use the processed formData object
- Each file will have a unique field name (`file_0`, `file_1`, etc.)

## Current Issue in Your Setup

Looking at your logs, you're only sending:
```
Field names: [ 'Jan Meeting Minutes Revised.pdf' ]
Filenames: [ 'Jan Meeting Minutes Revised.pdf' ]
```

This indicates N8N is only sending one file with the filename as the field name.

## Recommended Configuration

1. **Use Method 1 (Split In Batches)** for simplicity
2. **Configure field names** to be unique for each file
3. **Test with a small array** first (2-3 files) before scaling to 6

## Testing Your Configuration

After implementing, you should see logs like:
```
Field names: [ 'file_0', 'file_1', 'file_2', 'file_3', 'file_4', 'file_5' ]
Filenames: [ 'Document1.pdf', 'Document2.pdf', 'Document3.pdf', 'Document4.pdf', 'Document5.pdf', 'Document6.pdf' ]
```

## Common N8N Mistakes to Avoid

1. **Using same field name for all files** - Each file needs a unique field name
2. **Not looping through array** - N8N needs explicit configuration to process arrays
3. **Wrong Parameter Type** - Must use "n8n Binary File" for file uploads
4. **Missing Content-Type** - Should be `multipart/form-data`

## Debugging Steps

1. Check your N8N workflow input - ensure all 6 files are present
2. Verify Split In Batches node is processing all items
3. Check HTTP Request node configuration for each file
4. Monitor the endpoint logs to see what's actually received

The endpoint is working correctly - it can handle multiple files as demonstrated in the test. The issue is in the N8N configuration not sending all files from the array.
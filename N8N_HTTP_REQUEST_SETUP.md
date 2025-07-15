# N8N HTTP Request Setup - Direct Binary Upload

## Problem
N8N Code Node returns `"filesystem-v2"` instead of actual file content, which is a known N8N limitation with binary data access.

## Solution: Use HTTP Request Node Directly

**REMOVE the Code Node entirely** and configure your HTTP Request node to send binary data directly as multipart/form-data:

### HTTP Request Node Configuration

**Method:** POST
**URL:** `https://beeed428-ed5d-4903-bc62-3ba70ac303df-00-38fn65dx21909.kirk.replit.dev/api/transactions/81/upload-single`

**Headers:**
- `X-API-Key`: `docuai_demo_key_123`

**Body Content Type:** Form-Data Multipart
**Body:** 
- Click "Add Parameter" for each attachment
- Set the field name to `document` (our endpoint expects this)
- Set the value to `{{ $binary.attachment_0 }}` for the first file
- For multiple files, you'll need to send them one by one

### Alternative: Use the Multiple Files Endpoint

If you want to send all files at once:

**URL:** `https://beeed428-ed5d-4903-bc62-3ba70ac303df-00-38fn65dx21909.kirk.replit.dev/api/transactions/81/upload-multiple`

**Body Content Type:** Form-Data Multipart
**Body Parameters:**
- `attachment_0`: `{{ $binary.attachment_0 }}`
- `attachment_1`: `{{ $binary.attachment_1 }}`
- `attachment_2`: `{{ $binary.attachment_2 }}`
- `attachment_3`: `{{ $binary.attachment_3 }}`
- `attachment_4`: `{{ $binary.attachment_4 }}`
- `attachment_5`: `{{ $binary.attachment_5 }}`

### Expected Success Response

```json
{
  "success": true,
  "message": "6 unique files uploaded successfully",
  "uploaded": [
    {
      "fieldName": "attachment_0",
      "fileName": "Jan Meeting Minutes Revised.pdf",
      "documentId": 325
    },
    {
      "fieldName": "attachment_1",
      "fileName": "HOA Assessment Delinquency Policy  (Approved Aug 2006).pdf",
      "documentId": 326
    }
  ],
  "failed": [],
  "duplicatesRemoved": 0,
  "transactionId": 81
}
```

## Why This Works

- HTTP Request node can directly access `$binary.attachment_X` 
- No Code Node needed (bypasses the filesystem-v2 issue)
- Files are sent as proper multipart/form-data
- Our endpoint handles the binary data correctly

## Next Steps

1. **Remove the Code Node** from your workflow
2. **Configure HTTP Request node** as described above
3. **Test with the multiple files endpoint** first
4. **Verify files upload** with correct sizes and content

This approach completely bypasses the N8N binary data access limitation.
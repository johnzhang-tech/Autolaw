# N8N Working Configuration - Step by Step

## ✅ Confirmed Working Endpoint
The API endpoint is working correctly. I've tested it with binary uploads and it successfully stores files.

## Your N8N HTTP Request Setup

Based on your screenshot, here's the exact configuration:

### 1. HTTP Request Node Settings
- **Method**: `POST`
- **URL**: `https://beeed428-ed5d-4903-bc62-3ba70ac303df-00-38fn65dx21909.kirk.replit.dev/api/transactions/34/upload-single`
- **Authentication**: None (we'll use headers)

### 2. Headers Configuration
Add these headers in the Headers section:

| Name | Value |
|------|--------|
| `X-API-Key` | `docuai_demo_key_123` |
| `Content-Type` | `application/pdf` |
| `X-Filename` | `Jan-Meeting-Minutes-Revised.pdf` |

### 3. Body Configuration
- **Body Content Type**: `Binary Data`
- **Input Data Field Name**: `attachment_0` (or whatever your field name is)

### 4. Complete Node Configuration
```json
{
  "url": "https://beeed428-ed5d-4903-bc62-3ba70ac303df-00-38fn65dx21909.kirk.replit.dev/api/transactions/34/upload-single",
  "method": "POST",
  "headers": {
    "X-API-Key": "docuai_demo_key_123",
    "Content-Type": "application/pdf",
    "X-Filename": "Jan-Meeting-Minutes-Revised.pdf"
  },
  "body": {
    "mimeType": "application/json",
    "mode": "binaryData",
    "binaryData": "attachment_0"
  }
}
```

## Expected Success Response
When working correctly, you should get:
```json
{
  "success": true,
  "message": "Document \"Jan-Meeting-Minutes-Revised.pdf\" uploaded successfully to transaction 34",
  "document": {
    "id": 142,
    "fileName": "1752183167150_Jan-Meeting-Minutes-Revised_abc123.pdf",
    "originalFileName": "Jan-Meeting-Minutes-Revised.pdf",
    "fileSize": 156789,
    "mimeType": "application/pdf",
    "category": "other",
    "uploadStatus": "completed"
  },
  "transaction": {
    "id": 34,
    "name": "test-att-2",
    "numDocuments": 5
  }
}
```

## Troubleshooting Steps

### If you get "express is not defined" error:
1. Wait 30 seconds for the server to restart after my fixes
2. Try the request again

### If you get authentication errors:
1. Make sure the `X-API-Key` header is exactly: `docuai_demo_key_123`
2. Check that you're not using basic auth or other authentication

### If you get "Transaction not found":
1. Replace `34` in the URL with a valid transaction ID
2. Get transaction IDs from: `GET /api/transactions` with the same API key

### Test with cURL first:
```bash
curl -H "X-API-Key: docuai_demo_key_123" \
     -H "Content-Type: application/pdf" \
     -H "X-Filename: test.pdf" \
     -X POST \
     --data-binary @/path/to/your/file.pdf \
     "https://beeed428-ed5d-4903-bc62-3ba70ac303df-00-38fn65dx21909.kirk.replit.dev/api/transactions/34/upload-single"
```

## Current Status
- ✅ API endpoint working and tested
- ✅ Express import issue fixed
- ✅ Binary upload handling implemented
- ⏳ Waiting for you to test with updated configuration
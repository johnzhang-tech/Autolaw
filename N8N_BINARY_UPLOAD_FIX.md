# N8N Binary Upload Fix - Complete Solution

## Problem
The `{{$binary.attachment_0}}` syntax is not recognized in n8n HTTP Request node, causing binary file uploads to fail.

## Solution: Use Raw Binary Upload Method

### N8N HTTP Request Configuration

#### Method & URL
- **Method**: `POST`
- **URL**: `https://beeed428-ed5d-4903-bc62-3ba70ac303df-00-38fn65dx21909.kirk.replit.dev/api/transactions/{{$json.id}}/upload-single`

#### Authentication
- **Send Headers**: `On`
- Add header:
  - **Name**: `X-API-Key`
  - **Value**: `docuai_demo_key_123`

#### Body Configuration (CRITICAL)
- **Body Content Type**: `Raw/Custom`
- **Input Data Field Name**: `attachment_0`
- **Specify Content Type**: `On`
- **Content Type**: `application/octet-stream`

#### Additional Headers
Add these headers:
- **Name**: `X-Filename`
- **Value**: `{{$json.fileName || 'document.pdf'}}`
- **Name**: `Content-Type`  
- **Value**: `application/octet-stream`

## Alternative Method: Use Write Binary File Node

If the above doesn't work, use this workflow:

### Step 1: Write Binary File Node
Add a "Write Binary File" node before the HTTP Request:
- **File Name**: `temp_file`
- **Binary Data**: `attachment_0`
- **Options** → **File Path**: `/tmp/{{$json.fileName || 'document.pdf'}}`

### Step 2: HTTP Request with File Path
- **Method**: `POST`
- **URL**: Same as above
- **Body Content Type**: `Form-Data Multipart`
- **Body Parameters**:
  - **Parameter Type**: `File`
  - **Name**: `attachment_0`
  - **Input Binary Field**: Leave empty
  - **File Path**: `/tmp/{{$json.fileName || 'document.pdf'}}`

## Testing the Debug Endpoint

Before using the real upload endpoint, test with our debug endpoint:

**URL**: `https://beeed428-ed5d-4903-bc62-3ba70ac303df-00-38fn65dx21909.kirk.replit.dev/api/debug/upload`

This will show exactly what data is being received and help troubleshoot any issues.

## Expected Response

### Success Response
```json
{
  "success": true,
  "message": "Document uploaded successfully",
  "document": {
    "id": 123,
    "fileName": "document.pdf",
    "category": "hoa",
    "transactionId": 456
  }
}
```

### Debug Response
```json
{
  "success": true,
  "debug": {
    "headers": {...},
    "bodyKeys": [...],
    "filesReceived": [...],
    "fileCount": 1
  }
}
```

## Troubleshooting

### Common Issues
1. **Binary data not found**: Use Raw/Custom body type with correct Input Data Field Name
2. **File name missing**: Add X-Filename header with the original file name
3. **Content type issues**: Set Content-Type to application/octet-stream for binary uploads

### Verification Steps
1. Test with debug endpoint first
2. Check that previous node outputs binary data under `attachment_0` key
3. Verify transaction ID exists in the URL
4. Confirm API key authentication is working

## Why This Works
Our API now handles both:
1. **Raw binary uploads**: Entire request body is the file content
2. **Multipart form uploads**: Traditional form-data with file fields

The Raw/Custom method bypasses n8n's form-data parsing issues and sends the binary data directly to our API.
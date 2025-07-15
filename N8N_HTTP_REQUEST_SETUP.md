# N8N HTTP Request Configuration for DocuAI Upload API

## Fixed API Endpoint
The upload endpoint now supports n8n's field naming convention (`attachment_0`, `attachment_1`, etc.).

## HTTP Request Node Configuration

### Method and URL
- **Method**: `POST`
- **URL**: `https://beeed428-ed5d-4903-bc62-3ba70ac303df-00-38fn65dx21909.kirk.replit.dev/api/transactions/{{$json.id}}/upload-single`

### Authentication
**Header Auth**:
- **Name**: `X-API-Key`
- **Value**: `docuai_demo_key_123`

### Parameters
**Send Query Parameters**: `Off`

### Headers
**Send Headers**: `On`
- **Name**: `X-API-Key`
- **Value**: `docuai_demo_key_123`

### Body
**Body Content Type**: `Form-Data Multipart`
**Input Data Field Name**: `attachment_0`

This is the key setting that was causing the error. n8n sends binary files as `attachment_0` by default.

### Options
**Response**: 
- **Response Format**: `JSON`
- **Full Response**: `Off`

## Alternative Configuration (Binary Upload)

If the multipart approach doesn't work, you can also use raw binary upload:

### Body Configuration
**Body Content Type**: `Raw/Custom`
**Input Data Field Name**: `attachment_0`

### Additional Headers
- **Name**: `Content-Type`
- **Value**: `application/octet-stream`
- **Name**: `X-Filename` 
- **Value**: `{{$json.filename || 'document.pdf'}}`

## Testing the API

### Sample Transaction Creation
First create a transaction to get an ID:

```bash
curl -X POST https://beeed428-ed5d-4903-bc62-3ba70ac303df-00-38fn65dx21909.kirk.replit.dev/api/transactions \
  -H "X-API-Key: docuai_demo_key_123" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "N8N Test Property",
    "address": "123 Automation St",
    "transactionType": "Purchase"
  }'
```

### Sample File Upload
Then upload a file to that transaction:

```bash
curl -X POST https://beeed428-ed5d-4903-bc62-3ba70ac303df-00-38fn65dx21909.kirk.replit.dev/api/transactions/[TRANSACTION_ID]/upload-single \
  -H "X-API-Key: docuai_demo_key_123" \
  -F "attachment_0=@/path/to/your/file.pdf" \
  -F "category=hoa"
```

## Troubleshooting

### Common Issues
1. **"No file uploaded" error**: Ensure `Input Data Field Name` is set to `attachment_0`
2. **Authentication errors**: Verify the X-API-Key header is set correctly
3. **Transaction not found**: Make sure the transaction ID exists and belongs to your user

### Debug Information
The API returns detailed debug information when uploads fail, including:
- Received field names
- Content type detected
- Body size and type
- Expected field names

### Success Response
A successful upload returns:
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

## API Field Support
The endpoint now accepts files with these field names:
- `document` (traditional web upload)
- `attachment` (API upload)
- `attachment_0`, `attachment_1`, etc. (n8n naming convention)

This ensures compatibility with various automation tools and manual uploads.
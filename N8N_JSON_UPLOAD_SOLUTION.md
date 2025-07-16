# N8N JSON Upload Solution - Complete Implementation Guide

## Overview

The DocuAI platform now provides a powerful JSON-based upload endpoint specifically designed for N8N automation workflows. This solution eliminates the complexity of multipart form-data configuration and provides a simple, reliable way to upload multiple documents programmatically.

## New JSON Upload Endpoint

### Endpoint Details
- **URL**: `POST /api/transactions/:id/upload-multiple`
- **Authentication**: API Key (X-API-Key header)
- **Content-Type**: `application/json`
- **Method**: POST

### Request Format

```json
{
  "files": [
    {
      "filename": "document1.pdf",
      "mimeType": "application/pdf",
      "data": "<base64-encoded-file-content>"
    },
    {
      "filename": "contract.txt", 
      "mimeType": "text/plain",
      "data": "<base64-encoded-file-content>"
    }
  ]
}
```

### Response Format

```json
{
  "success": true,
  "message": "3 files uploaded successfully",
  "transactionId": 81,
  "transactionName": "Test-my-6",
  "uploadedFiles": [
    {
      "filename": "contract-final.txt",
      "documentId": 397,
      "size": 60,
      "mimeType": "text/plain"
    }
  ],
  "failedFiles": [],
  "totalProcessed": 3
}
```

## N8N Integration Guide

### Step 1: Convert Files to Base64

In N8N, use a Code node to convert file data to base64:

```javascript
// For binary data from previous nodes
const files = [];

for (const item of $input.all()) {
  if (item.binary) {
    for (const [key, binaryData] of Object.entries(item.binary)) {
      files.push({
        filename: binaryData.fileName || `attachment_${key}`,
        mimeType: binaryData.mimeType || 'application/octet-stream',
        data: binaryData.data // Already base64 in N8N
      });
    }
  }
}

return [{ json: { files } }];
```

### Step 2: Configure HTTP Request Node

1. **Method**: POST
2. **URL**: `https://your-domain.replit.dev/api/transactions/{transaction_id}/upload-multiple`
3. **Headers**:
   - `Content-Type`: `application/json`
   - `X-API-Key`: `docuai_demo_key_123`
4. **Body**: `{{ $json }}`
5. **Send Binary Data**: OFF (important!)

### Step 3: Handle Response

The response includes:
- `uploadedFiles[]`: Successfully uploaded documents with IDs
- `failedFiles[]`: Failed uploads with error messages
- `totalProcessed`: Total number of files processed

## Key Benefits

### 1. Simplified Configuration
- No complex multipart form-data setup
- No field name restrictions
- Single HTTP Request node needed

### 2. Reliable Operation  
- Atomic transaction processing
- Automatic rollback on failures
- Duplicate detection prevents re-uploads

### 3. Original Filename Preservation
- Files maintain exact original names
- No random suffixes or modifications
- Proper MIME type detection

### 4. Comprehensive Error Handling
- Individual file failure tracking
- Storage cleanup on database errors
- Detailed error messages for debugging

## Technical Features

### Database Integration
- Automatic document count maintenance
- User isolation and access control
- Complete audit trail with timestamps

### Storage System
- Replit Object Storage integration
- Transaction-based folder organization
- Secure download URL generation

### Authentication
- API key authentication for external access
- JWT token support for web interface
- Flexible authentication middleware

## Production Usage

### API Key Authentication
```bash
curl -X POST "https://your-domain.replit.dev/api/transactions/123/upload-multiple" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_api_key_here" \
  -d '{"files": [{"filename": "test.pdf", "mimeType": "application/pdf", "data": "base64data"}]}'
```

### Transaction Verification
After upload, verify the transaction document count:

```bash
curl -X GET "https://your-domain.replit.dev/api/transactions/123" \
  -H "X-API-Key: your_api_key_here"
```

### Document Download
Access uploaded documents via secure URLs:

```bash
curl -X GET "https://your-domain.replit.dev/api/documents/456/download" \
  -H "X-API-Key: your_api_key_here"
```

## Error Handling

### Common Error Scenarios

1. **File Size Limit**: 10MB maximum per file
2. **Unsupported MIME Types**: PDF, DOC, DOCX, TXT, images only
3. **Transaction Not Found**: Invalid transaction ID
4. **Authentication Failure**: Missing or invalid API key
5. **Duplicate Files**: Same filename + size already exists

### Response Structure for Errors

```json
{
  "success": false,
  "message": "2 files uploaded, 1 failed",
  "uploadedFiles": [...],
  "failedFiles": [
    {
      "filename": "large-file.pdf",
      "error": "File size exceeds 10MB limit"
    }
  ],
  "totalProcessed": 3
}
```

## Testing and Verification

### Complete Test Script
Use the provided `test_json_upload_complete.js` script for full functionality testing:

```bash
node test_json_upload_complete.js
```

This script verifies:
- JSON upload functionality
- Authentication with API keys
- Storage integration
- Download capabilities
- Document count maintenance

## Migration from Multipart Uploads

### Old Approach (Complex)
- Required multer configuration
- Field name dependencies
- Binary data handling issues
- Multiple N8N node setup

### New Approach (Simple)  
- Single JSON payload
- Base64 encoding handles all file types
- No field name restrictions
- One HTTP Request node

## Security Considerations

### Authentication
- API keys required for all operations
- User-based data isolation
- Admin role separation

### Data Validation
- File type restrictions
- Size limit enforcement  
- MIME type validation
- SQL injection prevention

### Storage Security
- Encrypted file storage
- Presigned download URLs
- Automatic cleanup on failures
- Access control validation

## Performance Optimization

### Atomic Operations
- Database transactions ensure consistency
- Rollback protection on failures
- Batch processing for multiple files

### Storage Efficiency
- Base64 workaround for SDK limitations
- Efficient object key generation
- Automatic duplicate detection

### Error Recovery
- Comprehensive cleanup procedures
- Detailed logging for troubleshooting
- Webhook notification system

This JSON upload solution provides a production-ready, secure, and reliable method for integrating N8N workflows with the DocuAI document management system.
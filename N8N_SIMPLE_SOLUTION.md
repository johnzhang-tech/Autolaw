# N8N Simple Webhook Solution for DocuAI

## Overview
This document describes the simplified webhook solution that eliminates the complexity of N8N configuration and provides a single endpoint for email-based file uploads.

## The Problem
Previously, N8N integration required:
- Complex multipart form data handling
- Dynamic field name detection
- Multiple configuration steps
- Difficult debugging and maintenance
- User frustration with setup complexity

## The Solution
**Simple Webhook Endpoint: `/api/webhook/upload-attachments`**

### Key Features
1. **Transaction Auto-Mapping**: Email subject line automatically maps to transaction name
2. **Dual Format Support**: Handles both JSON and multipart/form-data
3. **Intelligent File Processing**: Automatically detects and processes attachments
4. **Comprehensive Error Handling**: Clear error messages and graceful failures
5. **Webhook Notifications**: Automatically notifies N8N workflows after successful uploads

### API Endpoint Details

**URL**: `POST /api/webhook/upload-attachments`

**Headers**:
- `Content-Type`: `application/json` OR `multipart/form-data`
- `X-API-Key`: `docuai_demo_key_123` (or any valid API key)

**Authentication**: API key authentication (no session required)

### Request Format Options

#### Option 1: JSON Format
```json
{
  "subject": "Test-my-6",
  "from": "sender@example.com",
  "to": "demo@docuai.com",
  "attachment_0": {
    "filename": "document.pdf",
    "data": "base64-encoded-file-content",
    "mimeType": "application/pdf"
  }
}
```

#### Option 2: Multipart Form Data
```
--boundary123
Content-Disposition: form-data; name="subject"

Test-my-6
--boundary123
Content-Disposition: form-data; name="from"

sender@example.com
--boundary123
Content-Disposition: form-data; name="to"

demo@docuai.com
--boundary123
Content-Disposition: form-data; name="document"; filename="test.pdf"
Content-Type: application/pdf

[binary file content]
--boundary123--
```

### Response Format
```json
{
  "success": true,
  "message": "1 files uploaded successfully",
  "transactionId": 81,
  "transactionName": "Test-my-6",
  "uploadedFiles": [
    {
      "filename": "test.pdf",
      "documentId": 123,
      "size": 12345
    }
  ],
  "failedFiles": [],
  "totalProcessed": 1
}
```

### Error Handling
- **404**: Transaction not found (includes list of available transactions)
- **400**: No attachments found
- **401**: Authentication failed
- **500**: Internal server error

### N8N Workflow Configuration

The N8N workflow is now dramatically simplified:

1. **Email Trigger**: Receive email with attachments
2. **HTTP Request Node**: 
   - URL: `https://your-app.replit.dev/api/webhook/upload-attachments`
   - Method: POST
   - Headers: `X-API-Key: docuai_demo_key_123`
   - Body: `{{ $json }}` (passes entire email data)

That's it! No complex field mapping, no multipart configuration, no dynamic arrays.

### How It Works

1. **Email Processing**: N8N extracts email data (subject, from, to, attachments)
2. **Webhook Call**: Single HTTP request to DocuAI webhook endpoint
3. **Transaction Mapping**: Subject line "Test-my-6" maps to transaction "Test-my-6"
4. **File Upload**: Attachments are automatically processed and uploaded
5. **Storage**: Files stored in Replit Object Storage with proper organization
6. **Database**: Document metadata saved to PostgreSQL
7. **Notification**: Webhook notification sent back to N8N (if configured)

### Benefits

1. **Simplified Setup**: Single HTTP Request node in N8N
2. **Error Resilience**: Comprehensive error handling and logging
3. **Automatic Mapping**: No manual transaction ID configuration needed
4. **Dual Format Support**: Works with both JSON and multipart data
5. **Production Ready**: Proper authentication, validation, and error handling

### Testing

The solution has been tested with:
- JSON payloads with base64-encoded attachments
- Multipart form data with binary files
- Error conditions (missing transaction, invalid data)
- Authentication scenarios
- File validation and storage

### Current Status: ✅ WORKING

The webhook endpoint is fully functional and ready for production use. The only remaining step is configuring the N8N_WEBHOOK_URL environment variable if you want reverse webhook notifications.

### Production URL
```
https://beeed428-ed5d-4903-bc62-3ba70ac303df-00-38fn65dx21909.kirk.replit.dev/api/webhook/upload-attachments
```

This solution eliminates hours of N8N configuration complexity and provides a reliable, maintainable integration point for email-based document uploads.
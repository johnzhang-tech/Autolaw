# N8N Simple Solution - Direct Webhook Upload

## Problem
Complex N8N workflows with variables and binary data handling are too complicated and unreliable.

## Solution: Direct Webhook with Embedded Transaction ID

### Step 1: Create Simple Webhook Endpoint ✅ COMPLETED
Created a webhook endpoint at `/api/webhook/upload-attachments` that extracts the transaction ID from the email subject and handles all files dynamically.

### Step 2: Single HTTP Request Node Configuration
**Method:** POST
**URL:** `https://beeed428-ed5d-4903-bc62-3ba70ac303df-00-38fn65dx21909.kirk.replit.dev/api/webhook/upload-attachments`

**Headers:**
- `X-API-Key`: `docuai_demo_key_123`
- `Content-Type`: `application/json`

**Body Content Type:** JSON
**Body:** `{{ $json }}`

### Step 3: How It Works
1. **Email Subject** contains transaction ID (e.g., "Test-my-6" maps to transaction 81)
2. **Webhook extracts** transaction ID from subject automatically
3. **All attachments** are processed in a single request
4. **No variables** need to be passed between nodes

### Expected Request Format
The endpoint expects the raw email JSON with attachments:
```json
{
  "subject": "Test-my-6",
  "from": {...},
  "to": {...},
  "attachment_0": {...},
  "attachment_1": {...},
  ...any number of attachments
}
```

### Expected Response
```json
{
  "success": true,
  "message": "6 files uploaded successfully",
  "transactionId": 81,
  "transactionName": "Test-my-6",
  "uploadedFiles": [
    {
      "filename": "Jan Meeting Minutes Revised.pdf",
      "documentId": 330,
      "size": 245760
    }
  ]
}
```

### Benefits
- **No complex workflow** - just one HTTP Request node
- **No variables** to pass between nodes
- **Dynamic file handling** - works with any number of attachments
- **Automatic transaction** mapping from email subject
- **Single API call** - faster and more reliable

This eliminates all the complexity and should work immediately.
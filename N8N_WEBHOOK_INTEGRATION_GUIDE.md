# n8n Webhook Integration Guide for DocuAI

## Overview

DocuAI automatically sends webhook notifications to n8n workflows when transactions are created with document attachments. This enables automated processing, notifications, and integrations with other systems.

## Webhook Event: Transaction Created

### When Webhooks Are Triggered

1. **Bulk Document Upload**: After successful bulk upload to a transaction (`POST /api/transactions/:id/upload`)
2. **Single Document Upload**: After successful single document upload (`POST /api/transactions/:id/upload-single`)

The webhook is triggered **only when documents are successfully uploaded** to a transaction, ensuring n8n receives complete transaction data with attachments.

## Webhook Payload Structure

### Complete Example Payload

```json
{
  "event": "transaction_created",
  "timestamp": "2025-07-05T05:54:18.000Z",
  "transaction": {
    "transaction_id": 24,
    "user_id": "mock-user-1",
    "property_address": "API Test-2",
    "created_at": "2025-07-05T04:11:49.755Z",
    "num_documents": 3,
    "status": "active",
    "address": "123 Test Street, CA 90210",
    "transaction_type": "purchase"
  },
  "user": {
    "id": "mock-user-1",
    "email": "demo@docuai.com",
    "firstName": "Demo",
    "lastName": "User"
  },
  "documents": [
    {
      "id": 127,
      "fileName": "1751688709764_simple_test_6a176b1c.txt",
      "originalFileName": "simple_test.txt",
      "fileSize": 20,
      "mimeType": "text/plain",
      "category": "test",
      "uploadedAt": "2025-07-05T04:11:49.755Z",
      "downloadUrl": "https://replit.com/object-storage/buckets/default/objects/API_Test-2_24%2F1751688709764_simple_test_6a176b1c.txt?sign=..."
    }
  ],
  "metadata": {
    "source": "DocuAI",
    "version": "1.0",
    "webhook_id": "docuai_24_1751694858000"
  }
}
```

### Field Descriptions

#### Transaction Object
- `transaction_id`: Unique transaction identifier
- `user_id`: User who created the transaction
- `property_address`: Transaction name/property address
- `created_at`: ISO timestamp of transaction creation
- `num_documents`: Total number of documents in transaction
- `status`: Transaction status (active, closed, cancelled)
- `address`: Optional property address
- `transaction_type`: Type (purchase, sale, refinance, etc.)

#### User Object
- `id`: Unique user identifier
- `email`: User's email address
- `firstName`: User's first name
- `lastName`: User's last name

#### Documents Array
- `id`: Unique document identifier
- `fileName`: Generated unique filename in storage
- `originalFileName`: Original filename uploaded by user
- `fileSize`: File size in bytes
- `mimeType`: MIME type (e.g., application/pdf, text/plain)
- `category`: Document category (contract, hoa, inspection, etc.)
- `uploadedAt`: ISO timestamp of upload
- `downloadUrl`: Secure presigned URL for downloading (1-hour expiry)

#### Metadata Object
- `source`: Always "DocuAI"
- `version`: API version
- `webhook_id`: Unique webhook event identifier

## n8n Workflow Setup

### Step 1: Create Webhook Node

1. **Add Webhook Node**: Drag "Webhook" node to your n8n canvas
2. **Configure Webhook**:
   - **HTTP Method**: POST
   - **Path**: `/webhook/transaction_created` (or your preferred path)
   - **Authentication**: None (will use headers for security)
   - **Response Mode**: "Respond Immediately"
   - **Response Code**: 200

### Step 2: Extract Webhook URL

After creating the webhook node, n8n will generate a URL like:
```
https://your-n8n-instance.com/webhook/transaction_created
```

Copy this URL for DocuAI configuration.

### Step 3: Configure DocuAI Environment Variables

Set these environment variables in your DocuAI Replit:

```bash
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/transaction_created
N8N_WEBHOOK_SECRET=your-secure-secret-key
```

### Step 4: Security Validation (Optional but Recommended)

Add a **Code** node after the webhook to validate the request:

```javascript
// Validate webhook source
const expectedSecret = 'your-secure-secret-key';
const receivedSecret = $('Webhook').first().headers['x-webhook-secret'];

if (receivedSecret !== expectedSecret) {
  throw new Error('Invalid webhook secret');
}

// Extract transaction data
const payload = $('Webhook').first().body;
const transaction = payload.transaction;
const documents = payload.documents;
const user = payload.user;

return [{
  json: {
    transaction_id: transaction.transaction_id,
    property_address: transaction.property_address,
    num_documents: transaction.num_documents,
    user_email: user.email,
    documents: documents.map(doc => ({
      name: doc.originalFileName,
      size: doc.fileSize,
      type: doc.mimeType,
      downloadUrl: doc.downloadUrl
    }))
  }
}];
```

## DocuAI Webhook Configuration

### Check Webhook Status

```bash
curl -H "X-API-Key: docuai_demo_key_123" \
     "https://beeed428-ed5d-4903-bc62-3ba70ac303df-00-38fn65dx21909.kirk.replit.dev/api/webhook/config"
```

**Response:**
```json
{
  "configured": true,
  "url": "h***m",
  "timeout": 10000,
  "retries": 3,
  "environmentVariables": {
    "N8N_WEBHOOK_URL": true,
    "N8N_WEBHOOK_SECRET": true
  }
}
```

### Test Webhook Connection

```bash
curl -X POST -H "X-API-Key: docuai_demo_key_123" \
     "https://beeed428-ed5d-4903-bc62-3ba70ac303df-00-38fn65dx21909.kirk.replit.dev/api/webhook/test"
```

**Response:**
```json
{
  "success": true,
  "message": "Connected successfully (HTTP 200)"
}
```

## Example n8n Workflows

### Workflow 1: Document Processing Notification

```
Webhook → Code (Extract Data) → Email (Send Notification) → Google Drive (Save Documents)
```

### Workflow 2: Real Estate CRM Integration

```
Webhook → Code (Transform Data) → Salesforce (Create Opportunity) → Slack (Notify Team)
```

### Workflow 3: Document Analysis Pipeline

```
Webhook → Code (Filter PDFs) → HTTP Request (AI Analysis) → Database (Store Results) → Email (Send Report)
```

## Webhook Features

### Automatic Retries
- 3 retry attempts with exponential backoff (1s, 2s, 4s delays)
- Non-blocking: Webhook failures don't affect document uploads

### Security
- **X-Webhook-Secret** header for authentication
- **Authorization: Bearer** header as alternative
- Configurable shared secret via environment variables

### Download URLs
- Secure presigned URLs for document access
- 1-hour expiration for security
- Direct access to Replit Object Storage

### Error Handling
- Graceful failure handling
- Detailed error logging
- Webhook failures don't break upload process

## Testing Your Integration

### Manual Test with Real Upload

1. **Upload Document**:
```bash
curl -X POST "https://beeed428-ed5d-4903-bc62-3ba70ac303df-00-38fn65dx21909.kirk.replit.dev/api/transactions/24/upload-single" \
  -H "X-API-Key: docuai_demo_key_123" \
  -F "document=@test-document.pdf" \
  -F "category=contract"
```

2. **Check n8n Workflow**: Verify webhook was received with transaction and document data

3. **Verify Download URL**: Test document download from the presigned URL

### Debugging Common Issues

#### Webhook Not Received
- Check `N8N_WEBHOOK_URL` environment variable
- Verify n8n webhook node is active
- Test webhook endpoint manually

#### Authentication Failures
- Verify `N8N_WEBHOOK_SECRET` matches in both systems
- Check header case sensitivity

#### Download URL Issues
- URLs expire after 1 hour
- Ensure proper URL encoding
- Verify Replit Object Storage access

## Production Considerations

1. **URL Security**: Keep webhook URLs private
2. **Rate Limiting**: Consider webhook rate limits
3. **Monitoring**: Set up alerts for webhook failures
4. **Backup Processing**: Handle offline scenarios
5. **Data Privacy**: Secure handling of document URLs

## Support

For integration issues:
1. Check DocuAI logs in Replit console
2. Verify webhook configuration with `/api/webhook/config`
3. Test connection with `/api/webhook/test`
4. Review n8n execution logs
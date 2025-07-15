# N8N Working Configuration - Final Solution

## ✅ Issue Resolved
The API now properly handles both numeric and hex string transaction IDs from n8n.

## Complete N8N Workflow Configuration

### Step 1: Transaction Creation
Use HTTP Request node to create a transaction first:

**Method**: `POST`  
**URL**: `https://beeed428-ed5d-4903-bc62-3ba70ac303df-00-38fn65dx21909.kirk.replit.dev/api/transactions`

**Headers**:
- `X-API-Key`: `docuai_demo_key_123`
- `Content-Type`: `application/json`

**Body**:
```json
{
  "name": "N8N Test Property",
  "address": "123 Automation St", 
  "transactionType": "Purchase"
}
```

### Step 2: File Upload
Use HTTP Request node for file upload:

**Method**: `POST`  
**URL**: `https://beeed428-ed5d-4903-bc62-3ba70ac303df-00-38fn65dx21909.kirk.replit.dev/api/transactions/{{$json.id}}/upload-single`

**Headers**:
- `X-API-Key`: `docuai_demo_key_123`
- `Content-Type`: `application/octet-stream`

**Body Configuration**:
- **Body Content Type**: `Raw/Custom`
- **Input Data Field Name**: `attachment_0`
- **Specify Content Type**: `On`
- **Content Type**: `application/octet-stream`

### Step 3: Success Response
You should get a response like:
```json
{
  "success": true,
  "message": "Document uploaded successfully",
  "document": {
    "id": 123,
    "fileName": "document.pdf",
    "category": "other",
    "transactionId": 46
  }
}
```

## Key Fixes Applied

### 1. Transaction ID Parsing
The API now handles both:
- **Numeric IDs**: `46`, `123`, etc.
- **Hex String IDs**: `1980cc059ff2d981`, `abc123def456`, etc.

### 2. Binary Data Processing
- Raw binary uploads work correctly
- File size detection and validation
- Proper MIME type handling

### 3. Field Name Support
API accepts files with these field names:
- `document`
- `attachment`
- `attachment_0`, `attachment_1`, etc.

## Testing Commands

### Test Transaction Creation
```bash
curl -X POST "https://beeed428-ed5d-4903-bc62-3ba70ac303df-00-38fn65dx21909.kirk.replit.dev/api/transactions" \
  -H "X-API-Key: docuai_demo_key_123" \
  -H "Content-Type: application/json" \
  -d '{"name":"N8N Test","address":"123 Test St","transactionType":"Purchase"}'
```

### Test File Upload
```bash
curl -X POST "https://beeed428-ed5d-4903-bc62-3ba70ac303df-00-38fn65dx21909.kirk.replit.dev/api/transactions/[ID]/upload-single" \
  -H "X-API-Key: docuai_demo_key_123" \
  -H "Content-Type: application/octet-stream" \
  --data-binary @/path/to/file.pdf
```

## Current Status
- ✅ Transaction ID parsing fixed (handles hex strings)
- ✅ Binary file upload working
- ✅ API authentication working
- ✅ File storage to Replit Object Storage working
- ✅ Database record creation working
- ⚠️ Webhook notifications failing (404 error) - but file upload succeeds

Your n8n workflow should now work correctly with the Raw/Custom body type configuration!
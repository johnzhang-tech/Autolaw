# N8N Single Upload Configuration - Complete Fix

## Issue Analysis
The logs show that n8n is sending requests with hex string transaction IDs (`1980cc059ff2d981`) that are getting 404 errors, while numeric IDs work correctly. This indicates a routing or URL construction issue.

## Root Cause
N8N is likely using a variable that contains a hex string instead of the actual transaction ID. The `{{$json.id}}` in the URL might be referencing the wrong field.

## Complete Solution

### Step 1: Verify Transaction ID Source
In your n8n workflow, ensure the transaction creation response contains a numeric ID:

**Expected Response from Transaction Creation:**
```json
{
  "id": 46,
  "userId": "mock-user-1",
  "name": "N8N Test Property",
  "address": "123 Automation St",
  "transactionType": "Purchase"
}
```

### Step 2: Correct N8N URL Configuration
Use this exact URL pattern in your HTTP Request node:

**URL**: `https://beeed428-ed5d-4903-bc62-3ba70ac303df-00-38fn65dx21909.kirk.replit.dev/api/transactions/{{$json.id}}/upload-single`

**Critical**: Make sure `{{$json.id}}` references the numeric transaction ID from the previous node's response.

### Step 3: Debug the Transaction ID
Add a debug node after transaction creation to verify the ID:

1. **Add Code Node** after transaction creation:
```javascript
return [
  {
    json: {
      transactionId: $input.all()[0].json.id,
      transactionIdType: typeof $input.all()[0].json.id,
      fullResponse: $input.all()[0].json
    }
  }
];
```

2. **Check the Output** - The transaction ID should be a number, not a hex string.

### Step 4: HTTP Request Configuration
**Method**: `POST`
**URL**: Use the transaction ID from Step 3
**Headers**:
- `X-API-Key`: `docuai_demo_key_123`
- `Content-Type`: `application/octet-stream`
- `X-Filename`: `{{$binary.data.fileName}}` (or custom filename like `my-document.pdf`)

**Body**:
- **Body Content Type**: `Raw/Custom`
- **Input Data Field Name**: `attachment_0`
- **Specify Content Type**: `On`
- **Content Type**: `application/octet-stream`

### Step 4a: Setting Custom Filename
To preserve the original document name, add the `X-Filename` header:
- **Header Name**: `X-Filename`
- **Header Value**: `{{$binary.data.fileName}}` (uses n8n's binary filename)
- **Alternative**: Use a custom name like `contract.pdf`, `hoa-docs.pdf`, etc.

### Step 5: Alternative Direct ID Approach
If the dynamic ID continues to cause issues, use a static transaction ID for testing:

**URL**: `https://beeed428-ed5d-4903-bc62-3ba70ac303df-00-38fn65dx21909.kirk.replit.dev/api/transactions/46/upload-single`

Replace `46` with an actual transaction ID from your database.

## Testing the Fix

### Create a Test Transaction
```bash
curl -X POST "https://beeed428-ed5d-4903-bc62-3ba70ac303df-00-38fn65dx21909.kirk.replit.dev/api/transactions" \
  -H "X-API-Key: docuai_demo_key_123" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "N8N Test Property",
    "address": "123 Automation St",
    "transactionType": "Purchase"
  }'
```

### Test Upload with Returned ID
```bash
curl -X POST "https://beeed428-ed5d-4903-bc62-3ba70ac303df-00-38fn65dx21909.kirk.replit.dev/api/transactions/[RETURNED_ID]/upload-single" \
  -H "X-API-Key: docuai_demo_key_123" \
  -H "Content-Type: application/octet-stream" \
  --data-binary @test-file.pdf
```

## Common Issues and Solutions

### Issue 1: Hex String IDs
**Problem**: URL contains `1980cc059ff2d981` instead of numeric ID
**Solution**: Check transaction creation response, ensure you're using the correct field

### Issue 2: 404 Errors
**Problem**: Route not found
**Solution**: Verify the transaction ID is numeric and exists in the database

### Issue 3: Binary Data Issues
**Problem**: File not uploaded properly
**Solution**: Use Raw/Custom body type with correct Content-Type header

## Expected Success Response
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

The key is ensuring the transaction ID in the URL is the numeric ID returned from transaction creation, not any hex string or other identifier.
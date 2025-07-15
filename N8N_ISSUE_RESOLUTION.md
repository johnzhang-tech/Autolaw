# N8N Upload Issue Resolution - Complete Fix

## Issue Summary
The "Bad gateway" error occurs when the server crashes due to database connection issues or field transformation problems in the API response.

## Root Cause Fixed
1. **Database Connection**: Server crashed due to Neon PostgreSQL connection timeout
2. **Field Transformation**: The `id` field wasn't properly removed from responses, causing conflicts

## Complete Solution Applied

### 1. Server Restart ✅
- Restarted the application server 
- Database connection restored successfully
- All endpoints now operational

### 2. API Response Format Fixed ✅
**Before (Problematic):**
```json
{
  "id": 46,
  "Tranx_id": 46,  // Caused conflicts
  "name": "Test Transaction"
}
```

**After (Fixed):**
```json
{
  "Tranx_id": 46,  // Only this field present
  "name": "Test Transaction"
  // "id" field completely removed
}
```

### 3. N8N Configuration - Updated

**Your n8n HTTP Request should use:**

**URL:** 
```
https://beeed428-ed5d-4903-bc62-3ba70ac303df-00-38fn65dx21909.kirk.replit.dev/api/transactions/{{$json.Tranx_id}}/upload-single
```

**Headers:**
- `X-API-Key`: `docuai_demo_key_123`
- `Content-Type`: `application/octet-stream`
- `X-Filename`: `your-document-name.pdf` (optional, for custom filenames)

**Body Configuration:**
- **Body Content Type**: `Raw/Custom`
- **Input Data Field Name**: `attachment_0`
- **Specify Content Type**: `On`
- **Content Type**: `application/octet-stream`

## Testing Steps

### Step 1: Create Transaction (Test)
```bash
curl -X POST "https://beeed428-ed5d-4903-bc62-3ba70ac303df-00-38fn65dx21909.kirk.replit.dev/api/transactions" \
  -H "X-API-Key: docuai_demo_key_123" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "N8N Test Property", 
    "address": "123 Test St",
    "transactionType": "Purchase"
  }'
```

**Expected Response:**
```json
{
  "Tranx_id": 48,
  "userId": "mock-user-1",
  "name": "N8N Test Property",
  "address": "123 Test St",
  "transactionType": "Purchase",
  "status": "active",
  "numDocuments": 0,
  "createdAt": "2025-07-15T20:59:00.000Z",
  "updatedAt": "2025-07-15T20:59:00.000Z"
}
```

### Step 2: Upload Document (Test)
```bash
curl -X POST "https://beeed428-ed5d-4903-bc62-3ba70ac303df-00-38fn65dx21909.kirk.replit.dev/api/transactions/48/upload-single" \
  -H "X-API-Key: docuai_demo_key_123" \
  -H "Content-Type: application/pdf" \
  -H "X-Filename: test-contract.pdf" \
  --data-binary @test-file.pdf
```

## Current Status ✅
- ✅ Server running and stable
- ✅ Database connection restored
- ✅ API field conflicts resolved
- ✅ All transaction endpoints returning `Tranx_id` only
- ✅ Upload endpoint working with proper filename handling
- ✅ Webhook notifications functioning

## N8N Workflow Fixes

### Issue: "Couldn't reach this app body"
This error happens when:
1. Using wrong transaction ID format (should be numeric, not hex)
2. Server crashed (now fixed)
3. Wrong URL structure (now documented correctly)

### Solution Applied:
1. **Fixed API Response**: Removed `id` field completely, only `Tranx_id` present
2. **Updated Documentation**: All examples use `{{$json.Tranx_id}}`
3. **Server Stability**: Database connection issues resolved
4. **Error Handling**: Better error responses for debugging

## Next Steps for N8N
1. **Update URL**: Use `{{$json.Tranx_id}}` in your HTTP Request URL
2. **Test Transaction Creation**: Verify you get `Tranx_id` in response
3. **Test Upload**: Use the `Tranx_id` value for document upload
4. **Add Custom Filename**: Use `X-Filename` header if needed

The server is now stable and ready for your n8n workflow!
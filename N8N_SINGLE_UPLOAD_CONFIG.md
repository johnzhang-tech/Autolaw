# N8N Single File Upload Configuration Guide

## Issue Identified
Looking at your n8n screenshot, the problem is in the binary data configuration. The endpoint is working correctly but n8n needs specific setup to send files properly.

## ✅ API Endpoint is Ready
- **Endpoint**: `POST /api/transactions/{transactionId}/upload-single` ✓ Working
- **Authentication**: `X-API-Key: docuai_demo_key_123` ✓ Working  
- **Field Names**: Accepts both `attachment` and `document` ✓ Working

## 🔧 Fix Your N8N Configuration

### 1. HTTP Request Node Settings:
- **Method**: `POST` ✓
- **URL**: `https://beeed428-ed5d-4903-bc62-3ba70ac303df-00-38fn65dx21909.kirk.replit.dev/api/transactions/34/upload-single`
- **Body Content Type**: `Form-Data` ✓

### 2. Headers:
```
X-API-Key: docuai_demo_key_123
```

### 3. Body Parameters (this is the critical part):

**Parameter 1: attachment (File)**
- **Parameter Type**: `n8n Binary File` ✓ 
- **Name**: `attachment`
- **Input Data Field Name**: Use the exact binary property name from your previous node
  - If from Merge node: `attachment_1` or `attachment_8` (whatever shows in your data)
  - If from HTTP Request: `data` 
  - **Important**: Don't use the full expression like `{{ $('Merge').first().binary.attachment_8 }}` in the field name, just use `attachment_8`

**Parameter 2: category (Optional)**
- **Parameter Type**: `String`
- **Name**: `category`  
- **Value**: `hoa`

## 🐛 What Was Wrong
Your screenshot shows `{{ $('Merge').first().binary.attachment_8 }}` in the Input Data Field Name. This is incorrect.

**Correct Setup:**
- **Name**: `attachment`
- **Input Data Field Name**: `attachment_8` (just the property name, no brackets or expressions)

## 🧪 Test Steps
1. Fix the Input Data Field Name as described above
2. Run your n8n workflow
3. Check our server logs - they'll show if the file is now being received correctly
4. You should see `totalFilesReceived: 1` in the debug output instead of `0`

The API endpoint is fully ready and working - it's just a matter of n8n sending the binary data correctly!
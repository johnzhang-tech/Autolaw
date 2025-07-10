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
- **Input Data Field Name**: **CRITICAL** - Must match exactly what's in your binary data
  - Looking at your screenshot, you have `attachment_1` (ArticlesOfIncorporation.pdf)
  - So use: `attachment_1` (NOT `attachment_0`)
  - **How to find the correct name**: Look at your previous node's output and see what binary properties exist

**Parameter 2: category (Optional)**
- **Parameter Type**: `String`
- **Name**: `category`  
- **Value**: `hoa`

## 🐛 What Was Wrong
1. First issue: You were using expressions `{{ $('Merge').first().binary.attachment_8 }}` instead of just the property name
2. **Current issue**: You're using `attachment_0` but your data shows `attachment_1`

**Correct Setup Based on Your Screenshot:**
- **Name**: `attachment`
- **Input Data Field Name**: `attachment_1` (this matches the binary data in your screenshot)

## 🧪 Test Steps
1. **Change Input Data Field Name from `attachment_0` to `attachment_1`** (based on your screenshot)
2. Run your n8n workflow
3. Check our server logs - they'll show if the file is now being received correctly
4. You should see `totalFilesReceived: 1` in the debug output instead of `0`

## 🔍 How to Find the Correct Field Name
1. Look at your previous node's output (the one before HTTP Request)
2. Click on the "Binary" tab 
3. See what properties are listed (like `attachment_1`, `attachment_2`, etc.)
4. Use that exact name in your Input Data Field Name

**From your screenshot, use: `attachment_1`**

The API endpoint is fully ready and working - it's just a matter of using the correct binary property name!
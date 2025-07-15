# N8N Working Configuration - Final Solution

## ✅ CONFIRMED WORKING Setup

### HTTP Request Node Configuration

**1. Method & URL:**
```
Method: POST
URL: https://beeed428-ed5d-4903-bc62-3ba70ac303df-00-38fn65dx21909.kirk.replit.dev/api/transactions/{transaction_id}/upload-single
```

**2. Authentication:**
```
Header Name: X-API-Key
Header Value: docuai_demo_key_123
```

**3. Body Parameters (Form-Data):**

**Option A: Simple Field Names (RECOMMENDED)**
```
Parameter Type: nBn Binary File
Name: attachment_0
Input Data Field Name: attachment_0
```

**Option B: Dynamic Field Names**
```
Parameter Type: nBn Binary File  
Name: file1
Input Data Field Name: attachment_0
```

**Option C: Multiple Files**
```
Parameter 1:
  Type: nBn Binary File
  Name: file1
  Input Data Field Name: attachment_0

Parameter 2:
  Type: nBn Binary File
  Name: file2  
  Input Data Field Name: attachment_1

Parameter 3:
  Type: nBn Binary File
  Name: file3
  Input Data Field Name: attachment_2
```

## ⚠️ Common Issues & Solutions

### Issue 1: Field Name Empty/Undefined
**Problem:** `{{ $json.attachments.filename }}` resolves to empty
**Solution:** Use static field names like `attachment_0`, `file1`, etc.

### Issue 2: "MISSING_FIELD_NAME" Error
**Problem:** n8n sends empty field names
**Solution:** Always provide a static name in the "Name" field

### Issue 3: File Not Found
**Problem:** Input Data Field Name points to non-existent data
**Solution:** Use the exact field name from your previous node output

## 📋 Step-by-Step Setup

1. **Add HTTP Request Node**
2. **Set Method to POST**
3. **Enter the full API URL with transaction ID**
4. **Add Authentication Header:**
   - Name: `X-API-Key`
   - Value: `docuai_demo_key_123`
5. **Add Body Parameters:**
   - Click "Add Parameter"
   - Select "nBn Binary File"
   - Name: `attachment_0` (or any static name)
   - Input Data Field Name: `attachment_0` (from your file input)

## 🎯 Working Examples

**Single File Upload:**
```json
{
  "method": "POST",
  "url": "https://beeed428-ed5d-4903-bc62-3ba70ac303df-00-38fn65dx21909.kirk.replit.dev/api/transactions/54/upload-single",
  "headers": {
    "X-API-Key": "docuai_demo_key_123"
  },
  "body": {
    "attachment_0": "[binary file data]"
  }
}
```

**Multiple Files:**
```json
{
  "method": "POST", 
  "url": "https://beeed428-ed5d-4903-bc62-3ba70ac303df-00-38fn65dx21909.kirk.replit.dev/api/transactions/54/upload-single",
  "headers": {
    "X-API-Key": "docuai_demo_key_123"
  },
  "body": {
    "file1": "[binary file data 1]",
    "file2": "[binary file data 2]",
    "file3": "[binary file data 3]"
  }
}
```

## ✅ Expected Success Response

```json
{
  "success": true,
  "message": "6 files uploaded successfully",
  "uploaded": [
    {
      "fieldName": "file1",
      "fileName": "HOA-Declaration.pdf",
      "documentId": 297
    }
  ],
  "failed": [],
  "transactionId": 52
}
```

## 🔧 Troubleshooting

1. **Always use static field names** - don't use expressions for the "Name" field
2. **Check your Input Data Field Name** - make sure it matches your previous node output
3. **Verify transaction ID exists** - use a valid transaction ID in the URL
4. **Test with single file first** - then expand to multiple files

The system now accepts ANY field names, so focus on getting the basic configuration right!
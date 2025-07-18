# N8N Correct Configuration - Form Data Method

## Problem in Screenshot
The error "The item has no binary field '[object Object]' [item 0]" occurs because of incorrect binary field reference.

## ✅ CORRECTED N8N Configuration

### HTTP Request Node Settings:

1. **URL**: 
   ```
   https://beeed428-ed5d-4903-bc62-3ba70ac303df-00-38fn65dx21909.kirk.replit.dev/api/transactions/{{$json.Tranx_id}}/upload-single
   ```

2. **Method**: `POST`

3. **Send Body**: `Form-Data`

4. **Body Parameters**:

   **Parameter 1:**
   - Name: `document`
   - Value Type: `Attachment/Binary Data`
   - Value: `{{$binary.data}}`  ← Use your actual binary field name

   **Parameter 2:**
   - Name: `filename`
   - Value Type: `String`
   - Value: `{{$binary.data.fileName}}`  ← This should match your binary field

5. **Headers**:
   - `X-API-Key`: `docuai_demo_key_123`

## 🔧 Alternative Simpler Configuration (Recommended)

If you're having binary field issues, use the **Query Parameter Method**:

1. **URL**: 
   ```
   https://beeed428-ed5d-4903-bc62-3ba70ac303df-00-38fn65dx21909.kirk.replit.dev/api/transactions/{{$json.Tranx_id}}/upload-single?filename={{$binary.data.fileName}}
   ```

2. **Method**: `POST`

3. **Send Body**: `Attach Binary File`

4. **Input Data Field Name**: `data`

5. **Headers**:
   - `X-API-Key`: `docuai_demo_key_123`

## 🚨 Common N8N Binary Field Issues

### Issue 1: Wrong Binary Field Name
- **Problem**: Using `{{$binary.data.fileName}}` when your field is named differently
- **Solution**: Check your previous node's output and use the correct field name

### Issue 2: Binary Field Access
- **Problem**: `[object Object]` error
- **Solution**: Use `{{$binary.FIELD_NAME}}` not `{{$binary.FIELD_NAME.fileName}}`

### Issue 3: Field Name in Parameters
- **Problem**: N8N can't find the fileName property  
- **Solution**: Use a hardcoded filename or get it from a different source

## 📋 Debugging Steps

1. **Check Binary Output**: Look at your previous node's output to see the exact binary field names
2. **Test with Fixed Filename**: Use `HOA-Document.pdf` instead of `{{$binary.data.fileName}}`
3. **Use Query Method**: Simpler than form-data, just add `?filename=YourFile.pdf` to URL

## ✅ Working Example with Fixed Filename

**URL**: 
```
https://beeed428-ed5d-4903-bc62-3ba70ac303df-00-38fn65dx21909.kirk.replit.dev/api/transactions/{{$json.Tranx_id}}/upload-single?filename=HOA-Document.pdf
```

**Method**: `POST`
**Send Body**: `Attach Binary File`
**Input Data Field Name**: `data`
**Headers**: `X-API-Key: docuai_demo_key_123`

This will upload your file with the name "HOA-Document.pdf" instead of the random generated name.
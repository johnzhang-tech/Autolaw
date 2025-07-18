# N8N Form-Data Debug Guide - Preserve Original Filenames

## The Problem in Your Screenshot
Error: "The item has no binary field '[object Object]' [item 0]"

This happens because N8N can't resolve the binary field reference you're using.

## 🔍 Step 1: Find Your Actual Binary Field Name

Before configuring the HTTP Request node, check your previous node's output:

1. **Click on your previous node** (the one that has the file/attachment)
2. **Look at the output data structure**
3. **Find the binary field name** - it might be:
   - `attachment`
   - `data` 
   - `file`
   - `binary_data`
   - Or something specific to your data source

## 🔧 Step 2: Correct Form-Data Configuration

**Replace `data` with your actual binary field name from Step 1:**

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
   - Value: `{{$binary.YOUR_ACTUAL_FIELD_NAME}}`  ← Replace YOUR_ACTUAL_FIELD_NAME

   **Parameter 2:**
   - Name: `filename`
   - Value Type: `String`
   - Value: `{{$binary.YOUR_ACTUAL_FIELD_NAME.fileName}}`  ← Same field name

5. **Headers**:
   - `X-API-Key`: `docuai_demo_key_123`

## 🚨 Alternative if Binary Field Has No fileName Property

Some binary fields don't have a `.fileName` property. If that's the case:

**Parameter 2 alternatives:**
- Name: `filename`
- Value Type: `String`
- Value options (try these in order):
  1. `{{$binary.YOUR_FIELD_NAME.fileName}}`
  2. `{{$binary.YOUR_FIELD_NAME.filename}}`
  3. `{{$binary.YOUR_FIELD_NAME.name}}`
  4. `{{$json.fileName}}` (if filename is in JSON data)
  5. `Document-{{$json.id}}.pdf` (fallback with ID)

## 📋 Quick Test Configuration

To test if the endpoint works, use a **hardcoded filename first**:

**Parameter 2:**
- Name: `filename`
- Value Type: `String`
- Value: `HOA-Test-Document.pdf`  ← Fixed name for testing

If this works, then the problem is just the filename reference, not the form-data method itself.

## 🔍 Debug Your Binary Field

Add a debug step before your HTTP Request:

1. **Add a "Set" node** before the HTTP Request
2. **Set it to output your binary field structure**:
   ```
   {
     "binaryFieldName": "{{Object.keys($binary)[0]}}",
     "binaryFields": "{{Object.keys($binary)}}",
     "hasFileName": "{{$binary.YOUR_FIELD_NAME.fileName}}"
   }
   ```

This will show you exactly what binary fields are available and their properties.
# N8N Form-Data Solution for Filename Preservation

## Problem
Files uploaded via N8N binary upload get random names like `raw-binary-1752721581912.pdf` instead of preserving original filenames.

## ✅ SOLUTION: Use Form-Data Method

### N8N HTTP Request Node Configuration

1. **URL**: 
   ```
   https://beeed428-ed5d-4903-bc62-3ba70ac303df-00-38fn65dx21909.kirk.replit.dev/api/transactions/{{$json.Tranx_id}}/upload-single
   ```

2. **Method**: `POST`

3. **Send Body**: `Form-Data`

4. **Body Parameters**:
   - **Parameter 1**: 
     - Name: `document` 
     - Value Type: `Attachment/Binary Data`
     - Value: `{{$binary.data}}`
   
   - **Parameter 2**:
     - Name: `filename`
     - Value Type: `String`
     - Value: `{{$binary.data.fileName}}`

5. **Headers**:
   - `X-API-Key`: `docuai_demo_key_123`

### Alternative Configuration (Query Parameter Method)

If you prefer to keep using binary upload:

1. **URL**: 
   ```
   https://beeed428-ed5d-4903-bc62-3ba70ac303df-00-38fn65dx21909.kirk.replit.dev/api/transactions/{{$json.Tranx_id}}/upload-single?filename={{$binary.data.fileName}}
   ```

2. **Method**: `POST`

3. **Send Body**: `Attach Binary File`

4. **Input Data Field Name**: `data`

5. **Headers**:
   - `X-API-Key`: `docuai_demo_key_123`

### Alternative Configuration (Header Method)

1. **URL**: 
   ```
   https://beeed428-ed5d-4903-bc62-3ba70ac303df-00-38fn65dx21909.kirk.replit.dev/api/transactions/{{$json.Tranx_id}}/upload-single
   ```

2. **Method**: `POST`

3. **Send Body**: `Attach Binary File`

4. **Input Data Field Name**: `data`

5. **Headers**:
   - `X-API-Key`: `docuai_demo_key_123`
   - `X-Filename`: `{{$binary.data.fileName}}`

## Expected Result

✅ **Before Fix**: `raw-binary-1752721581912.pdf`
✅ **After Fix**: `HOA_Assessment_Delinquency_Policy.pdf` (original filename preserved)

## API Response

```json
{
  "success": true,
  "document": {
    "id": 403,
    "fileName": "HOA_Assessment_Delinquency_Policy.pdf",
    "originalFileName": "HOA_Assessment_Delinquency_Policy.pdf",
    "fileSize": 301891,
    "mimeType": "application/pdf"
  },
  "message": "File uploaded successfully"
}
```

## Filename Sources (Priority Order)

The API checks for filenames in this order:
1. Form-data `filename` parameter
2. Header `X-Filename`
3. Header `X-Original-Filename` 
4. Header `X-File-Name`
5. Query parameter `filename`
6. Query parameter `originalFilename`
7. Query parameter `name`
8. Content-Disposition header
9. Fallback: `n8n-upload-{timestamp}.pdf`

## Testing Your Configuration

After implementing the fix, verify in DocuAI Documents section that files show their original names instead of generated names.

## Recommendation

**Use the Form-Data method** as it's the most reliable way to preserve both file content and filename in N8N workflows.
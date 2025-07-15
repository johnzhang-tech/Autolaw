# n8n Filename Preservation Guide

## Problem
When using n8n's HTTP Request node with "Attach Binary File", the original filenames are lost and become generic names like "attachment_0".

## Solution Options

### Option 1: Use Query Parameters (Recommended)
In your n8n HTTP Request node configuration:

1. **URL**: `https://your-api-url.com/api/transactions/{{$json.Tranx_id}}/upload-single?filename={{$binary.attachment_0.fileName}}`
2. **Method**: POST
3. **Send Body**: Yes - Attach Binary File
4. **Input Data Field Name**: `attachment_0`
5. **Headers**: Keep as default

**Example URL with filename**:
```
https://beeed428-ed5d-4903-bc62-3ba70ac303df-00-38fn65dx21909.kirk.replit.dev/api/transactions/48/upload-single?filename=HOA_Assessment_Delinquency_Policy_Approved_Aug_2006.pdf
```

### Option 2: Use Custom Headers
In your n8n HTTP Request node configuration:

1. **URL**: `https://your-api-url.com/api/transactions/{{$json.Tranx_id}}/upload-single`
2. **Method**: POST
3. **Send Body**: Yes - Attach Binary File
4. **Input Data Field Name**: `attachment_0`
5. **Headers**:
   - Add Header: `X-Filename` = `{{$binary.attachment_0.fileName}}`
   - Add Header: `X-API-Key` = `docuai_demo_key_123`

### Option 3: Use originalFilename Query Parameter
If you have access to the original filename in your data:

1. **URL**: `https://your-api-url.com/api/transactions/{{$json.Tranx_id}}/upload-single?originalFilename={{$json.originalFilename}}`

## API Support
The DocuAI API now supports filename extraction from:
- Query parameters: `?filename=document.pdf`
- Query parameters: `?originalFilename=document.pdf`
- Headers: `X-Filename: document.pdf`
- Headers: `X-Original-Filename: document.pdf`
- Headers: `X-File-Name: document.pdf`
- Content-Disposition header

## Current n8n Configuration Issues
Your current setup shows:
- Input Data Field Name: `attachment_0`
- No filename preservation mechanism

## Quick Fix for Your Current Setup
1. Change your URL from:
   ```
   https://beeed428-ed5d-4903-bc62-3ba70ac303df-00-38fn65dx21909.kirk.replit.dev/api/transactions/48/upload-single
   ```
   
   To:
   ```
   https://beeed428-ed5d-4903-bc62-3ba70ac303df-00-38fn65dx21909.kirk.replit.dev/api/transactions/48/upload-single?filename={{$binary.attachment_0.fileName}}
   ```

2. Or add a custom header:
   - Header Name: `X-Filename`
   - Header Value: `{{$binary.attachment_0.fileName}}`

## Testing
After implementing the fix, you should see in the API response:
```json
{
  "success": true,
  "document": {
    "filename": "HOA_Assessment_Delinquency_Policy_Approved_Aug_2006.pdf",
    "originalname": "HOA_Assessment_Delinquency_Policy_Approved_Aug_2006.pdf"
  }
}
```

## Fallback Behavior
If no filename is provided, the API will generate a timestamped filename like `n8n-upload-1752597228.pdf` to ensure files are uniquely named.
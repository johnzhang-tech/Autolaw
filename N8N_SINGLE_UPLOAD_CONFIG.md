# n8n Single File Upload Configuration for DocuAI

## Correct Configuration for HTTP Request Node

### URL
```
https://beeed428-ed5d-4903-bc62-3ba70ac303df-00-38fn65dx21909.kirk.replit.dev/api/transactions/34/upload-single
```

### Method
POST

### Authentication
**Headers:**
```
X-API-Key: docuai_demo_key_123
```

### Body Configuration
**Body Content Type:** `Form-Data`

**Parameters:**
1. **document** (File/Binary)
   - Parameter Type: `n8n Binary File`
   - Name: `document`
   - Input Data Field Name: `{{ $('Merge').first().binary.attachment }}`

2. **category** (Text - Optional)
   - Parameter Type: `Fixed`
   - Name: `category`
   - Value: `hoa` (or other category like `contract`, `inspection`, `financial`, `legal`)

## Key Changes Needed in Your Current Config:

1. **Change the file field name from `attachment` to `document`**
2. **Use `Form-Data` content type, not JSON**
3. **Make sure previous node outputs binary data named `attachment`**

## Example n8n Workflow Structure:
```
[Read Binary File] → [HTTP Request (Upload)]
```

## Troubleshooting:

### Error: "No file uploaded"
- Verify the previous node outputs binary data
- Check that the field name is `document` (not `attachment`)
- Ensure Content-Type is `multipart/form-data`

### Error: "Authentication failed"
- Verify X-API-Key header is set to `docuai_demo_key_123`
- Check the URL is correct

### Expected Response (Success):
```json
{
  "success": true,
  "message": "Document \"filename.pdf\" uploaded successfully to transaction 34",
  "document": {
    "id": 123,
    "fileName": "unique_filename.pdf",
    "originalFileName": "filename.pdf",
    "fileSize": 302048,
    "mimeType": "application/pdf",
    "category": "hoa",
    "uploadStatus": "completed"
  },
  "transaction": {
    "id": 34,
    "name": "Transaction Name",
    "numDocuments": 1
  }
}
```
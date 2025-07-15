# Google Docs Upload Test for N8N Integration

## ✅ ENHANCED SUPPORT IMPLEMENTED

The `/upload-single` endpoint now fully supports Google Docs uploads with the following enhancements:

### 1. **Extended MIME Type Support**
- `application/vnd.google-apps.document` (Google Docs)
- `application/vnd.google-apps.spreadsheet` (Google Sheets) 
- `application/vnd.google-apps.presentation` (Google Slides)
- Plus all Microsoft Office formats (DOC, DOCX, XLS, XLSX, PPT, PPTX)
- OpenDocument formats (ODT, ODS, ODP)
- Text files (TXT, RTF)
- PDF files
- Images (JPEG, PNG, GIF, WebP)

### 2. **Intelligent File Extension Detection**
- Automatically adds `.gdoc` extension for Google Docs
- Automatically adds `.gsheet` extension for Google Sheets
- Automatically adds `.gslides` extension for Google Slides
- Fallback extension detection based on MIME type

### 3. **N8N Configuration for Google Docs**

#### Single Google Doc Upload
```
URL: https://beeed428-ed5d-4903-bc62-3ba70ac303df-00-38fn65dx21909.kirk.replit.dev/api/transactions/{{$json.Tranx_id}}/upload-single
Method: POST
Headers: X-API-Key: docuai_demo_key_123
Body: Form-Data
Fields:
  - file1: {{$binary.attachment_0}} (Binary)
  - filename1: {{$binary.attachment_0.fileName}} (Text) - Optional
```

#### Multiple Google Docs Upload
```
URL: https://beeed428-ed5d-4903-bc62-3ba70ac303df-00-38fn65dx21909.kirk.replit.dev/api/transactions/{{$json.Tranx_id}}/upload-single
Method: POST
Headers: X-API-Key: docuai_demo_key_123
Body: Form-Data
Fields:
  - file1: {{$binary.attachment_0}} (Binary)
  - file2: {{$binary.attachment_1}} (Binary)
  - file3: {{$binary.attachment_2}} (Binary)
  - file4: {{$binary.attachment_3}} (Binary)
```

### 4. **Google Docs Processing Features**
- **Automatic Extension**: Files without extensions get appropriate Google Docs extensions
- **MIME Type Detection**: Proper handling of Google Workspace MIME types
- **Filename Preservation**: Original Google Docs filenames are preserved
- **Multi-format Support**: Works with exported Google Docs in various formats

### 5. **Expected Response for Google Docs**
```json
{
  "success": true,
  "message": "1 files uploaded successfully",
  "uploaded": [
    {
      "fieldName": "file1",
      "fileName": "My Google Document.gdoc",
      "documentId": 209
    }
  ],
  "failed": [],
  "transactionId": 51
}
```

### 6. **Troubleshooting Google Docs**

#### Common Issues:
1. **MIME Type Not Recognized**: The system now accepts `application/octet-stream` as fallback
2. **Missing Extensions**: Automatically adds `.gdoc`, `.gsheet`, `.gslides` extensions
3. **Large Files**: Google Docs exports are typically small, but limit is 10MB
4. **Binary Data**: System handles both form-data and raw binary uploads

#### Debug Information:
The endpoint provides detailed debug logs showing:
- Detected MIME type
- Original filename
- Applied file extension
- Processing mode (single vs multiple)

### 7. **Production Ready**
- ✅ Google Docs MIME types whitelisted in storage validation
- ✅ Proper file extension handling
- ✅ Multi-file upload support
- ✅ Atomic operations with rollback
- ✅ Webhook notifications
- ✅ Error handling and cleanup

## Test Instructions

1. **Export Google Doc**: Download your Google Doc as any format (PDF, DOCX, etc.)
2. **Upload via n8n**: Use the form-data configuration above
3. **Verify Storage**: Check that file appears in Replit Object Storage
4. **Check Response**: Confirm successful upload in API response
5. **Test Download**: Verify file can be downloaded from DocuAI interface

The system now fully supports Google Docs uploads through the existing `/upload-single` endpoint!
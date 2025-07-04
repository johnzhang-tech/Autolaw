# DocuAI External API Access Guide

## Base URL
Production: `https://beeed428-ed5d-4903-bc62-3ba70ac303df-00-38fn65dx21909.kirk.replit.dev`
Development: `http://localhost:5000`

## Authentication Methods

### 1. Session-Based Authentication (Web UI)
- **Type**: Session cookies with Replit Auth/Google OAuth
- **Usage**: Web application frontend
- **Login**: Navigate to `/api/login` to authenticate
- **Session**: Maintained via secure HTTP-only cookies

### 2. API Key Authentication (External Apps)
- **Type**: API Key in headers
- **Usage**: External applications, scripts, integrations
- **Demo Key**: `docuai_demo_key_123` (for testing)
- **Header Format**: `X-API-Key: your_api_key` or `Authorization: Bearer your_api_key`

#### Get API Key
```http
POST /api/generate-api-key
Authorization: Session Cookie
```

**Response:**
```json
{
  "success": true,
  "apiKey": "docuai_mock-user-1_1751522789123_abc123",
  "demoKey": "docuai_demo_key_123",
  "usage": "Include in headers as 'X-API-Key: <key>' or 'Authorization: Bearer <key>'",
  "baseUrl": "https://your-app.replit.dev",
  "endpoints": ["GET /api/transactions", "POST /api/transactions", ...],
  "exampleUsage": {
    "curl": "curl -H \"X-API-Key: your_key\" \"https://your-app.replit.dev/api/transactions\"",
    "javascript": "fetch('/api/transactions', { headers: { 'X-API-Key': 'your_key' } })"
  }
}
```

## Available Endpoints

### Transactions API

#### List All Transactions
```http
GET /api/transactions
X-API-Key: docuai_demo_key_123
# OR
Authorization: Bearer docuai_demo_key_123
```

**cURL Example:**
```bash
curl -H "X-API-Key: docuai_demo_key_123" \
     "https://beeed428-ed5d-4903-bc62-3ba70ac303df-00-38fn65dx21909.kirk.replit.dev/api/transactions"
```

**JavaScript Example:**
```javascript
const response = await fetch('/api/transactions', {
  headers: {
    'X-API-Key': 'docuai_demo_key_123'
  }
});
const transactions = await response.json();
```

**Response:**
```json
[
  {
    "id": 16,
    "userId": "mock-user-1", 
    "name": "Manual Testing",
    "address": "1556 High Street, Los Altos, CA 94022",
    "transactionType": "sale",
    "status": "active",
    "numDocuments": 9,
    "createdAt": "2025-01-03T06:01:02.000Z",
    "updatedAt": "2025-01-03T06:01:02.000Z"
  }
]
```

#### Create New Transaction
```http
POST /api/transactions
Content-Type: application/json
Authorization: Session Cookie

{
  "name": "Property Transaction",
  "address": "123 Main St, City, State 12345",
  "transactionType": "purchase",
  "status": "active"
}
```

#### Get Single Transaction
```http
GET /api/transactions/{id}
Authorization: Session Cookie
```

#### Update Transaction
```http
PUT /api/transactions/{id}
Content-Type: application/json
Authorization: Session Cookie

{
  "name": "Updated Name",
  "status": "closed"
}
```

#### Delete Transaction
```http
DELETE /api/transactions/{id}
Authorization: Session Cookie
```

### Document Management API

#### Upload Documents to Transaction
```http
POST /api/transactions/{id}/upload
Content-Type: multipart/form-data
Authorization: Session Cookie

Form Data:
- documents: File[] (multiple files)
- category: string (optional, defaults to "hoa")
```

**Response:**
```json
{
  "success": true,
  "message": "Uploaded 9 of 9 files successfully (ATOMIC)",
  "uploadResults": [
    {
      "documentId": 126,
      "filename": "HOA-BY-LAWS.pdf",
      "objectKey": "Manual_Testing_16/1751522456920_HOA-BY-LAWS_c44cb99e.pdf",
      "fileSize": 4792567,
      "category": "hoa"
    }
  ],
  "transaction": {
    "id": 16,
    "name": "Manual Testing",
    "numDocuments": 9
  }
}
```

#### List Documents in Transaction
```http
GET /api/transactions/{id}/documents
Authorization: Session Cookie
```

#### Download Document
```http
GET /api/documents/{id}/download
Authorization: Session Cookie
```

### Users API

#### Get Current User Profile
```http
GET /api/users/profile
Authorization: Session Cookie
```

#### Update User Profile
```http
PATCH /api/users/profile
Content-Type: application/json
Authorization: Session Cookie

{
  "region": "West Coast",
  "userType": "Recurring",
  "userStatus": "Active"
}
```

### Chat/AI API

#### Create Chat Session
```http
POST /api/chat/sessions
Content-Type: application/json
Authorization: Session Cookie

{
  "title": "HOA Questions",
  "context": "real-estate"
}
```

#### Send Chat Message
```http
POST /api/chat/sessions/{id}/messages
Content-Type: application/json
Authorization: Session Cookie

{
  "content": "What are the monthly HOA fees?",
  "documentContext": {
    "documentId": 126,
    "fileName": "HOA-BY-LAWS.pdf"
  }
}
```

## Document Upload APIs

### Bulk Upload (Multiple Files)
Upload up to 60 files in a single request with atomic transaction guarantees.

```bash
curl -X POST "https://beeed428-ed5d-4903-bc62-3ba70ac303df-00-38fn65dx21909.kirk.replit.dev/api/transactions/{transaction_id}/upload" \
  -H "X-API-Key: docuai_demo_key_123" \
  -F "documents=@/path/to/file1.pdf" \
  -F "documents=@/path/to/file2.pdf" \
  -F "documents=@/path/to/file3.pdf" \
  -F "category=contract"
```

### Single Document Upload (One-by-One)
Upload documents individually with full data consistency and atomic rollback protection.

```bash
curl -X POST "https://beeed428-ed5d-4903-bc62-3ba70ac303df-00-38fn65dx21909.kirk.replit.dev/api/transactions/{transaction_id}/upload-single" \
  -H "X-API-Key: docuai_demo_key_123" \
  -F "document=@/path/to/contract.pdf" \
  -F "category=contract"
```

**Single Upload Response:**
```json
{
  "success": true,
  "message": "Document \"contract.pdf\" uploaded successfully to transaction 17",
  "document": {
    "id": 145,
    "fileName": "contract_1751648123456.pdf",
    "originalFileName": "contract.pdf",
    "fileSize": 248576,
    "mimeType": "application/pdf",
    "category": "contract",
    "uploadStatus": "completed",
    "uploadedAt": "2025-07-04T22:48:43.456Z"
  },
  "transaction": {
    "id": 17,
    "name": "API Test Transaction",
    "numDocuments": 1
  }
}
```

### Data Consistency Guarantees

Both upload endpoints provide **ACID compliance**:

1. **Atomicity**: Either all operations succeed or all fail (no partial uploads)
2. **Consistency**: Database constraints maintained throughout upload process
3. **Isolation**: Concurrent uploads don't interfere with each other
4. **Durability**: Successful uploads are permanently stored

**Rollback Protection:**
- If database insertion fails, uploaded files are automatically deleted from storage
- Transaction document counts remain accurate even during failures
- No orphaned files or inconsistent states

### File Upload Specifications

#### Supported File Types
- **Documents**: PDF, DOC, DOCX, TXT
- **Images**: JPEG, PNG, GIF
- **Max Size**: 10MB per file
- **Max Files**: 60 files per bulk upload, 1 file per single upload

#### Storage System
- **Backend**: Replit Object Storage with base64 workaround
- **Organization**: Transaction-based folders (`TransactionName_ID/`)
- **Metadata**: PostgreSQL database with file tracking
- **Download**: Secure presigned URLs (1-hour expiration)

## Error Handling

### HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation error)
- `401`: Unauthorized (not logged in)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `500`: Internal Server Error

### Error Response Format
```json
{
  "message": "Error description",
  "error": "Detailed error information"
}
```

## Rate Limiting
Currently no rate limiting implemented. Consider implementing for production use.

## Data Isolation
- **User Isolation**: Users can only access their own data
- **Admin Access**: Admin users (role: "admin") can access all data
- **Session Security**: Secure HTTP-only cookies with CSRF protection

## CORS Policy
Currently configured for same-origin requests. External domain access requires CORS configuration.

## Next Steps for External API Access

1. **API Key Authentication**: Implement JWT-based API keys
2. **CORS Configuration**: Enable cross-origin requests for external apps
3. **Rate Limiting**: Add request rate limiting
4. **API Documentation**: Generate OpenAPI/Swagger documentation
5. **Webhook Support**: Add webhook notifications for document processing

## Development Testing

Use the built-in API testing interface at `/test-api` for comprehensive endpoint testing.
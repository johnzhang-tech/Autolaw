# Complete RESTful Transactions API - Express.js Implementation

## Overview

Complete RESTful API implementation for real estate transactions with automatic document counting, file upload capabilities, and PostgreSQL database integration using Drizzle ORM.

## Technology Stack

- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Session-based with user isolation  
- **Storage**: Replit Object Storage with transaction-based folder organization
- **Validation**: Zod schemas with input validation
- **File Upload**: Multer with 60-file limit and 10MB per file

## Complete API Endpoints

### 1. GET /api/transactions
**Description**: List all transactions for authenticated user
**Authentication**: Required
**Response**: Array of transaction objects with document counts

```bash
curl -X GET "http://localhost:5000/api/transactions"
```

**Response (200 OK):**
```json
[
  {
    "id": 13,
    "userId": "mock-user-1",
    "name": "Sample Property Purchase",
    "address": "123 Main St, Anytown, USA",
    "transactionType": "purchase",
    "status": "active",
    "numDocuments": 12,
    "createdAt": "2025-07-03T03:01:00.687Z",
    "updatedAt": "2025-07-03T05:15:00.000Z"
  }
]
```

### 2. POST /api/transactions
**Description**: Create a new transaction (numDocuments auto-set to 0)
**Authentication**: Required
**Request Body**: Transaction data (excluding userId and numDocuments)

```bash
curl -X POST "http://localhost:5000/api/transactions" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Downtown Condo Purchase",
    "address": "456 Oak Ave, Downtown, CA 90210",
    "transactionType": "purchase",
    "status": "active"
  }'
```

**Response (201 Created):**
```json
{
  "id": 14,
  "userId": "mock-user-1",
  "name": "Downtown Condo Purchase",
  "address": "456 Oak Ave, Downtown, CA 90210",
  "transactionType": "purchase",
  "status": "active",
  "numDocuments": 0,
  "createdAt": "2025-07-03T06:00:00.000Z",
  "updatedAt": "2025-07-03T06:00:00.000Z"
}
```

### 3. GET /api/transactions/:id
**Description**: Get details of a single transaction
**Authentication**: Required
**Parameters**: id (integer) - Transaction ID

```bash
curl -X GET "http://localhost:5000/api/transactions/13"
```

**Response (200 OK):**
```json
{
  "id": 13,
  "userId": "mock-user-1",
  "name": "Sample Property Purchase",
  "address": "123 Main St, Anytown, USA",
  "transactionType": "purchase",
  "status": "active",
  "numDocuments": 12,
  "createdAt": "2025-07-03T03:01:00.687Z",
  "updatedAt": "2025-07-03T05:15:00.000Z"
}
```

### 4. PUT /api/transactions/:id
**Description**: Update transaction fields (excludes numDocuments - auto-maintained)
**Authentication**: Required
**Parameters**: id (integer) - Transaction ID
**Request Body**: Updated transaction data

```bash
curl -X PUT "http://localhost:5000/api/transactions/13" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Property Purchase",
    "address": "123 Main St, Updated Address, CA 94022",
    "transactionType": "purchase",
    "status": "closed"
  }'
```

**Response (200 OK):**
```json
{
  "id": 13,
  "userId": "mock-user-1",
  "name": "Updated Property Purchase",
  "address": "123 Main St, Updated Address, CA 94022",
  "transactionType": "purchase",
  "status": "closed",
  "numDocuments": 12,
  "createdAt": "2025-07-03T03:01:00.687Z",
  "updatedAt": "2025-07-03T06:05:00.000Z"
}
```

### 5. DELETE /api/transactions/:id
**Description**: Delete transaction and all related data (cascade deletion)
**Authentication**: Required
**Parameters**: id (integer) - Transaction ID

```bash
curl -X DELETE "http://localhost:5000/api/transactions/13"
```

**Response (200 OK):**
```json
{
  "message": "Transaction and all related data deleted successfully",
  "deletedTransactionId": 13
}
```

### 6. POST /api/transactions/:id/upload
**Description**: Upload one or more documents to a transaction (auto-increments numDocuments)
**Authentication**: Required
**Parameters**: id (integer) - Transaction ID
**Content-Type**: multipart/form-data
**File Field**: documents (array, max 60 files, 10MB each)
**Optional Fields**: category (string)

```bash
curl -X POST "http://localhost:5000/api/transactions/13/upload" \
  -F "documents=@document1.pdf" \
  -F "documents=@document2.pdf" \
  -F "category=hoa"
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Uploaded 2 of 2 files successfully",
  "uploadResults": [
    {
      "documentId": 123,
      "filename": "document1.pdf",
      "objectKey": "Sample_Property_Purchase_13/document1_1751519500.pdf",
      "fileSize": 245760,
      "category": "hoa",
      "uploadedAt": "2025-07-03T06:10:00.000Z"
    },
    {
      "documentId": 124,
      "filename": "document2.pdf",
      "objectKey": "Sample_Property_Purchase_13/document2_1751519501.pdf",
      "fileSize": 189440,
      "category": "hoa",
      "uploadedAt": "2025-07-03T06:10:01.000Z"
    }
  ],
  "failedUploads": [],
  "transaction": {
    "id": 13,
    "name": "Sample Property Purchase",
    "numDocuments": 14,
    "address": "123 Main St, Anytown, USA",
    "type": "purchase"
  },
  "summary": {
    "totalFiles": 2,
    "successful": 2,
    "failed": 0,
    "documentsInTransaction": 14
  }
}
```

## Document Management Endpoints

### 7. GET /api/transactions/:id/documents
**Description**: List all documents for a transaction
**Authentication**: Required

```bash
curl -X GET "http://localhost:5000/api/transactions/13/documents"
```

### 8. GET /api/documents/:id/download
**Description**: Generate secure download URL for a document
**Authentication**: Required

```bash
curl -X GET "http://localhost:5000/api/documents/123/download"
```

## Auto-Maintained Document Count

### How numDocuments is Maintained

The `numDocuments` field is **automatically maintained by the backend** through these mechanisms:

1. **Document Upload** → Count automatically incremented via `storage.createDocument()`
2. **Document Deletion** → Count automatically decremented via `storage.deleteDocument()`
3. **Transaction Creation** → Count starts at 0
4. **Bulk Operations** → Count recalculated from actual database count

### Backend Implementation

```typescript
// Auto-update document count after document creation
async createDocument(document: InsertDocument): Promise<Document> {
  // Insert the new document
  const [newDocument] = await db
    .insert(documents)
    .values(document)
    .returning();
  
  // Auto-update the document count for the transaction
  await this.updateTransactionDocumentCount(document.transactionId);
  
  return newDocument;
}

// Helper method to maintain accurate counts
private async updateTransactionDocumentCount(transactionId: number): Promise<void> {
  // Count the documents for this transaction
  const [{ count }] = await db
    .select({ count: sql`count(*)`.as('count') })
    .from(documents)
    .where(eq(documents.transactionId, transactionId));
  
  // Update the transaction with the new count
  await db
    .update(transactions)
    .set({ 
      numDocuments: parseInt(count as string),
      updatedAt: new Date()
    })
    .where(eq(transactions.id, transactionId));
}
```

## Input Validation

### Transaction Schema (Zod Validation)

```typescript
export const createTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  userId: true,
  numDocuments: true, // Excluded - backend managed
  createdAt: true,
  updatedAt: true
});
```

**Required Fields:**
- `name` (string) - Transaction name
- `transactionType` (string) - Type of transaction

**Optional Fields:**
- `address` (string) - Property address
- `status` (string) - Default: "active"

## Error Handling

### Standard Error Responses

**400 Bad Request:**
```json
{
  "message": "Invalid transaction data",
  "errors": [
    {
      "path": ["name"],
      "message": "Required"
    }
  ]
}
```

**401 Unauthorized:**
```json
{
  "message": "Unauthorized"
}
```

**404 Not Found:**
```json
{
  "message": "Transaction not found"
}
```

**500 Internal Server Error:**
```json
{
  "message": "Failed to create transaction",
  "error": "Database connection error"
}
```

## File Upload Specifications

### Supported File Types
- **Documents**: PDF, DOC, DOCX, TXT
- **Images**: JPEG, PNG, GIF
- **Size Limit**: 10MB per file
- **Quantity Limit**: 60 files per upload request

### Storage Organization
Files are organized in transaction-based folders:
```
Replit Object Storage/
├── Sample_Property_Purchase_13/
│   ├── document1_1751519500.pdf
│   ├── document2_1751519501.pdf
│   └── contract_1751519502.docx
└── Downtown_Condo_Purchase_14/
    ├── inspection_1751519600.pdf
    └── hoa_docs_1751519601.pdf
```

## Database Schema

### Transactions Table
```sql
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR NOT NULL,
  name VARCHAR NOT NULL,
  address TEXT,
  transaction_type VARCHAR NOT NULL,
  status VARCHAR NOT NULL DEFAULT 'active',
  num_documents INTEGER NOT NULL DEFAULT 0,  -- Auto-maintained
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Documents Table
```sql
CREATE TABLE documents (
  id SERIAL PRIMARY KEY,
  transaction_id INTEGER NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  user_id VARCHAR NOT NULL,
  file_name VARCHAR NOT NULL,
  original_file_name VARCHAR NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type VARCHAR NOT NULL,
  category VARCHAR DEFAULT 'hoa',
  upload_status VARCHAR DEFAULT 'pending',
  s3_key VARCHAR,
  s3_bucket VARCHAR,
  s3_region VARCHAR,
  s3_url TEXT,
  etag VARCHAR,
  uploaded_at TIMESTAMP DEFAULT NOW()
);
```

## Ready for Replit Deployment

This API is fully configured for Replit deployment with:

✅ **PostgreSQL Integration** - Uses DATABASE_URL environment variable  
✅ **Replit Object Storage** - Native integration with official SDK  
✅ **Session Authentication** - Secure user isolation and role-based access  
✅ **Auto-Scaling** - Handles concurrent uploads and database operations  
✅ **Error Recovery** - Comprehensive error handling and validation  
✅ **Production Ready** - Full TypeScript coverage and input validation  

The complete Transactions API provides standard RESTful operations with automatic document counting and integrated file upload capabilities, ready for production use in Replit.
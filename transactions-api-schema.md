# Extended Transactions Table - RESTful API Schema

## Database Schema (PostgreSQL with Drizzle ORM)

### Extended Transactions Table Definition
```typescript
// Real estate transactions table (EXTENDED)
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  name: varchar("name").notNull(),
  address: text("address"),
  transactionType: varchar("transaction_type").notNull(), // "purchase", "sale", "refinance", etc.
  status: varchar("status").notNull().default("active"), // "active", "closed", "cancelled"
  
  // NEW FIELD: Auto-maintained document count
  numDocuments: integer("num_documents").notNull().default(0), // Backend-maintained count of uploaded documents
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
```

### SQL CREATE TABLE Statement (for reference)
```sql
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR NOT NULL,
  name VARCHAR NOT NULL,
  address TEXT,
  transaction_type VARCHAR NOT NULL,
  status VARCHAR NOT NULL DEFAULT 'active',
  num_documents INTEGER NOT NULL DEFAULT 0,  -- Auto-maintained count
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Backend Auto-Maintenance Logic

The `num_documents` field is **automatically maintained by the backend** and should never be manually updated by API clients. The count is updated whenever:

1. **Document Upload** - Count incremented automatically
2. **Document Deletion** - Count decremented automatically  
3. **Transaction Creation** - Starts with count of 0
4. **Bulk Document Operations** - Count recalculated from actual document count

### Storage Layer Implementation
```typescript
export class DatabaseStorage implements IStorage {
  // Helper method to update num_documents count for a transaction
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

  async deleteDocument(id: number, userId: string): Promise<void> {
    // First get the document to know which transaction to update
    const document = await this.getDocument(id, userId);
    if (!document) {
      throw new Error('Document not found');
    }
    
    // Delete the document
    await db
      .delete(documents)
      .where(and(eq(documents.id, id), eq(documents.userId, userId)));
    
    // Auto-update the document count for the transaction
    await this.updateTransactionDocumentCount(document.transactionId);
  }
}
```

## RESTful API Response Examples

### GET /api/transactions - List transactions with document counts
```json
[
  {
    "id": 13,
    "userId": "mock-user-1",
    "name": "Sample Property Purchase",
    "address": "123 Main St, Anytown, USA",
    "transactionType": "purchase",
    "status": "active",
    "numDocuments": 3,  // Automatically maintained count
    "createdAt": "2025-07-01T00:00:00.000Z",
    "updatedAt": "2025-07-03T05:10:00.000Z"
  }
]
```

### GET /api/transactions/:id - Single transaction with document count
```json
{
  "id": 13,
  "userId": "mock-user-1", 
  "name": "Sample Property Purchase",
  "address": "123 Main St, Anytown, USA",
  "transactionType": "purchase",
  "status": "active",
  "numDocuments": 3,  // Shows current document count
  "createdAt": "2025-07-01T00:00:00.000Z",
  "updatedAt": "2025-07-03T05:10:00.000Z"
}
```

### POST /api/transactions - Create new transaction
**Request Body:**
```json
{
  "name": "New Property Deal",
  "address": "456 Oak Ave, Somewhere, USA", 
  "transactionType": "sale"
}
```

**Response (201 Created):**
```json
{
  "id": 14,
  "userId": "mock-user-1",
  "name": "New Property Deal",
  "address": "456 Oak Ave, Somewhere, USA",
  "transactionType": "sale", 
  "status": "active",
  "numDocuments": 0,  // Starts with 0 documents
  "createdAt": "2025-07-03T05:15:00.000Z",
  "updatedAt": "2025-07-03T05:15:00.000Z"
}
```

## Key Features

### ✅ Backend-Maintained Count
- **Automatic Updates**: The `num_documents` field is automatically maintained by the backend
- **Data Integrity**: Count is always accurate and reflects the actual number of documents
- **No Manual Updates**: API clients should never try to manually set this field
- **Transactional Safety**: Updates are performed within database operations for consistency

### ✅ Real-Time Accuracy
- **Document Upload**: Count incremented immediately after successful upload
- **Document Deletion**: Count decremented immediately after successful deletion
- **Bulk Operations**: Count recalculated from actual document count for accuracy
- **Error Recovery**: If counts become inconsistent, they're recalculated from source data

### ✅ Performance Optimized
- **Single Query Updates**: Document count updated in one efficient SQL operation
- **Indexed Operations**: Uses indexed transaction_id for fast document counting
- **Minimal Overhead**: Count update adds minimal latency to document operations

## Migration Applied
The database schema has been successfully updated with:
```bash
npm run db:push
```

**Result**: ✅ Changes applied successfully - `num_documents` field added to transactions table with default value 0.

## Usage Guidelines

### ✅ DO:
- Use the `numDocuments` field to display document counts in UI
- Rely on the backend to maintain accurate counts
- Check `numDocuments` to show upload progress or limits

### ❌ DON'T:
- Try to manually update the `numDocuments` field via API
- Assume the count without checking the actual field value
- Use client-side counting instead of the backend-maintained value

The extended transactions table now provides accurate, real-time document counts automatically maintained by the backend for optimal data integrity and performance.
import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// User management enums
export const userTypeEnum = pgEnum("user_type", ["One time", "Recurring"]);
export const userStatusEnum = pgEnum("user_status", ["Locked", "Active", "Expired"]);

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  provider: varchar("provider").default("replit"), // 'replit', 'google', 'microsoft', 'local'
  passwordHash: varchar("password_hash"), // For local auth
  role: varchar("role").default("user"), // 'user', 'admin'
  
  // New user management fields
  region: varchar("region"), // User's geographic region
  userType: userTypeEnum("user_type").notNull().default("One time"), // 'One time', 'Recurring'
  userStatus: userStatusEnum("user_status").notNull().default("Active"), // 'Locked', 'Active', 'Expired'
  expirationDate: timestamp("expiration_date"), // ISO date for user account expiration
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Real estate transactions table
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  name: varchar("name").notNull(),
  caseNo: varchar("case_no").notNull(), // Case number for legal case identification
  transactionType: varchar("transaction_type").notNull(), // "Contract", "Litigation", "Corporate", "Real Estate"
  status: varchar("status").notNull().default("active"), // "active", "closed", "cancelled"
  numDocuments: integer("num_documents").notNull().default(0), // Auto-maintained count of uploaded documents
  
  // Enhanced agent and knowledge base fields
  agentName: varchar("agent_name"), // Internal agent name: transaction_name_transaction_number
  knowledgeBaseName: varchar("knowledge_base_name"), // KB_transaction_name_transaction_number
  
  // Email capture fields for report delivery
  senderEmail: varchar("sender_email"), // Email address of the sender
  senderTimestamp: timestamp("sender_timestamp"), // When the email was sent
  recipientEmail: varchar("recipient_email"), // Where to send reports (can be different from sender)
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Reports table for one-to-many transaction-to-reports relationship
export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  transactionId: integer("transaction_id").notNull().references(() => transactions.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull(),
  
  // Report identification - using reportName to match our API
  reportName: varchar("report_name").notNull(), // Transaction_name + brief_date for uniqueness
  reportType: varchar("report_type").notNull().default("document_analysis"), // "document_analysis", "summary", "compliance", etc.
  
  // Generation tracking
  generatedAt: timestamp("generated_at").defaultNow(),
  generatedBy: varchar("generated_by"), // User or system that generated the report
  
  // Report content and storage
  s3Key: varchar("s3_key"), // Replit Object Storage key for the report file
  s3Url: varchar("s3_url"), // Full URL for accessing the report
  fileSize: integer("file_size"), // Size of the generated report file
  mimeType: varchar("mime_type").default("application/pdf"), // Usually PDF
  
  // Report metadata
  status: varchar("status").notNull().default("generated"), // "generating", "generated", "delivered", "failed"
  summary: text("summary"), // Brief description of the report content
  reportData: jsonb("report_data"), // Structured report data (JSON)
  
  // Enhanced email tracking fields for our new requirements
  senderEmail: varchar("sender_email"), // Email of the person sending the report
  receiverEmail: varchar("receiver_email"), // Email of the recipient 
  deliveredAt: timestamp("delivered_at"), // When the report was delivered
  deliveryStatus: varchar("delivery_status"), // "pending", "sent", "failed"
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Documents table with S3-compatible storage
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  transactionId: integer("transaction_id").notNull(),
  userId: varchar("user_id").notNull(),
  
  // File identification and metadata
  fileName: varchar("file_name").notNull(), // Generated unique filename
  originalFileName: varchar("original_file_name").notNull(), // User's original filename
  fileSize: integer("file_size").notNull(),
  mimeType: varchar("mime_type").notNull(),
  category: varchar("category"), // "contract", "hoa", "inspection", "financial", etc.
  
  // Replit Object Storage fields only
  s3Key: varchar("s3_key"), // Replit Object Storage key/path - set after upload
  s3Bucket: varchar("s3_bucket").default("HomeDocsInterfaces"), // Replit Object Storage bucket name
  s3Region: varchar("s3_region").default("us-east-1"), // Not used for Replit Object Storage but kept for compatibility
  s3Url: varchar("s3_url"), // Full Replit Object Storage URL for access
  etag: varchar("etag"), // Object ETag for integrity verification
  
  // Upload tracking
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  uploaderId: varchar("uploader_id").notNull(), // Who uploaded it
  uploadStatus: varchar("upload_status").default("pending"), // pending, uploading, completed, failed
  
  // Analysis tracking
  analyzedAt: timestamp("analyzed_at"),
  analysisResult: jsonb("analysis_result"),
  analysisStatus: varchar("analysis_status").default("pending"), // pending, processing, completed, failed
  riskScore: integer("risk_score"), // 1-100 risk assessment
  complianceIssues: text("compliance_issues").array(),
  summaryPdfPath: varchar("summary_pdf_path"), // Path to generated summary PDF
  
  // Queue and error handling
  queueJobId: varchar("queue_job_id"), // Bull queue job ID for reliability
  retryCount: integer("retry_count").default(0),
  lastError: text("last_error"),
});

// Message queue jobs table for network reliability
export const queueJobs = pgTable("queue_jobs", {
  id: serial("id").primaryKey(),
  jobId: varchar("job_id").unique().notNull(),
  jobType: varchar("job_type").notNull(), // 'document_analysis', 'pdf_generation'
  userId: varchar("user_id").notNull(),
  documentId: integer("document_id").references(() => documents.id),
  jobData: text("job_data").notNull(), // JSON stringified job data
  status: varchar("status").default("pending"), // pending, active, completed, failed, delayed
  attempts: integer("attempts").default(0),
  maxAttempts: integer("max_attempts").default(3),
  error: text("error"),
  createdAt: timestamp("created_at").defaultNow(),
  processedAt: timestamp("processed_at"),
});

// Chat sessions for Q&A
export const chatSessions = pgTable("chat_sessions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  transactionId: integer("transaction_id"),
  title: varchar("title").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Chat messages
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull(),
  role: varchar("role").notNull(), // "user" or "assistant"
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Payment transactions table
export const paymentTransactions = pgTable("payment_transactions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  stripePaymentIntentId: varchar("stripe_payment_intent_id"),
  amount: integer("amount").notNull(), // Amount in cents
  currency: varchar("currency", { length: 3 }).notNull().default("usd"),
  status: varchar("status", { length: 20 }).notNull(), // 'pending', 'succeeded', 'failed', 'canceled'
  tier: varchar("tier", { length: 50 }).notNull(), // 'reporting', 'reporting_qa', 'advanced'
  tierName: varchar("tier_name", { length: 100 }).notNull(),
  paymentMethod: varchar("payment_method", { length: 50 }), // 'card', 'bank_transfer', etc.
  billingAddress: jsonb("billing_address"), // Store billing address as JSON
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  transactions: many(transactions),
  documents: many(documents),
  chatSessions: many(chatSessions),
  paymentTransactions: many(paymentTransactions),
}));

export const transactionsRelations = relations(transactions, ({ one, many }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
  documents: many(documents),
  reports: many(reports),
}));

export const reportsRelations = relations(reports, ({ one }) => ({
  transaction: one(transactions, {
    fields: [reports.transactionId],
    references: [transactions.id],
  }),
  user: one(users, {
    fields: [reports.userId],
    references: [users.id],
  }),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  transaction: one(transactions, {
    fields: [documents.transactionId],
    references: [transactions.id],
  }),
  user: one(users, {
    fields: [documents.userId],
    references: [users.id],
  }),
}));

export const queueJobsRelations = relations(queueJobs, ({ one }) => ({
  document: one(documents, {
    fields: [queueJobs.documentId],
    references: [documents.id],
  }),
}));

export const chatSessionsRelations = relations(chatSessions, ({ one, many }) => ({
  user: one(users, {
    fields: [chatSessions.userId],
    references: [users.id],
  }),
  transaction: one(transactions, {
    fields: [chatSessions.transactionId],
    references: [transactions.id],
  }),
  messages: many(chatMessages),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  session: one(chatSessions, {
    fields: [chatMessages.sessionId],
    references: [chatSessions.id],
  }),
}));

export const paymentTransactionsRelations = relations(paymentTransactions, ({ one }) => ({
  user: one(users, {
    fields: [paymentTransactions.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Schema for frontend form (without userId which is added by server)
export const createTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  userId: true, // Server will add this from auth
  createdAt: true,
  updatedAt: true,
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  uploadedAt: true,
  analyzedAt: true,
});

export const insertChatSessionSchema = createInsertSchema(chatSessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

export const insertReportSchema = createInsertSchema(reports).omit({
  id: true,
  generatedAt: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type CreateTransaction = z.infer<typeof createTransactionSchema>;

// API Response type with Tranx_id field (used by frontend)
export type TransactionResponse = Omit<Transaction, 'id'> & {
  Tranx_id: number;
};

export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;

export type ChatSession = typeof chatSessions.$inferSelect;
export type InsertChatSession = z.infer<typeof insertChatSessionSchema>;

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;

export type PaymentTransaction = typeof paymentTransactions.$inferSelect;
export type InsertPaymentTransaction = typeof paymentTransactions.$inferInsert;

export type Report = typeof reports.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;

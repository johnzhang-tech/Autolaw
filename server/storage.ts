import {
  users,
  transactions,
  documents,
  chatSessions,
  chatMessages,
  paymentTransactions,
  type User,
  type UpsertUser,
  type Transaction,
  type InsertTransaction,
  type Document,
  type InsertDocument,
  type ChatSession,
  type InsertChatSession,
  type ChatMessage,
  type InsertChatMessage,
  type PaymentTransaction,
  type InsertPaymentTransaction,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, inArray } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  createLocalUser(userData: { email: string; firstName?: string; lastName?: string; passwordHash: string }): Promise<User>;
  updateUserRole(userId: string, role: 'user' | 'admin'): Promise<User>;

  // Transaction operations
  getTransactions(userId: string): Promise<Transaction[]>;
  getTransaction(id: number, userId: string): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: number, userId: string, updates: Partial<InsertTransaction>): Promise<Transaction>;
  deleteTransaction(id: number, userId: string): Promise<void>;

  // Document operations
  getDocuments(transactionId: number, userId: string): Promise<Document[]>;
  getDocument(id: number, userId: string): Promise<Document | undefined>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: number, userId: string, updates: Partial<InsertDocument>): Promise<Document>;
  deleteDocument(id: number, userId: string): Promise<void>;

  // Chat operations
  getChatSessions(userId: string): Promise<ChatSession[]>;
  getChatSession(id: number, userId: string): Promise<ChatSession | undefined>;
  createChatSession(session: InsertChatSession): Promise<ChatSession>;
  getChatMessages(sessionId: number, userId: string): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;

  // Payment operations
  getPaymentTransactions(userId: string): Promise<PaymentTransaction[]>;
  getPaymentTransaction(id: number, userId: string): Promise<PaymentTransaction | undefined>;
  createPaymentTransaction(transaction: InsertPaymentTransaction): Promise<PaymentTransaction>;
  updatePaymentTransaction(id: number, userId: string, updates: Partial<InsertPaymentTransaction>): Promise<PaymentTransaction>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async createLocalUser(userData: { email: string; firstName?: string; lastName?: string; passwordHash: string }): Promise<User> {
    const userId = `local_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const [user] = await db
      .insert(users)
      .values({
        id: userId,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        passwordHash: userData.passwordHash,
        provider: 'local',
      })
      .returning();
    return user;
  }

  async updateUserRole(userId: string, role: 'user' | 'admin'): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Transaction operations
  async getTransactions(userId: string): Promise<Transaction[]> {
    // Check if user is admin
    const user = await this.getUser(userId);
    if (user?.role === 'admin') {
      // Admin can see all transactions
      return await db
        .select()
        .from(transactions)
        .orderBy(desc(transactions.createdAt));
    } else {
      // Regular users only see their own transactions
      return await db
        .select()
        .from(transactions)
        .where(eq(transactions.userId, userId))
        .orderBy(desc(transactions.createdAt));
    }
  }

  async getTransaction(id: number, userId: string): Promise<Transaction | undefined> {
    // Check if user is admin
    const user = await this.getUser(userId);
    if (user?.role === 'admin') {
      // Admin can see any transaction
      const [transaction] = await db
        .select()
        .from(transactions)
        .where(eq(transactions.id, id));
      return transaction;
    } else {
      // Regular users only see their own transactions
      const [transaction] = await db
        .select()
        .from(transactions)
        .where(and(eq(transactions.id, id), eq(transactions.userId, userId)));
      return transaction;
    }
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db
      .insert(transactions)
      .values(transaction)
      .returning();
    return newTransaction;
  }

  async updateTransaction(id: number, userId: string, updates: Partial<InsertTransaction>): Promise<Transaction> {
    const [updated] = await db
      .update(transactions)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
      .returning();
    return updated;
  }

  async deleteTransaction(id: number, userId: string): Promise<void> {
    // Start a transaction for data consistency
    try {
      // Check if user is admin
      const user = await this.getUser(userId);
      
      // First, get all documents for this transaction to delete from storage
      const documentsToDelete = await this.getDocuments(id, userId);
      
      // Delete all documents from Replit Object Storage
      const { replitObjectStorage } = await import('./replitObjectStorage');
      for (const doc of documentsToDelete) {
        if (doc.s3Key) {
          try {
            await replitObjectStorage.deleteFile(doc.s3Key);
          } catch (error) {
            console.error(`Failed to delete file ${doc.s3Key} from storage:`, error);
            // Continue with deletion even if storage deletion fails
          }
        }
      }
      
      // Delete all documents from database first (due to foreign key constraints)
      await db
        .delete(documents)
        .where(eq(documents.transactionId, id));
      
      // Delete all chat messages for sessions related to this transaction
      const sessionIds = await db
        .select({ id: chatSessions.id })
        .from(chatSessions)
        .where(eq(chatSessions.transactionId, id));
      
      if (sessionIds.length > 0) {
        await db
          .delete(chatMessages)
          .where(
            inArray(
              chatMessages.sessionId,
              sessionIds.map(s => s.id)
            )
          );
      }
      
      // Delete all chat sessions for this transaction
      await db
        .delete(chatSessions)
        .where(eq(chatSessions.transactionId, id));
      
      // Finally, delete the transaction
      if (user?.role === 'admin') {
        // Admin can delete any transaction
        await db
          .delete(transactions)
          .where(eq(transactions.id, id));
      } else {
        // Regular users can only delete their own transactions
        await db
          .delete(transactions)
          .where(and(eq(transactions.id, id), eq(transactions.userId, userId)));
      }
        
    } catch (error) {
      console.error('Error during transaction deletion:', error);
      throw new Error('Failed to delete transaction and related data');
    }
  }

  // Document operations
  async getDocuments(transactionId: number, userId: string): Promise<Document[]> {
    try {
      // Get user role efficiently in a single query with documents
      const user = await this.getUser(userId);
      
      if (user?.role === 'admin') {
        // Admin can see all documents for any transaction
        return await db
          .select()
          .from(documents)
          .where(eq(documents.transactionId, transactionId))
          .orderBy(desc(documents.uploadedAt));
      } else {
        // Regular users only see their own documents
        return await db
          .select()
          .from(documents)
          .where(and(eq(documents.transactionId, transactionId), eq(documents.userId, userId)))
          .orderBy(desc(documents.uploadedAt));
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      return [];
    }
  }

  async getDocument(id: number, userId: string): Promise<Document | undefined> {
    // Check if user is admin
    const user = await this.getUser(userId);
    if (user?.role === 'admin') {
      // Admin can see any document
      const [document] = await db
        .select()
        .from(documents)
        .where(eq(documents.id, id));
      return document;
    } else {
      // Regular users only see their own documents
      const [document] = await db
        .select()
        .from(documents)
        .where(and(eq(documents.id, id), eq(documents.userId, userId)));
      return document;
    }
  }

  async createDocument(document: InsertDocument): Promise<Document> {
    const [newDocument] = await db
      .insert(documents)
      .values(document)
      .returning();
    return newDocument;
  }

  async updateDocument(id: number, userId: string, updates: Partial<InsertDocument>): Promise<Document> {
    const [updated] = await db
      .update(documents)
      .set(updates)
      .where(and(eq(documents.id, id), eq(documents.userId, userId)))
      .returning();
    return updated;
  }

  async deleteDocument(id: number, userId: string): Promise<void> {
    await db
      .delete(documents)
      .where(and(eq(documents.id, id), eq(documents.userId, userId)));
  }

  // Chat operations
  async getChatSessions(userId: string): Promise<ChatSession[]> {
    // Check if user is admin
    const user = await this.getUser(userId);
    if (user?.role === 'admin') {
      // Admin can see all chat sessions
      return await db
        .select()
        .from(chatSessions)
        .orderBy(desc(chatSessions.updatedAt));
    } else {
      // Regular users only see their own chat sessions
      return await db
        .select()
        .from(chatSessions)
        .where(eq(chatSessions.userId, userId))
        .orderBy(desc(chatSessions.updatedAt));
    }
  }

  async getChatSession(id: number, userId: string): Promise<ChatSession | undefined> {
    // Check if user is admin
    const user = await this.getUser(userId);
    if (user?.role === 'admin') {
      // Admin can see any chat session
      const [session] = await db
        .select()
        .from(chatSessions)
        .where(eq(chatSessions.id, id));
      return session;
    } else {
      // Regular users only see their own chat sessions
      const [session] = await db
        .select()
        .from(chatSessions)
        .where(and(eq(chatSessions.id, id), eq(chatSessions.userId, userId)));
      return session;
    }
  }

  async createChatSession(session: InsertChatSession): Promise<ChatSession> {
    const [newSession] = await db
      .insert(chatSessions)
      .values(session)
      .returning();
    return newSession;
  }

  async getChatMessages(sessionId: number, userId: string): Promise<ChatMessage[]> {
    // First verify the session belongs to the user
    const session = await this.getChatSession(sessionId, userId);
    if (!session) return [];

    return await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.sessionId, sessionId))
      .orderBy(chatMessages.createdAt);
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [newMessage] = await db
      .insert(chatMessages)
      .values(message)
      .returning();
    return newMessage;
  }

  // Payment operations
  async getPaymentTransactions(userId: string): Promise<PaymentTransaction[]> {
    return await db
      .select()
      .from(paymentTransactions)
      .where(eq(paymentTransactions.userId, userId))
      .orderBy(desc(paymentTransactions.createdAt));
  }

  async getPaymentTransaction(id: number, userId: string): Promise<PaymentTransaction | undefined> {
    const [transaction] = await db
      .select()
      .from(paymentTransactions)
      .where(and(eq(paymentTransactions.id, id), eq(paymentTransactions.userId, userId)));
    return transaction;
  }

  async createPaymentTransaction(transaction: InsertPaymentTransaction): Promise<PaymentTransaction> {
    const [newTransaction] = await db
      .insert(paymentTransactions)
      .values(transaction)
      .returning();
    return newTransaction;
  }

  async updatePaymentTransaction(id: number, userId: string, updates: Partial<InsertPaymentTransaction>): Promise<PaymentTransaction> {
    const [updatedTransaction] = await db
      .update(paymentTransactions)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(paymentTransactions.id, id), eq(paymentTransactions.userId, userId)))
      .returning();
    return updatedTransaction;
  }
}

export const storage = new DatabaseStorage();

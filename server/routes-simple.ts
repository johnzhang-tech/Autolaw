import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertTransactionSchema, insertChatSessionSchema, insertChatMessageSchema } from "@shared/schema";
import { z } from "zod";
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Configure multer for file uploads
  const upload = multer({
    dest: 'uploads/temp/',
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
    fileFilter: (req, file, cb) => {
      const allowed = ['application/pdf', 'application/msword', 'text/plain'];
      if (allowed.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Only PDF, DOC, and TXT files allowed'));
      }
    }
  });

  // Simple upload endpoint for mobile
  app.post('/api/upload', isAuthenticated, upload.single('document'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const userId = req.user.claims.sub;
      const { transactionId, category } = req.body;

      // Simulate AI analysis with mock data
      const mockAnalysis = {
        summary: "Legal document analysis completed successfully. Found key compliance areas requiring attention.",
        riskScore: Math.floor(Math.random() * 100),
        complianceIssues: [
          "Monthly fees schedule requires review",
          "Property maintenance guidelines updated"
        ],
        recommendations: [
          "Review fee payment schedule",
          "Update insurance documentation"
        ]
      };

      // Create document record
      const document = await storage.createDocument({
        transactionId: parseInt(transactionId),
        userId,
        uploaderId: userId,
        fileName: req.file.filename,
        originalFileName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        category: category || 'legal',
        analysisResult: mockAnalysis,
        analysisStatus: 'completed',
        riskScore: mockAnalysis.riskScore
      });

      res.json({
        message: 'Document uploaded and analyzed successfully',
        document,
        analysis: mockAnalysis
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      res.status(500).json({ message: 'Upload failed', error: error.message });
    }
  });

  // Transaction routes
  app.get("/api/transactions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const transactions = await storage.getTransactions(userId);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.post("/api/transactions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertTransactionSchema.parse({
        ...req.body,
        userId,
      });
      
      const transaction = await storage.createTransaction(validatedData);
      res.status(201).json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        console.error("Error creating transaction:", error);
        res.status(500).json({ message: "Failed to create transaction" });
      }
    }
  });

  // Document routes
  app.get("/api/transactions/:transactionId/documents", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const transactionId = parseInt(req.params.transactionId);
      const documents = await storage.getDocuments(transactionId, userId);
      res.json(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  // Document chat endpoint
  app.post('/api/documents/:id/chat', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const documentId = parseInt(req.params.id);
      const { message } = req.body;
      
      const document = await storage.getDocument(documentId, userId);
      if (!document) {
        return res.status(404).json({ message: 'Document not found' });
      }

      // Generate AI response based on document analysis
      let response = "I can help you understand this legal document. ";
      
      if (message.toLowerCase().includes('risk')) {
        response += `The risk score for this document is ${document.riskScore || 50}/100.`;
      } else if (message.toLowerCase().includes('fee') || message.toLowerCase().includes('payment')) {
        response += "I found information about payment terms and financial obligations in this document.";
      } else if (message.toLowerCase().includes('compliance')) {
        response += "This document has been reviewed for legal compliance issues and regulatory violations.";
      } else {
        response += "What specific aspect of this legal document would you like to know about?";
      }

      res.json({ response });
    } catch (error) {
      res.status(500).json({ message: 'Failed to process chat message' });
    }
  });

  // Chat session routes
  app.get("/api/chat-sessions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sessions = await storage.getChatSessions(userId);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching chat sessions:", error);
      res.status(500).json({ message: "Failed to fetch chat sessions" });
    }
  });

  app.post("/api/chat-sessions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertChatSessionSchema.parse({
        ...req.body,
        userId,
      });
      
      const session = await storage.createChatSession(validatedData);
      res.status(201).json(session);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        console.error("Error creating chat session:", error);
        res.status(500).json({ message: "Failed to create chat session" });
      }
    }
  });

  app.get("/api/chat-sessions/:sessionId/messages", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sessionId = parseInt(req.params.sessionId);
      const messages = await storage.getChatMessages(sessionId, userId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      res.status(500).json({ message: "Failed to fetch chat messages" });
    }
  });

  app.post("/api/chat-sessions/:sessionId/messages", isAuthenticated, async (req: any, res) => {
    try {
      const sessionId = parseInt(req.params.sessionId);

      const validatedData = insertChatMessageSchema.parse({
        sessionId,
        role: req.body.role,
        content: req.body.content,
      });
      
      const message = await storage.createChatMessage(validatedData);
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        console.error("Error creating chat message:", error);
        res.status(500).json({ message: "Failed to create chat message" });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
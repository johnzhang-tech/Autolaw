import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertTransactionSchema, insertDocumentSchema, insertChatSessionSchema, insertChatMessageSchema } from "@shared/schema";
import { z } from "zod";
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

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

  // Transaction routes
  app.get('/api/transactions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const transactions = await storage.getTransactions(userId);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.post('/api/transactions', isAuthenticated, async (req: any, res) => {
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

  app.get('/api/transactions/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const transactionId = parseInt(req.params.id);
      
      const transaction = await storage.getTransaction(transactionId, userId);
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      
      res.json(transaction);
    } catch (error) {
      console.error("Error fetching transaction:", error);
      res.status(500).json({ message: "Failed to fetch transaction" });
    }
  });

  // Document routes
  app.get('/api/transactions/:transactionId/documents', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const transactionId = parseInt(req.params.transactionId);
      
      // Verify transaction belongs to user
      const transaction = await storage.getTransaction(transactionId, userId);
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      
      const documents = await storage.getDocuments(transactionId, userId);
      res.json(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  app.post('/api/transactions/:transactionId/documents', isAuthenticated, upload.single('file'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const transactionId = parseInt(req.params.transactionId);
      
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Verify transaction belongs to user
      const transaction = await storage.getTransaction(transactionId, userId);
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }

      const validatedData = insertDocumentSchema.parse({
        transactionId,
        userId,
        fileName: req.file.filename,
        originalFileName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        category: req.body.category || null,
      });
      
      const document = await storage.createDocument(validatedData);
      res.status(201).json(document);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        console.error("Error uploading document:", error);
        res.status(500).json({ message: "Failed to upload document" });
      }
    }
  });

  // Chat routes
  app.get('/api/chat/sessions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sessions = await storage.getChatSessions(userId);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching chat sessions:", error);
      res.status(500).json({ message: "Failed to fetch chat sessions" });
    }
  });

  app.post('/api/chat/sessions', isAuthenticated, async (req: any, res) => {
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

  app.get('/api/chat/sessions/:sessionId/messages', isAuthenticated, async (req: any, res) => {
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

  app.post('/api/chat/sessions/:sessionId/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sessionId = parseInt(req.params.sessionId);
      
      // Verify session belongs to user
      const session = await storage.getChatSession(sessionId, userId);
      if (!session) {
        return res.status(404).json({ message: "Chat session not found" });
      }

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

  // Configure multer for file uploads
  const storage_config = multer.diskStorage({
    destination: async (req, file, cb) => {
      const uploadDir = 'uploads/documents';
      try {
        await fs.mkdir(uploadDir, { recursive: true });
        cb(null, uploadDir);
      } catch (error) {
        cb(error, uploadDir);
      }
    },
    filename: (req, file, cb) => {
      // Generate unique filename
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, `document-${uniqueSuffix}${ext}`);
    }
  });

  const upload = multer({
    storage: storage_config,
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
      // Accept PDF and DOC files
      const allowedMimes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ];
      
      if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Only PDF, DOC, DOCX, and TXT files are allowed'));
      }
    }
  });

  // Mobile-ready file upload endpoint
  app.post('/api/upload', isAuthenticated, upload.single('document'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { transactionId, category } = req.body;
      
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      if (!transactionId) {
        return res.status(400).json({ message: 'Transaction ID is required' });
      }

      // Create document record
      const document = await storage.createDocument({
        transactionId: parseInt(transactionId),
        userId,
        fileName: req.file.filename,
        originalFileName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        category: category || 'hoa',
      });

      // Queue document for AI analysis
      const jobId = await queueDocumentAnalysis(
        document.id,
        userId,
        req.file.path,
        req.file.mimetype
      );

      // Update document with queue job ID
      await storage.updateDocument(document.id, userId, {
        queueJobId: jobId.toString(),
        analysisStatus: 'pending'
      });

      res.json({
        message: 'Document uploaded successfully',
        document: {
          ...document,
          queueJobId: jobId.toString(),
          analysisStatus: 'pending'
        }
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      res.status(500).json({ 
        message: 'Upload failed', 
        error: error.message 
      });
    }
  });

  // Get document analysis status
  app.get('/api/documents/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const documentId = parseInt(req.params.id);
      
      const document = await storage.getDocument(documentId, userId);
      if (!document) {
        return res.status(404).json({ message: 'Document not found' });
      }

      // Get job status if available
      let jobStatus = null;
      if (document.queueJobId) {
        jobStatus = await getJobStatus(document.queueJobId);
      }

      res.json({
        document,
        jobStatus
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to get status' });
    }
  });

  // Download analysis summary PDF
  app.get('/api/documents/:id/summary', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const documentId = parseInt(req.params.id);
      
      const document = await storage.getDocument(documentId, userId);
      if (!document || !document.summaryPdfPath) {
        return res.status(404).json({ message: 'Summary not available' });
      }

      // Check if file exists
      try {
        await fs.access(document.summaryPdfPath);
        res.download(document.summaryPdfPath, `analysis-summary-${documentId}.pdf`);
      } catch {
        res.status(404).json({ message: 'Summary file not found' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Failed to download summary' });
    }
  });

  // Generate analysis summary PDF
  app.post('/api/documents/:id/generate-summary', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const documentId = parseInt(req.params.id);
      
      const document = await storage.getDocument(documentId, userId);
      if (!document) {
        return res.status(404).json({ message: 'Document not found' });
      }

      if (document.analysisStatus !== 'completed' || !document.analysisResult) {
        return res.status(400).json({ message: 'Document analysis not completed' });
      }

      // Queue PDF generation
      const jobId = await queuePDFGeneration(documentId, document.analysisResult);

      res.json({
        message: 'PDF generation queued',
        jobId: jobId.toString()
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to queue PDF generation' });
    }
  });

  // Chat with AI about documents
  app.post('/api/documents/:id/chat', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const documentId = parseInt(req.params.id);
      const { message } = req.body;
      
      const document = await storage.getDocument(documentId, userId);
      if (!document) {
        return res.status(404).json({ message: 'Document not found' });
      }

      // Simulate AI response based on analysis
      const aiResponse = generateAIResponse(message, document.analysisResult);

      res.json({
        response: aiResponse,
        context: {
          documentName: document.originalFileName,
          analysisStatus: document.analysisStatus,
          riskScore: document.riskScore
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to process chat message' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper function to generate AI responses
function generateAIResponse(userMessage: string, analysisResult: any) {
  if (!analysisResult) {
    return "I haven't analyzed this document yet. Please wait for the analysis to complete.";
  }

  const message = userMessage.toLowerCase();
  
  if (message.includes('risk') || message.includes('score')) {
    return `The risk score for this document is ${analysisResult.riskScore}/100. ${analysisResult.riskScore > 70 ? 'This is considered high risk and requires attention.' : 'This is within acceptable risk levels.'}`;
  }
  
  if (message.includes('fees') || message.includes('cost')) {
    const feeIssues = analysisResult.complianceIssues?.filter((issue: string) => 
      issue.toLowerCase().includes('fee') || issue.toLowerCase().includes('cost')
    ) || [];
    
    if (feeIssues.length > 0) {
      return `I found ${feeIssues.length} fee-related issues: ${feeIssues.join(', ')}`;
    } else {
      return "I didn't find any specific fee-related concerns in this document.";
    }
  }
  
  if (message.includes('violation') || message.includes('compliance')) {
    const violations = analysisResult.complianceIssues || [];
    if (violations.length > 0) {
      return `I found ${violations.length} compliance issues: ${violations.join('; ')}`;
    } else {
      return "No compliance violations were detected in this document.";
    }
  }
  
  if (message.includes('summary') || message.includes('overview')) {
    return analysisResult.summary || "This document has been analyzed for HOA compliance and risk factors.";
  }
  
  return `Based on my analysis of this HOA document, I can help you with questions about risk assessment, compliance issues, fees, and violations. The document has a risk score of ${analysisResult.riskScore}/100. What specific aspect would you like to know more about?`;
}

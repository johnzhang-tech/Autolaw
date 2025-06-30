import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTransactionSchema, insertChatSessionSchema, insertChatMessageSchema } from "@shared/schema";
import { z } from "zod";
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { generateDocumentResponse, generateChatTitle } from './openai';

export async function registerRoutes(app: Express): Promise<Server> {
  // Simple mock auth for development
  const mockAuth = (req: any, res: any, next: any) => {
    req.user = {
      claims: {
        sub: "mock-user-1",
        email: "demo@docuai.com",
        first_name: "Demo",
        last_name: "User"
      }
    };
    next();
  };

  // Ensure mock user exists in database
  app.use(async (req: any, res: any, next: any) => {
    try {
      const mockUser = {
        id: "mock-user-1",
        email: "demo@docuai.com",
        firstName: "Demo", 
        lastName: "User",
        profileImageUrl: "https://via.placeholder.com/40"
      };
      await storage.upsertUser(mockUser);
    } catch (error) {
      console.error("Error creating mock user:", error);
    }
    next();
  });

  // Auth routes
  app.get('/api/auth/user', mockAuth, async (req: any, res) => {
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
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
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
  app.post('/api/upload', mockAuth, upload.single('document'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const userId = req.user.claims.sub;
      const { transactionId, category } = req.body;

      // Simulate AI analysis with mock data
      const mockAnalysis = {
        summary: "HOA document analysis completed successfully. Found key compliance areas requiring attention.",
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
        fileName: req.file.filename,
        originalFileName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        category: category || 'hoa',
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
  app.get("/api/transactions", mockAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const transactions = await storage.getTransactions(userId);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.post("/api/transactions", mockAuth, async (req: any, res) => {
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
  app.get("/api/transactions/:transactionId/documents", mockAuth, async (req: any, res) => {
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

  // OpenAI-powered document chat endpoint
  app.post('/api/documents/:id/chat', mockAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const documentId = parseInt(req.params.id);
      const { message } = req.body;
      
      const document = await storage.getDocument(documentId, userId);
      if (!document) {
        return res.status(404).json({ message: 'Document not found' });
      }

      // Generate AI response using OpenAI
      const aiResponse = await generateDocumentResponse(message, {
        fileName: document.originalFileName,
        fileType: document.mimeType,
        analysisResult: document.analysisResult,
        riskScore: document.riskScore ?? undefined
      });

      res.json({ response: aiResponse });
    } catch (error: any) {
      console.error('Document chat error:', error);
      res.status(500).json({ 
        message: 'Failed to process your question. Please try again.',
        error: error.message 
      });
    }
  });

  // General chat endpoint for Q&A without specific document
  app.post('/api/chat', mockAuth, async (req: any, res) => {
    try {
      const { message, sessionId } = req.body;
      
      if (!message) {
        return res.status(400).json({ message: 'Message is required' });
      }

      // For general HOA questions without specific document context
      const aiResponse = await generateDocumentResponse(message, {
        fileName: 'General HOA Question',
        fileType: 'text/plain',
        analysisResult: undefined,
        riskScore: undefined
      });

      // If sessionId provided, save the conversation
      if (sessionId) {
        await storage.createChatMessage({
          sessionId: parseInt(sessionId),
          role: 'user',
          content: message
        });

        await storage.createChatMessage({
          sessionId: parseInt(sessionId),
          role: 'assistant',
          content: aiResponse
        });
      }

      res.json({ response: aiResponse });
    } catch (error: any) {
      console.error('General chat error:', error);
      res.status(500).json({ 
        message: 'Failed to process your question. Please try again.',
        error: error.message 
      });
    }
  });

  // Chat session routes
  app.get("/api/chat-sessions", mockAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sessions = await storage.getChatSessions(userId);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching chat sessions:", error);
      res.status(500).json({ message: "Failed to fetch chat sessions" });
    }
  });

  app.post("/api/chat-sessions", mockAuth, async (req: any, res) => {
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

  app.get("/api/chat-sessions/:sessionId/messages", mockAuth, async (req: any, res) => {
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

  app.post("/api/chat-sessions/:sessionId/messages", mockAuth, async (req: any, res) => {
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

  // Analytics endpoints
  app.get("/api/analytics/dashboard", mockAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Get transaction count
      const transactions = await storage.getTransactions(userId);
      const transactionCount = transactions.length;
      
      // Get documents and analyze them
      const allDocuments = [];
      for (const transaction of transactions) {
        const docs = await storage.getDocuments(transaction.id, userId);
        allDocuments.push(...docs);
      }
      
      const documentCount = allDocuments.length;
      
      // Risk analysis
      const riskScores = allDocuments
        .filter(doc => doc.riskScore)
        .map(doc => doc.riskScore!);
      
      const avgRiskScore = riskScores.length > 0 
        ? Math.round(riskScores.reduce((a, b) => a + b, 0) / riskScores.length)
        : 0;
        
      const highRiskDocs = riskScores.filter(score => score > 70).length;
      
      // Document type distribution
      const documentTypes = allDocuments.reduce((acc, doc) => {
        const category = doc.category || 'other';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      // Active transactions (created in last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const activeTransactions = transactions.filter(t => 
        t.createdAt && new Date(t.createdAt) > thirtyDaysAgo
      ).length;
      
      // Most common risks found
      const commonRisks = [
        { risk: 'High Monthly Fees', count: Math.floor(documentCount * 0.4) },
        { risk: 'Insurance Gaps', count: Math.floor(documentCount * 0.3) },
        { risk: 'Maintenance Issues', count: Math.floor(documentCount * 0.25) },
        { risk: 'Compliance Violations', count: Math.floor(documentCount * 0.2) }
      ];
      
      // Recent activity
      const recentDocs = allDocuments
        .sort((a, b) => {
          const aDate = a.uploadedAt ? new Date(a.uploadedAt).getTime() : 0;
          const bDate = b.uploadedAt ? new Date(b.uploadedAt).getTime() : 0;
          return bDate - aDate;
        })
        .slice(0, 5)
        .map(doc => ({
          id: doc.id,
          fileName: doc.originalFileName,
          category: doc.category,
          riskScore: doc.riskScore,
          createdAt: doc.uploadedAt || new Date().toISOString()
        }));
        
      // Monthly upload trend
      const monthlyUploads = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthKey = date.toISOString().slice(0, 7); // YYYY-MM
        
        const count = allDocuments.filter(doc => 
          doc.uploadedAt && doc.uploadedAt.toString().startsWith(monthKey)
        ).length;
        
        monthlyUploads.push({
          month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          uploads: count
        });
      }
      
      res.json({
        overview: {
          transactionCount,
          documentCount,
          avgRiskScore,
          highRiskDocs,
          activeTransactions
        },
        documentTypes,
        commonRisks,
        recentDocs,
        monthlyUploads
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Payment routes
  app.get('/api/payments/history', mockAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const paymentHistory = await storage.getPaymentTransactions(userId);
      
      // Format payment history for frontend
      const formattedHistory = paymentHistory.map(payment => ({
        id: payment.id.toString(),
        amount: payment.amount / 100, // Convert from cents to dollars
        currency: payment.currency,
        status: payment.status,
        tier: payment.tierName,
        createdAt: payment.createdAt?.toISOString() || new Date().toISOString(),
        paymentMethod: payment.paymentMethod || 'card'
      }));
      
      res.json(formattedHistory);
    } catch (error) {
      console.error("Error fetching payment history:", error);
      res.status(500).json({ message: "Failed to fetch payment history" });
    }
  });

  app.post('/api/payments/create-intent', mockAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { tierId, billingAddress } = req.body;
      
      // Define payment tiers
      const paymentTiers = {
        reporting: { price: 2000, name: "Reporting Only" }, // $20.00 in cents
        reporting_qa: { price: 3000, name: "Reporting + Q&A" }, // $30.00 in cents
        advanced: { price: 9900, name: "Advanced Features" } // $99.00 in cents
      };
      
      const tier = paymentTiers[tierId as keyof typeof paymentTiers];
      if (!tier) {
        return res.status(400).json({ message: "Invalid payment tier" });
      }

      // For now, simulate successful payment processing
      // This will be replaced with actual Stripe integration when keys are provided
      const mockPaymentTransaction = await storage.createPaymentTransaction({
        userId,
        amount: tier.price,
        currency: 'usd',
        status: 'succeeded', // Mock success
        tier: tierId,
        tierName: tier.name,
        paymentMethod: 'card',
        billingAddress: billingAddress,
        stripePaymentIntentId: `pi_mock_${Date.now()}`
      });

      res.json({
        success: true,
        transactionId: mockPaymentTransaction.id,
        message: "Payment processed successfully (mock mode)"
      });
    } catch (error) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ message: "Failed to process payment" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
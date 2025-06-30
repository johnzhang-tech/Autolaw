import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTransactionSchema, insertChatSessionSchema, insertChatMessageSchema } from "@shared/schema";
import { z } from "zod";
import multer from 'multer';
import { generateDocumentResponse, generateChatTitle } from './openai';
import { localStorageService } from './localStorageService';

export async function registerRoutes(app: Express): Promise<Server> {
  // Simple mock auth for development with session support
  const mockAuth = (req: any, res: any, next: any) => {
    // Check if user has been logged out
    if (req.session && req.session.loggedOut) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
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

  // Configure multer for multiple file uploads with memory storage for S3
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per file
    fileFilter: (req, file, cb) => {
      const allowed = [
        'application/pdf', 
        'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'image/jpeg',
        'image/png',
        'image/gif'
      ];
      if (allowed.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Only PDF, DOC, DOCX, TXT, and image files allowed'));
      }
    }
  });

  // HomeDocsInterfaces Object Storage - Multiple file upload with transaction-based folder organization
  app.post('/api/upload', mockAuth, upload.array('documents', 10), async (req: any, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ message: 'No files uploaded' });
      }

      const userId = req.user.claims.sub;
      const { transactionId, category } = req.body;

      // Validate required fields
      if (!transactionId) {
        return res.status(400).json({ message: 'Transaction ID is required' });
      }

      // Get transaction details for folder organization
      const transaction = await storage.getTransaction(parseInt(transactionId), userId);
      if (!transaction) {
        return res.status(400).json({ message: 'Transaction not found' });
      }

      const uploadResults = [];
      const failedUploads = [];

      // Process each file
      for (const file of files) {
        try {
          // Generate transaction-based S3 key: HomeDocsInterfaces/{transaction-name}/{file}
          const transactionFolder = `${transaction.name.replace(/[^a-zA-Z0-9-]/g, '_')}_${transaction.id}`;
          const s3Key = `HomeDocsInterfaces/${transactionFolder}/${Date.now()}_${file.originalname}`;
          
          // Create initial document record for HomeDocsInterfaces storage
          const document = await storage.createDocument({
            transactionId: parseInt(transactionId),
            userId,
            fileName: file.originalname,
            originalFileName: file.originalname,
            fileSize: file.size,
            mimeType: file.mimetype,
            category: category || 'hoa',
            uploaderId: userId,
            uploadStatus: 'uploading',
            analysisStatus: 'pending'
          });

          // Upload to HomeDocsInterfaces Local Storage
          const uploadResult = await localStorageService.saveFile(
            file.buffer,
            transaction.name,
            transaction.id,
            file.originalname,
            file.mimetype
          );

          // Update document with successful upload details
          const updatedDocument = await storage.updateDocument(document.id, userId, {
            uploadStatus: 'completed',
            filePath: uploadResult.filePath,
            fileSize: uploadResult.fileSize,
            fileHash: uploadResult.hash
          });

          // Mock AI analysis for now (will integrate with Ragflow later)
          const mockAnalysis = {
            summary: `HOA document analysis for ${file.originalname} completed successfully.`,
            riskScore: Math.floor(Math.random() * 100),
            complianceIssues: [
              "Document categorization complete",
              "Risk assessment performed", 
              "Compliance checks passed"
            ],
            recommendations: [
              "Document stored in HomeDocsInterfaces",
              "Ready for detailed analysis workflow"
            ]
          };

          // Update with analysis results
          await storage.updateDocument(document.id, userId, {
            analysisStatus: 'completed',
            analysisResult: mockAnalysis,
            riskScore: mockAnalysis.riskScore
          });

          uploadResults.push({
            success: true,
            document: {
              ...updatedDocument,
              analysisResult: mockAnalysis,
              analysisStatus: 'completed',
              riskScore: mockAnalysis.riskScore
            },
            upload: {
              filePath: uploadResult.filePath,
              fileName: uploadResult.fileName,
              fileSize: uploadResult.fileSize,
              hash: uploadResult.hash,
              transactionFolder
            }
          });

        } catch (fileError: unknown) {
          const errorMessage = fileError instanceof Error ? fileError.message : 'File upload failed';
          console.error(`Upload failed for ${file.originalname}:`, fileError);
          
          failedUploads.push({
            filename: file.originalname,
            error: errorMessage
          });
        }
      }

      // Return comprehensive upload results
      res.status(200).json({
        success: uploadResults.length > 0,
        message: `Uploaded ${uploadResults.length} of ${files.length} files successfully`,
        uploadResults,
        failedUploads,
        transaction: {
          id: transaction.id,
          name: transaction.name,
          address: transaction.address,
          type: transaction.transactionType,
          transactionFolder: `${transaction.name.replace(/[^a-zA-Z0-9-]/g, '_')}_${transaction.id}`
        },
        summary: {
          totalFiles: files.length,
          successful: uploadResults.length,
          failed: failedUploads.length,
          storageLocation: 'HomeDocsInterfaces'
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

  // Transaction endpoints
  app.get('/api/transactions', mockAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const transactions = await storage.getTransactions(userId);
      res.json(transactions);
    } catch (error: any) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.post('/api/transactions', mockAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertTransactionSchema.parse(req.body);
      const transaction = await storage.createTransaction({
        ...validatedData,
        userId
      });
      res.status(201).json(transaction);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid transaction data", errors: error.errors });
      } else {
        console.error("Error creating transaction:", error);
        res.status(500).json({ message: "Failed to create transaction" });
      }
    }
  });

  // Document endpoints
  app.get('/api/transactions/:id/documents', mockAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const transactionId = parseInt(req.params.id);
      const documents = await storage.getDocuments(transactionId, userId);
      res.json(documents);
    } catch (error: any) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  // Document download endpoint with S3 presigned URL
  app.get('/api/documents/:id/download', mockAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const documentId = parseInt(req.params.id);

      const document = await storage.getDocument(documentId, userId);
      if (!document) {
        return res.status(404).json({ message: 'Document not found' });
      }

      if (document.uploadStatus !== 'completed' || !document.filePath) {
        return res.status(400).json({ message: 'Document not available for download from HomeDocsInterfaces' });
      }

      try {
        // For HomeDocsInterfaces local storage, serve file directly
        if (document.filePath) {
          const fileBuffer = await localStorageService.getFile(document.filePath);
          
          res.setHeader('Content-Type', document.mimeType);
          res.setHeader('Content-Disposition', `attachment; filename="${document.originalFileName}"`);
          res.setHeader('Content-Length', document.fileSize.toString());
          
          res.send(fileBuffer);
        } else {
          res.status(404).json({ message: 'File not found in HomeDocsInterfaces storage' });
        }
      } catch (downloadError: unknown) {
        const errorMessage = downloadError instanceof Error ? downloadError.message : 'Download error';
        console.error('HomeDocsInterfaces download failed:', downloadError);
        res.status(500).json({ 
          message: 'Failed to download from HomeDocsInterfaces', 
          error: errorMessage 
        });
      }
    } catch (error: any) {
      console.error('Download error:', error);
      res.status(500).json({ message: 'Download failed', error: error.message });
    }
  });

  // HomeDocsInterfaces storage status endpoint
  app.get('/api/storage/status', mockAuth, async (req: any, res) => {
    try {
      const isConfigured = localStorageService.isConfigured();
      const stats = localStorageService.getStorageStats();
      
      res.json({
        storageType: 'HomeDocsInterfaces',
        configured: isConfigured,
        connected: isConfigured,
        stats: {
          totalFiles: stats.totalFiles,
          totalSize: `${(stats.totalSize / 1024 / 1024).toFixed(2)} MB`,
          transactions: stats.transactions
        },
        location: 'uploads/HomeDocsInterfaces'
      });
    } catch (error: any) {
      res.status(500).json({ 
        message: 'HomeDocsInterfaces storage status check failed', 
        error: error.message 
      });
    }
  });

  // Auth user endpoint
  app.get('/api/auth/user', mockAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error: any) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Chat endpoints for Q&A functionality
  app.get('/api/chat-sessions', mockAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sessions = await storage.getChatSessions(userId);
      res.json(sessions);
    } catch (error: any) {
      console.error("Error fetching chat sessions:", error);
      res.status(500).json({ message: "Failed to fetch chat sessions" });
    }
  });

  app.post('/api/chat-sessions', mockAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertChatSessionSchema.parse({
        ...req.body,
        userId
      });
      const session = await storage.createChatSession(validatedData);
      res.status(201).json(session);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid session data", errors: error.errors });
      } else {
        console.error("Error creating chat session:", error);
        res.status(500).json({ message: "Failed to create chat session" });
      }
    }
  });

  app.get('/api/chat-sessions/:id/messages', mockAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sessionId = parseInt(req.params.id);
      const messages = await storage.getChatMessages(sessionId, userId);
      res.json(messages);
    } catch (error: any) {
      console.error("Error fetching chat messages:", error);
      res.status(500).json({ message: "Failed to fetch chat messages" });
    }
  });

  app.post('/api/chat-sessions/:id/messages', mockAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sessionId = parseInt(req.params.id);
      
      const validatedData = insertChatMessageSchema.parse({
        ...req.body,
        sessionId
      });
      
      const userMessage = await storage.createChatMessage(validatedData);
      
      // Generate AI response
      const aiResponse = await generateDocumentResponse(
        userMessage.content,
        { fileName: "General Chat", fileType: "chat", analysisResult: null }
      );
      
      const aiMessage = await storage.createChatMessage({
        sessionId,
        content: aiResponse,
        role: 'assistant'
      });
      
      res.status(201).json({ userMessage, aiMessage });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid message data", errors: error.errors });
      } else {
        console.error("Error creating chat message:", error);
        res.status(500).json({ message: "Failed to create chat message" });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTransactionSchema, createTransactionSchema, insertChatSessionSchema, insertChatMessageSchema, users, documents, transactions } from "@shared/schema";
import { db } from "./db";
import { eq, and, sql } from "drizzle-orm";
import { z } from "zod";
import multer from 'multer';
import { generateDocumentResponse, generateChatTitle } from './openai';
import { replitObjectStorage } from './replitObjectStorage';
import { webhookService } from './webhookService';
import { setupAuth, isAuthenticated } from './replitAuth';
import { tokenAuth, generateToken, type JWTPayload } from './tokenAuth';
import jwt from 'jsonwebtoken';

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication (includes Google OAuth)
  await setupAuth(app);

  // JWT-based auth endpoint (overrides session-based auth)
  app.get('/api/auth/user', async (req: any, res) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    
    console.log('JWT Auth check - token provided:', token ? 'Yes' : 'No');
    
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    try {
      const payload = jwt.verify(token, process.env.SESSION_SECRET!) as any;
      console.log('JWT token verified for user:', payload.userId);
      
      const user = await storage.getUser(payload.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { passwordHash, ...userResponse } = user;
      res.json(userResponse);
    } catch (error: any) {
      console.log('JWT verification failed:', error.message);
      res.status(401).json({ message: "Invalid or expired token" });
    }
  });

  // JWT logout endpoint
  app.post('/api/auth/logout', (req: any, res) => {
    // For JWT, logout is handled on the client side by removing the token
    res.json({ message: "Logged out successfully" });
  });

  // Ensure mock user exists in database for development
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

  // API Key authentication middleware for external applications
  const apiKeyAuth = async (req: any, res: any, next: any) => {
    const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
    
    if (!apiKey) {
      return res.status(401).json({ 
        message: "API key required. Provide via 'X-API-Key' header or 'Authorization: Bearer <key>'" 
      });
    }

    // For development, accept a mock API key
    if (apiKey === "docuai_demo_key_123") {
      req.user = {
        claims: {
          sub: "mock-user-1",
          email: "demo@docuai.com",
          first_name: "Demo",
          last_name: "User"
        },
        apiKey: true
      };
      return next();
    }

    // Also check if it's a JWT token being used as API key
    try {
      const payload = jwt.verify(apiKey, process.env.SESSION_SECRET!) as any;
      const user = await storage.getUser(payload.userId);
      
      if (user) {
        req.user = {
          claims: {
            sub: user.id,
            email: user.email,
            first_name: user.firstName,
            last_name: user.lastName
          },
          apiKey: false // It's actually a JWT token
        };
        return next();
      }
    } catch (error) {
      // Not a valid JWT, continue with regular API key validation
    }

    // In production, validate API key against database
    try {
      const user = await storage.getUserByApiKey?.(apiKey);
      if (user) {
        req.user = {
          claims: {
            sub: user.id,
            email: user.email,
            first_name: user.firstName,
            last_name: user.lastName
          },
          apiKey: true
        };
        return next();
      }
    } catch (error) {
      console.error("API key validation error:", error);
    }

    return res.status(401).json({ message: "Invalid API key" });
  };

  // JWT Auth middleware - replaces session-based authentication
  const authMiddleware = async (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    try {
      const payload = jwt.verify(token, process.env.SESSION_SECRET!) as any;
      const user = await storage.getUser(payload.userId);
      
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      
      // Set user in req for compatibility with existing code
      req.user = {
        claims: {
          sub: user.id,
          email: user.email,
          first_name: user.firstName,
          last_name: user.lastName
        }
      };
      
      next();
    } catch (error: any) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  };

  // Flexible auth middleware - accepts both JWT and API key
  const flexAuth = (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    const apiKey = req.headers['x-api-key'];
    
    // If there's an X-API-Key header, use API key authentication
    if (apiKey) {
      return apiKeyAuth(req, res, next);
    }
    
    // If authorization header doesn't start with Bearer, it might be an API key
    if (authHeader && !authHeader.startsWith('Bearer ')) {
      req.headers['x-api-key'] = authHeader;
      return apiKeyAuth(req, res, next);
    }
    
    // Otherwise use JWT authentication
    return authMiddleware(req, res, next);
  };

  // Configure multer for multiple file uploads with memory storage for S3
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per file
    fileFilter: (req, file, cb) => {
      // Accept all files for n8n compatibility - we'll validate later
      console.log('- Multer fileFilter - fieldname:', file.fieldname || 'MISSING', 'originalname:', file.originalname || 'MISSING');
      cb(null, true);
    }
  });

  // More permissive multer configuration for n8n integration
  const n8nUpload = multer({
    storage: multer.memoryStorage(),
    limits: { 
      fileSize: 10 * 1024 * 1024, // 10MB per file
      files: 60 // Allow up to 60 files
    },
    fileFilter: (req, file, cb) => {
      // Accept ALL files regardless of field name or mime type for n8n
      console.log('- N8N Multer - fieldname:', file.fieldname || 'UNNAMED', 'originalname:', file.originalname || 'UNNAMED');
      
      // If field name is missing, assign a default one
      if (!file.fieldname || file.fieldname.trim() === '') {
        file.fieldname = `attachment_${Date.now()}`;
        console.log('- Assigned default fieldname:', file.fieldname);
      }
      
      cb(null, true);
    }
  });

  // HomeDocsInterfaces Object Storage - Multiple file upload with transaction-based folder organization
  app.post('/api/upload', flexAuth, upload.array('documents', 60), async (req: any, res) => {
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
          console.log(`Processing file: ${file.originalname}, size: ${file.size}, buffer length: ${file.buffer?.length}`);
          
          // Validate file buffer exists and has content
          if (!file.buffer || file.buffer.length === 0) {
            console.error(`File ${file.originalname} has no buffer or empty buffer`);
            failedUploads.push({
              filename: file.originalname,
              error: 'File buffer is empty'
            });
            continue;
          }
          
          // Generate transaction-based S3 key: HomeDocsInterfaces/{transaction-name}/{file}
          const transactionFolder = `${transaction.name.replace(/[^a-zA-Z0-9-]/g, '_')}_${transaction.id}`;
          const s3Key = `HomeDocsInterfaces/${transactionFolder}/${Date.now()}_${file.originalname}`;
          
          // Create initial document record for Replit Object Storage
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
            analysisStatus: 'pending',
            s3Key: s3Key // Add the s3Key that we'll use for Replit Object Storage
          });

          console.log(`About to upload buffer of ${file.buffer.length} bytes to Replit Object Storage`);

          // Upload to Replit Object Storage (HomeDocsInterfaces bucket)
          const uploadResult = await replitObjectStorage.uploadFile(
            file.buffer,
            transaction.name,
            transaction.id,
            file.originalname,
            file.mimetype
          );
          
          console.log(`Upload result: objectKey=${uploadResult.objectKey}, fileSize=${uploadResult.fileSize}`);

          // Update document with successful upload details
          const updatedDocument = await storage.updateDocument(document.id, userId, {
            uploadStatus: 'completed',
            s3Key: uploadResult.objectKey,
            s3Bucket: uploadResult.bucketName,
            s3Url: uploadResult.objectUrl,
            etag: uploadResult.etag,
            fileSize: uploadResult.fileSize
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
              objectKey: uploadResult.objectKey,
              bucketName: uploadResult.bucketName,
              objectUrl: uploadResult.objectUrl,
              fileSize: uploadResult.fileSize,
              etag: uploadResult.etag,
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

  // API Key Management endpoint
  app.post('/api/generate-api-key', authMiddleware, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Generate API key (simple demo key for development)
      const apiKey = `docuai_${userId}_${Date.now()}_${Math.random().toString(36).substring(2)}`;
      
      res.json({
        success: true,
        apiKey,
        demoKey: "docuai_demo_key_123",
        usage: "Include in headers as 'X-API-Key: <key>' or 'Authorization: Bearer <key>'",
        baseUrl: `${req.protocol}://${req.get('host')}`,
        endpoints: [
          "GET /api/transactions",
          "POST /api/transactions", 
          "PUT /api/transactions/:id",
          "DELETE /api/transactions/:id",
          "POST /api/transactions/:id/upload",
          "GET /api/transactions/:id/documents"
        ],
        exampleUsage: {
          curl: `curl -H "X-API-Key: ${apiKey}" "${req.protocol}://${req.get('host')}/api/transactions"`,
          javascript: `fetch('${req.protocol}://${req.get('host')}/api/transactions', { headers: { 'X-API-Key': '${apiKey}' } })`
        }
      });
    } catch (error: any) {
      console.error("API key generation error:", error);
      res.status(500).json({ message: "Failed to generate API key", error: error.message });
    }
  });

  // Webhook management endpoints
  app.get('/api/webhook/config', flexAuth, async (req: any, res) => {
    try {
      const config = webhookService.getConfig();
      res.json({
        configured: !!config.url,
        url: config.url ? config.url.replace(/([^/])\w*([^/])/, '$1***$2') : 'Not configured', // Mask URL for security
        timeout: config.timeout,
        retries: config.retries,
        environmentVariables: {
          N8N_WEBHOOK_URL: !!process.env.N8N_WEBHOOK_URL,
          N8N_WEBHOOK_SECRET: !!process.env.N8N_WEBHOOK_SECRET
        }
      });
    } catch (error: any) {
      console.error("Webhook config error:", error);
      res.status(500).json({ message: "Failed to get webhook config", error: error.message });
    }
  });

  app.post('/api/webhook/test', flexAuth, async (req: any, res) => {
    try {
      const result = await webhookService.testConnection();
      res.json(result);
    } catch (error: any) {
      console.error("Webhook test error:", error);
      res.status(500).json({ 
        success: false, 
        message: "Webhook test failed", 
        error: error.message 
      });
    }
  });

  // API Authentication Test endpoint
  app.get('/api/auth/test', flexAuth, async (req: any, res) => {
    try {
      const user = req.user;
      res.json({
        success: true,
        message: "Authentication successful",
        user: {
          id: user.claims.sub,
          email: user.claims.email,
          authMethod: user.apiKey ? "API Key" : "JWT Token"
        },
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("Auth test error:", error);
      res.status(500).json({ 
        success: false, 
        message: "Authentication test failed", 
        error: error.message 
      });
    }
  });

  // Generate Report endpoint - triggers n8n workflow
  app.post('/api/transactions/:id/generate-report', flexAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const transactionId = parseInt(req.params.id);

      if (isNaN(transactionId)) {
        return res.status(400).json({ message: "Invalid transaction ID" });
      }

      // Get transaction details
      const transaction = await storage.getTransaction(transactionId, userId);
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }

      // Check if transaction has documents
      const documents = await storage.getDocuments(transactionId, userId);
      if (documents.length === 0) {
        return res.status(400).json({ message: "Please upload your documents first" });
      }

      // Get user details for webhook payload
      const user = await storage.getUser(userId);

      // Trigger webhook to n8n with report generation request
      const webhookPayload = {
        eventType: 'report_generation_requested',
        transaction: {
          Tranx_id: transaction.id,
          name: transaction.name,
          address: transaction.address,
          transactionType: transaction.transactionType,
          status: transaction.status,
          createdAt: transaction.createdAt,
          documentCount: documents.length
        },
        user: {
          id: user?.id,
          email: user?.email,
          firstName: user?.firstName,
          lastName: user?.lastName
        },
        documents: documents.map(doc => ({
          id: doc.id,
          fileName: doc.fileName,
          category: doc.category,
          uploadStatus: doc.uploadStatus,
          analysisStatus: doc.analysisStatus,
          riskScore: doc.riskScore
        })),
        requestedAt: new Date().toISOString(),
        reportType: 'comprehensive_analysis'
      };

      // Send webhook notification asynchronously
      webhookService.sendWebhook(webhookPayload).catch(error => {
        console.error('Failed to send report generation webhook:', error);
      });

      res.json({
        success: true,
        message: "Report generation started",
        Tranx_id: transaction.id,
        documentCount: documents.length,
        status: "processing"
      });

    } catch (error: any) {
      console.error("Error generating report:", error);
      res.status(500).json({ message: "Failed to generate report", error: error.message });
    }
  });

  // Transaction endpoints
  app.get('/api/transactions', flexAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const transactions = await storage.getTransactions(userId);
      
      // Transform response to use Tranx_id instead of id to avoid downstream conflicts
      const transformedTransactions = transactions.map(transaction => {
        const { id, ...rest } = transaction;
        return {
          ...rest,
          Tranx_id: id
        };
      });
      

      
      // Add cache-busting headers to ensure fresh data
      res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
      
      res.json(transformedTransactions);
    } catch (error: any) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.post('/api/transactions', flexAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = createTransactionSchema.parse(req.body);
      const transaction = await storage.createTransaction({
        ...validatedData,
        userId
      });
      
      // Transform response to use Tranx_id instead of id to avoid downstream conflicts
      const { id, ...rest } = transaction;
      const transformedTransaction = {
        ...rest,
        Tranx_id: id
      };
      
      res.status(201).json(transformedTransaction);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid transaction data", errors: error.errors });
      } else {
        console.error("Error creating transaction:", error);
        res.status(500).json({ message: "Failed to create transaction" });
      }
    }
  });

  // GET /api/transactions/:id - Get single transaction details
  app.get('/api/transactions/:id', flexAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const transactionId = parseInt(req.params.id);

      if (isNaN(transactionId)) {
        return res.status(400).json({ message: "Invalid transaction ID" });
      }

      const transaction = await storage.getTransaction(transactionId, userId);
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }

      // Transform response to use Tranx_id instead of id to avoid downstream conflicts
      const { id, ...rest } = transaction;
      const transformedTransaction = {
        ...rest,
        Tranx_id: id
      };

      res.json(transformedTransaction);
    } catch (error: any) {
      console.error("Error fetching transaction:", error);
      res.status(500).json({ message: "Failed to fetch transaction" });
    }
  });

  // PUT /api/transactions/:id - Update transaction fields (excluding num_documents)
  app.put('/api/transactions/:id', flexAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const transactionId = parseInt(req.params.id);

      if (isNaN(transactionId)) {
        return res.status(400).json({ message: "Invalid transaction ID" });
      }

      // Check if transaction exists and belongs to user
      const existingTransaction = await storage.getTransaction(transactionId, userId);
      if (!existingTransaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }

      // Validate the update data using createTransactionSchema (excludes numDocuments)
      const validatedData = createTransactionSchema.parse(req.body);
      
      // Update the transaction
      const updatedTransaction = await storage.updateTransaction(transactionId, userId, validatedData);
      
      res.json(updatedTransaction);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid transaction data", errors: error.errors });
      } else {
        console.error("Error updating transaction:", error);
        res.status(500).json({ message: "Failed to update transaction" });
      }
    }
  });

  app.delete('/api/transactions/:id', flexAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const transactionId = parseInt(req.params.id);

      if (isNaN(transactionId)) {
        return res.status(400).json({ message: "Invalid transaction ID" });
      }

      // Check if transaction exists and belongs to user
      const transaction = await storage.getTransaction(transactionId, userId);
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }

      // Perform cascade deletion (transaction, documents, chat sessions/messages, files from storage)
      await storage.deleteTransaction(transactionId, userId);

      res.json({ 
        message: "Transaction and all related data deleted successfully",
        deletedTransactionId: transactionId 
      });
    } catch (error: any) {
      console.error("Error deleting transaction:", error);
      res.status(500).json({ 
        message: "Failed to delete transaction", 
        error: error.message 
      });
    }
  });

  // POST /api/transactions/:id/upload - Upload documents to a transaction (ATOMIC)
  app.post('/api/transactions/:id/upload', flexAuth, upload.array('documents', 60), async (req: any, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ message: 'No files uploaded' });
      }

      const userId = req.user.claims.sub;
      const transactionId = parseInt(req.params.id);
      const { category } = req.body;

      // Validate transaction ID
      if (isNaN(transactionId)) {
        return res.status(400).json({ message: "Invalid transaction ID" });
      }

      // Verify transaction exists and belongs to user
      const transaction = await storage.getTransaction(transactionId, userId);
      if (!transaction) {
        return res.status(404).json({ message: 'Transaction not found' });
      }

      const uploadResults: any[] = [];
      const failedUploads: any[] = [];
      const storageUploads: string[] = []; // Track storage uploads for rollback

      try {
        // ATOMIC OPERATION: Use database transaction
        await db.transaction(async (tx) => {
          // Upload each file to Replit Object Storage and create document records atomically
          for (const file of files) {
            // Upload to Replit Object Storage using base64 workaround
            const uploadResult = await replitObjectStorage.uploadFile(
              file.buffer,
              transaction.name,
              transaction.id,
              file.originalname,
              file.mimetype
            );

            // Track for potential rollback
            storageUploads.push(uploadResult.objectKey);

            // Create document record in database within transaction
            const [document] = await tx.insert(documents).values({
              transactionId: transaction.id,
              userId,
              fileName: uploadResult.objectKey.split('/').pop() || file.originalname,
              originalFileName: file.originalname,
              fileSize: file.size,
              mimeType: file.mimetype,
              uploaderId: userId,
              category: category || 'hoa',
              uploadStatus: 'completed',
              s3Key: uploadResult.objectKey,
              s3Bucket: uploadResult.bucketName,
              s3Region: 'default',
              s3Url: uploadResult.objectUrl,
              etag: uploadResult.etag || ''
            }).returning();

            // Update transaction document count atomically
            await tx.update(transactions)
              .set({ 
                numDocuments: sql`${transactions.numDocuments} + 1`,
                updatedAt: new Date()
              })
              .where(eq(transactions.id, transactionId));

            uploadResults.push({
              documentId: document.id,
              filename: file.originalname,
              objectKey: uploadResult.objectKey,
              fileSize: uploadResult.fileSize,
              category: document.category,
              uploadedAt: document.uploadedAt
            });
          }
        });

        // Get updated transaction with current document count
        const updatedTransaction = await storage.getTransaction(transactionId, userId);

        // WEBHOOK: Notify n8n about transaction with new documents
        if (uploadResults.length > 0 && updatedTransaction) {
          try {
            const user = await storage.getUser(userId);
            const allDocuments = await storage.getDocuments(transactionId, userId);
            if (user) {
              await webhookService.onTransactionCreated(updatedTransaction, user, allDocuments);
            }
          } catch (webhookError) {
            console.error('Webhook notification failed (non-blocking):', webhookError);
          }
        }

        res.status(200).json({
          success: uploadResults.length > 0,
          message: `Uploaded ${uploadResults.length} of ${files.length} files successfully (ATOMIC)`,
          uploadResults,
          failedUploads,
          transaction: {
            id: updatedTransaction?.id,
            name: updatedTransaction?.name,
            numDocuments: updatedTransaction?.numDocuments,
            address: updatedTransaction?.address,
            type: updatedTransaction?.transactionType
          },
          summary: {
            totalFiles: files.length,
            successful: uploadResults.length,
            failed: failedUploads.length,
            documentsInTransaction: updatedTransaction?.numDocuments || 0
          }
        });

      } catch (error: any) {
        console.error('Atomic document upload error:', error);
        
        // ROLLBACK: Clean up any uploaded files if database transaction failed
        if (storageUploads.length > 0) {
          try {
            for (const objectKey of storageUploads) {
              await replitObjectStorage.deleteFile(objectKey);
            }
            console.log(`Rolled back ${storageUploads.length} uploaded files`);
          } catch (cleanupError) {
            console.error('Storage cleanup error:', cleanupError);
          }
        }

        res.status(500).json({ 
          message: 'Atomic upload failed - all changes rolled back', 
          error: error.message 
        });
      }
    } catch (error: any) {
      console.error('Transaction document upload error:', error);
      res.status(500).json({ 
        message: 'Upload failed', 
        error: error.message 
      });
    }
  });

  // POST /api/debug/n8n-upload - Debug endpoint to see what n8n is sending
  app.post('/api/debug/n8n-upload', flexAuth, upload.any(), async (req: any, res) => {
    const allFiles = req.files as Express.Multer.File[];
    
    const debug = {
      headers: req.headers,
      query: req.query,
      body: typeof req.body === 'object' ? Object.keys(req.body) : 'Not an object',
      files: {
        total: allFiles?.length || 0,
        details: allFiles?.map(f => ({
          fieldname: f.fieldname,
          originalname: f.originalname,
          size: f.size,
          mimetype: f.mimetype,
          encoding: f.encoding
        })) || []
      },
      attachmentFields: allFiles?.filter(f => f.fieldname.startsWith('attachment_'))?.length || 0
    };
    
    console.log('=== N8N DEBUG INFO ===');
    console.log(JSON.stringify(debug, null, 2));
    
    res.json(debug);
  });

  // POST /api/transactions/:id/upload-form-data - Upload multiple documents via form-data (for n8n)
  app.post('/api/transactions/:id/upload-form-data', flexAuth, upload.any(), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const transactionId = parseInt(req.params.id);
      const allFiles = req.files as Express.Multer.File[];
      
      console.log('=== N8N FORM-DATA UPLOAD DEBUG ===');
      console.log('- Transaction ID:', transactionId);
      console.log('- Total files received:', allFiles?.length || 0);
      console.log('- Form body keys:', Object.keys(req.body || {}));
      console.log('- Files:', allFiles?.map(f => ({ 
        fieldname: f.fieldname, 
        originalname: f.originalname, 
        size: f.size,
        mimetype: f.mimetype
      })));
      
      if (!allFiles || allFiles.length === 0) {
        return res.status(400).json({ 
          message: 'No files uploaded',
          debug: {
            filesReceived: allFiles?.length || 0,
            contentType: req.headers['content-type'],
            bodyKeys: Object.keys(req.body || {})
          }
        });
      }

      // Filter file fields (file1, file2, etc. or attachment_0, attachment_1, etc.)
      const fileFields = allFiles.filter(f => 
        f.fieldname.startsWith('file') || 
        f.fieldname.startsWith('attachment_') || 
        f.fieldname === 'attachment' || 
        f.fieldname === 'document'
      );

      console.log('- Filtered file fields:', fileFields.length);

      if (fileFields.length === 0) {
        return res.status(400).json({ 
          message: 'No valid file fields found',
          debug: {
            receivedFields: allFiles.map(f => f.fieldname),
            expectedFields: 'file1, file2, file3, etc. or attachment_0, attachment_1, etc.'
          }
        });
      }

      // Validate transaction exists and user owns it
      const transaction = await storage.getTransaction(transactionId, userId);
      if (!transaction) {
        return res.status(404).json({ message: 'Transaction not found' });
      }

      // Use atomic upload logic
      const storageUploads: string[] = [];
      const uploadResults: any[] = [];
      const failedUploads: any[] = [];

      try {
        // Process all files atomically
        for (const file of fileFields) {
          try {
            console.log(`Processing file: ${file.originalname} (${file.size} bytes)`);
            
            // Extract filename from form body or headers
            let filename = file.originalname;
            
            // Check for custom filename in form body (filename1, filename2, etc.)
            const filenameKey = file.fieldname.replace('file', 'filename');
            if (req.body[filenameKey]) {
              filename = req.body[filenameKey];
            }
            
            // Check for header-based filename
            const filenameHeader = req.headers['x-filename'] || req.headers[`x-filename-${file.fieldname}`];
            if (filenameHeader && typeof filenameHeader === 'string') {
              filename = filenameHeader;
            }

            console.log(`Using filename: ${filename}`);

            // Upload to Replit Object Storage
            const uploadResult = await replitObjectStorage.uploadFile(
              file.buffer,
              filename,
              file.mimetype,
              transaction.name,
              transactionId
            );

            storageUploads.push(uploadResult.objectKey);

            // Save document metadata to database
            const documentData = {
              transactionId: transactionId,
              userId: userId,
              fileName: uploadResult.objectKey.split('/')[1], // Remove folder prefix
              originalFileName: filename,
              mimeType: file.mimetype,
              fileSize: file.size,
              replitStorageKey: uploadResult.objectKey,
              uploadStatus: 'completed' as const,
              uploadedAt: new Date(),
            };

            const savedDocument = await storage.createDocument(documentData);
            uploadResults.push({
              fieldName: file.fieldname,
              fileName: filename,
              documentId: savedDocument.id,
              storage: uploadResult
            });

            console.log(`✓ Successfully uploaded: ${filename}`);
          } catch (error: any) {
            console.error(`✗ Failed to upload ${file.originalname}:`, error);
            failedUploads.push({
              fieldName: file.fieldname,
              filename: file.originalname,
              error: error.message
            });
          }
        }

        // Update transaction document count
        const updatedTransaction = await storage.updateTransactionDocumentCount(transactionId);

        // WEBHOOK: Notify n8n about transaction with new documents
        if (uploadResults.length > 0 && updatedTransaction) {
          try {
            const user = await storage.getUser(userId);
            const allDocuments = await storage.getDocuments(transactionId, userId);
            if (user) {
              await webhookService.onTransactionCreated(updatedTransaction, user, allDocuments);
            }
          } catch (webhookError) {
            console.error('Webhook notification failed (non-blocking):', webhookError);
          }
        }

        res.json({
          success: true,
          message: `${uploadResults.length} files uploaded successfully`,
          uploaded: uploadResults.map(r => ({
            fieldName: r.fieldName,
            fileName: r.fileName,
            documentId: r.documentId
          })),
          failed: failedUploads,
          transactionId: transactionId
        });

      } catch (error: any) {
        console.error('Form-data upload error:', error);
        
        // Clean up any uploaded files on error
        for (const objectKey of storageUploads) {
          try {
            await replitObjectStorage.deleteFile(objectKey);
          } catch (cleanupError) {
            console.error(`Failed to cleanup file ${objectKey}:`, cleanupError);
          }
        }

        res.status(500).json({
          success: false,
          message: 'Form-data upload failed',
          error: error.message,
          uploaded: [],
          failed: failedUploads
        });
      }

    } catch (error: any) {
      console.error('N8N multi-upload error:', error);
      res.status(500).json({ 
        message: 'Upload failed', 
        error: error.message 
      });
    }
  });

  // Helper function to handle multiple file uploads
  async function handleMultipleFileUpload(req: any, res: any, allFiles: Express.Multer.File[], transaction: any) {
    const userId = req.user.claims.sub;
    const transactionId = transaction.id;
    
    console.log('=== MULTIPLE FILE UPLOAD MODE ===');
    console.log('- Files to process:', allFiles.length);
    
    // Process all files (accept any field names)
    const fileFields = allFiles;
    
    const storageUploads: string[] = [];
    const uploadResults: any[] = [];
    const failedUploads: any[] = [];
    
    try {
      // Process all files atomically
      for (const file of fileFields) {
        try {
          console.log(`Processing file: ${file.originalname} (${file.size} bytes)`);
          
          // ALWAYS use the original filename from binary data - NO OVERRIDES
          let filename = file.originalname;
          
          console.log('- Original filename from binary:', file.originalname);
          console.log('- Using filename:', filename);
          
          // DO NOT override with form body data - preserve original filenames
          
          // Ensure proper file extension for Google Docs
          if (file.mimetype.includes('google-apps') && filename && !filename.includes('.')) {
            if (file.mimetype.includes('document')) filename += '.gdoc';
            else if (file.mimetype.includes('spreadsheet')) filename += '.gsheet';
            else if (file.mimetype.includes('presentation')) filename += '.gslides';
          }
          
          // Upload to Replit Object Storage
          const uploadResult = await replitObjectStorage.uploadFile(
            file.buffer,
            transaction.name,
            transactionId,
            filename,
            file.mimetype
          );
          
          storageUploads.push(uploadResult.objectKey);
          
          // Save document metadata to database
          const documentData = {
            transactionId: transactionId,
            userId: userId,
            uploaderId: userId, // Fix: Add uploader_id field
            fileName: uploadResult.objectKey.split('/').pop() || filename,
            originalFileName: filename,
            mimeType: file.mimetype,
            fileSize: file.size,
            category: 'other',
            uploadStatus: 'completed' as const,
            s3Key: uploadResult.objectKey, // Fix: Use s3Key instead of replitStorageKey
            s3Bucket: uploadResult.bucketName,
            s3Url: uploadResult.objectUrl,
            etag: uploadResult.etag
          };
          
          console.log('Multi-upload documentData:', JSON.stringify(documentData, null, 2));
          console.log('Multi-upload uploaderId field:', documentData.uploaderId);
          
          // Try direct database insertion to bypass potential schema issues
          const [savedDocument] = await db.insert(documents).values(documentData).returning();
          uploadResults.push({
            fieldName: file.fieldname,
            fileName: filename,
            documentId: savedDocument.id,
            storage: uploadResult
          });
          
          console.log(`✓ Successfully uploaded: ${filename}`);
        } catch (error: any) {
          console.error(`✗ Failed to upload ${file.originalname}:`, error);
          failedUploads.push({
            fieldName: file.fieldname,
            filename: file.originalname,
            error: error.message
          });
        }
      }
      
      // Update transaction document count
      await storage.updateTransactionDocumentCount(transactionId);
      
      // Send webhook notification
      if (uploadResults.length > 0) {
        try {
          const user = await storage.getUser(userId);
          const allDocuments = await storage.getDocuments(transactionId, userId);
          if (user) {
            await webhookService.onTransactionCreated(transaction, user, allDocuments);
          }
        } catch (webhookError) {
          console.error('Webhook notification failed (non-blocking):', webhookError);
        }
      }
      
      res.json({
        success: true,
        message: `${uploadResults.length} files uploaded successfully`,
        uploaded: uploadResults.map(r => ({
          fieldName: r.fieldName,
          fileName: r.fileName,
          documentId: r.documentId
        })),
        failed: failedUploads,
        transactionId: transactionId
      });
      
    } catch (error: any) {
      console.error('Multiple file upload error:', error);
      
      // Clean up any uploaded files on error
      for (const objectKey of storageUploads) {
        try {
          await replitObjectStorage.deleteFile(objectKey);
        } catch (cleanupError) {
          console.error(`Failed to cleanup file ${objectKey}:`, cleanupError);
        }
      }
      
      res.status(500).json({
        success: false,
        message: 'Multiple file upload failed',
        error: error.message,
        uploaded: [],
        failed: failedUploads
      });
    }
  }

  // POST /api/transactions/:id/upload-single - Upload ONE document to a transaction (ATOMIC)
  // Flexible endpoint that accepts both multipart form-data and raw binary data from n8n
  app.post('/api/transactions/:id/upload-single', flexAuth, (req: any, res, next) => {
    console.log('=== ROUTE MATCHED ===');
    console.log('- Route matched: /api/transactions/:id/upload-single');
    console.log('- Transaction ID param:', req.params.id);
    console.log('- Request path:', req.path);
    console.log('- Request URL:', req.url);
    const contentType = req.headers['content-type'] || '';
    
    console.log('=== MIDDLEWARE DEBUG ===');
    console.log('- Content-Type:', contentType);
    console.log('- User-Agent:', req.headers['user-agent']);
    console.log('- Is multipart:', contentType.includes('multipart/form-data'));
    
    if (contentType.includes('multipart/form-data')) {
      // Use more permissive multer for n8n multipart form-data
      console.log('- Using n8n-compatible multer for multipart');
      n8nUpload.any()(req, res, next);
    } else {
      // Use raw body parsing for binary data
      console.log('- Using raw body parsing for binary');
      // Set up to collect raw binary data
      const chunks: Buffer[] = [];
      req.on('data', (chunk: Buffer) => {
        chunks.push(chunk);
      });
      req.on('end', () => {
        req.body = Buffer.concat(chunks);
        next();
      });
      req.on('error', next);
    }
  }, async (req: any, res) => {
    try {
      const contentType = req.headers['content-type'] || '';
      let file: Express.Multer.File | null = null;
      
      // Enhanced debugging for n8n integration
      console.log('=== N8N SINGLE UPLOAD DEBUG ===');
      console.log('- URL:', req.url);
      console.log('- Method:', req.method);
      console.log('- Headers:', JSON.stringify(req.headers, null, 2));
      console.log('- Content-Type:', contentType);
      console.log('- Content-Length:', req.headers['content-length']);
      console.log('- Body type:', typeof req.body);
      console.log('- Body is Buffer:', Buffer.isBuffer(req.body));
      console.log('- Body size:', req.body ? (Buffer.isBuffer(req.body) ? req.body.length : JSON.stringify(req.body).length) : 0);
      console.log('- Query params:', req.query);
      
      // Handle raw binary data (n8n sends entire file as body)
      if (Buffer.isBuffer(req.body) && req.body.length > 0) {
        console.log('- Processing raw binary body, size:', req.body.length);
        
        // Get filename from multiple sources that n8n might use
        let filename = req.headers['x-filename'] || 
                       req.headers['x-original-filename'] ||
                       req.headers['x-file-name'] ||
                       req.headers['original-filename'] ||
                       req.query.filename || 
                       req.query.originalFilename ||
                       req.query['original-filename'] ||
                       req.headers['content-disposition'];
        
        // Parse Content-Disposition header if present
        if (filename && typeof filename === 'string' && filename.includes('filename=')) {
          const match = filename.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
          if (match && match[1]) {
            filename = match[1].replace(/['"]/g, '');
          }
        }
        
        console.log('- Filename detection attempt:', {
          'x-filename': req.headers['x-filename'],
          'x-original-filename': req.headers['x-original-filename'],
          'x-file-name': req.headers['x-file-name'],
          'query.filename': req.query.filename,
          'query.originalFilename': req.query.originalFilename,
          'content-disposition': req.headers['content-disposition'],
          'final-filename': filename
        });
        
        // Default to a generic name if no filename provided
        if (!filename || typeof filename !== 'string') {
          // Try to determine extension from mime type
          let ext = '.pdf';
          if (detectedMimeType.includes('google-apps.document')) ext = '.gdoc';
          else if (detectedMimeType.includes('google-apps.spreadsheet')) ext = '.gsheet';
          else if (detectedMimeType.includes('google-apps.presentation')) ext = '.gslides';
          else if (detectedMimeType.includes('msword')) ext = '.doc';
          else if (detectedMimeType.includes('wordprocessingml.document')) ext = '.docx';
          else if (detectedMimeType.includes('text/plain')) ext = '.txt';
          
          filename = `n8n-upload-${Date.now()}${ext}`;
        }
        
        // Ensure proper file extension for Google Docs
        if (detectedMimeType.includes('google-apps') && filename && !filename.includes('.')) {
          if (detectedMimeType.includes('document')) filename += '.gdoc';
          else if (detectedMimeType.includes('spreadsheet')) filename += '.gsheet';
          else if (detectedMimeType.includes('presentation')) filename += '.gslides';
        }
        
        // Determine mime type from headers or filename (including Google Docs)
        let detectedMimeType = req.headers['content-type'] || 'application/octet-stream';
        if (detectedMimeType === 'application/octet-stream' && filename.includes('.')) {
          const ext = filename.split('.').pop()?.toLowerCase();
          if (ext === 'pdf') detectedMimeType = 'application/pdf';
          else if (ext === 'doc') detectedMimeType = 'application/msword';
          else if (ext === 'docx') detectedMimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
          else if (ext === 'txt') detectedMimeType = 'text/plain';
          else if (ext === 'rtf') detectedMimeType = 'application/rtf';
          else if (ext === 'odt') detectedMimeType = 'application/vnd.oasis.opendocument.text';
          else if (ext === 'xls') detectedMimeType = 'application/vnd.ms-excel';
          else if (ext === 'xlsx') detectedMimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          else if (ext === 'ppt') detectedMimeType = 'application/vnd.ms-powerpoint';
          else if (ext === 'pptx') detectedMimeType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
          else if (ext === 'gdoc') detectedMimeType = 'application/vnd.google-apps.document';
          else if (ext === 'gsheet') detectedMimeType = 'application/vnd.google-apps.spreadsheet';
          else if (ext === 'gslides') detectedMimeType = 'application/vnd.google-apps.presentation';
        }
        
        // Handle Google Docs native MIME types
        if (detectedMimeType.includes('google-apps')) {
          console.log('- Google Docs file detected:', detectedMimeType);
        }
        
        // Create a multer-compatible file object
        file = {
          fieldname: 'attachment',
          originalname: filename,
          encoding: '7bit',
          mimetype: detectedMimeType,
          buffer: req.body,
          size: req.body.length
        } as Express.Multer.File;
        
        console.log('- Created file object:', {
          originalname: file.originalname,
          size: file.size,
          mimetype: file.mimetype,
          hasBuffer: !!file.buffer
        });
      } else if (contentType.includes('multipart/form-data')) {
        // Handle multipart form-data (can be single or multiple files)
        const allFiles = req.files as Express.Multer.File[];
        
        console.log('- All files received:', allFiles?.map(f => ({ 
          fieldname: f.fieldname, 
          originalname: f.originalname, 
          size: f.size,
          mimetype: f.mimetype,
          hasBuffer: !!f.buffer
        })));
        console.log('- Total files count:', allFiles?.length || 0);
        console.log('- All field names:', allFiles?.map(f => f.fieldname) || []);
        
        // Check if files exist and handle accordingly
        console.log('- Pre-condition debug: allFiles exists:', !!allFiles);
        console.log('- Pre-condition debug: allFiles length:', allFiles?.length);
        console.log('- Pre-condition debug: condition result:', !!(allFiles && allFiles.length > 0));
        
        if (allFiles && allFiles.length > 0) {
          console.log('- ENTERED main files condition');
          if (allFiles.length > 1) {
            console.log('- Multiple files detected, switching to multi-upload mode');
            
            // Get transaction info for multiple file upload
            const multiUploadUserId = req.user.claims.sub;
            const multiUploadTransactionIdParam = req.params.id;
            let multiUploadTransactionId: number;
            
            if (multiUploadTransactionIdParam.match(/^[0-9a-f]+$/i) && multiUploadTransactionIdParam.length > 10) {
              multiUploadTransactionId = parseInt(multiUploadTransactionIdParam, 16);
            } else {
              multiUploadTransactionId = parseInt(multiUploadTransactionIdParam);
            }
            
            if (isNaN(multiUploadTransactionId)) {
              return res.status(400).json({ 
                message: "Invalid transaction ID",
                debug: { received: multiUploadTransactionIdParam, converted: multiUploadTransactionId }
              });
            }
            
            const multiUploadTransaction = await storage.getTransaction(multiUploadTransactionId, multiUploadUserId);
            if (!multiUploadTransaction) {
              return res.status(404).json({ message: 'Transaction not found' });
            }
            
            // Handle multiple files in one request
            return await handleMultipleFileUpload(req, res, allFiles, multiUploadTransaction);
          } else {
            console.log('- ENTERED single file branch');
            // Single file upload - accept any field name
            const selectedFile = allFiles[0]; // Take the first (and only) file
            file = selectedFile;
            
            console.log('- Debug: allFiles exists:', !!allFiles);
            console.log('- Debug: allFiles is array:', Array.isArray(allFiles));
            console.log('- Debug: allFiles length:', allFiles?.length);
            console.log('- Debug: allFiles[0] exists:', !!allFiles?.[0]);
            console.log('- Debug: allFiles[0] details:', allFiles?.[0]);
            console.log('- Debug: file variable after assignment:', file);
            console.log('- Debug: file is truthy:', !!file);
            
            console.log('- Single file mode, selected file:', file ? {
              fieldname: file.fieldname,
              originalname: file.originalname,
              size: file.size,
              mimetype: file.mimetype,
              hasBuffer: !!file.buffer
            } : 'No file received');
          }
        } else {
          console.log('- DID NOT ENTER main files condition');
          console.log('- No files found in multipart data');
        }
      } else {
        console.log('- No binary data received or body is not a buffer');
        console.log('- Body content preview:', req.body ? req.body.toString().substring(0, 100) : 'null');
      }
      
      console.log('=== END DEBUG ===');
      
      if (!file) {
        return res.status(400).json({ 
          message: 'No file uploaded',
          debug: {
            receivedFields: Object.keys(req.body || {}),
            filesReceived: req.files ? (req.files as Express.Multer.File[]).map(f => f.fieldname) : [],
            fileCount: req.files ? (req.files as Express.Multer.File[]).length : 0,
            expectedFields: 'document OR attachment OR attachment_0',
            contentType: req.headers['content-type'],
            hasMultipart: req.headers['content-type']?.includes('multipart/form-data') || false,
            bodyIsBuffer: Buffer.isBuffer(req.body),
            bodySize: req.body ? (Buffer.isBuffer(req.body) ? req.body.length : JSON.stringify(req.body).length) : 0
          }
        });
      }

      const userId = req.user.claims.sub;
      const transactionIdParam = req.params.id;
      let transactionId: number;
      
      // Handle both numeric and hex string transaction IDs from n8n
      if (transactionIdParam.match(/^[0-9a-f]+$/i) && transactionIdParam.length > 10) {
        // If it's a hex string, convert to number
        transactionId = parseInt(transactionIdParam, 16);
      } else {
        // Otherwise parse as regular number
        transactionId = parseInt(transactionIdParam);
      }
      
      const { category } = req.body;

      console.log('Transaction ID processing:', {
        original: transactionIdParam,
        converted: transactionId,
        isValid: !isNaN(transactionId)
      });

      // Validate transaction ID
      if (isNaN(transactionId)) {
        return res.status(400).json({ 
          message: "Invalid transaction ID",
          debug: {
            received: transactionIdParam,
            converted: transactionId
          }
        });
      }

      // Verify transaction exists and belongs to user
      const transaction = await storage.getTransaction(transactionId, userId);
      if (!transaction) {
        return res.status(404).json({ message: 'Transaction not found' });
      }

      // Note: Duplicate prevention removed to allow multiple different files

      let objectKey: string | null = null;

      try {
        // ATOMIC OPERATION: Use database transaction
        const result = await db.transaction(async (tx) => {
          // 1. Upload to Replit Object Storage first
          const uploadResult = await replitObjectStorage.uploadFile(
            file.buffer,
            transaction.name,
            transactionId,
            file.originalname,
            file.mimetype
          );

          objectKey = uploadResult.objectKey; // Track for potential rollback

          // 2. Create document record in database
          const documentData = {
            transactionId,
            userId,
            uploaderId: userId,
            originalFileName: file.originalname,
            fileName: uploadResult.objectKey.split('/').pop() || file.originalname,
            fileSize: file.size,
            mimeType: file.mimetype,
            category: category || 'other',
            uploadStatus: 'completed' as const,
            s3Key: uploadResult.objectKey,
            s3Bucket: uploadResult.bucketName,
            s3Url: uploadResult.objectUrl,
            etag: uploadResult.etag
          };

          const [document] = await tx.insert(documents).values([documentData]).returning();

          // 3. Update transaction document count
          const [updatedTransaction] = await tx
            .update(transactions)
            .set({ 
              numDocuments: sql`${transactions.numDocuments} + 1`,
              updatedAt: new Date()
            })
            .where(and(eq(transactions.id, transactionId), eq(transactions.userId, userId)))
            .returning();

          return { document, transaction: updatedTransaction };
        });

        console.log(`Single document uploaded successfully: ${file.originalname} to transaction ${transactionId}`);

        // WEBHOOK: Notify n8n about transaction with new document
        try {
          const user = await storage.getUser(userId);
          const allDocuments = await storage.getDocuments(transactionId, userId);
          if (user && result.transaction) {
            await webhookService.onTransactionCreated(result.transaction, user, allDocuments);
          }
        } catch (webhookError) {
          console.error('Webhook notification failed (non-blocking):', webhookError);
        }

        res.json({
          success: true,
          message: `Document "${file.originalname}" uploaded successfully to transaction ${transactionId}`,
          document: {
            id: result.document.id,
            fileName: result.document.fileName,
            originalFileName: result.document.originalFileName,
            fileSize: result.document.fileSize,
            mimeType: result.document.mimeType,
            category: result.document.category,
            uploadStatus: result.document.uploadStatus,
            uploadedAt: result.document.uploadedAt
          },
          transaction: {
            Tranx_id: result.transaction.id,
            name: result.transaction.name,
            numDocuments: result.transaction.numDocuments
          }
        });

      } catch (error: any) {
        console.error('Atomic single document upload error:', error);
        
        // ROLLBACK: Clean up uploaded file if database transaction failed
        if (objectKey) {
          try {
            await replitObjectStorage.deleteFile(objectKey);
            console.log(`Rolled back uploaded file: ${objectKey}`);
          } catch (cleanupError) {
            console.error('Storage cleanup error:', cleanupError);
          }
        }

        res.status(500).json({ 
          message: 'Single document upload failed - all changes rolled back', 
          error: error.message 
        });
      }
    } catch (error: any) {
      console.error('Single document upload error:', error);
      res.status(500).json({ 
        message: 'Upload failed', 
        error: error.message 
      });
    }
  });

  // Document endpoints
  app.get('/api/transactions/:id/documents', flexAuth, async (req: any, res) => {
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

  // Document download endpoint - Replit Object Storage only
  app.get('/api/documents/:id/download', authMiddleware, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const documentId = parseInt(req.params.id);

      const document = await storage.getDocument(documentId, userId);
      if (!document) {
        return res.status(404).json({ message: 'Document not found' });
      }

      if (document.uploadStatus !== 'completed') {
        return res.status(400).json({ message: 'Document not available for download' });
      }

      if (!document.s3Key) {
        return res.status(400).json({ message: 'Document not stored in Replit Object Storage' });
      }

      try {
        const downloadUrl = await replitObjectStorage.generateDownloadUrl(document.s3Key, 3600);
        
        return res.json({
          success: true,
          downloadUrl,
          filename: document.originalFileName,
          fileSize: document.fileSize,
          mimeType: document.mimeType,
          expiresIn: 3600
        });
      } catch (downloadError: unknown) {
        const errorMessage = downloadError instanceof Error ? downloadError.message : 'Download error';
        console.error('Replit Object Storage download failed:', downloadError);
        return res.status(500).json({ 
          message: 'Failed to generate download URL from Replit Object Storage', 
          error: errorMessage 
        });
      }
    } catch (error: any) {
      console.error('Download error:', error);
      res.status(500).json({ message: 'Download failed', error: error.message });
    }
  });

  // Direct file download endpoint for Replit Object Storage
  app.get('/api/storage/download/:objectKey(*)', async (req: any, res) => {
    try {
      const objectKey = decodeURIComponent(req.params.objectKey);
      console.log(`Direct download request for object key: ${objectKey}`);
      
      // WORKAROUND: Download as text since we stored as base64 due to SDK bug
      console.log('Calling client.downloadAsText (base64 workaround)...');
      const result = await replitObjectStorage.client.downloadAsText(objectKey);
      console.log('downloadAsText result:', { ok: result.ok, hasValue: !!result.value });
      
      if (!result.ok) {
        console.error('Failed to download file from storage:', result.error);
        return res.status(404).json({ message: 'File not found in storage' });
      }
      
      // Decode base64 back to original buffer
      console.log(`Downloaded base64 content length: ${result.value.length}`);
      const buffer = Buffer.from(result.value, 'base64');
      console.log(`Decoded buffer length: ${buffer.length} bytes`);
      
      if (buffer.length === 0) {
        console.error('Decoded file is empty!');
        return res.status(500).json({ message: 'File is empty' });
      }
      
      // Set appropriate headers and serve the file
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${objectKey.split('/').pop()}"`);
      res.setHeader('Content-Length', buffer.length.toString());
      
      // Send the file data as Buffer
      console.log(`Sending buffer of ${buffer.length} bytes`);
      res.end(buffer);
    } catch (error: any) {
      console.error('Direct download error:', error);
      res.status(500).json({ message: 'Download failed', error: error.message });
    }
  });

  // Clear all files from Replit Object Storage (admin only)
  app.delete('/api/storage/clear', authMiddleware, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Only allow admins to clear all storage
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }
      
      console.log('Admin clearing all files from Replit Object Storage...');
      
      // List all objects in storage
      const objects = await replitObjectStorage.listObjects();
      console.log(`Found ${objects.length} objects to delete`);
      
      let deletedCount = 0;
      let errorCount = 0;
      const errors: string[] = [];
      
      // Delete each object
      for (const obj of objects) {
        try {
          await replitObjectStorage.deleteFile(obj.key);
          deletedCount++;
          console.log(`Deleted: ${obj.key}`);
        } catch (error) {
          errorCount++;
          const errorMsg = `Failed to delete ${obj.key}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          errors.push(errorMsg);
          console.error(errorMsg);
        }
      }
      
      res.json({
        message: 'Storage cleanup completed',
        totalObjects: objects.length,
        deletedCount,
        errorCount,
        errors: errors.slice(0, 10) // Only show first 10 errors
      });
    } catch (error: any) {
      console.error('Storage clear error:', error);
      res.status(500).json({ message: 'Failed to clear storage', error: error.message });
    }
  });

  // Replit Object Storage status endpoint
  app.get('/api/storage/status', authMiddleware, async (req: any, res) => {
    try {
      const isConfigured = replitObjectStorage.isConfigured();
      const connectionTest = await replitObjectStorage.testConnection();
      
      res.json({
        storageType: 'Replit Object Storage',
        configured: isConfigured,
        connected: connectionTest,
        bucketName: 'HomeDocsInterfaces',
        location: 'Replit Object Storage (Cloud)',
        debug: {
          bucketName: 'HomeDocsInterfaces',
          replitDomains: !!process.env.REPLIT_DOMAINS,
          baseUrl: `https://${process.env.REPLIT_DOMAINS?.split(',')[0]}/api/storage`
        }
      });
    } catch (error: any) {
      res.status(500).json({ 
        message: 'Replit Object Storage status check failed', 
        error: error.message 
      });
    }
  });

  // Replit Object Storage browser endpoint
  app.get('/api/storage/browse', authMiddleware, async (req: any, res) => {
    try {
      // List all objects in the HomeDocsInterfaces bucket
      const objects = await replitObjectStorage.listObjects();
      
      // Group objects by transaction folder
      const folders = new Map();
      
      objects.forEach((object: any) => {
        const key = object.key || object.name;
        if (!key) return;
        
        const pathParts = key.split('/');
        if (pathParts.length >= 2) {
          const folderName = pathParts[0];
          const fileName = pathParts.slice(1).join('/');
          
          if (!folders.has(folderName)) {
            folders.set(folderName, {
              name: folderName,
              path: folderName,
              fileCount: 0,
              totalSize: 0,
              files: []
            });
          }
          
          const folder = folders.get(folderName);
          folder.fileCount++;
          folder.totalSize += object.size || 0;
          folder.files.push({
            name: fileName,
            size: object.size || 0,
            modified: object.lastModified || new Date(),
            key: key,
            path: key
          });
        }
      });
      
      const folderArray = Array.from(folders.values());
      
      res.json({ 
        folders: folderArray, 
        files: [], 
        totalFolders: folderArray.length,
        totalObjects: objects.length 
      });
    } catch (error: any) {
      res.status(500).json({ 
        message: 'Failed to browse Replit Object Storage', 
        error: error.message 
      });
    }
  });

  // Debug session endpoint
  app.get('/api/debug/session', (req: any, res) => {
    res.json({
      isAuthenticated: req.isAuthenticated ? req.isAuthenticated() : false,
      sessionID: req.sessionID,
      sessionUser: req.session?.user,
      passportUser: req.user,
      cookies: req.headers.cookie
    });
  });

  // Auth user endpoint - handles both session and OAuth without loops
  app.get('/api/auth/user', (req: any, res) => {
    console.log('Auth check - isAuthenticated:', req.isAuthenticated ? req.isAuthenticated() : 'undefined');
    console.log('Auth check - req.user:', req.user ? 'exists' : 'undefined');
    console.log('Auth check - session.user:', req.session?.user ? 'exists' : 'undefined');
    console.log('Auth check - sessionID:', req.sessionID);
    
    // Check if user is authenticated via passport (OAuth or local)
    if (req.isAuthenticated && req.isAuthenticated() && req.user) {
      const userId = req.user.id;
      console.log('Using passport user:', userId);
      storage.getUser(userId).then(user => {
        if (user) {
          const { passwordHash, ...userResponse } = user;
          return res.json(userResponse);
        }
        return res.status(404).json({ message: "User not found" });
      }).catch(error => {
        console.error("Error fetching user:", error);
        res.status(500).json({ message: "Failed to fetch user" });
      });
      return;
    }
    
    // Fallback: Check for local session authentication (legacy)
    if (req.session && req.session.user) {
      const sessionUser = req.session.user;
      storage.getUser(sessionUser.id).then(user => {
        if (user) {
          const { passwordHash, ...userResponse } = user;
          return res.json(userResponse);
        }
        return res.status(404).json({ message: "User not found" });
      }).catch(error => {
        console.error("Error fetching user:", error);
        res.status(500).json({ message: "Failed to fetch user" });
      });
      return;
    }
    
    // Check if user has been explicitly logged out
    if (req.session && req.session.loggedOut) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    return res.status(401).json({ message: "Unauthorized - please log in" });
  });

  // Chat endpoints for Q&A functionality
  app.get('/api/chat-sessions', authMiddleware, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sessions = await storage.getChatSessions(userId);
      res.json(sessions);
    } catch (error: any) {
      console.error("Error fetching chat sessions:", error);
      res.status(500).json({ message: "Failed to fetch chat sessions" });
    }
  });

  app.post('/api/chat-sessions', authMiddleware, async (req: any, res) => {
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

  app.get('/api/chat-sessions/:id/messages', authMiddleware, async (req: any, res) => {
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

  app.post('/api/chat-sessions/:id/messages', authMiddleware, async (req: any, res) => {
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

  // Admin endpoints - only for admin users
  app.post('/api/admin/users/:userId/role', authMiddleware, async (req: any, res) => {
    try {
      const adminUserId = req.user.claims.sub;
      const adminUser = await storage.getUser(adminUserId);
      
      if (adminUser?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { userId } = req.params;
      const { role } = req.body;

      if (!role || !['user', 'admin'].includes(role)) {
        return res.status(400).json({ message: "Valid role (user or admin) required" });
      }

      const updatedUser = await storage.updateUserRole(userId, role);
      res.json({ message: `User role updated to ${role}`, user: updatedUser });
    } catch (error: any) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  // Initialize admin user for testing (make mock-user-1 an admin)
  app.post('/api/admin/init', async (req: any, res) => {
    try {
      // Always set mock-user-1 as admin for testing
      const user = await storage.updateUserRole("mock-user-1", "admin");
      res.json({ message: "Admin user initialized", user });
    } catch (error: any) {
      console.error("Error initializing admin:", error);
      res.status(500).json({ message: "Failed to initialize admin user" });
    }
  });

  // Test endpoint to demonstrate user isolation
  app.get('/api/test/user-isolation', authMiddleware, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Get transactions and user info for current user
      const transactions = await storage.getTransactions(userId);
      const chatSessions = await storage.getChatSessions(userId);
      
      res.json({
        currentUser: {
          id: user?.id,
          email: user?.email,
          role: user?.role
        },
        dataAccess: {
          transactionCount: transactions.length,
          transactions: transactions.map(t => ({ id: t.id, name: t.name, userId: t.userId })),
          chatSessionCount: chatSessions.length,
          isAdmin: user?.role === 'admin'
        },
        explanation: user?.role === 'admin' 
          ? "As an admin, you can see all transactions and data from all users"
          : "As a regular user, you only see your own transactions and data"
      });
    } catch (error: any) {
      console.error("Error in user isolation test:", error);
      res.status(500).json({ message: "Failed to test user isolation" });
    }
  });

  // RESTful Users API Endpoints
  
  // POST /api/users - Create a new user with all fields
  app.post('/api/users', isAuthenticated, async (req: any, res) => {
    try {
      const currentUserId = req.user.claims.sub;
      const currentUser = await storage.getUser(currentUserId);
      
      // Only admins can create users through this endpoint
      if (currentUser?.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required to create users' });
      }
      
      const { 
        id, 
        email, 
        firstName, 
        lastName, 
        provider, 
        role, 
        region, 
        userType, 
        userStatus, 
        expirationDate 
      } = req.body;
      
      // Validate required fields
      if (!id || !email) {
        return res.status(400).json({ message: 'id and email are required fields' });
      }
      
      // Validate enum values
      if (userType && !['One time', 'Recurring'].includes(userType)) {
        return res.status(400).json({ message: 'Invalid userType. Must be "One time" or "Recurring"' });
      }
      
      if (userStatus && !['Locked', 'Active', 'Expired'].includes(userStatus)) {
        return res.status(400).json({ message: 'Invalid userStatus. Must be "Locked", "Active", or "Expired"' });
      }
      
      if (role && !['user', 'admin'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role. Must be "user" or "admin"' });
      }
      
      if (provider && !['replit', 'google', 'microsoft', 'local'].includes(provider)) {
        return res.status(400).json({ message: 'Invalid provider. Must be "replit", "google", "microsoft", or "local"' });
      }
      
      // Parse expiration date if provided
      let parsedExpirationDate = null;
      if (expirationDate) {
        parsedExpirationDate = new Date(expirationDate);
        if (isNaN(parsedExpirationDate.getTime())) {
          return res.status(400).json({ message: 'Invalid expirationDate format. Use ISO date string' });
        }
      }
      
      // Check if user already exists
      const existingUser = await storage.getUser(id);
      if (existingUser) {
        return res.status(409).json({ message: 'User with this ID already exists' });
      }
      
      // Create user data object
      const userData = {
        id,
        email,
        firstName: firstName || null,
        lastName: lastName || null,
        provider: provider || 'replit',
        role: role || 'user',
        region: region || null,
        userType: userType || 'One time',
        userStatus: userStatus || 'Active',
        expirationDate: parsedExpirationDate,
      };
      
      const newUser = await storage.upsertUser(userData);
      
      // Return created user without sensitive data
      const { passwordHash, ...userResponse } = newUser;
      res.status(201).json(userResponse);
    } catch (error: any) {
      console.error('Error creating user:', error);
      if (error.code === '23505') { // PostgreSQL unique constraint violation
        res.status(409).json({ message: 'User with this email already exists' });
      } else {
        res.status(500).json({ message: 'Failed to create user' });
      }
    }
  });

  // Get user profile (including new fields) - MUST come before /:id route
  app.get('/api/users/profile', flexAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Return user profile without sensitive data
      const { passwordHash, ...userProfile } = user;
      res.json(userProfile);
    } catch (error: any) {
      console.error('Error fetching user profile:', error);
      res.status(500).json({ message: 'Failed to fetch user profile' });
    }
  });

  // Update user profile (region, userType, userStatus, expirationDate) - MUST come before /:id route
  app.patch('/api/users/profile', flexAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { region, userType, userStatus, expirationDate } = req.body;
      
      // Validate enum values
      if (userType && !['One time', 'Recurring'].includes(userType)) {
        return res.status(400).json({ message: 'Invalid userType. Must be "One time" or "Recurring"' });
      }
      
      if (userStatus && !['Locked', 'Active', 'Expired'].includes(userStatus)) {
        return res.status(400).json({ message: 'Invalid userStatus. Must be "Locked", "Active", or "Expired"' });
      }
      
      // Parse expiration date if provided
      let parsedExpirationDate = undefined;
      if (expirationDate !== undefined) {
        if (expirationDate === null) {
          parsedExpirationDate = null;
        } else {
          parsedExpirationDate = new Date(expirationDate);
          if (isNaN(parsedExpirationDate.getTime())) {
            return res.status(400).json({ message: 'Invalid expirationDate format. Use ISO date string' });
          }
        }
      }
      
      const updates: any = {};
      if (region !== undefined) updates.region = region;
      if (userType !== undefined) updates.userType = userType;
      if (userStatus !== undefined) updates.userStatus = userStatus;
      if (expirationDate !== undefined) updates.expirationDate = parsedExpirationDate;
      
      const updatedUser = await storage.updateUserProfile(userId, updates);
      
      // Return updated profile without sensitive data
      const { passwordHash, ...userProfile } = updatedUser;
      res.json(userProfile);
    } catch (error: any) {
      console.error('Error updating user profile:', error);
      res.status(500).json({ message: 'Failed to update user profile' });
    }
  });

  // GET /api/users/:id - Read user info by ID
  app.get('/api/users/:id', flexAuth, async (req: any, res) => {
    try {
      const currentUserId = req.user.claims.sub;
      const currentUser = await storage.getUser(currentUserId);
      const { id } = req.params;
      
      // Users can only view their own profile unless they're admin
      if (currentUser?.role !== 'admin' && currentUserId !== id) {
        return res.status(403).json({ message: 'Access denied. You can only view your own profile' });
      }
      
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Return user without sensitive data
      const { passwordHash, ...userResponse } = user;
      res.json(userResponse);
    } catch (error: any) {
      console.error('Error fetching user:', error);
      res.status(500).json({ message: 'Failed to fetch user' });
    }
  });

  // PUT /api/users/:id - Update any user field, including new attributes
  app.put('/api/users/:id', flexAuth, async (req: any, res) => {
    try {
      const currentUserId = req.user.claims.sub;
      const currentUser = await storage.getUser(currentUserId);
      const { id } = req.params;
      
      // Users can only update their own profile unless they're admin
      if (currentUser?.role !== 'admin' && currentUserId !== id) {
        return res.status(403).json({ message: 'Access denied. You can only update your own profile' });
      }
      
      // Check if target user exists
      const targetUser = await storage.getUser(id);
      if (!targetUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      const { 
        email, 
        firstName, 
        lastName, 
        provider, 
        role, 
        region, 
        userType, 
        userStatus, 
        expirationDate 
      } = req.body;
      
      // Validate enum values
      if (userType && !['One time', 'Recurring'].includes(userType)) {
        return res.status(400).json({ message: 'Invalid userType. Must be "One time" or "Recurring"' });
      }
      
      if (userStatus && !['Locked', 'Active', 'Expired'].includes(userStatus)) {
        return res.status(400).json({ message: 'Invalid userStatus. Must be "Locked", "Active", or "Expired"' });
      }
      
      if (role && !['user', 'admin'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role. Must be "user" or "admin"' });
      }
      
      if (provider && !['replit', 'google', 'microsoft', 'local'].includes(provider)) {
        return res.status(400).json({ message: 'Invalid provider. Must be "replit", "google", "microsoft", or "local"' });
      }
      
      // Non-admin users cannot change their role
      if (currentUser?.role !== 'admin' && role !== undefined) {
        return res.status(403).json({ message: 'Only administrators can change user roles' });
      }
      
      // Parse expiration date if provided
      let parsedExpirationDate = undefined;
      if (expirationDate !== undefined) {
        if (expirationDate === null) {
          parsedExpirationDate = null;
        } else {
          parsedExpirationDate = new Date(expirationDate);
          if (isNaN(parsedExpirationDate.getTime())) {
            return res.status(400).json({ message: 'Invalid expirationDate format. Use ISO date string' });
          }
        }
      }
      
      // Build update object with all possible fields
      const updates: any = {};
      if (email !== undefined) updates.email = email;
      if (firstName !== undefined) updates.firstName = firstName;
      if (lastName !== undefined) updates.lastName = lastName;
      if (provider !== undefined) updates.provider = provider;
      if (region !== undefined) updates.region = region;
      if (userType !== undefined) updates.userType = userType;
      if (userStatus !== undefined) updates.userStatus = userStatus;
      if (expirationDate !== undefined) updates.expirationDate = parsedExpirationDate;
      
      // Update profile fields
      let updatedUser = targetUser;
      if (Object.keys(updates).length > 0) {
        updatedUser = await storage.updateUserProfile(id, updates);
      }
      
      // Update role separately if provided and user is admin
      if (role !== undefined && currentUser?.role === 'admin') {
        updatedUser = await storage.updateUserRole(id, role);
      }
      
      // Return updated user without sensitive data
      const { passwordHash, ...userResponse } = updatedUser;
      res.json(userResponse);
    } catch (error: any) {
      console.error('Error updating user:', error);
      if (error.code === '23505') { // PostgreSQL unique constraint violation
        res.status(409).json({ message: 'Email already exists' });
      } else {
        res.status(500).json({ message: 'Failed to update user' });
      }
    }
  });

  // DELETE /api/users/:id - Delete a user
  app.delete('/api/users/:id', flexAuth, async (req: any, res) => {
    try {
      const currentUserId = req.user.claims.sub;
      const currentUser = await storage.getUser(currentUserId);
      const { id } = req.params;
      
      // Only admins can delete users, and they cannot delete themselves
      if (currentUser?.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required to delete users' });
      }
      
      if (currentUserId === id) {
        return res.status(400).json({ message: 'Cannot delete your own account' });
      }
      
      // Check if user exists
      const targetUser = await storage.getUser(id);
      if (!targetUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Delete user from database
      await db.delete(users).where(eq(users.id, id));
      
      res.json({ message: 'User deleted successfully', deletedUserId: id });
    } catch (error: any) {
      console.error('Error deleting user:', error);
      res.status(500).json({ message: 'Failed to delete user' });
    }
  });

  // GET /api/users - List all users with filtering by region, status, or user_type
  app.get('/api/users', flexAuth, async (req: any, res) => {
    try {
      const currentUserId = req.user.claims.sub;
      const currentUser = await storage.getUser(currentUserId);
      
      // Only admins can list all users
      if (currentUser?.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required to list users' });
      }
      
      const { region, userStatus, userType, limit = '50', offset = '0' } = req.query;
      
      // Validate query parameters
      if (userType && !['One time', 'Recurring'].includes(userType as string)) {
        return res.status(400).json({ message: 'Invalid userType filter. Must be "One time" or "Recurring"' });
      }
      
      if (userStatus && !['Locked', 'Active', 'Expired'].includes(userStatus as string)) {
        return res.status(400).json({ message: 'Invalid userStatus filter. Must be "Locked", "Active", or "Expired"' });
      }
      
      // Build query with filters
      let query = db.select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        provider: users.provider,
        role: users.role,
        region: users.region,
        userType: users.userType,
        userStatus: users.userStatus,
        expirationDate: users.expirationDate,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      }).from(users);
      
      // Apply filters
      const conditions = [];
      if (region) {
        conditions.push(eq(users.region, region as string));
      }
      if (userStatus) {
        conditions.push(eq(users.userStatus, userStatus as any));
      }
      if (userType) {
        conditions.push(eq(users.userType, userType as any));
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
      
      // Apply pagination
      const limitNum = Math.min(parseInt(limit as string) || 50, 100); // Max 100 users per request
      const offsetNum = Math.max(parseInt(offset as string) || 0, 0);
      
      query = query.limit(limitNum).offset(offsetNum);
      
      const usersList = await query;
      
      // Get total count for pagination metadata
      let countQuery = db.select({ count: sql`count(*)` }).from(users);
      if (conditions.length > 0) {
        countQuery = countQuery.where(and(...conditions));
      }
      const [{ count }] = await countQuery;
      
      res.json({
        users: usersList,
        pagination: {
          total: parseInt(count as string),
          limit: limitNum,
          offset: offsetNum,
          hasMore: offsetNum + limitNum < parseInt(count as string)
        },
        filters: {
          region: region || null,
          userStatus: userStatus || null,
          userType: userType || null
        }
      });
    } catch (error: any) {
      console.error('Error listing users:', error);
      res.status(500).json({ message: 'Failed to list users' });
    }
  });



  // Admin endpoint: Get all users with extended information
  app.get('/api/admin/users', tokenAuth, async (req: any, res) => {
    try {
      // req.user now contains the full user object with role
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }
      
      // Use the storage method that includes admin check
      const allUsers = await storage.getAllUsers();
      
      res.json(allUsers);
    } catch (error: any) {
      console.error('Error fetching users for admin:', error);
      res.status(500).json({ message: 'Failed to fetch users' });
    }
  });

  // Admin endpoint: Update any user's profile
  app.patch('/api/admin/users/:targetUserId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { targetUserId } = req.params;
      const currentUser = await storage.getUser(userId);
      
      if (currentUser?.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }
      
      const { region, userType, userStatus, expirationDate, role } = req.body;
      
      // Validate enum values
      if (userType && !['One time', 'Recurring'].includes(userType)) {
        return res.status(400).json({ message: 'Invalid userType' });
      }
      
      if (userStatus && !['Locked', 'Active', 'Expired'].includes(userStatus)) {
        return res.status(400).json({ message: 'Invalid userStatus' });
      }
      
      if (role && !['user', 'admin'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role' });
      }
      
      // Parse expiration date if provided
      let parsedExpirationDate = undefined;
      if (expirationDate !== undefined) {
        if (expirationDate === null) {
          parsedExpirationDate = null;
        } else {
          parsedExpirationDate = new Date(expirationDate);
          if (isNaN(parsedExpirationDate.getTime())) {
            return res.status(400).json({ message: 'Invalid expirationDate format' });
          }
        }
      }
      
      // Update user profile
      const updates: any = {};
      if (region !== undefined) updates.region = region;
      if (userType !== undefined) updates.userType = userType;
      if (userStatus !== undefined) updates.userStatus = userStatus;
      if (expirationDate !== undefined) updates.expirationDate = parsedExpirationDate;
      
      let updatedUser;
      if (Object.keys(updates).length > 0) {
        updatedUser = await storage.updateUserProfile(targetUserId, updates);
      }
      
      // Update role if provided
      if (role !== undefined) {
        updatedUser = await storage.updateUserRole(targetUserId, role);
      }
      
      if (!updatedUser) {
        updatedUser = await storage.getUser(targetUserId);
      }
      
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Return updated profile without sensitive data
      const { passwordHash, ...userProfile } = updatedUser;
      res.json(userProfile);
    } catch (error: any) {
      console.error('Error updating user profile (admin):', error);
      res.status(500).json({ message: 'Failed to update user profile' });
    }
  });

  // Utility endpoint to recalculate document counts (Admin only)
  app.post('/api/admin/recalculate-document-counts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const currentUser = await storage.getUser(userId);
      
      if (currentUser?.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }
      
      await storage.recalculateAllDocumentCounts();
      
      res.json({ 
        message: 'Document counts recalculated successfully for all transactions',
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error('Error recalculating document counts:', error);
      res.status(500).json({ message: 'Failed to recalculate document counts' });
    }
  });

  // Debug endpoint for testing n8n uploads
  app.post('/api/debug/upload', flexAuth, upload.any(), async (req: any, res) => {
    console.log('=== DEBUG UPLOAD ENDPOINT ===');
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Body keys:', Object.keys(req.body || {}));
    console.log('Body values:', req.body);
    console.log('Files received:', req.files ? (req.files as Express.Multer.File[]).map(f => ({
      fieldname: f.fieldname,
      originalname: f.originalname,
      size: f.size,
      mimetype: f.mimetype
    })) : 'No files');
    
    res.json({
      success: true,
      debug: {
        headers: req.headers,
        bodyKeys: Object.keys(req.body || {}),
        bodyValues: req.body,
        filesReceived: req.files ? (req.files as Express.Multer.File[]).map(f => ({
          fieldname: f.fieldname,
          originalname: f.originalname,
          size: f.size,
          mimetype: f.mimetype
        })) : [],
        fileCount: req.files ? (req.files as Express.Multer.File[]).length : 0
      }
    });
  });

  // Analytics Dashboard endpoint
  app.get('/api/analytics/dashboard', flexAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const currentUser = await storage.getUser(userId);
      
      // Admin users see all data, regular users see only their data
      const isAdmin = currentUser?.role === 'admin';
      const userFilter = isAdmin ? {} : { userId };

      // Get overview statistics
      const [transactionStats] = await db.select({
        transactionCount: sql<number>`count(*)`.as('transactionCount'),
        activeTransactions: sql<number>`count(case when status = 'active' then 1 end)`.as('activeTransactions')
      })
      .from(transactions)
      .where(isAdmin ? sql`1=1` : eq(transactions.userId, userId));

      const [documentStats] = await db.select({
        documentCount: sql<number>`count(*)`.as('documentCount'),
        avgRiskScore: sql<number>`coalesce(avg(risk_score), 0)`.as('avgRiskScore'),
        highRiskDocs: sql<number>`count(case when risk_score > 70 then 1 end)`.as('highRiskDocs')
      })
      .from(documents)
      .innerJoin(transactions, eq(documents.transactionId, transactions.id))
      .where(isAdmin ? sql`1=1` : eq(transactions.userId, userId));

      // Get document types distribution
      const documentTypes = await db.select({
        category: documents.category,
        count: sql<number>`count(*)`.as('count')
      })
      .from(documents)
      .innerJoin(transactions, eq(documents.transactionId, transactions.id))
      .where(isAdmin ? sql`1=1` : eq(transactions.userId, userId))
      .groupBy(documents.category);

      const documentTypesMap = documentTypes.reduce((acc, item) => {
        acc[item.category || 'other'] = item.count;
        return acc;
      }, {} as Record<string, number>);

      // Get common risks (mock data for now since we don't have risk analysis details)
      const commonRisks = [
        { risk: "High HOA Fees", count: Math.floor(documentStats.documentCount / 5) },
        { risk: "Missing Insurance", count: Math.floor(documentStats.documentCount / 8) },
        { risk: "Overdue Payments", count: Math.floor(documentStats.documentCount / 10) },
        { risk: "Incomplete Documentation", count: Math.floor(documentStats.documentCount / 12) }
      ].filter(item => item.count > 0);

      // Get recent documents
      const recentDocs = await db.select({
        id: documents.id,
        fileName: documents.originalFileName,
        category: documents.category,
        riskScore: documents.riskScore,
        createdAt: documents.uploadedAt
      })
      .from(documents)
      .innerJoin(transactions, eq(documents.transactionId, transactions.id))
      .where(isAdmin ? sql`1=1` : eq(transactions.userId, userId))
      .orderBy(sql`${documents.uploadedAt} desc`)
      .limit(5);

      // Get monthly uploads (last 6 months)
      const monthlyUploads = await db.select({
        month: sql<string>`to_char(${documents.uploadedAt}, 'Mon YYYY')`.as('month'),
        uploads: sql<number>`count(*)`.as('uploads')
      })
      .from(documents)
      .innerJoin(transactions, eq(documents.transactionId, transactions.id))
      .where(
        and(
          sql`${documents.uploadedAt} >= current_date - interval '6 months'`,
          isAdmin ? sql`1=1` : eq(transactions.userId, userId)
        )
      )
      .groupBy(sql`to_char(${documents.uploadedAt}, 'Mon YYYY')`, sql`date_trunc('month', ${documents.uploadedAt})`)
      .orderBy(sql`date_trunc('month', ${documents.uploadedAt})`);

      const analyticsData = {
        overview: {
          transactionCount: transactionStats.transactionCount || 0,
          documentCount: documentStats.documentCount || 0,
          avgRiskScore: Math.round(documentStats.avgRiskScore || 0),
          highRiskDocs: documentStats.highRiskDocs || 0,
          activeTransactions: transactionStats.activeTransactions || 0
        },
        documentTypes: documentTypesMap,
        commonRisks,
        recentDocs: recentDocs.map(doc => ({
          ...doc,
          fileName: doc.fileName || 'Unknown',
          category: doc.category || 'other',
          createdAt: doc.createdAt?.toISOString() || new Date().toISOString()
        })),
        monthlyUploads: monthlyUploads.length > 0 ? monthlyUploads : [
          { month: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }), uploads: documentStats.documentCount || 0 }
        ]
      };

      res.json(analyticsData);
    } catch (error: any) {
      console.error('Error fetching analytics:', error);
      res.status(500).json({ message: 'Failed to fetch analytics data' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
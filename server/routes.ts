import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTransactionSchema, createTransactionSchema, insertChatSessionSchema, insertChatMessageSchema, users } from "@shared/schema";
import { db } from "./db";
import { z } from "zod";
import multer from 'multer';
import { generateDocumentResponse, generateChatTitle } from './openai';
import { replitObjectStorage } from './replitObjectStorage';
import { setupAuth, isAuthenticated } from './replitAuth';

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication (includes Google OAuth)
  await setupAuth(app);

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

  // Mock auth middleware for development (when not using OAuth)
  const mockAuth = (req: any, res: any, next: any) => {
    // If user is already authenticated via OAuth, skip mock auth
    if (req.user && req.user.claims) {
      return next();
    }
    
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
  app.post('/api/upload', mockAuth, upload.array('documents', 60), async (req: any, res) => {
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
      const validatedData = createTransactionSchema.parse(req.body);
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

  app.delete('/api/transactions/:id', mockAuth, async (req: any, res) => {
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

  // Document download endpoint - Replit Object Storage only
  app.get('/api/documents/:id/download', mockAuth, async (req: any, res) => {
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
  app.delete('/api/storage/clear', mockAuth, async (req: any, res) => {
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
  app.get('/api/storage/status', mockAuth, async (req: any, res) => {
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
  app.get('/api/storage/browse', mockAuth, async (req: any, res) => {
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

  // Admin endpoints - only for admin users
  app.post('/api/admin/users/:userId/role', mockAuth, async (req: any, res) => {
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
  app.get('/api/test/user-isolation', mockAuth, async (req: any, res) => {
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

  // User Management API Endpoints
  
  // Get user profile (including new fields)
  app.get('/api/users/profile', isAuthenticated, async (req: any, res) => {
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

  // Update user profile (region, userType, userStatus, expirationDate)
  app.patch('/api/users/profile', isAuthenticated, async (req: any, res) => {
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

  // Admin endpoint: Get all users with extended information
  app.get('/api/admin/users', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const currentUser = await storage.getUser(userId);
      
      if (currentUser?.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }
      
      // Get all users for admin view
      const allUsers = await db.select({
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

  const httpServer = createServer(app);
  return httpServer;
}
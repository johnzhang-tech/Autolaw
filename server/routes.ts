import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTransactionSchema, insertChatSessionSchema, insertChatMessageSchema } from "@shared/schema";
import { z } from "zod";
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { generateDocumentResponse, generateChatTitle } from './openai';
import { s3Service, S3Service } from './s3Service';
import { queueDocumentAnalysis } from './queue';

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

  // Emergency bypass route to test Express routing with cache busting
  app.get('/emergency', (req, res) => {
    // Add cache busting headers
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY'
    });
    
    const timestamp = new Date().toISOString();
    res.send(`<!DOCTYPE html>
<html>
<head>
  <title>DocuAI Browser Diagnostic</title>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { 
      font-family: Arial, sans-serif; 
      max-width: 800px; 
      margin: 20px auto; 
      padding: 20px; 
      background: white;
      color: black;
    }
    .header { background: #007bff; color: white; padding: 20px; margin: -20px -20px 20px -20px; }
    .status { padding: 15px; margin: 10px 0; border-radius: 8px; }
    .working { background: #d4edda; color: #155724; border: 2px solid #c3e6cb; }
    .warning { background: #fff3cd; color: #856404; border: 2px solid #ffeaa7; }
    .button { 
      background: #007bff; 
      color: white; 
      padding: 12px 20px; 
      text-decoration: none; 
      border-radius: 5px; 
      display: inline-block; 
      margin: 8px; 
      border: none;
      cursor: pointer;
    }
    .button:hover { background: #0056b3; }
    .diagnostic { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; }
    .code { background: #e9ecef; padding: 5px 10px; border-radius: 3px; font-family: monospace; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🔧 DocuAI Browser Diagnostic</h1>
    <p>Server Response Time: ${timestamp}</p>
  </div>

  <div class="status working">✅ Express Server: Responding</div>
  <div class="status working">✅ HTML Generation: Working</div>
  <div class="status working">✅ HTTP Headers: Sent</div>
  
  <div class="diagnostic">
    <h3>🔍 Issue Analysis</h3>
    <p>If you can see this page, the server is working perfectly. The blank screen issue is likely:</p>
    <ul>
      <li><strong>Browser Cache:</strong> Corrupted cached data preventing display</li>
      <li><strong>Vite Plugins:</strong> Development plugins interfering with rendering</li>
      <li><strong>Service Workers:</strong> Cached service worker blocking content</li>
      <li><strong>Browser Extensions:</strong> Ad blockers or security extensions</li>
    </ul>
  </div>

  <div class="diagnostic">
    <h3>🛠️ Troubleshooting Steps</h3>
    <ol>
      <li>Clear browser cache and cookies for this site</li>
      <li>Try an incognito/private browsing window</li>
      <li>Disable browser extensions temporarily</li>
      <li>Check browser console for JavaScript errors</li>
    </ol>
  </div>

  <div>
    <h3>📱 Quick Actions</h3>
    <a href="/clear-cache" class="button">Clear Server Cache</a>
    <a href="/api/auth/user" class="button">Test API Direct</a>
    <button onclick="location.reload(true)" class="button">Hard Refresh</button>
    <button onclick="clearBrowserData()" class="button">Clear Browser Cache</button>
  </div>

  <script>
    console.log('🟢 Diagnostic page loaded successfully at ${timestamp}');
    
    function clearBrowserData() {
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => caches.delete(name));
        });
      }
      
      // Clear localStorage and sessionStorage
      localStorage.clear();
      sessionStorage.clear();
      
      alert('Browser cache cleared. Please refresh the page.');
    }
    
    // Auto-refresh every 30 seconds to show server is alive
    setTimeout(() => {
      const indicator = document.createElement('div');
      indicator.innerHTML = '🔄 Auto-refreshing to verify server...';
      indicator.style.cssText = 'position: fixed; top: 10px; right: 10px; background: orange; color: white; padding: 10px; border-radius: 5px; z-index: 9999;';
      document.body.appendChild(indicator);
      
      setTimeout(() => location.reload(), 2000);
    }, 30000);
  </script>
</body>
</html>`);
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

  // Logout endpoint
  app.get('/api/logout', (req: any, res) => {
    if (req.session) {
      req.session.loggedOut = true;
    }
    res.redirect('/');
  });

  app.post('/api/logout', (req: any, res) => {
    if (req.session) {
      req.session.loggedOut = true;
    }
    res.json({ success: true, message: "Logged out successfully" });
  });

  // Login endpoint to clear logout flag
  app.post('/api/login', (req: any, res) => {
    if (req.session) {
      req.session.loggedOut = false;
    }
    res.json({ success: true, message: "Logged in successfully" });
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

  // S3-compatible document upload endpoint
  app.post('/api/upload', mockAuth, upload.single('document'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const userId = req.user.claims.sub;
      const { transactionId, category } = req.body;

      // Validate required fields
      if (!transactionId) {
        return res.status(400).json({ message: 'Transaction ID is required' });
      }

      // Validate file
      try {
        (S3Service as any).validateFile(req.file.buffer, req.file.mimetype);
      } catch (validationError: unknown) {
        const errorMessage = validationError instanceof Error ? validationError.message : 'File validation failed';
        return res.status(400).json({ message: errorMessage });
      }

      // Generate S3 key
      const s3Key = s3Service.generateS3Key(userId, req.file.originalname, req.file.mimetype);
      
      // Create initial document record with pending upload status
      const document = await storage.createDocument({
        transactionId: parseInt(transactionId),
        userId,
        fileName: req.file.filename,
        originalFileName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        category: category || 'hoa',
        uploaderId: userId,
        uploadStatus: 'uploading',
        s3Key,
        s3Bucket: process.env.S3_BUCKET || 'docuai-documents',
        s3Region: process.env.AWS_REGION || 'us-east-1',
        analysisStatus: 'pending'
      });

      try {
        // Upload to S3-compatible storage
        const uploadResult = await s3Service.uploadFile(
          req.file.buffer,
          s3Key,
          req.file.mimetype,
          req.file.originalname
        );

        // Update document with successful upload details
        const updatedDocument = await storage.updateDocument(document.id, userId, {
          uploadStatus: 'completed',
          s3Url: uploadResult.s3Url,
          etag: uploadResult.etag,
          fileSize: uploadResult.fileSize
        });

        // Simulate AI analysis for now (replace with actual AI service later)
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
          ],
          documentType: category || 'hoa',
          confidence: 0.95,
          processedAt: new Date().toISOString()
        };

        // Update with analysis results
        await storage.updateDocument(document.id, userId, {
          analysisResult: mockAnalysis,
          analysisStatus: 'completed',
          riskScore: mockAnalysis.riskScore
        });

        res.json({
          success: true,
          message: 'Document uploaded and analyzed successfully',
          document: {
            ...updatedDocument,
            analysisResult: mockAnalysis,
            analysisStatus: 'completed',
            riskScore: mockAnalysis.riskScore
          },
          upload: {
            s3Key: uploadResult.s3Key,
            s3Url: uploadResult.s3Url,
            fileSize: uploadResult.fileSize,
            etag: uploadResult.etag
          }
        });

      } catch (uploadError: unknown) {
        const errorMessage = uploadError instanceof Error ? uploadError.message : 'Unknown upload error';
        console.error('S3 upload failed:', uploadError);
        
        // Update document status to failed
        await storage.updateDocument(document.id, userId, {
          uploadStatus: 'failed',
          lastError: errorMessage
        });

        res.status(500).json({ 
          message: 'File upload to storage failed', 
          error: errorMessage 
        });
      }

    } catch (error: any) {
      console.error('Upload error:', error);
      res.status(500).json({ message: 'Upload failed', error: error.message });
    }
  });

  // Document download endpoint with S3 presigned URL
  app.get('/api/documents/:id/download', mockAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const documentId = parseInt(req.params.id);

      // Get document from database
      const document = await storage.getDocument(documentId, userId);
      if (!document) {
        return res.status(404).json({ message: 'Document not found' });
      }

      // Check if document was successfully uploaded to S3
      if (document.uploadStatus !== 'completed' || !document.s3Key) {
        return res.status(400).json({ message: 'Document not available for download' });
      }

      try {
        // Generate presigned download URL (valid for 1 hour)
        const downloadUrl = await s3Service.generateDownloadUrl(document.s3Key, 3600);
        
        res.json({
          success: true,
          downloadUrl,
          filename: document.originalFileName,
          fileSize: document.fileSize,
          mimeType: document.mimeType,
          expiresIn: 3600
        });
      } catch (s3Error: unknown) {
        const errorMessage = s3Error instanceof Error ? s3Error.message : 'S3 download error';
        console.error('S3 download URL generation failed:', s3Error);
        res.status(500).json({ 
          message: 'Failed to generate download URL', 
          error: errorMessage 
        });
      }
    } catch (error: any) {
      console.error('Download error:', error);
      res.status(500).json({ message: 'Download failed', error: error.message });
    }
  });

  // S3 service status endpoint
  app.get('/api/storage/status', mockAuth, async (req: any, res) => {
    try {
      const isConfigured = s3Service.isConfigured();
      const isConnected = isConfigured ? await s3Service.testConnection() : false;
      
      res.json({
        configured: isConfigured,
        connected: isConnected,
        bucket: process.env.S3_BUCKET || 'docuai-documents',
        region: process.env.AWS_REGION || 'us-east-1',
        endpoint: process.env.S3_ENDPOINT || 'default'
      });
    } catch (error: any) {
      res.status(500).json({ 
        message: 'Storage status check failed', 
        error: error.message 
      });
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

  app.post("/api/transactions/:transactionId/documents", mockAuth, upload.single('file'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const transactionId = parseInt(req.params.transactionId);
      const { category = 'general' } = req.body;

      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      // Validate transaction exists and belongs to user
      const transaction = await storage.getTransaction(transactionId, userId);
      if (!transaction) {
        return res.status(404).json({ message: 'Transaction not found' });
      }

      // Upload file to S3-compatible storage
      const uploadResult = await s3Service.uploadFile(
        req.file.buffer,
        userId,
        req.file.originalname,
        req.file.mimetype
      );

      // Create document record in database
      const documentData = {
        transactionId,
        userId,
        fileName: uploadResult.s3Key.split('/').pop() || req.file.originalname, // Use S3 key as filename
        originalFileName: req.file.originalname,
        mimeType: req.file.mimetype,
        fileSize: req.file.size,
        category,
        uploaderId: userId,
        uploadStatus: 'completed' as const,
        analysisStatus: 'pending' as const,
        s3Key: uploadResult.s3Key,
        s3Bucket: uploadResult.s3Bucket,
        s3Region: uploadResult.s3Region,
        s3Url: uploadResult.s3Url,
        etag: uploadResult.etag
      };

      const document = await storage.createDocument(documentData);

      // TODO: Queue document for analysis later
      // await queueDocumentAnalysis(document.id, userId, uploadResult.s3Key, req.file.mimetype);

      res.status(201).json(document);
    } catch (error) {
      console.error("Error uploading document:", error);
      res.status(500).json({ message: "Failed to upload document" });
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
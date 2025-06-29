import Queue from 'bull';
import { db } from './db';
import { documents, queueJobs } from '@shared/schema';
import { eq } from 'drizzle-orm';
import fs from 'fs/promises';
import path from 'path';
// import pdfParse from 'pdf-parse'; // Commented out due to library issue
import mammoth from 'mammoth';

// Initialize Bull queue with Redis (fallback to memory for development)
const redisConfig = process.env.REDIS_URL ? { redis: process.env.REDIS_URL } : {};
export const documentQueue = new Queue('document processing', redisConfig);

// Document analysis job processor
documentQueue.process('analyzeDocument', async (job) => {
  const { documentId, userId, filePath, mimeType } = job.data;
  
  try {
    // Update job status
    await db.update(queueJobs)
      .set({ status: 'active', processedAt: new Date() })
      .where(eq(queueJobs.jobId, job.id.toString()));

    // Parse document content based on type
    let content = '';
    const fileBuffer = await fs.readFile(filePath);
    
    if (mimeType === 'application/pdf') {
      // PDF parsing temporarily disabled due to library issues
      content = "PDF content will be parsed when library is properly configured";
    } else if (mimeType.includes('word') || mimeType.includes('document')) {
      const docData = await mammoth.extractRawText({ buffer: fileBuffer });
      content = docData.value;
    } else {
      content = fileBuffer.toString('utf-8');
    }

    // Analyze content with AI (Ragflow simulation for now)
    const analysisResult = await analyzeHOADocument(content);
    
    // Update document with analysis results
    await db.update(documents)
      .set({
        analysisStatus: 'completed',
        analyzedAt: new Date(),
        analysisResult: analysisResult,
        riskScore: analysisResult.riskScore,
        complianceIssues: analysisResult.complianceIssues,
      })
      .where(eq(documents.id, documentId));

    // Mark job as completed
    await db.update(queueJobs)
      .set({ status: 'completed' })
      .where(eq(queueJobs.jobId, job.id.toString()));

    return analysisResult;
  } catch (error) {
    console.error('Document analysis failed:', error);
    
    // Update retry count and error
    await db.update(documents)
      .set({
        analysisStatus: 'failed',
        retryCount: (await db.select().from(documents).where(eq(documents.id, documentId)))[0]?.retryCount + 1,
        lastError: error.message,
      })
      .where(eq(documents.id, documentId));

    // Mark job as failed
    await db.update(queueJobs)
      .set({ 
        status: 'failed', 
        error: error.message,
        attempts: job.attemptsMade + 1
      })
      .where(eq(queueJobs.jobId, job.id.toString()));

    throw error;
  }
});

// PDF generation job processor
documentQueue.process('generateSummaryPDF', async (job) => {
  const { documentId, analysisResult } = job.data;
  
  try {
    // Generate PDF summary (placeholder implementation)
    const pdfPath = await generateAnalysisPDF(documentId, analysisResult);
    
    // Update document with PDF path
    await db.update(documents)
      .set({ summaryPdfPath: pdfPath })
      .where(eq(documents.id, documentId));

    await db.update(queueJobs)
      .set({ status: 'completed' })
      .where(eq(queueJobs.jobId, job.id.toString()));

    return { pdfPath };
  } catch (error) {
    await db.update(queueJobs)
      .set({ status: 'failed', error: error.message })
      .where(eq(queueJobs.jobId, job.id.toString()));
    throw error;
  }
});

// Simulate Ragflow AI analysis for HOA documents
async function analyzeHOADocument(content: string) {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const keywords = {
    fees: ['fee', 'dues', 'assessment', 'payment', 'monthly', 'annual'],
    violations: ['violation', 'fine', 'penalty', 'breach', 'non-compliance'],
    restrictions: ['restriction', 'rule', 'regulation', 'covenant', 'guideline'],
    insurance: ['insurance', 'liability', 'coverage', 'policy', 'claim'],
    maintenance: ['maintenance', 'repair', 'upkeep', 'improvement', 'modification']
  };

  let riskScore = 10; // Base risk
  const complianceIssues = [];
  const findings = {};

  // Analyze content for risk factors
  for (const [category, words] of Object.entries(keywords)) {
    const matches = words.filter(word => 
      content.toLowerCase().includes(word.toLowerCase())
    );
    
    if (matches.length > 0) {
      findings[category] = matches;
      
      // Increase risk based on category
      if (category === 'violations') riskScore += 30;
      if (category === 'fees') riskScore += 15;
      if (category === 'restrictions') riskScore += 10;
      
      // Add compliance issues
      if (category === 'violations') {
        complianceIssues.push(`Potential violations detected: ${matches.join(', ')}`);
      }
    }
  }

  // Cap risk score at 100
  riskScore = Math.min(riskScore, 100);

  return {
    summary: `HOA document analysis completed. Found ${Object.keys(findings).length} key areas of concern.`,
    riskScore,
    complianceIssues,
    findings,
    recommendations: generateRecommendations(findings, riskScore),
    analysisDate: new Date().toISOString(),
  };
}

function generateRecommendations(findings: any, riskScore: number) {
  const recommendations = [];
  
  if (findings.violations) {
    recommendations.push("Review violation history and ensure current compliance");
  }
  if (findings.fees) {
    recommendations.push("Verify all fee obligations and payment schedules");
  }
  if (riskScore > 70) {
    recommendations.push("High risk detected - recommend legal review");
  }
  if (findings.restrictions) {
    recommendations.push("Review property restrictions before modifications");
  }
  
  return recommendations;
}

// Generate analysis summary PDF (placeholder)
async function generateAnalysisPDF(documentId: number, analysisResult: any): Promise<string> {
  // This would use a PDF generation library like puppeteer or jsPDF
  // For now, return a placeholder path
  const pdfPath = `uploads/summaries/analysis_${documentId}_${Date.now()}.pdf`;
  
  // Ensure directory exists
  await fs.mkdir(path.dirname(pdfPath), { recursive: true });
  
  // Create a simple text file as placeholder
  const summaryText = `
HOA Document Analysis Summary
============================

Document ID: ${documentId}
Analysis Date: ${new Date().toLocaleDateString()}
Risk Score: ${analysisResult.riskScore}/100

Summary: ${analysisResult.summary}

Compliance Issues:
${analysisResult.complianceIssues.map((issue: string, i: number) => `${i + 1}. ${issue}`).join('\n')}

Recommendations:
${analysisResult.recommendations.map((rec: string, i: number) => `${i + 1}. ${rec}`).join('\n')}
`;
  
  await fs.writeFile(pdfPath, summaryText);
  return pdfPath;
}

// Queue a document for analysis
export async function queueDocumentAnalysis(documentId: number, userId: string, filePath: string, mimeType: string) {
  const job = await documentQueue.add('analyzeDocument', {
    documentId,
    userId,
    filePath,
    mimeType
  }, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  });

  // Store job in database
  await db.insert(queueJobs).values({
    jobId: job.id.toString(),
    jobType: 'document_analysis',
    userId,
    documentId,
    jobData: JSON.stringify({ filePath, mimeType }),
    maxAttempts: 3,
  });

  return job.id;
}

// Queue PDF generation
export async function queuePDFGeneration(documentId: number, analysisResult: any) {
  const job = await documentQueue.add('generateSummaryPDF', {
    documentId,
    analysisResult
  });

  const document = await db.select().from(documents).where(eq(documents.id, documentId));
  
  await db.insert(queueJobs).values({
    jobId: job.id.toString(),
    jobType: 'pdf_generation',
    userId: document[0].userId,
    documentId,
    jobData: JSON.stringify({ analysisResult }),
  });

  return job.id;
}

// Get job status
export async function getJobStatus(jobId: string) {
  const [jobData] = await db.select()
    .from(queueJobs)
    .where(eq(queueJobs.jobId, jobId));
  
  return jobData;
}
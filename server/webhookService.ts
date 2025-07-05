import { replitObjectStorage } from './replitObjectStorage';
import type { Transaction, Document, User } from '@shared/schema';

interface WebhookConfig {
  url: string;
  secret?: string;
  timeout?: number;
  retries?: number;
}

interface TransactionWebhookPayload {
  event: 'transaction_created';
  timestamp: string;
  transaction: {
    transaction_id: number;
    user_id: string;
    property_address: string;
    created_at: string;
    num_documents: number;
    status: string;
    address?: string;
    transaction_type: string;
  };
  user: {
    id: string;
    email?: string;
    firstName?: string;
    lastName?: string;
  };
  documents: Array<{
    id: number;
    fileName: string;
    originalFileName: string;
    fileSize: number;
    mimeType: string;
    category?: string;
    uploadedAt: string;
    downloadUrl: string;
    // Optional: include base64 for small files
    base64Content?: string;
  }>;
  metadata: {
    source: 'DocuAI';
    version: '1.0';
    webhook_id: string;
  };
}

class WebhookService {
  private config: WebhookConfig;
  
  constructor(config?: Partial<WebhookConfig>) {
    this.config = {
      url: process.env.N8N_WEBHOOK_URL || '',
      secret: process.env.N8N_WEBHOOK_SECRET || 'docuai-webhook-secret-2025',
      timeout: 10000, // 10 seconds
      retries: 3,
      ...config
    };
  }

  /**
   * Send webhook notification when transaction is created with documents
   */
  async onTransactionCreated(
    transaction: Transaction,
    user: User,
    documents: Document[]
  ): Promise<void> {
    if (!this.config.url) {
      console.warn('N8N_WEBHOOK_URL not configured, skipping webhook notification');
      return;
    }

    try {
      const payload = await this.buildTransactionPayload(transaction, user, documents);
      await this.sendWebhook(payload);
      console.log(`Webhook notification sent for transaction ${transaction.id}`);
    } catch (error) {
      console.error(`Failed to send webhook for transaction ${transaction.id}:`, error);
      // Don't throw - webhook failures shouldn't break the main transaction flow
    }
  }

  /**
   * Build the complete webhook payload
   */
  private async buildTransactionPayload(
    transaction: Transaction,
    user: User,
    documents: Document[]
  ): Promise<TransactionWebhookPayload> {
    const documentPayloads = await Promise.all(
      documents.map(async (doc) => {
        try {
          // Generate secure download URL (1 hour expiry)
          const downloadUrl = await replitObjectStorage.generateDownloadUrl(doc.s3Key || '');
          
          // For small text files, optionally include base64 content
          let base64Content: string | undefined;
          if (doc.fileSize < 1024 * 100 && // Only for files < 100KB
              (doc.mimeType?.includes('text') || doc.mimeType?.includes('json'))) {
            try {
              // Could fetch and encode content here if needed
              // base64Content = await this.getFileAsBase64(doc.s3Key);
            } catch (e) {
              // Ignore base64 errors
            }
          }

          return {
            id: doc.id,
            fileName: doc.fileName,
            originalFileName: doc.originalFileName,
            fileSize: doc.fileSize,
            mimeType: doc.mimeType,
            category: doc.category || undefined,
            uploadedAt: doc.uploadedAt?.toISOString() || new Date().toISOString(),
            downloadUrl,
            base64Content
          };
        } catch (error) {
          console.error(`Error processing document ${doc.id} for webhook:`, error);
          // Return basic info even if download URL fails
          return {
            id: doc.id,
            fileName: doc.fileName,
            originalFileName: doc.originalFileName,
            fileSize: doc.fileSize,
            mimeType: doc.mimeType,
            category: doc.category || undefined,
            uploadedAt: doc.uploadedAt?.toISOString() || new Date().toISOString(),
            downloadUrl: '', // Empty if generation failed
          };
        }
      })
    );

    return {
      event: 'transaction_created',
      timestamp: new Date().toISOString(),
      transaction: {
        transaction_id: transaction.id,
        user_id: transaction.userId,
        property_address: transaction.name, // Using name as property address
        created_at: transaction.createdAt?.toISOString() || new Date().toISOString(),
        num_documents: transaction.numDocuments || documents.length,
        status: transaction.status || 'active',
        address: transaction.address || undefined,
        transaction_type: transaction.transactionType,
      },
      user: {
        id: user.id,
        email: user.email || undefined,
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
      },
      documents: documentPayloads,
      metadata: {
        source: 'DocuAI',
        version: '1.0',
        webhook_id: `docuai_${transaction.id}_${Date.now()}`,
      }
    };
  }

  /**
   * Send HTTP POST request to webhook URL with retries
   */
  private async sendWebhook(payload: TransactionWebhookPayload): Promise<void> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'DocuAI-Webhook/1.0',
    };

    // Add security headers
    if (this.config.secret) {
      headers['X-Webhook-Secret'] = this.config.secret;
      headers['Authorization'] = `Bearer ${this.config.secret}`;
    }

    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.config.retries!; attempt++) {
      try {
        const response = await fetch(this.config.url, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(this.config.timeout!),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const responseText = await response.text();
        console.log(`Webhook delivered successfully (attempt ${attempt}):`, {
          status: response.status,
          response: responseText.substring(0, 200) // Log first 200 chars
        });
        
        return; // Success!
        
      } catch (error) {
        lastError = error as Error;
        console.error(`Webhook attempt ${attempt} failed:`, error);
        
        if (attempt < this.config.retries!) {
          // Exponential backoff: 1s, 2s, 4s
          const delay = Math.pow(2, attempt - 1) * 1000;
          console.log(`Retrying webhook in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw new Error(`Webhook failed after ${this.config.retries} attempts. Last error: ${lastError?.message}`);
  }

  /**
   * Test webhook connectivity
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    if (!this.config.url) {
      return { success: false, message: 'N8N_WEBHOOK_URL not configured' };
    }

    try {
      const testPayload = {
        event: 'test_connection',
        timestamp: new Date().toISOString(),
        message: 'DocuAI webhook connectivity test',
        source: 'DocuAI',
      };

      const response = await fetch(this.config.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Secret': this.config.secret || '',
          'User-Agent': 'DocuAI-Webhook-Test/1.0',
        },
        body: JSON.stringify(testPayload),
        signal: AbortSignal.timeout(5000),
      });

      if (response.ok) {
        return { success: true, message: `Connected successfully (HTTP ${response.status})` };
      } else {
        return { success: false, message: `HTTP ${response.status}: ${response.statusText}` };
      }
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  }

  /**
   * Get current webhook configuration (without secrets)
   */
  getConfig(): Omit<WebhookConfig, 'secret'> {
    return {
      url: this.config.url,
      timeout: this.config.timeout,
      retries: this.config.retries,
    };
  }

  /**
   * Update webhook configuration
   */
  updateConfig(newConfig: Partial<WebhookConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// Export singleton instance
export const webhookService = new WebhookService();

// Export types for external use
export type { TransactionWebhookPayload, WebhookConfig };
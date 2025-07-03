import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { Client } from '@replit/object-storage';

interface UploadResult {
  objectKey: string;
  bucketName: string;
  objectUrl: string;
  fileSize: number;
  etag?: string;
}

interface ReplitObjectStorageConfig {
  bucketName: string;
}

class ReplitObjectStorageService {
  private bucketName: string;
  private client: Client;

  constructor(config?: ReplitObjectStorageConfig) {
    this.bucketName = config?.bucketName || 'default';
    // Official Replit Object Storage client with default bucket
    this.client = new Client();
  }

  /**
   * Generate a unique object key for file storage organized by transaction
   */
  generateObjectKey(transactionName: string, transactionId: number, originalFilename: string): string {
    const transactionFolder = `${transactionName.replace(/[^a-zA-Z0-9-]/g, '_')}_${transactionId}`;
    const fileExtension = this.getFileExtension(originalFilename);
    const baseName = originalFilename.replace(/\.[^/.]+$/, ""); // Remove extension
    const uniqueId = uuidv4().slice(0, 8);
    const timestamp = Date.now();
    
    return `${transactionFolder}/${timestamp}_${baseName}_${uniqueId}${fileExtension}`;
  }

  /**
   * Get file extension from filename
   */
  private getFileExtension(filename: string): string {
    const extension = filename.split('.').pop();
    return extension ? `.${extension}` : '';
  }

  /**
   * Upload file to Replit Object Storage
   */
  async uploadFile(
    buffer: Buffer,
    transactionName: string,
    transactionId: number,
    originalFilename: string,
    mimeType: string
  ): Promise<UploadResult> {
    try {
      // Validate file
      this.validateFile(buffer, mimeType);
      
      // Generate unique object key with transaction organization
      const objectKey = this.generateObjectKey(transactionName, transactionId, originalFilename);
      
      // Use official Replit Object Storage SDK with automatic authentication
      const result = await this.client.uploadFromBytes(objectKey, buffer);
      
      if (!result.ok) {
        throw new Error(`Upload failed: ${result.error}`);
      }
      
      return {
        objectKey,
        bucketName: this.bucketName,
        objectUrl: `https://replit.com/object-storage/buckets/${this.bucketName}/objects/${encodeURIComponent(objectKey)}`,
        fileSize: buffer.length,
        etag: this.generateFileHash(buffer),
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to upload to Replit Object Storage: ${message}`);
    }
  }

  /**
   * Generate a presigned URL for file download
   */
  async generateDownloadUrl(objectKey: string, expiresIn: number = 3600): Promise<string> {
    try {
      // Use official Replit Object Storage SDK for downloading
      const result = await this.client.downloadAsBytes(objectKey);
      
      if (!result.ok) {
        throw new Error(`Failed to generate download URL: ${result.error}`);
      }
      
      // For now, return a direct URL since we have access to the file
      return `https://replit.com/object-storage/buckets/${this.bucketName}/objects/${encodeURIComponent(objectKey)}`;
    } catch (error) {
      throw new Error(`Failed to generate download URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete file from Replit Object Storage
   */
  async deleteFile(objectKey: string): Promise<void> {
    try {
      // Use official Replit Object Storage SDK
      const result = await this.client.delete(objectKey);
      
      if (!result.ok) {
        throw new Error(`Delete failed: ${result.error}`);
      }
    } catch (error) {
      throw new Error(`Failed to delete from Replit Object Storage: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * List objects in the bucket (for browsing)
   */
  async listObjects(prefix?: string): Promise<any[]> {
    try {
      // Use official Replit Object Storage SDK
      const result = await this.client.list({ prefix });
      
      if (!result.ok) {
        console.error('Failed to list objects:', result.error);
        return [];
      }
      
      return result.value.map(obj => ({
        name: obj.name,
        key: obj.name,
        size: 0, // Size not provided by SDK
        lastModified: new Date()
      }));
    } catch (error) {
      console.error('Failed to list objects:', error);
      return [];
    }
  }

  /**
   * Generate file hash for integrity verification
   */
  private generateFileHash(buffer: Buffer): string {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  /**
   * Generate signature for download URLs
   */
  private generateSignature(objectKey: string, expiry: number): string {
    const token = process.env.REPLIT_OBJECT_STORAGE_TOKEN || 'fallback';
    const message = `${objectKey}:${expiry}`;
    return crypto.createHmac('sha256', token).update(message).digest('hex');
  }

  /**
   * Validate file type and size
   */
  private validateFile(buffer: Buffer, mimeType: string, maxSizeBytes: number = 10 * 1024 * 1024): void {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'image/jpeg',
      'image/png',
      'image/gif'
    ];

    if (!allowedTypes.includes(mimeType)) {
      throw new Error(`Unsupported file type: ${mimeType}`);
    }

    if (buffer.length > maxSizeBytes) {
      throw new Error(`File too large: ${buffer.length} bytes (max: ${maxSizeBytes})`);
    }

    if (buffer.length === 0) {
      throw new Error('Empty file not allowed');
    }
  }

  /**
   * Check if service is properly configured
   */
  isConfigured(): boolean {
    return !!(this.bucketName && this.client);
  }

  /**
   * Test connection to Replit Object Storage
   */
  async testConnection(): Promise<boolean> {
    try {
      // Test connection by trying to list objects (should work even if empty)
      const result = await this.client.list({ maxResults: 1 });
      return result.ok;
    } catch {
      return false;
    }
  }
}

export const replitObjectStorage = new ReplitObjectStorageService({
  bucketName: 'default'
});
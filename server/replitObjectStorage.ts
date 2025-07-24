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
  public client: Client; // Make client public for direct access in routes

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
    
    // Keep original filename without any suffixes - just clean special characters
    const cleanFilename = originalFilename.replace(/[^a-zA-Z0-9.-]/g, '_');
    return `${transactionFolder}/${cleanFilename}`;
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
   * WORKAROUND: SDK v1.0.0 has a bug where uploadFromBytes/downloadAsBytes only stores/returns 1 byte
   * Using uploadFromText with base64 encoding as a workaround
   */
  async uploadFile(
    buffer: Buffer,
    transactionName: string,
    transactionId: number,
    originalFilename: string,
    mimeType: string
  ): Promise<UploadResult> {
    try {
      console.log(`ReplitObjectStorage.uploadFile called with:`, {
        bufferLength: buffer.length,
        transactionName,
        transactionId,
        originalFilename,
        mimeType
      });
      
      // Validate file
      this.validateFile(buffer, mimeType);
      console.log(`File validation passed`);
      
      // Generate unique object key with transaction organization
      const objectKey = this.generateObjectKey(transactionName, transactionId, originalFilename);
      console.log(`Generated objectKey: ${objectKey}`);
      
      // WORKAROUND: Use uploadFromText with base64 encoding due to SDK bug
      console.log(`Encoding buffer as base64 to work around SDK bug...`);
      const base64Content = buffer.toString('base64');
      const result = await this.client.uploadFromText(objectKey, base64Content);
      console.log(`client.uploadFromText result: ok=${result.ok}, error=${result.error}`);
      
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
      console.log(`Generating download URL for object key: ${objectKey}`);
      
      // Check if file exists first by attempting to download
      const result = await this.client.downloadAsBytes(objectKey);
      
      if (!result.ok) {
        console.error('Replit Object Storage file not found:', result.error);
        throw new Error(`File not found in storage: ${JSON.stringify(result.error)}`);
      }
      
      // For Replit Object Storage, return a direct API endpoint that serves the file
      // This bypasses the presigned URL requirement and serves files directly through our API
      console.log(`File exists in storage, returning API download endpoint for ${objectKey}`);
      return `/api/storage/download/${encodeURIComponent(objectKey)}`;
    } catch (error) {
      console.error('Error in generateDownloadUrl:', error);
      const errorMessage = error instanceof Error ? error.message : `Unknown error: ${JSON.stringify(error)}`;
      throw new Error(`Failed to generate download URL: ${errorMessage}`);
    }
  }

  /**
   * Delete file from Replit Object Storage
   */
  async deleteFile(objectKey: string): Promise<void> {
    try {
      console.log(`Deleting file from storage: ${objectKey}`);
      
      // Use official Replit Object Storage SDK
      const result = await this.client.delete(objectKey);
      
      if (!result.ok) {
        console.error('Delete operation failed:', result.error);
        throw new Error(`Delete failed: ${JSON.stringify(result.error)}`);
      }
      
      console.log(`Successfully deleted file: ${objectKey}`);
    } catch (error) {
      console.error('Error in deleteFile:', error);
      const errorMessage = error instanceof Error ? error.message : `Unknown error: ${JSON.stringify(error)}`;
      throw new Error(`Failed to delete from Replit Object Storage: ${errorMessage}`);
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
  private validateFile(buffer: Buffer, mimeType: string, maxSizeBytes: number = 100 * 1024 * 1024): void {
    const allowedTypes = [
      // PDF Files
      'application/pdf',
      // Microsoft Office Documents
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      // Google Workspace Documents
      'application/vnd.google-apps.document',
      'application/vnd.google-apps.spreadsheet',
      'application/vnd.google-apps.presentation',
      // Text Files
      'text/plain',
      'application/rtf',
      // OpenDocument Formats
      'application/vnd.oasis.opendocument.text',
      'application/vnd.oasis.opendocument.spreadsheet',
      'application/vnd.oasis.opendocument.presentation',
      // Image Files
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      // Generic binary for files that may not have proper MIME detection
      'application/octet-stream'
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
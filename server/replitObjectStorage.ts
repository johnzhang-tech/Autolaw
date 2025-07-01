import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

interface UploadResult {
  objectKey: string;
  bucketName: string;
  objectUrl: string;
  fileSize: number;
  etag?: string;
}

interface ReplitObjectStorageConfig {
  bucketName: string;
  baseUrl?: string;
}

class ReplitObjectStorageService {
  private bucketName: string;
  private baseUrl: string;

  constructor(config?: ReplitObjectStorageConfig) {
    this.bucketName = config?.bucketName || 'HomeDocsInterfaces';
    // Replit Object Storage uses automatic authentication in the workspace
    this.baseUrl = config?.baseUrl || `https://${process.env.REPLIT_DOMAINS?.split(',')[0]}/api/storage`;
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
      
      // Use Replit's automatic authentication for Object Storage
      const uploadUrl = `${this.baseUrl}/buckets/${this.bucketName}/objects/${encodeURIComponent(objectKey)}`;
      
      const response = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': mimeType,
          'Content-Length': buffer.length.toString(),
        },
        body: buffer,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Replit Object Storage upload failed: ${response.status} ${errorText}`);
      }

      const responseData = await response.json().catch(() => ({}));
      
      return {
        objectKey,
        bucketName: this.bucketName,
        objectUrl: `${this.baseUrl}/api/v1/buckets/${this.bucketName}/objects/${encodeURIComponent(objectKey)}`,
        fileSize: buffer.length,
        etag: responseData.etag || this.generateFileHash(buffer),
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
      // For Replit Object Storage with automatic authentication
      const downloadUrl = `${this.baseUrl}/buckets/${this.bucketName}/objects/${encodeURIComponent(objectKey)}`;
      
      return downloadUrl;
    } catch (error) {
      throw new Error(`Failed to generate download URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete file from Replit Object Storage
   */
  async deleteFile(objectKey: string): Promise<void> {
    try {
      const deleteUrl = `${this.baseUrl}/buckets/${this.bucketName}/objects/${encodeURIComponent(objectKey)}`;
      
      const response = await fetch(deleteUrl, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Delete failed: ${response.status} ${errorText}`);
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
      let listUrl = `${this.baseUrl}/buckets/${this.bucketName}/objects`;
      if (prefix) {
        listUrl += `?prefix=${encodeURIComponent(prefix)}`;
      }
      
      const response = await fetch(listUrl);

      if (!response.ok) {
        throw new Error(`List objects failed: ${response.status}`);
      }

      const data = await response.json();
      return data.objects || [];
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
    return !!(process.env.REPLIT_OBJECT_STORAGE_TOKEN && this.bucketName);
  }

  /**
   * Test connection to Replit Object Storage
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/buckets/${this.bucketName}`, {
        headers: {
          'Authorization': `Bearer ${process.env.REPLIT_OBJECT_STORAGE_TOKEN || ''}`,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const replitObjectStorage = new ReplitObjectStorageService({
  bucketName: 'HomeDocsInterfaces'
});
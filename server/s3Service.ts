import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";

// S3-compatible storage configuration
const S3_REGION = process.env.AWS_REGION || "us-east-1";
const S3_BUCKET = process.env.S3_BUCKET || "docuai-documents";
const S3_ACCESS_KEY = process.env.AWS_ACCESS_KEY_ID;
const S3_SECRET_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const S3_ENDPOINT = process.env.S3_ENDPOINT; // For S3-compatible services like MinIO

interface UploadResult {
  s3Key: string;
  s3Bucket: string;
  s3Region: string;
  s3Url: string;
  etag: string;
  fileSize: number;
}

interface S3Config {
  region: string;
  credentials?: {
    accessKeyId: string;
    secretAccessKey: string;
  };
  endpoint?: string;
  forcePathStyle?: boolean;
}

class S3Service {
  private client: S3Client;
  private bucket: string;
  private region: string;

  constructor() {
    this.bucket = S3_BUCKET;
    this.region = S3_REGION;

    const config: S3Config = {
      region: this.region,
    };

    // Add credentials if provided
    if (S3_ACCESS_KEY && S3_SECRET_KEY) {
      config.credentials = {
        accessKeyId: S3_ACCESS_KEY,
        secretAccessKey: S3_SECRET_KEY,
      };
    }

    // Support for S3-compatible services (like MinIO, DigitalOcean Spaces)
    if (S3_ENDPOINT) {
      config.endpoint = S3_ENDPOINT;
      config.forcePathStyle = true; // Required for many S3-compatible services
    }

    this.client = new S3Client(config);
  }

  /**
   * Generate a unique S3 key for file storage
   */
  generateS3Key(userId: string, originalFilename: string, mimeType: string): string {
    const fileExtension = this.getFileExtension(originalFilename, mimeType);
    const timestamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const uniqueId = uuidv4();
    
    return `documents/${userId}/${timestamp}/${uniqueId}${fileExtension}`;
  }

  /**
   * Get file extension from filename or mime type
   */
  private getFileExtension(filename: string, mimeType: string): string {
    // Try to get extension from filename first
    const match = filename.match(/\.[^.]+$/);
    if (match) {
      return match[0];
    }

    // Fallback to mime type mapping
    const mimeExtensions: Record<string, string> = {
      'application/pdf': '.pdf',
      'application/msword': '.doc',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
      'text/plain': '.txt',
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif',
      'application/json': '.json',
      'text/csv': '.csv',
    };

    return mimeExtensions[mimeType] || '.bin';
  }

  /**
   * Upload file buffer to S3-compatible storage
   */
  async uploadFile(
    buffer: Buffer,
    s3Key: string,
    mimeType: string,
    originalFilename: string
  ): Promise<UploadResult> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: s3Key,
        Body: buffer,
        ContentType: mimeType,
        ContentDisposition: `attachment; filename="${originalFilename}"`,
        Metadata: {
          originalFilename,
          uploadedAt: new Date().toISOString(),
        },
      });

      const result = await this.client.send(command);
      
      // Generate the S3 URL
      const s3Url = S3_ENDPOINT 
        ? `${S3_ENDPOINT}/${this.bucket}/${s3Key}`
        : `https://${this.bucket}.s3.${this.region}.amazonaws.com/${s3Key}`;

      return {
        s3Key,
        s3Bucket: this.bucket,
        s3Region: this.region,
        s3Url,
        etag: result.ETag?.replace(/"/g, '') || '',
        fileSize: buffer.length,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('S3 upload error:', error);
      throw new Error(`Failed to upload file to S3: ${errorMessage}`);
    }
  }

  /**
   * Generate a presigned URL for file download
   */
  async generateDownloadUrl(s3Key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: s3Key,
      });

      return await getSignedUrl(this.client, command, { expiresIn });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error generating download URL:', error);
      throw new Error(`Failed to generate download URL: ${errorMessage}`);
    }
  }

  /**
   * Delete file from S3-compatible storage
   */
  async deleteFile(s3Key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: s3Key,
      });

      await this.client.send(command);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('S3 delete error:', error);
      throw new Error(`Failed to delete file from S3: ${errorMessage}`);
    }
  }

  /**
   * Generate file hash for integrity verification
   */
  static generateFileHash(buffer: Buffer): string {
    return crypto.createHash('md5').update(buffer).digest('hex');
  }

  /**
   * Validate file type and size
   */
  static validateFile(buffer: Buffer, mimeType: string, maxSizeBytes: number = 10 * 1024 * 1024): void {
    // Check file size (default 10MB)
    if (buffer.length > maxSizeBytes) {
      throw new Error(`File size exceeds limit of ${maxSizeBytes / (1024 * 1024)}MB`);
    }

    // Check allowed file types
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'image/jpeg',
      'image/png',
      'image/gif',
      'text/csv',
      'application/json',
    ];

    if (!allowedTypes.includes(mimeType)) {
      throw new Error(`File type ${mimeType} is not allowed`);
    }
  }

  /**
   * Check if S3 service is properly configured
   */
  isConfigured(): boolean {
    return !!(this.bucket && this.region);
  }

  /**
   * Test S3 connection
   */
  async testConnection(): Promise<boolean> {
    try {
      // Try to list objects in bucket (minimal operation)
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: 'test-connection-key-that-does-not-exist',
      });
      
      await this.client.send(command);
      return true;
    } catch (error: unknown) {
      // If error is NoSuchKey, connection is working
      if (error instanceof Error && error.name === 'NoSuchKey') {
        return true;
      }
      console.error('S3 connection test failed:', error);
      return false;
    }
  }
}

export const s3Service = new S3Service();
export { S3Service };
export default s3Service;
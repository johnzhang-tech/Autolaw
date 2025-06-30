import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

interface UploadResult {
  filePath: string;
  fileName: string;
  fileSize: number;
  hash: string;
}

class LocalStorageService {
  private baseDir: string;

  constructor() {
    // Create HomeDocsInterfaces directory in uploads folder
    this.baseDir = path.join(process.cwd(), 'uploads', 'HomeDocsInterfaces');
    this.ensureDirectoryExists(this.baseDir);
  }

  private ensureDirectoryExists(dirPath: string) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  /**
   * Generate unique file path for storage with transaction organization
   */
  generateFilePath(transactionName: string, transactionId: number, originalFilename: string): string {
    const transactionFolder = `${transactionName.replace(/[^a-zA-Z0-9-]/g, '_')}_${transactionId}`;
    const fileExtension = path.extname(originalFilename);
    const baseName = path.basename(originalFilename, fileExtension);
    const uniqueId = uuidv4().slice(0, 8);
    const timestamp = Date.now();
    
    const fileName = `${timestamp}_${baseName}_${uniqueId}${fileExtension}`;
    const folderPath = path.join(this.baseDir, transactionFolder);
    
    // Ensure transaction folder exists
    this.ensureDirectoryExists(folderPath);
    
    return path.join(folderPath, fileName);
  }

  /**
   * Save file to local HomeDocsInterfaces storage
   */
  async saveFile(
    buffer: Buffer,
    transactionName: string,
    transactionId: number,
    originalFilename: string,
    mimeType: string
  ): Promise<UploadResult> {
    try {
      // Validate file
      this.validateFile(buffer, mimeType);
      
      // Generate unique file path
      const filePath = this.generateFilePath(transactionName, transactionId, originalFilename);
      
      // Save file
      fs.writeFileSync(filePath, buffer);
      
      // Generate file hash for integrity
      const hash = this.generateFileHash(buffer);
      
      return {
        filePath: filePath.replace(process.cwd(), ''), // Relative path
        fileName: path.basename(filePath),
        fileSize: buffer.length,
        hash
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to save file locally: ${message}`);
    }
  }

  /**
   * Get file for download
   */
  async getFile(filePath: string): Promise<Buffer> {
    const fullPath = path.join(process.cwd(), filePath);
    
    if (!fs.existsSync(fullPath)) {
      throw new Error('File not found');
    }
    
    return fs.readFileSync(fullPath);
  }

  /**
   * Delete file from storage
   */
  async deleteFile(filePath: string): Promise<void> {
    const fullPath = path.join(process.cwd(), filePath);
    
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }

  /**
   * List files in transaction folder
   */
  listTransactionFiles(transactionName: string, transactionId: number): string[] {
    const transactionFolder = `${transactionName.replace(/[^a-zA-Z0-9-]/g, '_')}_${transactionId}`;
    const folderPath = path.join(this.baseDir, transactionFolder);
    
    if (!fs.existsSync(folderPath)) {
      return [];
    }
    
    return fs.readdirSync(folderPath);
  }

  /**
   * Generate file hash for integrity verification
   */
  private generateFileHash(buffer: Buffer): string {
    return crypto.createHash('sha256').update(buffer).digest('hex');
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
   * Get storage statistics
   */
  getStorageStats(): { totalFiles: number; totalSize: number; transactions: number } {
    let totalFiles = 0;
    let totalSize = 0;
    let transactions = 0;

    if (fs.existsSync(this.baseDir)) {
      const transactionFolders = fs.readdirSync(this.baseDir);
      transactions = transactionFolders.length;

      transactionFolders.forEach(folder => {
        const folderPath = path.join(this.baseDir, folder);
        if (fs.statSync(folderPath).isDirectory()) {
          const files = fs.readdirSync(folderPath);
          totalFiles += files.length;
          
          files.forEach(file => {
            const filePath = path.join(folderPath, file);
            totalSize += fs.statSync(filePath).size;
          });
        }
      });
    }

    return { totalFiles, totalSize, transactions };
  }

  /**
   * Check if service is properly configured
   */
  isConfigured(): boolean {
    try {
      // Test write permissions
      const testFile = path.join(this.baseDir, 'test.txt');
      fs.writeFileSync(testFile, 'test');
      fs.unlinkSync(testFile);
      return true;
    } catch {
      return false;
    }
  }
}

export const localStorageService = new LocalStorageService();
import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Upload, File, CheckCircle, AlertCircle, Download, MessageSquare, X } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface Document {
  id: number;
  originalFileName: string;
  fileSize: number;
  category: string;
  analysisStatus: 'pending' | 'processing' | 'completed' | 'failed';
  analysisResult?: any;
  riskScore?: number;
  summaryPdfPath?: string;
  uploadedAt: string;
}

interface DocumentUploadProps {
  transactionId: number;
  onUploadComplete?: (document: Document) => void;
}

export function DocumentUpload({ transactionId, onUploadComplete }: DocumentUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Multiple file upload mutation for HomeDocsInterfaces Object Storage
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Upload failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      const { successful, failed, storageLocation } = data.summary;
      
      toast({
        title: "Upload Complete",
        description: `${successful} files uploaded to ${storageLocation}. ${failed > 0 ? `${failed} files failed.` : 'All files processed successfully.'}`,
      });
      
      setSelectedFiles([]);
      setUploadProgress(0);
      
      // Notify parent about uploads
      if (data.uploadResults?.length > 0) {
        data.uploadResults.forEach((result: any) => {
          onUploadComplete?.(result.document);
        });
      }
      
      // Invalidate both documents and transactions cache to update UI counters
      queryClient.invalidateQueries({ queryKey: ['/api/transactions', transactionId, 'documents'] });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Upload Failed", 
        description: error.message,
        variant: "destructive",
      });
      setUploadProgress(0);
    },
  });

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFilesSelect(files);
    }
  }, []);

  const handleFilesSelect = (files: File[]) => {
    // Validate file types
    const allowedTypes = [
      'application/pdf',
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'image/jpeg',
      'image/png',
      'image/gif'
    ];

    const validFiles: File[] = [];
    const invalidFiles: string[] = [];

    files.forEach(file => {
      if (!allowedTypes.includes(file.type)) {
        invalidFiles.push(file.name);
        return;
      }

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        invalidFiles.push(`${file.name} (too large)`);
        return;
      }

      validFiles.push(file);
    });

    if (invalidFiles.length > 0) {
      toast({
        title: "Invalid Files",
        description: `${invalidFiles.length} files rejected: ${invalidFiles.join(', ')}`,
        variant: "destructive",
      });
    }

    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = () => {
    if (selectedFiles.length === 0) return;

    const formData = new FormData();
    
    // Append all files
    selectedFiles.forEach(file => {
      formData.append('documents', file);
    });
    
    formData.append('transactionId', transactionId.toString());
    formData.append('category', 'hoa'); // Default to HOA category

    // Simulate progress for user feedback
    setUploadProgress(10);
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    uploadMutation.mutate(formData);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <Card 
        className={`border-2 border-dashed transition-all duration-200 ${
          isDragging 
            ? 'border-blue-500 bg-blue-50 shadow-lg scale-105' 
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Upload className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Upload Your Documents
            </h3>
            <p className="text-gray-600 mb-2">
              Drag and drop files here, or click the button below
            </p>
            <p className="text-sm text-gray-500">
              PDF, DOC, DOCX, TXT, and images • Max 10MB per file • Up to 60 files
            </p>
          </div>
          
          <Button 
            onClick={() => fileInputRef.current?.click()}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium shadow-sm transition-all duration-200 hover:shadow-md"
          >
            <Upload className="mr-2 h-5 w-5" />
            Select Files to Upload
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              if (files.length > 0) {
                handleFilesSelect(files);
              }
            }}
            className="hidden"
          />
        </CardContent>
      </Card>

      {/* Selected Files List */}
      {selectedFiles.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium mb-3">Selected Files ({selectedFiles.length})</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center space-x-2">
                    <File className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700 truncate max-w-xs">
                      {file.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Button and Progress */}
      {selectedFiles.length > 0 && (
        <div className="space-y-3">
          <Button 
            onClick={handleUpload}
            disabled={uploadMutation.isPending}
            size="lg"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md disabled:opacity-50"
          >
            {uploadMutation.isPending ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Uploading to Storage...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <CheckCircle className="mr-2 h-5 w-5" />
                Upload {selectedFiles.length} File{selectedFiles.length > 1 ? 's' : ''} to DocuAI
              </div>
            )}
          </Button>
          
          {uploadMutation.isPending && (
            <div className="space-y-2">
              <Progress value={uploadProgress} className="w-full" />
              <p className="text-sm text-gray-600 text-center">
                Uploading to HomeDocsInterfaces Object Storage...
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Document List Component with updated interface
interface DocumentListProps {
  transactionId: number;
}

export function DocumentList({ transactionId }: DocumentListProps) {
  const { toast } = useToast();

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['/api/transactions', transactionId, 'documents'],
  });

  const downloadMutation = useMutation({
    mutationFn: async (documentId: number) => {
      // For HomeDocsInterfaces, download directly as blob
      const response = await fetch(`/api/documents/${documentId}/download`);
      if (!response.ok) {
        throw new Error('Download failed');
      }
      
      const blob = await response.blob();
      const contentDisposition = response.headers.get('content-disposition');
      const filename = contentDisposition?.match(/filename="(.+)"/)?.[1] || 'document';
      
      return { blob, filename };
    },
    onSuccess: (data) => {
      // Create download link for HomeDocsInterfaces file
      const url = window.URL.createObjectURL(data.blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = data.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
    onError: (error: Error) => {
      toast({
        title: "Download Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse">
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!Array.isArray(documents) || documents.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <File className="mx-auto h-12 w-12 mb-2" />
        <p>No documents uploaded yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {documents.map((doc: Document) => (
        <Card key={doc.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <File className="h-8 w-8 text-blue-500" />
                <div>
                  <h4 className="font-medium text-gray-900">{doc.originalFileName}</h4>
                  <p className="text-sm text-gray-500">
                    {formatFileSize(doc.fileSize)} • {doc.category}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {/* Analysis Status */}
                {doc.analysisStatus === 'completed' && (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Analyzed
                  </Badge>
                )}
                
                {doc.analysisStatus === 'processing' && (
                  <Badge variant="secondary">
                    Processing...
                  </Badge>
                )}
                
                {doc.analysisStatus === 'failed' && (
                  <Badge variant="destructive">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Failed
                  </Badge>
                )}

                {/* Risk Score */}
                {doc.riskScore !== undefined && (
                  <Badge 
                    variant={doc.riskScore > 70 ? "destructive" : doc.riskScore > 40 ? "secondary" : "default"}
                    className={doc.riskScore > 70 ? "bg-red-100 text-red-800" : doc.riskScore > 40 ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}
                  >
                    Risk: {doc.riskScore}
                  </Badge>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => downloadMutation.mutate(doc.id)}
                    disabled={downloadMutation.isPending}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function formatFileSize(bytes: number) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Upload, File, CheckCircle, AlertCircle, Download, MessageSquare } from 'lucide-react';
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Upload mutation
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
      toast({
        title: "Upload Successful",
        description: "Your document is being analyzed. This may take a few minutes.",
      });
      setSelectedFile(null);
      setUploadProgress(0);
      onUploadComplete?.(data.document);
      queryClient.invalidateQueries({ queryKey: ['/api/transactions', transactionId, 'documents'] });
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
      handleFileSelect(files[0]);
    }
  }, []);

  const handleFileSelect = (file: File) => {
    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload PDF, DOC, DOCX, or TXT files only.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large", 
        description: "Please upload files smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('document', selectedFile);
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
    <div className="space-y-6">
      {/* Upload Area */}
      <Card className={`transition-all duration-200 ${isDragging ? 'border-primary bg-primary/5' : 'border-dashed'}`}>
        <CardContent className="p-8">
          <div
            className="text-center space-y-4"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Upload className="w-8 h-8 text-primary" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Upload HOA Documents</h3>
              <p className="text-muted-foreground">
                Drag and drop your PDF, DOC, or TXT files here, or click to browse
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="w-full sm:w-auto"
                disabled={uploadMutation.isPending}
              >
                Choose File
              </Button>
              
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.txt"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                }}
              />
              
              <p className="text-sm text-muted-foreground">
                Maximum file size: 10MB | Supported: PDF, DOC, DOCX, TXT
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected File */}
      {selectedFile && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <File className="w-8 h-8 text-primary" />
                <div>
                  <p className="font-medium">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
              </div>
              
              <div className="space-x-2">
                <Button
                  onClick={() => setSelectedFile(null)}
                  variant="outline"
                  size="sm"
                  disabled={uploadMutation.isPending}
                >
                  Remove
                </Button>
                <Button
                  onClick={handleUpload}
                  size="sm"
                  disabled={uploadMutation.isPending}
                >
                  {uploadMutation.isPending ? 'Uploading...' : 'Upload'}
                </Button>
              </div>
            </div>
            
            {uploadMutation.isPending && (
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="w-full" />
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface DocumentListProps {
  transactionId: number;
}

export function DocumentList({ transactionId }: DocumentListProps) {
  const { toast } = useToast();
  
  // Fetch documents for transaction
  const { data: documents, isLoading } = useQuery({
    queryKey: ['/api/transactions', transactionId, 'documents'],
    enabled: !!transactionId,
  });

  // Generate summary PDF mutation
  const generateSummaryMutation = useMutation({
    mutationFn: async (documentId: number) => {
      return await apiRequest(`/api/documents/${documentId}/generate-summary`, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      toast({
        title: "PDF Generation Started",
        description: "Your summary PDF is being generated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Chat mutation
  const [chatMessage, setChatMessage] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [selectedDocumentForChat, setSelectedDocumentForChat] = useState<number | null>(null);

  const chatMutation = useMutation({
    mutationFn: async ({ documentId, message }: { documentId: number; message: string }) => {
      return await apiRequest(`/api/documents/${documentId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
    },
    onSuccess: (data) => {
      setChatResponse(data.response);
      setChatMessage('');
    },
    onError: (error: Error) => {
      toast({
        title: "Chat Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'failed': return <AlertCircle className="w-4 h-4" />;
      default: return <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />;
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading documents...</div>;
  }

  return (
    <div className="space-y-4">
      {documents && documents.length > 0 ? (
        documents.map((doc: Document) => (
          <Card key={doc.id}>
            <CardContent className="p-4">
              <div className="space-y-4">
                {/* Document Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <File className="w-8 h-8 text-primary" />
                    <div>
                      <h4 className="font-medium">{doc.originalFileName}</h4>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(doc.fileSize)} • Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(doc.analysisStatus)}>
                      {getStatusIcon(doc.analysisStatus)}
                      <span className="ml-1 capitalize">{doc.analysisStatus}</span>
                    </Badge>
                  </div>
                </div>

                {/* Analysis Results */}
                {doc.analysisStatus === 'completed' && doc.analysisResult && (
                  <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="font-medium">Analysis Summary</h5>
                      {doc.riskScore && (
                        <Badge variant={doc.riskScore > 70 ? 'destructive' : doc.riskScore > 40 ? 'default' : 'secondary'}>
                          Risk Score: {doc.riskScore}/100
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      {doc.analysisResult.summary}
                    </p>

                    {doc.analysisResult.complianceIssues && doc.analysisResult.complianceIssues.length > 0 && (
                      <div>
                        <h6 className="text-sm font-medium mb-2">Compliance Issues:</h6>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {doc.analysisResult.complianceIssues.map((issue: string, index: number) => (
                            <li key={index} className="flex items-start space-x-2">
                              <span className="text-orange-500">•</span>
                              <span>{issue}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  {doc.analysisStatus === 'completed' && (
                    <>
                      <Button
                        onClick={() => generateSummaryMutation.mutate(doc.id)}
                        variant="outline"
                        size="sm"
                        disabled={generateSummaryMutation.isPending}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        {generateSummaryMutation.isPending ? 'Generating...' : 'Download Summary'}
                      </Button>
                      
                      <Button
                        onClick={() => setSelectedDocumentForChat(selectedDocumentForChat === doc.id ? null : doc.id)}
                        variant="outline"
                        size="sm"
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Ask AI
                      </Button>
                    </>
                  )}
                </div>

                {/* Chat Interface */}
                {selectedDocumentForChat === doc.id && (
                  <div className="border-t pt-4 space-y-3">
                    <div className="space-y-2">
                      <textarea
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        placeholder="Ask a question about this document..."
                        className="w-full p-3 border rounded-md resize-none"
                        rows={3}
                      />
                      <Button
                        onClick={() => chatMutation.mutate({ documentId: doc.id, message: chatMessage })}
                        disabled={!chatMessage.trim() || chatMutation.isPending}
                        size="sm"
                      >
                        {chatMutation.isPending ? 'Asking...' : 'Send'}
                      </Button>
                    </div>
                    
                    {chatResponse && (
                      <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                        <p className="text-sm text-blue-900">{chatResponse}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          No documents uploaded yet.
        </div>
      )}
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
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  Folder, 
  File, 
  HardDrive,
  Download,
  FolderOpen,
  ExternalLink,
  FileText
} from "lucide-react";

export default function StorageBrowser() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { toast } = useToast();

  // Get all transactions with their documents
  const { data: transactions, isLoading } = useQuery<any[]>({
    queryKey: ["/api/transactions"],
  });

  const { data: statusData } = useQuery<any>({
    queryKey: ["/api/storage/status"],
  });

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const downloadFile = async (documentId: number, fileName: string) => {
    try {
      const response = await fetch(`/api/documents/${documentId}/download`);
      if (!response.ok) throw new Error('Download failed');
      
      const data = await response.json();
      
      // Open the download URL in a new tab
      window.open(data.downloadUrl, '_blank');
      
      toast({
        title: "Download Started",
        description: `${fileName} download initiated`,
      });
    } catch (error) {
      console.error('Download failed:', error);
      toast({
        title: "Download Failed",
        description: "Could not download the file",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">HomeDocsInterfaces Storage Browser</h1>
              <p className="text-slate-600">Browse files stored in Replit Object Storage by transaction</p>
            </div>

            {/* Storage Status */}
            {statusData && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HardDrive className="h-5 w-5" />
                    Storage Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-slate-600">Storage Type</p>
                      <p className="font-semibold">{statusData.storageType || 'Replit Object Storage'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Bucket</p>
                      <p className="font-semibold">{statusData.bucketName || 'HomeDocsInterfaces'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Status</p>
                      <Badge variant={statusData.connected ? 'default' : 'destructive'}>
                        {statusData.connected ? 'Connected' : 'Disconnected'}
                      </Badge>
                    </div>
                  </div>
                  {statusData.location && (
                    <div className="mt-4">
                      <p className="text-sm text-slate-600">Location</p>
                      <p className="font-mono text-sm bg-slate-100 p-2 rounded">{statusData.location}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Transaction Browser */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FolderOpen className="h-5 w-5" />
                  Transactions & Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="animate-pulse">
                        <div className="h-16 bg-gray-200 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : !transactions?.length ? (
                  <div className="text-center py-8 text-slate-500">
                    <Folder className="mx-auto h-12 w-12 mb-4" />
                    <p className="text-lg">No transactions found</p>
                    <p className="text-sm">Create transactions and upload documents to see them here</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {transactions.map((transaction: any) => (
                      <TransactionFolder key={transaction.id} transaction={transaction} onDownload={downloadFile} formatFileSize={formatFileSize} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}

function TransactionFolder({ transaction, onDownload, formatFileSize }: {
  transaction: any;
  onDownload: (id: number, name: string) => void;
  formatFileSize: (bytes: number) => string;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Get documents for this transaction
  const { data: documents } = useQuery({
    queryKey: ['/api/transactions', transaction.id, 'documents'],
    enabled: isExpanded,
  });

  const totalFiles = documents?.length || 0;
  const totalSize = documents?.reduce((acc: number, doc: any) => acc + (doc.fileSize || 0), 0) || 0;

  return (
    <div className="border rounded-lg p-4">
      <div 
        className="flex items-center justify-between mb-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          <Folder className="h-6 w-6 text-blue-500" />
          <div>
            <h3 className="font-semibold text-slate-900">{transaction.name}</h3>
            <p className="text-sm text-slate-600">
              {transaction.address} • Created {new Date(transaction.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="secondary">
            {totalFiles} files
          </Badge>
          <Badge variant="outline">
            {formatFileSize(totalSize)}
          </Badge>
          <Button variant="ghost" size="sm">
            {isExpanded ? 'Collapse' : 'Expand'}
          </Button>
        </div>
      </div>
      
      {/* Documents in transaction */}
      {isExpanded && (
        <div className="space-y-2 ml-9 mt-4">
          {!documents?.length ? (
            <div className="text-center py-4 text-slate-500">
              <FileText className="mx-auto h-8 w-8 mb-2" />
              <p className="text-sm">No documents uploaded yet</p>
            </div>
          ) : (
            documents.map((doc: any) => (
              <div key={doc.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <File className="h-4 w-4 text-slate-500" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">{doc.originalFileName}</p>
                    <p className="text-xs text-slate-500">
                      {formatFileSize(doc.fileSize)} • {doc.category} • 
                      {doc.analysisResult ? (
                        <Badge variant="outline" className="ml-1">
                          Risk: {doc.analysisResult.riskScore || 'N/A'}
                        </Badge>
                      ) : (
                        'Analysis pending'
                      )}
                    </p>
                    <p className="text-xs text-slate-400">
                      Uploaded {new Date(doc.uploadedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDownload(doc.id, doc.originalFileName)}
                    className="flex items-center space-x-1"
                  >
                    <Download className="h-3 w-3" />
                    <span className="text-xs">Download</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(`/documents/${doc.id}`, '_blank')}
                    className="flex items-center space-x-1"
                  >
                    <ExternalLink className="h-3 w-3" />
                    <span className="text-xs">View</span>
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
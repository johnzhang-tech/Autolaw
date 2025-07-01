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
  const { data: transactions, isLoading } = useQuery({
    queryKey: ["/api/transactions"],
  });

  const { data: statusData } = useQuery({
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
              <p className="text-slate-600">Browse files stored in the local HomeDocsInterfaces Object Storage</p>
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
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-slate-600">Storage Type</p>
                      <p className="font-semibold">{statusData.storageType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Total Files</p>
                      <p className="font-semibold">{statusData.stats.totalFiles}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Total Size</p>
                      <p className="font-semibold">{statusData.stats.totalSize}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Transactions</p>
                      <p className="font-semibold">{statusData.stats.transactions}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-slate-600">Location</p>
                    <p className="font-mono text-sm bg-slate-100 p-2 rounded">{statusData.location}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* File Browser */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FolderOpen className="h-5 w-5" />
                  Transaction Folders
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
                ) : !storageData?.folders?.length ? (
                  <div className="text-center py-8 text-slate-500">
                    <Folder className="mx-auto h-12 w-12 mb-4" />
                    <p className="text-lg">No folders found</p>
                    <p className="text-sm">Upload documents to create transaction folders</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {storageData.folders.map((folder: any) => (
                      <div key={folder.name} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <Folder className="h-6 w-6 text-blue-500" />
                            <div>
                              <h3 className="font-semibold text-slate-900">{folder.name}</h3>
                              <p className="text-sm text-slate-600">{folder.path}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <Badge variant="secondary">
                              {folder.fileCount} files
                            </Badge>
                            <Badge variant="outline">
                              {formatFileSize(folder.totalSize)}
                            </Badge>
                          </div>
                        </div>
                        
                        {/* Files in folder */}
                        <div className="space-y-2 ml-9">
                          {folder.files.map((file: any) => (
                            <div key={file.name} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                              <div className="flex items-center space-x-3">
                                <File className="h-4 w-4 text-slate-500" />
                                <div>
                                  <p className="text-sm font-medium text-slate-900">{file.name}</p>
                                  <p className="text-xs text-slate-500">
                                    {formatFileSize(file.size)} • {new Date(file.modified).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => downloadFile(file.path, file.name)}
                                className="flex items-center space-x-1"
                              >
                                <Download className="h-3 w-3" />
                                <span className="text-xs">Download</span>
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
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
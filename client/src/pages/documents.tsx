import { useState } from "react";
import { useAuthSimple as useAuth } from "@/hooks/useAuthSimple";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText, 
  Download, 
  Search, 
  Filter,
  Calendar,
  FolderOpen,
  Eye,
  AlertTriangle
} from "lucide-react";
import type { Document, TransactionResponse } from "@shared/schema";

export default function Documents() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const { toast } = useToast();

  // Get all transactions first
  const { data: transactionsData = [] } = useQuery({
    queryKey: ["/api/transactions"],
  });
  const transactions = transactionsData as TransactionResponse[];

  // Get all documents from all transactions
  const { data: allDocuments = [], isLoading } = useQuery({
    queryKey: ["/api/all-user-documents"],
    queryFn: async () => {
      if (!transactions.length) return [];
      
      // Get JWT token for authenticated requests
      const token = localStorage.getItem('docuai_token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      // Fetch documents from all user transactions
      const documentPromises = transactions.map(async (transaction) => {
        const response = await fetch(`/api/transactions/${transaction.Tranx_id}/documents`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (response.ok) {
          const docs = await response.json();
          return docs.map((doc: any) => ({
            ...doc,
            transactionName: transaction.name
          }));
        }
        return [];
      });
      
      const allDocArrays = await Promise.all(documentPromises);
      return allDocArrays.flat();
    },
    enabled: transactions.length > 0,
  });

  // Ensure documents is an array and cast properly
  const documentsArray = Array.isArray(allDocuments) ? allDocuments as Document[] : [];

  // Filter documents based on search and filters
  const filteredDocuments = documentsArray.filter((doc) => {
    const matchesSearch = doc.originalFileName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || doc.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getRiskBadgeColor = (riskScore?: number | null) => {
    if (!riskScore || riskScore === null) return "bg-gray-100 text-gray-800";
    if (riskScore >= 70) return "bg-red-100 text-red-800";
    if (riskScore >= 40) return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  const downloadDocument = async (documentId: number, fileName: string) => {
    try {
      // Get JWT token for authenticated requests
      const token = localStorage.getItem('docuai_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`/api/documents/${documentId}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Download failed');
      
      const result = await response.json();
      
      if (result.success && result.downloadUrl) {
        // Create a link element to trigger download
        const link = document.createElement('a');
        link.href = result.downloadUrl;
        link.download = fileName;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({
          title: "Download Started",
          description: `${fileName} is being downloaded`,
        });
      } else {
        throw new Error('Invalid download response');
      }
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Could not download file",
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
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Documents</h1>
              <p className="text-slate-600">Manage your legal documents</p>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <FileText className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-slate-600">Total Documents</p>
                      <p className="text-2xl font-bold text-slate-900">{documentsArray.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Eye className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-slate-600">Analyzed</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {documentsArray.filter(doc => doc.analysisStatus === 'completed').length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <AlertTriangle className="h-8 w-8 text-yellow-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-slate-600">High Risk</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {documentsArray.filter(doc => doc.riskScore && doc.riskScore >= 70).length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                      <Input
                        placeholder="Search documents..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="hoa">Legal</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="inspection">Discovery</SelectItem>
                      <SelectItem value="financial">Financial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Documents List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Documents ({filteredDocuments.length})
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
                ) : filteredDocuments.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <FileText className="mx-auto h-12 w-12 mb-4" />
                    <p className="text-lg">No documents found</p>
                    <p className="text-sm">Upload your first document to get started</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredDocuments.map((doc) => (
                      <div key={doc.id} className="border rounded-lg p-4 hover:bg-slate-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 flex-1">
                            <FileText className="h-8 w-8 text-blue-500 flex-shrink-0" />
                            
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-slate-900 truncate">
                                {doc.originalFileName}
                              </h3>
                              <div className="flex items-center space-x-4 mt-1 text-sm text-slate-500">
                                <span>{getFileSize(doc.fileSize)}</span>
                                <span className="capitalize">{doc.category}</span>
                                <span>{doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : 'Unknown date'}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            {/* Analysis Status */}
                            {doc.analysisStatus === 'completed' && (
                              <Badge className="bg-green-100 text-green-800">
                                Analyzed
                              </Badge>
                            )}
                            
                            {doc.analysisStatus === 'processing' && (
                              <Badge variant="secondary">
                                Processing
                              </Badge>
                            )}
                            
                            {doc.analysisStatus === 'failed' && (
                              <Badge variant="destructive">
                                Failed
                              </Badge>
                            )}

                            {/* Risk Score */}
                            {doc.riskScore !== undefined && doc.riskScore !== null && (
                              <Badge className={getRiskBadgeColor(doc.riskScore)}>
                                Risk: {doc.riskScore}
                              </Badge>
                            )}

                            {/* Download Button */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => downloadDocument(doc.id, doc.originalFileName)}
                              className="flex items-center space-x-1"
                            >
                              <Download className="h-4 w-4" />
                              <span>Download</span>
                            </Button>
                          </div>
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
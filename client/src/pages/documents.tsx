import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
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
  MoreVertical,
  Trash
} from "lucide-react";
import type { Transaction, Document } from "@shared/schema";

export default function Documents() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: transactions = [] } = useQuery({
    queryKey: ["/api/transactions"],
  });

  // Get all documents across all transactions
  const getAllDocuments = async () => {
    const allDocuments: (Document & { transactionName: string })[] = [];
    
    for (const transaction of transactions as Transaction[]) {
      const docs = await apiRequest(`/api/transactions/${transaction.id}/documents`);
      const docsWithTransaction = docs.map((doc: Document) => ({
        ...doc,
        transactionName: transaction.name,
      }));
      allDocuments.push(...docsWithTransaction);
    }
    
    return allDocuments;
  };

  const { data: allDocuments = [] } = useQuery({
    queryKey: ["/api/documents/all"],
    queryFn: getAllDocuments,
    enabled: transactions.length > 0,
  });

  // Filter documents based on search and filters
  const filteredDocuments = allDocuments.filter((doc: any) => {
    const matchesSearch = doc.originalFileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.transactionName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTransaction = selectedTransaction === "all" || 
                              doc.transactionId.toString() === selectedTransaction;
    
    const matchesCategory = categoryFilter === "all" || doc.category === categoryFilter;
    
    return matchesSearch && matchesTransaction && matchesCategory;
  });

  const getFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('image')) return '🖼️';
    if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
    if (mimeType.includes('text')) return '📃';
    return '📁';
  };

  const getCategoryColor = (category: string | null) => {
    switch (category) {
      case 'hoa': return 'bg-blue-100 text-blue-800';
      case 'contract': return 'bg-green-100 text-green-800';
      case 'inspection': return 'bg-yellow-100 text-yellow-800';
      case 'financial': return 'bg-purple-100 text-purple-800';
      case 'legal': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAnalysisStatus = (doc: any) => {
    if (doc.analyzedAt) {
      return { status: 'Complete', color: 'bg-green-100 text-green-800' };
    }
    return { status: 'Pending', color: 'bg-yellow-100 text-yellow-800' };
  };

  return (
    <div className="flex h-screen bg-white">
      <Sidebar 
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">Documents</h1>
            <p className="text-lg text-slate-600 mt-2">
              Manage and analyze all your real estate documents
            </p>
          </div>

          {/* Filters and Search */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedTransaction} onValueChange={setSelectedTransaction}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Transactions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Transactions</SelectItem>
                {(transactions as Transaction[]).map((transaction) => (
                  <SelectItem key={transaction.id} value={transaction.id.toString()}>
                    {transaction.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="hoa">HOA</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="inspection">Inspection</SelectItem>
                <SelectItem value="financial">Financial</SelectItem>
                <SelectItem value="legal">Legal</SelectItem>
                <SelectItem value="general">General</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Documents Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-600">Total Documents</p>
                    <p className="text-2xl font-bold text-slate-900">{allDocuments.length}</p>
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
                      {allDocuments.filter((doc: any) => doc.analyzedAt).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <FolderOpen className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-600">Transactions</p>
                    <p className="text-2xl font-bold text-slate-900">{(transactions as Transaction[]).length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-600">This Month</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {allDocuments.filter((doc: any) => {
                        const docDate = new Date(doc.uploadedAt);
                        const now = new Date();
                        return docDate.getMonth() === now.getMonth() && 
                               docDate.getFullYear() === now.getFullYear();
                      }).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Documents List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Documents ({filteredDocuments.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredDocuments.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-16 w-16 mx-auto mb-4 opacity-30" />
                  <h3 className="text-lg font-medium mb-2">No documents found</h3>
                  <p className="text-sm">
                    {allDocuments.length === 0 
                      ? "Upload your first document to get started"
                      : "Try adjusting your search or filters"
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredDocuments.map((doc: any) => {
                    const analysisStatus = getAnalysisStatus(doc);
                    
                    return (
                      <div key={doc.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                        <div className="flex items-center space-x-4 flex-1">
                          <div className="text-2xl">
                            {getFileIcon(doc.mimeType)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-slate-900 truncate">
                              {doc.originalFileName}
                            </h4>
                            <div className="flex items-center space-x-4 mt-1 text-sm text-slate-500">
                              <span>{doc.transactionName}</span>
                              <span>•</span>
                              <span>{getFileSize(doc.fileSize)}</span>
                              <span>•</span>
                              <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          {doc.category && (
                            <Badge className={getCategoryColor(doc.category)}>
                              {doc.category}
                            </Badge>
                          )}
                          
                          <Badge className={analysisStatus.color}>
                            {analysisStatus.status}
                          </Badge>

                          <div className="flex items-center space-x-1">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
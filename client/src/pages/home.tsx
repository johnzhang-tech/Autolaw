import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Sidebar } from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { FileText, Upload, BarChart3, MessageCircleQuestion, TrendingUp, AlertTriangle, FileCheck } from "lucide-react";

import { apiRequest } from "@/lib/queryClient";
import type { Transaction } from "@shared/schema";

export default function Home() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: transactionsData = [] } = useQuery({
    queryKey: ["/api/transactions"],
  });
  const transactions = transactionsData as Transaction[];

  // Calculate document counts from transaction data (numDocuments field)
  const documentCounts = transactions.reduce((acc, t) => {
    acc[t.id] = t.numDocuments || 0;
    return acc;
  }, {} as Record<number, number>);

  const totalDocuments = transactions.reduce((acc, t) => acc + (t.numDocuments || 0), 0);

  // Generate Report mutation
  const generateReportMutation = useMutation({
    mutationFn: async (transactionId: number) => {
      const documentCount = documentCounts[transactionId] || 0;
      
      if (documentCount === 0) {
        throw new Error("Please upload your documents first");
      }

      // Trigger n8n workflow
      return await apiRequest("POST", `/api/transactions/${transactionId}/generate-report`);
    },
    onSuccess: () => {
      toast({
        title: "Report Generation Started",
        description: "Your report is being generated and will be available shortly.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Cannot Generate Report",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <Sidebar 
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">
              Welcome to DocuAI
            </h1>
            <p className="text-lg text-slate-600 mt-2">
              Your intelligent real estate document analysis platform
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalDocuments}</div>
                <p className="text-xs text-muted-foreground">
                  Documents across all transactions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Transactions</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{transactions.length}</div>
                <p className="text-xs text-muted-foreground">
                  Real estate transactions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">AI Analysis</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">
                  Documents analyzed today
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Risk Alerts</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">
                  Potential risks identified
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Activity */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Transaction</CardTitle>
                </CardHeader>
                <CardContent>
                  {transactions.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <FileText className="h-16 w-16 mx-auto mb-4 opacity-30" />
                      <h3 className="text-lg font-medium mb-2">No transactions yet</h3>
                      <p className="text-sm mb-4">Create your first transaction to get started</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {transactions.slice(0, 5).map((transaction) => (
                        <div key={transaction.id} className="flex items-center space-x-4 p-4 bg-slate-50 rounded-lg">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-slate-900">{transaction.name}</h4>
                            <p className="text-sm text-slate-500">{transaction.transactionType}</p>
                            <p className="text-xs text-slate-400 mt-1">
                              {documentCounts[transaction.id] || 0} documents
                            </p>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Button
                              onClick={() => generateReportMutation.mutate(transaction.id)}
                              disabled={generateReportMutation.isPending}
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              <FileCheck className="h-4 w-4 mr-1" />
                              {generateReportMutation.isPending ? "Generating..." : "Generate Report"}
                            </Button>
                            <div className="text-right">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {transaction.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Getting Started */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Getting Started</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">1</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-900">Create a Transaction</h4>
                        <p className="text-sm text-slate-500">Start by creating a real estate transaction</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-slate-300 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">2</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-900">Upload Documents</h4>
                        <p className="text-sm text-slate-500">Add contracts, HOA docs, and other files</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-slate-300 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">3</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-900">Get AI Analysis</h4>
                        <p className="text-sm text-slate-500">Review automated insights and risk assessment</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tips</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Use the Q&A feature to ask specific questions about documents</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Upload multiple document types for comprehensive analysis</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Check the Dashboard for portfolio insights</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

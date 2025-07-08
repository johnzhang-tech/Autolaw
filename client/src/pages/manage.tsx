import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Settings, 
  Plus, 
  Edit, 
  Trash, 
  MoreVertical,
  User,
  FileText,
  Archive,
  RefreshCw,
  CreditCard,
  Calendar,
  Check,
  Clock,
  AlertCircle,
  Loader2
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDocumentCounts } from "@/hooks/useDocumentCounts";
import type { Transaction } from "@shared/schema";

const transactionSchema = z.object({
  name: z.string().min(1, "Transaction name is required"),
  address: z.string().optional(),
  transactionType: z.string().min(1, "Transaction type is required"),
  status: z.string().min(1, "Status is required"),
});

type TransactionForm = z.infer<typeof transactionSchema>;

export default function Manage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<TransactionForm>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      name: "",
      address: "",
      transactionType: "",
      status: "",
    },
  });

  // Queries
  const { data: transactionsData = [], isLoading: transactionsLoading } = useQuery({
    queryKey: ["/api/transactions"],
  });
  const transactions = transactionsData as Transaction[];

  const { data: chatSessions = [] } = useQuery({
    queryKey: ["/api/chat/sessions"],
  });

  // Get document counts for all transactions
  const transactionIds = transactions.map((t) => t.id);
  const { data: documentCounts = {} } = useDocumentCounts(transactionIds);

  // Mutations
  const createTransactionMutation = useMutation({
    mutationFn: async (data: TransactionForm) => {
      return apiRequest("POST", "/api/transactions", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      toast({
        title: "Success",
        description: "Transaction created successfully!",
      });
      form.reset();
    },
    onError: (error: Error) => {
      console.error("Create transaction error:", error);
      toast({
        title: "Error",  
        description: "Failed to create transaction. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateTransactionMutation = useMutation({
    mutationFn: async (data: TransactionForm) => {
      return apiRequest("PATCH", `/api/transactions/${editingTransaction.id}`, {
        method: "PATCH",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      toast({
        title: "Success",
        description: "Transaction updated successfully!",
      });
      setIsEditDialogOpen(false);
      setEditingTransaction(null);
    },
    onError: (error: Error) => {
      console.error("Update transaction error:", error);
      toast({
        title: "Error",
        description: "Failed to update transaction. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteTransactionMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/transactions/${id}`);
    },
    onSuccess: () => {
      // Aggressively clear all related cache entries
      queryClient.removeQueries({ queryKey: ["/api/transactions"] });
      queryClient.removeQueries({ queryKey: ["/api/document-counts"] });
      queryClient.removeQueries({ queryKey: ["/api/all-user-documents"] });
      
      // Also clear any transaction-specific document queries
      if (deletingTransaction) {
        queryClient.removeQueries({ 
          queryKey: [`/api/transactions/${deletingTransaction.id}/documents`] 
        });
      }
      
      // Force immediate refetch
      queryClient.refetchQueries({ queryKey: ["/api/transactions"] });
      toast({
        title: "Success",
        description: "Transaction and all documents deleted successfully!",
      });
      setIsDeleteDialogOpen(false);
      setDeletingTransaction(null);
    },
    onError: (error: Error) => {
      console.error("Delete transaction error:", error);
      toast({
        title: "Error",
        description: "Failed to delete transaction. Please try again.",
        variant: "destructive",
      });
      setIsDeleteDialogOpen(false);
      setDeletingTransaction(null);
    },
  });

  const openDeleteDialog = (transaction: Transaction) => {
    setDeletingTransaction(transaction);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deletingTransaction) {
      deleteTransactionMutation.mutate(deletingTransaction.id);
    }
  };

  const onSubmit = (data: TransactionForm) => {
    if (editingTransaction) {
      updateTransactionMutation.mutate(data);
    } else {
      createTransactionMutation.mutate(data);
    }
  };

  const openEditDialog = (transaction: any) => {
    setEditingTransaction(transaction);
    form.setValue("name", transaction.name);
    form.setValue("address", transaction.address || "");
    form.setValue("transactionType", transaction.transactionType);
    form.setValue("status", transaction.status);
    setIsEditDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    if (!firstName && !lastName) return "U";
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
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
            <h1 className="text-3xl font-bold text-slate-900">Settings & Management</h1>
            <p className="text-lg text-slate-600 mt-2">
              Manage your transactions, preferences, payments, and account settings
            </p>
          </div>

          <Tabs defaultValue="account" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="account">Account & Transactions</TabsTrigger>
              <TabsTrigger value="payment">Payment & Billing</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
            </TabsList>

            <TabsContent value="account" className="space-y-8 mt-8">
              {/* Account Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="h-5 w-5 mr-2" />
                      Account Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
                          {getInitials((user as any)?.firstName, (user as any)?.lastName)}
                        </div>
                        <div>
                          <h3 className="font-medium text-slate-900">
                            {(user as any)?.firstName ? `${(user as any).firstName} ${(user as any).lastName || ""}`.trim() : "User"}
                          </h3>
                          <p className="text-sm text-slate-500">{(user as any)?.email}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                        <div>
                          <p className="text-sm font-medium text-slate-900">{transactions.length}</p>
                          <p className="text-xs text-slate-500">Transactions</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">{(chatSessions as any[]).length}</p>
                          <p className="text-xs text-slate-500">Chat Sessions</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Archive className="h-5 w-5 mr-2" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div>
                          <p className="text-sm font-medium">System active</p>
                          <p className="text-xs text-muted-foreground">All services running</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div>
                          <p className="text-sm font-medium">Q&A ready</p>
                          <p className="text-xs text-muted-foreground">AI chat available</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <RefreshCw className="h-5 w-5 mr-2" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Button size="sm" className="w-full justify-start">
                        <Plus className="h-4 w-4 mr-2" />
                        New Transaction
                      </Button>
                      <Button size="sm" variant="outline" className="w-full justify-start">
                        <FileText className="h-4 w-4 mr-2" />
                        View Documents
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Transaction Management */}
              <Card>
                <CardHeader>
                  <CardTitle>Transaction Management</CardTitle>
                </CardHeader>
                <CardContent>
                  {(transactions as any[]).length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <FileText className="h-16 w-16 mx-auto mb-4 opacity-30" />
                      <h3 className="text-lg font-medium mb-2">No transactions yet</h3>
                      <p className="text-sm">Create your first transaction to get started</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {transactions.map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center space-x-4">
                              <div>
                                <h4 className="font-medium text-slate-900">{transaction.name}</h4>
                                <div className="flex items-center space-x-2 mt-1">
                                  <span className="text-sm text-slate-500">{transaction.transactionType}</span>
                                  <Badge className={getStatusColor(transaction.status)}>
                                    {transaction.status}
                                  </Badge>
                                </div>
                                {transaction.address && (
                                  <p className="text-sm text-slate-400 mt-1">{transaction.address}</p>
                                )}
                                <p className="text-xs text-slate-400 mt-1">
                                  {documentCounts[transaction.id] || 0} documents
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(transaction)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDeleteDialog(transaction)}
                              disabled={deleteTransactionMutation.isPending}
                            >
                              {deleteTransactionMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Edit Transaction Dialog */}
              <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Transaction</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Transaction Name</Label>
                      <Input
                        id="name"
                        {...form.register("name")}
                        placeholder="Investment Property Purchase"
                      />
                      {form.formState.errors.name && (
                        <p className="text-sm text-red-500 mt-1">{form.formState.errors.name.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="address">Property Address</Label>
                      <Input
                        id="address"
                        {...form.register("address")}
                        placeholder="123 Main St, City, State"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="transactionType">Transaction Type</Label>
                      <Select onValueChange={(value) => form.setValue("transactionType", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="purchase">Purchase</SelectItem>
                          <SelectItem value="sale">Sale</SelectItem>
                          <SelectItem value="refinance">Refinance</SelectItem>
                          <SelectItem value="rental">Rental</SelectItem>
                        </SelectContent>
                      </Select>
                      {form.formState.errors.transactionType && (
                        <p className="text-sm text-red-500 mt-1">{form.formState.errors.transactionType.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select onValueChange={(value) => form.setValue("status", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      {form.formState.errors.status && (
                        <p className="text-sm text-red-500 mt-1">{form.formState.errors.status.message}</p>
                      )}
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={updateTransactionMutation.isPending}>
                        {updateTransactionMutation.isPending ? "Updating..." : "Update"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </TabsContent>

            <TabsContent value="payment" className="space-y-8 mt-8">
              {/* Payment Tiers */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Payment Tier: Reporting ($20) */}
                <Card className="relative">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Reporting</CardTitle>
                      <Badge variant="secondary">Basic</Badge>
                    </div>
                    <div className="flex items-baseline">
                      <span className="text-3xl font-bold">$20</span>
                      <span className="text-muted-foreground ml-1">/One time</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      <li className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-sm">document analysis</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-sm">Risk assessment reports</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-sm">One time usage</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-sm">Normal support is included</span>
                      </li>
                    </ul>
                    <Button className="w-full mt-6">Subscribe</Button>
                  </CardContent>
                </Card>

                {/* Payment Tier: Reporting + Q&A ($30) */}
                <Card className="relative border-2 border-primary">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                  </div>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Reporting + Q&A</CardTitle>
                      <Badge>Professional</Badge>
                    </div>
                    <div className="flex items-baseline">
                      <span className="text-3xl font-bold">$30</span>
                      <span className="text-muted-foreground ml-1">/One time</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      <li className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-sm">Everything in Reporting</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-sm">AI-powered Q&A chat</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-sm">One month system access</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-sm">For occursion users</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-sm">Priority support</span>
                      </li>
                    </ul>
                    <Button className="w-full mt-6">Subscribe</Button>
                  </CardContent>
                </Card>

                {/* Payment Tier: Advanced ($59) */}
                <Card className="relative">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Subscription</CardTitle>
                      <Badge variant="outline">Agency</Badge>
                    </div>
                    <div className="flex items-baseline">
                      <span className="text-3xl font-bold">$59</span>
                      <span className="text-muted-foreground ml-1">/month</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      <li className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-sm">Everything in Professional</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-sm">Up to 4 Transactions</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-sm">Advanced analytics</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-sm">API access</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-sm">Platium Support</span>
                      </li>
                    </ul>
                    <Button className="w-full mt-6">Subscribe</Button>
                  </CardContent>
                </Card>
              </div>

              {/* Payment History */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Payment History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <CreditCard className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No payment history</h3>
                    <p className="text-muted-foreground">
                      Your payment history will appear here after your first purchase.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preferences" className="space-y-8 mt-8">
              <Card>
                <CardHeader>
                  <CardTitle>Application Preferences</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Preferences settings coming soon...</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Delete Transaction
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-slate-600">
              Are you sure you want to delete <strong>{deletingTransaction?.name}</strong>?
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-medium text-red-800 mb-2">This action cannot be undone</h4>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• All documents will be permanently deleted from storage</li>
                <li>• All chat sessions and Q&A history will be removed</li>
                <li>• Transaction data will be completely erased</li>
                {documentCounts[deletingTransaction?.id || 0] > 0 && (
                  <li>• <strong>{documentCounts[deletingTransaction?.id || 0]} documents</strong> will be deleted</li>
                )}
              </ul>
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={deleteTransactionMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              disabled={deleteTransactionMutation.isPending}
            >
              {deleteTransactionMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash className="h-4 w-4 mr-2" />
                  Delete Transaction
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
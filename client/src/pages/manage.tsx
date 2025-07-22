import { useState } from "react";
import { useAuthSimple as useAuth } from "@/hooks/useAuthSimple";
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
  AlertCircle,
  Loader2
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

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

  // Calculate document counts from transaction data (numDocuments field)
  const documentCounts = transactions.reduce((acc, t) => {
    acc[t.id] = t.numDocuments || 0;
    return acc;
  }, {} as Record<number, number>);

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
      return apiRequest("DELETE", `/api/transactions/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      toast({
        title: "Success",
        description: "Transaction deleted successfully!",
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
    },
  });

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    form.setValue("name", transaction.name);
    form.setValue("address", transaction.address || "");
    form.setValue("transactionType", transaction.transactionType);
    form.setValue("status", transaction.status);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (transaction: Transaction) => {
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

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      
      <main className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <div className="p-8">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-600 mt-1">
                Manage your transactions, preferences, and account settings
              </p>
            </div>

            <Tabs defaultValue="account" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="account">Account & Transactions</TabsTrigger>
                <TabsTrigger value="preferences">Preferences</TabsTrigger>
              </TabsList>

              <TabsContent value="account" className="space-y-8 mt-8">
                {/* Account Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="h-5 w-5 mr-2" />
                      Account Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Name</Label>
                        <p className="text-gray-900">{user.firstName} {user.lastName}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Email</Label>
                        <p className="text-gray-900">{user.email}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Total Transactions</Label>
                        <p className="text-gray-900">{transactions.length}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Total Documents</Label>
                        <p className="text-gray-900">{Object.values(documentCounts).reduce((a, b) => a + b, 0)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Transaction Management */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 mr-2" />
                        Transaction Management
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Transaction
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Create New Transaction</DialogTitle>
                          </DialogHeader>
                          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div>
                              <Label htmlFor="name">Transaction Name</Label>
                              <Input
                                id="name"
                                {...form.register("name")}
                                placeholder="Enter transaction name"
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
                                placeholder="Enter property address"
                              />
                            </div>
                            
                            <div>
                              <Label htmlFor="transactionType">Transaction Type</Label>
                              <Select onValueChange={(value) => form.setValue("transactionType", value)}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select transaction type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="sale">Sale</SelectItem>
                                  <SelectItem value="purchase">Purchase</SelectItem>
                                  <SelectItem value="lease">Lease</SelectItem>
                                  <SelectItem value="refinance">Refinance</SelectItem>
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
                              <Button type="submit" disabled={createTransactionMutation.isPending}>
                                {createTransactionMutation.isPending ? "Creating..." : "Create Transaction"}
                              </Button>
                            </div>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {transactionsLoading ? (
                      <div className="text-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-600">Loading transactions...</p>
                      </div>
                    ) : transactions.length === 0 ? (
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Transactions Yet</h3>
                        <p className="text-gray-600">Create your first transaction to get started.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {transactions.map((transaction) => (
                          <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900">{transaction.name}</h3>
                              <p className="text-sm text-gray-600">{transaction.address}</p>
                              <div className="flex items-center mt-2 space-x-4">
                                <Badge className={getStatusColor(transaction.status)}>
                                  {transaction.status}
                                </Badge>
                                <span className="text-sm text-gray-500">
                                  {transaction.transactionType}
                                </span>
                                <span className="text-sm text-gray-500">
                                  {documentCounts[transaction.id] || 0} documents
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(transaction)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(transaction)}
                              >
                                <Trash className="h-4 w-4" />
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
                          placeholder="Enter transaction name"
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
                          placeholder="Enter property address"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="transactionType">Transaction Type</Label>
                        <Select onValueChange={(value) => form.setValue("transactionType", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select transaction type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sale">Sale</SelectItem>
                            <SelectItem value="purchase">Purchase</SelectItem>
                            <SelectItem value="lease">Lease</SelectItem>
                            <SelectItem value="refinance">Refinance</SelectItem>
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
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Folder, Upload, FileText, MoreHorizontal, Trash, Edit, AlertCircle, Loader2 } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Sidebar } from "@/components/Sidebar";
import { DocumentUpload } from "@/components/DocumentUpload";
import { apiRequest } from "@/lib/queryClient";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { TransactionResponse } from "@shared/schema";

const caseSchema = z.object({
  name: z.string().min(1, "Case name is required"),
  caseNo: z.string().optional(),
  transactionType: z.enum(["Contract", "Litigation", "Corporate", "Real Estate"]),
});

type CaseForm = z.infer<typeof caseSchema>;

export default function Create() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isCaseDialogOpen, setIsCaseDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<number | null>(null);
  const [editingCase, setEditingCase] = useState<TransactionResponse | null>(null);
  const [deletingCase, setDeletingCase] = useState<TransactionResponse | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<CaseForm>({
    resolver: zodResolver(caseSchema),
    defaultValues: {
      name: "",
      caseNo: "",
      transactionType: "Contract",
    },
  });

  const editForm = useForm<CaseForm>({
    resolver: zodResolver(caseSchema),
    defaultValues: {
      name: "",
      caseNo: "",
      transactionType: "Contract",
    },
  });

  // Fetch transactions
  const { data: transactionsData = [], isLoading: transactionsLoading } = useQuery({
    queryKey: ["/api/transactions"],
  });
  const transactions = transactionsData as TransactionResponse[];

  // Calculate document counts from transaction data (numDocuments field)
  const documentCounts = transactions.reduce((acc, t) => {
    acc[t.Tranx_id] = t.numDocuments || 0;
    return acc;
  }, {} as Record<number, number>);

  // Create case mutation
  const createCaseMutation = useMutation({
    mutationFn: async (data: CaseForm) => {
      return await apiRequest("POST", "/api/transactions", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Case created successfully",
      });
      setIsCaseDialogOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update case mutation
  const updateCaseMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: CaseForm }) => {
      return await apiRequest("PUT", `/api/transactions/${id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Case updated successfully",
      });
      setIsEditDialogOpen(false);
      setEditingCase(null);
      editForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete case mutation
  const deleteCaseMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/transactions/${id}`);
    },
    onSuccess: () => {
      // Aggressively clear all related cache entries
      queryClient.removeQueries({ queryKey: ["/api/transactions"] });
      queryClient.removeQueries({ queryKey: ["/api/document-counts"] });
      queryClient.removeQueries({ queryKey: ["/api/all-user-documents"] });
      
      // Also clear any transaction-specific document queries
      if (deletingCase) {
        queryClient.removeQueries({ 
          queryKey: [`/api/transactions/${deletingCase.Tranx_id}/documents`] 
        });
      }
      
      // Force immediate refetch
      queryClient.refetchQueries({ queryKey: ["/api/transactions"] });
      
      toast({
        title: "Success",
        description: "Case and all documents deleted successfully!",
      });
      setIsDeleteDialogOpen(false);
      setDeletingCase(null);
      // Clear selection if deleted case was selected
      if (deletingCase && selectedCase === deletingCase.Tranx_id) {
        setSelectedCase(null);
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      setIsDeleteDialogOpen(false);
      setDeletingCase(null);
    },
  });

  const openEditDialog = (transaction: TransactionResponse) => {
    setEditingCase(transaction);
    // Pre-populate the edit form with current transaction data
    editForm.reset({
      name: transaction.name,
      caseNo: transaction.caseNo || "",
      transactionType: transaction.transactionType as "Contract" | "Litigation" | "Corporate" | "Real Estate",
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (transaction: TransactionResponse) => {
    setDeletingCase(transaction);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deletingCase) {
      deleteCaseMutation.mutate(deletingCase.Tranx_id);
    }
  };

  const onSubmit = (data: CaseForm) => {
    createCaseMutation.mutate(data);
  };

  const onEditSubmit = (data: CaseForm) => {
    if (editingCase) {
      updateCaseMutation.mutate({ id: editingCase.Tranx_id, data });
    }
  };

  return (
    <div className="flex h-screen bg-white">
      <Sidebar 
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Case</h1>
            <p className="text-gray-600">Start a new legal case and upload documents for analysis</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Case Management */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Folder className="h-5 w-5" />
                    Your Cases
                  </CardTitle>
                  
                  <Dialog open={isCaseDialogOpen} onOpenChange={setIsCaseDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        New Case
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New Case</DialogTitle>
                        <DialogDescription>
                          Start a new legal case to organize your documents
                        </DialogDescription>
                      </DialogHeader>
                      
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Case Name</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="e.g., Smith vs. Jones Contract Dispute" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="caseNo"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Case No (Optional)</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="e.g., 2024-CV-001234" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="transactionType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Case Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select case type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="Contract">Contract</SelectItem>
                                    <SelectItem value="Litigation">Litigation</SelectItem>
                                    <SelectItem value="Corporate">Corporate</SelectItem>
                                    <SelectItem value="Real Estate">Real Estate</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <DialogFooter>
                            <Button type="submit" disabled={createCaseMutation.isPending}>
                              {createCaseMutation.isPending ? "Creating..." : "Create Case"}
                            </Button>
                          </DialogFooter>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {transactionsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                    <p className="text-sm text-muted-foreground">Loading cases...</p>
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Folder className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">No cases yet</p>
                    <p className="text-sm">Create your first case to get started</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transactions.map((transaction) => (
                      <div
                        key={transaction.Tranx_id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedCase === transaction.Tranx_id
                            ? "border-primary bg-primary/5"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => setSelectedCase(transaction.Tranx_id)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{transaction.name}</h4>
                            {transaction.caseNo && (
                              <p className="text-sm text-muted-foreground">Case No: {transaction.caseNo}</p>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                                {transaction.transactionType}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {documentCounts[transaction.Tranx_id] || 0} documents
                              </span>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditDialog(transaction);
                                }}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openDeleteDialog(transaction);
                                }}
                                className="text-red-600"
                              >
                                <Trash className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Right Column - Document Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedCase ? (
                  <DocumentUpload transactionId={selectedCase} />
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">Select a case first</p>
                    <p className="text-sm">Choose a case from the left to upload documents</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>



      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Delete Case
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div>
                <p>Are you sure you want to delete "{deletingCase?.name}"? This will permanently remove:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>The case record</li>
                  <li>{documentCounts[deletingCase?.Tranx_id || 0] || 0} uploaded documents</li>
                  <li>All chat sessions and messages</li>
                  <li>All files from storage</li>
                </ul>
                <p className="font-semibold text-red-600 mt-2">This action cannot be undone.</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteCaseMutation.isPending}
            >
              {deleteCaseMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete Case
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Case Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Case</DialogTitle>
            <DialogDescription>
              Update case details
            </DialogDescription>
          </DialogHeader>
          
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Case Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., Smith vs. Jones Contract Dispute" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="caseNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Case No (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., 2024-CV-001234" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="transactionType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Case Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select case type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Contract">Contract</SelectItem>
                        <SelectItem value="Litigation">Litigation</SelectItem>
                        <SelectItem value="Corporate">Corporate</SelectItem>
                        <SelectItem value="Real Estate">Real Estate</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateCaseMutation.isPending}>
                  {updateCaseMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Update Case
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
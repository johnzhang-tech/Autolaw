import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, Plus, Folder, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Transaction } from "@shared/schema";

const transactionSchema = z.object({
  name: z.string().min(1, "Transaction name is required"),
  address: z.string().optional(),
  transactionType: z.string().min(1, "Transaction type is required"),
});

type TransactionForm = z.infer<typeof transactionSchema>;

export default function Create() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<number | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: transactions = [] } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  const createTransactionMutation = useMutation({
    mutationFn: async (data: TransactionForm) => {
      const response = await apiRequest("POST", "/api/transactions", data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      setIsTransactionDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Transaction created successfully",
      });
    },
    onError: (error: any) => {
      console.error('Transaction creation error:', error);
      console.error('Error details:', {
        message: error?.message,
        stack: error?.stack,
        cause: error?.cause
      });
      
      let errorMessage = "Failed to create transaction";
      if (error?.message) {
        // Extract meaningful error from the response
        if (error.message.includes('400:')) {
          errorMessage = "Please check all required fields are filled correctly";
        } else if (error.message.includes('401:')) {
          errorMessage = "You need to be logged in to create transactions";
        } else if (error.message.includes('500:')) {
          errorMessage = "Server error - please try again";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const uploadDocumentsMutation = useMutation({
    mutationFn: async ({ transactionId, files }: { transactionId: number; files: File[] }) => {
      const results = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("category", "general");
        
        const response = await fetch(`/api/transactions/${transactionId}/documents`, {
          method: "POST",
          body: formData,
          credentials: "include",
        });
        
        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`);
        }
        
        const result = await response.json();
        results.push(result);
      }
      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      setFiles([]);
      setSelectedTransaction(null);
      toast({
        title: "Success",
        description: "Documents uploaded successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to upload documents",
        variant: "destructive",
      });
    },
  });

  const form = useForm<TransactionForm>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      name: "",
      address: "",
      transactionType: "",
    },
  });

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles(prev => [...prev, ...droppedFiles]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...selectedFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = () => {
    if (!selectedTransaction) {
      toast({
        title: "Error",
        description: "Please select a transaction",
        variant: "destructive",
      });
      return;
    }

    if (files.length === 0) {
      toast({
        title: "Error",
        description: "Please select files to upload",
        variant: "destructive",
      });
      return;
    }

    uploadDocumentsMutation.mutate({ transactionId: selectedTransaction, files });
  };

  const onSubmit = (data: TransactionForm) => {
    console.log('Form data being submitted:', data);
    console.log('Form errors:', form.formState.errors);
    createTransactionMutation.mutate(data);
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
            <h1 className="text-3xl font-bold text-slate-900">Upload Documents</h1>
            <p className="text-lg text-slate-600 mt-2">
              Add documents to your real estate transactions
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Transaction Selection */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Select Transaction</CardTitle>
                    <Dialog open={isTransactionDialogOpen} onOpenChange={setIsTransactionDialogOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <Plus className="h-4 w-4 mr-2" />
                          New
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
                              placeholder="e.g., 123 Main St Purchase"
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
                            <Select 
                              value={form.watch("transactionType")} 
                              onValueChange={(value) => {
                                form.setValue("transactionType", value);
                                form.clearErrors("transactionType");
                              }}
                            >
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
                          
                          <div className="flex justify-end space-x-2">
                            <Button type="button" variant="outline" onClick={() => setIsTransactionDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button type="submit" disabled={createTransactionMutation.isPending}>
                              {createTransactionMutation.isPending ? "Creating..." : "Create"}
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {transactions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Folder className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No transactions yet</p>
                      <p className="text-sm">Create your first transaction to get started</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {transactions.map((transaction: Transaction) => (
                        <Button
                          key={transaction.id}
                          variant={selectedTransaction === transaction.id ? "default" : "outline"}
                          className="w-full justify-start h-auto p-4"
                          onClick={() => setSelectedTransaction(transaction.id)}
                        >
                          <div className="text-left">
                            <div className="font-medium">{transaction.name}</div>
                            <div className="text-sm opacity-70">{transaction.transactionType}</div>
                            {transaction.address && (
                              <div className="text-xs opacity-60">{transaction.address}</div>
                            )}
                          </div>
                        </Button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* File Upload */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Upload Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      isDragging
                        ? "border-primary bg-primary/5"
                        : "border-slate-300 hover:border-slate-400"
                    }`}
                    onDrop={handleDrop}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                  >
                    <Upload className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">
                      Drop files here or click to browse
                    </h3>
                    <p className="text-slate-500 mb-4">
                      Supports PDF, DOC, DOCX, TXT, and image files up to 10MB
                    </p>
                    <input
                      type="file"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-upload"
                      accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                    />
                    <label htmlFor="file-upload">
                      <Button variant="outline" className="cursor-pointer">
                        Choose Files
                      </Button>
                    </label>
                  </div>

                  {/* Selected Files */}
                  {files.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-medium text-slate-900 mb-4">Selected Files ({files.length})</h4>
                      <div className="space-y-2">
                        {files.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <FileText className="h-5 w-5 text-slate-400" />
                              <div>
                                <p className="font-medium text-slate-900">{file.name}</p>
                                <p className="text-sm text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Upload Button */}
                  <div className="mt-6 flex justify-end">
                    <Button
                      onClick={handleUpload}
                      disabled={files.length === 0 || !selectedTransaction || uploadDocumentsMutation.isPending}
                      className="px-8"
                    >
                      {uploadDocumentsMutation.isPending ? "Uploading..." : `Upload ${files.length} File${files.length === 1 ? "" : "s"}`}
                    </Button>
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
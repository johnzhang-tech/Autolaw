import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Folder, Upload, FileText, MoreHorizontal } from "lucide-react";
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
import type { Transaction } from "@shared/schema";

const transactionSchema = z.object({
  name: z.string().min(1, "Transaction name is required"),
  address: z.string().optional(),
  transactionType: z.enum(["purchase", "sale", "refinance", "rental"]),
});

type TransactionForm = z.infer<typeof transactionSchema>;

export default function Create() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<TransactionForm>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      name: "",
      address: "",
      transactionType: "purchase",
    },
  });

  // Fetch transactions
  const { data: transactions = [], isLoading: transactionsLoading } = useQuery({
    queryKey: ["/api/transactions"],
  });

  // Create transaction mutation
  const createTransactionMutation = useMutation({
    mutationFn: async (data: TransactionForm) => {
      return await apiRequest("POST", "/api/transactions", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Transaction created successfully",
      });
      setIsTransactionDialogOpen(false);
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

  const onSubmit = (data: TransactionForm) => {
    createTransactionMutation.mutate(data);
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Transaction</h1>
            <p className="text-gray-600">Start a new real estate transaction and upload documents for analysis</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Transaction Management */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Folder className="h-5 w-5" />
                    Your Transactions
                  </CardTitle>
                  
                  <Dialog open={isTransactionDialogOpen} onOpenChange={setIsTransactionDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        New Transaction
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New Transaction</DialogTitle>
                        <DialogDescription>
                          Start a new real estate transaction to organize your documents
                        </DialogDescription>
                      </DialogHeader>
                      
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Transaction Name</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="e.g., 123 Main St Purchase" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Property Address (Optional)</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="123 Main St, City, State" />
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
                                <FormLabel>Transaction Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select transaction type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="purchase">Purchase</SelectItem>
                                    <SelectItem value="sale">Sale</SelectItem>
                                    <SelectItem value="refinance">Refinance</SelectItem>
                                    <SelectItem value="rental">Rental</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <DialogFooter>
                            <Button type="submit" disabled={createTransactionMutation.isPending}>
                              {createTransactionMutation.isPending ? "Creating..." : "Create Transaction"}
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
                    <p className="text-sm text-muted-foreground">Loading transactions...</p>
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Folder className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">No transactions yet</p>
                    <p className="text-sm">Create your first transaction to get started</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transactions.map((transaction: Transaction) => (
                      <div
                        key={transaction.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedTransaction === transaction.id
                            ? "border-primary bg-primary/5"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => setSelectedTransaction(transaction.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{transaction.name}</h4>
                            {transaction.address && (
                              <p className="text-sm text-muted-foreground">{transaction.address}</p>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                                {transaction.transactionType}
                              </span>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
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
                {selectedTransaction ? (
                  <DocumentUpload transactionId={selectedTransaction} />
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">Select a transaction first</p>
                    <p className="text-sm">Choose a transaction from the left to upload documents</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
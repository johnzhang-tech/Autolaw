import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function TestApi() {
  const [name, setName] = useState("");
  const [type, setType] = useState("purchase");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const testCreateTransaction = async () => {
    if (!name) {
      toast({
        title: "Error",
        description: "Please enter a transaction name",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      console.log('=== API TEST ===');
      console.log('Creating transaction:', { name, transactionType: type });
      
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: name,
          transactionType: type
        })
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const result = await response.json();
      console.log('Success result:', result);
      
      toast({
        title: "Success!",
        description: `Transaction "${result.name}" created with ID ${result.id}`,
      });
      
      // Clear form
      setName("");
      setType("purchase");
      
      // Refresh transactions in other pages
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      
    } catch (error: any) {
      console.error('=== API ERROR ===', error);
      toast({
        title: "Failed to create transaction",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>API Test - Create Transaction</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Transaction Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Test Transaction"
            />
          </div>
          
          <div>
            <Label htmlFor="type">Type</Label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="purchase">Purchase</option>
              <option value="sale">Sale</option>
              <option value="refinance">Refinance</option>
              <option value="rental">Rental</option>
            </select>
          </div>
          
          <Button 
            onClick={testCreateTransaction} 
            disabled={loading}
            className="w-full"
          >
            {loading ? "Creating..." : "Create Transaction (API Test)"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
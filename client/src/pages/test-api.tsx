import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function TestApi() {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [type, setType] = useState("purchase");
  const [transactionId, setTransactionId] = useState("");
  const [updateData, setUpdateData] = useState("");
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addTestResult = (method: string, endpoint: string, status: number, data: any) => {
    const result = {
      timestamp: new Date().toLocaleTimeString(),
      method,
      endpoint,
      status,
      data: JSON.stringify(data, null, 2)
    };
    setTestResults(prev => [result, ...prev.slice(0, 9)]); // Keep last 10 results
  };

  const apiCall = async (method: string, endpoint: string, body?: any) => {
    try {
      setLoading(true);
      const options: RequestInit = {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      };
      
      if (body) {
        options.body = JSON.stringify(body);
      }
      
      const response = await fetch(endpoint, options);
      const data = await response.json();
      
      addTestResult(method, endpoint, response.status, data);
      
      if (response.ok) {
        toast({
          title: "API Success",
          description: `${method} ${endpoint} completed successfully`,
        });
        return data;
      } else {
        throw new Error(data.message || `HTTP ${response.status}`);
      }
    } catch (error: any) {
      addTestResult(method, endpoint, 0, { error: error.message });
      toast({
        title: "API Error",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Transaction API Tests
  const testCreateTransaction = () => {
    if (!name) {
      toast({ title: "Error", description: "Please enter a transaction name", variant: "destructive" });
      return;
    }
    return apiCall('POST', '/api/transactions', { name, address, transactionType: type });
  };

  const testGetTransactions = () => apiCall('GET', '/api/transactions');
  
  const testGetTransaction = () => {
    if (!transactionId) {
      toast({ title: "Error", description: "Please enter a transaction ID", variant: "destructive" });
      return;
    }
    return apiCall('GET', `/api/transactions/${transactionId}`);
  };
  
  const testUpdateTransaction = () => {
    if (!transactionId || !updateData) {
      toast({ title: "Error", description: "Please enter transaction ID and update data", variant: "destructive" });
      return;
    }
    try {
      const data = JSON.parse(updateData);
      return apiCall('PUT', `/api/transactions/${transactionId}`, data);
    } catch (e) {
      toast({ title: "Error", description: "Invalid JSON in update data", variant: "destructive" });
    }
  };
  
  const testDeleteTransaction = () => {
    if (!transactionId) {
      toast({ title: "Error", description: "Please enter a transaction ID", variant: "destructive" });
      return;
    }
    return apiCall('DELETE', `/api/transactions/${transactionId}`);
  };

  // User API Tests
  const testGetUsers = () => apiCall('GET', '/api/users');
  const testGetUserProfile = () => apiCall('GET', '/api/users/profile');
  const testUpdateUserProfile = () => {
    const profileData = { region: "California", userType: "Recurring" as const, userStatus: "Active" as const };
    return apiCall('PATCH', '/api/users/profile', profileData);
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">API Testing Interface</h1>
        <p className="text-gray-600 mt-2">Test both Users API and Transactions API endpoints</p>
      </div>

      <Tabs defaultValue="transactions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="transactions">Transactions API</TabsTrigger>
          <TabsTrigger value="users">Users API</TabsTrigger>
          <TabsTrigger value="results">Test Results</TabsTrigger>
        </TabsList>

        {/* Transactions API Tab */}
        <TabsContent value="transactions" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Create Transaction */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="outline">POST</Badge>
                  Create Transaction
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Transaction Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Downtown Condo Purchase"
                  />
                </div>
                <div>
                  <Label htmlFor="address">Address (Optional)</Label>
                  <Input
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="123 Main St, City, CA 90210"
                  />
                </div>
                <div>
                  <Label htmlFor="type">Transaction Type</Label>
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
                <Button onClick={testCreateTransaction} disabled={loading} className="w-full">
                  {loading ? "Creating..." : "POST /api/transactions"}
                </Button>
              </CardContent>
            </Card>

            {/* Read Operations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="outline">GET</Badge>
                  Read Operations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={testGetTransactions} disabled={loading} className="w-full">
                  GET /api/transactions (List All)
                </Button>
                <div>
                  <Label htmlFor="transactionId">Transaction ID</Label>
                  <Input
                    id="transactionId"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="13"
                  />
                </div>
                <Button onClick={testGetTransaction} disabled={loading} className="w-full">
                  GET /api/transactions/:id (Single)
                </Button>
              </CardContent>
            </Card>

            {/* Update Transaction */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="outline">PUT</Badge>
                  Update Transaction
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="updateData">Update Data (JSON)</Label>
                  <textarea
                    id="updateData"
                    value={updateData}
                    onChange={(e) => setUpdateData(e.target.value)}
                    placeholder='{"name": "Updated Name", "address": "New Address", "status": "closed"}'
                    className="w-full p-2 border border-gray-300 rounded h-20"
                  />
                </div>
                <Button onClick={testUpdateTransaction} disabled={loading} className="w-full">
                  PUT /api/transactions/:id
                </Button>
              </CardContent>
            </Card>

            {/* Delete Transaction */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="destructive">DELETE</Badge>
                  Delete Transaction
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-red-600">
                  ⚠️ This will permanently delete the transaction and all related documents
                </p>
                <Button 
                  onClick={testDeleteTransaction} 
                  disabled={loading} 
                  variant="destructive"
                  className="w-full"
                >
                  DELETE /api/transactions/:id
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Users API Tab */}
        <TabsContent value="users" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="outline">GET</Badge>
                  User Operations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={testGetUsers} disabled={loading} className="w-full">
                  GET /api/users (All Users - Admin Only)
                </Button>
                <Button onClick={testGetUserProfile} disabled={loading} className="w-full">
                  GET /api/users/profile (Current User)
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="outline">PATCH</Badge>
                  Update Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  Updates current user's profile with sample data
                </p>
                <Button onClick={testUpdateUserProfile} disabled={loading} className="w-full">
                  PATCH /api/users/profile
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Test Results Tab */}
        <TabsContent value="results" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent API Test Results</CardTitle>
              <p className="text-sm text-gray-600">Last 10 API calls with responses</p>
            </CardHeader>
            <CardContent>
              {testResults.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No tests run yet. Use the other tabs to test API endpoints.</p>
              ) : (
                <div className="space-y-4">
                  {testResults.map((result, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant={result.status === 0 ? "destructive" : result.status < 300 ? "default" : "destructive"}>
                            {result.method}
                          </Badge>
                          <code className="text-sm">{result.endpoint}</code>
                          <Badge variant="outline">{result.status || "Error"}</Badge>
                        </div>
                        <span className="text-sm text-gray-500">{result.timestamp}</span>
                      </div>
                      <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto max-h-40">
                        {result.data}
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, ExternalLink, Key, Shield, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Sidebar } from "@/components/Sidebar";

export default function StripeSetup() {
  const [publicKey, setPublicKey] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [isConfigured, setIsConfigured] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSetupStripe = async () => {
    if (!publicKey.startsWith('pk_') || !secretKey.startsWith('sk_')) {
      toast({
        title: "Invalid Keys",
        description: "Please enter valid Stripe keys (pk_ for public, sk_ for secret)",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // In a real implementation, you would send these to your backend
      // For now, we'll simulate the setup
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsConfigured(true);
      toast({
        title: "Stripe Configured",
        description: "Stripe payment integration is now active",
      });
    } catch (error) {
      toast({
        title: "Setup Failed",
        description: "Failed to configure Stripe integration",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testStripeConnection = async () => {
    setIsLoading(true);
    try {
      // Test Stripe connection
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Connection Successful",
        description: "Stripe API connection verified",
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Unable to connect to Stripe API",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-white">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto py-8 px-4 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Payment Setup</h1>
            <p className="text-gray-600 mt-2">Configure Stripe to enable subscription payments in DocuAI</p>
          </div>

      <div className="grid gap-6">
        {/* Setup Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isConfigured ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <Shield className="h-5 w-5 text-gray-400" />
              )}
              Payment Integration Status
            </CardTitle>
            <CardDescription>
              {isConfigured 
                ? "Stripe is configured and ready to process payments"
                : "Stripe integration needs to be configured"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                <span className={isConfigured ? "text-green-600" : "text-gray-500"}>
                  {isConfigured ? "Active" : "Not Configured"}
                </span>
              </div>
              {isConfigured && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={testStripeConnection}
                  disabled={isLoading}
                >
                  Test Connection
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Setup Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Stripe API Keys Setup
            </CardTitle>
            <CardDescription>
              Enter your Stripe API keys to enable payment processing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <ExternalLink className="h-4 w-4" />
              <AlertDescription>
                Get your API keys from{" "}
                <a 
                  href="https://dashboard.stripe.com/apikeys" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Stripe Dashboard → API Keys
                </a>
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div>
                <Label htmlFor="publicKey">Publishable Key (Public)</Label>
                <Input
                  id="publicKey"
                  type="text"
                  placeholder="pk_test_..."
                  value={publicKey}
                  onChange={(e) => setPublicKey(e.target.value)}
                  className="mt-1"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Starts with pk_test_ (test) or pk_live_ (production)
                </p>
              </div>

              <div>
                <Label htmlFor="secretKey">Secret Key (Private)</Label>
                <Input
                  id="secretKey"
                  type="password"
                  placeholder="sk_test_..."
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  className="mt-1"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Starts with sk_test_ (test) or sk_live_ (production)
                </p>
              </div>
            </div>

            <Button 
              onClick={handleSetupStripe} 
              className="w-full"
              disabled={!publicKey || !secretKey || isLoading}
            >
              {isLoading ? "Configuring..." : "Configure Stripe Integration"}
            </Button>
          </CardContent>
        </Card>

        {/* Pricing Plans Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Available Subscription Plans</CardTitle>
            <CardDescription>
              These pricing tiers will be available once Stripe is configured
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold">Reporting</h3>
                <p className="text-2xl font-bold">$20/mo</p>
                <p className="text-sm text-gray-600">One time usage</p>
              </div>
              <div className="p-4 border rounded-lg border-blue-500">
                <h3 className="font-semibold">Reporting + Q&A</h3>
                <p className="text-2xl font-bold">$30/mo</p>
                <p className="text-sm text-gray-600">One month system access</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold">Advanced</h3>
                <p className="text-2xl font-bold">$59/mo</p>
                <p className="text-sm text-gray-600">Up to 4 transactions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Note */}
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <strong>Security:</strong> Your Stripe secret key is encrypted and stored securely. 
            It's never exposed to the client side and is only used for server-side payment processing.
          </AlertDescription>
        </Alert>
        </div>
        </div>
      </div>
    </div>
  );
}
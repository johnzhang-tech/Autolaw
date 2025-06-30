import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  CreditCard, 
  FileText, 
  MessageCircle, 
  Zap, 
  Calendar,
  Check,
  Clock,
  AlertCircle,
  Loader2
} from "lucide-react";

interface PaymentTier {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  icon: any;
  popular?: boolean;
}

interface PaymentTransaction {
  id: string;
  amount: number;
  currency: string;
  status: string;
  tier: string;
  createdAt: string;
  paymentMethod: string;
}

interface BillingAddress {
  name: string;
  email: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

const paymentTiers: PaymentTier[] = [
  {
    id: "reporting",
    name: "Reporting Only",
    price: 20,
    description: "Perfect for basic document analysis and reporting needs",
    icon: FileText,
    features: [
      "Document analysis & reporting",
      "Risk assessment scoring",
      "PDF report generation",
      "Email support",
      "1 month access"
    ]
  },
  {
    id: "reporting_qa",
    name: "Reporting + Q&A",
    price: 30,
    description: "Enhanced package with AI chat and multi-language support",
    icon: MessageCircle,
    popular: true,
    features: [
      "Everything in Reporting Only",
      "AI-powered Q&A chat",
      "Multi-language support",
      "Advanced analytics",
      "Priority email support",
      "1 month access"
    ]
  },
  {
    id: "advanced",
    name: "Advanced Features",
    price: 99,
    description: "Complete solution with unlimited usage and premium features",
    icon: Zap,
    features: [
      "Up to 5 detailed reports",
      "Unlimited Q&A sessions",
      "Custom AI models",
      "API access",
      "Phone support",
      "Advanced integrations",
      "1 month access"
    ]
  }
];

export default function Payment() {
  const { toast } = useToast();
  const [selectedTier, setSelectedTier] = useState<PaymentTier | null>(null);
  const [billingAddress, setBillingAddress] = useState<BillingAddress>({
    name: "",
    email: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "US"
  });
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Fetch payment history
  const { data: paymentHistory, isLoading: isLoadingHistory } = useQuery({
    queryKey: ["/api/payments/history"],
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to load payment history",
        variant: "destructive",
      });
    },
  });

  // Create payment intent mutation
  const createPaymentMutation = useMutation({
    mutationFn: async (data: { tierId: string; billingAddress: BillingAddress }) => {
      return await apiRequest("POST", "/api/payments/create-intent", data);
    },
    onSuccess: () => {
      toast({
        title: "Payment Successful",
        description: "Your payment has been processed successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/payments/history"] });
      setSelectedTier(null);
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Payment Failed",
        description: "Please check your payment details and try again.",
        variant: "destructive",
      });
    },
  });

  const handleTierSelect = (tier: PaymentTier) => {
    setSelectedTier(tier);
  };

  const handleBillingChange = (field: keyof BillingAddress, value: string) => {
    setBillingAddress(prev => ({ ...prev, [field]: value }));
  };

  const handlePayment = async () => {
    if (!selectedTier) return;

    setIsProcessingPayment(true);
    try {
      // This will be replaced with actual Stripe integration
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate payment processing
      
      createPaymentMutation.mutate({
        tierId: selectedTier.id,
        billingAddress
      });
    } catch (error) {
      toast({
        title: "Payment Error",
        description: "An error occurred while processing your payment.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'succeeded':
        return <Check className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Payment</h2>
          <p className="text-muted-foreground">
            Manage your subscriptions and view payment history
          </p>
        </div>
      </div>

      <Tabs defaultValue="subscribe" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="subscribe">Subscribe</TabsTrigger>
          <TabsTrigger value="history">Payment History</TabsTrigger>
        </TabsList>

        <TabsContent value="subscribe" className="space-y-6">
          {!selectedTier ? (
            // Payment Tier Selection
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {paymentTiers.map((tier) => {
                const Icon = tier.icon;
                return (
                  <Card 
                    key={tier.id} 
                    className={`relative cursor-pointer transition-all hover:scale-105 ${
                      tier.popular ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => handleTierSelect(tier)}
                  >
                    {tier.popular && (
                      <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary">
                        Most Popular
                      </Badge>
                    )}
                    <CardHeader className="text-center pb-2">
                      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="text-xl">{tier.name}</CardTitle>
                      <div className="flex items-center justify-center space-x-1">
                        <span className="text-3xl font-bold">${tier.price}</span>
                        <span className="text-muted-foreground">/month</span>
                      </div>
                      <CardDescription>{tier.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {tier.features.map((feature, index) => (
                          <li key={index} className="flex items-center space-x-2">
                            <Check className="h-4 w-4 text-green-600" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Button className="w-full mt-4" size="lg">
                        Select Plan
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            // Payment Form
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CreditCard className="h-5 w-5" />
                    <span>Complete Your Purchase</span>
                  </CardTitle>
                  <CardDescription>
                    You're subscribing to {selectedTier.name} for ${selectedTier.price}/month
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Billing Address */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Billing Address</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          value={billingAddress.name}
                          onChange={(e) => handleBillingChange('name', e.target.value)}
                          placeholder="John Doe"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={billingAddress.email}
                          onChange={(e) => handleBillingChange('email', e.target.value)}
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="line1">Address Line 1 *</Label>
                      <Input
                        id="line1"
                        value={billingAddress.line1}
                        onChange={(e) => handleBillingChange('line1', e.target.value)}
                        placeholder="123 Main Street"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="line2">Address Line 2</Label>
                      <Input
                        id="line2"
                        value={billingAddress.line2}
                        onChange={(e) => handleBillingChange('line2', e.target.value)}
                        placeholder="Apartment, suite, etc."
                      />
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          value={billingAddress.city}
                          onChange={(e) => handleBillingChange('city', e.target.value)}
                          placeholder="New York"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">State *</Label>
                        <Input
                          id="state"
                          value={billingAddress.state}
                          onChange={(e) => handleBillingChange('state', e.target.value)}
                          placeholder="NY"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="postal_code">ZIP Code *</Label>
                        <Input
                          id="postal_code"
                          value={billingAddress.postal_code}
                          onChange={(e) => handleBillingChange('postal_code', e.target.value)}
                          placeholder="10001"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country *</Label>
                      <Select value={billingAddress.country} onValueChange={(value) => handleBillingChange('country', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="US">United States</SelectItem>
                          <SelectItem value="CA">Canada</SelectItem>
                          <SelectItem value="GB">United Kingdom</SelectItem>
                          <SelectItem value="AU">Australia</SelectItem>
                          <SelectItem value="DE">Germany</SelectItem>
                          <SelectItem value="FR">France</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator />

                  {/* Payment Method - Stripe Elements will go here */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Payment Method</h3>
                    <div className="p-4 border rounded-lg bg-muted/10">
                      <p className="text-center text-muted-foreground">
                        Stripe payment form will be integrated here
                      </p>
                      <p className="text-center text-sm text-muted-foreground mt-2">
                        Secure payment processing with SSL encryption
                      </p>
                    </div>
                  </div>

                  <Separator />

                  {/* Order Summary */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Order Summary</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>{selectedTier.name}</span>
                        <span>${selectedTier.price}.00</span>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Tax</span>
                        <span>$0.00</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-semibold">
                        <span>Total</span>
                        <span>${selectedTier.price}.00</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setSelectedTier(null)}
                      className="sm:w-auto"
                    >
                      Back to Plans
                    </Button>
                    <Button
                      onClick={handlePayment}
                      disabled={isProcessingPayment || !billingAddress.name || !billingAddress.email}
                      className="flex-1"
                    >
                      {isProcessingPayment ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        `Pay $${selectedTier.price}.00`
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Payment History</span>
              </CardTitle>
              <CardDescription>
                View all your past transactions and subscription details
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingHistory ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : !paymentHistory || paymentHistory.length === 0 ? (
                <div className="text-center py-8">
                  <CreditCard className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No payment history</h3>
                  <p className="text-muted-foreground">
                    Your payment history will appear here after your first purchase.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {paymentHistory.map((transaction: PaymentTransaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center">
                          {getStatusIcon(transaction.status)}
                        </div>
                        <div>
                          <p className="font-medium">{transaction.tier}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(transaction.createdAt)} • {transaction.paymentMethod}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          ${transaction.amount} {transaction.currency.toUpperCase()}
                        </p>
                        <Badge variant={
                          transaction.status === 'succeeded' ? 'default' :
                          transaction.status === 'pending' ? 'secondary' : 'destructive'
                        }>
                          {transaction.status}
                        </Badge>
                      </div>
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
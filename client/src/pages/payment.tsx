import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
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

// Load Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY!);

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

// Payment tiers based on manage.tsx
const paymentTiers: PaymentTier[] = [
  {
    id: "reporting",
    name: "Reporting",
    price: 20,
    description: "Perfect for basic document analysis and reporting needs",
    icon: FileText,
    features: [
      "Document analysis",
      "Risk assessment reports",
      "PDF generation",
      "Email support",
      "Basic analytics"
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
      "Everything in Reporting",
      "AI-powered Q&A chat",
      "Multi-language support",
      "Advanced analytics",
      "Priority email support",
      "API access"
    ]
  },
  {
    id: "subscription",
    name: "Subscription",
    price: 59,
    description: "Complete solution with unlimited usage and premium features",
    icon: Zap,
    features: [
      "Everything in Professional",
      "Up to 4 Transactions",
      "Unlimited Q&A sessions",
      "Custom AI models",
      "API access",
      "Phone support",
      "Advanced integrations"
    ]
  }
];

// Stripe Payment Form Component
function StripePaymentForm({ selectedTier, onSuccess, onError }: {
  selectedTier: PaymentTier;
  onSuccess: () => void;
  onError: (error: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setCardError(null);

    try {
      // Create payment intent
      const response = await apiRequest("POST", "/api/create-payment-intent", {
        amount: selectedTier.price,
        currency: "usd",
        metadata: {
          tier: selectedTier.id,
          tierName: selectedTier.name
        }
      });

      const { clientSecret } = await response.json();

      // Confirm payment
      const { error: paymentError } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
        }
      });

      if (paymentError) {
        setCardError(paymentError.message || "Payment failed");
        onError(paymentError.message || "Payment failed");
      } else {
        onSuccess();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Payment failed";
      setCardError(errorMessage);
      onError(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Card Information</label>
        <div className="p-3 border rounded-lg">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
            onChange={(event) => {
              setCardError(event.error ? event.error.message : null);
            }}
          />
        </div>
        {cardError && (
          <div className="text-sm text-red-600 flex items-center mt-2">
            <AlertCircle className="h-4 w-4 mr-1" />
            {cardError}
          </div>
        )}
      </div>
      
      <Button 
        type="submit" 
        className="w-full"
        disabled={!stripe || processing}
      >
        {processing ? (
          <div className="flex items-center">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Processing...
          </div>
        ) : (
          `Pay $${selectedTier.price}`
        )}
      </Button>
    </form>
  );
}

function Payment() {
  const { toast } = useToast();
  const [selectedTier, setSelectedTier] = useState<PaymentTier | null>(null);

  // Fetch payment history
  const { data: paymentHistory, isLoading: isLoadingHistory } = useQuery<PaymentTransaction[]>({
    queryKey: ["/api/payments/history"],
  });

  const handleTierSelect = (tier: PaymentTier) => {
    setSelectedTier(tier);
  };

  const handlePaymentSuccess = () => {
    toast({
      title: "Payment Successful",
      description: "Your payment has been processed successfully!",
    });
    queryClient.invalidateQueries({ queryKey: ["/api/payments/history"] });
    setSelectedTier(null);
  };

  const handlePaymentError = (error: string) => {
    toast({
      title: "Payment Failed",
      description: error,
      variant: "destructive",
    });
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
    <Elements stripe={stripePromise}>
      <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Payment & Billing</h2>
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
                          <span className="text-muted-foreground">{tier.id === 'subscription' ? '/month' : '/One time'}</span>
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
                      You're purchasing {selectedTier.name} for ${selectedTier.price}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
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

                    <Separator />

                    {/* Stripe Payment Form */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Payment Method</h3>
                      <StripePaymentForm 
                        selectedTier={selectedTier}
                        onSuccess={handlePaymentSuccess}
                        onError={handlePaymentError}
                      />
                    </div>

                    <Separator />

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setSelectedTier(null)}
                        className="sm:w-auto"
                      >
                        Back to Plans
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
                    {paymentHistory.map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          {getStatusIcon(payment.status)}
                          <div>
                            <div className="font-medium">{payment.tier}</div>
                            <div className="text-sm text-muted-foreground">
                              {formatDate(payment.createdAt)} • {payment.paymentMethod}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            ${payment.amount.toFixed(2)} {payment.currency.toUpperCase()}
                          </div>
                          <div className="text-sm text-muted-foreground capitalize">
                            {payment.status}
                          </div>
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
    </Elements>
  );
}

export default Payment;
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Check, X, Star, Zap, Shield, Users, FileText, MessageSquare, BarChart3, Cloud, Smartphone, Bot } from "lucide-react";
import { useState } from "react";

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  badge?: string;
  badgeColor?: "default" | "secondary" | "destructive" | "outline";
  features: {
    category: string;
    items: Array<{
      name: string;
      included: boolean | string | number;
      tooltip?: string;
    }>;
  }[];
  cta: string;
  ctaVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  popular?: boolean;
}

const pricingPlans: PricingPlan[] = [
  {
    id: "starter",
    name: "Starter",
    price: 0,
    period: "Forever Free",
    description: "Perfect for individual real estate professionals getting started with AI document analysis",
    features: [
      {
        category: "Document Analysis",
        items: [
          { name: "Document uploads per month", included: 25 },
          { name: "File size limit", included: "5MB" },
          { name: "Supported formats", included: "PDF, DOC, DOCX" },
          { name: "Basic AI analysis", included: true },
          { name: "Risk scoring", included: true },
          { name: "HOA document expertise", included: true },
          { name: "Advanced OCR", included: false },
          { name: "Batch processing", included: false },
        ]
      },
      {
        category: "AI Chat & Q&A",
        items: [
          { name: "Chat sessions per month", included: 50 },
          { name: "Messages per session", included: 20 },
          { name: "Document-specific Q&A", included: true },
          { name: "General real estate Q&A", included: true },
          { name: "Chat history", included: "7 days" },
          { name: "Advanced prompts", included: false },
          { name: "Custom AI models", included: false },
        ]
      },
      {
        category: "Dashboard & Analytics",
        items: [
          { name: "Basic dashboard", included: true },
          { name: "Risk alerts", included: true },
          { name: "Document categorization", included: true },
          { name: "Export reports", included: false },
          { name: "Advanced analytics", included: false },
          { name: "Custom charts", included: false },
        ]
      },
      {
        category: "Support & Integration",
        items: [
          { name: "Email support", included: true },
          { name: "Knowledge base access", included: true },
          { name: "Mobile app", included: true },
          { name: "API access", included: false },
          { name: "Priority support", included: false },
          { name: "Phone support", included: false },
        ]
      }
    ],
    cta: "Get Started Free",
    ctaVariant: "outline"
  },
  {
    id: "professional",
    name: "Professional",
    price: 29,
    period: "per month",
    description: "Ideal for active real estate professionals and small teams handling multiple transactions",
    badge: "Most Popular",
    badgeColor: "default",
    popular: true,
    features: [
      {
        category: "Document Analysis",
        items: [
          { name: "Document uploads per month", included: 250 },
          { name: "File size limit", included: "25MB" },
          { name: "Supported formats", included: "PDF, DOC, DOCX, TXT, Images" },
          { name: "Basic AI analysis", included: true },
          { name: "Risk scoring", included: true },
          { name: "HOA document expertise", included: true },
          { name: "Advanced OCR", included: true },
          { name: "Batch processing", included: "Up to 10 files" },
        ]
      },
      {
        category: "AI Chat & Q&A",
        items: [
          { name: "Chat sessions per month", included: 500 },
          { name: "Messages per session", included: 100 },
          { name: "Document-specific Q&A", included: true },
          { name: "General real estate Q&A", included: true },
          { name: "Chat history", included: "90 days" },
          { name: "Advanced prompts", included: true },
          { name: "Custom AI models", included: false },
        ]
      },
      {
        category: "Dashboard & Analytics",
        items: [
          { name: "Basic dashboard", included: true },
          { name: "Risk alerts", included: true },
          { name: "Document categorization", included: true },
          { name: "Export reports", included: "PDF & Excel" },
          { name: "Advanced analytics", included: true },
          { name: "Custom charts", included: true },
        ]
      },
      {
        category: "Support & Integration",
        items: [
          { name: "Email support", included: true },
          { name: "Knowledge base access", included: true },
          { name: "Mobile app", included: true },
          { name: "API access", included: "Basic" },
          { name: "Priority support", included: true },
          { name: "Phone support", included: false },
        ]
      }
    ],
    cta: "Start Professional Trial",
    ctaVariant: "default"
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 99,
    period: "per month",
    description: "Comprehensive solution for real estate teams, brokerages, and organizations with advanced needs",
    badge: "Best Value",
    badgeColor: "secondary",
    features: [
      {
        category: "Document Analysis",
        items: [
          { name: "Document uploads per month", included: "Unlimited" },
          { name: "File size limit", included: "100MB" },
          { name: "Supported formats", included: "All formats + Custom" },
          { name: "Basic AI analysis", included: true },
          { name: "Risk scoring", included: true },
          { name: "HOA document expertise", included: true },
          { name: "Advanced OCR", included: true },
          { name: "Batch processing", included: "Unlimited" },
        ]
      },
      {
        category: "AI Chat & Q&A",
        items: [
          { name: "Chat sessions per month", included: "Unlimited" },
          { name: "Messages per session", included: "Unlimited" },
          { name: "Document-specific Q&A", included: true },
          { name: "General real estate Q&A", included: true },
          { name: "Chat history", included: "Unlimited" },
          { name: "Advanced prompts", included: true },
          { name: "Custom AI models", included: true },
        ]
      },
      {
        category: "Dashboard & Analytics",
        items: [
          { name: "Basic dashboard", included: true },
          { name: "Risk alerts", included: true },
          { name: "Document categorization", included: true },
          { name: "Export reports", included: "All formats" },
          { name: "Advanced analytics", included: true },
          { name: "Custom charts", included: true },
        ]
      },
      {
        category: "Support & Integration",
        items: [
          { name: "Email support", included: true },
          { name: "Knowledge base access", included: true },
          { name: "Mobile app", included: true },
          { name: "API access", included: "Full API" },
          { name: "Priority support", included: true },
          { name: "Phone support", included: true },
        ]
      }
    ],
    cta: "Contact Sales",
    ctaVariant: "secondary"
  }
];

const additionalFeatures = [
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Bank-level encryption, SOC 2 compliance, and advanced data protection for all plans"
  },
  {
    icon: Smartphone,
    title: "Mobile Optimized",
    description: "Native mobile experience with offline capabilities and PWA support"
  },
  {
    icon: Bot,
    title: "AI-Powered",
    description: "Advanced OpenAI GPT-4o integration with real estate document expertise"
  },
  {
    icon: Cloud,
    title: "Cloud Infrastructure",
    description: "99.9% uptime with automatic backups and global CDN for fast loading"
  }
];

const faqs = [
  {
    question: "Can I upgrade or downgrade my plan anytime?",
    answer: "Yes, you can change your plan at any time. Upgrades take effect immediately, and downgrades take effect at the next billing cycle. No setup fees or cancellation penalties."
  },
  {
    question: "What types of real estate documents are supported?",
    answer: "DocuAI specializes in HOA documents, purchase contracts, inspection reports, financial statements, legal documents, and more. Our AI is trained specifically for real estate document analysis."
  },
  {
    question: "Is my data secure and private?",
    answer: "Absolutely. We use enterprise-grade encryption, comply with industry standards, and never share your documents or data with third parties. All processing is done securely in the cloud."
  },
  {
    question: "Do you offer team or brokerage discounts?",
    answer: "Yes! Enterprise plans include team management features, and we offer volume discounts for brokerages with 10+ agents. Contact our sales team for custom pricing."
  },
  {
    question: "Can I try before I buy?",
    answer: "Definitely! Our Starter plan is free forever with no credit card required. Professional and Enterprise plans include a 14-day free trial with full access to all features."
  },
  {
    question: "What happens if I exceed my monthly limits?",
    answer: "You'll receive notifications as you approach your limits. You can upgrade your plan anytime, or additional usage is available at pay-as-you-go rates: $0.10 per document, $0.05 per chat message."
  }
];

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const formatFeatureValue = (value: boolean | string | number): string => {
    if (typeof value === "boolean") return value ? "✓" : "✗";
    return value.toString();
  };

  const getFeatureIcon = (included: boolean | string | number) => {
    if (typeof included === "boolean") {
      return included ? (
        <Check className="h-4 w-4 text-green-600" />
      ) : (
        <X className="h-4 w-4 text-gray-400" />
      );
    }
    return <Check className="h-4 w-4 text-green-600" />;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-b from-blue-50 to-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Choose the perfect plan for your real estate document analysis needs. 
            All plans include our core AI features with no hidden fees.
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center mb-8">
            <span className={`mr-3 ${billingCycle === "monthly" ? "text-gray-900 font-medium" : "text-gray-500"}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === "monthly" ? "annual" : "monthly")}
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  billingCycle === "annual" ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <span className={`ml-3 ${billingCycle === "annual" ? "text-gray-900 font-medium" : "text-gray-500"}`}>
              Annual
              <Badge className="ml-2 bg-green-100 text-green-800 hover:bg-green-100">
                Save 20%
              </Badge>
            </span>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan) => (
              <Card 
                key={plan.id} 
                className={`relative ${plan.popular ? "border-blue-500 shadow-lg scale-105 z-10" : "border-gray-200"}`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className={`px-3 py-1 ${
                      plan.badgeColor === "default" ? "bg-blue-600 text-white hover:bg-blue-600" :
                      plan.badgeColor === "secondary" ? "bg-green-600 text-white hover:bg-green-600" :
                      ""
                    }`}>
                      {plan.badge}
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900">
                      ${billingCycle === "annual" && plan.price > 0 ? Math.round(plan.price * 0.8) : plan.price}
                    </span>
                    {plan.period !== "Forever Free" && (
                      <span className="text-gray-500">
                        /{billingCycle === "annual" ? "month, billed annually" : plan.period}
                      </span>
                    )}
                    {plan.period === "Forever Free" && (
                      <span className="text-gray-500 block">{plan.period}</span>
                    )}
                  </div>
                  <CardDescription className="mt-4 text-base">
                    {plan.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  {plan.features.map((category, categoryIndex) => (
                    <div key={categoryIndex}>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        {category.category === "Document Analysis" && <FileText className="h-4 w-4 mr-2" />}
                        {category.category === "AI Chat & Q&A" && <MessageSquare className="h-4 w-4 mr-2" />}
                        {category.category === "Dashboard & Analytics" && <BarChart3 className="h-4 w-4 mr-2" />}
                        {category.category === "Support & Integration" && <Users className="h-4 w-4 mr-2" />}
                        {category.category}
                      </h4>
                      <ul className="space-y-2 text-sm">
                        {category.items.map((item, itemIndex) => (
                          <li key={itemIndex} className="flex items-center">
                            {getFeatureIcon(item.included)}
                            <span className="ml-3 flex-1">
                              {item.name}
                              {typeof item.included !== "boolean" && (
                                <span className="font-medium text-blue-600 ml-2">
                                  {formatFeatureValue(item.included)}
                                </span>
                              )}
                            </span>
                          </li>
                        ))}
                      </ul>
                      {categoryIndex < plan.features.length - 1 && (
                        <Separator className="mt-4" />
                      )}
                    </div>
                  ))}
                </CardContent>

                <CardFooter>
                  <Button 
                    className="w-full h-12 text-base font-medium"
                    variant={plan.ctaVariant}
                  >
                    {plan.cta}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Features */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            What makes DocuAI different?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {additionalFeatures.map((feature, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <feature.icon className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Frequently asked questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index} className="border-gray-200">
                <CardHeader 
                  className="cursor-pointer"
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                >
                  <CardTitle className="text-left text-lg font-medium flex items-center justify-between">
                    {faq.question}
                    <div className={`transform transition-transform ${expandedFaq === index ? "rotate-180" : ""}`}>
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </CardTitle>
                </CardHeader>
                {expandedFaq === index && (
                  <CardContent className="pt-0">
                    <p className="text-gray-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-4">
            Ready to transform your document analysis?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of real estate professionals who trust DocuAI for intelligent document review.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8">
              Start Free Trial
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 px-8">
              Schedule Demo
            </Button>
          </div>
          <p className="text-sm text-blue-200 mt-4">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </div>
    </div>
  );
}
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AuthModal } from "@/components/AuthModal";
import { useAuth } from "@/hooks/useAuth";
import { 
  FileText, 
  AlertTriangle, 
  BarChart3, 
  MessageCircleQuestion, 
  Workflow, 
  Shield, 
  Zap, 
  Play, 
  Menu,
  Check
} from "lucide-react";

export default function Landing() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { login } = useAuth();

  // Scroll navigation handlers - completely isolated from router
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
    setIsMobileMenuOpen(false); // Close mobile menu after navigation
  };

  const openSignInModal = () => {
    setAuthMode("signin");
    setIsAuthModalOpen(true);
  };

  const openSignUpModal = () => {
    setAuthMode("signup");
    setIsAuthModalOpen(true);
  };

  const features = [
    {
      icon: FileText,
      title: "Smart Document Analysis",
      description: "Automatically extract key information from contracts, leases, and property documents with 99.5% accuracy.",
      color: "bg-blue-100 text-primary"
    },
    {
      icon: AlertTriangle,
      title: "Risk Detection", 
      description: "Identify potential issues, missing clauses, and compliance risks before they become problems.",
      color: "bg-red-100 text-red-600"
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description: "Get comprehensive insights and trends across your portfolio with interactive visualizations.",
      color: "bg-emerald-100 text-emerald-600"
    },
    {
      icon: MessageCircleQuestion,
      title: "Intelligent Q&A",
      description: "Ask natural language questions about your documents and get instant, accurate answers.",
      color: "bg-purple-100 text-purple-600"
    },
    {
      icon: Workflow,
      title: "Workflow Automation",
      description: "Streamline your processes with automated routing, approvals, and notifications.",
      color: "bg-orange-100 text-orange-600"
    },
    {
      icon: Shield,
      title: "Compliance Monitoring",
      description: "Stay compliant with real-time monitoring and alerts for regulatory changes and requirements.",
      color: "bg-blue-100 text-primary"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <FileText className="h-8 w-8 text-primary mr-2" />
                <span className="text-xl font-bold text-slate-900">DocuAI</span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <button 
                  onClick={() => scrollToSection('features')}
                  className="text-slate-600 hover:text-slate-900 px-3 py-2 text-sm font-medium transition-colors"
                >
                  Features
                </button>
                <button 
                  onClick={() => scrollToSection('how-it-works')}
                  className="text-slate-600 hover:text-slate-900 px-3 py-2 text-sm font-medium transition-colors"
                >
                  How It Works
                </button>
                <button 
                  onClick={() => scrollToSection('pricing')}
                  className="text-slate-600 hover:text-slate-900 px-3 py-2 text-sm font-medium transition-colors"
                >
                  Pricing
                </button>
              </div>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={openSignInModal}
                className="hidden sm:inline-flex"
              >
                Sign In
              </Button>
              <Button onClick={openSignUpModal}>
                Get Started
              </Button>
              
              {/* Mobile menu button */}
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                  <nav className="flex flex-col space-y-4 mt-8">
                    <button 
                      onClick={() => scrollToSection('features')}
                      className="text-slate-600 hover:text-slate-900 py-2 text-base font-medium"
                    >
                      Features
                    </button>
                    <button 
                      onClick={() => scrollToSection('how-it-works')}
                      className="text-slate-600 hover:text-slate-900 py-2 text-base font-medium"
                    >
                      How It Works
                    </button>
                    <button 
                      onClick={() => scrollToSection('pricing')}
                      className="text-slate-600 hover:text-slate-900 py-2 text-base font-medium"
                    >
                      Pricing
                    </button>
                    <Button variant="outline" onClick={openSignInModal} className="sm:hidden justify-start">
                      Sign In
                    </Button>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </nav>
      </header>

      <main className="overflow-hidden">
        {/* Hero Section */}
        <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-28 lg:pt-32 lg:pb-36">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              {/* Main heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
                Intelligent
                <span className="text-primary"> Document Analysis</span>
                <br />for Real Estate
              </h1>
              
              {/* Tagline */}
              <p className="mt-6 max-w-3xl mx-auto text-lg sm:text-xl text-slate-600 leading-relaxed">
                Transform your real estate workflow with AI-powered document review, automated analysis, and intelligent Q&A. 
                Trust in technology that understands your business.
              </p>

              {/* CTA Buttons */}
              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button size="lg" onClick={login} className="inline-flex items-center px-8 py-4 text-lg font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                  <Zap className="w-5 h-5 mr-2" />
                  Enter Demo
                </Button>
                <Button variant="outline" size="lg" onClick={openSignUpModal} className="inline-flex items-center px-8 py-4 text-lg font-medium rounded-xl">
                  <Play className="w-5 h-5 mr-2" />
                  Get Started
                </Button>
              </div>

              {/* Trust indicators */}
              <div className="mt-12 text-sm text-slate-500">
                <p className="mb-4">Trusted by 500+ real estate professionals</p>
                <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-8 opacity-60">
                  <span className="font-semibold">🏢 Enterprise Ready</span>
                  <span className="font-semibold">🔒 SOC 2 Compliant</span>
                  <span className="font-semibold">⚡ 99.9% Uptime</span>
                </div>
              </div>
            </div>
          </div>

          {/* Background decorations */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-50"></div>
            <div className="absolute bottom-0 right-0 w-72 h-72 bg-emerald-50 rounded-full blur-3xl opacity-50"></div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                Powered by Advanced AI
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Our intelligent platform transforms complex real estate documents into actionable insights, 
                saving you time and reducing risk.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow">
                  <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mb-6`}>
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-4">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                How It Works
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Get started in minutes with our simple three-step process
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Step 1 */}
              <div className="text-center">
                <div className="relative">
                  <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <span className="text-2xl font-bold text-white">1</span>
                  </div>
                  {/* Connection line for desktop */}
                  <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-slate-200" style={{width: 'calc(100% - 2rem)'}}></div>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-4">Upload Documents</h3>
                <p className="text-slate-600 leading-relaxed">
                  Simply drag and drop your real estate documents or import from your existing systems.
                </p>
              </div>

              {/* Step 2 */}
              <div className="text-center">
                <div className="relative">
                  <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <span className="text-2xl font-bold text-white">2</span>
                  </div>
                  {/* Connection line for desktop */}
                  <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-slate-200" style={{width: 'calc(100% - 2rem)'}}></div>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-4">AI Analysis</h3>
                <p className="text-slate-600 leading-relaxed">
                  Our AI engine analyzes your documents, extracting key information and identifying risks.
                </p>
              </div>

              {/* Step 3 */}
              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-white">3</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-4">Get Insights</h3>
                <p className="text-slate-600 leading-relaxed">
                  Review comprehensive reports, ask questions, and make informed decisions with confidence.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Ready to Transform Your Document Workflow?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join hundreds of real estate professionals who trust DocuAI to streamline their document analysis and reduce risk.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="outline" className="px-8 py-4 text-lg font-medium rounded-xl border-2 border-white text-white bg-transparent hover:bg-white hover:text-primary">
                Contact us
              </Button>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                Simple, transparent pricing
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">
                Choose the perfect plan for your real estate document analysis needs. All plans include our core AI features with no hidden fees.
              </p>
              
              {/* Monthly/Annual Toggle */}
              <div className="flex items-center justify-center space-x-4 mb-12">
                <span className="text-slate-600">Monthly</span>
                <div className="relative">
                  <input type="checkbox" className="sr-only" />
                  <div className="w-12 h-6 bg-slate-300 rounded-full relative cursor-pointer">
                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform"></div>
                  </div>
                </div>
                <span className="text-slate-600">Annual</span>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
                  Save 20%
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Starter Plan */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-slate-900 mb-4">Starter</h3>
                  <div className="mb-6">
                    <span className="text-5xl font-bold text-slate-900">$0</span>
                    <div className="text-slate-600 mt-1">Forever Free</div>
                  </div>
                  <ul className="space-y-4 mb-8 text-left">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-600">One time usage</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-600">50 chat sessions</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-600">Basic analytics</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-600">Normal support is included</span>
                    </li>
                  </ul>
                  <Button variant="outline" className="w-full">
                    Get Started Free
                  </Button>
                </div>
              </div>

              {/* Professional Plan */}
              <div className="bg-white rounded-2xl shadow-lg border-2 border-blue-500 p-8 relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-slate-900 mb-4">Professional</h3>
                  <div className="mb-6">
                    <span className="text-5xl font-bold text-slate-900">$29</span>
                    <span className="text-slate-600">/per month</span>
                    <div className="text-slate-600 mt-1">Ideal for active real estate professionals and small teams handling multiple</div>
                  </div>
                  <ul className="space-y-4 mb-8 text-left">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-600">One month system access</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-600">500 chat sessions</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-600">Advanced analytics</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-600">API access</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-600">For occursion users</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-600">Priority support</span>
                    </li>
                  </ul>
                  <Button className="w-full bg-blue-500 hover:bg-blue-600" onClick={openSignUpModal}>
                    Get Started
                  </Button>
                </div>
              </div>

              {/* Enterprise Plan */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 relative">
                <div className="absolute -top-4 right-4">
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Best Value
                  </span>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-slate-900 mb-4">Enterprise</h3>
                  <div className="mb-6">
                    <span className="text-5xl font-bold text-slate-900">$59</span>
                    <span className="text-slate-600">/per month</span>
                    <div className="text-slate-600 mt-1">Comprehensive solution for real estate</div>
                  </div>
                  <ul className="space-y-4 mb-8 text-left">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-600">Up to 4 Transactions</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-600">Unlimited chat sessions</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-600">Full API access</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-600">Platium Support</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-600">Custom integrations</span>
                    </li>
                  </ul>
                  <Button variant="outline" className="w-full">
                    Contact us
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm text-slate-500">
              © 2024 DocuAI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Authentication Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultMode={authMode}
      />
    </div>
  );
}

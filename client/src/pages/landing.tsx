import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
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
  X
} from "lucide-react";

export default function Landing() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSignIn, setIsSignIn] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const openSignInModal = () => {
    setIsSignIn(true);
    setIsAuthModalOpen(true);
  };

  const openSignUpModal = () => {
    setIsSignIn(false);
    setIsAuthModalOpen(true);
  };

  const handleSSOLogin = (provider: string) => {
    // Redirect to OAuth login
    window.location.href = "/api/login";
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
                <a href="#features" className="text-slate-600 hover:text-slate-900 px-3 py-2 text-sm font-medium transition-colors">
                  Features
                </a>
                <a href="#how-it-works" className="text-slate-600 hover:text-slate-900 px-3 py-2 text-sm font-medium transition-colors">
                  How It Works
                </a>
                <a href="#pricing" className="text-slate-600 hover:text-slate-900 px-3 py-2 text-sm font-medium transition-colors">
                  Pricing
                </a>
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
                    <a href="#features" className="text-slate-600 hover:text-slate-900 py-2 text-base font-medium">
                      Features
                    </a>
                    <a href="#how-it-works" className="text-slate-600 hover:text-slate-900 py-2 text-base font-medium">
                      How It Works
                    </a>
                    <a href="#pricing" className="text-slate-600 hover:text-slate-900 py-2 text-base font-medium">
                      Pricing
                    </a>
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
                <Button size="lg" onClick={openSignUpModal} className="inline-flex items-center px-8 py-4 text-lg font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                  <Zap className="w-5 h-5 mr-2" />
                  Start Free Trial
                </Button>
                <Button variant="outline" size="lg" className="inline-flex items-center px-8 py-4 text-lg font-medium rounded-xl">
                  <Play className="w-5 h-5 mr-2" />
                  Watch Demo
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
              <Button size="lg" variant="secondary" onClick={openSignUpModal} className="px-8 py-4 text-lg font-medium rounded-xl bg-white text-primary hover:bg-slate-50">
                Start Free 14-Day Trial
              </Button>
              <Button size="lg" variant="outline" className="px-8 py-4 text-lg font-medium rounded-xl border-2 border-white text-white bg-transparent hover:bg-white hover:text-primary">
                Contact Sales
              </Button>
            </div>
            <p className="text-blue-200 text-sm mt-6">No credit card required • Full access • Cancel anytime</p>
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
      <Dialog open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isSignIn ? 'Sign In' : 'Create Account'}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* SSO Buttons */}
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleSSOLogin('google')}
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleSSOLogin('outlook')}
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7.5 6.5a4.5 4.5 0 004.5 4.5 4.5 4.5 0 004.5-4.5A4.5 4.5 0 0012 2a4.5 4.5 0 00-4.5 4.5z"/>
                  <path d="M12 13c-3.866 0-7 3.134-7 7h14c0-3.866-3.134-7-7-7z"/>
                </svg>
                Continue with Outlook
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleSSOLogin('yahoo')}
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-1.5-6L12 7.5 15.5 11 14 17h-4z"/>
                </svg>
                Continue with Yahoo
              </Button>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
              </div>
            </div>

            {/* Email Form */}
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input 
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  required
                />
              </div>

              <Button type="submit" className="w-full">
                {isSignIn ? 'Sign In' : 'Create Account'}
              </Button>
            </form>

            <p className="text-xs text-muted-foreground text-center">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

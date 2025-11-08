import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AuthModal } from "@/components/AuthModal";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
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
  Check,
  ChevronDown,
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
        behavior: "smooth",
        block: "start",
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
      title: "Instant Clarity",
      description:
        "Analyze entire packets—tens of documents, hundreds of pages—covering 50+ critical dimensions like dues, reserves, insurance coverage, rental rules, pet restrictions, and maintenance responsibilities. Example: See exactly what’s included in monthly dues and who is responsible for roof repairs, then ask “Given what’s covered, what ongoing costs will I still be responsible for?”",
      color: "bg-blue-100 text-primary",
    },
    {
      icon: AlertTriangle,
      title: "Accelerated Due Diligence",
      description:
        "Identify key risks, protections, and terms in hours, not days—helping you make informed decisions faster and with confidence. Example: Instantly flag that an HOA’s reserves are only 35% funded or that rental caps are already met, then ask “How soon might the HOA need to raise dues or levy a special assessment?”",
      color: "bg-red-100 text-red-600",
    },
    {
      icon: Workflow,
      title: "Cross-Document Insights",
      description:
        "Spot connections, contradictions, and hidden clauses across multiple documents that could impact ownership or future costs. Example: Discover that a short-term rental limit in the CC&Rs is reinforced by a recent meeting minute note, then ask “Are there any recent rule changes or board actions that affect my intended use of the property?”",
      color: "bg-emerald-100 text-emerald-600",
    },
    {
      icon: MessageCircleQuestion,
      title: " Interactive Guidance",
      description:
        "Search, compare, and chat with your documents to get answers—and learn what questions you should be asking before making a commitment. Example: Ask if you can install solar panels and see all related clauses, then follow up with “What other rules or requirements could indirectly affect installing solar panels?”",
      color: "bg-purple-100 text-purple-600",
    },
    {
      icon: Shield,
      title: "Fact-Based Intelligence",
      description:
        "Every insight is tied to its source and enhanced with updated regulations, best-practice benchmarks, and market norms—giving context beyond the HOA packet itself. Example: See how a reserve funding level compares to state standards, then ask “How does this HOA’s reserve funding compare to industry norms, and what does that mean for my risk?”",
      color: "bg-orange-100 text-orange-600",
    },
    {
      icon: BarChart3,
      title: "Actionable, Distilled Reporting",
      description:
        "We analyze 50+ dimensions comprehensively, but deliver a distilled, decision-ready view that never omits critical details. Example: Get a one-page summary of the five most urgent issues, then ask “Which three should I address before making an offer?”",
      color: "bg-blue-100 text-primary",
    },
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
                <img
                  src="/altosera-logo.png"
                  alt="Altosera"
                  className="h-10 w-auto"
                  onError={(e) => {
                    console.error("Logo failed to load on landing page");
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                {/* Product Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger className="text-slate-600 hover:text-slate-900 px-3 py-2 text-sm font-medium transition-colors flex items-center">
                    Product <ChevronDown className="ml-1 h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem asChild>
                      <Link href="/product/hoa-document-insight" className="cursor-pointer">
                        HOA Document Insight
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/product/digital-autopilot" className="cursor-pointer">
                        Digital Autopilot
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Solutions Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger className="text-slate-600 hover:text-slate-900 px-3 py-2 text-sm font-medium transition-colors flex items-center">
                    Solutions <ChevronDown className="ml-1 h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem asChild>
                      <Link href="/solutions/hoa-property-management" className="cursor-pointer">
                        HOA & Property Mgmt
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/solutions/hvac-electrician" className="cursor-pointer">
                        Home Services
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Link href="/pricing" className="text-slate-600 hover:text-slate-900 px-3 py-2 text-sm font-medium transition-colors">
                  Pricing
                </Link>

                <Link href="/contact" className="text-slate-600 hover:text-slate-900 px-3 py-2 text-sm font-medium transition-colors">
                  Contact
                </Link>
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

              {/* Mobile menu button */}
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                  <nav className="flex flex-col space-y-4 mt-8">
                    <div className="space-y-2">
                      <div className="text-slate-900 py-2 text-base font-semibold">Product</div>
                      <Link href="/product/hoa-document-insight" className="text-slate-600 hover:text-slate-900 py-1 text-sm block pl-4">
                        HOA Document Insight
                      </Link>
                      <Link href="/product/digital-autopilot" className="text-slate-600 hover:text-slate-900 py-1 text-sm block pl-4">
                        Digital Autopilot
                      </Link>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-slate-900 py-2 text-base font-semibold">Solutions</div>
                      <Link href="/solutions/hoa-property-management" className="text-slate-600 hover:text-slate-900 py-1 text-sm block pl-4">
                        HOA & Property Mgmt
                      </Link>
                      <Link href="/solutions/hvac-electrician" className="text-slate-600 hover:text-slate-900 py-1 text-sm block pl-4">
                        Home Services
                      </Link>
                    </div>

                    <Link href="/pricing" className="text-slate-600 hover:text-slate-900 py-2 text-base font-medium">
                      Pricing
                    </Link>

                    <Link href="/contact" className="text-slate-600 hover:text-slate-900 py-2 text-base font-medium">
                      Contact
                    </Link>

                    <Button
                      variant="outline"
                      onClick={openSignInModal}
                      className="sm:hidden justify-start"
                    >
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
        <section className="relative pt-16 pb-12 sm:pt-20 sm:pb-16 lg:pt-24 lg:pb-20 bg-gradient-to-br from-slate-50 via-white to-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              {/* Main heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                <span className="text-slate-900 bg-transparent">Turn </span>
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Real Estate Disclosures
                </span>
                <br />
                <span className="text-slate-900">into Clear Insights—Fast</span>
              </h1>

              {/* Tagline */}
              <p className="mt-8 max-w-3xl mx-auto text-xl text-slate-600 leading-relaxed">
                Altosera reads Real Estate Disclosures such as HOA documents and
                highlights what matters—monthly dues, reserves, coverage,
                amenities, responsibilities, and rules—so buyers, sellers, and
                agents can review with confidence.
              </p>

              {/* CTA Buttons */}
              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                  size="lg"
                  onClick={openSignUpModal}
                  className="inline-flex items-center px-10 py-4 text-lg font-semibold rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                >
                  <Play className="w-5 h-5 mr-3" />
                  Get Started Free
                </Button>
              </div>

              {/* Trust indicators */}
            </div>
          </div>

          {/* Enhanced Background decorations */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute top-0 left-1/4 transform w-96 h-96 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full blur-3xl opacity-60"></div>
            <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full blur-3xl opacity-60"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full blur-3xl opacity-40"></div>
          </div>
        </section>

        {/* Features Section */}
        <section
          id="features"
          className="py-24 bg-gradient-to-b from-white to-slate-50"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
                <Zap className="w-4 h-4 mr-2" />
                Powered by Advanced AI
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6 leading-tight">
                Transform Real Estate
                <br />
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Document Analysis
                </span>
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Our intelligent platform transforms complex real estate
                documents into actionable insights, saving you time and reducing
                risk with precision AI analysis.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-slate-100 hover:border-blue-200 relative overflow-hidden"
                >
                  {/* Background gradient on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  <div className="relative z-10">
                    <div
                      className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                    >
                      <feature.icon className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-4 group-hover:text-blue-700 transition-colors">
                      {feature.title}
                    </h3>
                    <div className="text-base text-slate-600 leading-relaxed group-hover:text-slate-700 transition-colors">
                      {(() => {
                        const parts = feature.description.split(' Example: ');
                        return (
                          <>
                            <span>{parts[0]}</span>
                            {parts[1] && (
                              <span className="block mt-3 text-sm italic text-slate-500">
                                <em>Example: {parts[1]}</em>
                              </span>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Decorative corner element */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-bl-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
              ))}
            </div>

            {/* Bottom decorative element */}
          </div>
        </section>

        {/* How It Works Section */}
        <section
          id="how-it-works"
          className="py-24 bg-gradient-to-b from-slate-50 to-white relative overflow-hidden"
        >
          {/* Background decorative elements */}
          <div className="absolute inset-0 opacity-40">
            <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200 rounded-full blur-2xl"></div>
            <div className="absolute bottom-20 right-10 w-40 h-40 bg-indigo-200 rounded-full blur-2xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-purple-200 rounded-full blur-2xl"></div>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="text-center mb-20">
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 rounded-full text-sm font-medium mb-6">
                <Workflow className="w-4 h-4 mr-2" />
                Simple & Powerful Process
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6 leading-tight">
                How It Works
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Get started in minutes with our intelligent three-step process
                that turns complex documents into clear insights
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-8">
              {/* Step 1 */}
              <div className="text-left">
                <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-6">
                  <span className="text-2xl font-bold text-white">1</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-4">
                  Upload Documents
                </h3>
                <p className="text-base text-slate-600 leading-relaxed">
                  Drag-and-drop your real-estate documents or import them from
                  your existing systems—fast and secure. We accept PDFs,
                  Microsoft Word, Excel/CSV, and image formats (JPG/PNG/TIFF).
                  Our pipeline handles complex layouts, tables, multi-document
                  batches, and very large files. Even decades-old scanned
                  documents (&gt;50 years) are processed with high-accuracy
                  OCR and reconstructed structure—no special prep required.
                </p>
              </div>

              {/* Step 2 */}
              <div className="text-left">
                <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-6">
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-4">
                  AI Analysis
                </h3>
                <p className="text-base text-slate-600 leading-relaxed">
                  Our advanced AI reads every page to identify the key rules,
                  restrictions, and requirements that matter. It classifies
                  content across multiple dimensions, extracts critical numbers
                  and dates, and highlights inconsistencies or missing items.
                  Potential compliance issues are flagged automatically, and the
                  findings are explained in clear, plain English so anyone can
                  understand what’s there—and what’s not.
                </p>
              </div>

              {/* Step 3 */}
              <div className="text-left">
                <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-6">
                  <span className="text-2xl font-bold text-white">3</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-4">
                  Actionable Insights
                </h3>
                <p className="text-base text-slate-600 leading-relaxed">
                  Review comprehensive, easy-to-share reports, ask
                  natural-language questions, and move forward with confidence.
                  You receive actionable guidance on what you can and cannot do
                  with the property, what to follow up on, and which approvals
                  may be required—presented in plain language with clear next
                  steps to drive decisions.
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
              Join hundreds of real estate professionals who trust Altosera to
              streamline their document analysis and reduce risk.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                variant="outline"
                className="px-8 py-4 text-lg font-medium rounded-xl border-2 border-white text-white bg-transparent hover:bg-white hover:text-primary"
              >
                Contact us
              </Button>
            </div>
          </div>
        </section>

        {/* Trial Period Section */}
        <section id="pricing" className="py-20 bg-slate-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-12">
              Choose the perfect plan for your real estate document analysis
              needs
            </p>

            {/* Trial Notice */}
            <div className="bg-yellow-200 rounded-3xl px-8 py-4 inline-block mb-8">
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Altosera is under trial period
              </h3>
            </div>

            {/* Comprehensive AI Intelligence Workflow */}
            <div className="flex justify-center mb-12 py-16">
              <div className="relative w-full max-w-6xl">
                {/* 5-Step Intelligence Process */}
                <div className="grid grid-cols-5 gap-6 items-start">
                  {/* Step 1: Document Upload */}
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-slate-500 to-slate-600 rounded-2xl shadow-xl mx-auto flex items-center justify-center mb-4 transform hover:scale-110 transition-all duration-300">
                      <span className="text-2xl font-bold text-white">1</span>
                    </div>
                    <h4 className="text-base font-bold text-slate-700 mb-2">
                      Upload
                    </h4>

                    {/* Document Stack Animation */}
                    <div className="relative h-24">
                      <div className="w-16 h-20 bg-white rounded-lg shadow-lg border-2 border-slate-200 mx-auto transform rotate-2 hover:rotate-4 transition-transform">
                        <div className="p-2">
                          <div className="w-10 h-1 bg-red-300 rounded mb-1"></div>
                          <div className="w-8 h-0.5 bg-slate-200 rounded mb-1"></div>
                          <div className="w-12 h-0.5 bg-slate-200 rounded"></div>
                        </div>
                      </div>
                      <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-16 h-20 bg-white rounded-lg shadow-lg border-2 border-slate-200 -rotate-1">
                        <div className="p-2">
                          <div className="w-12 h-1 bg-blue-300 rounded mb-1"></div>
                          <div className="w-8 h-0.5 bg-slate-200 rounded mb-1"></div>
                          <div className="w-10 h-0.5 bg-slate-200 rounded"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 2: AI Scanning */}
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl mx-auto flex items-center justify-center mb-4 transform hover:scale-110 transition-all duration-300">
                      <span className="text-2xl font-bold text-white">2</span>
                    </div>
                    <h4 className="text-base font-bold text-slate-700 mb-2">
                      AI Discovery
                    </h4>

                    {/* AI Discovery Animation */}
                    <div className="relative h-24 flex items-center justify-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-600 rounded-full flex items-center justify-center relative shadow-2xl">
                        {/* Central Discovery Icon */}
                        <div className="w-12 h-12 bg-gradient-to-br from-white/20 to-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                          <Zap className="w-7 h-7 text-white animate-pulse" />
                        </div>

                        {/* Orbiting Discovery Elements */}
                        <div
                          className="absolute inset-0 animate-spin"
                          style={{ animationDuration: "8s" }}
                        >
                          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-yellow-300 rounded-full shadow-lg">
                            <span className="text-xs">🔍</span>
                          </div>
                        </div>

                        <div
                          className="absolute inset-0 animate-spin"
                          style={{
                            animationDuration: "6s",
                            animationDirection: "reverse",
                          }}
                        >
                          <div className="absolute top-1/2 -right-1 transform -translate-y-1/2 w-3 h-3 bg-emerald-300 rounded-full shadow-lg">
                            <span className="text-xs">📊</span>
                          </div>
                        </div>

                        <div
                          className="absolute inset-0 animate-spin"
                          style={{ animationDuration: "10s" }}
                        >
                          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-purple-300 rounded-full shadow-lg">
                            <span className="text-xs">💎</span>
                          </div>
                        </div>

                        {/* Pulsing Discovery Waves */}
                        <div className="absolute inset-0 rounded-full bg-blue-300 animate-ping opacity-30"></div>
                        <div
                          className="absolute -inset-2 rounded-full bg-blue-200 animate-ping opacity-20"
                          style={{ animationDelay: "0.5s" }}
                        ></div>
                        <div
                          className="absolute -inset-4 rounded-full bg-indigo-200 animate-ping opacity-15"
                          style={{ animationDelay: "1s" }}
                        ></div>

                        {/* Discovery Sparkles */}
                        <div
                          className="absolute -top-2 -left-2 w-2 h-2 bg-yellow-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                        <div
                          className="absolute -bottom-2 -right-2 w-2 h-2 bg-emerald-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.8s" }}
                        ></div>
                        <div
                          className="absolute -top-2 -right-2 w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce"
                          style={{ animationDelay: "1.2s" }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Step 3: Risk Analysis */}
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl shadow-xl mx-auto flex items-center justify-center mb-4 transform hover:scale-110 transition-all duration-300">
                      <span className="text-2xl font-bold text-white">3</span>
                    </div>
                    <h4 className="text-base font-bold text-slate-700 mb-2">
                      Risk Analysis
                    </h4>

                    {/* Risk Assessment Visual */}
                    <div className="relative h-24 flex items-center justify-center">
                      <div className="w-20 h-16 bg-white rounded-xl shadow-lg border border-orange-100 p-2">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <div className="w-10 h-1 bg-green-200 rounded"></div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <div
                              className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"
                              style={{ animationDelay: "0.3s" }}
                            ></div>
                            <div className="w-8 h-1 bg-yellow-200 rounded"></div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <div
                              className="w-2 h-2 bg-red-400 rounded-full animate-pulse"
                              style={{ animationDelay: "0.6s" }}
                            ></div>
                            <div className="w-6 h-1 bg-red-200 rounded"></div>
                          </div>
                        </div>
                        <div className="mt-2 flex justify-center">
                          <AlertTriangle className="w-3 h-3 text-orange-500" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 4: Insight Generation */}
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-xl mx-auto flex items-center justify-center mb-4 transform hover:scale-110 transition-all duration-300">
                      <span className="text-2xl font-bold text-white">4</span>
                    </div>
                    <h4 className="text-base font-bold text-slate-700 mb-2">
                      Smart Insights
                    </h4>

                    {/* Insight Generation Visual */}
                    <div className="relative h-24 flex items-center justify-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-lg border border-purple-200 p-2 relative">
                        {/* Brain/Intelligence Icon */}
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                          <Workflow className="w-3 h-3 text-white" />
                        </div>

                        <div className="space-y-1">
                          <div className="w-12 h-1 bg-purple-300 rounded animate-pulse"></div>
                          <div
                            className="w-10 h-1 bg-purple-200 rounded animate-pulse"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                          <div
                            className="w-14 h-1 bg-purple-300 rounded animate-pulse"
                            style={{ animationDelay: "0.4s" }}
                          ></div>
                        </div>

                        {/* Insight Bubbles */}
                        <div
                          className="absolute -bottom-1 -left-1 w-4 h-4 bg-purple-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.5s" }}
                        >
                          <span className="text-xs text-white flex items-center justify-center h-full">
                            💡
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 5: Intelligent Reports */}
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-xl mx-auto flex items-center justify-center mb-4 transform hover:scale-110 transition-all duration-300">
                      <span className="text-2xl font-bold text-white">5</span>
                    </div>
                    <h4 className="text-base font-bold text-slate-700 mb-2">
                      Smart Reports
                    </h4>

                    {/* Final Report Visual */}
                    <div className="relative h-24 flex items-center justify-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-white to-emerald-50 rounded-xl shadow-2xl border border-emerald-100 p-3 relative transform hover:scale-105 transition-all duration-300">
                        {/* Success Badge */}
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                          <Check className="w-4 h-4 text-white" />
                        </div>

                        {/* Report Header */}
                        <div className="w-14 h-1.5 bg-emerald-500 rounded mb-2"></div>

                        {/* Smart Recommendations */}
                        <div className="space-y-1">
                          <div className="flex items-center space-x-1">
                            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
                            <div className="w-10 h-0.5 bg-emerald-200 rounded"></div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
                            <div className="w-8 h-0.5 bg-emerald-200 rounded"></div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
                            <div className="w-12 h-0.5 bg-emerald-200 rounded"></div>
                          </div>
                        </div>

                        {/* Intelligence Score */}
                        <div className="mt-2 text-center">
                          <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full mx-auto flex items-center justify-center">
                            <span className="text-xs font-bold text-white">
                              A+
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Floating Action Items */}
                      <div
                        className="absolute -bottom-1 -left-2 w-5 h-5 bg-blue-400 rounded-full flex items-center justify-center animate-bounce shadow-lg"
                        style={{ animationDelay: "1s" }}
                      >
                        <span className="text-xs text-white">📋</span>
                      </div>

                      <div
                        className="absolute -top-2 -left-2 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce shadow-lg"
                        style={{ animationDelay: "1.5s" }}
                      >
                        <span className="text-xs">⚡</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ambient Floating Elements */}
                <div className="absolute top-8 left-12 w-3 h-3 bg-blue-300 rounded-full animate-ping opacity-40"></div>
                <div
                  className="absolute bottom-16 right-16 w-4 h-4 bg-emerald-300 rounded-full animate-ping opacity-30"
                  style={{ animationDelay: "2s" }}
                ></div>
                <div
                  className="absolute top-12 right-20 w-2 h-2 bg-purple-300 rounded-full animate-ping opacity-50"
                  style={{ animationDelay: "1s" }}
                ></div>
                <div
                  className="absolute bottom-20 left-20 w-3 h-3 bg-yellow-300 rounded-full animate-ping opacity-35"
                  style={{ animationDelay: "3s" }}
                ></div>

                {/* Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 via-purple-50/20 to-emerald-50/20 rounded-3xl -z-10"></div>
              </div>
            </div>

            <p className="text-xl sm:text-2xl font-medium text-slate-700 mt-8">
              Pricing details coming soon...
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm text-slate-500">
              © 2025 Altosera. All rights reserved. Altosera provides
              AI-generated summaries and insights based on publicly disclosed or
              user-uploaded HOA documents. It does not offer legal, financial,
              or real estate advice. Buyers, sellers, and agents should consult
              qualified professionals before making any decisions.
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

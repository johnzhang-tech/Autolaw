import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AuthModal } from "@/components/AuthModal";
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

  // Scroll navigation handlers - completely isolated from router
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
    setIsMobileMenuOpen(false);
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
      title: "Legal Document Clarity",
      description:
        "Analyze entire legal packets—contracts, pleadings, discovery documents—covering 50+ critical dimensions like obligations, deadlines, payment terms, liability clauses, indemnification, and compliance requirements. Example: See exactly what payment obligations exist and who bears liability for specific scenarios, then ask 'Given these contract terms, what are my key obligations and potential exposure?'",
      color: "bg-blue-100 text-primary",
    },
    {
      icon: AlertTriangle,
      title: "Legal Risk Assessment",
      description:
        "Identify key risks, protections, and unfavorable terms in hours, not days—helping you make informed decisions faster and with confidence. Example: Instantly flag that a contract has unlimited liability provisions or missing force majeure clauses, then ask 'How do these liability terms compare to industry standards and what risks should I prioritize?'",
      color: "bg-red-100 text-red-600",
    },
    {
      icon: Workflow,
      title: "Multi-Document Analysis",
      description:
        "Spot connections, contradictions, and hidden clauses across multiple legal documents that could impact liability, obligations, or future costs. Example: Discover that a warranty limitation in the main contract conflicts with representations in an exhibit, then ask 'Are there any inconsistencies between these documents that could create legal exposure?'",
      color: "bg-emerald-100 text-emerald-600",
    },
    {
      icon: MessageCircleQuestion,
      title: "Legal Q&A Intelligence",
      description:
        "Search, compare, and chat with your legal documents to get answers—and learn what questions you should be asking before signing or litigating. Example: Ask if you can terminate the agreement early and see all related clauses, then follow up with 'What are the financial and legal consequences of early termination under these terms?'",
      color: "bg-purple-100 text-purple-600",
    },
    {
      icon: Shield,
      title: "Compliance & Regulatory Intelligence",
      description:
        "Every insight is tied to its source and enhanced with updated regulations, legal precedents, and industry best practices—giving context beyond the documents themselves. Example: See how a non-compete clause aligns with state law restrictions, then ask 'Is this non-compete enforceable under current law, and what modifications would strengthen it?'",
      color: "bg-orange-100 text-orange-600",
    },
    {
      icon: BarChart3,
      title: "Decision-Ready Legal Insights",
      description:
        "We analyze 50+ legal dimensions comprehensively, but deliver a distilled, decision-ready view that never omits critical details. Example: Get a one-page summary of the five most urgent legal issues, then ask 'Which three issues should I address before signing or filing?'",
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
                  src="/autolaw-logo.png"
                  alt="AutoLaw"
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
                      <Link
                        href="/product/medichron-agent"
                        className="cursor-pointer"
                      >
                        MediChron Agent — Automatic medical-chronology & gap-flagging for PI cases
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href="/product/knowledge-agent"
                        className="cursor-pointer"
                      >
                        Knowledge Agent
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href="/product/draft-agent"
                        className="cursor-pointer"
                      >
                        Draft Agent
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
                      <Link
                        href="/solutions/contract-litigation"
                        className="cursor-pointer"
                      >
                        Contract & Litigation
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href="/solutions/corporate-real-estate"
                        className="cursor-pointer"
                      >
                        Corporate & Real Estate
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <button
                  onClick={() => scrollToSection("pricing")}
                  className="text-slate-600 hover:text-slate-900 px-3 py-2 text-sm font-medium transition-colors"
                >
                  Pricing
                </button>

                <Link
                  href="/contact"
                  className="text-slate-600 hover:text-slate-900 px-3 py-2 text-sm font-medium transition-colors"
                >
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
                      <div className="text-slate-900 py-2 text-base font-semibold">
                        Product
                      </div>
                      <Link
                        href="/product/MediChron-agent"
                        className="text-slate-600 hover:text-slate-900 py-1 text-sm block pl-4"
                      >
                        MediChron Agent
                      </Link>
                      <Link
                        href="/product/Knowledge-agent"
                        className="text-slate-600 hover:text-slate-900 py-1 text-sm block pl-4"
                      >
                        Knowledge Agent
                      </Link>
                    </div>

                    <div className="space-y-2">
                      <div className="text-slate-900 py-2 text-base font-semibold">
                        Solutions
                      </div>
                      <Link
                        href="/solutions/contract-litigation"
                        className="text-slate-600 hover:text-slate-900 py-1 text-sm block pl-4"
                      >
                        Contract & Litigation
                      </Link>
                      <Link
                        href="/solutions/corporate-real-estate"
                        className="text-slate-600 hover:text-slate-900 py-1 text-sm block pl-4"
                      >
                        Corporate & Real Estate
                      </Link>
                    </div>

                    <button
                      onClick={() => scrollToSection("pricing")}
                      className="text-slate-600 hover:text-slate-900 py-2 text-base font-medium text-left"
                    >
                      Pricing
                    </button>

                    <Link
                      href="/contact"
                      className="text-slate-600 hover:text-slate-900 py-2 text-base font-medium"
                    >
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
                  Legal Documents
                </span>
                <br />
                <span className="text-slate-900">into Clear Insights—Fast</span>
              </h1>

              {/* MediChron Agent Description */}
              <div className="mt-8 max-w-4xl mx-auto">
                <p className="text-xl text-slate-700 leading-relaxed mb-6">
                  Upload hundreds of pages of medical records and bills and MediChron Agent instantly ingests, sequences, and summarizes them in clean chronological order. It flags treatment gaps, inconsistent codes, and missing documents so your team can act early. Manual review that normally takes tens of hours—and is prone to error—now takes under a minute.
                </p>

                <div className="text-left bg-slate-50 rounded-2xl p-8 mt-8">
                  <h3 className="text-2xl font-bold text-slate-900 mb-6">Key differentiators:</h3>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2 mr-4"></div>
                      <div>
                        <p className="text-lg text-slate-700">
                          <span className="font-semibold">End-to-end agentic automation.</span> Ingests large record sets, structures them, and surfaces insights without manual sorting.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2 mr-4"></div>
                      <div>
                        <p className="text-lg text-slate-700">
                          <span className="font-semibold">Clear timeline + actionable flags.</span> Highlights gaps, inconsistencies, and high-value procedures.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2 mr-4"></div>
                      <div>
                        <p className="text-lg text-slate-700">
                          <span className="font-semibold">Scales your team instantly.</span> Cuts hours of error-prone review down to a minute, freeing attorneys for strategy instead of paperwork.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">

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
                Transform Legal
                <br />
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Document Analysis
                </span>
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Our intelligent platform transforms complex legal documents into
                actionable insights, saving you time and reducing risk with
                precision AI analysis.
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
                        const parts = feature.description.split(" Example: ");
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
                that turns complex legal documents into clear insights
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-8">
              {/* Step 1 */}
              <div className="text-left">
                <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-6">
                  <span className="text-2xl font-bold text-white">1</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-4">
                  Upload Legal Documents
                </h3>
                <p className="text-base text-slate-600 leading-relaxed">
                  Drag-and-drop your legal documents or import them from your
                  existing case management systems—fast and secure. We accept
                  PDFs, Microsoft Word, Excel/CSV, and image formats
                  (JPG/PNG/TIFF). Our pipeline handles complex legal layouts,
                  tables, multi-document batches, and very large case files.
                  Even decades-old scanned documents are processed with
                  high-accuracy OCR and reconstructed structure—no special prep
                  required.
                </p>
              </div>

              {/* Step 2 */}
              <div className="text-left">
                <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-6">
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-4">
                  AI Legal Analysis
                </h3>
                <p className="text-base text-slate-600 leading-relaxed">
                  Our advanced AI reads every page to identify the key
                  obligations, restrictions, and legal requirements that matter.
                  It classifies content across multiple legal dimensions,
                  extracts critical dates, payment terms, and deadlines, and
                  highlights inconsistencies or missing clauses. Potential
                  compliance issues and legal risks are flagged automatically,
                  and the findings are explained in clear, plain language so
                  anyone can understand what's there—and what's not.
                </p>
              </div>

              {/* Step 3 */}
              <div className="text-left">
                <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-6">
                  <span className="text-2xl font-bold text-white">3</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-4">
                  Actionable Legal Insights
                </h3>
                <p className="text-base text-slate-600 leading-relaxed">
                  Review comprehensive, easy-to-share legal reports, ask
                  natural-language questions, and move forward with confidence.
                  You receive actionable guidance on legal obligations, risks,
                  what to follow up on, and which compliance requirements may be
                  triggered—presented in plain language with clear next steps to
                  drive legal decisions and strategy.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Ready to Transform Your Legal Workflow?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join hundreds of legal professionals who trust AutoLaw to
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

        {/* Pricing Section */}
        <section id="pricing" className="py-20 bg-slate-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-12">
              Choose the perfect plan for your legal document analysis needs
            </p>

            {/* Trial Notice */}
            <div className="bg-yellow-200 rounded-3xl px-8 py-4 inline-block mb-8">
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">
                AutoLaw is under trial period
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

                        {/* Pulsing Discovery Waves */}
                        <div className="absolute inset-0 rounded-full bg-blue-300 animate-ping opacity-30"></div>
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
                            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                            <div className="w-8 h-1 bg-yellow-200 rounded"></div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
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
                          <div className="w-10 h-1 bg-purple-200 rounded animate-pulse"></div>
                          <div className="w-14 h-1 bg-purple-300 rounded animate-pulse"></div>
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
                    </div>
                  </div>
                </div>

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
              © 2025 AutoLaw. All rights reserved. AutoLaw provides
              AI-generated summaries and insights based on user-uploaded legal
              documents. It does not offer legal advice. Users should consult
              qualified legal professionals before making any legal decisions.
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

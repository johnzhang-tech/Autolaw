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
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <img
                  src="/autolaw-logo.png"
                  alt="AutoLaw"
                  className="h-12 w-12 object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
                  AutoLaw
                </span>
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
                    <DropdownMenuItem
                      onClick={() => scrollToSection("hero")}
                      className="cursor-pointer"
                    >
                      MediChron Agent
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => scrollToSection("features")}
                      className="cursor-pointer"
                    >
                      Knowledge Agent
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => scrollToSection("draft-agent")}
                      className="cursor-pointer"
                    >
                      Draft Agent
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Solutions Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger className="text-slate-600 hover:text-slate-900 px-3 py-2 text-sm font-medium transition-colors flex items-center">
                    Solutions <ChevronDown className="ml-1 h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onClick={() => scrollToSection("solutions")}
                      className="cursor-pointer"
                    >
                      One Agentic foundation for Personal Injury and Patent Law
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
                      <button
                        onClick={() => scrollToSection("hero")}
                        className="text-slate-600 hover:text-slate-900 py-1 text-sm block pl-4 text-left w-full"
                      >
                        MediChron Agent
                      </button>
                      <button
                        onClick={() => scrollToSection("features")}
                        className="text-slate-600 hover:text-slate-900 py-1 text-sm block pl-4 text-left w-full"
                      >
                        Knowledge Agent
                      </button>
                      <button
                        onClick={() => scrollToSection("draft-agent")}
                        className="text-slate-600 hover:text-slate-900 py-1 text-sm block pl-4 text-left w-full"
                      >
                        Draft Agent
                      </button>
                    </div>

                    <div className="space-y-2">
                      <div className="text-slate-900 py-2 text-base font-semibold">
                        Solutions
                      </div>
                      <button
                        onClick={() => scrollToSection("solutions")}
                        className="text-slate-600 hover:text-slate-900 py-1 text-sm block pl-4 text-left w-full"
                      >
                        One Agentic foundation for Personal Injury and Patent Law
                      </button>
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
        {/* Hero Section - MediChron Agent */}
        <section id="hero" className="relative pt-16 pb-12 sm:pt-20 sm:pb-16 lg:pt-24 lg:pb-20 bg-gradient-to-br from-slate-50 via-white to-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              {/* Main heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  MediChron Agent
                </span>
                <br />
                <span className="text-slate-900">Precise Medical Timeline & Gap Detection for PI Claims</span>
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

        {/* Knowledge Agent Section */}
        <section
          id="features"
          className="py-24 bg-gradient-to-b from-white to-slate-50"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              {/* Knowledge Agent heading */}
              <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6 leading-tight">
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Knowledge Agent
                </span>
                <br />
                <span className="text-slate-900"> Your firm's private, case-trained ChatGPT </span>
              </h2>

              {/* Knowledge Agent Description */}
              <div className="mt-8 max-w-4xl mx-auto">
                <p className="text-xl text-slate-700 leading-relaxed mb-6">
                  Knowledge Agent learns from your firm's past wins, losses, filings, and internal documents, then answers questions with grounded, citation-backed insights. Attorneys can ask anything—case patterns, strategy examples, prior arguments—and get instant, firm-specific guidance that reflects real outcomes, not generic legal text.
                </p>

                <div className="text-left bg-slate-50 rounded-2xl p-8 mt-8">
                  <h3 className="text-2xl font-bold text-slate-900 mb-6">Key differentiators:</h3>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2 mr-4"></div>
                      <div>
                        <p className="text-lg text-slate-700">
                          <span className="font-semibold">Powered by your own cases.</span> Trains on your filings, motions, demand letters, and outcomes—not public data.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2 mr-4"></div>
                      <div>
                        <p className="text-lg text-slate-700">
                          <span className="font-semibold">Grounded and verifiable.</span> Every answer includes citations back to your documents.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2 mr-4"></div>
                      <div>
                        <p className="text-lg text-slate-700">
                          <span className="font-semibold">Surface what works (and what failed).</span> Reveals patterns from successful strategies and flags approaches that underperformed.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2 mr-4"></div>
                      <div>
                        <p className="text-lg text-slate-700">
                          <span className="font-semibold">Instant institutional memory.</span> New attorneys gain years of internal knowledge from day one.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Draft Agent Section */}
        <section id="draft-agent" className="py-24 bg-gradient-to-b from-slate-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              {/* Draft Agent heading */}
              <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6 leading-tight">
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Draft Agent
                </span>
                <br />
                <span className="text-slate-900">AI drafting assistant for PI & patent legal documents</span>
              </h2>

              {/* Draft Agent Description */}
              <div className="mt-8 max-w-4xl mx-auto">
                <p className="text-xl text-slate-700 leading-relaxed mb-6">
                  Draft Agent uses your firm's case facts, past templates and style to generate ready-to-review documents—whether a demand letter, complaint or patent specification—for both personal-injury and patent law firms.
                </p>

                <div className="text-left bg-slate-50 rounded-2xl p-8 mt-8">
                  <h3 className="text-2xl font-bold text-slate-900 mb-6">Key differentiators:</h3>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2 mr-4"></div>
                      <div>
                        <p className="text-lg text-slate-700">
                          <span className="font-semibold">Large-context intelligence.</span> Pulls facts from your case file and your firm's knowledge base so drafts reflect full context—not just generic content.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2 mr-4"></div>
                      <div>
                        <p className="text-lg text-slate-700">
                          <span className="font-semibold">Firm-personalized tone & structure.</span> Learns your firm's voice, layout and document structure so outputs feel like you wrote them.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2 mr-4"></div>
                      <div>
                        <p className="text-lg text-slate-700">
                          <span className="font-semibold">PI & patent capable.</span> Handles demand letters, complaints, responses and discovery in personal-injury, and patent drafts, specifications and responses in patent law.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2 mr-4"></div>
                      <div>
                        <p className="text-lg text-slate-700">
                          <span className="font-semibold">Citation-backed accuracy.</span> Every fact is traceable to its source in your case file, reducing rework and risk.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Solutions Section */}
        <section
          id="solutions"
          className="py-24 bg-gradient-to-b from-white to-slate-50 relative overflow-hidden"
        >
          {/* Background decorative elements */}
          <div className="absolute inset-0 opacity-40">
            <div className="absolute top-20 right-10 w-32 h-32 bg-cyan-200 rounded-full blur-2xl"></div>
            <div className="absolute bottom-20 left-10 w-40 h-40 bg-blue-200 rounded-full blur-2xl"></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="text-center mb-12">
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-cyan-100 to-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
                <Shield className="w-4 h-4 mr-2" />
                Unified Agentic Foundation
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6 leading-tight">
                <span className="bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
                  One Agentic Foundation
                </span>
                <br />
                <span className="text-slate-900">for Personal Injury and Patent Law</span>
              </h2>

              {/* Solutions Description */}
              <div className="mt-8 max-w-4xl mx-auto">
                <p className="text-xl text-slate-700 leading-relaxed">
                  AutoLaw.ai provides a unified agentic foundation for personal-injury and patent law, delivering end-to-end automation across document review, drafting, and knowledge retrieval. Our agents handle the full lifecycle of case work—from ingesting large medical or technical records, to generating chronologies and gap detection, to drafting demand letters, complaints, or patent specifications, all grounded in your firm's own documents and prior outcomes. By combining large-context analysis, verifiable citations, and firm-specific tone and structure, the system eliminates hours of repetitive work, improves accuracy, and preserves institutional knowledge. Firms get faster turnaround, higher consistency, and automation that actually understands the domain, not generic legal text.
                </p>
              </div>
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

            <p className="text-xl sm:text-2xl font-medium text-slate-700 mt-8">
              Pricing details coming soon...
            </p>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Ready to Transform Your Legal Workflow?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join other legal professionals using AutoLaw’s agentic AI agents to achieve faster, more accurate document analysis with lower operational risk.
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

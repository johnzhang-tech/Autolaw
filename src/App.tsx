import { useState } from "react";
import svgPaths from "./imports/svg-sbn51395bv";
import imgInnerScreen from "figma:asset/38f36b3f2a70738d5f0431db540a63124dd9a8a8.png";
import imgLogo from "figma:asset/7e2cb6a493f6974234a10a9155f5a9e61358668d.png";
import imgLogo1 from "figma:asset/4ec63af28a6d626d15af88690afce1177f7da2aa.png";
import imgLogo2 from "figma:asset/22502dfc1e4e8a242285d42db1a38e6e853633fc.png";
import imgLogo3 from "figma:asset/ab60fb89b643e72e94769301b2a7ea53c2788495.png";
import imgLogo4 from "figma:asset/5353f37898f8daa86c3f3f525e94362e62de8b6a.png";
import imgLogo5 from "figma:asset/262ae2257b7f47685a1fd90f0f27d6372a2bca23.png";
import imgHeroImage from "figma:asset/9f17e02c9fa201a3bf7d9d380f6bdeb469073e56.png";
import { ImageWithFallback } from "./components/figma/ImageWithFallback";

const LOGIN_URL = "https://case-app-1055716306475.us-central1.run.app/login";
const CONTACT_EMAIL = "test@autolaw.ai";

// Helper function for smooth scrolling to sections
const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId);
  if (element) {
    const offset = 100; // Account for fixed navigation
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth"
    });
  }
};

function MenuIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24">
      <path
        d="M3 12h18M3 6h18M3 18h18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Arrow() {
  return (
    <div className="flex items-center h-full w-[7px]">
      <svg className="w-[6px] h-[6px]" fill="none" viewBox="0 0 6 6.01131">
        <path d={svgPaths.p2c9abe00} fill="white" />
      </svg>
    </div>
  );
}

function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (sectionId: string) => {
    scrollToSection(sectionId);
    setMobileMenuOpen(false); // Close mobile menu after clicking
  };

  return (
    <nav className="w-full flex flex-col items-center relative">
      {/* Desktop/Tablet Navigation */}
      <div className="w-full max-w-[1500px] flex items-center justify-between pb-12 md:pb-20 pt-5 px-5 md:px-0">
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="font-['DM_Sans'] font-medium text-[30px] tracking-[-1.5px] cursor-pointer"
        >
          AutoLaw
        </button>

        {/* Mobile menu button */}
        <button
          type="button"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <MenuIcon />
        </button>

        {/* Desktop login button */}
        <a
          href={LOGIN_URL}
          className="hidden md:flex bg-[#485c11] gap-0.5 items-center justify-center px-[22px] py-[14px] rounded-full"
        >
          <span className="font-['DM_Sans'] font-bold text-sm text-white tracking-[-0.35px]">
            Login
          </span>
          <Arrow />
        </a>
      </div>

      {/* Floating Nav Items - Desktop/Tablet only */}
      <div className="hidden md:flex absolute top-4 left-1/2 -translate-x-1/2 backdrop-blur-[15px] bg-[rgba(255,255,255,0.4)] font-['DM_Sans'] font-bold gap-[27px] items-center px-6 py-5 rounded-full text-sm text-black">
        <button
          type="button"
          className="whitespace-nowrap hover:opacity-70 transition-opacity"
          onClick={() => scrollToSection("products")}
        >
          Products
        </button>
        <button
          type="button"
          className="hover:opacity-70 transition-opacity"
          onClick={() => scrollToSection("solution")}
        >
          Solution
        </button>
        <button
          type="button"
          className="whitespace-nowrap hover:opacity-70 transition-opacity"
          onClick={() => scrollToSection("how-to")}
        >
          How-to
        </button>
        <button
          type="button"
          className="whitespace-nowrap hover:opacity-70 transition-opacity"
          onClick={() => scrollToSection("contact")}
        >
          Contact Us
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden w-full bg-white border-t border-gray-200 shadow-lg">
          <div className="flex flex-col px-5">
            <button
              type="button"
              onClick={() => handleNavClick("products")}
              className="py-[30px] border-t border-[#e9e9e9] font-['DM_Sans'] font-bold text-sm text-black text-left hover:bg-gray-50 transition-colors"
            >
              Products
            </button>
            <button
              type="button"
              onClick={() => handleNavClick("solution")}
              className="py-[30px] border-t border-[#e9e9e9] font-['DM_Sans'] font-bold text-sm text-black text-left hover:bg-gray-50 transition-colors"
            >
              Solution
            </button>
            <button
              type="button"
              onClick={() => handleNavClick("how-to")}
              className="py-[30px] border-t border-[#e9e9e9] font-['DM_Sans'] font-bold text-sm text-black text-left hover:bg-gray-50 transition-colors"
            >
              How-to
            </button>
            <button
              type="button"
              onClick={() => handleNavClick("contact")}
              className="py-[30px] border-t border-[#e9e9e9] font-['DM_Sans'] font-bold text-sm text-black text-left hover:bg-gray-50 transition-colors"
            >
              Contact Us
            </button>
            <div className="py-[30px] border-t border-[#e9e9e9]">
              <a
                href={LOGIN_URL}
                className="flex bg-[#485c11] gap-0.5 items-center justify-center px-[22px] py-[14px] rounded-full w-full"
              >
                <span className="font-['DM_Sans'] font-bold text-sm text-white tracking-[-0.35px]">
                  Login
                </span>
                <Arrow />
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

function HeroSection() {
  return (
    <header className="w-full max-w-[1500px] flex flex-col gap-16 md:gap-60 items-start overflow-hidden px-5 md:px-0">
      <h1 className="hero-title font-['Crimson_Text'] text-[60px] md:text-[120px] lg:text-[160px] leading-[0.9] tracking-[-6.8px] text-black text-center w-full whitespace-pre-wrap">
        Your AI Case Operating System
      </h1>

      {/* Hero Image with iPad */}
      <div className="bg-[#8e9c78] h-[250px] md:h-[362px] relative rounded-[30px] w-full">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-black border-2 border-[rgba(255,255,255,0.5)] h-[200px] md:h-[644px] w-[280px] md:w-[907px] overflow-hidden rounded-[24px] shadow-[0px_-4px_20px_0px_rgba(0,0,0,0.1)]">
          <div className="absolute left-1/2 -translate-x-1/2 top-[16.5px] h-[85%] md:h-[607.439px] w-[95%] md:w-[869.742px] rounded-[16px] overflow-hidden">
            <img
              alt="Data points on top of landscape"
              className="w-full h-full object-cover"
              src={imgInnerScreen}
              decoding="async"
            />
          </div>
        </div>
      </div>
    </header>
  );
}

function LogoCloud() {
  const logos = [
    { src: imgLogo, alt: "Logoipsum" },
    { src: imgLogo1, alt: "Logoipsum" },
    { src: imgLogo2, alt: "Logoipsum" },
    { src: imgLogo3, alt: "Logoipsum" },
    { src: imgLogo4, alt: "Logoipsum" },
    { src: imgLogo5, alt: "Logoipsum" },
  ];

  return (
    <div className="w-full max-w-[1500px] flex flex-col gap-[30px] items-center py-[50px] px-5 md:px-0">
      <p className="font-['DM_Sans'] text-[#6f6f6f] text-[15px] tracking-[-0.075px] w-full">
        Trusted by:
      </p>
      <div className="flex flex-wrap gap-5 md:gap-10 items-center justify-center w-full">
        {logos.map((logo, index) => (
          <div key={index} className="flex items-center justify-center h-[84px] w-[120px] md:w-[154px] p-5 opacity-60 mix-blend-exclusion">
            <img
              alt={logo.alt}
              className="w-full h-full object-contain"
              src={logo.src}
              loading="lazy"
              decoding="async"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function ProductSection() {
  const features = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24">
          <path d={svgPaths.p37c59480} fill="black" />
        </svg>
      ),
      title: "Chronology Compiler Agent",
      description: `Automatically builds a litigation ready, evidence linked medical chronology, organized by date of service and mapped to your PI & WC ontology for maximum accuracy across providers, diagnoses, imaging, procedures, and restrictions.
Outputs: a polished chronology draft with pinpoint exhibit anchors (doc/page/snippet) for every entry.`,
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24">
          <path d={svgPaths.p2f11bb00} fill="black" />
        </svg>
      ),
      title: "Demand Package Builder Agent",
      description: `Orchestrates your end to end demand packet using prebuilt playbooks, prompts, and automations—assembling every section (intro, liability/facts, medical, damages, and exhibits) from your Case Memory with strict evidence grounding.
Outputs: an editable, litigation ready draft with automated citation formatting and clear "unsupported claim" flags instead of guesswork.`,
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24">
          <path d={svgPaths.p1d817280} fill="black" />
        </svg>
      ),
      title: "Case Copilot Agent",
      description: `Securely answers case questions using your legal knowledge graph and Case Memory—grounding every response in verifiable citations (document/page/snippet) and never relying on unsupported assumptions.
Outputs: citation-backed answers plus intelligent gap detection that prompts for missing artifacts and the exact evidence needed to complete the record.`,
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24">
          <path d={svgPaths.p39d55130} fill="black" />
        </svg>
      ),
      title: "Firm Playbook Agent",
      description: `Automatically enforces your firm's best practices—standardizing structure, tone, required sections, and prohibited language to ensure consistency, compliance, and governance across every work product.
Outputs: the same facts and citations, packaged in a firm-approved format that's ready to file or send.`,
    },
  ];

  return (
    <div id="products" className="w-full max-w-[1500px] pb-[60px] md:pb-[120px] px-5 md:px-0">
      <section className="flex flex-col gap-[30px] md:gap-[50px] border-t-[0.5px] border-[#e9e9e9] pt-12 md:pt-20 pb-[40px] md:pb-[60px]">
        <div className="product-copy flex flex-col gap-[30px] md:gap-[50px]">
          <h2 className="font-['Roboto_Mono'] text-[#485c11] text-xs tracking-[-0.12px]">
            Products
          </h2>
          <p className="font-['Crimson_Text'] text-[32px] sm:text-[40px] md:text-[50px] lg:text-[60px] leading-[0.9] text-black tracking-[-1.8px]">
            The first agentic case platform that turns messy files into proactive,
            evidence-linked litigation work products
          </p>
          <p className="font-['DM_Sans'] text-[#6f6f6f] text-[15px] tracking-[-0.075px] leading-[1.4]">
            Autolaw turns massive PI & WC case files into a computable Case Memory (powered
            by an evolving legal-medical ontology), then agentic AI workers automatically
            assemble litigation-ready work products—chronology, exhibits, damages inputs, and
            demand packets—far beyond "chat with docs." and Summarizations.
          </p>
        </div>

        <div className="flex flex-col md:flex-row md:flex-wrap gap-5 pt-6 md:pt-10">
          {features.map((feature, index) => (
            <section
              key={index}
              aria-label={`Autolaw product benefit ${index + 1} of 4`}
              className="flex-1 min-w-full sm:min-w-[240px] md:min-w-[265px] border-t border-[#e9e9e9] pt-8 md:pt-10 md:pr-5"
            >
              <div className="flex flex-col gap-5 md:gap-6">
                {feature.icon}
                <div className="flex flex-col gap-4 md:gap-5">
                  <p className="font-['Crimson_Text'] font-bold text-lg leading-none text-black tracking-[-0.54px]">
                    {feature.title}
                  </p>
                  <p className="font-['DM_Sans'] text-[#6f6f6f] text-[15px] tracking-[-0.075px] leading-[1.4] whitespace-pre-wrap">
                    {feature.description}
                  </p>
                </div>
              </div>
            </section>
          ))}
        </div>
      </section>

      <div className="h-[250px] sm:h-[300px] md:h-[400px] lg:h-[473px] relative rounded-[20px] md:rounded-[30px] overflow-hidden bg-black">
        <img
          alt="AI Agents System - Chronology Compiler, Demand Package Builder, Case Copilot, and Firm Playbook agents visualized in a connected workflow"
          className="w-full h-full object-cover rounded-[20px] md:rounded-[30px]"
          src={imgHeroImage}
          loading="eager"
          decoding="async"
        />
      </div>
    </div>
  );
}

function FeaturesSection() {
  const valueProps = [
    {
      number: "01",
      title: "Fits your workflow",
      description:
        "Connects to Dropbox and common case document systems for seamless, ongoing intake.",
    },
    {
      number: "02",
      title: "Privacy and security by design",
      description:
        "Your data stays under your control with enterprise-grade safeguards and auditable access.",
    },
    {
      number: "03",
      title: "Ontology-first accuracy for PI & WC",
      description:
        "Powered by the first PI & WC ontology to drive consistent, grounded, verifiable outputs.",
    },
    {
      number: "04",
      title: "Value-based pricing, not per-page",
      description:
        "No per-document or per-page fees; pricing reflects delivered work products and outcomes.",
    },
  ];

  return (
    <section id="solution" className="w-full max-w-[1500px] flex flex-col lg:flex-row gap-5 md:gap-8 pb-[80px] md:pb-[120px] px-5 md:px-0">
      <div className="flex-1 flex flex-col gap-8 md:gap-10 border-t border-[#e9e9e9] pt-[40px] md:pt-[60px] pb-12 md:pb-20">
        <div className="flex flex-col gap-8 md:gap-10 lg:pr-20">
          <p className="font-['Crimson_Text'] text-[32px] sm:text-[40px] md:text-[50px] lg:text-[60px] leading-[0.9] text-black tracking-[-1.8px]">
            Built for PI & WC, Agentic AI
          </p>
          <p className="font-['DM_Sans'] text-[#6f6f6f] text-[15px] tracking-[-0.075px] leading-[1.4]">
            Autolaw is an agentic automation platform built for the AI era and purpose-built
            for Personal Injury and Workers' Compensation. Powered by the industry's first PI
            & WC ontology, it helps firms move faster with confidence by delivering
            consistently accurate, audit-ready outputs. The result is stronger work product
            quality, fewer rework cycles, and predictable throughput across the firm.
          </p>
        </div>

        <div className="flex flex-col">
          {valueProps.map((prop, index) => (
            <div
              key={index}
              aria-label={`Autolaw value prop ${index + 1} of 4`}
              className="flex gap-[20px] md:gap-[30px] border-t border-[#e9e9e9] py-4 md:py-5 lg:pr-20"
            >
              <p className="font-['DM_Sans'] font-bold text-[#6f6f6f] text-[15px] tracking-[-0.075px] leading-[1.4]">
                {prop.number}
              </p>
              <p className="flex-1 font-['DM_Sans'] text-[15px] tracking-[-0.075px] leading-[1.4]">
                <span className="font-bold text-black">{prop.title}</span>
                <br />
                <span className="text-black">{prop.description}</span>
              </p>
            </div>
          ))}
        </div>

        <a
          href="#contact"
          className="bg-[#dfecc6] flex items-center justify-center px-[22px] py-[14px] rounded-full w-fit"
          onClick={(event) => {
            event.preventDefault();
            scrollToSection("contact");
          }}
        >
          <span className="font-['DM_Sans'] font-bold text-sm text-black tracking-[-0.35px]">
            Discover More
          </span>
        </a>
      </div>

      <div className="flex-1 h-[350px] sm:h-[400px] md:h-auto">
        <div className="h-full relative rounded-[20px] md:rounded-[30px] overflow-hidden">
          <ImageWithFallback
            alt="Legal case files and medical records organized for Personal Injury and Workers' Compensation litigation"
            className="w-full h-full object-cover rounded-[20px] md:rounded-[30px]"
            src="https://images.unsplash.com/photo-1583521214690-73421a1829a9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsZWdhbCUyMGRvY3VtZW50cyUyMG1lZGljYWwlMjByZWNvcmRzJTIwb3JnYW5pemVkJTIwd29ya3NwYWNlfGVufDF8fHx8MTc3MDUwMDMxNXww&ixlib=rb-4.1.0&q=80&w=1080"
            srcSet="https://images.unsplash.com/photo-1583521214690-73421a1829a9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsZWdhbCUyMGRvY3VtZW50cyUyMG1lZGljYWwlMjByZWNvcmRzJTIwb3JnYW5pemVkJTIwd29ya3NwYWNlfGVufDF8fHx8MTc3MDUwMDMxNXww&ixlib=rb-4.1.0&q=80&w=1080 1080w, https://images.unsplash.com/photo-1583521214690-73421a1829a9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsZWdhbCUyMGRvY3VtZW50cyUyMG1lZGljYWwlMjByZWNvcmRzJTIwb3JnYW5pemVkJTIwd29ya3NwYWNlfGVufDF8fHx8MTc3MDUwMDMxNXww&ixlib=rb-4.1.0&q=80&w=2160 2160w"
            sizes="(min-width: 1024px) 50vw, 100vw"
            loading="lazy"
            decoding="async"
          />
          <div className="absolute inset-0 bg-[rgba(0,0,0,0.06)] rounded-[20px] md:rounded-[30px]" />
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      title: "Connect your documents",
      description:
        "Integrate with Dropbox and your existing file structure for continuous intake as records arrive, change, and expand.",
    },
    {
      number: "02",
      title: "Let the AI agents do the work",
      description:
        "With a simple setup, our agentic platform handles normalization, indexing, extraction, and verification so your team stays focused on the business.",
    },
    {
      number: "03",
      title: "Built-in governance",
      description:
        "PI & WC ontology enforces evidence-linked outputs (doc/page/snippet) and flags conflicts instead of guessing.",
    },
  ];

  return (
    <section id="how-to" className="w-full max-w-[1500px] flex flex-col gap-12 md:gap-20 border-t border-[#e9e9e9] pt-12 md:pt-20 pb-[80px] md:pb-[120px] px-5 md:px-0">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <p className="font-['Crimson_Text'] text-[32px] sm:text-[40px] md:text-[60px] leading-[0.9] text-black tracking-[-1.8px]">
          Get Started in 3 Steps
        </p>
        <a
          href="#contact"
          className="bg-[#dfecc6] flex items-center justify-center px-[22px] py-[14px] rounded-full whitespace-nowrap"
          onClick={(event) => {
            event.preventDefault();
            scrollToSection("contact");
          }}
        >
          <span className="font-['DM_Sans'] font-bold text-sm text-black tracking-[-0.35px]">
            Discover More
          </span>
        </a>
      </div>

      <div className="flex flex-col md:flex-row gap-5 md:gap-8">
        {steps.map((step, index) => (
          <section
            key={index}
            aria-label={`Step ${index + 1} of 3`}
            className="flex-1 min-w-full sm:min-w-[240px] border-t border-[#e9e9e9] pt-[40px] md:pt-[60px] pb-5 md:pr-[30px]"
          >
            <div className="flex flex-col gap-[40px] md:gap-[60px]">
              <p className="font-['DM_Sans'] text-[#929292] text-[50px] sm:text-[60px] md:text-[70px] lg:text-[80px] leading-none tracking-[-3.2px]">
                {step.number}
              </p>
              <div className="flex flex-col gap-4 md:gap-5">
                <p className="font-['Crimson_Text'] text-lg leading-none text-black tracking-[-0.54px]">
                  {step.title}
                </p>
                <p className="font-['DM_Sans'] text-[#6f6f6f] text-[15px] tracking-[-0.075px] leading-[1.4]">
                  {step.description}
                </p>
              </div>
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section id="contact" className="w-full max-w-[1500px] border-t-[0.5px] border-[#e9e9e9] px-5 md:px-0">
      <div className="flex flex-col items-center gap-8 md:gap-10 px-0 sm:px-5 md:px-[100px] lg:px-[200px] xl:px-[300px] py-[60px] md:py-[100px] lg:py-[120px]">
        <p className="font-['Crimson_Text'] text-[32px] sm:text-[40px] md:text-[50px] lg:text-[60px] leading-[0.9] text-black text-center tracking-[-1.8px]">
          Connect with us
        </p>
        <p className="font-['DM_Sans'] text-[#6f6f6f] text-[15px] text-center tracking-[-0.075px] leading-[1.4]">
          Schedule a quick call to learn how Autolaw can turn your case data into a
          powerful advantage.
        </p>
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="bg-[#485c11] flex gap-0.5 items-center justify-center px-[22px] py-[14px] rounded-full w-full sm:w-auto"
        >
          <span className="font-['DM_Sans'] font-bold text-sm text-white tracking-[-0.35px]">
            Learn More
          </span>
          <Arrow />
        </a>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="w-full max-w-[1500px] flex flex-col gap-12 md:gap-20 border-t border-[#e9e9e9] pt-10 pb-5 px-5 md:px-0">
      <div className="hidden md:flex items-center justify-between h-10">
        <div className="flex font-['DM_Sans'] font-bold gap-[27px] items-center text-sm text-black">
          <button
            type="button"
            onClick={() => scrollToSection('products')}
            className="hover:opacity-70 transition-opacity"
          >
            Products
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('solution')}
            className="hover:opacity-70 transition-opacity"
          >
            Solution
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('how-to')}
            className="hover:opacity-70 transition-opacity"
          >
            How-to
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 md:gap-10 items-start md:items-end">
        <div className="h-[50px] md:h-[70px] w-[23px] md:w-[31.751px]">
          <svg className="w-full h-full" fill="none" viewBox="0 0 31.751 70">
            <path d={svgPaths.p385a6880} fill="black" />
          </svg>
        </div>
        <div className="flex-1 flex flex-col md:flex-row gap-4 items-start md:items-center font-['Roboto_Mono'] text-[#485c11] text-xs tracking-[-0.12px]">
          <span>© Autolaw.ai</span>
          <span>2026</span>
        </div>
        <span className="font-['Roboto_Mono'] text-[#485c11] text-xs tracking-[-0.12px]">
          All Rights Reserved
        </span>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center overflow-x-hidden">
      <Navigation />
      <HeroSection />

      <main className="w-full flex flex-col items-center">
        <LogoCloud />
        <ProductSection />
        <FeaturesSection />
        <HowItWorksSection />
        <CTASection />
      </main>

      <Footer />
    </div>
  );
}
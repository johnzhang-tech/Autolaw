import svgPaths from "./svg-sbn51395bv";
import imgInnerScreen from "figma:asset/38f36b3f2a70738d5f0431db540a63124dd9a8a8.png";
import imgLogo from "figma:asset/7e2cb6a493f6974234a10a9155f5a9e61358668d.png";
import imgLogo1 from "figma:asset/4ec63af28a6d626d15af88690afce1177f7da2aa.png";
import imgLogo2 from "figma:asset/22502dfc1e4e8a242285d42db1a38e6e853633fc.png";
import imgLogo3 from "figma:asset/ab60fb89b643e72e94769301b2a7ea53c2788495.png";
import imgLogo4 from "figma:asset/5353f37898f8daa86c3f3f525e94362e62de8b6a.png";
import imgLogo5 from "figma:asset/262ae2257b7f47685a1fd90f0f27d6372a2bca23.png";
import imgHeroImage from "figma:asset/27594e92b9b432843319210cddc6514b6ee87450.png";
import imgImage from "figma:asset/8c5a21adadebacbd69375684275fb89819b4d967.png";
import imgImage1 from "figma:asset/de5a74711b655d5394631256a2e65f4f4b7e3f42.png";

function NavItems() {
  return (
    <div className="-translate-x-1/2 absolute backdrop-blur-[15px] bg-[rgba(255,255,255,0.4)] content-stretch flex font-['DM_Sans:Bold',sans-serif] font-bold gap-[27px] items-center left-1/2 overflow-clip px-[24px] py-[20px] rounded-[100px] text-[14px] text-black text-center top-[16px] tracking-[-0.35px]" data-name="Nav Items">
      <button aria-label="Jump to product benefits section" className="block cursor-pointer leading-[0] relative shrink-0 whitespace-nowrap" style={{ fontVariationSettings: "'opsz' 14" }}>
        <p className="leading-[1.4]">Products</p>
      </button>
      <p aria-label="Jump to product specifications section" className="leading-[1.4] relative shrink-0" style={{ fontVariationSettings: "'opsz' 14" }}>
        Solution
      </p>
      <button aria-label="Jump to product how-to section" className="block cursor-pointer leading-[0] relative shrink-0 whitespace-nowrap" style={{ fontVariationSettings: "'opsz' 14" }}>
        <p className="leading-[1.4]">How-to</p>
      </button>
      <button aria-label="Jump to contact us section" className="block cursor-pointer leading-[0] relative shrink-0 whitespace-nowrap" style={{ fontVariationSettings: "'opsz' 14" }}>
        <p className="leading-[1.4]">Contact Us</p>
      </button>
    </div>
  );
}

function Arrow() {
  return (
    <div className="content-stretch flex h-full items-center relative shrink-0 w-[7px]" data-name="Arrow">
      <div className="h-[6.011px] relative shrink-0 w-[6px]" data-name="↗">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 6.01131">
          <path d={svgPaths.p2c9abe00} fill="var(--fill-0, white)" id="â" />
        </svg>
      </div>
    </div>
  );
}

function ButtonLinkout() {
  return (
    <a className="bg-[#485c11] content-stretch cursor-pointer flex gap-[2px] items-center justify-center px-[22px] py-[14px] relative rounded-[1000px] shrink-0" data-name="Button linkout" href="https://www.figma.com/sites">
      <p className="font-['DM_Sans:Bold',sans-serif] font-bold leading-[1.4] relative shrink-0 text-[14px] text-center text-white tracking-[-0.35px]" style={{ fontVariationSettings: "'opsz' 14" }}>
        Login
      </p>
      <div className="flex flex-row items-center self-stretch">
        <Arrow />
      </div>
    </a>
  );
}

function Navigation1() {
  return (
    <div className="content-stretch flex h-[148px] items-center justify-between max-w-[1500px] pb-[80px] pt-[20px] relative shrink-0 w-full" data-name="Navigation">
      <div className="flex flex-col font-['DM_Sans:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[30px] text-black tracking-[-1.5px] whitespace-nowrap" style={{ fontVariationSettings: "'opsz' 14" }}>
        <p className="leading-[1.2]">AutoLaw</p>
      </div>
      <ButtonLinkout />
    </div>
  );
}

function Navigation() {
  return (
    <nav className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="Navigation">
      <Navigation1 />
    </nav>
  );
}

function Frame5() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
      <Navigation />
    </div>
  );
}

function Frame6() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
      <Frame5 />
    </div>
  );
}

function Frame4() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
      <Frame6 />
    </div>
  );
}

function InnerScreen() {
  return (
    <div className="-translate-x-1/2 absolute h-[607.439px] left-1/2 rounded-[16px] top-[16.5px] w-[869.742px]" data-name="Inner screen">
      <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[16px]">
        <img alt="Data points on top of landscape" className="absolute left-0 max-w-none size-full top-0" src={imgInnerScreen} />
      </div>
    </div>
  );
}

function Ipad() {
  return (
    <div aria-label="Visual chart illustrating a 78% increase in efficiency across 33 regions between 2021 and 2024, with clear upward trends year over year" className="-translate-x-1/2 -translate-y-1/2 absolute bg-black border-[rgba(255,255,255,0.5)] border-l-2 border-r-2 border-solid border-t-2 h-[644px] left-[calc(50%+0.5px)] overflow-clip rounded-[24px] shadow-[0px_-4px_20px_0px_rgba(0,0,0,0.1)] top-1/2 w-[907px]" data-name="Ipad">
      <InnerScreen />
    </div>
  );
}

function HeroImage() {
  return (
    <div className="bg-[#8e9c78] h-[362px] relative rounded-[30px] shrink-0 w-full" data-name="Hero image">
      <Ipad />
    </div>
  );
}

function Header() {
  return (
    <header className="content-stretch flex flex-col gap-[240px] items-start max-w-[1500px] overflow-clip relative shrink-0 w-full" data-name="Header">
      <h1 className="block font-['Crimson_Text:Regular',sans-serif] leading-[0.9] not-italic relative shrink-0 text-[160px] text-black text-center tracking-[-6.8px] w-full whitespace-pre-wrap">Your AI Case Operating System</h1>
      <HeroImage />
    </header>
  );
}

function Logo() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px mix-blend-exclusion opacity-60 relative w-full" data-name="Logo">
      <img alt="Logoipsum" className="absolute inset-0 max-w-none object-contain pointer-events-none size-full" src={imgLogo} />
    </div>
  );
}

function Logo1() {
  return (
    <div className="content-stretch flex flex-col h-[84px] items-start justify-center overflow-clip p-[20px] relative shrink-0 w-[154px]" data-name="Logo 1">
      <Logo />
    </div>
  );
}

function Logo3() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px mix-blend-exclusion opacity-60 relative w-full" data-name="Logo">
      <img alt="Logoipsum" className="absolute inset-0 max-w-none object-contain pointer-events-none size-full" src={imgLogo1} />
    </div>
  );
}

function Logo2() {
  return (
    <div className="content-stretch flex flex-col h-[84px] items-start justify-center overflow-clip p-[20px] relative shrink-0 w-[154px]" data-name="Logo 2">
      <Logo3 />
    </div>
  );
}

function Logo5() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px mix-blend-exclusion opacity-60 relative w-full" data-name="Logo">
      <img alt="Logoipsum" className="absolute inset-0 max-w-none object-contain pointer-events-none size-full" src={imgLogo2} />
    </div>
  );
}

function Logo4() {
  return (
    <div className="content-stretch flex flex-col h-[84px] items-start justify-center p-[20px] relative shrink-0 w-[154px]" data-name="Logo 3">
      <Logo5 />
    </div>
  );
}

function Logo7() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px mix-blend-exclusion opacity-60 relative w-full" data-name="Logo">
      <img alt="Logoipsum" className="absolute inset-0 max-w-none object-contain pointer-events-none size-full" src={imgLogo3} />
    </div>
  );
}

function Logo6() {
  return (
    <div className="content-stretch flex flex-col h-[84px] items-start justify-center overflow-clip p-[20px] relative shrink-0 w-[154px]" data-name="Logo 4">
      <Logo7 />
    </div>
  );
}

function Logo9() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px mix-blend-exclusion opacity-60 relative w-full" data-name="Logo">
      <img alt="Logoipsum" className="absolute inset-0 max-w-none object-contain pointer-events-none size-full" src={imgLogo4} />
    </div>
  );
}

function Logo8() {
  return (
    <div className="content-stretch flex flex-col h-[84px] items-start justify-center p-[20px] relative shrink-0 w-[154px]" data-name="Logo 5">
      <Logo9 />
    </div>
  );
}

function Logo11() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px mix-blend-exclusion opacity-60 relative w-full" data-name="Logo">
      <img alt="Logoipsum" className="absolute inset-0 max-w-none object-contain pointer-events-none size-full" src={imgLogo5} />
    </div>
  );
}

function Logo10() {
  return (
    <div className="content-stretch flex flex-col h-[81.818px] items-start justify-center overflow-clip p-[20px] relative shrink-0 w-[150px]" data-name="Logo 6">
      <Logo11 />
    </div>
  );
}

function LogoRow() {
  return (
    <div className="content-center flex flex-wrap gap-[20px_40px] items-center justify-center relative shrink-0 w-full" data-name="Logo Row">
      <Logo1 />
      <Logo2 />
      <Logo4 />
      <Logo6 />
      <Logo8 />
      <Logo10 />
    </div>
  );
}

function LogoCloud() {
  return (
    <div className="content-stretch flex flex-col gap-[30px] items-center max-w-[1500px] py-[50px] relative shrink-0 w-full" data-name="Logo cloud">
      <p className="font-['DM_Sans:Regular',sans-serif] font-normal leading-[1.4] relative shrink-0 text-[#6f6f6f] text-[15px] tracking-[-0.075px] w-full whitespace-pre-wrap" style={{ fontVariationSettings: "'opsz' 14" }}>
        Trusted by:
      </p>
      <LogoRow />
    </div>
  );
}

function Text() {
  return (
    <div className="relative shrink-0 w-full" data-name="Text">
      <div className="content-stretch flex flex-col gap-[50px] items-start pr-[400px] relative w-full whitespace-pre-wrap">
        <h2 className="block font-['Roboto_Mono:Regular',sans-serif] font-normal leading-[1.4] relative shrink-0 text-[#485c11] text-[12px] tracking-[-0.12px] w-[575.566px]">Products</h2>
        <p className="font-['Crimson_Text:Regular',sans-serif] leading-[0.9] min-w-full not-italic relative shrink-0 text-[60px] text-black tracking-[-1.8px] w-[min-content]">The first agentic case platform that turns messy files into proactive, evidence-linked litigation work products</p>
        <p className="font-['DM_Sans:Regular',sans-serif] font-normal leading-[1.4] min-w-full relative shrink-0 text-[#6f6f6f] text-[15px] tracking-[-0.075px] w-[min-content]" style={{ fontVariationSettings: "'opsz' 14" }}>{`Autolaw turns massive PI & WC case files into a computable Case Memory (powered by an evolving legal-medical ontology), then agentic AI workers automatically assemble litigation-ready work products—chronology, exhibits, damages inputs, and demand packets—far beyond “chat with docs.” and Summarizations.`}</p>
      </div>
    </div>
  );
}

function CableIcon() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Cable icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Cable icon">
          <path d={svgPaths.p37c59480} fill="var(--fill-0, black)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Text1() {
  return (
    <div className="content-stretch flex flex-col gap-[20px] items-start relative shrink-0 w-full whitespace-pre-wrap" data-name="Text 1">
      <p className="font-['Crimson_Text:Bold',sans-serif] leading-none not-italic relative shrink-0 text-[18px] text-black tracking-[-0.54px] w-full">Chronology Compiler Agent</p>
      <p className="font-['DM_Sans:Regular',sans-serif] font-normal h-[97px] leading-[0] relative shrink-0 text-[#6f6f6f] text-[0px] text-[15px] tracking-[-0.075px] w-full" style={{ fontVariationSettings: "'opsz' 14" }}>
        <span className="leading-[1.4]">
          {`Automatically builds a litigation ready, evidence linked medical chronology, organized by date of service and mapped to your PI & WC ontology for maximum accuracy across providers, diagnoses, imaging, procedures, and restrictions.`}
          <br aria-hidden="true" />
        </span>
        <span className="font-['DM_Sans:Bold',sans-serif] font-bold leading-[1.4]" style={{ fontVariationSettings: "'opsz' 14" }}>
          Outputs:
        </span>
        <span className="leading-[1.4]">{` a polished chronology draft with pinpoint exhibit anchors (doc/page/snippet) for every entry.`}</span>
      </p>
    </div>
  );
}

function IconLockup() {
  return (
    <section aria-label="Area product benefit 1 of 4" className="flex-[1_0_0] min-h-px min-w-[265px] relative" data-name="Icon lockup 1">
      <div aria-hidden="true" className="absolute border-[#e9e9e9] border-solid border-t inset-0 pointer-events-none" />
      <div className="content-stretch flex flex-col gap-[24px] items-start min-w-[inherit] pr-[20px] py-[40px] relative w-full">
        <CableIcon />
        <Text1 />
      </div>
    </section>
  );
}

function GovernmentIcon() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Government icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Government icon">
          <path d={svgPaths.p2f11bb00} fill="var(--fill-0, black)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Text2() {
  return (
    <div className="content-stretch flex flex-col gap-[20px] items-start relative shrink-0 w-full whitespace-pre-wrap" data-name="Text 2">
      <p className="font-['Crimson_Text:Bold',sans-serif] leading-none not-italic relative shrink-0 text-[18px] text-black tracking-[-0.54px] w-full">Demand Package Builder Agent</p>
      <p className="font-['DM_Sans:Regular',sans-serif] font-normal leading-[0] relative shrink-0 text-[#6f6f6f] text-[0px] text-[15px] tracking-[-0.075px] w-full" style={{ fontVariationSettings: "'opsz' 14" }}>
        <span className="leading-[1.4]">
          Orchestrates your end to end demand packet using prebuilt playbooks, prompts, and automations—assembling every section (intro, liability/facts, medical, damages, and exhibits) from your Case Memory with strict evidence grounding.
          <br aria-hidden="true" />
        </span>
        <span className="font-['DM_Sans:Bold',sans-serif] font-bold leading-[1.4]" style={{ fontVariationSettings: "'opsz' 14" }}>{`Outputs: `}</span>
        <span className="leading-[1.4]">an editable, litigation ready draft with automated citation formatting and clear “unsupported claim” flags instead of guesswork.</span>
      </p>
    </div>
  );
}

function IconLockup1() {
  return (
    <section aria-label="Area product benefit 2 of 4" className="flex-[1_0_0] min-h-px min-w-[265px] relative" data-name="Icon lockup 2">
      <div aria-hidden="true" className="absolute border-[#e9e9e9] border-solid border-t inset-0 pointer-events-none" />
      <div className="content-stretch flex flex-col gap-[20px] items-start min-w-[inherit] pr-[20px] py-[40px] relative w-full">
        <GovernmentIcon />
        <Text2 />
      </div>
    </section>
  );
}

function AccountIcon() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Account icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Account icon">
          <path d={svgPaths.p1d817280} fill="var(--fill-0, black)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Text3() {
  return (
    <div className="content-stretch flex flex-col gap-[20px] items-start relative shrink-0 w-full whitespace-pre-wrap" data-name="Text 3">
      <p className="font-['Crimson_Text:Bold',sans-serif] leading-none not-italic relative shrink-0 text-[18px] text-black tracking-[-0.54px] w-full">Case Copilot Agent</p>
      <p className="font-['DM_Sans:Regular',sans-serif] font-normal h-[93px] leading-[1.4] relative shrink-0 text-[#6f6f6f] text-[15px] tracking-[-0.075px] w-full" style={{ fontVariationSettings: "'opsz' 14" }}>
        Securely answers case questions using your legal knowledge graph and Case Memory—grounding every response in verifiable citations (document/page/snippet) and never relying on unsupported assumptions.
        <br aria-hidden="true" />
        Outputs: citation-backed answers plus intelligent gap detection that prompts for missing artifacts and the exact evidence needed to complete the record.
      </p>
    </div>
  );
}

function IconLockup2() {
  return (
    <section aria-label="Area product benefit 3 of 4" className="flex-[1_0_0] min-h-px min-w-[265px] relative" data-name="Icon lockup 3">
      <div aria-hidden="true" className="absolute border-[#e9e9e9] border-solid border-t inset-0 pointer-events-none" />
      <div className="content-stretch flex flex-col gap-[24px] items-start min-w-[inherit] pr-[40px] py-[40px] relative w-full">
        <AccountIcon />
        <Text3 />
      </div>
    </section>
  );
}

function CheckIcon() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Check icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Check icon">
          <path d={svgPaths.p39d55130} fill="var(--fill-0, black)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Text4() {
  return (
    <div className="content-stretch flex flex-col gap-[20px] items-start relative shrink-0 w-full whitespace-pre-wrap" data-name="Text 4">
      <p className="font-['Crimson_Text:Bold',sans-serif] leading-none not-italic relative shrink-0 text-[18px] text-black tracking-[-0.54px] w-full">Firm Playbook Agent</p>
      <p className="font-['DM_Sans:Regular',sans-serif] font-normal leading-[0] relative shrink-0 text-[#6f6f6f] text-[0px] text-[15px] tracking-[-0.075px] w-full" style={{ fontVariationSettings: "'opsz' 14" }}>
        <span className="leading-[1.4]">
          Automatically enforces your firm’s best practices—standardizing structure, tone, required sections, and prohibited language to ensure consistency, compliance, and governance across every work product.
          <br aria-hidden="true" />
        </span>
        <span className="font-['DM_Sans:Bold',sans-serif] font-bold leading-[1.4]" style={{ fontVariationSettings: "'opsz' 14" }}>{`Outputs: `}</span>
        <span className="leading-[1.4]">the same facts and citations, packaged in a firm-approved format that’s ready to file or send.</span>
      </p>
    </div>
  );
}

function IconLockup3() {
  return (
    <section aria-label="Area product benefit 4 of 4" className="flex-[1_0_0] min-h-px min-w-[265px] relative" data-name="Icon lockup 4">
      <div aria-hidden="true" className="absolute border-[#e9e9e9] border-solid border-t inset-0 pointer-events-none" />
      <div className="content-stretch flex flex-col gap-[24px] items-start min-w-[inherit] pr-[40px] py-[40px] relative w-full">
        <CheckIcon />
        <Text4 />
      </div>
    </section>
  );
}

function IconsModule() {
  return (
    <div className="content-start flex flex-wrap gap-[20px] h-[363px] items-start pt-[40px] relative shrink-0 w-full" data-name="Icons module">
      <IconLockup />
      <IconLockup1 />
      <IconLockup2 />
      <IconLockup3 />
    </div>
  );
}

function HeadlineAndIcons() {
  return (
    <section className="content-stretch flex flex-col gap-[50px] items-start pb-[60px] pt-[80px] relative shrink-0 w-full" data-name="Headline and icons">
      <div aria-hidden="true" className="absolute border-[#e9e9e9] border-solid border-t-[0.5px] inset-0 pointer-events-none" />
      <Text />
      <IconsModule />
    </section>
  );
}

function HeroImage1() {
  return (
    <div className="h-[473px] relative rounded-[30px] shrink-0 w-[1198px]" data-name="Hero Image">
      <img alt="A image that shows a mountain range" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[30px] size-full" src={imgHeroImage} />
    </div>
  );
}

function ProductSection() {
  return (
    <div className="content-stretch flex flex-col items-start max-w-[1500px] pb-[120px] relative shrink-0 w-full" data-name="Product section">
      <HeadlineAndIcons />
      <HeroImage1 />
    </div>
  );
}

function Title() {
  return (
    <div className="relative shrink-0 w-full" data-name="Title">
      <div className="content-stretch flex flex-col gap-[40px] items-start pr-[80px] relative w-full whitespace-pre-wrap">
        <p className="font-['Crimson_Text:Regular',sans-serif] leading-[0.9] not-italic relative shrink-0 text-[60px] text-black tracking-[-1.8px] w-full">{`Built for PI & WC, Agentic AI`}</p>
        <p className="font-['DM_Sans:Regular',sans-serif] font-normal leading-[1.4] relative shrink-0 text-[#6f6f6f] text-[15px] tracking-[-0.075px] w-full" style={{ fontVariationSettings: "'opsz' 14" }}>{`Autolaw is an agentic automation platform built for the AI era and purpose-built for Personal Injury and Workers’ Compensation. Powered by the industry’s first PI & WC ontology, it helps firms move faster with confidence by delivering consistently accurate, audit-ready outputs. The result is stronger work product quality, fewer rework cycles, and predictable throughput across the firm.`}</p>
      </div>
    </div>
  );
}

function ListItem() {
  return (
    <section aria-label="Area value prop 1 of 4" className="relative shrink-0 w-full" data-name="List Item 1">
      <div aria-hidden="true" className="absolute border-[#e9e9e9] border-solid border-t inset-0 pointer-events-none" />
      <div className="flex flex-row justify-center size-full">
        <div className="content-stretch flex gap-[30px] items-start justify-center pr-[80px] py-[20px] relative text-[15px] tracking-[-0.075px] w-full">
          <p className="font-['DM_Sans:Bold',sans-serif] font-bold leading-[1.4] relative shrink-0 text-[#6f6f6f]" style={{ fontVariationSettings: "'opsz' 14" }}>
            01
          </p>
          <p className="flex-[1_0_0] font-['DM_Sans:Regular',sans-serif] font-normal leading-[0] min-h-px min-w-px relative text-[0px] text-black whitespace-pre-wrap" style={{ fontVariationSettings: "'opsz' 14" }}>
            <span className="font-['DM_Sans:Bold',sans-serif] font-bold leading-[1.4]" style={{ fontVariationSettings: "'opsz' 14" }}>
              Fits your workflow
            </span>
            <span className="leading-[1.4]">
              <br aria-hidden="true" />
              {` Connects to Dropbox and common case document systems for seamless, ongoing intake.`}
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}

function ListItem1() {
  return (
    <section aria-label="Area value prop 2 of 4" className="relative shrink-0 w-full" data-name="List Item 2">
      <div aria-hidden="true" className="absolute border-[#e9e9e9] border-solid border-t inset-0 pointer-events-none" />
      <div className="flex flex-row justify-center size-full">
        <div className="content-stretch flex gap-[30px] items-start justify-center pr-[80px] py-[20px] relative text-[15px] tracking-[-0.075px] w-full">
          <p className="font-['DM_Sans:Bold',sans-serif] font-bold leading-[1.4] relative shrink-0 text-[#6f6f6f]" style={{ fontVariationSettings: "'opsz' 14" }}>
            02
          </p>
          <p className="flex-[1_0_0] font-['DM_Sans:Regular',sans-serif] font-normal leading-[0] min-h-px min-w-px relative text-[0px] text-black whitespace-pre-wrap" style={{ fontVariationSettings: "'opsz' 14" }}>
            <span className="font-['DM_Sans:Bold',sans-serif] font-bold leading-[1.4]" style={{ fontVariationSettings: "'opsz' 14" }}>
              Privacy and security by design
            </span>
            <span className="leading-[1.4]">
              <br aria-hidden="true" />
              {` Your data stays under your control with enterprise-grade safeguards and auditable access.`}
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}

function ListItem2() {
  return (
    <section aria-label="Area value prop 3 of 4" className="relative shrink-0 w-full" data-name="List Item 3">
      <div aria-hidden="true" className="absolute border-[#e9e9e9] border-solid border-t inset-0 pointer-events-none" />
      <div className="flex flex-row justify-center size-full">
        <div className="content-stretch flex gap-[30px] items-start justify-center pr-[80px] py-[20px] relative text-[15px] tracking-[-0.075px] w-full">
          <p className="font-['DM_Sans:Bold',sans-serif] font-bold leading-[1.4] relative shrink-0 text-[#6f6f6f]" style={{ fontVariationSettings: "'opsz' 14" }}>
            03
          </p>
          <p className="flex-[1_0_0] font-['DM_Sans:Regular',sans-serif] font-normal leading-[0] min-h-px min-w-px relative text-[0px] text-black whitespace-pre-wrap" style={{ fontVariationSettings: "'opsz' 14" }}>
            <span className="font-['DM_Sans:Bold',sans-serif] font-bold leading-[1.4]" style={{ fontVariationSettings: "'opsz' 14" }}>{`Ontology-first accuracy for PI & WC`}</span>
            <span className="leading-[1.4]">
              <br aria-hidden="true" />
              {` Powered by the first PI & WC ontology to drive consistent, grounded, verifiable outputs.`}
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}

function ListItem3() {
  return (
    <section aria-label="Area value prop 4 of 4" className="relative shrink-0 w-full" data-name="List Item 4">
      <div aria-hidden="true" className="absolute border-[#e9e9e9] border-solid border-t inset-0 pointer-events-none" />
      <div className="flex flex-row justify-center size-full">
        <div className="content-stretch flex gap-[30px] items-start justify-center pr-[80px] py-[20px] relative text-[15px] tracking-[-0.075px] w-full">
          <p className="font-['DM_Sans:Bold',sans-serif] font-bold leading-[1.4] relative shrink-0 text-[#6f6f6f]" style={{ fontVariationSettings: "'opsz' 14" }}>
            04
          </p>
          <p className="flex-[1_0_0] font-['DM_Sans:Regular',sans-serif] font-normal leading-[0] min-h-px min-w-px relative text-[0px] text-black whitespace-pre-wrap" style={{ fontVariationSettings: "'opsz' 14" }}>
            <span className="font-['DM_Sans:Bold',sans-serif] font-bold leading-[1.4]" style={{ fontVariationSettings: "'opsz' 14" }}>
              Value-based pricing, not per-page
            </span>
            <span className="leading-[1.4]">
              <br aria-hidden="true" />
              {` No per-document or per-page fees; pricing reflects delivered work products and outcomes.`}
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}

function List() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="List">
      <ListItem />
      <ListItem1 />
      <ListItem2 />
      <ListItem3 />
    </div>
  );
}

function Button() {
  return (
    <a className="bg-[#dfecc6] content-stretch cursor-pointer flex flex-col items-center justify-center px-[22px] py-[14px] relative rounded-[1000px] shrink-0" data-name="Button" href="https://www.figma.com/sites">
      <p className="font-['DM_Sans:Bold',sans-serif] font-bold leading-[1.4] relative shrink-0 text-[14px] text-black text-center tracking-[-0.35px]" style={{ fontVariationSettings: "'opsz' 14" }}>
        Discover More
      </p>
    </a>
  );
}

function Text5() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[40px] items-start min-h-px min-w-px pb-[80px] pt-[60px] relative" data-name="Text">
      <div aria-hidden="true" className="absolute border-[#e9e9e9] border-solid border-t inset-0 pointer-events-none" />
      <Title />
      <List />
      <Button />
    </div>
  );
}

function Image() {
  return (
    <div className="h-[711px] relative rounded-[30px] shrink-0 w-full" data-name="Image">
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[30px]">
        <img alt="A render of three white cylindrical columns, against a warm creme background" className="absolute max-w-none object-cover rounded-[30px] size-full" src={imgImage} />
        <div className="absolute bg-[rgba(0,0,0,0.06)] inset-0 rounded-[30px]" />
      </div>
      <div className="flex flex-col items-end size-full">
        <div className="size-full" />
      </div>
    </div>
  );
}

function FeaturesCarouselV() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start max-w-[1600px] min-h-px min-w-px relative" data-name="Features carousel v1">
      <Image />
    </div>
  );
}

function FeaturesCarousel() {
  return (
    <section className="content-stretch flex gap-[20px] items-start max-w-[1500px] pb-[120px] relative shrink-0 w-full" data-name="Features carousel">
      <Text5 />
      <FeaturesCarouselV />
    </section>
  );
}

function Button1() {
  return (
    <a className="bg-[#dfecc6] content-stretch cursor-pointer flex flex-col items-center justify-center px-[22px] py-[14px] relative rounded-[1000px] shrink-0" data-name="Button" href="https://www.figma.com/sites">
      <p className="font-['DM_Sans:Bold',sans-serif] font-bold leading-[1.4] relative shrink-0 text-[14px] text-black text-center tracking-[-0.35px]" style={{ fontVariationSettings: "'opsz' 14" }}>
        Discover More
      </p>
    </a>
  );
}

function Frame3() {
  return (
    <div className="content-stretch flex items-start justify-between relative shrink-0 w-full">
      <p className="font-['Crimson_Text:Regular',sans-serif] leading-[0.9] not-italic relative shrink-0 text-[60px] text-black text-center tracking-[-1.8px]">Get Started in 3 Steps</p>
      <Button1 />
    </div>
  );
}

function Frame() {
  return (
    <div className="content-stretch flex flex-col gap-[20px] items-start relative shrink-0 w-full">
      <p className="font-['Crimson_Text:Regular',sans-serif] leading-none not-italic relative shrink-0 text-[18px] text-black tracking-[-0.54px] w-full">Connect your documents</p>
      <p className="font-['DM_Sans:Regular',sans-serif] font-normal leading-[1.4] relative shrink-0 text-[#6f6f6f] text-[15px] tracking-[-0.075px] w-full" style={{ fontVariationSettings: "'opsz' 14" }}>
        Integrate with Dropbox and your existing file structure for continuous intake as records arrive, change, and expand.
      </p>
    </div>
  );
}

function Lockup() {
  return (
    <section aria-label="Step 1 of 3" className="flex-[1_0_0] min-h-px min-w-[240px] relative" data-name="Lockup 1">
      <div aria-hidden="true" className="absolute border-[#e9e9e9] border-solid border-t inset-0 pointer-events-none" />
      <div className="content-stretch flex flex-col gap-[60px] items-start min-w-[inherit] pb-[20px] pr-[30px] pt-[60px] relative w-full whitespace-pre-wrap">
        <p className="font-['DM_Sans:Regular',sans-serif] font-normal leading-none relative shrink-0 text-[#929292] text-[80px] tracking-[-3.2px] w-full" style={{ fontVariationSettings: "'opsz' 14" }}>
          01
        </p>
        <Frame />
      </div>
    </section>
  );
}

function Frame1() {
  return (
    <div className="content-stretch flex flex-col gap-[20px] items-start relative shrink-0 w-full">
      <p className="font-['Crimson_Text:Regular',sans-serif] leading-none not-italic relative shrink-0 text-[18px] text-black tracking-[-0.54px] w-full">Let the AI agents do the work</p>
      <p className="font-['DM_Sans:Regular',sans-serif] font-normal leading-[1.4] relative shrink-0 text-[#6f6f6f] text-[15px] tracking-[-0.075px] w-full" style={{ fontVariationSettings: "'opsz' 14" }}>
        With a simple setup, our agentic platform handles normalization, indexing, extraction, and verification so your team stays focused on the business.
      </p>
    </div>
  );
}

function Lockup1() {
  return (
    <section aria-label="Step 2 of 3" className="flex-[1_0_0] min-h-px min-w-[240px] relative" data-name="Lockup 2">
      <div aria-hidden="true" className="absolute border-[#e9e9e9] border-solid border-t inset-0 pointer-events-none" />
      <div className="content-stretch flex flex-col gap-[60px] items-start min-w-[inherit] pb-[20px] pr-[30px] pt-[60px] relative w-full whitespace-pre-wrap">
        <p className="font-['DM_Sans:Regular',sans-serif] font-normal leading-none relative shrink-0 text-[#929292] text-[80px] tracking-[-3.2px] w-full" style={{ fontVariationSettings: "'opsz' 14" }}>
          02
        </p>
        <Frame1 />
      </div>
    </section>
  );
}

function Frame2() {
  return (
    <div className="content-stretch flex flex-col gap-[20px] items-start relative shrink-0 w-full">
      <p className="font-['Crimson_Text:Regular',sans-serif] leading-none not-italic relative shrink-0 text-[18px] text-black tracking-[-0.54px] w-full">Built-in governance</p>
      <p className="font-['DM_Sans:Regular',sans-serif] font-normal leading-[1.4] relative shrink-0 text-[#6f6f6f] text-[15px] tracking-[-0.075px] w-full" style={{ fontVariationSettings: "'opsz' 14" }}>{`PI & WC ontology enforces evidence-linked outputs (doc/page/snippet) and flags conflicts instead of guessing.`}</p>
    </div>
  );
}

function Lockup2() {
  return (
    <section aria-label="Step 3 of 3" className="flex-[1_0_0] min-h-px min-w-[240px] relative" data-name="Lockup 3">
      <div aria-hidden="true" className="absolute border-[#e9e9e9] border-solid border-t inset-0 pointer-events-none" />
      <div className="content-stretch flex flex-col gap-[60px] items-start min-w-[inherit] pb-[20px] pr-[30px] pt-[60px] relative w-full whitespace-pre-wrap">
        <p className="font-['DM_Sans:Regular',sans-serif] font-normal leading-none relative shrink-0 text-[#929292] text-[80px] tracking-[-3.2px] w-full" style={{ fontVariationSettings: "'opsz' 14" }}>
          03
        </p>
        <Frame2 />
      </div>
    </section>
  );
}

function Component3Up() {
  return (
    <div className="content-stretch flex gap-[20px] items-start justify-center relative shrink-0 w-full" data-name="3-up">
      <Lockup />
      <Lockup1 />
      <Lockup2 />
    </div>
  );
}

function HowItWorksSection() {
  return (
    <section className="content-stretch flex flex-col gap-[80px] items-start max-w-[1500px] pb-[120px] pt-[80px] relative shrink-0 w-full" data-name="How it works section">
      <div aria-hidden="true" className="absolute border-[#e9e9e9] border-solid border-t inset-0 pointer-events-none" />
      <Frame3 />
      <Component3Up />
    </section>
  );
}

function Image1() {
  return (
    <div className="flex-[1_0_0] h-full min-h-px min-w-px relative" data-name="Image">
      <img alt="An eye-catching landscape of green." className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage1} />
      <div className="flex flex-row items-center size-full">
        <div className="size-full" />
      </div>
    </div>
  );
}

function ImageContainer() {
  return (
    <div aria-label="Image showing a winding path going up a mountain" className="aspect-[1120/620] content-stretch flex items-start max-h-[830.357177734375px] max-w-[1500px] overflow-clip relative rounded-[30px] shrink-0 w-full" data-name="Image container">
      <Image1 />
    </div>
  );
}

function HeroImage2() {
  return (
    <div className="content-stretch flex flex-col items-center pb-[40px] relative shrink-0 w-full" data-name="Hero image">
      <ImageContainer />
    </div>
  );
}

function Arrow1() {
  return (
    <div className="content-stretch flex h-full items-center relative shrink-0 w-[7px]" data-name="Arrow">
      <div className="h-[6.011px] relative shrink-0 w-[6px]" data-name="↗">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 6.01131">
          <path d={svgPaths.p2c9abe00} fill="var(--fill-0, white)" id="â" />
        </svg>
      </div>
    </div>
  );
}

function ButtonLinkout1() {
  return (
    <a className="bg-[#485c11] cursor-pointer relative rounded-[1000px] shrink-0 w-full" data-name="Button linkout" href="https://www.figma.com/sites">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex gap-[2px] items-center justify-center px-[22px] py-[14px] relative w-full">
          <p className="font-['DM_Sans:Bold',sans-serif] font-bold leading-[1.4] relative shrink-0 text-[14px] text-center text-white tracking-[-0.35px]" style={{ fontVariationSettings: "'opsz' 14" }}>
            Learn More
          </p>
          <div className="flex flex-row items-center self-stretch">
            <Arrow1 />
          </div>
        </div>
      </div>
    </a>
  );
}

function CenteredCta() {
  return (
    <section className="max-w-[1500px] relative shrink-0 w-full" data-name="Centered CTA">
      <div aria-hidden="true" className="absolute border-[#e9e9e9] border-solid border-t-[0.5px] inset-0 pointer-events-none" />
      <div className="flex flex-col items-center max-w-[inherit] size-full">
        <div className="content-stretch flex flex-col gap-[40px] items-center max-w-[inherit] px-[300px] py-[120px] relative w-full">
          <p className="font-['Crimson_Text:Regular',sans-serif] leading-[0.9] not-italic relative shrink-0 text-[60px] text-black text-center tracking-[-1.8px] w-full whitespace-pre-wrap">Connect with us</p>
          <p className="font-['DM_Sans:Regular',sans-serif] font-normal leading-[1.4] relative shrink-0 text-[#6f6f6f] text-[15px] text-center tracking-[-0.075px] w-full whitespace-pre-wrap" style={{ fontVariationSettings: "'opsz' 14" }}>
            Schedule a quick call to learn how Area can turn your regional data into a powerful advantage.
          </p>
          <ButtonLinkout1 />
        </div>
      </div>
    </section>
  );
}

function Main() {
  return (
    <main className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Main" tabIndex="-1">
      <LogoCloud />
      <ProductSection />
      <FeaturesCarousel />
      <HowItWorksSection />
      <HeroImage2 />
      <CenteredCta />
    </main>
  );
}

function NavItems1() {
  return (
    <div className="content-stretch flex font-['DM_Sans:Bold',sans-serif] font-bold gap-[27px] items-center relative shrink-0 text-[14px] text-black text-center tracking-[-0.35px]" data-name="Nav Items">
      <button className="block cursor-pointer leading-[0] relative shrink-0 whitespace-nowrap" style={{ fontVariationSettings: "'opsz' 14" }}>
        <p className="leading-[1.4]">Products</p>
      </button>
      <p className="leading-[1.4] relative shrink-0" style={{ fontVariationSettings: "'opsz' 14" }}>
        Solution
      </p>
      <button className="block cursor-pointer leading-[0] relative shrink-0 whitespace-nowrap" style={{ fontVariationSettings: "'opsz' 14" }}>
        <p className="leading-[1.4]">How-to</p>
      </button>
    </div>
  );
}

function Links() {
  return (
    <div className="content-stretch flex h-[40px] items-center justify-between relative shrink-0 w-full" data-name="Links">
      <NavItems1 />
    </div>
  );
}

function Logo12() {
  return (
    <div className="h-[70px] relative shrink-0 w-[31.751px]" data-name="Logo">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 31.751 70">
        <g id="Logo">
          <path d={svgPaths.p385a6880} fill="var(--fill-0, black)" id="Union" />
        </g>
      </svg>
    </div>
  );
}

function Text6() {
  return (
    <div className="content-stretch flex flex-[1_0_0] font-['Roboto_Mono:Regular',sans-serif] font-normal gap-[16px] items-center leading-[0] min-h-px min-w-px relative text-[#485c11] text-[12px] tracking-[-0.12px] whitespace-nowrap" data-name="Text">
      <div className="flex flex-col justify-center relative shrink-0">
        <p className="leading-[1.4]">© Autolaw.ai</p>
      </div>
      <div className="flex flex-col justify-center relative shrink-0">
        <p className="leading-[1.4]">2026</p>
      </div>
    </div>
  );
}

function Credits() {
  return (
    <div className="content-stretch flex gap-[40px] items-end relative shrink-0 w-full" data-name="Credits">
      <Logo12 />
      <Text6 />
      <div className="flex flex-col font-['Roboto_Mono:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#485c11] text-[12px] tracking-[-0.12px] whitespace-nowrap">
        <p className="leading-[1.4]">All Rights Reserved</p>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="content-stretch flex flex-col gap-[80px] items-start justify-end max-w-[1500px] pb-[20px] pt-[40px] relative shrink-0 w-full" data-name="Footer">
      <div aria-hidden="true" className="absolute border-[#e9e9e9] border-solid border-t inset-0 pointer-events-none" />
      <Links />
      <Credits />
    </footer>
  );
}

function Desktop() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col items-center left-0 overflow-auto pb-[20px] px-[40px] top-0 w-[1280px]" data-name="Desktop">
      <NavItems />
      <Frame4 />
      <Header />
      <Main />
      <Footer />
    </div>
  );
}

export default function Frame7() {
  return (
    <div className="relative size-full">
      <Desktop />
    </div>
  );
}
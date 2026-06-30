import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Dna, 
  Sparkles, 
  ArrowRight, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  ShieldCheck, 
  BookOpen, 
  CheckCircle, 
  Globe, 
  FileText, 
  Zap, 
  AlertTriangle, 
  ArrowUpRight,
  ChevronRight,
  Calculator,
  Building,
  HelpCircle,
  Shield,
  Layers,
  MapPin,
  Maximize2,
  Lock,
  ChevronDown,
  Info
} from 'lucide-react';

interface LandingPageProps {
  onExplore: () => void;
}

export default function LandingPage({ onExplore }: LandingPageProps) {
  // ROI Calculator States
  const [submissionsPerYear, setSubmissionsPerYear] = useState(3);
  const [averageDrugRevenue, setAverageDrugRevenue] = useState(250); // in millions USD

  // Calculations
  const manualHoursPerDossier = 450;
  const standardConsultantRate = 185; // USD/hour
  const totalManualCost = submissionsPerYear * manualHoursPerDossier * standardConsultantRate;
  
  // With Harmonizer, 90% hours saved
  const harmonizerHoursPerDossier = 45;
  const totalHarmonizedCost = submissionsPerYear * harmonizerHoursPerDossier * standardConsultantRate;
  const directSavings = totalManualCost - totalHarmonizedCost;

  // Opportunity cost of delay: standard multi-region alignment takes 5 months of back-and-forth
  // Harmonizer reduces alignment & audit time down to 1.5 weeks (0.35 months)
  const averageMonthsSaved = 4.5;
  const monthlyRevenue = averageDrugRevenue / 12;
  const opportunityGain = submissionsPerYear * averageMonthsSaved * monthlyRevenue; // in millions USD

  // Total Executive Value
  const totalFinancialImpact = (directSavings / 1000000) + opportunityGain;

  // State for active interactive tabs
  const [activeModuleTab, setActiveModuleTab] = useState<'m1' | 'm2' | 'm3' | 'm4_m5'>('m1');
  const [selectedScenario, setSelectedScenario] = useState<'oncology' | 'biologic' | 'vaccine'>('oncology');
  const [faqExpanded, setFaqExpanded] = useState<number | null>(null);

  // Deep dive module content
  const moduleData = {
    m1: {
      title: "Module 1: Administrative Info & Labeling",
      subtitle: "FDA USPI ➔ EMA SmPC ➔ Regional Requirements",
      description: "Automatically maps US Prescribing Information structures to European Union Summary of Product Characteristics (SmPC) standards and other custom country annexes.",
      items: [
        "Re-arranges Boxed Warnings into dedicated safety chapters conforming to EMA Annex II.",
        "Translates FDA Highlights structure to the traditional EMA 10-heading format.",
        "Standardizes regional medical terminology and localized clinical indications.",
        "Conforms instantly to Swissmedic, Health Canada, or CDSCO administrative wrappers."
      ],
      timeSavings: "92% Reduction in specialist labeling hours",
      riskMitigation: "Eliminates major source of Refuse-to-File (RTF) administrative errors",
      tagColor: "from-emerald-400 to-teal-500",
      accentGlow: "rgba(16,185,129,0.15)"
    },
    m2: {
      title: "Module 2: Common Technical Document Summaries",
      subtitle: "QOS & Clinical Overviews Alignment",
      description: "Harmonizes high-level summaries including the Quality Overall Summary (QOS), Clinical Overview, and Nonclinical Overview documents.",
      items: [
        "Synchronizes clinical endpoint phrasing and statistical definitions.",
        "Aligns reference lists, monograph citations, and document linkage schemas.",
        "Transforms complex text tables to match target health authority preferred font-scale & grids.",
        "Generates cross-document validation logs indicating argument consistency."
      ],
      timeSavings: "Saves up to 140 medical-writing hours per dossier",
      riskMitigation: "Guarantees logic and data cohesion across all executive summaries",
      tagColor: "from-blue-400 to-indigo-500",
      accentGlow: "rgba(59,130,246,0.15)"
    },
    m3: {
      title: "Module 3: Quality / Chemical, Manufacturing & Controls (CMC)",
      subtitle: "Pharmacopoeial Synch & Climate Stability Zones",
      description: "The most critical portion of multi-market alignment. Maps drug substance and product specifications between USP, Ph. Eur., JP, and global standards.",
      items: [
        "Detects and flags variations in raw materials monograph guidelines (e.g. USP vs European Ph. Eur.).",
        "Converts stability testing protocol data sheets to match regional climates (ICH Zone I-II vs Zone IVa-IVb).",
        "Standardizes analytical method descriptions and validate parameters against target standards.",
        "Automates impurity profile reporting terminology to match country-specific tolerances."
      ],
      timeSavings: "Reduces Quality & CMC audit preparation time by 85%",
      riskMitigation: "Protects against PMDA or EMA CMC chemical mismatch audit failures",
      tagColor: "from-purple-400 to-indigo-500",
      accentGlow: "rgba(139,92,246,0.15)"
    },
    m4_m5: {
      title: "Modules 4 & 5: Nonclinical & Clinical Trial Reports",
      subtitle: "Study Summary Alignment & CDISC Normalization",
      description: "Validates and structures nonclinical pharmacology/toxicology summaries and clinical study reports to respect the reporting boundaries of each authority.",
      items: [
        "Maps study identifiers, subject telemetry metrics, and clinical safety reports.",
        "Ensures standard spelling styles and data citation standards conform to target agency guides.",
        "Flags missing subject validation registries, consent logs, or localized translation forms.",
        "Provides direct connection checkpoints with raw SAS/CDISC datasets."
      ],
      timeSavings: "Reduces inter-department study validation loops down to 2 days",
      riskMitigation: "Avoids costly requests for information (RFI) during active drug reviews",
      tagColor: "from-pink-400 to-rose-500",
      accentGlow: "rgba(244,63,94,0.15)"
    }
  };

  // Scenario Simulator Content
  const scenarioData = {
    oncology: {
      title: "Oncology Small Molecule Target Track",
      route: "FDA (US) ➔ PMDA (Japan) Submission",
      challenge: "PMDA Japanese submission requires mapping active monograph descriptions, converting stability parameters for Zone I/II climates, and restructuring clinical efficacy benchmarks to match strict PMDA historical thresholds.",
      manualEffort: "Requires ~480 manual hours across 3 regulatory consultants, plus $250,000 translation validation overhead.",
      solution: "Pharma Dossier Harmonizer automates the USPI labeling structure conversion, flags JP monograph spelling mismatches, and reduces manual translation-check loops to 4 days.",
      roi: "Accelerates Japan filing by 5.2 months, representing up to $62M in early-market revenue capture.",
      timelineManualMonths: 9.0,
      timelineHarmonizerMonths: 3.8
    },
    biologic: {
      title: "Monoclonal Antibody (mAb) Biologic Track",
      route: "EMA (Europe) ➔ FDA (US) Submission",
      challenge: "FDA requires strict 21 CFR Part 11 compliant electronic records, distinct Boxed Warning highlights, and intensive raw bioassay stability criteria under Module 3.",
      manualEffort: "Average 520 hours of biostatistics and CMC writing, with high risk of a Refuse-to-File (RTF) letter for minor structural errors.",
      solution: "Automated pre-flight validation verifies eCTD XML structure and scans Module 3 against 21 CFR standards. Instantly formats EU Annex SmPC text into US Prescribing Info headings.",
      roi: "Zero RTF letters guaranteed. Saves $440,000 in immediate filing consultant fees.",
      timelineManualMonths: 8.5,
      timelineHarmonizerMonths: 2.2
    },
    vaccine: {
      title: "Multi-Region Rapid Vaccine Track",
      route: "EMA ➔ CDSCO (India) + Swissmedic (CH) Synchronous",
      challenge: "Schweizerische Zulassungen (Swissmedic) has highly custom Module 1 requirements, while CDSCO requires stability testing data aligned to hot/humid Climatic Zone IVb protocols.",
      manualEffort: "Over 800 hours coordinating separate regulatory teams in Zurich and Mumbai, leading to isolated and unsynchronized data versions.",
      solution: "Synchronous multi-region engine branches the core dossier into Swissmedic and CDSCO compatible targets. Automatically identifies Swiss-specific wrapper guidelines and flags Zone IVb stability gaps.",
      roi: "Switzerland and India filings completed within 3 weeks. Trims launch delay by 4.5 months.",
      timelineManualMonths: 11.0,
      timelineHarmonizerMonths: 4.5
    }
  };

  // High-Density Authority Coverage List
  const authorityList = [
    { code: "FDA", name: "U.S. Food & Drug Admin", region: "United States", eCtd: "v4.0 Support", stability: "Zone I / II", compliance: "21 CFR Part 11" },
    { code: "EMA", name: "European Medicines Agency", region: "European Union", eCtd: "v4.0 Support", stability: "Zone I / II", compliance: "Annex 11 / GAMP 5" },
    { code: "PMDA", name: "Pharm. & Medical Devices Agency", region: "Japan", eCtd: "v4.0 Support", stability: "Zone I / II", compliance: "JP Monograph Specs" },
    { code: "CDSCO", name: "Central Drugs Standard Control", region: "India", eCtd: "v3.2 & v4.0", stability: "Zone IVa / IVb", compliance: "Humid Stability Standard" },
    { code: "Swissmedic", name: "Swiss Agency of Health Products", region: "Switzerland", eCtd: "v4.0 Wrapper", stability: "Zone I / II", compliance: "Swiss Module 1 Standard" },
    { code: "TGA", name: "Therapeutic Goods Admin", region: "Australia", eCtd: "v3.2 & v4.0", stability: "Zone II / IV", compliance: "TGA-Specific Module 1" },
    { code: "Health Canada", name: "Health Canada", region: "Canada", eCtd: "v4.0 Wrapper", stability: "Zone I / II", compliance: "HC Monograph Align" }
  ];

  // FAQ List
  const faqData = [
    {
      q: "How does the platform ensure absolute data integrity and regulatory compliance under FDA 21 CFR Part 11?",
      a: "The Pharma Dossier Harmonizer is designed from the ground up for GxP environments. Every automated action, manual overwrite, or AI suggestion is permanently written to an immutable, database-driven Audit Log. This generates a complete, reviewable paper trail showing the exact author, timestamp, previous value, and new value. No changes are destructive."
    },
    {
      q: "Can the AI handle the specific technical differences between international Pharmacopoeial standards?",
      a: "Yes. Our models are trained on specific pharmacopoeial monographs (USP, Ph. Eur., JP, BP). The workspace automatically scans Module 3 chemical definitions, flags differing specifications, spelling conventions (e.g. 'sulfate' vs 'sulphate'), and active material assay guidelines, and proposes precise conversions that you can accept or edit."
    },
    {
      q: "Is our proprietary intellectual property safe from public model training cycles?",
      a: "Absolutely. The application operates in a fully sandboxed enterprise environment. No clinical data, CMC parameters, or administrative files are ever leaked, shared, or used to train public models. We adhere to the strictest healthcare data protection guidelines including HIPAA, GDPR, and local biopharma safety standards."
    },
    {
      q: "What is an RTF (Refuse-To-File) error, and how does this engine prevent them?",
      a: "An RTF is an immediate administrative rejection by a health authority, usually caused by wrong XML schemas, missing regional sections, or nomenclature mismatches in Module 1 labeling. Our built-in Pre-Flight eCTD v4.0 validator parses the compiled dossier against target authority guidelines before submission, flagging 100% of formatting compliance gaps beforehand."
    }
  ];

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white antialiased overflow-x-hidden relative">
      
      {/* Background Ambience Layer */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:5rem_5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_80%,transparent_100%)] pointer-events-none z-0" />
      
      {/* Decorative Blur Spheres */}
      <div className="absolute top-[-10%] left-[-15%] w-[60%] h-[50%] rounded-full bg-emerald-500/10 blur-[130px] pointer-events-none z-0" />
      <div className="absolute top-[35%] right-[-15%] w-[65%] h-[60%] rounded-full bg-teal-500/8 blur-[160px] pointer-events-none z-0" />
      <div className="absolute bottom-[10%] left-[10%] w-[55%] h-[55%] rounded-full bg-indigo-500/8 blur-[140px] pointer-events-none z-0" />

      {/* HEADER SECTION */}
      <header className="border-b border-white/5 bg-[#030712]/75 backdrop-blur-xl sticky top-0 z-50 px-6 py-4 transition-all duration-300">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
          
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-400 via-emerald-600 to-teal-800 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 border border-white/10">
                <Dna className="w-5 h-5 animate-spin-slow text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 animate-pulse border-2 border-[#030712]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-widest text-slate-400 font-mono uppercase">Global Filing Engine</span>
                <span className="text-[8px] font-mono tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold uppercase">ICH eCTD v4.0</span>
              </div>
              <h1 className="text-base sm:text-lg font-black tracking-wider text-white">
                PHARMA DOSSIER HARMONIZER
              </h1>
            </div>
          </div>

          {/* High-Level Corporate Statistics (Hidden on Mobile) */}
          <div className="hidden lg:flex items-center gap-8 text-xs font-mono">
            <div className="border-l border-white/10 pl-4">
              <span className="text-slate-500 block text-[9px] font-bold uppercase tracking-wider">REGULATORY ACCELERATION</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1.5 mt-0.5">
                <TrendingUp className="w-3.5 h-3.5" /> 12x Faster Timeline
              </span>
            </div>
            <div className="border-l border-white/10 pl-4">
              <span className="text-slate-500 block text-[9px] font-bold uppercase tracking-wider">COMPLIANCE DEEPLINK</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1.5 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5" /> Zero RTF Errors
              </span>
            </div>
            <div className="border-l border-white/10 pl-4">
              <span className="text-slate-500 block text-[9px] font-bold uppercase tracking-wider">COST CONVERGENCE</span>
              <span className="text-emerald-400 font-bold block mt-0.5">90% Labor Savings</span>
            </div>
          </div>

          {/* Call-to-action button */}
          <button 
            onClick={onExplore}
            className="relative overflow-hidden group bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-5 py-3 rounded-xl transition-all duration-300 cursor-pointer shadow-lg shadow-emerald-500/10 flex items-center gap-1.5 hover:shadow-emerald-500/20"
          >
            <span>Explore Platform</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </div>
      </header>

      {/* MAIN LAYOUT CONTAINER */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-12 lg:py-20 z-10 w-full space-y-32">
        
        {/* HERO HERO HERO */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Hero Left Column */}
          <div className="lg:col-span-7 space-y-8">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full py-1.5 px-3.5 text-xs font-semibold text-emerald-400 shadow-inner">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>Next-Gen Regulatory Intelligence</span>
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1]">
              Accelerate global <br className="hidden sm:inline" />
              submissions. <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent font-black">
                Harmonize instantly.
              </span>
            </h2>

            <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-2xl font-sans font-normal">
              The Pharma Dossier Harmonizer is an enterprise AI workspace engineered to automatically align, translate, and audit eCTD drug dossiers across the FDA, EMA, PMDA, Swissmedic, and CDSCO. Consolidate months of complex regulatory reframing and pharmacopoeia mapping into minutes of absolute, audited precision.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <button
                onClick={onExplore}
                className="group relative overflow-hidden bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-black text-sm px-8 py-4.5 rounded-xl transition-all duration-300 cursor-pointer shadow-xl shadow-emerald-500/10 flex items-center justify-center gap-2.5 hover:shadow-emerald-500/20 hover:scale-[1.01]"
              >
                <span>Enter Regulatory Command Center</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
              
              <a 
                href="#roi-calculator" 
                className="bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white border border-white/5 hover:border-white/10 font-bold text-sm px-6 py-4.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg"
              >
                <Calculator className="w-4 h-4 text-emerald-400" />
                <span>Calculate Corporate ROI</span>
              </a>
            </div>

            {/* Regulatory standard highlights */}
            <div className="pt-8 border-t border-white/5 grid grid-cols-3 gap-6">
              <div className="space-y-1">
                <span className="text-lg font-black text-white block font-mono">ICH eCTD v4.0</span>
                <span className="text-[9px] text-slate-500 font-bold uppercase font-mono tracking-widest block">Format standard</span>
              </div>
              <div className="space-y-1">
                <span className="text-lg font-black text-white block font-mono">21 CFR P11</span>
                <span className="text-[9px] text-slate-500 font-bold uppercase font-mono tracking-widest block">Audit trail compliant</span>
              </div>
              <div className="space-y-1">
                <span className="text-lg font-black text-white block font-mono">ALCOA+</span>
                <span className="text-[9px] text-slate-500 font-bold uppercase font-mono tracking-widest block">Data integrity</span>
              </div>
            </div>
          </div>

          {/* Hero Right Column (Sleek Interactive Preview widget) */}
          <div className="lg:col-span-5 relative">
            <div className="absolute -inset-1.5 bg-gradient-to-tr from-emerald-500 to-indigo-500 rounded-[2.5rem] opacity-25 blur-2xl animate-pulse" />
            
            <div className="relative bg-[#0b0f19]/90 border border-white/10 rounded-[2rem] p-6 lg:p-8 shadow-2xl space-y-6 backdrop-blur-xl">
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500/80 animate-pulse" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="text-[10px] text-slate-500 font-mono ml-2">CORE_HARMONIZER_ACTIVE</span>
                </div>
                <span className="text-[9px] font-mono tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-bold">MATCH MODE</span>
              </div>

              {/* Simulated Alignment Animation Panel */}
              <div className="space-y-4">
                {/* Source format */}
                <div className="bg-[#030712] border border-white/5 rounded-2xl p-4 space-y-3 shadow-inner group hover:border-white/10 transition-colors">
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="font-bold text-slate-500">SOURCE PORTFOLIO (FDA USPI HEADER)</span>
                    <span className="text-slate-400 font-bold">Module 1.3 Labeling</span>
                  </div>
                  <div className="p-2.5 bg-white/5 rounded-lg border border-white/5 text-xs text-slate-300 font-mono leading-relaxed">
                    <span className="text-rose-400">"WARNING: CYTOPENIA & HEPATIC TOXICITY..."</span>
                    <p className="text-[10px] text-slate-500 mt-1">Highlights section • Standard US pharmacopoeia nomenclature</p>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500">
                    <span className="px-1.5 py-0.5 bg-rose-500/10 text-rose-400 rounded">US monographed specs</span>
                  </div>
                </div>

                {/* Micro-interface animated bridge */}
                <div className="flex justify-center relative py-1">
                  <div className="absolute inset-y-0 w-0.5 bg-gradient-to-b from-rose-500 via-emerald-500 to-teal-500 opacity-20" />
                  <div className="p-2.5 bg-slate-900 rounded-full border border-white/10 shadow-lg relative z-10 flex items-center justify-center animate-bounce-slow">
                    <Zap className="w-4 h-4 text-emerald-400" />
                  </div>
                </div>

                {/* Target format */}
                <div className="bg-[#030712] border border-emerald-500/25 rounded-2xl p-4 space-y-3 shadow-lg relative overflow-hidden group hover:border-emerald-500/45 transition-colors">
                  <div className="absolute top-0 right-0 bg-emerald-500 text-slate-950 font-mono text-[8px] font-black tracking-widest px-2.5 py-1 rounded-bl-xl uppercase">
                    aligned
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="font-bold text-emerald-400">TARGET COMPILER (EMA SmPC COMPLIANT)</span>
                    <span className="text-slate-400 font-bold">Module 1.3.1 Annex II</span>
                  </div>
                  <div className="p-2.5 bg-emerald-500/5 rounded-lg border border-emerald-500/10 text-xs text-slate-300 font-mono leading-relaxed">
                    <span className="text-emerald-400">"Section 4.3 Contraindications & 4.8 Undesirable Effects restructured..."</span>
                    <p className="text-[10px] text-emerald-500/60 mt-1">10-heading structure • Mapped to Ph. Eur. standards</p>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-emerald-400">
                    <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 rounded">Ph. Eur. compliant spelling</span>
                  </div>
                </div>
              </div>

              {/* Output values */}
              <div className="pt-2 border-t border-white/5 flex justify-between items-center text-[11px] font-mono text-slate-400">
                <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Convergence score: 99.1%</span>
                <span className="text-emerald-400 font-bold">~400 Hrs Saved</span>
              </div>
            </div>
          </div>

        </section>

        {/* STRATEGIC PIPELINE LEAK SECTION */}
        <section className="bg-slate-900/15 border border-white/5 rounded-[2.5rem] p-8 lg:p-14 space-y-12 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-rose-500/5 rounded-full blur-[120px] pointer-events-none" />
          
          <div className="max-w-3xl space-y-4">
            <span className="text-[11px] font-bold tracking-widest text-rose-400 uppercase font-mono flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              The Multi-Million Dollar Pipeline Leak
            </span>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Why cross-border submission realignment represents the single largest bottleneck in drug lifecycles.
            </h3>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Every single month a blockbuster therapeutic, biologic, or vaccine launch is delayed from entering a global market costs pharmaceutical sponsors an average of <strong className="text-white font-black">$12 Million to $30 Million</strong> in lost revenue. Yet, regulatory teams spend hundreds of manual hours manually cross-checking monographed parameters, spelling variations, and climate-zone definitions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
            
            {/* Bottleneck 1 */}
            <div className="bg-[#030712] border border-white/5 hover:border-white/10 p-6 rounded-2xl space-y-4 transition-all duration-300 shadow-xl relative group">
              <div className="absolute -top-3 -left-3 w-6 h-6 bg-rose-500/10 text-rose-400 text-[10px] font-mono font-bold flex items-center justify-center rounded-full border border-rose-500/20">1</div>
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                <DollarSign className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white font-sans">The Costly Refuse-To-File (RTF) Penalty</h4>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Filing an eCTD package with the wrong regional wrapper schemas or mismatched terminology triggers an immediate RTF. Sponsors forfeit filing fees of up to <span className="text-rose-400 font-semibold">$2.4M</span> and suffer a 6-month launch delay.
              </p>
            </div>

            {/* Bottleneck 2 */}
            <div className="bg-[#030712] border border-white/5 hover:border-white/10 p-6 rounded-2xl space-y-4 transition-all duration-300 shadow-xl relative group">
              <div className="absolute -top-3 -left-3 w-6 h-6 bg-amber-500/10 text-amber-400 text-[10px] font-mono font-bold flex items-center justify-center rounded-full border border-amber-500/20">2</div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Clock className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white font-sans">The Pharmacopoeial Nomenclature Maze</h4>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Manually mapping USP, Ph. Eur., BP, and JP chemical specifications in Module 3 requires up to <span className="text-amber-400 font-semibold">450 specialist hours</span> per dossier. Specialists are overwhelmed by tedious structural re-indexing and translation loops.
              </p>
            </div>

            {/* Bottleneck 3 */}
            <div className="bg-[#030712] border border-white/5 hover:border-white/10 p-6 rounded-2xl space-y-4 transition-all duration-300 shadow-xl relative group">
              <div className="absolute -top-3 -left-3 w-6 h-6 bg-indigo-500/10 text-indigo-400 text-[10px] font-mono font-bold flex items-center justify-center rounded-full border border-indigo-500/20">3</div>
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Globe className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white font-sans">Environmental Zone Instability</h4>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Each target country imposes specific climate stability requirements (ICH Zone I-II vs Zone IVa-IVb). Filing drug products without translating shelf-life decay factors accurately is a key failure vector.
              </p>
            </div>

          </div>
        </section>


        {/* MODULE DEEP DIVE SECTION */}
        <section className="space-y-10 bg-slate-900/5 border border-white/5 rounded-[2.5rem] p-6 lg:p-14 relative overflow-hidden">
          <div className="absolute left-0 bottom-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-[130px] pointer-events-none" />
          
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-4">
            <div className="space-y-3">
              <span className="text-[11px] font-bold tracking-widest text-emerald-400 uppercase font-mono flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-400" />
                Dossier Structure Anatomy
              </span>
              <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Complete eCTD Module Coverage
              </h3>
              <p className="text-slate-400 text-sm max-w-xl">
                Our alignment compiler targets the full breadth of the ICH M4 Common Technical Document specifications, ensuring strict local adjustments across all modules.
              </p>
            </div>

            {/* Tactile Tab Pill Toggles */}
            <div className="flex flex-wrap bg-[#030712] border border-white/5 p-1.5 rounded-2xl text-xs font-mono font-bold">
              {(['m1', 'm2', 'm3', 'm4_m5'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveModuleTab(tab)}
                  className={`px-4.5 py-3 rounded-xl transition-all duration-300 cursor-pointer uppercase text-[11px] relative overflow-hidden ${
                    activeModuleTab === tab 
                      ? 'text-slate-950 font-black' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {activeModuleTab === tab && (
                    <motion.div 
                      layoutId="activeModuleBackground" 
                      className="absolute inset-0 bg-emerald-400 rounded-xl z-0"
                      transition={{ type: "spring", stiffness: 350, damping: 28 }}
                    />
                  )}
                  <span className="relative z-10">
                    {tab === 'm1' && "Module 1"}
                    {tab === 'm2' && "Module 2"}
                    {tab === 'm3' && "Module 3 (CMC)"}
                    {tab === 'm4_m5' && "Modules 4 & 5"}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Tab Display Area with Framer Motion Transition */}
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeModuleTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch bg-[#030712] border border-white/5 rounded-3xl p-6 lg:p-8"
              style={{ boxShadow: `inset 0 10px 40px -10px ${moduleData[activeModuleTab].accentGlow}` }}
            >
              
              {/* Detailed Left Description (7 cols) */}
              <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="inline-block">
                    <span className={`text-[9px] font-mono tracking-widest bg-gradient-to-r ${moduleData[activeModuleTab].tagColor} bg-clip-text text-transparent border border-white/10 px-3 py-1 rounded-full font-bold uppercase`}>
                      {moduleData[activeModuleTab].subtitle}
                    </span>
                  </div>
                  
                  <h4 className="text-2xl font-extrabold text-white">
                    {moduleData[activeModuleTab].title}
                  </h4>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {moduleData[activeModuleTab].description}
                  </p>
                </div>

                {/* Bullet details */}
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {moduleData[activeModuleTab].items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-xs text-slate-300">
                      <div className="p-0.5 bg-emerald-500/10 rounded-full border border-emerald-500/20 mt-0.5">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      </div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                {/* Stat indicators */}
                <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row gap-4 text-[11px] font-mono">
                  <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/5 px-3 py-2 rounded-lg border border-emerald-500/10">
                    <TrendingUp className="w-4 h-4" />
                    <span className="font-bold">{moduleData[activeModuleTab].timeSavings}</span>
                  </div>
                  <div className="flex items-center gap-2 text-indigo-400 bg-indigo-500/5 px-3 py-2 rounded-lg border border-indigo-500/10">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="font-bold">{moduleData[activeModuleTab].riskMitigation}</span>
                  </div>
                </div>
              </div>

              {/* Right Visual Console Map (5 cols) */}
              <div className="lg:col-span-5 relative flex flex-col justify-center">
                <div className="absolute -inset-4 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
                
                <div className="relative border border-white/10 bg-[#080b13]/80 p-6 rounded-2xl w-full space-y-4 font-mono text-xs text-slate-400 backdrop-blur shadow-2xl">
                  <div className="flex justify-between items-center border-b border-white/5 pb-3">
                    <span className="text-white flex items-center gap-1.5 font-bold">
                      <FileText className="w-4 h-4 text-emerald-400" />
                      Technical Compliance Schema
                    </span>
                    <span className="text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded text-[10px]">PASS</span>
                  </div>

                  <div className="space-y-2 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-500">eCTD Version XML:</span>
                      <span className="text-white">v4.0 (Release-2026)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Validation Matrix:</span>
                      <span className="text-emerald-400 font-bold">manifest.xml (ICH Compliant)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Pharmacopoeia Base:</span>
                      <span className="text-white">USP-PhEur-JP Mappings</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Audit Status Log:</span>
                      <span className="text-emerald-400 font-bold">FDA 21 CFR P11 Active</span>
                    </div>
                  </div>

                  <div className="p-3 bg-[#030712] rounded-xl border border-white/5 text-[10px] text-slate-500 italic leading-relaxed">
                    "Compliance parsing engine validates all node hierarchies under under 2.4 seconds, confirming proper wrapper elements before target market delivery."
                  </div>
                </div>
              </div>

            </motion.div>
          </AnimatePresence>
        </section>


        {/* INTERACTIVE SCENARIO SIMULATOR SECTION */}
        <section className="space-y-10 bg-slate-900/15 border border-white/5 rounded-[2.5rem] p-6 lg:p-14 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-[130px] pointer-events-none" />
          
          <div className="max-w-3xl space-y-3">
            <span className="text-[11px] font-bold tracking-widest text-indigo-400 uppercase font-mono flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-indigo-400" />
              Strategic Timeline Simulation
            </span>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Biopharma Filing Track Simulator
            </h3>
            <p className="text-slate-400 text-sm sm:text-base">
              Varying drug modalities face unique, custom regulatory bottlenecks. Choose a submission track to visualize how the system structures workflows and cuts down critical weeks to launch.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Left Selection Column (4 cols) */}
            <div className="lg:col-span-4 flex flex-col gap-4 justify-center">
              {(['oncology', 'biologic', 'vaccine'] as const).map((key) => (
                <button
                  key={key}
                  onClick={() => setSelectedScenario(key)}
                  className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col gap-2 relative overflow-hidden group ${
                    selectedScenario === key 
                      ? 'bg-gradient-to-r from-[#0d1326] to-[#040815] border-indigo-500/40 shadow-xl' 
                      : 'bg-[#030712] border-white/5 hover:border-white/10'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-mono tracking-wider font-bold uppercase text-indigo-400">
                      {key === 'oncology' && "Small Molecule"}
                      {key === 'biologic' && "Biologic mAb"}
                      {key === 'vaccine' && "Vaccine Modality"}
                    </span>
                    <ChevronRight className={`w-4 h-4 text-indigo-400 transition-transform duration-350 ${selectedScenario === key ? 'translate-x-1' : 'group-hover:translate-x-0.5'}`} />
                  </div>
                  <span className="text-sm font-extrabold text-slate-100 group-hover:text-white transition-colors">{scenarioData[key].title}</span>
                  <span className="text-[10px] text-slate-500 font-mono font-medium">{scenarioData[key].route}</span>
                </button>
              ))}
            </div>

            {/* Right Display Area (8 cols) */}
            <div className="lg:col-span-8 bg-[#030712] border border-white/5 rounded-3xl p-6 lg:p-8 flex flex-col justify-between space-y-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-6 border-b border-white/5">
                <div className="space-y-2.5">
                  <span className="text-[10px] text-slate-500 font-bold uppercase font-mono tracking-wider block">Filing Bottleneck</span>
                  <p className="text-xs text-slate-300 leading-relaxed">{scenarioData[selectedScenario].challenge}</p>
                </div>
                <div className="space-y-2.5">
                  <span className="text-[10px] text-slate-500 font-bold uppercase font-mono tracking-wider block">Manual Benchmark Overhead</span>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">{scenarioData[selectedScenario].manualEffort}</p>
                </div>
              </div>

              {/* Graphical Timeline Comparison Bar (High Executive Value) */}
              <div className="space-y-4">
                <span className="text-[10px] text-slate-500 font-bold uppercase font-mono tracking-wider block">Filing Track Timeline Comparison (Months)</span>
                
                <div className="space-y-3">
                  {/* Traditional manual pipeline */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[11px] font-mono text-slate-400">
                      <span>Traditional Manual Alignment Loop</span>
                      <span className="font-bold text-slate-300">{scenarioData[selectedScenario].timelineManualMonths} Months</span>
                    </div>
                    <div className="w-full bg-slate-900 h-3.5 rounded-lg overflow-hidden border border-white/5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(scenarioData[selectedScenario].timelineManualMonths / 12) * 100}%` }}
                        transition={{ duration: 0.5 }}
                        className="bg-slate-600 h-full rounded-lg"
                      />
                    </div>
                  </div>

                  {/* Automated Harmonizer Pipeline */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[11px] font-mono text-emerald-400">
                      <span className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Pharma Dossier Harmonizer Platform</span>
                      <span className="font-black text-emerald-400">{scenarioData[selectedScenario].timelineHarmonizerMonths} Months</span>
                    </div>
                    <div className="w-full bg-slate-900 h-3.5 rounded-lg overflow-hidden border border-white/5 relative">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(scenarioData[selectedScenario].timelineHarmonizerMonths / 12) * 100}%` }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-lg"
                      />
                      <div className="absolute right-2 inset-y-0 flex items-center">
                        <span className="text-[8px] font-mono font-black text-slate-950 bg-white px-1.5 rounded uppercase">Accelerated</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center pt-2">
                <div className="md:col-span-8 space-y-2">
                  <span className="text-[10px] text-emerald-400 font-bold uppercase font-mono tracking-wider flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    How Harmonizer-AI Solves It
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">{scenarioData[selectedScenario].solution}</p>
                </div>

                <div className="md:col-span-4 bg-emerald-500/5 border border-emerald-500/20 p-4.5 rounded-2xl text-center shadow-lg">
                  <span className="text-[9px] text-slate-500 font-bold block uppercase font-mono tracking-widest">ESTIMATED SPEED VALUE</span>
                  <span className="text-xs font-black text-emerald-400 block mt-1 leading-snug font-mono">{scenarioData[selectedScenario].roi}</span>
                </div>
              </div>

            </div>

          </div>
        </section>


        {/* INTERACTIVE ROI CALCULATOR SECTION */}
        <section id="roi-calculator" className="space-y-10 scroll-mt-24">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-[11px] font-bold tracking-widest text-emerald-400 uppercase font-mono flex items-center justify-center gap-2">
              <Calculator className="w-4 h-4 text-emerald-400" />
              Executive Economic Assessment
            </span>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Interactive Submission ROI Calculator
            </h3>
            <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
              Adjust filings metrics and therapeutic market sizes to dynamically assess direct administrative and opportunity launch value gained.
            </p>
          </div>

          <div className="bg-[#0b0f19]/70 border border-white/5 rounded-[2.5rem] p-6 lg:p-12 grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch relative overflow-hidden shadow-2xl">
            
            {/* Left side: input sliders (6 cols) */}
            <div className="lg:col-span-6 space-y-10 flex flex-col justify-center">
              
              {/* Slider 1: Submissions */}
              <div className="space-y-4">
                <div className="flex justify-between items-center gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                    Submissions Per Year (Multi-Region)
                  </label>
                  <span className="text-sm font-black text-emerald-400 bg-[#030712] border border-white/10 px-3 py-1.5 rounded-xl font-mono">
                    {submissionsPerYear} {submissionsPerYear === 1 ? 'Filing' : 'Filings'}
                  </span>
                </div>
                <div className="relative flex items-center">
                  <input 
                    type="range" 
                    min="1" 
                    max="20" 
                    step="1"
                    value={submissionsPerYear} 
                    onChange={(e) => setSubmissionsPerYear(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-[#030712] rounded-lg appearance-none cursor-pointer accent-emerald-400 border border-white/5"
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 font-mono font-medium">
                  <span>1 Submission</span>
                  <span>10 Submissions</span>
                  <span>20 Submissions</span>
                </div>
              </div>

              {/* Slider 2: Drug revenue */}
              <div className="space-y-4">
                <div className="flex justify-between items-center gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                    Average Annual Drug Revenue Size
                  </label>
                  <span className="text-sm font-black text-emerald-400 bg-[#030712] border border-white/10 px-3 py-1.5 rounded-xl font-mono">
                    ${averageDrugRevenue}M USD
                  </span>
                </div>
                <div className="relative flex items-center">
                  <input 
                    type="range" 
                    min="20" 
                    max="1500" 
                    step="10"
                    value={averageDrugRevenue} 
                    onChange={(e) => setAverageDrugRevenue(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-[#030712] rounded-lg appearance-none cursor-pointer accent-emerald-400 border border-white/5"
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 font-mono font-medium">
                  <span>$20M USD</span>
                  <span>$750M (Blockbuster Target)</span>
                  <span>$1.5B (Mass Market Biologic)</span>
                </div>
              </div>

              {/* Interactive Info block */}
              <div className="p-4 bg-[#030712] border border-white/5 rounded-2xl space-y-2.5 text-[11px] text-slate-500 leading-relaxed font-mono">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  <span>Manual benchmark: <strong>{manualHoursPerDossier} hours</strong> per dossier alignment under ICH M4 guidelines.</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  <span>Blended global regulatory consultant fee: <strong>${standardConsultantRate}/hour</strong>.</span>
                </div>
              </div>

            </div>

            {/* Right side: total financial results widget (6 cols) */}
            <div className="lg:col-span-6 bg-gradient-to-br from-[#0c1c20] to-[#0a1122] border border-emerald-500/20 rounded-3xl p-6 lg:p-8 flex flex-col justify-between relative overflow-hidden shadow-2xl">
              
              <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="space-y-4">
                <span className="text-[10px] font-mono tracking-widest bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-md font-bold uppercase inline-block">
                  ESTIMATED VALUE CAPTURE
                </span>
                
                <div className="space-y-1">
                  <span className="text-slate-400 text-xs font-semibold block">TOTAL ECONOMIC VALUE CAPTURED</span>
                  <span className="text-4xl sm:text-5xl font-black text-white block tracking-tight font-mono">
                    ${totalFinancialImpact.toFixed(2)}M <span className="text-xs text-slate-400 font-sans font-normal">USD / Year</span>
                  </span>
                </div>
              </div>

              {/* Sub metrics details */}
              <div className="grid grid-cols-2 gap-6 py-6 border-y border-white/5 my-6">
                <div className="space-y-1">
                  <span className="text-[9px] text-slate-500 font-bold block uppercase font-mono tracking-wider">Direct Manual Savings</span>
                  <span className="text-base font-extrabold text-emerald-400 font-mono">
                    ${(directSavings).toLocaleString('en-US', { maximumFractionDigits: 0 })} USD
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] text-slate-500 font-bold block uppercase font-mono tracking-wider">Timeline Acceleration</span>
                  <span className="text-base font-extrabold text-emerald-400 font-mono">
                    {averageMonthsSaved} Months Saved
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] text-slate-500 font-bold block uppercase font-mono tracking-wider">Opportunity Value Capture</span>
                  <span className="text-base font-extrabold text-emerald-400 font-mono">
                    ${opportunityGain.toFixed(1)}M USD
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] text-slate-500 font-bold block uppercase font-mono tracking-wider">RTF Avoidance rate</span>
                  <span className="text-base font-extrabold text-emerald-400 font-mono">
                    100% Guaranteed
                  </span>
                </div>
              </div>

              <button
                onClick={onExplore}
                className="w-full relative overflow-hidden group bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs py-4 rounded-xl transition-all duration-300 cursor-pointer shadow-lg hover:shadow-emerald-500/10 flex items-center justify-center gap-1.5"
              >
                <span>Launch & Capture This Value</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>

            </div>

          </div>
        </section>


        {/* GLOBAL COVERAGE MATRIX GIRD */}
        <section className="space-y-8">
          <div className="max-w-3xl space-y-3">
            <span className="text-[11px] font-bold tracking-widest text-emerald-400 uppercase font-mono flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-400" />
              Global Interoperability Matrix
            </span>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Supported Authorities & Compliance Standards
            </h3>
            <p className="text-slate-400 text-sm sm:text-base">
              The engine compiles directly to localized standards. Below is the multi-region interoperability matrix mapping climate stability zones and structural eCTD wrapper regulations.
            </p>
          </div>

          <div className="border border-white/5 rounded-3xl overflow-hidden bg-[#030712]/90 shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#0b0f19] border-b border-white/5 text-slate-400 font-mono uppercase text-[9px] tracking-widest">
                    <th className="p-4 font-black">Authority Code</th>
                    <th className="p-4 font-black">Health Body Name</th>
                    <th className="p-4 font-black">Geographic Region</th>
                    <th className="p-4 font-black">eCTD Version</th>
                    <th className="p-4 font-black">ICH Stability Zone</th>
                    <th className="p-4 font-black">Compliance Key</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono text-slate-300">
                  {authorityList.map((auth, idx) => (
                    <tr key={idx} className="hover:bg-white/5 transition-colors group">
                      <td className="p-4 font-bold text-white">
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-md text-[10px] font-black tracking-wide">
                          {auth.code}
                        </span>
                      </td>
                      <td className="p-4 font-sans font-medium text-slate-200 group-hover:text-white transition-colors">{auth.name}</td>
                      <td className="p-4 font-sans text-slate-400">{auth.region}</td>
                      <td className="p-4 text-slate-200">{auth.eCtd}</td>
                      <td className="p-4 text-indigo-400">{auth.stability}</td>
                      <td className="p-4 text-teal-400 font-bold text-[11px]">{auth.compliance}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="p-4.5 bg-[#0b0f19] border-t border-white/5 text-[11px] text-slate-500 flex items-start sm:items-center gap-3">
              <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5 sm:mt-0" />
              <span>Dossiers are compiled following standard <strong>ICH M4 guidelines</strong>. Schweizerische Zulassungen (Swissmedic) Swiss Module 1 wrapper XML standard version 1.5 is fully integrated and applied dynamically to respective packages.</span>
            </div>
          </div>
        </section>


        {/* THE STRATEGIC MARKET FIT & VALUE MANIFESTO */}
        <section className="space-y-10">
          <div className="max-w-3xl space-y-3">
            <span className="text-[11px] font-bold tracking-widest text-indigo-400 uppercase font-mono flex items-center gap-1.5">
              <Building className="w-4 h-4 text-indigo-400" />
              Value Manifesto & System Integrity
            </span>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Unifying launch speed with regulatory compliance.
            </h3>
            <p className="text-slate-400 text-sm sm:text-base max-w-xl">
              Pharma companies wrestle between commercial speed-to-market and meticulous compliance records. Our platform addresses both.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Value card 1 */}
            <div className="p-6 bg-[#030712] border border-white/5 hover:border-white/10 rounded-2xl space-y-4 hover:-translate-y-1 transition-all duration-300 shadow-xl">
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl w-fit border border-emerald-500/15">
                <Globe className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-extrabold text-slate-100 font-sans">Multi-Regional Sync</h4>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Supports concurrent alignments for FDA, EMA, PMDA, CDSCO, Swissmedic, TGA, and Health Canada, eliminating regulatory siloes.
              </p>
            </div>

            {/* Value card 2 */}
            <div className="p-6 bg-[#030712] border border-white/5 hover:border-white/10 rounded-2xl space-y-4 hover:-translate-y-1 transition-all duration-300 shadow-xl">
              <div className="p-3 bg-teal-500/10 text-teal-400 rounded-xl w-fit border border-teal-500/15">
                <BookOpen className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-extrabold text-slate-100 font-sans">Deep Nomenclature Mapping</h4>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                AI semantic models automatically map pharmacopoeial differences (e.g. active excipients, assay limits) between major international guidelines.
              </p>
            </div>

            {/* Value card 3 */}
            <div className="p-6 bg-[#030712] border border-white/5 hover:border-white/10 rounded-2xl space-y-4 hover:-translate-y-1 transition-all duration-300 shadow-xl">
              <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl w-fit border border-indigo-500/15">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-extrabold text-slate-100 font-sans">ALCOA+ Immutable Trails</h4>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Fully complies with FDA 21 CFR Part 11. Every single compilation change, gap remedy, or user edit is locked in an immutable audit database.
              </p>
            </div>

            {/* Value card 4 */}
            <div className="p-6 bg-[#030712] border border-white/5 hover:border-white/10 rounded-2xl space-y-4 hover:-translate-y-1 transition-all duration-300 shadow-xl">
              <div className="p-3 bg-sky-500/10 text-sky-400 rounded-xl w-fit border border-sky-500/15">
                <Zap className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-extrabold text-slate-100 font-sans">Pre-Flight XML Validator</h4>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Validates the final eCTD v4.0 folder hierarchy and schema integrity against specific authority specifications prior to dispatch, eliminating RTFs.
              </p>
            </div>

          </div>
        </section>


        {/* EXECUTIVE TESTIMONIAL QUOTE */}
        <section className="bg-gradient-to-br from-[#0c1328] to-[#040713] border border-white/10 rounded-[2.5rem] p-8 lg:p-12 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none" />
          
          <div className="max-w-3xl mx-auto space-y-5 relative z-10">
            <span className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase font-black">Global Executive Adoption</span>
            <blockquote className="text-slate-200 text-base md:text-xl leading-relaxed italic font-sans font-medium">
              "By automating our multi-market SmPC and USPI alignments on Pharma Dossier Harmonizer, our regulatory affairs teams saved over 1,200 manual specialist hours. More importantly, we pulled our European launch schedule forward by four months, capturing significant market advantage."
            </blockquote>
            <cite className="block text-xs font-bold text-white not-italic mt-2 font-mono uppercase tracking-wider">
              — VP of Regulatory Affairs, Top-15 Global Biopharma Sponsor
            </cite>
          </div>
        </section>


        {/* FAQ ACCORDION SECTION */}
        <section className="space-y-8">
          <div className="max-w-3xl space-y-3">
            <span className="text-[11px] font-bold tracking-widest text-emerald-400 uppercase font-mono flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-emerald-400" />
              Technical & Safety FAQ
            </span>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Answering Executive Concerns on GxP & Validation
            </h3>
            <p className="text-slate-400 text-sm sm:text-base">
              Deploying technical platforms within GxP regulatory zones requires satisfying both internal corporate leadership and strict external auditors.
            </p>
          </div>

          <div className="space-y-4 max-w-4xl">
            {faqData.map((faq, idx) => (
              <div 
                key={idx} 
                className="border border-white/5 rounded-2xl bg-[#030712] hover:border-white/10 transition-colors overflow-hidden"
              >
                <button
                  onClick={() => setFaqExpanded(faqExpanded === idx ? null : idx)}
                  className="w-full text-left p-5 flex justify-between items-center gap-4 cursor-pointer"
                >
                  <span className="text-xs sm:text-sm font-bold text-slate-100 group-hover:text-white leading-relaxed font-sans">{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-500 shrink-0 transition-transform duration-300 ${faqExpanded === idx ? 'rotate-180 text-emerald-400' : ''}`} />
                </button>
                
                {/* Expandable element with smooth vertical motion */}
                <AnimatePresence initial={false}>
                  {faqExpanded === idx && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 pt-2 text-xs sm:text-sm text-slate-400 leading-relaxed border-t border-white/5 bg-white/[0.01]">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* FINAL CALL TO ACTION FOOTER */}
      <footer className="border-t border-white/5 bg-[#030712] mt-24 py-16 px-6 relative z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,#10b98108,transparent_50%)] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
          
          <div className="space-y-3 text-center md:text-left">
            <h4 className="text-xl sm:text-2xl font-black text-white font-sans">Ready to align your global submissions?</h4>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed">
              Unlock a single platform unifying commercial speed-to-market with meticulous GxP compliance. Audits gaps, maps monographed standards, and compile valid eCTD packages.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 justify-center shrink-0">
            <button 
              onClick={onExplore}
              className="relative overflow-hidden group bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs px-8 py-4 rounded-xl transition-all duration-300 cursor-pointer shadow-lg hover:shadow-emerald-500/10 flex items-center gap-2 hover:scale-[1.01]"
            >
              <span>Launch Platform</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </div>

        </div>

        <div className="max-w-7xl mx-auto pt-10 mt-12 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center text-[10px] text-slate-500 font-mono gap-4 relative z-10">
          <span>&copy; 2026 Pharma Dossier Harmonizer. All rights reserved.</span>
          <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-emerald-400/80" /> SOC2 Type II Certified & GDPR Compliant</span>
          <span>Standards: ICH M4, Q6A, eCTD v4.0, FDA 21 CFR P11</span>
        </div>
      </footer>

    </div>
  );
}

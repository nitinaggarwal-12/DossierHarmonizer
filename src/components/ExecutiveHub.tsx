import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  AlertCircle, 
  Briefcase, 
  History, 
  Clock, 
  ArrowRight, 
  ChevronRight, 
  ShieldCheck, 
  Globe, 
  FileText, 
  ScanLine, 
  Bot, 
  BookOpen, 
  Thermometer, 
  Atom, 
  Search, 
  CheckCircle2, 
  Activity, 
  Database, 
  Cpu, 
  Layers, 
  Award, 
  DollarSign, 
  Play,
  RefreshCw,
  Info
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend
} from 'recharts';
import { DemoDossier, RegulatoryAuthority } from '../types';
import { REGULATORY_BODIES } from '../data';

interface ExecutiveHubProps {
  dossiers: DemoDossier[];
  selectedDossierId: string;
  onSelectDossier: (id: string) => void;
  setActivePage: (page: string) => void;
  triggerNotification: (message: string, type: 'success' | 'error' | 'info') => void;
}

export default function ExecutiveHub({
  dossiers,
  selectedDossierId,
  onSelectDossier,
  setActivePage,
  triggerNotification
}: ExecutiveHubProps) {
  // Tabs & interactive controls
  const [activeChartTab, setActiveChartTab] = useState<'financial' | 'regional' | 'gaps'>('financial');
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Telemetry Console state
  const [telemetryLogs, setTelemetryLogs] = useState<string[]>([
    "System booted under standard CFR-21-Part11 GxP parameters.",
    "Secure clinical workspace mapped and locked.",
    "ALCOA+ Data Integrity verification system online.",
    "eCTD v4.0 schema definition parser loaded: release v2026.1."
  ]);
  const [isConsoleScanning, setIsConsoleScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  // Dynamic values calculated from dossiers
  const totalPendingGapsAllDossiers = dossiers.reduce((sum, d) => 
    sum + d.sections.reduce((secSum, s) => secSum + s.gaps.filter(g => g.status === 'pending').length, 0)
  , 0);

  const totalGapsAllDossiers = dossiers.reduce((sum, d) => 
    sum + d.sections.reduce((secSum, s) => secSum + s.gaps.length, 0)
  , 0);

  const overallPortfolioScore = totalGapsAllDossiers > 0 
    ? Math.round(((totalGapsAllDossiers - totalPendingGapsAllDossiers) / totalGapsAllDossiers) * 100)
    : 95;

  // Add occasional new logs to keep the console alive and realistic
  useEffect(() => {
    const interval = setInterval(() => {
      if (isConsoleScanning) return;
      const microActions = [
        "Verified cryptographic hash of current active dossier sections.",
        "Synced pharmacopoeial monograph reference schemas with local database.",
        "Refreshed eCTD schema validation: 0 structure modifications found.",
        "Session telemetry validated against GxP operator token."
      ];
      const randomAction = microActions[Math.floor(Math.random() * microActions.length)];
      setTelemetryLogs(prev => [randomAction, ...prev.slice(0, 5)]);
    }, 14000);

    return () => clearInterval(interval);
  }, [isConsoleScanning]);

  // Initiate scan function
  const handlePreFlightScan = () => {
    if (isConsoleScanning) return;
    setIsConsoleScanning(true);
    setScanProgress(0);
    triggerNotification("Initiating multi-region GxP pre-flight diagnostic scan...", "info");

    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsConsoleScanning(false);
          setTelemetryLogs(prevLogs => [
            "🏆 [SCAN COMPLETED]: All 5 dossiers validated. Schema eCTD v4.0 structure 100% sound.",
            "✓ Checked 127 USP / Ph. Eur / JP monograph assays.",
            "✓ GxP database secure locks confirmed.",
            "✓ 21-CFR compliant digital signature verified.",
            ...prevLogs
          ]);
          triggerNotification("Pre-flight scan completed! Portfolio conforms to local schemas.", "success");
          return 100;
        }
        
        // Add step logs at key milestones
        if (prev === 20) {
          setTelemetryLogs(l => ["Checking Module 1 administrative wrappers...", ...l]);
        } else if (prev === 50) {
          setTelemetryLogs(l => ["Comparing Module 3 Pharmacopoeial specifications (USP vs Ph. Eur.)...", ...l]);
        } else if (prev === 80) {
          setTelemetryLogs(l => ["Testing stability zone parameters for Zone IVb Hot & Humid...", ...l]);
        }
        return prev + 10;
      });
    }, 250);
  };

  // Click handler for destination pings
  const handleAuthorityPing = (auth: string) => {
    triggerNotification(`Pinging eCTD schema endpoint for ${auth}... Success. Latency: 42ms. Schema is in sync.`, 'success');
  };

  // CHART DATA GENERATION
  // 1. Financial Data: Direct alignment cost vs opportunity gains (M USD)
  const financialChartData = dossiers.map(d => {
    // Determine arbitrary values based on therapeutic name
    const drugRevenue = d.drugName.includes('Pembrolizumab') ? 480 : d.drugName.includes('Paclitaxel') ? 180 : 260;
    const directLaborSaved = 0.45; // ~450k Direct savings in consultant labor
    const launchTimelineSavedMonths = d.drugName.includes('Pembrolizumab') ? 5.2 : d.drugName.includes('Paclitaxel') ? 3.5 : 4.2;
    const opportunityLaunchGain = (drugRevenue / 12) * launchTimelineSavedMonths;

    return {
      name: d.drugName.split(' ')[0], // short name
      "Labor Savings ($M)": directLaborSaved,
      "Launch Delay Avoidance ($M)": parseFloat(opportunityLaunchGain.toFixed(1)),
      totalValue: parseFloat((directLaborSaved + opportunityLaunchGain).toFixed(1))
    };
  });

  // 2. Regional Compliance Radar Data
  const regionalChartData = Object.keys(REGULATORY_BODIES).map(key => {
    const auth = REGULATORY_BODIES[key as RegulatoryAuthority];
    // Dynamic score
    const relatedDossier = dossiers.find(d => d.targetAuthorities.includes(auth.id) || d.sourceAuthority === auth.id);
    const score = relatedDossier ? auth.complianceLevel + 3 : auth.complianceLevel;
    
    return {
      subject: auth.id,
      "Compliance Base": auth.complianceLevel,
      "Current Dossier Score": score,
      fullMark: 100
    };
  });

  // 3. Gap Categories Pie Data
  const gapCategories = [
    { name: 'Nomenclature & Monograph', value: 8, color: '#10B981' },
    { name: 'Formatting & Structures', value: 12, color: '#3B82F6' },
    { name: 'Stability Zone Testing', value: 6, color: '#F59E0B' },
    { name: 'Administrative Wrappers', value: 5, color: '#8B5CF6' },
    { name: 'Statistical Benchmarks', value: 4, color: '#EC4899' }
  ];

  // Filtering dossiers
  const filteredDossiers = dossiers.filter(d => 
    d.drugName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.dossierType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.sourceAuthority.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in text-slate-100" id="executive-hub-interactive-page">
      
      {/* GLOWING HEADER BLOCK WITH OPERATOR PROFILE */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-950 via-[#0a0f20] to-slate-950 border border-slate-900 rounded-[2rem] p-6 lg:p-8 shadow-2xl">
        {/* Deep ambient blur elements */}
        <div className="absolute top-[-30%] left-[-10%] w-72 h-72 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-30%] right-[15%] w-80 h-80 bg-indigo-500/10 rounded-full blur-[110px] pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-extrabold bg-emerald-500/10 border border-emerald-500/15 px-2.5 py-0.5 rounded-full">
                Active GxP Workspace • Session Validated
              </span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-black text-white tracking-tight leading-none">
              Regulatory Command Center
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Monitoring global filing dossiers across <span className="text-emerald-400 font-semibold">5 sovereign jurisdictions</span>. 
              Real-time translation, pharmacopoeial monograph validation, and climate zone analysis running securely.
            </p>
          </div>

          {/* Elegant operator credential details card */}
          <div className="flex items-center gap-4 bg-[#030712]/80 border border-white/5 rounded-2xl p-4 shadow-lg backdrop-blur-md w-full lg:w-auto">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-slate-950 font-black text-sm shadow-md">
              NA
            </div>
            <div className="flex-1 lg:flex-initial min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-slate-100 truncate">Nitin Aggarwal</span>
                <span className="text-[9px] font-mono tracking-wider bg-emerald-500/15 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20 font-bold">L3_ADMIN</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500 block truncate">nitinagga@google.com</span>
              <span className="text-[9px] font-mono text-slate-400 flex items-center gap-1 mt-0.5"><Clock className="w-3 h-3 text-emerald-400" /> Session active: 21-CFR compliant</span>
            </div>
          </div>
        </div>
      </div>

      {/* EXECUTIVE FOUR-METRIC BAR */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1 */}
        <div className="bg-[#0b0f19]/80 border border-white/5 rounded-2xl p-4.5 flex items-center justify-between shadow-lg relative overflow-hidden group hover:border-emerald-500/20 transition-all duration-300">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest font-mono block">Compounds Monitored</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-white font-mono">{dossiers.length}</span>
              <span className="text-[10px] text-emerald-400 font-bold font-mono">3 Modalities</span>
            </div>
            <span className="text-[10px] text-slate-400 block font-medium">100% secure sandboxed</span>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 rounded-xl">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-[#0b0f19]/80 border border-white/5 rounded-2xl p-4.5 flex items-center justify-between shadow-lg relative overflow-hidden group hover:border-amber-500/20 transition-all duration-300">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest font-mono block">Remediation Gaps</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-amber-400 font-mono">{totalPendingGapsAllDossiers}</span>
              <span className="text-[10px] text-amber-500/80 font-bold font-mono">Needs Align</span>
            </div>
            <span className="text-[10px] text-slate-400 block font-medium">9 gaps resolved today</span>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-400 border border-amber-500/15 rounded-xl">
            <AlertCircle className="w-5 h-5 animate-pulse" />
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-[#0b0f19]/80 border border-white/5 rounded-2xl p-4.5 flex items-center justify-between shadow-lg relative overflow-hidden group hover:border-indigo-500/20 transition-all duration-300">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest font-mono block">Global Alignment Health</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-indigo-400 font-mono">{overallPortfolioScore}%</span>
              <span className="text-[10px] text-emerald-400 font-bold font-mono">↑ 4.1%</span>
            </div>
            <span className="text-[10px] text-slate-400 block font-medium">Weighted convergence score</span>
          </div>
          <div className="p-3 bg-indigo-500/10 text-indigo-400 border border-indigo-500/15 rounded-xl">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-[#0b0f19]/80 border border-white/5 rounded-2xl p-4.5 flex items-center justify-between shadow-lg relative overflow-hidden group hover:border-pink-500/20 transition-all duration-300">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest font-mono block">Value Unlocked</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-pink-400 font-mono">$184.2M</span>
              <span className="text-[10px] text-pink-500 font-bold font-mono">USD</span>
            </div>
            <span className="text-[10px] text-slate-400 block font-medium">Direct labor & early launch</span>
          </div>
          <div className="p-3 bg-pink-500/10 text-pink-400 border border-pink-500/15 rounded-xl">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* DOUBLE SECTION GRID: INTERACTIVE CHARTS & ACTIVE INGEST TELEMETRY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COMPANION: RECHARTS INSIGHTS CORNER (7 cols) */}
        <div className="lg:col-span-7 bg-[#0b0f19]/80 border border-white/5 rounded-3xl p-6 shadow-2xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute right-0 top-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4 mb-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-400 font-black">Visual Intelligence Analytics</span>
              <h3 className="text-base font-extrabold text-white">Dynamic Portfolio Analytics</h3>
            </div>

            {/* Chart Sub-Tab Toggles */}
            <div className="flex bg-[#030712] border border-white/5 p-1 rounded-xl text-[10px] font-mono font-bold">
              <button
                onClick={() => setActiveChartTab('financial')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${activeChartTab === 'financial' ? 'bg-emerald-500 text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Launch Speed-Up Value
              </button>
              <button
                onClick={() => setActiveChartTab('regional')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${activeChartTab === 'regional' ? 'bg-emerald-500 text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Region Convergence
              </button>
              <button
                onClick={() => setActiveChartTab('gaps')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${activeChartTab === 'gaps' ? 'bg-emerald-500 text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Gap Breakdown
              </button>
            </div>
          </div>

          {/* Chart Display Area */}
          <div className="h-64 w-full flex items-center justify-center">
            {activeChartTab === 'financial' && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={financialChartData}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} label={{ value: '$M USD Unlocked', angle: -90, position: 'insideLeft', style: { fill: '#64748b', fontSize: 10, fontWeight: 'bold' } }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#030712', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    labelStyle={{ color: '#fff', fontWeight: 'bold', fontSize: 11 }}
                  />
                  <Legend wrapperStyle={{ fontSize: 10, paddingTop: 10 }} />
                  <Bar dataKey="Labor Savings ($M)" stackId="a" fill="#10b981" />
                  <Bar dataKey="Launch Delay Avoidance ($M)" stackId="a" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            )}

            {activeChartTab === 'regional' && (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={regionalChartData}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#475569', fontSize: 9 }} />
                  <Radar name="Country Baseline Standard" dataKey="Compliance Base" stroke="#64748b" fill="#64748b" fillOpacity={0.15} />
                  <Radar name="Active Portfolio Alignment" dataKey="Current Dossier Score" stroke="#10b981" fill="#10b981" fillOpacity={0.35} />
                  <Tooltip contentStyle={{ backgroundColor: '#030712', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: 10, paddingTop: 10 }} />
                </RadarChart>
              </ResponsiveContainer>
            )}

            {activeChartTab === 'gaps' && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={gapCategories}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {gapCategories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#030712', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                  <Legend layout="horizontal" verticalAlign="bottom" wrapperStyle={{ fontSize: 9 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              Dynamic financial speedups reflect a drug launch multiplier of $12M/month.
            </span>
            <span className="text-emerald-400 font-bold">ALCOA+ Verified</span>
          </div>
        </div>

        {/* RIGHT COMPANION: TECHNICAL COMPLIANCE CONSOLE (5 cols) */}
        <div className="lg:col-span-5 bg-[#0b0f19]/80 border border-white/5 rounded-3xl p-6 shadow-2xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute left-0 top-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-black flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  GxP Pre-Flight Diagnostics
                </span>
                <h3 className="text-base font-extrabold text-white">System Compliance Live Feed</h3>
              </div>
              <button
                onClick={handlePreFlightScan}
                disabled={isConsoleScanning}
                className={`bg-slate-900 border hover:bg-slate-850 hover:border-emerald-500/20 text-slate-300 font-mono font-bold text-[10px] px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all select-none active:scale-[0.98] ${isConsoleScanning ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
              >
                <RefreshCw className={`w-3 h-3 text-emerald-400 ${isConsoleScanning ? 'animate-spin' : ''}`} />
                <span>Validate All</span>
              </button>
            </div>

            {/* Dynamic progress bar during active scan */}
            {isConsoleScanning && (
              <div className="bg-[#030712] border border-white/5 rounded-xl p-3 space-y-2 animate-pulse">
                <div className="flex justify-between text-[10px] font-mono text-emerald-400">
                  <span>Validating portfolio across 5 target wrappers...</span>
                  <span className="font-bold">{scanProgress}%</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-white/5">
                  <div className="bg-emerald-400 h-full transition-all duration-200" style={{ width: `${scanProgress}%` }} />
                </div>
              </div>
            )}

            {/* Styled Console Logs Feed */}
            <div className="bg-[#030712] rounded-xl p-4 border border-white/5 h-44 overflow-y-auto font-mono text-[10px] text-slate-400 space-y-2.5 scrollbar-thin">
              {telemetryLogs.map((log, idx) => {
                const isSpecial = log.includes("[SCAN COMPLETED]") || log.includes("🏆");
                const isSub = log.startsWith("✓") || log.startsWith("Checking") || log.startsWith("Comparing");
                return (
                  <div key={idx} className={`flex items-start gap-2 leading-relaxed ${isSpecial ? 'text-emerald-400 font-bold bg-emerald-500/5 p-1 rounded border border-emerald-500/10' : isSub ? 'text-slate-300 pl-3' : 'text-slate-400'}`}>
                    <span className="text-slate-600 select-none">❯</span>
                    <span>{log}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 flex justify-between items-center text-[10px] font-mono text-slate-500">
            <span className="flex items-center gap-1"><Database className="w-3.5 h-3.5 text-slate-600" /> Database GxP lock: Secure</span>
            <span className="text-emerald-400 flex items-center gap-1"><Cpu className="w-3.5 h-3.5" /> Core VM in sync</span>
          </div>
        </div>

      </div>

      {/* REFOCUSED FILING REGISTRY CTA PANEL */}
      <div className="bg-[#0b0f19]/60 border border-white/5 rounded-3xl p-6 lg:p-8 shadow-2xl relative overflow-hidden" id="organized-filing-registry-cta">
        {/* Background ambient lighting */}
        <div className="absolute right-[-10%] top-[-20%] w-80 h-80 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute left-[30%] bottom-[-30%] w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row items-center justify-between gap-6 z-10">
          <div className="space-y-3 text-left max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg">
                <Layers className="w-4 h-4" />
              </span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-extrabold bg-emerald-500/10 border border-emerald-500/15 px-2.5 py-0.5 rounded-full">
                Unified Substance Portfolio
              </span>
            </div>
            <h3 className="text-xl font-extrabold text-white tracking-tight leading-snug">
              Active Substance Dossiers Organized into Logical Categories
            </h3>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              To enhance system usability and streamline reporting, the long drug filing list has been refactored. You can now access all active substance dossiers organized logically under specialized, tabbed classifications including <strong>Modality Type</strong>, <strong>Filing Urgency & Priority</strong>, <strong>Origin Region</strong>, and <strong>Therapeutic Specialty</strong>.
            </p>

            {/* Quick Micro-Badge Indicators */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 bg-slate-950/50 border border-slate-900 px-2.5 py-1 rounded-xl">
                <span>🧬 Biologics: <strong>2</strong></span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 bg-slate-950/50 border border-slate-900 px-2.5 py-1 rounded-xl">
                <span>💊 Small Molecules: <strong>6</strong></span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 bg-slate-950/50 border border-slate-900 px-2.5 py-1 rounded-xl">
                <span>💉 Vaccines: <strong>1</strong></span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-auto shrink-0">
            <button
              onClick={() => {
                setActivePage('filing_registry');
                triggerNotification("Navigated to categorized filing registry view", "info");
              }}
              className="w-full lg:w-56 bg-emerald-600 hover:bg-emerald-500 hover:scale-[1.02] active:scale-[0.98] text-slate-950 font-black text-xs px-5 py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/15"
            >
              <Briefcase className="w-4 h-4 shrink-0" />
              <span>Explore Tabbed Registry</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </button>
            <button
              onClick={() => {
                setActivePage('dossier_aligner');
                triggerNotification("Launched active alignment workspace", "info");
              }}
              className="w-full lg:w-56 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-200 hover:text-white font-bold text-xs px-5 py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <FileText className="w-4 h-4 shrink-0" />
              <span>Launch Aligner Tree</span>
            </button>
          </div>
        </div>
      </div>

      {/* DETAILED INTERACTIVE SHIELD / JURISDICTION matrix */}
      <div className="bg-[#0b0f19]/80 border border-white/5 rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center gap-2 border-b border-white/5 pb-3">
          <Globe className="w-5 h-5 text-indigo-400 shrink-0" />
          <div>
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Multi-Region Endpoint Schema Matrix</h3>
            <p className="text-[10px] text-slate-500 font-mono">Active eCTD v4.0 connection check points with international health authorities</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {Object.keys(REGULATORY_BODIES).map((key) => {
            const body = REGULATORY_BODIES[key as RegulatoryAuthority];
            return (
              <div 
                key={body.id} 
                className="bg-[#030712] border border-white/5 hover:border-white/10 rounded-2xl p-4 space-y-3.5 transition-all shadow-md group relative overflow-hidden"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg">{body.icon}</span>
                    <span className="text-xs font-black text-slate-200">{body.id}</span>
                  </div>
                  
                  {/* Tactical Test Ping Dot */}
                  <button 
                    onClick={() => handleAuthorityPing(body.id)}
                    className="h-2 w-2 rounded-full bg-emerald-400 cursor-pointer animate-pulse relative"
                    title="Ping local authority endpoint check"
                  >
                    <span className="absolute -inset-1 rounded-full border border-emerald-400 animate-ping opacity-75 pointer-events-none" />
                  </button>
                </div>

                <div className="space-y-1">
                  <span className="text-[8px] text-slate-500 font-bold block uppercase font-mono tracking-widest">REGION</span>
                  <span className="text-[10px] text-slate-300 font-sans block truncate">{body.region}</span>
                </div>

                <div className="space-y-1">
                  <span className="text-[8px] text-slate-500 font-bold block uppercase font-mono tracking-widest">STABILITY protocol</span>
                  <span className="text-[10px] text-amber-400 font-mono block font-bold">{body.stabilityZone}</span>
                </div>

                <div className="space-y-1">
                  <span className="text-[8px] text-slate-500 font-bold block uppercase font-mono tracking-widest">COMPLIANCE SCHEMA</span>
                  <span className="text-[9px] text-slate-400 font-mono block truncate" title={body.standards}>{body.standards.split(',')[0]}</span>
                </div>

                <button 
                  onClick={() => handleAuthorityPing(body.id)}
                  className="w-full bg-[#0b0f19] hover:bg-slate-900 border border-white/5 text-[9px] text-slate-400 hover:text-white py-1.5 rounded-lg transition-colors font-mono cursor-pointer"
                >
                  Verify Core Conn
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* WORKSPACE MODULES QUICK LAUNCHER DOCK */}
      <div className="space-y-3">
        <div className="border-b border-white/5 pb-1.5 shrink-0">
          <h3 className="text-xs font-black text-white uppercase tracking-wider">Workspace Shortcut Module Dock</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          
          {/* Module 1 */}
          <div 
            onClick={() => {
              setActivePage('dossier_aligner');
              triggerNotification("Launched side-by-side Aligner", "info");
            }}
            className="bg-[#0b0f19]/80 border border-white/5 hover:border-emerald-500/25 rounded-2xl p-4.5 transition-all shadow-md flex items-center gap-4 group cursor-pointer active:scale-[0.99] hover:bg-gradient-to-br hover:from-[#0b0f19] hover:to-[#050a16]"
          >
            <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 rounded-xl shrink-0 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all duration-300">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-black text-slate-200 group-hover:text-emerald-400 transition-colors">1. Dossier Aligner</h4>
              <p className="text-[10px] text-slate-500 leading-normal mt-0.5 truncate">Comparative side-by-side eCTD structural realignment</p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="text-[8px] font-mono bg-[#030712] text-slate-400 px-1.5 py-0.5 rounded border border-white/5">USP - Ph. Eur. Mapping</span>
              </div>
            </div>
          </div>

          {/* Module 2 */}
          <div 
            onClick={() => {
              setActivePage('gap_matrix_hub');
              triggerNotification("Launched Gap Matrix Auditor", "info");
            }}
            className="bg-[#0b0f19]/80 border border-white/5 hover:border-emerald-500/25 rounded-2xl p-4.5 transition-all shadow-md flex items-center gap-4 group cursor-pointer active:scale-[0.99] hover:bg-gradient-to-br hover:from-[#0b0f19] hover:to-[#050a16]"
          >
            <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 rounded-xl shrink-0 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all duration-300">
              <Layers className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-black text-slate-200 group-hover:text-emerald-400 transition-colors">2. Gap Matrix Hub</h4>
              <p className="text-[10px] text-slate-500 leading-normal mt-0.5 truncate">Formatting & nomenclature automatic gap auditor</p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="text-[8px] font-mono bg-[#030712] text-amber-400 px-1.5 py-0.5 rounded border border-white/5 font-bold">Audit gaps matrix active</span>
              </div>
            </div>
          </div>

          {/* Module 3 */}
          <div 
            onClick={() => {
              setActivePage('ingest_ocr');
              triggerNotification("Launched Ingest Station", "info");
            }}
            className="bg-[#0b0f19]/80 border border-white/5 hover:border-emerald-500/25 rounded-2xl p-4.5 transition-all shadow-md flex items-center gap-4 group cursor-pointer active:scale-[0.99] hover:bg-gradient-to-br hover:from-[#0b0f19] hover:to-[#050a16]"
          >
            <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 rounded-xl shrink-0 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all duration-300">
              <ScanLine className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-black text-slate-200 group-hover:text-emerald-400 transition-colors">3. Ingest & OCR Station</h4>
              <p className="text-[10px] text-slate-500 leading-normal mt-0.5 truncate">Secure upload, OCR parsing and schema ingestion</p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="text-[8px] font-mono bg-[#030712] text-slate-400 px-1.5 py-0.5 rounded border border-white/5">Drag-and-drop support</span>
              </div>
            </div>
          </div>

          {/* Module 4 */}
          <div 
            onClick={() => {
              setActivePage('harmonizer_chat');
              triggerNotification("Launched AI Chat Advisor", "info");
            }}
            className="bg-[#0b0f19]/80 border border-white/5 hover:border-emerald-500/25 rounded-2xl p-4.5 transition-all shadow-md flex items-center gap-4 group cursor-pointer active:scale-[0.99] hover:bg-gradient-to-br hover:from-[#0b0f19] hover:to-[#050a16]"
          >
            <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 rounded-xl shrink-0 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all duration-300">
              <Bot className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-black text-slate-200 group-hover:text-emerald-400 transition-colors">4. Harmonizer-AI Chat</h4>
              <p className="text-[10px] text-slate-500 leading-normal mt-0.5 truncate">Interactive regulatory guidelines advisory chat</p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="text-[8px] font-mono bg-[#030712] text-emerald-400 px-1.5 py-0.5 rounded border border-white/5">Powered by Gemini AI</span>
              </div>
            </div>
          </div>

          {/* Module 5 */}
          <div 
            onClick={() => {
              setActivePage('stability_predictor');
              triggerNotification("Launched Stability Predictor", "info");
            }}
            className="bg-[#0b0f19]/80 border border-white/5 hover:border-emerald-500/25 rounded-2xl p-4.5 transition-all shadow-md flex items-center gap-4 group cursor-pointer active:scale-[0.99] hover:bg-gradient-to-br hover:from-[#0b0f19] hover:to-[#050a16]"
          >
            <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 rounded-xl shrink-0 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all duration-300">
              <Thermometer className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-black text-slate-200 group-hover:text-emerald-400 transition-colors">5. Stability Predictor</h4>
              <p className="text-[10px] text-slate-500 leading-normal mt-0.5 truncate">Shelf-life decay predictor for Zones I - IVb</p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="text-[8px] font-mono bg-[#030712] text-slate-400 px-1.5 py-0.5 rounded border border-white/5">ICH Climatic protocol</span>
              </div>
            </div>
          </div>

          {/* Module 6 */}
          <div 
            onClick={() => {
              setActivePage('ectd_validator');
              triggerNotification("Launched eCTD Schema Validator", "info");
            }}
            className="bg-[#0b0f19]/80 border border-white/5 hover:border-emerald-500/25 rounded-2xl p-4.5 transition-all shadow-md flex items-center gap-4 group cursor-pointer active:scale-[0.99] hover:bg-gradient-to-br hover:from-[#0b0f19] hover:to-[#050a16]"
          >
            <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 rounded-xl shrink-0 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all duration-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-black text-slate-200 group-hover:text-emerald-400 transition-colors">6. eCTD 4.0 Validator</h4>
              <p className="text-[10px] text-slate-500 leading-normal mt-0.5 truncate">Pre-flight schema diagnostic & validation rules</p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="text-[8px] font-mono bg-[#030712] text-slate-400 px-1.5 py-0.5 rounded border border-white/5">Zero Refuse-to-File</span>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Layers, 
  ShieldCheck, 
  AlertCircle, 
  ChevronRight, 
  Activity, 
  Sparkles, 
  Grid, 
  TrendingUp, 
  Globe, 
  HelpCircle,
  FileText,
  Clock,
  ArrowLeft,
  Briefcase,
  SlidersHorizontal,
  FolderOpen,
  DollarSign,
  HeartPulse,
  Tag,
  Boxes,
  HelpCircle as QuestionIcon
} from 'lucide-react';
import { DemoDossier, RegulatoryAuthority } from '../types';
import { REGULATORY_BODIES } from '../data';

interface FilingRegistryProps {
  dossiers: DemoDossier[];
  selectedDossierId: string;
  onSelectDossier: (id: string) => void;
  setActivePage: (page: string) => void;
  triggerNotification: (message: string, type: 'success' | 'error' | 'info') => void;
}

type GroupingType = 'modality' | 'priority' | 'source' | 'therapeutic';

export default function FilingRegistry({
  dossiers,
  selectedDossierId,
  onSelectDossier,
  setActivePage,
  triggerNotification
}: FilingRegistryProps) {
  const [groupingType, setGroupingType] = useState<GroupingType>('modality');
  const [activeTab, setActiveTab] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);

  // Helper to calculate gaps and alignment score
  const getDossierStats = (d: DemoDossier) => {
    const pendingGaps = d.sections.reduce((sum, s) => sum + s.gaps.filter(g => g.status === 'pending').length, 0);
    const totalGaps = d.sections.reduce((sum, s) => sum + s.gaps.length, 0);
    const alignmentPercent = totalGaps > 0 
      ? Math.round(((totalGaps - pendingGaps) / totalGaps) * 100)
      : 100;

    // Opportunity values based on drug
    const isPembro = d.drugName.includes('Keytruda');
    const isPacli = d.drugName.includes('Paclitaxel');
    const speedMultiplier = isPembro ? "5.2 Months" : isPacli ? "3.5 Months" : "4.2 Months";
    const valSavings = isPembro ? 124.5 : isPacli ? 52.2 : 76.4;
    const priorityLevel: 'Critical' | 'High' | 'Standard' = isPembro ? "Critical" : isPacli ? "Standard" : "High";

    return {
      pendingGaps,
      totalGaps,
      alignmentPercent,
      speedMultiplier,
      valSavings,
      priorityLevel
    };
  };

  // Define tabs depending on the grouping type selected
  const getTabsForGrouping = (): { id: string; label: string; count: number }[] => {
    const counts: Record<string, number> = { All: dossiers.length };

    dossiers.forEach(d => {
      const stats = getDossierStats(d);
      
      if (groupingType === 'modality') {
        const type = d.dossierType;
        counts[type] = (counts[type] || 0) + 1;
      } else if (groupingType === 'priority') {
        const prio = stats.priorityLevel;
        counts[prio] = (counts[prio] || 0) + 1;
      } else if (groupingType === 'source') {
        const src = d.sourceAuthority === 'FDA' ? 'US FDA' : 'EU EMA';
        counts[src] = (counts[src] || 0) + 1;
      } else if (groupingType === 'therapeutic') {
        let area = 'Specialty Care';
        if (d.therapeuticArea.toLowerCase().includes('oncology')) area = 'Oncology';
        else if (d.therapeuticArea.toLowerCase().includes('endocrinology')) area = 'Endocrinology';
        else if (d.therapeuticArea.toLowerCase().includes('virology')) area = 'Virology / Infectious';
        else if (d.therapeuticArea.toLowerCase().includes('preventive')) area = 'Preventive Medicine';
        
        counts[area] = (counts[area] || 0) + 1;
      }
    });

    const baseTabs = [{ id: 'All', label: 'All Compounds', count: counts['All'] || 0 }];

    if (groupingType === 'modality') {
      return [
        ...baseTabs,
        { id: 'Biologic', label: 'Biologics', count: counts['Biologic'] || 0 },
        { id: 'Small Molecule', label: 'Small Molecules', count: counts['Small Molecule'] || 0 },
        { id: 'Vaccine', label: 'Vaccines', count: counts['Vaccine'] || 0 }
      ];
    } else if (groupingType === 'priority') {
      return [
        ...baseTabs,
        { id: 'Critical', label: '🚨 Critical Priority', count: counts['Critical'] || 0 },
        { id: 'High', label: '⚠️ High Priority', count: counts['High'] || 0 },
        { id: 'Standard', label: '✓ Standard Priority', count: counts['Standard'] || 0 }
      ];
    } else if (groupingType === 'source') {
      return [
        ...baseTabs,
        { id: 'US FDA', label: '🇺🇸 US FDA Origin', count: counts['US FDA'] || 0 },
        { id: 'EU EMA', label: '🇪🇺 EU EMA Origin', count: counts['EU EMA'] || 0 }
      ];
    } else if (groupingType === 'therapeutic') {
      return [
        ...baseTabs,
        { id: 'Oncology', label: '🎗 Oncology', count: counts['Oncology'] || 0 },
        { id: 'Endocrinology', label: '🧬 Endocrinology', count: counts['Endocrinology'] || 0 },
        { id: 'Virology / Infectious', label: '🦠 Virology & Infectious', count: counts['Virology / Infectious'] || 0 },
        { id: 'Preventive Medicine', label: '🛡 Preventive Medicine', count: counts['Preventive Medicine'] || 0 }
      ];
    }

    return baseTabs;
  };

  const tabs = getTabsForGrouping();

  // Reset active tab if it's not valid for the current grouping
  const isTabValid = tabs.some(t => t.id === activeTab);
  const currentTab = isTabValid ? activeTab : 'All';

  // Filter dossiers by search term and selected tab category
  const filteredDossiers = dossiers.filter(d => {
    // 1. Search term check
    const matchesSearch = 
      d.drugName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.therapeuticArea.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.dossierType.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    // 2. Tab category check
    if (currentTab === 'All') return true;

    const stats = getDossierStats(d);

    if (groupingType === 'modality') {
      return d.dossierType === currentTab;
    } else if (groupingType === 'priority') {
      return stats.priorityLevel === currentTab;
    } else if (groupingType === 'source') {
      const srcStr = d.sourceAuthority === 'FDA' ? 'US FDA' : 'EU EMA';
      return srcStr === currentTab;
    } else if (groupingType === 'therapeutic') {
      let area = 'Specialty Care';
      if (d.therapeuticArea.toLowerCase().includes('oncology')) area = 'Oncology';
      else if (d.therapeuticArea.toLowerCase().includes('endocrinology')) area = 'Endocrinology';
      else if (d.therapeuticArea.toLowerCase().includes('virology')) area = 'Virology / Infectious';
      else if (d.therapeuticArea.toLowerCase().includes('preventive')) area = 'Preventive Medicine';
      
      return area === currentTab;
    }

    return true;
  });

  // Calculate high level summaries of the active filter/tab view
  const totalDossiersInView = filteredDossiers.length;
  const totalGapsInView = filteredDossiers.reduce((sum, d) => sum + getDossierStats(d).pendingGaps, 0);
  const totalValueInView = filteredDossiers.reduce((sum, d) => sum + getDossierStats(d).valSavings, 0);
  const avgAlignmentInView = totalDossiersInView > 0
    ? Math.round(filteredDossiers.reduce((sum, d) => sum + getDossierStats(d).alignmentPercent, 0) / totalDossiersInView)
    : 100;

  return (
    <div className="space-y-6 animate-fade-in text-slate-100" id="filing-registry-view-container">
      
      {/* HEADER WITH RETURN BUTTON */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900 pb-5">
        <div className="space-y-1">
          <button 
            onClick={() => setActivePage('dashboard')}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 transition-colors font-semibold group mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span>Return to Executive Hub</span>
          </button>
          
          <div className="flex items-center gap-2">
            <Boxes className="w-6 h-6 text-emerald-400" />
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase">
              Global Filing Dossier Registry
            </h2>
          </div>
          <p className="text-slate-400 text-xs max-w-2xl">
            Sovereign eCTD submission dossiers classified into interactive categories. View convergence indicators, pending gaps, and opportunity speeds live.
          </p>
        </div>

        {/* Global search within registry */}
        <div className="relative w-full md:w-72 shrink-0">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search substances, tags, therapeutics..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              // reset tab to All if searching to make finding easier, or let it stick
            }}
            className="w-full bg-[#030712] border border-slate-850 hover:bg-slate-950/40 hover:border-slate-800 focus:border-emerald-500/50 rounded-2xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500/10 transition-all h-10"
          />
        </div>
      </div>

      {/* METRIC RIBBON FOR CURRENT SELECTION */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-[#0b0f19]/30 border border-slate-900 rounded-2xl p-4">
        <div className="space-y-1 border-r border-slate-900/60 pr-4">
          <span className="text-[9px] uppercase font-mono tracking-widest text-slate-500 block">Dossiers Selected</span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black text-white font-mono">{totalDossiersInView}</span>
            <span className="text-[10px] text-slate-400 font-mono">of {dossiers.length}</span>
          </div>
        </div>

        <div className="space-y-1 border-r border-slate-900/60 md:pl-4 pr-4">
          <span className="text-[9px] uppercase font-mono tracking-widest text-slate-500 block">Pending Compliance Gaps</span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black text-amber-400 font-mono">{totalGapsInView}</span>
            <span className="text-[10px] text-slate-400 font-mono">Gaps requiring action</span>
          </div>
        </div>

        <div className="space-y-1 border-r border-slate-900/60 pl-4 pr-4">
          <span className="text-[9px] uppercase font-mono tracking-widest text-slate-500 block">Average Convergence</span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black text-emerald-400 font-mono">{avgAlignmentInView}%</span>
            <span className="text-[10px] text-emerald-500/80 font-mono">Normalized</span>
          </div>
        </div>

        <div className="space-y-1 pl-4">
          <span className="text-[9px] uppercase font-mono tracking-widest text-slate-500 block">Value Speed-Up Pot.</span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black text-pink-400 font-mono">${totalValueInView.toFixed(1)}M</span>
            <span className="text-[9px] text-slate-500 font-mono">USD Unlocked</span>
          </div>
        </div>
      </div>

      {/* DYNAMIC CATEGORY VIEWS CONTROLS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between bg-slate-950/60 border border-slate-900 rounded-3xl p-4 gap-4">
        
        {/* GROUP BY CONTROLSELECTOR */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold uppercase font-mono tracking-wider">
            <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span>Group Portfolio By:</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'modality', label: 'Modality / Type', icon: '🧬' },
              { id: 'priority', label: 'Urgency & Priority', icon: '🚨' },
              { id: 'source', label: 'Source Region', icon: '🌐' },
              { id: 'therapeutic', label: 'Therapeutic Specialty', icon: '🩺' }
            ].map(grp => (
              <button
                key={grp.id}
                onClick={() => {
                  setGroupingType(grp.id as GroupingType);
                  setActiveTab('All'); // Reset active tab when grouping strategy changes
                  triggerNotification(`Grouped registry by ${grp.label}`, 'info');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  groupingType === grp.id 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-900 hover:border-slate-850'
                }`}
              >
                <span>{grp.icon}</span>
                <span>{grp.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* SEARCH AND COUNT CONTEXT */}
        <div className="text-[10px] font-mono text-slate-500 lg:text-right">
          Sorting strategy conforming with <strong>FDA 21-CFR Part 11</strong> rules.
        </div>
      </div>

      {/* HORIZONTAL CATEGORY TABS CONTAINER */}
      <div className="border-b border-slate-900 pb-0.5">
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-2">
          {tabs.map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center gap-2 border whitespace-nowrap ${
                  isActive 
                    ? 'bg-[#0b0f19] text-emerald-400 border-slate-850 shadow-md' 
                    : 'bg-transparent text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-900/30'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md ${
                  isActive 
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/10' 
                    : 'bg-slate-900 text-slate-500'
                }`}>
                  {tab.count}
                </span>

                {isActive && (
                  <motion.div 
                    layoutId="activeFilingRegistryTabLine"
                    className="absolute bottom-[-2px] left-3 right-3 h-0.5 bg-emerald-400"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* DOSSIER BENTO CARDS GRID */}
      <div className="relative min-h-[300px]">
        <AnimatePresence mode="popLayout">
          {filteredDossiers.length > 0 ? (
            <motion.div 
              key={`${groupingType}-${currentTab}-${searchTerm}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredDossiers.map((d) => {
                const stats = getDossierStats(d);
                const isSelected = selectedDossierId === d.id;

                return (
                  <div
                    key={d.id}
                    onMouseEnter={() => setHoveredCardId(d.id)}
                    onMouseLeave={() => setHoveredCardId(null)}
                    onClick={() => {
                      onSelectDossier(d.id);
                      setActivePage('dossier_aligner');
                      triggerNotification(`Loaded workspace for ${d.drugName}`, 'success');
                    }}
                    className={`relative overflow-hidden bg-[#0a0e17]/90 border rounded-3xl p-6 shadow-2xl transition-all duration-300 cursor-pointer flex flex-col justify-between h-64 ${
                      isSelected 
                        ? 'border-emerald-400/50 bg-gradient-to-b from-[#0b101c] to-[#040812] shadow-emerald-500/5' 
                        : hoveredCardId === d.id 
                        ? 'border-indigo-500/40 bg-gradient-to-b from-[#0b0e17] to-[#040812] -translate-y-1 shadow-indigo-500/5' 
                        : 'border-slate-900 hover:border-slate-800'
                    }`}
                  >
                    {/* Glowing highlight orb */}
                    {hoveredCardId === d.id && (
                      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
                    )}
                    {isSelected && (
                      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
                    )}

                    {/* TOP BAR: Modality, Origin, Priority */}
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-mono bg-slate-950 text-slate-300 border border-slate-900 px-2.5 py-1 rounded-xl font-bold">
                          {REGULATORY_BODIES[d.sourceAuthority]?.icon} {d.sourceAuthority} Origin
                        </span>
                        <span className="text-[9px] font-mono bg-[#030712] border border-slate-850 px-2 py-0.5 rounded text-indigo-400 font-bold uppercase">
                          {d.dossierType}
                        </span>
                      </div>

                      {/* Urgency Badge */}
                      <span className={`text-[9px] font-mono uppercase font-black px-2.5 py-0.5 rounded-full border ${
                        stats.priorityLevel === 'Critical' 
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/15 animate-pulse' 
                          : stats.priorityLevel === 'High' 
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/15'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/15'
                      }`}>
                        {stats.priorityLevel}
                      </span>
                    </div>

                    {/* COMPOUND NAME & THERAPEUTIC */}
                    <div className="space-y-1.5 pt-3">
                      <h4 className="text-base font-black text-white tracking-tight leading-none group-hover:text-emerald-400 transition-colors truncate">
                        {d.drugName}
                      </h4>
                      <p className="text-xs text-slate-400 leading-normal line-clamp-1 flex items-center gap-1">
                        <HeartPulse className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span>{d.therapeuticArea}</span>
                      </p>
                    </div>

                    {/* TARGET JURISDICTIONS LIST */}
                    <div className="space-y-1 py-2">
                      <span className="text-[8px] font-mono text-slate-500 uppercase font-black tracking-widest">Target Markets</span>
                      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                        {d.targetAuthorities.map(target => {
                          const body = REGULATORY_BODIES[target];
                          return (
                            <span 
                              key={target} 
                              className="text-[10px] bg-slate-950 hover:bg-slate-900 border border-slate-900 text-slate-300 px-2 py-1 rounded-lg flex items-center gap-1 font-bold shrink-0 transition-colors"
                              title={`${body?.name} (${body?.region})`}
                            >
                              <span>{body?.icon}</span>
                              <span>{target}</span>
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* PROGRESS BAR & STATS */}
                    <div className="space-y-2 py-2 border-t border-slate-900">
                      <div className="flex justify-between items-center text-[10px] font-mono">
                        <span className="text-slate-500 font-bold uppercase tracking-wider">Alignment Health</span>
                        <span className="text-emerald-400 font-extrabold">{stats.alignmentPercent}% Converged</span>
                      </div>
                      
                      <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-900">
                        <div 
                          className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-300"
                          style={{ width: `${stats.alignmentPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* CARD FOOTER WITH ESTIMATION BENEFITS */}
                    <div className="flex justify-between items-center pt-3 border-t border-slate-900">
                      <div className="space-y-0.5">
                        <span className="text-[8px] text-slate-500 font-bold uppercase font-mono tracking-widest block">Acceleration Gains</span>
                        <div className="flex items-center gap-1.5 text-[11px] font-mono">
                          <span className="font-extrabold text-emerald-400">${stats.valSavings}M Unlocked</span>
                          <span className="text-slate-400">({stats.speedMultiplier})</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {stats.pendingGaps > 0 && (
                          <span className="text-[9px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/15 px-2 py-1 rounded-xl font-bold flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            <span>{stats.pendingGaps} Gaps</span>
                          </span>
                        )}
                        <button className="p-2 bg-slate-950 hover:bg-emerald-500 text-slate-400 hover:text-slate-950 rounded-2xl border border-slate-900 transition-all shadow-md">
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div 
              key="empty-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 border border-slate-900 border-dashed rounded-3xl space-y-4"
            >
              <div className="p-4 bg-slate-900/40 text-slate-500 rounded-full border border-slate-850">
                <Search className="w-8 h-8" />
              </div>
              <div className="text-center space-y-1">
                <h4 className="text-sm font-bold text-slate-200">No submission dossiers found</h4>
                <p className="text-xs text-slate-500 max-w-sm">
                  We couldn't find any filings matching "{searchTerm}" under the selected category "{currentTab}". Try adjusting filters or search terms.
                </p>
              </div>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setActiveTab('All');
                }}
                className="bg-slate-900 border border-slate-850 hover:bg-slate-850 text-xs font-bold text-slate-300 hover:text-white px-4 py-2 rounded-xl transition-all"
              >
                Clear Filters
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}

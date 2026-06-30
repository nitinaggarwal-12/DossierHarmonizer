import React, { useState } from 'react';
import { DemoDossier, RegulatoryAuthority, ComplianceGap } from '../types';
import { REGULATORY_BODIES } from '../data';
import { 
  BarChart3, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Search, 
  Filter, 
  Sparkles,
  ArrowRight,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';

interface GapMatrixHubProps {
  dossiers: DemoDossier[];
  selectedDossierId: string;
  onResolveGap: (gapId: string, sectionId: string) => void;
  onSelectSection: (sectionId: string) => void;
  onSelectTab: (tabId: string) => void;
}

export default function GapMatrixHub({
  dossiers,
  selectedDossierId,
  onResolveGap,
  onSelectSection,
  onSelectTab,
}: GapMatrixHubProps) {
  const dossier = dossiers.find(d => d.id === selectedDossierId) || dossiers[0];
  
  // States
  const [severityFilter, setSeverityFilter] = useState<'all' | 'critical' | 'warning' | 'info'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMatrixCell, setSelectedMatrixCell] = useState<{ sectionId: string; authority: RegulatoryAuthority } | null>(null);

  // Aggregate all gaps in the current dossier
  const allGaps = dossier.sections.flatMap(section => 
    section.gaps.map(gap => ({
      ...gap,
      sectionId: section.id,
      sectionCode: section.sectionCode,
      sectionTitle: section.title,
    }))
  );

  // Filtered gaps
  const filteredGaps = allGaps.filter(gap => {
    const matchesSeverity = severityFilter === 'all' || gap.severity === severityFilter;
    const matchesSearch = 
      gap.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gap.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gap.sectionCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gap.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSeverity && matchesSearch;
  });

  // Calculate statistics
  const totalGaps = allGaps.length;
  const pendingGaps = allGaps.filter(g => g.status === 'pending').length;
  const resolvedGaps = allGaps.filter(g => g.status === 'resolved').length;
  const resolutionRate = totalGaps > 0 ? Math.round((resolvedGaps / totalGaps) * 100) : 100;

  const criticalCount = allGaps.filter(g => g.severity === 'critical' && g.status === 'pending').length;
  const warningCount = allGaps.filter(g => g.severity === 'warning' && g.status === 'pending').length;
  const infoCount = allGaps.filter(g => g.severity === 'info' && g.status === 'pending').length;

  // Authorities matrix columns
  const authorities: RegulatoryAuthority[] = ['FDA', 'EMA', 'PMDA', 'CDSCO', 'Swissmedic'];

  // Categories count for dynamic SVG chart
  const categories = ['Specification', 'Terminology', 'Safety', 'Packaging', 'Formatting'];
  const categoryCounts = categories.reduce((acc, cat) => {
    acc[cat] = allGaps.filter(g => g.category === cat && g.status === 'pending').length;
    return acc;
  }, {} as Record<string, number>);

  const maxCount = Math.max(...Object.values(categoryCounts), 1);

  return (
    <div className="space-y-3" id="gap-matrix-hub">
      {/* Visual Header - Compact */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex justify-between items-center relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <BarChart3 className="w-20 h-20 text-emerald-500" />
        </div>
        <div className="relative z-10 flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl">
            <BarChart3 className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white">Dossier Gap Matrix Hub</h2>
              <span className="text-[8px] font-mono tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.2 rounded font-bold uppercase">
                Module 1 & 3 Auditor
              </span>
            </div>
            <p className="text-slate-400 text-[10px] mt-0.5">
              Real-time compliance scorecard auditing dossier sections across international healthcare regulatory bodies.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards - Compact Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between">
          <div>
            <p className="text-[9px] text-slate-500 font-bold uppercase">Compliance Score</p>
            <h3 className="text-md font-extrabold text-white font-mono mt-0.5">{resolutionRate}% Aligned</h3>
          </div>
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <TrendingUp className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between">
          <div>
            <p className="text-[9px] text-slate-500 font-bold uppercase">Critical Roadblocks</p>
            <h3 className="text-md font-extrabold text-rose-500 font-mono mt-0.5">{criticalCount} Gaps</h3>
          </div>
          <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <ShieldAlert className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between">
          <div>
            <p className="text-[9px] text-slate-500 font-bold uppercase">Warnings Pending</p>
            <h3 className="text-md font-extrabold text-amber-500 font-mono mt-0.5">{warningCount} Flagged</h3>
          </div>
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertTriangle className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between">
          <div>
            <p className="text-[9px] text-slate-500 font-bold uppercase">Informational Flags</p>
            <h3 className="text-md font-extrabold text-sky-400 font-mono mt-0.5">{infoCount} Issues</h3>
          </div>
          <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Info className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Grid: Matrix Grid Left (2/3) + Category Chart Right (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Interactive Matrix Grid (8 cols) */}
        <div className="lg:col-span-8 bg-slate-900/30 border border-slate-900 rounded-2xl p-5 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Cross-Region Submission Matrix</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Click cells to view detailed section properties</p>
            </div>
            <span className="text-[10px] bg-slate-800 px-2 py-1 rounded text-slate-400 font-mono">Dossier: {dossier.drugName}</span>
          </div>

          <div className="overflow-x-auto border border-slate-800/80 rounded-xl">
            <table className="min-w-full divide-y divide-slate-800 text-xs">
              <thead className="bg-slate-900/80 text-slate-400 font-bold uppercase font-sans">
                <tr>
                  <th className="px-4 py-3 text-left w-36">eCTD Section</th>
                  {authorities.map(auth => (
                    <th key={auth} className="px-3 py-3 text-center font-mono">
                      {auth}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 bg-slate-950/40">
                {dossier.sections.filter(s => s.level === 2).map(section => (
                  <tr key={section.id} className="hover:bg-slate-900/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-300 border-r border-slate-800/30">
                      <div className="font-mono text-[10px] font-bold text-slate-400">Section {section.sectionCode}</div>
                      <div className="text-[11px] text-slate-200 truncate max-w-[150px]" title={section.title}>
                        {section.title}
                      </div>
                    </td>
                    {authorities.map(auth => {
                      const status = section.targetStatus?.[auth] || section.status;
                      const hasGapsForAuth = section.gaps.some(g => g.status === 'pending');
                      
                      let badgeColor = "bg-slate-800/40 text-slate-500 border-slate-800";
                      let label = "Unreviewed";
                      
                      if (status === 'compliant' && !hasGapsForAuth) {
                        badgeColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
                        label = "Aligned";
                      } else if (status === 'warning' || hasGapsForAuth) {
                        const hasCritical = section.gaps.some(g => g.severity === 'critical' && g.status === 'pending');
                        if (hasCritical) {
                          badgeColor = "bg-rose-500/10 text-rose-400 border-rose-500/20";
                          label = "Critical Gap";
                        } else {
                          badgeColor = "bg-amber-500/10 text-amber-400 border-amber-500/20";
                          label = "Warning";
                        }
                      }

                      return (
                        <td 
                          key={auth} 
                          className="px-2 py-3 text-center border-r border-slate-800/30 cursor-pointer hover:bg-slate-800/20"
                          onClick={() => {
                            setSelectedMatrixCell({ sectionId: section.id, authority: auth });
                            onSelectSection(section.id);
                          }}
                        >
                          <span className={`inline-flex px-2 py-1 rounded text-[9px] font-bold border ${badgeColor}`}>
                            {label}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Matrix Cell Drilldown Details */}
          {selectedMatrixCell && (
            <div className="mt-4 p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <span className="text-[9px] font-mono font-extrabold uppercase bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded">
                  Drilldown Context ({selectedMatrixCell.authority})
                </span>
                <h4 className="text-xs font-bold text-white mt-1">
                  Section {dossier.sections.find(s => s.id === selectedMatrixCell.sectionId)?.sectionCode} — {dossier.sections.find(s => s.id === selectedMatrixCell.sectionId)?.title}
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Target regulations audited under {REGULATORY_BODIES[selectedMatrixCell.authority]?.name} system parameters.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onSelectSection(selectedMatrixCell.sectionId);
                    onSelectTab('workspace'); // core dossier aligner tab
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-[11px] font-bold transition-all cursor-pointer inline-flex items-center gap-1"
                >
                  Open in Workspace
                  <ArrowRight className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setSelectedMatrixCell(null)}
                  className="px-2 py-1.5 text-slate-400 hover:text-white text-[11px] cursor-pointer"
                >
                  Clear Drilldown
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Category SVG Bar Chart (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900/30 border border-slate-900 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-1">Gaps by ICH Category</h3>
            <p className="text-[10px] text-slate-500">Unresolved requirements cataloged by category type</p>
          </div>

          <div className="space-y-3.5 my-6">
            {categories.map(cat => {
              const count = categoryCounts[cat] || 0;
              const percent = Math.min((count / maxCount) * 100, 100);

              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-[11px] font-medium">
                    <span className="text-slate-300">{cat}</span>
                    <span className="text-slate-400 font-mono font-bold">{count} pending</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800">
                    <div 
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 h-1.5 rounded-full transition-all duration-500" 
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl text-[10px] text-slate-400 leading-relaxed">
            <span className="font-bold text-slate-200">Recommendation:</span> High frequency of nomenclature and specification issues are easily auto-resolved with the AI Harmonizer engine.
          </div>
        </div>

      </div>

      {/* Filterable Gaps Management Panel */}
      <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-5">
        
        {/* Filters Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-5">
          <div>
            <h3 className="text-sm font-bold text-white">Actionable Remediation Center</h3>
            <p className="text-xs text-slate-500 mt-0.5">Filter, audit, and trigger local context repairs instantly</p>
          </div>

          {/* Search & Severity Filters */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative w-full md:w-48">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search gaps..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-xs outline-none text-white focus:border-emerald-500 transition-colors"
              />
            </div>

            {/* Severity selection */}
            <div className="flex bg-slate-950 rounded-xl p-0.5 border border-slate-800 text-xs text-slate-400 font-medium">
              {(['all', 'critical', 'warning', 'info'] as const).map(sev => (
                <button
                  key={sev}
                  onClick={() => setSeverityFilter(sev)}
                  className={`px-3 py-1 rounded-lg capitalize transition-all cursor-pointer ${
                    severityFilter === sev ? 'bg-slate-800 text-white font-bold' : 'hover:text-slate-200'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Gaps List */}
        <div className="space-y-3 max-h-[160px] overflow-y-auto pr-1.5 scrollbar-thin">
          {filteredGaps.length === 0 ? (
            <div className="p-12 border border-dashed border-slate-800 rounded-xl text-center">
              <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-60" />
              <h4 className="text-xs font-bold text-slate-300">No Gaps Found</h4>
              <p className="text-[10px] text-slate-500 mt-1">Adjust your filters or query to explore more compliance audits</p>
            </div>
          ) : (
            filteredGaps.map(gap => {
              const isResolved = gap.status === 'resolved';

              return (
                <div 
                  key={gap.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
                    isResolved 
                      ? 'bg-emerald-950/10 border-emerald-900/30 text-slate-400' 
                      : 'bg-slate-900/40 border-slate-900 hover:border-slate-800 text-slate-200'
                  }`}
                >
                  <div className="space-y-1 max-w-xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-bold">
                        Section {gap.sectionCode}
                      </span>
                      <span className={`text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded ${
                        gap.severity === 'critical' 
                          ? 'bg-rose-500/15 text-rose-400 border border-rose-500/10' 
                          : gap.severity === 'warning'
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/10'
                          : 'bg-sky-500/15 text-sky-400 border border-sky-500/10'
                      }`}>
                        {gap.severity}
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">ICH: {gap.guidelineCitation}</span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                      {gap.title}
                      {isResolved && <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                    </h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{gap.description}</p>
                    <p className="text-[10px] text-emerald-400 font-mono font-medium">Suggestion: {gap.suggestion}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => {
                        onSelectSection(gap.sectionId);
                        onSelectTab('workspace');
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-all text-[11px] font-bold cursor-pointer inline-flex items-center gap-1"
                    >
                      Inspect Node
                      <ChevronRight className="w-3 h-3" />
                    </button>
                    
                    {!isResolved && (
                      <button
                        onClick={() => onResolveGap(gap.id, gap.sectionId)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold transition-all shadow cursor-pointer inline-flex items-center gap-1"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        AI Resolve
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
}

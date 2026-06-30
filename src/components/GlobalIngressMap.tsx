import React, { useState } from 'react';
import { Globe, Map, ExternalLink, ShieldCheck, AlertCircle, CheckCircle2, RefreshCw, FileText, HelpCircle } from 'lucide-react';
import { DEMO_DOSSIERS } from '../data';
import InteractiveGlobe from './InteractiveGlobe';

interface CountryDetail {
  id: string;
  agency: string;
  agencyFull: string;
  clinicalRegistry: string;
  localBatchRule: string;
  languageRequired: string;
  portalLink: string;
}

const NATION_DATA: Record<string, CountryDetail> = {
  'United States': {
    id: 'FDA',
    agency: 'FDA CDER',
    agencyFull: 'Center for Drug Evaluation and Research',
    clinicalRegistry: 'ClinicalTrials.gov (NCT registry)',
    localBatchRule: 'Accepts international batch data. Multi-ethnic demographic summary required in Module 1.',
    languageRequired: 'English',
    portalLink: 'https://www.fda.gov'
  },
  'European Union': {
    id: 'EMA',
    agency: 'EMA CHMP',
    agencyFull: 'Committee for Medicinal Products for Human Use',
    clinicalRegistry: 'EudraCT / EU Clinical Trials Register',
    localBatchRule: 'Standard batch specifications. Co-ordinated centralized or decentralized submission channels.',
    languageRequired: 'English (SmPC must be translated to 24 EU languages upon approval)',
    portalLink: 'https://www.ema.europa.eu'
  },
  'Japan': {
    id: 'PMDA',
    agency: 'PMDA',
    agencyFull: 'Pharmaceuticals and Medical Devices Agency',
    clinicalRegistry: 'jRCT (Japan Registry of Clinical Trials)',
    localBatchRule: 'Strict Japanese/East Asian localized clinical trial bridging data typically required in Module 5.',
    languageRequired: 'Japanese (Module 1 label, brief overview summaries must be in Japanese)',
    portalLink: 'https://www.pmda.go.jp'
  },
  'India': {
    id: 'CDSCO',
    agency: 'CDSCO',
    agencyFull: 'Central Drugs Standard Control Organization',
    clinicalRegistry: 'CTRI (Clinical Trials Registry - India)',
    localBatchRule: 'Local Phase III clinical bridging trials required unless waive-granted by DCGI.',
    languageRequired: 'English',
    portalLink: 'https://cdsco.gov.in'
  },
  'Switzerland': {
    id: 'Swissmedic',
    agency: 'Swissmedic',
    agencyFull: 'Swiss Agency for Therapeutic Products',
    clinicalRegistry: 'SNCT (Swiss National Clinical Trials Portal)',
    localBatchRule: 'Accepts standard EMA dossiers directly, but requires specific Swiss national annexes and localized packaging mockups.',
    languageRequired: 'German, French, and Italian (Product labeling must include all three)',
    portalLink: 'https://www.swissmedic.ch'
  }
};

const AUTHORITY_TO_NATION: Record<string, string> = {
  'FDA': 'United States',
  'EMA': 'European Union',
  'PMDA': 'Japan',
  'CDSCO': 'India',
  'Swissmedic': 'Switzerland'
};

const NATION_TO_AUTHORITY: Record<string, string> = {
  'United States': 'FDA',
  'European Union': 'EMA',
  'Japan': 'PMDA',
  'India': 'CDSCO',
  'Switzerland': 'Swissmedic'
};

const GLOBE_NODES_BASE = [
  { id: 'FDA', name: 'United States (FDA)', lat: 38, lon: -97, color: '#0D9488', agency: 'FDA CDER' },
  { id: 'EMA', name: 'European Union (EMA)', lat: 50, lon: 10, color: '#3B82F6', agency: 'EMA CHMP' },
  { id: 'PMDA', name: 'Japan (PMDA)', lat: 36, lon: 138, color: '#EF4444', agency: 'PMDA' },
  { id: 'CDSCO', name: 'India (CDSCO)', lat: 21, lon: 79, color: '#F59E0B', agency: 'CDSCO' },
  { id: 'Swissmedic', name: 'Switzerland (Swissmedic)', lat: 47, lon: 8, color: '#8B5CF6', agency: 'Swissmedic' }
];

export default function GlobalIngressMap() {
  const [selectedDossierId, setSelectedDossierId] = useState<string>(DEMO_DOSSIERS[0]?.id || '');
  const [selectedCountry, setSelectedCountry] = useState<string>('Japan');

  const activeDossier = DEMO_DOSSIERS.find((d) => d.id === selectedDossierId) || DEMO_DOSSIERS[0];
  const info = NATION_DATA[selectedCountry] || NATION_DATA['Japan'];

  // Aggregate Section-level statuses for each target authority
  const getTargetAuthorityStatus = (authId: string) => {
    if (!activeDossier) return 'unreviewed';
    if (activeDossier.sourceAuthority === authId) return 'compliant';
    if (!activeDossier.targetAuthorities.includes(authId as any)) return 'unreviewed';

    let hasError = false;
    let hasWarning = false;
    let hasCompliant = false;

    activeDossier.sections.forEach((sec) => {
      const status = sec.targetStatus[authId as any] || 'unreviewed';
      if (status === 'error') hasError = true;
      if (status === 'warning') hasWarning = true;
      if (status === 'compliant') hasCompliant = true;
    });

    if (hasError) return 'error';
    if (hasWarning) return 'warning';
    if (hasCompliant) return 'compliant';
    return 'unreviewed';
  };

  // Build real-time Globe Nodes with dossier statuses
  const globeNodes = GLOBE_NODES_BASE.map((node) => {
    const status = getTargetAuthorityStatus(node.id);
    return {
      ...node,
      status: status as 'compliant' | 'warning' | 'error' | 'unreviewed'
    };
  });

  // Build active transmission arcs from dossier source to targets
  const globeArcs = activeDossier?.targetAuthorities.map((targetAuth) => {
    const status = getTargetAuthorityStatus(targetAuth);
    return {
      from: activeDossier.sourceAuthority,
      to: targetAuth,
      color: status === 'compliant' ? '#10B981' : status === 'warning' ? '#F59E0B' : status === 'error' ? '#EF4444' : '#64748B',
      status: status as 'compliant' | 'warning' | 'error' | 'unreviewed'
    };
  }) || [];

  // Get active alignment gaps for the selected country and selected dossier
  const activeGaps = activeDossier?.sections.flatMap((sec) => 
    (sec.gaps || []).filter((gap) => {
      // Find which country this gap is relevant to by looking at targetStatus
      // If the section is warning/error on the selected country's authority, then its gaps are relevant
      const selectedAuthId = NATION_TO_AUTHORITY[selectedCountry];
      const targetStat = sec.targetStatus[selectedAuthId as any];
      return targetStat === 'error' || targetStat === 'warning';
    })
  ) || [];

  const handleSelectNode = (nodeId: string) => {
    const nationName = AUTHORITY_TO_NATION[nodeId];
    if (nationName) {
      setSelectedCountry(nationName);
    }
  };

  return (
    <div className="space-y-6" id="global-ingress-map">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Globe className="w-40 h-40 text-emerald-500 animate-pulse" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full font-bold uppercase">
              Cross-Border Clinical Pathways
            </span>
            <h2 className="text-xl font-extrabold text-white mt-2">Global Ingress Mapping</h2>
            <p className="text-slate-400 text-xs mt-1 max-w-xl">
              Orbit the globe to analyze multi-national regulatory submissions, localized batch policies, and critical compliance gap assessments in real time.
            </p>
          </div>

          {/* Dossier Selector Dropdown */}
          <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-center gap-3 shrink-0">
            <span className="text-slate-400 text-[10px] font-mono uppercase tracking-wider font-bold">Active Drug:</span>
            <select
              value={selectedDossierId}
              onChange={(e) => setSelectedDossierId(e.target.value)}
              className="bg-slate-900 border border-slate-750 rounded px-2.5 py-1.5 text-xs text-white font-medium focus:outline-none focus:border-emerald-500 cursor-pointer max-w-[200px]"
            >
              {DEMO_DOSSIERS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.drugName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Rotating Globe Map (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          
          {/* Holographic 3D Globe Viewer */}
          <div className="relative">
            <InteractiveGlobe 
              nodes={globeNodes}
              activeNodeId={NATION_TO_AUTHORITY[selectedCountry] || ''}
              onSelectNode={handleSelectNode}
              arcs={globeArcs}
            />
          </div>

          {/* Globe Status Legend and Region Quick Buttons */}
          <div className="bg-slate-950 border border-slate-900 rounded-2xl p-4 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-900 pb-3">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Alignment Status Legend</span>
              <div className="flex flex-wrap gap-4 text-[10px] font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-slate-400">Source / Compliant</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span className="text-slate-400">Risk Warning</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  <span className="text-slate-400">Critical Gaps</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-600"></span>
                  <span className="text-slate-500">Unreviewed / Target</span>
                </div>
              </div>
            </div>

            {/* Flat Grid Selector buttons */}
            <div className="space-y-2">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Or Select Region Directly:</span>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {Object.keys(NATION_DATA).map((country) => {
                  const isActive = country === selectedCountry;
                  const authId = NATION_TO_AUTHORITY[country];
                  const status = getTargetAuthorityStatus(authId);

                  let badgeColor = 'border-slate-800 text-slate-400 hover:text-slate-200';
                  if (isActive) {
                    if (status === 'compliant') badgeColor = 'bg-emerald-950/20 border-emerald-500/40 text-emerald-400 font-bold';
                    else if (status === 'warning') badgeColor = 'bg-amber-950/20 border-amber-500/40 text-amber-400 font-bold';
                    else if (status === 'error') badgeColor = 'bg-red-950/20 border-red-500/40 text-red-400 font-bold';
                    else badgeColor = 'bg-slate-900 border-slate-700 text-white font-bold';
                  }

                  return (
                    <button
                      key={country}
                      onClick={() => setSelectedCountry(country)}
                      className={`py-2 px-2.5 rounded-lg border text-left text-xs transition-all cursor-pointer ${badgeColor}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="truncate">{country}</span>
                        <span className="text-[9px] font-mono text-slate-500 shrink-0 ml-1">{authId}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-3 bg-slate-900/30 border border-slate-900 rounded-xl text-[10px] text-slate-500 leading-relaxed font-sans flex gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-400">Integrated Global Pathways:</span>
                Each 3D transmission arc represents real-time dossier state mapping. When sections are modified or gap analyses are checked off in the workspace, the globe elements adapt their risk indicators dynamically.
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Ingress Passport + Regional Gap Diagnostics (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Country specifications details card */}
          <div className="bg-slate-950 border border-slate-900 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
            
            <div className="space-y-4">
              <div className="flex items-start justify-between border-b border-slate-900 pb-3">
                <div>
                  <span className="text-[9px] uppercase tracking-wider font-extrabold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-md">
                    Ingress Passport
                  </span>
                  <h3 className="text-md font-extrabold text-white mt-1.5">{selectedCountry}</h3>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-mono text-slate-500 block uppercase">Standard</span>
                  <span className="text-xs font-mono text-emerald-400 font-bold block mt-0.5">eCTD 4.0 Compliant</span>
                </div>
              </div>

              <div className="space-y-3">
                
                <div className="p-3 bg-slate-900/40 border border-slate-900 rounded-xl">
                  <span className="text-[9px] font-bold text-slate-500 uppercase block">Regulatory Authority</span>
                  <span className="text-xs font-bold text-white block mt-0.5">{info.agency}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5 leading-tight">{info.agencyFull}</span>
                </div>

                <div className="p-3 bg-slate-900/40 border border-slate-900 rounded-xl">
                  <span className="text-[9px] font-bold text-slate-500 uppercase block">Required Clinical Trial Registry</span>
                  <span className="text-xs font-semibold text-white font-mono block mt-0.5">{info.clinicalRegistry}</span>
                </div>

                <div className="p-3 bg-slate-900/40 border border-slate-900 rounded-xl">
                  <span className="text-[9px] font-bold text-slate-500 uppercase block">Localized Batch Data Rules</span>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{info.localBatchRule}</p>
                </div>

                <div className="p-3 bg-slate-900/40 border border-slate-900 rounded-xl">
                  <span className="text-[9px] font-bold text-slate-500 uppercase block">Dossier Submission Language</span>
                  <span className="text-xs font-semibold text-emerald-400 block mt-0.5">{info.languageRequired}</span>
                </div>

              </div>
            </div>

            <a
              href={info.portalLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white rounded-xl py-3 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-4"
            >
              Visit {info.agency} Portal
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            </a>

          </div>

          {/* Regional Gaps diagnostics panel */}
          <div className="bg-slate-950 border border-slate-900 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-900 pb-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-300">Active Alignment Gaps</h4>
              </div>
              <span className="text-[10px] font-mono bg-slate-900 text-slate-400 px-2 py-0.5 rounded-full">
                {activeGaps.length} Gaps
              </span>
            </div>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {activeGaps.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-slate-900 rounded-xl bg-slate-900/10">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500/40 mx-auto mb-2" />
                  <p className="text-xs text-slate-400 font-medium">No active gaps detected</p>
                  <p className="text-[10px] text-slate-600 mt-0.5">Dossier is fully aligned for {selectedCountry}</p>
                </div>
              ) : (
                activeGaps.map((gap) => (
                  <div key={gap.id} className="p-3 bg-slate-900/30 border border-slate-900 rounded-xl space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <span className={`text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded shrink-0 ${
                        gap.severity === 'critical' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'
                      }`}>
                        {gap.severity}
                      </span>
                      <span className="text-[9px] font-mono text-slate-500">{gap.category} • Section {gap.section}</span>
                    </div>
                    <h5 className="text-xs font-bold text-slate-200 leading-snug">{gap.title}</h5>
                    <p className="text-[10px] text-slate-400 leading-relaxed">{gap.description}</p>
                    <div className="pt-2 border-t border-slate-900 text-[9px] text-emerald-400 flex items-start gap-1">
                      <span className="font-bold font-mono text-emerald-500 uppercase shrink-0">Mitigate:</span>
                      <span className="leading-relaxed">{gap.suggestion}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

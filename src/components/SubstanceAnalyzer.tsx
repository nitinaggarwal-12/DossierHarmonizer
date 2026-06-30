import React, { useState } from 'react';
import { Atom, Dna, CheckCircle, AlertCircle, HelpCircle, Download } from 'lucide-react';

interface SubCategory {
  pIRange: string;
  molecularWeight: string;
  glycosylationCQAs: string[];
  suggestedTests: string[];
}

const CAT_DATA: Record<string, SubCategory> = {
  'IgG1 Monoclonal Antibody': {
    pIRange: '7.8 - 9.3 (Highly basic variants)',
    molecularWeight: '148 - 150 kDa',
    glycosylationCQAs: ['G0F (Asialo, biantennary, core-fucosylated)', 'G1F (Mono-galactosylated)', 'G2F (Di-galactosylated)'],
    suggestedTests: ['Capillary Isoelectric Focusing (cIEF)', 'Size Exclusion HPLC (purity ≥ 98.0%)', 'Hydrophilic Interaction Chromatography (HILIC) Glycan mapping']
  },
  'IgG4 Monoclonal Antibody': {
    pIRange: '6.8 - 8.2 (Slightly neutral/basic)',
    molecularWeight: '145 - 147 kDa',
    glycosylationCQAs: ['High Mannose Glycans (Man5)', 'G0F', 'Sialylated Glycans (NeuAc)'],
    suggestedTests: ['Non-reducing Capillary Electrophoresis (CE-SDS)', 'Anion Exchange Chromatography (AEX)', 'Mass Spectrometry Glycan sequencing']
  },
  'Peptide Hormone / Fusion Protein': {
    pIRange: '4.5 - 6.5 (Highly acidic)',
    molecularWeight: '15 - 45 kDa',
    glycosylationCQAs: ['O-linked Glycosylation (Sialic acid rich)', 'N-linked complex antennae'],
    suggestedTests: ['Reverse-Phase HPLC (RP-HPLC)', 'Isoelectric Focusing Gel Electrophoresis', 'MALDI-TOF Molecular Mass verification']
  }
};

interface SubstanceAnalyzerProps {
  triggerNotification: (message: string, type: 'success' | 'info' | 'error') => void;
}

export default function SubstanceAnalyzer({ triggerNotification }: SubstanceAnalyzerProps) {
  const [category, setCategory] = useState('IgG1 Monoclonal Antibody');
  const [hostSystem, setHostSystem] = useState('Chinese Hamster Ovary (CHO) Cells');
  const [authority, setAuthority] = useState('PMDA (Japan)');

  const activeSub = CAT_DATA[category] || CAT_DATA['IgG1 Monoclonal Antibody'];

  const handleExportDetails = () => {
    const text = `# Biologics Module 3.2.S Characterization Report

## Substance Overview
- **Biological Entity**: ${category}
- **Expression Host System**: ${hostSystem}
- **Target Regional Health Authority**: ${authority}

## Calculated Critical Quality Attributes (CQAs)
- **Theoretical Isoelectric Point (pI)**: ${activeSub.pIRange}
- **Standard Molecular Weight Range**: ${activeSub.molecularWeight}
- **Primary Glycan Heterogeneity CQAs**: 
${activeSub.glycosylationCQAs.map(g => `  - ${g}`).join('\n')}

## Recommended Module 3 Specification Assay Matrix
${activeSub.suggestedTests.map(t => `- [x] ${t}`).join('\n')}

## ${authority} Viral Clearance / Source Controls Directive
- **Requirement**: ${
      authority === 'PMDA (Japan)' 
        ? "Japanese PMDA requires complete bovine/animal origin clearance certificates for any excipient/lactose used. In-process viral clearance validation must use specific localized East Asian viral strains."
        : authority === 'EMA (Europe)'
        ? "EMA mandates full characterization of post-translational modifications (PTMs), specifically monitoring immunogenic non-human glycans like Neu5Gc and alpha-gal."
        : "FDA requires validated viral clearance log reduction checks (e.g. retrovirus, parvovirus) on three pilot scale batches with specific clearance factor ratios."
    }
`;

    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${category.replace(/\s+/g, '_')}_biotech_specs.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerNotification("Biologics substance specification report exported!", "success");
  };

  return (
    <div className="space-y-6" id="substance-analyzer">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Atom className="w-40 h-40 text-emerald-500 animate-spin-slow" />
        </div>
        <div className="relative z-10">
          <span className="text-[10px] font-mono tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full font-bold uppercase">
            Module 3.2.S.1.3 Biologics
          </span>
          <h2 className="text-xl font-extrabold text-white mt-2">Biotech Substance Characterization</h2>
          <p className="text-slate-400 text-xs mt-1 max-w-xl">
            Model critical quality attributes (CQAs), glycosylation profiles, isoelectric ranges, and viral clearance directives for complex biological molecules.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Inputs (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/30 border border-slate-900 rounded-2xl p-5 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Biological Parameters</h3>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Therapeutic Modality</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs outline-none text-white focus:border-emerald-500"
              >
                {Object.keys(CAT_DATA).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Cell Culture Host Expression System</label>
              <select
                value={hostSystem}
                onChange={(e) => setHostSystem(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs outline-none text-white focus:border-emerald-500"
              >
                <option value="Chinese Hamster Ovary (CHO) Cells">Chinese Hamster Ovary (CHO) Cells</option>
                <option value="SP2/0 Murine Myeloma Cell line">SP2/0 Murine Myeloma Cell line</option>
                <option value="Escherichia coli (E. coli expression)">Escherichia coli (E. coli expression)</option>
                <option value="Human Embryonic Kidney (HEK293)">Human Embryonic Kidney (HEK293)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Audit Target Health Authority</label>
              <select
                value={authority}
                onChange={(e) => setAuthority(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs outline-none text-white focus:border-emerald-500"
              >
                <option value="FDA (United States)">FDA (United States)</option>
                <option value="EMA (Europe)">EMA (Europe)</option>
                <option value="PMDA (Japan)">PMDA (Japan)</option>
              </select>
            </div>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-900 rounded-xl text-[10px] text-slate-500 leading-relaxed font-sans">
            <span className="font-bold text-slate-400 block mb-0.5">ICH Q6B Guidelines Notice:</span>
            Biological drug substances must be fully characterized for primary, secondary, and higher-order structures to satisfy Module 3 specifications.
          </div>
        </div>

        {/* Right Outputs checklist results (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/30 border border-slate-900 rounded-2xl p-5 space-y-5 flex flex-col justify-between">
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Critical Quality Attributes (CQAs) Model</h3>
              <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                pI Aligned
              </span>
            </div>

            {/* Isoelectric range and Molecular Weight */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className="p-3.5 bg-slate-950 border border-slate-900 rounded-xl">
                <span className="text-[10px] text-slate-500 font-bold block">ISOELECTRIC POINT (pI) RANGE</span>
                <span className="text-xs font-bold text-white font-mono mt-1 block">{activeSub.pIRange}</span>
              </div>
              <div className="p-3.5 bg-slate-950 border border-slate-900 rounded-xl">
                <span className="text-[10px] text-slate-500 font-bold block">THEORETICAL MOLECULAR WEIGHT</span>
                <span className="text-xs font-bold text-white font-mono mt-1 block">{activeSub.molecularWeight}</span>
              </div>
            </div>

            {/* Glycan profiles */}
            <div className="p-4 bg-slate-950 border border-slate-900 rounded-xl">
              <span className="text-[10px] text-slate-400 font-bold uppercase block mb-2">Glycan Micro-Heterogeneity Core CQAs</span>
              <div className="space-y-2">
                {activeSub.glycosylationCQAs.map((glycan, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full shrink-0" />
                    <span>{glycan}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended testing procedures */}
            <div className="p-4 bg-slate-950 border border-slate-900 rounded-xl space-y-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Suggested Module 3 Control Specifications</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] text-slate-300">
                {activeSub.suggestedTests.map((test, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-slate-900/60 p-2 rounded-lg border border-slate-900">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{test}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Regional Viral clearance source control box */}
            <div className="p-4 bg-indigo-950/10 border border-indigo-900/20 rounded-xl flex gap-3 items-start">
              <AlertCircle className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider block">Regional Source Control Directive ({authority})</span>
                <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                  {authority === 'PMDA (Japan)' 
                    ? "Japanese PMDA requires complete bovine/animal origin clearance certificates for any excipient/lactose used. In-process viral clearance validation must use specific localized East Asian viral strains."
                    : authority === 'EMA (Europe)'
                    ? "EMA mandates full characterization of post-translational modifications (PTMs), specifically monitoring immunogenic non-human glycans like Neu5Gc and alpha-gal."
                    : "FDA requires validated viral clearance log reduction checks (e.g. retrovirus, parvovirus) on three pilot scale batches with specific clearance factor ratios."
                  }
                </p>
              </div>
            </div>

          </div>

          <button
            onClick={handleExportDetails}
            className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-white rounded-xl py-3 text-xs font-bold transition-all mt-4 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Export Biologics Module 3 Report
          </button>

        </div>

      </div>

    </div>
  );
}

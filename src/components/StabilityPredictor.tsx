import React, { useState } from 'react';
import { Thermometer, Sun, Calendar, AlertTriangle, CheckCircle, Download, HelpCircle, RefreshCw } from 'lucide-react';

interface CountrySpec {
  zone: string;
  description: string;
  longTerm: string;
  intermediate: string;
  accelerated: string;
  statement: string;
}

const REGION_SPECS: Record<string, CountrySpec> = {
  'USA': {
    zone: 'Zone II (Sub-tropical & Mediterranean)',
    description: 'Mediterranean or sub-tropical climates with mild winters and warm dry summers.',
    longTerm: '25°C ± 2°C / 60% RH ± 5% RH (12 months minimum)',
    intermediate: '30°C ± 2°C / 65% RH ± 5% RH (6 months)',
    accelerated: '40°C ± 2°C / 75% RH ± 5% RH (6 months)',
    statement: 'Store at 20°C to 25°C (68°F to 77°F); excursions permitted.'
  },
  'Europe (UK/Germany)': {
    zone: 'Zone I / II (Temperate / Sub-tropical)',
    description: 'Temperate or Mediterranean climate. High relative humidity peaks.',
    longTerm: '25°C ± 2°C / 60% RH ± 5% RH (12 months)',
    intermediate: '30°C ± 2°C / 65% RH ± 5% RH (6 months)',
    accelerated: '40°C ± 2°C / 75% RH ± 5% RH (6 months)',
    statement: 'Store below 25°C. Keep container tightly closed.'
  },
  'Japan': {
    zone: 'Zone II (Sub-tropical)',
    description: 'Sub-tropical climate. Highly monitored PMDA humidity fluctuations.',
    longTerm: '25°C ± 2°C / 60% RH ± 5% RH (12 months)',
    intermediate: '30°C ± 2°C / 65% RH ± 5% RH (6 months)',
    accelerated: '40°C ± 2°C / 75% RH ± 5% RH (6 months)',
    statement: 'Store in a tight container at room temperature.'
  },
  'India': {
    zone: 'Zone IVb (Hot & Humid, Tropical)',
    description: 'Hot, very humid tropical climates. Highly demanding regulatory stability tests.',
    longTerm: '30°C ± 2°C / 75% RH ± 5% RH (12 months)',
    intermediate: 'N/A (Long term encompasses intermediate conditions)',
    accelerated: '40°C ± 2°C / 75% RH ± 5% RH (6 months)',
    statement: 'Do not store above 30°C. Protect from light and moisture.'
  },
  'Brazil': {
    zone: 'Zone IVb (Hot & Humid)',
    description: 'Tropical wet/dry climate with prolonged humidity periods.',
    longTerm: '30°C ± 2°C / 75% RH ± 5% RH (12 months)',
    intermediate: 'N/A',
    accelerated: '40°C ± 2°C / 75% RH ± 5% RH (6 months)',
    statement: 'Conservar em temperatura ambiente (15°C a 30°C). Proteger da umidade.'
  }
};

interface StabilityPredictorProps {
  triggerNotification: (message: string, type: 'success' | 'info' | 'error') => void;
}

export default function StabilityPredictor({ triggerNotification }: StabilityPredictorProps) {
  const [selectedRegion, setSelectedRegion] = useState('India');
  const [packagingType, setPackagingType] = useState('PVC/Alu Blisters (Semi-permeable)');
  const [refrigerated, setRefrigerated] = useState('Room Temperature (Controlled)');
  const [photostabilityTested, setPhotostabilityTested] = useState(true);

  const spec = REGION_SPECS[selectedRegion] || REGION_SPECS['USA'];

  const handleDownloadSpec = () => {
    const md = `# ICH Q1A(R2) & Q1B Stability Specification Checklist

## Core Properties
- **Target Region/Country**: ${selectedRegion}
- **Climatic Zone**: ${spec.zone}
- **Packaging Container System**: ${packagingType}
- **Storage Temperature Profile**: ${refrigerated}

## Mandated Stability Testing Parameters
- **Long Term Testing**: ${refrigerated === 'Room Temperature (Controlled)' ? spec.longTerm : '5°C ± 3°C (12 months)'}
- **Intermediate Testing**: ${refrigerated === 'Room Temperature (Controlled)' ? spec.intermediate : 'N/A'}
- **Accelerated Testing**: ${refrigerated === 'Room Temperature (Controlled)' ? spec.accelerated : '25°C ± 2°C / 60% RH ± 5% RH (6 months)'}

## Photostability Requirements (ICH Q1B)
- **Status**: ${photostabilityTested ? 'Mandatory Testing Required' : 'Not required based on opaque secondary carton'}
- **Exposure Limits**: Minimum 1.2 million lux hours and not less than 200 watt hours/square meter UV exposure

## Draft Module 1 Labeling Statement
- **Storage Condition Text**: "${spec.statement}"
`;

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${selectedRegion.replace(/\s+/g, '_')}_stability_specs.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerNotification("Stability specifications exported successfully!", "success");
  };

  return (
    <div className="space-y-6" id="stability-predictor">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Thermometer className="w-40 h-40 text-emerald-500" />
        </div>
        <div className="relative z-10">
          <span className="text-[10px] font-mono tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full font-bold uppercase">
            ICH Q1A & Q1B Calculator
          </span>
          <h2 className="text-xl font-extrabold text-white mt-2">Climatic Stability Predictor</h2>
          <p className="text-slate-400 text-xs mt-1 max-w-xl">
            Input geographical targets and drug packaging details to predict mandatory temperature, humidity, and photostability standards.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Inputs (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/30 border border-slate-900 rounded-2xl p-5 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Stability Input Parameters</h3>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Target Country/Region</label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs outline-none text-white focus:border-emerald-500"
              >
                {Object.keys(REGION_SPECS).map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Container Closure System (Packaging)</label>
              <select
                value={packagingType}
                onChange={(e) => setPackagingType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs outline-none text-white focus:border-emerald-500"
              >
                <option value="PVC/Alu Blisters (Semi-permeable)">PVC/Alu Blisters (Semi-permeable)</option>
                <option value="Glass Vials (Impermeable)">Glass Vials (Impermeable)</option>
                <option value="High Density Polyethylene Bottles (HDPE)">High Density Polyethylene Bottles (HDPE)</option>
                <option value="LDPE Ampoules (Aqueous formulation)">LDPE Ampoules (Aqueous formulation)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Storage Class Profile</label>
              <select
                value={refrigerated}
                onChange={(e) => setRefrigerated(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs outline-none text-white focus:border-emerald-500"
              >
                <option value="Room Temperature (Controlled)">Room Temperature (Controlled)</option>
                <option value="Refrigerated (5°C ± 3°C)">Refrigerated (5°C ± 3°C)</option>
                <option value="Frozen (-20°C ± 5°C)">Frozen (-20°C ± 5°C)</option>
              </select>
            </div>

            <div className="flex items-center gap-3 bg-slate-950/40 p-3 rounded-xl border border-slate-900">
              <input
                type="checkbox"
                id="photostab"
                checked={photostabilityTested}
                onChange={(e) => setPhotostabilityTested(e.target.checked)}
                className="w-4 h-4 rounded border-slate-800 text-emerald-600 focus:ring-emerald-500 bg-slate-900 cursor-pointer"
              />
              <label htmlFor="photostab" className="text-[11px] font-medium text-slate-300 cursor-pointer select-none">
                Direct exposure to light expected? (ICH Q1B Photostability)
              </label>
            </div>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-900 rounded-xl text-[10px] text-slate-500 leading-relaxed font-sans">
            <span className="font-bold text-slate-400 block mb-0.5">ICH Q1A Guidance Note:</span>
            A minimum of three primary batches of the drug substance/drug product is required to satisfy eCTD Module 3 stability submission streams.
          </div>
        </div>

        {/* Right Output checklist results (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/30 border border-slate-900 rounded-2xl p-5 space-y-5 flex flex-col">
          
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Mandated Stability Testing Specifications</h3>
            <span className="inline-flex px-2 py-0.5 rounded text-[9px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase">
              {spec.zone.split(' (')[0]}
            </span>
          </div>

          <div className="space-y-4">
            
            {/* Zone detail */}
            <div className="p-4 bg-slate-950 border border-slate-900 rounded-xl flex gap-3.5 items-start">
              <Calendar className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-white">{spec.zone}</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">{spec.description}</p>
              </div>
            </div>

            {/* Speclist Table */}
            <div className="space-y-2.5">
              
              <div className="p-3.5 bg-slate-950/60 border border-slate-900 rounded-xl flex justify-between items-center text-xs">
                <div>
                  <span className="text-[9px] font-bold uppercase text-slate-500 block">LONG TERM TESTING SPECIFICATION</span>
                  <span className="font-semibold text-white font-mono mt-0.5 block">
                    {refrigerated === 'Room Temperature (Controlled)' ? spec.longTerm : '5°C ± 3°C (12 months minimum)'}
                  </span>
                </div>
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
              </div>

              <div className="p-3.5 bg-slate-950/60 border border-slate-900 rounded-xl flex justify-between items-center text-xs">
                <div>
                  <span className="text-[9px] font-bold uppercase text-slate-500 block">INTERMEDIATE TESTING SPECIFICATION</span>
                  <span className="font-semibold text-white font-mono mt-0.5 block">
                    {refrigerated === 'Room Temperature (Controlled)' ? spec.intermediate : 'N/A'}
                  </span>
                </div>
                {spec.intermediate !== 'N/A' ? (
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : (
                  <span className="text-[9px] bg-slate-900 text-slate-500 px-1.5 py-0.5 rounded font-mono">Not Required</span>
                )}
              </div>

              <div className="p-3.5 bg-slate-950/60 border border-slate-900 rounded-xl flex justify-between items-center text-xs">
                <div>
                  <span className="text-[9px] font-bold uppercase text-slate-500 block">ACCELERATED TESTING SPECIFICATION</span>
                  <span className="font-semibold text-white font-mono mt-0.5 block">
                    {refrigerated === 'Room Temperature (Controlled)' ? spec.accelerated : '25°C ± 2°C / 60% RH ± 5% RH (6 months)'}
                  </span>
                </div>
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
              </div>

              {/* Photostability block */}
              {photostabilityTested && (
                <div className="p-3.5 bg-indigo-950/10 border border-indigo-900/30 rounded-xl flex gap-3.5 items-start text-xs">
                  <Sun className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[9px] font-bold uppercase text-indigo-400 block">ICH Q1B Photostability requirements</span>
                    <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                      Must demonstrate that light exposure does not result in unacceptable change. Minimum exposure of <strong className="text-white font-bold font-mono">1.2 million lux hours</strong> and <strong className="text-white font-bold font-mono">200 watt hours/square meter</strong>.
                    </p>
                  </div>
                </div>
              )}

              {/* Statement block */}
              <div className="p-3.5 bg-slate-950/60 border border-slate-900 rounded-xl text-xs">
                <span className="text-[9px] font-bold uppercase text-slate-500 block">Module 1.3 Draft Storage Labeling Statement</span>
                <p className="text-emerald-400 font-bold font-mono text-xs mt-1">
                  "{spec.statement}"
                </p>
              </div>

            </div>

            <button
              onClick={handleDownloadSpec}
              className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-white rounded-xl py-3 text-xs font-bold transition-all shadow flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Export Stability Spec Checklist (.md)
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

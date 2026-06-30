import React, { useState } from 'react';
import { FileUp, ScanLine, Sparkles, AlertCircle, FileText, CheckCircle2, Cpu, HelpCircle } from 'lucide-react';

interface IngestOcrStationProps {
  onAddCustomSection: (sectionCode: string, title: string, content: string, gaps: any[]) => void;
  triggerNotification: (message: string, type: 'success' | 'info' | 'error') => void;
}

export default function IngestOcrStation({
  onAddCustomSection,
  triggerNotification,
}: IngestOcrStationProps) {
  const [dragActive, setDragActive] = useState(false);
  const [rawText, setRawText] = useState(`### Section 3.2.S.2.6 Manufacturing Process Development (Draft)

The manufacturing process for the Active Substance, AlignedCompound-Alpha, has been optimized at the pilot scale.
During manufacture, in-process testing is performed to guarantee quality.
Water content is evaluated using standard Karl Fischer techniques adhering to United Kingdom pharmacopoeial monographs (BP).`);
  const [sectionCodeInput, setSectionCodeInput] = useState('3.2.S.2.6');
  const [titleInput, setTitleInput] = useState('Manufacturing Process Development');
  const [isScanning, setIsScanning] = useState(false);
  const [scanLogs, setScanLogs] = useState<string[]>([]);
  const [extractedData, setExtractedData] = useState<{
    language: string;
    spellings: string;
    activeIngredients: string[];
    pharmacopoeia: string[];
    wordCount: number;
  } | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      simulateOcrFile(file.name);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      simulateOcrFile(e.target.files[0].name);
    }
  };

  const simulateOcrFile = (fileName: string) => {
    setIsScanning(true);
    setScanLogs([]);
    setExtractedData(null);
    triggerNotification(`Scanning uploaded dossier file: ${fileName}`, 'info');

    const logs = [
      `Establishing file buffer stream for: ${fileName}`,
      `OCR Model reading pixels & lines... (Optical character extraction active)`,
      `Analyzing vocabulary: Checking spelling standards...`,
      `Detecting chemical descriptors and active pharmacopoeial standards...`,
      `Mapping XML eCTD tags matching v4.0 schema standards...`,
      `Dossier text extraction successful! Preparing report.`
    ];

    let currentLogIdx = 0;
    const interval = setInterval(() => {
      if (currentLogIdx < logs.length) {
        setScanLogs(prev => [...prev, logs[currentLogIdx]]);
        currentLogIdx++;
      } else {
        clearInterval(interval);
        setIsScanning(false);
        setRawText(`### Section 3.2.S.2.6 Manufacturing Process Development (OCR Scanned)

The manufacturing process for the Active Substance, AlignedCompound-Alpha, has been optimized at the pilot plant scale.
During manufacture, in-process testing is performed to guarantee quality.
1. The purity of intermediates is measured using high performance liquid chromatography (HPLC).
2. Water content is evaluated using standard Karl Fischer techniques adhering to United Kingdom pharmacopoeial monographs (BP).
3. Heavy metals test are conducted following standard European Pharmacopoeia (Ph. Eur. 2.4.8) procedures.

*Review Note: This document has British English spellings (purity, high performance, European Pharmacopoeia).*`);
        setExtractedData({
          language: "English",
          spellings: "British (UK English)",
          activeIngredients: ["AlignedCompound-Alpha"],
          pharmacopoeia: ["BP (British)", "Ph. Eur. (European)"],
          wordCount: 110,
        });
        triggerNotification(`OCR successfully scanned and structured: ${fileName}`, 'success');
      }
    }, 800);
  };

  const handleTriggerOcrText = () => {
    if (!rawText.trim()) return;
    setIsScanning(true);
    setScanLogs([]);
    setExtractedData(null);

    const logs = [
      "Analyzing manually pasted text stream...",
      "OCR parser assessing language dictionary matrices...",
      "Extracting active substance references...",
      "Cross-referencing pharmacopoeia terms: Checking USP/Ph. Eur/JP standards...",
      "Indexing characters completed."
    ];

    let idx = 0;
    const interval = setInterval(() => {
      if (idx < logs.length) {
        setScanLogs(prev => [...prev, logs[idx]]);
        idx++;
      } else {
        clearInterval(interval);
        setIsScanning(false);
        
        // Detect some keywords
        const text = rawText.toLowerCase();
        const hasBP = text.includes('bp') || text.includes('british');
        const hasPhEur = text.includes('ph. eur') || text.includes('european');
        const hasJP = text.includes('jp') || text.includes('japanese');
        const hasUSP = text.includes('usp') || text.includes('united states');
        
        const foundPharma: string[] = [];
        if (hasBP) foundPharma.push("BP");
        if (hasPhEur) foundPharma.push("Ph. Eur.");
        if (hasJP) foundPharma.push("JP");
        if (hasUSP) foundPharma.push("USP");
        if (foundPharma.length === 0) foundPharma.push("None identified");

        const isBritish = text.includes('colour') || text.includes('haematological') || text.includes('diarrhoea') || text.includes('programme');

        setExtractedData({
          language: "English",
          spellings: isBritish ? "British (UK English)" : "American (US English)",
          activeIngredients: ["Alpha-Isomer / Custom Drug Substance"],
          pharmacopoeia: foundPharma,
          wordCount: rawText.split(/\s+/).filter(Boolean).length,
        });
        triggerNotification("Text stream fully ingested & parsed!", "success");
      }
    }, 600);
  };

  const handleCommitSection = () => {
    if (!rawText.trim()) return;

    // Build automated gap analysis for newly ingested content
    const gaps = [
      {
        id: `gap-ocr-${Date.now()}`,
        severity: 'warning',
        category: 'Terminology',
        section: sectionCodeInput,
        title: 'Spelling validation check',
        description: `This parsed document contains ${extractedData?.spellings || 'custom spellings'}. If submitting to US FDA, this should be standardized to US format.`,
        guidelineCitation: 'FDA Labeling Style Manual',
        suggestion: 'Run the AI Harmonizer to convert spellings.',
        status: 'pending'
      }
    ];

    onAddCustomSection(sectionCodeInput, titleInput, rawText, gaps);
    triggerNotification(`Added new section ${sectionCodeInput} to the active dossier Tree Navigator!`, 'success');
  };

  return (
    <div className="space-y-3" id="ingest-ocr-station">
      {/* Header - Compact */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex justify-between items-center relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <ScanLine className="w-20 h-20 text-emerald-500 animate-pulse" />
        </div>
        <div className="relative z-10 flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl">
            <ScanLine className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white">Ingest & OCR Document Analyzer</h2>
              <span className="text-[8px] font-mono tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.2 rounded font-bold uppercase">
                Document Ingress Station
              </span>
            </div>
            <p className="text-slate-400 text-[10px] mt-0.5">
              Simulate optical character scanning of raw regulatory files, auto-detect compliance parameters, and parse dossier chapters.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Left column: Drag drop & past text input */}
        <div className="space-y-3">
          
          <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-4 space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Step 1: Upload Raw Document</h3>
            
            {/* Drag drop zone */}
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`p-4 border-2 border-dashed rounded-xl text-center transition-all relative ${
                dragActive 
                  ? 'border-emerald-500 bg-emerald-950/10' 
                  : 'border-slate-800 hover:border-slate-700 bg-slate-950/30'
              }`}
            >
              <FileUp className="w-6 h-6 text-emerald-500 mx-auto mb-2 animate-bounce" />
              <p className="text-xs font-bold text-slate-200">Drag & Drop Dossier File Here</p>
              <p className="text-[9px] text-slate-500 mt-0.5 font-sans">Supports Markdown (.md), Plain Text (.txt), or chemical spec sheets</p>
              
              <div className="mt-2.5">
                <label className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl px-3 py-1.5 text-[10px] font-bold transition-all cursor-pointer">
                  Select File From Disk
                  <input
                     type="file"
                     accept=".md,.txt,.json"
                     onChange={handleFileChange}
                     className="hidden"
                   />
                </label>
              </div>
            </div>
 
            <div className="text-center text-[10px] text-slate-500 font-mono">
              — OR PASTE TEXT DIRECTLY BELOW —
            </div>
 
            {/* Paste box */}
            <div className="space-y-2">
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Paste raw drug substance/drug product dossier text here..."
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs outline-none focus:border-emerald-500 font-mono text-slate-300"
              />
              <button
                id="ocr-scan-button"
                onClick={handleTriggerOcrText}
                disabled={!rawText.trim() || isScanning}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl py-2 text-xs font-bold transition-all border border-slate-800 hover:border-slate-700 cursor-pointer disabled:opacity-50"
              >
                Scan Text Stream with OCR
              </button>
            </div>
          </div>

          {/* OCR Engine Terminal Logs */}
          {isScanning && (
            <div className="p-4 bg-slate-950 border border-slate-900 rounded-xl font-mono text-[10px] text-slate-400 space-y-1.5 animate-pulse">
              <div className="flex justify-between border-b border-slate-900 pb-1.5">
                <span className="text-emerald-500 font-bold">▶ OCR CONSOLE SYSTEM</span>
                <span>Active</span>
              </div>
              {scanLogs.map((log, idx) => (
                <div key={idx} className="flex gap-2">
                  <span className="text-slate-600">[{idx+1}]</span>
                  <span>{log}</span>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Right column: OCR Analysis results & save node */}
        <div className="space-y-3">
          {extractedData ? (
            <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-4 space-y-3.5 animate-fade-in">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Step 2: AI Structural Extraction Results</h3>
                <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-500/20">
                  <Cpu className="w-3 h-3" /> Extracted
                </span>
              </div>

              {/* Extraction Parameters Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-2.5 bg-slate-950 border border-slate-900 rounded-xl">
                  <span className="text-[9px] text-slate-500 font-bold block">DETECTED LANGUAGE</span>
                  <span className="text-xs font-semibold text-white font-mono">{extractedData.language}</span>
                </div>
                <div className="p-2.5 bg-slate-950 border border-slate-900 rounded-xl">
                  <span className="text-[9px] text-slate-500 font-bold block">SPELLING STYLE STANDARD</span>
                  <span className="text-xs font-semibold text-white font-mono">{extractedData.spellings}</span>
                </div>
                <div className="p-2.5 bg-slate-950 border border-slate-900 rounded-xl">
                  <span className="text-[9px] text-slate-500 font-bold block">ACTIVE INGREDIENTS FOUND</span>
                  <span className="text-xs font-semibold text-white font-mono">{extractedData.activeIngredients.join(', ')}</span>
                </div>
                <div className="p-2.5 bg-slate-950 border border-slate-900 rounded-xl">
                  <span className="text-[9px] text-slate-500 font-bold block">PHARMACOPOEIAL STANDARDS</span>
                  <span className="text-xs font-semibold text-white font-mono">{extractedData.pharmacopoeia.join(', ') || 'None found'}</span>
                </div>
              </div>

              {/* File Destination & Save configuration */}
              <div className="border-t border-slate-800/80 pt-3 space-y-2.5">
                <h4 className="text-xs font-bold text-slate-300">Save to eCTD Tree Navigator</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">eCTD Section Code</label>
                    <input
                      type="text"
                      value={sectionCodeInput}
                      onChange={(e) => setSectionCodeInput(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs outline-none text-white focus:border-emerald-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Dossier Section Title</label>
                    <input
                      type="text"
                      value={titleInput}
                      onChange={(e) => setTitleInput(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs outline-none text-white focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="p-2 bg-amber-500/10 text-amber-400 border border-amber-500/15 rounded-xl text-[9px] flex items-start gap-1.5 leading-relaxed">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-200">Pre-alignment Notice:</span> Saving this document will automatically launch an background regulatory gap-analysis and index it within the Dossier Explorer Navigator tree.
                  </div>
                </div>

                <button
                  id="ocr-submit-button"
                  onClick={handleCommitSection}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-2 text-xs font-bold transition-all shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Save Scanned Node into Dossier Navigator
                </button>
              </div>

            </div>
          ) : (
            <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-6 text-center flex flex-col items-center justify-center h-full min-h-[220px]">
              <Cpu className="w-8 h-8 text-slate-600 mb-3 animate-pulse" />
              <h4 className="text-sm font-bold text-slate-300">Engine Output Awaiting Stream</h4>
              <p className="text-xs text-slate-500 max-w-xs mt-1 leading-relaxed font-sans">
                Drag a markdown eCTD segment or paste drug specifications into the OCR Input box to trigger multi-regional text categorization.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}

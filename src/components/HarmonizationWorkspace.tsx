import React, { useState, useEffect } from 'react';
import { DossierSection, RegulatoryAuthority, HarmonizationResult } from '../types';
import { REGULATORY_BODIES } from '../data';
import { renderMarkdownToHTML } from '../utils';
import DiffViewer from './DiffViewer';
import { 
  Play, 
  RefreshCw, 
  Copy, 
  Download, 
  Check, 
  FileText, 
  ArrowRight, 
  Layers, 
  Cpu, 
  AlertCircle, 
  Table, 
  BookOpen, 
  Sparkles,
  ClipboardCheck,
  FileEdit,
  Save,
  X,
  History
} from 'lucide-react';

interface HarmonizationWorkspaceProps {
  section: DossierSection;
  sourceAuthority: RegulatoryAuthority;
  targetAuthority: RegulatoryAuthority;
  onHarmonize: () => void;
  isHarmonizing: boolean;
  harmonizationResult: HarmonizationResult | null;
  onApplyManualEdits: (editedContent: string) => void;
  onTriggerNotification?: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

const LOADING_STEPS = [
  'Decoding eCTD section markers...',
  'Analyzing target health authority requirements...',
  'Checking USP vs JP/Ph. Eur. pharmacopoeial chapters...',
  'Scanning for local terminology and packaging anomalies...',
  'Translating climate-dependent stability parameters...',
  'Applying spelling translation and nomenclature changes...',
  'Generating finalized, high-fidelity aligned dossier text...',
];

export default function HarmonizationWorkspace({
  section,
  sourceAuthority,
  targetAuthority,
  onHarmonize,
  isHarmonizing,
  harmonizationResult,
  onApplyManualEdits,
  onTriggerNotification,
}: HarmonizationWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<'compare' | 'diff' | 'changelog' | 'references'>('compare');
  const [loadingStepIdx, setLoadingStepIdx] = useState(0);
  const [copiedOriginal, setCopiedOriginal] = useState(false);
  const [copiedTarget, setCopiedTarget] = useState(false);
  const [showDiff, setShowDiff] = useState(true);

  // Manual Editing and Auto-Save States
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState('');
  const [hasDraft, setHasDraft] = useState(false);
  const [draftContent, setDraftContent] = useState('');
  const [draftTime, setDraftTime] = useState('');
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Key for local storage persistence
  const autoSaveKey = `ectd_draft_${section.id}_${targetAuthority}`;
  const hasResult = harmonizationResult && harmonizationResult.sectionId === section.id && harmonizationResult.targetAuthority === targetAuthority;
  const currentOriginalText = section.content;
  const currentHarmonizedText = hasResult ? harmonizationResult.harmonizedContent : '';

  // Check for auto-saved drafts and reset edit state when section/target changes
  useEffect(() => {
    const saved = localStorage.getItem(autoSaveKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const currentContent = hasResult ? currentHarmonizedText : currentOriginalText;
        if (parsed && parsed.content && parsed.content !== currentContent) {
          setHasDraft(true);
          setDraftContent(parsed.content);
          setDraftTime(new Date(parsed.timestamp).toLocaleTimeString());
        } else {
          setHasDraft(false);
        }
      } catch (e) {
        setHasDraft(false);
      }
    } else {
      setHasDraft(false);
    }
    setIsEditing(false);
    setHasUnsavedChanges(false);
    setShowCancelConfirm(false);
  }, [section.id, targetAuthority, currentHarmonizedText, currentOriginalText, hasResult]);

  // Periodic autosave running every 5 seconds if there are unsaved edits
  useEffect(() => {
    if (!isEditing || !hasUnsavedChanges) return;

    const interval = setInterval(() => {
      const draftData = {
        content: editedText,
        timestamp: Date.now()
      };
      localStorage.setItem(autoSaveKey, JSON.stringify(draftData));
      const now = new Date();
      setLastSavedTime(now.toLocaleTimeString());
      setHasUnsavedChanges(false);
    }, 5000);

    return () => clearInterval(interval);
  }, [isEditing, editedText, hasUnsavedChanges, autoSaveKey]);

  // Edit action triggers
  const handleStartEditing = () => {
    const baseText = hasResult ? currentHarmonizedText : currentOriginalText;
    setEditedText(baseText);
    setIsEditing(true);
    setHasUnsavedChanges(false);
    setLastSavedTime(null);
  };

  const handleRestoreDraft = () => {
    setEditedText(draftContent);
    setIsEditing(true);
    setHasDraft(false);
    setHasUnsavedChanges(true);
    if (onTriggerNotification) {
      onTriggerNotification('Recovered manual draft restored in editor.', 'success');
    }
  };

  const handleDiscardDraft = () => {
    localStorage.removeItem(autoSaveKey);
    setHasDraft(false);
    if (onTriggerNotification) {
      onTriggerNotification('Manual draft discarded.', 'info');
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedText(e.target.value);
    setHasUnsavedChanges(true);
  };

  const handleSaveEdits = () => {
    onApplyManualEdits(editedText);
    localStorage.removeItem(autoSaveKey);
    setIsEditing(false);
    setHasUnsavedChanges(false);
    setLastSavedTime(null);
  };

  const handleCancelEdits = () => {
    if (hasUnsavedChanges) {
      setShowCancelConfirm(true);
    } else {
      localStorage.removeItem(autoSaveKey);
      setIsEditing(false);
      setHasUnsavedChanges(false);
      setLastSavedTime(null);
    }
  };

  // Rotate loading messages when harmonizing
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isHarmonizing) {
      setLoadingStepIdx(0);
      interval = setInterval(() => {
        setLoadingStepIdx(prev => (prev + 1) % LOADING_STEPS.length);
      }, 2200);
    }
    return () => clearInterval(interval);
  }, [isHarmonizing]);

  const handleCopy = (text: string, isTarget: boolean) => {
    navigator.clipboard.writeText(text);
    if (isTarget) {
      setCopiedTarget(true);
      setTimeout(() => setCopiedTarget(false), 2000);
    } else {
      setCopiedOriginal(true);
      setTimeout(() => setCopiedOriginal(false), 2000);
    }
  };

  const handleDownload = (filename: string, text: string) => {
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderDiffContent = (original: string, harmonized: string) => {
    if (!showDiff) {
      return (
        <div 
          className="prose prose-invert max-w-none text-xs text-slate-300 font-sans leading-relaxed" 
          dangerouslySetInnerHTML={{ __html: renderMarkdownToHTML(harmonized) }} 
        />
      );
    }

    // Advanced dynamic term highlighting logic
    let html = renderMarkdownToHTML(harmonized);

    // Apply colored highlights of translated vocabulary
    if (targetAuthority === 'FDA') {
      html = html
        .replace(/(Drug Substance)/g, '<span class="bg-teal-500/15 text-teal-300 border border-teal-500/20 px-1 py-0.25 rounded font-semibold">$1</span>')
        .replace(/(Drug Product)/g, '<span class="bg-teal-500/15 text-teal-300 border border-teal-500/20 px-1 py-0.25 rounded font-semibold">$1</span>')
        .replace(/(US Prescribing Information|USPI)/g, '<span class="bg-emerald-500/15 text-emerald-300 border border-emerald-500/20 px-1 py-0.25 rounded font-semibold">$1</span>')
        .replace(/(Adverse Reactions)/g, '<span class="bg-amber-500/15 text-amber-300 border border-amber-500/20 px-1 py-0.25 rounded font-semibold">$1</span>')
        .replace(/(Highlights of Prescribing Information)/g, '<span class="bg-indigo-500/15 text-indigo-300 border border-indigo-500/20 px-1 py-0.25 rounded font-semibold">$1</span>');
    } else if (targetAuthority === 'PMDA') {
      html = html
        .replace(/(Japanese Pharmacopoeia|JP)/gi, '<span class="bg-rose-500/15 text-rose-300 border border-rose-500/20 px-1 py-0.25 rounded font-semibold">$1</span>')
        .replace(/(JP 2\.44|JP 1\.07)/g, '<span class="bg-amber-500/15 text-amber-300 border border-amber-500/20 px-1 py-0.25 rounded font-semibold">$1</span>')
        .replace(/(BSE\/TSE Certified)/g, '<span class="bg-emerald-500/15 text-emerald-300 border border-emerald-500/20 px-1 py-0.25 rounded font-semibold">$1</span>');
    }

    return <div className="prose prose-invert max-w-none text-xs text-slate-300 font-sans leading-relaxed" dangerouslySetInnerHTML={{ __html: html }} />;
  };

  return (
    <div className="bg-slate-950/60 border border-slate-900 rounded-3xl shadow-xl overflow-hidden flex flex-col h-full backdrop-blur-md" id="harmonization-workspace">
      {/* Tab bar header */}
      <div className="px-6 py-4 border-b border-slate-900/60 bg-slate-950/40 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-2.5">
          <Layers className="w-5 h-5 text-slate-400" />
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono text-xs font-bold bg-slate-900 text-slate-300 px-1.5 py-0.5 rounded border border-slate-800">
                Section {section.sectionCode}
              </span>
              <h2 className="text-base font-extrabold text-slate-100 tracking-tight">{section.title}</h2>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 font-mono">Harmonizing structure: {sourceAuthority} Standard → {targetAuthority} Standard</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {hasResult && (
            <div className="flex rounded-xl border border-slate-900 bg-slate-950 p-1 text-xs">
              <button
                id="tab-compare"
                onClick={() => setActiveTab('compare')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all duration-150 cursor-pointer ${
                  activeTab === 'compare' 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 shadow-lg shadow-emerald-500/5' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Comparative Workspace
              </button>
              <button
                id="tab-diff"
                onClick={() => setActiveTab('diff')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all duration-150 cursor-pointer ${
                  activeTab === 'diff' 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 shadow-lg shadow-emerald-500/5' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                View Diff
              </button>
              <button
                id="tab-changelog"
                onClick={() => setActiveTab('changelog')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all duration-150 cursor-pointer ${
                  activeTab === 'changelog' 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 shadow-lg shadow-emerald-500/5' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                AI Changelog ({harmonizationResult?.changeLog.length})
              </button>
              <button
                id="tab-citations"
                onClick={() => setActiveTab('references')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all duration-150 cursor-pointer ${
                  activeTab === 'references' 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 shadow-lg shadow-emerald-500/5' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Citations
              </button>
            </div>
          )}

          <button
            onClick={onHarmonize}
            disabled={isHarmonizing}
            className="harmonize-trigger-btn inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/15 hover:shadow-lg transition-all duration-150 cursor-pointer disabled:opacity-50"
          >
            <Cpu className="w-4 h-4 animate-spin-slow" />
            {hasResult ? 'Re-harmonize Section' : 'Run AI Harmonizer'}
          </button>
        </div>
      </div>

      {/* Workspace Area */}
      <div className="flex-1 p-6 relative bg-slate-950/20 max-h-[500px] md:max-h-none overflow-y-auto scrollbar-thin">
        {isHarmonizing ? (
          /* Immersive futuristic loader */
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-8 z-30 select-none">
            <div className="relative mb-6">
              <div className="w-20 h-20 rounded-full border-4 border-slate-900 border-t-emerald-500 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Cpu className="w-8 h-8 text-emerald-400 animate-pulse" />
              </div>
            </div>
            
            <h4 className="text-base font-extrabold text-slate-100 tracking-tight">Applying Global Harmonization Rules</h4>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono mt-1 w-full max-w-[320px] justify-center text-center">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
              <span>{LOADING_STEPS[loadingStepIdx]}</span>
            </div>

            {/* Simulated mini progress bar */}
            <div className="w-64 bg-slate-900 border border-slate-800 rounded-full h-1 mt-6 overflow-hidden">
              <div 
                className="bg-emerald-500 h-1 rounded-full animate-progress"
                style={{ width: '100%' }}
              />
            </div>
          </div>
        ) : null}

        {/* Dynamic workspace tab render */}
        {activeTab === 'compare' ? (
          <div className="flex flex-col gap-4 h-full">
            {/* Draft Recovery Alert Banner */}
            {hasDraft && !isEditing && (
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm select-none" id="draft-recovery-alert">
                <div className="flex gap-3">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                    <History className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-amber-400 uppercase tracking-wider">Unsaved Manual Draft Recovered</h5>
                    <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                      An unsaved backup from <strong className="text-slate-100">{draftTime}</strong> was found in local storage with manual adjustments.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-stretch sm:self-auto shrink-0 font-bold text-xs">
                  <button
                    onClick={handleRestoreDraft}
                    className="flex-grow sm:flex-grow-0 px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl shadow-sm transition-all cursor-pointer text-center"
                  >
                    Restore Draft
                  </button>
                  <button
                    onClick={handleDiscardDraft}
                    className="flex-grow sm:flex-grow-0 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl transition-all cursor-pointer text-center"
                  >
                    Discard
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
              {/* Left Panel: Source */}
              <div className="flex flex-col bg-slate-950/40 rounded-3xl border border-slate-900 shadow-xl overflow-hidden min-h-full">
                <div className="px-4 py-3 border-b border-slate-900/60 bg-slate-950/60 flex justify-between items-center shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{REGULATORY_BODIES[sourceAuthority]?.icon}</span>
                    <span className="text-xs font-bold text-slate-200">Source: {sourceAuthority} Framework</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleCopy(currentOriginalText, false)}
                      className="p-1.5 rounded-lg hover:bg-slate-900 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer border border-transparent hover:border-slate-850"
                      title="Copy Source"
                    >
                      {copiedOriginal ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => handleDownload(`${section.id}_original.md`, currentOriginalText)}
                      className="p-1.5 rounded-lg hover:bg-slate-900 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer border border-transparent hover:border-slate-850"
                      title="Export Source"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="p-5 flex-1 overflow-y-auto max-h-[380px] select-text scrollbar-thin">
                  <div 
                    className="prose prose-invert max-w-none text-xs text-slate-300 font-sans leading-relaxed" 
                    dangerouslySetInnerHTML={{ __html: renderMarkdownToHTML(currentOriginalText) }} 
                  />
                </div>
              </div>

              {/* Right Panel: Aligned / Target Target */}
              <div className="flex flex-col bg-slate-950/40 rounded-3xl border border-slate-900 shadow-xl overflow-hidden min-h-full">
                <div className="px-4 py-3 border-b border-slate-900/60 bg-slate-950/60 flex justify-between items-center shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{REGULATORY_BODIES[targetAuthority]?.icon}</span>
                    <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      Target: {targetAuthority} Standard
                      {hasResult && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.25 rounded-full text-[9px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                          <Sparkles className="w-2.5 h-2.5" /> AI Aligned
                        </span>
                      )}
                    </span>
                  </div>

                  {hasResult && !isEditing && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setShowDiff(!showDiff)}
                        className={`px-2 py-1 rounded text-[10px] font-extrabold transition-colors cursor-pointer ${
                          showDiff ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25' : 'bg-slate-900 text-slate-400 border border-slate-800'
                        }`}
                      >
                        Term Highlights: {showDiff ? 'ON' : 'OFF'}
                      </button>
                      <button
                        onClick={handleStartEditing}
                        className="p-1.5 rounded-lg hover:bg-slate-900 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer flex items-center gap-1 border border-transparent hover:border-slate-850"
                        title="Manually Adjust Text"
                      >
                        <FileEdit className="w-3.5 h-3.5 text-slate-400 hover:text-emerald-400" />
                        <span className="text-[10px] font-extrabold text-slate-400 hover:text-slate-200">Edit</span>
                      </button>
                      <button
                        onClick={() => handleCopy(currentHarmonizedText, true)}
                        className="p-1.5 rounded-lg hover:bg-slate-900 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer border border-transparent hover:border-slate-850"
                        title="Copy Harmonized Content"
                      >
                        {copiedTarget ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => handleDownload(`${section.id}_aligned_${targetAuthority}.md`, currentHarmonizedText)}
                        className="p-1.5 rounded-lg hover:bg-slate-900 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer border border-transparent hover:border-slate-850"
                        title="Export Harmonized File"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {isEditing ? (
                  <div className="p-4 flex-1 flex flex-col min-h-full bg-slate-950/40">
                    {/* Header/Save Info inside the edit area */}
                    <div className="flex items-center justify-between bg-slate-950 text-white px-4 py-2.5 rounded-xl mb-3 shrink-0 shadow-sm border border-slate-900 select-none">
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${hasUnsavedChanges ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
                          <span className={`relative inline-flex rounded-full h-2 w-2 ${hasUnsavedChanges ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                        </span>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-200">
                          {hasUnsavedChanges ? 'Draft Unsaved' : 'Autosaved Backup'}
                        </span>
                        {lastSavedTime && (
                          <span className="text-[9px] text-slate-400 font-mono">
                            ({lastSavedTime})
                          </span>
                        )}
                      </div>
                      <div className="text-[9px] text-slate-400 font-medium">
                        Persisted every 5s
                      </div>
                    </div>

                    {/* Textarea for editing */}
                    <textarea
                      value={editedText}
                      onChange={handleTextChange}
                      className="flex-1 w-full min-h-[300px] p-4 rounded-xl border border-slate-800 bg-slate-900/60 text-slate-100 font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none resize-none shadow-inner leading-relaxed"
                      placeholder="Enter custom section content..."
                    />

                    {/* Edit Controls */}
                    <div className="flex justify-between items-center mt-3 shrink-0 select-none">
                      {showCancelConfirm ? (
                        <div className="flex items-center gap-2 bg-rose-500/5 border border-rose-500/20 rounded-xl p-1.5 px-3">
                          <span className="text-[10px] text-rose-400 font-bold">Discard changes?</span>
                          <button
                            onClick={() => {
                              localStorage.removeItem(autoSaveKey);
                              setIsEditing(false);
                              setHasUnsavedChanges(false);
                              setLastSavedTime(null);
                              setShowCancelConfirm(false);
                            }}
                            className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                          >
                            Discard
                          </button>
                          <button
                            onClick={() => setShowCancelConfirm(false)}
                            className="bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-[10px] px-2.5 py-1 rounded-lg border border-slate-800 transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={handleCancelEdits}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl transition-all duration-150 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          Discard & Exit
                        </button>
                      )}

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const draftData = {
                              content: editedText,
                              timestamp: Date.now()
                            };
                            localStorage.setItem(autoSaveKey, JSON.stringify(draftData));
                            const now = new Date();
                            setLastSavedTime(now.toLocaleTimeString());
                            setHasUnsavedChanges(false);
                            if (onTriggerNotification) {
                              onTriggerNotification('Draft manually saved to Local Storage.', 'success');
                            }
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-lg transition-all cursor-pointer border border-transparent hover:border-slate-800"
                          title="Save manual backup now"
                        >
                          <Save className="w-3.5 h-3.5 text-slate-500" />
                          <span>Backup Draft</span>
                        </button>
                        
                        <button
                          onClick={handleSaveEdits}
                          className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all duration-150 shadow-md shadow-emerald-600/10 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Commit Edits
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-5 flex-1 overflow-y-auto max-h-[380px] select-text scrollbar-thin">
                    {hasResult ? (
                      renderDiffContent(currentOriginalText, currentHarmonizedText)
                    ) : (
                      /* Prompt placeholder to trigger harmonizer */
                      <div className="flex flex-col items-center justify-center text-center py-24 px-6 h-full">
                        <div className="p-4 rounded-full bg-emerald-500/10 text-emerald-400 mb-4 ring-8 ring-emerald-500/5">
                          <Cpu className="w-7 h-7 animate-pulse" />
                        </div>
                        <h4 className="text-sm font-bold text-slate-100">Target Alignment Pending</h4>
                        <p className="text-xs text-slate-400 max-w-[280px] mt-1.5 leading-relaxed">
                          Click <strong className="font-semibold text-slate-200">Run AI Harmonizer</strong> to automatically map vocabulary, convert specifications, and resolve spelling discrepancies to match {targetAuthority} expectations.
                        </p>
                        <div className="flex items-center gap-2 mt-5">
                          <button
                            onClick={onHarmonize}
                            className="harmonize-trigger-btn inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all duration-150 shadow-md cursor-pointer"
                          >
                            <Play className="w-3.5 h-3.5" />
                            Trigger Aligner Now
                          </button>
                          <button
                            onClick={handleStartEditing}
                            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-300 bg-slate-900 border border-slate-800 hover:bg-slate-850 rounded-xl transition-all duration-150 shadow-sm cursor-pointer"
                          >
                            <FileEdit className="w-3.5 h-3.5" />
                            Write Manually
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : activeTab === 'diff' && hasResult ? (
          <div className="h-full">
            <DiffViewer
              originalText={currentOriginalText}
              modifiedText={currentHarmonizedText}
              sourceAuthority={sourceAuthority}
              targetAuthority={targetAuthority}
            />
          </div>
        ) : activeTab === 'changelog' && hasResult ? (
          /* Detailed AI Change Log Table */
          <div className="bg-slate-950/40 rounded-3xl border border-slate-900 shadow-xl p-6">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 mb-1.5">
              <Table className="w-4.5 h-4.5 text-emerald-400" />
              Automated Aligned Adjustments Changelog
            </h3>
            <p className="text-xs text-slate-400 mb-4 font-mono">Review the technical reasoning and pharmacopoeia swaps performed by the agent</p>

            <div className="overflow-x-auto border border-slate-900 rounded-xl shadow-sm">
              <table className="min-w-full divide-y divide-slate-900 text-xs">
                <thead className="bg-slate-950/80 text-slate-300 font-semibold uppercase font-sans">
                  <tr>
                    <th className="px-4 py-3 text-left">Adjustment Field</th>
                    <th className="px-4 py-3 text-left">Source Phrasing ({sourceAuthority})</th>
                    <th className="px-4 py-3 text-left">Aligned Phrasing ({targetAuthority})</th>
                    <th className="px-4 py-3 text-left">Regulatory Guidance Justification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 bg-slate-900/30 font-medium text-slate-300">
                  {harmonizationResult.changeLog.map((change, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/60">
                      <td className="px-4 py-3 font-semibold text-slate-200 border-r border-slate-900/40">{change.field}</td>
                      <td className="px-4 py-3 font-mono text-rose-400 bg-rose-500/5 border-r border-slate-900/40">{change.originalValue}</td>
                      <td className="px-4 py-3 font-mono text-emerald-400 bg-emerald-500/5 border-r border-slate-900/40">{change.newValue}</td>
                      <td className="px-4 py-3 text-slate-400 leading-relaxed">{change.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : activeTab === 'references' && hasResult ? (
          /* Regulatory Citations applied */
          <div className="bg-slate-950/40 rounded-3xl border border-slate-900 shadow-xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <BookOpen className="w-4.5 h-4.5 text-emerald-400" />
              Active Guidelines Reference Citations
            </h3>
            <p className="text-xs text-slate-400 font-mono">The following international standards, codes, and guidelines were strictly followed to execute this alignment:</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {harmonizationResult.regulatoryReferences.map((ref, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-emerald-500/10 bg-emerald-500/5 flex gap-3 items-start">
                  <span className="p-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 text-[10px] font-mono font-bold shrink-0">
                    CITE-{idx + 1}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200 leading-tight">
                      {ref}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      Mandated reference standard guiding submissions into {targetAuthority} health authority systems.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

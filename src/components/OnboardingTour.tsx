import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ArrowRight, 
  Sparkles, 
  Play, 
  ChevronRight, 
  Check, 
  Info, 
  LayoutDashboard, 
  FileText, 
  BarChart3, 
  ScanLine, 
  Bot, 
  BookOpen, 
  Thermometer, 
  ShieldCheck, 
  Atom, 
  Globe, 
  History, 
  Network 
} from 'lucide-react';
import { DemoDossier } from '../types';

// Define the structure of a tour step
interface TourStep {
  targetId: string;
  title: string;
  description: string;
  actionType: 'click' | 'change' | 'input' | 'info';
  expectedPage?: string; // If the step expects a specific page/tab to be active
  expectedSubTab?: string;
}

// Define a workflow
interface Workflow {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string; // Tailwind gradient classes
  steps: TourStep[];
}

interface OnboardingTourProps {
  activePage: string;
  setActivePage: (page: string) => void;
  dossierTab: string;
  setDossierTab: (tab: string) => void;
  onClose: () => void;
  triggerNotification: (msg: string, type?: 'success' | 'info' | 'error') => void;
  setShowLanding: (show: boolean) => void;
  workflowId: string | null;
  setWorkflowId: (id: string | null) => void;
  currentStepIdx: number;
  setCurrentStepIdx: React.Dispatch<React.SetStateAction<number>>;
  isSelectorOpen: boolean;
  setIsSelectorOpen: (open: boolean) => void;
}

export default function OnboardingTour({ 
  activePage, 
  setActivePage, 
  dossierTab, 
  setDossierTab, 
  onClose,
  triggerNotification,
  setShowLanding,
  workflowId,
  setWorkflowId,
  currentStepIdx,
  setCurrentStepIdx,
  isSelectorOpen,
  setIsSelectorOpen
}: OnboardingTourProps) {
  const [highlightCoords, setHighlightCoords] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

  // Define the 6 workflows and their steps
  const workflows: Workflow[] = [
    {
      id: 'executive',
      name: 'Executive Portfolio Oversight',
      description: 'Monitor global filing pipelines, readiness scores, and calculate financial ROI.',
      icon: <LayoutDashboard className="w-5 h-5" />,
      color: 'from-emerald-500 to-teal-600',
      steps: [
        {
          targetId: 'sidebar-dashboard',
          title: 'Navigate to Executive Hub',
          description: 'Click "0. Executive Hub" in the sidebar to open the portfolio command center.',
          actionType: 'click',
          expectedPage: 'dashboard'
        },
        {
          targetId: 'sidebar-portfolio-dropdown',
          title: 'Switch Active Drug Portfolio',
          description: 'Select a different drug from the dropdown in the sidebar to see the metrics and timeline charts update instantly.',
          actionType: 'change'
        },
        {
          targetId: 'sidebar-present-button',
          title: 'View ROI Presentation',
          description: 'Click "Present" in the sidebar to return to the interactive landing page and view the financial impact calculator.',
          actionType: 'click'
        },
        {
          targetId: 'landing-roi-button',
          title: 'Calculate Corporate ROI',
          description: 'Click "Calculate Corporate ROI" to scroll down and visualize your organization\'s potential savings, timeline acceleration, and value unlocked!',
          actionType: 'click'
        }
      ]
    },
    {
      id: 'audit',
      name: 'Dossier Audit & Gap Analysis',
      description: 'Scan eCTD sections for compliance gaps and execute automated AI remedies.',
      icon: <ShieldCheck className="w-5 h-5" />,
      color: 'from-blue-500 to-indigo-600',
      steps: [
        {
          targetId: 'sidebar-gap-matrix',
          title: 'Inspect the Gap Matrix',
          description: 'Click "2. Gap Matrix Hub" in the sidebar to view a comprehensive grid of all pending regulatory gaps.',
          actionType: 'click',
          expectedPage: 'gap_matrix_hub'
        },
        {
          targetId: 'sidebar-dossier-aligner',
          title: 'Open Dossier Aligner',
          description: 'Click "1. Dossier Aligner & Tree" in the sidebar to load the eCTD workspace.',
          actionType: 'click',
          expectedPage: 'dossier_aligner'
        },
        {
          targetId: 'remedy-gap-btn-gap-m1-1',
          title: 'Remedy a Compliance Gap',
          description: 'Click the "Auto-Remediate Gap" button on the first gap in the checklist. The AI will patch the text in memory and resolve the issue.',
          actionType: 'click'
        }
      ]
    },
    {
      id: 'harmonization',
      name: 'Cross-Border Harmonization',
      description: 'Translate dossier sections between FDA, EMA, and PMDA standards with AI.',
      icon: <FileText className="w-5 h-5" />,
      color: 'from-purple-500 to-pink-600',
      steps: [
        {
          targetId: 'sidebar-dossier-aligner',
          title: 'Open Dossier Aligner',
          description: 'Click "1. Dossier Aligner & Tree" in the sidebar to load the workspace.',
          actionType: 'click',
          expectedPage: 'dossier_aligner'
        },
        {
          targetId: 'target-market-dropdown',
          title: 'Select Target Market',
          description: 'Change the Target Market dropdown to "PMDA" or "FDA" to load region-specific pharmacopoeia rules.',
          actionType: 'change'
        },
        {
          targetId: 'trigger-harmonize-button',
          title: 'Run AI Harmonizer',
          description: 'Click "Run AI Harmonizer" or "Trigger Aligner Now" to translate the text. Watch the progress bar compile.',
          actionType: 'click'
        },
        {
          targetId: 'tab-diff',
          title: 'Inspect Text Diff',
          description: 'Click the "View Diff" tab to see a side-by-side comparison of the original vs. harmonized text.',
          actionType: 'click',
          expectedSubTab: 'diff'
        }
      ]
    },
    {
      id: 'ingestion',
      name: 'Ingestion & OCR Processing',
      description: 'Ingest raw PDF/text files, extract text via OCR, and create audited sections.',
      icon: <ScanLine className="w-5 h-5" />,
      color: 'from-amber-500 to-orange-600',
      steps: [
        {
          targetId: 'sidebar-ingest-ocr',
          title: 'Open Ingest & OCR Station',
          description: 'Click "3. Ingest & OCR Station" in the sidebar to open the document upload portal.',
          actionType: 'click',
          expectedPage: 'ingest_ocr'
        },
        {
          targetId: 'ocr-title-input',
          title: 'Name Your Custom Section',
          description: 'Type a section code or title (e.g., "3.2.S.1.3") in the input box to prepare the document metadata. Please type at least 3 characters.',
          actionType: 'input'
        },
        {
          targetId: 'ocr-submit-button',
          title: 'Create & Audit Section',
          description: 'Click "Create & Audit Section" to ingest the document and run an automated compliance scan.',
          actionType: 'click'
        }
      ]
    },
    {
      id: 'publishing',
      name: 'Pre-Flight & Publishing',
      description: 'Verify environmental stability, check CFR audit logs, and export XML packages.',
      icon: <ShieldCheck className="w-5 h-5" />,
      color: 'from-rose-500 to-red-600',
      steps: [
        {
          targetId: 'sidebar-audit-history',
          title: 'Inspect CFR Audit Trail',
          description: 'Click "10. CFR Audit Trail" in the sidebar to review the ALCOA+ compliant database logs.',
          actionType: 'click',
          expectedPage: 'audit_history'
        },
        {
          targetId: 'sidebar-dossier-aligner',
          title: 'Return to Dossier Aligner',
          description: 'Click "1. Dossier Aligner & Tree" in the sidebar to return to the compiler workspace.',
          actionType: 'click',
          expectedPage: 'dossier_aligner'
        },
        {
          targetId: 'subtab-compiler',
          title: 'Open Compile & Export Tab',
          description: 'Click the "4. Compile & Export" sub-tab in the aligner header.',
          actionType: 'click',
          expectedSubTab: 'compiler'
        },
        {
          targetId: 'export-xml-button',
          title: 'Export eCTD Package',
          description: 'Click the "Export to eCTD XML" button to compile and download your compliant XML submission package.',
          actionType: 'click'
        }
      ]
    },
    {
      id: 'developer',
      name: 'Developer Console & MCP',
      description: 'Run background agent campaigns and simulate Model Context Protocol queries.',
      icon: <Network className="w-5 h-5" />,
      color: 'from-indigo-500 to-violet-600',
      steps: [
        {
          targetId: 'sidebar-agent-orchestrator',
          title: 'Open Agent Orchestrator',
          description: 'Click "11. Agent Orchestrator & MCP" in the sidebar to open the developer console.',
          actionType: 'click',
          expectedPage: 'agent_orchestrator'
        },
        {
          targetId: 'agent-execute-button',
          title: 'Execute Agent Campaign',
          description: 'Click the "Execute Campaign" button to watch the 4-Agent pipeline run sequentially in the background.',
          actionType: 'click'
        },
        {
          targetId: 'mcp-tab-button',
          title: 'Switch to MCP Console',
          description: 'Click on the "2. Model Context Protocol (MCP)" tab in the orchestrator header.',
          actionType: 'click'
        },
        {
          targetId: 'mcp-submit-button',
          title: 'Query the MCP Server',
          description: 'Click "Send MCP JSON-RPC Request" to simulate a client query from Gemini Enterprise.',
          actionType: 'click'
        }
      ]
    }
  ];

  const selectedWorkflow = workflows.find(w => w.id === workflowId) || null;
  const currentStep = selectedWorkflow?.steps[currentStepIdx];

  // Effect to track the highlighted element's coordinates in real-time
  useEffect(() => {
    if (isSelectorOpen || !currentStep) {
      setHighlightCoords(null);
      return;
    }

    let active = true;
    const updatePosition = () => {
      if (!active) return;
      const element = document.getElementById(currentStep.targetId);
      if (element) {
        const rect = element.getBoundingClientRect();
        setHighlightCoords(prev => {
          if (
            prev &&
            Math.abs(prev.top - (rect.top + window.scrollY)) < 1 &&
            Math.abs(prev.left - (rect.left + window.scrollX)) < 1 &&
            Math.abs(prev.width - rect.width) < 1 &&
            Math.abs(prev.height - rect.height) < 1
          ) {
            return prev;
          }
          return {
            top: rect.top + window.scrollY,
            left: rect.left + window.scrollX,
            width: rect.width,
            height: rect.height
          };
        });
      } else {
        setHighlightCoords(null);
      }
      requestAnimationFrame(updatePosition);
    };

    updatePosition();

    return () => {
      active = false;
    };
  }, [currentStep, isSelectorOpen, activePage, dossierTab]);

  // Automatically sync showLanding and activePage based on the current step's requirements
  useEffect(() => {
    if (isSelectorOpen || !currentStep) return;

    if (currentStep.targetId === 'landing-roi-button') {
      setShowLanding(true);
    } else {
      setShowLanding(false);
      if (currentStep.expectedPage && currentStep.expectedPage !== activePage) {
        setActivePage(currentStep.expectedPage);
      }
      if (currentStep.expectedSubTab && currentStep.expectedSubTab !== dossierTab) {
        setDossierTab(currentStep.expectedSubTab);
      }
    }
  }, [currentStep, isSelectorOpen, activePage, dossierTab, setShowLanding, setActivePage, setDossierTab]);


  // Global bubble listener to detect user actions on the highlighted element
  useEffect(() => {
    if (isSelectorOpen || !currentStep) return;

    const handleUserAction = (e: Event) => {
      const element = document.getElementById(currentStep.targetId);
      if (!element) return;

      const isTarget = element === e.target || element.contains(e.target as Node);
      if (!isTarget) return;

      if (currentStep.actionType === 'click' && e.type === 'click') {
        advanceStep();
      } else if (currentStep.actionType === 'change' && e.type === 'change') {
        advanceStep();
      } else if (currentStep.actionType === 'input' && (e.type === 'input' || e.type === 'keyup')) {
        const inputEl = element as HTMLInputElement | HTMLTextAreaElement;
        if (inputEl.value && inputEl.value.length > 2) {
          advanceStep();
        }
      }
    };

    document.addEventListener('click', handleUserAction, true);
    document.addEventListener('change', handleUserAction, true);
    document.addEventListener('input', handleUserAction, true);
    document.addEventListener('keyup', handleUserAction, true);

    return () => {
      document.removeEventListener('click', handleUserAction, true);
      document.removeEventListener('change', handleUserAction, true);
      document.removeEventListener('input', handleUserAction, true);
      document.removeEventListener('keyup', handleUserAction, true);
    };
  }, [currentStep, isSelectorOpen]);

  const advanceStep = () => {
    if (!selectedWorkflow) return;
    
    if (currentStepIdx >= selectedWorkflow.steps.length - 1) {
      const completedWf = selectedWorkflow;
      setWorkflowId(null);
      setCurrentStepIdx(0);
      onClose();
      triggerNotification(`🎉 Completed the "${completedWf.name}" guided journey!`, 'success');
    } else {
      setCurrentStepIdx(prev => prev + 1);
    }
  };

  const handleSelectWorkflow = (wf: Workflow) => {
    setWorkflowId(wf.id);
    setCurrentStepIdx(0);
    setIsSelectorOpen(false);
    
    const firstStep = wf.steps[0];
    if (firstStep.expectedPage) {
      setActivePage(firstStep.expectedPage);
    }
    if (firstStep.expectedSubTab) {
      setDossierTab(firstStep.expectedSubTab as any);
    }
  };

  const handleExitTour = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none font-sans select-none">
      
      {/* 1. WORKFLOW SELECTOR MODAL OVERLAY */}
      <AnimatePresence>
        {isSelectorOpen && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 pointer-events-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-slate-900/90 border border-slate-800 rounded-[2.5rem] p-8 max-w-4xl w-full shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Background Glows */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

              {/* Header */}
              <div className="flex justify-between items-start mb-6 shrink-0">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full py-1 px-3 text-[10px] font-bold text-emerald-400 font-mono uppercase">
                    <Sparkles className="w-3 h-3 animate-pulse" />
                    Interactive Onboarding Journeys
                  </div>
                  <h2 className="text-2xl font-black text-white uppercase tracking-tight mt-1">
                    Select Your Guided Workflow
                  </h2>
                  <p className="text-xs text-slate-400">
                    Choose a workflow tailored to your role to experience how the platform accelerates and automates eCTD drug filings.
                  </p>
                </div>
                <button 
                  id="close-onboarding-btn"
                  onClick={handleExitTour}
                  className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-850 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  title="Close Onboarding"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Grid of 6 Workflows */}
              <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
                {workflows.map((wf) => (
                  <button
                    key={wf.id}
                    onClick={() => handleSelectWorkflow(wf)}
                    className="group text-left p-5 rounded-2xl bg-slate-950/50 border border-slate-900 hover:border-slate-800 transition-all duration-300 cursor-pointer hover:bg-slate-950 flex flex-col justify-between gap-4 relative overflow-hidden active:scale-[0.99]"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/5 to-transparent rounded-bl-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${wf.color} text-slate-950 font-black shadow-lg group-hover:scale-105 transition-transform`}>
                        {wf.icon}
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-black text-slate-200 group-hover:text-white transition-colors">{wf.name}</h4>
                        <p className="text-[11px] text-slate-400 leading-relaxed">{wf.description}</p>
                      </div>
                    </div>

                    <div className="w-full flex items-center justify-between border-t border-slate-900/60 pt-3 text-[10px] font-mono font-bold text-slate-500 group-hover:text-emerald-400 transition-colors mt-auto">
                      <span>{wf.steps.length} INTERACTIVE STEPS</span>
                      <span className="flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                        Start Journey <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Footer */}
              <div className="mt-6 border-t border-slate-900/80 pt-4 flex justify-between items-center text-[10px] text-slate-500 font-mono shrink-0">
                <span>PHARMA DOSSIER HARMONIZER • VERSION 1.0.0</span>
                <button 
                  id="skip-onboarding-btn"
                  onClick={handleExitTour}
                  className="text-slate-400 hover:text-slate-200 transition-colors font-bold uppercase tracking-wider"
                >
                  Skip Onboarding and Explore Freely
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. DYNAMIC SPOTLIGHT LAYER (HIGHLIGHT ELEMENT) */}
      {highlightCoords && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Glowing Border Spotlight Box */}
          <motion.div
            initial={{ 
              top: highlightCoords.top, 
              left: highlightCoords.left, 
              width: highlightCoords.width, 
              height: highlightCoords.height,
              opacity: 0 
            }}
            animate={{ 
              top: highlightCoords.top - 4, 
              left: highlightCoords.left - 4, 
              width: highlightCoords.width + 8, 
              height: highlightCoords.height + 8,
              opacity: 1 
            }}
            transition={{ type: 'spring', damping: 20, stiffness: 120 }}
            className="absolute rounded-xl border-2 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.35)] z-40 pointer-events-none"
          >
            {/* Animated corner glowing brackets */}
            <span className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 border-t-2 border-l-2 border-emerald-300 rounded-tl-md" />
            <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 border-t-2 border-r-2 border-emerald-300 rounded-tr-md" />
            <span className="absolute -bottom-1.5 -left-1.5 w-3.5 h-3.5 border-b-2 border-l-2 border-emerald-300 rounded-bl-md" />
            <span className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 border-b-2 border-r-2 border-emerald-300 rounded-br-md" />
          </motion.div>

          {/* 3. PREMIUM ANIMATED CLICK POINTER */}
          {currentStep && (currentStep.actionType === 'click' || currentStep.actionType === 'change') && (
            <motion.div
              initial={{ 
                top: highlightCoords.top + highlightCoords.height / 2, 
                left: highlightCoords.left + highlightCoords.width / 2, 
                scale: 1.2,
                opacity: 0
              }}
              animate={{ 
                top: highlightCoords.top + highlightCoords.height / 2 + 10, 
                left: highlightCoords.left + highlightCoords.width / 2 + 10, 
                scale: 1,
                opacity: 1
              }}
              transition={{ type: 'spring', damping: 15, stiffness: 100 }}
              className="absolute z-50 pointer-events-none"
            >
              {/* Custom SVG Finger/Cursor Pointer */}
              <div className="relative">
                <svg 
                  className="w-7 h-7 text-emerald-400 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] animate-click-tap" 
                  viewBox="0 0 24 24" 
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M10 21.5c-1.4 0-2.6-.5-3.5-1.5l-5.3-5.3c-.4-.4-.4-1 0-1.4.4-.4 1-.4 1.4 0l3.8 3.8V4.5c0-.8.7-1.5 1.5-1.5s1.5.7 1.5 1.5v7.5h.5c.8 0 1.5.7 1.5 1.5v.5h.5c.8 0 1.5.7 1.5 1.5v.5h.5c.8 0 1.5.7 1.5 1.5v3c0 2.2-1.8 4-4 4h-3.5z" />
                </svg>
                
                {/* Expanding Ripple Circles */}
                <span className="absolute top-0 left-0 w-3 h-3 -mt-1 -ml-1 rounded-full bg-emerald-400/80 animate-ripple" />
                <span className="absolute top-0 left-0 w-3 h-3 -mt-1 -ml-1 rounded-full bg-emerald-400/40 animate-ripple [animation-delay:0.4s]" />
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* 4. FLOATING TOUR CARD */}
      <AnimatePresence>
        {!isSelectorOpen && selectedWorkflow && currentStep && (
          <div className="absolute bottom-6 right-6 pointer-events-auto w-80 sm:w-96 z-50">
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              className="bg-slate-900/95 border border-slate-800 rounded-3xl p-5 shadow-2xl relative overflow-hidden backdrop-blur-md"
            >
              {/* Progress Bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-slate-950">
                <div 
                  className={`h-1 bg-gradient-to-r ${selectedWorkflow.color} transition-all duration-300`}
                  style={{ width: `${((currentStepIdx + 1) / selectedWorkflow.steps.length) * 100}%` }}
                />
              </div>

              {/* Close Button ("X") */}
              <button 
                id="exit-tour-card-btn"
                onClick={() => {
                  setWorkflowId(null);
                  setIsSelectorOpen(true);
                  setCurrentStepIdx(0);
                  triggerNotification('Onboarding tour cancelled.', 'info');
                }}
                className="absolute top-3 right-3 p-1 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                title="Exit Tour"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-3.5 pt-1">
                {/* Header Info */}
                <div className="space-y-0.5">
                  <span className="text-[9px] font-mono font-black text-slate-500 block">
                    Workflow: {selectedWorkflow.name}
                  </span>
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider font-mono">
                      Step {currentStepIdx + 1} of {selectedWorkflow.steps.length}
                    </h4>
                    <span className="text-[9px] font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/25 px-2 py-0.5 rounded-full uppercase animate-pulse">
                      {currentStep.actionType === 'info' ? 'Info' : `Action: ${currentStep.actionType}`}
                    </span>
                  </div>
                </div>

                {/* Step Content */}
                <div className="space-y-1.5">
                  <h3 className="text-sm font-black text-white leading-snug">
                    {currentStep.title}
                  </h3>
                  <p className="text-[11px] text-slate-300 leading-relaxed font-sans font-normal">
                    {currentStep.description}
                  </p>
                </div>

                {/* Footer Controls */}
                <div className="flex justify-between items-center pt-2.5 border-t border-slate-900">
                  <button
                    onClick={() => {
                      setWorkflowId(null);
                      setIsSelectorOpen(true);
                      setCurrentStepIdx(0);
                    }}
                    className="text-[10px] font-bold text-slate-500 hover:text-slate-300 uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Change Tour
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      id="tour-next-btn"
                      onClick={advanceStep}
                      className="bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 font-bold text-[10px] px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                    >
                      <span>Skip Step</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

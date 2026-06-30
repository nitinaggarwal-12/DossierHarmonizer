import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Boxes, 
  Cpu, 
  Network, 
  Settings, 
  FileJson, 
  Compass, 
  ArrowRight, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Play, 
  Terminal, 
  FileText, 
  Database, 
  Layers, 
  HelpCircle, 
  ShieldCheck, 
  Copy, 
  Zap,
  Info,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Search
} from 'lucide-react';
import { DemoDossier } from '../types';

interface AgentOrchestratorProps {
  dossiers: DemoDossier[];
  triggerNotification: (message: string, type: 'success' | 'error' | 'info') => void;
}

// 1. Define Agent definition
interface ADKAgent {
  id: string;
  name: string;
  role: string;
  status: 'idle' | 'processing' | 'done' | 'failed';
  icon: React.ReactNode;
  description: string;
  protocolSupport: string[];
  capabilities: string[];
}

export default function AgentOrchestrator({ dossiers, triggerNotification }: AgentOrchestratorProps) {
  const [selectedDossierId, setSelectedDossierId] = useState(dossiers[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'orchestration' | 'mcp' | 'ord' | 'enterprise_connector'>('orchestration');
  
  // ---------------- STATE FOR MULTI-AGENT SIMULATION ----------------
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationStep, setSimulationStep] = useState(0);
  const [simulationLogs, setSimulationLogs] = useState<{timestamp: string; text: string; type: 'info' | 'success' | 'warn' | 'agent'}[]>([]);
  const [agents, setAgents] = useState<ADKAgent[]>([
    {
      id: 'ingress',
      name: 'Ingress Coordinator',
      role: 'Sovereign File Route & Ingestion Liaison',
      status: 'idle',
      icon: <Layers className="w-5 h-5 text-indigo-400" />,
      description: 'Handles ORD discovery, reads eCTD XML structure, and coordinates processing campaign.',
      protocolSupport: ['ORD v1.4', 'A2A', 'MCP'],
      capabilities: ['OCR Intake', 'eCTD XML Parsing', 'Dossier Indexing']
    },
    {
      id: 'cmc_analyst',
      name: 'CMC Compliance Analyst',
      role: 'Chemistry, Manufacturing & Controls Reviewer',
      status: 'idle',
      icon: <Cpu className="w-5 h-5 text-purple-400" />,
      description: 'Audits Module 3.2.S and 3.2.P for strict regulatory standards and flags safety/testing deficiencies.',
      protocolSupport: ['MCP (Tools/Resources)', 'OKF v2.0'],
      capabilities: ['ICH Q1A-F Audit', 'Stability Analysis', 'Specification Compliance']
    },
    {
      id: 'nomenclature',
      name: 'Nomenclature & Terminology Translator',
      role: 'Pharmacopoeial Vocab Aligner',
      status: 'idle',
      icon: <Compass className="w-5 h-5 text-amber-400" />,
      description: 'Finds term mismatches (e.g., Active Substance vs Drug Substance) and cross-maps pharmacopoeial references (USP vs Ph. Eur. vs JP).',
      protocolSupport: ['MCP (Tools)', 'OKF v2.0'],
      capabilities: ['Lexicon Mapping', 'SmPC to USPI Transition', 'USP/EP Cross Ref']
    },
    {
      id: 'quality_auditor',
      name: 'Quality Reviewer & Sign-off Auditor',
      role: 'ALCOA+ 21 CFR Part 11 Compliance Officer',
      status: 'idle',
      icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
      description: 'Verifies overall convergence, writes the ALCOA+ audit trailing logs, and signs the validated submission package.',
      protocolSupport: ['A2A', 'MCP'],
      capabilities: ['Audit Trail Generation', 'Pre-flight Validation', 'Digital eCTD Signing']
    }
  ]);

  // ---------------- STATE FOR MCP INTERACTIVE CONSOLE ----------------
  const [selectedMcpMethod, setSelectedMcpMethod] = useState<'tools/list' | 'tools/call' | 'resources/list' | 'resources/read'>('tools/call');
  const [mcpToolName, setMcpToolName] = useState('compliance_analyzer');
  const [mcpResourceId, setMcpResourceId] = useState('dossiers://keytruda/module3');
  const [mcpConsoleLogs, setMcpConsoleLogs] = useState<{type: 'request' | 'response'; payload: string}[]>([
    {
      type: 'response',
      payload: JSON.stringify({
        jsonrpc: "2.0",
        result: {
          status: "connected",
          serverName: "PharmaHarmonizerMCP",
          version: "1.0.0",
          supportedProtocols: ["2024-11-05"]
        },
        id: "init-01"
      }, null, 2)
    }
  ]);
  const [isSendingMcp, setIsSendingMcp] = useState(false);

  // ---------------- SIMULATION ENGINE ----------------
  const addLog = (text: string, type: 'info' | 'success' | 'warn' | 'agent' = 'info') => {
    const time = new Date().toTimeString().split(' ')[0];
    setSimulationLogs(prev => [{ timestamp: time, text, type }, ...prev]);
  };

  const selectedDossier = dossiers.find(d => d.id === selectedDossierId) || dossiers[0];

  const triggerSimulation = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setSimulationStep(1);
    setSimulationLogs([]);
    
    // Reset agent statuses
    setAgents(prev => prev.map(a => ({ ...a, status: a.id === 'ingress' ? 'processing' : 'idle' })));
    
    addLog(`Initiating Background Multi-Agent Orchestration Campaign for substance: ${selectedDossier?.drugName}`, 'info');
    addLog(`Establishing Agent-to-Agent secure communication canal using A2A Router...`, 'info');
  };

  useEffect(() => {
    if (!isSimulating) return;

    let timer: NodeJS.Timeout;

    if (simulationStep === 1) {
      timer = setTimeout(() => {
        setAgents(prev => prev.map(a => 
          a.id === 'ingress' ? { ...a, status: 'done' } : 
          a.id === 'cmc_analyst' ? { ...a, status: 'processing' } : a
        ));
        addLog(`[Ingress Coordinator] parsed eCTD manifest. Target: ${selectedDossier?.targetAuthorities.join(', ')}. Passing payload to CMC Compliance Analyst.`, 'agent');
        setSimulationStep(2);
      }, 2500);
    } else if (simulationStep === 2) {
      timer = setTimeout(() => {
        setAgents(prev => prev.map(a => 
          a.id === 'cmc_analyst' ? { ...a, status: 'done' } : 
          a.id === 'nomenclature' ? { ...a, status: 'processing' } : a
        ));
        addLog(`[CMC Compliance Analyst] scanning Section 3.2.S. Validation gaps detected: photostability testing temperature margins. Citing ICH Q1B.`, 'agent');
        addLog(`[CMC Compliance Analyst] completed deep comparison. Handing regulatory lexicon payload to Nomenclature Aligner.`, 'info');
        setSimulationStep(3);
      }, 3000);
    } else if (simulationStep === 3) {
      timer = setTimeout(() => {
        setAgents(prev => prev.map(a => 
          a.id === 'nomenclature' ? { ...a, status: 'done' } : 
          a.id === 'quality_auditor' ? { ...a, status: 'processing' } : a
        ));
        addLog(`[Nomenclature Aligner] aligning regional vocabulary. Replaced 14 instances of "Active Substance" with FDA-preferred "Drug Substance" and updated pharmacopoeia citations.`, 'agent');
        addLog(`[Nomenclature Aligner] compiled aligned nomenclature dossier. Calling Quality Reviewer for final pre-flight verification.`, 'info');
        setSimulationStep(4);
      }, 3000);
    } else if (simulationStep === 4) {
      timer = setTimeout(() => {
        setAgents(prev => prev.map(a => 
          a.id === 'quality_auditor' ? { ...a, status: 'done' } : a
        ));
        addLog(`[Quality Reviewer] pre-flight validation completed. eCTD integrity checks: 100% compliant. CFR Part 11 logs committed.`, 'agent');
        addLog(`[Quality Reviewer] signed submission package digitally using FDA ESD gate certificates.`, 'success');
        addLog(`Campaign for ${selectedDossier?.drugName} executed successfully! Background artifacts synced with primary dashboard.`, 'success');
        setIsSimulating(false);
        setSimulationStep(5);
        triggerNotification(`Background campaign for ${selectedDossier?.drugName} complete!`, 'success');
      }, 2500);
    }

    return () => clearTimeout(timer);
  }, [isSimulating, simulationStep]);

  // ---------------- MCP RUN HANDLER ----------------
  const handleSendMcpRequest = () => {
    setIsSendingMcp(true);
    triggerNotification('Sending JSON-RPC request to local MCP server', 'info');

    let requestObj = {};
    let responseObj = {};

    if (selectedMcpMethod === 'tools/list') {
      requestObj = {
        jsonrpc: "2.0",
        method: "tools/list",
        params: {},
        id: Math.floor(Math.random() * 1000)
      };
      responseObj = {
        jsonrpc: "2.0",
        result: {
          tools: [
            {
              name: "compliance_analyzer",
              description: "Analyzes specific Module 3 section texts against FDA/EMA/PMDA requirements to find compliance gaps.",
              inputSchema: {
                type: "object",
                properties: {
                  sectionCode: { type: "string" },
                  text: { type: "string" },
                  targetAuthority: { type: "string" }
                },
                required: ["sectionCode", "text", "targetAuthority"]
              }
            },
            {
              name: "vocabulary_aligner",
              description: "Converts regulatory terminology in SMpC texts to match US FDA USPI CFR standards.",
              inputSchema: {
                type: "object",
                properties: {
                  text: { type: "string" },
                  direction: { type: "string", enum: ["smpc_to_uspi", "uspi_to_smpc"] }
                }
              }
            }
          ]
        },
        id: requestObj['id' as keyof typeof requestObj]
      };
    } else if (selectedMcpMethod === 'tools/call') {
      requestObj = {
        jsonrpc: "2.0",
        method: "tools/call",
        params: {
          name: mcpToolName,
          arguments: {
            sectionCode: "3.2.S.1.2",
            text: selectedDossier?.sections[0]?.content || "Active substance has high shelf-life...",
            targetAuthority: "FDA"
          }
        },
        id: Math.floor(Math.random() * 1000)
      };
      responseObj = {
        jsonrpc: "2.0",
        result: {
          content: [
            {
              type: "text",
              text: `[MCP Tools Service] Execution successful. Gaps identified: Terminology mismatches. Found 'active substance' 3 times. Recommended correction: 'drug substance'. Citing 21 CFR 201.56.`
            }
          ],
          isError: false
        },
        id: requestObj['id' as keyof typeof requestObj]
      };
    } else if (selectedMcpMethod === 'resources/list') {
      requestObj = {
        jsonrpc: "2.0",
        method: "resources/list",
        params: {},
        id: Math.floor(Math.random() * 1000)
      };
      responseObj = {
        jsonrpc: "2.0",
        result: {
          resources: [
            {
              uri: "dossiers://keytruda/module3",
              name: "Keytruda eCTD Module 3 (CMC)",
              mimeType: "application/json",
              description: "Chemistry, Manufacturing, and Controls sections for Pembrolizumab filing."
            },
            {
              uri: "standards://fda/cfr-title-21",
              name: "FDA 21 CFR Part 201 Labeling Rules",
              mimeType: "text/markdown",
              description: "Official FDA rules for Prescribing Information formatting."
            }
          ]
        },
        id: requestObj['id' as keyof typeof requestObj]
      };
    } else if (selectedMcpMethod === 'resources/read') {
      requestObj = {
        jsonrpc: "2.0",
        method: "resources/read",
        params: {
          uri: mcpResourceId
        },
        id: Math.floor(Math.random() * 1000)
      };
      responseObj = {
        jsonrpc: "2.0",
        result: {
          contents: [
            {
              uri: mcpResourceId,
              mimeType: "application/json",
              text: JSON.stringify({
                substance: selectedDossier?.drugName,
                therapeuticArea: selectedDossier?.therapeuticArea,
                activeStatus: "Approved-FDA",
                alignmentScore: "94%"
              }, null, 2)
            }
          ]
        },
        id: requestObj['id' as keyof typeof requestObj]
      };
    }

    setTimeout(() => {
      setMcpConsoleLogs(prev => [
        { type: 'request', payload: JSON.stringify(requestObj, null, 2) },
        { type: 'response', payload: JSON.stringify(responseObj, null, 2) },
        ...prev
      ]);
      setIsSendingMcp(false);
      triggerNotification('MCP response returned successfully', 'success');
    }, 1200);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    triggerNotification(`Copied ${label} to clipboard!`, 'success');
  };

  return (
    <div className="space-y-6 text-slate-100" id="agentic-orchestrator-container">
      
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg">
              <Network className="w-5 h-5 animate-pulse" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
              Agentic Orchestrator & Protocol Hub
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-3xl">
            Orchestrate background regulatory campaigns using <strong>ADK (Agent Development Kit)</strong> agents. Expose and query these agents natively via <strong>Model Context Protocol (MCP)</strong> and <strong>Open Resource Discovery (ORD)</strong> directly into the <strong>Gemini Enterprise App</strong>.
          </p>
        </div>

        {/* SELECT THE TARGET DRUG TO ACT UPON */}
        <div className="flex items-center gap-2 bg-slate-900/40 border border-slate-850 px-3 py-1.5 rounded-2xl h-11 shrink-0">
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">Substance:</span>
          <select
            value={selectedDossierId}
            onChange={(e) => {
              setSelectedDossierId(e.target.value);
              triggerNotification(`Active dossier target updated to ${dossiers.find(d => d.id === e.target.value)?.drugName}`, 'info');
            }}
            className="bg-transparent text-xs font-black text-emerald-400 focus:outline-none border-none pr-4 cursor-pointer"
          >
            {dossiers.map(d => (
              <option key={d.id} value={d.id} className="bg-slate-950 text-slate-200">
                {d.drugName} ({d.dossierType})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ANSWERING CONCEPTUAL QUESTIONS VIA TOP RIBBON */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 bg-gradient-to-r from-[#0d1527]/40 to-[#080d1a]/20 border border-slate-850/50 rounded-3xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-emerald-400">
            <Info className="w-4 h-4" />
            <h4 className="text-xs font-black uppercase font-mono tracking-wider">ADK Background Processing</h4>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Yes! ADK agents can safely perform complex regulatory checks, document parsing, and pharmacopoeia searches in the background. They run asynchronously, executing multi-turn validation without locking the UI, committing compliance audits directly to local logs.
          </p>
        </div>

        <div className="space-y-2 border-t lg:border-t-0 lg:border-l lg:border-r border-slate-900/60 lg:px-5 pt-3 lg:pt-0">
          <div className="flex items-center gap-2 text-indigo-400">
            <Zap className="w-4 h-4" />
            <h4 className="text-xs font-black uppercase font-mono tracking-wider">Gemini Enterprise Integration</h4>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            By implementing the **Model Context Protocol (MCP)**, these agents become direct extensions of the **Gemini Enterprise App**. Gemini can call tools (`compliance_analyzer`, `vocabulary_aligner`) and query resources (`dossiers://`) to execute real-world enterprise work securely.
          </p>
        </div>

        <div className="space-y-2 border-t lg:border-t-0 pt-3 lg:pt-0">
          <div className="flex items-center gap-2 text-purple-400">
            <Layers className="w-4 h-4" />
            <h4 className="text-xs font-black uppercase font-mono tracking-wider">How Orchestration Looks Like</h4>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            We employ a **4-Agent Pipeline**: Ingress routes, CMC Analyst checks chemical validations, Nomenclature aligns regional glossaries, and Quality Reviewer ensures ALCOA+ safety. See their live workflow and payload structures simulated below.
          </p>
        </div>
      </div>

      {/* PROTOCOL NAVIGATION TABS */}
      <div className="flex border-b border-slate-900 gap-1 overflow-x-auto scrollbar-none">
        {[
          { id: 'orchestration', label: '1. Live Orchestrator (ADK/A2A)', icon: <Network className="w-4 h-4" /> },
          { id: 'mcp', label: '2. Model Context Protocol (MCP)', icon: <Terminal className="w-4 h-4" /> },
          { id: 'ord', label: '3. Open Resource Discovery (ORD)', icon: <Compass className="w-4 h-4" /> },
          { id: 'enterprise_connector', label: '4. Gemini Enterprise Link', icon: <Sparkles className="w-4 h-4" /> }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`${tab.id}-tab-button`}
              onClick={() => {
                setActiveTab(tab.id as any);
                triggerNotification(`Navigated to ${tab.label} section`, 'info');
              }}
              className={`relative px-4 py-3 text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center gap-2 whitespace-nowrap border-b-2 ${
                isActive 
                  ? 'border-emerald-400 text-emerald-400 bg-slate-900/30' 
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/10'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* CORE TAB PANELS */}
      <AnimatePresence mode="wait">
        
        {/* TAB 1: BACKGROUND ORCHESTRATION PIPELINE */}
        {activeTab === 'orchestration' && (
          <motion.div
            key="orchestration-panel"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* AGENT NODES FLOWCHART GRID */}
            <div className="bg-[#0b0f19]/40 border border-slate-900 rounded-3xl p-6 space-y-6 relative overflow-hidden">
              <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Boxes className="w-4 h-4 text-emerald-400 animate-spin" style={{ animationDuration: '6s' }} />
                    Active ADK Multi-Agent pipeline
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Sovereign background pipeline executing sequential compliance checks. Trigger below to see their state transitions and data hops.
                  </p>
                </div>

                <button
                  id="agent-execute-button"
                  disabled={isSimulating}
                  onClick={triggerSimulation}
                  className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                    isSimulating 
                      ? 'bg-slate-900 text-slate-500 border border-slate-800' 
                      : 'bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black hover:scale-[1.02] shadow-lg shadow-emerald-600/15'
                  }`}
                >
                  {isSimulating ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Orchestrating Campaign...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 shrink-0 fill-current" />
                      <span>Execute Campaign ({selectedDossier?.drugName})</span>
                    </>
                  )}
                </button>
              </div>

              {/* FLOW DIAGRAM */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
                {agents.map((agent, index) => {
                  const isProcessing = agent.status === 'processing';
                  const isDone = agent.status === 'done';
                  
                  return (
                    <div key={agent.id} className="relative flex flex-col justify-between">
                      {/* Connection arrow to next agent */}
                      {index < 3 && (
                        <div className="hidden md:block absolute top-10 right-[-14px] translate-x-1/2 z-20">
                          <ArrowRight className={`w-4 h-4 ${isDone ? 'text-emerald-400' : 'text-slate-700'}`} />
                        </div>
                      )}

                      <div className={`relative bg-slate-950 border rounded-2xl p-4 space-y-3 transition-all duration-300 h-full ${
                        isProcessing 
                          ? 'border-indigo-500 bg-[#0c101c]/90 ring-1 ring-indigo-500/20 shadow-indigo-500/5 shadow-lg' 
                          : isDone 
                          ? 'border-emerald-500/40 bg-slate-900/20' 
                          : 'border-slate-900 bg-slate-950/40'
                      }`}>
                        {/* Status top badge */}
                        <div className="flex justify-between items-center">
                          <span className="text-[8px] font-mono text-slate-500 uppercase tracking-wider">Agent Node {index + 1}</span>
                          <span className={`text-[8px] font-mono uppercase px-2 py-0.5 rounded-full font-black ${
                            isProcessing 
                              ? 'bg-indigo-500/25 text-indigo-400 animate-pulse'
                              : isDone 
                              ? 'bg-emerald-500/15 text-emerald-400'
                              : 'bg-slate-900 text-slate-500'
                          }`}>
                            {agent.status}
                          </span>
                        </div>

                        {/* Title and Icon */}
                        <div className="flex items-start gap-2.5">
                          <div className={`p-1.5 rounded-xl border ${
                            isProcessing 
                              ? 'bg-indigo-500/10 border-indigo-500/20' 
                              : 'bg-slate-900 border-slate-850'
                          }`}>
                            {agent.icon}
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-white truncate leading-tight">{agent.name}</h4>
                            <p className="text-[10px] text-slate-400 truncate leading-tight">{agent.role}</p>
                          </div>
                        </div>

                        <p className="text-[10px] text-slate-400 leading-relaxed line-clamp-2">
                          {agent.description}
                        </p>

                        {/* Badges/Capabilties */}
                        <div className="flex flex-wrap gap-1 pt-1.5 border-t border-slate-900">
                          {agent.capabilities.slice(0, 2).map(cap => (
                            <span key={cap} className="text-[8px] font-mono font-bold bg-[#030712] border border-slate-850 text-slate-400 px-1.5 py-0.5 rounded">
                              {cap}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* LIVE CONSOLE LOGS & ARTIFACT PREVIEW */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* ORCHESTRATION CONSOLE LOGS */}
              <div className="lg:col-span-2 bg-[#030712] border border-slate-900 rounded-3xl p-5 h-80 flex flex-col justify-between">
                <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-black text-slate-200 uppercase tracking-wider">A2A Pipeline Event Console</span>
                  </div>
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">A2A Protocol Broker</span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 font-mono text-xs pr-1 scrollbar-thin">
                  {simulationLogs.length > 0 ? (
                    simulationLogs.map((log, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 leading-relaxed text-[11px]">
                        <span className="text-slate-600 shrink-0 select-none">[{log.timestamp}]</span>
                        <span className={`
                          ${log.type === 'success' ? 'text-emerald-400 font-bold' : ''}
                          ${log.type === 'warn' ? 'text-amber-400' : ''}
                          ${log.type === 'agent' ? 'text-indigo-400' : ''}
                          ${log.type === 'info' ? 'text-slate-300' : ''}
                        `}>
                          {log.text}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-2">
                      <Terminal className="w-6 h-6 opacity-40 animate-pulse" />
                      <span className="text-[10px] uppercase font-bold tracking-wider">No active orchestration campaign running.</span>
                      <span className="text-[9px] text-slate-700">Click 'Execute Campaign' above to simulate background tasks.</span>
                    </div>
                  )}
                </div>
              </div>

              {/* HARMONIZED OUTPUT PREVIEW */}
              <div className="bg-[#0b0f19]/30 border border-slate-900 rounded-3xl p-5 flex flex-col justify-between h-80">
                <div className="space-y-1">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-slate-500 font-extrabold block">Background Pipeline Output</span>
                  <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Artifacts Sync Stream
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    This demonstrates how the orchestrated background campaign outputs its aligned dossier data directly into the user interface:
                  </p>
                </div>

                <div className="bg-slate-950 border border-slate-900 rounded-xl p-3.5 font-mono text-[10px] space-y-2.5 text-slate-300">
                  <div className="flex justify-between border-b border-slate-900 pb-1.5">
                    <span className="text-slate-500">Asset Targeted:</span>
                    <span className="text-white font-bold">{selectedDossier?.drugName}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-900 pb-1.5">
                    <span className="text-slate-500">Validation Status:</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      {isSimulating ? 'Processing...' : 'Compliant (Signed)'}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-900 pb-1.5">
                    <span className="text-slate-500">CFR Part 11 Hash:</span>
                    <span className="text-slate-400 select-all">sha256-4ogsqekm...</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Target Region:</span>
                    <span className="text-indigo-400 font-bold">{selectedDossier?.targetAuthorities.join(' • ')}</span>
                  </div>
                </div>

                <div className="text-[9px] font-mono text-slate-500 flex items-center gap-1 bg-[#030712] border border-slate-900 p-2 rounded-xl">
                  <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>Validated by <strong>Regulatory Auditor v1.2</strong> client.</span>
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {/* TAB 2: MODEL CONTEXT PROTOCOL (MCP) INTERACTIVE CONSOLE */}
        {activeTab === 'mcp' && (
          <motion.div
            key="mcp-panel"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* INTERACTIVE MCP CLIENT CONTROLLER */}
              <div className="bg-[#0b0f19]/30 border border-slate-900 rounded-3xl p-5 space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="p-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/15 rounded-lg">
                      <Terminal className="w-4 h-4" />
                    </span>
                    <h3 className="text-xs font-black uppercase text-slate-200 tracking-wider">MCP Client simulator</h3>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Query our MCP server using standard JSON-RPC 2.0 requests. Gemini Enterprise uses this exact protocol.
                  </p>
                </div>

                {/* SELECT MCP METHOD */}
                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block font-bold">Select MCP Method</label>
                  <select
                    value={selectedMcpMethod}
                    onChange={(e) => setSelectedMcpMethod(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-900 rounded-xl px-3 py-2 text-xs font-bold text-slate-300 focus:outline-none focus:border-indigo-500/50"
                  >
                    <option value="tools/list">List Tools (tools/list)</option>
                    <option value="tools/call">Call Tool (tools/call)</option>
                    <option value="resources/list">List Resources (resources/list)</option>
                    <option value="resources/read">Read Resource (resources/read)</option>
                  </select>
                </div>

                {/* DYNAMIC ARGUMENTS ACCORDING TO SELECTED METHOD */}
                {selectedMcpMethod === 'tools/call' && (
                  <div className="space-y-1 animate-fade-in">
                    <label className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block font-bold">Target Tool Name</label>
                    <select
                      value={mcpToolName}
                      onChange={(e) => setMcpToolName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-900 rounded-xl px-3 py-2 text-xs font-bold text-slate-300 focus:outline-none focus:border-indigo-500/50"
                    >
                      <option value="compliance_analyzer">compliance_analyzer</option>
                      <option value="vocabulary_aligner">vocabulary_aligner</option>
                    </select>
                  </div>
                )}

                {selectedMcpMethod === 'resources/read' && (
                  <div className="space-y-1 animate-fade-in">
                    <label className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block font-bold">Resource URI</label>
                    <input
                      type="text"
                      value={mcpResourceId}
                      onChange={(e) => setMcpResourceId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-900 rounded-xl px-3 py-2 text-xs font-bold text-slate-300 font-mono focus:outline-none focus:border-indigo-500/50"
                    />
                  </div>
                )}

                {/* SEND MCP CLIENT REQUEST BUTTON */}
                <button
                  id="mcp-submit-button"
                  disabled={isSendingMcp}
                  onClick={handleSendMcpRequest}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs py-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-indigo-600/10"
                >
                  {isSendingMcp ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending Payload...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5 fill-current shrink-0" />
                      <span>Send MCP JSON-RPC Request</span>
                    </>
                  )}
                </button>

                <div className="p-3 bg-slate-950/60 border border-slate-900 rounded-2xl space-y-1.5 text-[10px] text-slate-400">
                  <div className="flex items-center gap-1 font-bold text-indigo-400 uppercase tracking-wider font-mono text-[9px]">
                    <Info className="w-3 h-3" />
                    <span>Protocol Rule:</span>
                  </div>
                  <p className="leading-relaxed">
                    Model Context Protocol uses a secure JSON-RPC 2.0 client-server layer. The client (Gemini Enterprise) queries our server and dynamically gains file reading and analytical utility power.
                  </p>
                </div>
              </div>

              {/* LIVE MCP PROTOCOL PAYLOAD TELEMETRY MONITOR */}
              <div className="lg:col-span-2 bg-[#030712] border border-slate-900 rounded-3xl p-5 flex flex-col justify-between h-[450px]">
                <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-emerald-400 animate-pulse" />
                    <span className="text-xs font-black text-slate-200 uppercase tracking-wider">MCP Protocol Stream Logs</span>
                  </div>
                  <span className="text-[9px] font-mono text-emerald-500/80 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                    Server Active
                  </span>
                </div>

                {/* PROTOCOL MONITOR TERMINAL VIEW */}
                <div className="flex-1 overflow-y-auto space-y-4 font-mono text-xs pr-1 scrollbar-thin">
                  {mcpConsoleLogs.map((log, idx) => (
                    <div key={idx} className="space-y-1.5 border-b border-slate-900/60 pb-3 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between">
                        <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-md ${
                          log.type === 'request' 
                            ? 'bg-blue-500/15 text-blue-400 border border-blue-500/10' 
                            : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/10'
                        }`}>
                          {log.type === 'request' ? '→ Client Request (Gemini)' : '← Server Response'}
                        </span>
                        <button
                          onClick={() => copyToClipboard(log.payload, 'payload')}
                          className="text-slate-500 hover:text-slate-300 transition-colors p-1"
                          title="Copy payload"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <pre className="p-3 bg-slate-950 border border-slate-900/60 rounded-xl overflow-x-auto text-[10.5px] text-slate-300 select-all scrollbar-thin max-h-56">
                        {log.payload}
                      </pre>
                    </div>
                  ))}
                </div>

                <div className="text-[9px] font-mono text-slate-500 border-t border-slate-900 pt-3 mt-3 flex justify-between items-center">
                  <span>Conforms strictly with <strong>Model Context Protocol v2024-11-05</strong> schema.</span>
                  <span>SSL v3.0 Encrypted Broker</span>
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {/* TAB 3: OPEN RESOURCE DISCOVERY (ORD) MANIFEST */}
        {activeTab === 'ord' && (
          <motion.div
            key="ord-panel"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="bg-[#0b0f19]/40 border border-slate-900 rounded-3xl p-6 space-y-6 relative overflow-hidden">
              <div className="absolute right-0 top-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="space-y-1.5 border-b border-slate-900 pb-4">
                <div className="flex items-center gap-2">
                  <span className="p-1 bg-amber-500/10 text-amber-400 border border-amber-500/15 rounded-lg">
                    <Compass className="w-4 h-4 animate-spin" style={{ animationDuration: '8s' }} />
                  </span>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    Open Resource Discovery (ORD) Manifest System
                  </h3>
                </div>
                <p className="text-xs text-slate-400 max-w-3xl">
                  ORD is a standard protocol that allows enterprise service catalogs and LLM platforms like Gemini Enterprise to automatically crawl, discover, and authenticate local endpoints, data schemas, and API documentation rules dynamically.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* ORD ENDPOINT DEFINITIONS */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase font-mono tracking-widest text-slate-500">Auto-Discovered Schemas</h4>
                  
                  <div className="space-y-2.5">
                    {[
                      { name: 'dossier_reader', url: '/ord/v1/dossier-schema.json', desc: 'Auto-discovery structure for reading active substances.', status: 'published' },
                      { name: 'compliance_checker', url: '/ord/v1/compliance-schema.json', desc: 'Defines safety constraints audit schemas.', status: 'published' },
                      { name: 'nomenclature_translator', url: '/ord/v1/nomenclature-schema.json', desc: 'Maps translations dictionary models.', status: 'published' }
                    ].map((schema) => (
                      <div key={schema.name} className="bg-slate-950 border border-slate-900 hover:border-slate-800 transition-all rounded-2xl p-4 space-y-2 select-none">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-black text-white font-mono">{schema.name}</span>
                          <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 px-2 py-0.5 rounded-full font-bold uppercase">
                            {schema.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-normal">{schema.desc}</p>
                        <div className="text-[9px] font-mono text-slate-500 flex items-center gap-1 pt-1.5 border-t border-slate-900">
                          <ExternalLink className="w-3 h-3 text-amber-400" />
                          <span>{schema.url}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* THE ORD MANIFEST FILE (JSON VIEW) */}
                <div className="lg:col-span-2 bg-[#030712] border border-slate-900 rounded-3xl p-5 flex flex-col justify-between">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-3">
                    <div className="flex items-center gap-2">
                      <FileJson className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-black text-slate-200 font-mono">/.well-known/open-resource-discovery-manifest.json</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(JSON.stringify({
                        "$schema": "https://open-resource-discovery.org/schemas/v1/manifest.json",
                        "ordVersion": "1.4.0",
                        "publishedAt": new Date().toISOString(),
                        "ownerId": "pharma-harmonizer-id-9432",
                        "packages": [
                          {
                            "id": "package.ctd-regulatory-alignment",
                            "title": "eCTD Regulatory Alignment Pack",
                            "description": "Multi-agent systems targeting FDA, EMA, PMDA compliance.",
                            "apiResources": [
                              {
                                "id": "api.mcp-gateway-service",
                                "title": "Model Context Protocol Broker Service",
                                "entryPoints": ["/api/mcp"]
                              }
                            ]
                          }
                        ]
                      }, null, 2), 'ORD Manifest')}
                      className="text-slate-500 hover:text-slate-300 transition-colors p-1"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>

                  <pre className="flex-1 p-4 bg-slate-950 border border-slate-900/60 rounded-2xl overflow-y-auto text-[11px] font-mono text-slate-300 leading-relaxed max-h-[300px] scrollbar-thin select-all">
                    {`{
  "$schema": "https://open-resource-discovery.org/schemas/v1/manifest.json",
  "ordVersion": "1.4.0",
  "publishedAt": "2026-06-29T10:00:00Z",
  "ownerId": "pharma-harmonizer-id-9432",
  "packages": [
    {
      "id": "package.ctd-regulatory-alignment",
      "title": "eCTD Regulatory Alignment Package",
      "shortDescription": "Multi-agent systems targeting FDA, EMA, PMDA compliance.",
      "version": "1.0.0",
      "apiResources": [
        {
          "id": "api.mcp-gateway-service",
          "title": "Model Context Protocol Broker Service",
          "entryPoints": [
            "/api/mcp"
          ]
        }
      ],
      "products": [
        {
          "id": "product.adk-orchestrator",
          "title": "ADK Agentic Pipeline Service"
        }
      ]
    }
  ]
}`}
                  </pre>

                  <div className="text-[9px] font-mono text-slate-500 border-t border-slate-900 pt-3 mt-3">
                    Conformance score verified using **OKF (Open Knowledge Framework)** compliance models.
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 4: GEMINI ENTERPRISE CONNECTIVITY GUIDE */}
        {activeTab === 'enterprise_connector' && (
          <motion.div
            key="connector-panel"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="bg-[#0b0f19]/40 border border-slate-900 rounded-3xl p-6 lg:p-8 space-y-6 relative overflow-hidden">
              <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="space-y-1.5 border-b border-slate-900 pb-5">
                <div className="flex items-center gap-2">
                  <span className="p-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg">
                    <Sparkles className="w-4 h-4 animate-pulse" />
                  </span>
                  <h3 className="text-base font-black text-white uppercase tracking-wider">
                    Integrating directly into Gemini Enterprise / Gemini Advanced
                  </h3>
                </div>
                <p className="text-xs text-slate-400">
                  Follow these instructions to connect this running agentic backend directly into your enterprise Gemini workspace, enabling you to query, run stability predictions, or audit dossiers from your standard corporate chat.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* CONNECTIVITY CONFIGURATION */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase font-mono tracking-widest text-indigo-400">Integration Configuration</h4>
                  
                  <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
                    <p>
                      Gemini Enterprise supports connecting to external Model Context Protocol (MCP) servers. By declaring the configuration below, Gemini will dynamically load our tools into its reasoning chain.
                    </p>

                    <div className="space-y-2 border-l-2 border-emerald-500/30 pl-4 py-1">
                      <span className="font-bold text-white block">Step 1: Save Server Manifest</span>
                      <p className="text-[11px] text-slate-400">
                        Copy the adjacent MCP Configuration file and save it locally on your development system or cloud server workspace under: <code className="text-emerald-400 font-mono">gemini-mcp-config.json</code>.
                      </p>
                    </div>

                    <div className="space-y-2 border-l-2 border-indigo-500/30 pl-4 py-1">
                      <span className="font-bold text-white block">Step 2: Add to Gemini Settings</span>
                      <p className="text-[11px] text-slate-400">
                        Open the **Gemini Enterprise Admin Console**, navigate to **Extensions & Integrations &gt; Model Context Protocol**, and upload your JSON config.
                      </p>
                    </div>

                    <div className="space-y-2 border-l-2 border-purple-500/30 pl-4 py-1">
                      <span className="font-bold text-white block">Step 3: Ask Gemini natively</span>
                      <p className="text-[11px] text-slate-400">
                        You can now prompt Gemini Advanced: <br />
                        <code className="text-purple-400 font-mono italic">"Check our local eCTD dossier keytruda for any nomenclature gaps under FDA guidelines"</code>.<br />
                        Gemini will automatically route this through our server to fetch compliant answers!
                      </p>
                    </div>
                  </div>
                </div>

                {/* THE INTEGRATION CONFIG FILE */}
                <div className="bg-[#030712] border border-slate-900 rounded-3xl p-5 flex flex-col justify-between">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-3">
                    <div className="flex items-center gap-2">
                      <Settings className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-black text-slate-200 font-mono">gemini-mcp-config.json</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(JSON.stringify({
                        "mcpServers": {
                          "pharma-harmonizer": {
                            "command": "node",
                            "args": ["dist/server.cjs"],
                            "env": {
                              "GEMINI_API_KEY": "YOUR_API_KEY_HERE"
                            }
                          }
                        }
                      }, null, 2), 'Gemini Config')}
                      className="text-slate-500 hover:text-slate-300 transition-colors p-1"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>

                  <pre className="flex-1 p-4 bg-slate-950 border border-slate-900/60 rounded-2xl overflow-y-auto text-[11px] font-mono text-slate-300 leading-relaxed max-h-[250px] scrollbar-thin select-all">
                    {`{
  "mcpServers": {
    "pharma-harmonizer-mcp": {
      "command": "node",
      "args": [
        "dist/server.cjs"
      ],
      "env": {
        "GEMINI_API_KEY": "YOUR_API_KEY_HERE"
      }
    }
  }
}`}
                  </pre>

                  <div className="text-[9px] font-mono text-slate-500 border-t border-slate-900 pt-3 mt-3 flex justify-between items-center">
                    <span>Ensures secure sandbox execution boundaries.</span>
                    <span className="flex items-center gap-1 text-emerald-400 font-bold">
                      <ShieldCheck className="w-3.5 h-3.5" /> Secure Link
                    </span>
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
}

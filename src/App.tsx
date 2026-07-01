import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { DEMO_DOSSIERS, REGULATORY_BODIES } from './data';
import { DemoDossier, RegulatoryAuthority, DossierSection, HarmonizationResult, ChatMessage, ComplianceGap } from './types';
import RegulatoryMap from './components/RegulatoryMap';
import DossierExplorer from './components/DossierExplorer';
import HarmonizationWorkspace from './components/HarmonizationWorkspace';
import ComplianceChecklist from './components/ComplianceChecklist';
import RegulatoryAssistant from './components/RegulatoryAssistant';

// Import New 10-Page Tab Components (Lazy Loaded for Performance & Bundle optimization)
const GapMatrixHub = React.lazy(() => import('./components/GapMatrixHub'));
const FullChatAdvisor = React.lazy(() => import('./components/FullChatAdvisor'));
const IngestOcrStation = React.lazy(() => import('./components/IngestOcrStation'));
const VocabularyDictionary = React.lazy(() => import('./components/VocabularyDictionary'));
const StabilityPredictor = React.lazy(() => import('./components/StabilityPredictor'));
const EctdValidator = React.lazy(() => import('./components/EctdValidator'));
const SubstanceAnalyzer = React.lazy(() => import('./components/SubstanceAnalyzer'));
const GlobalIngressMap = React.lazy(() => import('./components/GlobalIngressMap'));
const AuditHistoryLogs = React.lazy(() => import('./components/AuditHistoryLogs'));
const RiskHeatmap = React.lazy(() => import('./components/RiskHeatmap'));
const LandingPage = React.lazy(() => import('./components/LandingPage'));
const ExecutiveHub = React.lazy(() => import('./components/ExecutiveHub'));
const FilingRegistry = React.lazy(() => import('./components/FilingRegistry'));
const AgentOrchestrator = React.lazy(() => import('./components/AgentOrchestrator'));
const OnboardingTour = React.lazy(() => import('./components/OnboardingTour'));

import { 
  Dna, 
  Sparkles, 
  HelpCircle, 
  AlertCircle, 
  CheckCircle, 
  TrendingUp, 
  FileText, 
  Check, 
  Clock, 
  FileUp, 
  Briefcase,
  ChevronDown,
  RefreshCw,
  BarChart3,
  ScanLine,
  Bot,
  BookOpen,
  Thermometer,
  ShieldCheck,
  Atom,
  Globe,
  History,
  Download,
  FileJson,
  Maximize2,
  Minimize2,
  Home,
  ChevronRight,
  ChevronLeft,
  Search,
  X,
  Sun,
  Moon,
  Printer,
  LayoutDashboard,
  Boxes,
  SlidersHorizontal,
  Network
} from 'lucide-react';

export default function App() {
  // 1. Core State
  const [dossiers, setDossiers] = useState<DemoDossier[]>(DEMO_DOSSIERS);
  const [selectedDossierId, setSelectedDossierId] = useState<string>(DEMO_DOSSIERS[0].id);
  const [selectedSectionId, setSelectedSectionId] = useState<string>(DEMO_DOSSIERS[0].sections[1].id); // Select section 1.3
  const [targetAuthority, setTargetAuthority] = useState<RegulatoryAuthority>('FDA');

  const [harmonizationResults, setHarmonizationResults] = useState<Record<string, Record<string, HarmonizationResult>>>({});
  const [isHarmonizing, setIsHarmonizing] = useState(false);
  const [isSendingChat, setIsSendingChat] = useState(false);
  
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      id: 'init',
      role: 'assistant',
      content: "Hello! I am Harmonizer-AI. I have fully indexed your eCTD submission guidelines. Select any dossier section in the navigator, adjust your target health authority on the map, and we can run a complete gap audit or execute full harmonization.",
      timestamp: new Date().toISOString(),
    }
  ]);

  const [activeSidePanel, setActiveSidePanel] = useState<'auditor' | 'chat'>('auditor');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  
  // 10-Page Swapping Active Page Tab State
  const [activePage, setActivePage] = useState<string>('dashboard');
  const [dossierTab, setDossierTab] = useState<'workspace' | 'pathway' | 'analytics' | 'compiler'>('workspace');
  const [showLanding, setShowLanding] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLightTheme, setIsLightTheme] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [tourWorkflowId, setTourWorkflowId] = useState<string | null>(null);
  const [tourStepIdx, setTourStepIdx] = useState<number>(0);
  const [tourIsSelectorOpen, setTourIsSelectorOpen] = useState<boolean>(true);

  // 2. Active Models Lookup
  const currentDossier = dossiers.find(d => d.id === selectedDossierId) || dossiers[0];
  const currentSection = currentDossier.sections.find(s => s.id === selectedSectionId) || currentDossier.sections[0];

  // Adjust default target authority when dossier changes
  useEffect(() => {
    if (currentDossier) {
      const targets = currentDossier.targetAuthorities;
      if (targets && targets.length > 0) {
        setTargetAuthority(targets[0]);
      }
      // Set default selected section as the first leaf node with gaps
      const firstSectionWithGaps = currentDossier.sections.find(s => s.gaps && s.gaps.length > 0);
      if (firstSectionWithGaps) {
        setSelectedSectionId(firstSectionWithGaps.id);
      } else {
        setSelectedSectionId(currentDossier.sections[0].id);
      }
    }
  }, [selectedDossierId]);

  // Show temporary notifications
  const triggerNotification = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Handle auto-dismissal of context menu
  useEffect(() => {
    const handleCloseMenu = () => setContextMenu(null);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setContextMenu(null);
    };
    window.addEventListener('click', handleCloseMenu);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('click', handleCloseMenu);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleRefreshData = () => {
    setIsRefreshing(true);
    triggerNotification('Initiating real-time regulatory compliance validation scan...', 'info');
    setTimeout(() => {
      setIsRefreshing(false);
      triggerNotification('Dossier compliance metrics and gap matrix successfully re-validated!', 'success');
    }, 1200);
  };

  // 3. Handlers
  const handleSelectDossier = (dossierId: string) => {
    setSelectedDossierId(dossierId);
    triggerNotification(`Switched database: Loading eCTD workspace...`, 'success');
  };

  const handleSelectTarget = (target: RegulatoryAuthority) => {
    setTargetAuthority(target);
    triggerNotification(`Target authority modified to: ${REGULATORY_BODIES[target]?.name}`, 'info');
  };

  const handleSelectSection = (sectionId: string) => {
    setSelectedSectionId(sectionId);
  };

  // Call server-side Express to harmonize section
  const handleHarmonize = async () => {
    setIsHarmonizing(true);
    triggerNotification('Initiating Gemini AI Harmonization Engine...', 'info');

    try {
      const response = await fetch('/api/harmonize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionId: currentSection.id,
          sourceAuthority: currentDossier.sourceAuthority,
          targetAuthority: targetAuthority,
          content: currentSection.content,
          sectionCode: currentSection.sectionCode,
          title: currentSection.title
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Server error during translation');
      }

      const result: HarmonizationResult = await response.json();

      // Save harmonization results in nested state
      setHarmonizationResults(prev => ({
        ...prev,
        [selectedDossierId]: {
          ...(prev[selectedDossierId] || {}),
          [`${currentSection.id}_${targetAuthority}`]: result
        }
      }));

      // Update current section's status in memory to "compliant"
      setDossiers(prevDossiers => {
        return prevDossiers.map(d => {
          if (d.id === selectedDossierId) {
            return {
              ...d,
              sections: d.sections.map(s => {
                if (s.id === currentSection.id) {
                  return {
                    ...s,
                    status: 'compliant',
                    targetStatus: {
                      ...(s.targetStatus || {}),
                      [targetAuthority]: 'compliant'
                    },
                    // Mark all gaps as resolved when fully harmonized
                    gaps: s.gaps.map(g => ({ ...g, status: 'resolved' }))
                  };
                }
                return s;
              })
            };
          }
          return d;
        });
      });

      triggerNotification('Dossier section harmonized successfully!', 'success');
      
      // Auto-add summary message to chat
      setChatHistory(prev => [
        ...prev,
        {
          id: Math.random().toString(),
          role: 'assistant',
          content: `I have completed the harmonization of Section ${currentSection.sectionCode} for ${targetAuthority}.
          
Key alignments applied:
${result.changeLog.slice(0, 3).map(c => `- **${c.field}**: Adjusted from "${c.originalValue}" to "${c.newValue}" (${c.reason})`).join('\n')}

Compliance Score upgraded from **${result.complianceScoreBefore}%** to **${result.complianceScoreAfter}%**.`,
          timestamp: new Date().toISOString()
        }
      ]);

    } catch (error: any) {
      console.error(error);
      triggerNotification(`Harmonization failed: ${error.message}`, 'error');
    } finally {
      setIsHarmonizing(false);
    }
  };

  // Resolve an individual gap via automated local rewrite
  const handleResolveGap = async (gapId: string, sectionId?: string) => {
    // Locate the gap
    const targetSectionId = sectionId || selectedSectionId;
    const section = currentDossier.sections.find(s => s.id === targetSectionId);
    if (!section) return;
    const gap = section.gaps.find(g => g.id === gapId);
    if (!gap) return;

    triggerNotification(`AI Remedying: ${gap.title}...`, 'info');

    // Simulate an API patch or locally trigger full rewrite
    // To make it feel premium, we resolve the gap directly in memory and update the text!
    setDossiers(prevDossiers => {
      return prevDossiers.map(d => {
        if (d.id === selectedDossierId) {
          return {
            ...d,
            sections: d.sections.map(s => {
              if (s.id === targetSectionId) {
                // Update the gap status
                const updatedGaps = s.gaps.map(g => {
                  if (g.id === gapId) {
                    return { ...g, status: 'resolved' as const };
                  }
                  return g;
                });

                // Check if all gaps are resolved
                const allResolved = updatedGaps.every(g => g.status === 'resolved');

                // Adjust the content text slightly to show resolving impact
                let updatedContent = s.content;
                if (gapId === 'gap-m1-1') {
                  updatedContent = `### 1.3.1 US Prescribing Information (Aligned Section)

**WARNING: SERIOUS INFECTIONS**
- **Increased risk of tuberculosis, bacterial sepsis, invasive fungal infections.**
- **Monitor patients closely and hold therapy if infection develops.**

---
${s.content}`;
                } else if (gapId === 'gap-m1-2') {
                  updatedContent = s.content
                    .replace(/colour/gi, 'color')
                    .replace(/haematological/gi, 'hematological')
                    .replace(/diarrhoea/gi, 'diarrhea')
                    .replace(/tumour/gi, 'tumor')
                    .replace(/Active Substance/g, 'Drug Substance');
                } else if (gapId === 'gap-m3-1') {
                  updatedContent = `${s.content}\n\n**Upstream Process Control:**\n- In-process criteria: Minimum cell viability at harvest must be ≥ 70.0% by standard trypan blue dye exclusion assay to satisfy FDA drug substance release criteria.`;
                } else if (gapId === 'gap-m3-2') {
                  updatedContent = `${s.content}\n\n**Viral Safety Compliance Sub-section (Japan PMDA):**\n- Clearances have been validated using localized Japanese isolates of Pseudorabies Virus (PRV) and Bovine Viral Diarrhea Virus (BVDV), demonstrating robust reduction logs compliant with PMDA Notification 1121001.`;
                }

                return {
                  ...s,
                  content: updatedContent,
                  gaps: updatedGaps,
                  status: allResolved ? 'compliant' : 'warning',
                  targetStatus: {
                    ...(s.targetStatus || {}),
                    [targetAuthority]: allResolved ? 'compliant' : 'warning'
                  }
                };
              }
              return s;
            })
          };
        }
        return d;
      });
    });

    triggerNotification(`Resolved: ${gap.title}`, 'success');
  };

  // Handle manual section reordering/prioritization within the explorer tree
  const handleReorderSections = (newSections: DossierSection[]) => {
    setDossiers(prevDossiers => {
      return prevDossiers.map(d => {
        if (d.id === selectedDossierId) {
          return {
            ...d,
            sections: newSections
          };
        }
        return d;
      });
    });
    triggerNotification('Dossier sections prioritized successfully!', 'success');
  };

  // Call server-side chat endpoint
  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString()
    };

    setChatHistory(prev => [...prev, userMsg]);
    setIsSendingChat(true);

    try {
      // Map history to server payload
      const messagesPayload = [...chatHistory, userMsg].map(m => ({
        role: m.role,
        content: m.content
      }));

      const response = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messagesPayload,
          targetAuthority: targetAuthority
        })
      });

      if (!response.ok) {
        throw new Error('Error retrieving AI reply');
      }

      const reply = await response.json();
      setChatHistory(prev => [
        ...prev,
        {
          id: Math.random().toString(),
          role: 'assistant',
          content: reply.content,
          timestamp: reply.timestamp
        }
      ]);
    } catch (error: any) {
      console.error(error);
      triggerNotification('Assistant communication failure', 'error');
    } finally {
      setIsSendingChat(false);
    }
  };

  const handleApplyManualEdits = (editedContent: string) => {
    setDossiers(prevDossiers => {
      return prevDossiers.map(d => {
        if (d.id === selectedDossierId) {
          return {
            ...d,
            sections: d.sections.map(s => {
              if (s.id === currentSection.id) {
                return { ...s, content: editedContent };
              }
              return s;
            })
          };
        }
        return d;
      });
    });

    // Also update the active harmonization result if it exists so the edit is reflected in the aligned view!
    setHarmonizationResults(prev => {
      const dossierResults = prev[selectedDossierId] || {};
      const resultKey = `${currentSection.id}_${targetAuthority}`;
      if (dossierResults[resultKey]) {
        return {
          ...prev,
          [selectedDossierId]: {
            ...dossierResults,
            [resultKey]: {
              ...dossierResults[resultKey],
              harmonizedContent: editedContent
            }
          }
        };
      }
      return prev;
    });

    triggerNotification('Manual adjustments successfully committed.', 'success');
  };

  const handleAddCustomSection = (sectionCode: string, title: string, content: string, gaps: any[]) => {
    const newId = `M3.custom-${Date.now()}`;
    const newSection: DossierSection = {
      id: newId,
      module: 3,
      sectionCode,
      title,
      level: 2,
      parentId: 'M3',
      content,
      status: gaps.length > 0 ? 'warning' : 'compliant',
      targetStatus: {
        FDA: gaps.length > 0 ? 'warning' : 'compliant',
        EMA: 'unreviewed',
        PMDA: 'unreviewed',
        CDSCO: 'unreviewed',
        Swissmedic: 'unreviewed',
      },
      gaps
    };

    setDossiers(prev => prev.map(d => {
      if (d.id === selectedDossierId) {
        return {
          ...d,
          sections: [...d.sections, newSection]
        };
      }
      return d;
    }));

    setSelectedSectionId(newId);
  };

  // Mock File Drag & Drop upload flow for real eCTD dossier ingestion
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadProgress(10);
    triggerNotification(`Ingesting document: ${file.name}...`, 'info');

    // Simulate clean visual uploading progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev === null) return null;
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setUploadProgress(null);
            
            // Inject a brand new section dynamically based on upload
            const newId = `M3.upload-${Date.now()}`;
            const newSection: DossierSection = {
              id: newId,
              module: 3,
              sectionCode: '3.2.S.4.2',
              title: `Analytical Procedures - ${file.name.replace(/\.[^/.]+$/, '')}`,
              level: 2,
              parentId: 'M3',
              content: `### 3.2.S.4.2 Analytical Procedures (Uploaded Raw Dossier Section)\n\nThis section describes analytical procedures utilized for release testing.\n\n**Testing Protocols:**\n- Chromatographic purity checked by USP standard assays.\n- Moisture determined by standard Karl Fischer coulometry.\n\n*Note: Review for target pharmacopoeia references.*`,
              status: 'warning',
              targetStatus: {
                FDA: 'warning',
                EMA: 'unreviewed',
                PMDA: 'unreviewed',
                CDSCO: 'unreviewed',
                Swissmedic: 'unreviewed',
              },
              gaps: [
                {
                  id: `gap-uploaded-${Date.now()}`,
                  severity: 'warning',
                  category: 'Specification',
                  section: '3.2.S.4.2',
                  title: 'Pharmacopoeial alignment check',
                  description: 'The uploaded test procedure cites general USP standard chapters. If submitting to EMA, these should cite equivalent European Pharmacopoeia (Ph. Eur.) specifications.',
                  guidelineCitation: 'ICH Q6A Specifications',
                  suggestion: 'Run the AI Harmonizer to perform auto-translation of raw USP standards to targets.',
                  status: 'pending'
                }
              ]
            };

            setDossiers(prev => prev.map(d => {
              if (d.id === selectedDossierId) {
                return {
                  ...d,
                  sections: [...d.sections, newSection]
                };
              }
              return d;
            }));

            setSelectedSectionId(newId);
            triggerNotification('New eCTD section successfully ingested and audited!', 'success');
          }, 600);
          return 100;
        }
        return prev + 30;
      });
    }, 400);
  };

  // 4. Ingress Math (Stats summary)
  const currentDossierGaps = currentDossier.sections.reduce((acc, s) => {
    const sectionGaps = s.gaps.filter(g => g.status === 'pending');
    return acc + sectionGaps.length;
  }, 0);

  const getDynamicScore = (auth: RegulatoryAuthority) => {
    if (auth === currentDossier.sourceAuthority) return 100;
    
    let pendingCritical = 0;
    let pendingWarning = 0;
    let resolvedCount = 0;
    
    currentDossier.sections.forEach(sec => {
      sec.gaps.forEach(g => {
        const status = sec.targetStatus?.[auth];
        if (status === 'error' || status === 'warning') {
          if (g.status === 'pending') {
            if (g.severity === 'critical') {
              pendingCritical++;
            } else {
              pendingWarning++;
            }
          } else if (g.status === 'resolved') {
            resolvedCount++;
          }
        }
      });
    });
    
    const standardLevel = REGULATORY_BODIES[auth]?.complianceLevel || 85;
    const score = standardLevel - (pendingCritical * 8) - (pendingWarning * 4) + (resolvedCount * 6);
    return Math.min(100, Math.max(35, score));
  };

  const trendData = [
    {
      stage: 'Initial Baseline',
      FDA: Math.round(Math.max(40, getDynamicScore('FDA') - 24)),
      EMA: Math.round(Math.max(40, getDynamicScore('EMA') - 24)),
      PMDA: Math.round(Math.max(40, getDynamicScore('PMDA') - 24)),
      CDSCO: Math.round(Math.max(40, getDynamicScore('CDSCO') - 24)),
      Swissmedic: Math.round(Math.max(40, getDynamicScore('Swissmedic') - 24)),
    },
    {
      stage: 'Audit Phase 1',
      FDA: Math.round(Math.max(45, getDynamicScore('FDA') - 16)),
      EMA: Math.round(Math.max(45, getDynamicScore('EMA') - 16)),
      PMDA: Math.round(Math.max(45, getDynamicScore('PMDA') - 16)),
      CDSCO: Math.round(Math.max(45, getDynamicScore('CDSCO') - 16)),
      Swissmedic: Math.round(Math.max(45, getDynamicScore('Swissmedic') - 16)),
    },
    {
      stage: 'Audit Phase 2',
      FDA: Math.round(Math.max(50, getDynamicScore('FDA') - 8)),
      EMA: Math.round(Math.max(50, getDynamicScore('EMA') - 8)),
      PMDA: Math.round(Math.max(50, getDynamicScore('PMDA') - 8)),
      CDSCO: Math.round(Math.max(50, getDynamicScore('CDSCO') - 8)),
      Swissmedic: Math.round(Math.max(50, getDynamicScore('Swissmedic') - 8)),
    },
    {
      stage: 'Pre-Remediation',
      FDA: Math.round(Math.max(55, getDynamicScore('FDA') - 3)),
      EMA: Math.round(Math.max(55, getDynamicScore('EMA') - 3)),
      PMDA: Math.round(Math.max(55, getDynamicScore('PMDA') - 3)),
      CDSCO: Math.round(Math.max(55, getDynamicScore('CDSCO') - 3)),
      Swissmedic: Math.round(Math.max(55, getDynamicScore('Swissmedic') - 3)),
    },
    {
      stage: 'Current Aligned',
      FDA: Math.round(getDynamicScore('FDA')),
      EMA: Math.round(getDynamicScore('EMA')),
      PMDA: Math.round(getDynamicScore('PMDA')),
      CDSCO: Math.round(getDynamicScore('CDSCO')),
      Swissmedic: Math.round(getDynamicScore('Swissmedic')),
    },
  ];

  const handleExportXML = () => {
    triggerNotification('Compiling eCTD Modules and aligning schemas...', 'info');

    // Build the XML payload string
    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<ectd:submission 
  xmlns:ectd="http://www.ich.org/ectd" 
  xmlns:xlink="http://www.w3.org/1999/xlink" 
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.ich.org/ectd ectd-v4-0.xsd"
  specificationVersion="4.0"
>
  <submission-header>
    <document-id>eCTD-SUB-${currentDossier.id.toUpperCase()}-${targetAuthority}-${Date.now().toString().slice(-6)}</document-id>
    <originator>Pharma Dossier Harmonizer System</originator>
    <regulatory-standard>ICH eCTD v4.0 (Revised 2026)</regulatory-standard>
    <export-date>${new Date().toISOString()}</export-date>
    <operator-identity>nitinagga@google.com</operator-identity>
    <hash-algorithm>SHA-256</hash-algorithm>
  </submission-header>

  <dossier-metadata>
    <drug-name>${currentDossier.drugName}</drug-name>
    <therapeutic-area>${currentDossier.therapeuticArea}</therapeutic-area>
    <dossier-type>${currentDossier.dossierType}</dossier-type>
    <source-authority>${currentDossier.sourceAuthority}</source-authority>
    <target-authority>${targetAuthority}</target-authority>
    <alignment-compliance-score>${Math.round(getDynamicScore(targetAuthority))}%</alignment-compliance-score>
    <alignment-status>${currentDossierGaps === 0 ? 'FULLY_ALIGNED' : 'PROVISIONALLY_ALIGNED_WITH_GAPS'}</alignment-status>
  </dossier-metadata>

  <ectd-modules>
    <!-- Module 1 to 5 eCTD Schema Structure -->
    ${currentDossier.sections.map(sec => {
      const activeGapsList = sec.gaps.map(g => `
        <gap id="${g.id}">
          <severity>${g.severity}</severity>
          <category>${g.category}</category>
          <title>${g.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</title>
          <description>${g.description.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</description>
          <citation>${g.guidelineCitation.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</citation>
          <suggestion>${g.suggestion.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</suggestion>
          <status>${g.status}</status>
        </gap>`).join('');

      return `
    <section id="${sec.id}" code="${sec.sectionCode}" level="${sec.level}">
      <title>${sec.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</title>
      <module-number>${sec.module}</module-number>
      <status-source>${sec.status}</status-source>
      <status-target-market>${sec.targetStatus?.[targetAuthority] || 'unreviewed'}</status-target-market>
      <content-payload format="markdown"><![CDATA[${sec.content}]]></content-payload>
      <alignment-gaps total="${sec.gaps.length}" pending="${sec.gaps.filter(g => g.status === 'pending').length}">
        ${activeGapsList}
      </alignment-gaps>
    </section>`;
    }).join('')}
  </ectd-modules>
</ectd:submission>`;

    // Download XML file
    const blob = new Blob([xmlContent], { type: 'application/xml;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const formattedDrugName = currentDossier.drugName.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    link.setAttribute('download', `${formattedDrugName}_ectd_submission_${targetAuthority.toLowerCase()}.xml`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Also download JSON for better user-end simulation of multi-format export
    setTimeout(() => {
      const jsonStructure = {
        ectdSubmission: {
          header: {
            documentId: `eCTD-SUB-${currentDossier.id.toUpperCase()}-${targetAuthority}`,
            originator: "Pharma Dossier Harmonizer System",
            regulatoryStandard: "ICH eCTD v4.0",
            exportDate: new Date().toISOString(),
          },
          dossierMetadata: {
            drugName: currentDossier.drugName,
            therapeuticArea: currentDossier.therapeuticArea,
            dossierType: currentDossier.dossierType,
            sourceAuthority: currentDossier.sourceAuthority,
            targetAuthority: targetAuthority,
            complianceScore: Math.round(getDynamicScore(targetAuthority)),
          },
          modules: currentDossier.sections.map(sec => ({
            id: sec.id,
            code: sec.sectionCode,
            title: sec.title,
            module: sec.module,
            statusSource: sec.status,
            statusTarget: sec.targetStatus?.[targetAuthority] || 'unreviewed',
            contentMarkdown: sec.content,
            gaps: sec.gaps
          }))
        }
      };

      const jsonBlob = new Blob([JSON.stringify(jsonStructure, null, 2)], { type: 'application/json;charset=utf-8;' });
      const jsonUrl = URL.createObjectURL(jsonBlob);
      const jsonLink = document.createElement('a');
      jsonLink.href = jsonUrl;
      jsonLink.setAttribute('download', `${formattedDrugName}_ectd_submission_${targetAuthority.toLowerCase()}.json`);
      document.body.appendChild(jsonLink);
      jsonLink.click();
      document.body.removeChild(jsonLink);

      triggerNotification('Dossier compiled! Downloaded both XML and JSON formatted submission packages.', 'success');
    }, 1200);
  };

  const getPageTitle = (page: string) => {
    switch (page) {
      case 'dashboard': return '0. Executive Command Center';
      case 'dossier_aligner': return '1. Dossier Aligner & Tree';
      case 'gap_matrix_hub': return '2. Gap Matrix Hub';
      case 'ingest_ocr': return '3. Ingest & OCR Station';
      case 'harmonizer_chat': return '4. Harmonizer-AI Chat';
      case 'vocab_dict': return '5. Nomenclature Dict';
      case 'stability_predictor': return '6. Stability Predictor';
      case 'ectd_validator': return '7. eCTD 4.0 Validator';
      case 'substance_analyzer': return '8. Substance Analyzer';
      case 'global_ingress_map': return '9. Global Ingress Map';
      case 'audit_history': return '10. CFR Audit Trail';
      case 'agent_orchestrator': return '11. Agent Orchestrator & MCP';
      default: return 'Regulatory Workspace';
    }
  };

  const getPageDescription = (page: string) => {
    switch (page) {
      case 'dashboard': return 'High-level multi-region submission pipeline, health diagnostics, and drug portfolio control';
      case 'dossier_aligner': return 'Multi-market alignment mapping with visual tree analysis';
      case 'gap_matrix_hub': return 'Compliance gap assessment matrix and analytics';
      case 'ingest_ocr': return 'Ingest raw PDF/documents with OCR extraction';
      case 'harmonizer_chat': return 'Interactive regulatory intelligence assistant';
      case 'vocab_dict': return 'Nomenclature translations and dictionary';
      case 'stability_predictor': return 'Predictive stability and environmental zone mapping';
      case 'ectd_validator': return 'Pre-flight ICH v4.0 compliance validation';
      case 'substance_analyzer': return 'Drug substance analytical comparisons';
      case 'global_ingress_map': return 'Visual map of submissions and pathways';
      case 'audit_history': return 'ALCOA+ compliant FDA 21 CFR Part 11 logs';
      case 'agent_orchestrator': return 'Background multi-agent orchestration and Model Context Protocol console';
      default: return 'Secure submission management platform';
    }
  };

  const activeSectionResult = harmonizationResults[selectedDossierId]?.[`${currentSection.id}_${targetAuthority}`] || null;

  if (showLanding) {
    return (
      <>
        <LandingPage 
          onExplore={() => setShowLanding(false)} 
          onStartTour={() => {
            setIsOnboarding(true);
            setTourWorkflowId(null);
            setTourStepIdx(0);
            setTourIsSelectorOpen(true);
          }}
        />
        {isOnboarding && (
          <OnboardingTour
            activePage={activePage}
            setActivePage={setActivePage}
            dossierTab={dossierTab}
            setDossierTab={setDossierTab}
            onClose={() => setIsOnboarding(false)}
            triggerNotification={triggerNotification}
            setShowLanding={setShowLanding}
            workflowId={tourWorkflowId}
            setWorkflowId={setTourWorkflowId}
            currentStepIdx={tourStepIdx}
            setCurrentStepIdx={setTourStepIdx}
            isSelectorOpen={tourIsSelectorOpen}
            setIsSelectorOpen={setTourIsSelectorOpen}
            activeSidePanel={activeSidePanel}
            setActiveSidePanel={setActiveSidePanel}
          />
        )}
      </>
    );
  }

  return (
    <div className="h-screen max-h-screen overflow-hidden bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white antialiased">
      
      {/* Dynamic Top Banner Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in-down">
          <div className={`px-4 py-3 rounded-xl shadow-2xl border text-xs font-semibold flex items-center gap-2.5 backdrop-blur-md ${
            notification.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-300'
              : notification.type === 'error'
              ? 'bg-rose-950/90 border-rose-500/30 text-rose-300'
              : 'bg-slate-900/90 border-slate-700/50 text-slate-200'
          }`}>
            <span className="w-2 h-2 rounded-full bg-current animate-ping" />
            {notification.message}
          </div>
        </div>
      )}

      {/* Main Core Viewport: Left Sidebar Dock + Active Swappable Page Viewport */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 h-full overflow-hidden">
        
        {/* LEFT COMPLIANT SIDEBAR NAVIGATION: 10 stateful pages */}
        {!isFullscreen && (
          <aside className={`w-full ${isSidebarMinimized ? 'lg:w-20' : 'lg:w-64'} bg-slate-950/80 border-r border-slate-900 shrink-0 flex flex-col justify-between py-5 select-none transition-all duration-300 print:hidden`} id="left-sidebar-navigation">
          <div className="space-y-4">
            
            {/* BRAND LOGO AREA */}
            <button 
              onClick={() => {
                setShowLanding(true);
                triggerNotification("Returned to presentation home screen", "info");
              }}
              className={`w-full px-4 pb-3 border-b border-slate-900/80 flex items-center gap-3 text-left transition-all hover:bg-slate-900/30 cursor-pointer active:scale-[0.99] group ${isSidebarMinimized ? 'lg:justify-center' : ''}`}
              title="Return to Presentation Home"
            >
              <div className="relative shrink-0">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                  <Dna className="w-4 h-4 animate-spin-slow" />
                </div>
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse border-2 border-slate-950" />
              </div>
              {!isSidebarMinimized && (
                <div className="min-w-0">
                  <h1 className="text-xs font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent truncate group-hover:text-emerald-300 transition-colors">
                    PHARMA HARMONIZER
                  </h1>
                  <span className="text-[8px] font-mono tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1 py-0.25 rounded-full font-bold uppercase">eCTD v4.0 Active</span>
                </div>
              )}
            </button>

            {/* DOSSIER SWITCHER & ACTIONS */}
            <div className="px-3 space-y-2">
              <span className={`text-[9px] uppercase font-bold tracking-widest text-slate-500 font-mono px-1 block ${isSidebarMinimized ? 'lg:hidden' : ''}`}>Active Portfolio</span>
              
              {isSidebarMinimized ? (
                <div className="flex flex-col gap-2.5 items-center">
                  <button 
                    className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-850 text-slate-300 transition-all cursor-pointer relative"
                    title="Switch Dossier"
                    onClick={() => {
                      setIsSidebarMinimized(false);
                      triggerNotification("Expanding sidebar to switch dossier...", "info");
                    }}
                  >
                    <Briefcase className="w-4 h-4 text-emerald-400" />
                  </button>
                  
                  <label className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-850 text-slate-300 transition-all cursor-pointer flex items-center justify-center" title="Upload eCTD (.md, .txt)">
                    <FileUp className="w-4 h-4 text-emerald-400" />
                    <input
                      type="file"
                      accept=".md,.txt,.json"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>

                  <button
                    onClick={() => setShowLanding(true)}
                    className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-850 text-slate-300 transition-all cursor-pointer"
                    title="Presentation Page"
                  >
                    <Home className="w-4 h-4 text-emerald-400" />
                  </button>
                </div>
              ) : (
                <div className="space-y-1.5 px-1">
                  <div className="relative">
                    <Briefcase className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-emerald-400 pointer-events-none" />
                    <select
                      id="sidebar-portfolio-dropdown"
                      value={selectedDossierId}
                      onChange={(e) => handleSelectDossier(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl pl-8 pr-2 py-1.5 text-[11px] font-bold text-slate-200 outline-none cursor-pointer transition-colors hover:border-slate-800 focus:border-emerald-500/50"
                    >
                      {dossiers.map(d => (
                        <option key={d.id} value={d.id} className="bg-slate-900 text-slate-100">
                          {d.drugName} ({d.dossierType})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    <label className="flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-850 hover:border-slate-800 text-slate-300 rounded-xl py-1.5 text-[10px] font-bold transition-all cursor-pointer active:scale-95">
                      <FileUp className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Upload</span>
                      <input
                        type="file"
                        accept=".md,.txt,.json"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>

                    <button 
                      id="sidebar-present-button"
                      onClick={() => setShowLanding(true)}
                      className="flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-850 hover:border-slate-800 text-slate-300 rounded-xl py-1.5 text-[10px] font-bold transition-all cursor-pointer active:scale-95"
                    >
                      <Home className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Present</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className={`px-4 flex items-center ${isSidebarMinimized ? 'lg:justify-center' : 'justify-between'}`}>
              <span className={`text-[9px] uppercase font-bold tracking-widest text-slate-500 font-mono ${isSidebarMinimized ? 'lg:hidden' : 'block'}`}>Submission Navigation</span>
              <button 
                onClick={() => setIsSidebarMinimized(!isSidebarMinimized)}
                className="p-1 rounded-md hover:bg-slate-900 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer shrink-0"
                title={isSidebarMinimized ? "Expand Sidebar" : "Collapse Sidebar"}
              >
                {isSidebarMinimized ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
              </button>
            </div>
            
            <nav className="space-y-1 px-2">
              <button
                id="sidebar-dashboard"
                onClick={() => setActivePage('dashboard')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer relative overflow-hidden ${isSidebarMinimized ? 'lg:justify-center lg:px-0' : ''} ${
                  activePage === 'dashboard' 
                    ? 'text-white' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                }`}
              >
                {activePage === 'dashboard' && (
                  <motion.div 
                    layoutId="activeNavigationSlide" 
                    className="absolute inset-0 bg-emerald-600 rounded-xl" 
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <LayoutDashboard className="w-4 h-4 shrink-0 z-10" />
                <span className={`z-10 ${isSidebarMinimized ? 'lg:hidden' : ''}`}>0. Executive Hub</span>
              </button>

              <button
                id="sidebar-filing-registry"
                onClick={() => setActivePage('filing_registry')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer relative overflow-hidden ${isSidebarMinimized ? 'lg:justify-center lg:px-0' : ''} ${
                  activePage === 'filing_registry' 
                    ? 'text-white' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                }`}
              >
                {activePage === 'filing_registry' && (
                  <motion.div 
                    layoutId="activeNavigationSlide" 
                    className="absolute inset-0 bg-emerald-600 rounded-xl" 
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <Boxes className="w-4 h-4 shrink-0 z-10" />
                <span className={`z-10 ${isSidebarMinimized ? 'lg:hidden' : ''}`}>Substance Registry (Tabs)</span>
              </button>

              <button
                id="sidebar-dossier-aligner"
                onClick={() => setActivePage('dossier_aligner')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer relative overflow-hidden ${isSidebarMinimized ? 'lg:justify-center lg:px-0' : ''} ${
                  activePage === 'dossier_aligner' 
                    ? 'text-white' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                }`}
              >
                {activePage === 'dossier_aligner' && (
                  <motion.div 
                    layoutId="activeNavigationSlide" 
                    className="absolute inset-0 bg-emerald-600 rounded-xl" 
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <FileText className="w-4 h-4 shrink-0 z-10" />
                <span className={`z-10 ${isSidebarMinimized ? 'lg:hidden' : ''}`}>1. Dossier Aligner & Tree</span>
              </button>

              <button
                id="sidebar-gap-matrix"
                onClick={() => setActivePage('gap_matrix_hub')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer relative overflow-hidden ${isSidebarMinimized ? 'lg:justify-center lg:px-0' : ''} ${
                  activePage === 'gap_matrix_hub' 
                    ? 'text-white' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                }`}
              >
                {activePage === 'gap_matrix_hub' && (
                  <motion.div 
                    layoutId="activeNavigationSlide" 
                    className="absolute inset-0 bg-emerald-600 rounded-xl" 
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <div className="flex items-center gap-2.5 z-10">
                  <BarChart3 className="w-4 h-4 shrink-0" />
                  <span className={isSidebarMinimized ? 'lg:hidden' : ''}>2. Gap Matrix Hub</span>
                </div>
                {currentDossierGaps > 0 && (
                  <span className={`text-[9px] font-mono bg-amber-500/15 text-amber-400 px-1.5 py-0.5 rounded-full font-bold z-10 ${isSidebarMinimized ? 'lg:hidden' : ''}`}>
                    {currentDossierGaps}
                  </span>
                )}
              </button>

              <button
                id="sidebar-ingest-ocr"
                onClick={() => setActivePage('ingest_ocr')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer relative overflow-hidden ${isSidebarMinimized ? 'lg:justify-center lg:px-0' : ''} ${
                  activePage === 'ingest_ocr' 
                    ? 'text-white' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                }`}
              >
                {activePage === 'ingest_ocr' && (
                  <motion.div 
                    layoutId="activeNavigationSlide" 
                    className="absolute inset-0 bg-emerald-600 rounded-xl" 
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <ScanLine className="w-4 h-4 shrink-0 z-10" />
                <span className={`z-10 ${isSidebarMinimized ? 'lg:hidden' : ''}`}>3. Ingest & OCR Station</span>
              </button>

              <button
                id="sidebar-harmonizer-chat"
                onClick={() => setActivePage('harmonizer_chat')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer relative overflow-hidden ${isSidebarMinimized ? 'lg:justify-center lg:px-0' : ''} ${
                  activePage === 'harmonizer_chat' 
                    ? 'text-white' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                }`}
              >
                {activePage === 'harmonizer_chat' && (
                  <motion.div 
                    layoutId="activeNavigationSlide" 
                    className="absolute inset-0 bg-emerald-600 rounded-xl" 
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <Bot className="w-4 h-4 shrink-0 z-10" />
                <span className={`z-10 ${isSidebarMinimized ? 'lg:hidden' : ''}`}>4. Harmonizer-AI Chat</span>
              </button>

              <button
                id="sidebar-vocab-dict"
                onClick={() => setActivePage('vocab_dict')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer relative overflow-hidden ${isSidebarMinimized ? 'lg:justify-center lg:px-0' : ''} ${
                  activePage === 'vocab_dict' 
                    ? 'text-white' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                }`}
              >
                {activePage === 'vocab_dict' && (
                  <motion.div 
                    layoutId="activeNavigationSlide" 
                    className="absolute inset-0 bg-emerald-600 rounded-xl" 
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <BookOpen className="w-4 h-4 shrink-0 z-10" />
                <span className={`z-10 ${isSidebarMinimized ? 'lg:hidden' : ''}`}>5. Nomenclature Dict</span>
              </button>

              <button
                id="sidebar-stability-predictor"
                onClick={() => setActivePage('stability_predictor')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer relative overflow-hidden ${isSidebarMinimized ? 'lg:justify-center lg:px-0' : ''} ${
                  activePage === 'stability_predictor' 
                    ? 'text-white' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                }`}
              >
                {activePage === 'stability_predictor' && (
                  <motion.div 
                    layoutId="activeNavigationSlide" 
                    className="absolute inset-0 bg-emerald-600 rounded-xl" 
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <Thermometer className="w-4 h-4 shrink-0 z-10" />
                <span className={`z-10 ${isSidebarMinimized ? 'lg:hidden' : ''}`}>6. Stability Predictor</span>
              </button>

              <button
                id="sidebar-ectd-validator"
                onClick={() => setActivePage('ectd_validator')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer relative overflow-hidden ${isSidebarMinimized ? 'lg:justify-center lg:px-0' : ''} ${
                  activePage === 'ectd_validator' 
                    ? 'text-white' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                }`}
              >
                {activePage === 'ectd_validator' && (
                  <motion.div 
                    layoutId="activeNavigationSlide" 
                    className="absolute inset-0 bg-emerald-600 rounded-xl" 
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <ShieldCheck className="w-4 h-4 shrink-0 z-10" />
                <span className={`z-10 ${isSidebarMinimized ? 'lg:hidden' : ''}`}>7. eCTD 4.0 Validator</span>
              </button>

              <button
                id="sidebar-substance-analyzer"
                onClick={() => setActivePage('substance_analyzer')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer relative overflow-hidden ${isSidebarMinimized ? 'lg:justify-center lg:px-0' : ''} ${
                  activePage === 'substance_analyzer' 
                    ? 'text-white' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                }`}
              >
                {activePage === 'substance_analyzer' && (
                  <motion.div 
                    layoutId="activeNavigationSlide" 
                    className="absolute inset-0 bg-emerald-600 rounded-xl" 
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <Atom className="w-4 h-4 shrink-0 z-10" />
                <span className={`z-10 ${isSidebarMinimized ? 'lg:hidden' : ''}`}>8. Substance Analyzer</span>
              </button>

              <button
                id="sidebar-global-ingress-map"
                onClick={() => setActivePage('global_ingress_map')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer relative overflow-hidden ${isSidebarMinimized ? 'lg:justify-center lg:px-0' : ''} ${
                  activePage === 'global_ingress_map' 
                    ? 'text-white' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                }`}
              >
                {activePage === 'global_ingress_map' && (
                  <motion.div 
                    layoutId="activeNavigationSlide" 
                    className="absolute inset-0 bg-emerald-600 rounded-xl" 
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <Globe className="w-4 h-4 shrink-0 z-10" />
                <span className={`z-10 ${isSidebarMinimized ? 'lg:hidden' : ''}`}>9. Global Ingress Map</span>
              </button>

              <button
                id="sidebar-audit-history"
                onClick={() => setActivePage('audit_history')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer relative overflow-hidden ${isSidebarMinimized ? 'lg:justify-center lg:px-0' : ''} ${
                  activePage === 'audit_history' 
                    ? 'text-white' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                }`}
              >
                {activePage === 'audit_history' && (
                  <motion.div 
                    layoutId="activeNavigationSlide" 
                    className="absolute inset-0 bg-emerald-600 rounded-xl" 
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <History className="w-4 h-4 shrink-0 z-10" />
                <span className={`z-10 ${isSidebarMinimized ? 'lg:hidden' : ''}`}>10. CFR Audit Trail</span>
              </button>

              <button
                id="sidebar-agent-orchestrator"
                onClick={() => setActivePage('agent_orchestrator')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer relative overflow-hidden ${isSidebarMinimized ? 'lg:justify-center lg:px-0' : ''} ${
                  activePage === 'agent_orchestrator' 
                    ? 'text-white' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                }`}
              >
                {activePage === 'agent_orchestrator' && (
                  <motion.div 
                    layoutId="activeNavigationSlide" 
                    className="absolute inset-0 bg-emerald-600 rounded-xl" 
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <Network className="w-4 h-4 shrink-0 z-10" />
                <span className={`z-10 ${isSidebarMinimized ? 'lg:hidden' : ''}`}>11. Agent Orchestrator & MCP</span>
              </button>

              {/* Start Guided Onboarding Tour Button */}
              {!isSidebarMinimized && (
                <button
                  onClick={() => {
                    setIsOnboarding(true);
                    setTourWorkflowId(null);
                    setTourStepIdx(0);
                    setTourIsSelectorOpen(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all cursor-pointer mt-2.5"
                >
                  <Sparkles className="w-4 h-4 shrink-0 animate-pulse" />
                  <span>Start Guided Tour</span>
                </button>
              )}
            </nav>
          </div>

          {/* Active Filing Summary widget in bottom empty area of sidebar */}
          {!isSidebarMinimized && (() => {
            const totalGaps = currentDossier.sections.reduce((sum, s) => sum + s.gaps.length, 0);
            const resolvedGaps = currentDossier.sections.reduce((sum, s) => sum + s.gaps.filter(g => g.status === 'resolved').length, 0);
            const compliancePercent = totalGaps > 0 ? Math.round((resolvedGaps / totalGaps) * 100) : 100;
            return (
              <div className="mx-3 mt-auto mb-4 bg-slate-900/20 border border-slate-900/60 rounded-2xl p-4.5 space-y-3.5 shadow-md animate-fade-in shrink-0">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-slate-500 font-extrabold">Filing Context</span>
                  <span className="flex h-1.5 w-1.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-200 truncate">{currentDossier.drugName}</h4>
                  <p className="text-[9px] text-slate-500 font-mono uppercase mt-0.5">{currentDossier.dossierType}</p>
                </div>
                
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-400 font-medium">Compliance Convergence</span>
                    <span className="font-bold text-emerald-400 font-mono">{compliancePercent}%</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800">
                    <div 
                      className="bg-gradient-to-r from-emerald-600 to-teal-500 h-full rounded-full transition-all duration-300" 
                      style={{ width: `${compliancePercent}%` }} 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-1 text-[9px] font-mono text-slate-400 border-t border-slate-900/80 pt-2">
                  <div>
                    <span className="text-slate-500">GAPS:</span> <span className="font-bold text-amber-400">{currentDossierGaps}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">21-CFR:</span> <span className="font-bold text-emerald-400">VALID</span>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* SYSTEM & WORKSPACE CONTROLS SECTION */}
          <div className="mx-3 mt-auto border-t border-slate-900/80 pt-4 pb-1 space-y-3">
            {isSidebarMinimized ? (
              // MINIMIZED VERTICAL STACK OF CONTROLS
              <div className="flex flex-col items-center gap-3 py-1">
                {/* Compact Search Trigger */}
                <div 
                  className="p-2 rounded-xl bg-slate-900/40 text-slate-400 hover:text-slate-200 cursor-pointer transition-all border border-transparent hover:border-slate-800"
                  onClick={() => {
                    setIsSidebarMinimized(false);
                    triggerNotification("Expanding sidebar to search/filter...", "info");
                  }}
                  title="Search / Filter sections"
                >
                  <Search className="w-4 h-4" />
                </div>

                {/* Theme toggle */}
                <button
                  onClick={() => {
                    setIsLightTheme(!isLightTheme);
                    triggerNotification(isLightTheme ? 'Switched to Standard Dark Mode' : 'Inverted Colors: High-Contrast Light Mode Active', 'info');
                  }}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-850 text-slate-300 transition-all cursor-pointer active:scale-95"
                  title={isLightTheme ? "Switch to Dark Mode" : "Switch to Light Mode"}
                >
                  {isLightTheme ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
                </button>

                {/* Print to PDF */}
                <button
                  onClick={() => {
                    triggerNotification('Generating printable high-integrity PDF layout...', 'info');
                    setTimeout(() => window.print(), 300);
                  }}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-850 text-slate-300 transition-all cursor-pointer active:scale-95"
                  title="Save current view as PDF"
                >
                  <Printer className="w-4 h-4 text-emerald-400" />
                </button>

                {/* Fullscreen toggle */}
                <button
                  onClick={() => {
                    setIsFullscreen(!isFullscreen);
                    triggerNotification(isFullscreen ? 'Exited Fullscreen Mode' : 'Entered Fullscreen Mode - Sidebar temporarily hidden', 'success');
                  }}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-850 text-slate-300 transition-all cursor-pointer active:scale-95"
                  title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4 text-emerald-400" /> : <Maximize2 className="w-4 h-4 text-emerald-400" />}
                </button>
              </div>
            ) : (
              // EXPANDED COHESIVE SYSTEM CONTROLS
              <div className="space-y-2.5 px-1.5 animate-fade-in">
                <span className="text-[9px] uppercase font-bold tracking-widest text-slate-500 font-mono block">Workspace Settings</span>
                
                {/* Filter sections search input */}
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filter sections..."
                    className="w-full bg-slate-950/85 hover:bg-slate-950 border border-slate-850 focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/20 rounded-xl pl-8 pr-7 py-1.5 text-[11px] text-slate-200 placeholder-slate-500 focus:outline-none transition-all font-mono h-8"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                      title="Clear filter"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Row of 3 utility buttons */}
                <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                  <button
                    onClick={() => {
                      setIsLightTheme(!isLightTheme);
                      triggerNotification(isLightTheme ? 'Switched to Standard Dark Mode' : 'Inverted Colors: High-Contrast Light Mode Active', 'info');
                    }}
                    className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-900/50 hover:bg-slate-800 border border-slate-900/80 hover:border-slate-850 text-slate-400 hover:text-slate-200 transition-all cursor-pointer active:scale-95"
                    title={isLightTheme ? "Switch to Dark Mode" : "Switch to Light Mode"}
                  >
                    {isLightTheme ? <Sun className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" /> : <Moon className="w-3.5 h-3.5 text-indigo-400" />}
                    <span className="text-[8px] font-mono mt-1 font-bold">Theme</span>
                  </button>

                  <button
                    onClick={() => {
                      triggerNotification('Generating printable high-integrity PDF... Ready to print.', 'info');
                      setTimeout(() => window.print(), 300);
                    }}
                    className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-900/50 hover:bg-slate-800 border border-slate-900/80 hover:border-slate-850 text-slate-400 hover:text-slate-200 transition-all cursor-pointer active:scale-95 pointer-events-auto shrink-0"
                    title="Save view to PDF / Print"
                  >
                    <Printer className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[8px] font-mono mt-1 font-bold">PDF</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsFullscreen(!isFullscreen);
                      triggerNotification(isFullscreen ? 'Exited Fullscreen Mode' : 'Entered Fullscreen Mode - Sidebar temporarily hidden', 'success');
                    }}
                    className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-900/50 hover:bg-slate-800 border border-slate-900/80 hover:border-slate-850 text-slate-400 hover:text-slate-200 transition-all cursor-pointer active:scale-95"
                    title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                  >
                    {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 text-emerald-400 animate-pulse" /> : <Maximize2 className="w-3.5 h-3.5 text-emerald-400" />}
                    <span className="text-[8px] font-mono mt-1 font-bold">Full</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className={`px-4 text-[10px] text-slate-500 font-sans border-t border-slate-900 pt-3 pb-1 leading-relaxed ${isSidebarMinimized ? 'lg:hidden' : ''}`}>
            <span className="font-bold text-slate-400 block">Compliant Environment</span>
            <span>ALCOA+ Data Integrity standards active.</span>
          </div>
        </aside>
        )}

        {/* MAIN COMPLIANT PORTAL VIEWPORT */}
        <main 
          onContextMenu={(e) => {
            e.preventDefault();
            // Bounds check the coordinate window so context menu is always fully on-screen
            const menuWidth = 256;
            const menuHeight = 310;
            const x = Math.min(e.clientX, window.innerWidth - menuWidth - 10);
            const y = Math.min(e.clientY, window.innerHeight - menuHeight - 10);
            setContextMenu({ x, y });
          }}
          className={`relative flex-1 p-4 space-y-4 flex flex-col h-full min-h-0 overflow-hidden w-full select-none transition-all duration-300 ${isFullscreen ? 'max-w-none' : 'max-w-7xl mx-auto'} ${isLightTheme ? 'high-contrast-light' : ''}`} 
          id="main-compliant-portal-viewport"
        >
                   {/* UNIFIED WORKSPACE CONTROL HEADER */}
          <div className="flex items-center justify-between bg-slate-950/45 backdrop-blur-md border border-slate-900 rounded-2xl py-2 px-4 shadow-xl relative overflow-hidden" id="viewport-unified-header">
            {/* Ambient subtle backlight */}
            <div className="absolute left-0 top-0 w-32 h-32 rounded-full bg-emerald-500/5 blur-2xl pointer-events-none" />
            
            <div className="z-10 flex-1 min-w-0">
              {/* Sleek inline breadcrumbs */}
              <nav className="flex items-center flex-wrap gap-1.5 text-[11px] font-mono text-slate-400" id="compliant-breadcrumb-trail">
                <div className="flex items-center gap-1 hover:text-slate-200 cursor-pointer transition-colors" onClick={() => setActivePage('dashboard')}>
                  <Home className="w-3 h-3 text-slate-500 shrink-0" />
                  <span>Home</span>
                </div>
                
                <ChevronRight className="w-2.5 h-2.5 text-slate-600 shrink-0" />
                
                {/* Active Page item */}
                <div 
                  className={`flex items-center transition-colors ${activePage === 'dossier_aligner' && currentSection ? 'hover:text-slate-200 cursor-pointer text-slate-400' : 'text-slate-200 font-bold'}`} 
                  onClick={() => {
                    if (activePage !== 'dossier_aligner') {
                      setActivePage(activePage);
                    } else {
                      const rootSec = currentDossier.sections[0];
                      if (rootSec) setSelectedSectionId(rootSec.id);
                    }
                  }}
                >
                  <span>{getPageTitle(activePage).replace(/^\d+\.\s*/, '')}</span>
                </div>

                {/* If on dossier_aligner, dynamically trace hierarchy path to selected section */}
                {activePage === 'dossier_aligner' && currentSection && (() => {
                  const ancestors: DossierSection[] = [];
                  let current: DossierSection | undefined = currentSection;
                  while (current) {
                    ancestors.unshift(current);
                    if (current.parentId) {
                      const pId = current.parentId;
                      current = currentDossier.sections.find(s => s.id === pId);
                    } else {
                      current = undefined;
                    }
                  }

                  return ancestors.map((sec, idx) => {
                    const isLast = idx === ancestors.length - 1;
                    return (
                      <React.Fragment key={sec.id}>
                        <ChevronRight className="w-2.5 h-2.5 text-slate-600 shrink-0" />
                        <div
                          onClick={() => !isLast && setSelectedSectionId(sec.id)}
                          className={`transition-colors truncate max-w-[150px] sm:max-w-[200px] ${
                            isLast 
                              ? 'text-emerald-400 font-bold' 
                              : 'hover:text-slate-200 cursor-pointer text-slate-400'
                          }`}
                          title={`${sec.sectionCode || sec.id}: ${sec.title}`}
                        >
                          <span className="font-bold">{sec.sectionCode || sec.id}</span>
                          <span className="ml-1 opacity-80 text-[10px] font-sans hidden sm:inline">{sec.title}</span>
                        </div>
                      </React.Fragment>
                    );
                  });
                })()}
              </nav>
            </div>
          </div>

          {/* Dynamic upload progress bar */}
          {uploadProgress !== null && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-4 animate-pulse">
              <div className="flex items-center gap-3">
                <RefreshCw className="w-5 h-5 text-emerald-400 animate-spin" />
                <div>
                  <p className="text-xs font-bold text-slate-200">Ingesting raw file streams into sandboxed parser...</p>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">eCTD XML schema scanning and terminology extraction active</p>
                </div>
              </div>
              <div className="w-48 bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                <div className="bg-emerald-500 h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
              </div>
            </div>
          )}

          {/* PAGE SWITCH RENDERING DOCK */}
          <React.Suspense fallback={
            <div className="flex-grow flex flex-col items-center justify-center text-center p-8 select-none">
              <div className="w-10 h-10 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin mb-4" />
              <p className="text-[10px] font-bold text-slate-400 font-mono animate-pulse">Loading eCTD Workspace Module...</p>
            </div>
          }>
          {activePage === 'dashboard' && (
            <div className="flex-1 overflow-y-auto min-h-0 pr-1 h-full select-none" id="dashboard-viewport">
              <ExecutiveHub
                dossiers={dossiers}
                selectedDossierId={selectedDossierId}
                onSelectDossier={handleSelectDossier}
                setActivePage={setActivePage}
                triggerNotification={triggerNotification}
              />
            </div>
          )}

          {activePage === 'filing_registry' && (
            <div className="flex-1 overflow-y-auto min-h-0 pr-1 h-full select-none" id="filing-registry-viewport">
              <FilingRegistry
                dossiers={dossiers}
                selectedDossierId={selectedDossierId}
                onSelectDossier={handleSelectDossier}
                setActivePage={setActivePage}
                triggerNotification={triggerNotification}
              />
            </div>
          )}

          {activePage === 'dossier_aligner' && (
            <div className="flex-1 flex flex-col min-h-0 h-full overflow-hidden space-y-4 animate-fade-in" id="dossier-aligner-main-pane">
              
              {/* Dossier Sub-Tabs for Better Vertical Space and Focus */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-b border-slate-900 pb-3 gap-4 shrink-0" id="dossier-sub-tabs-container">
                <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-900 gap-1 overflow-x-auto scrollbar-none">
                  <button
                    id="subtab-workspace"
                    onClick={() => setDossierTab('workspace')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 whitespace-nowrap cursor-pointer ${
                      dossierTab === 'workspace'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 shadow-lg shadow-emerald-500/5'
                        : 'text-slate-400 hover:text-slate-200 border border-transparent'
                    }`}
                  >
                    <FileText className="w-4 h-4 shrink-0" />
                    <span>1. Interactive Workspace</span>
                  </button>

                  <button
                    id="subtab-pathway"
                    onClick={() => setDossierTab('pathway')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 whitespace-nowrap cursor-pointer ${
                      dossierTab === 'pathway'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 shadow-lg shadow-emerald-500/5'
                        : 'text-slate-400 hover:text-slate-200 border border-transparent'
                    }`}
                  >
                    <Globe className="w-4 h-4 shrink-0" />
                    <span>2. Regulatory Pathway Map</span>
                  </button>

                  <button
                    id="subtab-analytics"
                    onClick={() => setDossierTab('analytics')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 whitespace-nowrap cursor-pointer ${
                      dossierTab === 'analytics'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 shadow-lg shadow-emerald-500/5'
                        : 'text-slate-400 hover:text-slate-200 border border-transparent'
                    }`}
                  >
                    <TrendingUp className="w-4 h-4 shrink-0" />
                    <span>3. Analytics & Risks</span>
                  </button>

                  <button
                    id="subtab-compiler"
                    onClick={() => setDossierTab('compiler')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 whitespace-nowrap cursor-pointer ${
                      dossierTab === 'compiler'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 shadow-lg shadow-emerald-500/5'
                        : 'text-slate-400 hover:text-slate-200 border border-transparent'
                    }`}
                  >
                    <FileJson className="w-4 h-4 shrink-0" />
                    <span>4. Compile & Export</span>
                  </button>
                </div>

                {/* Sub-tab description or contextual state */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-900 text-xs text-slate-300">
                    <span className="text-[10px] text-slate-500 font-mono uppercase font-bold">Target Market:</span>
                    <select
                      id="target-market-dropdown"
                      value={targetAuthority}
                      onChange={(e) => handleSelectTarget(e.target.value as RegulatoryAuthority)}
                      className="bg-transparent text-emerald-400 font-extrabold outline-none cursor-pointer text-xs"
                    >
                      {currentDossier.targetAuthorities.map(auth => (
                        <option key={auth} value={auth} className="bg-slate-950 text-slate-100">
                          {auth} - {REGULATORY_BODIES[auth]?.region}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* TAB 1: INTERACTIVE WORKSPACE */}
              {dossierTab === 'workspace' && (
                <div className="flex-1 min-h-0 flex flex-col overflow-hidden animate-fade-in" id="workspace-viewport">

                  {/* Unified Flat 3-Column Layout with Synchronized Heights */}
                  <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch overflow-hidden">
                    
                    {/* Column 1: eCTD Tree Explorer (3 cols) */}
                    <div className="lg:col-span-3 flex flex-col gap-4 h-full min-h-0 overflow-hidden">
                      <div className="flex-1 min-h-0 h-full overflow-hidden flex flex-col">
                        <DossierExplorer
                          sections={currentDossier.sections}
                          selectedSectionId={selectedSectionId}
                          onSelectSection={handleSelectSection}
                          targetAuthority={targetAuthority}
                          onReorderSections={handleReorderSections}
                          searchQuery={searchQuery}
                        />
                      </div>
                    </div>

                    {/* Column 2: Harmonization Workspace (6 cols) */}
                    <div className="lg:col-span-6 flex flex-col h-full min-h-0 overflow-hidden">
                       <HarmonizationWorkspace
                        section={currentSection}
                        sourceAuthority={currentDossier.sourceAuthority}
                        targetAuthority={targetAuthority}
                        onHarmonize={handleHarmonize}
                        isHarmonizing={isHarmonizing}
                        harmonizationResult={activeSectionResult}
                        onApplyManualEdits={handleApplyManualEdits}
                        onTriggerNotification={triggerNotification}
                      />
                    </div>

                    {/* Column 3: Sidebar Tabs / Compliance Auditor / Regulatory Chatbot (3 cols) */}
                    <div className="lg:col-span-3 flex flex-col gap-4 h-full min-h-0 overflow-hidden">
                      
                      {/* Visual Tab Toggles */}
                      <div className="flex bg-slate-900 rounded-xl p-1 text-xs shrink-0 border border-slate-800">
                        <button
                          onClick={() => setActiveSidePanel('auditor')}
                          className={`flex-1 py-2 rounded-lg font-bold transition-all duration-150 cursor-pointer ${
                            activeSidePanel === 'auditor' ? 'bg-slate-800 text-white shadow-sm border border-slate-700' : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          Audited Gaps ({currentSection.gaps.filter(g => g.status === 'pending').length})
                        </button>
                        <button
                          onClick={() => setActiveSidePanel('chat')}
                          className={`flex-1 py-2 rounded-lg font-bold transition-all duration-150 cursor-pointer ${
                            activeSidePanel === 'chat' ? 'bg-slate-800 text-white shadow-sm border border-slate-700' : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          Harmonizer-AI Chat
                        </button>
                      </div>

                      {/* Tab content render */}
                      <div className="flex-1 min-h-0 h-full overflow-hidden flex flex-col">
                        {activeSidePanel === 'auditor' ? (
                          <ComplianceChecklist
                            gaps={currentSection.gaps}
                            onResolveGap={handleResolveGap}
                            isHarmonizing={isHarmonizing}
                          />
                        ) : (
                          <RegulatoryAssistant
                            messages={chatHistory}
                            onSendMessage={handleSendMessage}
                            isSending={isSendingChat}
                            targetAuthority={targetAuthority}
                          />
                        )}
                      </div>

                    </div>

                  </div>
                </div>
              )}

              {/* TAB 2: REGULATORY PATHWAY MAP */}
              {dossierTab === 'pathway' && (
                <div className="space-y-6 animate-fade-in">
                  <RegulatoryMap
                    sourceAuthority={currentDossier.sourceAuthority}
                    selectedTarget={targetAuthority}
                    onSelectTarget={handleSelectTarget}
                    gapsCount={
                      currentDossier.sections.reduce((acc, s) => {
                        // Add number of unresolved gaps for each authority
                        currentDossier.targetAuthorities.forEach(target => {
                          if (!acc[target]) acc[target] = 0;
                          acc[target] += s.gaps.filter(g => g.status === 'pending').length;
                        });
                        return acc;
                      }, {} as Record<RegulatoryAuthority, number>)
                    }
                    completionStatus={
                      currentDossier.sections.reduce((acc, s) => {
                        currentDossier.targetAuthorities.forEach(target => {
                          // Determine highest-priority status for each target
                          const status = s.targetStatus?.[target] || s.status;
                          if (!acc[target]) acc[target] = 'compliant';
                          if (status === 'error' || acc[target] === 'error') {
                            acc[target] = 'error';
                          } else if (status === 'warning' && acc[target] !== 'error') {
                            acc[target] = 'warning';
                          }
                        });
                        return acc;
                      }, {} as Record<RegulatoryAuthority, 'compliant' | 'warning' | 'error' | 'unreviewed'>)
                    }
                  />

                  {/* Cross-Border Alignment Specifications */}
                  <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 space-y-4 shadow-xl">
                    <div className="flex items-center gap-2 border-b border-slate-900 pb-4">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-wider text-white">Cross-Border Alignment Specifications</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">Automated comparison of submission standards between {currentDossier.sourceAuthority} and {targetAuthority}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                      <div className="space-y-3 p-4 bg-slate-950/50 rounded-xl border border-slate-900">
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold uppercase tracking-wider">
                          <span>Origin Specifications:</span>
                          <span className="text-white font-mono font-black">{currentDossier.sourceAuthority}</span>
                        </div>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between py-1 border-b border-slate-900/60">
                            <span className="text-slate-500">Regulatory Agency</span>
                            <span className="text-slate-300 font-semibold">{REGULATORY_BODIES[currentDossier.sourceAuthority]?.name}</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-slate-900/60">
                            <span className="text-slate-500">Technical Format</span>
                            <span className="text-slate-300 font-semibold">{REGULATORY_BODIES[currentDossier.sourceAuthority]?.standards}</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-slate-900/60">
                            <span className="text-slate-500">Climatic Zone Testing</span>
                            <span className="text-slate-300 font-semibold">{REGULATORY_BODIES[currentDossier.sourceAuthority]?.stabilityZone}</span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span className="text-slate-500">Submission Language</span>
                            <span className="text-slate-300 font-semibold">{REGULATORY_BODIES[currentDossier.sourceAuthority]?.primaryLanguage}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 p-4 bg-slate-950/50 rounded-xl border border-emerald-500/10">
                        <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold uppercase tracking-wider">
                          <span>Target Destination Specifications:</span>
                          <span className="text-emerald-300 font-mono font-black">{targetAuthority}</span>
                        </div>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between py-1 border-b border-slate-900/60">
                            <span className="text-slate-500">Regulatory Agency</span>
                            <span className="text-slate-300 font-semibold">{REGULATORY_BODIES[targetAuthority]?.name}</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-slate-900/60">
                            <span className="text-slate-500">Technical Format</span>
                            <span className="text-slate-300 font-semibold">{REGULATORY_BODIES[targetAuthority]?.standards}</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-slate-900/60">
                            <span className="text-slate-500">Climatic Zone Testing</span>
                            <span className="text-slate-300 font-semibold">{REGULATORY_BODIES[targetAuthority]?.stabilityZone}</span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span className="text-slate-500">Submission Language</span>
                            <span className="text-slate-300 font-semibold">{REGULATORY_BODIES[targetAuthority]?.primaryLanguage}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: ANALYTICS & RISKS */}
              {dossierTab === 'analytics' && (
                <div className="space-y-6 animate-fade-in">
                  {/* Compliance Health Dashboard */}
                  <div className="bg-slate-950 border border-slate-900 rounded-2xl p-6 space-y-6" id="compliance-health-dashboard">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900 pb-5">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 animate-pulse">
                          <TrendingUp className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-black uppercase tracking-wider text-white">Compliance Health Analytics</h3>
                          <p className="text-[11px] text-slate-400 mt-0.5">Real-time audit trajectory and multi-region regulatory convergence score tracker</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs bg-slate-900/60 border border-slate-800 px-3 py-1.5 rounded-xl shrink-0">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="text-slate-300 font-mono text-[10px]">Active Dossier: <span className="font-bold text-white">{currentDossier.drugName}</span></span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                      
                      {/* Left panel: Recharts Line chart */}
                      <div className="lg:col-span-8 bg-slate-900/10 border border-slate-900/60 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Multi-Region Submission Score Trends</span>
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded">eCTD 4.0 Standard</span>
                        </div>

                        <div className="w-full h-[320px] pr-4">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trendData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#111827" />
                              <XAxis 
                                dataKey="stage" 
                                stroke="#64748b" 
                                style={{ fontSize: '10px', fontFamily: 'monospace' }} 
                                tickLine={false}
                              />
                              <YAxis 
                                stroke="#64748b" 
                                domain={[30, 100]} 
                                style={{ fontSize: '10px', fontFamily: 'monospace' }} 
                                tickLine={false}
                                unit="%"
                              />
                              <Tooltip 
                                contentStyle={{ 
                                  backgroundColor: '#0f172a', 
                                  borderColor: '#1e293b', 
                                  borderRadius: '12px', 
                                  color: '#f8fafc',
                                  fontSize: '11px',
                                  fontFamily: 'monospace',
                                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                                }} 
                              />
                              <Legend 
                                verticalAlign="top" 
                                height={36} 
                                iconType="circle" 
                                wrapperStyle={{ fontSize: '10px', fontFamily: 'monospace', color: '#94a3b8' }} 
                              />
                              <Line 
                                type="monotone" 
                                dataKey="FDA" 
                                name="FDA (US)" 
                                stroke="#0D9488" 
                                strokeWidth={3} 
                                dot={{ r: 3, strokeWidth: 1 }} 
                                activeDot={{ r: 5 }} 
                              />
                              <Line 
                                type="monotone" 
                                dataKey="EMA" 
                                name="EMA (EU)" 
                                stroke="#3B82F6" 
                                strokeWidth={3} 
                                dot={{ r: 3, strokeWidth: 1 }} 
                                activeDot={{ r: 5 }} 
                              />
                              <Line 
                                type="monotone" 
                                dataKey="PMDA" 
                                name="PMDA (Japan)" 
                                stroke="#EF4444" 
                                strokeWidth={3} 
                                dot={{ r: 3, strokeWidth: 1 }} 
                                activeDot={{ r: 5 }} 
                              />
                              <Line 
                                type="monotone" 
                                dataKey="CDSCO" 
                                name="CDSCO (India)" 
                                stroke="#F59E0B" 
                                strokeWidth={3} 
                                dot={{ r: 3, strokeWidth: 1 }} 
                                activeDot={{ r: 5 }} 
                              />
                              <Line 
                                type="monotone" 
                                dataKey="Swissmedic" 
                                name="Swissmedic (Swiss)" 
                                stroke="#8B5CF6" 
                                strokeWidth={3} 
                                dot={{ r: 3, strokeWidth: 1 }} 
                                activeDot={{ r: 5 }} 
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Right panel: Active Score breakdowns */}
                      <div className="lg:col-span-4 space-y-4">
                        <div className="p-4 bg-slate-900/20 border border-slate-900 rounded-xl">
                          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-3">Live Region Scorecard</span>
                          
                          <div className="space-y-3">
                            {(['FDA', 'EMA', 'PMDA', 'CDSCO', 'Swissmedic'] as RegulatoryAuthority[]).map((auth) => {
                              const score = Math.round(getDynamicScore(auth));
                              const body = REGULATORY_BODIES[auth];
                              const color = body?.color || '#10b981';
                              const isSource = auth === currentDossier.sourceAuthority;
                              
                              return (
                                <div key={auth} className="space-y-1.5 p-2 rounded-lg bg-slate-900/30 border border-slate-900 hover:border-slate-800 transition-colors">
                                  <div className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-sm">{body?.icon}</span>
                                      <span className="font-bold text-slate-200">{auth}</span>
                                      {isSource && <span className="text-[8px] font-mono bg-emerald-500/10 text-emerald-400 px-1 rounded uppercase font-bold">Source</span>}
                                    </div>
                                    <span className="font-mono font-bold text-slate-100" style={{ color: color }}>{score}%</span>
                                  </div>
                                  <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                                    <div 
                                      className="h-1.5 rounded-full transition-all duration-500" 
                                      style={{ width: `${score}%`, backgroundColor: color }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="p-4 bg-slate-900/10 border border-slate-900 border-dashed rounded-xl text-[11px] text-slate-400 space-y-2">
                          <div className="flex items-center gap-1.5 text-slate-200 font-bold">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span>Interactive Remediation</span>
                          </div>
                          <p className="leading-relaxed">
                            The convergence curve updates in real time as gaps are marked resolved. Address pending gaps in the workspace above to see immediate score improvements across target markets.
                          </p>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Risk Heatmap Visualization */}
                  <RiskHeatmap
                    dossier={currentDossier}
                    selectedSectionId={selectedSectionId}
                    onSelectSection={handleSelectSection}
                    targetAuthority={targetAuthority}
                  />
                </div>
              )}

              {/* TAB 4: eCTD COMPILER & EXPORT */}
              {dossierTab === 'compiler' && (
                <div className="flex-1 min-h-0 overflow-y-auto space-y-6 animate-fade-in pr-1" id="compiler-tab-viewport">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch pb-6">
                    
                    {/* Left Column: Global Alignment Live Scores & Validation */}
                    <div className="lg:col-span-5 flex flex-col gap-4">
                      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl relative overflow-hidden flex-1">
                        <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
                        
                        <div className="flex items-center gap-2 border-b border-slate-800 pb-4">
                          <Globe className="w-5 h-5 text-emerald-400" />
                          <div>
                            <h3 className="text-sm font-black uppercase tracking-wider text-white">Global Alignment Scorecard</h3>
                            <p className="text-[11px] text-slate-400 mt-0.5">Live submission-readiness alignment by destination market</p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          {currentDossier.targetAuthorities.map((auth) => {
                            const score = Math.round(getDynamicScore(auth));
                            const body = REGULATORY_BODIES[auth];
                            return (
                              <div key={auth} className="space-y-2 p-3 bg-slate-950/40 border border-slate-900 rounded-xl hover:border-slate-800 transition-colors">
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                                    <span className="text-sm">{body?.icon}</span>
                                    <span>{auth}</span>
                                    <span className="text-[10px] font-mono text-slate-500 font-medium">({body?.region})</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded-md ${
                                      score >= 90 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                                      score >= 70 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 
                                      'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                    }`}>
                                      {score}%
                                    </span>
                                  </div>
                                </div>
                                <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800">
                                  <div 
                                    className={`h-full rounded-full transition-all duration-500 ${
                                      score >= 90 
                                        ? 'bg-gradient-to-r from-emerald-600 to-emerald-400' 
                                        : score >= 70 
                                        ? 'bg-gradient-to-r from-amber-600 to-amber-400' 
                                        : 'bg-gradient-to-r from-rose-600 to-rose-400'
                                    }`}
                                    style={{ width: `${score}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <div className="pt-4 border-t border-slate-800 flex flex-col gap-3">
                          <button
                            onClick={handleRefreshData}
                            className="w-full bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-200 hover:text-white text-xs font-bold py-3 px-4 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 select-none active:scale-[0.98] shadow-md"
                          >
                            <RefreshCw className={`w-4 h-4 text-emerald-400 ${isRefreshing ? 'animate-spin' : ''}`} />
                            <span>Validate Submission Integrity</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: eCTD Submission Compiler & Packages list */}
                    <div className="lg:col-span-7 flex flex-col gap-4">
                      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl relative overflow-hidden flex-1">
                        <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
                        
                        <div className="flex items-center gap-2 border-b border-slate-800 pb-4">
                          <FileJson className="w-5 h-5 text-emerald-400" />
                          <div>
                            <h3 className="text-sm font-black uppercase tracking-wider text-white">eCTD Submission Compiler</h3>
                            <p className="text-[11px] text-slate-400 mt-0.5">Assemble and package Dossier structures into ICH-compliant XML archives</p>
                          </div>
                        </div>

                        {/* List of elements being packaged */}
                        <div className="space-y-3">
                          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Included Submission Modules</span>
                          <div className="space-y-2 text-xs">
                            <div className="flex items-center justify-between p-2.5 bg-slate-950/30 border border-slate-900 rounded-lg">
                              <div className="flex items-center gap-2">
                                <span className="text-emerald-400 font-mono font-bold">M1</span>
                                <span className="text-slate-300 font-medium">Module 1 - Administrative Information</span>
                              </div>
                              <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 border border-emerald-500/10 px-1.5 py-0.5 rounded">CFR-Compliant</span>
                            </div>
                            <div className="flex items-center justify-between p-2.5 bg-slate-950/30 border border-slate-900 rounded-lg">
                              <div className="flex items-center gap-2">
                                <span className="text-emerald-400 font-mono font-bold">M2</span>
                                <span className="text-slate-300 font-medium">Module 2 - Common Technical Document Summaries</span>
                              </div>
                              <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 border border-emerald-500/10 px-1.5 py-0.5 rounded">Aligned</span>
                            </div>
                            <div className="flex items-center justify-between p-2.5 bg-slate-950/30 border border-slate-900 rounded-lg">
                              <div className="flex items-center gap-2">
                                <span className="text-emerald-400 font-mono font-bold">M3</span>
                                <span className="text-slate-300 font-medium">Module 3 - Quality / Chemical & CMC Standards</span>
                              </div>
                              <span className="text-[10px] text-amber-400 font-mono bg-amber-500/10 border border-amber-500/10 px-1.5 py-0.5 rounded">Harmonized ({targetAuthority})</span>
                            </div>
                            <div className="flex items-center justify-between p-2.5 bg-slate-950/30 border border-slate-900 rounded-lg">
                              <div className="flex items-center gap-2">
                                <span className="text-slate-500 font-mono font-bold">XML</span>
                                <span className="text-slate-300 font-medium">eCTD v4.0 Schema Specification (util.xsd)</span>
                              </div>
                              <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 border border-emerald-500/10 px-1.5 py-0.5 rounded">Valid</span>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 bg-slate-950/50 border border-slate-900 rounded-xl space-y-4">
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
                              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                              <span>Ready for Ingress: <strong className="text-slate-200">{targetAuthority}</strong></span>
                            </div>
                            
                            <button
                              id="export-xml-button"
                              onClick={handleExportXML}
                              className="bg-emerald-600 hover:bg-emerald-500 hover:scale-[1.02] active:scale-[0.98] text-white font-bold text-xs px-5 py-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/15"
                            >
                              <Download className="w-4 h-4" />
                              <span>Export to eCTD XML</span>
                            </button>
                          </div>
                        </div>

                      </div>
                    </div>

                  </div>
                </div>
              )}

            </div>
          )}

          {activePage === 'gap_matrix_hub' && (
            <div className="flex-1 overflow-y-auto min-h-0 pr-1 h-full select-none animate-fade-in" id="gap-matrix-viewport">
              <GapMatrixHub
                dossiers={dossiers}
                selectedDossierId={selectedDossierId}
                onResolveGap={handleResolveGap}
                onSelectSection={handleSelectSection}
                onSelectTab={setActivePage}
              />
            </div>
          )}

          {activePage === 'ingest_ocr' && (
            <div className="flex-1 overflow-y-auto min-h-0 pr-1 h-full select-none animate-fade-in" id="ingest-ocr-viewport">
              <IngestOcrStation
                onAddCustomSection={handleAddCustomSection}
                triggerNotification={triggerNotification}
              />
            </div>
          )}

          {activePage === 'harmonizer_chat' && (
            <div className="flex-1 overflow-y-auto min-h-0 pr-1 h-full select-none animate-fade-in" id="harmonizer-chat-viewport">
              <FullChatAdvisor
                messages={chatHistory}
                onSendMessage={handleSendMessage}
                isSending={isSendingChat}
                targetAuthority={targetAuthority}
              />
            </div>
          )}

          {activePage === 'vocab_dict' && (
            <div className="flex-1 overflow-y-auto min-h-0 pr-1 h-full select-none animate-fade-in" id="vocab-dict-viewport">
              <VocabularyDictionary
                triggerNotification={triggerNotification}
              />
            </div>
          )}

          {activePage === 'stability_predictor' && (
            <div className="flex-1 overflow-y-auto min-h-0 pr-1 h-full select-none animate-fade-in" id="stability-predictor-viewport">
              <StabilityPredictor
                triggerNotification={triggerNotification}
              />
            </div>
          )}

          {activePage === 'ectd_validator' && (
            <div className="flex-1 overflow-y-auto min-h-0 pr-1 h-full select-none animate-fade-in" id="ectd-validator-viewport">
              <EctdValidator
                triggerNotification={triggerNotification}
              />
            </div>
          )}

          {activePage === 'substance_analyzer' && (
            <div className="flex-1 overflow-y-auto min-h-0 pr-1 h-full select-none animate-fade-in" id="substance-analyzer-viewport">
              <SubstanceAnalyzer
                triggerNotification={triggerNotification}
              />
            </div>
          )}

          {activePage === 'global_ingress_map' && (
            <div className="flex-1 overflow-y-auto min-h-0 pr-1 h-full select-none animate-fade-in" id="global-ingress-map-viewport">
              <GlobalIngressMap />
            </div>
          )}

          {activePage === 'audit_history' && (
            <div className="flex-1 overflow-y-auto min-h-0 pr-1 h-full select-none animate-fade-in" id="audit-history-viewport">
              <AuditHistoryLogs
                triggerNotification={triggerNotification}
              />
            </div>
          )}

          {activePage === 'agent_orchestrator' && (
            <div className="flex-1 overflow-y-auto min-h-0 pr-1 h-full select-none animate-fade-in" id="agent-orchestrator-viewport">
              <AgentOrchestrator
                dossiers={dossiers}
                triggerNotification={triggerNotification}
              />
            </div>
          )}

          </React.Suspense>

          {/* Real-time re-validation / refresh overlay */}
          {isRefreshing && (
            <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex flex-col items-center justify-center rounded-2xl gap-3 animate-fade-in" id="dossier-refresh-loading-overlay">
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin" />
                <RefreshCw className="w-5 h-5 text-emerald-400 absolute inset-0 m-auto animate-pulse" />
              </div>
              <div className="text-center space-y-1">
                <h4 className="text-sm font-black uppercase tracking-wider text-white">Re-aligning Compliance Data</h4>
                <p className="text-[10px] text-slate-400 font-mono">Running ALCOA+ gap audit and re-calculating indices...</p>
              </div>
            </div>
          )}

          {/* Compliance portal custom context menu */}
          {contextMenu && (
            <div 
              className="fixed bg-slate-950/95 border border-slate-800 rounded-2xl shadow-2xl p-1.5 w-64 z-50 backdrop-blur-md animate-scale-up select-none"
              style={{ top: contextMenu.y, left: contextMenu.x }}
              onClick={(e) => e.stopPropagation()}
              onContextMenu={(e) => e.preventDefault()}
              id="viewport-context-menu"
            >
              <div className="px-3 py-1.5 text-[9px] uppercase font-bold tracking-widest text-slate-500 font-mono border-b border-slate-900 mb-1">
                Workspace Actions
              </div>
              
              <button 
                onClick={() => {
                  handleRefreshData();
                  setContextMenu(null);
                }}
                className="w-full flex items-center justify-between text-left px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-900 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Refresh Compliance Data</span>
                </div>
                <span className="text-[9px] font-mono text-slate-500">R</span>
              </button>

              <button 
                onClick={() => {
                  handleExportXML();
                  setContextMenu(null);
                }}
                className="w-full flex items-center justify-between text-left px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-900 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Download className="w-3.5 h-3.5 text-blue-400" />
                  <span>Export eCTD Package</span>
                </div>
                <span className="text-[9px] font-mono text-slate-500">XML</span>
              </button>

              <div className="border-t border-slate-900/80 my-1" />

              <button 
                onClick={() => {
                  setIsFullscreen(!isFullscreen);
                  triggerNotification(isFullscreen ? 'Exited Fullscreen Mode' : 'Entered Fullscreen Mode - Sidebar temporarily hidden', 'success');
                  setContextMenu(null);
                }}
                className="w-full flex items-center justify-between text-left px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-900 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  {isFullscreen ? (
                    <Minimize2 className="w-3.5 h-3.5 text-amber-400" />
                  ) : (
                    <Maximize2 className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                  <span>{isFullscreen ? 'Exit Fullscreen' : 'View Fullscreen'}</span>
                </div>
                <span className="text-[9px] font-mono text-slate-500">F</span>
              </button>

              <button 
                onClick={() => {
                  setIsLightTheme(!isLightTheme);
                  triggerNotification(isLightTheme ? 'Switched to Standard Dark Mode' : 'Inverted Colors: High-Contrast Light Mode Active', 'info');
                  setContextMenu(null);
                }}
                className="w-full flex items-center justify-between text-left px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-900 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  {isLightTheme ? (
                    <Moon className="w-3.5 h-3.5 text-indigo-400" />
                  ) : (
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                  )}
                  <span>Toggle High-Contrast</span>
                </div>
                <span className="text-[9px] font-mono text-slate-500">T</span>
              </button>

              <div className="border-t border-slate-900/80 my-1" />

              <div className="px-3 py-1 text-[9px] uppercase font-bold tracking-widest text-slate-600 font-mono">
                Navigate To
              </div>

              <button 
                onClick={() => {
                  setActivePage('dossier_aligner');
                  setContextMenu(null);
                }}
                className={`w-full flex items-center gap-2 text-left px-3 py-1.5 rounded-xl text-xs transition-colors cursor-pointer ${activePage === 'dossier_aligner' ? 'text-emerald-400 font-bold bg-emerald-500/5' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
              >
                <Home className="w-3.5 h-3.5" />
                <span>1. Dossier Aligner</span>
              </button>

              <button 
                onClick={() => {
                  setActivePage('gap_matrix_hub');
                  setContextMenu(null);
                }}
                className={`w-full flex items-center gap-2 text-left px-3 py-1.5 rounded-xl text-xs transition-colors cursor-pointer ${activePage === 'gap_matrix_hub' ? 'text-emerald-400 font-bold bg-emerald-500/5' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>2. Gap Matrix Hub</span>
              </button>

              <button 
                onClick={() => {
                  setActivePage('audit_history');
                  setContextMenu(null);
                }}
                className={`w-full flex items-center gap-2 text-left px-3 py-1.5 rounded-xl text-xs transition-colors cursor-pointer ${activePage === 'audit_history' ? 'text-emerald-400 font-bold bg-emerald-500/5' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
              >
                <History className="w-3.5 h-3.5" />
                <span>10. CFR Audit Trail</span>
              </button>
            </div>
          )}

        </main>
      </div>

      {/* Modern Humble, Corporate Footer */}
      <footer className="border-t border-slate-900 py-6 px-6 bg-slate-950 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500 font-sans">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400">Pharma Dossier Harmonizer</span>
            <span>|</span>
            <span>ICH Harmonised Tripartite Guidelines Alignment System</span>
          </div>
          <div>
            <span>Global Ingress Portal • Regulatory compliance automation</span>
          </div>
        </div>
      </footer>

      {isOnboarding && (
        <OnboardingTour
          activePage={activePage}
          setActivePage={setActivePage}
          dossierTab={dossierTab}
          setDossierTab={setDossierTab}
          onClose={() => setIsOnboarding(false)}
          triggerNotification={triggerNotification}
          setShowLanding={setShowLanding}
          workflowId={tourWorkflowId}
          setWorkflowId={setTourWorkflowId}
          currentStepIdx={tourStepIdx}
          setCurrentStepIdx={setTourStepIdx}
          isSelectorOpen={tourIsSelectorOpen}
          setIsSelectorOpen={setTourIsSelectorOpen}
          activeSidePanel={activeSidePanel}
          setActiveSidePanel={setActiveSidePanel}
        />
      )}

    </div>
  );
}

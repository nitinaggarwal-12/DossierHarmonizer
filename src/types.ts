export type RegulatoryAuthority = 'FDA' | 'EMA' | 'PMDA' | 'CDSCO' | 'Swissmedic';

export interface RegulatoryBodyInfo {
  id: RegulatoryAuthority;
  name: string;
  region: string;
  standards: string;
  icon: string;
  primaryLanguage: string;
  stabilityZone: string;
  complianceLevel: number; // 0-100
  color: string;
}

export interface ComplianceGap {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  category: 'Terminology' | 'Formatting' | 'Specification' | 'Data Representation' | 'Administrative';
  section: string;
  title: string;
  description: string;
  guidelineCitation: string;
  suggestion: string;
  status: 'pending' | 'resolved';
}

export interface DossierSection {
  id: string; // e.g. "M3.2.S.1.1"
  module: number; // 1, 2, 3, 4, 5
  sectionCode: string; // e.g., "3.2.S.1.1"
  title: string;
  level: number; // nesting depth
  content: string; // markdown content representing the pharma dossier section
  status: 'compliant' | 'warning' | 'error' | 'draft';
  targetStatus?: Record<RegulatoryAuthority, 'compliant' | 'warning' | 'error' | 'unreviewed'>;
  gaps: ComplianceGap[];
  parentId?: string;
}

export interface HarmonizationResult {
  sectionId: string;
  sourceAuthority: RegulatoryAuthority;
  targetAuthority: RegulatoryAuthority;
  originalContent: string;
  harmonizedContent: string;
  changeLog: {
    field: string;
    originalValue: string;
    newValue: string;
    reason: string;
  }[];
  regulatoryReferences: string[];
  complianceScoreBefore: number;
  complianceScoreAfter: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestedPrompts?: string[];
}

export interface DemoDossier {
  id: string;
  name: string;
  drugName: string;
  therapeuticArea: string;
  dossierType: 'Small Molecule' | 'Biologic' | 'Vaccine';
  sourceAuthority: RegulatoryAuthority;
  targetAuthorities: RegulatoryAuthority[];
  sections: DossierSection[];
}

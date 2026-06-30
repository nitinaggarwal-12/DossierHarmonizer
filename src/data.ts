import { DemoDossier, RegulatoryBodyInfo, RegulatoryAuthority } from './types';

export const REGULATORY_BODIES: Record<RegulatoryAuthority, RegulatoryBodyInfo> = {
  FDA: {
    id: 'FDA',
    name: 'Food and Drug Administration',
    region: 'United States of America',
    standards: 'USP, ICH, FDA Guidances, eCTD 4.0',
    icon: '🇺🇸',
    primaryLanguage: 'English (US)',
    stabilityZone: 'Zone II (Sub-tropical)',
    complianceLevel: 94,
    color: '#0D9488', // Teal
  },
  EMA: {
    id: 'EMA',
    name: 'European Medicines Agency',
    region: 'European Union',
    standards: 'Ph. Eur., ICH, EMA Guidelines, eCTD v3.2.2',
    icon: '🇪🇺',
    primaryLanguage: 'English (UK)',
    stabilityZone: 'Zone I / II',
    complianceLevel: 91,
    color: '#3B82F6', // Blue
  },
  PMDA: {
    id: 'PMDA',
    name: 'Pharmaceuticals and Medical Devices Agency',
    region: 'Japan',
    standards: 'JP (Japanese Pharmacopoeia), ICH, PMDA Notifications',
    icon: '🇯🇵',
    primaryLanguage: 'Japanese (Submissions in JP/EN)',
    stabilityZone: 'Zone I / II',
    complianceLevel: 88,
    color: '#EF4444', // Red
  },
  CDSCO: {
    id: 'CDSCO',
    name: 'Central Drugs Standard Control Organisation',
    region: 'India',
    standards: 'IP (Indian Pharmacopoeia), CDSCO Guidelines, Sugam Format',
    icon: '🇮🇳',
    primaryLanguage: 'English (India)',
    stabilityZone: 'Zone IVb (Hot/Humid)',
    complianceLevel: 82,
    color: '#F59E0B', // Amber
  },
  Swissmedic: {
    id: 'Swissmedic',
    name: 'Swiss Agency for Therapeutic Products',
    region: 'Switzerland',
    standards: 'Ph. Eur., ICH, Swissmedic specific forms',
    icon: '🇨🇭',
    primaryLanguage: 'German/French/Italian',
    stabilityZone: 'Zone I / II',
    complianceLevel: 93,
    color: '#8B5CF6', // Purple
  },
};

export const DEMO_DOSSIERS: DemoDossier[] = [
  {
    id: 'pembrolizumab-keytruda',
    name: 'Keytruda (Pembrolizumab) BLA Submission',
    drugName: 'Pembrolizumab (Keytruda)',
    therapeuticArea: 'Oncology (Melanoma, NSCLC, HNSCC, TNBC)',
    dossierType: 'Biologic',
    sourceAuthority: 'FDA',
    targetAuthorities: ['EMA', 'PMDA', 'CDSCO'],
    sections: [
      {
        id: 'M1-PEMBRO',
        module: 1,
        sectionCode: 'Module 1',
        title: 'Module 1: Administrative and Labeling Information',
        level: 1,
        content: '# Module 1: Administrative Information\n\nThis module contains regional administrative documents for Pembrolizumab, including the proposed US Prescribing Information (USPI) with Boxed Warnings, Warnings and Precautions, and Clinical Trials Adverse Reactions tables.',
        status: 'warning',
        targetStatus: {
          FDA: 'compliant',
          EMA: 'warning',
          PMDA: 'error',
          CDSCO: 'unreviewed',
          Swissmedic: 'unreviewed',
        },
        gaps: [
          {
            id: 'gap-pembro-1',
            severity: 'critical',
            category: 'Terminology',
            section: 'Module 1',
            title: 'USPI to European SmPC Structural Formats Mismatch',
            description: 'The FDA Highlights of Prescribing Information (USPI) does not conform to the EMA SmPC standard. The EMA requires a strict 10-heading structure including the Summary of Product Characteristics (SmPC) formatted under EMA guideline (MHLW/EMA standard deviations).',
            guidelineCitation: 'EMA Guideline on the Summary of Product Characteristics (SmPC)',
            suggestion: 'Reformat Section 1.3 to compile a dual SmPC document containing the standard European headings: Name, Composition, Pharmaceutical Form, Clinical Particulars, and Pharmacological Properties.',
            status: 'pending',
          }
        ]
      },
      {
        id: 'M3.2.S.1.3-PEMBRO',
        module: 3,
        sectionCode: '3.2.S.1.3',
        title: '3.2.S.1.3 General Properties (Pembrolizumab Antibody)',
        level: 2,
        parentId: 'M1-PEMBRO',
        content: `### 3.2.S.1.3 General Properties of Pembrolizumab
        
Pembrolizumab is a humanized monoclonal IgG4-kappa antibody directed against the PD-1 cell surface receptor.

**Key Analytical Properties:**
- **Primary Structure:** Comprises 2 heavy chains of 447 residues and 2 light chains of 218 residues. Contains a stabilized IgG4 hinge region with a S228P mutation.
- **Glycosylation Profile:** N-linked oligosaccharide chains at Asn297 consist mainly of core-fucosylated biantennary structures (G0F, G1F).
- **Extinction Coefficient:** Calculated absorbance at 280 nm is 1.40 mL/(mg·cm).
- **Purity:** Standard specification requires ≥ 96.0% main monomeric peak by Size Exclusion Chromatography (SEC-HPLC).`,
        status: 'compliant',
        targetStatus: {
          FDA: 'compliant',
          EMA: 'compliant',
          PMDA: 'compliant',
          CDSCO: 'unreviewed',
          Swissmedic: 'unreviewed',
        },
        gaps: []
      },
      {
        id: 'M3.2.S.2.2-PEMBRO',
        module: 3,
        sectionCode: '3.2.S.2.2',
        title: '3.2.S.2.2 Manufacturing Process (Bioreactor Upstream/Downstream)',
        level: 2,
        parentId: 'M1-PEMBRO',
        content: `### 3.2.S.2.2 Manufacturing Process Flow
        
Pembrolizumab drug substance is produced using a recombinant Chinese Hamster Ovary (CHO) cell line in suspension.

**Process Steps:**
1. **Upstream Fermentation:** Inoculum expansion from Working Cell Bank (WCB) ampoule in disposable seed bioreactors up to a 2000L production bioreactor operating in fed-batch mode for 14 days.
2. **Clarification:** Cell removal by depth filtration and membrane sterile filtration.
3. **Downstream Purification:**
   - Protein A affinity chromatography for capture.
   - Low pH incubation for viral inactivation (pH 3.6, 60 minutes).
   - Anion exchange chromatography (AEX) in flow-through mode to eliminate host cell proteins (HCP) and DNA.
   - Cation exchange chromatography (CEX) in bind-and-elute mode for charge variants.
   - Nanofiltration for viral removal.
   - Ultrafiltration/Diafiltration into final formulation buffer.`,
        status: 'warning',
        targetStatus: {
          FDA: 'compliant',
          EMA: 'compliant',
          PMDA: 'error',
          CDSCO: 'unreviewed',
          Swissmedic: 'unreviewed',
        },
        gaps: [
          {
            id: 'gap-pembro-2',
            severity: 'critical',
            category: 'Specification',
            section: '3.2.S.2.2',
            title: 'PMDA Viral Safety Clearance Isolates Discrepancy',
            description: 'The Japanese PMDA requires that downstream viral clearance validation studies be conducted using specific Japanese reference virus isolates (BVDV, MVM, and PRV), which differ from European or US standard strains.',
            guidelineCitation: 'PMDA Notification No. 1121001: Evaluation of Viral Safety of Biotechnology Products',
            suggestion: 'Supplement the viral clearance validation section with an explicit study report comparing log reduction factors of Japanese reference strains against US reference strains.',
            status: 'pending',
          }
        ]
      }
    ]
  },
  {
    id: 'sitagliptin-januvia',
    name: 'Januvia (Sitagliptin) NDA Submission',
    drugName: 'Sitagliptin (Januvia)',
    therapeuticArea: 'Endocrinology (Type 2 Diabetes Mellitus)',
    dossierType: 'Small Molecule',
    sourceAuthority: 'EMA',
    targetAuthorities: ['FDA', 'PMDA', 'CDSCO'],
    sections: [
      {
        id: 'M1-JANUVIA',
        module: 1,
        sectionCode: 'Module 1',
        title: 'Module 1: Administrative and Labeling (EMA Format)',
        level: 1,
        content: '# Module 1: Administrative Information\n\nContains EMA administrative forms, proposed Summary of Product Characteristics (SmPC) in European formats, and mock package leaflets.',
        status: 'warning',
        targetStatus: {
          FDA: 'error',
          EMA: 'compliant',
          PMDA: 'warning',
          CDSCO: 'unreviewed',
          Swissmedic: 'unreviewed',
        },
        gaps: [
          {
            id: 'gap-januvia-1',
            severity: 'critical',
            category: 'Terminology',
            section: 'Module 1',
            title: 'FDA USPI Labeling Format Conversion Missing',
            description: 'The labeling follows the EMA SmPC format. The FDA requires a full United States Prescribing Information (USPI) format featuring the "Highlights" section, a Boxed Warning analysis if relevant, and a dedicated Patient Medication Guide (21 CFR 201.56).',
            guidelineCitation: '21 CFR 201.57 Requirements on Content and Format of Labeling',
            suggestion: 'Translate the European SmPC text into USPI formatting, organizing clinical sections with proper US headings and Boxed Warnings structure.',
            status: 'pending',
          }
        ]
      },
      {
        id: 'M3.2.S.4.1-JANUVIA',
        module: 3,
        sectionCode: '3.2.S.4.1',
        title: '3.2.S.4.1 Specifications (Sitagliptin Phosphate API)',
        level: 2,
        parentId: 'M1-JANUVIA',
        content: `### 3.2.S.4.1 Specifications for Sitagliptin Phosphate
        
**Active Substance specifications (USP / Ph. Eur. Standards):**
- **Description:** White to off-white, crystalline, non-hygroscopic powder.
- **Identification:** IR Spectroscopy conforms; Retention time by HPLC conforms.
- **Water Content:** 3.0% to 4.5% w/w (monohydrate form).
- **Chiral Purity:** Not more than 0.15% of the S-enantiomer by chiral HPLC.
- **Assay (HPLC, anhydrous basis):** 98.5% to 101.5% w/w.
- **Residual Solvents:** Acetonitrile ≤ 410 ppm, Methanol ≤ 3000 ppm.`,
        status: 'warning',
        targetStatus: {
          FDA: 'compliant',
          EMA: 'compliant',
          PMDA: 'error',
          CDSCO: 'warning',
          Swissmedic: 'unreviewed',
        },
        gaps: [
          {
            id: 'gap-januvia-2',
            severity: 'critical',
            category: 'Specification',
            section: '3.2.S.4.1',
            title: 'PMDA Japanese Pharmacopoeia Compliance Gap',
            description: 'For Japan, all analytical tests for Sitagliptin must reference Japanese Pharmacopoeia (JP) chapters. Heavy metal testing must cite JP 1.07 elemental impurities, and water content must cite JP 2.48.',
            guidelineCitation: 'PMDA Guidelines for New Drug NDA Monographs (JP XVII)',
            suggestion: 'Update specifications in Section 3.2.S.4.1 to reference the corresponding JP monographs, and specify the chiral separation validation under JP 2.01 HPLC standards.',
            status: 'pending',
          },
          {
            id: 'gap-januvia-3',
            severity: 'warning',
            category: 'Specification',
            section: '3.2.S.4.1',
            title: 'CDSCO Indian Pharmacopoeia Limits Difference',
            description: 'CDSCO requires that residual solvents comply with Indian Pharmacopoeia (IP) general standards, specifically around isopropyl alcohol limits if utilized in synthesis crystallization.',
            guidelineCitation: 'CDSCO Registration Guidance for Active Pharmaceutical Ingredients',
            suggestion: 'Append a dual IP-specification column to the analytical limits sheet in 3.2.S.4.1.',
            status: 'pending',
          }
        ]
      }
    ]
  },
  {
    id: 'gardasil9-vaccine',
    name: 'Gardasil 9 (HPV 9-valent Vaccine) Submission',
    drugName: 'Gardasil 9 (HPV Vaccine)',
    therapeuticArea: 'Preventive Medicine (Cervical Cancer Prevention)',
    dossierType: 'Vaccine',
    sourceAuthority: 'FDA',
    targetAuthorities: ['EMA', 'CDSCO'],
    sections: [
      {
        id: 'M1-GARDASIL',
        module: 1,
        sectionCode: 'Module 1',
        title: 'Module 1: FDA Administrative Forms and Clinical Overview',
        level: 1,
        content: '# Module 1: US FDA Administrative Data\n\nContains FDA-specific clinical safety summaries, CDC tracking protocols, and US labeling guidelines for Gardasil 9.',
        status: 'compliant',
        targetStatus: {
          FDA: 'compliant',
          EMA: 'warning',
          PMDA: 'unreviewed',
          CDSCO: 'warning',
          Swissmedic: 'unreviewed',
        },
        gaps: []
      },
      {
        id: 'M3.2.S.1.3-GARDASIL',
        module: 3,
        sectionCode: '3.2.S.1.3',
        title: '3.2.S.1.3 General Properties (9 Recombinant L1 Proteins)',
        level: 2,
        parentId: 'M1-GARDASIL',
        content: `### 3.2.S.1.3 General Properties of Gardasil 9 Antigens
        
Gardasil 9 is a recombinant 9-valent vaccine containing virus-like particles (VLPs) of the L1 protein of HPV Types 6, 11, 16, 18, 31, 33, 45, 52, and 58.

**Active Ingredients / Structure:**
- **Expression System:** Cultured in recombinant Saccharomyces cerevisiae (yeast).
- **Formulation:** VLPs are adsorbed on amorphous aluminum hydroxyphosphate sulfate adjuvant (AAHS).
- **Antigen Strengths:** Includes 30 mcg of Type 6, 40 mcg of Type 11, 60 mcg of Type 16, 40 mcg of Type 18, and 20 mcg each of Types 31, 33, 45, 52, 58.`,
        status: 'warning',
        targetStatus: {
          FDA: 'compliant',
          EMA: 'warning',
          PMDA: 'unreviewed',
          CDSCO: 'error',
          Swissmedic: 'unreviewed',
        },
        gaps: [
          {
            id: 'gap-gard-1',
            severity: 'critical',
            category: 'Data Representation',
            section: '3.2.S.1.3',
            title: 'CDSCO Extreme Tropical Stability (Zone IVb) Gap',
            description: 'CDSCO requires vaccine stability testing to explicitly cover Zone IVb (30 °C / 75% RH) conditions, with detailed cold-chain disruption simulation reports ("shake tests" for aluminum-adsorbed vaccines).',
            guidelineCitation: 'CDSCO National Vaccine Regulatory Guidelines, Appendix IX',
            suggestion: 'Add real-time and accelerated stability study data under Zone IVb, confirming aluminum-adsorption integrity after simulated cold-chain freeze/thaw failures.',
            status: 'pending',
          },
          {
            id: 'gap-gard-2',
            severity: 'warning',
            category: 'Specification',
            section: '3.2.S.1.3',
            title: 'EMA Adjuvant Binding Capacity Requirement',
            description: 'The EMA requires a specific quantitative binding ratio assay for each of the 9 VLP types to the AAHS adjuvant to ensure optimal immunological efficacy.',
            guidelineCitation: 'EMA Guideline on Adjuvants in Vaccines for Human Use',
            suggestion: 'Detail the in vitro desorption assay protocol demonstrating the binding efficiency (≥ 95%) of all 9 VLP antigens.',
            status: 'pending',
          }
        ]
      }
    ]
  },
  {
    id: 'molnupiravir-lagevrio',
    name: 'Lagevrio (Molnupiravir) Emergency NDA',
    drugName: 'Molnupiravir (Lagevrio)',
    therapeuticArea: 'Virology (COVID-19 Antiviral)',
    dossierType: 'Small Molecule',
    sourceAuthority: 'FDA',
    targetAuthorities: ['EMA', 'CDSCO'],
    sections: [
      {
        id: 'M1-LAGEVRIO',
        module: 1,
        sectionCode: 'Module 1',
        title: 'Module 1: Administrative Forms',
        level: 1,
        content: '# Module 1\n\nUS FDA Emergency Use Authorization (EUA) and standard NDA paperwork for Molnupiravir 200mg capsules.',
        status: 'compliant',
        targetStatus: {
          FDA: 'compliant',
          EMA: 'compliant',
          PMDA: 'unreviewed',
          CDSCO: 'unreviewed',
          Swissmedic: 'unreviewed',
        },
        gaps: []
      },
      {
        id: 'M3.2.S.4.1-LAGEVRIO',
        module: 3,
        sectionCode: '3.2.S.4.1',
        title: '3.2.S.4.1 Specifications (Molnupiravir API)',
        level: 2,
        parentId: 'M1-LAGEVRIO',
        content: `### 3.2.S.4.1 Release Specifications for Molnupiravir
        
Molnupiravir is a synthetic nucleoside prodrug of N4-hydroxycytidine.

**Release Criteria:**
- **Purity:** ≥ 99.0% by reverse-phase HPLC.
- **Heavy Metals:** ICP-MS screening conforming to ICH Q3D.
- **Water Content:** ≤ 0.5% w/w by Karl Fischer titration.
- **Genotoxic Impurities:** Nitrosamine screening and mutagenic degradation controls.`,
        status: 'warning',
        targetStatus: {
          FDA: 'compliant',
          EMA: 'warning',
          PMDA: 'unreviewed',
          CDSCO: 'error',
          Swissmedic: 'unreviewed',
        },
        gaps: [
          {
            id: 'gap-mol-1',
            severity: 'critical',
            category: 'Specification',
            section: '3.2.S.4.1',
            title: 'EMA Mutagenic/Genotoxic Impurities Strict Threshold',
            description: 'Due to the mutagenic mechanism of action of ribonucleoside analogs, the EMA requires an extremely low limit of detection (LOD) for synthesis-related genotoxic intermediates under ICH M7 guidelines.',
            guidelineCitation: 'EMA/CHMP/ICH/83812/2013: ICH M7 Assessment and Control of Mutagenic Impurities',
            suggestion: 'Add an analytical subsection specifying HPLC-MS/MS methods used to control mutagenic impurities down to ≤ 1.5 mcg/day Threshold of Toxicological Concern.',
            status: 'pending',
          },
          {
            id: 'gap-mol-2',
            severity: 'warning',
            category: 'Specification',
            section: '3.2.S.4.1',
            title: 'CDSCO Local Bioequivalence Requirement',
            description: 'The Indian CDSCO requires detailed bioequivalence (BE) trial data comparing the imported Molnupiravir product to Indian reference standards in local cohorts.',
            guidelineCitation: 'CDSCO Drugs and Cosmetics Act, Rule 122DA',
            suggestion: 'Integrate the summary of the bioequivalence study conducted in Indian healthy volunteers under fasting and fed conditions.',
            status: 'pending',
          }
        ]
      }
    ]
  },
  {
    id: 'sugammadex-bridion',
    name: 'Bridion (Sugammadex) NDA Dossier',
    drugName: 'Sugammadex (Bridion)',
    therapeuticArea: 'Anesthesiology (Neuromuscular Blockade Reversal)',
    dossierType: 'Small Molecule',
    sourceAuthority: 'EMA',
    targetAuthorities: ['FDA', 'PMDA'],
    sections: [
      {
        id: 'M1-BRIDION',
        module: 1,
        sectionCode: 'Module 1',
        title: 'Module 1: Administrative Documents',
        level: 1,
        content: '# Module 1\n\nContains proposed EMA packaging labeling, Summary of Product Characteristics (SmPC), and pediatric development records.',
        status: 'compliant',
        targetStatus: {
          FDA: 'warning',
          EMA: 'compliant',
          PMDA: 'warning',
          CDSCO: 'unreviewed',
          Swissmedic: 'unreviewed',
        },
        gaps: []
      },
      {
        id: 'M3.2.S.4.1-BRIDION',
        module: 3,
        sectionCode: '3.2.S.4.1',
        title: '3.2.S.4.1 Specifications (Sugammadex Sodium API)',
        level: 2,
        parentId: 'M1-BRIDION',
        content: `### 3.2.S.4.1 Active Ingredient Specifications
        
Sugammadex sodium is a modified gamma-cyclodextrin.

**Properties & Quality Controls:**
- **Chemical Name:** Octakis-(6-deoxy-6-(2-carboxyethyl)thio)-gamma-cyclodextrin sodium salt.
- **Complexation Capacity:** Determined in vitro against vecuronium bromide by isothermal titration calorimetry (ITC).
- **Purity:** ≥ 98.0% by anion-exchange HPLC (AEX-HPLC).
- **Positional Isomers:** Strict control of under- and over-substituted cyclodextrin variants.`,
        status: 'warning',
        targetStatus: {
          FDA: 'error',
          EMA: 'compliant',
          PMDA: 'warning',
          CDSCO: 'unreviewed',
          Swissmedic: 'unreviewed',
        },
        gaps: [
          {
            id: 'gap-bridion-1',
            severity: 'critical',
            category: 'Specification',
            section: '3.2.S.4.1',
            title: 'FDA Chiral/Isomeric Control Resolution Gap',
            description: 'The FDA demands validation of the isomeric purity of the octasubstituted gamma-cyclodextrin ring. Any under-substituted (heptasubstituted) derivative represents an active impurity and must be limited to ≤ 0.50%.',
            guidelineCitation: 'FDA NDA Chemistry, Manufacturing, and Controls (CMC) Guidance',
            suggestion: 'Implement a specific capillary electrophoresis or high-resolution AEX-HPLC method with validation parameters for the heptasubstituted derivative.',
            status: 'pending',
          },
          {
            id: 'gap-bridion-2',
            severity: 'warning',
            category: 'Terminology',
            section: '3.2.S.4.1',
            title: 'PMDA Anaphylaxis Post-Marketing Monitoring Plan',
            description: 'Japan PMDA requires a highly structured risk management plan (J-RMP) with specific active surveillance protocols for hypersensitivity (anaphylaxis) due to higher incidence rates in JP trials.',
            guidelineCitation: 'PMDA Guideline on Risk Management Plans (J-RMP)',
            suggestion: 'Add a section in administrative files outlining the post-marketing active monitoring of 1,000 anesthesia subjects in Japanese hospitals.',
            status: 'pending',
          }
        ]
      }
    ]
  },
  {
    id: 'belzutifan-welireg',
    name: 'Welireg (Belzutifan) NDA Dossier',
    drugName: 'Belzutifan (Welireg)',
    therapeuticArea: 'Oncology (Von Hippel-Lindau disease, RCC)',
    dossierType: 'Small Molecule',
    sourceAuthority: 'FDA',
    targetAuthorities: ['EMA', 'Swissmedic'],
    sections: [
      {
        id: 'M1-WELIREG',
        module: 1,
        sectionCode: 'Module 1',
        title: 'Module 1: Administrative Information',
        level: 1,
        content: '# Module 1\n\nUS FDA administrative files, orphan drug designations, and Fast Track approvals for Belzutifan 40mg film-coated tablets.',
        status: 'compliant',
        targetStatus: {
          FDA: 'compliant',
          EMA: 'warning',
          PMDA: 'unreviewed',
          CDSCO: 'unreviewed',
          Swissmedic: 'warning',
        },
        gaps: []
      },
      {
        id: 'M3.2.S.4.1-WELIREG',
        module: 3,
        sectionCode: '3.2.S.4.1',
        title: '3.2.S.4.1 Specifications (Belzutifan Crystalline API)',
        level: 2,
        parentId: 'M1-WELIREG',
        content: `### 3.2.S.4.1 Specifications for Belzutifan Active Substance
        
Belzutifan is a highly selective inhibitor of hypoxia-inducible factor-2 alpha (HIF-2α).

**Quality Parameters:**
- **Polymorphism:** Crystalline Form I (anhydrous) characterized by X-ray Powder Diffraction (XRPD).
- **Purity:** ≥ 99.2% by HPLC.
- **Thermogravimetric Analysis:** Weight loss ≤ 0.2% up to 120 °C.
- **Heavy Metals:** Conforming to ICH Q3D Guidelines.`,
        status: 'warning',
        targetStatus: {
          FDA: 'compliant',
          EMA: 'warning',
          PMDA: 'unreviewed',
          CDSCO: 'unreviewed',
          Swissmedic: 'warning',
        },
        gaps: [
          {
            id: 'gap-bel-1',
            severity: 'warning',
            category: 'Administrative',
            section: '3.2.S.4.1',
            title: 'Swissmedic National Languages Labeling Translation',
            description: 'Swissmedic requires drug labeling, patient inserts, and packaging texts to be submitted simultaneously in German, French, and Italian.',
            guidelineCitation: 'Swissmedic Regulations on Licensing Requirements for Medicinal Products (AMZV)',
            suggestion: 'Insert Swissmedic-compliant translation tables for the patient information leaflet into German, French, and Italian.',
            status: 'pending',
          },
          {
            id: 'gap-bel-2',
            severity: 'critical',
            category: 'Specification',
            section: '3.2.S.4.1',
            title: 'EMA Pediatric Investigation Plan (PIP) Waiver',
            description: 'EMA requires either an approved PIP or a class waiver before validating an oncology NDA, whereas FDA handles this post-approval under the PREA act.',
            guidelineCitation: 'Regulation (EC) No 1901/2006 on Medicinal Products for Pediatric Use',
            suggestion: 'File a formal pediatric class waiver for the orphan indication in Module 1.3 to avoid registration delays.',
            status: 'pending',
          }
        ]
      }
    ]
  },
  {
    id: 'sotatercept-winrevair',
    name: 'Winrevair (Sotatercept) BLA Dossier',
    drugName: 'Sotatercept (Winrevair)',
    therapeuticArea: 'Cardiology (Pulmonary Arterial Hypertension)',
    dossierType: 'Biologic',
    sourceAuthority: 'FDA',
    targetAuthorities: ['EMA', 'PMDA'],
    sections: [
      {
        id: 'M1-WINREVAIR',
        module: 1,
        sectionCode: 'Module 1',
        title: 'Module 1: US Admin and FDA Labeling',
        level: 1,
        content: '# Module 1\n\nUS FDA administrative documents, BLA forms, Breakthrough Therapy designations, and USPI layout for Sotatercept 45mg/60mg injections.',
        status: 'compliant',
        targetStatus: {
          FDA: 'compliant',
          EMA: 'warning',
          PMDA: 'error',
          CDSCO: 'unreviewed',
          Swissmedic: 'unreviewed',
        },
        gaps: []
      },
      {
        id: 'M3.2.S.2.2-WINREVAIR',
        module: 3,
        sectionCode: '3.2.S.2.2',
        title: '3.2.S.2.2 Manufacturing Process (Sotatercept Fusion Protein)',
        level: 2,
        parentId: 'M1-WINREVAIR',
        content: `### 3.2.S.2.2 Manufacturing of Sotatercept Drug Substance
        
Sotatercept is a recombinant fusion protein consisting of the extracellular domain of human activin receptor type IIA (ActRIIA) linked to the Fc domain of human IgG1.

**Process Steps:**
1. **Culture System:** Suspension Chinese Hamster Ovary (CHO) cells in fed-batch bioreactors.
2. **Upstream Control:** In-process monitoring of glucose consumption, lactate production, and cell viability.
3. **Downstream Isolation:**
   - Protein A affinity chromatography.
   - Low pH viral inactivation.
   - Mixed-mode chromatography (hydrophobic/ion exchange) for dimer/multimer separation.
   - Planar membrane nanofiltration.`,
        status: 'warning',
        targetStatus: {
          FDA: 'compliant',
          EMA: 'warning',
          PMDA: 'error',
          CDSCO: 'unreviewed',
          Swissmedic: 'unreviewed',
        },
        gaps: [
          {
            id: 'gap-sota-1',
            severity: 'critical',
            category: 'Specification',
            section: '3.2.S.2.2',
            title: 'EMA Endogenous Retroviral Particles (RVLP) Validation',
            description: 'The EMA requires rigorous quantitative PCR (qPCR) and transmission electron microscopy (TEM) studies validating the clearance log-reduction factors of Retrovirus-Like Particles (RVLPs) from CHO cells downstream.',
            guidelineCitation: 'EMA/CHMP/BWP/398498/2005 Guideline on Virus Safety Evaluation',
            suggestion: 'Add clear viral clearance tables showing ≥ 15 logs of RVLP clearance across the three chromatographic steps.',
            status: 'pending',
          },
          {
            id: 'gap-sota-2',
            severity: 'critical',
            category: 'Specification',
            section: '3.2.S.2.2',
            title: 'PMDA Clinical PK Bridge Study Gap',
            description: 'The PMDA requires a Japanese bridging study to verify that the pharmacokinetics and pharmacodynamics (specifically target engagement with activin A) do not differ in Japanese subjects compared to Caucasians.',
            guidelineCitation: 'PMDA Guidelines for Ethnic Factors in the Acceptance of Foreign Clinical Data',
            suggestion: 'File a request to append Phase I pharmacokinetic comparative data from Japanese subjects to Section 5.3 of the dossier.',
            status: 'pending',
          }
        ]
      }
    ]
  },
  {
    id: 'raltegravir-isentress',
    name: 'Isentress (Raltegravir) NDA Dossier',
    drugName: 'Raltegravir (Isentress)',
    therapeuticArea: 'Virology (HIV-1 Treatment)',
    dossierType: 'Small Molecule',
    sourceAuthority: 'FDA',
    targetAuthorities: ['EMA', 'CDSCO', 'PMDA'],
    sections: [
      {
        id: 'M1-ISENTRESS',
        module: 1,
        sectionCode: 'Module 1',
        title: 'Module 1: Administrative Forms',
        level: 1,
        content: '# Module 1\n\nUS FDA forms, electronic prescribing guidelines, and clinical trial overviews for Raltegravir 400mg tablets.',
        status: 'compliant',
        targetStatus: {
          FDA: 'compliant',
          EMA: 'compliant',
          PMDA: 'warning',
          CDSCO: 'warning',
          Swissmedic: 'unreviewed',
        },
        gaps: []
      },
      {
        id: 'M3.2.S.4.1-ISENTRESS',
        module: 3,
        sectionCode: '3.2.S.4.1',
        title: '3.2.S.4.1 Specifications (Raltegravir Potassium API)',
        level: 2,
        parentId: 'M1-ISENTRESS',
        content: `### 3.2.S.4.1 Specifications for Raltegravir Potassium
        
Raltegravir potassium is an HIV-1 integrase strand transfer inhibitor.

**Analytical Specification Profile:**
- **Description:** Pinkish-white, crystalline, slightly hygroscopic powder.
- **Polymorphism:** Control of anhydrous crystalline Form 1 (desired) vs Form 2.
- **Heavy Metals:** ICH Q3D elemental impurities.
- **Solubility:** Soluble in water, slightly soluble in anhydrous ethanol.`,
        status: 'warning',
        targetStatus: {
          FDA: 'compliant',
          EMA: 'compliant',
          PMDA: 'warning',
          CDSCO: 'warning',
          Swissmedic: 'unreviewed',
        },
        gaps: [
          {
            id: 'gap-ral-1',
            severity: 'warning',
            category: 'Specification',
            section: '3.2.S.4.1',
            title: 'CDSCO Pediatric Oral Suspension Formulation Gap',
            description: 'CDSCO requires specific local formulation validations for pediatric suspensions and chewable tablets, ensuring appropriate dose compliance across Indian childhood cohorts.',
            guidelineCitation: 'CDSCO Guidance on Pediatric Formulation Approvals',
            suggestion: 'Add physical stability and taste-masking evaluation profiles for the pediatric chewable formulation in Module 3.2.P.',
            status: 'pending',
          },
          {
            id: 'gap-ral-2',
            severity: 'warning',
            category: 'Data Representation',
            section: '3.2.S.4.1',
            title: 'PMDA Gastric pH/PPI Interaction Study',
            description: 'PMDA requires specific clinical pharmacology data exploring drug-drug interactions with proton pump inhibitors (PPIs) common in Japan, due to the pH-dependent solubility of raltegravir.',
            guidelineCitation: 'PMDA Guideline on Drug Interaction Studies',
            suggestion: 'Incorporate study summary showing that co-administration with omeprazole increases raltegravir AUC but remains clinically safe.',
            status: 'pending',
          }
        ]
      }
    ]
  },
  {
    id: 'doravirine-pifeltro',
    name: 'Pifeltro (Doravirine) NDA Dossier',
    drugName: 'Doravirine (Pifeltro)',
    therapeuticArea: 'Virology (HIV-1 Antiretroviral)',
    dossierType: 'Small Molecule',
    sourceAuthority: 'FDA',
    targetAuthorities: ['EMA', 'Swissmedic'],
    sections: [
      {
        id: 'M1-PIFELTRO',
        module: 1,
        sectionCode: 'Module 1',
        title: 'Module 1: Administrative Forms',
        level: 1,
        content: '# Module 1\n\nFDA administrative records, patent lists, and draft labeling for Doravirine 100mg tablets.',
        status: 'compliant',
        targetStatus: {
          FDA: 'compliant',
          EMA: 'warning',
          PMDA: 'unreviewed',
          CDSCO: 'unreviewed',
          Swissmedic: 'unreviewed',
        },
        gaps: []
      },
      {
        id: 'M3.2.S.4.1-PIFELTRO',
        module: 3,
        sectionCode: '3.2.S.4.1',
        title: '3.2.S.4.1 Specifications (Doravirine Amorphous Dispersion)',
        level: 2,
        parentId: 'M1-PIFELTRO',
        content: `### 3.2.S.4.1 Doravirine Drug Substance and Solid Dispersion Specs
        
Doravirine is a non-nucleoside reverse transcriptase inhibitor (NNRTI) formulated as an amorphous solid dispersion (ASD) with HPMCAS to enhance solubility.

**Release Criteria:**
- **Amorphous State Integrity:** Controlled by Modulated Differential Scanning Calorimetry (mDSC) and XRPD (no crystalline peaks).
- **Assay:** 98.0% - 102.0% on anhydrous, solvent-free basis.
- **Residual Solvents:** Acetone (spray-drying solvent) ≤ 5000 ppm.`,
        status: 'warning',
        targetStatus: {
          FDA: 'compliant',
          EMA: 'warning',
          PMDA: 'unreviewed',
          CDSCO: 'unreviewed',
          Swissmedic: 'unreviewed',
        },
        gaps: [
          {
            id: 'gap-dor-1',
            severity: 'critical',
            category: 'Specification',
            section: '3.2.S.4.1',
            title: 'EMA Discriminatory Dissolution for Amorphous State',
            description: 'The EMA requires a highly discriminatory dissolution testing protocol in Section 3.2.P to demonstrate that crystalline reversion (precipitation) does not occur in gastric simulated fluid.',
            guidelineCitation: 'EMA Guideline on Quality of Oral Solid Dosage Forms',
            suggestion: 'Add an analytical dissolution comparison study showing amorphous solubility versus crystalline form solubility over 120 minutes in pH 1.2 and 4.5 buffers.',
            status: 'pending',
          }
        ]
      }
    ]
  },
  {
    id: 'gefapixant-lyvelsa',
    name: 'Lyvelsa (Gefapixant) PMDA/EMA NDA Dossier',
    drugName: 'Gefapixant (Lyvelsa)',
    therapeuticArea: 'Pulmonology (Refractory Chronic Cough)',
    dossierType: 'Small Molecule',
    sourceAuthority: 'PMDA',
    targetAuthorities: ['FDA', 'EMA'],
    sections: [
      {
        id: 'M1-LYVELSA',
        module: 1,
        sectionCode: 'Module 1',
        title: 'Module 1: Administrative Information (Japan PMDA Format)',
        level: 1,
        content: '# Module 1\n\nPMDA submission documents, Japanese inserts (Tenbuhousho), and clinical review files for Gefapixant 45mg tablets.',
        status: 'compliant',
        targetStatus: {
          FDA: 'error',
          EMA: 'warning',
          PMDA: 'compliant',
          CDSCO: 'unreviewed',
          Swissmedic: 'unreviewed',
        },
        gaps: []
      },
      {
        id: 'M3.2.S.4.1-LYVELSA',
        module: 3,
        sectionCode: '3.2.S.4.1',
        title: '3.2.S.4.1 Specifications (Gefapixant Citrate API)',
        level: 2,
        parentId: 'M1-LYVELSA',
        content: `### 3.2.S.4.1 Release Specifications for Gefapixant Citrate
        
Gefapixant citrate is a selective antagonist of P2X3 receptors.

**Key Analytical Specifications:**
- **Assay:** 99.0% to 101.0% by HPLC.
- **Hydrazine Impurities:** Synthesis-derived hydrazines monitored under ICH M7 (NMT 1.5 ppm).
- **Physical Form:** Monitored by XRPD.`,
        status: 'warning',
        targetStatus: {
          FDA: 'error',
          EMA: 'warning',
          PMDA: 'compliant',
          CDSCO: 'unreviewed',
          Swissmedic: 'unreviewed',
        },
        gaps: [
          {
            id: 'gap-gef-1',
            severity: 'critical',
            category: 'Specification',
            section: '3.2.S.4.1',
            title: 'FDA Dysgeusia Compliance Mitigation Plan',
            description: 'Due to significant incidence of taste disturbances (dysgeusia) at higher doses, the FDA requires a detailed Patient Compliance and Risk Mitigation plan in Module 1.11.',
            guidelineCitation: 'FDA Guidance: Patient-Reported Outcome Measures in Clinical Trials',
            suggestion: 'Draft and incorporate a patient advisory sheet explaining the temporary nature of taste changes to improve compliance.',
            status: 'pending',
          },
          {
            id: 'gap-gef-2',
            severity: 'warning',
            category: 'Administrative',
            section: '3.2.S.4.1',
            title: 'EMA Active Post-Marketing Neurological Surveillance',
            description: 'The EMA demands an active post-marketing registry tracking sensory neurological symptoms (specifically gustatory and paresthesia issues) in European clinical practice.',
            guidelineCitation: 'EMA Guideline on Good Pharmacovigilance Practices (GVP) Module V',
            suggestion: 'Add the draft protocol for the EU-wide active post-marketing observational surveillance registry.',
            status: 'pending',
          }
        ]
      }
    ]
  },
  {
    id: 'adalimumab-biosimilar',
    name: 'Adalimumab Biosimilar Submission (GP2017)',
    drugName: 'Adalimumab (Monoclonal Antibody)',
    therapeuticArea: 'Immunology (Rheumatoid Arthritis, Crohn\'s Disease)',
    dossierType: 'Biologic',
    sourceAuthority: 'EMA',
    targetAuthorities: ['FDA', 'PMDA'],
    sections: [
      {
        id: 'M1',
        module: 1,
        sectionCode: 'Module 1',
        title: 'Module 1: Administrative Information and Prescribing Information',
        level: 1,
        content: '# Module 1: Administrative Information\n\nThis module contains regional administrative information. Because this dossier was created for the **EMA (European Medicines Agency)**, it contains the proposed **Summary of Product Characteristics (SmPC)**, package leaflet, labeling text, and clinical trial results in European patient populations.',
        status: 'warning',
        targetStatus: {
          FDA: 'error',
          EMA: 'compliant',
          PMDA: 'warning',
          CDSCO: 'unreviewed',
          Swissmedic: 'unreviewed',
        },
        gaps: [
          {
            id: 'gap-m1-1',
            severity: 'critical',
            category: 'Terminology',
            section: 'Module 1',
            title: 'Incompatible Prescribing Information Format (SmPC vs USPI)',
            description: 'The submission uses the EMA "Summary of Product Characteristics" (SmPC) format. The FDA requires the "United States Prescribing Information" (USPI) format featuring the Highlights of Prescribing Information, Detailed Table of Contents, and full prescribing information matching 21 CFR 201.56 & 201.57.',
            guidelineCitation: 'FDA Guidance for Industry: Labeling for Human Prescription Drug and Biological Products',
            suggestion: 'Restructure Section 1.3.1 to generate a draft USPI layout with proper Highlights sections and boxed warnings.',
            status: 'pending',
          },
          {
            id: 'gap-m1-2',
            severity: 'warning',
            category: 'Terminology',
            section: 'Module 1',
            title: 'Use of British/European English spelling terminology',
            description: 'The document uses "Active Substance" instead of the FDA-preferred "Active Ingredient" or "Drug Substance", and spellings like "haematological", "diarrhoea", and "tumour".',
            guidelineCitation: 'FDA Guidance on Terminology for Biologics License Applications (BLAs)',
            suggestion: 'Translate spelling and terminology from British English to US English standards.',
            status: 'pending',
          },
        ],
      },
      {
        id: 'M1.3',
        module: 1,
        sectionCode: '1.3',
        title: 'Section 1.3: Product Information (SmPC)',
        level: 2,
        parentId: 'M1',
        content: `### 1.3.1 Summary of Product Characteristics (SmPC)

**1. NAME OF THE MEDICINAL PRODUCT**
Adalimumab GP2017 40 mg solution for injection in pre-filled syringe.

**2. QUALITATIVE AND QUANTITATIVE COMPOSITION**
Each 0.4 ml pre-filled syringe contains 40 mg of adalimumab.
Adalimumab is a recombinant human monoclonal antibody expressed in Chinese Hamster Ovary (CHO) cells.

**Excipients with known effect:**
Each 0.4 ml dose contains 1.2 mg of sodium dihydrogen phosphate dihydrate and 0.4 mg of citric acid.

**3. PHARMACEUTICAL FORM**
Solution for injection (injection).
Clear, colourless to slightly yellowish aqueous solution. pH 5.2.

**4. CLINICAL PARTICULARS**
**4.1 Therapeutic indications**
Rheumatoid arthritis: Adalimumab GP2017 in combination with methotrexate is indicated for the treatment of moderate to severe, active rheumatoid arthritis in adult patients when the response to disease-modifying anti-rheumatic drugs (DMARDs) including methotrexate has been inadequate.

**4.8 Undesirable effects (Adverse effects)**
The most commonly reported adverse events are haematological anomalies (neutropenia, anaemia), respiratory tract infections, injection site reactions (pain, swelling, erythema, pruritus) and gastrointestinal disturbances (diarrhoea, nausea). Severe infections like active tuberculosis and opportunistic fungal infections have been noted.`,
        status: 'warning',
        targetStatus: {
          FDA: 'error',
          EMA: 'compliant',
          PMDA: 'warning',
          CDSCO: 'unreviewed',
          Swissmedic: 'unreviewed',
        },
        gaps: [
          {
            id: 'gap-m1-3',
            severity: 'critical',
            category: 'Formatting',
            section: '1.3',
            title: 'Adverse Reactions Classification Gaps',
            description: 'Section 4.8 uses the EMA layout for "Undesirable Effects" and uses MedDRA System Organ Class (SOC) lists grouped by frequency. FDA requires a "Warnings and Precautions" safety section and a separate clinical trials exposure adverse reaction table in 21 CFR 201.57(c)(7).',
            guidelineCitation: '21 CFR 201.57(c)(6) & (c)(7)',
            suggestion: 'Reorganize section 4.8 into Sections 5 (Warnings and Precautions) and 6 (Adverse Reactions) of the USPI, formatting the clinical trial adverse reactions table in US format.',
            status: 'pending',
          },
        ],
      },
      {
        id: 'M3',
        module: 3,
        sectionCode: 'Module 3',
        title: 'Module 3: Quality (Chemistry, Manufacturing, and Controls - CMC)',
        level: 1,
        content: '# Module 3: Quality (CMC)\n\nThis module details the Chemistry, Manufacturing, and Controls for both the Drug Substance (DS) and Drug Product (DP). It includes structural characterization, batch analysis, manufacturing controls, validation of processes, excipient safety profiles, and stability studies.',
        status: 'compliant',
        targetStatus: {
          FDA: 'compliant',
          EMA: 'compliant',
          PMDA: 'compliant',
          CDSCO: 'unreviewed',
          Swissmedic: 'unreviewed',
        },
        gaps: [],
      },
      {
        id: 'M3.2.S.1.3',
        module: 3,
        sectionCode: '3.2.S.1.3',
        title: '3.2.S.1.3 General Properties (Drug Substance - Monoclonal Antibody)',
        level: 2,
        parentId: 'M3',
        content: `### 3.2.S.1.3 General Properties of Adalimumab

**1. Primary Structure**
Adalimumab GP2017 is a recombinant fully human immunoglobulin G1 (IgG1) monoclonal antibody containing 1330 amino acids (2 heavy chains of 451 residues each, and 2 light chains of 214 residues each). Heavy chains contain N-linked glycosylation sites at Asn301 residues.

**2. Physical and Chemical Properties**
- **Molecular Mass:** Approximately 148 kDa (calculated from the primary sequence including glycosylation profile).
- **Isoelectric Point (pI):** Soluble formulation averages a pH pI range between 8.3 and 9.1.
- **Extinction Coefficient:** Calculated absorbance at 280 nm is 1.39 mL/(mg·cm).
- **Secondary Structure:** Predominantly beta-sheet motifs as confirmed by Far-UV Circular Dichroism (CD).
- **Purity:** Standard purity criteria requires ≥ 95.0% main peak IgG by Size Exclusion Chromatography (SEC-HPLC).`,
        status: 'compliant',
        targetStatus: {
          FDA: 'compliant',
          EMA: 'compliant',
          PMDA: 'compliant',
          CDSCO: 'unreviewed',
          Swissmedic: 'unreviewed',
        },
        gaps: [],
      },
      {
        id: 'M3.2.S.2.2',
        module: 3,
        sectionCode: '3.2.S.2.2',
        title: '3.2.S.2.2 Description of Manufacturing Process and Process Controls',
        level: 2,
        parentId: 'M3',
        content: `### 3.2.S.2.2 Manufacturing Process Flow

**1. Cell Culture and Harvest (Upstream)**
The upstream process starts from an ampoule of the Working Cell Bank (WCB). Cell expansion takes place in progressively larger seed bioreactors (from 2L up to 500L) utilizing CD-CHO culture media.
The production phase is conducted in a 2000L fed-batch bioreactor for 12 days. Temperature is maintained at 36.5 °C, pH 7.00 ± 0.15, dissolved oxygen at 40%.
Cell harvest is performed by continuous disk-stack centrifugation followed by depth filtration.

**2. Purification Process (Downstream)**
The clarification stream is purified using three main chromatography steps:
- **Affinity Chromatography:** Protein A column (MabSelect Sure) to capture IgG. Elution utilizes low pH citrate buffer (pH 3.5).
- **Viral Inactivation:** Low pH holding step at pH 3.50 ± 0.05 for 60-90 minutes at 20 °C.
- **Anion Exchange Chromatography (AEX):** Q-Sepharose Fast Flow in flow-through mode for impurity removal (host cell proteins (HCP), DNA, endotoxins).
- **Cation Exchange Chromatography (CEX):** SP-Sepharose High Performance in bind-and-elute mode for charge variants control.
- **Viral Filtration:** Nanofiltration (Viresolve Pro) to filter potential retroviral particles.
- **Ultrafiltration/Diafiltration (UF/DF):** Formulating into final histidine buffer, achieving concentration of 100 mg/mL.`,
        status: 'warning',
        targetStatus: {
          FDA: 'warning',
          EMA: 'compliant',
          PMDA: 'error',
          CDSCO: 'unreviewed',
          Swissmedic: 'unreviewed',
        },
        gaps: [
          {
            id: 'gap-m3-1',
            severity: 'warning',
            category: 'Specification',
            section: '3.2.S.2.2',
            title: 'Missing Quantitative Cell Viability Limits for Upstream harvest',
            description: 'FDA requires explicit quantitative parameters for minimum cell viability at the time of harvest to guarantee product consistency and restrict the release of intracellular proteolytic enzymes.',
            guidelineCitation: 'FDA Points to Consider in the Manufacture and Testing of Monoclonal Antibody Products',
            suggestion: 'Add an explicit regulatory control parameter: "Minimum cell harvest viability of ≥ 70% by Trypan Blue exclusion as a critical upstream control parameter."',
            status: 'pending',
          },
          {
            id: 'gap-m3-2',
            severity: 'critical',
            category: 'Specification',
            section: '3.2.S.2.2',
            title: 'PMDA Viral Clearance Validation Discrepancy',
            description: 'Japan\'s PMDA requires viral clearance validation studies to use local Japanese isolates or specific national reference strains for viral safety testing (specifically Bovine Viral Diarrhea Virus and Pseudorabies Virus), whereas EMA accepts European references.',
            guidelineCitation: 'PMDA Notification No. 1121001: Viral Safety Evaluation of Biotechnology Products',
            suggestion: 'Insert a specific sub-section detailing the viral clearance log reduction factors using JP reference strains or note equivalence testing protocols.',
            status: 'pending',
          },
        ],
      },
      {
        id: 'M3.2.S.7.1',
        module: 3,
        sectionCode: '3.2.S.7.1',
        title: '3.2.S.7.1 Stability Summary and Conclusions (Adalimumab Drug Substance)',
        level: 2,
        parentId: 'M3',
        content: `### 3.2.S.7.1 Stability Protocol and Summary

Stability studies have been conducted on three commercial scale validation batches of Adalimumab GP2017 drug substance stored in polycarbonate bottles at the proposed long-term storage condition (-70 °C) and accelerated temperature (5 °C).

**Table 1: Stability Analysis at Long-Term (-70 °C) vs Accelerated (5 °C) Conditions:**

| Test Parameter | Specification Limits | Storage | Initial (0M) | 6 Months (6M) | 12 Months (12M) | 24 Months (24M) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Appearance** | Clear/slightly yellow | -70 °C | Complies | Complies | Complies | Complies |
| **Purity by SEC** | ≥ 95.0% monomer | -70 °C | 99.1% | 99.0% | 98.9% | 98.8% |
| **Purity by SEC** | ≥ 95.0% monomer | 5 °C (Acc) | 99.1% | 96.5% | 95.2% | Out of Spec (93.1%) |
| **Acidic Variants** | ≤ 30.0% by CEX | -70 °C | 14.2% | 14.8% | 15.2% | 15.8% |
| **Acidic Variants** | ≤ 30.0% by CEX | 5 °C (Acc) | 14.2% | 22.4% | 27.1% | Out of Spec (34.8%) |
| **In vitro Potency**| 80% to 125% standard | -70 °C | 102% | 101% | 99% | 100% |
| **In vitro Potency**| 80% to 125% standard | 5 °C (Acc) | 102% | 94% | 88% | 79% (OOS) |

**Shelf-Life Conclusion:**
Based on 24 months of real-time stability data, a shelf life of 24 months is proposed for the drug substance stored at -70 °C. Storage under 5 °C accelerated conditions exhibits significant degradation after 12 months, requiring strict temperature logs.`,
        status: 'warning',
        targetStatus: {
          FDA: 'warning',
          EMA: 'compliant',
          PMDA: 'warning',
          CDSCO: 'unreviewed',
          Swissmedic: 'unreviewed',
        },
        gaps: [
          {
            id: 'gap-m3-3',
            severity: 'warning',
            category: 'Data Representation',
            section: '3.2.S.7.1',
            title: 'Missing Photostability Protocol in FDA Format',
            description: 'The FDA requires specific photostability studies adhering to ICH Q1B. This requires exposing drug substance batches to a minimum light exposure of 1.2 million lux-hours and 200 watt-hours/m² near UV energy.',
            guidelineCitation: 'FDA Guidance: ICH Q1A(R2) & Q1B Stability and Photostability Testing',
            suggestion: 'Incorporate a detailed paragraph explaining that GP2017 was tested under ICH Q1B Option II conditions (cool white fluorescent + near-UV lamp) and remained stable with no significant changes in purity or aggregates.',
            status: 'pending',
          },
        ],
      },
    ],
  },
  {
    id: 'empagliflozin-formulation',
    name: 'Empagliflozin 10mg/25mg Tablets Dossier',
    drugName: 'Empagliflozin (SGLT2 Inhibitor)',
    therapeuticArea: 'Endocrinology / Cardiology (Type 2 Diabetes, Heart Failure)',
    dossierType: 'Small Molecule',
    sourceAuthority: 'FDA',
    targetAuthorities: ['EMA', 'PMDA', 'CDSCO'],
    sections: [
      {
        id: 'M1-EMPA',
        module: 1,
        sectionCode: 'Module 1',
        title: 'Module 1: Administrative and Labeling',
        level: 1,
        content: '# Module 1 (US FDA Formats)\n\nContains US-specific administrative forms (FDA 356h, patent certification) and US Prescribing Information (USPI) for Empagliflozin film-coated tablets.',
        status: 'compliant',
        targetStatus: {
          FDA: 'compliant',
          EMA: 'warning',
          PMDA: 'error',
          CDSCO: 'unreviewed',
          Swissmedic: 'unreviewed',
        },
        gaps: [],
      },
      {
        id: 'M3.2.S.4.1-EMPA',
        module: 3,
        sectionCode: '3.2.S.4.1',
        title: '3.2.S.4.1 Specifications (Empagliflozin Drug Substance)',
        level: 2,
        parentId: 'M1-EMPA',
        content: `### 3.2.S.4.1 Specification Criteria

This section outlines the active pharmaceutical ingredient (API) release specifications for Empagliflozin. 

**Table: Active Ingredient Release specifications (USP Standard):**

- **Appearance:** White to off-white, non-hygroscopic crystalline powder.
- **Identification (IR):** Corresponds to Empagliflozin reference standard.
- **Identification (HPLC):** Retention time aligns with standard.
- **Water Content (Karl Fischer):** Not more than 1.0% w/w.
- **Residue on Ignition:** Not more than 0.1% w/w (USP <281>).
- **Heavy Metals:** Not more than 20 ppm (USP <231> / ICH Q3D limits).
- **Organic Impurities (HPLC):**
  - Unspecified Impurity: NMT 0.10%
  - Total Impurities: NMT 0.50%
- **Assay (HPLC, anhydrous basis):** 98.0% to 102.0%`,
        status: 'warning',
        targetStatus: {
          FDA: 'compliant',
          EMA: 'warning',
          PMDA: 'error',
          CDSCO: 'warning',
          Swissmedic: 'unreviewed',
        },
        gaps: [
          {
            id: 'gap-empa-1',
            severity: 'critical',
            category: 'Specification',
            section: '3.2.S.4.1',
            title: 'Japanese Pharmacopoeia (JP) testing methods alignment',
            description: 'To register in Japan, the PMDA requires all assay and identification tests to cite Japanese Pharmacopoeia (JP) standard monographs and methods. Residue on ignition must cite JP 2.44 rather than USP <281>, and heavy metals must refer to JP 1.07 elemental impurities.',
            guidelineCitation: 'PMDA Guidelines for New Drug Application Monographs (JP XVII)',
            suggestion: 'Update pharmacopoeial references from USP and European Pharmacopoeia (Ph. Eur.) to JP, and rewrite testing descriptions to conform with JP chapter definitions.',
            status: 'pending',
          },
          {
            id: 'gap-empa-2',
            severity: 'warning',
            category: 'Specification',
            section: '3.2.S.4.1',
            title: 'CDSCO Limit Differences (India)',
            description: 'The CDSCO requires Indian Pharmacopoeia (IP) general monograph specifications for tablets, specifically regarding residual solvents. Limits for ethanol and ethyl acetate must be updated to comply with Indian IP standard guidelines.',
            guidelineCitation: 'Central Drugs Standard Control Organisation (CDSCO) Import & Registration Guidelines',
            suggestion: 'Append a dual-specification section referencing IP standards for CDSCO validation.',
            status: 'pending',
          },
        ],
      },
      {
        id: 'M3.2.P.3.3-EMPA',
        module: 3,
        sectionCode: '3.2.P.3.3',
        title: '3.2.P.3.3 Description of Manufacturing Process and In-Process Controls',
        level: 2,
        parentId: 'M1-EMPA',
        content: `### 3.2.P.3.3 Tablet Manufacturing Process

**Description of Dry Granulation and Compression Process:**
1. **Dispensing:** Weigh and dispense Empagliflozin API, microcrystalline cellulose (Avicel PH-101), lactose monohydrate, croscarmellose sodium, and colloidal silicon dioxide.
2. **Pre-Blending:** Sieve the ingredients through a 40-mesh screen and blend in a high-shear mixer for 10 minutes at 150 RPM.
3. **Lubrication 1:** Blend with half the magnesium stearate for 3 minutes.
4. **Dry Granulation (Roller Compaction):** Compact the pre-blend using a roller compactor at a roll pressure of 4-6 MPa. Granulate the ribbons through an oscillating granulator with a 1.0 mm sieve.
5. **Lubrication 2:** Blend the granules with the remaining magnesium stearate in a V-blender for 5 minutes.
6. **Compression:** Compress into tablets using a rotary tablet press equipped with oval punches. Target weight is 200 mg for the 10mg strength, and 500 mg for the 25mg strength.
7. **Film Coating:** Coat the cores using Opadry Yellow dispersion in a perforated coating pan at 40 °C target exhaust temperature.`,
        status: 'warning',
        targetStatus: {
          FDA: 'compliant',
          EMA: 'compliant',
          PMDA: 'warning',
          CDSCO: 'unreviewed',
          Swissmedic: 'unreviewed',
        },
        gaps: [
          {
            id: 'gap-empa-3',
            severity: 'warning',
            category: 'Data Representation',
            section: '3.2.P.3.3',
            title: 'PMDA Material Grade Certification Requirements',
            description: 'For Japan submissions, the excipient lactose monohydrate must be certified as Transmissible Spongiform Encephalopathy (TSE) and Bovine Spongiform Encephalopathy (BSE) free, with a detailed source certificate appended to 3.2.P.4.',
            guidelineCitation: 'MHLW Ministerial Ordinance No. 2: Control of Bovine Spongiform Encephalopathy risk in pharmaceuticals',
            suggestion: 'Add BSE/TSE statements stating that lactose monohydrate is sourced from bovine milk fit for human consumption and manufactured in certified BSE-free regions.',
            status: 'pending',
          },
        ],
      },
    ],
  },
];

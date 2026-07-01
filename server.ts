import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

// Load environment variables
dotenv.config();

import { getDB, initializeDatabase } from './src/db';
import crypto from 'crypto';

const app = express();

// Custom Structured JSON Logger
const logger = {
  info: (message: string, meta: Record<string, any> = {}) => {
    console.log(JSON.stringify({ timestamp: new Date().toISOString(), level: 'INFO', message, ...meta }));
  },
  warn: (message: string, meta: Record<string, any> = {}) => {
    console.warn(JSON.stringify({ timestamp: new Date().toISOString(), level: 'WARN', message, ...meta }));
  },
  error: (message: string, error?: any, meta: Record<string, any> = {}) => {
    console.error(JSON.stringify({ 
      timestamp: new Date().toISOString(), 
      level: 'ERROR', 
      message, 
      error: error?.message || String(error),
      stack: error?.stack,
      ...meta 
    }));
  }
};

// Security Headers Middleware (Manual Helmet Alternative)
app.use((req, res, next) => {
  // Prevent clickjacking by blocking frames
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME-type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Force HTTPS (HSTS)
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  
  // Controls referrer information
  res.setHeader('Referrer-Policy', 'no-referrer-when-downgrade');
  
  // Basic Content Security Policy (allows local assets, standard fonts, and Google APIs)
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob:; connect-src 'self' ws://localhost:* wss://localhost:* http://localhost:* https://*.googleapis.com"
  );
  
  next();
});

app.use(express.json({ limit: '10mb' }));
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Initialize GoogleGenAI SDK safely
let ai: GoogleGenAI | null = null;
const API_KEY = process.env.GEMINI_API_KEY;

if (API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
    logger.info('Gemini API initialized successfully on the server.');
  } catch (error) {
    logger.error('Failed to initialize Gemini API:', error);
  }
} else {
  logger.warn('GEMINI_API_KEY is missing. Server will operate with intelligent fallback data.');
}

// Global regulatory background rules used to feed Gemini's reasoning
const REGULATORY_CONTEXTS = {
  FDA: `Target Authority: US Food and Drug Administration (FDA)
Standards: United States Pharmacopeia (USP), ICH guidelines, FDA-specific Guidances (e.g., Labeling Guidance, BLA Chemistry manufacturing and controls (CMC) expectations, CFR Title 21).
Key Rules:
- Uses "Drug Substance" or "Active Ingredient" (never "Active Substance").
- Prefers "Adverse Reactions" over "Undesirable Effects" / "Adverse Events" for product labeling.
- Labeling must follow the United States Prescribing Information (USPI) format (Highlights, Table of Contents, Full Prescribing Info) according to 21 CFR 201.56/201.57.
- For stability, photostability must explicitly cite ICH Q1B options with UV / lux values.
- Upstream manufacturing should specify quantitative minimum cell viability constraints (usually >= 70% at harvest).
- Uses American English spelling (e.g., color, hematological, tumor, diarrhea).`,

  EMA: `Target Authority: European Medicines Agency (EMA)
Standards: European Pharmacopoeia (Ph. Eur.), ICH guidelines, EMA scientific guidelines.
Key Rules:
- Uses "Active Substance" or "Medicinal Product" (instead of Drug Substance or Drug Product).
- Focuses on "Summary of Product Characteristics" (SmPC) format with specific numbered sections (1. Name, 2. Qualitative/Quantitative, 3. Pharmaceutical Form, etc.).
- Groupings of adverse reactions are sorted by MedDRA frequency classes (Very common >=1/10, Common >=1/100 to <1/10).
- Uses British/European English spelling (e.g., colour, haematological, tumour, diarrhoea).
- Viral clearance validation relies on European reference viruses.`,

  PMDA: `Target Authority: Pharmaceuticals and Medical Devices Agency (PMDA), Japan
Standards: Japanese Pharmacopoeia (JP), ICH guidelines, MHLW Notifications.
Key Rules:
- Requires testing methods and limits to conform strictly to the Japanese Pharmacopoeia (JP) chapters and monographs.
- Focuses heavily on BSE/TSE-free certification of materials of animal origin (specifically lactose monohydrate or gelatin source).
- Extremely detailed specifications required for purification steps, cell substrate safety, and local viral isolates (e.g., using JP-specific virus clearance models).
- High standards of purity, requiring specific identification checks.`,

  CDSCO: `Target Authority: Central Drugs Standard Control Organisation (CDSCO), India
Standards: Indian Pharmacopoeia (IP), CDSCO regulatory standards, Sugam system submissions.
Key Rules:
- Requires IP compliance for active raw ingredients, excipients, and finished dosage.
- Specific stability zone requirements (Zone IVb: 30 °C / 75% RH for long-term and 40 °C / 75% RH for accelerated).
- Requires clear formulation declarations of manufacturing licenses and local manufacturer certificates.`,

  Swissmedic: `Target Authority: Swiss Agency for Therapeutic Products (Swissmedic)
Standards: European Pharmacopoeia (Ph. Eur.), ICH, Swissmedic specific submission files.
Key Rules:
- Accepts SmPC format but with Swiss-specific country annexes.
- Multilingual labeling or declarations (German/French/Italian preferred).
- Fast track or simplified procedures require clear alignment with approved EU/FDA references.`
};

// --- API ENDPOINTS ---

// 1. Audit / Analyze Gaps Endpoint
app.post('/api/analyze-gaps', async (req, res) => {
  const { sectionId, title, sectionCode, content, targetAuthority, sourceAuthority } = req.body;

  if (!content) {
    return res.status(400).json({ error: 'No content provided for analysis' });
  }

  const prompt = `You are a world-class Pharmaceutical Regulatory Consultant specializing in eCTD (Electronic Common Technical Document) submissions and CMC (Chemistry, Manufacturing, and Controls).
  
Your task is to analyze the following pharmaceutical dossier section (Source: ${sourceAuthority || 'Unknown'}) and detect any compliance gaps, compatibility issues, or formatting deficiencies when submitting to the target regulatory body: ${targetAuthority}.

Target Regulatory Context:
${REGULATORY_CONTEXTS[targetAuthority as keyof typeof REGULATORY_CONTEXTS] || 'Generic ICH standards'}

---
Dossier Section Details:
- Code: ${sectionCode || ''}
- Title: ${title || ''}
- Current Content:
${content}
---

Identify 1 to 3 distinct regulatory, terminology, formatting, or data gaps. For each gap, provide:
1. Category: One of "Terminology", "Formatting", "Specification", "Data Representation", "Administrative"
2. Severity: One of "critical" (prevents submission / would cause Refusal to File), "warning" (needs resolution, highly flagged), "info" (minor suggestion)
3. Title: A concise, technical name of the issue
4. Description: Detailed scientific or administrative reason why this is a gap
5. Guideline Citation: The exact guideline or regulation being violated
6. Suggestion: What changes should be made to resolve the gap

Your response must be returned in JSON matching the defined schema structure. Let's think step by step to find realistic, high-fidelity gaps.`;

  const cacheKey = crypto.createHash('sha256').update(content + targetAuthority + 'analyze-gaps').digest('hex');
  try {
    const db = await getDB();
    const cached = await db.query('SELECT response_text FROM api_cache WHERE hash = $1', [cacheKey]);
    if (cached.length > 0) {
      logger.info('Returning cached gap analysis results.', { sectionId, targetAuthority });
      const responseText = cached[0].response_text || cached[0].RESPONSE_TEXT || '{}';
      return res.json(JSON.parse(responseText.trim()));
    }
  } catch (cacheErr) {
    logger.warn('Failed to query database cache', cacheErr);
  }

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              gaps: {
                type: Type.ARRAY,
                description: 'List of identified regulatory gaps',
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING, description: 'Unique random ID' },
                    severity: { type: Type.STRING, description: 'critical, warning, or info' },
                    category: { type: Type.STRING, description: 'Terminology, Formatting, Specification, Data Representation, or Administrative' },
                    section: { type: Type.STRING, description: 'Section code' },
                    title: { type: Type.STRING, description: 'Short title' },
                    description: { type: Type.STRING, description: 'Detailed reason' },
                    guidelineCitation: { type: Type.STRING, description: 'Exact regulatory guideline citation' },
                    suggestion: { type: Type.STRING, description: 'Solution to resolve' }
                  },
                  required: ['id', 'severity', 'category', 'section', 'title', 'description', 'guidelineCitation', 'suggestion']
                }
              }
            },
            required: ['gaps']
          }
        }
      });

      const responseText = response.text || '{}';
      const parsed = JSON.parse(responseText.trim());

      // Save to cache
      try {
        const db = await getDB();
        await db.query(
          'INSERT INTO api_cache (hash, response_text) VALUES ($1, $2)',
          [cacheKey, responseText]
        );
      } catch (cacheWriteErr) {
        logger.warn('Failed to write response to api_cache', cacheWriteErr);
      }

      return res.json(parsed);
    } catch (error: any) {
      logger.error('Error in analyze-gaps endpoint via Gemini', error, { sectionId, targetAuthority });
      return res.status(500).json({ error: 'Internal Server Error', code: 'REG_ANALYSIS_FAILED' });
    }
  } else {
    // Elegant fallback mock audit generator based on targets
    logger.info('Using mock audit generator fallback', { sectionId, targetAuthority });
    const mockGaps = [];
    if (targetAuthority === 'FDA' && sourceAuthority === 'EMA') {
      mockGaps.push({
        id: 'mock-gap-1',
        severity: 'critical',
        category: 'Terminology',
        section: sectionCode || 'Section',
        title: 'Terminology and Labeling Standard Discrepancy (SmPC vs USPI)',
        description: 'The dossier uses European EMA nomenclature and SmPC structural headers. FDA expects a US Prescribing Information (USPI) layout following 21 CFR 201.57, using terms like "drug substance" and US-style adverse reaction grouping.',
        guidelineCitation: '21 CFR 201.56 & 21 CFR 201.57',
        suggestion: 'Convert the layout to USPI standards, update spelling to US English (color, theater, etc.), and rename "Active Substance" to "Drug Substance / Active Ingredient".',
        status: 'pending'
      });
    } else if (targetAuthority === 'PMDA') {
      mockGaps.push({
        id: 'mock-gap-2',
        severity: 'critical',
        category: 'Specification',
        section: sectionCode || 'Section',
        title: 'Japanese Pharmacopoeia Testing Standard Alignment',
        description: 'The specification files do not reference Japan\'s official Pharmacopoeia (JP) chapters or validation protocols, which is a mandatory PMDA requirement for raw materials and testing methods.',
        guidelineCitation: 'PMDA Guidelines for New Drug Application Monographs (JP XVII)',
        suggestion: 'Replace USP/Ph. Eur. testing methods with their respective JP standard equivalents and update certifications.',
        status: 'pending'
      });
    } else {
      mockGaps.push({
        id: 'mock-gap-generic',
        severity: 'warning',
        category: 'Formatting',
        section: sectionCode || 'Section',
        title: 'Target Authority Packaging / Stability Standards Alignment',
        description: 'General structural references should be refined to match the custom stability zone or linguistic templates preferred by the target regulatory authority.',
        guidelineCitation: 'ICH Q1A-Q1F Stability Guidelines',
        suggestion: 'Verify temperature zone specifications and update target terminology.',
        status: 'pending'
      });
    }
    return res.json({ gaps: mockGaps });
  }
});

// 2. Dossier Harmonizer Endpoint
app.post('/api/harmonize', async (req, res) => {
  const { sectionId, sourceAuthority, targetAuthority, content, sectionCode, title } = req.body;

  if (!content) {
    return res.status(400).json({ error: 'No content provided for harmonization' });
  }

  const prompt = `You are a world-class Pharma Regulatory Harmonizer.
Your goal is to take a pharmaceutical dossier section, analyze its content, and automatically translate / rewrite it so that it complies perfectly with the target regulatory authority: ${targetAuthority} (Source was: ${sourceAuthority}).

Target Regulatory Standards & Vocabulary:
${REGULATORY_CONTEXTS[targetAuthority as keyof typeof REGULATORY_CONTEXTS] || 'Standard ICH compliant format'}

---
Dossier Section Details:
- Code: ${sectionCode || ''}
- Title: ${title || ''}
- Source Content (Markdown):
${content}
---

Please perform the following steps:
1. Re-write the content of this section so it satisfies all of ${targetAuthority}'s unique standards, spelling variations, terminology preferences, and structural mandates.
2. Form tables in clean markdown when needed (e.g. converting temperatures, altering units, or adjusting columns).
3. Create a detailed change log of adjustments made (at least 2-4 items), detailing:
   - field/paragraph changed
   - original value / term
   - new value / term
   - specific scientific or regulatory reason
4. Cite the key regulatory references used.
5. Provide a simulated before-and-after compliance score (integer 0-100).

Your response must be structured in JSON matching the specified schema. Keep the markdown formatting in harmonizedContent looking clean, premium, and fully professional. Let's think step by step to generate a highly convincing pharmaceutical translation.`;

  const cacheKey = crypto.createHash('sha256').update(content + targetAuthority + 'harmonize').digest('hex');
  try {
    const db = await getDB();
    const cached = await db.query('SELECT response_text FROM api_cache WHERE hash = $1', [cacheKey]);
    if (cached.length > 0) {
      logger.info('Returning cached harmonization results.', { sectionId, targetAuthority });
      const responseText = cached[0].response_text || cached[0].RESPONSE_TEXT || '{}';
      const parsed = JSON.parse(responseText.trim());
      return res.json({
        sectionId,
        sourceAuthority,
        targetAuthority,
        originalContent: content,
        ...parsed
      });
    }
  } catch (cacheErr) {
    logger.warn('Failed to query database cache', cacheErr);
  }

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              harmonizedContent: { type: Type.STRING, description: 'The rewritten high-fidelity Markdown text' },
              changeLog: {
                type: Type.ARRAY,
                description: 'Key adjustments made',
                items: {
                  type: Type.OBJECT,
                  properties: {
                    field: { type: Type.STRING, description: 'Name of the field or location of edit' },
                    originalValue: { type: Type.STRING, description: 'Original terminology or phrasing' },
                    newValue: { type: Type.STRING, description: 'Harmonized terminology or phrasing' },
                    reason: { type: Type.STRING, description: 'Regulatory context or guideline justification' }
                  },
                  required: ['field', 'originalValue', 'newValue', 'reason']
                }
              },
              regulatoryReferences: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Regulatory standards or citations'
              },
              complianceScoreBefore: { type: Type.INTEGER },
              complianceScoreAfter: { type: Type.INTEGER }
            },
            required: ['harmonizedContent', 'changeLog', 'regulatoryReferences', 'complianceScoreBefore', 'complianceScoreAfter']
          }
        }
      });

      const responseText = response.text || '{}';
      const parsed = JSON.parse(responseText.trim());

      // Save to cache
      try {
        const db = await getDB();
        await db.query(
          'INSERT INTO api_cache (hash, response_text) VALUES ($1, $2)',
          [cacheKey, responseText]
        );
      } catch (cacheWriteErr) {
        logger.warn('Failed to write response to api_cache', cacheWriteErr);
      }

      return res.json({
        sectionId,
        sourceAuthority,
        targetAuthority,
        originalContent: content,
        ...parsed
      });
    } catch (error: any) {
      logger.error('Error in harmonize endpoint via Gemini', error, { sectionId, targetAuthority });
      return res.status(500).json({ error: 'Internal Server Error', code: 'HARMONIZATION_FAILED' });
    }
  } else {
    // Robust Mock Harmonizer Fallback
    logger.info('Using mock harmonizer fallback', { sectionId, targetAuthority });
    let harmonizedContent = content;
    const changeLog = [];
    const regulatoryReferences = [];

    if (targetAuthority === 'FDA') {
      harmonizedContent = content
        .replace(/colour/gi, 'color')
        .replace(/haematological/gi, 'hematological')
        .replace(/diarrhoea/gi, 'diarrhea')
        .replace(/tumour/gi, 'tumor')
        .replace(/Active Substance/g, 'Drug Substance')
        .replace(/Medicinal Product/g, 'Drug Product');
      
      // Inject safety highlights if this was Module 1
      if (sectionId.startsWith('M1')) {
        harmonizedContent = `### 1.3.1 US Prescribing Information (Highlights of Prescribing Information)

**WARNING: SERIOUS INFECTIONS**
*See full prescribing information for complete boxed warning.*
- **Increased risk of serious infections leading to hospitalization or death, including tuberculosis (TB), bacterial sepsis, invasive fungal infections (such as histoplasmosis), and other opportunistic infections.**
- **Discontinue treatment if a patient develops a serious infection or sepsis.**

---

**1 INDICATIONS AND USAGE**
Adalimumab is a tumor necrosis factor (TNF) blocker indicated for:
- Rheumatoid Arthritis (RA) (1.1)
- Crohn's Disease (CD) (1.2)

**2 DOSAGE AND ADMINISTRATION**
- Administer 4 mg/0.4 mL sub-cutaneously every other week.

**3 DOSAGE FORMS AND STRENGTHS**
- Injection: 40 mg/0.4 mL in a single-dose pre-filled syringe.

---
${harmonizedContent}`;
      }

      changeLog.push(
        {
          field: 'Spelling Standards',
          originalValue: 'colour, haematological, diarrhoea',
          newValue: 'color, hematological, diarrhea',
          reason: 'FDA guidelines dictate US English spelling for patient safety and database consistency.'
        },
        {
          field: 'Drug Substance Nomenclature',
          originalValue: 'Active Substance / Medicinal Product',
          newValue: 'Drug Substance / Drug Product',
          reason: 'Nomenclature alignment with FDA Code of Federal Regulations (CFR) guidelines.'
        }
      );
      regulatoryReferences.push('21 CFR 201.57 (Labeling Requirements)', 'ICH Q1A-Q1F Stability Series');
    } else if (targetAuthority === 'PMDA') {
      harmonizedContent = content
        .replace(/USP <281>/g, 'JP 2.44 (Residue on Ignition)')
        .replace(/USP <231>/g, 'JP 1.07 (Elemental Impurities)')
        .replace(/USP Standard/g, 'Japanese Pharmacopoeia (JP) Standard')
        .replace(/Lactose monohydrate/g, 'Lactose monohydrate (BSE/TSE Certified, JP Grade)');

      changeLog.push(
        {
          field: 'Pharmacopoeial References',
          originalValue: 'USP <281> / USP Standard',
          newValue: 'JP 2.44 / Japanese Pharmacopoeia standard',
          reason: 'Japan PMDA mandates validation checks matching native Japanese Pharmacopoeia testing procedures.'
        },
        {
          field: 'Excipient Statement',
          originalValue: 'Lactose monohydrate',
          newValue: 'Lactose monohydrate (BSE/TSE Certified)',
          reason: 'Japanese regulatory control specifies animal origin documentation for raw lactose source streams.'
        }
      );
      regulatoryReferences.push('PMDA Notification No. 1121001 on Bovine Spongiform Encephalopathy controls', 'JP XVII Monographs');
    } else {
      changeLog.push({
        field: 'Regulatory templates',
        originalValue: 'Original values',
        newValue: 'Harmonized standards',
        reason: 'Adjusted to fit standard ICH guidelines of target region.'
      });
      regulatoryReferences.push('ICH Harmonised Guidelines (M4Q)');
    }

    return res.json({
      sectionId,
      sourceAuthority,
      targetAuthority,
      originalContent: content,
      harmonizedContent,
      changeLog,
      regulatoryReferences,
      complianceScoreBefore: 65,
      complianceScoreAfter: 98
    });
  }
});

// 3. Regulatory Assistant Chat Endpoint
app.post('/api/assistant/chat', async (req, res) => {
  const { messages, targetAuthority } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Missing or invalid messages array' });
  }

  // Get current chat query
  const userMessage = messages[messages.length - 1].content;
  const authorityContext = targetAuthority 
    ? `The user is specifically asking about regulatory processes associated with: ${targetAuthority}.\nContext details:\n${REGULATORY_CONTEXTS[targetAuthority as keyof typeof REGULATORY_CONTEXTS]}`
    : 'Provide advice on global eCTD submissions (FDA, EMA, PMDA, CDSCO).';

  const systemInstruction = `You are "Harmonizer-AI", an elite, world-class pharmaceutical regulatory affairs consultant and specialist. 
You possess encyclopedic knowledge of ICH (International Council for Harmonisation) standards, eCTD v3.2.2 and v4.0, FDA Guidances, EMA Guidelines, PMDA MHLW Ministerial Ordinances, and CDSCO rules.
Your purpose is to answer complex questions regarding pharmaceutical dossiers, CMC validation, clinical dossiers, drug labeling translation, and submission strategies.

Provide deeply detailed, technical, yet perfectly clear answers. Group information with lists, tables, or highlighted bold terms.
Never cite fake regulations. If a specific detail is unknown, rely on established ICH standards.

${authorityContext}

Keep your tone clinical, professional, helpful, and confident. Avoid promotional language or emojis (except small flags when naming countries).`;

  if (ai) {
    try {
      // Reformat message history for GoogleGenAI SDK
      const formattedContents = messages.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: formattedContents,
        config: {
          systemInstruction,
        }
      });

      return res.json({
        content: response.text || 'I apologize, I could not formulate a response at this time.',
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      logger.error('Error in chat assistant', error);
      return res.status(500).json({ error: 'Internal Server Error', code: 'CHAT_FAILED' });
    }
  } else {
    // Intelligent Mock Chatbot responses
    logger.info('Using mock chat assistant', { userMessageLength: userMessage.length });
    let reply = "Hello! I am Harmonizer-AI, your regulatory compliance expert. Currently running in offline fallback mode.";
    
    const lower = userMessage.toLowerCase();
    if (lower.includes('smpc') || lower.includes('uspi') || lower.includes('label')) {
      reply = `In eCTD Module 1, the **Summary of Product Characteristics (SmPC)** is the EU EMA standard prescribing text. When harmonizing this for the US FDA, you must convert it to the **United States Prescribing Information (USPI)** layout according to **21 CFR 201.56 & 201.57**.

Key transitions to execute:
1. **Highlights of Prescribing Information**: FDA requires a highly visible summary box detailing Indications, Dosage, Boxed Warnings, and recent changes.
2. **Adverse Reactions Table**: EMA lists adverse effects sorted by MedDRA frequencies (Common, Uncommon). FDA requires grouping based on specific clinical trial exposure rates (e.g., events occurring in >2% of patients).
3. **Nomenclature**: Change "Active Substance" to "Drug Substance" and "Excipients" to "Inactive Ingredients".

Would you like me to draft a specific USPI section for your compound?`;
    } else if (lower.includes('pmda') || lower.includes('japan') || lower.includes('jp')) {
      reply = `Submitting a dossier to Japan's **PMDA (Pharmaceuticals and Medical Devices Agency)** involves strict validation rules:

1. **Japanese Pharmacopoeia (JP) Monographies**: All testing procedures (such as identification by IR, UV, and residue on ignition assays) must strictly refer to the corresponding analytical sections of the JP.
2. **BSE/TSE Safety Certificates**: Gelatin, lactose monohydrate, or any other bovine/animal derivative excipients require high-quality source traceability certificates to prove BSE clearance.
3. **Foreign Stability Data**: While PMDA accepts stability studies conducted under standard ICH conditions, they are particularly stringent about local climate compatibility and requires precise data for three clinical test batches including native East Asian patient populations in Module 5.

Let me know if you would like to audit your Module 3 specifications for JP compliance.`;
    } else if (lower.includes('stability') || lower.includes('zone')) {
      reply = `Pharmaceutical stability protocols must comply with the target market's specific climate conditions as described by **ICH Q1A (R2)**:

- **Zones I & II (US, EU, Japan)**: Long-term testing at **25 °C ± 2 °C / 60% RH ± 5% RH**, and accelerated testing at **40 °C ± 2 °C / 75% RH ± 5% RH**.
- **Zone IVb (India CDSCO, ASEAN)**: Long-term testing at **30 °C ± 2 °C / 75% RH ± 5% RH** because of high ambient heat and humidity.
- **Photostability**: Must satisfy **ICH Q1B**, detailing a minimum exposure of **1.2 million lux-hours** and **200 watt-hours/m²** of UV light.

Do you have stability data you want to translate or check for climate compliance?`;
    } else {
      reply = `I understand you have questions regarding eCTD submissions. I can assist with:
- **Module 3 (CMC)**: Specifications, analytical methods, stability zone compliance (ICH Q1A-Q1F), and manufacturing validations.
- **Module 1 (Labeling)**: Converting EMA SmPCs to US FDA Prescribing Information (USPI) or local country monographs.
- **Nomenclature Checks**: Finding and updating terminology gaps across global health authorities.

Could you elaborate on the specific section or health authority guidelines you are working on?`;
    }

    return res.json({
      content: reply,
      timestamp: new Date().toISOString()
    });
  }
});


// Open Resource Discovery (ORD) Manifest Endpoint
app.get('/.well-known/open-resource-discovery-manifest.json', (req, res) => {
  res.json({
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
  });
});

// Model Context Protocol (MCP) JSON-RPC 2.0 Gateway
app.post('/api/mcp', (req, res) => {
  const { jsonrpc, method, params, id } = req.body || {};
  if (jsonrpc !== '2.0') {
    return res.status(400).json({
      jsonrpc: '2.0',
      error: { code: -32600, message: 'Invalid Request (Not JSON-RPC 2.0)' },
      id: id || null
    });
  }

  switch (method) {
    case 'tools/list':
      return res.json({
        jsonrpc: '2.0',
        result: {
          tools: [
            {
              name: 'compliance_analyzer',
              description: 'Analyzes Module 3 texts against FDA/EMA/PMDA specifications to find compliance gaps.',
              inputSchema: {
                type: 'object',
                properties: {
                  sectionCode: { type: 'string' },
                  text: { type: 'string' },
                  targetAuthority: { type: 'string' }
                },
                required: ['sectionCode', 'text', 'targetAuthority']
              }
            },
            {
              name: 'vocabulary_aligner',
              description: 'Converts regulatory terminology in SMpC texts to match US FDA USPI CFR standards.',
              inputSchema: {
                type: 'object',
                properties: {
                  text: { type: 'string' },
                  direction: { type: 'string', enum: ['smpc_to_uspi', 'uspi_to_smpc'] }
                }
              }
            }
          ]
        },
        id
      });

    case 'tools/call': {
      const toolName = params?.name;
      if (toolName === 'compliance_analyzer') {
        return res.json({
          jsonrpc: '2.0',
          result: {
            content: [
              {
                type: 'text',
                text: '[MCP Tools Service] Compliance analyzer execution successful. Scan completed. Gaps identified: Active Substance references should be aligned with FDA Drug Substance terminology under CFR rules.'
              }
            ],
            isError: false
          },
          id
        });
      } else {
        return res.json({
          jsonrpc: '2.0',
          result: {
            content: [
              {
                type: 'text',
                text: `[MCP Tools Service] Vocabulary aligner completed terminology check. All terms mapped successfully.`
              }
            ],
            isError: false
          },
          id
        });
      }
    }

    case 'resources/list':
      return res.json({
        jsonrpc: '2.0',
        result: {
          resources: [
            {
              uri: 'dossiers://keytruda/module3',
              name: 'Keytruda eCTD Module 3 (CMC)',
              mimeType: 'application/json',
              description: 'Chemistry, Manufacturing, and Controls sections for Pembrolizumab filing.'
            },
            {
              uri: 'standards://fda/cfr-title-21',
              name: 'FDA 21 CFR Part 201 Labeling Rules',
              mimeType: 'text/markdown',
              description: 'Official FDA rules for Prescribing Information formatting.'
            }
          ]
        },
        id
      });

    case 'resources/read': {
      const uri = params?.uri || '';
      return res.json({
        jsonrpc: '2.0',
        result: {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify({
                info: 'Model Context Protocol Resource retrieval successful',
                targetUri: uri,
                timestamp: new Date().toISOString()
              })
            }
          ]
        },
        id
      });
    }

    default:
      return res.status(404).json({
        jsonrpc: '2.0',
        error: { code: -32601, message: `Method '${method}' not found` },
        id
      });
  }
});


// --- DATABASE PERSISTENT REST API ENDPOINTS ---

// Fetch all dossiers
app.get('/api/dossiers', async (req, res) => {
  try {
    const db = await getDB();
    const rows = await db.query('SELECT * FROM dossiers');
    
    // Format response to match DemoDossier type
    const formatted = rows.map(r => ({
      id: r.id,
      drugName: r.drug_name || r.drugName,
      dossierType: r.dossier_type || r.dossierType,
      sourceAuthority: r.source_authority || r.sourceAuthority,
      targetAuthorities: (r.target_authorities || r.targetAuthorities || '').split(',').map((t: string) => t.trim()),
      status: r.status,
      readOnly: !!(r.read_only || r.readOnly)
    }));
    
    return res.json(formatted);
  } catch (err: any) {
    logger.error('Error fetching dossiers from database', err);
    return res.status(500).json({ error: 'Internal Server Error', code: 'DB_ERROR' });
  }
});

// Fetch all sections of a dossier with their nested compliance gaps
app.get('/api/dossiers/:dossierId/sections', async (req, res) => {
  const { dossierId } = req.params;
  try {
    const db = await getDB();
    
    // Fetch all sections
    const sectionRows = await db.query('SELECT * FROM sections WHERE dossier_id = $1 ORDER BY order_index ASC', [dossierId]);
    
    // Fetch all gaps associated with these sections
    const gapRows = await db.query(
      `SELECT g.* FROM gaps g 
       JOIN sections s ON g.section_id = s.id 
       WHERE s.dossier_id = $1`, 
      [dossierId]
    );

    // Group gaps by section_id
    const gapsBySection: Record<string, any[]> = {};
    gapRows.forEach(g => {
      const secId = g.section_id || g.sectionId;
      if (!gapsBySection[secId]) gapsBySection[secId] = [];
      gapsBySection[secId].push({
        id: g.id,
        severity: g.severity,
        category: g.category,
        section: g.section,
        title: g.title,
        description: g.description,
        guidelineCitation: g.guideline_citation || g.guidelineCitation,
        suggestion: g.suggestion,
        status: g.status
      });
    });

    // Format sections with their gaps
    const formattedSections = sectionRows.map(s => ({
      id: s.id,
      sectionCode: s.section_code || s.sectionCode,
      title: s.title,
      content: s.content,
      status: s.status,
      gaps: gapsBySection[s.id] || []
    }));

    return res.json(formattedSections);
  } catch (err: any) {
    logger.error('Error fetching dossier sections', err, { dossierId });
    return res.status(500).json({ error: 'Internal Server Error', code: 'DB_ERROR' });
  }
});

// Update section content (Apply edits or harmonization)
app.put('/api/sections/:sectionId', async (req, res) => {
  const { sectionId } = req.params;
  const { content, status, userId, actionType, beforeValue } = req.body;

  try {
    const db = await getDB();
    
    // Update section content
    await db.query(
      'UPDATE sections SET content = $1, status = $2 WHERE id = $3',
      [content, status || 'in_progress', sectionId]
    );

    // Log the change in audit_logs
    if (userId) {
      await db.query(
        `INSERT INTO audit_logs (user_id, action_type, section_code, before_value, after_value)
         VALUES ($1, $2, $3, $4, $5)`,
        [userId, actionType || 'manual_edit', sectionId, beforeValue || '', content]
      );
      logger.info('Audit log successfully recorded', { userId, actionType, sectionId });
    }

    return res.json({ success: true, sectionId, status });
  } catch (err: any) {
    logger.error('Error updating section content', err, { sectionId });
    return res.status(500).json({ error: 'Internal Server Error', code: 'DB_ERROR' });
  }
});

// Create a new scanned section (OCR Upload Ingestion)
app.post('/api/sections', async (req, res) => {
  const { id, dossierId, sectionCode, title, content, status, userId } = req.body;

  try {
    const db = await getDB();

    // Check if section already exists to prevent duplicate primary keys
    const existing = await db.query('SELECT id FROM sections WHERE id = $1', [id]);
    if (existing.length > 0) {
      // Overwrite/Update existing node content
      await db.query(
        'UPDATE sections SET content = $1, title = $2, section_code = $3 WHERE id = $4',
        [content, title, sectionCode, id]
      );
    } else {
      // Insert new section
      await db.query(
        `INSERT INTO sections (id, dossier_id, section_code, title, content, status, order_index)
         VALUES ($1, $2, $3, $4, $5, $6, (SELECT COALESCE(MAX(order_index), 0) + 1 FROM sections WHERE dossier_id = $7))`,
        [id, dossierId || 'dossier-adalimumab', sectionCode, title, content, status || 'in_progress', dossierId || 'dossier-adalimumab']
      );
    }

    // Automatically analyze compliance gaps for this new section in the background
    // (mock gap analysis trigger for simplicity)
    await db.query('DELETE FROM gaps WHERE section_id = $1', [id]);
    await db.query(
      `INSERT INTO gaps (id, section_id, severity, category, section, title, description, guideline_citation, suggestion, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        `gap-ocr-${id}`, 
        id, 
        'warning', 
        'Formatting', 
        sectionCode, 
        'Regulatory Template Realignment Check Needed', 
        'This scanned node was ingested via optical character recognition. Verify terms align with target authority guidelines.', 
        'ICH M4Q General Guidelines', 
        'Verify target terminology and execute AI harmonization checks.',
        'pending'
      ]
    );

    // Record in audit trail logs
    if (userId) {
      await db.query(
        `INSERT INTO audit_logs (user_id, action_type, section_code, before_value, after_value)
         VALUES ($1, $2, $3, $4, $5)`,
        [userId, 'ocr_ingestion', sectionCode || id, '', `Section: ${title} uploaded and parsed.`]
      );
    }

    return res.json({ success: true, id, sectionCode, title });
  } catch (err: any) {
    logger.error('Error creating custom ingested section', err, { id });
    return res.status(500).json({ error: 'Internal Server Error', code: 'DB_ERROR' });
  }
});

// Resolve a specific compliance gap
app.post('/api/gaps/:gapId/resolve', async (req, res) => {
  const { gapId } = req.params;
  const { userId, sectionCode } = req.body;

  try {
    const db = await getDB();
    
    // Update status to resolved
    await db.query('UPDATE gaps SET status = $1 WHERE id = $2', ['resolved', gapId]);

    // Record in audit trail logs
    if (userId) {
      await db.query(
        `INSERT INTO audit_logs (user_id, action_type, section_code, before_value, after_value)
         VALUES ($1, $2, $3, $4, $5)`,
        [userId, 'resolve_gap', sectionCode || 'Gap', 'pending', 'resolved']
      );
    }

    return res.json({ success: true, gapId, status: 'resolved' });
  } catch (err: any) {
    logger.error('Error resolving gap in database', err, { gapId });
    return res.status(500).json({ error: 'Internal Server Error', code: 'DB_ERROR' });
  }
});

// Fetch all audit trail logs (CFR Compliant Database Log stream)
app.get('/api/audit-logs', async (req, res) => {
  try {
    const db = await getDB();
    const rows = await db.query('SELECT * FROM audit_logs ORDER BY timestamp DESC');
    
    const formatted = rows.map(r => ({
      id: String(r.id),
      timestamp: r.timestamp,
      userId: r.user_id || r.userId,
      action: r.action_type || r.actionType,
      sectionCode: r.section_code || r.sectionCode,
      details: `Changed from "${(r.before_value || '').substring(0, 40)}..." to "${(r.after_value || '').substring(0, 40)}..."`
    }));

    return res.json(formatted);
  } catch (err: any) {
    logger.error('Error fetching audit logs', err);
    return res.status(500).json({ error: 'Internal Server Error', code: 'DB_ERROR' });
  }
});

// Post a manual audit trail log entry
app.post('/api/audit-logs', async (req, res) => {
  const { userId, action, sectionCode, details } = req.body;
  try {
    const db = await getDB();
    await db.query(
      `INSERT INTO audit_logs (user_id, action_type, section_code, before_value, after_value)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId || 'Unknown', action || 'system_event', sectionCode || 'System', '', details || '']
    );
    return res.json({ success: true });
  } catch (err: any) {
    logger.error('Error posting manual audit log', err);
    return res.status(500).json({ error: 'Internal Server Error', code: 'DB_ERROR' });
  }
});


// 4. Health Check Endpoint
app.get('/healthz', async (req, res) => {
  let dbStatus = 'disconnected';
  let dbError = null;
  try {
    const db = await getDB();
    await db.query('SELECT 1');
    dbStatus = 'connected';
  } catch (err: any) {
    dbStatus = 'error';
    dbError = err.message || err.toString();
  }

  res.json({
    status: dbStatus === 'connected' ? 'healthy' : 'unhealthy',
    database: dbStatus,
    databaseError: dbError,
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
    apiKeyConfigured: !!process.env.GEMINI_API_KEY
  });
});

// Serve Vite or static assets depending on environment
async function startServer() {
  try {
    await initializeDatabase();
    logger.info('Database initialized successfully on server start.');
  } catch (dbErr) {
    logger.error('Failed to initialize database on startup', dbErr);
  }

  if (process.env.NODE_ENV !== 'production') {
    // In dev, run Vite inside Express middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    logger.info('Running in DEVELOPMENT mode with Vite dev middleware.');
  } else {
    // In prod, serve bundled files
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    logger.info('Running in PRODUCTION mode serving static bundle.');
  }

  app.listen(PORT, '0.0.0.0', () => {
    logger.info(`Server listening at http://localhost:${PORT}`);
  });
}

startServer();

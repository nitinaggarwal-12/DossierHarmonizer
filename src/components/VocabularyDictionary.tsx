import React, { useState } from 'react';
import { BookOpen, Search, ArrowRight, Sparkles, PlusCircle, CheckCircle, HelpCircle, RefreshCw, X } from 'lucide-react';

interface DictTerm {
  sourceTerm: string;
  targetTerm: string;
  category: 'Spelling' | 'Nomenclature' | 'Pharmacopoeia' | 'Labeling';
  description: string;
}

const DEFAULT_TERMS: DictTerm[] = [
  { sourceTerm: 'Active Substance', targetTerm: 'Drug Substance', category: 'Nomenclature', description: 'Mandated USP/FDA term describing bulk therapeutic ingredient.' },
  { sourceTerm: 'Medicinal Product', targetTerm: 'Drug Product', category: 'Nomenclature', description: 'FDA specification for the finalized dosage form.' },
  { sourceTerm: 'Summary of Product Characteristics (SmPC)', targetTerm: 'US Prescribing Information (USPI)', category: 'Labeling', description: 'FDA equivalent labeling summary required in Module 1.3.1.' },
  { sourceTerm: 'Adverse Events', targetTerm: 'Adverse Reactions', category: 'Labeling', description: 'US PI Section 6 table title standard.' },
  { sourceTerm: 'Ph. Eur. 2.4.8 Heavy Metals', targetTerm: 'USP <231> / <232> Elemental Impurities', category: 'Pharmacopoeia', description: 'Metal residue standard comparison chapter.' },
  { sourceTerm: 'JP 2.44 Residue on Ignition', targetTerm: 'USP <281> Residue on Ignition', category: 'Pharmacopoeia', description: 'Japanese pharmacopoeia general chapter counterpart.' },
  { sourceTerm: 'colour', targetTerm: 'color', category: 'Spelling', description: 'Standard US spelling conversion.' },
  { sourceTerm: 'haematological', targetTerm: 'hematological', category: 'Spelling', description: 'Standard US spelling conversion.' },
  { sourceTerm: 'diarrhoea', targetTerm: 'diarrhea', category: 'Spelling', description: 'Standard US spelling conversion.' },
  { sourceTerm: 'BSE/TSE Certificate of Lactose', targetTerm: 'PMDA Certificate of Origin of Excipients', category: 'Pharmacopoeia', description: 'Japanese PMDA strict bovine animal source check.' }
];

interface VocabularyDictionaryProps {
  triggerNotification: (message: string, type: 'success' | 'info' | 'error') => void;
}

export default function VocabularyDictionary({ triggerNotification }: VocabularyDictionaryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [terms, setTerms] = useState<DictTerm[]>(DEFAULT_TERMS);
  
  // Custom term state
  const [newSource, setNewSource] = useState('');
  const [newTarget, setNewTarget] = useState('');
  const [newCategory, setNewCategory] = useState<'Spelling' | 'Nomenclature' | 'Pharmacopoeia' | 'Labeling'>('Nomenclature');
  const [newDesc, setNewDesc] = useState('');
  
  // Sandbox tester state
  const [sandboxInput, setSandboxInput] = useState('During our drug substance program, we checked haematological limits and colour stability to satisfy our medicinal product specifications.');
  const [sandboxOutput, setSandboxOutput] = useState('');

  const handleAddTerm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSource.trim() || !newTarget.trim()) return;

    const termExists = terms.some(t => t.sourceTerm.toLowerCase() === newSource.toLowerCase().trim());
    if (termExists) {
      triggerNotification("Rule already exists in global dictionary", "error");
      return;
    }

    const newTerm: DictTerm = {
      sourceTerm: newSource.trim(),
      targetTerm: newTarget.trim(),
      category: newCategory,
      description: newDesc.trim() || 'Custom user alignment rule override.'
    };

    setTerms([newTerm, ...terms]);
    setNewSource('');
    setNewTarget('');
    setNewDesc('');
    triggerNotification(`Custom synonym override added: "${newSource}" → "${newTarget}"`, 'success');
  };

  const handleDeleteTerm = (source: string) => {
    setTerms(terms.filter(t => t.sourceTerm !== source));
    triggerNotification("Translation rule deleted", "info");
  };

  const handleSandboxTranslate = () => {
    let output = sandboxInput;
    terms.forEach(term => {
      // Create case-insensitive regex safely
      try {
        const regex = new RegExp(`\\b${term.sourceTerm}\\b`, 'gi');
        output = output.replace(regex, term.targetTerm);
      } catch (err) {
        console.error(err);
      }
    });
    setSandboxOutput(output);
    triggerNotification("Sandbox text translated successfully!", "success");
  };

  // Filtered terms
  const filteredTerms = terms.filter(t => 
    t.sourceTerm.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.targetTerm.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6" id="vocabulary-dictionary">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <BookOpen className="w-40 h-40 text-emerald-500" />
        </div>
        <div className="relative z-10">
          <span className="text-[10px] font-mono tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full font-bold uppercase">
            Regulatory Nomenclature Matrix
          </span>
          <h2 className="text-xl font-extrabold text-white mt-2">Nomenclature & Pharmacopoeia Dictionary</h2>
          <p className="text-slate-400 text-xs mt-1 max-w-xl">
            Maintain and expand the vocabulary translation mapping table used to align localized British or European specifications to US FDA and Japanese PMDA formats.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left dictionary glossary (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-5">
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Regional Synonyms Registry</h3>
                <p className="text-[10px] text-slate-500">Live search of pre-indexed ICH vocabulary replacements</p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full md:w-64">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search dictionary terms..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-xs outline-none text-white focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            {/* Terms list table */}
            <div className="overflow-x-auto border border-slate-800/80 rounded-xl max-h-[250px] overflow-y-auto scrollbar-thin">
              <table className="min-w-full divide-y divide-slate-800 text-xs">
                <thead className="bg-slate-900/80 text-slate-400 font-bold uppercase font-sans">
                  <tr>
                    <th className="px-4 py-3 text-left w-36">Source Phrasing (EMA/UK)</th>
                    <th className="px-4 py-3 text-center w-12">Action</th>
                    <th className="px-4 py-3 text-left w-36">Target Phrasing (FDA/PMDA)</th>
                    <th className="px-4 py-3 text-left">Category & Justification</th>
                    <th className="px-3 py-3 text-right">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 bg-slate-950/40 font-medium text-slate-300">
                  {filteredTerms.map((term, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/20 transition-colors">
                      <td className="px-4 py-3 font-mono text-rose-400 bg-rose-500/5">
                        {term.sourceTerm}
                      </td>
                      <td className="px-2 py-3 text-center">
                        <ArrowRight className="w-3.5 h-3.5 text-slate-600 mx-auto" />
                      </td>
                      <td className="px-4 py-3 font-mono text-emerald-400 bg-emerald-500/5">
                        {term.targetTerm}
                      </td>
                      <td className="px-4 py-3 text-[11px] text-slate-400 leading-relaxed">
                        <span className="inline-block px-1.5 py-0.25 rounded text-[8px] uppercase tracking-wider font-extrabold bg-slate-800 text-slate-300 mb-1">
                          {term.category}
                        </span>
                        <div className="text-[10px]">{term.description}</div>
                      </td>
                      <td className="px-3 py-3 text-right">
                        <button
                          onClick={() => handleDeleteTerm(term.sourceTerm)}
                          className="p-1 hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 rounded transition-colors cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>

          {/* Sandbox interactive testing area */}
          <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-5 space-y-4">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Sandbox Replacement Tester</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Test how the dictionary replacement engine aligns arbitrary paragraphs of text</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-500">Source Raw Text Input</label>
                <textarea
                  value={sandboxInput}
                  onChange={(e) => setSandboxInput(e.target.value)}
                  rows={4}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs outline-none focus:border-emerald-500 font-mono text-slate-300"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-500">AI Standardized Text Output</label>
                <div className="w-full bg-slate-950/80 border border-slate-900 rounded-xl p-3 text-xs font-mono text-emerald-400 min-h-[96px] h-[96px] md:h-full overflow-y-auto">
                  {sandboxOutput || <span className="text-slate-600 italic">Click "Run Sandbox Alignment" to see output...</span>}
                </div>
              </div>
            </div>

            <button
              onClick={handleSandboxTranslate}
              className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-emerald-400 rounded-xl py-2.5 text-xs font-bold transition-all cursor-pointer inline-flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
              Run Sandbox Alignment
            </button>
          </div>

        </div>

        {/* Right create custom rule side pane (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900/30 border border-slate-900 rounded-2xl p-5 flex flex-col justify-start h-full">
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-1">Create Custom Rule Override</h3>
            <p className="text-[10px] text-slate-500">Define custom vocabulary translation rules</p>
          </div>

          <form onSubmit={handleAddTerm} className="space-y-4 mt-5">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Source Word/Phrase (EMA/UK)</label>
              <input
                type="text"
                placeholder="e.g. Active Substance"
                value={newSource}
                onChange={(e) => setNewSource(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs outline-none text-white focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Target Word/Phrase (FDA/PMDA)</label>
              <input
                type="text"
                placeholder="e.g. Drug Substance"
                value={newTarget}
                onChange={(e) => setNewTarget(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs outline-none text-white focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Category</label>
              <select
                value={newCategory}
                onChange={(e: any) => setNewCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs outline-none text-white focus:border-emerald-500"
              >
                <option value="Nomenclature">Nomenclature</option>
                <option value="Spelling">Spelling</option>
                <option value="Pharmacopoeia">Pharmacopoeia</option>
                <option value="Labeling">Labeling</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Regulatory Justification Description</label>
              <textarea
                placeholder="Guideline citation or explanation..."
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs outline-none text-white focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-2.5 text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              Add Rule to Dictionary
            </button>
          </form>

          <div className="mt-6 p-4 rounded-xl border border-indigo-950 bg-indigo-950/20 text-[10px] text-slate-400 leading-relaxed font-sans flex gap-2">
            <HelpCircle className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-200 block">How rules are matched:</span> Terms are matched as full word boundaries case-insensitively during automated AI harmonization.
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

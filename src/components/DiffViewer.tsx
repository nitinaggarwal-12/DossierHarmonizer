import React, { useState, useMemo } from 'react';
import { Columns, List, Sparkles, FileText, Check, AlertCircle } from 'lucide-react';

interface DiffViewerProps {
  originalText: string;
  modifiedText: string;
  sourceAuthority: string;
  targetAuthority: string;
}

interface DiffToken {
  type: 'added' | 'removed' | 'equal';
  value: string;
}

interface LineDiff {
  type: 'added' | 'removed' | 'equal' | 'modified';
  originalLine?: string;
  modifiedLine?: string;
  wordTokens?: DiffToken[];
}

// Low-level word-by-word diff algorithm using DP (LCS)
export function computeWordDiff(original: string, modified: string): DiffToken[] {
  const tokenize = (text: string) => {
    // split by alphanumeric words or any single non-alphanumeric character (spaces, punctuation, etc.)
    return text.match(/[\w']+|[^\w]/g) || [];
  };

  const tokens1 = tokenize(original || '');
  const tokens2 = tokenize(modified || '');

  const n = tokens1.length;
  const m = tokens2.length;

  // Safeguard against extreme token sizes to prevent memory overflow
  if (n * m > 250000) {
    // Fallback to simple comparison if word diff is too expensive
    return [
      { type: 'removed', value: original },
      { type: 'added', value: modified }
    ];
  }

  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (tokens1[i - 1] === tokens2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  const result: DiffToken[] = [];
  let i = n;
  let j = m;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && tokens1[i - 1] === tokens2[j - 1]) {
      result.unshift({ type: 'equal', value: tokens1[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      result.unshift({ type: 'added', value: tokens2[j - 1] });
      j--;
    } else if (i > 0 && (j === 0 || dp[i - 1][j] > dp[i][j - 1])) {
      result.unshift({ type: 'removed', value: tokens1[i - 1] });
      i--;
    }
  }

  // Merge contiguous tokens of the same diff type
  const merged: DiffToken[] = [];
  for (const token of result) {
    const last = merged[merged.length - 1];
    if (last && last.type === token.type) {
      last.value += token.value;
    } else {
      merged.push({ ...token });
    }
  }

  return merged;
}

export default function DiffViewer({
  originalText,
  modifiedText,
  sourceAuthority,
  targetAuthority,
}: DiffViewerProps) {
  const [viewMode, setViewMode] = useState<'split' | 'unified'>('split');

  // Compute lines-level diff with sub-line word highlights
  const diffLines = useMemo(() => {
    const lines1 = (originalText || '').split('\n');
    const lines2 = (modifiedText || '').split('\n');

    const n = lines1.length;
    const m = lines2.length;

    // LCS for line-by-line diff
    const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));

    for (let i = 1; i <= n; i++) {
      for (let j = 1; j <= m; j++) {
        if (lines1[i - 1] === lines2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
    }

    const lineTokens: { type: 'added' | 'removed' | 'equal'; value: string }[] = [];
    let i = n;
    let j = m;

    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && lines1[i - 1] === lines2[j - 1]) {
        lineTokens.unshift({ type: 'equal', value: lines1[i - 1] });
        i--;
        j--;
      } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
        lineTokens.unshift({ type: 'added', value: lines2[j - 1] });
        j--;
      } else if (i > 0 && (j === 0 || dp[i - 1][j] > dp[i][j - 1])) {
        lineTokens.unshift({ type: 'removed', value: lines1[i - 1] });
        i--;
      }
    }

    // Process line modifications for granular word-highlighting
    const processed: LineDiff[] = [];
    for (let k = 0; k < lineTokens.length; k++) {
      const current = lineTokens[k];
      const next = lineTokens[k + 1];

      if (current.type === 'removed' && next && next.type === 'added') {
        processed.push({
          type: 'modified',
          originalLine: current.value,
          modifiedLine: next.value,
          wordTokens: computeWordDiff(current.value, next.value),
        });
        k++; // skip paired added line
      } else {
        processed.push({
          type: current.type,
          originalLine: current.type === 'removed' || current.type === 'equal' ? current.value : undefined,
          modifiedLine: current.type === 'added' || current.type === 'equal' ? current.value : undefined,
        });
      }
    }

    return processed;
  }, [originalText, modifiedText]);

  return (
    <div className="flex flex-col h-full bg-slate-950 border border-slate-900 rounded-2xl overflow-hidden shadow-2xl" id="diff-viewer-root">
      {/* Diff Controls Header */}
      <div className="px-5 py-3.5 bg-slate-900/60 border-b border-slate-900 flex flex-wrap justify-between items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-black text-white uppercase tracking-wider">Dynamic Alignment Visualizer</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">Comparing {sourceAuthority} (Source) versus {targetAuthority} (Aligned)</p>
          </div>
        </div>

        {/* View Mode Selectors */}
        <div className="flex bg-slate-950/80 border border-slate-800 p-1 rounded-xl text-[11px] font-bold">
          <button
            onClick={() => setViewMode('split')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              viewMode === 'split' ? 'bg-slate-800 text-white shadow-sm border border-slate-700/60' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Split View</span>
          </button>
          <button
            onClick={() => setViewMode('unified')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              viewMode === 'unified' ? 'bg-slate-800 text-white shadow-sm border border-slate-700/60' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Unified Inline</span>
          </button>
        </div>
      </div>

      {/* Legend strip */}
      <div className="px-5 py-2 bg-slate-900/20 border-b border-slate-900/40 flex gap-4 text-[9px] font-mono uppercase tracking-wider text-slate-500">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded bg-rose-500/10 border border-rose-500/30 inline-block"></span>
          <span>Removed ({sourceAuthority})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded bg-emerald-500/10 border border-emerald-500/30 inline-block"></span>
          <span>Added ({targetAuthority})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded bg-amber-500/10 border border-amber-500/30 inline-block"></span>
          <span>Nomenclature Match</span>
        </div>
      </div>

      {/* Diff Main Workspace */}
      <div className="flex-1 overflow-y-auto max-h-[500px] scrollbar-thin font-mono text-[11px] p-4 bg-slate-950">
        {viewMode === 'split' ? (
          /* Split View Pane */
          <div className="grid grid-cols-2 gap-4 h-full divide-x divide-slate-900">
            {/* Left Column - Original */}
            <div className="space-y-0.5 pr-2">
              <div className="sticky top-0 bg-slate-950 pb-2 mb-2 border-b border-slate-900 flex justify-between items-center z-10">
                <span className="text-[9px] font-black uppercase text-rose-400 tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                  {sourceAuthority} Original Section Content
                </span>
                <span className="text-[8px] text-slate-500 font-bold">{diffLines.filter(l => l.type === 'removed' || l.type === 'modified').length} alterations</span>
              </div>
              <div className="space-y-1">
                {diffLines.map((line, idx) => {
                  if (line.type === 'added') {
                    // Render an empty placeholder line on original side to align heights
                    return (
                      <div key={idx} className="h-5 bg-slate-900/10 opacity-20 border-l-2 border-transparent select-none">
                        &nbsp;
                      </div>
                    );
                  }

                  if (line.type === 'removed') {
                    return (
                      <div key={idx} className="flex items-start bg-rose-500/10 text-rose-300 px-2 py-0.5 rounded border-l-2 border-rose-500 hover:bg-rose-500/15 transition-all">
                        <span className="w-6 text-rose-500 shrink-0 text-right pr-2 select-none">-</span>
                        <span className="whitespace-pre-wrap leading-relaxed">{line.originalLine || ' '}</span>
                      </div>
                    );
                  }

                  if (line.type === 'modified') {
                    return (
                      <div key={idx} className="flex items-start bg-amber-500/5 text-slate-300 px-2 py-0.5 rounded border-l-2 border-amber-500/50">
                        <span className="w-6 text-amber-500/60 shrink-0 text-right pr-2 select-none">*</span>
                        <div className="whitespace-pre-wrap leading-relaxed">
                          {line.wordTokens?.map((tok, tIdx) => {
                            if (tok.type === 'removed') {
                              return (
                                <del key={tIdx} className="bg-rose-500/30 text-rose-200 border border-rose-500/20 px-0.5 rounded line-through no-underline">
                                  {tok.value}
                                </del>
                              );
                            }
                            if (tok.type === 'equal') {
                              return <span key={tIdx}>{tok.value}</span>;
                            }
                            return null;
                          })}
                        </div>
                      </div>
                    );
                  }

                  // Equal line
                  return (
                    <div key={idx} className="flex items-start text-slate-400 px-2 py-0.5 border-l-2 border-transparent">
                      <span className="w-6 text-slate-600 shrink-0 text-right pr-2 select-none">&nbsp;</span>
                      <span className="whitespace-pre-wrap leading-relaxed">{line.originalLine || ' '}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column - Aligned */}
            <div className="space-y-0.5 pl-4">
              <div className="sticky top-0 bg-slate-950 pb-2 mb-2 border-b border-slate-900 flex justify-between items-center z-10">
                <span className="text-[9px] font-black uppercase text-emerald-400 tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  {targetAuthority} Aligned Submission Content
                </span>
                <span className="text-[8px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded font-bold uppercase">eCTD Compliant</span>
              </div>
              <div className="space-y-1">
                {diffLines.map((line, idx) => {
                  if (line.type === 'removed') {
                    // Render empty placeholder line on target side to align heights
                    return (
                      <div key={idx} className="h-5 bg-slate-900/10 opacity-20 border-l-2 border-transparent select-none">
                        &nbsp;
                      </div>
                    );
                  }

                  if (line.type === 'added') {
                    return (
                      <div key={idx} className="flex items-start bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded border-l-2 border-emerald-500 hover:bg-emerald-500/15 transition-all">
                        <span className="w-6 text-emerald-500 shrink-0 text-right pr-2 select-none">+</span>
                        <span className="whitespace-pre-wrap leading-relaxed">{line.modifiedLine || ' '}</span>
                      </div>
                    );
                  }

                  if (line.type === 'modified') {
                    return (
                      <div key={idx} className="flex items-start bg-amber-500/5 text-slate-200 px-2 py-0.5 rounded border-l-2 border-amber-500/50">
                        <span className="w-6 text-amber-500/60 shrink-0 text-right pr-2 select-none">*</span>
                        <div className="whitespace-pre-wrap leading-relaxed">
                          {line.wordTokens?.map((tok, tIdx) => {
                            if (tok.type === 'added') {
                              return (
                                <ins key={tIdx} className="bg-emerald-500/30 text-emerald-200 border border-emerald-500/20 px-0.5 rounded font-bold no-underline">
                                  {tok.value}
                                </ins>
                              );
                            }
                            if (tok.type === 'equal') {
                              return <span key={tIdx}>{tok.value}</span>;
                            }
                            return null;
                          })}
                        </div>
                      </div>
                    );
                  }

                  // Equal line
                  return (
                    <div key={idx} className="flex items-start text-slate-400 px-2 py-0.5 border-l-2 border-transparent">
                      <span className="w-6 text-slate-600 shrink-0 text-right pr-2 select-none">&nbsp;</span>
                      <span className="whitespace-pre-wrap leading-relaxed">{line.modifiedLine || ' '}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* Unified Inline View */
          <div className="space-y-1">
            {diffLines.map((line, idx) => {
              if (line.type === 'removed') {
                return (
                  <div key={idx} className="flex items-start bg-rose-500/10 text-rose-300 px-3 py-1 rounded border-l-2 border-rose-500">
                    <span className="w-8 font-bold text-rose-500 shrink-0 text-right pr-3 select-none">-</span>
                    <span className="whitespace-pre-wrap leading-relaxed">{line.originalLine}</span>
                  </div>
                );
              }

              if (line.type === 'added') {
                return (
                  <div key={idx} className="flex items-start bg-emerald-500/10 text-emerald-300 px-3 py-1 rounded border-l-2 border-emerald-500">
                    <span className="w-8 font-bold text-emerald-500 shrink-0 text-right pr-3 select-none">+</span>
                    <span className="whitespace-pre-wrap leading-relaxed">{line.modifiedLine}</span>
                  </div>
                );
              }

              if (line.type === 'modified') {
                return (
                  <div key={idx} className="flex flex-col gap-1 rounded border border-slate-900 bg-slate-900/30 overflow-hidden">
                    {/* Source Line with removals highlighted */}
                    <div className="flex items-start bg-rose-500/5 text-rose-300/85 px-3 py-1 border-l-2 border-rose-500/40">
                      <span className="w-8 text-rose-500/60 shrink-0 text-right pr-3 select-none">-</span>
                      <div className="whitespace-pre-wrap leading-relaxed">
                        {line.wordTokens?.map((tok, tIdx) => {
                          if (tok.type === 'removed') {
                            return (
                              <del key={tIdx} className="bg-rose-500/30 text-rose-100 border border-rose-500/10 px-0.5 rounded line-through no-underline">
                                {tok.value}
                              </del>
                            );
                          }
                          if (tok.type === 'equal') {
                            return <span key={tIdx}>{tok.value}</span>;
                          }
                          return null;
                        })}
                      </div>
                    </div>
                    {/* Target Line with additions highlighted */}
                    <div className="flex items-start bg-emerald-500/5 text-emerald-300/85 px-3 py-1 border-l-2 border-emerald-500/40">
                      <span className="w-8 text-emerald-500/60 shrink-0 text-right pr-3 select-none">+</span>
                      <div className="whitespace-pre-wrap leading-relaxed">
                        {line.wordTokens?.map((tok, tIdx) => {
                          if (tok.type === 'added') {
                            return (
                              <ins key={tIdx} className="bg-emerald-500/30 text-emerald-100 border border-emerald-500/10 px-0.5 rounded font-bold no-underline">
                                {tok.value}
                              </ins>
                            );
                          }
                          if (tok.type === 'equal') {
                            return <span key={tIdx}>{tok.value}</span>;
                          }
                          return null;
                        })}
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div key={idx} className="flex items-start text-slate-400 px-3 py-1 border-l-2 border-transparent">
                  <span className="w-8 text-slate-700 shrink-0 text-right pr-3 select-none">&nbsp;</span>
                  <span className="whitespace-pre-wrap leading-relaxed">{line.modifiedLine}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

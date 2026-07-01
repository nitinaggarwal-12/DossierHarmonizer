import React from 'react';
import { ComplianceGap } from '../types';
import { ShieldAlert, CheckCircle, ArrowRight, Activity, Cpu, Check, AlertCircle } from 'lucide-react';

interface ComplianceChecklistProps {
  gaps: ComplianceGap[];
  onResolveGap: (gapId: string) => void;
  isHarmonizing: boolean;
}

export default function ComplianceChecklist({
  gaps,
  onResolveGap,
  isHarmonizing,
}: ComplianceChecklistProps) {
  const getSeverityStyles = (severity: ComplianceGap['severity']) => {
    switch (severity) {
      case 'critical':
        return {
          bg: 'bg-rose-50 border-rose-100',
          badge: 'bg-rose-100 text-rose-800 border-rose-200',
          text: 'text-rose-950',
          icon: <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
        };
      case 'warning':
        return {
          bg: 'bg-amber-50 border-amber-100',
          badge: 'bg-amber-100 text-amber-800 border-amber-200',
          text: 'text-amber-950',
          icon: <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
        };
      default:
        return {
          bg: 'bg-blue-50 border-blue-100',
          badge: 'bg-blue-100 text-blue-800 border-blue-200',
          text: 'text-blue-950',
          icon: <ShieldAlert className="w-5 h-5 text-blue-600 shrink-0" />
        };
    }
  };

  const pendingGaps = gaps.filter(g => g.status === 'pending');
  const resolvedGaps = gaps.filter(g => g.status === 'resolved');

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden flex flex-col h-full" id="compliance-checklist">
      <div className="p-5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Activity className="w-4.5 h-4.5 text-emerald-600" />
            Compliance Auditor Gap Analysis
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">Auto-resolve items individually or execute whole-section harmonization</p>
        </div>
        <div className="flex gap-2">
          <span className="text-[11px] bg-amber-50 text-amber-700 border border-amber-200 font-bold px-2 py-0.5 rounded-full">
            {pendingGaps.length} Actionable
          </span>
          {resolvedGaps.length > 0 && (
            <span className="text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-2 py-0.5 rounded-full">
              {resolvedGaps.length} Remedied
            </span>
          )}
        </div>
      </div>

      <div className="p-5 overflow-y-auto flex-1 space-y-4 scrollbar-thin min-h-0">
        {gaps.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-12 px-4 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            <div className="p-3 rounded-full bg-emerald-100 text-emerald-600 mb-3">
              <Check className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-800">Dossier Section Aligned</p>
            <p className="text-xs text-slate-500 max-w-[200px] mt-1">Zero compatibility errors or terminology inconsistencies discovered.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Actionable Gaps */}
            {pendingGaps.map((gap) => {
              const styles = getSeverityStyles(gap.severity);
              return (
                <div
                  key={gap.id}
                  className={`p-4 rounded-xl border transition-all duration-200 ${styles.bg}`}
                  id={`gap-item-${gap.id}`}
                >
                  <div className="flex items-start gap-3">
                    {styles.icon}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap gap-1.5 items-center mb-1">
                        <span className={`text-[9px] uppercase tracking-wider px-1.5 py-0.25 rounded font-bold border ${styles.badge}`}>
                          {gap.severity}
                        </span>
                        <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.25 rounded font-bold border border-slate-200 bg-white text-slate-600">
                          {gap.category}
                        </span>
                        {gap.section && (
                          <span className="text-[10px] font-mono text-slate-500">
                            Section {gap.section}
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 leading-tight">
                        {gap.title}
                      </h4>
                      <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                        {gap.description}
                      </p>

                      <div className="mt-2.5 pt-2.5 border-t border-slate-200/50">
                        <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Target Suggestion</p>
                        <p className="text-xs text-slate-700 mt-0.5 font-medium flex items-center gap-1">
                          <ArrowRight className="w-3 h-3 text-emerald-600 shrink-0" /> {gap.suggestion}
                        </p>
                      </div>

                      {gap.guidelineCitation && (
                        <div className="mt-2 bg-white/60 p-1.5 rounded text-[10px] text-slate-500 font-mono border border-slate-200/30 flex items-start gap-1">
                          <span className="font-bold text-slate-700">Ref:</span>
                          <span className="truncate">{gap.guidelineCitation}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-3.5 pt-3 border-t border-slate-200/50 flex justify-end">
                    <button
                      id={`remedy-gap-btn-${gap.id}`}
                      onClick={() => onResolveGap(gap.id)}
                      disabled={isHarmonizing}
                      className="remedy-gap-btn inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-slate-900 hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-600/10 transition-all duration-150 disabled:opacity-50 cursor-pointer"
                    >
                      <Cpu className="w-3.5 h-3.5" />
                      Auto-Remediate Gap
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Resolved Gaps */}
            {resolvedGaps.map((gap) => (
              <div
                key={gap.id}
                className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/40 relative overflow-hidden transition-all duration-300"
                id={`resolved-gap-${gap.id}`}
              >
                <div className="flex items-start gap-3 opacity-70">
                  <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex gap-1.5 items-center mb-1">
                      <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.25 rounded font-bold border border-emerald-200 bg-emerald-100 text-emerald-800">
                        Remedied
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        Section {gap.section}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-800 line-through leading-tight">
                      {gap.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      All inconsistencies, translation markers, and reference alignments have been successfully completed using Harmonizer-AI.
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

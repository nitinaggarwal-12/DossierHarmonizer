import React from 'react';
import { RegulatoryAuthority, RegulatoryBodyInfo } from '../types';
import { REGULATORY_BODIES } from '../data';
import { Globe, ArrowRight, CheckCircle2, AlertTriangle, Info, HelpCircle } from 'lucide-react';

interface RegulatoryMapProps {
  sourceAuthority: RegulatoryAuthority;
  selectedTarget: RegulatoryAuthority;
  onSelectTarget: (target: RegulatoryAuthority) => void;
  gapsCount: Record<RegulatoryAuthority, number>;
  completionStatus: Record<RegulatoryAuthority, 'compliant' | 'warning' | 'error' | 'unreviewed'>;
}

export default function RegulatoryMap({
  sourceAuthority,
  selectedTarget,
  onSelectTarget,
  gapsCount,
  completionStatus,
}: RegulatoryMapProps) {
  const bodies = Object.values(REGULATORY_BODIES);

  const getStatusBadge = (status: 'compliant' | 'warning' | 'error' | 'unreviewed', gaps: number) => {
    switch (status) {
      case 'compliant':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Aligned
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5" /> {gaps} Actionable Gaps
          </span>
        );
      case 'error':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertTriangle className="w-3.5 h-3.5" /> Critical Gap ({gaps})
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-50 text-slate-500 border border-slate-200">
            <Info className="w-3.5 h-3.5" /> Unreviewed
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden" id="regulatory-gateway">
      {/* Visual Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-white relative overflow-hidden">
        {/* Decorative Grid Network */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                <Globe className="w-5 h-5 animate-spin-slow" />
              </span>
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Interactive Regulatory Hub</span>
            </div>
            <h2 className="text-xl font-bold font-sans tracking-tight">Global Ingress Mapping Pathway</h2>
            <p className="text-slate-300 text-sm mt-0.5">Visualize alignment pathways and bridge dossier compliance between international borders</p>
          </div>

          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-xl">{REGULATORY_BODIES[sourceAuthority]?.icon}</span>
              <span className="font-semibold">{sourceAuthority}</span>
              <span className="text-xs text-slate-400">(Source Origin)</span>
            </div>
            <ArrowRight className="w-4 h-4 text-emerald-400 animate-pulse" />
            <div className="flex items-center gap-2">
              <span className="text-xl">{REGULATORY_BODIES[selectedTarget]?.icon}</span>
              <span className="font-semibold text-emerald-300">{selectedTarget}</span>
              <span className="text-xs text-emerald-400 font-medium">(Target Target)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 bg-slate-50/50">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {bodies.map((body) => {
            const isSource = body.id === sourceAuthority;
            const isSelectedTarget = body.id === selectedTarget;
            const status = completionStatus[body.id] || 'unreviewed';
            const count = gapsCount[body.id] || 0;

            return (
              <button
                key={body.id}
                onClick={() => !isSource && onSelectTarget(body.id)}
                disabled={isSource}
                className={`group text-left relative flex flex-col justify-between p-5 rounded-2xl border transition-all duration-300 ${
                  isSource
                    ? 'bg-slate-100 border-slate-200 cursor-not-allowed opacity-80'
                    : isSelectedTarget
                    ? 'bg-white border-emerald-500 shadow-lg shadow-emerald-500/5 ring-2 ring-emerald-500/20 scale-[1.02] -translate-y-0.5'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5 cursor-pointer'
                }`}
                id={`authority-card-${body.id}`}
              >
                {/* Visual indicator corner */}
                {isSelectedTarget && (
                  <div className="absolute top-0 right-0 w-8 h-8 overflow-hidden rounded-tr-xl">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500 rotate-45 translate-x-8 -translate-y-8" />
                  </div>
                )}

                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl shadow-sm rounded-md p-1 bg-slate-50 border border-slate-100">{body.icon}</span>
                      <div>
                        <div className="font-extrabold text-lg text-slate-900 flex items-center gap-1">
                          {body.id}
                          {isSource && (
                            <span className="text-[9px] uppercase tracking-wider bg-slate-200 text-slate-700 px-1 py-0.25 rounded font-bold">Origin</span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium tracking-wide">{body.region}</p>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 font-semibold line-clamp-1 group-hover:text-slate-900 mb-4 h-4">
                    {body.name}
                  </p>

                  <div className="space-y-2 pt-2 border-t border-slate-100 text-[11px] text-slate-600 font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Standards:</span>
                      <span className="text-slate-700 font-semibold truncate max-w-[100px]">{body.standards.split(',')[0]}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Climate:</span>
                      <span className="text-slate-700 font-semibold">{body.stabilityZone.split(' ')[0]} {body.stabilityZone.split(' ')[1] || ''}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Language:</span>
                      <span className="text-slate-700 font-semibold truncate max-w-[100px]">{body.primaryLanguage.split(' ')[0]}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-2 w-full">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Alignment Status</span>
                  </div>
                  <div className="flex items-center justify-between">
                    {isSource ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-200 text-slate-700 border border-slate-300">
                        Reference Source
                      </span>
                    ) : (
                      getStatusBadge(status, count)
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { History, ClipboardList, Trash2, Download, Play, CheckCircle, HelpCircle } from 'lucide-react';

interface LogItem {
  id: string;
  timestamp: string;
  event: string;
  category: 'System' | 'AI Harmonizer' | 'Manual Edit' | 'Gap Resolution';
  status: 'info' | 'success' | 'warning';
}

const INITIAL_LOGS: LogItem[] = [
  { id: '1', timestamp: '2026-06-28T20:45:10.000Z', event: "Dossier eCTD Tree structure fully ingested.", category: "System", status: "success" },
  { id: '2', timestamp: '2026-06-28T20:46:12.000Z', event: "Initial global gap analysis execution finished. 4 warnings flagged.", category: "System", status: "info" },
  { id: '3', timestamp: '2026-06-28T20:48:00.000Z', event: "Auto-translated 'haematological' to 'hematological' in Section 1.3.1 (FDA Standard alignment).", category: "AI Harmonizer", status: "success" },
  { id: '4', timestamp: '2026-06-28T20:49:15.000Z', event: "Resolved gap 'Module 1.3.1 Boxed Warning check' via local AI text patching.", category: "Gap Resolution", status: "success" },
  { id: '5', timestamp: '2026-06-28T20:50:45.000Z', event: "XML Schema Validation executed. Malformed UUID detected.", category: "System", status: "warning" }
];

interface AuditHistoryLogsProps {
  triggerNotification: (message: string, type: 'success' | 'info' | 'error') => void;
}

export default function AuditHistoryLogs({ triggerNotification }: AuditHistoryLogsProps) {
  const [logs, setLogs] = useState<LogItem[]>(INITIAL_LOGS);
  
  // Custom log generator state
  const [customEvent, setCustomEvent] = useState('');
  const [customCat, setCustomCat] = useState<'System' | 'AI Harmonizer' | 'Manual Edit' | 'Gap Resolution'>('Manual Edit');

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEvent.trim()) return;

    const newLog: LogItem = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      event: customEvent.trim(),
      category: customCat,
      status: 'success'
    };

    setLogs([newLog, ...logs]);
    setCustomEvent('');
    triggerNotification("Custom event committed to audit history trail.", "success");
  };

  const handleClearLogs = () => {
    setLogs([]);
    triggerNotification("Audit history trail successfully cleared.", "info");
  };

  const handleDownloadLogs = () => {
    const text = JSON.stringify(logs, null, 2);
    const blob = new Blob([text], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `dossier_harmonization_audit_logs.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerNotification("Audit log exported in structured JSON format!", "success");
  };

  return (
    <div className="space-y-6" id="audit-history-logs">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <History className="w-40 h-40 text-emerald-500" />
        </div>
        <div className="relative z-10">
          <span className="text-[10px] font-mono tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full font-bold uppercase">
            CFR Part 11 Audit Trail
          </span>
          <h2 className="text-xl font-extrabold text-white mt-2">Audit History & Logs</h2>
          <p className="text-slate-400 text-xs mt-1 max-w-xl">
            View compliant timestamped records of all regulatory alignments, manual dossier overrides, and XML validation passes.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left pane: Logs list (8 cols) */}
        <div className="lg:col-span-8 bg-slate-900/30 border border-slate-900 rounded-2xl p-5 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Compliance Audit Trail Records</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Meets regulatory data integrity standards</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleDownloadLogs}
                disabled={logs.length === 0}
                className="p-1.5 rounded-lg hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all text-xs font-bold inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                Export JSON
              </button>
              <button
                onClick={handleClearLogs}
                disabled={logs.length === 0}
                className="p-1.5 rounded-lg hover:bg-rose-500/10 border border-slate-800 hover:border-rose-900/40 text-slate-400 hover:text-rose-400 transition-all text-xs font-bold inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear Logs
              </button>
            </div>
          </div>

          <div className="space-y-2.5 max-h-[480px] overflow-y-auto scrollbar-thin select-text font-mono">
            {logs.length === 0 ? (
              <div className="p-12 border border-dashed border-slate-800 rounded-xl text-center">
                <ClipboardList className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <h4 className="text-xs font-bold text-slate-400 font-sans">No Audit Records Available</h4>
                <p className="text-[10px] text-slate-500 mt-1 font-sans">Trigger some manual alignments to start logging compliant metadata.</p>
              </div>
            ) : (
              logs.map((log) => (
                <div 
                  key={log.id}
                  className="p-3 bg-slate-950 border border-slate-900 hover:border-slate-800 rounded-xl text-[11px] leading-relaxed flex flex-col md:flex-row justify-between items-start md:items-center gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500 font-bold">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                      <span className={`text-[8.5px] uppercase font-bold px-1.5 py-0.25 rounded ${
                        log.category === 'System' 
                          ? 'bg-slate-800 text-slate-300' 
                          : log.category === 'AI Harmonizer'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10'
                          : log.category === 'Manual Edit'
                          ? 'bg-sky-500/10 text-sky-400 border border-sky-500/10'
                          : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/10'
                      }`}>
                        {log.category}
                      </span>
                    </div>
                    <div className="text-slate-300 font-sans">{log.event}</div>
                  </div>

                  <span className={`w-2 h-2 rounded-full shrink-0 ${
                    log.status === 'success' 
                      ? 'bg-emerald-400' 
                      : log.status === 'warning'
                      ? 'bg-rose-500 animate-pulse'
                      : 'bg-indigo-400'
                  }`} />
                </div>
              ))
            )}
          </div>

        </div>

        {/* Right pane: Manual event logger (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900/30 border border-slate-900 rounded-2xl p-5 flex flex-col justify-start h-full">
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-1">Trigger Audit Simulation</h3>
            <p className="text-[10px] text-slate-500">Log custom actions or testing milestones manually</p>
          </div>

          <form onSubmit={handleAddLog} className="space-y-4 mt-5">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Event Description</label>
              <input
                type="text"
                placeholder="e.g. Conducted HPLC purity audit of intermediate lot-195"
                value={customEvent}
                onChange={(e) => setCustomEvent(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs outline-none text-white focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Log Category</label>
              <select
                value={customCat}
                onChange={(e: any) => setCustomCat(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs outline-none text-white focus:border-emerald-500"
              >
                <option value="Manual Edit">Manual Edit</option>
                <option value="System">System</option>
                <option value="AI Harmonizer">AI Harmonizer</option>
                <option value="Gap Resolution">Gap Resolution</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-2.5 text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer font-sans"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Log Custom Audit Milestone
            </button>
          </form>

          <div className="mt-6 p-4 rounded-xl border border-indigo-950 bg-indigo-950/20 text-[10px] text-slate-400 leading-relaxed font-sans flex gap-2">
            <HelpCircle className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-200 block">FDA CFR Part 11 Guideline:</span> 
              Requires secure electronic computer-generated timestamped audit trails of all user additions, modifications, and deletions.
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

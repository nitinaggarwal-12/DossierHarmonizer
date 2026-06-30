import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, RegulatoryAuthority } from '../types';
import { 
  MessageSquare, 
  Send, 
  Sparkles, 
  RefreshCw, 
  HelpCircle, 
  CheckCircle, 
  Info, 
  Bot, 
  User, 
  Globe,
  PlusCircle,
  Clock,
  ArrowUpRight
} from 'lucide-react';

interface FullChatAdvisorProps {
  messages: ChatMessage[];
  onSendMessage: (content: string) => void;
  isSending: boolean;
  targetAuthority: RegulatoryAuthority;
}

const EXPERT_PROMPTS = [
  {
    title: "USPI Format Swaps",
    prompt: "Show me an example conversion of EMA SmPC section 4.8 to US Prescribing Information Section 6 (Adverse Reactions)."
  },
  {
    title: "PMDA Animal Origin",
    prompt: "What documentation does Japan PMDA require regarding Bovine Spongiform Encephalopathy (BSE/TSE) raw material controls?"
  },
  {
    title: "Stability Zone IVb Specs",
    prompt: "List climatic stability parameters, storage temperature, relative humidity, and active storage statements for Climatic Zone IVb (hot/humid)."
  },
  {
    title: "JP 2.44 Ash Residue",
    prompt: "Compare Japanese Pharmacopoeia (JP) chapter 2.44 Residue on Ignition limits to USP 281 standards."
  },
  {
    title: "Module 1 Demographics",
    prompt: "What are FDA guidelines for including gender, racial, and ethnic sub-group demographic statistics in clinical summaries?"
  },
  {
    title: "Biotech Glycosylation",
    prompt: "What critical quality attributes are required for monoclonal antibody glycosylation profiles according to EMA Quality Guidelines?"
  }
];

export default function FullChatAdvisor({
  messages,
  onSendMessage,
  isSending,
  targetAuthority,
}: FullChatAdvisorProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;
    onSendMessage(input.trim());
    setInput('');
  };

  return (
    <div className="bg-slate-900/30 border border-slate-900 rounded-2xl flex flex-col h-[650px] overflow-hidden" id="full-chat-advisor">
      
      {/* Advisor Header */}
      <div className="p-5 border-b border-slate-800 bg-slate-900/80 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
            <Bot className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-white">Harmonizer-AI Consultant</h3>
              <span className="text-[9px] uppercase tracking-wider bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded font-mono font-bold">ICH Expert Active</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Understands FDA, EMA, PMDA, CDSCO, and Swissmedic submission criteria</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-mono text-emerald-400 font-bold">24/7 Agent Connected</span>
        </div>
      </div>

      {/* Main chat layout */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        
        {/* Left Side: Quick prompt trigger panel (on desktop) */}
        <div className="w-full lg:w-72 border-b lg:border-b-0 lg:border-r border-slate-800 p-4 bg-slate-950/20 overflow-y-auto shrink-0 scrollbar-thin">
          <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-3 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5" /> Core Regulatory Scenarios
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-2">
            {EXPERT_PROMPTS.map((scen, idx) => (
              <button
                key={idx}
                onClick={() => onSendMessage(scen.prompt)}
                disabled={isSending}
                className="w-full text-left text-[11px] text-slate-300 hover:text-emerald-300 bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-900/40 p-3 rounded-xl transition-all duration-150 font-medium group disabled:opacity-50 cursor-pointer"
              >
                <div className="flex justify-between items-start">
                  <span className="font-bold text-slate-200 group-hover:text-emerald-400">{scen.title}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 shrink-0 mt-0.5" />
                </div>
                <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-relaxed font-sans">{scen.prompt}</p>
              </button>
            ))}
          </div>

          <div className="mt-6 p-4 rounded-xl border border-slate-800 bg-slate-900/50 text-[10px] text-slate-400 leading-relaxed font-sans">
            <strong className="text-slate-300">Prompt Tip:</strong> Mention target agencies, section numbers (e.g. 3.2.P), or stability zones to retrieve specific references.
          </div>
        </div>

        {/* Right Side: Message Stream */}
        <div className="flex-1 flex flex-col min-h-0 bg-slate-950/10">
          
          {/* Chat log */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4 scrollbar-thin min-h-0 select-text">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}
                >
                  <div className={`flex gap-3 max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                    
                    {/* Icon */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
                      isUser 
                        ? 'bg-slate-800 border-slate-700 text-slate-300' 
                        : 'bg-emerald-950/80 border-emerald-500/20 text-emerald-400'
                    }`}>
                      {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                    </div>

                    {/* Chat Bubble */}
                    <div
                      className={`rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                        isUser
                          ? 'bg-slate-900 text-white rounded-tr-none border border-slate-800'
                          : 'bg-slate-900/40 text-slate-200 rounded-tl-none border border-slate-900 shadow'
                      }`}
                    >
                      {!isUser && (
                        <div className="text-[9px] uppercase tracking-wider font-extrabold text-emerald-400 mb-1.5 flex items-center gap-1.5 select-none">
                          <Bot className="w-3.5 h-3.5" />
                          Harmonizer Agent
                          <span className="text-[8px] text-slate-500 font-mono">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      )}
                      
                      <div className="whitespace-pre-wrap font-sans text-slate-200">
                        {msg.content}
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}

            {isSending && (
              <div className="flex justify-start">
                <div className="flex gap-3 max-w-[80%] items-start">
                  <div className="w-8 h-8 rounded-full bg-emerald-950/80 border border-emerald-500/20 text-emerald-400 flex items-center justify-center animate-spin-slow shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="bg-slate-900/50 text-slate-300 rounded-2xl rounded-tl-none border border-slate-900 px-4 py-3 text-xs flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </span>
                    <span className="text-slate-400 font-mono text-[10px]">Consulting localized ICH guidelines...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Form input */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-slate-900 flex gap-2.5 bg-slate-900/20">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask a question on drug substance, stability, pharmacopoeias or localized Japanese/EMA regulations...`}
              disabled={isSending}
              className="flex-1 bg-slate-950 hover:bg-slate-900/80 focus:bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 rounded-xl px-4 py-2.5 text-xs text-white transition-all outline-none disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || isSending}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl p-2.5 px-4 transition-all flex items-center justify-center disabled:opacity-40 disabled:hover:bg-emerald-600 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>

      </div>

    </div>
  );
}

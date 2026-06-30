import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, RegulatoryAuthority } from '../types';
import { MessageSquare, Send, Sparkles, HelpCircle, FileCheck, RefreshCw, X } from 'lucide-react';

interface RegulatoryAssistantProps {
  messages: ChatMessage[];
  onSendMessage: (content: string) => void;
  isSending: boolean;
  targetAuthority: RegulatoryAuthority;
  onClose?: () => void;
}

const SUGGESTED_QUESTIONS: Record<RegulatoryAuthority, string[]> = {
  FDA: [
    'How do I convert an EMA SmPC Section 4.8 table to USPI Section 6 formatting?',
    'What are FDA rules for including clinical trials demographics in Module 1?',
    'Explain the FDA photostability standard ICH Q1B requirement.',
  ],
  EMA: [
    'What is the standard order of topics in an EMA Summary of Product Characteristics (SmPC)?',
    'How are MedDRA adverse reaction frequencies listed in EMA documents?',
    'Compare EU vs US guidelines for biological source controls.',
  ],
  PMDA: [
    'What is required by PMDA regarding animal origin certificate of lactose?',
    'Explain JP pharmacopoeia Residue on Ignition chapter 2.44 testing methods.',
    'Do stability submissions in Japan require localized East Asian clinical batch data?',
  ],
  CDSCO: [
    'Explain the CDSCO stability requirements for climatic Zone IVb.',
    'What is CDSCO Indian Pharmacopoeia (IP) general tablet monograph limits?',
  ],
  Swissmedic: [
    'What forms are required for Swissmedic specific country labeling annexes?',
    'Does Swissmedic accept standard EMA SmPC documentation directly?',
  ],
};

export default function RegulatoryAssistant({
  messages,
  onSendMessage,
  isSending,
  targetAuthority,
  onClose,
}: RegulatoryAssistantProps) {
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

  const handleSuggestedClick = (question: string) => {
    if (isSending) return;
    onSendMessage(question);
  };

  const currentSuggestions = SUGGESTED_QUESTIONS[targetAuthority] || SUGGESTED_QUESTIONS.FDA;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden flex flex-col h-full" id="regulatory-assistant">
      {/* Visual Header */}
      <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-emerald-900 to-slate-900 text-white flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-tight">Harmonizer-AI</h3>
            <p className="text-[10px] text-emerald-300 font-mono">24/7 Regulatory Advisor Active</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Message Stream */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-thin min-h-0">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-slate-900 text-white rounded-tr-none shadow-sm shadow-slate-950/5'
                    : 'bg-slate-100/80 text-slate-800 rounded-tl-none border border-slate-200/50'
                }`}
              >
                {!isUser && (
                  <div className="text-[9px] uppercase tracking-wider font-extrabold text-emerald-700 mb-1.5 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    Regulatory Agent Reply
                  </div>
                )}
                {/* Format simple paragraphs and listings in chat */}
                <div className="whitespace-pre-wrap font-sans">
                  {msg.content}
                </div>
              </div>
            </div>
          );
        })}

        {isSending && (
          <div className="flex justify-start">
            <div className="bg-slate-100/80 text-slate-800 rounded-2xl rounded-tl-none border border-slate-200/50 px-4 py-3 text-xs flex items-center gap-2">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
              <span className="text-slate-500 font-mono text-[10px]">Harmonizer-AI is analyzing international standards...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions Panel */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
          <HelpCircle className="w-3 h-3 text-slate-400" /> Suggested Queries ({targetAuthority})
        </p>
        <div className="space-y-1">
          {currentSuggestions.map((question, idx) => (
            <button
              key={idx}
              onClick={() => handleSuggestedClick(question)}
              disabled={isSending}
              className="w-full text-left text-[11px] text-slate-600 hover:text-emerald-800 bg-white hover:bg-emerald-50 border border-slate-200/60 hover:border-emerald-200 rounded-lg p-2 transition-all duration-150 font-medium truncate disabled:opacity-50 cursor-pointer"
            >
              {question}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-slate-100 flex gap-2 bg-white">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Ask about ${targetAuthority} guidelines...`}
          disabled={isSending}
          className="flex-1 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 rounded-xl px-4 py-2 text-xs transition-all duration-150 outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!input.trim() || isSending}
          className="bg-slate-900 hover:bg-emerald-600 text-white rounded-xl p-2 px-3 transition-all duration-150 flex items-center justify-center disabled:opacity-40 disabled:hover:bg-slate-900 cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}

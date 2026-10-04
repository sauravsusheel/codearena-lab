import React, { useState } from 'react';
import { Send, Bot, User, Sparkles, BookOpen, ExternalLink, HelpCircle } from 'lucide-react';
import { ChatMessage } from '../types/campusbot.types';

interface ConversationalChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (text: string, isTutorMode: boolean) => Promise<void>;
}

export const ConversationalChatInterface: React.FC<ConversationalChatInterfaceProps> = ({
  messages,
  onSendMessage
}) => {
  const [input, setInput] = useState('');
  const [tutorMode, setTutorMode] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending) return;
    const text = input;
    setInput('');
    setSending(true);
    try {
      await onSendMessage(text, tutorMode);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-cu-border shadow-sm flex flex-col h-[650px] overflow-hidden">
      {/* Top Controls Bar */}
      <div className="p-4 bg-slate-50 border-b border-gray-100 flex flex-wrap justify-between items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#002561] text-cu-gold flex items-center justify-center font-bold">
            <Bot size={18} />
          </div>
          <div>
            <h3 className="font-bold text-xs text-cu-navy">CampusBot RAG Query Engine</h3>
            <span className="text-[10px] text-gray-400">pgvector HNSW Cosine Index Active</span>
          </div>
        </div>

        {/* Tutor Mode Toggle */}
        <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-gray-200">
          <input
            type="checkbox"
            checked={tutorMode}
            onChange={(e) => setTutorMode(e.target.checked)}
            className="rounded accent-[#002561]"
          />
          <span className={tutorMode ? 'text-[#002561]' : 'text-gray-600'}>
            Socratic Tutor Mode (Hints Only)
          </span>
        </label>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.role !== 'user' && (
              <div className="w-7 h-7 rounded-lg bg-[#002561] text-cu-gold flex items-center justify-center shrink-0 mt-1">
                <Bot size={14} />
              </div>
            )}

            <div
              className={`p-4 rounded-2xl max-w-[85%] text-xs leading-relaxed space-y-2 ${
                m.role === 'user'
                  ? 'bg-[#002561] text-white rounded-tr-none'
                  : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-none'
              }`}
            >
              <div>{m.text}</div>

              {/* Citations Box */}
              {m.citations && m.citations.length > 0 && (
                <div className="pt-2 border-t border-slate-200/80 space-y-1.5 text-[11px]">
                  <div className="font-semibold text-cu-navy flex items-center gap-1">
                    <BookOpen size={12} className="text-cu-gold" />
                    Verified Official Ground-Truth Citations:
                  </div>
                  {m.citations.map((c, idx) => (
                    <div
                      key={idx}
                      className="bg-white p-2 rounded border border-slate-200 text-gray-600 flex justify-between items-center"
                    >
                      <div>
                        <span className="font-semibold text-slate-800">{c.documentTitle}</span>
                        <span className="text-gray-400"> (Page {c.pageNumber})</span>
                        <div className="text-[10px] text-gray-500">{c.sectionHeader}</div>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">
                        {(c.relevanceScore * 100).toFixed(0)}% Match
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {m.role === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-cu-gold text-[#002561] flex items-center justify-center shrink-0 mt-1 font-bold text-xs">
                U
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input Field */}
      <form onSubmit={handleSubmit} className="p-4 bg-slate-50 border-t border-gray-100 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={tutorMode ? "Ask a programming or algorithmic question in Tutor Mode..." : "Ask about attendance rules, exam hall tickets, course credits..."}
          className="flex-1 bg-white border border-gray-300 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-cu-navy"
        />
        <button
          type="submit"
          disabled={sending}
          className="bg-[#002561] hover:bg-[#0E1B38] text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow transition disabled:opacity-50"
        >
          <Send size={14} />
          <span>{sending ? 'Searching...' : 'Ask AI'}</span>
        </button>
      </form>
    </div>
  );
};

import React, { useState } from 'react';
import { Bot, X, Send, Sparkles, HelpCircle } from 'lucide-react';

export const CampusBotDrawer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', text: string }[]>([
    { role: 'assistant', text: 'Hello! I am the Chanakya University Campus AI Assistant. How can I help you with classes, exam schedules, or portal services today?' }
  ]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userMsg = query;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setQuery('');

    setTimeout(() => {
      let reply = 'Here is what I found in the Chanakya University knowledge base: ';
      if (userMsg.toLowerCase().includes('attendance')) {
        reply += 'You have 1 class scheduled today for PRG301 (Programming III) at 2:15 PM in Room 1A-59. Attendance is verified via dynamic QR code and GPS polygon geofence.';
      } else if (userMsg.toLowerCase().includes('exam')) {
        reply += 'Your next scheduled exam is PRG301 Mid-Term on Sep 5, 2026. It will be conducted securely via ExamShield.';
      } else {
        reply += 'Under Chanakya University academic regulations, all course milestones, faculty mentorship logs, and leave applications are processed digitally via UniSphere.';
      }
      setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
    }, 600);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 bg-cu-navy hover:bg-cu-navylight text-white p-3.5 rounded-full shadow-2xl border-2 border-cu-gold flex items-center justify-center transition group"
        title="Ask Campus AI Assistant"
      >
        <Bot size={24} className="text-cu-gold group-hover:scale-110 transition" />
      </button>

      {/* Interactive Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 z-50 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-cu-border flex flex-col overflow-hidden animate-scaleUp">
          {/* Header */}
          <div className="bg-cu-navy text-white p-3.5 flex justify-between items-center border-b border-cu-gold/30">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-white/10 border border-cu-gold flex items-center justify-center text-cu-gold">
                <Bot size={16} />
              </div>
              <div>
                <div className="font-bold text-xs">CampusBot AI Assistant</div>
                <div className="text-[9px] text-cu-gold">RAG Semantic Search • Module 06</div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-white p-1">
              <X size={16} />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-3.5 overflow-y-auto max-h-80 space-y-2.5 text-xs">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-2.5 rounded-xl max-w-[85%] leading-relaxed ${
                  m.role === 'user' 
                    ? 'bg-cu-navy text-white rounded-br-none' 
                    : 'bg-gray-100 text-gray-800 rounded-bl-none border border-gray-200'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          {/* Query Input */}
          <form onSubmit={handleSend} className="p-2.5 bg-gray-50 border-t border-cu-border flex gap-2">
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask about PRG301, exams, leave..."
              className="flex-1 text-xs p-2 border border-cu-border rounded-lg focus:outline-none focus:border-cu-navy"
            />
            <button type="submit" className="bg-cu-navy text-white p-2 rounded-lg hover:bg-cu-navylight transition">
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
export default CampusBotDrawer;

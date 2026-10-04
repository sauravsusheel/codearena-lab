import React, { useState, useEffect } from 'react';
import { Bot, Database, Sparkles, HelpCircle } from 'lucide-react';
import { ModuleErrorBoundary } from '../../core/resilience/ModuleErrorBoundary';
import { FaultSimulatorButton } from '../../core/resilience/FaultSimulatorButton';
import { ragBotService } from './services/ragBotService';
import { ConversationalChatInterface } from './components/ConversationalChatInterface';
import { KnowledgeIngestionManager } from './components/KnowledgeIngestionManager';
import { ChatMessage, IngestedDocument } from './types/campusbot.types';

const CampusBotModuleContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'chat' | 'knowledge'>('chat');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [documents, setDocuments] = useState<IngestedDocument[]>([]);

  useEffect(() => {
    ragBotService.getChatHistory().then(setMessages);
    ragBotService.getDocuments().then(setDocuments);
  }, []);

  const handleSendMessage = async (text: string, isTutorMode: boolean) => {
    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isTutorMode
    };
    setMessages(prev => [...prev, userMsg]);

    const assistantReply = await ragBotService.askQuestion(text, isTutorMode);
    setMessages(prev => [...prev, assistantReply]);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header & Resilience Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cu-border pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cu-pill text-cu-navy text-xs font-semibold">
              <Bot size={13} />
              EduAssist AI Module 06
            </span>
            <FaultSimulatorButton moduleName="EduAssist AI (Team 06)" />
          </div>
          <h2 className="text-2xl font-bold text-cu-navy">Institutional Knowledge Base &amp; Conversational AI</h2>
          <p className="text-xs sm:text-sm text-gray-500">
            RAG vector search, official university policy citations, Socratic coding tutor mode, and handbook ingestion.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-gray-100 p-1 rounded-lg text-xs font-semibold">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-3 py-1.5 rounded-md transition ${activeTab === 'chat' ? 'bg-white text-cu-navy shadow-sm' : 'text-gray-600 hover:text-cu-navy'}`}
          >
            Conversational RAG Chat
          </button>
          <button
            onClick={() => setActiveTab('knowledge')}
            className={`px-3 py-1.5 rounded-md transition ${activeTab === 'knowledge' ? 'bg-white text-cu-navy shadow-sm' : 'text-gray-600 hover:text-cu-navy'}`}
          >
            Vector Document Ingestion
          </button>
        </div>
      </div>

      {/* Tab Renderers */}
      {activeTab === 'chat' && (
        <ConversationalChatInterface
          messages={messages}
          onSendMessage={handleSendMessage}
        />
      )}
      {activeTab === 'knowledge' && <KnowledgeIngestionManager documents={documents} />}
    </div>
  );
};

export const CampusBotModule: React.FC = () => {
  return (
    <ModuleErrorBoundary
      moduleId="bot"
      moduleName="EduAssist AI (CampusBot)"
      teamName="Team 06"
    >
      <CampusBotModuleContent />
    </ModuleErrorBoundary>
  );
};

export default CampusBotModule;

import React, { useState, useEffect } from 'react';
import { Video, Mic, Sparkles, Eye, HelpCircle, Activity } from 'lucide-react';
import { ModuleErrorBoundary } from '../../core/resilience/ModuleErrorBoundary';
import { FaultSimulatorButton } from '../../core/resilience/FaultSimulatorButton';
import { presentationService } from './services/presentationService';
import { InsightPresenterStudio } from './components/InsightPresenterStudio';
import { WebRTCStudioStage } from './components/WebRTCStudioStage';
import { SpeechGazeAnalyzer } from './components/SpeechGazeAnalyzer';
import { VivaQuestionGenerator } from './components/VivaQuestionGenerator';
import { SpeechMetrics, VisualGazeMetrics, VivaQuestion, RubricEvaluationDossier } from './types/presentation.types';

const PresentationModuleContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'insight' | 'stage' | 'speech' | 'viva'>('insight');
  const [speech, setSpeech] = useState<SpeechMetrics | null>(null);
  const [gaze, setGaze] = useState<VisualGazeMetrics | null>(null);
  const [viva, setViva] = useState<VivaQuestion[]>([]);
  const [dossier, setDossier] = useState<RubricEvaluationDossier | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  useEffect(() => {
    presentationService.getSpeechMetrics().then(setSpeech);
    presentationService.getGazeMetrics().then(setGaze);
    presentationService.getVivaQuestions().then(setViva);
  }, []);

  const handleTriggerAudit = async () => {
    setIsEvaluating(true);
    try {
      const result = await presentationService.triggerAiAudit();
      setDossier(result);
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header & Resilience Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cu-border pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cu-pill text-cu-navy text-xs font-semibold">
              <Video size={13} />
              EduPresent AI Module 05
            </span>
            <FaultSimulatorButton moduleName="EduPresent AI (Team 05)" />
          </div>
          <h2 className="text-2xl font-bold text-cu-navy">Insight Presenter — Multimodal AI Presentation Studio</h2>
          <p className="text-xs sm:text-sm text-gray-500">
            Eye contact heatmap strip, filler word timeline (&quot;um&quot;, &quot;uh&quot;, &quot;like&quot;), WPM pacing analysis, and rubric-weighted viva assessment.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-gray-100 p-1 rounded-lg text-xs font-semibold gap-1">
          <button
            onClick={() => setActiveTab('insight')}
            className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 ${activeTab === 'insight' ? 'bg-white text-cu-navy shadow-sm font-bold' : 'text-gray-600 hover:text-cu-navy'}`}
          >
            <Sparkles size={13} className="text-cu-gold" />
            Insight Presenter Studio
          </button>
          <button
            onClick={() => setActiveTab('stage')}
            className={`px-3 py-1.5 rounded-md transition ${activeTab === 'stage' ? 'bg-white text-cu-navy shadow-sm' : 'text-gray-600 hover:text-cu-navy'}`}
          >
            WebRTC Stage
          </button>
          <button
            onClick={() => setActiveTab('speech')}
            className={`px-3 py-1.5 rounded-md transition ${activeTab === 'speech' ? 'bg-white text-cu-navy shadow-sm' : 'text-gray-600 hover:text-cu-navy'}`}
          >
            Speech &amp; Gaze AI
          </button>
          <button
            onClick={() => setActiveTab('viva')}
            className={`px-3 py-1.5 rounded-md transition ${activeTab === 'viva' ? 'bg-white text-cu-navy shadow-sm' : 'text-gray-600 hover:text-cu-navy'}`}
          >
            AI Viva Generator
          </button>
        </div>
      </div>

      {/* Tab Renderers */}
      {activeTab === 'insight' && <InsightPresenterStudio />}
      {activeTab === 'stage' && (
        <WebRTCStudioStage
          dossier={dossier}
          onTriggerAudit={handleTriggerAudit}
          isEvaluating={isEvaluating}
        />
      )}
      {activeTab === 'speech' && speech && gaze && (
        <SpeechGazeAnalyzer speech={speech} gaze={gaze} />
      )}
      {activeTab === 'viva' && <VivaQuestionGenerator questions={viva} />}
    </div>
  );
};

export const PresentationModule: React.FC = () => {
  return (
    <ModuleErrorBoundary
      moduleId="presentation"
      moduleName="EduPresent AI (Viva Voce & Presentation)"
      teamName="Team 05"
    >
      <PresentationModuleContent />
    </ModuleErrorBoundary>
  );
};

export default PresentationModule;

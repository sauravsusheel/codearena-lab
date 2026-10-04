import React, { useState } from 'react';
import { Video, Mic, Share2, Layers, Sparkles, UserCheck, Play, CheckCircle2 } from 'lucide-react';
import { RubricEvaluationDossier } from '../types/presentation.types';

interface WebRTCStudioStageProps {
  dossier: RubricEvaluationDossier | null;
  onTriggerAudit: () => void;
  isEvaluating: boolean;
}

export const WebRTCStudioStage: React.FC<WebRTCStudioStageProps> = ({
  dossier,
  onTriggerAudit,
  isEvaluating
}) => {
  const [currentSlide, setCurrentSlide] = useState(1);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Presenter & WebRTC Stage */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative aspect-video bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl flex items-center justify-center">
            {/* Simulated Live Slide Stream */}
            <div className="absolute inset-0 p-8 flex flex-col justify-between bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white">
              <div className="flex justify-between items-center text-xs text-amber-300 font-mono">
                <span>SLIDE {currentSlide} OF 12</span>
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  WebRTC Audio/Video Stream Active
                </span>
              </div>

              <div className="text-center space-y-3 max-w-xl mx-auto">
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-300 bg-amber-400/10 px-2.5 py-1 rounded">
                  Major Capstone Defense
                </span>
                <h3 className="text-2xl font-bold font-serif text-white">
                  UniSphere: Enterprise Unified Academic Architecture
                </h3>
                <p className="text-xs text-slate-300">
                  Presenter: Arjun Kumar (24MCA003) · Guide: Deepak B
                </p>
              </div>

              <div className="flex justify-between items-center text-xs text-slate-400">
                <span>Chanakya University MCA Project Defense</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentSlide(prev => Math.max(1, prev - 1))}
                    className="px-2 py-0.5 bg-white/10 hover:bg-white/20 rounded text-[11px] text-white"
                  >
                    Prev Slide
                  </button>
                  <button
                    onClick={() => setCurrentSlide(prev => Math.min(12, prev + 1))}
                    className="px-2 py-0.5 bg-white/10 hover:bg-white/20 rounded text-[11px] text-white"
                  >
                    Next Slide
                  </button>
                </div>
              </div>
            </div>

            {/* Presenter PiP WebCam Video */}
            <div className="absolute bottom-4 right-4 w-40 h-28 bg-slate-800 rounded-xl border-2 border-amber-400/80 shadow-2xl overflow-hidden flex flex-col justify-between p-2">
              <div className="flex justify-between items-center text-[9px] text-white/80">
                <span className="font-mono">CAM 1</span>
                <span className="text-emerald-400 font-bold">LIVENESS 98%</span>
              </div>
              <div className="text-center text-[10px] text-slate-300 font-medium">
                Arjun Kumar
              </div>
              <div className="text-[9px] text-amber-300 text-center font-mono">
                Audio: 142 WPM
              </div>
            </div>
          </div>
        </div>

        {/* Defense Evaluation Panel */}
        <div className="bg-white rounded-xl border border-cu-border p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-cu-navy uppercase">Examination Panel</span>
              <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">
                Room #04
              </span>
            </div>
            <h4 className="font-bold text-sm text-cu-navy">MCA301 Capstone Viva Voce</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Evaluating student delivery, technical depth, architectural defenses, and slide alignment.
            </p>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
              <div className="font-semibold text-slate-800">Evaluators in Session:</div>
              <div className="text-[11px] text-gray-600">• Dr. R. Sharma (External Examiner)</div>
              <div className="text-[11px] text-gray-600">• Deepak B (Internal Project Guide)</div>
            </div>
          </div>

          <button
            onClick={onTriggerAudit}
            disabled={isEvaluating}
            className="w-full bg-[#002561] hover:bg-[#0E1B38] text-white py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 shadow transition disabled:opacity-50"
          >
            <Sparkles size={15} className="text-cu-gold" />
            <span>{isEvaluating ? 'Transcribing & Analyzing...' : 'Run Multi-Modal AI Evaluation'}</span>
          </button>
        </div>
      </div>

      {/* Rubric Marks Dossier */}
      {dossier && (
        <div className="bg-white rounded-xl border border-cu-border p-6 shadow-sm space-y-5 animate-fadeIn">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-gray-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-cu-navy">Multi-Modal AI Rubric Evaluation Report</h3>
              <p className="text-xs text-gray-500">
                Ground-truth speech transcription combined with slide text semantic alignment.
              </p>
            </div>
            <div className="px-4 py-1.5 bg-[#002561] text-white rounded-xl text-center">
              <div className="text-[10px] text-cu-gold font-bold">Total Composite Score</div>
              <div className="text-xl font-bold font-serif">{dossier.totalScore} / 100 ({dossier.grade})</div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="text-gray-500 text-[11px]">Content Mastery</div>
              <div className="text-lg font-bold text-cu-navy mt-0.5">{dossier.contentScore} / 30</div>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="text-gray-500 text-[11px]">Oral Delivery</div>
              <div className="text-lg font-bold text-cu-navy mt-0.5">{dossier.deliveryScore} / 25</div>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="text-gray-500 text-[11px]">Visual Slide Deck</div>
              <div className="text-lg font-bold text-cu-navy mt-0.5">{dossier.visualAidsScore} / 20</div>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="text-gray-500 text-[11px]">Time Management</div>
              <div className="text-lg font-bold text-cu-navy mt-0.5">{dossier.timeScore} / 10</div>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="text-gray-500 text-[11px]">Viva Defense</div>
              <div className="text-lg font-bold text-cu-navy mt-0.5">{dossier.qaScore} / 15</div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
            <div>
              <strong className="text-gray-700">Verbatim Speech Audio Snippet:</strong>
              <p className="italic text-gray-600 mt-0.5">{dossier.transcriptSample}</p>
            </div>
            <div>
              <strong className="text-emerald-800">Evaluative Strengths:</strong>
              <p className="text-gray-600 mt-0.5">{dossier.strengths}</p>
            </div>
            <div>
              <strong className="text-amber-800">Recommended Enhancements:</strong>
              <p className="text-gray-600 mt-0.5">{dossier.improvements}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

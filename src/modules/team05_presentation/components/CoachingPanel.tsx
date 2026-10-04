import React from 'react';
import { Lightbulb, Eye, Clock, MessageSquare, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { CoachingTip } from '../types/presentation.types';

interface CoachingPanelProps {
  tips: CoachingTip[];
  executiveSummary: string;
  onSeek: (seconds: number) => void;
  currentTime: number;
}

function fmtTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export const CoachingPanel: React.FC<CoachingPanelProps> = ({
  tips,
  executiveSummary,
  onSeek,
  currentTime
}) => {
  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'EYE_CONTACT': return <Eye size={14} className="text-emerald-600" />;
      case 'PACING': return <Clock size={14} className="text-sky-600" />;
      case 'FILLER_WORD': return <MessageSquare size={14} className="text-rose-600" />;
      default: return <Lightbulb size={14} className="text-cu-gold" />;
    }
  };

  const getSeverityStyle = (sev: string) => {
    switch (sev) {
      case 'PRAISE': return 'border-l-4 border-l-emerald-500 bg-emerald-50/40 text-emerald-900';
      case 'WARNING': return 'border-l-4 border-l-rose-500 bg-rose-50/40 text-rose-900';
      default: return 'border-l-4 border-l-amber-500 bg-amber-50/40 text-amber-900';
    }
  };

  return (
    <div className="space-y-4">
      {/* Executive Summary Box */}
      <div className="bg-gradient-to-r from-cu-navy to-slate-900 text-white p-5 rounded-xl space-y-2 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-bold text-cu-gold uppercase tracking-wider">
          <Lightbulb size={16} />
          Executive Multimodal Coaching Memo
        </div>
        <p className="text-xs text-gray-200 leading-relaxed">
          {executiveSummary}
        </p>
      </div>

      {/* Timestamped Actionable Coaching Tips */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs font-bold text-gray-700 pb-1 border-b border-gray-100">
          <span>Actionable Rehearsal Moments ({tips.length} Key Segments)</span>
          <span className="text-[10px] text-gray-400 font-normal">Click timestamp to seek video</span>
        </div>

        {tips.map((tip, idx) => {
          const isNear = Math.abs(currentTime - tip.time) < 4;
          return (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border transition shadow-2xs ${getSeverityStyle(tip.severity)} ${
                isNear ? 'ring-2 ring-cu-gold shadow-md' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded bg-white shadow-2xs">{getCategoryIcon(tip.category)}</span>
                  <h4 className="font-bold text-xs text-gray-900">{tip.title}</h4>
                </div>

                <button
                  onClick={() => onSeek(tip.time)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-gray-200 hover:bg-gray-50 text-[10px] font-mono font-bold text-cu-navy transition shadow-2xs"
                  title="Jump to this moment in video"
                >
                  <Clock size={11} className="text-cu-gold" />
                  <span>{fmtTime(tip.time)}</span>
                  <ArrowRight size={10} />
                </button>
              </div>

              <p className="text-xs text-gray-700 mt-2 leading-relaxed">
                {tip.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

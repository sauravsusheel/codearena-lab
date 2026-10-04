import React from 'react';
import { Mic, Eye, Gauge, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { SpeechMetrics, VisualGazeMetrics } from '../types/presentation.types';

interface SpeechGazeAnalyzerProps {
  speech: SpeechMetrics;
  gaze: VisualGazeMetrics;
}

export const SpeechGazeAnalyzer: React.FC<SpeechGazeAnalyzerProps> = ({ speech, gaze }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Speech Audio Metrics */}
        <div className="bg-white rounded-xl border border-cu-border p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-cu-navy flex items-center gap-2">
              <Mic size={16} className="text-cu-navy" />
              Speech Acoustics &amp; Pacing
            </h3>
            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-bold">
              Whisper Audio Sync
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="text-[11px] text-gray-500 font-medium">Delivery Pace</span>
              <div className="text-xl font-bold text-cu-navy">{speech.wordsPerMinute} WPM</div>
              <span className="text-[10px] text-emerald-600 font-semibold">Optimal (130-160 WPM)</span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="text-[11px] text-gray-500 font-medium">Filler Word Count</span>
              <div className="text-xl font-bold text-amber-600">{speech.fillerWordCount} Detected</div>
              <span className="text-[10px] text-gray-500">Minimal hesitation</span>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="font-semibold text-gray-700">Detected Hesitation Words:</div>
            <div className="flex gap-2">
              {speech.fillerWordList.map((f, i) => (
                <span key={i} className="px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-900 rounded-md font-mono text-[11px]">
                  &quot;{f.word}&quot; &times; {f.count}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Visual Gaze & Posture */}
        <div className="bg-white rounded-xl border border-cu-border p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-cu-navy flex items-center gap-2">
              <Eye size={16} className="text-cu-navy" />
              Computer Vision Body Language &amp; Gaze
            </h3>
            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-bold">
              MediaPipe Face Mesh
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="text-[11px] text-gray-500 font-medium">Camera Eye Contact</span>
              <div className="text-xl font-bold text-cu-navy">{gaze.cameraEyeContactPercentage}%</div>
              <span className="text-[10px] text-emerald-600 font-semibold">Consistent Engagement</span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="text-[11px] text-gray-500 font-medium">Posture Stability</span>
              <div className="text-xl font-bold text-cu-navy">{gaze.postureStabilityPercentage}%</div>
              <span className="text-[10px] text-emerald-600 font-semibold">Nervousness: {gaze.nervousnessIndicator}</span>
            </div>
          </div>

          <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl text-xs text-blue-900 leading-relaxed">
            Presenter maintained stable head orientation with only {gaze.headPoseDeviationCount} minor yaw deviations away from the evaluator viewport.
          </div>
        </div>
      </div>
    </div>
  );
};

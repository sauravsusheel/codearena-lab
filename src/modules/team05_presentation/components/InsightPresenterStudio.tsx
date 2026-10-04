import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, RotateCcw, Volume2, VolumeX, Maximize2, 
  Sparkles, Award, FileText, Upload, Video, Mic, Eye, 
  TrendingUp, CheckCircle, Clock, AlertTriangle, Layers
} from 'lucide-react';
import { HeatmapStrip } from './HeatmapStrip';
import { FillerTimeline } from './FillerTimeline';
import { ContentScorecard } from './ContentScorecard';
import { CoachingPanel } from './CoachingPanel';
import { InsightPresentationAnalysis } from '../types/presentation.types';
import { presentationService } from '../services/presentationService';

function fmtTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export const InsightPresenterStudio: React.FC = () => {
  const [analysis, setAnalysis] = useState<InsightPresentationAnalysis | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [activeRightTab, setActiveRightTab] = useState<'coaching' | 'rubric' | 'transcript' | 'upload'>('coaching');
  const [isProcessingNewVideo, setIsProcessingNewVideo] = useState(false);

  const timerRef = useRef<any>(null);

  useEffect(() => {
    presentationService.getInsightAnalysis().then(setAnalysis);
  }, []);

  // Playback timer
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentTime(prev => {
          if (!analysis) return prev;
          if (prev >= analysis.durationSeconds) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, analysis]);

  const handleSeek = (seconds: number) => {
    setCurrentTime(seconds);
  };

  const handleSimulateUpload = () => {
    setIsProcessingNewVideo(true);
    setTimeout(() => {
      setIsProcessingNewVideo(false);
      alert('Video ingested successfully! Multi-modal Whisper speech-to-text, gaze heatmap, and rubric grading complete.');
    }, 1800);
  };

  if (!analysis) {
    return (
      <div className="p-12 text-center text-gray-500">
        <Sparkles size={24} className="mx-auto animate-spin text-cu-gold mb-2" />
        <p className="text-xs font-semibold">Loading Insight Presenter Multi-Modal Intelligence Engine...</p>
      </div>
    );
  }

  // Active transcript line based on currentTime
  const activeTranscriptIndex = analysis.fullTranscript.reduce((acc, curr, idx) => {
    if (currentTime >= curr.time) return idx;
    return acc;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Session Title & Metadata */}
      <div className="bg-white rounded-xl border border-cu-border p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-900 border border-purple-200 uppercase tracking-wide">
              Insight Presenter v2.0
            </span>
            <span className="text-xs text-gray-400 font-mono">Session ID: {analysis.sessionId}</span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-cu-navy mt-1">
            {analysis.presentationTitle}
          </h3>
          <p className="text-xs text-gray-500">
            Candidate: <strong>{analysis.candidateName}</strong> ({analysis.candidateRoll}) &bull; Duration: {fmtTime(analysis.durationSeconds)}
          </p>
        </div>

        {/* Quick KPI Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-center min-w-[90px]">
            <div className="text-[10px] uppercase font-bold text-gray-400">Score</div>
            <div className="text-lg font-extrabold font-mono text-cu-navy">{analysis.overallScore}%</div>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-center min-w-[90px]">
            <div className="text-[10px] uppercase font-bold text-gray-400">Pacing</div>
            <div className="text-lg font-extrabold font-mono text-emerald-600">{analysis.pacingWpm} <span className="text-[10px] font-normal text-gray-500">WPM</span></div>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-center min-w-[90px]">
            <div className="text-[10px] uppercase font-bold text-gray-400">Eye Contact</div>
            <div className="text-lg font-extrabold font-mono text-emerald-600">{analysis.eyeContactScore}%</div>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-center min-w-[90px]">
            <div className="text-[10px] uppercase font-bold text-gray-400">Fillers</div>
            <div className="text-lg font-extrabold font-mono text-rose-600">{analysis.totalFillers}</div>
          </div>
        </div>
      </div>

      {/* Main Studio Layout: Video Stage (Left) & Multimodal Intelligence (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Video Stage & Interactive Heatmaps */}
        <div className="lg:col-span-7 space-y-4">
          {/* Simulated Video Player */}
          <div className="relative aspect-video bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-xl flex flex-col justify-between group">
            {/* Visual Canvas / Simulated Video Feed */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-cu-navy/80 flex items-center justify-center">
              {/* Virtual Presenter Slide Projection */}
              <div className="w-[85%] h-[80%] bg-white/95 rounded-xl p-6 shadow-2xl flex flex-col justify-between border border-white/20 transform transition group-hover:scale-101">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cu-gold" />
                    <span className="font-mono text-xs font-bold text-cu-navy">Chanakya University Capstone Defense</span>
                  </div>
                  <span className="text-[10px] font-bold text-gray-400">Slide {Math.min(7, Math.floor(currentTime / 25) + 1)} / 7</span>
                </div>

                <div className="space-y-3 py-2">
                  <h4 className="font-bold text-base text-gray-900 leading-tight">
                    {currentTime < 40 
                      ? '1. Problem Statement: Mitigating Cascading Failures in Campus Portals' 
                      : currentTime < 80 
                      ? '2. Decoupled Resilience: Circuit Breaker Architecture' 
                      : currentTime < 120 
                      ? '3. Cryptographic Attendance: 5s Rotating HMAC Nonces' 
                      : currentTime < 155 
                      ? '4. Performance Benchmarks: 400% p99 Latency Optimization' 
                      : '5. Conclusions & Production Readiness Audit'}
                  </h4>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {analysis.fullTranscript[activeTranscriptIndex]?.text || 'Simulated real-time slide audio sync...'}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-[10px] text-gray-400">
                  <span>Candidate: Arjun Kumar (24MCA003)</span>
                  <span>Supervisor: Deepak B</span>
                </div>
              </div>

              {/* Picture-in-Picture Webcam Gaze Tracker (Top Right) */}
              <div className="absolute top-4 right-4 w-32 h-24 bg-black/80 rounded-xl border border-cu-gold/60 shadow-lg overflow-hidden flex flex-col justify-between p-2 backdrop-blur-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-1 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    GAZE: 88%
                  </span>
                  <span className="text-[8px] font-mono text-gray-300">30 FPS</span>
                </div>
                <div className="w-full flex items-center justify-center py-1">
                  <div className="w-8 h-8 rounded-full border border-dashed border-emerald-400 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-cu-gold" />
                  </div>
                </div>
                <span className="text-[8px] text-center text-gray-400 font-mono">Lens Focus Lock</span>
              </div>
            </div>

            {/* Video Overlay Controls */}
            <div className="relative z-20 p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col gap-2 mt-auto">
              {/* Progress Scrub Bar */}
              <div 
                className="w-full h-1.5 bg-white/20 hover:h-2.5 rounded-full overflow-hidden cursor-pointer transition-all"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const frac = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                  handleSeek(Math.round(frac * analysis.durationSeconds));
                }}
              >
                <div 
                  style={{ width: `${(currentTime / analysis.durationSeconds) * 100}%` }}
                  className="h-full bg-cu-gold transition-all"
                />
              </div>

              <div className="flex items-center justify-between text-white text-xs">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-1.5 hover:bg-white/20 rounded-lg transition"
                    title={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                  </button>

                  <button
                    onClick={() => handleSeek(0)}
                    className="p-1.5 hover:bg-white/20 rounded-lg transition"
                    title="Restart"
                  >
                    <RotateCcw size={16} />
                  </button>

                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-1.5 hover:bg-white/20 rounded-lg transition"
                  >
                    {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  </button>

                  <span className="font-mono text-xs text-gray-300">
                    {fmtTime(currentTime)} / {fmtTime(analysis.durationSeconds)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-emerald-400">
                    Pacing: {analysis.pacingWpm} WPM
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Heatmap Strip Component */}
          <div className="bg-white rounded-xl border border-cu-border p-4 shadow-sm">
            <HeatmapStrip
              segments={analysis.eyeContactSegments}
              duration={analysis.durationSeconds}
              currentTime={currentTime}
              onSeek={handleSeek}
            />
          </div>

          {/* Filler Timeline Component */}
          <div className="bg-white rounded-xl border border-cu-border p-4 shadow-sm">
            <FillerTimeline
              fillers={analysis.fillerOccurrences}
              duration={analysis.durationSeconds}
              currentTime={currentTime}
              onSeek={handleSeek}
            />
          </div>
        </div>

        {/* Right Column: Tabbed Multimodal Intelligence Deck */}
        <div className="lg:col-span-5 space-y-4">
          {/* Sub-Tabs Selector */}
          <div className="flex bg-gray-100 p-1 rounded-xl text-xs font-bold gap-1">
            <button
              onClick={() => setActiveRightTab('coaching')}
              className={`flex-1 py-2 rounded-lg transition text-center flex items-center justify-center gap-1.5 ${
                activeRightTab === 'coaching' ? 'bg-white text-cu-navy shadow-xs' : 'text-gray-600 hover:text-cu-navy'
              }`}
            >
              <Sparkles size={13} className="text-cu-gold" />
              AI Coaching
            </button>
            <button
              onClick={() => setActiveRightTab('rubric')}
              className={`flex-1 py-2 rounded-lg transition text-center flex items-center justify-center gap-1.5 ${
                activeRightTab === 'rubric' ? 'bg-white text-cu-navy shadow-xs' : 'text-gray-600 hover:text-cu-navy'
              }`}
            >
              <Award size={13} />
              Rubric ({analysis.overallScore}%)
            </button>
            <button
              onClick={() => setActiveRightTab('transcript')}
              className={`flex-1 py-2 rounded-lg transition text-center flex items-center justify-center gap-1.5 ${
                activeRightTab === 'transcript' ? 'bg-white text-cu-navy shadow-xs' : 'text-gray-600 hover:text-cu-navy'
              }`}
            >
              <FileText size={13} />
              Transcript
            </button>
            <button
              onClick={() => setActiveRightTab('upload')}
              className={`flex-1 py-2 rounded-lg transition text-center flex items-center justify-center gap-1.5 ${
                activeRightTab === 'upload' ? 'bg-white text-cu-navy shadow-xs' : 'text-gray-600 hover:text-cu-navy'
              }`}
            >
              <Upload size={13} />
              Analyze Video
            </button>
          </div>

          {/* TAB 1: AI COACHING PANEL */}
          {activeRightTab === 'coaching' && (
            <div className="bg-white rounded-xl border border-cu-border p-4 shadow-sm max-h-[640px] overflow-y-auto">
              <CoachingPanel
                tips={analysis.coachingTips}
                executiveSummary={analysis.executiveSummary}
                onSeek={handleSeek}
                currentTime={currentTime}
              />
            </div>
          )}

          {/* TAB 2: RUBRIC SCORECARD */}
          {activeRightTab === 'rubric' && (
            <div className="bg-white rounded-xl border border-cu-border p-4 shadow-sm max-h-[640px] overflow-y-auto">
              <ContentScorecard
                criteria={analysis.rubricCriteria}
                overallScore={analysis.overallScore}
              />
            </div>
          )}

          {/* TAB 3: TIMESTAMPED SYNCHRONIZED TRANSCRIPT */}
          {activeRightTab === 'transcript' && (
            <div className="bg-white rounded-xl border border-cu-border p-4 shadow-sm space-y-3 max-h-[640px] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <span className="font-bold text-xs text-cu-navy">Whisper Speech Transcript</span>
                <span className="text-[10px] text-gray-400">Click any paragraph to jump video</span>
              </div>

              <div className="space-y-2.5">
                {analysis.fullTranscript.map((line, idx) => {
                  const isActive = activeTranscriptIndex === idx;
                  return (
                    <div
                      key={idx}
                      onClick={() => handleSeek(line.time)}
                      className={`p-3 rounded-lg border text-xs cursor-pointer transition ${
                        isActive 
                          ? 'bg-cu-pill border-cu-navy text-cu-navy shadow-xs font-semibold' 
                          : 'bg-gray-50/70 border-gray-100 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-[11px] text-gray-900">{line.speaker}</span>
                        <span className="font-mono text-[10px] font-bold text-cu-gold bg-white px-1.5 py-0.5 rounded border border-gray-200">
                          {fmtTime(line.time)}
                        </span>
                      </div>
                      <p className="leading-relaxed text-xs">
                        &quot;{line.text}&quot;
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: UPLOAD & RUN NEW ANALYSIS */}
          {activeRightTab === 'upload' && (
            <div className="bg-white rounded-xl border border-cu-border p-6 shadow-sm space-y-4">
              <div className="border-b border-gray-100 pb-3">
                <h4 className="font-bold text-sm text-cu-navy flex items-center gap-2">
                  <Upload size={16} className="text-cu-gold" />
                  Ingest Video for Multi-Modal AI Evaluation
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  Processes MP4/WebM presentations with Whisper speech-to-text, gaze estimation, filler detection, and rubric grading.
                </p>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center space-y-3 hover:border-cu-gold transition bg-slate-50/50">
                <Video size={36} className="mx-auto text-gray-400" />
                <div>
                  <p className="text-xs font-bold text-gray-700">Drag &amp; drop candidate presentation video</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">MP4, WebM or MOV up to 500MB</p>
                </div>
                <button
                  type="button"
                  onClick={handleSimulateUpload}
                  disabled={isProcessingNewVideo}
                  className="px-4 py-2 bg-cu-navy hover:bg-cu-navy/90 text-white rounded-lg text-xs font-bold shadow transition"
                >
                  {isProcessingNewVideo ? 'Analyzing Multimodal Streams...' : 'Browse Presentation File'}
                </button>
              </div>

              {isProcessingNewVideo && (
                <div className="p-3.5 bg-sky-50 border border-sky-200 rounded-lg space-y-2 text-xs text-sky-900 animate-pulse">
                  <div className="flex items-center gap-2 font-bold">
                    <Sparkles size={14} className="animate-spin text-sky-600" />
                    <span>Executing Pipeline Orchestrator...</span>
                  </div>
                  <p className="text-[11px] text-sky-700">
                    Running Whisper transcription &bull; Extracting eye gaze vectors &bull; Calculating WPM variance &bull; Scoring Rubric v2.4
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

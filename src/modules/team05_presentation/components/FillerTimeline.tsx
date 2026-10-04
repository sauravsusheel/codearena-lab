import React, { useMemo } from 'react';
import { FillerOccurrence } from '../types/presentation.types';

interface FillerTimelineProps {
  fillers: FillerOccurrence[];
  duration: number;
  currentTime: number;
  onSeek: (seconds: number) => void;
  className?: string;
}

const FILLER_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  um: { bg: 'bg-rose-100', text: 'text-rose-800', dot: 'bg-rose-500' },
  uh: { bg: 'bg-orange-100', text: 'text-orange-800', dot: 'bg-orange-500' },
  like: { bg: 'bg-amber-100', text: 'text-amber-800', dot: 'bg-amber-500' },
  'you know': { bg: 'bg-sky-100', text: 'text-sky-800', dot: 'bg-sky-500' },
  actually: { bg: 'bg-purple-100', text: 'text-purple-800', dot: 'bg-purple-500' },
  basically: { bg: 'bg-teal-100', text: 'text-teal-800', dot: 'bg-teal-500' },
  so: { bg: 'bg-indigo-100', text: 'text-indigo-800', dot: 'bg-indigo-500' }
};

const DEFAULT_COLOR = { bg: 'bg-gray-100', text: 'text-gray-800', dot: 'bg-gray-500' };

function fmtTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export const FillerTimeline: React.FC<FillerTimelineProps> = ({
  fillers,
  duration,
  currentTime,
  onSeek,
  className = ''
}) => {
  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const f of fillers) {
      const key = f.word.toLowerCase();
      map[key] = (map[key] || 0) + 1;
    }
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [fillers]);

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Header and Aggregate Frequency Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-700">Filler Words &amp; Verbal Crutches:</span>
          <span className="font-mono font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full text-[11px]">
            {fillers.length} Total Detected
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {counts.map(([word, count]) => {
            const conf = FILLER_COLORS[word] || DEFAULT_COLOR;
            return (
              <span
                key={word}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${conf.bg} ${conf.text} border border-black/5`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${conf.dot}`} />
                <span>&quot;{word}&quot;</span>
                <span className="opacity-80">({count})</span>
              </span>
            );
          })}
        </div>
      </div>

      {/* Visual Timeline Bar */}
      <div 
        className="relative h-6 w-full rounded-lg bg-slate-100 border border-slate-200 overflow-hidden cursor-pointer"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const fraction = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
          onSeek(Math.round(fraction * duration));
        }}
        title="Click anywhere to jump to timestamp"
      >
        {/* Playhead */}
        {duration > 0 && (
          <div
            style={{ left: `${(currentTime / duration) * 100}%` }}
            className="absolute top-0 bottom-0 w-0.5 bg-cu-navy z-10 pointer-events-none"
          />
        )}

        {/* Filler Word Points */}
        {fillers.map(f => {
          const leftPct = (f.time / duration) * 100;
          const conf = FILLER_COLORS[f.word.toLowerCase()] || DEFAULT_COLOR;
          const isNear = Math.abs(currentTime - f.time) < 4;

          return (
            <button
              key={f.id}
              onClick={(e) => {
                e.stopPropagation();
                onSeek(f.time);
              }}
              style={{ left: `${leftPct}%` }}
              title={`At ${fmtTime(f.time)}: "${f.word}" - ${f.contextSnippet}`}
              className={`absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 group z-20 focus:outline-none transition-all ${
                isNear ? 'scale-135' : 'hover:scale-125'
              }`}
            >
              <span className={`block w-2.5 h-2.5 rounded-full border border-white shadow-xs ${conf.dot} ${
                isNear ? 'ring-2 ring-cu-gold' : ''
              }`} />
            </button>
          );
        })}
      </div>

      {/* Interactive Quick-Jump Strip */}
      <div className="flex overflow-x-auto gap-1.5 pb-1 pt-0.5 text-[11px]">
        {fillers.map(f => {
          const conf = FILLER_COLORS[f.word.toLowerCase()] || DEFAULT_COLOR;
          const isCurrent = Math.abs(currentTime - f.time) < 3;
          return (
            <button
              key={f.id}
              onClick={() => onSeek(f.time)}
              className={`flex-shrink-0 inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-left transition ${
                isCurrent 
                  ? 'bg-cu-navy text-white border-cu-navy shadow-xs font-bold' 
                  : `${conf.bg} ${conf.text} border-black/5 hover:border-gray-400 font-medium`
              }`}
            >
              <span className="font-mono text-[10px] opacity-80">{fmtTime(f.time)}</span>
              <span>&quot;{f.word}&quot;</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

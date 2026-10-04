import React, { useRef } from 'react';
import { EyeContactSegment } from '../types/presentation.types';

interface HeatmapStripProps {
  segments: EyeContactSegment[];
  duration: number;
  currentTime: number;
  onSeek: (seconds: number) => void;
  className?: string;
}

function scoreToColor(score: number): string {
  // 0 -> Red, 0.5 -> Amber, 1.0 -> Emerald
  const s = Math.max(0, Math.min(1, score));
  if (s < 0.5) {
    const t = s / 0.5;
    const r = Math.round(239 + (245 - 239) * t);
    const g = Math.round(68 + (158 - 68) * t);
    const b = Math.round(68 + (11 - 68) * t);
    return `rgb(${r}, ${g}, ${b})`;
  }
  const t = (s - 0.5) / 0.5;
  const r = Math.round(245 + (16 - 245) * t);
  const g = Math.round(158 + (185 - 158) * t);
  const b = Math.round(11 + (129 - 11) * t);
  return `rgb(${r}, ${g}, ${b})`;
}

function fmtTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export const HeatmapStrip: React.FC<HeatmapStripProps> = ({
  segments,
  duration,
  currentTime,
  onSeek,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || duration <= 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const fraction = Math.max(0, Math.min(1, clickX / rect.width));
    onSeek(Math.round(fraction * duration));
  };

  const currentSegment = segments.find(seg => currentTime >= seg.start && currentTime <= seg.end);
  const currentContactScore = currentSegment ? Math.round(currentSegment.score * 100) : 75;

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between text-[11px]">
        <span className="font-semibold text-gray-700 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          Eye Contact &amp; Gaze Focus Heatmap
        </span>
        <div className="flex items-center gap-3 text-[10px] text-gray-500 font-mono">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2 rounded-xs bg-emerald-500" /> Sustained (&gt;75%)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2 rounded-xs bg-amber-500" /> Wandering (50-75%)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2 rounded-xs bg-rose-500" /> Off-Camera (&lt;50%)
          </span>
          <span className="font-bold text-gray-800 ml-1">
            Current: <span className={currentContactScore >= 75 ? 'text-emerald-600' : currentContactScore >= 50 ? 'text-amber-600' : 'text-rose-600'}>{currentContactScore}%</span>
          </span>
        </div>
      </div>

      <div
        ref={containerRef}
        onClick={handleClick}
        className="relative h-7 w-full rounded-lg overflow-hidden cursor-pointer bg-gray-100 border border-gray-200 select-none shadow-inner"
        title="Click to seek in presentation"
      >
        {/* Color Segments */}
        {segments.map((seg, idx) => {
          const leftPct = (seg.start / duration) * 100;
          const widthPct = ((seg.end - seg.start) / duration) * 100;
          return (
            <div
              key={idx}
              style={{
                left: `${leftPct}%`,
                width: `${widthPct}%`,
                backgroundColor: scoreToColor(seg.score)
              }}
              className="absolute top-0 bottom-0 transition-opacity hover:opacity-85"
            />
          );
        })}

        {/* Current Playhead Scrubber */}
        {duration > 0 && (
          <div
            style={{ left: `${(currentTime / duration) * 100}%` }}
            className="absolute top-0 bottom-0 w-1 bg-cu-navy shadow-md z-10 pointer-events-none transform -translate-x-1/2"
          >
            <div className="w-2.5 h-2.5 bg-cu-gold border border-white rounded-full -ml-0.75 -mt-0.5 shadow-sm" />
          </div>
        )}
      </div>

      <div className="flex justify-between text-[10px] text-gray-400 font-mono">
        <span>0:00</span>
        <span>Seek: {fmtTime(currentTime)}</span>
        <span>{fmtTime(duration)}</span>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { ShieldAlert, GitCompare, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';
import { judgeService } from '../services/judgeService';
import { PlagiarismComparison } from '../types/codearena.types';

interface PlagiarismAuditViewProps {
  audits: PlagiarismComparison[];
  onAuditsUpdated: (audits: PlagiarismComparison[]) => void;
}

export const PlagiarismAuditView: React.FC<PlagiarismAuditViewProps> = ({ audits, onAuditsUpdated }) => {
  const [running, setRunning] = useState(false);
  const runAudit = async () => { setRunning(true); try { const result = await judgeService.auditPlagiarism(); onAuditsUpdated(result); } finally { setRunning(false); } }; 
  return (
    <div className="bg-white rounded-xl border border-cu-border p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
        <div>
          <h3 className="text-base font-bold text-cu-navy flex items-center gap-2">
            <GitCompare size={18} className="text-cu-navy" />
            Structural Token &amp; Code Plagiarism Audit
          </h3>
          <p className="text-xs text-gray-500">
            Identifies copied control-flow structures and normalized code fingerprints using a persistent Winnowing-based comparison engine.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={runAudit} disabled={running} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cu-navy text-white text-xs font-bold disabled:opacity-50">
            <RefreshCw size={12} className={running ? 'animate-spin' : ''} /> Run Persistent Audit
          </button>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200">Normalized Token / Winnowing Engine</span>
        </div>
      </div>

      <div className="space-y-4">
        {audits.length === 0 && <div className="p-6 rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-500">No persistent comparisons yet. Run an audit after student submissions are stored.</div>}
        {audits.map((item, i) => (
          <div
            key={i}
            className={`p-4 rounded-xl border space-y-3 ${
              item.structuralSimilarityPercentage > 80
                ? 'bg-rose-50/50 border-rose-200'
                : 'bg-emerald-50/50 border-emerald-200'
            }`}
          >
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <span>{item.studentA}</span>
                <span className="text-gray-400">vs</span>
                <span>{item.studentB}</span>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 ${
                    item.structuralSimilarityPercentage > 80
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {item.structuralSimilarityPercentage > 80 ? <AlertTriangle size={12} /> : <CheckCircle2 size={12} />}
                  {item.structuralSimilarityPercentage}% Structural Similarity
                </span>
                <span className="text-[11px] text-gray-500 font-mono">
                  {item.winnowingHashMatchCount} Hash Collisions
                </span>
              </div>
            </div>

            {item.flaggedLogicClones.length > 0 && (
              <div className="bg-white/80 p-3 rounded-lg border border-rose-200 text-xs space-y-1">
                <div className="font-semibold text-rose-800">Flagged Logic Structures:</div>
                <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-rose-700">
                  {item.flaggedLogicClones.map((c, idx) => (
                    <li key={idx}>{c}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

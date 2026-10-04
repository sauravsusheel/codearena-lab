import React from 'react';
import { GitCompare, FileCode, Plus, Minus } from 'lucide-react';
import { CodeDiffFile } from '../types/unihub.types';

interface VisualDiffViewerProps {
  diffs: CodeDiffFile[];
}

export const VisualDiffViewer: React.FC<VisualDiffViewerProps> = ({ diffs }) => {
  return (
    <div className="bg-white rounded-xl border border-cu-border p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
        <div>
          <h3 className="text-base font-bold text-cu-navy flex items-center gap-2">
            <GitCompare size={18} className="text-cu-navy" />
            Visual Git Code Diff &amp; Pull Request Inspector
          </h3>
          <p className="text-xs text-gray-500">
            Side-by-side syntactic diff viewer for campus open-source projects and code reviews.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {diffs.map((diff, i) => (
          <div key={i} className="border border-slate-700 rounded-xl overflow-hidden shadow-lg bg-slate-900 text-slate-200">
            <div className="bg-slate-800 px-4 py-2 flex justify-between items-center text-xs font-mono border-b border-slate-700">
              <span className="flex items-center gap-2 text-amber-300">
                <FileCode size={14} />
                {diff.filename}
              </span>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="text-emerald-400 flex items-center gap-0.5"><Plus size={12} /> {diff.additions}</span>
                <span className="text-rose-400 flex items-center gap-0.5"><Minus size={12} /> {diff.deletions}</span>
              </div>
            </div>

            <div className="p-4 font-mono text-xs overflow-x-auto space-y-1">
              {diff.diffLines.map((line, idx) => (
                <div
                  key={idx}
                  className={`px-2 py-0.5 rounded leading-relaxed ${
                    line.type === 'add'
                      ? 'bg-emerald-950/80 text-emerald-300'
                      : line.type === 'del'
                      ? 'bg-rose-950/80 text-rose-300'
                      : 'text-slate-400'
                  }`}
                >
                  {line.text}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

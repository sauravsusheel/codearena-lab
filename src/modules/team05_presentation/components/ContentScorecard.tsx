import React from 'react';
import { Award, CheckCircle2, TrendingUp, AlertTriangle } from 'lucide-react';
import { RubricCriterion } from '../types/presentation.types';

interface ContentScorecardProps {
  criteria: RubricCriterion[];
  overallScore: number;
}

export const ContentScorecard: React.FC<ContentScorecardProps> = ({ criteria, overallScore }) => {
  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Exemplary': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Proficient': return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'Developing': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Inadequate': return 'bg-rose-100 text-rose-800 border-rose-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-4">
      {/* Aggregate Score Header */}
      <div className="bg-slate-900 text-white p-5 rounded-xl flex items-center justify-between shadow-md">
        <div>
          <span className="text-xs uppercase tracking-wider text-cu-gold font-bold flex items-center gap-1.5">
            <Award size={15} />
            Institutional Rubric Score
          </span>
          <h3 className="text-xl font-bold mt-1 text-white">Capstone &amp; Viva Assessment Dossier</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Evaluated by Insight Presenter Multimodal AI against Chanakya University Rubric v2.4
          </p>
        </div>

        <div className="text-right">
          <div className="text-3xl font-mono font-extrabold text-white">
            {overallScore}<span className="text-sm font-normal text-gray-400">/100</span>
          </div>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            {overallScore >= 85 ? 'Grade: A+ (Honors)' : overallScore >= 75 ? 'Grade: A (Distinction)' : 'Grade: B+'}
          </span>
        </div>
      </div>

      {/* Rubric Criteria Cards */}
      <div className="space-y-3">
        {criteria.map((c) => (
          <div key={c.id} className="bg-white border border-cu-border p-4 rounded-xl shadow-xs space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-cu-navy">{c.name}</h4>
                <span className="text-[10px] text-gray-400 font-medium">({c.weightPct}% Weight)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getTierColor(c.rubricTier)}`}>
                  {c.rubricTier}
                </span>
                <span className="font-mono font-bold text-xs text-cu-navy">{c.score}%</span>
              </div>
            </div>

            {/* Score Progress Bar */}
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
              <div
                style={{ width: `${c.score}%` }}
                className={`h-full transition-all duration-500 ${
                  c.score >= 80 ? 'bg-emerald-500' : c.score >= 65 ? 'bg-sky-500' : 'bg-amber-500'
                }`}
              />
            </div>

            {/* Qualitative Feedback */}
            <p className="text-xs text-gray-600 leading-relaxed bg-gray-50/70 p-2.5 rounded-lg border border-gray-100">
              {c.feedback}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

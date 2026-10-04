import React from 'react';
import { HelpCircle, Sparkles, BookOpen, CheckCircle2 } from 'lucide-react';
import { VivaQuestion } from '../types/presentation.types';

interface VivaQuestionGeneratorProps {
  questions: VivaQuestion[];
}

export const VivaQuestionGenerator: React.FC<VivaQuestionGeneratorProps> = ({ questions }) => {
  return (
    <div className="bg-white rounded-xl border border-cu-border p-6 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
        <div>
          <h3 className="text-base font-bold text-cu-navy flex items-center gap-2">
            <Sparkles size={18} className="text-amber-500" />
            AI-Assisted Viva Voce Question Generator
          </h3>
          <p className="text-xs text-gray-500">
            Dynamically generates probing, syllabus-grounded technical questions from the live presentation transcript.
          </p>
        </div>
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
          Evaluator Recommendation Engine
        </span>
      </div>

      <div className="space-y-4">
        {questions.map((q) => (
          <div key={q.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 text-xs">
            <div className="flex justify-between items-start">
              <span className="font-bold text-sm text-slate-800 leading-snug">{q.question}</span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  q.difficulty === 'ADVANCED'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {q.difficulty}
              </span>
            </div>

            <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-gray-600 font-mono text-[11px]">
              <span className="text-gray-400 font-sans font-semibold">Transcript Trigger: </span>
              {q.sourceTranscriptSnippet}
            </div>

            <div className="space-y-1">
              <span className="font-semibold text-gray-700">Key Criteria Evaluator Should Expect:</span>
              <ul className="list-disc pl-4 space-y-0.5 text-gray-600">
                {q.suggestedAnswerPoints.map((pt, idx) => (
                  <li key={idx}>{pt}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

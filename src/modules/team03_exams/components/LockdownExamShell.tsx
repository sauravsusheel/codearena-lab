import React, { useState, useEffect } from 'react';
import { Lock, Eye, AlertTriangle, ShieldCheck, CheckCircle2, Clock, Terminal } from 'lucide-react';
import { ExamQuestion } from '../types/exams.types';

interface LockdownExamShellProps {
  questions: ExamQuestion[];
  onFinish: () => void;
}

export const LockdownExamShell: React.FC<LockdownExamShellProps> = ({ questions, onFinish }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [warnings, setWarnings] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(5400); // 90 mins
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSimulateTabSwitch = () => {
    setWarnings(prev => {
      const next = prev + 1;
      if (next >= 3) {
        setIsLocked(true);
      }
      return next;
    });
  };

  const q = questions[currentIdx] || {
    id: 'q_demo',
    type: 'MCQ',
    prompt: 'Sample Question',
    marks: 5,
    bloomLevel: 'UNDERSTAND',
    options: ['Option A', 'Option B', 'Option C', 'Option D']
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-2xl border border-cu-border shadow-xl overflow-hidden space-y-0">
      {/* Lockdown Title Bar */}
      <div className="bg-[#002561] text-white p-4 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-400 text-[#002561] rounded-lg shadow">
            <Lock size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold bg-white/20 px-2 py-0.5 rounded text-amber-200">
                LOCKDOWN MODE ACTIVE
              </span>
              <span className="text-xs text-gray-300">Fullscreen Interceptor &amp; DevTools Blocked</span>
            </div>
            <h3 className="text-base font-bold font-serif text-white">
              PRG301 — Enterprise Cloud Systems Examination
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-lg border border-white/10 text-xs">
            <Clock size={16} className="text-amber-400" />
            <span className="font-mono font-bold text-amber-300 text-sm">
              {formatTime(secondsRemaining)}
            </span>
          </div>

          <div className="flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-lg border border-white/10 text-xs">
            <Eye size={16} className="text-emerald-400" />
            <span>AI Proctoring: OK</span>
          </div>

          {warnings > 0 && (
            <div className="flex items-center gap-1.5 bg-rose-600/80 px-2.5 py-1 rounded text-xs text-white animate-pulse">
              <AlertTriangle size={14} />
              <span>Warnings: {warnings} / 3</span>
            </div>
          )}
        </div>
      </div>

      {isLocked ? (
        <div className="p-12 text-center space-y-4">
          <AlertTriangle size={56} className="mx-auto text-rose-600 animate-bounce" />
          <h3 className="text-xl font-bold text-rose-800">Exam Terminated Due to Integrity Violations</h3>
          <p className="text-xs text-gray-600 max-w-md mx-auto">
            Maximum permissible browser tab switches exceeded (3 violations recorded). Session snapshot submitted to examiner.
          </p>
          <button
            onClick={() => { setIsLocked(false); setWarnings(0); }}
            className="px-4 py-2 bg-[#002561] text-white rounded-lg text-xs font-semibold"
          >
            Reset Simulator
          </button>
        </div>
      ) : (
        <div className="p-6 space-y-6">
          {/* Question Nav & Header */}
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <div className="text-xs font-semibold text-gray-500">
              Question <strong className="text-cu-navy text-sm">{currentIdx + 1}</strong> of {questions.length}
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 text-[11px] font-semibold">
                Bloom Level: {q.bloomLevel}
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-900 text-[11px] font-bold">
                {q.marks} Marks
              </span>
            </div>
          </div>

          {/* Question Prompt */}
          <div className="space-y-3">
            <div className="text-sm font-semibold text-gray-900 leading-relaxed">
              {q.prompt}
            </div>

            {q.formulaLatex && (
              <div className="p-4 bg-slate-900 text-amber-300 font-mono text-sm rounded-xl border border-slate-800 shadow-inner">
                {q.formulaLatex}
              </div>
            )}
          </div>

          {/* Options / Essay Input */}
          {q.type === 'MCQ' && q.options && (
            <div className="space-y-2 pt-2">
              {q.options.map((opt, i) => (
                <label
                  key={i}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-xs cursor-pointer transition ${
                    answers[q.id] === opt
                      ? 'border-[#002561] bg-blue-50/60 font-semibold text-cu-navy'
                      : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <input
                    type="radio"
                    name={`q_${q.id}`}
                    value={opt}
                    checked={answers[q.id] === opt}
                    onChange={() => setAnswers(prev => ({ ...prev, [q.id]: opt }))}
                    className="accent-[#002561]"
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          )}

          {q.type === 'SUBJECTIVE_ESSAY' && (
            <div className="pt-2">
              <textarea
                rows={5}
                placeholder="Type your technical response with architectural justification..."
                value={answers[q.id] || ''}
                onChange={(e) => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                className="w-full border border-gray-300 rounded-xl p-3 text-xs focus:outline-none focus:border-cu-navy font-mono"
              />
            </div>
          )}

          {/* Bottom Actions */}
          <div className="flex flex-wrap justify-between items-center gap-3 pt-4 border-t border-gray-100">
            <button
              onClick={handleSimulateTabSwitch}
              className="text-[11px] text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg border border-rose-200 transition font-medium"
            >
              Simulate Tab Switch (Test Anti-Cheat)
            </button>

            <div className="flex gap-2">
              <button
                disabled={currentIdx === 0}
                onClick={() => setCurrentIdx(prev => prev - 1)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40"
              >
                Previous
              </button>
              {currentIdx < questions.length - 1 ? (
                <button
                  onClick={() => setCurrentIdx(prev => prev + 1)}
                  className="px-4 py-2 bg-[#002561] hover:bg-[#0E1B38] text-white rounded-lg text-xs font-semibold transition"
                >
                  Save &amp; Next
                </button>
              ) : (
                <button
                  onClick={onFinish}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition shadow"
                >
                  Submit Final Paper
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

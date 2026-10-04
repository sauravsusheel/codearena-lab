import React, { useState } from 'react';
import { BookOpen, ShieldCheck, AlertCircle, Play, CheckCircle2, Eye, Lock } from 'lucide-react';

export const ExamsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'papers' | 'proctoring'>('papers');

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cu-border pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cu-pill text-cu-navy text-xs font-semibold mb-1">
            <BookOpen size={13} />
            <span>ExamShield Module 03</span>
          </div>
          <h2 className="text-2xl font-bold text-cu-navy">AI-Powered Secure Examination System</h2>
          <p className="text-xs sm:text-sm text-gray-500">
            Proctored online examinations, gVisor coding tests, Bloom taxonomy question banks, and Gemini AI auto-evaluation.
          </p>
        </div>

        <div className="flex bg-gray-100 p-1 rounded-lg text-xs font-semibold">
          <button 
            onClick={() => setActiveTab('papers')}
            className={`px-3 py-1.5 rounded-md transition ${activeTab === 'papers' ? 'bg-white text-cu-navy shadow-sm' : 'text-gray-600'}`}
          >
            Exam Papers
          </button>
          <button 
            onClick={() => setActiveTab('proctoring')}
            className={`px-3 py-1.5 rounded-md transition ${activeTab === 'proctoring' ? 'bg-white text-cu-navy shadow-sm' : 'text-gray-600'}`}
          >
            Live Proctoring Stream
          </button>
        </div>
      </div>

      {activeTab === 'papers' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-white rounded-xl border border-cu-border p-5 shadow-sm space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-cu-saffron uppercase">Upcoming Theory & Code Exam</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-800 text-[10px] font-bold">
                  SCHEDULED
                </span>
              </div>
              <h3 className="font-bold text-base text-cu-navy">PRG301 — Programming III Mid-Term</h3>
              <p className="text-xs text-gray-600">
                10 MCQ (Remember/Understand) + 3 Code challenges executed inside gVisor kernel sandbox.
              </p>
              <div className="pt-2 text-xs text-gray-500 flex justify-between">
                <span>Duration: 90 Mins</span>
                <span>Total Marks: 50</span>
                <span>Date: Sep 5, 2026</span>
              </div>
              <button className="w-full bg-cu-navy hover:bg-cu-navylight text-white font-semibold py-2 rounded-lg text-xs transition flex items-center justify-center gap-2">
                <ShieldCheck size={14} className="text-cu-gold" />
                <span>Configure Exam Paper & Rubrics</span>
              </button>
            </div>

            <div className="bg-white rounded-xl border border-cu-border p-5 shadow-sm space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-gray-400 uppercase">Past Examination</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                  EVALUATED
                </span>
              </div>
              <h3 className="font-bold text-base text-cu-navy">DSA201 — Data Structures & Algorithms</h3>
              <p className="text-xs text-gray-600">
                Completed by 58 MCA students. AI descriptive scoring reviewed with zero pending overrides.
              </p>
              <div className="pt-2 text-xs text-gray-500 flex justify-between">
                <span>Average: 78.4%</span>
                <span>Pass Rate: 96.5%</span>
                <span>Graded: Aug 18, 2026</span>
              </div>
              <button className="w-full bg-gray-50 hover:bg-gray-100 text-cu-navy font-semibold py-2 rounded-lg text-xs border border-cu-border transition">
                View Result Analytics
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'proctoring' && (
        <div className="bg-white rounded-xl border border-cu-border p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-cu-navy">Proctoring AI Anomaly Monitor</h3>
            <span className="text-xs text-green-600 font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span>BlazeFace AI Detection Active</span>
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="border border-gray-200 rounded-lg p-3 text-xs space-y-1">
              <div className="font-bold text-gray-800">24MCA001 (Aarav S)</div>
              <div className="text-green-600">Status: In Exam (Normal)</div>
              <div className="text-[10px] text-gray-400">Tab switches: 0 | Fullscreen: ON</div>
            </div>
            <div className="border border-amber-200 bg-amber-50/50 rounded-lg p-3 text-xs space-y-1">
              <div className="font-bold text-gray-800">24MCA018 (Rahul M)</div>
              <div className="text-amber-700 font-semibold">Flag: Tab switch detected (1x)</div>
              <div className="text-[10px] text-gray-400">Snapshot captured 2m ago</div>
            </div>
            <div className="border border-gray-200 rounded-lg p-3 text-xs space-y-1">
              <div className="font-bold text-gray-800">24MCA042 (Priya N)</div>
              <div className="text-green-600">Status: In Exam (Normal)</div>
              <div className="text-[10px] text-gray-400">Tab switches: 0 | Fullscreen: ON</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default ExamsView;

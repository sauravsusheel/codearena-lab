import React, { useState } from 'react';
import { BookOpen, Plus, CheckCircle2, Sliders, Layers } from 'lucide-react';
import { AssessmentItem } from '../types/exams.types';

interface AuthoringStudioProps {
  assessments: AssessmentItem[];
}

export const AuthoringStudio: React.FC<AuthoringStudioProps> = ({ assessments }) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h3 className="text-base font-bold text-cu-navy flex items-center gap-2">
            <BookOpen size={18} />
            Assessment Authoring &amp; Examination Schedule
          </h3>
          <p className="text-xs text-gray-500">
            Author randomized question banks, Bloom taxonomy tags, and KaTeX math formulas.
          </p>
        </div>
        <button
          onClick={() => alert('New Assessment Studio Draft initialized.')}
          className="inline-flex items-center gap-1.5 bg-[#002561] text-white px-3.5 py-2 rounded-lg text-xs font-semibold shadow hover:bg-[#0E1B38] transition"
        >
          <Plus size={14} />
          Create New Exam Paper
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {assessments.map((a) => (
          <div key={a.id} className="bg-white rounded-xl border border-cu-border p-5 shadow-sm space-y-3">
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold text-cu-saffron uppercase">
                {a.status === 'SCHEDULED' ? 'Upcoming Examination' : 'Past Assessment'}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  a.status === 'SCHEDULED'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {a.status}
              </span>
            </div>

            <h4 className="font-bold text-base text-cu-navy">{a.title}</h4>
            <p className="text-xs text-gray-600">
              Bloom taxonomy calibrated questions with randomized shuffler and anti-cheat web locks.
            </p>

            <div className="pt-2 text-xs text-gray-500 flex justify-between border-t border-gray-100">
              <span>Duration: {a.durationMinutes} Mins</span>
              <span>Total Marks: {a.totalMarks}</span>
              <span>Date: {a.scheduledDate}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

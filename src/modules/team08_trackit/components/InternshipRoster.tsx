import React from 'react';
import { Building, Award, CheckCircle2, FileText, Calendar } from 'lucide-react';
import { InternshipRecord } from '../types/trackit.types';

interface InternshipRosterProps {
  internships: InternshipRecord[];
}

export const InternshipRoster: React.FC<InternshipRosterProps> = ({ internships }) => {
  return (
    <div className="bg-white rounded-xl border border-cu-border p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
        <div>
          <h3 className="text-base font-bold text-cu-navy flex items-center gap-2">
            <Building size={18} className="text-cu-navy" />
            Corporate Internship Progression &amp; Industry Mentor Logbooks
          </h3>
          <p className="text-xs text-gray-500">
            Weekly industrial work log verification, stipend recording, and credit transfer approval.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {internships.map((rec) => (
          <div key={rec.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 text-xs">
            <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-cu-navy">{rec.studentName} ({rec.studentRoll})</h4>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    {rec.status}
                  </span>
                </div>
                <div className="text-gray-600 mt-1">
                  <strong>{rec.role}</strong> at <span className="text-slate-800 font-semibold">{rec.companyName}</span> ({rec.location})
                </div>
              </div>

              <div className="text-right">
                <div className="font-bold text-cu-navy text-sm">₹ {rec.stipendPerMonth.toLocaleString()} / mo</div>
                <div className="text-[10px] text-gray-400">Duration: {rec.durationMonths} Months</div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 flex flex-wrap justify-between items-center gap-2 text-[11px]">
              <span className="text-gray-600">
                Weekly Mentor Logs: <strong>{rec.weeklyLogsApproved} / {rec.totalRequiredLogs} Approved</strong>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => alert(`Reviewing mentor logbook for ${rec.studentName}`)}
                  className="px-3 py-1 bg-white border border-gray-300 rounded-md hover:bg-gray-50 font-semibold text-slate-700 transition"
                >
                  Inspect Weekly Logs
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

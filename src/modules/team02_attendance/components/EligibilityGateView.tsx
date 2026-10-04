import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';
import { CourseEligibility } from '../types/attendance.types';

interface EligibilityGateViewProps {
  eligibility: CourseEligibility[];
  onRequestCondonation: (courseCode: string, reason: string) => void;
}

export const EligibilityGateView: React.FC<EligibilityGateViewProps> = ({
  eligibility,
  onRequestCondonation
}) => {
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [medicalReason, setMedicalReason] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitCondonation = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCourse) {
      onRequestCondonation(selectedCourse, medicalReason);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setSelectedCourse(null);
        setMedicalReason('');
      }, 3000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-cu-border p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
          <div>
            <h3 className="text-base font-bold text-cu-navy flex items-center gap-2">
              <ShieldCheck size={18} className="text-cu-navy" />
              Statutory 75% Exam Hall Ticket Eligibility Gate
            </h3>
            <p className="text-xs text-gray-500">
              Students maintaining &gt;=75% attendance are automatically unlocked for end-semester examinations.
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
            University Ordinance: Reg 4.2
          </span>
        </div>

        {submitted && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600" />
            Medical condonation petition successfully forwarded to Academic Dean.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {eligibility.map((item) => (
            <div
              key={item.courseCode}
              className={`p-4 rounded-xl border transition ${
                item.thresholdMet
                  ? 'bg-emerald-50/50 border-emerald-200'
                  : 'bg-rose-50/50 border-rose-200'
              }`}
            >
              <div className="flex justify-between items-start">
                <span className="font-mono font-bold text-xs text-slate-800">{item.courseCode}</span>
                {item.thresholdMet ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    Eligible
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold flex items-center gap-1">
                    <AlertTriangle size={10} /> Shortage
                  </span>
                )}
              </div>

              <div className="text-xs font-semibold text-gray-800 mt-2 line-clamp-1">{item.courseName}</div>

              <div className="mt-3 flex items-baseline justify-between">
                <div className={`text-2xl font-bold ${item.thresholdMet ? 'text-emerald-700' : 'text-rose-600'}`}>
                  {item.percentage}%
                </div>
                <div className="text-[11px] text-gray-500">
                  {item.classesAttended} / {item.classesHeld} Attended
                </div>
              </div>

              <div className="w-full bg-gray-200 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className={`h-full rounded-full ${item.thresholdMet ? 'bg-emerald-500' : 'bg-rose-500'}`}
                  style={{ width: `${Math.min(item.percentage, 100)}%` }}
                />
              </div>

              <div className="mt-3 pt-3 border-t border-gray-200/60 flex items-center justify-between text-[11px]">
                <span className="text-gray-500">Hall Ticket:</span>
                {item.hallTicketStatus === 'UNLOCKED' ? (
                  <strong className="text-emerald-700 font-semibold">Unlocked</strong>
                ) : item.hallTicketStatus === 'PENDING_CONDONATION' ? (
                  <strong className="text-amber-600 font-semibold">Under Review</strong>
                ) : (
                  <button
                    onClick={() => setSelectedCourse(item.courseCode)}
                    className="text-rose-700 font-bold hover:underline"
                  >
                    Apply Condonation
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Condonation Form Modal if Shortage */}
      {selectedCourse && (
        <div className="bg-white rounded-xl border border-cu-border p-5 shadow-lg max-w-lg space-y-3">
          <h4 className="font-bold text-sm text-cu-navy flex items-center gap-2">
            <FileText size={16} />
            Medical Attendance Condonation Petition ({selectedCourse})
          </h4>
          <p className="text-xs text-gray-500">
            Attach recognized hospital admission documentation to condone up to 10% shortage (min 65% statutory limit).
          </p>
          <form onSubmit={handleSubmitCondonation} className="space-y-3 text-xs">
            <textarea
              rows={3}
              placeholder="State medical justification, hospital reference number, and admission dates..."
              value={medicalReason}
              onChange={(e) => setMedicalReason(e.target.value)}
              className="w-full border border-cu-border p-2 rounded-md focus:outline-none focus:border-cu-navy"
              required
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedCourse(null)}
                className="px-3 py-1.5 rounded-md text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-[#002561] text-white font-semibold rounded-md hover:bg-[#0E1B38]"
              >
                Forward to Dean
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

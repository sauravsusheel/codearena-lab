import React from 'react';
import { Eye, ShieldAlert, AlertTriangle, CheckCircle2, UserX } from 'lucide-react';
import { ProctoringViolation } from '../types/exams.types';

interface ProctoringTelemetryProps {
  violations: ProctoringViolation[];
}

export const ProctoringTelemetry: React.FC<ProctoringTelemetryProps> = ({ violations }) => {
  return (
    <div className="bg-white rounded-xl border border-cu-border p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
        <div>
          <h3 className="text-base font-bold text-cu-navy flex items-center gap-2">
            <Eye size={18} className="text-emerald-600" />
            AI Proctoring Telemetry &amp; Anomaly Aggregator
          </h3>
          <p className="text-xs text-gray-500">
            Real-time client-side face, gaze, tab-switching, and voice detection audit logs.
          </p>
        </div>
        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          BlazeFace + WebCam AI Active
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-100">
            <tr>
              <th className="p-3">Student Roll</th>
              <th className="p-3">Candidate Name</th>
              <th className="p-3">Flagged Telemetry Anomaly</th>
              <th className="p-3">Timestamp</th>
              <th className="p-3">AI Confidence</th>
              <th className="p-3">Integrity Rating</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {violations.map((v) => (
              <tr key={v.id} className="hover:bg-gray-50/50">
                <td className="p-3 font-mono font-bold text-cu-navy">{v.studentRoll}</td>
                <td className="p-3 font-semibold text-gray-800">{v.studentName}</td>
                <td className="p-3">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      v.anomalyType === 'MULTIPLE_FACES'
                        ? 'bg-rose-100 text-rose-800'
                        : v.anomalyType === 'TAB_SWITCH'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    <AlertTriangle size={11} />
                    {v.anomalyType}
                  </span>
                </td>
                <td className="p-3 font-mono text-gray-500">{v.timestamp}</td>
                <td className="p-3 text-gray-600">{(v.confidenceScore * 100).toFixed(1)}%</td>
                <td className="p-3 font-bold text-cu-navy">
                  <span className={v.integrityRating < 80 ? 'text-rose-600' : 'text-emerald-700'}>
                    {v.integrityRating} / 100
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

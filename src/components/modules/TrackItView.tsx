import React, { useState } from 'react';
import { FolderKanban, CheckCircle2, Clock, Calendar, FileText, Award, Building, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const TrackItView: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'projects' | 'internships'>('projects');

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cu-border pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cu-pill text-cu-navy text-xs font-semibold mb-1">
            <FolderKanban size={13} />
            <span>TrackIt Module 08</span>
          </div>
          <h2 className="text-2xl font-bold text-cu-navy">Project & Internship Track Management</h2>
          <p className="text-xs sm:text-sm text-gray-500">
            Lifecycle stages (Proposed to Completed), milestone reports, mentor logs, and internship grade computation.
          </p>
        </div>

        <div className="flex bg-gray-100 p-1 rounded-lg text-xs font-semibold">
          <button 
            onClick={() => setActiveTab('projects')}
            className={`px-3 py-1.5 rounded-md transition ${activeTab === 'projects' ? 'bg-white text-cu-navy shadow-sm' : 'text-gray-600'}`}
          >
            Academic Projects
          </button>
          <button 
            onClick={() => setActiveTab('internships')}
            className={`px-3 py-1.5 rounded-md transition ${activeTab === 'internships' ? 'bg-white text-cu-navy shadow-sm' : 'text-gray-600'}`}
          >
            Internship Tracker
          </button>
        </div>
      </div>

      {activeTab === 'projects' && (
        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-cu-border p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] bg-cu-pill text-cu-navy font-bold px-2 py-0.5 rounded uppercase">MCA Major Project</span>
                <h3 className="text-lg font-bold text-cu-navy mt-1">Autonomous Multi-Agent Healthcare Diagnostics Portal</h3>
                <p className="text-xs text-gray-500">Lead: Arjun Kumar (24MCA003) | Guide: Deepak B (Faculty Lead)</p>
              </div>
              <span className="text-xs bg-amber-100 text-amber-800 font-semibold px-2.5 py-1 rounded-full">
                Stage: In Progress
              </span>
            </div>

            {/* Milestones Checkpoints Pipeline */}
            <div className="pt-3 border-t border-gray-100">
              <h4 className="font-bold text-xs text-gray-700 mb-3">Milestone Progress Pipeline (8 Checkpoints)</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-2.5 rounded-lg border border-green-200 bg-green-50/50">
                  <div className="font-bold text-green-800">M1: Proposal Approval</div>
                  <div className="text-[10px] text-gray-500">Score: 9.5 / 10</div>
                </div>
                <div className="p-2.5 rounded-lg border border-green-200 bg-green-50/50">
                  <div className="font-bold text-green-800">M2: SRS & Architecture</div>
                  <div className="text-[10px] text-gray-500">Score: 9.0 / 10</div>
                </div>
                <div className="p-2.5 rounded-lg border border-amber-200 bg-amber-50/50">
                  <div className="font-bold text-amber-800">M3: Core Prototype</div>
                  <div className="text-[10px] text-amber-700">Due: Sep 15, 2026</div>
                </div>
                <div className="p-2.5 rounded-lg border border-gray-200 bg-gray-50">
                  <div className="font-bold text-gray-500">M4: Final Defense Viva</div>
                  <div className="text-[10px] text-gray-400">Scheduled: Oct 2026</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'internships' && (
        <div className="bg-white rounded-xl border border-cu-border p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-cu-navy">Student Corporate Internship Roster</h3>
          <div className="text-xs text-gray-600">
            Weekly log verification and evaluation forms submitted by industry mentors and faculty coordinator.
          </div>
          <div className="divide-y divide-gray-100 text-xs">
            <div className="py-3 flex justify-between items-center">
              <div>
                <strong className="text-cu-navy block">Arjun Kumar — Software Engineering Intern</strong>
                <span className="text-gray-500">Infosys Limited, Bengaluru • Stipend: ₹ 25,000/mo</span>
              </div>
              <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-[10px] font-bold">
                Offer Verified
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default TrackItView;

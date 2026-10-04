import React, { useState, useEffect } from 'react';
import { Users, FileText, Calendar, DollarSign, Layers, Activity } from 'lucide-react';
import { ModuleErrorBoundary } from '../../core/resilience/ModuleErrorBoundary';
import { FaultSimulatorButton } from '../../core/resilience/FaultSimulatorButton';
import { hrmsService } from './services/hrmsService';
import { FacultyDossier } from './components/FacultyDossier';
import { LeaveManagement } from './components/LeaveManagement';
import { PayrollView } from './components/PayrollView';
import { WorkloadAllocator } from './components/WorkloadAllocator';
import { AttendanceCalendarKPI } from './components/AttendanceCalendarKPI';
import { FacultyProfileData, LeaveRequest, PayslipItem, WorkloadItem } from './types/hrms.types';

const HrmsModuleContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'calendar' | 'leaves' | 'profile' | 'payroll' | 'workload'>('calendar');
  const [profile, setProfile] = useState<FacultyProfileData | null>(null);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [payslips, setPayslips] = useState<PayslipItem[]>([]);
  const [workload, setWorkload] = useState<WorkloadItem[]>([]);

  useEffect(() => {
    hrmsService.getProfile().then(setProfile);
    hrmsService.getLeaves().then(setLeaves);
    hrmsService.getPayslips().then(setPayslips);
    hrmsService.getWorkload().then(setWorkload);
  }, []);

  const handleApplyLeave = async (req: { type: string; start: string; end: string; days: number; reason: string }) => {
    const created = await hrmsService.submitLeave(req);
    setLeaves(prev => [created, ...prev]);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header & Resilience Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cu-border pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cu-pill text-cu-navy text-xs font-semibold">
              <Users size={13} />
              EduHRMS Module 01
            </span>
            <FaultSimulatorButton moduleName="EduHRMS (Team 01)" />
          </div>
          <h2 className="text-2xl font-bold text-cu-navy">Faculty &amp; Staff HRMS Portal</h2>
          <p className="text-xs sm:text-sm text-gray-500">
            Attendance calendar &amp; metrics, digital dossier, leave workflows, workload allocation, and payroll.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap bg-gray-100 p-1 rounded-lg text-xs font-semibold gap-1">
          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition ${activeTab === 'calendar' ? 'bg-white text-cu-navy shadow-sm' : 'text-gray-600 hover:text-cu-navy'}`}
          >
            <Calendar size={13} />
            Attendance &amp; KPIs
          </button>
          <button
            onClick={() => setActiveTab('leaves')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition ${activeTab === 'leaves' ? 'bg-white text-cu-navy shadow-sm' : 'text-gray-600 hover:text-cu-navy'}`}
          >
            <FileText size={13} />
            Leave Workflow
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition ${activeTab === 'profile' ? 'bg-white text-cu-navy shadow-sm' : 'text-gray-600 hover:text-cu-navy'}`}
          >
            <Users size={13} />
            Digital Dossier
          </button>
          <button
            onClick={() => setActiveTab('workload')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition ${activeTab === 'workload' ? 'bg-white text-cu-navy shadow-sm' : 'text-gray-600 hover:text-cu-navy'}`}
          >
            <Layers size={13} />
            Workload Allocation
          </button>
          <button
            onClick={() => setActiveTab('payroll')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition ${activeTab === 'payroll' ? 'bg-white text-cu-navy shadow-sm' : 'text-gray-600 hover:text-cu-navy'}`}
          >
            <DollarSign size={13} />
            Salary &amp; Payslips
          </button>
        </div>
      </div>

      {/* Tab Renderers */}
      {activeTab === 'calendar' && <AttendanceCalendarKPI />}
      {activeTab === 'leaves' && <LeaveManagement leaves={leaves} onSubmitLeave={handleApplyLeave} />}
      {activeTab === 'profile' && profile && <FacultyDossier profile={profile} />}
      {activeTab === 'workload' && <WorkloadAllocator workload={workload} />}
      {activeTab === 'payroll' && <PayrollView payslips={payslips} />}
    </div>
  );
};

export const HrmsModule: React.FC = () => {
  return (
    <ModuleErrorBoundary
      moduleId="hrms"
      moduleName="EduHRMS (Faculty & Staff Portal)"
      teamName="Team 01"
    >
      <HrmsModuleContent />
    </ModuleErrorBoundary>
  );
};

export default HrmsModule;

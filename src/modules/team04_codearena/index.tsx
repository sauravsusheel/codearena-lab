import React, { useState, useEffect } from 'react';
import { Code2, Trophy, GitCompare, Play, Monitor, Clock, ShieldCheck, Laptop, GraduationCap } from 'lucide-react';
import { ModuleErrorBoundary } from '../../core/resilience/ModuleErrorBoundary';
import { FaultSimulatorButton } from '../../core/resilience/FaultSimulatorButton';
import { judgeService } from './services/judgeService';
import { MonacoWebIDE } from './components/MonacoWebIDE';
import { PlagiarismAuditView } from './components/PlagiarismAuditView';
import { FacultyStationAnalytics } from './components/FacultyStationAnalytics';
import { LabWorkstationInventory } from './components/LabWorkstationInventory';
import { PlagiarismComparison, SupportedLanguage, TestCaseResult } from './types/codearena.types';
import { CodeArenaOperationsDashboard } from './components/CodeArenaOperationsDashboard';
import { LMSCourseDashboard } from './components/LMSCourseDashboard';
import { useAuth } from '../../context/AuthContext';

const CodeArenaModuleContent: React.FC = () => {
  const { user } = useAuth();
  const isFacultyOrAdmin = user?.role === 'FACULTY' || user?.role === 'LAB_INSTRUCTOR' || user?.role === 'SUPER_ADMIN' || user?.role === 'COORDINATOR';
  
  const getInitialTab = () => {
    if (user?.role === 'LAB_INSTRUCTOR') return 'inventory';
    if (isFacultyOrAdmin) return 'stations';
    return 'ide';
  };

  const [activeTab, setActiveTab] = useState<'stations' | 'inventory' | 'ide' | 'plagiarism' | 'operations' | 'lms'>(getInitialTab());
  const [audits, setAudits] = useState<PlagiarismComparison[]>([]);

  useEffect(() => {
    judgeService.getPlagiarismAudits().then(setAudits);
  }, []);

  const handleRunCode = async (lang: SupportedLanguage, code: string, problemId: string): Promise<TestCaseResult[]> => {
    return judgeService.evaluateCode(problemId, lang, code);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header & Resilience Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cu-border pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cu-pill text-cu-navy text-xs font-semibold">
              <Code2 size={13} />
              EduCode Judge Module 04
            </span>
            <FaultSimulatorButton moduleName="EduCode Judge (Team 04)" />
          </div>
          <h2 className="text-2xl font-bold text-cu-navy">
            {isFacultyOrAdmin ? 'Faculty Coding Stations & Student Time Telemetry' : 'Cloud Code Execution Arena & Auto-Judge'}
          </h2>
          <p className="text-xs sm:text-sm text-gray-500">
            {isFacultyOrAdmin 
              ? 'Real-time terminal station telemetry, active student coding hours, accuracy rates, and curriculum language sandboxes.'
              : 'Multi-language sandbox (Python 3.12, Java 21, C++ 20), active coding session tracker, and automated test evaluations.'}
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap bg-gray-100 p-1 rounded-xl text-xs font-semibold gap-1">
          {isFacultyOrAdmin && (
            <>
              <button onClick={() => setActiveTab('operations')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${activeTab === 'operations' ? 'bg-white text-cu-navy shadow-sm' : 'text-gray-600 hover:text-cu-navy'}`}><ShieldCheck size={13}/><span>Operations &amp; Exams</span></button>
              <button
                onClick={() => setActiveTab('inventory')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                  activeTab === 'inventory' ? 'bg-white text-cu-navy shadow-sm' : 'text-gray-600 hover:text-cu-navy'
                }`}
              >
                <Laptop size={13} />
                <span>Lab Hardware (PC 01-60)</span>
              </button>
              <button
                onClick={() => setActiveTab('stations')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                  activeTab === 'stations' ? 'bg-white text-cu-navy shadow-sm' : 'text-gray-600 hover:text-cu-navy'
                }`}
              >
                <Monitor size={13} />
                <span>Faculty Stations &amp; Time Analytics</span>
              </button>
            </>
          )}

          <button
            onClick={() => setActiveTab('lms')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${activeTab === 'lms' ? 'bg-white text-cu-navy shadow-sm' : 'text-gray-600 hover:text-cu-navy'}`}
          >
            <GraduationCap size={13} />
            <span>LMS Courses</span>
          </button>

          <button
            onClick={() => setActiveTab('ide')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
              activeTab === 'ide' ? 'bg-white text-cu-navy shadow-sm' : 'text-gray-600 hover:text-cu-navy'
            }`}
          >
            <Play size={13} />
            <span>Practice Arena &amp; IDE</span>
          </button>

          {isFacultyOrAdmin && (
            <button
              onClick={() => setActiveTab('plagiarism')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                activeTab === 'plagiarism' ? 'bg-white text-cu-navy shadow-sm' : 'text-gray-600 hover:text-cu-navy'
              }`}
            >
              <GitCompare size={13} />
              <span>AST Plagiarism Audit</span>
            </button>
          )}
        </div>
      </div>

      {/* Tab Renderers */}
      {activeTab === 'operations' && isFacultyOrAdmin && <CodeArenaOperationsDashboard />}
      {activeTab === 'lms' && <LMSCourseDashboard />}
      {activeTab === 'inventory' && isFacultyOrAdmin && <LabWorkstationInventory />}
      {activeTab === 'stations' && isFacultyOrAdmin && <FacultyStationAnalytics />}
      {activeTab === 'ide' && <MonacoWebIDE onRunCode={handleRunCode} />}
      {activeTab === 'plagiarism' && isFacultyOrAdmin && <PlagiarismAuditView audits={audits} onAuditsUpdated={setAudits} />}
    </div>
  );
};

export const CodeArenaModule: React.FC = () => {
  return (
    <ModuleErrorBoundary
      moduleId="codearena"
      moduleName="EduCode Judge (Arena & Auto-Judge)"
      teamName="Team 04"
    >
      <CodeArenaModuleContent />
    </ModuleErrorBoundary>
  );
};

export default CodeArenaModule;

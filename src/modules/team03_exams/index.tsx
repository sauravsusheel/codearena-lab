import React, { useState, useEffect } from 'react';
import { BookOpen, Lock, Award, Sparkles, ShieldCheck } from 'lucide-react';
import { ModuleErrorBoundary } from '../../core/resilience/ModuleErrorBoundary';
import { FaultSimulatorButton } from '../../core/resilience/FaultSimulatorButton';
import { examService } from './services/examService';
import { LockdownExamShell } from './components/LockdownExamShell';
import { AuthoringStudio } from './components/AuthoringStudio';
import { ProctoringTelemetry } from './components/ProctoringTelemetry';
import { GradingEvaluationStudio } from './components/GradingEvaluationStudio';
import { AiExamEvaluator } from './components/AiExamEvaluator';
import { AssessmentItem, ProctoringViolation } from './types/exams.types';
import { useAuth } from '../../context/AuthContext';

const ExamsModuleContent: React.FC = () => {
  const { user } = useAuth();

  // Role classification — Students may only take exams and view their hall ticket.
  // Authoring, AI evaluation, proctoring telemetry, and grading are faculty/admin tools.
  const isStudent = user?.role === 'STUDENT';
  const isFacultyOrAdmin =
    user?.role === 'FACULTY' ||
    user?.role === 'LAB_INSTRUCTOR' ||
    user?.role === 'SUPER_ADMIN' ||
    user?.role === 'COORDINATOR';

  // Students start in the lockdown exam runner; faculty/admin start in the authoring studio.
  const [activeTab, setActiveTab] = useState<'authoring' | 'live_exam' | 'ai_eval' | 'telemetry' | 'grading'>(
    isStudent ? 'live_exam' : 'authoring'
  );

  const [assessments, setAssessments] = useState<AssessmentItem[]>([]);
  const [violations, setViolations] = useState<ProctoringViolation[]>([]);

  useEffect(() => {
    examService.getAssessments().then(setAssessments);
    examService.getViolations().then(setViolations);
  }, []);

  const activeAssessment = assessments[0];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header & Resilience Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cu-border pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cu-pill text-cu-navy text-xs font-semibold">
              <BookOpen size={13} />
              EduExam AI Module 03
            </span>
            <FaultSimulatorButton moduleName="EduExam AI (Team 03)" />
          </div>
          <h2 className="text-2xl font-bold text-cu-navy">
            {isStudent
              ? 'ExamShield — Secure Digital Examination Portal'
              : 'ExamShield — AI-Proctored Examination & Auto-Evaluation Suite'}
          </h2>
          <p className="text-xs sm:text-sm text-gray-500">
            {isStudent
              ? 'Lockdown browser test runner with full-screen mode, tab-switch violation counters, and automated submission.'
              : 'Lockdown browser test runner, Gurukulya-style AI theory answer evaluation against model keys, KaTeX formulas, and 60:40 NEP gradebook.'}
          </p>
        </div>

        {/* Role-Scoped Navigation Tabs */}
        <div className="flex flex-wrap bg-gray-100 p-1 rounded-lg text-xs font-semibold gap-1">

          {/* Faculty / Admin only: Exam Authoring */}
          {isFacultyOrAdmin && (
            <button
              onClick={() => setActiveTab('authoring')}
              className={`px-3 py-1.5 rounded-md transition ${activeTab === 'authoring' ? 'bg-white text-cu-navy shadow-sm' : 'text-gray-600 hover:text-cu-navy'}`}
            >
              Exam Papers &amp; Bank
            </button>
          )}

          {/* All roles: Lockdown Exam Runner */}
          <button
            onClick={() => setActiveTab('live_exam')}
            className={`px-3 py-1.5 rounded-md transition ${activeTab === 'live_exam' ? 'bg-white text-cu-navy shadow-sm' : 'text-gray-600 hover:text-cu-navy'}`}
          >
            <span className="flex items-center gap-1.5">
              <Lock size={12} />
              {isStudent ? 'Enter Exam' : 'Lockdown Exam Runner'}
            </span>
          </button>

          {/* Faculty / Admin only: AI Auto-Evaluation */}
          {isFacultyOrAdmin && (
            <button
              onClick={() => setActiveTab('ai_eval')}
              className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 ${activeTab === 'ai_eval' ? 'bg-white text-cu-navy shadow-sm font-bold' : 'text-gray-600 hover:text-cu-navy'}`}
            >
              <Sparkles size={12} className="text-cu-gold" />
              AI Auto-Evaluation
            </button>
          )}

          {/* Faculty / Admin only: Proctoring Telemetry */}
          {isFacultyOrAdmin && (
            <button
              onClick={() => setActiveTab('telemetry')}
              className={`px-3 py-1.5 rounded-md transition ${activeTab === 'telemetry' ? 'bg-white text-cu-navy shadow-sm' : 'text-gray-600 hover:text-cu-navy'}`}
            >
              AI Proctoring Telemetry
            </button>
          )}

          {/* Faculty / Admin only: 60:40 NEP Gradebook */}
          {isFacultyOrAdmin && (
            <button
              onClick={() => setActiveTab('grading')}
              className={`px-3 py-1.5 rounded-md transition ${activeTab === 'grading' ? 'bg-white text-cu-navy shadow-sm' : 'text-gray-600 hover:text-cu-navy'}`}
            >
              <span className="flex items-center gap-1.5">
                <Award size={12} className="text-amber-600" />
                60:40 NEP Gradebook
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Tab Renderers — role guards enforced both at tab and render level */}
      {activeTab === 'authoring' && isFacultyOrAdmin && <AuthoringStudio assessments={assessments} />}
      {activeTab === 'live_exam' && activeAssessment && (
        <LockdownExamShell
          questions={activeAssessment.questions}
          onFinish={() => {
            alert('Paper completed! Automated scoring recorded.');
            setActiveTab(isStudent ? 'live_exam' : 'authoring');
          }}
        />
      )}
      {activeTab === 'ai_eval' && isFacultyOrAdmin && <AiExamEvaluator />}
      {activeTab === 'telemetry' && isFacultyOrAdmin && <ProctoringTelemetry violations={violations} />}
      {activeTab === 'grading' && isFacultyOrAdmin && <GradingEvaluationStudio />}

      {/* Student access-restriction notice for any tab that shouldn't render */}
      {isStudent && activeTab !== 'live_exam' && (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <ShieldCheck size={40} className="text-cu-gold" />
          <p className="font-bold text-cu-navy text-lg">Restricted Access</p>
          <p className="text-sm text-gray-500 max-w-sm">
            This section is available to faculty and academic administrators only. Please use the "Enter Exam" tab to access your scheduled assessments.
          </p>
        </div>
      )}
    </div>
  );
};

export const ExamsModule: React.FC = () => {
  return (
    <ModuleErrorBoundary
      moduleId="exams"
      moduleName="EduExam AI (ExamShield)"
      teamName="Team 03"
    >
      <ExamsModuleContent />
    </ModuleErrorBoundary>
  );
};

export default ExamsModule;

import React, { useState, useEffect } from 'react';
import { FolderKanban, Building, Award, Calendar } from 'lucide-react';
import { ModuleErrorBoundary } from '../../core/resilience/ModuleErrorBoundary';
import { FaultSimulatorButton } from '../../core/resilience/FaultSimulatorButton';
import { trackitService } from './services/trackitService';
import { ProjectMilestoneTracker } from './components/ProjectMilestoneTracker';
import { InternshipRoster } from './components/InternshipRoster';
import { CapstoneProject, InternshipRecord } from './types/trackit.types';

const TrackItModuleContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'projects' | 'internships'>('projects');
  const [projects, setProjects] = useState<CapstoneProject[]>([]);
  const [internships, setInternships] = useState<InternshipRecord[]>([]);

  useEffect(() => {
    trackitService.getProjects().then(setProjects);
    trackitService.getInternships().then(setInternships);
  }, []);

  const currentProject = projects[0];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header & Resilience Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cu-border pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cu-pill text-cu-navy text-xs font-semibold">
              <FolderKanban size={13} />
              TrackIt Module 08
            </span>
            <FaultSimulatorButton moduleName="TrackIt (Team 08)" />
          </div>
          <h2 className="text-2xl font-bold text-cu-navy">Academic Projects &amp; Internship Tracker</h2>
          <p className="text-xs sm:text-sm text-gray-500">
            Capstone milestone stages (M1 to M4), guide evaluation rubrics, GitHub source links, and industrial internship logs.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-gray-100 p-1 rounded-lg text-xs font-semibold">
          <button
            onClick={() => setActiveTab('projects')}
            className={`px-3 py-1.5 rounded-md transition ${activeTab === 'projects' ? 'bg-white text-cu-navy shadow-sm' : 'text-gray-600 hover:text-cu-navy'}`}
          >
            Capstone Projects
          </button>
          <button
            onClick={() => setActiveTab('internships')}
            className={`px-3 py-1.5 rounded-md transition ${activeTab === 'internships' ? 'bg-white text-cu-navy shadow-sm' : 'text-gray-600 hover:text-cu-navy'}`}
          >
            Internship Tracker
          </button>
        </div>
      </div>

      {/* Tab Renderers */}
      {activeTab === 'projects' && currentProject && (
        <ProjectMilestoneTracker project={currentProject} />
      )}
      {activeTab === 'internships' && <InternshipRoster internships={internships} />}
    </div>
  );
};

export const TrackItModule: React.FC = () => {
  return (
    <ModuleErrorBoundary
      moduleId="trackit"
      moduleName="TrackIt (Projects & Internships)"
      teamName="Team 08"
    >
      <TrackItModuleContent />
    </ModuleErrorBoundary>
  );
};

export default TrackItModule;

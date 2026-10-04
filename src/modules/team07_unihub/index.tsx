import React, { useState, useEffect } from 'react';
import { GitBranch, BookOpen, GitCompare, Activity } from 'lucide-react';
import { ModuleErrorBoundary } from '../../core/resilience/ModuleErrorBoundary';
import { FaultSimulatorButton } from '../../core/resilience/FaultSimulatorButton';
import { unihubService } from './services/unihubService';
import { GitRepoExplorer } from './components/GitRepoExplorer';
import { VisualDiffViewer } from './components/VisualDiffViewer';
import { LibraryCatalogView } from './components/LibraryCatalogView';
import { ResearchPaperArchive } from './components/ResearchPaperArchive';
import { GitRepository, GitCommit, CodeDiffFile, ResearchPaper, CampusActivityEvent } from './types/unihub.types';
import { useAuth } from '../../context/AuthContext';

const UniHubModuleContent: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'repos' | 'diffs' | 'papers' | 'library'>(
    user?.role === 'LIBRARIAN' ? 'library' : 'repos'
  );
  const [repos, setRepos] = useState<GitRepository[]>([]);
  const [commits, setCommits] = useState<GitCommit[]>([]);
  const [diffs, setDiffs] = useState<CodeDiffFile[]>([]);
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [activities, setActivities] = useState<CampusActivityEvent[]>([]);

  useEffect(() => {
    unihubService.getRepositories().then(setRepos);
    unihubService.getCommits().then(setCommits);
    unihubService.getDiffs().then(setDiffs);
    unihubService.getResearchPapers().then(setPapers);
    unihubService.getActivities().then(setActivities);
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header & Resilience Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cu-border pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cu-pill text-cu-navy text-xs font-semibold">
              <GitBranch size={13} />
              UniHub Module 07
            </span>
            <FaultSimulatorButton moduleName="UniHub (Team 07)" />
          </div>
          <h2 className="text-2xl font-bold text-cu-navy">Institutional Source Code, Library &amp; Research Archive</h2>
          <p className="text-xs sm:text-sm text-gray-500">
            Digital library catalog, RFID circulation desk, self-hosted Git repositories, side-by-side code diffs, and research papers.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap bg-gray-100 p-1 rounded-lg text-xs font-semibold gap-1">
          <button
            onClick={() => setActiveTab('library')}
            className={`px-3 py-1.5 rounded-md transition ${activeTab === 'library' ? 'bg-white text-cu-navy shadow-sm' : 'text-gray-600 hover:text-cu-navy'}`}
          >
            Digital Library &amp; Catalog
          </button>
          <button
            onClick={() => setActiveTab('repos')}
            className={`px-3 py-1.5 rounded-md transition ${activeTab === 'repos' ? 'bg-white text-cu-navy shadow-sm' : 'text-gray-600 hover:text-cu-navy'}`}
          >
            Git Repositories
          </button>
          <button
            onClick={() => setActiveTab('diffs')}
            className={`px-3 py-1.5 rounded-md transition ${activeTab === 'diffs' ? 'bg-white text-cu-navy shadow-sm' : 'text-gray-600 hover:text-cu-navy'}`}
          >
            Visual Code Diff
          </button>
          <button
            onClick={() => setActiveTab('papers')}
            className={`px-3 py-1.5 rounded-md transition ${activeTab === 'papers' ? 'bg-white text-cu-navy shadow-sm' : 'text-gray-600 hover:text-cu-navy'}`}
          >
            Research Papers
          </button>
        </div>
      </div>

      {/* Tab Renderers */}
      {activeTab === 'library' && <LibraryCatalogView />}
      {activeTab === 'repos' && <GitRepoExplorer repos={repos} commits={commits} />}
      {activeTab === 'diffs' && <VisualDiffViewer diffs={diffs} />}
      {activeTab === 'papers' && <ResearchPaperArchive papers={papers} />}

      {/* "Happening Now" Campus Live Feed */}
      <div className="bg-white rounded-xl border border-cu-border p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-cu-navy flex items-center gap-2">
            <Activity size={16} className="text-cu-saffron" />
            Happening Now: Live Campus Innovation Stream
          </h3>
          <span className="text-xs text-gray-400">Real-Time Event Bus</span>
        </div>

        <div className="space-y-2">
          {activities.map((act) => (
            <div
              key={act.id}
              className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <strong className="text-slate-800">{act.actor}</strong>
                <span className="text-gray-600">{act.actionText}</span>
              </div>
              <span className="text-[11px] text-gray-400 font-mono">{act.timestamp}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const UniHubModule: React.FC = () => {
  return (
    <ModuleErrorBoundary
      moduleId="unihub"
      moduleName="UniHub (Git & Research Repository)"
      teamName="Team 07"
    >
      <UniHubModuleContent />
    </ModuleErrorBoundary>
  );
};

export default UniHubModule;

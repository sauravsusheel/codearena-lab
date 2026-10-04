import React from 'react';
import { FolderKanban, CheckCircle2, Clock, Calendar, FileText, UserCheck, GitBranch } from 'lucide-react';
import { CapstoneProject } from '../types/trackit.types';

interface ProjectMilestoneTrackerProps {
  project: CapstoneProject;
}

export const ProjectMilestoneTracker: React.FC<ProjectMilestoneTrackerProps> = ({ project }) => {
  return (
    <div className="bg-white rounded-xl border border-cu-border p-6 shadow-sm space-y-6">
      {/* Project Overview Card */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 pb-5 border-b border-gray-100">
        <div>
          <span className="text-[10px] bg-cu-pill text-cu-navy font-bold px-2.5 py-0.5 rounded uppercase">
            {project.category}
          </span>
          <h3 className="text-xl font-bold font-serif text-cu-navy mt-1">{project.title}</h3>
          <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-4">
            <span>Lead: <strong className="text-slate-800">{project.leadStudentName} ({project.leadStudentRoll})</strong></span>
            <span>Guide: <strong className="text-cu-navy">{project.facultyGuideName}</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded-full">
            Stage: {project.stage}
          </span>
        </div>
      </div>

      {/* Team Members Roster */}
      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="text-gray-600">
          <strong className="text-slate-800">Team Contributors: </strong>
          {project.teamMembers.join(' · ')}
        </div>
        <a
          href={project.gitRepositoryUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-cu-navy font-semibold hover:underline"
        >
          <GitBranch size={14} />
          View Source Repository
        </a>
      </div>

      {/* Milestone Pipeline (M1 to M4) */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="font-bold text-sm text-cu-navy flex items-center gap-2">
            <Clock size={16} />
            Academic Milestone Progression &amp; Guide Scoring
          </h4>
          <span className="text-xs text-gray-400">AY 2026-27 Rubrics</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {project.milestones.map((m) => (
            <div
              key={m.id}
              className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 ${
                m.status === 'COMPLETED'
                  ? 'bg-emerald-50/50 border-emerald-200'
                  : m.status === 'IN_PROGRESS'
                  ? 'bg-amber-50/50 border-amber-200'
                  : 'bg-slate-50 border-slate-200 opacity-70'
              }`}
            >
              <div>
                <div className="flex justify-between items-start">
                  <span className="font-mono font-bold text-xs text-cu-navy">{m.code}</span>
                  {m.status === 'COMPLETED' ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                      <CheckCircle2 size={11} /> Completed
                    </span>
                  ) : m.status === 'IN_PROGRESS' ? (
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                      In Progress
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-gray-200 text-gray-700 text-[10px] font-semibold">
                      Scheduled
                    </span>
                  )}
                </div>

                <div className="font-bold text-xs text-slate-900 mt-2">{m.name}</div>
                <p className="text-[11px] text-gray-600 mt-1 leading-relaxed">{m.description}</p>
              </div>

              <div className="pt-2 border-t border-gray-200/60 text-[11px] space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Evaluation Score:</span>
                  <strong className={m.score ? 'text-emerald-700' : 'text-gray-400'}>
                    {m.score ? `${m.score} / ${m.maxScore}` : `Max ${m.maxScore}`}
                  </strong>
                </div>

                <div className="text-[10px] text-gray-400">Target Due: {m.dueDate}</div>

                {m.feedback && (
                  <div className="p-2 bg-white rounded border border-gray-200 text-[10px] italic text-gray-600 mt-1">
                    &quot;{m.feedback}&quot;
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

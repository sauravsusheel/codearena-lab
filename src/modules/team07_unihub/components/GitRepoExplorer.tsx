import React from 'react';
import { GitBranch, Star, GitFork, Folder, FileCode, Clock, ShieldCheck } from 'lucide-react';
import { GitRepository, GitCommit } from '../types/unihub.types';

interface GitRepoExplorerProps {
  repos: GitRepository[];
  commits: GitCommit[];
}

export const GitRepoExplorer: React.FC<GitRepoExplorerProps> = ({ repos, commits }) => {
  return (
    <div className="space-y-6">
      {/* Featured Repositories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {repos.map((repo) => (
          <div key={repo.id} className="bg-white rounded-xl border border-cu-border p-5 shadow-sm space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-[10px] text-gray-400 font-mono">{repo.owner} /</div>
                <h4 className="font-mono text-sm font-bold text-cu-navy hover:underline cursor-pointer">
                  {repo.name}
                </h4>
              </div>
              <span className="flex items-center gap-1 text-xs text-cu-gold font-bold">
                <Star size={13} fill="#C69930" /> {repo.stars}
              </span>
            </div>

            <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{repo.description}</p>

            <div className="pt-3 text-[11px] text-gray-400 flex justify-between items-center border-t border-gray-100">
              <span className="text-cu-saffron font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-cu-saffron" />
                {repo.primaryLanguage}
              </span>
              <span className="flex items-center gap-1 font-mono">
                <GitFork size={12} /> {repo.forks} forks
              </span>
              <span>{repo.updatedAt}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Git Commits Log */}
      <div className="bg-white rounded-xl border border-cu-border p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-cu-navy flex items-center gap-2">
            <GitBranch size={16} /> Recent University Commits Log
          </h3>
          <span className="text-xs text-gray-400">Gitea CE Internal Git Server</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-100">
              <tr>
                <th className="p-3">Commit Hash</th>
                <th className="p-3">Commit Message</th>
                <th className="p-3">Committer</th>
                <th className="p-3">Target Branch</th>
                <th className="p-3">Files</th>
                <th className="p-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {commits.map((c) => (
                <tr key={c.hash} className="hover:bg-gray-50/50">
                  <td className="p-3 font-mono font-bold text-blue-700">{c.hash}</td>
                  <td className="p-3 font-medium text-slate-800">{c.message}</td>
                  <td className="p-3 text-gray-600">{c.author}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-[10px] text-slate-700">
                      {c.branch}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-gray-500">{c.filesChanged} files</td>
                  <td className="p-3 text-gray-500 font-mono">{c.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

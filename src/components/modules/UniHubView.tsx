import React, { useState } from 'react';
import { GitBranch, BookOpen, Star, Search, ExternalLink, Plus } from 'lucide-react';

export const UniHubView: React.FC = () => {
  const [filter, setFilter] = useState('ALL');

  const repos = [
    { name: 'chanakya-edu/unisphere-monorepo', desc: 'Central Turborepo monorepo with 8 microservices and shared UI library', stars: 48, lang: 'TypeScript', updated: '2 hours ago' },
    { name: 'deepak-b/examshield-proctor', desc: 'Computer vision proctoring engine with BlazeFace in-browser model', stars: 22, lang: 'Python', updated: 'Yesterday' },
    { name: 'mca2025/smart-attend-qr', desc: 'HMAC-SHA256 time-limited QR generation with Redis token invalidation', stars: 15, lang: 'Node.js', updated: '3 days ago' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cu-border pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cu-pill text-cu-navy text-xs font-semibold mb-1">
            <GitBranch size={13} />
            <span>UniHub Module 07</span>
          </div>
          <h2 className="text-2xl font-bold text-cu-navy">University Repository & Research Hub</h2>
          <p className="text-xs sm:text-sm text-gray-500">
            Self-hosted Gitea CE source control, departmental research paper indexing, and live activity feeds.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-sm text-cu-navy">Featured University Repositories</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {repos.map((repo, i) => (
            <div key={i} className="bg-white rounded-xl border border-cu-border p-5 shadow-sm space-y-3">
              <div className="flex justify-between items-start">
                <span className="font-mono text-xs font-bold text-cu-navy truncate">{repo.name}</span>
                <span className="flex items-center gap-1 text-xs text-cu-gold font-bold">
                  <Star size={13} fill="#C69930" /> {repo.stars}
                </span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">{repo.desc}</p>
              <div className="pt-2 text-[11px] text-gray-400 flex justify-between border-t border-gray-100">
                <span className="text-cu-saffron font-semibold">{repo.lang}</span>
                <span>{repo.updated}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default UniHubView;

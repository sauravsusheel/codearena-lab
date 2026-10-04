import React from 'react';
import { Award, BookOpen, GraduationCap, Phone, Mail, Building, ShieldCheck } from 'lucide-react';
import { FacultyProfileData } from '../types/hrms.types';

interface FacultyDossierProps {
  profile: FacultyProfileData;
}

export const FacultyDossier: React.FC<FacultyDossierProps> = ({ profile }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-cu-border p-6 shadow-sm flex flex-col md:flex-row gap-6 items-start">
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-cu-navy to-cu-gold flex items-center justify-center text-white text-3xl font-serif font-bold shadow-md shrink-0">
          {profile.name.charAt(0)}
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-xl font-bold text-cu-navy">{profile.name}</h3>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-semibold flex items-center gap-1">
              <ShieldCheck size={12} />
              {profile.tenureStatus}
            </span>
          </div>
          <p className="text-xs text-gray-600 font-medium">{profile.designation}</p>
          <div className="flex flex-wrap gap-4 text-xs text-gray-500 pt-1">
            <span className="flex items-center gap-1.5"><Building size={14} className="text-cu-navy" /> {profile.department}</span>
            <span className="flex items-center gap-1.5"><Mail size={14} className="text-cu-navy" /> {profile.email}</span>
            <span className="flex items-center gap-1.5"><Phone size={14} className="text-cu-navy" /> {profile.phone}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-cu-border p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-cu-navy font-bold text-sm">
            <GraduationCap size={16} />
            <span>Academic Qualifications</span>
          </div>
          <ul className="space-y-2 text-xs text-gray-600">
            {profile.qualifications.map((q, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cu-gold mt-1.5 shrink-0" />
                <span>{q}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-xl border border-cu-border p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-cu-navy font-bold text-sm">
            <BookOpen size={16} />
            <span>Research &amp; Publications</span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-gray-500">Peer-Reviewed Papers</span>
              <strong className="text-cu-navy">{profile.totalPublications}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-gray-500">Institutional h-Index</span>
              <strong className="text-cu-navy">{profile.hIndex}</strong>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-500">Funded Grants</span>
              <strong className="text-emerald-700 font-semibold">{profile.fundedGrants}</strong>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-cu-border p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-cu-navy font-bold text-sm">
            <Award size={16} />
            <span>Workload Allocation</span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">Current Teaching Load</span>
              <strong className="text-cu-navy">{profile.currentWorkloadCredits} / {profile.maxTeachingCredits} Credits</strong>
            </div>
            <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-cu-navy h-full rounded-full transition-all"
                style={{ width: `${(profile.currentWorkloadCredits / profile.maxTeachingCredits) * 100}%` }}
              />
            </div>
            <p className="text-[11px] text-gray-400">Within statutory UGC/AICTE weekly credit limit.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

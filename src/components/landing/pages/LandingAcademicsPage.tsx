import React, { useState } from 'react';
import { GraduationCap, CheckCircle2 } from 'lucide-react';
import { SharedLandingPageProps } from './LandingHomePage';

const SCHOOLS = [
  {
    id: 'engineering', name: 'School of Engineering',
    desc: 'Advancing computational intelligence, distributed software architectures, cybersecurity, and applied mathematics under NEP 2020 guidelines.',
    programs: ['Master of Computer Applications (MCA)', 'Bachelor of Computer Applications (BCA)', 'B.Tech in Computer Science & Engineering', 'B.Tech in Artificial Intelligence & Data Science'],
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'management', name: 'School of Management Sciences',
    desc: 'Developing visionary enterprise leaders anchored in ethics, analytics, sustainability, and transformative organizational strategy.',
    programs: ['Master of Business Administration (MBA)', 'Bachelor of Business Administration (BBA)', 'B.Com (Honours in FinTech & Corporate Accounting)', 'Ph.D. in Management'],
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'law', name: 'School of Law, Governance & Public Policy',
    desc: 'Inculcating jurisprudence, constitutional integrity, cyber governance, and public policy formulation for global legal excellence.',
    programs: ['B.A. LL.B. (Honours)', 'B.B.A. LL.B. (Honours)', 'Master of Public Policy (MPP)', 'Ph.D. in Constitutional Law'],
    image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'biosciences', name: 'School of Biosciences',
    desc: 'Pioneering genomics, structural bioinformatics, drug target analysis, and ecological biodiversity studies.',
    programs: ['M.Sc. in Biotechnology & Bioinformatics', 'B.Sc. (Honours) in Genetics & Molecular Biology', 'Ph.D. in Cellular Biology'],
    image: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'science', name: 'School of Mathematics & Natural Sciences',
    desc: 'Rigorous exploration of pure mathematics, quantum physics, computational chemistry, and data-driven natural sciences.',
    programs: ['M.Sc. in Applied Mathematics', 'M.Sc. in Physics (Quantum Computing)', 'B.Sc. (Honours) in Chemistry', 'Ph.D. in Mathematics'],
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'arts', name: 'School of Liberal Arts & Humanities',
    desc: 'Cultivating critical thought, civilizational studies, linguistic heritage, and interdisciplinary humanities scholarship.',
    programs: ['B.A. (Honours) in Philosophy & Ethics', 'M.A. in Indic Studies & Sanskrit', 'M.A. in Political Science & IR', 'Ph.D. in Humanities'],
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&auto=format&fit=crop&q=80'
  },
];

export const LandingAcademicsPage: React.FC<SharedLandingPageProps> = ({ onApplyUG, onOpenLogin }) => {
  const [activeSchoolTab, setActiveSchoolTab] = useState('engineering');
  const current = SCHOOLS.find(s => s.id === activeSchoolTab) || SCHOOLS[0];

  return (
    <div className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-10">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <span className="text-xs font-bold text-cu-saffron uppercase tracking-widest">Academic Excellence</span>
          <h1 className="font-serif text-2xl sm:text-4xl font-bold text-cu-navy">Programmes Crafted by Renowned Academicians</h1>
          <p className="text-xs sm:text-sm text-gray-600">
            Multidisciplinary pedagogy blending rigorous technical depth with ethical leadership and critical inquiry.
          </p>
        </div>

        {/* School tabs */}
        <div className="flex flex-wrap justify-center gap-2 border-b border-gray-200 pb-3">
          {SCHOOLS.map(sch => (
            <button key={sch.id} onClick={() => setActiveSchoolTab(sch.id)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                activeSchoolTab === sch.id ? 'bg-cu-navy text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100 hover:text-cu-navy'
              }`}>
              {sch.name.replace('School of ', '')}
            </button>
          ))}
        </div>

        {/* Active school detail */}
        <div className="bg-gray-50 rounded-2xl border border-cu-border p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center shadow-sm">
          <div className="lg:col-span-7 space-y-4">
            <span className="text-xs font-bold text-cu-saffron uppercase tracking-wider">Featured School</span>
            <h2 className="font-serif text-2xl font-bold text-cu-navy">{current.name}</h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{current.desc}</p>
            <div className="pt-2">
              <h4 className="text-xs font-bold text-cu-navy uppercase tracking-wider mb-2">Key Degree Programmes:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {current.programs.map((p, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-gray-700 bg-white p-2.5 rounded-lg border border-gray-200">
                    <CheckCircle2 size={14} className="text-green-600 shrink-0" />
                    <span className="font-medium">{p}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="pt-4 flex items-center gap-3">
              <button type="button" onClick={onApplyUG}
                className="bg-cu-navy hover:bg-cu-navylight text-white text-xs font-bold px-5 py-2.5 rounded-lg transition shadow flex items-center gap-1.5">
                <GraduationCap size={14} />
                <span>Apply to this School</span>
              </button>
              <button onClick={onOpenLogin}
                className="bg-white hover:bg-gray-100 text-cu-navy border border-cu-border text-xs font-bold px-4 py-2.5 rounded-lg transition">
                Access Course ERP
              </button>
            </div>
          </div>
          <div className="lg:col-span-5">
            <img src={current.image} alt={current.name}
              className="rounded-xl object-cover h-64 sm:h-72 w-full shadow-md border border-gray-200" />
          </div>
        </div>

        {/* All schools quick grid */}
        <div>
          <h3 className="font-serif text-lg font-bold text-cu-navy mb-5">All Schools of Excellence</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {SCHOOLS.map(sch => (
              <div key={sch.id} onClick={() => setActiveSchoolTab(sch.id)}
                className="bg-white rounded-xl border border-cu-border p-5 shadow-sm hover:shadow-md hover:border-cu-gold/50 transition cursor-pointer space-y-2">
                <h4 className="font-serif font-bold text-sm text-cu-navy">{sch.name}</h4>
                <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-2">{sch.desc}</p>
                <div className="text-[10px] font-bold text-cu-saffron">{sch.programs.length} Degree Programmes</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingAcademicsPage;

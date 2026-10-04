import React, { useState, useEffect } from 'react';
import { 
  Search, Users, Award, BookOpen, Mail, ExternalLink, 
  ChevronRight, Filter, Sparkles, X, CheckCircle 
} from 'lucide-react';

interface FacultyItem {
  id: string;
  name: string;
  designation: string;
  school: string;
  qualifications: string;
  email: string;
  image_url: string;
  areas_of_expertise: string;
  bio: string;
  profile_url: string;
  category?: string;
  publications?: string;
}

export const FacultyDirectorySection: React.FC = () => {
  const [facultyList, setFacultyList] = useState<FacultyItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSchool, setSelectedSchool] = useState('ALL');
  const [selectedFaculty, setSelectedFaculty] = useState<FacultyItem | null>(null);
  const [displayCount, setDisplayCount] = useState(12);

  useEffect(() => {
    fetch('/data/faculty_data.json')
      .then(r => r.json())
      .then((data: FacultyItem[]) => {
        setFacultyList(data);
      })
      .catch(err => {
        console.error('Failed to load faculty data', err);
      });
  }, []);

  const schools = [
    'ALL',
    'School of Engineering',
    'School of Management Sciences',
    'School of Law, Governance & Public Policy',
    'School of Biosciences',
    'School of Arts, Humanities & Social Sciences'
  ];

  const filteredFaculty = facultyList.filter(f => {
    if (selectedSchool !== 'ALL' && !f.school.toLowerCase().includes(selectedSchool.toLowerCase().replace('school of ', ''))) {
      return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        f.name.toLowerCase().includes(q) ||
        f.designation.toLowerCase().includes(q) ||
        (f.areas_of_expertise && f.areas_of_expertise.toLowerCase().includes(q)) ||
        f.school.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const visibleFaculty = filteredFaculty.slice(0, displayCount);

  return (
    <section id="faculty" className="py-20 bg-slate-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cu-pill text-cu-navy border border-cu-border text-xs font-bold uppercase tracking-wider">
            <Users size={14} className="text-cu-gold" />
            <span>Academic Pioneers &amp; Thought Leaders</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-cu-navy">
            Distinguished Faculty &amp; Researchers
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            Our 170+ scholars, doctoral supervisors, and industry chairs bring deep pedagogical mastery, cutting-edge research citations, and national policy leadership.
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div className="bg-white rounded-2xl border border-cu-border p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search faculty by name, research area (e.g., 'Cloud', 'Biotech', 'Law', 'FinTech')..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-cu-gold"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <span className="text-xs font-semibold text-gray-500 shrink-0">School:</span>
            <select
              value={selectedSchool}
              onChange={e => {
                setSelectedSchool(e.target.value);
                setDisplayCount(12);
              }}
              className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-cu-gold"
            >
              {schools.map(sch => (
                <option key={sch} value={sch}>
                  {sch === 'ALL' ? 'All Academic Schools' : sch}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Count Pill */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Showing <strong>{visibleFaculty.length}</strong> of <strong>{filteredFaculty.length}</strong> faculty profiles</span>
          {facultyList.length > 0 && (
            <span className="font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold text-[11px]">
              {facultyList.length} University Faculty Database Verified
            </span>
          )}
        </div>

        {/* Faculty Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {visibleFaculty.map(fac => (
            <div
              key={fac.id}
              className="bg-white rounded-2xl border border-cu-border overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group hover:border-cu-gold/60"
            >
              <div>
                {/* Faculty Image Header */}
                <div className="h-52 bg-slate-100 relative overflow-hidden flex items-center justify-center">
                  <img
                    src={fac.image_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80'}
                    alt={fac.name}
                    onError={(e: any) => {
                      e.target.src = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500&auto=format&fit=crop&q=80';
                    }}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-3.5">
                    <div className="text-white">
                      <h4 className="font-bold text-sm leading-tight drop-shadow-xs">{fac.name}</h4>
                      <p className="text-[11px] text-cu-gold font-medium mt-0.5 line-clamp-1">{fac.designation}</p>
                    </div>
                  </div>
                </div>

                {/* Profile Details */}
                <div className="p-4 space-y-2 text-xs">
                  <div className="text-[11px] font-semibold text-cu-navy bg-slate-50 p-2 rounded-lg border border-slate-100 truncate">
                    {fac.school}
                  </div>

                  {fac.qualifications && (
                    <div className="text-[10px] text-gray-500 line-clamp-1 font-mono">
                      {fac.qualifications}
                    </div>
                  )}

                  {fac.areas_of_expertise && (
                    <div className="pt-1">
                      <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Expertise:</span>
                      <p className="text-[11px] text-gray-600 line-clamp-2 leading-relaxed">
                        {fac.areas_of_expertise}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="p-3 border-t border-gray-100 bg-gray-50/70 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setSelectedFaculty(fac)}
                  className="text-xs font-bold text-cu-navy hover:text-cu-saffron flex items-center gap-1 transition"
                >
                  <span>Full Dossier</span>
                  <ChevronRight size={13} />
                </button>

                {fac.email && (
                  <a
                    href={`mailto:${fac.email}`}
                    title={fac.email}
                    className="p-1.5 text-gray-400 hover:text-cu-navy rounded-md hover:bg-white transition"
                  >
                    <Mail size={14} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Load More Button */}
        {visibleFaculty.length < filteredFaculty.length && (
          <div className="text-center pt-4">
            <button
              onClick={() => setDisplayCount(prev => prev + 12)}
              className="px-6 py-2.5 bg-cu-navy hover:bg-cu-navy/90 text-white text-xs font-bold rounded-xl shadow transition"
            >
              Load More Faculty Profiles ({filteredFaculty.length - visibleFaculty.length} Remaining)
            </button>
          </div>
        )}

        {/* FULL FACULTY DOSSIER POPUP MODAL */}
        {selectedFaculty && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-cu-border text-xs space-y-4 my-6 animate-scale-in">
              <div className="flex items-start justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedFaculty.image_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80'}
                    alt=""
                    onError={(e: any) => {
                      e.target.src = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500&auto=format&fit=crop&q=80';
                    }}
                    className="w-16 h-16 rounded-xl object-cover border border-cu-border shadow-xs"
                  />
                  <div>
                    <h3 className="font-bold text-base text-cu-navy">{selectedFaculty.name}</h3>
                    <p className="text-xs text-cu-saffron font-semibold">{selectedFaculty.designation}</p>
                    <p className="text-[11px] text-gray-500">{selectedFaculty.school}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedFaculty(null)}
                  className="text-gray-400 hover:text-gray-600 font-bold p-1 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Qualifications & Email */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-bold">Academic Qualifications</span>
                  <p className="font-medium text-gray-800 text-[11px] mt-0.5">{selectedFaculty.qualifications || 'Doctoral Faculty'}</p>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-bold">Official Email</span>
                  <p className="font-mono text-cu-navy text-[11px] mt-0.5 truncate">{selectedFaculty.email || 'faculty@chanakyauniversity.edu.in'}</p>
                </div>
              </div>

              {/* Research Expertise */}
              {selectedFaculty.areas_of_expertise && (
                <div>
                  <span className="font-bold text-gray-800 block mb-1">Areas of Research &amp; Scholarly Quest:</span>
                  <p className="p-3 bg-amber-50/50 border border-amber-200/80 rounded-xl text-gray-700 leading-relaxed text-[11px]">
                    {selectedFaculty.areas_of_expertise}
                  </p>
                </div>
              )}

              {/* Full Bio */}
              {selectedFaculty.bio && (
                <div>
                  <span className="font-bold text-gray-800 block mb-1">Biography &amp; Academic Leadership:</span>
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-600 leading-relaxed text-[11px] max-h-48 overflow-y-auto">
                    {selectedFaculty.bio}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-[10px] text-gray-400">
                <span>Chanakya University Research Repository Verified</span>
                {selectedFaculty.profile_url && (
                  <a
                    href={selectedFaculty.profile_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-cu-navy font-bold hover:underline flex items-center gap-1"
                  >
                    <span>University Directory Profile</span>
                    <ExternalLink size={11} />
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

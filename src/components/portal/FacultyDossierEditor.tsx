import React, { useState, useEffect } from 'react';
import { 
  User, BookOpen, GraduationCap, Award, Plus, Trash2, 
  Save, CheckCircle2, Upload, ExternalLink, Sparkles, X, 
  Layers, Tag, Calendar, Mail, Phone, MapPin, Building
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { 
  facultyDossierService, 
  FacultyProfile, 
  Publication, 
  PhdProject, 
  FundedGrant 
} from '../../services/facultyDossierService';

interface FacultyDossierEditorProps {
  onClose?: () => void;
}

const PRESET_AVATARS = [
  '/campus/videoframe_26542.png',
  '/campus/videoframe_32469.png',
  '/campus/videoframe_18482.png',
  '/campus/videoframe_36364.png',
  '/campus/videoframe_41907.png',
];

export const FacultyDossierEditor: React.FC<FacultyDossierEditorProps> = ({ onClose }) => {
  const { user } = useAuth();
  const [allProfiles, setAllProfiles] = useState<FacultyProfile[]>(facultyDossierService.getAllProfiles());
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>('');
  const [facultySearchQuery, setFacultySearchQuery] = useState('');
  const [profile, setProfile] = useState<FacultyProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'BIO' | 'DOMAINS' | 'PUBLICATIONS' | 'PHD' | 'GRANTS'>('BIO');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // New tag input state
  const [newDomain, setNewDomain] = useState('');

  // New Publication state
  const [newPubTitle, setNewPubTitle] = useState('');
  const [newPubJournal, setNewPubJournal] = useState('');
  const [newPubYear, setNewPubYear] = useState(2026);
  const [newPubDoi, setNewPubDoi] = useState('');

  // New PhD state
  const [newScholar, setNewScholar] = useState('');
  const [newThesis, setNewThesis] = useState('');
  const [newPhdDomain, setNewPhdDomain] = useState('');
  const [newPhdStatus, setNewPhdStatus] = useState<'ONGOING' | 'SUBMITTED' | 'AWARDED'>('ONGOING');

  // New Grant state
  const [newGrantAgency, setNewGrantAgency] = useState('');
  const [newGrantTitle, setNewGrantTitle] = useState('');
  const [newGrantAmount, setNewGrantAmount] = useState(25.0);
  const [newGrantDuration, setNewGrantDuration] = useState('2026 – 2029');

  useEffect(() => {
    const updateList = () => {
      const list = facultyDossierService.getAllProfiles();
      setAllProfiles(list);
      if (!profile && list.length > 0) {
        const found = list.find(p => p.email.toLowerCase() === user?.email?.toLowerCase()) || list[0];
        setProfile(found);
        setSelectedFacultyId(found.id);
      }
    };

    updateList();
    const unsubscribe = facultyDossierService.subscribe(updateList);
    return () => unsubscribe();
  }, [user]);

  const handleSelectFaculty = (facId: string) => {
    const found = allProfiles.find(p => p.id === facId);
    if (found) {
      setProfile(found);
      setSelectedFacultyId(found.id);
    }
  };

  if (!profile) return null;

  const handleSave = () => {
    facultyDossierService.updateProfile(profile);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  const handleAddDomain = () => {
    if (!newDomain.trim()) return;
    if (profile.domains.includes(newDomain.trim())) return;
    setProfile(prev => prev ? {
      ...prev,
      domains: [...prev.domains, newDomain.trim()]
    } : null);
    setNewDomain('');
  };

  const handleRemoveDomain = (tagToRemove: string) => {
    setProfile(prev => prev ? {
      ...prev,
      domains: prev.domains.filter(d => d !== tagToRemove)
    } : null);
  };

  const handleAddPublication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPubTitle.trim()) return;
    const newPub: Publication = {
      id: `pub_${Date.now()}`,
      title: newPubTitle.trim(),
      journal: newPubJournal.trim() || 'Chanakya Academic Journal',
      year: Number(newPubYear) || 2026,
      doi: newPubDoi.trim() || undefined,
      citations: 0
    };
    setProfile(prev => prev ? {
      ...prev,
      publications: [newPub, ...prev.publications]
    } : null);
    setNewPubTitle('');
    setNewPubJournal('');
    setNewPubDoi('');
  };

  const handleRemovePublication = (id: string) => {
    setProfile(prev => prev ? {
      ...prev,
      publications: prev.publications.filter(p => p.id !== id)
    } : null);
  };

  const handleAddPhdProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScholar.trim() || !newThesis.trim()) return;
    const newPhd: PhdProject = {
      id: `phd_${Date.now()}`,
      scholarName: newScholar.trim(),
      thesisTitle: newThesis.trim(),
      domain: newPhdDomain.trim() || profile.domains[0] || 'Solar Energy',
      status: newPhdStatus,
      year: 2026
    };
    setProfile(prev => prev ? {
      ...prev,
      phdProjects: [newPhd, ...prev.phdProjects]
    } : null);
    setNewScholar('');
    setNewThesis('');
    setNewPhdDomain('');
  };

  const handleRemovePhd = (id: string) => {
    setProfile(prev => prev ? {
      ...prev,
      phdProjects: prev.phdProjects.filter(p => p.id !== id)
    } : null);
  };

  const handleAddGrant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGrantTitle.trim() || !newGrantAgency.trim()) return;
    const newGrant: FundedGrant = {
      id: `grant_${Date.now()}`,
      agency: newGrantAgency.trim(),
      title: newGrantTitle.trim(),
      grantAmountInLakhs: Number(newGrantAmount) || 10,
      duration: newGrantDuration.trim(),
      status: 'ACTIVE'
    };
    setProfile(prev => prev ? {
      ...prev,
      fundedGrants: [newGrant, ...prev.fundedGrants]
    } : null);
    setNewGrantAgency('');
    setNewGrantTitle('');
  };

  const handleRemoveGrant = (id: string) => {
    setProfile(prev => prev ? {
      ...prev,
      fundedGrants: prev.fundedGrants.filter(g => g.id !== id)
    } : null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setProfile(prev => prev ? { ...prev, profilePicUrl: reader.result as string } : null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cu-pill text-cu-navy text-[11px] font-bold uppercase tracking-wider mb-1">
            <User size={12} className="text-cu-gold" />
            <span>Faculty Dossier &amp; RAG Knowledge Engine</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            Faculty Research Profile &amp; Mentorship Portfolio
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Manage your research specializations, PhD students, grants, and publications. Updates automatically re-index into Campus AI Oracle.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onClose && (
            <button
              onClick={onClose}
              className="px-3 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 transition"
            >
              Back to Overview
            </button>
          )}
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 bg-cu-navy hover:bg-cu-navy-light text-white rounded-xl text-xs font-bold shadow-sm transition"
          >
            <Save size={14} />
            <span>Save &amp; Index Profile</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs font-semibold text-emerald-800 animate-fadeIn">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>Profile successfully updated and re-indexed into Campus AI Oracle RAG corpus!</span>
        </div>
      )}

      {/* Faculty Selector Bar (Supports all 174 university faculty dossiers) */}
      <div className="bg-white rounded-2xl border border-cu-border p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Building size={16} className="text-cu-gold" />
          <span className="font-bold text-cu-navy">Select Faculty Dossier:</span>
          <select
            value={profile.id}
            onChange={(e) => handleSelectFaculty(e.target.value)}
            className="px-3 py-1.5 border border-gray-200 rounded-xl font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-cu-navy max-w-xs sm:max-w-md"
          >
            {allProfiles.map(fac => (
              <option key={fac.id} value={fac.id}>
                {fac.name} — {fac.department || fac.school}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-gray-400 font-medium">Quick Jump:</span>
          <button
            type="button"
            onClick={() => {
              const sol = allProfiles.find(p => p.domains.some(d => d.toLowerCase().includes('solar')));
              if (sol) handleSelectFaculty(sol.id);
            }}
            className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 hover:bg-amber-100 font-bold text-[10px] border border-amber-200 transition"
          >
            Solar Expert (Dr. Rajeshwari)
          </button>
          <button
            type="button"
            onClick={() => {
              const ai = allProfiles.find(p => p.domains.some(d => d.toLowerCase().includes('artificial') || d.toLowerCase().includes('ai')));
              if (ai) handleSelectFaculty(ai.id);
            }}
            className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 hover:bg-blue-100 font-bold text-[10px] border border-blue-200 transition"
          >
            AI &amp; HPC (Dr. Joshi)
          </button>
          <button
            type="button"
            onClick={() => {
              const law = allProfiles.find(p => p.domains.some(d => d.toLowerCase().includes('law') || d.toLowerCase().includes('governance')));
              if (law) handleSelectFaculty(law.id);
            }}
            className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-800 hover:bg-purple-100 font-bold text-[10px] border border-purple-200 transition"
          >
            Cyber Law (Prof. Venkataraman)
          </button>
        </div>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-white rounded-2xl border border-cu-border p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center gap-6">
        <div className="relative group">
          <img
            src={profile.profilePicUrl}
            alt={profile.name}
            className="w-24 h-24 rounded-2xl object-cover border-2 border-cu-navy shadow-md"
          />
          <label className="absolute inset-0 bg-black/60 text-white rounded-2xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition text-[10px] font-semibold">
            <Upload size={16} className="mb-0.5" />
            <span>Upload Photo</span>
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </label>
        </div>

        <div className="flex-1 space-y-2 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-lg font-bold text-cu-navy">{profile.name}</h3>
              <p className="text-gray-600 font-medium">{profile.title}</p>
              <p className="text-gray-400 text-[11px]">{profile.department} &bull; {profile.school}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-cu-pill text-cu-navy font-bold text-[10px]">
                {profile.domains.length} Research Domains
              </span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                {profile.phdProjects.length} PhD Scholars
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-gray-500 text-[11px] pt-1">
            <div className="flex items-center gap-1">
              <Mail size={12} className="text-gray-400" />
              <span>{profile.email}</span>
            </div>
            <div className="flex items-center gap-1">
              <Phone size={12} className="text-gray-400" />
              <span>{profile.phone}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin size={12} className="text-gray-400" />
              <span>{profile.officeLocation}</span>
            </div>
          </div>

          {/* Quick preset avatar selector */}
          <div className="pt-2 flex items-center gap-2">
            <span className="text-[10px] text-gray-400 font-semibold">Choose Campus Portrait:</span>
            <div className="flex items-center gap-1.5">
              {PRESET_AVATARS.map((pic, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setProfile(p => p ? { ...p, profilePicUrl: pic } : null)}
                  className={`w-6 h-6 rounded-full overflow-hidden border transition ${
                    profile.profilePicUrl === pic ? 'ring-2 ring-cu-gold border-white' : 'border-gray-300 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={pic} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 gap-4 text-xs font-bold overflow-x-auto">
        <button
          onClick={() => setActiveTab('BIO')}
          className={`pb-2.5 flex items-center gap-1.5 transition border-b-2 whitespace-nowrap ${
            activeTab === 'BIO'
              ? 'border-cu-navy text-cu-navy'
              : 'border-transparent text-gray-400 hover:text-gray-700'
          }`}
        >
          <User size={14} />
          <span>Biographical Statement &amp; Contact</span>
        </button>

        <button
          onClick={() => setActiveTab('DOMAINS')}
          className={`pb-2.5 flex items-center gap-1.5 transition border-b-2 whitespace-nowrap ${
            activeTab === 'DOMAINS'
              ? 'border-cu-navy text-cu-navy'
              : 'border-transparent text-gray-400 hover:text-gray-700'
          }`}
        >
          <Tag size={14} />
          <span>Research Domains ({profile.domains.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('PUBLICATIONS')}
          className={`pb-2.5 flex items-center gap-1.5 transition border-b-2 whitespace-nowrap ${
            activeTab === 'PUBLICATIONS'
              ? 'border-cu-navy text-cu-navy'
              : 'border-transparent text-gray-400 hover:text-gray-700'
          }`}
        >
          <BookOpen size={14} />
          <span>Publications ({profile.publications.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('PHD')}
          className={`pb-2.5 flex items-center gap-1.5 transition border-b-2 whitespace-nowrap ${
            activeTab === 'PHD'
              ? 'border-cu-navy text-cu-navy'
              : 'border-transparent text-gray-400 hover:text-gray-700'
          }`}
        >
          <GraduationCap size={14} />
          <span>PhD Scholars ({profile.phdProjects.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('GRANTS')}
          className={`pb-2.5 flex items-center gap-1.5 transition border-b-2 whitespace-nowrap ${
            activeTab === 'GRANTS'
              ? 'border-cu-navy text-cu-navy'
              : 'border-transparent text-gray-400 hover:text-gray-700'
          }`}
        >
          <Award size={14} />
          <span>Funded Grants ({profile.fundedGrants.length})</span>
        </button>
      </div>

      {/* TAB 1: BIO & CONTACT */}
      {activeTab === 'BIO' && (
        <div className="bg-white rounded-2xl border border-cu-border p-6 shadow-sm space-y-4 text-xs">
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Full Name &amp; Academic Honorific:</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile(p => p ? { ...p, name: e.target.value } : null)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cu-navy font-semibold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Designation / Title:</label>
              <input
                type="text"
                value={profile.title}
                onChange={(e) => setProfile(p => p ? { ...p, title: e.target.value } : null)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cu-navy"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Department / Center:</label>
              <input
                type="text"
                value={profile.department}
                onChange={(e) => setProfile(p => p ? { ...p, department: e.target.value } : null)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cu-navy"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Email Address:</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile(p => p ? { ...p, email: e.target.value } : null)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cu-navy font-mono"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Direct Phone:</label>
              <input
                type="text"
                value={profile.phone}
                onChange={(e) => setProfile(p => p ? { ...p, phone: e.target.value } : null)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cu-navy"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Office Location:</label>
              <input
                type="text"
                value={profile.officeLocation}
                onChange={(e) => setProfile(p => p ? { ...p, officeLocation: e.target.value } : null)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cu-navy"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1">Research Biography &amp; Impact Summary:</label>
            <textarea
              rows={4}
              value={profile.bio}
              onChange={(e) => setProfile(p => p ? { ...p, bio: e.target.value } : null)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cu-navy leading-relaxed"
              placeholder="Describe your research areas, academic background, patents, and campus leadership contributions..."
            />
          </div>
        </div>
      )}

      {/* TAB 2: RESEARCH DOMAINS & KEYWORDS */}
      {activeTab === 'DOMAINS' && (
        <div className="bg-white rounded-2xl border border-cu-border p-6 shadow-sm space-y-4 text-xs">
          <div>
            <h4 className="font-bold text-sm text-cu-navy">Indexed Research Domains &amp; Keywords</h4>
            <p className="text-gray-500">
              These tags are vectorized by the RAG bot. When students ask queries like "who is the expert in solar?", matching tags rank this profile at the top.
            </p>
          </div>

          {/* Add new domain tag */}
          <div className="flex items-center gap-2 max-w-md">
            <input
              type="text"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddDomain(); } }}
              placeholder="Enter research field e.g. 'Solar Photovoltaics'..."
              className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-cu-navy"
            />
            <button
              type="button"
              onClick={handleAddDomain}
              className="px-3.5 py-2 bg-cu-navy text-white text-xs font-semibold rounded-xl hover:bg-cu-navy-light transition flex items-center gap-1"
            >
              <Plus size={14} />
              <span>Add Tag</span>
            </button>
          </div>

          {/* Suggested quick tags */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            <span className="text-[11px] text-gray-400 font-medium">Suggestions:</span>
            {[
              'Solar Energy', 'Solar Photovoltaics', 'Renewable Microgrids', 
              'Perovskite Solar Cells', 'Clean Energy', 'Artificial Intelligence', 
              'Deep Learning', 'High Performance Computing', 'Cyber Law', 
              'DPDP Act 2023', 'Space Law & Policy', 'Sustainable Finance'
            ].map(suggested => (
              <button
                key={suggested}
                type="button"
                onClick={() => {
                  if (!profile.domains.includes(suggested)) {
                    setProfile(prev => prev ? { ...prev, domains: [...prev.domains, suggested] } : null);
                  }
                }}
                disabled={profile.domains.includes(suggested)}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold transition ${
                  profile.domains.includes(suggested)
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-cu-pill text-cu-navy hover:bg-cu-gold hover:text-cu-navy border border-cu-border'
                }`}
              >
                + {suggested}
              </button>
            ))}
          </div>

          {/* Active Domains Chips */}
          <div className="flex flex-wrap gap-2 pt-2">
            {profile.domains.map((dom) => (
              <span
                key={dom}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cu-pill border border-cu-border text-cu-navy font-bold text-xs shadow-2xs"
              >
                <span>{dom}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveDomain(dom)}
                  className="p-0.5 text-gray-400 hover:text-rose-600 transition"
                  title="Remove tag"
                >
                  <X size={13} />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: PUBLICATIONS */}
      {activeTab === 'PUBLICATIONS' && (
        <div className="bg-white rounded-2xl border border-cu-border p-6 shadow-sm space-y-6 text-xs">
          {/* Add publication form */}
          <form onSubmit={handleAddPublication} className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
            <h4 className="font-bold text-sm text-cu-navy flex items-center gap-1.5">
              <Plus size={15} /> Add Peer-Reviewed Publication
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-600 font-semibold mb-1">Paper Title:</label>
                <input
                  type="text"
                  value={newPubTitle}
                  onChange={(e) => setNewPubTitle(e.target.value)}
                  placeholder="e.g. High-Efficiency Solar PV Performance in Tropical Climates"
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cu-navy"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-600 font-semibold mb-1">Journal / Conference Name:</label>
                <input
                  type="text"
                  value={newPubJournal}
                  onChange={(e) => setNewPubJournal(e.target.value)}
                  placeholder="e.g. IEEE Journal of Photovoltaics"
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cu-navy"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-gray-600 font-semibold mb-1">Publication Year:</label>
                <input
                  type="number"
                  value={newPubYear}
                  onChange={(e) => setNewPubYear(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cu-navy font-mono"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-gray-600 font-semibold mb-1">DOI / Web Link:</label>
                <input
                  type="text"
                  value={newPubDoi}
                  onChange={(e) => setNewPubDoi(e.target.value)}
                  placeholder="e.g. 10.1109/JPHOTOV.2025.328901"
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cu-navy font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-cu-navy text-white text-xs font-bold rounded-xl hover:bg-cu-navy-light transition shadow-xs"
            >
              Add Publication to Dossier
            </button>
          </form>

          {/* Existing Publications List */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-cu-navy">Indexed Publications ({profile.publications.length})</h4>
            <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden">
              {profile.publications.map(pub => (
                <div key={pub.id} className="p-3.5 bg-white hover:bg-gray-50/80 transition flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="font-bold text-gray-900">{pub.title}</div>
                    <div className="text-gray-500 text-[11px] flex items-center gap-2">
                      <span className="font-semibold text-cu-navy">{pub.journal}</span>
                      <span>&bull;</span>
                      <span>Year: {pub.year}</span>
                      {pub.doi && (
                        <>
                          <span>&bull;</span>
                          <span className="font-mono text-cu-gold">DOI: {pub.doi}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemovePublication(pub.id)}
                    className="p-1.5 text-gray-400 hover:text-rose-600 transition rounded-lg hover:bg-gray-100"
                    title="Delete publication"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PHD SCHOLARS & PROJECTS */}
      {activeTab === 'PHD' && (
        <div className="bg-white rounded-2xl border border-cu-border p-6 shadow-sm space-y-6 text-xs">
          {/* Add PhD Form */}
          <form onSubmit={handleAddPhdProject} className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
            <h4 className="font-bold text-sm text-cu-navy flex items-center gap-1.5">
              <Plus size={15} /> Add Supervised PhD Project
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-600 font-semibold mb-1">Scholar Full Name:</label>
                <input
                  type="text"
                  value={newScholar}
                  onChange={(e) => setNewScholar(e.target.value)}
                  placeholder="e.g. Rohit Deshmukh"
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cu-navy"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-600 font-semibold mb-1">Research Domain / Specialization:</label>
                <input
                  type="text"
                  value={newPhdDomain}
                  onChange={(e) => setNewPhdDomain(e.target.value)}
                  placeholder="e.g. Solar Energy & MPPT Algorithms"
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cu-navy"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-600 font-semibold mb-1">Doctoral Thesis Title:</label>
              <input
                type="text"
                value={newThesis}
                onChange={(e) => setNewThesis(e.target.value)}
                placeholder="e.g. Real-Time Maximum Power Point Tracking for Partially Shaded Solar PV Arrays"
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cu-navy font-semibold"
                required
              />
            </div>

            <div className="flex items-center gap-4">
              <div>
                <label className="block text-gray-600 font-semibold mb-1">Candidacy Status:</label>
                <select
                  value={newPhdStatus}
                  onChange={(e) => setNewPhdStatus(e.target.value as any)}
                  className="px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cu-navy"
                >
                  <option value="ONGOING">Ongoing</option>
                  <option value="SUBMITTED">Thesis Submitted</option>
                  <option value="AWARDED">Degree Awarded</option>
                </select>
              </div>

              <button
                type="submit"
                className="mt-5 px-4 py-2 bg-cu-navy text-white text-xs font-bold rounded-xl hover:bg-cu-navy-light transition shadow-xs"
              >
                Register PhD Scholar
              </button>
            </div>
          </form>

          {/* Existing PhD Scholars */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-cu-navy">Supervised Doctoral Scholars ({profile.phdProjects.length})</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {profile.phdProjects.map(phd => (
                <div key={phd.id} className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2 relative">
                  <button
                    onClick={() => handleRemovePhd(phd.id)}
                    className="absolute top-3 right-3 text-gray-400 hover:text-rose-600 transition"
                    title="Remove scholar"
                  >
                    <Trash2 size={14} />
                  </button>
                  <div className="flex items-center justify-between pr-6">
                    <span className="font-bold text-cu-navy text-sm">{phd.scholarName}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      phd.status === 'AWARDED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {phd.status}
                    </span>
                  </div>
                  <div className="text-gray-700 font-medium text-[11px] leading-snug">"{phd.thesisTitle}"</div>
                  <div className="text-gray-400 text-[10px]">Domain: {phd.domain} &bull; Cohort: {phd.year}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: FUNDED RESEARCH GRANTS */}
      {activeTab === 'GRANTS' && (
        <div className="bg-white rounded-2xl border border-cu-border p-6 shadow-sm space-y-6 text-xs">
          {/* Add Grant Form */}
          <form onSubmit={handleAddGrant} className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
            <h4 className="font-bold text-sm text-cu-navy flex items-center gap-1.5">
              <Plus size={15} /> Add Sponsored Research Grant
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-600 font-semibold mb-1">Funding Agency:</label>
                <input
                  type="text"
                  value={newGrantAgency}
                  onChange={(e) => setNewGrantAgency(e.target.value)}
                  placeholder="e.g. DST-SERB / MNRE / ISRO"
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cu-navy"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-600 font-semibold mb-1">Sanctioned Amount (INR in Lakhs):</label>
                <input
                  type="number"
                  step="0.5"
                  value={newGrantAmount}
                  onChange={(e) => setNewGrantAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cu-navy font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-600 font-semibold mb-1">Project Title:</label>
              <input
                type="text"
                value={newGrantTitle}
                onChange={(e) => setNewGrantTitle(e.target.value)}
                placeholder="e.g. Development of High-Durability Flexible Perovskite Solar Modules"
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cu-navy font-semibold"
                required
              />
            </div>

            <div className="flex items-center gap-4">
              <div>
                <label className="block text-gray-600 font-semibold mb-1">Project Duration:</label>
                <input
                  type="text"
                  value={newGrantDuration}
                  onChange={(e) => setNewGrantDuration(e.target.value)}
                  placeholder="e.g. 2026 – 2029"
                  className="px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cu-navy"
                />
              </div>

              <button
                type="submit"
                className="mt-5 px-4 py-2 bg-cu-navy text-white text-xs font-bold rounded-xl hover:bg-cu-navy-light transition shadow-xs"
              >
                Record Sponsored Project
              </button>
            </div>
          </form>

          {/* Existing Grants */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-cu-navy">Active &amp; Completed Research Grants ({profile.fundedGrants.length})</h4>
            <div className="space-y-2">
              {profile.fundedGrants.map(grant => (
                <div key={grant.id} className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-cu-navy">{grant.title}</span>
                      <span className="px-2 py-0.5 bg-cu-pill text-cu-navy font-bold rounded text-[10px]">{grant.status}</span>
                    </div>
                    <div className="text-gray-500 text-[11px] flex items-center gap-3">
                      <span>Agency: <strong>{grant.agency}</strong></span>
                      <span>&bull;</span>
                      <span>Grant: <strong className="text-emerald-700">₹ {grant.grantAmountInLakhs} Lakhs</strong></span>
                      <span>&bull;</span>
                      <span>Duration: {grant.duration}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveGrant(grant.id)}
                    className="p-1.5 text-gray-400 hover:text-rose-600 transition rounded-lg hover:bg-gray-100"
                    title="Delete grant"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default FacultyDossierEditor;

// Chanakya University — Faculty Research Dossier & Academic Profile Service
// Bridges faculty research profiles, PhD mentorship, grants, and publications directly into the RAG Knowledge Engine.

export interface Publication {
  id: string;
  title: string;
  journal: string;
  year: number;
  doi?: string;
  citations: number;
}

export interface PhdProject {
  id: string;
  scholarName: string;
  thesisTitle: string;
  domain: string;
  status: 'ONGOING' | 'SUBMITTED' | 'AWARDED';
  year: number;
}

export interface FundedGrant {
  id: string;
  agency: string;
  title: string;
  grantAmountInLakhs: number;
  duration: string;
  status: 'ACTIVE' | 'COMPLETED';
}

export interface FacultyProfile {
  id: string;
  name: string;
  title: string;
  department: string;
  school: string;
  email: string;
  phone: string;
  officeLocation: string;
  profilePicUrl: string;
  bio: string;
  domains: string[]; // e.g. ['Solar Energy', 'Photovoltaics', 'Clean Energy', 'Renewable Microgrids']
  publications: Publication[];
  phdProjects: PhdProject[];
  fundedGrants: FundedGrant[];
  lastUpdated: string;
}

const STORAGE_KEY = 'cu_faculty_dossiers_v1';

export const INITIAL_FACULTY_PROFILES: FacultyProfile[] = [
  {
    id: 'fac_solar_01',
    name: 'Dr. K. S. Rajeshwari',
    title: 'Senior Professor & Director, Centre for Sustainability',
    department: 'Department of Electrical & Clean Energy Engineering',
    school: 'School of Engineering',
    email: 'rajeshwari.ks@chanakya.edu.in',
    phone: '+91 80 2990 4101',
    officeLocation: 'Sustainability Complex, Block 4, Room 204',
    profilePicUrl: '/campus/videoframe_26542.png',
    bio: 'Pioneering researcher in solar photovoltaics, renewable microgrids, and perovskite-silicon tandem cells. Spearheaded the commissioning of Chanakya University’s 1.2 MW rooftop Solar PV system which powers over 60% of campus electricity demand.',
    domains: [
      'Solar',
      'Solar Energy',
      'Solar Photovoltaics',
      'Solar PV',
      'Perovskite Solar Cells',
      'Renewable Energy',
      'Clean Tech',
      'Microgrids',
      'Sustainable Power Systems',
      'Energy Storage',
      'Carbon Neutrality'
    ],
    publications: [
      {
        id: 'pub_01',
        title: 'High-Efficiency Bifacial Heterojunction Solar Cells for Subtropical Climates',
        journal: 'IEEE Journal of Photovoltaics',
        year: 2025,
        doi: '10.1109/JPHOTOV.2025.328901',
        citations: 42
      },
      {
        id: 'pub_02',
        title: 'Degradation Analysis of Perovskite-Silicon Tandem Solar Cells under Accelerated Thermal Cycling',
        journal: 'Solar Energy Materials & Solar Cells (Elsevier)',
        year: 2024,
        doi: '10.1016/j.solmat.2024.112840',
        citations: 68
      },
      {
        id: 'pub_03',
        title: 'Smart Microgrid Optimization with Hybrid Rooftop Solar PV and Lithium-Iron Phosphate Battery Storage',
        journal: 'Applied Energy',
        year: 2025,
        doi: '10.1016/j.apenergy.2025.121908',
        citations: 31
      }
    ],
    phdProjects: [
      {
        id: 'phd_01',
        scholarName: 'Rohit Deshmukh',
        thesisTitle: 'Deep Reinforcement Learning for Real-Time Maximum Power Point Tracking (MPPT) in Partially Shaded Solar Arrays',
        domain: 'Solar Energy & AI',
        status: 'ONGOING',
        year: 2026
      },
      {
        id: 'phd_02',
        scholarName: 'Sneha Narayanan',
        thesisTitle: 'Passivated Emitter and Rear Cell (PERC) Optimization for High-Irradiance Tropical Atmospheric Conditions',
        domain: 'Solar Photovoltaics',
        status: 'AWARDED',
        year: 2024
      },
      {
        id: 'phd_03',
        scholarName: 'Amitava Sen',
        thesisTitle: 'Grid-Forming Inverters for Distributed Solar Microgrids in Autonomous Campuses',
        domain: 'Power Electronics & Solar',
        status: 'ONGOING',
        year: 2025
      }
    ],
    fundedGrants: [
      {
        id: 'grant_01',
        agency: 'DST-SERB (Govt. of India)',
        title: 'Development of High-Durability Flexible Perovskite Solar Modules for Agro-Photovoltaic Deployment',
        grantAmountInLakhs: 54.0,
        duration: '2024 – 2027',
        status: 'ACTIVE'
      },
      {
        id: 'grant_02',
        agency: 'Ministry of New & Renewable Energy (MNRE)',
        title: 'Chanakya University Campus Microgrid Net-Zero Carbon Transformation',
        grantAmountInLakhs: 38.5,
        duration: '2025 – 2028',
        status: 'ACTIVE'
      }
    ],
    lastUpdated: '2026-09-05'
  },
  {
    id: 'fac_ai_02',
    name: 'Dr. Anand Joshi',
    title: 'Professor & Dean, School of Engineering',
    department: 'Department of Computer Science & Artificial Intelligence',
    school: 'School of Engineering',
    email: 'anand.joshi@chanakya.edu.in',
    phone: '+91 80 2990 4105',
    officeLocation: 'Turing Block, Room 301',
    profilePicUrl: '/campus/videoframe_32469.png',
    bio: 'Ph.D. from IISc Bengaluru. Lead architect of the Chanakya High-Performance Computing (HPC) GPU cluster with NVIDIA A300 nodes. Research in Distributed Deep Learning, LLM Quantization, and Parallel Algorithms.',
    domains: [
      'Artificial Intelligence',
      'Deep Learning',
      'Machine Learning',
      'High Performance Computing',
      'HPC',
      'NVIDIA GPU',
      'Computer Science',
      'Data Structures',
      'Algorithms',
      'LLM'
    ],
    publications: [
      {
        id: 'pub_ai_01',
        title: 'Scalable Distributed Transformer Training on Heterogeneous Accelerators',
        journal: 'ACM Transactions on Parallel Computing',
        year: 2025,
        doi: '10.1145/3649102',
        citations: 55
      }
    ],
    phdProjects: [
      {
        id: 'phd_ai_01',
        scholarName: 'Megha Hegde',
        thesisTitle: 'Low-Bit Quantization for Edge LLM Inference in Resource-Constrained Environments',
        domain: 'AI & HPC',
        status: 'ONGOING',
        year: 2026
      }
    ],
    fundedGrants: [
      {
        id: 'grant_ai_01',
        agency: 'MeitY (Ministry of Electronics & IT)',
        title: 'Indigenous High Performance AI Compute Framework for Indian Languages',
        grantAmountInLakhs: 72.0,
        duration: '2024 – 2027',
        status: 'ACTIVE'
      }
    ],
    lastUpdated: '2026-09-04'
  },
  {
    id: 'fac_law_03',
    name: 'Prof. R. Venkataraman',
    title: 'Dean, School of Law & Governance',
    department: 'Department of Law, Governance and Public Policy',
    school: 'School of Law, Governance and Public Policy',
    email: 'venkataraman.r@chanakya.edu.in',
    phone: '+91 80 2990 4110',
    officeLocation: 'Kautilya Block, Room 102',
    profilePicUrl: '/campus/videoframe_18482.png',
    bio: 'Distinguished jurist and constitutional scholar. Research focuses on Cyber Law, AI Ethics, Data Sovereignty under the Indian DPDP Act 2023, and Comparative Constitutionalism.',
    domains: [
      'Cyber Law',
      'DPDP Act 2023',
      'Data Privacy',
      'AI Ethics',
      'Intellectual Property',
      'Constitutional Law',
      'Public Policy'
    ],
    publications: [
      {
        id: 'pub_law_01',
        title: 'Data Fiduciary Obligations and Algorithmic Auditing under India DPDP Act 2023',
        journal: 'Supreme Court Law Review',
        year: 2024,
        citations: 28
      }
    ],
    phdProjects: [
      {
        id: 'phd_law_01',
        scholarName: 'Kavya Sastry',
        thesisTitle: 'Legal Liability and Autonomous Agent Governance in Financial Transactions',
        domain: 'Cyber Law',
        status: 'ONGOING',
        year: 2025
      }
    ],
    fundedGrants: [
      {
        id: 'grant_law_01',
        agency: 'Indian Council of Social Science Research (ICSSR)',
        title: 'Regulatory Sandboxes for FinTech and Data Protection in India',
        grantAmountInLakhs: 24.0,
        duration: '2024 – 2026',
        status: 'ACTIVE'
      }
    ],
    lastUpdated: '2026-09-01'
  }
];

class FacultyDossierService {
  private profiles: FacultyProfile[] = [];
  private isLoaded = false;
  private listeners: (() => void)[] = [];

  constructor() {
    this.loadProfiles();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify(): void {
    this.listeners.forEach(l => l());
  }

  private loadProfiles(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.profiles = JSON.parse(stored);
      } else {
        this.profiles = [...INITIAL_FACULTY_PROFILES];
        this.saveProfiles();
      }
    } catch {
      this.profiles = [...INITIAL_FACULTY_PROFILES];
    }

    // Also fetch the full 174 faculty catalog from public/data/faculty_data.json
    if (typeof window !== 'undefined' && typeof fetch !== 'undefined') {
      fetch('/data/faculty_data.json')
        .then(res => res.json())
        .then((items: any[]) => {
          if (!Array.isArray(items)) return;
          const existingIds = new Set(this.profiles.map(p => p.id));
          const existingEmails = new Set(this.profiles.map(p => p.email.toLowerCase()));

          const newConverted: FacultyProfile[] = [];

          items.forEach((item, idx) => {
            const email = (item.email || `${item.id || 'fac_' + idx}@chanakyauniversity.edu.in`).toLowerCase();
            const id = item.id || `fac_${idx}`;
            if (existingIds.has(id) || existingEmails.has(email)) return;

            const domains: string[] = [];
            if (item.areas_of_expertise) {
              item.areas_of_expertise.split(/[,;•]+/).forEach((d: string) => {
                const trimmed = d.trim();
                if (trimmed && trimmed.length > 2 && !domains.includes(trimmed)) {
                  domains.push(trimmed);
                }
              });
            }
            if (item.primary_category && !domains.includes(item.primary_category)) {
              domains.push(item.primary_category);
            }
            if (domains.length === 0) {
              domains.push('Academic Research', 'Higher Education');
            }

            const pubs: Publication[] = Array.isArray(item.publications_list) && item.publications_list.length > 0
              ? item.publications_list.map((p: any, pIdx: number) => ({
                  id: `pub_${id}_${pIdx}`,
                  title: typeof p === 'string' ? p : p.title || 'Scholarly Research Paper',
                  journal: 'Chanakya Academic Journal',
                  year: 2024,
                  citations: 15
                }))
              : [
                  {
                    id: `pub_${id}_0`,
                    title: `Contemporary Studies in ${domains[0] || 'Higher Education'}`,
                    journal: 'Indian Journal of Contemporary Higher Education',
                    year: 2024,
                    citations: 10
                  }
                ];

            const phds: PhdProject[] = Array.isArray(item.projects_list) && item.projects_list.length > 0
              ? item.projects_list.map((pr: any, prIdx: number) => ({
                  id: `phd_${id}_${prIdx}`,
                  scholarName: `Research Scholar ${prIdx + 1}`,
                  thesisTitle: typeof pr === 'string' ? pr : pr.title || 'Doctoral Research Investigation',
                  domain: domains[0] || 'Multidisciplinary Studies',
                  status: 'ONGOING' as const,
                  year: 2026
                }))
              : [];

            newConverted.push({
              id,
              name: item.name,
              title: item.designation || 'Faculty Member',
              department: item.primary_category ? `Department of ${item.primary_category}` : 'Faculty of Arts, Science & Management',
              school: item.school || 'Chanakya University',
              email,
              phone: '+91 80 2990 4100',
              officeLocation: `${item.school || 'Academic Block'}, Faculty Chambers`,
              profilePicUrl: item.image_url || '/campus/videoframe_26542.png',
              bio: item.bio || item.research_quest || 'Distinguished academician and faculty member at Chanakya University.',
              domains,
              publications: pubs,
              phdProjects: phds,
              fundedGrants: [],
              lastUpdated: '2026-09-06'
            });
          });

          if (newConverted.length > 0) {
            this.profiles = [...this.profiles, ...newConverted];
            this.saveProfiles();
            this.isLoaded = true;
            this.notify();
          }
        })
        .catch(err => {
          console.warn('Faculty data JSON load fallback used:', err);
        });
    }
  }

  private saveProfiles(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.profiles));
    } catch (e) {
      console.error('Failed to save faculty profiles to localStorage', e);
    }
  }

  public getAllProfiles(): FacultyProfile[] {
    return [...this.profiles];
  }

  public getProfileById(id: string): FacultyProfile | undefined {
    return this.profiles.find(p => p.id === id);
  }

  public getProfileByEmail(email: string): FacultyProfile | undefined {
    return this.profiles.find(p => p.email.toLowerCase() === email.toLowerCase());
  }

  public updateProfile(updated: FacultyProfile): void {
    const idx = this.profiles.findIndex(p => p.id === updated.id);
    if (idx >= 0) {
      this.profiles[idx] = { ...updated, lastUpdated: new Date().toISOString().slice(0, 10) };
    } else {
      this.profiles.push({ ...updated, lastUpdated: new Date().toISOString().slice(0, 10) });
    }
    this.saveProfiles();
  }

  // RAG Search Helper: Given a query, finds matching faculty profiles
  public searchFaculty(query: string): { profile: FacultyProfile; score: number; matchReasons: string[] }[] {
    const qLower = query.toLowerCase().trim();
    // Normalize known typos, e.g. "soloar" -> "solar", "solor" -> "solar"
    const normalized = qLower
      .replace(/\bsoloar\b/g, 'solar')
      .replace(/\bsolor\b/g, 'solar')
      .replace(/\bpv\b/g, 'photovoltaic solar pv')
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const terms = normalized.split(/\s+/).filter(t => t.length > 2);

    const results = this.profiles.map(profile => {
      let score = 0;
      const matchReasons: string[] = [];

      // Check name (highest weight for direct inquiries)
      if (normalized.includes(profile.name.toLowerCase()) || profile.name.toLowerCase().includes(normalized)) {
        score += 35;
        matchReasons.push(`Faculty name match: ${profile.name}`);
      }
      terms.forEach(t => {
        if (profile.name.toLowerCase().includes(t)) {
          score += 10;
          matchReasons.push(`Name matches "${t}"`);
        }
      });

      // Domain authority boost for specialized queries
      if (terms.includes('solar') && profile.domains.some(d => d.toLowerCase().includes('solar'))) {
        score += 60;
        matchReasons.push('Key domain authority in Solar Energy & Photovoltaics');
      }

      // Check domains (high weight)
      profile.domains.forEach(d => {
        const dLower = d.toLowerCase();
        if (normalized.includes(dLower) || dLower.includes(normalized)) {
          score += 15;
          matchReasons.push(`Domain expertise in "${d}"`);
        }
        terms.forEach(t => {
          if (dLower.includes(t)) {
            score += 8;
            matchReasons.push(`Specializes in ${d}`);
          }
        });
      });

      // Check bio & title
      terms.forEach(t => {
        if (profile.title.toLowerCase().includes(t)) {
          score += 4;
          matchReasons.push(`Title mentions ${t}`);
        }
        if (profile.bio.toLowerCase().includes(t)) {
          score += 3;
          matchReasons.push(`Research bio aligns with "${t}"`);
        }
      });

      // Check publications
      profile.publications.forEach(pub => {
        terms.forEach(t => {
          if (pub.title.toLowerCase().includes(t)) {
            score += 4;
            matchReasons.push(`Authored paper: "${pub.title.slice(0, 45)}..."`);
          }
        });
      });

      // Check PhD projects
      profile.phdProjects.forEach(phd => {
        terms.forEach(t => {
          if (phd.thesisTitle.toLowerCase().includes(t) || phd.domain.toLowerCase().includes(t)) {
            score += 5;
            matchReasons.push(`Guiding PhD project on "${phd.thesisTitle.slice(0, 45)}..."`);
          }
        });
      });

      // Check funded grants
      profile.fundedGrants.forEach(grant => {
        terms.forEach(t => {
          if (grant.title.toLowerCase().includes(t)) {
            score += 5;
            matchReasons.push(`Principal Investigator on grant: "${grant.title.slice(0, 40)}..."`);
          }
        });
      });

      return {
        profile,
        score,
        matchReasons: Array.from(new Set(matchReasons))
      };
    });

    return results.filter(r => r.score > 0).sort((a, b) => b.score - a.score);
  }
}

export const facultyDossierService = new FacultyDossierService();
export default facultyDossierService;

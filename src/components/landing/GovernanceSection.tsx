import React, { useState, useEffect } from 'react';
import { ShieldCheck, Award, Users, Compass, BookOpen, CheckCircle2, Building, Scale, Sparkles } from 'lucide-react';
import { websiteContentService } from '../../services/websiteContentService';

export const GovernanceSection: React.FC = () => {
  const [masterInfo, setMasterInfo] = useState(() => websiteContentService.getMasterInfo());

  useEffect(() => {
    const handleUpdate = () => setMasterInfo(websiteContentService.getMasterInfo());
    window.addEventListener('chanakya_website_content_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('chanakya_website_content_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const leadership = [
    {
      name: masterInfo.chancellorName || 'Prof. M. K. Sridhar',
      title: masterInfo.chancellorTitle || 'Chancellor & Chairman of Board of Governors',
      role: 'Member, NEP 2020 Drafting Committee & Eminent Educational Thinker',
      bio: 'Former Member of UGC and ICSSR, Prof. Sridhar served as a key member of the draft committee for the National Education Policy 2020. He provides visionary ideological leadership to Chanakya University.',
      image: '/images/leadership/prof_m_k_sridhar.jpg',
      fallbackImage: 'https://chanakyauniversity.edu.in/wp-content/uploads/2023/03/Prof.-M.-K.-Sridhar.jpg'
    },
    {
      name: 'Shri M. P. Kumar',
      title: 'Pro-Chancellor',
      role: 'Global Technology Entrepreneur & Philanthropist',
      bio: 'Founder and Former Chairman of Global Edge Software, Shri Kumar is an industry vanguard in embedded systems and telecommunications driving university innovation partnerships.',
      image: '/images/leadership/shri_m_p_kumar.jpg',
      fallbackImage: 'https://chanakyauniversity.edu.in/wp-content/uploads/2023/03/Sri-M.-P.-Kumar.jpg'
    },
    {
      name: masterInfo.vcName || 'Prof. Yashavantha Dongre',
      title: masterInfo.vcTitle || 'Vice-Chancellor',
      role: 'Distinguished Academic Administrator & International Scholar',
      bio: 'Former Vice-Chancellor of Central University and recognized researcher in cooperative economics and Third Sector governance. He directs university academic operations, curricula, and doctoral programs.',
      image: '/images/leadership/prof_yashavantha_dongre.jpg',
      fallbackImage: 'https://chanakyauniversity.edu.in/wp-content/uploads/2023/03/Prof.-Yashavantha-Dongre.jpg'
    },
    {
      name: masterInfo.registrarName || 'Dr. Sushant T. Joshi',
      title: masterInfo.registrarTitle || 'Registrar & Head of University Administration',
      role: 'Founding Registrar & Professor of Management',
      bio: 'A qualified engineer and doctorate in management, Dr. Joshi leads administrative governance, statutes implementation, regulatory compliance, and university operations.',
      image: '/images/leadership/dr_sushant_t_joshi.jpg',
      fallbackImage: 'https://chanakyauniversity.edu.in/wp-content/uploads/2023/03/Dr.-Sushant-Joshi.jpg'
    }
  ];

  const governors = [
    { name: 'Dr. K. Kasturirangan', affiliation: 'Former Chairman, ISRO & Chairman, National Steering Committee for NCF' },
    { name: 'Prof. B. Mahadevan', affiliation: 'Professor of Operations, IIM Bangalore & Scholar of Indian Knowledge Systems' },
    { name: 'Smt. Sudha Murty', affiliation: 'Distinguished Author, Educator & Philanthropist' },
    { name: 'Dr. Vinay Sahasrabuddhe', affiliation: 'Former President, ICCR & Member of Parliament' },
    { name: 'Justice N. Kumar', affiliation: 'Former Judge, High Court of Karnataka' },
    { name: 'Shri Nagaraj Reddy', affiliation: 'Managing Trustee, Centre for Educational and Social Studies (CESS)' }
  ];

  return (
    <div className="space-y-20">
      {/* SECTION 1: ABOUT CHANAKYA UNIVERSITY (#about) */}
      <section id="about" className="py-20 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold text-cu-saffron uppercase tracking-widest">About Chanakya University</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-cu-navy">
              Where Ideals Reside, and Ideas Thrive!
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Established under Karnataka Act No. 24 of 2021 and recognized by the University Grants Commission (UGC), Chanakya University is an autonomous global educational movement.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-4 text-xs text-gray-700 leading-relaxed">
              <h3 className="font-serif text-xl font-bold text-cu-navy">
                Rooted in Indian Civilizational Ethos, Designed for Global Frontiers
              </h3>
              <p>
                Inspired by the profound polymathic legacy of Acharya Chanakya, the university bridges timeless Indian Knowledge Systems (IKS) with state-of-the-art frontiers in artificial intelligence, distributed computing, public policy, biotechnology, and liberal arts.
              </p>
              <p>
                Located across a serene 116-acre global campus in Devanahalli, Bengaluru near the international airport, the university serves as a national benchmark for the complete multidisciplinary realization of the National Education Policy (NEP 2020).
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="font-bold text-cu-navy block text-xs">UGC Recognized</span>
                  <span className="text-[11px] text-gray-500">Autonomous Degree-Granting Charter</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="font-bold text-cu-navy block text-xs">LEED Platinum Green</span>
                  <span className="text-[11px] text-gray-500">1.2 MW Rooftop Clean Solar Microgrid</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="font-bold text-cu-navy block text-xs">60:40 NEP Evaluation</span>
                  <span className="text-[11px] text-gray-500">Continuous Formative &amp; Summative Grading</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="font-bold text-cu-navy block text-xs">HPC Supercompute</span>
                  <span className="text-[11px] text-gray-500">NVIDIA Tensor AI Research Labs</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="rounded-2xl overflow-hidden shadow-xl border border-cu-border relative">
                <img
                  src="/campus/videoframe_10723.png"
                  alt="Chanakya University Campus"
                  className="w-full h-80 sm:h-96 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-cu-navy/90 via-black/20 to-transparent flex items-end p-6">
                  <div className="text-white">
                    <span className="text-xs font-bold text-cu-gold uppercase tracking-wider">Vidyaranya Global Campus</span>
                    <h4 className="font-serif text-lg sm:text-xl font-bold mt-1">116-Acre Academic Ecosystem</h4>
                    <p className="text-[11px] text-gray-300">Devanahalli, Bengaluru &bull; Sustainable Smart Architecture</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: LEADERSHIP & GOVERNANCE (#governance) */}
      <section id="governance" className="py-20 bg-slate-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold text-cu-saffron uppercase tracking-widest">Leadership &amp; Direction</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-cu-navy">
              Institutional Leadership &amp; Governance
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Guided by distinguished visionaries in national higher education reform, science administration, and technological enterprise.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {leadership.map((leader, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-cu-border overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="h-64 bg-slate-100 overflow-hidden relative">
                    <img
                      src={leader.image}
                      alt={leader.name}
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (leader.fallbackImage && target.src !== leader.fallbackImage) {
                          target.src = leader.fallbackImage;
                        }
                      }}
                      className="w-full h-full object-cover object-top hover:scale-105 transition duration-500"
                    />
                    <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-cu-navy/85 backdrop-blur-xs text-[10px] font-bold text-cu-gold uppercase tracking-wider shadow-xs">
                      Executive Leadership
                    </div>
                  </div>
                  <div className="p-5 space-y-2 text-xs">
                    <h3 className="font-bold text-sm text-cu-navy">{leader.name}</h3>
                    <div className="text-cu-saffron font-bold text-[11px]">{leader.title}</div>
                    <div className="text-[10px] text-gray-500 font-medium">{leader.role}</div>
                    <p className="text-gray-600 text-[11px] leading-relaxed pt-2 border-t border-gray-100">
                      {leader.bio}
                    </p>
                  </div>
                </div>

                <div className="p-3 border-t border-gray-100 bg-gray-50/70 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-cu-navy">Executive Leadership</span>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    Verified Profile
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: BOARD OF GOVERNORS (#governors) */}
      <section id="governors" className="py-20 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold text-cu-saffron uppercase tracking-widest">Apex Council</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-cu-navy">
              Board of Governors &amp; Trustees
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Eminent scholars, former heads of national scientific missions, jurists, and trustees safeguarding academic rigor and institutional ethics.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {governors.map((gov, idx) => (
              <div
                key={idx}
                className="bg-slate-50 border border-slate-200 p-5 rounded-2xl flex items-start gap-3 shadow-xs hover:border-cu-gold transition"
              >
                <div className="w-10 h-10 rounded-xl bg-cu-pill text-cu-navy flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-cu-navy">{gov.name}</h4>
                  <p className="text-xs text-gray-600 mt-1 leading-snug">{gov.affiliation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

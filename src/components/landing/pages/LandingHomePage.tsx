import React from 'react';
import {
  ArrowRight, GraduationCap, LogIn, Sparkles,
  Compass, Globe, Award, Users, Calendar, MapPin
} from 'lucide-react';
import { WebsiteEvent, WebsiteMasterInfo, WebsiteNotification } from '../../../services/websiteContentService';

export interface SharedLandingPageProps {
  masterInfo: WebsiteMasterInfo;
  events: WebsiteEvent[];
  notifications: WebsiteNotification[];
  onOpenLogin: () => void;
  onApplyUG: () => void;
  onApplyPG: () => void;
  onNavigate: (page: LandingPageKey) => void;
}

export type LandingPageKey = 'home' | 'about' | 'academics' | 'faculty' | 'campus' | 'events' | 'admissions';

export const LandingHomePage: React.FC<SharedLandingPageProps> = ({
  masterInfo, events, onOpenLogin, onApplyUG, onApplyPG, onNavigate
}) => (
  <div className="flex flex-col">
    {/* HERO BANNER */}
    <section className="relative bg-gradient-to-r from-cu-navydark via-cu-navy to-[#0E1B38] text-white py-20 lg:py-28 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-cu-gold/40 text-cu-gold text-xs font-semibold">
            <Sparkles size={14} />
            <span>National Education Policy (NEP 2020) Pioneering Exemplar</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
            Where Ideals Reside, <br />
            <span className="text-cu-gold italic font-normal">and Ideas Thrive!</span>
          </h1>
          <p className="text-sm sm:text-base text-gray-300 max-w-2xl leading-relaxed">
            Chanakya University is committed to the creation of a foremost knowledge movement that harnesses India's timeless civilizational wisdom with cutting-edge global frontiers in science, technology, leadership, and public policy.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-4">
            <button type="button" onClick={onApplyUG}
              className="bg-cu-saffron hover:bg-cu-saffronlight text-white font-bold text-xs sm:text-sm px-6 py-3.5 rounded-lg shadow-lg transition flex items-center gap-2">
              <GraduationCap size={16} />
              <span>Apply for UG / PG Admission 2026-27</span>
              <ArrowRight size={15} />
            </button>
            <button onClick={() => onNavigate('academics')}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/30 font-bold text-xs sm:text-sm px-5 py-3.5 rounded-lg shadow transition">
              Explore Programmes
            </button>
            <button onClick={onOpenLogin}
              className="bg-white/10 hover:bg-white/20 text-white border border-cu-gold font-bold text-xs sm:text-sm px-5 py-3.5 rounded-lg shadow transition flex items-center gap-2">
              <LogIn size={15} className="text-cu-gold" />
              <span>SSO Portal Login</span>
            </button>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cu-gold uppercase tracking-wider">Unified Campus ERP</span>
              <span className="text-[10px] bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full font-mono">8 Microservices Live</span>
            </div>
            <h3 className="font-serif text-xl font-bold text-white">Chanakya Digital Ecosystem</h3>
            <p className="text-xs text-gray-200 leading-relaxed">
              Connect seamlessly to Smart Attendance, ExamShield AI Proctoring, Code Arena, PresentAI Viva, and TrackIt through your single institutional identity.
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              {[
                { label: 'Faculty Portal', sub: 'Deepak B & Guides' },
                { label: 'Student Portal', sub: 'MCA & Undergrads' },
                { label: 'Registrar Console', sub: 'Dr. R. Sharma' },
                { label: 'Finance Bursar', sub: 'Ramesh Hegde' },
              ].map(card => (
                <button key={card.label} onClick={onOpenLogin}
                  className="p-3 rounded-xl bg-cu-navy border border-cu-gold/30 hover:border-cu-gold transition text-left">
                  <div className="text-[11px] font-bold text-cu-gold">{card.label}</div>
                  <div className="text-[10px] text-gray-300">{card.sub}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* KEY STATS STRIP */}
    <section className="bg-cu-navy border-t border-b border-cu-gold/20 py-8 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        {[
          { val: '116+', label: 'Acres Global Campus', gold: true },
          { val: '6', label: 'Schools of Excellence', gold: false },
          { val: '40+', label: 'Programmes (UG, PG, Ph.D)', gold: true },
          { val: '100%', label: 'Automated ERP Governance', gold: false },
        ].map(stat => (
          <div key={stat.label}>
            <div className={`font-serif text-3xl sm:text-4xl font-bold ${stat.gold ? 'text-cu-gold' : 'text-white'}`}>{stat.val}</div>
            <div className="text-xs text-gray-300 uppercase tracking-wider font-semibold mt-1">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>

    {/* FOUR PILLARS */}
    <section className="py-16 bg-gray-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-cu-saffron uppercase tracking-widest">Institutional Pillars</span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-cu-navy">Foundations of Transformative Education</h2>
          <p className="text-xs sm:text-sm text-gray-600">Integrating civilizational roots with cutting-edge academic and societal frameworks.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { Icon: Compass, title: 'Social Observatory', desc: 'Empirical policy analysis, grassroots field immersion, and societal impact research across Karnataka.', bg: 'bg-cu-pill', color: 'text-cu-navy' },
            { Icon: Globe, title: 'Global Engagement', desc: 'Collaborative research chairs, international university partnerships, and exchange programs.', bg: 'bg-cu-saffron/10', color: 'text-cu-saffron' },
            { Icon: Award, title: 'Merit Scholarships', desc: 'Comprehensive financial assistance ensuring that no meritorious student is left behind.', bg: 'bg-cu-gold/15', color: 'text-cu-gold' },
            { Icon: Users, title: 'Careers & Placements', desc: 'Dedicated career progression cell bridging corporate internships and tier-1 industry placements.', bg: 'bg-blue-50', color: 'text-blue-700' },
          ].map(({ Icon, title, desc, bg, color }) => (
            <div key={title} className="bg-white p-6 rounded-xl border border-cu-border shadow-sm hover:shadow-md transition space-y-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bg}`}><Icon size={24} className={color} /></div>
              <h3 className="font-serif font-bold text-base text-cu-navy">{title}</h3>
              <p className="text-xs text-gray-600 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* EVENTS TEASER */}
    <section className="py-16 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-cu-saffron uppercase tracking-widest">Campus Calendar</span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-cu-navy mt-1">Upcoming Events</h2>
          </div>
          <button onClick={() => onNavigate('events')}
            className="inline-flex items-center gap-1.5 text-cu-navy font-bold text-xs border border-cu-border px-4 py-2 rounded-lg hover:bg-gray-50 transition">
            View All Events <ArrowRight size={13} />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {events.slice(0, 4).map(evt => (
            <div key={evt.id} className="bg-gray-50 rounded-2xl border border-gray-200/80 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col group">
              <div className="h-40 relative overflow-hidden bg-gray-200">
                <img src={evt.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                <div className="absolute top-2.5 left-2.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-white/95 text-cu-navy shadow-sm">{evt.category}</span>
                </div>
              </div>
              <div className="p-4 flex-1 space-y-1.5 text-xs">
                <h4 className="font-bold text-cu-navy text-sm line-clamp-2 leading-snug">{evt.title}</h4>
                <div className="flex items-center gap-1.5 font-semibold text-cu-saffron text-[10px]">
                  <Calendar size={11} /><span>{evt.date}</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-400 text-[10px]">
                  <MapPin size={11} /><span className="truncate">{evt.venue}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  </div>
);

export default LandingHomePage;

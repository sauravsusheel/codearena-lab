import React, { useState, useEffect } from 'react';
import {
  LogIn, Menu, X, ArrowRight, ChevronDown,
  Lock, Scale, GraduationCap
} from 'lucide-react';
import LoginModal from '../auth/LoginModal';
import { PrivacyPolicyModal } from '../legal/PrivacyPolicyModal';
import { TermsOfUseModal } from '../legal/TermsOfUseModal';
import { ChanakyaLogo } from '../ui/ChanakyaLogo';
import { ApplyAdmissionModal } from './ApplyAdmissionModal';
import { websiteContentService, WebsiteEvent, WebsiteNotification, WebsiteMasterInfo } from '../../services/websiteContentService';

// Page Components
import { LandingHomePage, LandingPageKey } from './pages/LandingHomePage';
import { LandingAboutPage } from './pages/LandingAboutPage';
import { LandingAcademicsPage } from './pages/LandingAcademicsPage';
import { LandingFacultyPage } from './pages/LandingFacultyPage';
import { LandingCampusPage } from './pages/LandingCampusPage';
import { LandingEventsPage } from './pages/LandingEventsPage';
import { LandingAdmissionsPage } from './pages/LandingAdmissionsPage';

interface LandingPageProps {
  onOpenPortal: () => void;
}

const NAV_ITEMS: { key: LandingPageKey; label: string }[] = [
  { key: 'home', label: 'Home' },
  { key: 'about', label: 'About' },
  { key: 'academics', label: 'Academics' },
  { key: 'faculty', label: 'Faculty' },
  { key: 'campus', label: 'Campus' },
  { key: 'events', label: 'Events' },
  { key: 'admissions', label: 'Admissions' },
];

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenPortal }) => {
  // ── Modals ─────────────────────────────────────────────────────────────────
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyLevel, setApplyLevel] = useState<'UG' | 'PG'>('UG');
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // ── Multi-page routing via URL hash ────────────────────────────────────────
  const getPageFromHash = (): LandingPageKey => {
    const hash = window.location.hash.replace('#', '') as LandingPageKey;
    return NAV_ITEMS.some(n => n.key === hash) ? hash : 'home';
  };

  const [activePage, setActivePage] = useState<LandingPageKey>(getPageFromHash);

  const navigate = (page: LandingPageKey) => {
    setActivePage(page);
    window.location.hash = page === 'home' ? '' : page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    const onHashChange = () => setActivePage(getPageFromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // ── Website Content Service ─────────────────────────────────────────────────
  const [notifications, setNotifications] = useState<WebsiteNotification[]>(
    () => websiteContentService.getActiveNotifications()
  );
  const [events, setEvents] = useState<WebsiteEvent[]>(
    () => websiteContentService.getPublishedEvents()
  );
  const [masterInfo, setMasterInfo] = useState<WebsiteMasterInfo>(
    () => websiteContentService.getMasterInfo()
  );

  useEffect(() => {
    const sync = () => {
      setNotifications(websiteContentService.getActiveNotifications());
      setEvents(websiteContentService.getPublishedEvents());
      setMasterInfo(websiteContentService.getMasterInfo());
    };
    window.addEventListener('chanakya_website_content_updated', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('chanakya_website_content_updated', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  // ── Shared props for all pages ──────────────────────────────────────────────
  const sharedProps = {
    masterInfo,
    events,
    notifications,
    onOpenLogin: () => setShowLoginModal(true),
    onApplyUG: () => { setApplyLevel('UG'); setShowApplyModal(true); },
    onApplyPG: () => { setApplyLevel('PG'); setShowApplyModal(true); },
    onNavigate: navigate,
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-800 font-sans selection:bg-cu-gold/30 selection:text-cu-navy">

      {/* TOP UTILITY STRIP */}
      <div className="bg-[#0A142A] text-gray-300 text-[11px] py-1.5 px-4 sm:px-8 border-b border-white/10 flex justify-between items-center z-30">
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1.5 text-amber-400 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-cu-saffron animate-ping" />
            <span>Admissions 2026-27 Open</span>
          </span>
          <span className="hidden md:inline text-gray-400">|</span>
          <span className="hidden md:inline text-gray-300">{masterInfo.address}</span>
        </div>
        <div className="flex items-center gap-3 sm:gap-5 font-medium">
          <button onClick={() => { setApplyLevel('UG'); setShowApplyModal(true); }}
            className="text-amber-400 hover:text-white transition font-semibold">
            Apply for UG
          </button>
          <span className="text-gray-600">|</span>
          <button onClick={() => { setApplyLevel('PG'); setShowApplyModal(true); }}
            className="text-amber-400 hover:text-white transition font-semibold">
            Apply for PG
          </button>
          <span className="text-gray-600">|</span>
          <button onClick={() => navigate('events')} className="hover:text-white transition hidden sm:inline">Events</button>
          <span className="text-gray-600 hidden sm:inline">|</span>
          <button onClick={() => navigate('campus')} className="hover:text-white transition">Contact</button>
        </div>
      </div>

      {/* LIVE NOTIFICATION TICKER */}
      {notifications.length > 0 && (
        <div className="bg-cu-navy text-white text-xs border-b border-cu-gold/20 py-2 px-4 sm:px-8 flex items-center justify-between gap-4 overflow-hidden z-20">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cu-gold text-cu-navy shrink-0 uppercase tracking-wider">
              {notifications[0].badge}
            </span>
            <span className="font-medium text-slate-200 truncate text-[11px]">{notifications[0].text}</span>
          </div>
          {notifications[0].linkText && (
            <a href={notifications[0].linkUrl || '#'}
              className="text-cu-gold hover:text-amber-300 font-bold text-[11px] shrink-0 underline flex items-center gap-1">
              <span>{notifications[0].linkText}</span>
              <ArrowRight size={12} />
            </a>
          )}
        </div>
      )}

      {/* STICKY MAIN HEADER */}
      <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex justify-between items-center">
          {/* Logo */}
          <button onClick={() => navigate('home')} className="flex items-center gap-3.5">
            <ChanakyaLogo variant="full" size="lg" height={44} />
          </button>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1 text-xs font-bold text-gray-700 tracking-wide uppercase">
            {NAV_ITEMS.map(item => (
              <button
                key={item.key}
                onClick={() => navigate(item.key)}
                className={`px-3 py-2 rounded-lg transition ${
                  activePage === item.key
                    ? 'bg-cu-navy text-white'
                    : 'hover:bg-gray-100 hover:text-cu-navy'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* CTA buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowLoginModal(true)}
              className="bg-gradient-to-r from-[#0a1e3b] to-[#16284f] hover:from-[#112446] hover:to-[#1e3a8a] text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition flex items-center gap-2 border border-amber-400/40 hover:border-amber-400"
            >
              <LogIn size={14} className="text-amber-400" />
              <span>ERP Portal Login</span>
            </button>
            <button
              onClick={() => navigate('admissions')}
              className="hidden sm:inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-[#0a1e3b] font-bold text-xs px-4 py-2.5 rounded-xl shadow transition"
            >
              Apply Now <ArrowRight size={13} />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden text-gray-700 hover:text-cu-navy p-1.5"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-1 animate-fadeIn shadow-lg">
            {NAV_ITEMS.map(item => (
              <button
                key={item.key}
                onClick={() => navigate(item.key)}
                className={`w-full text-left py-2.5 px-3 rounded-lg text-xs font-bold uppercase transition ${
                  activePage === item.key
                    ? 'bg-cu-navy text-white'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-cu-navy'
                }`}
              >
                {item.label}
              </button>
            ))}
            <div className="pt-2 border-t border-gray-100">
              <button
                onClick={() => { setMobileMenuOpen(false); setShowLoginModal(true); }}
                className="w-full bg-[#0a1e3b] text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-2"
              >
                <LogIn size={14} className="text-amber-400" />
                ERP Portal Login
              </button>
            </div>
          </div>
        )}
      </header>

      {/* PAGE CONTENT */}
      <main className="flex-1">
        {activePage === 'home'       && <LandingHomePage {...sharedProps} />}
        {activePage === 'about'      && <LandingAboutPage {...sharedProps} />}
        {activePage === 'academics'  && <LandingAcademicsPage {...sharedProps} />}
        {activePage === 'faculty'    && <LandingFacultyPage {...sharedProps} />}
        {activePage === 'campus'     && <LandingCampusPage {...sharedProps} />}
        {activePage === 'events'     && <LandingEventsPage {...sharedProps} />}
        {activePage === 'admissions' && <LandingAdmissionsPage {...sharedProps} />}
      </main>

      {/* FOOTER */}
      <footer className="bg-cu-navydark text-gray-400 text-xs border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <ChanakyaLogo theme="white" height={40} />
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Established under Karnataka Act No. 24 of 2021. Recognized by University Grants Commission (UGC).
            </p>
          </div>

          <div>
            <div className="font-serif font-bold text-white text-sm mb-3">Quick Links</div>
            <ul className="space-y-1.5 text-[11px]">
              {NAV_ITEMS.map(item => (
                <li key={item.key}>
                  <button onClick={() => navigate(item.key)}
                    className="hover:text-cu-gold transition text-left">
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="font-serif font-bold text-white text-sm mb-3">Governance &amp; Policies</div>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <button onClick={() => setShowPrivacyModal(true)}
                  className="hover:text-cu-gold transition flex items-center gap-1.5 text-left text-slate-300">
                  <Lock size={12} className="text-cu-gold" />
                  Privacy Policy (DPDP 2023)
                </button>
              </li>
              <li>
                <button onClick={() => setShowTermsModal(true)}
                  className="hover:text-cu-gold transition flex items-center gap-1.5 text-left text-slate-300">
                  <Scale size={12} className="text-cu-gold" />
                  Terms of Academic Use
                </button>
              </li>
              <li><a href="#" className="hover:text-cu-gold transition">Mandatory Public Disclosures</a></li>
              <li><a href="#" className="hover:text-cu-gold transition">Anti-Ragging Regulations</a></li>
              <li><a href="#" className="hover:text-cu-gold transition">IQAC — Internal Quality Assurance</a></li>
              <li><a href="#" className="hover:text-cu-gold transition">Student Grievance Redressal</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <div className="font-serif font-bold text-white text-sm">ERP &amp; Digital Campus</div>
            <p className="text-[11px] text-gray-400">
              Access the unified single sign-on staff, faculty, and student academic services.
            </p>
            <button
              onClick={() => setShowLoginModal(true)}
              className="w-full bg-cu-saffron hover:bg-cu-saffronlight text-white font-bold py-2 px-3 rounded-lg text-xs transition shadow flex items-center justify-center gap-1.5"
            >
              <LogIn size={14} />
              Launch ERP Portal
            </button>
          </div>
        </div>

        <div className="border-t border-white/5 py-4 px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between text-[10px] text-gray-500 gap-2">
          <div>&copy; 2026 Chanakya University. All Rights Reserved. Built for Master of Computer Applications (MCA) Project Architecture.</div>
          <div className="flex items-center gap-4">
            <button onClick={() => setShowPrivacyModal(true)} className="hover:text-cu-gold transition underline">Privacy Policy</button>
            <span>&bull;</span>
            <button onClick={() => setShowTermsModal(true)} className="hover:text-cu-gold transition underline">Terms of Use</button>
            <span>&bull;</span>
            <span className="text-slate-400">Autonomous Campus &bull; Bengaluru</span>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onSuccess={() => { setShowLoginModal(false); onOpenPortal(); }}
        />
      )}
      <PrivacyPolicyModal isOpen={showPrivacyModal} onClose={() => setShowPrivacyModal(false)} />
      <TermsOfUseModal isOpen={showTermsModal} onClose={() => setShowTermsModal(false)} />
      <ApplyAdmissionModal
        isOpen={showApplyModal}
        initialLevel={applyLevel}
        onClose={() => setShowApplyModal(false)}
      />
    </div>
  );
};

export default LandingPage;

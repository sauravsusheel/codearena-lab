import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu, Bell, LogOut, Globe, ChevronDown, ShieldCheck, 
  Activity, AlertTriangle, CheckCircle2, MoreVertical,
  HelpCircle, Settings, CheckSquare, Shield, ExternalLink,
  BookOpen, Lock, Sparkles, QrCode
} from 'lucide-react';
import { useAuth, UserRole } from '../../context/AuthContext';
import { ModuleHealthRegistry, ModuleHealthEntry } from '../../core/resilience/ModuleHealthRegistry';
import { ChanakyaLogo } from '../ui/ChanakyaLogo';
import { QRScannerValidatorModal } from '../common/QRScannerValidatorModal';

interface PortalHeaderProps {
  onToggleSidebar: () => void;
  isSidebarOpen?: boolean;
  title?: string;
  onGoHome: () => void;
  onNavigateModule?: (moduleKey: string) => void;
}

export const PortalHeader: React.FC<PortalHeaderProps> = ({ 
  onToggleSidebar, 
  isSidebarOpen = true,
  title = "Dashboard",
  onGoHome,
  onNavigateModule
}) => {
  const { user, switchRole, logout } = useAuth();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [healthMenuOpen, setHealthMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);
  const [qrValidatorOpen, setQrValidatorOpen] = useState(false);
  const [healthMap, setHealthMap] = useState<Record<string, ModuleHealthEntry>>(ModuleHealthRegistry.getSnapshot());

  const headerRef = useRef<HTMLElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setRoleMenuOpen(false);
        setHealthMenuOpen(false);
        setMoreMenuOpen(false);
        setProfileMenuOpen(false);
        setNotifMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  useEffect(() => {
    const unsubscribe = ModuleHealthRegistry.subscribe((updated) => {
      setHealthMap(updated);
    });
    return unsubscribe;
  }, []);

  const rolesList: { role: UserRole; label: string; name: string }[] = [
    { role: 'SUPER_ADMIN',           label: 'University Registrar',          name: 'Dr. R. Sharma' },
    { role: 'IT_ADMIN',              label: 'IT & Cybersecurity Admin',       name: 'Arun Mehta' },
    { role: 'STUDENT',               label: 'MCA Student (CR)',              name: 'Arjun Kumar' },
    { role: 'FACULTY',               label: 'Faculty Lead',                  name: 'Deepak B' },
    { role: 'DEAN',                  label: 'Dean of School',                name: 'Prof. K. Venkatesh' },
    { role: 'EXAMINATION_CONTROLLER',label: 'Controller of Examinations',    name: 'Dr. S. Ranganath' },
    { role: 'PLACEMENT_OFFICER',     label: 'Placement & Industry Officer',  name: 'Nandini Verma' },
    { role: 'COORDINATOR',           label: 'Academic & Capstone Co-ordinator', name: 'Dr. Anita Desai' },
    { role: 'HR_ADMIN',              label: 'HR Manager',                    name: 'Priya Nair' },
    { role: 'COURSE_ALLOCATOR',      label: 'Course Allocator',              name: 'Kavitha Murthy' },
    { role: 'LIBRARIAN',             label: 'Chief Librarian',               name: 'Sumanth K' },
    { role: 'LAB_INSTRUCTOR',        label: 'Lab Instructor',                name: 'Vinay V' },
    { role: 'FINANCE',               label: 'Finance & Payroll',             name: 'Ramesh Hegde' },
    { role: 'WEBSITE_CONTROLLER',    label: 'Public Website Controller',     name: 'Vikram Malhotra' },
    { role: 'ADMISSION_OFFICER',     label: 'Director of Admissions',        name: 'Sunita Rao' },
    { role: 'COURSE_UPDATOR',        label: 'Course Content Officer',        name: 'Meena Krishnan' },
    { role: 'STAFF',                 label: 'Administrative Staff',          name: 'Mahesh Gowda' },
  ];

  const modulesList = Object.values(healthMap);
  const healthyCount = modulesList.filter(m => m.status === 'HEALTHY').length;
  const isAllHealthy = healthyCount === modulesList.length;

  const closeAllMenus = () => {
    setRoleMenuOpen(false);
    setHealthMenuOpen(false);
    setMoreMenuOpen(false);
    setProfileMenuOpen(false);
    setNotifMenuOpen(false);
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return (
          <span className="border border-amber-400/50 bg-amber-500/15 text-amber-800 font-extrabold text-[10px] px-2 py-0.5 rounded-full">
            REGISTRAR &amp; ADMIN
          </span>
        );
      case 'FACULTY':
        return (
          <span className="bg-emerald-500/15 text-emerald-800 border border-emerald-400/40 font-extrabold text-[10px] px-2 py-0.5 rounded-full">
            FACULTY LEAD
          </span>
        );
      case 'COORDINATOR':
        return (
          <span className="bg-sky-500/15 text-sky-800 border border-sky-400/40 font-extrabold text-[10px] px-2 py-0.5 rounded-full">
            COORDINATOR
          </span>
        );
      case 'STUDENT':
        return (
          <span className="bg-amber-600/15 text-amber-800 border border-amber-500/40 font-extrabold text-[10px] px-2 py-0.5 rounded-full">
            STUDENT (CR)
          </span>
        );
      case 'WEBSITE_CONTROLLER':
        return (
          <span className="bg-indigo-500/15 text-indigo-800 border border-indigo-400/40 font-extrabold text-[10px] px-2 py-0.5 rounded-full">
            WEBSITE CONTROLLER
          </span>
        );
      default:
        return (
          <span className="bg-slate-100 text-slate-700 border border-slate-300 font-extrabold text-[10px] px-2 py-0.5 rounded-full">
            {role}
          </span>
        );
    }
  };

  return (
    <header ref={headerRef} className="sticky top-0 z-40 w-full border-b border-amber-900/15 bg-white/95 backdrop-blur-md shadow-sm transition-colors">
      {/* Top Institutional Gold Accent Stripe from Project-tracker-main */}
      <div className="h-1 sm:h-1.5 w-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600" />

      <div className="flex h-14 sm:h-16 items-center justify-between gap-2 px-3 sm:px-6">
        {/* Left Section: 3-lines Toggle + Logo (only when sidebar is collapsed) + Breadcrumb Title */}
        <div className="flex items-center gap-2.5 sm:gap-4 min-w-0 shrink">
          {/* Hamburger "3 lines" Toggle Button */}
          <button 
            onClick={onToggleSidebar}
            className={`flex items-center justify-center h-9 w-9 sm:h-10 sm:w-10 rounded-xl transition-all shrink-0 focus:outline-none focus:ring-2 focus:ring-amber-500 ${
              isSidebarOpen 
                ? 'text-amber-900 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30' 
                : 'text-slate-700 bg-slate-100 hover:bg-amber-500/15 border border-slate-200'
            }`}
            aria-label="Toggle navigation menu (3 lines)"
            title={isSidebarOpen ? "Collapse navigation sidebar (3 lines)" : "Expand navigation sidebar (3 lines)"}
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Official Chanakya University Logo: ONLY visible when sidebar is collapsed or on mobile to eliminate duplication */}
          {(!isSidebarOpen) && (
            <div 
              onClick={onGoHome} 
              className="flex items-center group min-w-0 shrink cursor-pointer transition-all duration-200" 
              title="Go to Institutional Home"
            >
              <div className="sm:hidden">
                <ChanakyaLogo variant="emblem" height={32} />
              </div>
              <div className="hidden sm:block">
                <ChanakyaLogo variant="full" size="sm" height={34} />
              </div>
            </div>
          )}

          {(!isSidebarOpen) && <div className="h-6 w-px bg-slate-200 hidden md:block" />}

          {/* Current View Title & Institutional Breadcrumb */}
          <div className="min-w-0 truncate">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-amber-700/80 uppercase tracking-wider hidden sm:flex">
              <span>Chanakya ERP</span>
              <span>/</span>
              <span>Academic Platform</span>
            </div>
            <h1 className="font-serif font-bold text-xs sm:text-sm text-slate-900 tracking-tight truncate">
              {title}
            </h1>
          </div>
        </div>

        {/* Right Section: Streamlined & De-Cluttered Executive Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Quick Return to Public Website */}
          <button
            onClick={onGoHome}
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-amber-50 text-slate-700 hover:text-amber-950 border border-slate-200 hover:border-amber-300 text-xs font-bold transition shadow-sm"
            title="Return to Public Chanakya University Website"
          >
            <Globe size={13} className="text-amber-600" />
            <span className="hidden xl:inline">Public Site</span>
          </button>

          {/* 1. Active Role Switcher */}
          <div className="relative">
            <button 
              onClick={() => {
                const next = !roleMenuOpen;
                closeAllMenus();
                setRoleMenuOpen(next);
              }}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-950 border border-amber-500/30 text-xs font-bold transition shadow-sm"
              title="Switch Active Institutional Role"
            >
              <ShieldCheck size={14} className="text-amber-700 shrink-0" />
              <span className="hidden md:inline font-medium text-amber-800 text-[11px]">Role:</span>
              <span className="truncate max-w-[90px] sm:max-w-[130px]">{user?.roleTitle?.split('&')[0]}</span>
              <ChevronDown size={12} className="text-amber-700 opacity-70 shrink-0" />
            </button>

            {roleMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-amber-900/15 py-2 z-50 text-xs animate-fadeIn">
                <div className="px-3.5 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-amber-700 border-b border-slate-100 flex items-center justify-between">
                  <span>Switch Institutional Persona</span>
                  <span className="font-mono text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">
                    9 ROLES
                  </span>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                  {rolesList.map((r) => (
                    <button
                      key={r.role}
                      onClick={() => {
                        switchRole(r.role);
                        setRoleMenuOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 flex items-center justify-between hover:bg-amber-50/70 transition ${
                        user?.role === r.role ? 'bg-amber-50 font-bold text-amber-900 border-l-4 border-amber-600' : 'text-slate-700'
                      }`}
                    >
                      <div>
                        <div className="font-bold">{r.label}</div>
                        <div className="text-[10px] text-slate-400">{r.name}</div>
                      </div>
                      {user?.role === r.role && (
                        <span className="w-2 h-2 rounded-full bg-amber-600 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 2. System Resilience Telemetry (Compact Status Pill) */}
          <div className="relative hidden md:block">
            <button
              onClick={() => {
                const next = !healthMenuOpen;
                closeAllMenus();
                setHealthMenuOpen(next);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition shadow-sm ${
                isAllHealthy
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100 animate-pulse'
              }`}
              title="System Resilience Telemetry — Fault Isolation Status"
            >
              <span className={`w-2 h-2 rounded-full ${isAllHealthy ? 'bg-emerald-500' : 'bg-rose-500 animate-ping'}`} />
              <span className="font-mono text-[11px]">{healthyCount}/8 Active</span>
              <ChevronDown size={11} className="opacity-60" />
            </button>

            {healthMenuOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-amber-900/15 p-4 z-50 text-xs animate-fadeIn space-y-2">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div>
                    <div className="font-serif font-bold text-slate-900">System Resilience Telemetry</div>
                    <div className="text-[10px] text-slate-500">Zero-Cascading Fault Isolation Monitor</div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold">
                    Monorepo
                  </span>
                </div>

                <div className="max-h-60 overflow-y-auto space-y-1.5 divide-y divide-slate-50">
                  {modulesList.map((m) => (
                    <div key={m.id} className="pt-1.5 flex items-center justify-between text-[11px]">
                      <div>
                        <div className="font-bold text-slate-800">{m.name}</div>
                        <div className="text-[10px] text-slate-400">{m.team}</div>
                      </div>
                      <div>
                        {m.status === 'HEALTHY' ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[10px]">
                            <CheckCircle2 size={12} /> Healthy
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-600 font-bold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 text-[10px]">
                            <AlertTriangle size={11} /> Isolated
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-500 italic">
                  Complete fault isolation: single module failure does not compromise university operations.
                </div>
              </div>
            )}
          </div>

          {/* Quick QR Validator & Scanner Launcher */}
          <button
            onClick={() => {
              closeAllMenus();
              setQrValidatorOpen(true);
            }}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-[#0a1e3b] transition shadow-2xs"
            title="Scan, Decode & Cryptographically Validate any University QR Token"
          >
            <QrCode size={13} className="text-amber-600" />
            <span>Verify QR</span>
          </button>

          {/* 3. Notifications Bell */}
          <div className="relative">
            <button 
              onClick={() => {
                const next = !notifMenuOpen;
                closeAllMenus();
                setNotifMenuOpen(next);
              }}
              className="text-slate-600 hover:text-amber-800 p-2 rounded-xl hover:bg-amber-50 transition relative"
              title="Campus Notifications"
            >
              <Bell size={17} />
              <span className="w-2 h-2 rounded-full bg-amber-500 absolute top-1.5 right-1.5" />
            </button>

            {notifMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-amber-900/15 p-3 z-50 text-xs animate-fadeIn space-y-2">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="font-bold text-slate-900">Notifications</span>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                    3 New
                  </span>
                </div>
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  <div className="p-2 rounded-lg bg-amber-50/60 border border-amber-200/50">
                    <p className="font-bold text-[11px] text-amber-950">CodeArena Lab Stations Online</p>
                    <p className="text-[10px] text-slate-600">8 stations reporting live telemetry for Python &amp; Java curriculum.</p>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <p className="font-bold text-[11px] text-slate-800">Biometric Sync Complete</p>
                    <p className="text-[10px] text-slate-500">EduHRMS verified 4 faculty punch events for today.</p>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <p className="font-bold text-[11px] text-slate-800">DPDP Compliance Verified</p>
                    <p className="text-[10px] text-slate-500">Digital Personal Data Protection audit passed 10/10.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 4. Dedicated "3 Dots" Menu (Quick Actions & Secondary Options) */}
          <div className="relative">
            <button 
              onClick={() => {
                const next = !moreMenuOpen;
                closeAllMenus();
                setMoreMenuOpen(next);
              }}
              className={`flex items-center justify-center h-9 w-9 rounded-xl transition ${
                moreMenuOpen 
                  ? 'bg-amber-100 text-amber-950 border border-amber-300' 
                  : 'text-slate-600 hover:text-amber-900 hover:bg-amber-50'
              }`}
              aria-label="Quick options (3 dots)"
              title="Quick Options (3 dots)"
            >
              <MoreVertical size={17} />
            </button>

            {moreMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-amber-900/15 py-2 z-50 text-xs animate-fadeIn divide-y divide-slate-100">
                <div className="px-3.5 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Quick Actions
                </div>
                <div className="py-1">
                  <button
                    onClick={() => {
                      closeAllMenus();
                      onGoHome();
                    }}
                    className="w-full text-left px-3.5 py-2 flex items-center gap-2.5 hover:bg-amber-50/70 text-slate-700 transition"
                  >
                    <Globe size={14} className="text-amber-600 shrink-0" />
                    <div>
                      <div className="font-bold">Visit Public Website</div>
                      <div className="text-[10px] text-slate-400">Institutional landing page &amp; admissions</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      closeAllMenus();
                      if (onNavigateModule) onNavigateModule('help');
                    }}
                    className="w-full text-left px-3.5 py-2 flex items-center gap-2.5 hover:bg-amber-50/70 text-slate-700 transition"
                  >
                    <HelpCircle size={14} className="text-sky-600 shrink-0" />
                    <div>
                      <div className="font-bold">Help &amp; Campus Directory</div>
                      <div className="text-[10px] text-slate-400">Support tickets &amp; faculty contacts</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      closeAllMenus();
                      if (onNavigateModule) onNavigateModule('approvals');
                    }}
                    className="w-full text-left px-3.5 py-2 flex items-center gap-2.5 hover:bg-amber-50/70 text-slate-700 transition"
                  >
                    <CheckSquare size={14} className="text-emerald-600 shrink-0" />
                    <div>
                      <div className="font-bold">Approvals Queue</div>
                      <div className="text-[10px] text-slate-400">Leave, duty &amp; capstone sign-offs</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      closeAllMenus();
                      if (onNavigateModule) onNavigateModule('settings');
                    }}
                    className="w-full text-left px-3.5 py-2 flex items-center gap-2.5 hover:bg-amber-50/70 text-slate-700 transition"
                  >
                    <Settings size={14} className="text-slate-600 shrink-0" />
                    <div>
                      <div className="font-bold">System Settings</div>
                      <div className="text-[10px] text-slate-400">Security governance &amp; 2FA</div>
                    </div>
                  </button>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      closeAllMenus();
                      if (onNavigateModule) onNavigateModule('privacy');
                    }}
                    className="w-full text-left px-3.5 py-1.5 flex items-center gap-2 text-slate-500 hover:text-amber-800 text-[11px] transition"
                  >
                    <Shield size={12} className="text-amber-600" />
                    <span>DPDP Privacy Policy</span>
                  </button>
                  <button
                    onClick={() => {
                      closeAllMenus();
                      if (onNavigateModule) onNavigateModule('terms');
                    }}
                    className="w-full text-left px-3.5 py-1.5 flex items-center gap-2 text-slate-500 hover:text-amber-800 text-[11px] transition"
                  >
                    <Lock size={12} className="text-amber-600" />
                    <span>Terms of Academic Use</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="h-5 w-px bg-slate-200 mx-0.5 hidden sm:block" />

          {/* 5. Consolidated User Profile Menu */}
          <div className="relative">
            <button 
              onClick={() => {
                const next = !profileMenuOpen;
                closeAllMenus();
                setProfileMenuOpen(next);
              }}
              className="flex items-center gap-2 p-1 pl-1.5 rounded-xl hover:bg-amber-50/80 border border-transparent hover:border-amber-200 transition"
              title={`${user?.name || "Deepak B"} (${user?.role})`}
            >
              {/* Gradient Avatar */}
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#0a1e3b] to-[#1e3a8a] text-amber-300 font-serif font-bold text-xs shadow-sm border border-amber-400/40 shrink-0">
                {user?.name?.charAt(0) || "D"}
              </div>

              {/* Name & Role (Collapsed on smaller screens, executive on desktop) */}
              <div className="hidden xl:block text-left">
                <p className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[120px]">
                  {user?.name || "Deepak B"}
                </p>
                <div className="mt-0.5">{getRoleBadge(user?.role)}</div>
              </div>

              <ChevronDown size={12} className="text-slate-400 hidden xl:block shrink-0" />
            </button>

            {profileMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-amber-900/15 py-2.5 z-50 text-xs animate-fadeIn divide-y divide-slate-100">
                {/* Profile Header */}
                <div className="px-4 py-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#0a1e3b] to-[#1e3a8a] text-amber-300 font-serif font-bold text-sm border border-amber-400/40 shrink-0">
                      {user?.name?.charAt(0) || "D"}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 truncate">{user?.name || "Deepak B"}</p>
                      <p className="text-[11px] text-slate-500 font-mono truncate">{user?.email || "deepak.b@chanakyauniversity.edu.in"}</p>
                      <p className="text-[10px] text-amber-700 font-mono mt-0.5 font-bold">{user?.employeeId || "CUP2025/00303"}</p>
                    </div>
                  </div>
                </div>

                {/* Quick Nav Links */}
                <div className="py-1.5 px-1">
                  <button
                    onClick={() => {
                      closeAllMenus();
                      if (onNavigateModule) onNavigateModule('settings');
                    }}
                    className="w-full text-left px-3 py-1.5 rounded-lg flex items-center gap-2 hover:bg-amber-50 text-slate-700 transition"
                  >
                    <Settings size={14} className="text-slate-500" />
                    <span>Account &amp; Security Settings</span>
                  </button>
                  <button
                    onClick={() => {
                      closeAllMenus();
                      onGoHome();
                    }}
                    className="w-full text-left px-3 py-1.5 rounded-lg flex items-center gap-2 hover:bg-amber-50 text-slate-700 transition"
                  >
                    <Globe size={14} className="text-amber-600" />
                    <span>View Public University Site</span>
                  </button>
                </div>

                {/* Sign Out Button */}
                <div className="pt-1.5 px-1">
                  <button
                    onClick={() => {
                      closeAllMenus();
                      logout();
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 text-rose-600 hover:bg-rose-50 font-bold transition"
                  >
                    <LogOut size={14} className="text-rose-500" />
                    <span>Sign Out of Institutional Portal</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Global Real QR Scanner & Cryptographic Validator Modal */}
      <QRScannerValidatorModal 
        isOpen={qrValidatorOpen} 
        onClose={() => setQrValidatorOpen(false)} 
      />
    </header>
  );
};
export default PortalHeader;

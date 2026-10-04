import React, { useState } from 'react';
import { 
  LayoutDashboard, Users, BookOpen, GraduationCap, Code2, 
  Video, Bot, GitBranch, FolderKanban, HelpCircle, CheckSquare, 
  Settings, ChevronRight, Search, X, Calendar, LucideIcon, Monitor,
  DollarSign, ShieldCheck, Globe, Award, Briefcase, TrendingUp
} from 'lucide-react';
import { useAuth, UserRole } from '../../context/AuthContext';
import { ChanakyaLogo } from '../ui/ChanakyaLogo';

interface PortalSidebarProps {
  isOpen: boolean;
  activeModule: string;
  onSelectModule: (moduleKey: string) => void;
  onCloseMobile?: () => void;
}

interface NavItem {
  key: string;
  label: string;
  icon: LucideIcon;
}

export const PortalSidebar: React.FC<PortalSidebarProps> = ({
  isOpen,
  activeModule,
  onSelectModule,
  onCloseMobile
}) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const getNavItemsForRole = (role?: UserRole): NavItem[] => {
    switch (role) {

      // ── STUDENT ──────────────────────────────────────────────────────────
      case 'STUDENT':
        return [
          { key: 'dashboard',    label: 'Dashboard Overview',       icon: LayoutDashboard },
          { key: 'academics',    label: 'Smart Attendance & QR',    icon: BookOpen },
          { key: 'exams',        label: 'Exams & Hall Ticket',      icon: GraduationCap },
          { key: 'finance',      label: 'Fee Clearance & Receipts', icon: DollarSign },
          { key: 'codearena',    label: 'CodeArena Lab',            icon: Code2 },
          { key: 'presentation', label: 'PresentAI Viva',           icon: Video },
          { key: 'unihub',       label: 'UniHub Repositories',      icon: GitBranch },
          { key: 'trackit',      label: 'Capstone TrackIt',         icon: FolderKanban },
          { key: 'bot',          label: 'Campus AI Oracle',         icon: Bot },
          { key: 'help',         label: 'Help & Directory',         icon: HelpCircle },
          { key: 'settings',     label: 'Settings & Security',      icon: Settings },
        ];

      // ── FACULTY ──────────────────────────────────────────────────────────
      case 'FACULTY':
        return [
          { key: 'dashboard',       label: 'Dashboard Overview',       icon: LayoutDashboard },
          { key: 'faculty_dossier', label: 'Research Dossier & Profile',icon: Award },
          { key: 'hrms',            label: 'HRMS & Attendance KPIs',   icon: Calendar },
          { key: 'academics',       label: 'Smart Attendance QR',      icon: BookOpen },
          { key: 'exams',           label: 'Exam Question Studio',     icon: GraduationCap },
          { key: 'codearena',       label: 'CodeArena Lab Stations',   icon: Monitor },
          { key: 'trackit',         label: 'Capstone Mentorship',      icon: FolderKanban },
          { key: 'presentation',    label: 'PresentAI Viva',           icon: Video },
          { key: 'approvals',       label: 'Approvals Queue',          icon: CheckSquare },
          { key: 'bot',             label: 'Campus AI Oracle',         icon: Bot },
          { key: 'help',            label: 'Help & Directory',         icon: HelpCircle },
          { key: 'settings',        label: 'Settings & Security',      icon: Settings },
        ];

      // ── DEAN ─────────────────────────────────────────────────────────────
      case 'DEAN':
        return [
          { key: 'dashboard',       label: "Dean's Dashboard",              icon: LayoutDashboard },
          { key: 'faculty_dossier', label: 'Faculty Dossiers & APARs',      icon: Award },
          { key: 'hrms',            label: 'School Workload Matrix',        icon: Users },
          { key: 'academics',       label: 'Academic Oversight',            icon: BookOpen },
          { key: 'exams',           label: 'Examination Oversight',         icon: GraduationCap },
          { key: 'unihub',          label: 'Research Repository',           icon: GitBranch },
          { key: 'trackit',         label: 'Capstone Oversight',            icon: FolderKanban },
          { key: 'approvals',       label: 'Approvals & Recommendations',   icon: CheckSquare },
          { key: 'bot',             label: 'Campus AI Oracle',              icon: Bot },
          { key: 'help',            label: 'Help & Directory',              icon: HelpCircle },
          { key: 'settings',        label: 'Settings & Security',           icon: Settings },
        ];

      // ── EXAMINATION CONTROLLER ───────────────────────────────────────────
      case 'EXAMINATION_CONTROLLER':
        return [
          { key: 'dashboard', label: 'Exam Controller Dashboard',     icon: LayoutDashboard },
          { key: 'exams',     label: 'Examination Management',        icon: GraduationCap },
          { key: 'academics', label: 'Academic Calendar & Schedules', icon: BookOpen },
          { key: 'approvals', label: 'Exam Sanctions & Approvals',    icon: CheckSquare },
          { key: 'bot',       label: 'Campus AI Oracle',              icon: Bot },
          { key: 'help',      label: 'Help & Directory',              icon: HelpCircle },
          { key: 'settings',  label: 'Settings & Security',           icon: Settings },
        ];

      // ── PLACEMENT OFFICER ────────────────────────────────────────────────
      case 'PLACEMENT_OFFICER':
        return [
          { key: 'dashboard', label: 'Placement Dashboard',           icon: LayoutDashboard },
          { key: 'trackit',   label: 'Internship & Placement TrackIt',icon: TrendingUp },
          { key: 'unihub',    label: 'Student Research Portfolios',   icon: GitBranch },
          { key: 'codearena', label: 'Student Coding Assessments',    icon: Code2 },
          { key: 'approvals', label: 'Placement Sanctions',           icon: CheckSquare },
          { key: 'bot',       label: 'Campus AI Oracle',              icon: Bot },
          { key: 'help',      label: 'Help & Directory',              icon: HelpCircle },
          { key: 'settings',  label: 'Settings & Security',           icon: Settings },
        ];

      // ── HR ADMIN ─────────────────────────────────────────────────────────
      case 'HR_ADMIN':
        return [
          { key: 'dashboard', label: 'Dashboard Overview',      icon: LayoutDashboard },
          { key: 'hrms',      label: 'Faculty HRMS & Dossiers', icon: Users },
          { key: 'academics', label: 'Biometric Attendance',    icon: BookOpen },
          { key: 'approvals', label: 'Leave Approvals',         icon: CheckSquare },
          { key: 'bot',       label: 'Campus AI Oracle',        icon: Bot },
          { key: 'help',      label: 'Help & Directory',        icon: HelpCircle },
          { key: 'settings',  label: 'Settings & Security',     icon: Settings },
        ];

      // ── COORDINATOR ──────────────────────────────────────────────────────
      case 'COORDINATOR':
        return [
          { key: 'dashboard',    label: 'Dashboard Overview',    icon: LayoutDashboard },
          { key: 'trackit',      label: 'Capstone Milestones',   icon: FolderKanban },
          { key: 'hrms',         label: 'Workload Matrix',       icon: Users },
          { key: 'academics',    label: 'Curriculum Attendance', icon: BookOpen },
          { key: 'presentation', label: 'Viva Evaluations',      icon: Video },
          { key: 'codearena',    label: 'CodeArena Review',      icon: Code2 },
          { key: 'unihub',       label: 'UniHub Repository',     icon: GitBranch },
          { key: 'approvals',    label: 'Milestone Approvals',   icon: CheckSquare },
          { key: 'bot',          label: 'Campus AI Oracle',      icon: Bot },
          { key: 'help',         label: 'Help & Directory',      icon: HelpCircle },
          { key: 'settings',     label: 'Settings & Security',   icon: Settings },
        ];

      // ── COURSE ALLOCATOR ─────────────────────────────────────────────────
      case 'COURSE_ALLOCATOR':
        return [
          { key: 'dashboard', label: 'Dashboard Overview',           icon: LayoutDashboard },
          { key: 'hrms',      label: 'Workload Balancing',           icon: Users },
          { key: 'academics', label: 'Class Schedules & Timetables', icon: BookOpen },
          { key: 'unihub',    label: 'Course Repository',            icon: GitBranch },
          { key: 'approvals', label: 'Course Allocations',           icon: CheckSquare },
          { key: 'bot',       label: 'Campus AI Oracle',             icon: Bot },
          { key: 'help',      label: 'Help & Directory',             icon: HelpCircle },
          { key: 'settings',  label: 'Settings & Security',          icon: Settings },
        ];

      // ── LIBRARIAN ────────────────────────────────────────────────────────
      case 'LIBRARIAN':
        return [
          { key: 'dashboard', label: 'Dashboard Overview',  icon: LayoutDashboard },
          { key: 'unihub',    label: 'UniHub Repository',   icon: GitBranch },
          { key: 'approvals', label: 'Accession Approvals', icon: CheckSquare },
          { key: 'bot',       label: 'Campus AI Oracle',    icon: Bot },
          { key: 'help',      label: 'Help & Directory',    icon: HelpCircle },
          { key: 'settings',  label: 'Settings & Security', icon: Settings },
        ];

      // ── LAB INSTRUCTOR ───────────────────────────────────────────────────
      case 'LAB_INSTRUCTOR':
        return [
          { key: 'dashboard', label: 'Dashboard Overview',        icon: LayoutDashboard },
          { key: 'codearena', label: 'CodeArena Stations & Logs', icon: Monitor },
          { key: 'academics', label: 'Lab Attendance QR',         icon: BookOpen },
          { key: 'exams',     label: 'Practical Lab Exams',       icon: GraduationCap },
          { key: 'bot',       label: 'Campus AI Oracle',          icon: Bot },
          { key: 'help',      label: 'Help & Directory',          icon: HelpCircle },
          { key: 'settings',  label: 'Settings & Security',       icon: Settings },
        ];

      // ── FINANCE ──────────────────────────────────────────────────────────
      case 'FINANCE':
        return [
          { key: 'dashboard', label: 'Dashboard Overview',     icon: LayoutDashboard },
          { key: 'finance',   label: 'Student Fee Ledgers',    icon: DollarSign },
          { key: 'hrms',      label: 'Payroll & Salary Slabs', icon: Users },
          { key: 'approvals', label: 'Disbursement Approvals', icon: CheckSquare },
          { key: 'bot',       label: 'Campus AI Oracle',       icon: Bot },
          { key: 'help',      label: 'Help & Directory',       icon: HelpCircle },
          { key: 'settings',  label: 'Settings & Security',    icon: Settings },
        ];

      // ── WEBSITE CONTROLLER ───────────────────────────────────────────────
      case 'WEBSITE_CONTROLLER':
        return [
          { key: 'dashboard',       label: 'Dashboard Overview',       icon: LayoutDashboard },
          { key: 'website_manager', label: 'Website Content & Events', icon: Globe },
          { key: 'bot',             label: 'Campus AI Oracle',         icon: Bot },
          { key: 'help',            label: 'Help & Directory',         icon: HelpCircle },
          { key: 'settings',        label: 'Settings & Security',      icon: Settings },
        ];

      // ── ADMISSION OFFICER ────────────────────────────────────────────────
      case 'ADMISSION_OFFICER':
        return [
          { key: 'dashboard',  label: 'Dashboard Overview',     icon: LayoutDashboard },
          { key: 'admissions', label: 'Admissions & Enrolment', icon: GraduationCap },
          { key: 'bot',        label: 'Campus AI Oracle',       icon: Bot },
          { key: 'help',       label: 'Help & Directory',       icon: HelpCircle },
          { key: 'settings',   label: 'Settings & Security',    icon: Settings },
        ];

      // ── COURSE UPDATOR ───────────────────────────────────────────────────
      // FIXED: Was falling through to SUPER_ADMIN (security breach)
      case 'COURSE_UPDATOR':
        return [
          { key: 'dashboard', label: 'Dashboard Overview',        icon: LayoutDashboard },
          { key: 'academics', label: 'Syllabus & Timetables',     icon: BookOpen },
          { key: 'unihub',    label: 'Course Content Repository', icon: GitBranch },
          { key: 'trackit',   label: 'Curriculum Progress',       icon: FolderKanban },
          { key: 'approvals', label: 'Content Approvals',         icon: CheckSquare },
          { key: 'bot',       label: 'Campus AI Oracle',          icon: Bot },
          { key: 'help',      label: 'Help & Directory',          icon: HelpCircle },
          { key: 'settings',  label: 'Settings & Security',       icon: Settings },
        ];

      // ── STAFF ────────────────────────────────────────────────────────────
      // FIXED: Was falling through to SUPER_ADMIN (security breach)
      case 'STAFF':
        return [
          { key: 'dashboard', label: 'Dashboard Overview',       icon: LayoutDashboard },
          { key: 'hrms',      label: 'Staff HRMS & Leave',       icon: Users },
          { key: 'approvals', label: 'Administrative Approvals', icon: CheckSquare },
          { key: 'bot',       label: 'Campus AI Oracle',         icon: Bot },
          { key: 'help',      label: 'Help & Directory',         icon: HelpCircle },
          { key: 'settings',  label: 'Settings & Security',      icon: Settings },
        ];

      // ── IT_ADMIN — System & Cybersecurity ONLY ───────────────────────────
      // Governance/WAF/Security is EXCLUSIVELY IT domain, NOT Registrar's job
      case 'IT_ADMIN':
        return [
          { key: 'dashboard',  label: 'System Overview',           icon: LayoutDashboard },
          { key: 'governance', label: 'Governance & WAF Security', icon: ShieldCheck },
          { key: 'bot',        label: 'Campus AI Oracle',          icon: Bot },
          { key: 'help',       label: 'Help & Directory',          icon: HelpCircle },
          { key: 'settings',   label: 'System Settings & Audit',   icon: Settings },
        ];

      // ── SUPER_ADMIN (University Registrar) — Academic Admin ONLY ─────────
      // NO governance/WAF — that belongs exclusively to IT_ADMIN
      case 'SUPER_ADMIN':
      default:
        return [
          { key: 'dashboard',       label: 'Registrar Dashboard',            icon: LayoutDashboard },
          { key: 'admissions',      label: 'Admissions & Enrolment',         icon: GraduationCap },
          { key: 'hrms',            label: 'Faculty HRMS & Workload',        icon: Users },
          { key: 'academics',       label: 'Academic Attendance & Schedules',icon: BookOpen },
          { key: 'exams',           label: 'Examinations Oversight',         icon: GraduationCap },
          { key: 'faculty_dossier', label: 'Faculty Dossiers & APARs',       icon: Award },
          { key: 'finance',         label: 'Finance & Fee Oversight',        icon: DollarSign },
          { key: 'approvals',       label: 'Institutional Approvals',        icon: CheckSquare },
          { key: 'website_manager', label: 'Public Website Manager',         icon: Globe },
          { key: 'unihub',          label: 'Research Repository',            icon: GitBranch },
          { key: 'trackit',         label: 'Capstone TrackIt',               icon: FolderKanban },
          { key: 'bot',             label: 'Campus AI Oracle',               icon: Bot },
          { key: 'help',            label: 'Help & Directory',               icon: HelpCircle },
          { key: 'settings',        label: 'Settings & Security',            icon: Settings },
        ];
    }
  };

  const navItems = getNavItemsForRole(user?.role);
  const filteredItems = navItems.filter(item =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-950/75 backdrop-blur-sm md:hidden animate-fadeIn"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-gradient-to-b from-[#08172c] via-[#0a1e3b] to-[#050f1d] text-white select-none shadow-2xl md:shadow-lg shrink-0 transition-all duration-300 ease-in-out md:relative md:inset-y-auto md:left-auto md:z-auto md:h-screen overflow-hidden ${
          isOpen
            ? 'w-72 sm:w-76 md:w-72 lg:w-76 xl:w-80 p-3 sm:p-3.5 border-r border-amber-500/25 translate-x-0 opacity-100'
            : '-translate-x-full md:translate-x-0 md:w-0 md:p-0 md:border-r-0 md:opacity-0 md:overflow-hidden pointer-events-none'
        }`}
      >
        <div className="flex flex-col h-full w-full min-w-0 min-h-0 overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
            <div
              onClick={() => onSelectModule('dashboard')}
              className="cursor-pointer group flex items-center"
              title="Chanakya University"
            >
              <ChanakyaLogo theme="white" height={32} />
            </div>
            <button
              onClick={onCloseMobile}
              className="flex items-center justify-center h-8 w-8 rounded-xl p-1 text-slate-300 hover:bg-white/10 hover:text-white md:hidden"
              aria-label="Close navigation"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Role Badge */}
          <div className="my-2.5 px-3 py-2 rounded-xl bg-white/5 border border-amber-400/25 text-white flex items-center justify-between shadow-inner backdrop-blur-sm shrink-0">
            <div className="min-w-0 pr-2 flex-1">
              <span className="text-[9px] font-extrabold tracking-widest text-amber-400 uppercase block">
                PORTAL WORKSPACE
              </span>
              <span className="font-serif font-bold text-xs tracking-wide text-white truncate block">
                {user?.roleTitle?.split('&')[0]?.split('(')[0] || 'University Portal'}
              </span>
            </div>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-400/30 shrink-0">
              {user?.role}
            </span>
          </div>

          {/* Quick Search */}
          {navItems.length > 7 && (
            <div className="mb-2 shrink-0">
              <div className="relative">
                <Search size={12} className="absolute left-2.5 top-2 text-amber-400/70" />
                <input
                  type="text"
                  placeholder="Quick jump..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#16284F]/80 text-[11px] text-white placeholder-slate-400 pl-7 pr-2.5 py-1.5 rounded-lg border border-white/10 focus:outline-none focus:border-amber-400 transition"
                />
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden space-y-1 pr-1 overscroll-contain">
            {filteredItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeModule === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => {
                    onSelectModule(item.key);
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className={`w-full group flex items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition-all min-h-[36px] text-left overflow-hidden ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-[#0a1e3b] shadow-md shadow-amber-500/20 border-l-4 border-amber-300'
                      : 'text-slate-300 hover:bg-white/10 hover:text-amber-300 active:bg-white/15'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-1">
                    <Icon
                      size={15}
                      className={`shrink-0 transition-colors ${
                        isActive ? 'text-[#0a1e3b]' : 'text-amber-400/85 group-hover:text-amber-300'
                      }`}
                    />
                    <span className="truncate block">{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-[#0a1e3b] shrink-0" />}
                </button>
              );
            })}
          </nav>

          {/* Public Website Link */}
          <div className="pt-2.5 border-t border-white/10 shrink-0">
            <button
              onClick={() => onSelectModule('landing')}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500/15 to-amber-600/20 hover:from-amber-500/30 hover:to-amber-600/35 text-amber-300 border border-amber-500/40 text-xs font-bold transition shadow-sm group"
            >
              <Globe size={13} className="text-amber-400 group-hover:rotate-12 transition-transform" />
              <span>Public University Portal</span>
            </button>
          </div>

          {/* Compliance Links */}
          <div className="py-2 text-center shrink-0">
            <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400">
              <button
                onClick={() => onSelectModule('privacy')}
                className={`hover:text-amber-300 transition ${activeModule === 'privacy' ? 'text-amber-400 font-bold underline' : ''}`}
              >
                Privacy Policy
              </button>
              <span>&bull;</span>
              <button
                onClick={() => onSelectModule('terms')}
                className={`hover:text-amber-300 transition ${activeModule === 'terms' ? 'text-amber-400 font-bold underline' : ''}`}
              >
                Terms of Use
              </button>
            </div>
          </div>

        </div>
      </aside>
    </>
  );
};

export default PortalSidebar;

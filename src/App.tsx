import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './components/landing/LandingPage';
import PortalHeader from './components/portal/PortalHeader';
import PortalSidebar from './components/portal/PortalSidebar';
import DashboardOverview from './components/portal/DashboardOverview';
import { ShieldCheck } from 'lucide-react';

// Decoupled, Fault-Isolated Autonomous Team Modules
import HrmsModule from './modules/team01_hrms';
import AttendanceModule from './modules/team02_attendance';
import ExamsModule from './modules/team03_exams';
import CodeArenaModule from './modules/team04_codearena';
import PresentationModule from './modules/team05_presentation';
import CampusBotModule from './modules/team06_campusbot';
import UniHubModule from './modules/team07_unihub';
import TrackItModule from './modules/team08_trackit';
import CampusBotDrawer from './components/modules/CampusBotDrawer';
import PrivacyPolicyView from './components/legal/PrivacyPolicyView';
import TermsOfUseView from './components/legal/TermsOfUseView';
import HelpCenterView from './components/portal/HelpCenterView';
import ApprovalsView from './components/portal/ApprovalsView';
import SettingsView from './components/portal/SettingsView';
import StudentFeeFinanceView from './components/portal/StudentFeeFinanceView';
import SuperAdminGovernanceView from './components/portal/SuperAdminGovernanceView';
import WebsiteContentManagerView from './components/portal/WebsiteContentManagerView';
import FacultyDossierEditor from './components/portal/FacultyDossierEditor';
import AdmissionManagementView from './components/portal/AdmissionManagementView';

// Modules that are always accessible regardless of role (legal / help / settings)
const UNIVERSAL_MODULES = new Set(['dashboard', 'help', 'settings', 'privacy', 'terms', 'bot']);

// Panel rendered when a user attempts to access an unauthorized module
const AccessDeniedPanel: React.FC<{ moduleKey: string }> = ({ moduleKey }) => (
  <div className="flex flex-col items-center justify-center gap-4 min-h-[60vh] text-center px-6">
    <ShieldCheck size={48} className="text-amber-500" />
    <h2 className="text-2xl font-bold text-cu-navy">Access Restricted</h2>
    <p className="text-sm text-gray-500 max-w-md">
      Your institutional role does not permit access to the <span className="font-semibold text-cu-navy">{moduleKey}</span> module.
      If you believe this is an error, please contact the University Registrar or your Department Head.
    </p>
    <p className="text-xs text-gray-400 font-mono">RBAC Policy — UniSphere Zero-Trust Access Control v2.0</p>
  </div>
);


const AppContent: React.FC = () => {
  const { currentView, setCurrentView, isAuthenticated, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeModule, setActiveModule] = useState('dashboard');

  const getModuleTitle = () => {
    switch (activeModule) {
      case 'hrms': return 'EduHRMS — Faculty Attendance, Workload & Dossiers';
      case 'academics': return 'Smart Attendance — QR Verification & Timetables';
      case 'exams': return 'ExamShield — Secure Examination & Proctoring Studio';
      case 'codearena': return 'CodeArena — Sandboxed IDE & Algorithmic Contests';
      case 'presentation': return 'PresentAI — Multi-Modal Viva & Presentation Studio';
      case 'bot': return 'Campus AI Oracle — Multi-Persona Intelligence Engine';
      case 'unihub': return 'UniHub — Research Publications & Institutional Repositories';
      case 'trackit': return 'TrackIt — Capstone Milestones & Industry Internships';
      case 'help': return 'Campus Knowledge Base & Support Directory';
      case 'approvals': return 'Administrative & Academic Approvals Console';
      case 'settings': return 'Account Settings & Security Governance';
      case 'finance': return 'Finance & Accounts — Student Fee Ledger & Bursar Console';
      case 'governance': return 'University Governance — WAF Security & Cryptographic Audits';
      case 'admissions': return 'Directorate of Admissions — Enrolment & Offer Letter Operations';
      case 'website_manager': return 'Public Website & Media Operations Console';
      case 'faculty_dossier': return 'Faculty Research Dossier & Mentorship Portfolio';
      case 'privacy': return 'Institutional Privacy Policy (DPDP 2023 Compliant)';
      case 'terms': return 'Terms of Academic Use & Digital Honor Code';
      default: return 'University Portal Dashboard';
    }
  };

  // If in public website clone view
  if (currentView === 'landing' || !isAuthenticated) {
    return <LandingPage onOpenPortal={() => setCurrentView('dashboard')} />;
  }

  // Render Portal Shell
  return (
    <div className="flex h-screen overflow-hidden bg-cu-canvas">
      {/* Sidebar Navigation matching Project-tracker-main */}
      <PortalSidebar 
        isOpen={sidebarOpen}
        activeModule={activeModule}
        onSelectModule={(mod) => {
          if (mod === 'landing') {
            setCurrentView('landing');
          } else {
            setActiveModule(mod);
          }
        }}
        onCloseMobile={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Universal Portal Header with Gold Stripe and ChanakyaLogo */}
        <PortalHeader 
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          isSidebarOpen={sidebarOpen}
          title={getModuleTitle()}
          onGoHome={() => setCurrentView('landing')}
          onNavigateModule={(mod) => setActiveModule(mod)}
        />

        {/* View Switcher with Decoupled Fault Isolation — RBAC enforced at render level */}
        <main className="flex-1">
          {(() => {
            // Universal modules bypass the allowedModules check.
            const isUniversal = UNIVERSAL_MODULES.has(activeModule);
            const isAllowed = isUniversal || (user?.allowedModules ?? []).includes(activeModule);

            if (!isAllowed) {
              return <AccessDeniedPanel moduleKey={activeModule} />;
            }

            return (
              <>
                {activeModule === 'dashboard' && (
                  <DashboardOverview onNavigateModule={(mod) => setActiveModule(mod)} />
                )}
                {activeModule === 'hrms' && <HrmsModule />}
                {activeModule === 'academics' && <AttendanceModule />}
                {activeModule === 'exams' && <ExamsModule />}
                {activeModule === 'codearena' && <CodeArenaModule />}
                {activeModule === 'presentation' && <PresentationModule />}
                {activeModule === 'bot' && <CampusBotModule />}
                {activeModule === 'unihub' && <UniHubModule />}
                {activeModule === 'trackit' && <TrackItModule />}
                {activeModule === 'finance' && <StudentFeeFinanceView />}
                {activeModule === 'governance' && <SuperAdminGovernanceView />}
                {activeModule === 'admissions' && <AdmissionManagementView />}
                {activeModule === 'website_manager' && <WebsiteContentManagerView />}
                {activeModule === 'faculty_dossier' && <FacultyDossierEditor />}
                {activeModule === 'help' && <HelpCenterView />}
                {activeModule === 'approvals' && <ApprovalsView />}
                {activeModule === 'settings' && <SettingsView />}
                {activeModule === 'privacy' && <PrivacyPolicyView />}
                {activeModule === 'terms' && <TermsOfUseView />}
              </>
            );
          })()}
        </main>

        {/* Floating Quick Assistant Drawer */}
        <CampusBotDrawer />
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};
export default App;

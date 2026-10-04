import React, { useState } from 'react';
import { 
  ShieldAlert, Database, Lock, RefreshCw, FileCheck, Server, 
  CheckCircle2, AlertTriangle, Users, Check, X, Download, 
  Key, Cpu, Eye, ShieldCheck, Terminal, HardDrive, Layers
} from 'lucide-react';

interface SecurityEvent {
  id: string;
  timestamp: string;
  clientIp: string;
  geo: string;
  endpoint: string;
  eventType: string;
  threatLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  action: 'BLOCKED' | 'FLAGGED' | 'SANITIZED' | 'ALLOWED';
}

interface DatabaseSnapshot {
  id: string;
  timestamp: string;
  fileName: string;
  sizeMb: number;
  encryption: string;
  sha256Hash: string;
  verified: boolean;
}

const INITIAL_SECURITY_EVENTS: SecurityEvent[] = [
  {
    id: 'sec_01',
    timestamp: '2026-09-06 10:48:12',
    clientIp: '185.220.101.44',
    geo: 'Frankfurt, DE (Tor Exit)',
    endpoint: '/api/v1/auth/login',
    eventType: 'Brute-force credential stuffing probe',
    threatLevel: 'HIGH',
    action: 'BLOCKED',
  },
  {
    id: 'sec_02',
    timestamp: '2026-09-06 10:32:05',
    clientIp: '103.21.244.18',
    geo: 'Bengaluru, IN (Local Campus)',
    endpoint: '/api/v1/exams/papers/verify',
    eventType: 'PKI Certificate SHA-256 signature match',
    threatLevel: 'LOW',
    action: 'ALLOWED',
  },
  {
    id: 'sec_03',
    timestamp: '2026-09-06 09:55:40',
    clientIp: '194.26.29.112',
    geo: 'Amsterdam, NL (Proxy)',
    endpoint: '/api/v1/codearena/run_sandbox',
    eventType: 'gVisor syscall privilege escalation attempt',
    threatLevel: 'CRITICAL',
    action: 'BLOCKED',
  },
  {
    id: 'sec_04',
    timestamp: '2026-09-06 08:21:19',
    clientIp: '14.139.155.8',
    geo: 'New Delhi, IN (NKN Gateway)',
    endpoint: '/api/v1/attendance/manual/save',
    eventType: 'CSRF token validated & HMAC confirmed',
    threatLevel: 'LOW',
    action: 'ALLOWED',
  },
  {
    id: 'sec_05',
    timestamp: '2026-09-06 07:14:02',
    clientIp: '45.154.255.89',
    geo: 'Kyiv, UA (VPN)',
    endpoint: '/api/v1/hrms/salary/export',
    eventType: 'Unauthorized RBAC role escalation probe',
    threatLevel: 'HIGH',
    action: 'BLOCKED',
  },
];

const INITIAL_SNAPSHOTS: DatabaseSnapshot[] = [
  {
    id: 'snap_01',
    timestamp: '2026-09-06 10:00:00',
    fileName: 'unisphere_cu_prod_20260906_1000.tar.enc',
    sizeMb: 418.4,
    encryption: 'AES-256-GCM',
    sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    verified: true,
  },
  {
    id: 'snap_02',
    timestamp: '2026-09-06 09:00:00',
    fileName: 'unisphere_cu_prod_20260906_0900.tar.enc',
    sizeMb: 416.8,
    encryption: 'AES-256-GCM',
    sha256Hash: 'a8f90c1281b37d45c6e889f02341ba762d184029bc489110c9238812f8490a12',
    verified: true,
  },
  {
    id: 'snap_03',
    timestamp: '2026-09-06 08:00:00',
    fileName: 'unisphere_cu_prod_20260906_0800.tar.enc',
    sizeMb: 415.2,
    encryption: 'AES-256-GCM',
    sha256Hash: '54b4f8d930219c8392a819b183490918c72839912048921894b9102830192849',
    verified: true,
  },
];

export const SuperAdminGovernanceView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'SECURITY' | 'BACKUP' | 'RBAC' | 'SCHOOLS'>('SECURITY');
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>(INITIAL_SECURITY_EVENTS);
  const [snapshots, setSnapshots] = useState<DatabaseSnapshot[]>(INITIAL_SNAPSHOTS);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupSuccessMessage, setBackupSuccessMessage] = useState<string | null>(null);

  // RBAC permissions state matrix
  const [permissions, setPermissions] = useState<Record<string, Record<string, boolean>>>({
    STUDENT: { hrms: false, academics: true, exams: true, codearena: true, presentation: true, campusbot: true, unihub: true, trackit: true },
    FACULTY: { hrms: true, academics: true, exams: true, codearena: true, presentation: true, campusbot: true, unihub: true, trackit: true },
    HR_ADMIN: { hrms: true, academics: true, exams: false, codearena: false, presentation: false, campusbot: true, unihub: false, trackit: false },
    COORDINATOR: { hrms: true, academics: true, exams: true, codearena: true, presentation: true, campusbot: true, unihub: true, trackit: true },
    COURSE_ALLOCATOR: { hrms: true, academics: true, exams: true, codearena: false, presentation: false, campusbot: true, unihub: false, trackit: false },
    LIBRARIAN: { hrms: false, academics: false, exams: false, codearena: false, presentation: false, campusbot: true, unihub: true, trackit: false },
    LAB_INSTRUCTOR: { hrms: false, academics: true, exams: true, codearena: true, presentation: false, campusbot: true, unihub: false, trackit: false },
    FINANCE: { hrms: true, academics: false, exams: false, codearena: false, presentation: false, campusbot: true, unihub: false, trackit: false },
    SUPER_ADMIN: { hrms: true, academics: true, exams: true, codearena: true, presentation: true, campusbot: true, unihub: true, trackit: true },
  });

  const togglePermission = (role: string, mod: string) => {
    setPermissions(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [mod]: !prev[role]?.[mod]
      }
    }));
  };

  const handleTriggerSnapshot = () => {
    setIsBackingUp(true);
    setBackupSuccessMessage(null);

    setTimeout(() => {
      const now = new Date();
      const timeStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
      const randomHash = Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
      
      const newSnap: DatabaseSnapshot = {
        id: `snap_${Date.now()}`,
        timestamp: timeStr,
        fileName: `unisphere_cu_prod_${Date.now()}.tar.enc`,
        sizeMb: 421.6,
        encryption: 'AES-256-GCM',
        sha256Hash: randomHash,
        verified: true,
      };

      setSnapshots(prev => [newSnap, ...prev]);
      setIsBackingUp(false);
      setBackupSuccessMessage(`Encrypted snapshot created & verified: SHA-256 ${randomHash.slice(0, 16)}...`);

      setTimeout(() => {
        setBackupSuccessMessage(null);
      }, 5000);
    }, 1800);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cu-pill text-cu-navy text-[11px] font-bold uppercase tracking-wider mb-1">
            <Key size={12} className="text-cu-gold" />
            <span>Super Administrator &amp; Governance Center</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            Chanakya University Governance &amp; Cybersecurity Operations
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Real-time WAF telemetry, cryptographic backup snapshots, RBAC matrix, and academic school configurations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleTriggerSnapshot}
            disabled={isBackingUp}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-cu-navy hover:bg-cu-navy-light text-white rounded-xl text-xs font-semibold shadow-sm transition disabled:opacity-50"
          >
            <RefreshCw size={14} className={isBackingUp ? 'animate-spin' : ''} />
            <span>{isBackingUp ? 'Encrypting Database...' : 'Trigger AES-256 Backup'}</span>
          </button>
        </div>
      </div>

      {backupSuccessMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs font-semibold text-emerald-800 animate-fadeIn">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>{backupSuccessMessage}</span>
        </div>
      )}

      {/* Security & Health Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-cu-border p-5 shadow-sm">
          <div className="text-xs text-gray-500 font-medium">Platform Security Score</div>
          <div className="text-2xl font-bold text-emerald-700 mt-1">99.4 / 100</div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-1">ISO 27001 &amp; DPDP Compliant</div>
        </div>

        <div className="bg-white rounded-xl border border-cu-border p-5 shadow-sm">
          <div className="text-xs text-gray-500 font-medium">WAF Shield Mitigations (24h)</div>
          <div className="text-2xl font-bold text-cu-navy mt-1">48 Blocked</div>
          <div className="text-[10px] text-gray-500 mt-1">Zero Breach Incidents</div>
        </div>

        <div className="bg-white rounded-xl border border-cu-border p-5 shadow-sm">
          <div className="text-xs text-gray-500 font-medium">Encrypted Storage State</div>
          <div className="text-2xl font-bold text-cu-gold mt-1">421.6 MB</div>
          <div className="text-[10px] text-emerald-700 font-semibold mt-1">AES-256-GCM Zero-Knowledge</div>
        </div>

        <div className="bg-white rounded-xl border border-cu-border p-5 shadow-sm">
          <div className="text-xs text-gray-500 font-medium">Active System Personas</div>
          <div className="text-2xl font-bold text-cu-saffron mt-1">9 Roles</div>
          <div className="text-[10px] text-cu-navy font-semibold mt-1">Strict Least-Privilege RBAC</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 gap-4 text-xs font-bold">
        <button
          onClick={() => setActiveTab('SECURITY')}
          className={`pb-2.5 flex items-center gap-1.5 transition border-b-2 ${
            activeTab === 'SECURITY'
              ? 'border-cu-navy text-cu-navy'
              : 'border-transparent text-gray-400 hover:text-gray-700'
          }`}
        >
          <ShieldAlert size={14} />
          <span>Live WAF Security Audit Trail</span>
        </button>

        <button
          onClick={() => setActiveTab('BACKUP')}
          className={`pb-2.5 flex items-center gap-1.5 transition border-b-2 ${
            activeTab === 'BACKUP'
              ? 'border-cu-navy text-cu-navy'
              : 'border-transparent text-gray-400 hover:text-gray-700'
          }`}
        >
          <HardDrive size={14} />
          <span>Encrypted Database Backups</span>
        </button>

        <button
          onClick={() => setActiveTab('RBAC')}
          className={`pb-2.5 flex items-center gap-1.5 transition border-b-2 ${
            activeTab === 'RBAC'
              ? 'border-cu-navy text-cu-navy'
              : 'border-transparent text-gray-400 hover:text-gray-700'
          }`}
        >
          <Users size={14} />
          <span>RBAC Access Control Matrix</span>
        </button>

        <button
          onClick={() => setActiveTab('SCHOOLS')}
          className={`pb-2.5 flex items-center gap-1.5 transition border-b-2 ${
            activeTab === 'SCHOOLS'
              ? 'border-cu-navy text-cu-navy'
              : 'border-transparent text-gray-400 hover:text-gray-700'
          }`}
        >
          <Layers size={14} />
          <span>Schools &amp; Faculty Master</span>
        </button>
      </div>

      {/* TAB 1: SECURITY AUDIT TRAIL */}
      {activeTab === 'SECURITY' && (
        <div className="bg-white rounded-2xl border border-cu-border shadow-sm overflow-hidden space-y-0">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <div>
              <h3 className="text-sm font-bold text-cu-navy">Real-Time Threat Prevention Logs</h3>
              <p className="text-xs text-gray-500">Live inspection of edge ingress requests and cryptographic verifications</p>
            </div>
            <span className="text-[11px] font-mono text-gray-500">Service: waf_ingress_agent</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 border-b border-gray-200 uppercase font-semibold text-[10px] tracking-wider">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Origin IP &amp; Geolocation</th>
                  <th className="py-3 px-4">Endpoint</th>
                  <th className="py-3 px-4">Incident Classification</th>
                  <th className="py-3 px-4">Severity</th>
                  <th className="py-3 px-4 text-right">Action Taken</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {securityEvents.map(evt => (
                  <tr key={evt.id} className="hover:bg-gray-50/80 transition">
                    <td className="py-3.5 px-4 font-mono text-gray-500">{evt.timestamp}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-gray-900">{evt.clientIp}</div>
                      <div className="text-[10px] text-gray-400">{evt.geo}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-cu-navy font-semibold">{evt.endpoint}</td>
                    <td className="py-3.5 px-4 text-gray-700">{evt.eventType}</td>
                    <td className="py-3.5 px-4">
                      {evt.threatLevel === 'CRITICAL' && (
                        <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-rose-100 text-rose-800 border border-rose-200">CRITICAL</span>
                      )}
                      {evt.threatLevel === 'HIGH' && (
                        <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-amber-100 text-amber-800 border border-amber-200">HIGH</span>
                      )}
                      {evt.threatLevel === 'LOW' && (
                        <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-200">BENIGN / OK</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {evt.action === 'BLOCKED' && (
                        <span className="inline-flex items-center gap-1 font-bold text-rose-600">
                          <X size={13} /> Drop TCP Session
                        </span>
                      )}
                      {evt.action === 'ALLOWED' && (
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-600">
                          <Check size={13} /> Authenticated
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: DATABASE BACKUPS */}
      {activeTab === 'BACKUP' && (
        <div className="bg-white rounded-2xl border border-cu-border shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-cu-navy">Cryptographic Database Snapshot Ledger</h3>
              <p className="text-xs text-gray-500">Immutable hourly backups with AES-256-GCM encryption &amp; SHA-256 hash validation</p>
            </div>
            <span className="text-[11px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Disaster Recovery RPO &lt; 15 mins
            </span>
          </div>

          <div className="space-y-3">
            {snapshots.map(snap => (
              <div key={snap.id} className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Database size={15} className="text-cu-navy" />
                    <span className="font-bold text-gray-900 font-mono">{snap.fileName}</span>
                    <span className="px-2 py-0.5 bg-cu-pill text-cu-navy font-bold rounded text-[10px]">{snap.encryption}</span>
                  </div>
                  <div className="text-[11px] text-gray-500 flex items-center gap-2">
                    <span>Timestamp: {snap.timestamp}</span>
                    <span>&bull;</span>
                    <span>Size: {snap.sizeMb} MB</span>
                  </div>
                  <div className="font-mono text-[10px] text-gray-400 break-all">
                    SHA-256: {snap.sha256Hash}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 font-bold text-[11px]">
                    <ShieldCheck size={14} /> Hash Verified
                  </span>
                  <button
                    onClick={() => alert(`Simulated secure download of encrypted archive: ${snap.fileName}`)}
                    className="p-1.5 bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 rounded-lg transition"
                    title="Download encrypted snapshot"
                  >
                    <Download size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: RBAC PERMISSIONS MATRIX */}
      {activeTab === 'RBAC' && (
        <div className="bg-white rounded-2xl border border-cu-border shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-cu-navy">Autonomous Module Access Matrix</h3>
              <p className="text-xs text-gray-500">Toggle role-based authorization gates across all 8 decoupled subsystems</p>
            </div>
            <span className="text-[11px] text-gray-500 font-mono">Enforced in: AuthContext.tsx</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 border-b border-gray-200 uppercase font-semibold text-[10px]">
                  <th className="py-2.5 px-3">Role / Persona</th>
                  <th className="py-2.5 px-3 text-center">HRMS</th>
                  <th className="py-2.5 px-3 text-center">Academics</th>
                  <th className="py-2.5 px-3 text-center">Exams</th>
                  <th className="py-2.5 px-3 text-center">CodeArena</th>
                  <th className="py-2.5 px-3 text-center">PresentAI</th>
                  <th className="py-2.5 px-3 text-center">CampusBot</th>
                  <th className="py-2.5 px-3 text-center">UniHub</th>
                  <th className="py-2.5 px-3 text-center">TrackIt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-mono text-[11px]">
                {Object.keys(permissions).map(role => (
                  <tr key={role} className="hover:bg-gray-50/70 transition">
                    <td className="py-3 px-3 font-sans font-bold text-cu-navy">{role}</td>
                    {['hrms', 'academics', 'exams', 'codearena', 'presentation', 'campusbot', 'unihub', 'trackit'].map(mod => {
                      const isAllowed = permissions[role]?.[mod];
                      return (
                        <td key={mod} className="py-3 px-3 text-center">
                          <button
                            onClick={() => togglePermission(role, mod)}
                            className={`w-6 h-6 rounded flex items-center justify-center transition mx-auto ${
                              isAllowed 
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
                                : 'bg-gray-100 text-gray-300 hover:bg-gray-200'
                            }`}
                            title={`Toggle ${role} access to ${mod}`}
                          >
                            {isAllowed ? <Check size={14} /> : <X size={14} />}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: SCHOOLS & DEPARTMENTS MASTER */}
      {activeTab === 'SCHOOLS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-cu-border shadow-sm space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-sm text-cu-navy">School of Computer Science &amp; AI (SCSAI)</h4>
                <p className="text-xs text-gray-500">Dean: Dr. Anand Joshi, Ph.D. (IISc)</p>
              </div>
              <span className="text-xs font-bold text-cu-navy bg-cu-pill px-2.5 py-1 rounded-full">Active</span>
            </div>
            <div className="text-xs text-gray-600 space-y-1">
              <div>&bull; Programs: BCA, MCA, B.Tech CSE, M.Tech AI &amp; Robotics</div>
              <div>&bull; Enrolled Students: 720</div>
              <div>&bull; Faculty Count: 28</div>
              <div>&bull; NEP 2020 Compliance: 100% Curricula Mapped</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-cu-border shadow-sm space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-cu-navy text-sm">School of Management &amp; Commerce (SMC)</h4>
                <p className="text-xs text-gray-500">Dean: Dr. Meenakshi Sundaram, Ph.D. (IIMB)</p>
              </div>
              <span className="text-xs font-bold text-cu-navy bg-cu-pill px-2.5 py-1 rounded-full">Active</span>
            </div>
            <div className="text-xs text-gray-600 space-y-1">
              <div>&bull; Programs: BBA, B.Com, MBA (Fintech, Analytics)</div>
              <div>&bull; Enrolled Students: 540</div>
              <div>&bull; Faculty Count: 22</div>
              <div>&bull; Corporate Internships: 94% Placed</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-cu-border shadow-sm space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-cu-navy text-sm">School of Law &amp; Governance (SLG)</h4>
                <p className="text-xs text-gray-500">Dean: Prof. R. Venkataraman, LL.M. (NLSIU)</p>
              </div>
              <span className="text-xs font-bold text-cu-navy bg-cu-pill px-2.5 py-1 rounded-full">Active</span>
            </div>
            <div className="text-xs text-gray-600 space-y-1">
              <div>&bull; Programs: BA-LL.B (Hons), BBA-LL.B (Hons), LL.M</div>
              <div>&bull; Enrolled Students: 380</div>
              <div>&bull; Faculty Count: 16</div>
              <div>&bull; Moot Court &amp; Cyber Law Lab: Operational</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-cu-border shadow-sm space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-cu-navy text-sm">School of Arts, Humanities &amp; Social Sciences (SAHSS)</h4>
                <p className="text-xs text-gray-500">Dean: Dr. Malini Rao, Ph.D. (JNU)</p>
              </div>
              <span className="text-xs font-bold text-cu-navy bg-cu-pill px-2.5 py-1 rounded-full">Active</span>
            </div>
            <div className="text-xs text-gray-600 space-y-1">
              <div>&bull; Programs: BA Psychology, MA Public Policy, BA English</div>
              <div>&bull; Enrolled Students: 290</div>
              <div>&bull; Faculty Count: 14</div>
              <div>&bull; Interdisciplinary Research Clusters: 4 Active</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default SuperAdminGovernanceView;

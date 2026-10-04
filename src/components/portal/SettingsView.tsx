import React, { useState } from 'react';
import { 
  Settings, User, Shield, Bell, Key, Monitor, 
  CheckCircle2, Save, Smartphone, Lock 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const SettingsView: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'PROFILE' | 'SECURITY' | 'NOTIFICATIONS' | 'SESSIONS'>('PROFILE');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form states
  const [profileForm, setProfileForm] = useState({
    fullName: user?.name || 'Deepak B',
    email: user?.email || 'deepak@chanakya.edu',
    phone: '+91 98450 12345',
    officeRoom: 'Block B, Faculty Wing 302',
    department: 'School of Engineering (Computer Applications)'
  });

  const [securityState, setSecurityState] = useState({
    twoFactorEnabled: true,
    biometricLogin: true,
    sessionTimeoutMinutes: 30
  });

  const [notificationState, setNotificationState] = useState({
    attendanceShortageAlerts: true,
    examGradePublishing: true,
    leaveWorkflowUpdates: true,
    emailDailyDigest: false
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-amber-900/15 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-800 border border-amber-400/40 mb-1">
            <Settings size={13} />
            <span>Institutional User Preferences</span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-slate-900">
            Account Settings &amp; Security Governance
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your single sign-on identity, multi-factor authentication, and notification telemetry.
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold animate-fadeIn">
            <CheckCircle2 size={16} className="text-emerald-600" />
            <span>Preferences Updated</span>
          </div>
        )}
      </div>

      {/* Tabs Layout */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row">
        {/* Tab Sidebar */}
        <div className="w-full md:w-56 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200 p-3 space-y-1 text-xs">
          <button
            onClick={() => setActiveTab('PROFILE')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-bold transition text-left ${
              activeTab === 'PROFILE' 
                ? 'bg-[#0a1e3b] text-amber-300 shadow' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <User size={15} />
            <span>Personal Profile</span>
          </button>

          <button
            onClick={() => setActiveTab('SECURITY')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-bold transition text-left ${
              activeTab === 'SECURITY' 
                ? 'bg-[#0a1e3b] text-amber-300 shadow' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Shield size={15} />
            <span>Security &amp; 2FA</span>
          </button>

          <button
            onClick={() => setActiveTab('NOTIFICATIONS')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-bold transition text-left ${
              activeTab === 'NOTIFICATIONS' 
                ? 'bg-[#0a1e3b] text-amber-300 shadow' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Bell size={15} />
            <span>Notifications</span>
          </button>

          <button
            onClick={() => setActiveTab('SESSIONS')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-bold transition text-left ${
              activeTab === 'SESSIONS' 
                ? 'bg-[#0a1e3b] text-amber-300 shadow' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Monitor size={15} />
            <span>Active Sessions</span>
          </button>
        </div>

        {/* Tab Content Panel */}
        <div className="flex-1 p-6 text-xs sm:text-sm">
          {activeTab === 'PROFILE' && (
            <form onSubmit={handleSave} className="space-y-4 max-w-xl">
              <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0a1e3b] to-[#1e3a8a] text-amber-300 font-serif font-bold text-xl flex items-center justify-center border-2 border-amber-400/40 shadow">
                  {user?.name?.charAt(0) || 'D'}
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">{profileForm.fullName}</h3>
                  <p className="text-xs text-slate-500 font-mono">{user?.employeeId || 'CUP2025/00303'}</p>
                  <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-800 border border-amber-400/30">
                    {user?.roleTitle}
                  </span>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1 text-xs">Official Full Name</label>
                <input 
                  type="text"
                  value={profileForm.fullName}
                  onChange={(e) => setProfileForm({...profileForm, fullName: e.target.value})}
                  className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:border-amber-500 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1 text-xs">Institutional Email</label>
                  <input 
                    type="email"
                    disabled
                    value={profileForm.email}
                    className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1 text-xs">Emergency Phone</label>
                  <input 
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                    className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:border-amber-500 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1 text-xs">Academic School / Directorate</label>
                <input 
                  type="text"
                  value={profileForm.department}
                  onChange={(e) => setProfileForm({...profileForm, department: e.target.value})}
                  className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:border-amber-500 text-xs"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-[#0a1e3b] font-bold rounded-lg shadow transition hover:opacity-90 flex items-center gap-1.5 text-xs"
                >
                  <Save size={14} />
                  <span>Save Profile Updates</span>
                </button>
              </div>
            </form>
          )}

          {activeTab === 'SECURITY' && (
            <div className="space-y-6 max-w-xl">
              <div className="space-y-3">
                <h3 className="font-serif font-bold text-sm text-slate-900">Multi-Factor Authentication (MFA)</h3>
                <p className="text-xs text-slate-500">Enhance your institutional SSO account with mandatory verification factors.</p>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xs text-slate-800">Time-based One-Time Password (TOTP)</div>
                      <div className="text-[11px] text-slate-500">Google Authenticator or Microsoft Authenticator app</div>
                    </div>
                    <input 
                      type="checkbox"
                      checked={securityState.twoFactorEnabled}
                      onChange={(e) => setSecurityState({...securityState, twoFactorEnabled: e.target.checked})}
                      className="w-4 h-4 accent-amber-600"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                    <div>
                      <div className="font-bold text-xs text-slate-800">Biometric Touch ID / Windows Hello</div>
                      <div className="text-[11px] text-slate-500">Quick authentication via hardware cryptographic keys</div>
                    </div>
                    <input 
                      type="checkbox"
                      checked={securityState.biometricLogin}
                      onChange={(e) => setSecurityState({...securityState, biometricLogin: e.target.checked})}
                      className="w-4 h-4 accent-amber-600"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t border-slate-100">
                <h3 className="font-serif font-bold text-sm text-slate-900">Password Update</h3>
                <div className="space-y-2">
                  <input 
                    type="password"
                    placeholder="Current institutional password"
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                  />
                  <input 
                    type="password"
                    placeholder="New password (minimum 12 characters)"
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <button className="px-4 py-2 bg-[#0a1e3b] text-amber-300 font-bold rounded-lg text-xs">
                  Update Password
                </button>
              </div>
            </div>
          )}

          {activeTab === 'NOTIFICATIONS' && (
            <div className="space-y-4 max-w-xl">
              <h3 className="font-serif font-bold text-sm text-slate-900">Academic &amp; Telemetry Notifications</h3>
              <p className="text-xs text-slate-500">Configure instant alerts regarding attendance, examinations, and leaves.</p>

              <div className="space-y-2 border border-slate-200 rounded-xl divide-y divide-slate-100 p-2">
                <label className="flex items-center justify-between p-2 cursor-pointer">
                  <div>
                    <div className="font-bold text-xs text-slate-800">Attendance Shortage Gate Alerts (&lt; 75%)</div>
                    <div className="text-[11px] text-slate-500">Instant notification when verified attendance falls below statutory threshold</div>
                  </div>
                  <input 
                    type="checkbox"
                    checked={notificationState.attendanceShortageAlerts}
                    onChange={(e) => setNotificationState({...notificationState, attendanceShortageAlerts: e.target.checked})}
                    className="w-4 h-4 accent-amber-600"
                  />
                </label>

                <label className="flex items-center justify-between p-2 cursor-pointer">
                  <div>
                    <div className="font-bold text-xs text-slate-800">Exam Results &amp; Marks Release</div>
                    <div className="text-[11px] text-slate-500">Notify immediately when semester grades or testcase scores are published</div>
                  </div>
                  <input 
                    type="checkbox"
                    checked={notificationState.examGradePublishing}
                    onChange={(e) => setNotificationState({...notificationState, examGradePublishing: e.target.checked})}
                    className="w-4 h-4 accent-amber-600"
                  />
                </label>

                <label className="flex items-center justify-between p-2 cursor-pointer">
                  <div>
                    <div className="font-bold text-xs text-slate-800">Leave / Milestone Approval Status</div>
                    <div className="text-[11px] text-slate-500">Alerts when HoD, Dean, or Guide approves or requests revisions</div>
                  </div>
                  <input 
                    type="checkbox"
                    checked={notificationState.leaveWorkflowUpdates}
                    onChange={(e) => setNotificationState({...notificationState, leaveWorkflowUpdates: e.target.checked})}
                    className="w-4 h-4 accent-amber-600"
                  />
                </label>
              </div>
            </div>
          )}

          {activeTab === 'SESSIONS' && (
            <div className="space-y-4">
              <h3 className="font-serif font-bold text-sm text-slate-900">Active Authentication Sessions</h3>
              <p className="text-xs text-slate-500">Devices currently authenticated to your Chanakya University account.</p>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                    <tr>
                      <th className="p-3">Device &amp; Browser</th>
                      <th className="p-3">IP Address</th>
                      <th className="p-3">Location</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="p-3 font-semibold flex items-center gap-2">
                        <Monitor size={15} className="text-amber-600" />
                        <span>Chrome 128 &bull; Windows 11 (Current)</span>
                      </td>
                      <td className="p-3 font-mono text-slate-600">10.179.137.237</td>
                      <td className="p-3 text-slate-600">Devanahalli Campus, BLR</td>
                      <td className="p-3">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Active Now
                        </span>
                      </td>
                      <td className="p-3 text-right text-slate-400 italic">Current Session</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold flex items-center gap-2">
                        <Smartphone size={15} className="text-slate-500" />
                        <span>Safari Mobile &bull; iOS 18</span>
                      </td>
                      <td className="p-3 font-mono text-slate-600">192.168.56.1</td>
                      <td className="p-3 text-slate-600">Devanahalli Campus, BLR</td>
                      <td className="p-3 text-slate-500">Yesterday at 18:24</td>
                      <td className="p-3 text-right">
                        <button className="text-rose-600 hover:underline font-bold">Revoke</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default SettingsView;

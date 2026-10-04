import React, { useState } from 'react';
import { 
  X, ShieldCheck, Lock, User, CheckCircle2, ArrowRight, 
  Sparkles, Users, GraduationCap, DollarSign, BookOpen, 
  Terminal, Layers, Briefcase, KeyRound, Mail,
  RotateCcw, AlertCircle, Globe, TrendingUp, Award,
  FlaskConical, FileEdit, UserCog, Building2
} from 'lucide-react';
import { useAuth, UserRole, PRESET_ROLES } from '../../context/AuthContext';
import { ChanakyaLogo } from '../ui/ChanakyaLogo';
import { AuthOtpService } from '../../services/authOtpService';

interface LoginModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onClose, onSuccess }) => {
  const { loginWithCredentials, login } = useAuth();
  
  // Auth Tab Mode: 'sso' (Role / Password) vs 'otp' (SMTP Email OTP & Set Password)
  const [authMode, setAuthMode] = useState<'sso' | 'otp'>('sso');

  // SSO / Password State
  const [selectedRole, setSelectedRole] = useState<UserRole>('SUPER_ADMIN');
  const [username, setUsername] = useState(PRESET_ROLES.SUPER_ADMIN.dummyUsername);
  const [password, setPassword] = useState(PRESET_ROLES.SUPER_ADMIN.dummyPassword);
  const [loading, setLoading] = useState(false);

  // OTP State
  const [otpEmail, setOtpEmail] = useState('');
  const [otpValue, setOtpValue] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpSuccess, setOtpSuccess] = useState<string | null>(null);
  const [debugOtpCode, setDebugOtpCode] = useState<string | null>(null);
  
  // Set Password State in OTP Flow
  const [wantSetPassword, setWantSetPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const quickRoles: { role: UserRole; title: string; person: string; email: string; pass: string; icon: any; color: string }[] = [
    { role: 'SUPER_ADMIN',           title: 'University Registrar',           person: 'Dr. R. Sharma',       email: 'admin@chanakya.edu',        pass: 'admin@chanakya123',        icon: ShieldCheck,  color: 'text-purple-700 bg-purple-50' },
    { role: 'IT_ADMIN',              title: 'IT & Cybersecurity Admin',       person: 'Arun Mehta',          email: 'itadmin@chanakya.edu',      pass: 'itadmin@chanakya123',      icon: Award,        color: 'text-slate-700 bg-slate-50' },
    { role: 'STUDENT',               title: 'MCA Student (Sem 3)',            person: 'Arjun Kumar',         email: 'student@chanakya.edu',      pass: 'student@chanakya123',      icon: User,         color: 'text-amber-700 bg-amber-50' },
    { role: 'FACULTY',               title: 'Faculty & Project Lead',         person: 'Deepak B',            email: 'faculty@chanakya.edu',      pass: 'faculty@chanakya123',      icon: GraduationCap,color: 'text-cu-navy bg-cu-pill' },
    { role: 'DEAN',                  title: 'Dean of School',                 person: 'Prof. K. Venkatesh',  email: 'dean@chanakya.edu',         pass: 'dean@chanakya123',         icon: Building2,    color: 'text-violet-700 bg-violet-50' },
    { role: 'EXAMINATION_CONTROLLER',title: 'Controller of Examinations',     person: 'Dr. S. Ranganath',    email: 'examcontrol@chanakya.edu',  pass: 'examcontrol@chanakya123',  icon: Award,        color: 'text-red-700 bg-red-50' },
    { role: 'PLACEMENT_OFFICER',     title: 'Placement & Industry Officer',   person: 'Nandini Verma',       email: 'placement@chanakya.edu',    pass: 'placement@chanakya123',    icon: TrendingUp,   color: 'text-green-700 bg-green-50' },
    { role: 'COORDINATOR',           title: 'Academic Coordinator',           person: 'Dr. Anita Desai',     email: 'coordinator@chanakya.edu',  pass: 'coordinator@chanakya123',  icon: Briefcase,    color: 'text-blue-700 bg-blue-50' },
    { role: 'ADMISSION_OFFICER',     title: 'Director of Admissions',         person: 'Sunita Rao',          email: 'admission@chanakya.edu',    pass: 'admission@chanakya123',    icon: Users,        color: 'text-emerald-700 bg-emerald-50' },
    { role: 'WEBSITE_CONTROLLER',    title: 'Website Controller & Media',     person: 'Vikram Malhotra',     email: 'media@chanakya.edu',        pass: 'media@chanakya123',        icon: Globe,        color: 'text-sky-700 bg-sky-50' },
    { role: 'HR_ADMIN',              title: 'HR Manager & Personnel',         person: 'Priya Nair',          email: 'hr@chanakya.edu',           pass: 'hr@chanakya123',           icon: UserCog,      color: 'text-emerald-700 bg-emerald-50' },
    { role: 'COURSE_ALLOCATOR',      title: 'Course & Timetable Allocator',   person: 'Kavitha Murthy',      email: 'allocator@chanakya.edu',    pass: 'allocator@chanakya123',    icon: Layers,       color: 'text-rose-700 bg-rose-50' },
    { role: 'LAB_INSTRUCTOR',        title: 'Senior Lab Instructor',          person: 'Vinay Varma',         email: 'lab@chanakya.edu',          pass: 'lab@chanakya123',          icon: FlaskConical, color: 'text-indigo-700 bg-indigo-50' },
    { role: 'LIBRARIAN',             title: 'Chief Librarian (UniHub)',        person: 'Sumanth Kulkarni',    email: 'librarian@chanakya.edu',    pass: 'librarian@chanakya123',    icon: BookOpen,     color: 'text-teal-700 bg-teal-50' },
    { role: 'FINANCE',               title: 'Finance & Accounts Officer',     person: 'Ramesh Hegde',        email: 'finance@chanakya.edu',      pass: 'finance@chanakya123',      icon: DollarSign,   color: 'text-yellow-700 bg-yellow-50' },
    { role: 'COURSE_UPDATOR',        title: 'Course Content Officer',         person: 'Meena Krishnan',      email: 'updator@chanakya.edu',      pass: 'updator@chanakya123',      icon: FileEdit,     color: 'text-orange-700 bg-orange-50' },
    { role: 'STAFF',                 title: 'Administrative Staff Officer',   person: 'Mahesh Gowda',        email: 'staff@chanakya.edu',        pass: 'staff@chanakya123',        icon: Terminal,     color: 'text-gray-700 bg-gray-50' },
  ];

  const handleRoleSelect = (item: typeof quickRoles[0]) => {
    setSelectedRole(item.role);
    setUsername(item.email);
    setPassword(item.pass);
    setOtpEmail(item.email);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      loginWithCredentials(username, password);
      setLoading(false);
      onSuccess();
    }, 400);
  };

  // OTP Handlers
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpLoading(true);
    setOtpError(null);
    setOtpSuccess(null);

    const res = await AuthOtpService.requestOtp(otpEmail, wantSetPassword ? 'set_password' : 'login');
    setOtpLoading(false);

    if (res.success) {
      setOtpSent(true);
      setOtpSuccess(res.message);
      if (res.debugOtp) {
        setDebugOtpCode(res.debugOtp);
        setOtpValue(res.debugOtp); // Convenient test auto-fill
      }
    } else {
      setOtpError(res.message);
    }
  };

  const handleVerifyOtpAndLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpLoading(true);
    setOtpError(null);

    if (wantSetPassword) {
      if (newPassword.length < 6) {
        setOtpError('New password must be at least 6 characters long.');
        setOtpLoading(false);
        return;
      }
      if (newPassword !== confirmPassword) {
        setOtpError('Passwords do not match. Please re-enter.');
        setOtpLoading(false);
        return;
      }
    }

    const res = await AuthOtpService.verifyOtpAndSetPassword(
      otpEmail, 
      otpValue, 
      wantSetPassword ? newPassword : undefined
    );
    setOtpLoading(false);

    if (res.success) {
      setOtpSuccess(res.message);
      setTimeout(() => {
        login((res.role as UserRole) || selectedRole);
        onSuccess();
      }, 500);
    } else {
      setOtpError(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-cu-border relative max-h-[94vh] flex flex-col">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition z-10"
        >
          <X size={20} />
        </button>

        {/* Header with official white ChanakyaLogo */}
        <div className="bg-gradient-to-r from-[#002561] via-[#0E1B38] to-[#16284F] text-white p-5 text-center relative shrink-0">
          <div className="flex justify-center mb-2">
            <ChanakyaLogo theme="white" height={44} />
          </div>
          <p className="text-[11px] text-amber-300 tracking-widest uppercase font-bold mt-1">
            Chanakya Institutional SSO &amp; Multi-Factor Auth Gateway
          </p>

          {/* Mode Switcher Tabs */}
          <div className="mt-3 flex justify-center gap-2">
            <button
              type="button"
              onClick={() => setAuthMode('sso')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                authMode === 'sso' 
                  ? 'bg-amber-400 text-cu-navy shadow-sm' 
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              <KeyRound size={13} />
              <span>Role Profiles &amp; Password</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('otp');
                if (!otpEmail) setOtpEmail(username || 'student@chanakya.edu');
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                authMode === 'otp' 
                  ? 'bg-amber-400 text-cu-navy shadow-sm' 
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              <Mail size={13} />
              <span>SMTP Email OTP &amp; Set Password</span>
            </button>
          </div>
        </div>

        {/* Body Container with Scroll */}
        <div className="overflow-y-auto p-5 space-y-4 text-xs">
          {authMode === 'sso' ? (
            <>
              {/* Quick Role Selection Grid */}
              <div>
                <label className="block text-gray-700 font-bold mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Sparkles size={14} className="text-cu-gold" />
                    <span>Select Institutional Role Profile</span>
                  </span>
                  <span className="text-[11px] text-gray-400 font-normal">Click any card to auto-fill credentials</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                  {quickRoles.map((item) => {
                    const Icon = item.icon;
                    const isSelected = selectedRole === item.role;

                    return (
                      <button
                        key={item.role}
                        type="button"
                        onClick={() => handleRoleSelect(item)}
                        className={`p-2.5 rounded-xl border text-left transition flex items-start gap-2.5 ${
                          isSelected
                            ? 'border-cu-navy bg-blue-50/70 ring-2 ring-cu-navy/20 shadow-sm'
                            : 'border-cu-border hover:bg-gray-50'
                        }`}
                      >
                        <div className={`p-1.5 rounded-lg shrink-0 ${item.color}`}>
                          <Icon size={16} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-gray-900 truncate">{item.title}</div>
                          <div className="text-[11px] text-gray-500 truncate">{item.person}</div>
                          <div className="mt-1 flex items-center justify-between font-mono text-[10px] text-slate-500 bg-white/80 px-1.5 py-0.5 rounded border border-gray-100">
                            <span>{item.email}</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-3 pt-2 border-t border-gray-100">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">
                    Institutional Email or Username
                  </label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. admin@chanakya.edu, student@chanakya.edu"
                      className="w-full border border-cu-border rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-cu-navy font-mono"
                      required
                    />
                    <User size={15} className="absolute left-3 top-2.5 text-gray-400" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-gray-700 font-semibold">
                      Security Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('otp');
                        setWantSetPassword(true);
                        setOtpEmail(username);
                      }}
                      className="text-[11px] text-amber-700 hover:underline font-semibold"
                    >
                      Forgot / Set Password via OTP?
                    </button>
                  </div>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      className="w-full border border-cu-border rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-cu-navy font-mono"
                      required
                    />
                    <Lock size={15} className="absolute left-3 top-2.5 text-gray-400" />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#002561] hover:bg-[#0E1B38] text-white py-2.5 rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer"
                >
                  <span>{loading ? 'Authenticating Role Session...' : `Sign in as ${PRESET_ROLES[selectedRole]?.roleTitle.split('&')[0]}`}</span>
                  <ArrowRight size={15} />
                </button>
              </form>
            </>
          ) : (
            /* OTP Authentication & Password Reset Flow */
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                <Mail size={16} className="text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Institutional SMTP Email OTP Verification</span>
                  <span>Dispatches a 6-digit one-time passcode to your official Chanakya University email inbox. Rate-limited and expires in 10 minutes.</span>
                </div>
              </div>

              {otpSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span>{otpSuccess}</span>
                </div>
              )}

              {otpError && (
                <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-xs text-rose-900 flex items-center gap-2">
                  <AlertCircle size={16} className="text-rose-600 shrink-0" />
                  <span>{otpError}</span>
                </div>
              )}

              {!otpSent ? (
                /* Step 1: Request OTP */
                <form onSubmit={handleSendOtp} className="space-y-3">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">
                      Institutional University Email Address
                    </label>
                    <div className="relative">
                      <input 
                        type="email" 
                        value={otpEmail}
                        onChange={(e) => setOtpEmail(e.target.value)}
                        placeholder="e.g. student@chanakya.edu, faculty@chanakya.edu"
                        className="w-full border border-cu-border rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-cu-navy font-mono"
                        required
                      />
                      <Mail size={15} className="absolute left-3 top-2.5 text-gray-400" />
                    </div>
                  </div>

                  {/* Optional checkbox to set password */}
                  <label className="flex items-center gap-2 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={wantSetPassword}
                      onChange={(e) => setWantSetPassword(e.target.checked)}
                      className="rounded text-cu-navy focus:ring-cu-gold"
                    />
                    <span className="text-gray-700 font-medium">
                      I want to set / reset a new password during verification
                    </span>
                  </label>

                  <button 
                    type="submit"
                    disabled={otpLoading || !otpEmail}
                    className="w-full bg-[#002561] hover:bg-[#0E1B38] text-white py-2.5 rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer"
                  >
                    <span>{otpLoading ? 'Dispatching SMTP Email...' : 'Send 6-Digit OTP to Email'}</span>
                    <ArrowRight size={15} />
                  </button>
                </form>
              ) : (
                /* Step 2: Verify OTP & Optionally Set Password */
                <form onSubmit={handleVerifyOtpAndLogin} className="space-y-3">
                  {debugOtpCode && (
                    <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg text-[11px] text-blue-900 flex items-center justify-between font-mono">
                      <span>Live Test OTP Code: <strong>{debugOtpCode}</strong></span>
                      <span className="text-[10px] text-blue-600 font-sans">(Simulated SMTP Dispatch)</span>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-gray-700 font-semibold">
                        Enter 6-Digit Verification Code (OTP)
                      </label>
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={otpLoading}
                        className="text-[10px] text-amber-700 hover:underline font-bold flex items-center gap-1"
                      >
                        <RotateCcw size={10} />
                        <span>Resend Code</span>
                      </button>
                    </div>
                    <div className="relative">
                      <input 
                        type="text" 
                        maxLength={6}
                        value={otpValue}
                        onChange={(e) => setOtpValue(e.target.value)}
                        placeholder="e.g. 839201"
                        className="w-full border border-cu-border rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-cu-navy font-mono font-bold tracking-widest text-center"
                        required
                      />
                      <KeyRound size={15} className="absolute left-3 top-2.5 text-gray-400" />
                    </div>
                  </div>

                  {wantSetPassword && (
                    <div className="space-y-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                      <span className="font-bold text-slate-800 block">Set New Account Password:</span>
                      <div>
                        <input 
                          type="password" 
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="New Password (min 6 chars)"
                          className="w-full border border-cu-border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-cu-navy"
                          required
                        />
                      </div>
                      <div>
                        <input 
                          type="password" 
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm New Password"
                          className="w-full border border-cu-border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-cu-navy"
                          required
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-1">
                    <button 
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="px-3 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-100 transition"
                    >
                      Back
                    </button>
                    <button 
                      type="submit"
                      disabled={otpLoading || otpValue.length !== 6}
                      className="flex-1 bg-[#002561] hover:bg-[#0E1B38] text-white py-2.5 rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer"
                    >
                      <span>{otpLoading ? 'Verifying...' : wantSetPassword ? 'Verify OTP & Set Password' : 'Verify OTP & Sign In'}</span>
                      <ArrowRight size={15} />
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Bottom Security Info */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-[11px] text-gray-600">
            <span className="flex items-center gap-1.5">
              <KeyRound size={13} className="text-cu-navy" />
              Multi-factor cryptographic authentication and session token isolation.
            </span>
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <CheckCircle2 size={12} /> SSO &amp; SMTP Active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;

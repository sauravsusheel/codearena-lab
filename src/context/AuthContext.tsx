import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 
  | 'SUPER_ADMIN'
  | 'IT_ADMIN'
  | 'STUDENT'
  | 'FACULTY' 
  | 'COORDINATOR'
  | 'HR_ADMIN' 
  | 'COURSE_ALLOCATOR'
  | 'LIBRARIAN' 
  | 'LAB_INSTRUCTOR' 
  | 'FINANCE'
  | 'COURSE_UPDATOR'
  | 'STAFF'
  | 'WEBSITE_CONTROLLER'
  | 'ADMISSION_OFFICER'
  | 'DEAN'
  | 'EXAMINATION_CONTROLLER'
  | 'PLACEMENT_OFFICER';

export interface UserProfile {
  id: string;
  name: string;
  employeeId: string;
  email: string;
  dummyUsername: string;
  dummyPassword: string;
  role: UserRole;
  roleTitle: string;
  department: string;
  avatarUrl: string;
  allowedModules: string[];
}

export const DUMMY_CREDENTIALS: Record<string, { role: UserRole; email: string; pass: string }> = {
  admin:       { role: 'SUPER_ADMIN',           email: 'admin@chanakya.edu',        pass: 'admin@chanakya123' },
  itadmin:     { role: 'IT_ADMIN',              email: 'itadmin@chanakya.edu',      pass: 'itadmin@chanakya123' },
  student:     { role: 'STUDENT',               email: 'student@chanakya.edu',      pass: 'student@chanakya123' },
  faculty:     { role: 'FACULTY',               email: 'faculty@chanakya.edu',      pass: 'faculty@chanakya123' },
  coordinator: { role: 'COORDINATOR',           email: 'coordinator@chanakya.edu',  pass: 'coordinator@chanakya123' },
  hr:          { role: 'HR_ADMIN',              email: 'hr@chanakya.edu',           pass: 'hr@chanakya123' },
  allocator:   { role: 'COURSE_ALLOCATOR',      email: 'allocator@chanakya.edu',    pass: 'allocator@chanakya123' },
  librarian:   { role: 'LIBRARIAN',             email: 'librarian@chanakya.edu',    pass: 'librarian@chanakya123' },
  lab:         { role: 'LAB_INSTRUCTOR',        email: 'lab@chanakya.edu',          pass: 'lab@chanakya123' },
  finance:     { role: 'FINANCE',               email: 'finance@chanakya.edu',      pass: 'finance@chanakya123' },
  media:       { role: 'WEBSITE_CONTROLLER',    email: 'media@chanakya.edu',        pass: 'media@chanakya123' },
  admission:   { role: 'ADMISSION_OFFICER',     email: 'admission@chanakya.edu',    pass: 'admission@chanakya123' },
  updator:     { role: 'COURSE_UPDATOR',        email: 'updator@chanakya.edu',      pass: 'updator@chanakya123' },
  staff:       { role: 'STAFF',                 email: 'staff@chanakya.edu',        pass: 'staff@chanakya123' },
  dean:        { role: 'DEAN',                  email: 'dean@chanakya.edu',         pass: 'dean@chanakya123' },
  examcontrol: { role: 'EXAMINATION_CONTROLLER',email: 'examcontrol@chanakya.edu',  pass: 'examcontrol@chanakya123' },
  placement:   { role: 'PLACEMENT_OFFICER',     email: 'placement@chanakya.edu',    pass: 'placement@chanakya123' },
};

export const PRESET_ROLES: Record<UserRole, UserProfile> = {
  // ─── SUPER_ADMIN: University Registrar — ACADEMIC administration only ──────
  // Governance/WAF/Security is IT domain → assigned to IT_ADMIN below.
  SUPER_ADMIN: {
    id: 'usr_adm_01',
    name: 'Dr. R. Sharma',
    employeeId: 'CUA2021/00001',
    email: 'admin@chanakya.edu',
    dummyUsername: 'admin@chanakya.edu',
    dummyPassword: 'admin@chanakya123',
    role: 'SUPER_ADMIN',
    roleTitle: 'University Registrar',
    department: 'Office of the Registrar — Central University Administration',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    // Registrar = academic admin: admissions, approvals, faculty mgmt, finance oversight
    // Does NOT manage WAF/security/IT — that is IT_ADMIN's domain
    allowedModules: [
      'dashboard', 'admissions', 'hrms', 'academics', 'exams',
      'faculty_dossier', 'finance', 'approvals', 'unihub', 'trackit',
      'website_manager', 'bot', 'settings'
    ]
  },

  // ─── IT_ADMIN: System & Cybersecurity Administrator ─────────────────────────
  // Owns: Governance/WAF/security audits, system health, module circuit breakers
  IT_ADMIN: {
    id: 'usr_it_01',
    name: 'Arun Mehta',
    employeeId: 'CUP2022/00033',
    email: 'itadmin@chanakya.edu',
    dummyUsername: 'itadmin@chanakya.edu',
    dummyPassword: 'itadmin@chanakya123',
    role: 'IT_ADMIN',
    roleTitle: 'Chief Information & Cybersecurity Officer',
    department: 'Directorate of Information Technology & Digital Infrastructure',
    avatarUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=150&auto=format&fit=crop&q=80',
    // IT Admin ONLY sees technical governance — not academic modules
    allowedModules: [
      'dashboard', 'governance', 'bot', 'settings'
    ]
  },
  STUDENT: {
    id: 'usr_std_01',
    name: 'Arjun Kumar',
    employeeId: '24MCA003',
    email: 'student@chanakya.edu',
    dummyUsername: 'student@chanakya.edu',
    dummyPassword: 'student@chanakya123',
    role: 'STUDENT',
    roleTitle: 'MCA 3rd Semester (Class Representative)',
    department: 'School of Computer Science & Applications',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    // Students can view their own fee receipts but NOT timetable/exam paper management
    allowedModules: ['dashboard', 'academics', 'exams', 'codearena', 'presentation', 'bot', 'unihub', 'trackit', 'finance']
  },
  FACULTY: {
    id: 'usr_fac_01',
    name: 'Deepak B',
    employeeId: 'CUP2025/00303',
    email: 'faculty@chanakya.edu',
    dummyUsername: 'faculty@chanakya.edu',
    dummyPassword: 'faculty@chanakya123',
    role: 'FACULTY',
    roleTitle: 'Assistant Professor & MCA Project Lead',
    department: 'School of Computer Science & Applications',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    allowedModules: [
      'dashboard', 'faculty_dossier', 'hrms', 'academics', 'exams',
      'codearena', 'presentation', 'bot', 'unihub', 'trackit', 'approvals'
    ]
  },
  COORDINATOR: {
    id: 'usr_coord_01',
    name: 'Dr. Anita Desai',
    employeeId: 'CUP2022/00084',
    email: 'coordinator@chanakya.edu',
    dummyUsername: 'coordinator@chanakya.edu',
    dummyPassword: 'coordinator@chanakya123',
    role: 'COORDINATOR',
    roleTitle: 'Academic & Capstone Project Coordinator',
    department: 'School of Computer Science & Applications',
    avatarUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80',
    allowedModules: ['dashboard', 'trackit', 'hrms', 'academics', 'presentation', 'codearena', 'unihub', 'approvals', 'bot']
  },
  HR_ADMIN: {
    id: 'usr_hr_01',
    name: 'Priya Nair',
    employeeId: 'CUP2023/00045',
    email: 'hr@chanakya.edu',
    dummyUsername: 'hr@chanakya.edu',
    dummyPassword: 'hr@chanakya123',
    role: 'HR_ADMIN',
    roleTitle: 'Head of Human Resources & Personnel',
    department: 'Human Resources Directorate',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    allowedModules: ['dashboard', 'hrms', 'academics', 'approvals', 'settings', 'bot']
  },
  COURSE_ALLOCATOR: {
    id: 'usr_alloc_01',
    name: 'Kavitha Murthy',
    employeeId: 'CUP2024/00078',
    email: 'allocator@chanakya.edu',
    dummyUsername: 'allocator@chanakya.edu',
    dummyPassword: 'allocator@chanakya123',
    role: 'COURSE_ALLOCATOR',
    roleTitle: 'Curriculum Planning & Workload Course Allocator',
    department: 'Board of Studies & Academic Planning',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    allowedModules: ['dashboard', 'hrms', 'academics', 'approvals', 'unihub', 'settings', 'bot']
  },
  LIBRARIAN: {
    id: 'usr_lib_01',
    name: 'Sumanth Kulkarni',
    employeeId: 'CUP2023/00089',
    email: 'librarian@chanakya.edu',
    dummyUsername: 'librarian@chanakya.edu',
    dummyPassword: 'librarian@chanakya123',
    role: 'LIBRARIAN',
    roleTitle: 'Chief Academic Librarian & Repository Custodian',
    department: 'University Central Library & Knowledge Resource Center',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    allowedModules: ['dashboard', 'unihub', 'approvals', 'bot', 'settings']
  },
  LAB_INSTRUCTOR: {
    id: 'usr_lab_01',
    name: 'Vinay Varma',
    employeeId: 'CUP2024/00112',
    email: 'lab@chanakya.edu',
    dummyUsername: 'lab@chanakya.edu',
    dummyPassword: 'lab@chanakya123',
    role: 'LAB_INSTRUCTOR',
    roleTitle: 'Senior Systems & Cloud Lab Instructor',
    department: 'Computer Science Systems & IoT Laboratories',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    allowedModules: ['dashboard', 'codearena', 'academics', 'exams', 'bot', 'settings']
  },
  FINANCE: {
    id: 'usr_fin_01',
    name: 'Ramesh Hegde',
    employeeId: 'CUP2022/00018',
    email: 'finance@chanakya.edu',
    dummyUsername: 'finance@chanakya.edu',
    dummyPassword: 'finance@chanakya123',
    role: 'FINANCE',
    roleTitle: 'Chief Accounts & Payroll Officer',
    department: 'Finance & Accounts Division',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    // BUGFIX: FINANCE officer was missing 'finance' module access!
    allowedModules: ['dashboard', 'finance', 'hrms', 'approvals', 'settings', 'bot']
  },
  COURSE_UPDATOR: {
    id: 'usr_crs_01',
    name: 'Meena Krishnan',
    employeeId: 'CUP2024/00078',
    email: 'updator@chanakya.edu',
    dummyUsername: 'updator@chanakya.edu',
    dummyPassword: 'updator@chanakya123',
    role: 'COURSE_UPDATOR',
    roleTitle: 'Academic Curriculum & Course Content Officer',
    department: 'Board of Studies & Curriculum Planning',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    allowedModules: ['dashboard', 'academics', 'unihub', 'trackit', 'approvals', 'bot', 'settings']
  },
  STAFF: {
    id: 'usr_stf_01',
    name: 'Mahesh Gowda',
    employeeId: 'CUP2025/00201',
    email: 'staff@chanakya.edu',
    dummyUsername: 'staff@chanakya.edu',
    dummyPassword: 'staff@chanakya123',
    role: 'STAFF',
    roleTitle: 'Departmental Administrative Officer',
    department: 'Academic Administrative Support',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    allowedModules: ['dashboard', 'hrms', 'approvals', 'bot', 'settings']
  },
  WEBSITE_CONTROLLER: {
    id: 'usr_web_01',
    name: 'Vikram Malhotra',
    employeeId: 'CUP2024/00099',
    email: 'media@chanakya.edu',
    dummyUsername: 'media@chanakya.edu',
    dummyPassword: 'media@chanakya123',
    role: 'WEBSITE_CONTROLLER',
    roleTitle: 'Public Website Controller & Media Relations',
    department: 'Directorate of Media, Outreach & Digital Engagement',
    avatarUrl: '/campus/videoframe_26542.png',
    allowedModules: ['dashboard', 'website_manager', 'bot', 'settings']
  },
  ADMISSION_OFFICER: {
    id: 'usr_adm_off_01',
    name: 'Sunita Rao',
    employeeId: 'CUA2023/00045',
    email: 'admission@chanakya.edu',
    dummyUsername: 'admission@chanakya.edu',
    dummyPassword: 'admission@chanakya123',
    role: 'ADMISSION_OFFICER',
    roleTitle: 'Director of University Admissions & Enrolment',
    department: 'Central Admissions & Student Enrolment Directorate',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    allowedModules: ['dashboard', 'admissions', 'bot', 'settings']
  },

  // ─── NEW ROLES ────────────────────────────────────────────────────────────
  DEAN: {
    id: 'usr_dean_01',
    name: 'Prof. K. Venkatesh',
    employeeId: 'CUP2020/00007',
    email: 'dean@chanakya.edu',
    dummyUsername: 'dean@chanakya.edu',
    dummyPassword: 'dean@chanakya123',
    role: 'DEAN',
    roleTitle: 'Dean — School of Computer Science & Applications',
    department: 'School of Computer Science & Applications',
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    allowedModules: [
      'dashboard', 'faculty_dossier', 'hrms', 'academics', 'exams',
      'unihub', 'trackit', 'approvals', 'bot', 'settings'
    ]
  },
  EXAMINATION_CONTROLLER: {
    id: 'usr_exam_ctrl_01',
    name: 'Dr. S. Ranganath',
    employeeId: 'CUP2021/00052',
    email: 'examcontrol@chanakya.edu',
    dummyUsername: 'examcontrol@chanakya.edu',
    dummyPassword: 'examcontrol@chanakya123',
    role: 'EXAMINATION_CONTROLLER',
    roleTitle: 'Controller of Examinations & Assessment Governance',
    department: 'Directorate of Examinations & Academic Assessment',
    avatarUrl: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150&auto=format&fit=crop&q=80',
    allowedModules: [
      'dashboard', 'exams', 'academics', 'approvals', 'bot', 'settings'
    ]
  },
  PLACEMENT_OFFICER: {
    id: 'usr_place_01',
    name: 'Nandini Verma',
    employeeId: 'CUP2023/00131',
    email: 'placement@chanakya.edu',
    dummyUsername: 'placement@chanakya.edu',
    dummyPassword: 'placement@chanakya123',
    role: 'PLACEMENT_OFFICER',
    roleTitle: 'Training, Placement & Industry Linkage Officer',
    department: 'Career Development & Corporate Relations Cell',
    avatarUrl: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=150&auto=format&fit=crop&q=80',
    allowedModules: [
      'dashboard', 'trackit', 'unihub', 'codearena', 'approvals', 'bot', 'settings'
    ]
  },
};

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (roleType?: UserRole) => void;
  loginWithCredentials: (usernameOrEmail: string, pass: string) => boolean;
  switchRole: (roleType: UserRole) => void;
  logout: () => void;
  currentView: string;
  setCurrentView: (view: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('unisphere_user_profile');
      return saved ? JSON.parse(saved) : PRESET_ROLES.FACULTY;
    } catch {
      return PRESET_ROLES.FACULTY;
    }
  });

  const [currentView, setCurrentView] = useState<string>('dashboard');

  useEffect(() => {
    if (user) {
      localStorage.setItem('unisphere_user_profile', JSON.stringify(user));
    } else {
      localStorage.removeItem('unisphere_user_profile');
    }
  }, [user]);

  const login = (roleType: UserRole = 'FACULTY') => {
    const selected = PRESET_ROLES[roleType] || PRESET_ROLES.FACULTY;
    setUser(selected);
    setCurrentView('dashboard');
  };

  const loginWithCredentials = (usernameOrEmail: string, pass: string): boolean => {
    const cleaned = usernameOrEmail.trim().toLowerCase();
    const cleanedPass = pass.trim();

    // Check DUMMY_CREDENTIALS aliases — username/email AND password must both match.
    for (const key of Object.keys(DUMMY_CREDENTIALS)) {
      const cred = DUMMY_CREDENTIALS[key];
      if (
        (cleaned === key || cleaned === cred.email.toLowerCase()) &&
        cleanedPass === cred.pass
      ) {
        login(cred.role);
        return true;
      }
    }

    // Check directly in PRESET_ROLES — email/username AND password must both match.
    for (const roleKey of Object.keys(PRESET_ROLES) as UserRole[]) {
      const p = PRESET_ROLES[roleKey];
      if (
        (cleaned === p.email.toLowerCase() || cleaned === p.dummyUsername.toLowerCase()) &&
        cleanedPass === p.dummyPassword
      ) {
        login(p.role);
        return true;
      }
    }

    // No match — reject the login attempt.
    return false;
  };

  const switchRole = (roleType: UserRole) => {
    const selected = PRESET_ROLES[roleType] || PRESET_ROLES.FACULTY;
    setUser(selected);
  };

  const logout = () => {
    setUser(null);
    setCurrentView('landing');
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      loginWithCredentials,
      switchRole,
      logout,
      currentView,
      setCurrentView
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
export default AuthContext;

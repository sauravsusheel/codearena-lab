import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, Clock, Award, CheckCircle2, 
  AlertCircle, ChevronLeft, ChevronRight, Download, Filter, 
  Coffee, BookOpen, Briefcase, TrendingUp, Activity, 
  Info, ShieldCheck, MapPin, Sparkles, Check
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

interface DayAttendanceRecord {
  date: number; // 1 - 30
  dayOfWeek: string; // 'Mon', 'Tue', etc.
  status: 'PRESENT' | 'ON_DUTY' | 'HALF_DAY' | 'HOLIDAY' | 'WEEKEND' | 'CASUAL_LEAVE';
  inTime?: string;
  outTime?: string;
  hoursWorked: number;
  holidayName?: string;
  terminal?: string;
  sessions: { title: string; time: string; type: 'LECTURE' | 'LAB' | 'MEETING' | 'RESEARCH' }[];
}

export const AttendanceCalendarKPI: React.FC = () => {
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState('September 2026');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedDay, setSelectedDay] = useState<DayAttendanceRecord | null>(null);
  const [hoveredDay, setHoveredDay] = useState<DayAttendanceRecord | null>(null);

  // Generate 30 days of deterministic September 2026 data
  const daysInMonth: DayAttendanceRecord[] = [
    { date: 1, dayOfWeek: 'Tue', status: 'PRESENT', inTime: '08:54 AM', outTime: '05:12 PM', hoursWorked: 8.3, terminal: 'Bio-Gate-1 (Main Block)', sessions: [{ title: 'PRG301 Python Lecture', time: '10:00 AM - 11:30 AM', type: 'LECTURE' }, { title: 'MCA Lab 1 Supervision', time: '01:30 PM - 03:30 PM', type: 'LAB' }] },
    { date: 2, dayOfWeek: 'Wed', status: 'PRESENT', inTime: '08:48 AM', outTime: '05:35 PM', hoursWorked: 8.8, terminal: 'Bio-Gate-2 (CS Wing)', sessions: [{ title: 'Faculty Senate Meeting', time: '11:00 AM - 12:30 PM', type: 'MEETING' }, { title: 'Capstone Guide Hours', time: '02:00 PM - 04:30 PM', type: 'RESEARCH' }] },
    { date: 3, dayOfWeek: 'Thu', status: 'PRESENT', inTime: '09:02 AM', outTime: '05:15 PM', hoursWorked: 8.2, terminal: 'Bio-Gate-1 (Main Block)', sessions: [{ title: 'Cloud Architecture Lab', time: '09:30 AM - 11:30 AM', type: 'LAB' }] },
    { date: 4, dayOfWeek: 'Fri', status: 'PRESENT', inTime: '08:50 AM', outTime: '06:14 PM', hoursWorked: 9.4, terminal: 'Bio-Gate-1 (Main Block)', sessions: [{ title: 'Special Seminar on AI & Security', time: '02:00 PM - 05:00 PM', type: 'RESEARCH' }] },
    { date: 5, dayOfWeek: 'Sat', status: 'WEEKEND', hoursWorked: 0, sessions: [] },
    { date: 6, dayOfWeek: 'Sun', status: 'WEEKEND', hoursWorked: 0, sessions: [] },
    { date: 7, dayOfWeek: 'Mon', status: 'PRESENT', inTime: '08:45 AM', outTime: '05:20 PM', hoursWorked: 8.6, terminal: 'Bio-Gate-1 (Main Block)', sessions: [{ title: 'PRG301 Advanced Section', time: '10:00 AM - 11:30 AM', type: 'LECTURE' }] },
    { date: 8, dayOfWeek: 'Tue', status: 'ON_DUTY', inTime: '09:00 AM', outTime: '05:00 PM', hoursWorked: 8.0, holidayName: 'Academic Inspection Duty', terminal: 'External Accreditation Portal', sessions: [{ title: 'UGC NEP Accreditation Review Panel', time: '09:30 AM - 04:30 PM', type: 'MEETING' }] },
    { date: 9, dayOfWeek: 'Wed', status: 'PRESENT', inTime: '08:55 AM', outTime: '05:10 PM', hoursWorked: 8.25, terminal: 'Bio-Gate-2 (CS Wing)', sessions: [{ title: 'Lab Evaluation Batch A', time: '01:30 PM - 03:30 PM', type: 'LAB' }] },
    { date: 10, dayOfWeek: 'Thu', status: 'HOLIDAY', hoursWorked: 0, holidayName: 'University Foundation Day (Gazetted)', sessions: [] },
    { date: 11, dayOfWeek: 'Fri', status: 'PRESENT', inTime: '08:58 AM', outTime: '05:08 PM', hoursWorked: 8.16, terminal: 'Bio-Gate-1 (Main Block)', sessions: [{ title: 'Research Colloquium', time: '03:00 PM - 04:30 PM', type: 'RESEARCH' }] },
    { date: 12, dayOfWeek: 'Sat', status: 'WEEKEND', hoursWorked: 0, sessions: [] },
    { date: 13, dayOfWeek: 'Sun', status: 'WEEKEND', hoursWorked: 0, sessions: [] },
    { date: 14, dayOfWeek: 'Mon', status: 'PRESENT', inTime: '08:40 AM', outTime: '05:30 PM', hoursWorked: 8.83, terminal: 'Bio-Gate-1 (Main Block)', sessions: [{ title: 'PRG301 Systems Design', time: '10:00 AM - 11:30 AM', type: 'LECTURE' }] },
    { date: 15, dayOfWeek: 'Tue', status: 'PRESENT', inTime: '08:51 AM', outTime: '05:22 PM', hoursWorked: 8.5, terminal: 'Bio-Gate-2 (CS Wing)', sessions: [{ title: 'MCA Lab Practicum', time: '01:30 PM - 03:30 PM', type: 'LAB' }] },
    { date: 16, dayOfWeek: 'Wed', status: 'CASUAL_LEAVE', hoursWorked: 0, holidayName: 'Casual Leave (Sanctioned by Dean)', sessions: [] },
    { date: 17, dayOfWeek: 'Thu', status: 'PRESENT', inTime: '09:10 AM', outTime: '05:15 PM', hoursWorked: 8.08, terminal: 'Bio-Gate-1 (Main Block)', sessions: [{ title: 'Advisory Committee', time: '02:00 PM - 03:30 PM', type: 'MEETING' }] },
    { date: 18, dayOfWeek: 'Fri', status: 'PRESENT', inTime: '08:42 AM', outTime: '05:40 PM', hoursWorked: 8.96, terminal: 'Bio-Gate-1 (Main Block)', sessions: [{ title: 'Thesis Proposal Review', time: '11:00 AM - 01:00 PM', type: 'RESEARCH' }] },
    { date: 19, dayOfWeek: 'Sat', status: 'WEEKEND', hoursWorked: 0, sessions: [] },
    { date: 20, dayOfWeek: 'Sun', status: 'WEEKEND', hoursWorked: 0, sessions: [] },
    { date: 21, dayOfWeek: 'Mon', status: 'PRESENT', inTime: '08:50 AM', outTime: '05:15 PM', hoursWorked: 8.41, terminal: 'Bio-Gate-1 (Main Block)', sessions: [{ title: 'PRG301 Algorithm Analysis', time: '10:00 AM - 11:30 AM', type: 'LECTURE' }] },
    { date: 22, dayOfWeek: 'Tue', status: 'HALF_DAY', inTime: '08:55 AM', outTime: '01:15 PM', hoursWorked: 4.33, holidayName: 'First-Half Duty (Approved Short Leave)', terminal: 'Bio-Gate-1 (Main Block)', sessions: [{ title: 'Morning Lecture Session', time: '10:00 AM - 11:30 AM', type: 'LECTURE' }] },
    { date: 23, dayOfWeek: 'Wed', status: 'PRESENT', inTime: '08:44 AM', outTime: '05:25 PM', hoursWorked: 8.68, terminal: 'Bio-Gate-2 (CS Wing)', sessions: [{ title: 'Curriculum Revision Meeting', time: '02:00 PM - 04:00 PM', type: 'MEETING' }] },
    { date: 24, dayOfWeek: 'Thu', status: 'HOLIDAY', hoursWorked: 0, holidayName: 'Mahalaya Amavasye (Statutory Holiday)', sessions: [] },
    { date: 25, dayOfWeek: 'Fri', status: 'PRESENT', inTime: '08:49 AM', outTime: '05:30 PM', hoursWorked: 8.68, terminal: 'Bio-Gate-1 (Main Block)', sessions: [{ title: 'Lab Project Demonstrations', time: '01:30 PM - 04:30 PM', type: 'LAB' }] },
    { date: 26, dayOfWeek: 'Sat', status: 'WEEKEND', hoursWorked: 0, sessions: [] },
    { date: 27, dayOfWeek: 'Sun', status: 'WEEKEND', hoursWorked: 0, sessions: [] },
    { date: 28, dayOfWeek: 'Mon', status: 'PRESENT', inTime: '08:48 AM', outTime: '05:18 PM', hoursWorked: 8.5, terminal: 'Bio-Gate-1 (Main Block)', sessions: [{ title: 'PRG301 Scalability Patterns', time: '10:00 AM - 11:30 AM', type: 'LECTURE' }] },
    { date: 29, dayOfWeek: 'Tue', status: 'PRESENT', inTime: '08:52 AM', outTime: '05:22 PM', hoursWorked: 8.5, terminal: 'Bio-Gate-2 (CS Wing)', sessions: [{ title: 'Lab Session Batch B', time: '01:30 PM - 03:30 PM', type: 'LAB' }] },
    { date: 30, dayOfWeek: 'Wed', status: 'PRESENT', inTime: '08:50 AM', outTime: '05:15 PM', hoursWorked: 8.41, terminal: 'Bio-Gate-1 (Main Block)', sessions: [{ title: 'Monthly Department Review', time: '03:00 PM - 04:30 PM', type: 'MEETING' }] },
  ];

  // Compute Live KPIs
  const presentDays = daysInMonth.filter(d => d.status === 'PRESENT' || d.status === 'HALF_DAY');
  const onDutyDays = daysInMonth.filter(d => d.status === 'ON_DUTY');
  const holidays = daysInMonth.filter(d => d.status === 'HOLIDAY');
  const daysAttended = presentDays.length + onDutyDays.length;

  const validHours = presentDays.map(d => d.hoursWorked).filter(h => h > 0);
  const avgHours = (validHours.reduce((a, b) => a + b, 0) / (validHours.length || 1)).toFixed(1);
  const maxHours = (validHours.length > 0 ? Math.max(...validHours) : 0).toFixed(1);
  const minHours = (validHours.length > 0 ? Math.min(...validHours) : 0).toFixed(1);

  // Status Styling Configuration
  const getStatusTheme = (status: DayAttendanceRecord['status']) => {
    switch (status) {
      case 'PRESENT':
        return {
          bg: 'bg-emerald-50/70 hover:bg-emerald-100/90',
          border: 'border-emerald-200 hover:border-emerald-400',
          badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          label: 'Present',
          dot: 'bg-emerald-500',
          textClass: 'text-emerald-900',
          tag: '≥ 8.0h Full Day'
        };
      case 'ON_DUTY':
        return {
          bg: 'bg-sky-50/70 hover:bg-sky-100/90',
          border: 'border-sky-200 hover:border-sky-400',
          badgeBg: 'bg-sky-100 text-sky-800 border-sky-300',
          label: 'On Duty',
          dot: 'bg-sky-500',
          textClass: 'text-sky-900',
          tag: 'Official Duty'
        };
      case 'HALF_DAY':
        return {
          bg: 'bg-amber-50/70 hover:bg-amber-100/90',
          border: 'border-amber-200 hover:border-amber-400',
          badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
          label: 'Half Day',
          dot: 'bg-amber-500',
          textClass: 'text-amber-900',
          tag: '< 8.0h Partial'
        };
      case 'HOLIDAY':
        return {
          bg: 'bg-purple-50/70 hover:bg-purple-100/90',
          border: 'border-purple-200 hover:border-purple-400',
          badgeBg: 'bg-purple-100 text-purple-900 border-purple-300',
          label: 'Holiday',
          dot: 'bg-purple-500',
          textClass: 'text-purple-900',
          tag: 'Gazetted'
        };
      case 'CASUAL_LEAVE':
        return {
          bg: 'bg-rose-50/70 hover:bg-rose-100/90',
          border: 'border-rose-200 hover:border-rose-400',
          badgeBg: 'bg-rose-100 text-rose-900 border-rose-300',
          label: 'Leave',
          dot: 'bg-rose-500',
          textClass: 'text-rose-900',
          tag: 'Approved CL'
        };
      default: // WEEKEND
        return {
          bg: 'bg-slate-50/70 hover:bg-slate-100/80',
          border: 'border-slate-200',
          badgeBg: 'bg-slate-100 text-slate-500 border-slate-200',
          label: 'Weekend',
          dot: 'bg-slate-400',
          textClass: 'text-slate-400',
          tag: 'Non-working'
        };
    }
  };

  const filteredDays = daysInMonth.filter(d => {
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'PRESENT') return d.status === 'PRESENT';
    if (statusFilter === 'ON_DUTY') return d.status === 'ON_DUTY';
    if (statusFilter === 'HALF_DAY') return d.status === 'HALF_DAY';
    if (statusFilter === 'HOLIDAY') return d.status === 'HOLIDAY';
    if (statusFilter === 'LEAVE') return d.status === 'CASUAL_LEAVE';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* 1. TOP KPI METRICS STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* KPI 1: Average Hours */}
        <div className="bg-white p-4 rounded-2xl border border-amber-900/15 shadow-sm space-y-1 hover:border-amber-400/50 transition">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold text-slate-600">Avg Hours / Day</span>
            <Clock size={15} className="text-amber-600" />
          </div>
          <div className="font-serif font-bold text-2xl text-slate-900">
            {avgHours} <span className="text-xs font-normal text-slate-500">hrs</span>
          </div>
          <div className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
            <TrendingUp size={11} />
            <span>Compliant (&ge; 8.0h target)</span>
          </div>
        </div>

        {/* KPI 2: Max Hours */}
        <div className="bg-white p-4 rounded-2xl border border-amber-900/15 shadow-sm space-y-1 hover:border-amber-400/50 transition">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold text-slate-600">Max Hours</span>
            <Activity size={15} className="text-purple-600" />
          </div>
          <div className="font-serif font-bold text-2xl text-purple-900">
            {maxHours} <span className="text-xs font-normal text-slate-500">hrs</span>
          </div>
          <div className="text-[10px] text-slate-500 font-medium truncate">
            Peak on Sep 4 (Seminar)
          </div>
        </div>

        {/* KPI 3: Min Hours */}
        <div className="bg-white p-4 rounded-2xl border border-amber-900/15 shadow-sm space-y-1 hover:border-amber-400/50 transition">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold text-slate-600">Min Hours</span>
            <Clock size={15} className="text-blue-600" />
          </div>
          <div className="font-serif font-bold text-2xl text-blue-900">
            {minHours} <span className="text-xs font-normal text-slate-500">hrs</span>
          </div>
          <div className="text-[10px] text-slate-500 font-medium truncate">
            Half day on Sep 22
          </div>
        </div>

        {/* KPI 4: Holidays */}
        <div className="bg-white p-4 rounded-2xl border border-amber-900/15 shadow-sm space-y-1 hover:border-amber-400/50 transition">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold text-slate-600">Total Holidays</span>
            <Coffee size={15} className="text-rose-600" />
          </div>
          <div className="font-serif font-bold text-2xl text-rose-900">
            {holidays.length} <span className="text-xs font-normal text-slate-500">days</span>
          </div>
          <div className="text-[10px] text-slate-500 font-medium truncate">
            2 Gazetted &bull; Sep 2026
          </div>
        </div>

        {/* KPI 5: Days Present */}
        <div className="bg-white p-4 rounded-2xl border border-amber-900/15 shadow-sm space-y-1 hover:border-amber-400/50 transition">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold text-slate-600">Days Present</span>
            <CheckCircle2 size={15} className="text-emerald-600" />
          </div>
          <div className="font-serif font-bold text-2xl text-emerald-900">
            {daysAttended} <span className="text-xs font-normal text-slate-500">/ 22</span>
          </div>
          <div className="text-[10px] text-emerald-700 font-bold">
            95.5% Attendance Rate
          </div>
        </div>

        {/* KPI 6: Leaves Remaining */}
        <div className="bg-white p-4 rounded-2xl border border-amber-900/15 shadow-sm space-y-1 hover:border-amber-400/50 transition">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold text-slate-600">Leave Balance</span>
            <CalendarIcon size={15} className="text-amber-600" />
          </div>
          <div className="font-serif font-bold text-2xl text-amber-900">
            8 <span className="text-xs font-normal text-slate-500">CL left</span>
          </div>
          <div className="text-[10px] text-slate-500 font-medium">
            10 Medical &bull; 4 OD taken
          </div>
        </div>
      </div>

      {/* 2. CALENDAR CONTROL BAR */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
            <button className="p-1 hover:bg-white rounded-lg transition" title="Previous Month">
              <ChevronLeft size={16} />
            </button>
            <span className="font-serif font-bold px-3 text-slate-900 text-sm">{currentMonth}</span>
            <button className="p-1 hover:bg-white rounded-lg transition" title="Next Month">
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Quick Filter Tabs */}
          <div className="flex items-center gap-1 pl-1 sm:pl-2 border-l border-slate-200 flex-wrap">
            {[
              { id: 'ALL', label: 'All Days' },
              { id: 'PRESENT', label: 'Present' },
              { id: 'ON_DUTY', label: 'On Duty' },
              { id: 'HALF_DAY', label: 'Half Day' },
              { id: 'HOLIDAY', label: 'Holiday' },
              { id: 'LEAVE', label: 'Leave' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id)}
                className={`px-2.5 py-1 rounded-lg font-bold transition text-[11px] ${
                  statusFilter === f.id 
                    ? 'bg-[#0a1e3b] text-amber-300 shadow-sm' 
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button 
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:bg-slate-50 rounded-xl font-bold text-slate-700 transition"
            title="Download Official Monthly Timesheet"
          >
            <Download size={13} />
            <span>Export Timesheet</span>
          </button>
        </div>
      </div>

      {/* 3. CALENDAR GRID VIEW (Clean Colored Tiles with Hover Timing Tooltips) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-3 sm:p-4 space-y-2">
        {/* Day Header Row */}
        <div className="grid grid-cols-7 text-center font-bold text-slate-600 text-xs py-2 border-b border-slate-100">
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div className="text-rose-600">Sat</div>
          <div className="text-rose-600">Sun</div>
        </div>

        {/* Day Tiles Grid with Accurate September 1 (Tuesday) Alignment */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-xs">
          {/* Calendar Padding: August 31 (Monday) to align Sep 1 with Tuesday */}
          <div className="p-2 sm:p-3 min-h-[78px] sm:min-h-[88px] rounded-xl bg-slate-50/30 border border-dashed border-slate-200/60 opacity-40 flex flex-col justify-between select-none">
            <span className="font-mono text-xs text-slate-400">31</span>
            <span className="text-[9px] text-slate-400 font-medium">Aug</span>
          </div>

          {daysInMonth.map((day) => {
            const isSelected = selectedDay?.date === day.date;
            const isHovered = hoveredDay?.date === day.date;
            const isWeekend = day.status === 'WEEKEND';
            const theme = getStatusTheme(day.status);
            const isMatchFilter = statusFilter === 'ALL' || 
              (statusFilter === 'PRESENT' && day.status === 'PRESENT') ||
              (statusFilter === 'ON_DUTY' && day.status === 'ON_DUTY') ||
              (statusFilter === 'HALF_DAY' && day.status === 'HALF_DAY') ||
              (statusFilter === 'HOLIDAY' && day.status === 'HOLIDAY') ||
              (statusFilter === 'LEAVE' && day.status === 'CASUAL_LEAVE');

            const isTopRow = day.date <= 7;
            const isRightColumn = day.dayOfWeek === 'Sat' || day.dayOfWeek === 'Sun' || day.dayOfWeek === 'Fri';
            const isLeftColumn = day.dayOfWeek === 'Mon' || day.dayOfWeek === 'Tue';
            const verticalClass = isTopRow ? 'top-[105%]' : 'bottom-[105%]';
            const horizontalClass = isRightColumn ? 'right-0' : isLeftColumn ? 'left-0' : 'left-1/2 -translate-x-1/2';

            return (
              <div
                key={day.date}
                onMouseEnter={() => setHoveredDay(day)}
                onMouseLeave={() => setHoveredDay(null)}
                onClick={() => !isWeekend && setSelectedDay(day)}
                className={`group relative p-2 sm:p-2.5 min-h-[78px] sm:min-h-[88px] rounded-xl border flex flex-col justify-between transition-all duration-200 cursor-pointer select-none ${
                  theme.bg
                } ${
                  theme.border
                } ${
                  !isMatchFilter ? 'opacity-30' : 'opacity-100'
                } ${
                  isHovered
                    ? 'z-40 ring-2 ring-amber-400 shadow-lg scale-[1.02]'
                    : isSelected 
                      ? 'ring-2 ring-amber-500 shadow-md scale-[1.02] z-20' 
                      : 'hover:shadow-md hover:scale-[1.01] z-1'
                }`}
              >
                {/* Top Row: Date Number + Status Pill */}
                <div className="flex items-start justify-between gap-1">
                  <span className={`font-serif font-bold text-sm sm:text-base ${theme.textClass}`}>
                    {day.date}
                  </span>
                  <span className={`px-1.5 py-0.5 rounded-md font-bold text-[9px] sm:text-[10px] border leading-none shrink-0 ${theme.badgeBg}`}>
                    {theme.label}
                  </span>
                </div>

                {/* Bottom Row: Clean Indicator (Hours badge or Session count, NO timings in cell) */}
                <div className="flex items-center justify-between text-[10px] pt-1">
                  {day.hoursWorked > 0 ? (
                    <div className="flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${theme.dot}`} />
                      <span className="font-mono font-bold text-slate-700 text-[11px]">
                        {day.hoursWorked}h
                      </span>
                    </div>
                  ) : (
                    <div className="text-[10px] text-slate-400 italic truncate max-w-[90%]">
                      {day.status === 'WEEKEND' ? 'Off' : day.status === 'HOLIDAY' ? 'Holiday' : 'Leave'}
                    </div>
                  )}

                  {day.sessions.length > 0 && (
                    <span className="hidden sm:inline-block font-mono text-[9px] text-slate-500 bg-white/70 px-1 py-0.5 rounded border border-slate-200/60 font-semibold" title={`${day.sessions.length} sessions scheduled`}>
                      {day.sessions.length} cls
                    </span>
                  )}
                </div>

                {/* FLOATING HOVER TIMING POPOVER (Appears ONLY on mouse hover) */}
                {isHovered && !isWeekend && (
                  <div className={`absolute z-50 ${verticalClass} ${horizontalClass} w-64 sm:w-72 bg-[#08172c] text-white p-3.5 rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.85)] border-2 border-amber-400/80 pointer-events-none animate-fadeIn space-y-2`}>
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                        <span className="font-serif font-bold text-xs text-white">
                          Sep {day.date}, 2026 ({day.dayOfWeek})
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase border ${theme.badgeBg}`}>
                        {theme.label}
                      </span>
                    </div>

                    {/* Biometric Punch Timings */}
                    {day.hoursWorked > 0 ? (
                      <div className="space-y-1.5">
                        <div className="grid grid-cols-2 gap-2 bg-white/5 p-2 rounded-xl border border-white/10 text-[11px]">
                          <div>
                            <span className="text-[9px] text-slate-400 uppercase font-semibold block">Punch In</span>
                            <span className="font-mono font-bold text-emerald-300">{day.inTime}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-400 uppercase font-semibold block">Punch Out</span>
                            <span className="font-mono font-bold text-sky-300">{day.outTime}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-300 px-1">
                          <span>Total Work Duration:</span>
                          <span className="font-mono font-bold text-amber-300 text-xs">{day.hoursWorked} hrs</span>
                        </div>

                        <div className="flex items-center gap-1 text-[9px] text-slate-400 px-1">
                          <MapPin size={10} className="text-amber-400 shrink-0" />
                          <span className="truncate">{day.terminal || 'CU-Bio-Terminal-01'}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-2 bg-white/5 rounded-xl border border-white/10 text-[11px] text-slate-300">
                        <p className="font-bold text-amber-300">{day.holidayName || 'Official Leave'}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Biometric punch exemption registered.</p>
                      </div>
                    )}

                    {/* Scheduled Sessions Preview */}
                    {day.sessions.length > 0 && (
                      <div className="border-t border-white/10 pt-1.5">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          Teaching Sessions ({day.sessions.length})
                        </span>
                        <div className="space-y-1">
                          {day.sessions.map((s, idx) => (
                            <div key={idx} className="flex items-center justify-between text-[10px]">
                              <span className="text-white truncate max-w-[140px]">{s.title}</span>
                              <span className="font-mono text-amber-300/90 text-[9px]">{s.time.split(' - ')[0]}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="text-[9px] text-amber-300/70 text-center italic border-t border-white/10 pt-1">
                      Click tile to pin full breakdown below
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. ATTENDANCE STATUS COLOR LEGEND (Requested explicitly by user) */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <Award size={15} className="text-amber-600" />
            <h3 className="font-serif font-bold text-xs sm:text-sm text-slate-900 tracking-tight">
              Attendance Color Legend &amp; Shift Compliance
            </h3>
          </div>
          <span className="text-[10px] text-slate-500 flex items-center gap-1">
            <Info size={12} className="text-amber-600" />
            <span>Hover mouse over any calendar date to view exact biometric In/Out punch timestamps.</span>
          </span>
        </div>

        {/* 6 High-Contrast Status Color Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
          {/* Legend 1: Present */}
          <div 
            onClick={() => setStatusFilter(statusFilter === 'PRESENT' ? 'ALL' : 'PRESENT')}
            className={`p-2.5 rounded-xl border flex items-center gap-2.5 cursor-pointer transition ${
              statusFilter === 'PRESENT' ? 'bg-emerald-100 border-emerald-400 ring-2 ring-emerald-400' : 'bg-emerald-50/70 border-emerald-200 hover:bg-emerald-100/60'
            }`}
          >
            <div className="w-3.5 h-3.5 rounded-md bg-emerald-500 border border-emerald-600 shrink-0" />
            <div className="min-w-0">
              <div className="font-bold text-xs text-emerald-950 truncate">Present</div>
              <div className="text-[10px] text-emerald-800/80 font-medium truncate">&ge; 8.0h Full Day</div>
            </div>
          </div>

          {/* Legend 2: On Duty */}
          <div 
            onClick={() => setStatusFilter(statusFilter === 'ON_DUTY' ? 'ALL' : 'ON_DUTY')}
            className={`p-2.5 rounded-xl border flex items-center gap-2.5 cursor-pointer transition ${
              statusFilter === 'ON_DUTY' ? 'bg-sky-100 border-sky-400 ring-2 ring-sky-400' : 'bg-sky-50/70 border-sky-200 hover:bg-sky-100/60'
            }`}
          >
            <div className="w-3.5 h-3.5 rounded-md bg-sky-500 border border-sky-600 shrink-0" />
            <div className="min-w-0">
              <div className="font-bold text-xs text-sky-950 truncate">On Duty (OD)</div>
              <div className="text-[10px] text-sky-800/80 font-medium truncate">Academic Duty</div>
            </div>
          </div>

          {/* Legend 3: Half Day */}
          <div 
            onClick={() => setStatusFilter(statusFilter === 'HALF_DAY' ? 'ALL' : 'HALF_DAY')}
            className={`p-2.5 rounded-xl border flex items-center gap-2.5 cursor-pointer transition ${
              statusFilter === 'HALF_DAY' ? 'bg-amber-100 border-amber-400 ring-2 ring-amber-400' : 'bg-amber-50/70 border-amber-200 hover:bg-amber-100/60'
            }`}
          >
            <div className="w-3.5 h-3.5 rounded-md bg-amber-500 border border-amber-600 shrink-0" />
            <div className="min-w-0">
              <div className="font-bold text-xs text-amber-950 truncate">Half Day</div>
              <div className="text-[10px] text-amber-800/80 font-medium truncate">&lt; 8.0h Shift</div>
            </div>
          </div>

          {/* Legend 4: Holiday */}
          <div 
            onClick={() => setStatusFilter(statusFilter === 'HOLIDAY' ? 'ALL' : 'HOLIDAY')}
            className={`p-2.5 rounded-xl border flex items-center gap-2.5 cursor-pointer transition ${
              statusFilter === 'HOLIDAY' ? 'bg-purple-100 border-purple-400 ring-2 ring-purple-400' : 'bg-purple-50/70 border-purple-200 hover:bg-purple-100/60'
            }`}
          >
            <div className="w-3.5 h-3.5 rounded-md bg-purple-500 border border-purple-600 shrink-0" />
            <div className="min-w-0">
              <div className="font-bold text-xs text-purple-950 truncate">Holiday</div>
              <div className="text-[10px] text-purple-800/80 font-medium truncate">Gazetted Off</div>
            </div>
          </div>

          {/* Legend 5: Casual Leave */}
          <div 
            onClick={() => setStatusFilter(statusFilter === 'LEAVE' ? 'ALL' : 'LEAVE')}
            className={`p-2.5 rounded-xl border flex items-center gap-2.5 cursor-pointer transition ${
              statusFilter === 'LEAVE' ? 'bg-rose-100 border-rose-400 ring-2 ring-rose-400' : 'bg-rose-50/70 border-rose-200 hover:bg-rose-100/60'
            }`}
          >
            <div className="w-3.5 h-3.5 rounded-md bg-rose-500 border border-rose-600 shrink-0" />
            <div className="min-w-0">
              <div className="font-bold text-xs text-rose-950 truncate">Leave</div>
              <div className="text-[10px] text-rose-800/80 font-medium truncate">Approved CL/ML</div>
            </div>
          </div>

          {/* Legend 6: Weekend */}
          <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center gap-2.5 cursor-default">
            <div className="w-3.5 h-3.5 rounded-md bg-slate-400 border border-slate-500 shrink-0" />
            <div className="min-w-0">
              <div className="font-bold text-xs text-slate-700 truncate">Weekend</div>
              <div className="text-[10px] text-slate-500 font-medium truncate">Sat &bull; Sun Off</div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. PINNED SELECTED DAY ACTIVITY INSPECTOR DRAWER (When clicked) */}
      {selectedDay && (
        <div className="bg-white p-5 rounded-2xl border-2 border-amber-400/50 shadow-lg space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#0a1e3b] to-[#1e3a8a] text-amber-300 flex items-center justify-center font-bold text-base shadow-sm border border-amber-400/40">
                {selectedDay.date}
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <span>Biometric Timetable Breakdown — Sep {selectedDay.date}, 2026 ({selectedDay.dayOfWeek})</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase border ${getStatusTheme(selectedDay.status).badgeBg}`}>
                    {getStatusTheme(selectedDay.status).label}
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Punch In: <span className="font-mono font-bold text-slate-800">{selectedDay.inTime || 'N/A'}</span> &bull; 
                  Punch Out: <span className="font-mono font-bold text-slate-800">{selectedDay.outTime || 'N/A'}</span> &bull; 
                  Active Hours: <span className="font-bold text-amber-700">{selectedDay.hoursWorked} hrs</span> &bull;
                  Terminal: <span className="font-mono text-slate-600">{selectedDay.terminal || 'CU-Bio-Gate-1'}</span>
                </p>
              </div>
            </div>

            <button 
              onClick={() => setSelectedDay(null)}
              className="text-slate-400 hover:text-slate-700 text-xs font-bold px-2 py-1 rounded-lg hover:bg-slate-100 transition"
            >
              Close
            </button>
          </div>

          <div className="space-y-2 text-xs">
            <div className="font-bold text-slate-700 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
              <BookOpen size={13} className="text-amber-600" />
              <span>Scheduled Academic Teaching Sessions &amp; Administrative Logs</span>
            </div>
            {selectedDay.sessions.length === 0 ? (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-slate-500 italic text-center">
                No teaching lecture or lab sessions were scheduled on this calendar date.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedDay.sessions.map((sess, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2.5">
                    <BookOpen size={16} className="text-amber-600 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <div className="font-bold text-slate-800">{sess.title}</div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">{sess.time}</div>
                      <span className="inline-block mt-1 text-[9px] font-bold px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200">
                        {sess.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default AttendanceCalendarKPI;

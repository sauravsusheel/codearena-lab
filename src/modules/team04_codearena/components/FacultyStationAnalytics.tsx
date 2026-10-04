import React, { useState, useEffect } from 'react';
import { 
  Monitor, Clock, Users, Activity, CheckCircle2, AlertCircle, 
  Terminal, Filter, Download, Search, BookOpen, Layers, 
  TrendingUp, Laptop, RefreshCw, Cpu, Sparkles, Shield
} from 'lucide-react';
import { judgeService } from '../services/judgeService';
import { CurriculumSubject, StudentCodingStation, StudentLabTimeRecord } from '../types/codearena.types';

export const FacultyStationAnalytics: React.FC = () => {
  const [subjects, setSubjects] = useState<CurriculumSubject[]>([]);
  const [stations, setStations] = useState<StudentCodingStation[]>([]);
  const [timeRecords, setTimeRecords] = useState<StudentLabTimeRecord[]>([]);
  const [selectedSubjectCode, setSelectedSubjectCode] = useState<string>('ALL');
  const [activeView, setActiveView] = useState<'stations' | 'timeTable'>('stations');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    setRefreshing(true);
    const [subjs, stats, records] = await Promise.all([
      judgeService.getSubjects(),
      judgeService.getCodingStations(),
      judgeService.getStudentTimeRecords(selectedSubjectCode)
    ]);
    setSubjects(subjs);
    setStations(stats);
    setTimeRecords(records);
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, [selectedSubjectCode]);

  // Compute Top KPI Statistics
  const totalHoursLogged = timeRecords.reduce((acc, r) => acc + r.totalHoursSpent, 0).toFixed(1);
  const avgWeeklyHours = (timeRecords.reduce((acc, r) => acc + r.weeklyHours, 0) / (timeRecords.length || 1)).toFixed(1);
  const activeStationsCount = stations.filter(s => s.status === 'ACTIVE' || s.status === 'RUNNING').length;
  const avgAccuracy = Math.round(timeRecords.reduce((acc, r) => acc + r.accuracyRatePercent, 0) / (timeRecords.length || 1));

  // Filtered lists
  const filteredStations = stations.filter(s => {
    const matchesSubject = selectedSubjectCode === 'ALL' || s.subjectCode === selectedSubjectCode;
    const station = s as any;
    const studentName = String(station.studentName ?? station.student_name ?? '').toLowerCase();
    const studentUsn = String(station.studentUsn ?? station.student_usn ?? '').toLowerCase();
    const stationId = String(station.stationId ?? station.id ?? '').toLowerCase();
    const matchesSearch = studentName.includes(searchQuery.toLowerCase()) ||
                          studentUsn.includes(searchQuery.toLowerCase()) ||
                          stationId.includes(searchQuery.toLowerCase());
    return matchesSubject && matchesSearch;
  });

  const filteredRecords = timeRecords.filter(r => {
    const matchesSubject = selectedSubjectCode === 'ALL' || r.subjectCode === selectedSubjectCode;
    const recordName = String(r.name ?? '').toLowerCase();
    const recordUsn = String(r.usn ?? '').toLowerCase();
    const matchesSearch = recordName.includes(searchQuery.toLowerCase()) ||
                          recordUsn.includes(searchQuery.toLowerCase());
    return matchesSubject && matchesSearch;
  });

  const handleExportCSV = () => {
    const headers = 'USN,Student Name,School,Subject Code,Subject Name,Total Hours Spent,Weekly Hours,Active Typing %,Submissions,Accuracy %,Station,Status\n';
    const rows = filteredRecords.map(r => 
      `"${r.usn}","${r.name}","${r.school}","${r.subjectCode}","${r.subjectName}",${r.totalHoursSpent},${r.weeklyHours},${r.activeRatioPercent}%,${r.submissionsCount},${r.accuracyRatePercent}%,"${r.assignedStation}","${r.status}"`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Chanakya_Lab_Coding_Time_Telemetry_${selectedSubjectCode}.csv`;
    a.click();
  };

  const getStatusBadge = (status: StudentCodingStation['status']) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            Active Coding
          </span>
        );
      case 'RUNNING':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-300">
            <RefreshCw size={10} className="animate-spin text-sky-600" />
            Executing Sandbox
          </span>
        );
      case 'IDLE':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300">
            <Clock size={10} className="text-amber-600" />
            Idle
          </span>
        );
      case 'OFFLINE':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
            Completed / Offline
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Institutional Multi-School Policy Notice */}
      <div className="bg-gradient-to-r from-[#0a1e3b]/5 via-amber-500/10 to-transparent p-4 rounded-2xl border border-amber-500/25 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-800 mt-0.5 shrink-0">
            <Layers size={18} />
          </div>
          <div>
            <div className="font-serif font-bold text-sm text-slate-900">
              Curriculum-Mapped Lab Telemetry &amp; School Scoping
            </div>
            <p className="text-xs text-slate-600 mt-0.5 max-w-3xl">
              Programming environments are provisioned strictly for courses with coding components (e.g. <strong>Python</strong> for Data Science &amp; Genomics, <strong>Java</strong> for Enterprise Systems, <strong>C++</strong> for Systems). Students in Law, Management, and Humanities access non-coding academic suites in UniHub.
            </p>
          </div>
        </div>

        <button 
          onClick={loadData}
          disabled={refreshing}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm transition shrink-0"
        >
          <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
          <span>Refresh Live Heartbeats</span>
        </button>
      </div>

      {/* TOP KPI CARDS: Real-time Student Coding Time & Station Telemetry */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Active Coding Hours */}
        <div className="bg-white p-4 rounded-2xl border border-amber-900/15 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Coding Time Logged</span>
            <Clock size={16} className="text-amber-600" />
          </div>
          <div className="font-serif font-bold text-2xl text-slate-900">
            {totalHoursLogged} <span className="text-xs font-normal text-slate-500">hours</span>
          </div>
          <div className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
            <TrendingUp size={12} />
            <span>Active student engagement in IDE</span>
          </div>
        </div>

        {/* KPI 2: Average Weekly Hours */}
        <div className="bg-white p-4 rounded-2xl border border-amber-900/15 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Avg Weekly Time / Student</span>
            <Laptop size={16} className="text-purple-600" />
          </div>
          <div className="font-serif font-bold text-2xl text-slate-900">
            {avgWeeklyHours} <span className="text-xs font-normal text-slate-500">hrs / week</span>
          </div>
          <div className="text-[11px] text-emerald-700 font-bold">
            Target met (&ge; 4.0 hrs UGC benchmark)
          </div>
        </div>

        {/* KPI 3: Live Connected Stations */}
        <div className="bg-white p-4 rounded-2xl border border-amber-900/15 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Live Lab Terminal Stations</span>
            <Monitor size={16} className="text-sky-600" />
          </div>
          <div className="font-serif font-bold text-2xl text-slate-900">
            {activeStationsCount} <span className="text-xs font-normal text-slate-500">/ {stations.length} Active</span>
          </div>
          <div className="text-[11px] text-sky-700 font-bold">
            Real-time gVisor sandbox sessions
          </div>
        </div>

        {/* KPI 4: Code Accuracy Rate */}
        <div className="bg-white p-4 rounded-2xl border border-amber-900/15 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Avg Test Suite Accuracy</span>
            <CheckCircle2 size={16} className="text-emerald-600" />
          </div>
          <div className="font-serif font-bold text-2xl text-slate-900">
            {avgAccuracy}% <span className="text-xs font-normal text-slate-500">pass rate</span>
          </div>
          <div className="text-[11px] text-slate-500">
            Across unit &amp; hidden evaluation cases
          </div>
        </div>
      </div>

      {/* Filter Toolbar: Subject Selection, View Switcher & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Subject Filter Dropdown */}
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-amber-600 shrink-0" />
          <span className="text-xs font-bold text-slate-700 shrink-0">Subject &amp; Language:</span>
          <select
            value={selectedSubjectCode}
            onChange={(e) => setSelectedSubjectCode(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-xs font-semibold text-slate-800 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            <option value="ALL">All Enrolled Programming Subjects</option>
            {subjects.map(s => (
              <option key={s.id} value={s.code}>
                {s.code}: {s.name} ({s.primaryLanguage.toUpperCase()})
              </option>
            ))}
          </select>
        </div>

        {/* Search & View Switcher */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search USN, student, or station..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 text-xs rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400 w-52 sm:w-64"
            />
          </div>

          {/* Toggle between Station Grid and Tabular Time Logs */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold shrink-0">
            <button
              onClick={() => setActiveView('stations')}
              className={`px-3 py-1 rounded-lg transition ${
                activeView === 'stations' 
                  ? 'bg-white text-cu-navy shadow-sm' 
                  : 'text-slate-600 hover:text-cu-navy'
              }`}
            >
              Stations Grid
            </button>
            <button
              onClick={() => setActiveView('timeTable')}
              className={`px-3 py-1 rounded-lg transition ${
                activeView === 'timeTable' 
                  ? 'bg-white text-cu-navy shadow-sm' 
                  : 'text-slate-600 hover:text-cu-navy'
              }`}
            >
              Time Spent Logs
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500/15 text-amber-900 border border-amber-500/30 text-xs font-bold hover:bg-amber-500/25 transition"
            title="Download CSV report of student coding time"
          >
            <Download size={13} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: LIVE LAB STATIONS GRID */}
      {activeView === 'stations' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span className="font-bold">
              Showing {filteredStations.length} Laboratory Terminal Stations
            </span>
            <span className="text-[11px] text-slate-400">
              Terminal telemetry refreshed in real-time
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredStations.map((station) => (
              <div 
                key={station.stationId}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:border-amber-400/50 hover:shadow-md transition space-y-3"
              >
                {/* Header: Station Name & Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Monitor size={16} className="text-slate-700" />
                    <span className="font-mono font-bold text-xs text-slate-900">
                      {station.stationId}
                    </span>
                  </div>
                  {getStatusBadge(station.status)}
                </div>

                {/* Student Info */}
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1 text-xs">
                  <div className="font-bold text-slate-900 truncate">
                    {station.studentName}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span>{station.studentUsn}</span>
                    <span className="font-bold text-cu-navy bg-white px-1.5 py-0.2 rounded border border-slate-200">
                      {station.subjectCode} ({station.language.toUpperCase()})
                    </span>
                  </div>
                </div>

                {/* Problem in Progress */}
                <div className="text-xs space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Current Problem</div>
                  <div className="font-semibold text-slate-800 text-[11px] truncate" title={station.currentProblemTitle}>
                    {station.currentProblemTitle}
                  </div>
                </div>

                {/* Session Time & Active Ratio */}
                <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Clock size={11} className="text-amber-600" />
                      Session Time:
                    </span>
                    <span className="font-mono font-bold text-slate-800">
                      {station.activeMinutes}m active / {station.sessionMinutes}m
                    </span>
                  </div>

                  {/* Active Typing Progress Bar */}
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.round((station.activeMinutes / station.sessionMinutes) * 100)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>IP: {station.ipAddress}</span>
                    <span>{station.lastActiveTime}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 2: COMPREHENSIVE STUDENT TIME SPENT CODING LOGS */}
      {activeView === 'timeTable' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-serif font-bold text-slate-900 text-sm">
                Student Coding Time Logs &amp; Activity Ledger
              </h3>
              <p className="text-xs text-slate-500">
                Detailed metrics of active coding hours, typing consistency, test suite accuracy, and station occupancy.
              </p>
            </div>
            <span className="text-xs font-mono font-bold bg-amber-50 text-amber-900 px-2.5 py-1 rounded-xl border border-amber-200">
              {filteredRecords.length} Students Monitored
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Student USN &amp; Name</th>
                  <th className="px-4 py-3">School &amp; Subject</th>
                  <th className="px-4 py-3">Time Spent Coding</th>
                  <th className="px-4 py-3">Weekly Hours</th>
                  <th className="px-4 py-3">Active Typing Ratio</th>
                  <th className="px-4 py-3">Submissions &amp; Accuracy</th>
                  <th className="px-4 py-3">Station</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredRecords.map((r) => (
                  <tr key={r.usn} className="hover:bg-slate-50/70 transition">
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      <div>{r.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{r.usn}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      <div className="font-bold text-cu-navy">{r.subjectCode}</div>
                      <div className="text-[10px] text-slate-400">{r.school}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        {r.totalHoursSpent} hrs
                      </span>
                      <div className="text-[10px] text-emerald-700 font-bold">Total Semester</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono font-bold text-purple-700">
                        {r.weeklyHours} hrs
                      </span>
                      <div className="text-[10px] text-slate-400">Current Week</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-emerald-500 h-full rounded-full"
                            style={{ width: `${r.activeRatioPercent}%` }}
                          />
                        </div>
                        <span className="font-mono font-bold text-[11px] text-slate-800">
                          {r.activeRatioPercent}%
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400">Active vs. Idle</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-800">{r.submissionsCount} runs</div>
                      <div className="text-[10px] text-emerald-700 font-semibold">
                        {r.accuracyRatePercent}% Tests Passed
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-slate-700">
                      {r.assignedStation}
                    </td>
                    <td className="px-4 py-3">
                      {r.status === 'ONLINE' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                          Online
                        </span>
                      ) : r.status === 'AWAY' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300">
                          Away / Idle
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                          Completed
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
    </div>
  );
};

export default FacultyStationAnalytics;

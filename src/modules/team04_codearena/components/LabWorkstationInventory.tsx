import React, { useState, useEffect } from 'react';
import { 
  Monitor, Cpu, HardDrive, ShieldCheck, AlertTriangle, 
  CheckCircle2, RefreshCw, Wrench, Plus, Filter, Search, 
  Download, Power, Terminal, Lock, Unlock, Eye, X, Check,
  Laptop, Server, Radio, Key, Copy
} from 'lucide-react';
import { codeArenaApi } from '../services/codeArenaApi';

export interface WorkstationNode {
  id: string; // e.g. PC-01
  row: string; // Row A
  ipAddress: string;
  os: 'Ubuntu 24.04 LTS' | 'Windows 11 Pro';
  cpuCores: number;
  ramGb: number;
  gpuModel: string;
  sandboxRuntime: 'gVisor (runsc-v2)' | 'Docker Engine 26';
  status: 'OPERATIONAL' | 'RUNNING_SANDBOX' | 'MAINTENANCE' | 'OFFLINE';
  cpuUsagePct: number;
  ramUsagePct: number;
  activeUser?: {
    usn: string;
    name: string;
    subject: string;
  };
  lastHealthCheck: string;
  incidentNotes?: string;
}

export interface MaintenanceTicket {
  id: string;
  stationId: string;
  category: 'KEYBOARD_MOUSE' | 'DISPLAY' | 'SANDBOX_CONTAINER' | 'NETWORK' | 'OS_CRASH';
  severity: 'LOW' | 'MEDIUM' | 'CRITICAL';
  description: string;
  reportedBy: string;
  reportedAt: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
}

export const LabWorkstationInventory: React.FC = () => {
  const [stations, setStations] = useState<WorkstationNode[]>([]);
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
  const [backendOnline, setBackendOnline] = useState(false);

  const loadLiveData = async () => {
    try {
      const [remoteStations, remoteTickets] = await Promise.all([codeArenaApi.stations(), codeArenaApi.tickets()]);
      setStations(remoteStations.map((s: any) => ({
        id: s.id,
        row: s.row_name || 'Row A',
        ipAddress: s.ip_address || '',
        os: s.os || 'Ubuntu 24.04 LTS',
        cpuCores: Number(s.cpu_cores || 16),
        ramGb: Number(s.ram_gb || 32),
        gpuModel: s.gpu_model || 'Integrated GPU',
        sandboxRuntime: s.sandbox_runtime || 'gVisor (runsc-v2)',
        status: s.status === 'RUNNING_SANDBOX' ? 'RUNNING_SANDBOX' : s.status === 'OPERATIONAL' ? 'OPERATIONAL' : s.status,
        cpuUsagePct: Number(s.cpu_usage_pct || 0),
        ramUsagePct: Number(s.ram_usage_pct || 0),
        activeUser: s.student_usn ? { usn: s.student_usn, name: s.student_name || 'Unknown', subject: s.subject_code || '' } : undefined,
        lastHealthCheck: s.last_heartbeat || 'Unknown',
        incidentNotes: s.incident_notes || undefined
      })));
      setTickets(remoteTickets.map((t: any) => ({
        id: t.id,
        stationId: t.station_id,
        category: t.category,
        severity: t.severity,
        description: t.description,
        reportedBy: t.reported_by,
        reportedAt: t.reported_at,
        status: t.status
      })));
      setBackendOnline(true);
    } catch {
      setStations([]);
      setTickets([]);
      setBackendOnline(false);
    }
  };

  useEffect(() => { loadLiveData(); const timer = window.setInterval(loadLiveData, 5000); return () => window.clearInterval(timer); }, []);
  const [selectedRow, setSelectedRow] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStation, setSelectedStation] = useState<WorkstationNode | null>(null);
  
  // Incident Reporting Modal
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);
  const [targetIncidentStation, setTargetIncidentStation] = useState<string>('PC-01');
  const [incidentCategory, setIncidentCategory] = useState<MaintenanceTicket['category']>('KEYBOARD_MOUSE');
  const [incidentSeverity, setIncidentSeverity] = useState<MaintenanceTicket['severity']>('MEDIUM');
  const [incidentDesc, setIncidentDesc] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Computed Statistics
  const totalCount = stations.length;
  const runningCount = stations.filter(s => s.status === 'RUNNING_SANDBOX').length;
  const operationalCount = stations.filter(s => s.status === 'OPERATIONAL').length;
  const maintenanceCount = stations.filter(s => s.status === 'MAINTENANCE').length;
  const offlineCount = stations.filter(s => s.status === 'OFFLINE').length;
  const avgCpuUsage = totalCount ? Math.round(stations.reduce((acc, s) => acc + s.cpuUsagePct, 0) / totalCount) : 0;
  const avgRamUsage = totalCount ? Math.round(stations.reduce((acc, s) => acc + s.ramUsagePct, 0) / totalCount) : 0;
  const backendBadge = backendOnline ? 'Database-backed live data' : 'Database API unavailable';

  // Filtered stations
  const filteredStations = stations.filter(s => {
    const matchesRow = selectedRow === 'ALL' || s.row === selectedRow;
    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
    const matchesSearch = s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.ipAddress.includes(searchQuery) ||
                          (s.activeUser?.name.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
                          (s.activeUser?.usn.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    return matchesRow && matchesStatus && matchesSearch;
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleRebootStation = async (stationId: string) => {
    try { await codeArenaApi.reboot(stationId); await loadLiveData(); showToast(`${stationId} reboot signal recorded by the CodeArena backend.`); }
    catch { showToast(`Unable to reach the station backend for ${stationId}.`); }
  };

  const [tokenModal, setTokenModal] = useState<{ stationId: string; token: string } | null>(null);

  const handleRotateToken = async (stationId: string) => {
    try {
      const res = await codeArenaApi.rotateStationToken(stationId);
      setTokenModal(res);
      showToast(`Agent token for ${stationId} generated successfully.`);
    } catch {
      showToast(`Token rotation failed. Super Admin permissions required.`);
    }
  };

  const handleBroadcastReset = async () => {
    try { await codeArenaApi.resetStations(); await loadLiveData(); showToast('Broadcast sandbox reset persisted on the backend for all running stations.'); }
    catch { showToast('Broadcast reset could not reach the CodeArena backend.'); }
  };

  const handleOpenIncident = (stationId: string) => {
    setTargetIncidentStation(stationId);
    setIncidentCategory('KEYBOARD_MOUSE');
    setIncidentSeverity('MEDIUM');
    setIncidentDesc('');
    setIsIncidentModalOpen(true);
  };

  const handleSubmitIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incidentDesc.trim()) return;
    try {
      await codeArenaApi.createTicket({ stationId: targetIncidentStation, category: incidentCategory, severity: incidentSeverity, description: incidentDesc.trim(), reportedBy: 'Lab Instructor (Auth Session)' });
      await loadLiveData();
      setIsIncidentModalOpen(false);
      showToast(`${targetIncidentStation} incident has been persisted and the station moved to Maintenance.`);
    } catch { showToast('Incident could not be saved. Start the CodeArena backend and retry.'); }
  };

  const handleResolveTicket = async (ticketId: string) => {
    try { await codeArenaApi.resolveTicket(ticketId); await loadLiveData(); showToast(`Ticket ${ticketId} resolved and the station status was updated.`); }
    catch { showToast('Unable to resolve ticket because the backend is unavailable.'); }
  };

  const handleExportCSV = () => {
    const headers = 'Station ID,Row,IP Address,OS,Cores,RAM (GB),GPU,Runtime,Status,CPU %,RAM %,Active Student,USN,Subject,Last Health Check\n';
    const rows = stations.map(s => 
      `"${s.id}","${s.row}","${s.ipAddress}","${s.os}",${s.cpuCores},${s.ramGb},"${s.gpuModel}","${s.sandboxRuntime}","${s.status}",${s.cpuUsagePct},${s.ramUsagePct},"${s.activeUser?.name || 'Vacant'}","${s.activeUser?.usn || 'N/A'}","${s.activeUser?.subject || 'N/A'}","${s.lastHealthCheck}"`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Chanakya_Lab_Workstations_Inventory_60_Terminals.csv';
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="text-[11px] font-semibold text-slate-500">{backendBadge} · station heartbeats refresh every 5 seconds</div>
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-cu-navy text-white text-xs font-semibold shadow-2xl border border-cu-gold animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Telemetry KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white rounded-xl border border-cu-border p-3.5 shadow-sm">
          <span className="text-[11px] font-semibold text-gray-500 flex items-center gap-1">
            <Monitor size={12} className="text-cu-navy" /> Total Inventory
          </span>
          <div className="text-xl font-black text-cu-navy mt-1">{totalCount} PCs</div>
          <span className="text-[10px] text-gray-400">Lab Alpha (5 Rows)</span>
        </div>

        <div className="bg-white rounded-xl border border-cu-border p-3.5 shadow-sm">
          <span className="text-[11px] font-semibold text-gray-500 flex items-center gap-1">
            <Terminal size={12} className="text-sky-600" /> Active Coding
          </span>
          <div className="text-xl font-black text-sky-700 mt-1">{runningCount} Busy</div>
          <span className="text-[10px] text-sky-600 font-medium">{Math.round((runningCount / totalCount) * 100)}% Lab Occupancy</span>
        </div>

        <div className="bg-white rounded-xl border border-cu-border p-3.5 shadow-sm">
          <span className="text-[11px] font-semibold text-gray-500 flex items-center gap-1">
            <CheckCircle2 size={12} className="text-emerald-600" /> Ready / Idle
          </span>
          <div className="text-xl font-black text-emerald-700 mt-1">{operationalCount} Ready</div>
          <span className="text-[10px] text-emerald-600 font-medium">Available for Lab</span>
        </div>

        <div className="bg-white rounded-xl border border-cu-border p-3.5 shadow-sm">
          <span className="text-[11px] font-semibold text-gray-500 flex items-center gap-1">
            <Wrench size={12} className="text-amber-600" /> Maintenance
          </span>
          <div className="text-xl font-black text-amber-700 mt-1">{maintenanceCount} Terminals</div>
          <span className="text-[10px] text-amber-600 font-medium">{tickets.filter(t => t.status !== 'RESOLVED').length} Active Tickets</span>
        </div>

        <div className="bg-white rounded-xl border border-cu-border p-3.5 shadow-sm">
          <span className="text-[11px] font-semibold text-gray-500 flex items-center gap-1">
            <Cpu size={12} className="text-purple-600" /> Avg Cluster CPU
          </span>
          <div className="text-xl font-black text-purple-800 mt-1">{avgCpuUsage}%</div>
          <span className="text-[10px] text-purple-600 font-medium">Intel i7 13700</span>
        </div>

        <div className="bg-white rounded-xl border border-cu-border p-3.5 shadow-sm">
          <span className="text-[11px] font-semibold text-gray-500 flex items-center gap-1">
            <ShieldCheck size={12} className="text-emerald-600" /> Sandbox Isolation
          </span>
          <div className="text-xl font-black text-emerald-700 mt-1">100%</div>
          <span className="text-[10px] text-emerald-600 font-medium">gVisor Syscall Kernel</span>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-white rounded-xl border border-cu-border p-4 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search PC ID, IP, student name, USN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-cu-border focus:ring-1 focus:ring-cu-gold outline-none"
            />
          </div>

          <div className="flex items-center gap-1 text-xs bg-gray-50 px-2.5 py-1.5 rounded-lg border border-cu-border">
            <Filter size={12} className="text-cu-navy" />
            <select
              value={selectedRow}
              onChange={(e) => setSelectedRow(e.target.value)}
              className="bg-transparent font-medium text-cu-navy outline-none cursor-pointer text-xs"
            >
              <option value="ALL">All Rows (A-E)</option>
              <option value="Row A">Row A (PC 01-12)</option>
              <option value="Row B">Row B (PC 13-24)</option>
              <option value="Row C">Row C (PC 25-36)</option>
              <option value="Row D">Row D (PC 37-48)</option>
              <option value="Row E">Row E (PC 49-60)</option>
            </select>
          </div>

          <div className="flex items-center gap-1 text-xs bg-gray-50 px-2.5 py-1.5 rounded-lg border border-cu-border">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent font-medium text-cu-navy outline-none cursor-pointer text-xs"
            >
              <option value="ALL">All Statuses</option>
              <option value="OPERATIONAL">Operational / Available</option>
              <option value="RUNNING_SANDBOX">Running Sandbox / Busy</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="OFFLINE">Offline</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleBroadcastReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cu-border text-cu-navy hover:bg-gray-50 text-xs font-semibold transition shadow-sm"
          >
            <RefreshCw size={13} />
            <span>Flush Stale Containers</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cu-border text-cu-navy hover:bg-gray-50 text-xs font-semibold transition shadow-sm"
          >
            <Download size={13} />
            <span>Export Roster CSV</span>
          </button>

          <button
            onClick={() => handleOpenIncident('PC-01')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cu-navy text-white hover:bg-cu-navy-light text-xs font-bold transition shadow-sm"
          >
            <Plus size={14} />
            <span>Log Hardware Incident</span>
          </button>
        </div>
      </div>

      {/* Visual Lab Floor Grid Layout (60 Terminals) */}
      <div className="bg-white rounded-xl border border-cu-border p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-cu-navy flex items-center gap-2">
              <Laptop size={16} className="text-cu-gold" />
              Advanced Computing Lab Alpha: Interactive 60-Station Terminal Grid
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Click on any terminal square to inspect hardware specs, socket telemetry, or trigger maintenance reboot.
            </p>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-semibold">
            <span className="flex items-center gap-1 text-emerald-700">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" /> Ready ({operationalCount})
            </span>
            <span className="flex items-center gap-1 text-sky-700">
              <span className="w-2.5 h-2.5 rounded-sm bg-sky-500 inline-block" /> Coding ({runningCount})
            </span>
            <span className="flex items-center gap-1 text-amber-700">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block" /> Maintenance ({maintenanceCount})
            </span>
            <span className="flex items-center gap-1 text-slate-500">
              <span className="w-2.5 h-2.5 rounded-sm bg-slate-400 inline-block" /> Offline ({offlineCount})
            </span>
          </div>
        </div>

        {/* 60 Workstation Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-10 lg:grid-cols-12 gap-2 pt-2">
          {filteredStations.map((station) => {
            const isSelected = selectedStation?.id === station.id;
            
            let bgClass = 'bg-emerald-50 border-emerald-300 text-emerald-950 hover:border-emerald-500';
            let dotClass = 'bg-emerald-500';
            if (station.status === 'RUNNING_SANDBOX') {
              bgClass = 'bg-sky-50 border-sky-300 text-sky-950 hover:border-sky-500';
              dotClass = 'bg-sky-500 animate-pulse';
            } else if (station.status === 'MAINTENANCE') {
              bgClass = 'bg-amber-50 border-amber-300 text-amber-950 hover:border-amber-500';
              dotClass = 'bg-amber-500';
            } else if (station.status === 'OFFLINE') {
              bgClass = 'bg-slate-100 border-slate-300 text-slate-500';
              dotClass = 'bg-slate-400';
            }

            return (
              <div
                key={station.id}
                onClick={() => setSelectedStation(station)}
                className={`p-2 rounded-lg border text-center cursor-pointer transition relative group ${bgClass} ${
                  isSelected ? 'ring-2 ring-cu-navy shadow-md scale-105' : 'hover:shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
                  <span className="text-[9px] font-mono text-gray-500">{station.row.split(' ')[1]}</span>
                </div>
                <div className="font-mono font-bold text-xs">{station.id}</div>
                <div className="text-[9px] font-medium truncate mt-0.5">
                  {station.status === 'RUNNING_SANDBOX' ? (
                    <span className="text-sky-700 font-bold">{station.cpuUsagePct}% CPU</span>
                  ) : station.status === 'MAINTENANCE' ? (
                    <span className="text-amber-700 font-bold">Issue</span>
                  ) : (
                    <span className="text-emerald-700">Ready</span>
                  )}
                </div>

                {/* Micro Hover Tooltip */}
                <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-900 text-white rounded-lg shadow-xl text-[10px] z-30 pointer-events-none text-left">
                  <div className="font-bold flex items-center justify-between border-b border-slate-700 pb-1 mb-1">
                    <span>{station.id} ({station.row})</span>
                    <span className="text-amber-400 font-mono">{station.ipAddress}</span>
                  </div>
                  <div>OS: {station.os}</div>
                  <div>GPU: {station.gpuModel}</div>
                  {station.activeUser ? (
                    <div className="mt-1 pt-1 border-t border-slate-800 text-sky-300">
                      User: {station.activeUser.name} ({station.activeUser.usn})
                    </div>
                  ) : (
                    <div className="mt-1 text-emerald-400">Terminal Available</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Station Inspector Drawer / Card */}
      {selectedStation && (
        <div className="bg-white rounded-xl border border-cu-gold/60 p-5 shadow-sm space-y-4 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cu-navy text-white flex items-center justify-center font-mono font-black text-sm">
                {selectedStation.id}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-base text-cu-navy">
                    Station Inspector: {selectedStation.id} ({selectedStation.row})
                  </h4>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    selectedStation.status === 'RUNNING_SANDBOX' 
                      ? 'bg-sky-50 text-sky-800 border border-sky-300' 
                      : selectedStation.status === 'MAINTENANCE' 
                      ? 'bg-amber-50 text-amber-800 border border-amber-300' 
                      : 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                  }`}>
                    {selectedStation.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500 font-mono mt-0.5">
                  Static IP: {selectedStation.ipAddress} • Last Telemetry Ping: {selectedStation.lastHealthCheck}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleRebootStation(selectedStation.id)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-cu-border text-cu-navy hover:bg-gray-50 text-xs font-semibold transition"
                title="Send remote reboot command to physical workstation"
              >
                <RefreshCw size={13} /> Reboot Daemon
              </button>
              <button
                onClick={() => handleRotateToken(selectedStation.id)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-amber-500/40 text-amber-800 bg-amber-50/50 hover:bg-amber-100/60 text-xs font-semibold transition"
                title="Rotate workstation agent secret and pairing token"
              >
                <Key size={13} /> Rotate Token
              </button>
              <button
                onClick={() => handleOpenIncident(selectedStation.id)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-600 text-white hover:bg-amber-700 text-xs font-bold transition"
              >
                <Wrench size={13} /> Report Ticket
              </button>
              <button
                onClick={() => setSelectedStation(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Detailed Hardware & Live Container Telemetry */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-200/70 space-y-1.5">
              <span className="font-bold text-cu-navy flex items-center gap-1.5">
                <Cpu size={14} className="text-cu-gold" /> Compute &amp; Hardware Specs
              </span>
              <div className="text-gray-700"><strong>Processor:</strong> 16 Cores Intel Core i7 13700</div>
              <div className="text-gray-700"><strong>System Memory:</strong> {selectedStation.ramGb} GB DDR5 5600MHz</div>
              <div className="text-gray-700"><strong>GPU Unit:</strong> {selectedStation.gpuModel}</div>
              <div className="text-gray-700"><strong>Operating System:</strong> {selectedStation.os}</div>
            </div>

            <div className="bg-gray-50 rounded-xl p-3 border border-gray-200/70 space-y-1.5">
              <span className="font-bold text-cu-navy flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-emerald-600" /> Security &amp; Sandbox Runtime
              </span>
              <div className="text-gray-700"><strong>Runtime Engine:</strong> {selectedStation.sandboxRuntime}</div>
              <div className="text-gray-700"><strong>Syscall Filter:</strong> Seccomp-BPF Enforced</div>
              <div className="text-gray-700"><strong>Resource Caps:</strong> 2 Cores, 2GB RAM, 512MB Disk</div>
              <div className="text-gray-700"><strong>Network Egress:</strong> Restricted to Chanakya Subnet</div>
            </div>

            <div className="bg-gray-50 rounded-xl p-3 border border-gray-200/70 space-y-1.5">
              <span className="font-bold text-cu-navy flex items-center gap-1.5">
                <Terminal size={14} className="text-sky-600" /> Active Session Details
              </span>
              {selectedStation.activeUser ? (
                <>
                  <div className="text-gray-800"><strong>Student:</strong> {selectedStation.activeUser.name}</div>
                  <div className="text-gray-800"><strong>USN:</strong> {selectedStation.activeUser.usn}</div>
                  <div className="text-gray-700"><strong>Course:</strong> {selectedStation.activeUser.subject}</div>
                  <div className="text-gray-700"><strong>Usage:</strong> {selectedStation.cpuUsagePct}% CPU / {selectedStation.ramUsagePct}% RAM</div>
                </>
              ) : (
                <div className="text-gray-400 italic py-3">
                  No active student session. Terminal is clean and ready for student assignment.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Lab Maintenance & Hardware Incident Tickets */}
      <div className="bg-white rounded-xl border border-cu-border p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-cu-navy flex items-center gap-2">
            <Wrench size={16} className="text-amber-600" />
            Hardware Maintenance Queue &amp; Incident Records
          </h3>
          <span className="text-xs text-gray-400">Lab Technician Action Queue</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-100">
              <tr>
                <th className="p-3">Ticket ID</th>
                <th className="p-3">Station</th>
                <th className="p-3">Category</th>
                <th className="p-3">Severity</th>
                <th className="p-3">Description</th>
                <th className="p-3">Reported By &amp; Time</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-gray-50/50">
                  <td className="p-3 font-mono font-bold text-cu-navy">{ticket.id}</td>
                  <td className="p-3 font-mono font-bold text-cu-gold">{ticket.stationId}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-semibold">
                      {ticket.category.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      ticket.severity === 'CRITICAL' ? 'bg-rose-50 text-rose-700' : ticket.severity === 'MEDIUM' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'
                    }`}>
                      {ticket.severity}
                    </span>
                  </td>
                  <td className="p-3 text-gray-700 max-w-xs">{ticket.description}</td>
                  <td className="p-3 text-gray-500">
                    <div>{ticket.reportedBy}</div>
                    <div className="text-[10px] text-gray-400">{ticket.reportedAt}</div>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      ticket.status === 'RESOLVED' 
                        ? 'bg-emerald-50 text-emerald-700' 
                        : ticket.status === 'IN_PROGRESS' 
                        ? 'bg-blue-50 text-blue-700' 
                        : 'bg-amber-50 text-amber-700'
                    }`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    {ticket.status !== 'RESOLVED' ? (
                      <button
                        onClick={() => handleResolveTicket(ticket.id)}
                        className="px-2.5 py-1 rounded bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition"
                      >
                        Resolve &amp; Restore
                      </button>
                    ) : (
                      <span className="text-gray-400 text-xs flex items-center justify-end gap-1">
                        <Check size={13} className="text-emerald-600" /> Completed
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Incident Modal */}
      {isIncidentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-cu-border animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <div>
                <h3 className="font-bold text-base text-cu-navy flex items-center gap-2">
                  <Wrench size={18} className="text-amber-600" />
                  Log Hardware Incident
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Report workstation malfunction or peripheral failure</p>
              </div>
              <button
                onClick={() => setIsIncidentModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmitIncident} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Affected Workstation</label>
                <select
                  value={targetIncidentStation}
                  onChange={(e) => setTargetIncidentStation(e.target.value)}
                  className="w-full p-2 rounded-lg border border-cu-border focus:ring-1 focus:ring-cu-gold outline-none text-xs font-mono font-bold"
                >
                  {stations.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.id} ({s.row} - {s.status})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Category</label>
                  <select
                    value={incidentCategory}
                    onChange={(e) => setIncidentCategory(e.target.value as any)}
                    className="w-full p-2 rounded-lg border border-cu-border focus:ring-1 focus:ring-cu-gold outline-none text-xs"
                  >
                    <option value="KEYBOARD_MOUSE">Keyboard / Mouse</option>
                    <option value="DISPLAY">Display / HDMI</option>
                    <option value="SANDBOX_CONTAINER">gVisor Sandbox Daemon</option>
                    <option value="NETWORK">Network / NIC Cable</option>
                    <option value="OS_CRASH">Kernel / OS Crash</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Severity</label>
                  <select
                    value={incidentSeverity}
                    onChange={(e) => setIncidentSeverity(e.target.value as any)}
                    className="w-full p-2 rounded-lg border border-cu-border focus:ring-1 focus:ring-cu-gold outline-none text-xs"
                  >
                    <option value="LOW">Low (Cosmetic/Peripheral)</option>
                    <option value="MEDIUM">Medium (Degraded)</option>
                    <option value="CRITICAL">Critical (Station Offline)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Incident Description &amp; Symptoms</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe failure symptoms, error logs, or required replacement part..."
                  value={incidentDesc}
                  onChange={(e) => setIncidentDesc(e.target.value)}
                  className="w-full p-2 rounded-lg border border-cu-border focus:ring-1 focus:ring-cu-gold outline-none text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsIncidentModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-gray-300 text-gray-600 font-semibold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-amber-600 text-white font-bold hover:bg-amber-700 transition shadow-sm"
                >
                  Log Ticket &amp; Mark Maintenance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Station Agent Token Rotation Modal */}
      {tokenModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-cu-border space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
                  <Key size={18} />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-sm text-cu-navy">Workstation Agent Pairing Token</h3>
                  <p className="text-[11px] text-gray-500">Node ID: {tokenModal.stationId}</p>
                </div>
              </div>
              <button
                onClick={() => setTokenModal(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="font-semibold text-gray-700 block mb-1">Rotated Secret Token:</span>
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl p-2.5 font-mono text-[11px] text-gray-800 break-all select-all">
                  <span className="flex-1">{tokenModal.token}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(tokenModal.token);
                      showToast('Token copied to clipboard');
                    }}
                    className="p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-gray-800 transition shrink-0"
                    title="Copy Token"
                  >
                    <Copy size={14} />
                  </button>
                </div>
              </div>

              <div>
                <span className="font-semibold text-gray-700 block mb-1">Launch Agent on Workstation:</span>
                <div className="bg-slate-900 text-slate-100 rounded-xl p-3 font-mono text-[11px] space-y-1">
                  <p className="text-slate-400"># Run on physical workstation {tokenModal.stationId}:</p>
                  <p className="text-amber-300">export CODEARENA_STATION_TOKEN="{tokenModal.token}"</p>
                  <p className="text-emerald-400">node scripts/station-agent.mjs {tokenModal.stationId} http://SERVER:8787</p>
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/60 text-[11px] text-amber-800">
                This token authenticates the workstation's real-time hardware telemetry and allows remote maintenance commands (such as reboot and container reset).
              </div>
            </div>

            <div className="flex items-center justify-end pt-2 border-t border-gray-100">
              <button
                onClick={() => setTokenModal(null)}
                className="px-4 py-1.5 rounded-lg bg-cu-navy text-white font-bold hover:bg-blue-950 transition text-xs shadow-sm"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

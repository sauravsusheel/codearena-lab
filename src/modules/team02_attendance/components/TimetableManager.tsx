import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, MapPin, User, Plus, Edit2, Trash2, 
  AlertTriangle, CheckCircle2, Filter, Layers, BookOpen,
  Sparkles, Printer, Download, X, ShieldCheck
} from 'lucide-react';
import { 
  timetableService, 
  CAMPUS_ROOMS_AND_LABS, 
  CAMPUS_BATCHES, 
  FACULTY_MEMBERS 
} from '../services/timetableService';
import { TimetableSlot, DayOfWeek } from '../types/attendance.types';
import { useAuth } from '../../../context/AuthContext';

const DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const TimetableManager: React.FC = () => {
  const { user } = useAuth();

  // Strict Academic Policy Guard: Students are not permitted to access or download master timetables
  if (user?.role === 'STUDENT') {
    return (
      <div className="p-10 bg-white rounded-2xl border border-cu-border text-center space-y-4 shadow-sm max-w-2xl mx-auto my-8">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-600">
          <AlertTriangle size={24} />
        </div>
        <div>
          <h3 className="font-bold text-cu-navy text-base">Student Access Restricted: Master Timetable</h3>
          <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
            Institutional master timetables, room allocation matrices, and laboratory scheduling are restricted to Course Allocators, Department Coordinators, and Faculty.
          </p>
          <p className="text-[11px] text-gray-400 mt-2">
            Students cannot access, extract, or download the master timetable. Please refer to your Course Register for enrolled course lectures and attendance gates.
          </p>
        </div>
      </div>
    );
  }

  const canEdit = user?.role === 'COURSE_ALLOCATOR' || user?.role === 'COORDINATOR' || user?.role === 'SUPER_ADMIN';

  const [slots, setSlots] = useState<TimetableSlot[]>([]);
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('Monday');
  const [selectedBatch, setSelectedBatch] = useState<string>('MCA 3rd Sem');
  const [facultyFilter, setFacultyFilter] = useState<string>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNoticeboardModalOpen, setIsNoticeboardModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimetableSlot | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const handleAutoGenerate = () => {
    if (window.confirm(`Auto-generate a complete, conflict-free weekly schedule for batch "${selectedBatch}" across Monday to Friday?`)) {
      const res = timetableService.autoGenerateBatchSchedule(selectedBatch);
      if (res.success) {
        showToast(`Auto-generated ${res.count} conflict-free curriculum slots for ${selectedBatch}.`);
        loadSlots();
      } else {
        showToast('Failed to auto-generate schedule.');
      }
    }
  };

  // Form Fields
  const [formDay, setFormDay] = useState<DayOfWeek>('Monday');
  const [formStartTime, setFormStartTime] = useState('09:00');
  const [formEndTime, setFormEndTime] = useState('10:00');
  const [formCourseCode, setFormCourseCode] = useState('MCA301');
  const [formCourseName, setFormCourseName] = useState('Enterprise Cloud Architecture');
  const [formFaculty, setFormFaculty] = useState(FACULTY_MEMBERS[0]);
  const [formRoom, setFormRoom] = useState(CAMPUS_ROOMS_AND_LABS[0]);
  const [formType, setFormType] = useState<'LECTURE' | 'LAB' | 'TUTORIAL' | 'SEMINAR'>('LECTURE');
  const [formBatch, setFormBatch] = useState('MCA 3rd Sem');

  const loadSlots = () => {
    setSlots(timetableService.getSlots());
  };

  useEffect(() => {
    loadSlots();
  }, []);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleOpenAdd = () => {
    setEditingSlot(null);
    setFormDay(selectedDay);
    setFormStartTime('09:00');
    setFormEndTime('10:00');
    setFormCourseCode('MCA301');
    setFormCourseName('Enterprise Cloud Architecture');
    setFormFaculty(FACULTY_MEMBERS[0]);
    setFormRoom(CAMPUS_ROOMS_AND_LABS[0]);
    setFormType('LECTURE');
    setFormBatch(selectedBatch);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (slot: TimetableSlot) => {
    setEditingSlot(slot);
    setFormDay(slot.day);
    setFormStartTime(slot.startTime);
    setFormEndTime(slot.endTime);
    setFormCourseCode(slot.courseCode);
    setFormCourseName(slot.courseName);
    const fac = FACULTY_MEMBERS.find(f => f.name === slot.facultyName) || {
      name: slot.facultyName,
      empId: slot.facultyEmpId,
      dept: 'Academic Faculty'
    };
    setFormFaculty(fac);
    setFormRoom(slot.roomLab);
    setFormType(slot.type);
    setFormBatch(slot.batch);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSaveSlot = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const slotPayload = {
      day: formDay,
      startTime: formStartTime,
      endTime: formEndTime,
      courseCode: formCourseCode.trim(),
      courseName: formCourseName.trim(),
      facultyName: formFaculty.name,
      facultyEmpId: formFaculty.empId,
      roomLab: formRoom,
      type: formType,
      batch: formBatch
    };

    if (editingSlot) {
      const res = timetableService.updateSlot({ ...slotPayload, id: editingSlot.id });
      if (!res.success) {
        setFormError(res.error || 'Failed to update schedule slot.');
        return;
      }
      showToast('Timetable slot updated successfully.');
    } else {
      const res = timetableService.addSlot(slotPayload);
      if (!res.success) {
        setFormError(res.error || 'Failed to allocate timetable slot.');
        return;
      }
      showToast('New course slot allocated with conflict checks passed.');
    }

    setIsModalOpen(false);
    loadSlots();
  };

  const handleDeleteSlot = (id: string, courseCode: string) => {
    if (window.confirm(`Are you sure you want to remove ${courseCode} from the timetable?`)) {
      timetableService.deleteSlot(id);
      showToast(`Slot ${courseCode} removed.`);
      loadSlots();
    }
  };

  // Filter slots
  const filteredSlots = slots.filter(s => {
    if (s.day !== selectedDay) return false;
    if (selectedBatch && s.batch.toLowerCase() !== selectedBatch.toLowerCase()) return false;
    if (facultyFilter !== 'ALL' && !s.facultyName.toLowerCase().includes(facultyFilter.toLowerCase())) return false;
    return true;
  }).sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-3 rounded-lg flex items-center gap-2 text-xs font-semibold shadow-sm animate-fade-in">
          <CheckCircle2 size={16} className="text-emerald-600" />
          {successToast}
        </div>
      )}

      {/* Control Bar: Filters & Actions */}
      <div className="bg-white rounded-xl border border-cu-border p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-cu-navy">
            <Layers size={15} className="text-cu-gold" />
            <span>Batch:</span>
            <select
              value={selectedBatch}
              onChange={e => setSelectedBatch(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-md px-2.5 py-1 text-xs text-gray-800 focus:outline-none focus:border-cu-gold"
            >
              {CAMPUS_BATCHES.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-cu-navy">
            <Filter size={15} className="text-cu-gold" />
            <span>Faculty Filter:</span>
            <select
              value={facultyFilter}
              onChange={e => setFacultyFilter(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-md px-2.5 py-1 text-xs text-gray-800 focus:outline-none focus:border-cu-gold"
            >
              <option value="ALL">All Faculty</option>
              {FACULTY_MEMBERS.map(f => (
                <option key={f.empId} value={f.name}>{f.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {canEdit && (
            <>
              <button
                onClick={handleAutoGenerate}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-800 hover:bg-indigo-100 text-xs font-bold rounded-lg shadow-xs transition"
              >
                <Sparkles size={13} className="text-indigo-600" />
                Auto-Generate Batch Schedule
              </button>

              <button
                onClick={() => setIsNoticeboardModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-cu-border text-cu-navy hover:bg-gray-50 text-xs font-bold rounded-lg shadow-xs transition"
              >
                <Printer size={13} className="text-cu-navy" />
                Noticeboard Master Print
              </button>

              <button
                onClick={handleOpenAdd}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cu-navy text-white hover:bg-cu-navy/90 text-xs font-bold rounded-lg shadow-sm transition"
              >
                <Plus size={14} />
                Allocate Class / Lab Slot
              </button>
            </>
          )}
        </div>
      </div>

      {/* Day Selector Pills */}
      <div className="flex overflow-x-auto gap-2 border-b border-gray-200 pb-2">
        {DAYS.map(day => {
          const count = slots.filter(s => s.day === day && (selectedBatch ? s.batch === selectedBatch : true)).length;
          const isSelected = selectedDay === day;
          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 whitespace-nowrap transition ${
                isSelected 
                  ? 'bg-cu-navy text-white shadow' 
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-cu-border'
              }`}
            >
              <Calendar size={13} />
              <span>{day}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                isSelected ? 'bg-cu-gold text-cu-navy font-bold' : 'bg-gray-100 text-gray-600'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Timetable Schedule Grid */}
      <div className="bg-white rounded-xl border border-cu-border shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-cu-border bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-cu-gold" />
            <h3 className="font-bold text-sm text-cu-navy">
              {selectedDay} Schedule — {selectedBatch}
            </h3>
          </div>
          <span className="text-xs text-gray-500">
            {filteredSlots.length} lecture &amp; lab sessions allocated
          </span>
        </div>

        {filteredSlots.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Calendar size={36} className="mx-auto mb-2 opacity-40" />
            <p className="text-xs font-semibold text-gray-500">No classes allocated for {selectedDay} ({selectedBatch}).</p>
            {canEdit && (
              <p className="text-xs text-gray-400 mt-1">
                Click &quot;Allocate Class / Lab Slot&quot; above to add a lecture or practical session.
              </p>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredSlots.map(slot => (
              <div 
                key={slot.id} 
                className="p-4 hover:bg-gray-50/70 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left: Time and Type */}
                <div className="flex items-start md:items-center gap-4 min-w-[210px]">
                  <div className="w-12 h-12 rounded-xl bg-cu-pill text-cu-navy flex flex-col items-center justify-center font-bold text-xs flex-shrink-0 border border-slate-200">
                    <Clock size={16} className="text-cu-gold mb-0.5" />
                    <span className="text-[10px]">{slot.startTime}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-cu-navy">{slot.startTime} - {slot.endTime}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        slot.type === 'LAB' 
                          ? 'bg-amber-100 text-amber-900 border border-amber-200' 
                          : slot.type === 'SEMINAR'
                          ? 'bg-purple-100 text-purple-900 border border-purple-200'
                          : 'bg-blue-100 text-blue-900 border border-blue-200'
                      }`}>
                        {slot.type}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{slot.batch}</p>
                  </div>
                </div>

                {/* Middle: Course & Location */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                      {slot.courseCode}
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-gray-800">{slot.courseName}</h4>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-600">
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={13} className="text-cu-gold" />
                      <span className="font-medium text-gray-700">{slot.roomLab}</span>
                    </span>
                    <span className="text-gray-300">&bull;</span>
                    <span className="inline-flex items-center gap-1">
                      <User size={13} className="text-cu-navy" />
                      <span>{slot.facultyName}</span>
                    </span>
                  </div>
                </div>

                {/* Right: Actions */}
                {canEdit && (
                  <div className="flex items-center gap-2 self-end md:self-center">
                    <button
                      onClick={() => handleOpenEdit(slot)}
                      className="p-1.5 text-gray-500 hover:text-cu-navy hover:bg-gray-100 rounded-lg transition"
                      title="Edit Slot"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteSlot(slot.id, slot.courseCode)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Remove Slot"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Allocation / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-cu-border max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <h3 className="font-bold text-base text-cu-navy flex items-center gap-2">
                <Calendar size={18} className="text-cu-gold" />
                {editingSlot ? 'Edit Timetable Slot' : 'Allocate Classroom / Lab Slot'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-xs font-bold px-2 py-1 rounded"
              >
                Close
              </button>
            </div>

            {formError && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 py-2.5 rounded-lg flex items-start gap-2 text-xs font-medium">
                <AlertTriangle size={15} className="text-red-600 flex-shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveSlot} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Day of Week</label>
                  <select
                    value={formDay}
                    onChange={e => setFormDay(e.target.value as DayOfWeek)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-cu-gold"
                  >
                    {DAYS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Target Batch</label>
                  <select
                    value={formBatch}
                    onChange={e => setFormBatch(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-cu-gold"
                  >
                    {CAMPUS_BATCHES.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={formStartTime}
                    onChange={e => setFormStartTime(e.target.value)}
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-cu-gold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">End Time</label>
                  <input
                    type="time"
                    value={formEndTime}
                    onChange={e => setFormEndTime(e.target.value)}
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-cu-gold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Course Code</label>
                  <input
                    type="text"
                    value={formCourseCode}
                    onChange={e => setFormCourseCode(e.target.value)}
                    required
                    placeholder="MCA301"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-cu-gold uppercase"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block font-semibold text-gray-700 mb-1">Course Title</label>
                  <input
                    type="text"
                    value={formCourseName}
                    onChange={e => setFormCourseName(e.target.value)}
                    required
                    placeholder="Enterprise Cloud Architecture"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-cu-gold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Assigned Faculty</label>
                  <select
                    value={formFaculty.empId}
                    onChange={e => {
                      const sel = FACULTY_MEMBERS.find(f => f.empId === e.target.value);
                      if (sel) setFormFaculty(sel);
                    }}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-cu-gold"
                  >
                    {FACULTY_MEMBERS.map(f => (
                      <option key={f.empId} value={f.empId}>{f.name} ({f.dept})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Room / Lab Facility</label>
                  <select
                    value={formRoom}
                    onChange={e => setFormRoom(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-cu-gold"
                  >
                    {CAMPUS_ROOMS_AND_LABS.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Session Format</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['LECTURE', 'LAB', 'TUTORIAL', 'SEMINAR'] as const).map(fmt => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => setFormType(fmt)}
                      className={`py-1.5 rounded-lg text-xs font-bold transition border ${
                        formType === fmt 
                          ? 'bg-cu-navy text-white border-cu-navy' 
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg font-semibold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cu-navy hover:bg-cu-navy/90 text-white rounded-lg font-bold shadow transition"
                >
                  {editingSlot ? 'Update Allocation' : 'Confirm Allocation & Check Clash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Noticeboard Master Print & Staff Export Modal */}
      {isNoticeboardModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-cu-border max-w-4xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-gray-100 pb-3">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-cu-navy text-white text-[11px] font-bold">
                  <ShieldCheck size={12} className="text-cu-gold" />
                  <span>Confidential • Directorate of Academic Administration</span>
                </div>
                <h3 className="text-lg font-bold text-cu-navy mt-1">Official Master Noticeboard Timetable</h3>
                <p className="text-xs text-gray-500">
                  Batch: <span className="font-semibold text-gray-800">{selectedBatch}</span> &bull; Academic Year 2026-27 (Odd Semester)
                </p>
              </div>
              <button
                onClick={() => setIsNoticeboardModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X size={16} />
              </button>
            </div>

            {/* Timetable Print Preview Matrix */}
            <div className="p-4 bg-gray-50/70 rounded-xl border border-gray-200 space-y-4 font-sans text-xs">
              <div className="text-center pb-2 border-b border-gray-300">
                <div className="text-sm font-black text-cu-navy tracking-wider uppercase">Chanakya University Bengaluru</div>
                <div className="text-[11px] text-gray-600 font-semibold">Autonomous Directorate of Curriculum &amp; Examination Logistics</div>
                <div className="text-[10px] text-gray-500 mt-0.5">Statutory Class &amp; Laboratory Allotment Master Roster &bull; {selectedBatch}</div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse border border-gray-300 bg-white">
                  <thead>
                    <tr className="bg-cu-navy text-white text-[10px] uppercase tracking-wider">
                      <th className="border border-gray-300 p-2">Day</th>
                      <th className="border border-gray-300 p-2">Slot Time</th>
                      <th className="border border-gray-300 p-2">Course Code &amp; Subject</th>
                      <th className="border border-gray-300 p-2">Assigned Faculty</th>
                      <th className="border border-gray-300 p-2">Room / Laboratory</th>
                      <th className="border border-gray-300 p-2">Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {DAYS.slice(0, 5).flatMap(day => {
                      const daySlots = slots
                        .filter(s => s.day === day && s.batch.toLowerCase() === selectedBatch.toLowerCase())
                        .sort((a, b) => a.startTime.localeCompare(b.startTime));

                      if (daySlots.length === 0) {
                        return (
                          <tr key={day} className="border-b border-gray-200">
                            <td className="border border-gray-300 p-2 font-bold bg-gray-50 text-cu-navy">{day}</td>
                            <td colSpan={5} className="border border-gray-300 p-2 text-gray-400 italic">No scheduled lectures (Research / Library Study Period)</td>
                          </tr>
                        );
                      }

                      return daySlots.map((s, idx) => (
                        <tr key={s.id} className="border-b border-gray-200 hover:bg-gray-50/50">
                          {idx === 0 && (
                            <td rowSpan={daySlots.length} className="border border-gray-300 p-2 font-bold bg-gray-50 text-cu-navy align-top">
                              {day}
                            </td>
                          )}
                          <td className="border border-gray-300 p-2 font-mono font-semibold text-gray-700 whitespace-nowrap">
                            {s.startTime} - {s.endTime}
                          </td>
                          <td className="border border-gray-300 p-2">
                            <span className="font-mono font-bold text-cu-navy mr-1.5">{s.courseCode}</span>
                            <span className="text-gray-800">{s.courseName}</span>
                          </td>
                          <td className="border border-gray-300 p-2 font-medium text-gray-700">{s.facultyName}</td>
                          <td className="border border-gray-300 p-2 font-mono text-gray-600">{s.roomLab}</td>
                          <td className="border border-gray-300 p-2">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              s.type === 'LAB' ? 'bg-purple-100 text-purple-800' :
                              s.type === 'SEMINAR' ? 'bg-amber-100 text-amber-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {s.type}
                            </span>
                          </td>
                        </tr>
                      ));
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-end pt-4 border-t border-gray-200 text-[10px] text-gray-500">
                <div>
                  <div>Issued by: Directorate of Course Allocations (Chanakya University)</div>
                  <div>Security Seal: SHA256:8892AC7719B0 &bull; For Official Noticeboards Only</div>
                </div>
                <div className="text-right">
                  <div className="font-serif font-bold italic text-gray-700">Dr. Sushant Joshi / Dr. Anita Desai</div>
                  <div className="border-t border-gray-400 pt-0.5">Dean of Academic Affairs &bull; Registrar Office</div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 flex items-center gap-1.5">
                <AlertTriangle size={13} />
                Strict Policy: Noticeboard sheets are restricted from student download interfaces.
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsNoticeboardModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-600 rounded-xl text-xs font-semibold hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-cu-navy text-white rounded-xl text-xs font-bold hover:bg-cu-navy-light shadow-sm flex items-center gap-1.5"
                >
                  <Printer size={14} className="text-cu-gold" />
                  <span>Print Noticeboard Timetable</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

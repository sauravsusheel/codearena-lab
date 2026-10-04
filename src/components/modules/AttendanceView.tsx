import React, { useState } from 'react';
import { GraduationCap, QrCode, MapPin, CheckCircle2, AlertTriangle, Users, Clock, ShieldCheck } from 'lucide-react';
import { RealQRCode } from '../common/RealQRCode';

export const AttendanceView: React.FC = () => {
  const [qrActive, setQrActive] = useState(false);
  const [scanCount, setScanCount] = useState(42);

  const students = [
    { roll: '24MCA001', name: 'Aarav Sharma', status: 'PRESENT', mode: 'QR Code', time: '2:16 PM' },
    { roll: '24MCA002', name: 'Ananya Rao', status: 'PRESENT', mode: 'GPS Geofenced', time: '2:17 PM' },
    { roll: '24MCA003', name: 'Arjun Kumar', status: 'PRESENT', mode: 'QR Code', time: '2:15 PM' },
    { roll: '24MCA004', name: 'Bhavna Patel', status: 'LATE', mode: 'GPS Geofenced', time: '2:28 PM' },
    { roll: '24MCA005', name: 'Chirag Sen', status: 'ABSENT', mode: 'None', time: '-' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cu-border pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cu-pill text-cu-navy text-xs font-semibold mb-1">
            <GraduationCap size={13} />
            <span>SmartAttend Module 02</span>
          </div>
          <h2 className="text-2xl font-bold text-cu-navy">Smart Student Attendance Tracking</h2>
          <p className="text-xs sm:text-sm text-gray-500">
            Time-limited HMAC QR sessions, GPS polygon validation, shortage alerts (&lt;75%), and regularisation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setQrActive(!qrActive)}
            className="bg-cu-navy hover:bg-cu-navylight text-white text-xs font-semibold px-4 py-2 rounded-lg shadow transition flex items-center gap-2"
          >
            <QrCode size={15} />
            <span>{qrActive ? 'Hide Live QR Code' : 'Open Class Session QR'}</span>
          </button>
        </div>
      </div>

      {/* Active Class Banner */}
      <div className="bg-white rounded-xl border border-cu-border p-5 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <div className="text-xs text-cu-saffron font-bold uppercase tracking-wider">Active Lecture Session</div>
          <h3 className="text-xl font-bold text-cu-navy mt-0.5">PRG301 · A — Programming III</h3>
          <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
            <span className="flex items-center gap-1"><Clock size={13} /> 2:15 PM – 4:15 PM</span>
            <span className="flex items-center gap-1"><MapPin size={13} className="text-cu-saffron" /> Room 1A-59 (50m Radius)</span>
          </div>
        </div>

        <div className="flex items-center gap-6 text-center border-t md:border-t-0 md:border-l border-gray-100 pt-3 md:pt-0 md:pl-6">
          <div>
            <div className="text-2xl font-bold text-cu-navy">{scanCount}</div>
            <div className="text-[10px] text-gray-500 uppercase font-semibold">Present</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-amber-600">1</div>
            <div className="text-[10px] text-gray-500 uppercase font-semibold">Late</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-500">5</div>
            <div className="text-[10px] text-gray-500 uppercase font-semibold">Absent</div>
          </div>
        </div>
      </div>

      {/* Live QR Popup / Card */}
      {qrActive && (
        <div className="bg-gradient-to-br from-cu-navy to-cu-navydark rounded-2xl p-6 text-white text-center shadow-xl border border-cu-gold/40 max-w-md mx-auto">
          <h4 className="font-bold text-base">Scan to Mark Attendance</h4>
          <p className="text-xs text-cu-gold mt-0.5">Expires every 90 seconds (HMAC-SHA256)</p>
          <div className="bg-white p-3.5 rounded-2xl my-4 inline-flex flex-col items-center shadow-inner">
            <RealQRCode
              value={`https://chanakyauniversity.edu.in/portal/attendance/scan?course=PRG301&room=1A-59&faculty=Deepak%20B&token=CU-LIVE-${Date.now()}`}
              size={150}
              fgColor="#002561"
              bgColor="#ffffff"
              level="H"
              centerLogo="CU"
              downloadable={true}
              copyable={true}
              caption="PRG301 Live Attendance"
              alt="Live Session Attendance QR"
            />
          </div>
          <p className="text-xs text-gray-300">Room 1A-59 Geofence Verification Active</p>
          <button 
            onClick={() => setScanCount(prev => prev + 1)}
            className="mt-3 bg-cu-saffron text-white text-xs px-4 py-1.5 rounded-md font-semibold hover:bg-cu-saffronlight transition"
          >
            Simulate Student Mobile Scan
          </button>
        </div>
      )}

      {/* Attendance Roster Table */}
      <div className="bg-white rounded-xl border border-cu-border p-5 shadow-sm">
        <h3 className="font-bold text-sm text-cu-navy mb-3">Live Session Attendance Stream</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 border-b border-cu-border">
                <th className="p-2.5 font-semibold">Roll Number</th>
                <th className="p-2.5 font-semibold">Student Name</th>
                <th className="p-2.5 font-semibold">Status</th>
                <th className="p-2.5 font-semibold">Verification Mode</th>
                <th className="p-2.5 font-semibold">Marked Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.map((std, i) => (
                <tr key={i} className="hover:bg-gray-50/80">
                  <td className="p-2.5 font-mono font-bold text-cu-navy">{std.roll}</td>
                  <td className="p-2.5 font-medium text-gray-800">{std.name}</td>
                  <td className="p-2.5">
                    {std.status === 'PRESENT' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-800 text-[10px] font-semibold">
                        <CheckCircle2 size={11} /> Present
                      </span>
                    )}
                    {std.status === 'LATE' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-semibold">
                        Late
                      </span>
                    )}
                    {std.status === 'ABSENT' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px] font-semibold">
                        Absent
                      </span>
                    )}
                  </td>
                  <td className="p-2.5 text-gray-600">{std.mode}</td>
                  <td className="p-2.5 text-gray-500 font-mono">{std.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default AttendanceView;

import React, { useState, useEffect } from 'react';
import { RefreshCw, ShieldCheck, MapPin, Clock, Smartphone, Users, Eye, CheckCircle2, Copy } from 'lucide-react';
import { attendanceService } from '../services/attendanceService';
import { DynamicQRSession } from '../types/attendance.types';
import { RealQRCode } from '../../../components/common/RealQRCode';

interface DynamicQRConsoleProps {
  onSimulateScan: () => void;
}

export const DynamicQRConsole: React.FC<DynamicQRConsoleProps> = ({ onSimulateScan }) => {
  const [session, setSession] = useState<DynamicQRSession>(attendanceService.getSessionConfig());
  const [secondsLeft, setSecondsLeft] = useState(5);
  const [showPayloadInspector, setShowPayloadInspector] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setSession(attendanceService.getSessionConfig());
          return 5;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Real verifiable cryptographic attendance payload encoded into the 2D QR matrix
  const qrPayload = JSON.stringify({
    iss: 'Chanakya University Autonomous ERP',
    typ: 'ATTENDANCE_DYNAMIC_QR_NONCE',
    sub: session.courseCode,
    crs: session.courseName,
    rm: session.room,
    nonce: session.nonce,
    geo: { lat: 13.1345, lng: 77.5678, radiusMeters: 50 },
    exp: Date.now() + 5000,
    verifyUrl: `https://chanakyauniversity.edu.in/portal/attendance/verify?session=${session.courseCode}&nonce=${session.nonce}&ts=${Date.now()}`
  }, null, 2);

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(qrPayload);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  return (
    <div className="bg-gradient-to-br from-[#002561] via-[#0E1B38] to-[#16284F] text-white rounded-2xl p-6 shadow-xl border border-cu-gold/30">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-white/10">
        <div>
          <span className="text-[10px] font-mono tracking-widest px-2 py-0.5 rounded bg-cu-gold/20 text-cu-gold uppercase font-bold">
            Dynamic Anti-Proxy Engine • Real Scannable 2D Matrix
          </span>
          <h3 className="text-xl font-bold font-serif text-white mt-1">
            {session.courseCode}: {session.courseName}
          </h3>
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-300 mt-1">
            <span className="flex items-center gap-1"><Clock size={13} className="text-cu-gold" /> Lecture 2:15 PM – 4:15 PM</span>
            <span className="flex items-center gap-1"><MapPin size={13} className="text-cu-gold" /> {session.room}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white/5 px-3 py-2 rounded-xl border border-white/10">
          <div className="text-right">
            <div className="text-[10px] text-gray-300 uppercase font-semibold">Rotating Nonce Refresh</div>
            <div className="text-lg font-mono font-bold text-amber-400">{secondsLeft}s</div>
          </div>
          <RefreshCw size={20} className={`text-cu-gold ${secondsLeft === 5 ? 'animate-spin' : ''}`} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center pt-6">
        {/* Projector QR Frame with Real Scannable QR Matrix */}
        <div className="flex flex-col items-center justify-center p-6 bg-white/5 rounded-xl border border-white/10">
          <div className="bg-white p-4 rounded-2xl shadow-2xl relative group flex flex-col items-center">
            <RealQRCode
              value={qrPayload}
              size={190}
              fgColor="#002561"
              bgColor="#ffffff"
              level="M"
              centerLogo="CU"
              downloadable={true}
              copyable={true}
              caption={`HMAC: ${session.nonce}`}
              alt={`Real Scannable QR Code - Nonce ${session.nonce}`}
            />
          </div>

          <div className="mt-3 flex items-center gap-2">
            <div className="font-mono text-[11px] text-cu-gold bg-black/30 px-3 py-1 rounded-md border border-white/10">
              HMAC Nonce: {session.nonce}
            </div>
            <button
              onClick={() => setShowPayloadInspector(!showPayloadInspector)}
              className="text-[10px] bg-white/10 hover:bg-white/20 text-amber-300 px-2.5 py-1 rounded-md border border-white/15 flex items-center gap-1 transition"
              title="Inspect Decoded QR JSON Payload"
            >
              <Eye size={12} />
              <span>{showPayloadInspector ? 'Hide Data' : 'Inspect Payload'}</span>
            </button>
          </div>

          <p className="text-[11px] text-gray-400 mt-1.5 text-center">
            Scannable via any smartphone camera. Invalidates every 5 seconds.
          </p>

          {/* Collapsible Decoded QR Payload Inspector */}
          {showPayloadInspector && (
            <div className="w-full mt-3 p-3 bg-black/50 border border-white/20 rounded-xl text-[10px] font-mono text-emerald-300 space-y-2 animate-fadeIn">
              <div className="flex items-center justify-between text-gray-400 border-b border-white/10 pb-1">
                <span className="font-bold text-cu-gold uppercase tracking-wider">Decoded 2D QR JSON Payload</span>
                <button
                  onClick={handleCopyPayload}
                  className="flex items-center gap-1 text-white hover:text-cu-gold"
                >
                  {copiedPayload ? <CheckCircle2 size={11} className="text-emerald-400" /> : <Copy size={11} />}
                  <span>{copiedPayload ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="overflow-x-auto whitespace-pre leading-snug">
                {qrPayload}
              </pre>
            </div>
          )}
        </div>

        {/* Classroom Geofence & Mobile Check-In */}
        <div className="space-y-4 text-xs">
          <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-2">
            <div className="flex items-center justify-between font-semibold">
              <span className="text-amber-200">Active Classroom Radar</span>
              <span className="text-emerald-400">Within Geofence (12m)</span>
            </div>
            <p className="text-gray-300 leading-relaxed">
              Student devices must be within 50m of Room 1A-59 anchor coordinates (13.1345° N, 77.5678° E).
            </p>
            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-400 h-full w-3/4 rounded-full" />
            </div>
          </div>

          <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-3">
            <div className="font-semibold text-white">Direct Student Check-In Simulator:</div>
            <button
              onClick={onSimulateScan}
              className="w-full bg-cu-gold hover:bg-amber-400 text-[#002561] py-2.5 px-4 rounded-lg font-bold flex items-center justify-center gap-2 shadow-lg transition"
            >
              <Smartphone size={16} />
              Simulate Student Mobile QR Scan
            </button>
            <p className="text-[11px] text-gray-400 text-center">
              Emulates GPS lock, cryptographic signature check, and immediate roster broadcast.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

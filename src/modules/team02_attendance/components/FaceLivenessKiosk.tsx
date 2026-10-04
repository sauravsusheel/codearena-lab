import React, { useState } from 'react';
import { Camera, Scan, CheckCircle2, ShieldCheck, UserCheck } from 'lucide-react';

interface FaceLivenessKioskProps {
  onFaceVerified: () => void;
}

export const FaceLivenessKiosk: React.FC<FaceLivenessKioskProps> = ({ onFaceVerified }) => {
  const [scanning, setScanning] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleStartScan = () => {
    setScanning(true);
    setSuccess(false);
    setTimeout(() => {
      setScanning(false);
      setSuccess(true);
      onFaceVerified();
      setTimeout(() => setSuccess(false), 3500);
    }, 1800);
  };

  return (
    <div className="bg-white rounded-xl border border-cu-border p-6 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
        <div>
          <h3 className="text-base font-bold text-cu-navy flex items-center gap-2">
            <Camera size={18} className="text-cu-navy" />
            Classroom Tablet Kiosk: AI Facial Recognition with Liveness
          </h3>
          <p className="text-xs text-gray-500">
            High-speed optical check-in with MediaPipe 3D eye-blink validation to prevent photo or deepfake spoofing.
          </p>
        </div>
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
          <ShieldCheck size={13} /> Anti-Spoof Active
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div className="relative aspect-video bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center border-2 border-slate-700">
          <div className="text-center text-slate-400 space-y-2">
            <Scan size={44} className={`mx-auto ${scanning ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
            <div className="text-xs font-mono">
              {scanning ? 'Verifying 3D Eye Blink & Landmark Geometry...' : success ? 'Match Confirmed: 99.4% Confidence' : 'Stand in front of classroom kiosk tablet'}
            </div>
          </div>

          {/* Liveness Target Overlay */}
          <div className="absolute inset-8 border border-white/20 rounded-2xl pointer-events-none flex items-center justify-center">
            <div className="w-32 h-40 border-2 border-dashed border-cu-gold/60 rounded-full" />
          </div>

          {success && (
            <div className="absolute inset-0 bg-emerald-950/80 backdrop-blur-sm flex flex-col items-center justify-center text-emerald-300">
              <CheckCircle2 size={48} className="text-emerald-400 mb-2" />
              <div className="text-sm font-bold">Attendance Logged: Arjun Kumar</div>
              <div className="text-xs text-emerald-200">Roll: 24MCA003 · Liveness Score: 0.98</div>
            </div>
          )}
        </div>

        <div className="space-y-4 text-xs">
          <div className="space-y-2 text-gray-600 leading-relaxed">
            <p>
              The kiosk camera captures 468 facial mesh keypoints in real time. Students blink naturally within 2 seconds to authenticate without touching any hardware.
            </p>
            <ul className="list-disc pl-4 space-y-1 text-[11px] text-gray-500">
              <li>Infrared &amp; RGB multi-spectral anti-photo spoofing</li>
              <li>Encrypted 512-dim facial vector comparisons</li>
              <li>Sub-second check-in rate (up to 40 students/minute)</li>
            </ul>
          </div>

          <button
            onClick={handleStartScan}
            disabled={scanning}
            className="w-full bg-[#002561] hover:bg-[#0E1B38] text-white py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 shadow transition disabled:opacity-50"
          >
            <UserCheck size={16} />
            {scanning ? 'Analyzing Facial Landmark Vectors...' : 'Simulate Tablet Face Check-In'}
          </button>
        </div>
      </div>
    </div>
  );
};

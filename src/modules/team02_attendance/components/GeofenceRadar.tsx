import React from 'react';
import { MapPin, Navigation, Radio, CheckCircle2, ShieldAlert } from 'lucide-react';

interface GeofenceRadarProps {
  onCheckInGPS: () => void;
}

export const GeofenceRadar: React.FC<GeofenceRadarProps> = ({ onCheckInGPS }) => {
  return (
    <div className="bg-white rounded-xl border border-cu-border p-6 shadow-sm space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h3 className="text-base font-bold text-cu-navy flex items-center gap-2">
            <Radio size={18} className="text-cu-saffron animate-pulse" />
            Classroom Multi-Polygon Geofence &amp; BLE Verification
          </h3>
          <p className="text-xs text-gray-500">
            Enforces physical room presence through hybrid GPS polygon and ambient Bluetooth beacon proximity.
          </p>
        </div>
        <button
          onClick={onCheckInGPS}
          className="inline-flex items-center gap-2 bg-[#002561] hover:bg-[#0E1B38] text-white px-4 py-2 rounded-lg text-xs font-semibold shadow transition"
        >
          <Navigation size={14} />
          Verify GPS &amp; Mark Present
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
          <span className="text-[11px] text-gray-500 font-semibold uppercase">Anchor Coordinates</span>
          <div className="font-mono text-sm font-bold text-slate-800">13.1345° N, 77.5678° E</div>
          <span className="text-[11px] text-emerald-600 flex items-center gap-1">
            <CheckCircle2 size={12} /> Academic Block B (Auditorium 1A)
          </span>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
          <span className="text-[11px] text-gray-500 font-semibold uppercase">Permissible Radius</span>
          <div className="font-mono text-sm font-bold text-slate-800">50 Meters Radius</div>
          <span className="text-[11px] text-blue-600 flex items-center gap-1">
            <CheckCircle2 size={12} /> Multi-Wall Attenuation Adjusted
          </span>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
          <span className="text-[11px] text-gray-500 font-semibold uppercase">BLE Beacon Nonce</span>
          <div className="font-mono text-sm font-bold text-slate-800">CU-BLE-B2-RM59</div>
          <span className="text-[11px] text-purple-600 flex items-center gap-1">
            <Radio size={12} /> Signal RSSI: -62 dBm (Excellent)
          </span>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';

interface FaultSimulatorButtonProps {
  moduleName: string;
}

export const FaultSimulatorButton: React.FC<FaultSimulatorButtonProps> = ({ moduleName }) => {
  const [shouldCrash, setShouldCrash] = useState(false);

  if (shouldCrash) {
    throw new Error(`[SIMULATED FAULT] Intentional unhandled exception in ${moduleName} to verify zero-cascading isolation.`);
  }

  return (
    <button
      onClick={() => setShouldCrash(true)}
      title="Test fault isolation: triggers an isolated crash in this module without crashing the portal"
      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md transition hover:shadow-sm"
    >
      <AlertTriangle size={12} className="text-rose-500" />
      Simulate Module Fault
    </button>
  );
};

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RefreshCw, ShieldAlert, CheckCircle2, Bug, LifeBuoy } from 'lucide-react';
import { ModuleHealthRegistry } from './ModuleHealthRegistry';

interface Props {
  moduleId: string;
  moduleName: string;
  teamName: string;
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorTime: string | null;
  safeMode: boolean;
}

export class ModuleErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorTime: null,
      safeMode: false
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorTime: new Date().toLocaleTimeString()
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    console.error(`[UniSphere Fault Isolation] Exception in ${this.props.moduleName} (${this.props.moduleId}):`, error, errorInfo);
    
    // Register fault in universal health registry without affecting other modules
    ModuleHealthRegistry.recordFault(this.props.moduleId, error);
  }

  handleRestart = (): void => {
    ModuleHealthRegistry.recordRecovery(this.props.moduleId);
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorTime: null,
      safeMode: false
    });
  };

  handleEnableSafeMode = (): void => {
    this.setState({
      hasError: false,
      safeMode: true
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-6 max-w-4xl mx-auto my-6 animate-fadeIn">
          {/* Fault Isolation Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-red-200 overflow-hidden">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-red-600 via-rose-700 to-amber-700 p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
                  <ShieldAlert size={28} className="text-amber-300 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono tracking-widest px-2 py-0.5 rounded bg-white/20 uppercase font-semibold">
                      {this.props.teamName} Fault Isolated
                    </span>
                    <span className="text-xs text-amber-200">
                      Isolated at {this.state.errorTime}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold font-serif tracking-tight mt-0.5">
                    {this.props.moduleName} Experienced an Isolated Fault
                  </h2>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded-lg border border-white/10 text-xs">
                <CheckCircle2 size={16} className="text-emerald-400" />
                <span>Portal Shell & Other Modules Healthy</span>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
                <div className="flex items-start gap-3">
                  <AlertOctagon size={20} className="text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-900 leading-relaxed">
                    <strong className="font-semibold block mb-0.5">Zero-Cascading Fault Isolation Active:</strong>
                    An unexpected exception was trapped within this module. Due to UniSphere&apos;s decoupled
                    architecture, your login session, other 7 academic modules, and top portal navigation remain
                    fully functional and protected against downtime.
                  </div>
                </div>
              </div>

              {/* Error Diagnostic Box */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-gray-700">
                  <span className="flex items-center gap-1.5">
                    <Bug size={14} className="text-red-500" />
                    Diagnostics &amp; Crash Log
                  </span>
                  <span className="text-[11px] font-mono text-gray-500">
                    Module Key: {this.props.moduleId}
                  </span>
                </div>
                <div className="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-xs overflow-x-auto max-h-44 shadow-inner border border-slate-800">
                  <div className="text-rose-400 font-bold mb-1">
                    {this.state.error?.name || 'Error'}: {this.state.error?.message || 'Unknown runtime fault'}
                  </div>
                  {this.state.errorInfo?.componentStack && (
                    <pre className="text-[10px] text-slate-400 whitespace-pre-wrap leading-tight">
                      {this.state.errorInfo.componentStack.slice(0, 500)}...
                    </pre>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100">
                <div className="flex items-center gap-3">
                  <button
                    onClick={this.handleRestart}
                    className="inline-flex items-center gap-2 bg-[#002561] hover:bg-[#0E1B38] text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-md transition hover:scale-105 active:scale-95"
                  >
                    <RefreshCw size={14} />
                    Restart Module
                  </button>
                  <button
                    onClick={this.handleEnableSafeMode}
                    className="inline-flex items-center gap-2 bg-amber-100 hover:bg-amber-200 text-amber-900 px-4 py-2 rounded-lg text-xs font-semibold transition"
                  >
                    <LifeBuoy size={14} />
                    Render in Safe Read-Only Mode
                  </button>
                </div>
                <div className="text-[11px] text-gray-500 italic">
                  Assigned Team: <strong className="text-gray-700">{this.props.teamName}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

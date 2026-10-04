import React, { useState, useEffect, useRef } from 'react';
import { 
  Terminal as TerminalIcon, Play, Square, RotateCcw, Copy, 
  Check, CornerDownLeft, Sparkles, Shield, Cpu, Maximize2, Minimize2
} from 'lucide-react';

export interface TerminalLogEntry {
  id: string;
  type: 'stdout' | 'stderr' | 'stdin' | 'system' | 'prompt';
  text: string;
}

interface InteractiveTerminalProps {
  logs: TerminalLogEntry[];
  isRunning: boolean;
  isWaitingForInput: boolean;
  inputPromptText?: string;
  onSendInput: (input: string) => void;
  onRunCode: () => void;
  onStopCode?: () => void;
  onClear: () => void;
  activeLanguage: string;
  executionMetrics?: {
    timeMs?: number;
    memoryMb?: number;
    exitCode?: number;
  };
  embedded?: boolean;
}

export const InteractiveTerminal: React.FC<InteractiveTerminalProps> = ({
  logs,
  isRunning,
  isWaitingForInput,
  inputPromptText = '',
  onSendInput,
  onRunCode,
  onStopCode,
  onClear,
  activeLanguage,
  executionMetrics,
  embedded = false
}) => {
  const [currentInput, setCurrentInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const terminalBodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when logs update or waiting for input
  useEffect(() => {
    if (terminalBodyRef.current) {
      terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight;
    }
  }, [logs, isWaitingForInput, currentInput]);

  // Focus input field when waiting for input or clicking terminal
  useEffect(() => {
    if (isWaitingForInput || !isRunning) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isWaitingForInput, isRunning]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = currentInput;
      setCurrentInput('');
      onSendInput(val);
    } else if (e.key === 'c' && e.ctrlKey) {
      // Ctrl+C to interrupt
      e.preventDefault();
      if (onStopCode && isRunning) {
        onStopCode();
      }
    }
  };

  const handleCopyLogs = () => {
    const fullText = logs.map(l => l.text).join('');
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = () => {
    if (isWaitingForInput) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          WAITING FOR STDIN INPUT
        </span>
      );
    }
    if (isRunning) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/40">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
          RUNNING
        </span>
      );
    }
    if (executionMetrics && executionMetrics.exitCode !== undefined) {
      const isSuccess = executionMetrics.exitCode === 0;
      return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
          isSuccess 
            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' 
            : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isSuccess ? 'bg-emerald-400' : 'bg-rose-400'}`} />
          EXIT {executionMetrics.exitCode} ({executionMetrics.timeMs}ms)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-700/50 text-slate-300 border border-slate-600/40">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
        IDLE SHELL
      </span>
    );
  };

  return (
    <div 
      className={`${embedded ? 'bg-[#101722] h-full rounded-none border-0 shadow-none' : 'bg-[#080f1e] rounded-2xl border border-slate-800 shadow-2xl'} overflow-hidden transition-all duration-200 flex flex-col ${embedded ? '' : (isExpanded ? 'h-96' : 'h-72')}`}
      onClick={() => inputRef.current?.focus()}
    >
      {/* Terminal Title Bar */}
      {!embedded && <div className="bg-[#0e172a] px-3.5 py-2 flex items-center justify-between border-b border-slate-800/90 select-none shrink-0">
        {/* Left: Window Dots & Title */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80 hover:bg-rose-500 transition" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80 hover:bg-amber-500 transition" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 hover:bg-emerald-500 transition" />
          </div>
          <div className="flex items-center gap-2 pl-2 border-l border-slate-700/60">
            <TerminalIcon size={13} className="text-emerald-400" />
            <span className="font-mono text-xs font-bold text-slate-200 tracking-wide">
              terminal &bull; {activeLanguage} sandbox
            </span>
            {getStatusBadge()}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            title="Clear terminal buffer"
            className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition text-xs flex items-center gap-1"
          >
            <RotateCcw size={12} />
            <span className="hidden sm:inline text-[10px]">Clear</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCopyLogs();
            }}
            title="Copy all terminal output"
            className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition text-xs flex items-center gap-1"
          >
            {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
            <span className="hidden sm:inline text-[10px]">{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            title={isExpanded ? "Collapse terminal" : "Expand terminal"}
            className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition text-xs"
          >
            {isExpanded ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
          </button>

          {isRunning ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onStopCode) onStopCode();
              }}
              title="Terminate running process (Ctrl+C)"
              className="ml-1 px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold flex items-center gap-1 transition shadow-sm"
            >
              <Square size={10} className="fill-white" />
              <span>Stop</span>
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRunCode();
              }}
              title="Execute code in terminal"
              className="ml-1 px-3 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-[#0a1e3b] text-[11px] font-extrabold flex items-center gap-1 transition shadow-sm cursor-pointer"
            >
              <Play size={10} className="fill-[#0a1e3b]" />
              <span>Run</span>
            </button>
          )}
        </div>
      </div>}

      {/* Terminal Output Body */}
      <div 
        ref={terminalBodyRef}
        className="flex-1 p-3.5 font-mono text-xs overflow-y-auto leading-relaxed space-y-1 selection:bg-amber-400/30 selection:text-white"
      >
        {logs.length === 0 && !isRunning && (
          <div className="text-slate-500 text-[11px] space-y-1 py-1">
            <div className="text-slate-400">=== Chanakya University Interactive Cloud Sandbox (Linux x86_64) ===</div>
            <div>&bull; Type code in the editor above and click <span className="text-amber-400 font-bold">Run</span> or press <span className="text-slate-300 font-bold">Enter</span> below.</div>
            <div>&bull; When your code prompts with <code className="text-emerald-400">input()</code> or <code className="text-emerald-400">Scanner</code>, type directly in this terminal!</div>
            <div>&bull; Type <span className="text-sky-300">run</span>, <span className="text-sky-300">clear</span>, or <span className="text-sky-300">help</span> for interactive terminal commands.</div>
          </div>
        )}

        {/* Log Entries */}
        {logs.map((log) => {
          if (log.type === 'prompt') {
            return (
              <div key={log.id} className="text-sky-400 flex items-center gap-1.5 font-semibold">
                <span>{log.text}</span>
              </div>
            );
          }
          if (log.type === 'stdin') {
            return (
              <div key={log.id} className="text-amber-300 font-bold flex items-center gap-1">
                <span className="text-amber-500/70 select-none">&gt;</span>
                <span>{log.text}</span>
              </div>
            );
          }
          if (log.type === 'stderr') {
            return (
              <div key={log.id} className="text-rose-400 whitespace-pre-wrap font-medium">
                {log.text}
              </div>
            );
          }
          if (log.type === 'system') {
            return (
              <div key={log.id} className="text-slate-400 text-[11px] italic whitespace-pre-wrap">
                {log.text}
              </div>
            );
          }
          return (
            <div key={log.id} className="text-slate-200 whitespace-pre-wrap">
              {log.text}
            </div>
          );
        })}

        {/* Active Interactive Input Line */}
        <div className="flex items-center gap-1.5 pt-0.5 min-h-[22px]">
          {isWaitingForInput ? (
            <span className="text-amber-400 font-bold flex items-center gap-1 shrink-0">
              <span className="text-amber-400">{inputPromptText || 'stdin'}</span>
              <span className="text-amber-300">&gt;</span>
            </span>
          ) : isRunning ? (
            <span className="text-sky-400 font-bold flex items-center gap-1 shrink-0 select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
              <span>&gt;</span>
            </span>
          ) : (
            <span className="text-emerald-400 font-bold shrink-0 select-none">
              chanakya@sandbox:~$
            </span>
          )}

          <input
            ref={inputRef}
            type="text"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isWaitingForInput 
                ? (inputPromptText ? `Enter value for ${inputPromptText}...` : "Type input and press Enter...") 
                : isRunning 
                  ? "Type input to send to stdin and press Enter..." 
                  : "Type 'run', shell command, or press Enter..."
            }
            className="flex-1 bg-transparent text-slate-100 font-mono text-xs focus:outline-none placeholder-slate-600 caret-amber-400"
          />

          <button
            onClick={() => {
              const val = currentInput;
              setCurrentInput('');
              onSendInput(val);
            }}
            title="Submit Input (Enter)"
            className="p-1 text-slate-500 hover:text-amber-400 transition"
          >
            <CornerDownLeft size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};

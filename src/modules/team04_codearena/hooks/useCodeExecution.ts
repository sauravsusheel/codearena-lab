import { useState, useCallback, useRef } from 'react';
import { SUPPORTED_LANGUAGES, LanguageDefinition } from '../config/languages.config';

export interface TerminalOutputChunk {
  text: string;
  type: 'stdout' | 'stderr' | 'system' | 'error' | 'success';
}

export function useCodeExecution() {
  const [isRunning, setIsRunning] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<TerminalOutputChunk[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);

  const appendLog = useCallback((text: string, type: TerminalOutputChunk['type']) => {
    setTerminalLogs((prev) => [...prev, { text, type }]);
  }, []);

  const clearTerminal = useCallback(() => {
    setTerminalLogs([]);
  }, []);

  const executeCode = useCallback(async (
    languageKey: string,
    sourceCode: string,
    stdin: string = ''
  ) => {
    const langConfig: LanguageDefinition = SUPPORTED_LANGUAGES[languageKey];
    if (!langConfig) {
      appendLog(`Error: Language "${languageKey}" is not configured.`, 'error');
      return;
    }

    // Special Case: HTML / CSS is handled live by the safe iframe component
    if (langConfig.isWebSandbox) {
      appendLog('Web Sandbox live preview updated.', 'system');
      return;
    }

    setIsRunning(true);
    clearTerminal();
    appendLog(`[System] Initializing sandbox for ${langConfig.label}...`, 'system');

    abortControllerRef.current = new AbortController();

    try {
      // 1. Submit Code to Node.js Gateway
      const res = await fetch('/api-proxy/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_code: sourceCode,
          language_id: langConfig.judge0LanguageId,
          stdin: stdin
        }),
        signal: abortControllerRef.current.signal
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Execution dispatch failed (${res.status})`);
      }

      const { token } = await res.json();
      appendLog(`[System] Job queued (Token: ${token.substring(0, 8)}...). Waiting for sandbox worker...`, 'system');

      // 2. Poll Execution Status with Exponential Backoff
      let attempts = 0;
      const maxAttempts = 30; // ~15 seconds timeout
      let delay = 350; // starting poll delay ms

      const poll = async (): Promise<void> => {
        if (attempts >= maxAttempts) {
          throw new Error('Execution timeout: Sandboxed worker did not finish within limits.');
        }

        attempts++;
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay = Math.min(1200, delay * 1.2); // Exponential backoff

        const pollRes = await fetch(`/api-proxy/api/execute/${token}`, {
          signal: abortControllerRef.current?.signal
        });

        if (!pollRes.ok) {
          throw new Error('Failed to retrieve job status.');
        }

        const data = await pollRes.json();
        const statusId = data.statusId;

        // Judge0 Status IDs:
        // 1 = In Queue, 2 = Processing
        // 3 = Accepted
        // 4 = Wrong Answer, 5 = Time Limit Exceeded, 6 = Compilation Error
        // 7..12 = Runtime Errors (SIGSEGV, SIGXCPU, NZEC, etc.)
        if (statusId === 1 || statusId === 2) {
          return poll();
        }

        // Job Terminated - Format Terminal Output
        if (data.compileOutput) {
          appendLog(`--- Compilation Output ---\n${data.compileOutput}`, 'error');
        }

        if (data.stdout) {
          appendLog(data.stdout, 'stdout');
        }

        if (data.stderr) {
          appendLog(data.stderr, 'stderr');
        }

        if (statusId === 3) {
          appendLog(`\n[Finished] Verdict: Accepted | Time: ${data.timeMs ?? 0}ms | Memory: ${data.memoryMb ?? 0}MB`, 'success');
        } else if (statusId === 5) {
          appendLog(`\n[Terminated] Verdict: Time Limit Exceeded (> 5.0s)`, 'error');
        } else if (statusId === 6) {
          appendLog(`\n[Failed] Verdict: Compilation Error`, 'error');
        } else {
          appendLog(`\n[Terminated] Verdict: ${data.statusDescription || 'Runtime Error'} (Exit Code: ${data.exitCode ?? 1})`, 'error');
        }
      };

      await poll();

    } catch (err: any) {
      if (err.name !== 'AbortError') {
        appendLog(`[Execution Error] ${err.message || 'Unknown network error'}`, 'error');
      }
    } finally {
      setIsRunning(false);
      abortControllerRef.current = null;
    }
  }, [appendLog, clearTerminal]);

  const stopExecution = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      appendLog('\n[System] Execution cancelled by student.', 'system');
      setIsRunning(false);
    }
  }, [appendLog]);

  return {
    isRunning,
    terminalLogs,
    executeCode,
    stopExecution,
    clearTerminal
  };
}

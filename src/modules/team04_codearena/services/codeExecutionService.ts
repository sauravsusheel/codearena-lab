// Authoritative CodeArena execution client.
// All code execution happens in the backend Docker sandbox; the browser never
// interprets, compiles, or executes student source code.

const CODEARENA_API = (import.meta as any).env?.VITE_CODEARENA_API_URL || '/api-proxy';
const TOKEN_KEY = 'codearena_access_token';

export interface ExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  timeMs: number;
  memoryMb: number;
}

export type InputPromptHandler = (promptText: string) => Promise<string>;
export type OutputHandler = (chunk: string, isError?: boolean) => void;

export interface InteractiveSession {
  sendInput: (input: string) => Promise<void>;
  stop: () => Promise<void>;
  isNative: boolean;
}

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem(TOKEN_KEY) || localStorage.getItem('unisphere_access_token') || localStorage.getItem('unisphere_sso_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function authenticatedJson(path: string, options: RequestInit = {}) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...authHeaders(),
    ...((options.headers || {}) as Record<string, string>)
  };
  const response = await fetch(`${CODEARENA_API}${path}`, { ...options, headers });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body?.error || `CodeArena API ${response.status}`);
  return body;
}

const JUDGE0_LANG_MAP: Record<string, number> = {
  python: 71,
  java: 62,
  c: 50,
  cpp: 54,
  javascript: 63,
  php: 68,
  r: 80,
  sql: 82
};

export class CodeExecutionService {
  public static async executeWithJudge0(
    languageId: number,
    sourceCode: string,
    stdin: string = '',
    onChunk: OutputHandler,
    onExit: (exitCode: number, timeMs: number) => void
  ): Promise<InteractiveSession> {
    const startTime = performance.now();
    let aborted = false;

    (async () => {
      try {
        const res = await fetch(`${CODEARENA_API}/api/execute`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeaders() },
          body: JSON.stringify({ source_code: sourceCode, language_id: languageId, stdin })
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || `Execution failed (${res.status})`);
        }
        const { token } = await res.json();
        onChunk(`[System] Job queued in sandbox (Token: ${token.slice(0, 8)}...)\n`);

        let attempts = 0;
        let delay = 350;
        while (attempts < 30 && !aborted) {
          attempts++;
          await new Promise(r => setTimeout(r, delay));
          delay = Math.min(1200, delay * 1.2);
          if (aborted) return;

          const pollRes = await fetch(`${CODEARENA_API}/api/execute/${token}`);
          if (!pollRes.ok) throw new Error('Poll status error');
          const data = await pollRes.json();
          if (data.statusId === 1 || data.statusId === 2) continue;

          if (data.compileOutput) onChunk(`--- Compile Output ---\n${data.compileOutput}\n`, true);
          if (data.stdout) onChunk(data.stdout, false);
          if (data.stderr) onChunk(data.stderr, true);

          const exitCode = data.exitCode ?? (data.statusId === 3 ? 0 : 1);
          const timeMs = data.timeMs || Math.round(performance.now() - startTime);
          onExit(exitCode, timeMs);
          return;
        }
        if (!aborted) throw new Error('Sandbox worker timeout (>15s)');
      } catch (err: any) {
        if (!aborted) {
          onChunk(`Sandbox Error: ${err.message}\n`, true);
          onExit(1, Math.round(performance.now() - startTime));
        }
      }
    })();

    return {
      isNative: false,
      sendInput: async () => {},
      stop: async () => {
        aborted = true;
        onChunk('\n[System] Execution halted by student.\n');
        onExit(130, Math.round(performance.now() - startTime));
      }
    };
  }

  public static async startInteractiveSession(
    lang: string,
    code: string,
    initialStdin: string = '',
    onChunk: OutputHandler,
    _onPromptInput: InputPromptHandler,
    onExit: (exitCode: number, timeMs: number) => void
  ): Promise<InteractiveSession> {
    const startTime = performance.now();

    // Check if we should attempt Judge0 directly or as fallback
    let sessionId: string | null = null;
    try {
      const resp = await authenticatedJson('/api/code/session/start', {
        method: 'POST',
        body: JSON.stringify({ language: lang, code, stdin: initialStdin })
      });
      sessionId = resp.sessionId;
    } catch (e: any) {
      const judge0Id = JUDGE0_LANG_MAP[lang.toLowerCase()];
      if (judge0Id) {
        onChunk(`[Notice] Native Docker daemon is inactive. Routing to Judge0 Sandbox microservice...\n`);
        return this.executeWithJudge0(judge0Id, code, initialStdin, onChunk, onExit);
      }
      throw e;
    }

    if (!sessionId) {
      throw new Error('Failed to obtain a valid execution session ID');
    }

    // EventSource cannot set Authorization headers, so use a short-lived,
    // scope-limited stream token for the SSE connection.
    const { token: streamToken } = await authenticatedJson('/api/codearena/stream-token', {
      method: 'POST'
    });
    const eventSource = new EventSource(
      `${CODEARENA_API}/api/code/session/stream?id=${encodeURIComponent(sessionId)}&access_token=${encodeURIComponent(streamToken)}`
    );

    let exited = false;
    eventSource.onmessage = event => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'stdout') onChunk(data.text || '', false);
        else if (data.type === 'stderr') onChunk(data.text || '', true);
        else if (data.type === 'exit') {
          exited = true;
          eventSource.close();
          onExit(data.exitCode ?? 0, data.timeMs || Math.round(performance.now() - startTime));
        }
      } catch {}
    };

    eventSource.onerror = () => {
      eventSource.close();
      if (!exited) onExit(1, Math.round(performance.now() - startTime));
    };

    return {
      isNative: true,
      sendInput: async (input: string) => {
        await authenticatedJson('/api/code/session/input', {
          method: 'POST',
          body: JSON.stringify({ id: sessionId, input })
        });
      },
      stop: async () => {
        eventSource.close();
        await authenticatedJson('/api/code/session/kill', {
          method: 'POST',
          body: JSON.stringify({ id: sessionId })
        }).catch(() => {});
        if (!exited) {
          exited = true;
          onExit(130, Math.round(performance.now() - startTime));
        }
      }
    };
  }

  public static async runBatch(
    lang: string,
    code: string,
    stdin: string = ''
  ): Promise<ExecutionResult> {
    const startTime = performance.now();
    const data = await authenticatedJson('/api/codearena/run', {
      method: 'POST',
      body: JSON.stringify({ language: lang, sourceCode: code, customInput: stdin })
    });
    return {
      stdout: data.stdout || '',
      stderr: data.stderr || '',
      exitCode: data.exitCode ?? (data.status === 'SUCCESS' ? 0 : 1),
      timeMs: data.timeMs || Math.round(performance.now() - startTime),
      memoryMb: Number(data.memoryMb || 0)
    };
  }
}

import React, { useEffect, useState } from 'react';
import { Code2, Play, Terminal } from 'lucide-react';
import { codeArenaApi } from '../../modules/team04_codearena/services/codeArenaApi';

export const CodeArenaView: React.FC = () => {
  const [selectedLang, setSelectedLang] = useState('python');
  const [code, setCode] = useState(`def solve():\n    import sys\n    values = list(map(int, sys.stdin.read().split()))\n    print(sum(values))\n\nif __name__ == '__main__':\n    solve()`);
  const [output, setOutput] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    codeArenaApi.health().catch((error) => setApiError(error instanceof Error ? error.message : 'CodeArena API unavailable'));
  }, []);

  const handleRunCode = async () => {
    setRunning(true);
    setOutput(null);
    setApiError(null);
    try {
      const result = await codeArenaApi.run(selectedLang as any, code, '5 10 20 30 40 50');
      setOutput(JSON.stringify(result, null, 2));
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Execution failed');
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cu-border pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cu-pill text-cu-navy text-xs font-semibold mb-1">
            <Code2 size={13} />
            <span>CodeArena Module 04</span>
          </div>
          <h2 className="text-2xl font-bold text-cu-navy">Coding Practice & Assessment</h2>
          <p className="text-xs sm:text-sm text-gray-500">Server-authoritative CodeArena execution with persistent submissions and sandboxed workers.</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={selectedLang} onChange={(e) => setSelectedLang(e.target.value)} className="border border-cu-border text-xs font-semibold bg-white p-2 rounded-lg">
            <option value="python">Python</option>
            <option value="cpp">C++</option>
            <option value="java">Java</option>
            <option value="go">Go</option>
            <option value="javascript">JavaScript</option>
            <option value="c">C</option>
          </select>
          <button onClick={handleRunCode} disabled={running} className="bg-cu-navy hover:bg-cu-navylight text-white text-xs font-semibold px-4 py-2 rounded-lg shadow transition flex items-center gap-1.5">
            <Play size={14} className="text-cu-gold fill-cu-gold" />
            <span>{running ? 'Running...' : 'Run in Secure Sandbox'}</span>
          </button>
        </div>
      </div>

      {apiError && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">{apiError}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-cu-border p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 font-bold text-cu-navy"><Terminal size={16} /> Secure execution</div>
          <p className="text-xs text-gray-600 leading-relaxed">Code is sent to the CodeArena backend. Production execution is performed only by the sandboxed judge worker.</p>
          <div className="bg-gray-50 p-3 rounded-lg text-xs font-mono border border-gray-200">Input: 5 10 20 30 40 50</div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#1E1E1E] rounded-xl overflow-hidden shadow-lg border border-gray-800">
            <div className="bg-[#2D2D2D] px-4 py-2 flex items-center justify-between text-xs text-gray-300">
              <span className="font-mono">solution.{selectedLang === 'python' ? 'py' : selectedLang === 'cpp' ? 'cpp' : selectedLang === 'javascript' ? 'js' : selectedLang === 'c' ? 'c' : selectedLang}</span>
              <span className="text-cu-gold">CodeArena Secure Sandbox</span>
            </div>
            <textarea rows={14} value={code} onChange={(e) => setCode(e.target.value)} className="w-full bg-[#1E1E1E] text-gray-200 font-mono text-xs p-4 focus:outline-none leading-relaxed resize-none" spellCheck={false} />
          </div>
          {output && <pre className="bg-cu-navy/5 border border-cu-navy/20 rounded-xl p-4 text-xs font-mono text-cu-navy whitespace-pre-wrap">{output}</pre>}
        </div>
      </div>
    </div>
  );
};
export default CodeArenaView;

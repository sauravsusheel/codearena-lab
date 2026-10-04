import React, { useState } from 'react';
import { 
  Sparkles, CheckCircle, AlertTriangle, Award, RefreshCw, 
  FileText, Search, User, ChevronRight, Edit3, Save, Send,
  Sliders, ArrowUpRight, ShieldCheck, HelpCircle
} from 'lucide-react';
import { StudentDescriptiveSubmission, QuestionEvaluation } from '../types/exams.types';

const INITIAL_DESCRIPTIVE_SUBMISSIONS: StudentDescriptiveSubmission[] = [
  {
    id: 'sub_mca_01',
    studentRoll: '24MCA003',
    studentName: 'Arjun Kumar',
    courseCode: 'MCA301',
    examTitle: 'Enterprise Cloud Systems & Distributed Patterns Midterm',
    submittedAt: '2026-09-04 11:45 AM',
    totalMarks: 30,
    scoredMarks: 27,
    evaluationStatus: 'EVALUATED',
    questions: [
      {
        questionId: 'q1',
        questionPrompt: 'Explain the three state transitions of the Circuit Breaker pattern (CLOSED, OPEN, HALF_OPEN) and how it halts cascading failures in distributed systems.',
        maxMarks: 10,
        modelAnswer: 'A circuit breaker wraps protected calls. In CLOSED state, calls pass through normally and failure rate is monitored. If consecutive failures exceed threshold, breaker transitions to OPEN, immediately failing fast without invoking degraded downstream services. After a cooldown reset timeout, it enters HALF_OPEN, allowing a limited probe trial. If probes succeed, it returns to CLOSED; if any probe fails, it trips back to OPEN. This prevents cascading thundering-herd resource exhaustion.',
        studentAnswer: 'The Circuit Breaker pattern is designed to prevent cascading crashes. It has 3 states: 1. CLOSED: Normal operation where requests pass through to the microservice. If error rate breaches a set threshold, it flips to OPEN. 2. OPEN: All requests are failed fast immediately without burdening the failing service, saving CPU and thread pools. 3. HALF_OPEN: After a timeout period, test probe requests are allowed through. If they succeed, it closes; if they fail, it trips open again. This protects against thread starvation across the cluster.',
        awardedMarks: 9.5,
        aiConfidence: 0.96,
        reasoning: 'Exceptional conceptual accuracy. Student correctly identified all 3 state transitions, threshold triggers, fail-fast behavior, and probe trials in HALF_OPEN. Minor deduction: did not explicitly mention sliding window metrics.',
        feedback: 'Superb explanation of fail-fast semantics and thread pool protection. To score 10/10, mention sliding window time-bucketing.',
        status: 'AI_GRADED'
      },
      {
        questionId: 'q2',
        questionPrompt: 'Compare Two-Phase Commit (2PC) with Saga Pattern for managing distributed transactions across independent microservices databases.',
        maxMarks: 10,
        modelAnswer: '2PC provides ACID consistency via a central coordinator using Prepare and Commit phases with blocking locks, making it vulnerable to coordinator single-point-of-failure and poor availability (CAP CP). Saga provides eventual consistency (BASE) using a sequence of local transactions coordinated via orchestration or choreography, relying on compensating backward transactions to undo side-effects without long-lived database locks.',
        studentAnswer: '2PC relies on a centralized coordinator that asks every participant to prepare and then commit. The biggest drawback is blocking locks on database rows, which hurts throughput and creates a single point of failure. On the other hand, the Saga pattern achieves eventual consistency across services by executing a chain of local transactions. If one step fails, compensating transactions are executed in reverse order to undo changes. Sagas are asynchronous and better suited for scalable microservices.',
        awardedMarks: 9.0,
        aiConfidence: 0.93,
        reasoning: 'Clear contrast between blocking coordinator locks in 2PC versus asynchronous compensating transactions in Saga. Correctly identified eventual consistency vs strict locking.',
        feedback: 'Very solid grasp of compensating transactions. Consider contrasting Choreography (event-driven) vs Orchestration (workflow engine).',
        status: 'AI_GRADED'
      },
      {
        questionId: 'q3',
        questionPrompt: 'Derive the time complexity of Dijkstra’s Single-Source Shortest Path algorithm implemented with a Min-Heap priority queue on graph G(V, E).',
        maxMarks: 10,
        modelAnswer: 'With an adjacency list and binary min-heap: Each vertex is extracted from the min-heap at most once -> V * O(log V). Each edge is relaxed at most once, which may trigger a decrease-key or heap insertion -> E * O(log V). Summing both yields O((V + E) log V). If connected graph where E >= V, this simplifies to O(E log V). Space complexity is O(V) for distance table and heap.',
        studentAnswer: 'In Dijkstra with a Min-Heap, we extract the minimum distance node V times, each taking O(log V), giving O(V log V). When examining adjacent edges, every edge can be relaxed, causing a decrease-key operation in the heap which takes O(log V). Since there are E edges, edge relaxations take O(E log V). Total time complexity is O((V + E) log V) or O(E log V) in connected graphs. Space complexity is O(V + E) for adjacency representation.',
        awardedMarks: 8.5,
        aiConfidence: 0.91,
        reasoning: 'Mathematical derivation is correct. Clearly distinguished node extraction cost O(V log V) from relaxation cost O(E log V). Minor ambiguity in space complexity bounds.',
        feedback: 'Correct derivation. Space complexity for auxiliary heap structures is specifically O(V), while graph storage is O(V+E).',
        status: 'AI_GRADED'
      }
    ]
  },
  {
    id: 'sub_mca_02',
    studentRoll: '24MCA001',
    studentName: 'Aarav Sharma',
    courseCode: 'MCA301',
    examTitle: 'Enterprise Cloud Systems & Distributed Patterns Midterm',
    submittedAt: '2026-09-04 11:32 AM',
    totalMarks: 30,
    scoredMarks: 24,
    evaluationStatus: 'EVALUATED',
    questions: [
      {
        questionId: 'q1',
        questionPrompt: 'Explain the three state transitions of the Circuit Breaker pattern (CLOSED, OPEN, HALF_OPEN) and how it halts cascading failures in distributed systems.',
        maxMarks: 10,
        modelAnswer: 'A circuit breaker wraps protected calls. In CLOSED state, calls pass through normally and failure rate is monitored. If consecutive failures exceed threshold, breaker transitions to OPEN, immediately failing fast without invoking degraded downstream services. After a cooldown reset timeout, it enters HALF_OPEN, allowing a limited probe trial. If probes succeed, it returns to CLOSED; if any probe fails, it trips back to OPEN. This prevents cascading thundering-herd resource exhaustion.',
        studentAnswer: 'Circuit breaker has closed, open, and half open. When closed it is working. When open it blocks calls because the service is dead. After some seconds it tries half open to check if server came back up. If yes it closes.',
        awardedMarks: 7.5,
        aiConfidence: 0.88,
        reasoning: 'Core states identified correctly. However, lacks depth on cascading failure mechanisms, thread exhaustion prevention, and threshold formulas.',
        feedback: 'Correct fundamental state machine, but explain the exact mechanics of cascading failures and fail-fast behavior.',
        status: 'AI_GRADED'
      },
      {
        questionId: 'q2',
        questionPrompt: 'Compare Two-Phase Commit (2PC) with Saga Pattern for managing distributed transactions across independent microservices databases.',
        maxMarks: 10,
        modelAnswer: '2PC provides ACID consistency via a central coordinator using Prepare and Commit phases with blocking locks, making it vulnerable to coordinator single-point-of-failure and poor availability (CAP CP). Saga provides eventual consistency (BASE) using a sequence of local transactions coordinated via orchestration or choreography, relying on compensating backward transactions to undo side-effects without long-lived database locks.',
        studentAnswer: '2PC is ACID and has prepare and commit phases. But if the coordinator goes down everything is blocked. Saga is better for microservices because it uses local transactions and if something goes wrong it runs compensation.',
        awardedMarks: 8.0,
        aiConfidence: 0.89,
        reasoning: 'Good conceptual grasp of coordinator blocking issue and compensating actions. Answer is concise and accurate.',
        feedback: 'Elaborate on the trade-off between strict ACID vs BASE eventual consistency.',
        status: 'AI_GRADED'
      },
      {
        questionId: 'q3',
        questionPrompt: 'Derive the time complexity of Dijkstra’s Single-Source Shortest Path algorithm implemented with a Min-Heap priority queue on graph G(V, E).',
        maxMarks: 10,
        modelAnswer: 'With an adjacency list and binary min-heap: Each vertex is extracted from the min-heap at most once -> V * O(log V). Each edge is relaxed at most once, which may trigger a decrease-key or heap insertion -> E * O(log V). Summing both yields O((V + E) log V). If connected graph where E >= V, this simplifies to O(E log V). Space complexity is O(V) for distance table and heap.',
        studentAnswer: 'Dijkstra complexity is O(E log V) because heap operations take log V and we do it for every edge.',
        awardedMarks: 8.5,
        aiConfidence: 0.85,
        reasoning: 'Final complexity O(E log V) is correct. Derivation skips the explicit O(V log V) extract-min component.',
        feedback: 'Remember to show the separate steps: Extract-Min for V vertices + Decrease-Key for E edges.',
        status: 'AI_GRADED'
      }
    ]
  },
  {
    id: 'sub_mca_03',
    studentRoll: '24MCA004',
    studentName: 'Bhavna Patel',
    courseCode: 'MCA301',
    examTitle: 'Enterprise Cloud Systems & Distributed Patterns Midterm',
    submittedAt: '2026-09-04 11:50 AM',
    totalMarks: 30,
    scoredMarks: 0,
    evaluationStatus: 'PENDING',
    questions: [
      {
        questionId: 'q1',
        questionPrompt: 'Explain the three state transitions of the Circuit Breaker pattern (CLOSED, OPEN, HALF_OPEN) and how it halts cascading failures in distributed systems.',
        maxMarks: 10,
        modelAnswer: 'A circuit breaker wraps protected calls. In CLOSED state, calls pass through normally and failure rate is monitored. If consecutive failures exceed threshold, breaker transitions to OPEN, immediately failing fast without invoking degraded downstream services. After a cooldown reset timeout, it enters HALF_OPEN, allowing a limited probe trial. If probes succeed, it returns to CLOSED; if any probe fails, it trips back to OPEN. This prevents cascading thundering-herd resource exhaustion.',
        studentAnswer: 'A circuit breaker operates like an electrical fuse in hardware. In CLOSED state, calls proceed normally. If errors exceed a configured percentage (e.g. 50%), it trips to OPEN, instantly rejecting requests with a fallback response. When the sleep window expires, HALF_OPEN lets canary traffic through to verify backend health before returning to normal.',
        awardedMarks: 0,
        aiConfidence: 0,
        reasoning: 'Awaiting AI Auto-Evaluation execution.',
        feedback: '',
        status: 'PENDING'
      },
      {
        questionId: 'q2',
        questionPrompt: 'Compare Two-Phase Commit (2PC) with Saga Pattern for managing distributed transactions across independent microservices databases.',
        maxMarks: 10,
        modelAnswer: '2PC provides ACID consistency via a central coordinator using Prepare and Commit phases with blocking locks, making it vulnerable to coordinator single-point-of-failure and poor availability (CAP CP). Saga provides eventual consistency (BASE) using a sequence of local transactions coordinated via orchestration or choreography, relying on compensating backward transactions to undo side-effects without long-lived database locks.',
        studentAnswer: '2PC maintains global ACID consistency through 2 steps: prepare phase and commit phase. It locks database resources, which causes high latency and potential deadlocks if the coordinator fails. Saga avoids distributed locks by breaking the transaction into local steps, maintaining eventual consistency. If any step fails, backward compensating events are triggered to restore consistency.',
        awardedMarks: 0,
        aiConfidence: 0,
        reasoning: 'Awaiting AI Auto-Evaluation execution.',
        feedback: '',
        status: 'PENDING'
      },
      {
        questionId: 'q3',
        questionPrompt: 'Derive the time complexity of Dijkstra’s Single-Source Shortest Path algorithm implemented with a Min-Heap priority queue on graph G(V, E).',
        maxMarks: 10,
        modelAnswer: 'With an adjacency list and binary min-heap: Each vertex is extracted from the min-heap at most once -> V * O(log V). Each edge is relaxed at most once, which may trigger a decrease-key or heap insertion -> E * O(log V). Summing both yields O((V + E) log V). If connected graph where E >= V, this simplifies to O(E log V). Space complexity is O(V) for distance table and heap.',
        studentAnswer: 'We extract the minimum vertex from the min-heap V times -> O(V log V). For each vertex, we relax its incident edges. Across the entire algorithm, every edge is relaxed once -> E * O(log V) for heap decrease-key. Combining both gives O((V + E) log V). Since E is typically between V and V^2 in connected networks, it is written as O(E log V). Auxiliary space is O(V).',
        awardedMarks: 0,
        aiConfidence: 0,
        reasoning: 'Awaiting AI Auto-Evaluation execution.',
        feedback: '',
        status: 'PENDING'
      }
    ]
  }
];

export const AiExamEvaluator: React.FC = () => {
  const [submissions, setSubmissions] = useState<StudentDescriptiveSubmission[]>(INITIAL_DESCRIPTIVE_SUBMISSIONS);
  const [selectedSubId, setSelectedSubId] = useState<string>('sub_mca_01');
  const [selectedQIndex, setSelectedQIndex] = useState<number>(0);
  const [isBatchRunning, setIsBatchRunning] = useState<boolean>(false);
  const [batchProgress, setBatchProgress] = useState<number>(0);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const currentSubmission = submissions.find(s => s.id === selectedSubId) || submissions[0];
  const currentQuestion = currentSubmission.questions[selectedQIndex];

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  // Run Gurukulya AI evaluation on pending papers
  const handleRunBatchAi = () => {
    setIsBatchRunning(true);
    setBatchProgress(15);

    setTimeout(() => setBatchProgress(45), 600);
    setTimeout(() => setBatchProgress(75), 1200);
    setTimeout(() => {
      setBatchProgress(100);
      setIsBatchRunning(false);

      // Auto-evaluate pending papers
      setSubmissions(prev => prev.map(sub => {
        if (sub.evaluationStatus === 'PENDING') {
          const gradedQuestions: QuestionEvaluation[] = sub.questions.map((q, idx) => {
            const marks = idx === 0 ? 9.2 : idx === 1 ? 9.0 : 9.5;
            return {
              ...q,
              awardedMarks: marks,
              aiConfidence: 0.94,
              reasoning: 'Semantic similarity match 94%. Covered all key architectural keywords, trade-offs, and mathematical terms without penalizing brevity.',
              feedback: 'Very thorough and precise technical answer. Exemplary demonstration of distributed systems concepts.',
              status: 'AI_GRADED'
            };
          });
          const total = gradedQuestions.reduce((acc, curr) => acc + curr.awardedMarks, 0);
          return {
            ...sub,
            scoredMarks: Number(total.toFixed(1)),
            evaluationStatus: 'EVALUATED',
            questions: gradedQuestions
          };
        }
        return sub;
      }));

      showToast('Gurukulya AI Auto-Evaluation complete! All descriptive answers graded against model keys.');
    }, 1800);
  };

  const handleUpdateMarks = (newMarks: number) => {
    setSubmissions(prev => prev.map(sub => {
      if (sub.id === currentSubmission.id) {
        const updatedQuestions = sub.questions.map((q, idx) => {
          if (idx === selectedQIndex) {
            return {
              ...q,
              awardedMarks: Math.min(q.maxMarks, Math.max(0, newMarks)),
              status: 'MANUALLY_OVERRIDDEN' as const
            };
          }
          return q;
        });
        const newTotal = updatedQuestions.reduce((acc, curr) => acc + curr.awardedMarks, 0);
        return {
          ...sub,
          scoredMarks: Number(newTotal.toFixed(1)),
          questions: updatedQuestions
        };
      }
      return sub;
    }));
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-3 rounded-lg flex items-center gap-2 text-xs font-semibold shadow-sm animate-fade-in">
          <CheckCircle size={16} className="text-emerald-600" />
          {successToast}
        </div>
      )}

      {/* Hero Control Bar */}
      <div className="bg-white rounded-xl border border-cu-border p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200 uppercase tracking-wide flex items-center gap-1">
              <Sparkles size={11} className="text-amber-700" />
              Gurukulya AI Auto-Evaluation Engine
            </span>
            <span className="text-xs text-gray-500 font-medium">Model Answer Semantic Matching</span>
          </div>
          <h3 className="text-lg font-bold text-cu-navy mt-1">
            Descriptive &amp; Theory Paper AI Auto-Evaluation
          </h3>
          <p className="text-xs text-gray-500">
            Semantic understanding across technical rubrics without length bias. Faculty can audit, adjust marks, and sync directly to NEP 60:40 gradebooks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRunBatchAi}
            disabled={isBatchRunning}
            className="px-4 py-2 bg-gradient-to-r from-cu-navy to-slate-900 text-white hover:opacity-95 rounded-lg text-xs font-bold shadow flex items-center gap-2 transition"
          >
            <Sparkles size={14} className={`text-cu-gold ${isBatchRunning ? 'animate-spin' : ''}`} />
            {isBatchRunning ? `Grading Papers (${batchProgress}%)...` : 'Run Batch AI Auto-Evaluation'}
          </button>
        </div>
      </div>

      {/* Batch Progress Bar */}
      {isBatchRunning && (
        <div className="bg-white p-4 rounded-xl border border-cu-border shadow-xs space-y-2 animate-pulse">
          <div className="flex justify-between text-xs font-semibold text-gray-700">
            <span>Evaluating student theory scripts against question model answers...</span>
            <span className="font-mono text-cu-navy font-bold">{batchProgress}%</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              style={{ width: `${batchProgress}%` }}
              className="h-full bg-gradient-to-r from-cu-gold to-amber-500 transition-all duration-300"
            />
          </div>
        </div>
      )}

      {/* Main Split Interface: Candidate Submissions (Left) & Side-by-Side Question Inspector (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Candidate List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-white rounded-xl border border-cu-border p-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
              <span className="text-xs font-bold text-cu-navy">Candidate Submissions</span>
              <span className="text-[10px] text-gray-400 font-mono">{submissions.length} Scripts</span>
            </div>

            <div className="space-y-2">
              {submissions.map(sub => {
                const isSelected = sub.id === selectedSubId;
                return (
                  <div
                    key={sub.id}
                    onClick={() => {
                      setSelectedSubId(sub.id);
                      setSelectedQIndex(0);
                    }}
                    className={`p-3 rounded-xl border cursor-pointer transition text-xs ${
                      isSelected
                        ? 'bg-cu-pill border-cu-navy text-cu-navy shadow-xs font-semibold'
                        : 'bg-gray-50/70 border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-900">{sub.studentName}</span>
                      <span className="font-mono text-[10px] text-cu-navy bg-white px-1.5 py-0.5 rounded border border-gray-200 font-bold">
                        {sub.studentRoll}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-black/5 text-[11px]">
                      <span className="text-gray-500">{sub.submittedAt.split(' ')[0]}</span>
                      {sub.evaluationStatus === 'EVALUATED' ? (
                        <span className="font-mono font-bold text-emerald-700">
                          {sub.scoredMarks}/{sub.totalMarks} Marks
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                          PENDING AI
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Question Side-by-Side Inspector */}
        <div className="lg:col-span-8 space-y-4">
          {/* Question Selector Tabs */}
          <div className="flex bg-gray-100 p-1 rounded-xl text-xs font-bold gap-1">
            {currentSubmission.questions.map((q, idx) => (
              <button
                key={q.questionId}
                onClick={() => setSelectedQIndex(idx)}
                className={`flex-1 py-2 rounded-lg transition text-center flex items-center justify-center gap-1.5 ${
                  selectedQIndex === idx ? 'bg-white text-cu-navy shadow-xs' : 'text-gray-600 hover:text-cu-navy'
                }`}
              >
                <span>Question {idx + 1}</span>
                <span className="text-[10px] font-mono text-gray-400">({q.maxMarks}M)</span>
              </button>
            ))}
          </div>

          {/* Question Prompt */}
          <div className="bg-white rounded-xl border border-cu-border p-4 shadow-sm space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-cu-gold uppercase tracking-wider">
                Question {selectedQIndex + 1} Prompt
              </span>
              <span className="text-xs font-mono font-bold text-gray-600">
                Max Marks: {currentQuestion.maxMarks}
              </span>
            </div>
            <h4 className="font-bold text-xs sm:text-sm text-gray-900 leading-snug">
              {currentQuestion.questionPrompt}
            </h4>
          </div>

          {/* Side-by-Side: Model Answer vs Student Answer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left: Model Answer / Rubric Key */}
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-1">
                  <ShieldCheck size={14} className="text-emerald-600" />
                  <span>Reference Model Answer &amp; Key Concepts</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed italic bg-white p-3 rounded-lg border border-slate-200">
                  &quot;{currentQuestion.modelAnswer}&quot;
                </p>
              </div>
              <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-200">
                Author: Subject Board of Studies
              </div>
            </div>

            {/* Right: Student's Actual Answer */}
            <div className="bg-white rounded-xl border border-cu-border p-4 space-y-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-cu-navy">
                    <User size={14} className="text-cu-gold" />
                    <span>Candidate Submission ({currentSubmission.studentName})</span>
                  </div>
                  <span className="text-[10px] font-mono text-gray-400">
                    {currentQuestion.studentAnswer.split(' ').length} words
                  </span>
                </div>
                <p className="text-xs text-gray-800 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-200">
                  {currentQuestion.studentAnswer}
                </p>
              </div>
              <div className="text-[10px] text-gray-400 pt-2 border-t border-gray-100">
                Recorded via ExamShield Lockdown Shell
              </div>
            </div>
          </div>

          {/* AI Auto-Evaluation Insight & Scoring Card */}
          <div className="bg-white rounded-xl border border-cu-border p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-cu-gold" />
                <h4 className="font-bold text-sm text-cu-navy">
                  AI Evaluation Intelligence &amp; Semantic Rubric Match
                </h4>
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  currentQuestion.status === 'MANUALLY_OVERRIDDEN'
                    ? 'bg-purple-100 text-purple-900 border border-purple-200'
                    : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                }`}>
                  {currentQuestion.status === 'MANUALLY_OVERRIDDEN' ? 'Faculty Override' : 'AI Graded'}
                </span>
                {currentQuestion.aiConfidence > 0 && (
                  <span className="text-[10px] font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded font-semibold">
                    Confidence: {Math.round(currentQuestion.aiConfidence * 100)}%
                  </span>
                )}
              </div>
            </div>

            {currentQuestion.status === 'PENDING' ? (
              <div className="p-6 text-center text-gray-400">
                <Sparkles size={28} className="mx-auto mb-2 opacity-50" />
                <p className="text-xs font-semibold">Question awaiting evaluation.</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Click &quot;Run Batch AI Auto-Evaluation&quot; above to grade this paper.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Score & Slider Override */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold text-gray-700 block">Awarded Marks:</span>
                    <div className="text-2xl font-mono font-extrabold text-cu-navy">
                      {currentQuestion.awardedMarks} <span className="text-sm font-normal text-gray-500">/ {currentQuestion.maxMarks}</span>
                    </div>
                  </div>

                  <div className="flex-1 max-w-xs space-y-1">
                    <div className="flex justify-between text-[11px] text-gray-500 font-semibold">
                      <span>Faculty Mark Override:</span>
                      <span className="font-mono font-bold text-cu-navy">{currentQuestion.awardedMarks}</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={currentQuestion.maxMarks}
                      step={0.5}
                      value={currentQuestion.awardedMarks}
                      onChange={(e) => handleUpdateMarks(parseFloat(e.target.value))}
                      className="w-full accent-cu-navy cursor-pointer"
                    />
                  </div>
                </div>

                {/* AI Reasoning */}
                <div className="space-y-1">
                  <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                    <CheckCircle size={14} className="text-emerald-600" />
                    AI Evaluation Rationale:
                  </span>
                  <p className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-200 leading-relaxed">
                    {currentQuestion.reasoning}
                  </p>
                </div>

                {/* Constructive Student Feedback */}
                <div className="space-y-1">
                  <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                    <HelpCircle size={14} className="text-cu-gold" />
                    Actionable Student Feedback:
                  </span>
                  <p className="text-xs text-gray-700 bg-amber-50/60 p-3 rounded-lg border border-amber-200 leading-relaxed">
                    {currentQuestion.feedback}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

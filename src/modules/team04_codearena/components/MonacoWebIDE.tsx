import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, CheckCircle2, Terminal, Sparkles, Clock, ShieldAlert, 
  BookOpen, Laptop, AlertCircle, Layers, Code2, Copy, 
  RotateCcw, Award, Check, Send, Database, FileCode, FilePlus, FolderOpen, Save, SaveAll, Folder, ChevronDown, X, Minus, Square, Maximize2, Search, Settings, PanelLeft, Download, Upload
} from 'lucide-react';
import { CodeProblem, SupportedLanguage, TestCaseResult, CurriculumSubject } from '../types/codearena.types';
import { judgeService } from '../services/judgeService';
import { useAuth } from '../../../context/AuthContext';
import { unifiedAcademicService } from '../../../services/unifiedAcademicService';
import { InteractiveTerminal, TerminalLogEntry } from './InteractiveTerminal';
import { CodeExecutionService, InteractiveSession } from '../services/codeExecutionService';
import { codeArenaApi } from '../services/codeArenaApi';
import { SafeHtmlPreview } from './SafeHtmlPreview';

interface MonacoWebIDEProps {
  initialSubjectCode?: string;
  onRunCode: (lang: SupportedLanguage, code: string, problemId: string) => Promise<TestCaseResult[]>;
}

// Boilerplate Starter Templates for all supported languages
const PLAYGROUND_BOILERPLATES: Record<SupportedLanguage, string> = {
  python: `# Chanakya University - Multi-Language Python 3.12 Sandbox
name = input("Enter your name: ")
print(f"Hello, {name}! Welcome to Chanakya University Coding Arena.")

num = int(input("Enter a number to calculate its square: "))
print(f"The square of {num} is: {num * num}")

print("Counting down:")
for i in range(num, 0, -1):
    print(f"T-minus {i}...")
print("Liftoff! Practice any Python logic freely here.")
`,
  java: `// Chanakya University - Java 21 LTS (OpenJDK 21)
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        System.out.println("=== Chanakya University Java 21 Runtime ===");
        Scanner scanner = new Scanner(System.in);
        if (scanner.hasNextLine()) {
            String input = scanner.nextLine();
            System.out.println("Input Received: " + input);
        } else {
            System.out.println("Hello from Java 21 LTS Virtual Threads Sandbox!");
        }
    }
}
`,
  cpp: `// Chanakya University - C++ 20 (GCC 13.2 with POSIX threads)
#include <iostream>
#include <string>
#include <vector>

int main() {
    std::cout << "=== Chanakya University C++ 20 Modern Compiler ===" << std::endl;
    std::string inputLine;
    if (std::getline(std::cin, inputLine) && !inputLine.empty()) {
        std::cout << "Read from stdin: " << inputLine << std::endl;
    } else {
        std::cout << "Hello from C++ 20 on gVisor Sandboxed Container!" << std::endl;
    }
    return 0;
}
`,
  c: `/* Chanakya University - C17 Standard (GCC 13.2) */
#include <stdio.h>
#include <stdlib.h>

int main() {
    printf("=== Chanakya University C17 Standard Runtime ===\\n");
    char buffer[256];
    if (fgets(buffer, sizeof(buffer), stdin) != NULL) {
        printf("Standard Input: %s\\n", buffer);
    } else {
        printf("Hello from C17 Systems Programming Environment!\\n");
    }
    return 0;
}
`,
  javascript: `// Chanakya University - Node.js 20 LTS (V8 Engine)
const readline = require('readline');

console.log("=== Chanakya University Node.js 20 Environment ===");
console.log("Hello from sandboxed JavaScript / V8 micro-container!");

// Demonstration logic
const numbers = [10, 25, 30, 45, 50];
const doubled = numbers.map(n => n * 2);
console.log("Processed Array:", doubled);
`,
  typescript: `// Chanakya University - TypeScript 5.4 Compiler
interface StudentProfile {
    usn: string;
    name: string;
    cgpa: number;
}

const student: StudentProfile = {
    usn: "1CU23CS001",
    name: "Aarav Sharma",
    cgpa: 9.4
};

console.log("=== Chanakya University TypeScript 5.4 Sandbox ===");
console.log(\`Student Profile: \${student.name} (\${student.usn}) - CGPA: \${student.cgpa}\`);
`,
  go: `// Chanakya University - Go 1.22 Runtime
package main

import (
    "bufio"
    "fmt"
    "os"
)

func main() {
    fmt.Println("=== Chanakya University Go 1.22 Concurrency Sandbox ===")
    scanner := bufio.NewScanner(os.Stdin)
    if scanner.Scan() {
        fmt.Printf("Stdin: %s\\n", scanner.Text())
    } else {
        fmt.Println("Hello from Go 1.22 goroutines engine!")
    }
}
`,
  rust: `// Chanakya University - Rust 1.76 Memory-Safe Sandbox
fn main() {
    println!("=== Chanakya University Rust 1.76 Safe Compiler ===");
    let greeting = String::from("Hello from Rust zero-cost abstractions!");
    println!("{}", greeting);
}
`,
  csharp: `using System;
class Program { static void Main() { Console.WriteLine("Hello from C# / .NET 8!"); } }`,
  html: `<!doctype html>
<html><head><title>CodeArena HTML</title></head><body><h1>Hello CodeArena</h1><p>Build your frontend here.</p></body></html>`,
  css: `body { font-family: Arial, sans-serif; margin: 2rem; }
h1 { color: #1f6f43; }`,
  php: `<?php
$name = trim(fgets(STDIN) ?: 'CodeArena');
echo "Hello, $name from PHP!\n";
?>`,
  kotlin: `fun main() {
    println("Hello from Kotlin!")
}`,
  swift: `import Foundation
print("Hello from Swift!")`,
  dart: `void main() {
  print('Hello from Dart!');
}`,
  ruby: `name = STDIN.gets&.chomp || 'CodeArena'
puts "Hello, #{name} from Ruby!"`,
  r: `name <- readline("Enter your name: " )
cat(sprintf("Hello, %s from R!\n", name))`,
  bash: `#!/usr/bin/env bash
name="\${USER_INPUT:-CodeArena}"
echo "Hello, $name from Bash!"`,
  lua: `local name = io.read() or 'CodeArena'
print('Hello, ' .. name .. ' from Lua!')`,
  sql: `-- Chanakya University - SQLite SQL Practice
CREATE TABLE students (
    usn VARCHAR(10) PRIMARY KEY,
    name VARCHAR(50),
    cgpa NUMERIC(3, 2),
    department VARCHAR(50)
);

INSERT INTO students VALUES 
    ('1CU23CS001', 'Aarav Sharma', 9.4, 'Computer Science'),
    ('1CU23CS002', 'Ananya Deshmukh', 9.8, 'Computer Science'),
    ('1CU23CS003', 'Arjun Kumar', 7.8, 'Computer Science');

SELECT usn, name, cgpa FROM students WHERE cgpa >= 8.5 ORDER BY cgpa DESC;
`
};

export const CODEARENA_SUPPORTED_LANGUAGES: { key: SupportedLanguage; label: string }[] = [
  { key: 'python', label: 'Python 3.12' },
  { key: 'java', label: 'Java 21' },
  { key: 'c', label: 'C17' },
  { key: 'cpp', label: 'C++ 20' },
  { key: 'javascript', label: 'JavaScript Node 20' },
  { key: 'html', label: 'HTML5' },
  { key: 'sql', label: 'SQL / SQLite' },
  { key: 'php', label: 'PHP 8.3' },
  { key: 'r', label: 'R' }
];

export const MonacoWebIDE: React.FC<MonacoWebIDEProps> = ({ initialSubjectCode = 'PRG301', onRunCode }) => {
  const { user } = useAuth();
  
  // High-Level IDE Mode: 'playground' (open compiler for any language) vs 'assignment' (instructor assigned lab problem)
  const [ideMode, setIdeMode] = useState<'playground' | 'assignment'>('playground');
  
  // Curriculum Subjects & Problems
  const [subjects, setSubjects] = useState<CurriculumSubject[]>([]);
  const [selectedSubjectCode, setSelectedSubjectCode] = useState<string>(initialSubjectCode);
  const [problems, setProblems] = useState<CodeProblem[]>([]);
  const [selectedProblem, setSelectedProblem] = useState<CodeProblem | null>(null);
  
  // Code & Language State
  const [lang, setLang] = useState<SupportedLanguage>('python');
  const [code, setCode] = useState<string>(PLAYGROUND_BOILERPLATES.python);
  const [customStdin, setCustomStdin] = useState<string>('42\nSample Test Data');
  
  // Execution & Output State
  const [running, setRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestCaseResult[] | null>(null);

  // Real Interactive Terminal State
  const [terminalLogs, setTerminalLogs] = useState<TerminalLogEntry[]>([
    {
      id: 'init_1',
      type: 'system',
      text: '=== Chanakya University Interactive Cloud Sandbox (Linux x86_64) ===\n'
    },
    {
      id: 'init_2',
      type: 'system',
      text: 'Runtimes: Python 3.12, OpenJDK 21, GCC 13.2, Node.js 20\nType "run" or click Run in Sandbox to execute. Input requests prompt directly in this terminal!\n'
    }
  ]);
  const [isTerminalRunning, setIsTerminalRunning] = useState(false);
  const [isWaitingForInput, setIsWaitingForInput] = useState(false);
  const [inputPromptText, setInputPromptText] = useState('');
  const [executionMetrics, setExecutionMetrics] = useState<{ timeMs?: number; memoryMb?: number; exitCode?: number } | undefined>();
  const [previewMode, setPreviewMode] = useState<'terminal' | 'preview'>('preview');
  const pendingInputResolverRef = useRef<((val: string) => void) | null>(null);
  const isCancelledRef = useRef(false);

  // Instructor Marks Toggle & Submission
  const [isCountedForMarks, setIsCountedForMarks] = useState<boolean>(true);
  const [awardedMarks, setAwardedMarks] = useState<number | null>(null);
  const [submissionReceipt, setSubmissionReceipt] = useState<string | null>(null);

  // Active Coding Time Tracking
  const [sessionSeconds, setSessionSeconds] = useState(185);
  const [isActiveTyping, setIsActiveTyping] = useState(false);
  const [lastKeystrokeTime, setLastKeystrokeTime] = useState<number>(Date.now());
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [draftStatus, setDraftStatus] = useState<'saved' | 'saving' | 'offline'>('saved');
  const [lastSubmissionQuality, setLastSubmissionQuality] = useState<number | null>(null);
  const [learningInsights, setLearningInsights] = useState<any | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [fileName, setFileName] = useState('main.py');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const languageExtension = (language: SupportedLanguage) => ({
    python: 'py', java: 'java', cpp: 'cpp', c: 'c', csharp: 'cs', javascript: 'js', typescript: 'ts', html: 'html', css: 'css', sql: 'sql', php: 'php', go: 'go', rust: 'rs', kotlin: 'kt', swift: 'swift', dart: 'dart', ruby: 'rb', r: 'r', bash: 'sh', lua: 'lua'
  }[language] || 'txt');

  const updateFileNameForLanguage = (language: SupportedLanguage) => {
    setFileName(`main.${languageExtension(language)}`);
  };

  const handleNewFile = () => {
    setCode('');
    setFileName(`main.${languageExtension(lang)}`);
    setTerminalLogs([]);
    setTestResults(null);
    setAwardedMarks(null);
    setSubmissionReceipt(null);
    setOpenMenu(null);
    showToast('New CodeArena file created');
  };

  const handleOpenFile = () => {
    fileInputRef.current?.click();
    setOpenMenu(null);
  };

  const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCode(String(reader.result || ''));
      setFileName(file.name);
      showToast(`${file.name} opened`);
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const downloadSource = (saveAsName?: string) => {
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = saveAsName || fileName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  const handleSaveFile = () => {
    downloadSource(fileName);
    setDraftStatus('saved');
    setOpenMenu(null);
    showToast(`${fileName} saved`);
  };

  const handleSaveAs = () => {
    const requested = window.prompt('Save file as:', fileName);
    if (!requested?.trim()) return;
    const nextName = requested.trim().includes('.') ? requested.trim() : `${requested.trim()}.${languageExtension(lang)}`;
    setFileName(nextName);
    downloadSource(nextName);
    setOpenMenu(null);
    showToast(`${nextName} saved`);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        handleSaveFile();
      }
      if (event.key === 'Escape') setOpenMenu(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Load subjects and problems
  useEffect(() => {
    codeArenaApi.learningInsights().then(setLearningInsights).catch(() => setLearningInsights(null));
    judgeService.getSubjects().then(subjs => {
      setSubjects(subjs);
      const currentSubj = subjs.find(s => s.code === selectedSubjectCode) || subjs[0];
      if (currentSubj) {
        loadProblemsForSubject(currentSubj.id, currentSubj.primaryLanguage);
      }
    });
  }, []);

  const restoreDraft = async (problemId?: string) => {
    try {
      const draft = await codeArenaApi.drafts({ semester: '2026', subjectCode: selectedSubjectCode, problemId, language: lang });
      if (draft?.code) { setCode(draft.code); setDraftStatus('saved'); }
    } catch { setDraftStatus('offline'); }
  };

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      if (!code.trim()) return;
      setDraftStatus('saving');
      try {
        await codeArenaApi.saveDraft({ semester: '2026', subjectCode: selectedSubjectCode, problemId: ideMode === 'assignment' ? selectedProblem?.id : undefined, language: lang, code });
        setDraftStatus('saved');
      } catch { setDraftStatus('offline'); }
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [code, selectedSubjectCode, selectedProblem?.id, lang, ideMode]);

  const loadProblemsForSubject = async (subjectId: string, preferredLang: SupportedLanguage) => {
    const probs = await judgeService.getProblems(subjectId);
    setProblems(probs);
    if (probs.length > 0) {
      setSelectedProblem(probs[0]);
      restoreDraft(ideMode === 'assignment' ? probs[0].id : undefined);
      if (ideMode === 'assignment') {
        setCode(probs[0].starterCodes[preferredLang] || probs[0].starterCodes.python || '');
      }
    }
  };

  const handleSubjectChange = (newCode: string) => {
    setSelectedSubjectCode(newCode);
    const targetSubj = subjects.find(s => s.code === newCode);
    if (targetSubj) {
      const targetLang = targetSubj.primaryLanguage;
      setLang(targetLang);
      loadProblemsForSubject(targetSubj.id, targetLang);
      setTestResults(null);
      setAwardedMarks(null);
      setSubmissionReceipt(null);
    }
  };

  const handleProblemChange = (probId: string) => {
    const prob = problems.find(p => p.id === probId);
    if (prob) {
      setSelectedProblem(prob);
      setCode(prob.starterCodes[lang] || '');
      setTestResults(null);
      setAwardedMarks(null);
      setSubmissionReceipt(null);
    }
  };

  const handleLangChange = (newLang: SupportedLanguage) => {
    setLang(newLang);
    updateFileNameForLanguage(newLang);
    if (ideMode === 'playground') {
      setCode(PLAYGROUND_BOILERPLATES[newLang]);
    } else if (selectedProblem) {
      setCode(selectedProblem.starterCodes[newLang] || PLAYGROUND_BOILERPLATES[newLang]);
    }
  };

  const handleResetBoilerplate = () => {
    if (ideMode === 'playground') {
      setCode(PLAYGROUND_BOILERPLATES[lang]);
    } else if (selectedProblem) {
      setCode(selectedProblem.starterCodes[lang] || PLAYGROUND_BOILERPLATES[lang]);
    }
    showToast('Code editor reset to official boilerplate template.');
  };

  // Switch between Playground and Assignment modes
  const handleSwitchMode = (mode: 'playground' | 'assignment') => {
    setIdeMode(mode);
    if (mode === 'playground') {
      setCode(PLAYGROUND_BOILERPLATES[lang]);
    } else if (selectedProblem) {
      setCode(selectedProblem.starterCodes[lang] || PLAYGROUND_BOILERPLATES[lang]);
    }
  };

  // Interactive Terminal Handlers & Streaming Session Ref
  const activeSessionRef = useRef<InteractiveSession | null>(null);

  const handleSendTerminalInput = (inputVal: string) => {
    setTerminalLogs(prev => [
      ...prev,
      { id: `in_${Date.now()}_${Math.random()}`, type: 'stdin', text: inputVal }
    ]);

    if (isTerminalRunning && activeSessionRef.current) {
      activeSessionRef.current.sendInput(inputVal);
      if (isWaitingForInput) {
        setIsWaitingForInput(false);
        setInputPromptText('');
      }
      if (pendingInputResolverRef.current) {
        const resolve = pendingInputResolverRef.current;
        pendingInputResolverRef.current = null;
        resolve(inputVal);
      }
    } else if (isWaitingForInput && pendingInputResolverRef.current) {
      setIsWaitingForInput(false);
      setInputPromptText('');
      const resolve = pendingInputResolverRef.current;
      pendingInputResolverRef.current = null;
      resolve(inputVal);
    } else if (!isTerminalRunning) {
      const trimmed = inputVal.trim();
      if (!trimmed) return;

      if (trimmed === 'clear') {
        setTerminalLogs([]);
      } else if (trimmed === 'run' || trimmed === 'python main.py' || trimmed === 'node main.js') {
        handleExecutePlayground();
      } else if (trimmed === 'help') {
        setTerminalLogs(prev => [
          ...prev,
          {
            id: `help_${Date.now()}`,
            type: 'system',
            text: 'Available Commands:\n  run                Execute code in editor\n  clear              Clear terminal display buffer\n  help               Display this help guide\n'
          }
        ]);
      } else {
        setTerminalLogs(prev => [
          ...prev,
          { id: `err_${Date.now()}`, type: 'stderr', text: `bash: ${trimmed}: command not found. Type 'run' or 'help'.\n` }
        ]);
      }
    }
  };

  const handleStopExecution = () => {
    isCancelledRef.current = true;
    if (activeSessionRef.current) {
      activeSessionRef.current.stop();
      activeSessionRef.current = null;
    }
    if (pendingInputResolverRef.current) {
      pendingInputResolverRef.current('');
      pendingInputResolverRef.current = null;
    }
    setIsWaitingForInput(false);
    setIsTerminalRunning(false);
    setRunning(false);
    setTerminalLogs(prev => [
      ...prev,
      { id: `stop_${Date.now()}`, type: 'stderr', text: '^C\n[Process terminated by user SIGINT]\n' }
    ]);
  };

  // Run in Open Playground / Terminal
  const handleExecutePlayground = async () => {
    if (activeSessionRef.current) {
      await activeSessionRef.current.stop();
      activeSessionRef.current = null;
    }

    setRunning(true);
    setIsTerminalRunning(true);
    isCancelledRef.current = false;

    const runCmd = lang === 'python' ? 'python3 -u main.py' : lang === 'javascript' ? 'node main.js' : lang === 'java' ? 'java Main.java' : `./main`;

    setTerminalLogs(prev => [
      ...prev,
      { id: `run_${Date.now()}`, type: 'prompt', text: `chanakya@sandbox:~$ ${runCmd}` }
    ]);

    const handleOutput = (chunk: string, isError: boolean = false) => {
      if (isCancelledRef.current) return;
      setTerminalLogs(prev => [
        ...prev,
        { id: `out_${Date.now()}_${Math.random()}`, type: isError ? 'stderr' : 'stdout', text: chunk }
      ]);
    };

    const handlePromptInput = async (promptMsg: string): Promise<string> => {
      if (isCancelledRef.current) return '';
      setIsWaitingForInput(true);
      setInputPromptText(promptMsg);
      return new Promise<string>((resolve) => {
        pendingInputResolverRef.current = resolve;
      });
    };

    const handleExit = (exitCode: number, timeMs: number) => {
      setRunning(false);
      setIsTerminalRunning(false);
      setIsWaitingForInput(false);
      activeSessionRef.current = null;
      setExecutionMetrics({ timeMs, exitCode });
      setTerminalLogs(prev => [
        ...prev,
        {
          id: `done_${Date.now()}`,
          type: 'system',
          text: `[Process completed with exit code ${exitCode} in ${timeMs}ms]\n`
        }
      ]);
    };

    try {
      const session = await CodeExecutionService.startInteractiveSession(
        lang,
        code,
        customStdin,
        handleOutput,
        handlePromptInput,
        handleExit
      );
      activeSessionRef.current = session;
    } catch (e: any) {
      handleOutput(`Execution Error: ${e.message || String(e)}\n`, true);
      handleExit(1, 0);
    }
  };

  // Run in Assignment / Test Suite Mode
  const handleExecuteAssignment = async () => {
    if (!selectedProblem) return;
    setRunning(true);
    setIsTerminalRunning(true);

    setTerminalLogs(prev => [
      ...prev,
      { id: `test_init_${Date.now()}`, type: 'prompt', text: `chanakya@sandbox:~$ ./cu_test_runner --problem=${selectedProblem.id} --lang=${lang}` },
      { id: `test_msg_${Date.now()}`, type: 'system', text: `[Ephemeral gVisor Container Sandboxed Runner]\nEvaluating code against test cases...\n` }
    ]);

    try {
      const results = await onRunCode(lang, code, selectedProblem.id);
      setTestResults(results);

      // Stream each test case verdict to terminal
      for (const r of results) {
        setTerminalLogs(prev => [
          ...prev,
          {
            id: `tc_stream_${r.id}_${Date.now()}`,
            type: r.passed ? 'stdout' : 'stderr',
            text: `  Case #${r.testCaseNumber} [${r.isHidden ? 'Hidden Evaluation' : 'Sample Case'}] -> ${r.verdict} (${r.executionTimeMs}ms)\n`
          }
        ]);
      }

      // Compute Marks if counted for marks
      const passedCount = results.filter(r => r.passed).length;
      const totalCases = results.length || 1;
      const allPassed = passedCount === totalCases;

      if (isCountedForMarks) {
        const submission = await judgeService.submitCode(selectedProblem.id, lang, code);
        const marks = submission?.marks ?? Math.round((passedCount / totalCases) * 10 * 10) / 10;
        setAwardedMarks(marks);
        setSubmissionReceipt(submission?.submissionId || `CU-SUB-${Date.now()}`);
        setLastSubmissionQuality(submission?.quality?.score ?? null);
        codeArenaApi.learningInsights().then(setLearningInsights).catch(() => {});
        setTerminalLogs(prev => [
          ...prev,
          {
            id: `tc_summary_${Date.now()}`,
            type: allPassed ? 'stdout' : 'stderr',
            text: `\n[VERDICT]: ${passedCount}/${totalCases} Test Cases Passed. Marks Awarded: ${marks} / 10\n`
          }
        ]);
      } else {
        setTerminalLogs(prev => [
          ...prev,
          {
            id: `tc_summary_${Date.now()}`,
            type: allPassed ? 'stdout' : 'stderr',
            text: `\n[VERDICT]: ${passedCount}/${totalCases} Test Cases Passed (Practice Mode).\n`
          }
        ]);
      }
    } finally {
      setRunning(false);
      setIsTerminalRunning(false);
    }
  };

  const handleSubmitToGradebook = () => {
    if (awardedMarks === null) return;
    
    unifiedAcademicService.recordLabSubmission({
      id: submissionReceipt || `CU-SUB-${Date.now()}`,
      usn: user?.employeeId || '1CU23CS001',
      studentName: user?.name || 'Aarav Sharma',
      courseCode: selectedSubjectCode === 'PRG301' ? 'CS301' : selectedSubjectCode,
      problemTitle: selectedProblem?.title || 'Lab Problem',
      awardedMarks: awardedMarks || 10,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    showToast(`Submission ${submissionReceipt} officially recorded! ${awardedMarks}/10 marks dispatched to FA-2 Continuous Lab Evaluation.`);
  };

  // Keystroke timer
  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode(e.target.value);
    setLastKeystrokeTime(Date.now());
  };

  // Active Coding Timer
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const isTypingRecently = now - lastKeystrokeTime < 60000;
      setIsActiveTyping(isTypingRecently);

      setSessionSeconds(prev => {
        const next = prev + 1;
        if (next % 60 === 0 && isTypingRecently) {
          judgeService.logStudentCodingTime(
            user?.employeeId || '24MCA003',
            selectedSubjectCode,
            1
          );
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [lastKeystrokeTime, selectedSubjectCode, user]);

  const formatTime = (secs: number) => {
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentSubject = subjects.find(s => s.code === selectedSubjectCode);
  const lineCount = Math.max(1, code.split('\n').length);
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  const menuItems: Record<string, Array<{ label: string; action: () => void; shortcut?: string; icon?: React.ReactNode }>> = {
    File: [
      { label: 'New File', action: handleNewFile, shortcut: 'Ctrl+N', icon: <FilePlus size={13} /> },
      { label: 'Open File', action: handleOpenFile, shortcut: 'Ctrl+O', icon: <FolderOpen size={13} /> },
      { label: 'Open Folder', action: handleOpenFile, icon: <Folder size={13} /> },
      { label: 'Autosave', action: () => { setDraftStatus('saving'); showToast('Cloud autosave is enabled'); setOpenMenu(null); }, icon: <SaveAll size={13} /> },
      { label: 'Save', action: handleSaveFile, shortcut: 'Ctrl+S', icon: <Save size={13} /> },
      { label: 'Save As…', action: handleSaveAs, icon: <Download size={13} /> },
    ],
    View: [
      { label: 'Toggle Practice Area', action: () => { showToast('Practice Area is visible on the left'); setOpenMenu(null); }, icon: <PanelLeft size={13} /> },
      { label: 'Toggle Terminal', action: () => { showToast('Terminal Output is visible on the right'); setOpenMenu(null); }, icon: <Terminal size={13} /> },
    ],
    Run: [
      { label: 'Run Code', action: handleExecutePlayground, shortcut: 'Ctrl+Enter', icon: <Play size={13} /> },
      { label: 'Submit & Run Tests', action: handleExecuteAssignment, icon: <CheckCircle2 size={13} /> },
    ],
    Terminal: [
      { label: 'Clear Terminal', action: () => { setTerminalLogs([]); setOpenMenu(null); }, icon: <X size={13} /> },
      { label: 'Copy Terminal Output', action: () => { navigator.clipboard?.writeText(terminalLogs.map(l => l.text).join('')); setOpenMenu(null); showToast('Terminal output copied'); }, icon: <Copy size={13} /> },
    ],
    Help: [
      { label: 'Keyboard Shortcuts', action: () => { showToast('Ctrl+S Save • Ctrl+Enter Run • Esc Close menu'); setOpenMenu(null); }, icon: <Settings size={13} /> },
      { label: 'CodeArena Sandbox', action: () => { showToast('Server-authoritative sandbox execution enabled'); setOpenMenu(null); }, icon: <ShieldAlert size={13} /> },
    ]
  };

  return (
    <div className="space-y-4">
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-[60] flex items-center gap-2 px-4 py-3 rounded-xl bg-cu-navy text-white text-xs font-semibold shadow-2xl border border-cu-gold">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      <input ref={fileInputRef} type="file" accept=".py,.java,.cpp,.c,.js,.ts,.go,.rs,.sql,.txt" onChange={handleFileSelected} className="hidden" />

      {/* Screenshot-matched CodeArena Lab Station IDE */}
      <section className="rounded-[14px] overflow-hidden border border-[#b9c0c9] bg-[#f4f5f7] shadow-2xl">
        {/* Desktop-style application title / menu bar */}
        <div className="h-9 bg-[#e9ebee] border-b border-[#c4c8ce] flex items-center px-3 text-[12px] text-[#20252b] select-none">
          <div className="font-semibold mr-5 text-[#26313d]">CodeArena Lab Station</div>
          <div className="flex items-center gap-0.5">
            {Object.keys(menuItems).map(menu => (
              <div key={menu} className="relative">
                <button
                  onClick={() => setOpenMenu(openMenu === menu ? null : menu)}
                  className={`px-2.5 py-1 rounded-[3px] hover:bg-white/80 ${openMenu === menu ? 'bg-white shadow-sm' : ''}`}
                >{menu}</button>
                {openMenu === menu && (
                  <div className="absolute left-0 top-7 z-50 min-w-[205px] rounded-md border border-[#c5c9cf] bg-white shadow-xl py-1">
                    {menuItems[menu].map(item => (
                      <button key={item.label} onClick={item.action} className="w-full flex items-center gap-2 px-3 py-2 text-left text-[11px] hover:bg-[#edf3fb] text-[#303842]">
                        <span className="w-4 text-[#52606d]">{item.icon}</span>
                        <span className="flex-1">{item.label}</span>
                        {item.shortcut && <span className="text-[9px] text-slate-400">{item.shortcut}</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-2 text-[10px] text-slate-500">
            <span className="hidden sm:inline">{draftStatus === 'saved' ? 'Autosaved' : draftStatus === 'saving' ? 'Saving…' : 'Database unavailable'}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" title="CodeArena connected" />
            <Minus size={12} /><Square size={10} /><X size={12} />
          </div>
        </div>

        {/* Toolbar */}
        <div className="h-10 bg-white border-b border-[#cfd4da] flex items-center px-2.5 gap-2">
          <button onClick={handleNewFile} title="New file" className="p-1.5 rounded hover:bg-slate-100 text-slate-600"><FilePlus size={15} /></button>
          <button onClick={handleOpenFile} title="Open file" className="p-1.5 rounded hover:bg-slate-100 text-slate-600"><FolderOpen size={15} /></button>
          <button onClick={handleSaveFile} title="Save" className="p-1.5 rounded hover:bg-slate-100 text-slate-600"><Save size={15} /></button>
          <div className="h-5 w-px bg-slate-200" />
          <button onClick={handleResetBoilerplate} title="Reset code" className="p-1.5 rounded hover:bg-slate-100 text-slate-600"><RotateCcw size={14} /></button>
          <div className="h-5 w-px bg-slate-200" />
          <span className="text-[11px] font-semibold text-slate-500">Practice Area</span>
          <div className="ml-auto flex items-center gap-2">
            <select value={lang} onChange={e => handleLangChange(e.target.value as SupportedLanguage)} className="h-7 min-w-[145px] border border-slate-300 rounded bg-white px-2 text-[11px] font-semibold text-slate-700 focus:outline-none">
              {CODEARENA_SUPPORTED_LANGUAGES.map(item => (
                <option key={item.key} value={item.key}>{item.label}</option>
              ))}
            </select>
            <button onClick={handleExecutePlayground} disabled={running} className="inline-flex items-center gap-1.5 h-7 px-3 rounded bg-[#1f6f43] hover:bg-[#185b36] disabled:opacity-50 text-white text-[11px] font-bold shadow-sm">
              <Play size={11} className="fill-white" /> {running ? 'Running…' : 'Run'}
            </button>
          </div>
        </div>

        {/* Main workstation: file explorer + editor + terminal output */}
        <div className="grid grid-cols-1 lg:grid-cols-[190px_minmax(0,1fr)_360px] min-h-[620px]">
          {/* Practice Area / Explorer */}
          <aside className="bg-[#eef0f2] border-r border-[#c7ccd2] p-2.5 text-[11px]">
            <div className="flex items-center justify-between px-1 py-1.5 mb-1 text-[10px] font-bold tracking-wide text-slate-600 uppercase">
              <span>Practice Area</span><Search size={12} />
            </div>
            <div className="rounded border border-[#d4d8dd] bg-white overflow-hidden">
              <div className="px-2.5 py-2 bg-[#f7f8f9] border-b border-[#e1e4e8] font-semibold text-slate-700 flex items-center gap-1.5"><Folder size={13} /> CodeArena</div>
              <div className="p-1.5">
                <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded bg-[#dfeaf8] text-[#163e69] font-semibold text-left">
                  <FileCode size={13} /> {fileName}
                </button>
              </div>
            </div>

            <div className="mt-3 rounded border border-[#d4d8dd] bg-white p-2.5 space-y-2.5">
              <div className="font-bold text-slate-700">Lab Controls</div>
              <button onClick={handleNewFile} className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-100 text-left"><FilePlus size={13} /> New file</button>
              <button onClick={handleOpenFile} className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-100 text-left"><Upload size={13} /> Open file</button>
              <button onClick={handleSaveFile} className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-100 text-left"><Save size={13} /> Save</button>
              <button onClick={handleSaveAs} className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-100 text-left"><Download size={13} /> Save as</button>
              <div className="pt-1 border-t border-slate-100 text-[10px] text-slate-500">☁ {draftStatus === 'saved' ? 'Cloud autosave active' : draftStatus === 'saving' ? 'Saving to cloud…' : 'Database unavailable — edits are not persisted'}</div>
            </div>

            <div className="mt-3 rounded border border-[#d4d8dd] bg-white p-2.5 space-y-2 text-[10px]">
              <div className="font-bold text-slate-700">Language</div>
              <div className="flex items-center justify-between"><span>{lang.toUpperCase()}</span><span className="text-emerald-700 font-semibold">Ready</span></div>
              <div className="text-slate-400">Sandbox execution enabled</div>
            </div>
          </aside>

          {/* Code editor */}
          <main className="min-w-0 bg-[#fbfbfc] border-r border-[#c7ccd2] flex flex-col">
            <div className="h-8 bg-[#f1f2f4] border-b border-[#d7dbe0] flex items-center px-3 gap-2 text-[11px]">
              <FileCode size={13} className="text-[#2f6f9f]" />
              <span className="font-semibold text-slate-700">{fileName}</span>
              <span className="text-slate-400">— coding</span>
              <span className="ml-auto text-[9px] text-slate-400">UTF-8 • LF</span>
            </div>
            <div className="flex-1 overflow-auto bg-white">
              <div className="min-h-full flex font-mono text-[12px] leading-[20px]">
                <div className="w-12 shrink-0 select-none text-right pr-3 pt-3 text-slate-400 bg-[#f6f7f8] border-r border-[#e5e7ea]">
                  {lineNumbers.map(n => <div key={n} className="h-[20px]">{n}</div>)}
                </div>
                <textarea
                  value={code}
                  onChange={handleCodeChange}
                  onKeyDown={e => {
                    if (e.key === 'Tab') { e.preventDefault(); const target = e.currentTarget; const start = target.selectionStart; const end = target.selectionEnd; const next = code.slice(0, start) + '    ' + code.slice(end); setCode(next); requestAnimationFrame(() => { target.selectionStart = target.selectionEnd = start + 4; }); }
                    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); handleExecutePlayground(); }
                  }}
                  spellCheck={false}
                  className="flex-1 min-h-[580px] w-full resize-none border-0 outline-none bg-white text-[#24303c] p-3 font-mono text-[12px] leading-[20px] whitespace-pre overflow-auto"
                  placeholder="Write your code here..."
                />
              </div>
            </div>
            <div className="h-7 border-t border-[#d8dce1] bg-[#f1f2f4] px-3 flex items-center gap-4 text-[9px] text-slate-500">
              <span>Ln {lineCount}, Col 1</span><span>Spaces: 4</span><span>Language: {lang}</span><span className="ml-auto">{isActiveTyping ? '● Editing' : 'Ready'}</span>
            </div>
          </main>

          {/* Terminal / Safe Web Preview Output */}
          <section className="bg-[#101722] flex flex-col min-h-[620px]">
            <div className="h-9 bg-[#182231] border-b border-[#2b3747] px-3 flex items-center justify-between text-[11px] text-slate-200">
              <div className="flex items-center gap-2 font-semibold">
                <Terminal size={13} className="text-emerald-400" />
                {(lang === 'html' || lang === 'css') ? 'Output & Web Sandbox Preview' : 'Terminal (Output)'}
              </div>
              <div className="flex items-center gap-2">
                {(lang === 'html' || lang === 'css') && (
                  <div className="flex items-center gap-1 bg-[#101722] p-0.5 rounded border border-[#2b3747] text-[10px]">
                    <button
                      type="button"
                      onClick={() => setPreviewMode('preview')}
                      className={`px-2 py-0.5 rounded font-medium transition ${previewMode === 'preview' ? 'bg-[#0284c7] text-white' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                      Safe Preview
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewMode('terminal')}
                      className={`px-2 py-0.5 rounded font-medium transition ${previewMode === 'terminal' ? 'bg-[#0284c7] text-white' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                      Terminal
                    </button>
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-slate-500">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
              </div>
            </div>
            <div className="flex-1 min-h-0">
              {(lang === 'html' || lang === 'css') && previewMode === 'preview' ? (
                <div className="w-full h-full p-2 bg-[#0c121b]">
                  <SafeHtmlPreview sourceCode={code} />
                </div>
              ) : (
                <InteractiveTerminal
                  logs={terminalLogs}
                  isRunning={isTerminalRunning}
                  isWaitingForInput={isWaitingForInput}
                  inputPromptText={inputPromptText}
                  onSendInput={handleSendTerminalInput}
                  onRunCode={handleExecutePlayground}
                  onStopCode={handleStopExecution}
                  onClear={() => setTerminalLogs([])}
                  activeLanguage={lang}
                  executionMetrics={executionMetrics}
                  embedded
                />
              )}
            </div>
          </section>
        </div>

        {/* Assignment / problem strip */}
        <div className="bg-[#f0f2f4] border-t border-[#c7ccd2] px-3 py-2.5 flex flex-col xl:flex-row gap-3 xl:items-center text-[10px]">
          <div className="flex items-center gap-2 font-semibold text-slate-700"><BookOpen size={13} /> Practice / Assignment</div>
          <select value={selectedSubjectCode} onChange={e => handleSubjectChange(e.target.value)} className="h-7 bg-white border border-slate-300 rounded px-2 min-w-[190px] text-[10px]">
            {subjects.map(s => <option key={s.id} value={s.code}>{s.code}: {s.name}</option>)}
          </select>
          <select value={selectedProblem?.id || ''} onChange={e => handleProblemChange(e.target.value)} className="h-7 bg-white border border-slate-300 rounded px-2 min-w-[210px] text-[10px]">
            <option value="">Free Practice</option>
            {problems.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
          </select>
          <div className="flex items-center gap-2 text-slate-500"><Clock size={12} /> {formatTime(sessionSeconds)}</div>
          <span className="text-slate-400">{currentSubject?.facultyName ? `Faculty: ${currentSubject.facultyName}` : 'Open practice workspace'}</span>
          <div className="ml-auto flex items-center gap-2">
            <label className="flex items-center gap-1.5"><input type="checkbox" checked={isCountedForMarks} onChange={e => setIsCountedForMarks(e.target.checked)} /> Count for marks</label>
            <button onClick={handleExecuteAssignment} disabled={running || !selectedProblem} className="h-7 px-3 rounded bg-[#0a1e3b] text-white font-bold disabled:opacity-40">Submit &amp; Run</button>
          </div>
        </div>
      </section>

      {/* Learning / verdict information remains available below the redesigned workstation */}
      {learningInsights && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
          <div><div className="text-slate-500">Learning Hours</div><strong className="text-lg text-slate-900">{learningInsights.totalLearningHours?.toFixed ? learningInsights.totalLearningHours.toFixed(1) : learningInsights.totalLearningHours}</strong><div className="text-[10px] text-slate-400">Target {learningInsights.minimumLearningHours}h</div></div>
          <div><div className="text-slate-500">Accuracy</div><strong className="text-lg text-slate-900">{learningInsights.accuracy}%</strong><div className="text-[10px] text-slate-400">Target {learningInsights.minimumAccuracy}%</div></div>
          <div><div className="text-slate-500">Code Quality</div><strong className="text-lg text-slate-900">{learningInsights.quality}/100</strong><div className="text-[10px] text-slate-400">Target {learningInsights.minimumQuality}</div></div>
          <div><div className="text-slate-500">Remedial Practice</div><strong className={learningInsights.remedialRequired ? 'text-amber-700' : 'text-emerald-700'}>{learningInsights.remedialRequired ? 'Required' : 'Cleared'}</strong><div className="text-[10px] text-slate-400">Weak-topic detection active</div></div>
          <div><div className="text-slate-500">Exam Eligibility</div><strong className={learningInsights.examEligible ? 'text-emerald-700' : 'text-rose-700'}>{learningInsights.examEligible ? 'Eligible' : 'Not Yet'}</strong><div className="text-[10px] text-slate-400">Faculty can review the criteria</div></div>
        </div>
      )}

      {ideMode === 'assignment' && testResults && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2"><span className="font-bold text-xs text-slate-900">Test Evaluation Verdict:</span>{testResults.every(r => r.passed) ? <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-300"><CheckCircle2 size={13} /> ACCEPTED</span> : <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-800 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-300"><AlertCircle size={13} /> PARTIAL / REJECTED</span>}</div>
            {isCountedForMarks && awardedMarks !== null && <div className="flex items-center gap-3"><span className="text-xs font-bold text-cu-navy bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200">Awarded: {awardedMarks} / 10 Marks</span><button onClick={handleSubmitToGradebook} className="px-3 py-1 rounded-xl bg-cu-navy text-white text-xs font-bold flex items-center gap-1.5"><Send size={12} /> Submit to Gradebook</button></div>}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">{testResults.map(tr => <div key={tr.id} className={`p-2.5 rounded-xl border font-mono ${tr.passed ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900' : 'bg-rose-50/50 border-rose-200 text-rose-900'}`}><div className="flex items-center justify-between font-bold"><span>Case #{tr.testCaseNumber}</span><span>{tr.passed ? 'PASS' : 'FAIL'}</span></div><div className="text-[10px] text-slate-500 mt-1">{tr.executionTimeMs}ms • {Math.round(tr.memoryKb / 1024)}MB</div></div>)}</div>
          {lastSubmissionQuality !== null && <div className="text-[11px] text-slate-600">Code quality score: <strong>{lastSubmissionQuality}/100</strong></div>}
          {submissionReceipt && <div className="text-[11px] text-gray-500 font-mono text-right">Submission Receipt: <span className="font-bold text-cu-navy">{submissionReceipt}</span></div>}
        </div>
      )}
    </div>
  );
};

export default MonacoWebIDE;

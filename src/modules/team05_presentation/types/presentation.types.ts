// Team 05 (EduPresent AI) Domain Types
// Aligned with Insight_Presenter architecture & PostgreSQL schema

export interface EyeContactSegment {
  start: number; // seconds
  end: number;   // seconds
  score: number; // 0.0 (no eye contact) to 1.0 (direct lens contact)
}

export interface FillerOccurrence {
  id: string;
  word: string; // 'um' | 'uh' | 'like' | 'you know' | 'actually' | 'basically' | 'so'
  time: number; // timestamp in seconds
  contextSnippet: string;
}

export interface CoachingTip {
  time: number; // seconds
  title: string;
  category: 'EYE_CONTACT' | 'PACING' | 'FILLER_WORD' | 'SLIDE_SYNC' | 'BODY_POSTURE';
  description: string;
  severity: 'TIP' | 'WARNING' | 'PRAISE';
}

export interface RubricCriterion {
  id: string;
  name: string;
  weightPct: number;
  score: number; // 0 - 100
  feedback: string;
  rubricTier: 'Exemplary' | 'Proficient' | 'Developing' | 'Inadequate';
}

export interface SpeechMetrics {
  wordsPerMinute: number; // optimal: 130 - 160 WPM
  fillerWordCount: number;
  fillerWordList: { word: string; count: number }[];
  clarityPercentage: number;
  pitchVarianceHz: number;
}

export interface VisualGazeMetrics {
  cameraEyeContactPercentage: number;
  postureStabilityPercentage: number;
  nervousnessIndicator: 'LOW' | 'MODERATE' | 'ELEVATED';
  headPoseDeviationCount: number;
}

export interface VivaQuestion {
  id: string;
  question: string;
  sourceTranscriptSnippet: string;
  difficulty: 'STANDARD' | 'PROBING' | 'ADVANCED';
  suggestedAnswerPoints: string[];
}

export interface RubricEvaluationDossier {
  contentScore: number; // /30
  deliveryScore: number; // /25
  visualAidsScore: number; // /20
  timeScore: number; // /10
  qaScore: number; // /15
  totalScore: number; // /100
  grade: string;
  strengths: string;
  improvements: string;
  transcriptSample: string;
}

export interface InsightPresentationAnalysis {
  sessionId: string;
  candidateName: string;
  candidateRoll: string;
  presentationTitle: string;
  durationSeconds: number;
  overallScore: number; // 0 - 100
  eyeContactScore: number; // 0 - 100
  pacingWpm: number;
  pacingStatus: 'OPTIMAL' | 'TOO_FAST' | 'TOO_SLOW';
  totalFillers: number;
  eyeContactSegments: EyeContactSegment[];
  fillerOccurrences: FillerOccurrence[];
  coachingTips: CoachingTip[];
  rubricCriteria: RubricCriterion[];
  executiveSummary: string;
  fullTranscript: { time: number; speaker: string; text: string }[];
}

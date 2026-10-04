// Team 05 (EduPresent AI) Resilient Service Layer
// Multi-modal AI speech analysis, gaze tracking metrics, and Insight Presenter multimodal engine.

import { CircuitBreaker } from '../../../core/resilience/CircuitBreaker';
import { IsolatedStorage } from '../../../core/resilience/IsolatedStorage';
import { 
  SpeechMetrics, 
  VisualGazeMetrics, 
  VivaQuestion, 
  RubricEvaluationDossier,
  InsightPresentationAnalysis 
} from '../types/presentation.types';

const storage = new IsolatedStorage('team05_presentation');

const INITIAL_SPEECH: SpeechMetrics = {
  wordsPerMinute: 142,
  fillerWordCount: 5,
  fillerWordList: [
    { word: 'um', count: 3 },
    { word: 'like', count: 2 },
    { word: 'actually', count: 1 }
  ],
  clarityPercentage: 94.2,
  pitchVarianceHz: 38
};

const INITIAL_GAZE: VisualGazeMetrics = {
  cameraEyeContactPercentage: 86.4,
  postureStabilityPercentage: 91.0,
  nervousnessIndicator: 'LOW',
  headPoseDeviationCount: 2
};

const INITIAL_VIVA: VivaQuestion[] = [
  {
    id: 'viva_1',
    question: 'You mentioned using Circuit Breakers for fault isolation. How does the system handle state transitions between OPEN and HALF_OPEN during network partitions?',
    sourceTranscriptSnippet: '"...we implemented client-side Circuit Breakers to prevent cascading failures..."',
    difficulty: 'PROBING',
    suggestedAnswerPoints: [
      'Configurable cooldown reset timer (10s)',
      'Probe requests sent in HALF_OPEN state',
      'Successful probe closes breaker; failed probe resets to OPEN'
    ]
  },
  {
    id: 'viva_2',
    question: 'How do you guarantee that high-speed facial recognition check-ins in the attendance kiosk cannot be spoofed using a recorded video playback on a tablet?',
    sourceTranscriptSnippet: '"...optical verification with 3D landmark blink checks..."',
    difficulty: 'ADVANCED',
    suggestedAnswerPoints: [
      'MediaPipe 468-point 3D facial mesh depth triangulation',
      'Infrared/multi-spectral reflection analysis',
      'Randomized challenge prompt (e.g. smile or tilt)'
    ]
  }
];

const INITIAL_DOSSIER: RubricEvaluationDossier = {
  contentScore: 28,
  deliveryScore: 23,
  visualAidsScore: 18,
  timeScore: 9.5,
  qaScore: 14,
  totalScore: 92.5,
  grade: 'Outstanding (O / A+)',
  strengths: 'Exceptional structural flow, articulate explanation of zero-cascading architecture, natural eye contact with camera lens.',
  improvements: 'Slide 7 was slightly text-dense; recommend converting architectural bullet points into a modular diagram.',
  transcriptSample: '"Good afternoon distinguished faculty and examiners. Today our team is demonstrating the UniSphere Autonomous Academic Ecosystem..."'
};

const INITIAL_INSIGHT_ANALYSIS: InsightPresentationAnalysis = {
  sessionId: 'pres_mca_viva_2026_09',
  candidateName: 'Arjun Kumar',
  candidateRoll: '24MCA003',
  presentationTitle: 'UniSphere: Autonomous High-Resilience Academic OS & Microservices Cloud',
  durationSeconds: 180,
  overallScore: 91,
  eyeContactScore: 84,
  pacingWpm: 144,
  pacingStatus: 'OPTIMAL',
  totalFillers: 6,
  eyeContactSegments: [
    { start: 0, end: 24, score: 0.92 },
    { start: 24, end: 42, score: 0.88 },
    { start: 42, end: 60, score: 0.42 }, // Looking down at notes
    { start: 60, end: 85, score: 0.89 },
    { start: 85, end: 105, score: 0.61 }, // Wandering gaze
    { start: 105, end: 135, score: 0.95 },
    { start: 135, end: 155, score: 0.74 },
    { start: 155, end: 180, score: 0.93 }
  ],
  fillerOccurrences: [
    { id: 'f1', word: 'um', time: 14, contextSnippet: '...so the principal motivation behind, um, this architecture was zero downtime...' },
    { id: 'f2', word: 'like', time: 38, contextSnippet: '...rather than having a monolith which, like, fails completely if one module crashes...' },
    { id: 'f3', word: 'uh', time: 54, contextSnippet: '...we opted for independent local storage caches, uh, to survive network severance...' },
    { id: 'f4', word: 'you know', time: 89, contextSnippet: '...in traditional campus systems, you know, when the main database locks during exam registration...' },
    { id: 'f5', word: 'actually', time: 122, contextSnippet: '...our load testing actually showed a 400% throughput boost on p99 latencies...' },
    { id: 'f6', word: 'basically', time: 164, contextSnippet: '...so basically that is how the five-second HMAC rotating QR ensures zero proxy check-ins...' }
  ],
  coachingTips: [
    {
      time: 14,
      title: 'Opening Vocal Pause Hesitation',
      category: 'FILLER_WORD',
      severity: 'TIP',
      description: 'Used "um" during the primary thesis statement. Take a silent breath between problem context and architectural statement instead of vocalizing pauses.'
    },
    {
      time: 48,
      title: 'Loss of Direct Camera Eye-Contact',
      category: 'EYE_CONTACT',
      severity: 'WARNING',
      description: 'Eye gaze dropped to notes for 8 consecutive seconds. Place key reference cue cards at lens level to maintain an authoritative executive connection.'
    },
    {
      time: 89,
      title: 'Conversational Slang in Defense',
      category: 'FILLER_WORD',
      severity: 'TIP',
      description: 'Phrase "you know" dilutes technical rigor before an academic jury. Substitute with formal transitions like "As observed in empirical campus deployment...".'
    },
    {
      time: 122,
      title: 'Excellent Empirical Evidence Articulation',
      category: 'SLIDE_SYNC',
      severity: 'PRAISE',
      description: 'Outstanding synchronicity between the slide benchmark chart and verbal explanation of p99 latency improvements.'
    },
    {
      time: 164,
      title: 'Pacing Acceleration in Conclusion',
      category: 'PACING',
      severity: 'TIP',
      description: 'Speech tempo rose to 172 WPM. Allow your final cryptographic QR slide to sink in with a deliberate, confident closing pace.'
    }
  ],
  rubricCriteria: [
    {
      id: 'rc_1',
      name: 'System Architecture & Technical Depth',
      weightPct: 30,
      score: 94,
      rubricTier: 'Exemplary',
      feedback: 'Command of decoupled circuit breaker patterns, PostgreSQL schema normalization, and WebRTC streaming is outstanding.'
    },
    {
      id: 'rc_2',
      name: 'Verbal Delivery, Articulation & Vocal Projection',
      weightPct: 25,
      score: 88,
      rubricTier: 'Proficient',
      feedback: 'Clear, crisp cadence. Minimal filler words (6 in 3 mins). Words per minute kept within ideal 130-160 bracket.'
    },
    {
      id: 'rc_3',
      name: 'Gaze Consistency, Posture & Audience Connection',
      weightPct: 25,
      score: 85,
      rubricTier: 'Proficient',
      feedback: '84% sustained eye contact across presentation. Wandering minimized to short slide transitions.'
    },
    {
      id: 'rc_4',
      name: 'Visual Slide Design, Clarity & Cognitive Load',
      weightPct: 20,
      score: 95,
      rubricTier: 'Exemplary',
      feedback: 'Slide typography is modern, architectural diagrams are clean with zero clutter, and data charts illustrate points precisely.'
    }
  ],
  executiveSummary: 'Arjun delivered a high-caliber capstone defense. The presentation demonstrated commanding technical fluency, lucid slide design, and a controlled cadence (144 WPM). The multi-modal analysis flagged brief note-reading between 0:42 and 0:60, but overall executive poise was exemplary.',
  fullTranscript: [
    { time: 0, speaker: 'Arjun Kumar', text: 'Good afternoon respected jury members and examiners. Today I am presenting UniSphere, our autonomous university operating system.' },
    { time: 14, speaker: 'Arjun Kumar', text: 'The principal motivation behind, um, this architecture was zero downtime during critical campus operations.' },
    { time: 38, speaker: 'Arjun Kumar', text: 'Rather than having a monolith which, like, fails completely if one module crashes, we engineered eight isolated micro-apps.' },
    { time: 54, speaker: 'Arjun Kumar', text: 'Each module has its own client-side fallback storage, uh, to survive unexpected network severance.' },
    { time: 75, speaker: 'Arjun Kumar', text: 'Moving on to the attendance biometric gate, we replace static physical registers with 5-second cryptographic rotating QR nonces.' },
    { time: 89, speaker: 'Arjun Kumar', text: 'In traditional campus systems, you know, when the main database locks during exam registration, students are blocked.' },
    { time: 110, speaker: 'Arjun Kumar', text: 'Here, the event bus guarantees eventual consistency across attendance, HRMS, and the automated hall ticket lock.' },
    { time: 122, speaker: 'Arjun Kumar', text: 'Our load testing actually showed a 400% throughput boost on p99 latencies under concurrent 10,000 student check-ins.' },
    { time: 145, speaker: 'Arjun Kumar', text: 'Finally, the code execution arena and multimodal presentation studio empower continuous objective skill auditing.' },
    { time: 164, speaker: 'Arjun Kumar', text: 'So basically that is how the five-second HMAC rotating QR ensures zero proxy check-ins. Thank you, and I look forward to your questions.' }
  ]
};

export class PresentationService {
  private dossierBreaker = new CircuitBreaker<RubricEvaluationDossier>({
    moduleId: 'presentation',
    operationName: 'fetchRubricDossier',
    fallbackSupplier: () => storage.getItem('dossier', INITIAL_DOSSIER)
  });

  public async getSpeechMetrics(): Promise<SpeechMetrics> {
    return storage.getItem('speech', INITIAL_SPEECH);
  }

  public async getGazeMetrics(): Promise<VisualGazeMetrics> {
    return storage.getItem('gaze', INITIAL_GAZE);
  }

  public async getVivaQuestions(): Promise<VivaQuestion[]> {
    return storage.getItem('viva', INITIAL_VIVA);
  }

  public async getRubricDossier(): Promise<RubricEvaluationDossier> {
    return this.dossierBreaker.execute(async () => {
      return storage.getItem('dossier', INITIAL_DOSSIER);
    });
  }

  public async getInsightAnalysis(): Promise<InsightPresentationAnalysis> {
    return storage.getItem('insight_analysis', INITIAL_INSIGHT_ANALYSIS);
  }

  public async triggerAiAudit(): Promise<RubricEvaluationDossier> {
    await new Promise(res => setTimeout(res, 800));
    return this.getRubricDossier();
  }
}

export const presentationService = new PresentationService();

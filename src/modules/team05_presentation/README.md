# Subsystem Specification: Team 05 - PresentAI (Viva & Presentation Evaluation)

## 1. Executive Summary & Functional Scope
PresentAI is an automated presentation diagnostics, speech forensics, and viva assessment platform. Built to support project evaluations, seminar defenses, and language lab training, PresentAI analyzes speech pace, filler word density, slide transitions, and generates adaptive Socratic viva questions based on student presentation topics.

### Key Capabilities
- **WebRTC Studio Recorder**: In-browser synchronized audio/video and screen capture with real-time waveform visualization.
- **Acoustic Speech Forensics**: Computational acoustic metrics assessing words-per-minute (WPM), pause cadence, and filler word frequency (um, uh, like, basically).
- **Automated Socratic Viva Generator**: Context-aware questions generated from presentation abstracts, testing fundamental comprehension and technical implementation.
- **Criterion-Based Rubric Scoring**: Multi-parameter evaluation matrix (Technical Depth, Communication, Slide Quality, Defense Integrity) with weighted aggregation.

---

## 2. Component Hierarchy & Module Layout
```
src/modules/team05_presentation/
|-- components/
|   |-- PresentationStudio.tsx   # WebRTC video capture and slide synchronization
|   |-- SpeechAnalytics.tsx      # Acoustic cadence, WPM, and filler word breakdown
|   |-- VivaQuestionEngine.tsx   # Socratic question generator and oral response recorder
|   \-- RubricEvaluator.tsx      # Multi-dimensional academic scoring rubric
|-- services/
|   \-- presentationService.ts   # Audio processing and AI viva generation service
|-- types/
|   \-- presentation.types.ts    # Presentation session contracts
|-- index.tsx                    # Subsystem entrypoint with ModuleErrorBoundary
\-- README.md                    # Technical specification and onboarding guide
```

---

## 3. Normalized Database Schema (PostgreSQL 16)
```sql
CREATE TABLE presentation_sessions (
    session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    course_code VARCHAR(16) NOT NULL,
    presentation_title VARCHAR(128) NOT NULL,
    duration_seconds INT NOT NULL,
    words_spoken_count INT DEFAULT 0,
    speech_rate_wpm NUMERIC(5, 2),
    filler_words_count INT DEFAULT 0,
    filler_word_percentage NUMERIC(4, 2),
    clarity_score NUMERIC(4, 2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE presentation_viva_items (
    item_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES presentation_sessions(session_id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    category VARCHAR(32) CHECK (category IN ('THEORETICAL_FOUNDATION', 'ARCHITECTURE_DECISION', 'IMPLEMENTATION_CHALLENGE', 'SCALABILITY')),
    student_answer_transcript TEXT,
    evaluator_marks NUMERIC(4, 2),
    evaluator_feedback TEXT
);
```

---

## 4. Resilience & Fault-Isolation Architecture
- **WebRTC Fallback**: In browsers lacking hardware media acceleration, studio switches to local audio recording mode without throwing fatal exceptions.
- **Fault Confinement**: AI transcript failures remain isolated within the speech analytics card, allowing examiners to grade manually without disruption.

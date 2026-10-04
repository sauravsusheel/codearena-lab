# Subsystem Specification: Team 02 - SmartAttendance & Geofence Verification

## 1. Executive Summary & Functional Scope
The SmartAttendance subsystem enforces tamper-proof academic presence verification across lecture halls, computer laboratories, and field seminars. By synthesizing high-entropy dynamic QR tokens, high-precision GPS geofencing, and client-side facial liveness detection, the system eliminates proxy attendance and provides deterministic computation of the 75% statutory eligibility threshold for university examinations.

### Key Capabilities
- **Rotating HMAC-SHA256 QR Console**: Cryptographically rotating QR codes with 5-second lifespan. Tokens are salted with server timestamps and session IDs to prevent screenshot replay.
- **Campus GPS Geofence Radar**: Ephemeral client-side geolocation validation restricting check-ins to within 250 meters of designated campus lecture blocks (Devanahalli Campus centroid).
- **Biometric Edge Liveness Kiosk**: Client-side face mesh landmark tracking and blink velocity evaluation, guaranteeing user physical presence without persisting raw video frames on disk.
- **Statutory 75% Exam Gate**: Live attendance percentage aggregation with real-time alerts for students whose presence falls below 75%, generating automated debarment flags for ExamShield.

---

## 2. Component Hierarchy & Module Layout
```
src/modules/team02_attendance/
|-- components/
|   |-- QRCodeConsole.tsx       # Rotating HMAC-SHA256 lecture token projector
|   |-- GeofenceRadar.tsx       # Haversine distance calculator and radius validator
|   |-- FaceLivenessKiosk.tsx   # Real-time facial vector and blink rate detector
|   \-- EligibilityGate.tsx     # 75% attendance audit and hall-ticket sanction tracker
|-- services/
|   \-- attendanceService.ts    # Resilient check-in dispatcher with offline storage queue
|-- types/
|   \-- attendance.types.ts     # Data contracts matching PostgreSQL schema
|-- index.tsx                   # Subsystem root with ModuleErrorBoundary
\-- README.md                   # Technical specification and onboarding guide
```

---

## 3. Normalized Database Schema (PostgreSQL 16)
```sql
CREATE TABLE attendance_sessions (
    session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_code VARCHAR(16) NOT NULL,
    faculty_id UUID NOT NULL,
    room_number VARCHAR(32) NOT NULL,
    latitude NUMERIC(9, 6) NOT NULL,
    longitude NUMERIC(9, 6) NOT NULL,
    geofence_radius_meters INT DEFAULT 250,
    session_start TIMESTAMPTZ NOT NULL,
    session_end TIMESTAMPTZ NOT NULL,
    secret_salt VARCHAR(64) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE attendance_logs (
    log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES attendance_sessions(session_id) ON DELETE CASCADE,
    student_id UUID NOT NULL,
    student_roll_number VARCHAR(32) NOT NULL,
    verification_mode VARCHAR(16) CHECK (verification_mode IN ('QR_HMAC', 'GEOFENCE', 'BIOMETRIC_FACE', 'MANUAL_OVERRIDE')),
    client_latitude NUMERIC(9, 6),
    client_longitude NUMERIC(9, 6),
    haversine_distance_meters NUMERIC(6, 2),
    liveness_confidence_score NUMERIC(4, 3),
    verified_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_session_student UNIQUE (session_id, student_id)
);

CREATE TABLE attendance_course_summaries (
    summary_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_code VARCHAR(16) NOT NULL,
    student_id UUID NOT NULL,
    total_classes_conducted INT DEFAULT 0,
    classes_attended INT DEFAULT 0,
    attendance_percentage NUMERIC(5, 2) GENERATED ALWAYS AS (
        CASE WHEN total_classes_conducted > 0 
        THEN (classes_attended::NUMERIC / total_classes_conducted::NUMERIC) * 100 
        ELSE 0 END
    ) STORED,
    is_exam_eligible BOOLEAN DEFAULT TRUE,
    CONSTRAINT unique_student_course UNIQUE (course_code, student_id)
);
```

---

## 4. API Specification & Network Contracts
### REST & WebSocket Endpoints
- `WS /ws/v1/attendance/qr-stream/:sessionId`
  - **Protocol**: Secure WebSocket (WSS)
  - **Payload**: Broadcasts `{ "token": "HMAC_SHA256_HASH", "expires_in_ms": 5000 }` every 5 seconds.
- `POST /api/v1/attendance/verify`
  - **Auth**: Bearer JWT (Role: `STUDENT`)
  - **Payload**: `{"session_id": "...", "token": "...", "latitude": 13.2514, "longitude": 77.7128, "liveness_verified": true}`
  - **Response 200**: `{"status": "CONFIRMED", "distance_meters": 18.4, "current_percentage": 92.4}`
  - **Response 403**: `{"error": "GEOFENCE_EXCEEDED", "distance_meters": 412.8, "limit_meters": 250}`

---

## 5. Resilience & Fault-Isolation Architecture
- **Offline Check-In Queue**: If mobile network fails on campus, client stores signed timestamped attendance attempts in `IsolatedStorage` and flushes upon reconnection with proof-of-work.
- **Zero-Cascading Fault Boundary**: In the event of a GPS sensor timeout or camera hardware unavailability, the subsystem gracefully falls back to QR verification without halting the ERP.

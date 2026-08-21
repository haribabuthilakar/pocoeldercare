# Phase 3: Field App for Care Officers - Context & Decisions

## Phase Objective
Deliver a React Native (Expo) mobile application for field Care Officers with offline-first SQLite synchronization, daily route sequencing, rapid dynamic SOP checklists (<5 min execution), vitals capture with immediate deterioration alerting, incident voice logging, and emergency dry-run drill mode.

## Key Decisions & Locked Implementation Choices

### 1. Offline Sync & Local Data Storage
- **Local Engine**: Optimistic local SQLite store (Expo SQLite / WatermelonDB) with persistent write queue.
- **Sync Behavior**: Background sync engine with exponential backoff retries when connectivity is restored; offline banner indicator with pending transaction count.
- **Conflict Strategy**: Client timestamped updates with server-wins reconciliation on schema entities and append-only logs for vitals and SOP step executions.

### 2. Rapid Dynamic SOP Checklist Execution (<5 Min Target)
- **UI Paradigm**: Rapid-tap card wizard with large thumb touch targets (minimum 48x48dp) designed for one-handed operation in the field.
- **Verification Proofs**: Quick photo capture attachment for mandatory steps (e.g. pillbox status, safety grab bars, wound dressing) and audio voice note recording for subjective elder observations.
- **Timer & Metrics**: Visual <5 minute visit progress indicator to guarantee adherence to operational speed targets without skipping protocol items.

### 3. Abnormal Vitals & Deterioration Escalation
- **Clinical Thresholds**: Instant evaluated validation for Blood Pressure (Systolic >160 or <90 mmHg), SpO2 (<94%), Pulse (>100 or <55 BPM), Fasting Blood Glucose (>140 or <70 mg/dL).
- **Escalation UX**: Instant high-priority alert banner (in brand magenta #FE1D8F) featuring a 1-tap "Escalate to Clinical Team / Dispatcher" button with pre-filled telemetry and suggested immediate on-ground protocol guidance.

### 4. Emergency Dry-Run Drill Mode UX
- **Visual Distinction**: Distinct amber/magenta striped hazard header banner with prominent 'DRILL SIMULATION' watermark across all screens.
- **Behavior**: Simulates realistic emergency countdown timers and officer SOP prompts without sending live dispatch alerts to hospitals or external emergency services.

### 5. UI & Brand System Implementation
- **Primary Color**: `#12C395` (Mint / Emerald Green for safe states, verified steps, and primary actions).
- **Secondary Color**: `#FE1D8F` (Vivid Magenta for abnormal vitals alerts, emergency buttons, and NRI status highlights).
- **Typography**: `Poppins, sans-serif` across all screens, headers, metrics, and cards.
- **Micro-Interactions**: Haptic feedback on step check-offs, glowing status indicators, and smooth card transition physics.

## Requirements Mapped to Phase 3
- **FLD-01**: React Native / Expo mobile app with offline-first SQLite synchronization and optimistic UI.
- **FLD-02**: Daily visit schedule and route sequencing with GPS/navigation links.
- **FLD-03**: Dynamic SOP checklist execution (<5 min completion per protocol) with step verification and photo capture.
- **FLD-04**: Field vitals recording (BP, SpO2, Pulse, Glucose, Temperature, Weight) with instant abnormal threshold alerts.
- **FLD-05**: Incident reporting with voice notes / audio recording and immediate ops notification.
- **FLD-06**: Emergency drill / dry-run simulation mode for training and readiness testing without triggering live dispatch.
- **FLD-07**: End-of-day visit reconciliation and sync queue status indicator.

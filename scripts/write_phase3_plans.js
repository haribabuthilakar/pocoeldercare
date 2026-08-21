const fs = require('fs');
const path = require('path');

function writeFile(relPath, content) {
  const fullPath = path.resolve(relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
  console.log('Written:', relPath);
}

// -------------------------------------------------------------
// 1. PLAN 03-01
// -------------------------------------------------------------
writeFile('.planning/phases/03-field-app-for-care-officers/03-01-PLAN.md', `---
phase: 03-field-app-for-care-officers
plan: 01
title: "React Native Expo Field App Scaffold, Offline SQLite Sync & Care Officer Auth"
wave: 1
dependencies: []
requirements: ["FLD-01", "FLD-07"]
---

# Plan 03-01: React Native Expo Field App Scaffold, Offline SQLite Sync & Care Officer Auth

## Objective
Scaffold the \\\`apps/field-app\\\` mobile workspace with Expo / React Native, TypeScript, brand theme (#12C395 Primary, #FE1D8F Secondary, Poppins font), offline SQLite data layer, mutation sync queue worker with background retry, and Care Officer authentication with offline session caching.

## User Review Required
> [!IMPORTANT]
> \\\`apps/field-app\\\` uses Expo with web + mobile universal support, allowing both browser preview for developers and native mobile execution.

## Proposed Changes

### 1. Mobile App Scaffold & Configuration
- **Create** \\\`apps/field-app/package.json\\\` with React Native / Expo dependencies, Lucide icons, and Tailwind styling.
- **Create** \\\`apps/field-app/tsconfig.json\\\` and \\\`app.json\\\` configuring Poppins font assets and mobile schemes.
- **Create** \\\`apps/field-app/src/theme/colors.ts\\\` with #12C395 Primary, #FE1D8F Secondary, and dark navy contrast tokens.

### 2. Offline SQLite Local Store & Sync Engine
- **Create** \\\`apps/field-app/src/db/sqlite-client.ts\\\` initializing local SQLite tables:
  - \\\`offline_visits\\\`: cached daily visit assignments and senior ICE profiles.
  - \\\`offline_vitals\\\`: locally captured telemetry readings pending sync.
  - \\\`offline_sop_executions\\\`: step check-offs, photo URIs, and audio observations.
  - \\\`sync_mutation_queue\\\`: queue of pending POST/PATCH operations with retry counts.
- **Create** \\\`apps/field-app/src/db/sync-worker.ts\\\` with exponential backoff synchronization engine, conflict resolution, and offline queue status provider.

### 3. Care Officer Authentication & Offline Cache
- **Create** \\\`apps/field-app/src/auth/auth-context.tsx\\\` managing officer login (+919845099888 / OTP), token storage, and persistent offline profile caching.
- **Create** \\\`apps/field-app/src/components/common/offline-status-banner.tsx\\\` displaying real-time online/offline connectivity pill and pending mutation badge.
- **Create** \\\`apps/field-app/src/screens/login-screen.tsx\\\` with one-handed mobile layout and instant OTP verification.

## Verification Plan
### Automated Tests
- \\\`pnpm --filter field-app test\\\`
- Verify SQLite database initialization and sync queue push/drain lifecycle.
`);

// -------------------------------------------------------------
// 2. PLAN 03-02
// -------------------------------------------------------------
writeFile('.planning/phases/03-field-app-for-care-officers/03-02-PLAN.md', `---
phase: 03-field-app-for-care-officers
plan: 02
title: "Daily Route Sequencing, Rapid <5 Min Dynamic SOP Checklist & Multimedia Proofs"
wave: 2
dependencies: ["03-01"]
requirements: ["FLD-02", "FLD-03"]
---

# Plan 03-02: Daily Route Sequencing, Rapid <5 Min Dynamic SOP Checklist & Multimedia Proofs

## Objective
Deliver the Care Officer daily visit schedule with sequenced routing, GPS/map navigation triggers, and the rapid dynamic SOP checklist wizard (<5 min completion target) with one-handed card swipe/tap controls, mandatory photo attachments, and audio voice note recording.

## Proposed Changes

### 1. Daily Schedule & Route Sequencing
- **Create** \\\`apps/field-app/src/screens/schedule-screen.tsx\\\` displaying sequenced visits for the officer's shift with time slots, senior photo/name, ICE emergency hospital, and 1-tap Google/Apple maps navigation link.
- **Create** \\\`apps/field-app/src/components/schedule/visit-card.tsx\\\` with status badges (PENDING, IN_PROGRESS, COMPLETED), dual-timezone arrival indicator, and plan badge.

### 2. Rapid Dynamic SOP Card Wizard (<5 Min Execution)
- **Create** \\\`apps/field-app/src/screens/sop-wizard-screen.tsx\\\` implementing the rapid card checklist with:
  - Minimum 48x48dp thumb touch targets for check/pass/fail actions.
  - Active <5 min speed progress bar and elapsed timer indicator.
  - Category-based step progression: Environment Safety -> Pillbox Check -> Vitals Telemetry -> Social Well-Being.
- **Create** \\\`apps/field-app/src/components/sop/photo-proof-uploader.tsx\\\` for attaching verification photos (pillbox, safety rails, wound condition).
- **Create** \\\`apps/field-app/src/components/sop/voice-note-recorder.tsx\\\` for recording senior feedback and caregiver observations.

## Verification Plan
### Automated Tests
- Test SOP step completion calculations, mandatory step validations, and offline mutation queueing.
`);

// -------------------------------------------------------------
// 3. PLAN 03-03
// -------------------------------------------------------------
writeFile('.planning/phases/03-field-app-for-care-officers/03-03-PLAN.md', `---
phase: 03-field-app-for-care-officers
plan: 03
title: "Clinical Vitals Telemetry, Abnormal Alerting, Incident Logging & Emergency Drill Mode"
wave: 3
dependencies: ["03-01", "03-02"]
requirements: ["FLD-04", "FLD-05", "FLD-06"]
---

# Plan 03-03: Clinical Vitals Telemetry, Abnormal Alerting, Incident Logging & Emergency Drill Mode

## Objective
Implement field vitals capture with immediate abnormal deterioration alerting (#FE1D8F banner with 1-tap clinical escalation), on-ground incident reporting with audio notes, and simulated emergency dry-run drill mode with hazard watermarks.

## Proposed Changes

### 1. Clinical Vitals Telemetry Capture & Instant Evaluation
- **Create** \\\`apps/field-app/src/screens/vitals-entry-screen.tsx\\\` recording BP, SpO2, Pulse, Fasting/Postprandial Glucose, Temperature, and Weight.
- **Create** \\\`apps/field-app/src/components/vitals/abnormal-alert-banner.tsx\\\` evaluating clinical thresholds and triggering an immediate high-priority alert with 1-tap "Escalate to Doctor / Emergency Dispatch" button.

### 2. Field Incident Reporting
- **Create** \\\`apps/field-app/src/screens/incident-report-screen.tsx\\\` capturing sudden slips/falls, equipment malfunctions, or medication discrepancies with severity rating and audio voice memos.

### 3. Emergency Dry-Run Drill Mode
- **Create** \\\`apps/field-app/src/screens/drill-mode-screen.tsx\\\` with distinct amber/magenta hazard styling, prominent "DRILL SIMULATION" watermark, and mock dispatcher SLA countdown timers.

### 4. Unit & Workflow Test Suite
- **Create** \\\`apps/field-app/src/__tests__/field-workflows.spec.tsx\\\` testing offline storage, sync worker retries, abnormal vitals detection, and drill mode state isolation.

## Verification Plan
### Automated Tests
- \\\`pnpm --filter field-app test\\\` verifying all 4 workflow test suites pass with 100% coverage.
`);

console.log('Finished writing Phase 3 implementation plans (03-01, 03-02, 03-03)');



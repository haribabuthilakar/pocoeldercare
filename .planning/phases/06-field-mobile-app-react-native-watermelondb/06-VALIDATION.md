---
phase: "06"
slug: "field-mobile-app-react-native-watermelondb"
status: approved
nyquist_compliant: true
wave_0_complete: false
created: "2026-09-01"
---

# Phase 06 — Validation Strategy: Field Mobile App (React Native & WatermelonDB)

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest (^2.1.8 / ^3.0.0) & @testing-library/react-native |
| **Config file** | `apps/field-app/vitest.config.ts` |
| **Quick run command** | `pnpm --filter @poco/field-app test` |
| **Full suite command** | `pnpm test` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm --filter @poco/field-app test`
- **After every plan wave:** Run `pnpm test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 06-01-01 | 01 | 1 | FLD-01, AUTH-06 | SEC-01 | App shell, navigation drawer, SecureStore PIN unlock & auth provider | component | `pnpm --filter @poco/field-app test shell-auth` | ❌ W0 | ⬜ pending |
| 06-01-02 | 01 | 1 | FLD-01, FLD-06 | SEC-02 | WatermelonDB local database schema, models & client UUID outbox | unit | `pnpm --filter @poco/field-app test database-models` | ❌ W0 | ⬜ pending |
| 06-01-03 | 01 | 1 | FLD-06, FLD-07 | SEC-02 | Two-phase batch sync engine, sync status pill & conflict review drawer | integration | `pnpm --filter @poco/field-app test sync-engine conflict` | ❌ W0 | ⬜ pending |
| 06-02-01 | 02 | 2 | FLD-03, FLD-05 | SEC-03 | Today Visits schedule view, Start/Finish visit lifecycle & silent GPS audit | component | `pnpm --filter @poco/field-app test visits-lifecycle` | ❌ W0 | ⬜ pending |
| 06-02-02 | 02 | 2 | FLD-02, ONBD-04 | SEC-03 | Sequential SOP checklist wizard, exception reporting & household activation CTA | component | `pnpm --filter @poco/field-app test sop-wizard activation` | ❌ W0 | ⬜ pending |
| 06-02-03 | 02 | 2 | FLD-04 | SEC-04 | S3 presigned URL direct media capture pipeline & upload queue | integration | `pnpm --filter @poco/field-app test media-upload` | ❌ W0 | ⬜ pending |
| 06-03-01 | 03 | 3 | CARE-04, ONBD-05 | SEC-01 | Emergency senior profile card, 1-tap ICE phone dial & physiological vitals entry | component | `pnpm --filter @poco/field-app test senior-profile vitals` | ❌ W0 | ⬜ pending |
| 06-03-02 | 03 | 3 | FEED-02 | SEC-01 | Offline two-way activity feed, optimistic outbox queue & AI triage trigger | component | `pnpm --filter @poco/field-app test activity-feed` | ❌ W0 | ⬜ pending |
| 06-03-03 | 03 | 3 | ALL | SEC-01..05 | End-to-end simulated offline visit, SOP execution & reconnection sync suite | e2e | `pnpm --filter @poco/field-app test e2e` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `apps/field-app/package.json` — Expo 52, React Native 0.76, WatermelonDB, NativeWind dependencies
- [ ] `apps/field-app/vitest.config.ts` — Vitest configuration with React Native testing library mocks
- [ ] `apps/field-app/test/setup.ts` — Mock environment for expo-location, expo-secure-store, expo-image-picker, and WatermelonDB adapters
- [ ] Shared fixtures for households, seniors, tickets, and SOP versions

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Native Camera Hardware Capture | FLD-04 | Physical device camera sensor | Tap "Upload Proof Photo" on mobile device and verify camera preview opens and captures photo |
| Telephony Emergency Call Intent | CARE-04 | Physical SIM dialer intent | Tap ICE contact phone button and verify native OS phone dialer opens with prefilled number |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 10s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-09-01

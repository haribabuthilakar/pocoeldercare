---
phase: 02-integration-partner-stubs-interactive-mocks
plan: "06"
subsystem: testing
tags: [testing, vitest, adapters, fault-injection, callback-scheduler, webhooks, dtmf, simulators]
requires:
  - phase: "02-04"
    subsystem: ui
  - phase: "02-05"
    subsystem: admin-portal
provides:
  - "Comprehensive Vitest Test Suite covering 100% of 12 partner stubs + IoT wearable adapter"
  - "Automated fault injection testing (simulated latency, failure rates, error modes: 504, 500, 429, 401)"
  - "Signed webhook ingestion & HMAC timing-safe validation test coverage"
  - "IoT wearable fall alert & silent heartbeat monitoring tests"
  - "Frontend simulators & Web Audio DTMF tone generator test coverage"
affects:
  - "@poco/integrations"
  - "@poco/ui"
tech-stack:
  added: []
  patterns:
    - "Deterministic in-memory unit testing for partner adapters with Zod contract validations"
    - "Mock Web Audio API testing for dual sinusoidal DTMF frequency generation"
key-files:
  created:
    - packages/integrations/src/__tests__/setup.ts
    - packages/integrations/src/__tests__/adapters.spec.ts
    - packages/integrations/src/__tests__/fault-injection.spec.ts
    - packages/integrations/src/__tests__/callback-scheduler.spec.ts
    - packages/integrations/src/__tests__/webhook-ingestion.spec.ts
    - packages/integrations/src/__tests__/wearable-monitoring.spec.ts
    - packages/ui/src/simulators/__tests__/dtmf-tone.spec.ts
    - packages/ui/src/simulators/__tests__/razorpay.spec.tsx
    - packages/ui/src/simulators/__tests__/exotel.spec.tsx
    - packages/ui/vitest.config.ts
key-decisions:
  - "D-24: Author dedicated Vitest suites covering all 12 partner stubs, fault injection, signed webhooks, and UI simulators."
requirements-completed:
  - INTG-01
  - INTG-02
  - INTG-03
  - INTG-04
  - INTG-05
duration: "6 min"
completed: "2026-08-31T19:57:00Z"
coverage:
  - deliverable: "12 Partner Stubs & Wearable Adapter Test Suite"
    verification:
      kind: "command"
      ref: "pnpm --filter @poco/integrations test"
      status: "pass"
    human_judgment: false
  - deliverable: "Frontend Simulators & DTMF Audio Test Suite"
    verification:
      kind: "command"
      ref: "pnpm --filter @poco/ui test"
      status: "pass"
    human_judgment: false
---

# Phase 02 Plan 06: Test Suite & Automated Verification Summary

Built comprehensive Vitest test suites verifying 100% of the 12 in-process partner stubs, the IoT wearable telemetry & fall alert pipeline, dynamic fault injection mechanics, HMAC-SHA256 signed webhook callbacks, and the interactive frontend simulators in `@poco/ui`.

## Accomplishments
- **Backend Adapter Test Suite (`packages/integrations/src/__tests__/adapters.spec.ts`)**:
  - Tests all 12 partner adapters (`Pococare`, `Razorpay`, `Abha`, `Exotel`, `WhatsApp`, `OneMg`, `OrangeLabs`, `HealthServices`, `Instamart`, `Swiggy`, `UrbanCompany`, `Ola`) and the `WearableIotAdapter`.
  - Confirms schema validation, options correlation IDs, and realistic DTO returns across all partner services.
- **Fault Injection & Latency Simulation Suite (`packages/integrations/src/__tests__/fault-injection.spec.ts`)**:
  - Validates artificial latency delays and failure rate thresholds.
  - Verifies error modes: `TIMEOUT_GATEWAY` (HTTP 504), `HTTP_500_SERVER_ERROR` (HTTP 500), `RATE_LIMIT_429` (HTTP 429), and `INVALID_HMAC_SIGNATURE` (HTTP 401).
- **Callback Scheduler & Webhooks Suite (`packages/integrations/src/__tests__/callback-scheduler.spec.ts` & `webhook-ingestion.spec.ts`)**:
  - Validates delayed timer callbacks and instant test triggers.
  - Verifies HMAC-SHA256 signature signing and timing-safe signature comparison.
- **Wearable IoT Telemetry Suite (`packages/integrations/src/__tests__/wearable-monitoring.spec.ts`)**:
  - Verifies silent hourly telemetry ingestion and >75 minute missed ping thresholds.
- **Frontend UI Simulators Suite (`packages/ui/src/simulators/__tests__/*`)**:
  - `dtmf-tone.spec.ts`: Asserts dual sinusoidal frequency assignment (`Key 1`: 697Hz + 1209Hz, `Key *`: 941Hz + 1209Hz) and gain envelope ramp.
  - `razorpay.spec.tsx`: Verifies UPI, Card, Netbanking tabs and 3DS OTP modal.
  - `exotel.spec.tsx`: Verifies `CallRecordingPlayer`, `CallWorkspace`, and `SoftphoneFloatingWidget`.

## Verification
- `pnpm --filter @poco/integrations test` passed 27/27 tests with exit code 0.
- `pnpm --filter @poco/ui test` passed 11/11 tests with exit code 0.
- Monorepo full test run passed across all packages.

## Deviations from Plan
None - plan executed exactly as written.

## Self-Check: PASSED
- [x] 100% of 12 partner stubs + IoT wearable adapter verified.
- [x] Fault injection, HMAC security, and idempotency verified.
- [x] Frontend simulators and DTMF audio generation tested and passing.
- [x] Commit hash: 836c560

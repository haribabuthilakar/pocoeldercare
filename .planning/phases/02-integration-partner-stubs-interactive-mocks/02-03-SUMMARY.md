---
phase: 02-integration-partner-stubs-interactive-mocks
plan: "03"
subsystem: api
tags: [api, webhooks, hmac, idempotency, iot-wearables, fall-alerts, telemetry, missed-pings]
requires:
  - phase: "02-01"
    subsystem: integrations
provides:
  - "Inbound Signed Webhooks Ingestion Engine at /api/webhooks/v1/*"
  - "Timing-Safe WebhookHmacGuard validating signatures against partner secrets"
  - "Transactional Idempotency Manager in WebhooksService via WebhookEvent table"
  - "Razorpay, Exotel, Wearable IoT, and LoopClosed partner webhook handlers"
  - "WearablePingScannerJob detecting devices offline >75m and creating routine ops tickets"
affects:
  - "@poco/api"
  - "@poco/database"
tech-stack:
  added:
    - "@poco/api"
  patterns:
    - "Transactional idempotent webhook ingestion with WebhookEvent status transitions"
    - "Real-time emergency ticketing & auto-spawning service requests on IoT fall detection"
    - "Silent telemetry heartbeats updating SeniorMedicalProfile.lastWearablePingAt"
    - "Background missed-heartbeat scanner job with 12h ticket throttling"
key-files:
  created:
    - apps/api/package.json
    - apps/api/tsconfig.json
    - apps/api/tsup.config.ts
    - apps/api/src/modules/webhooks/guards/webhook-hmac.guard.ts
    - apps/api/src/modules/webhooks/handlers/razorpay-webhook.handler.ts
    - apps/api/src/modules/webhooks/handlers/exotel-webhook.handler.ts
    - apps/api/src/modules/webhooks/handlers/loop-closed-webhook.handler.ts
    - apps/api/src/modules/webhooks/handlers/wearable-webhook.handler.ts
    - apps/api/src/modules/webhooks/webhooks.service.ts
    - apps/api/src/modules/webhooks/webhooks.controller.ts
    - apps/api/src/modules/webhooks/webhooks.module.ts
    - apps/api/src/modules/jobs/wearable-ping-scanner.job.ts
    - apps/api/src/app.module.ts
    - apps/api/src/main.ts
    - apps/api/src/index.ts
  modified:
    - packages/database/prisma/schema/household.prisma
key-decisions:
  - "D-17: Implemented WebhookHmacGuard with timing-safe HMAC-SHA256 verification and partner secret lookup."
  - "D-18: Built WearableWebhookHandler.handleFallAlert to immediately create EMERGENCY tickets and EMERGENCY_AMBULANCE service requests on fall/SOS alerts."
  - "D-19: Handled hourly wearable pings silently updating SeniorMedicalProfile.lastWearablePingAt; created WearablePingScannerJob flagging devices missing telemetry >75m."
  - "D-20: Enforced transactional idempotency in WebhooksService returning 200 OK with cached results for duplicate deliveries."
requirements-completed:
  - INTG-03
  - INTG-04
duration: "6 min"
completed: "2026-08-31T17:36:30Z"
coverage:
  - deliverable: "Inbound signed webhooks engine & HMAC guard"
    verification:
      kind: "command"
      ref: "pnpm --filter @poco/api build"
      status: "pass"
    human_judgment: false
  - deliverable: "Wearable fall alert handler & missed ping scanner job"
    verification:
      kind: "command"
      ref: "pnpm --filter @poco/api build"
      status: "pass"
    human_judgment: false
---

# Phase 02 Plan 03: Webhook Ingestion & IoT Wearable Pipeline Summary

Built the inbound signed webhook ingestion engine (`/api/webhooks/v1/...`), the timing-safe HMAC-SHA256 security guard, the transactional idempotency manager, the IoT Wearable Fall Alert & Silent Heartbeat processing pipeline, and the Missed Ping background scanner in `apps/api`.

## Accomplishments
- **`apps/api` Package Scaffold**: Initialized modular backend package with TypeScript, tsup build pipeline, and monorepo workspace links.
- **Timing-Safe `WebhookHmacGuard`**: Verifies HMAC-SHA256 signatures (`x-razorpay-signature`, `x-exotel-signature`, `x-signature-sha256`) against partner secret keys with constant-time equality comparisons.
- **Transactional Idempotency (`WebhooksService`)**: Enforces single-execution invariants via the `WebhookEvent` table (`PENDING` -> `PROCESSED` | `FAILED`), immediately returning cached results on duplicate webhook deliveries sharing the same `idempotencyKey`.
- **Specialized Webhook Handlers**:
  - `RazorpayWebhookHandler`: Credits digital wallet with integer paise balance, records immutable ledger transaction in `WalletTransaction`, and publishes activity feed billing events.
  - `ExotelWebhookHandler`: Ingests incoming telephony events, resolves senior/household by caller ID, logs call recordings, and creates triage tickets based on IVR DTMF selections.
  - `LoopClosedWebhookHandler`: Transitions linked `ServiceRequest` records to `COMPLETED` when partner fulfillments finish (1mg, Orange Labs, Swiggy, Ola, Pococare).
  - `WearableWebhookHandler`: Silently ingests hourly telemetry heartbeats without feed noise, and auto-spawns `EMERGENCY` tickets with `EMERGENCY_AMBULANCE` requests upon sudden fall impact or SOS button press.
- **Missed Ping Scanner (`WearablePingScannerJob`)**: Background scanner identifying senior devices with `lastWearablePingAt > 75 minutes`, throttled to 1 ticket per 12 hours.

## Verification
- `pnpm --filter @poco/api build` passed with exit code 0.
- `pnpm --filter @poco/database build` passed with updated `SeniorMedicalProfile.wearableDeviceId` and `lastWearablePingAt`.

## Deviations from Plan
None - plan executed exactly as written.

## Self-Check: PASSED
- [x] Inbound webhook endpoints protected by WebhookHmacGuard.
- [x] Wearable fall alert triggers EMERGENCY tickets and activity feed alerts.
- [x] Hourly pings update SeniorMedicalProfile silently.
- [x] WearablePingScannerJob flags devices offline >75m.
- [x] Commit hash: fc96a59

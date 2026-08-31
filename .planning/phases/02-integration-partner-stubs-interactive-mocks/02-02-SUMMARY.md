---
phase: 02-integration-partner-stubs-interactive-mocks
plan: "02"
subsystem: integrations
tags: [integrations, adapters, callback-scheduler, test-harness, emergency, payment, telephony, abha, iot]
requires:
  - phase: "02-01"
    subsystem: integrations
provides:
  - "12 In-Process Integration Partner Stubs (Pococare, Razorpay, ABHA, Exotel, WhatsApp, 1mg, Orange Labs, Health Services, Instamart, Swiggy, Urban Company, Ola)"
  - "Wearable IoT Adapter with telemetry heartbeat and emergency fall/SOS simulations"
  - "CallbackSchedulerService with signed HMAC-SHA256 delivery and unref timers"
  - "TestHarnessController for manual 1-click webhook callback triggering"
affects:
  - "@poco/integrations"
  - "@poco/business-rules"
tech-stack:
  added: []
  patterns:
    - "Multi-stage progression state machine simulations (ambulance, delivery, lab reports, rides)"
    - "HMAC-SHA256 signed asynchronous callback scheduler with unref timers"
    - "Instant manual webhook dispatcher test controller"
key-files:
  created:
    - packages/integrations/src/adapters/pococare.adapter.ts
    - packages/integrations/src/adapters/razorpay.adapter.ts
    - packages/integrations/src/adapters/abha.adapter.ts
    - packages/integrations/src/adapters/exotel.adapter.ts
    - packages/integrations/src/adapters/whatsapp.adapter.ts
    - packages/integrations/src/adapters/one-mg.adapter.ts
    - packages/integrations/src/adapters/orange-labs.adapter.ts
    - packages/integrations/src/adapters/health-services.adapter.ts
    - packages/integrations/src/adapters/instamart.adapter.ts
    - packages/integrations/src/adapters/swiggy.adapter.ts
    - packages/integrations/src/adapters/urban-company.adapter.ts
    - packages/integrations/src/adapters/ola.adapter.ts
    - packages/integrations/src/adapters/wearable-iot.adapter.ts
    - packages/integrations/src/core/callback-scheduler.service.ts
    - packages/integrations/src/controllers/test-harness.controller.ts
  modified:
    - packages/business-rules/src/auth/webhooks.ts
    - packages/integrations/src/index.ts
    - packages/integrations/src/integrations.module.ts
key-decisions:
  - "D-01: Implemented 12 concrete partner adapters + wearable IoT adapter extending BasePartnerAdapter."
  - "D-04: Built CallbackSchedulerService for automated progression webhooks and instant test triggers."
  - "D-05: PococareAdapter simulates 4-stage emergency ambulance lifecycle with realistic ETA countdowns."
  - "D-06: AbhaAdapter supports ABDM M1 OTP, M2 consent auto-grant, and M3 FHIR R4 clinical bundles."
  - "D-07: WhatsAppAdapter validates business templates and schedules SENT/DELIVERED/READ delivery receipts."
  - "D-10: ExotelAdapter simulates click-to-call, IVR passthru routing (digits 1/2/3), and call recordings."
  - "D-18, D-19: WearableIotAdapter simulates silent hourly telemetry heartbeats and sudden fall alert webhooks."
requirements-completed:
  - INTG-01
duration: "6 min"
completed: "2026-08-31T17:33:00Z"
coverage:
  - deliverable: "12 In-Process Partner Stubs + Wearable IoT Adapter"
    verification:
      kind: "command"
      ref: "pnpm --filter @poco/integrations build"
      status: "pass"
    human_judgment: false
  - deliverable: "CallbackSchedulerService & TestHarnessController"
    verification:
      kind: "command"
      ref: "pnpm --filter @poco/integrations build"
      status: "pass"
    human_judgment: false
---

# Phase 02 Plan 02: Partner Stubs & Callback Scheduler Summary

Implemented all 12 in-process integration partner adapters and the wearable IoT adapter with full lifecycle fidelity, multi-stage progressions, ABDM M1/M2/M3 compliance, and the asynchronous HMAC-SHA256 signed webhook callback scheduler.

## Accomplishments
- **Core Emergency & Telephony Adapters**:
  - `PococareAdapter`: 4-stage emergency ambulance lifecycle (`AMBULANCE_DISPATCHED` -> `PARAMEDIC_ASSIGNED` -> `ARRIVED_AT_SCENE` -> `HOSPITAL_ADMITTED`) with realistic ETA countdowns and ICE profile sync.
  - `RazorpayAdapter`: Order creation (`order_...` with integer paise precision), refund processing, and simulated payment capture triggers.
  - `AbhaAdapter`: ABDM M1 Aadhaar OTP generation/verification, M2 consent auto-grant, and M3 FHIR R4 clinical bundles (`DiagnosticReport` lipid panels and `MedicationRequest` prescriptions).
  - `ExotelAdapter`: Outbound click-to-call connect, IVR routing (1=Emergency, 2=Care Officer, 3=Routine), and call recording links.
  - `WhatsAppAdapter`: Business Cloud API template parameter validation and delivery receipts (`SENT`, `DELIVERED`, `READ`).
- **Commerce, Diagnostics, Services, Transport & IoT Adapters**:
  - `OneMgAdapter`: Prescription medicine fulfillment with progression callbacks (`ORDER_CONFIRMED` -> `PHARMACIST_VERIFIED` -> `DISPATCHED` -> `DELIVERED`).
  - `OrangeLabsAdapter`: Home phlebotomy sample collection and report ready callbacks with PDF URLs and structured biomarkers.
  - `HealthServicesAdapter`: Doctor teleconsultations and nursing shift bookings.
  - `InstamartAdapter`: 15-minute quick commerce order delivery simulation.
  - `SwiggyAdapter`: Low-sodium and diabetic senior meal deliveries.
  - `UrbanCompanyAdapter`: Home safety grab-bar installation and technician tracking.
  - `OlaAdapter`: Senior hospital transit ride dispatch and tracking.
  - `WearableIotAdapter`: Hourly silent telemetry pings and real-time fall detection / SOS button triggers.
- **Asynchronous `CallbackSchedulerService`**:
  - Manages unref'd `setTimeout` timers to dispatch HMAC-SHA256 signed webhooks to `/api/webhooks/v1/:partner/*`.
  - Supports instant manual trigger via `triggerInstantCallback`.
- **`TestHarnessController`**:
  - Exposes `POST /api/test/integrations/:partner/callback` for manual instant triggers from automated tests or Admin testbenches.

## Verification
- `pnpm --filter @poco/business-rules build` passed with exit code 0.
- `pnpm --filter @poco/integrations build` passed with exit code 0.

## Deviations from Plan
None - plan executed exactly as written.

## Self-Check: PASSED
- [x] All 13 adapters implemented and registered in IntegrationsModule.
- [x] CallbackSchedulerService signs outgoing callbacks with HMAC-SHA256.
- [x] TestHarnessController exposes instant test callback endpoints.
- [x] Commit hash: d6055ff

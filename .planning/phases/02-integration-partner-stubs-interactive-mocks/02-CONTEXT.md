# Phase 02: Integration Partner Stubs & Interactive Mocks - Context

**Gathered:** 2026-08-31
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 2 builds high-fidelity, realistic backend stubs and interactive frontend simulators for all 12 external integration partners and wearable IoT devices:
- In-process NestJS mock adapters and mock HTTP endpoints (`packages/integrations`) implementing a common interface (`IPartnerAdapter`) for all 12 partners (Pococare, Razorpay, ABHA, Exotel, WhatsApp, 1mg, Orange Labs, Health Services, Instamart, Swiggy, Urban Company, Ola) plus Wearable IoT devices.
- Interactive frontend simulators in `@poco/ui/simulators/*`: a high-fidelity Razorpay payment checkout modal (UPI QR/intent, Cards with 3DS/OTP, Netbanking, failure/retry simulation) and an Exotel softphone/IVR dialer (incoming caller pop-up, DTMF audio tones, synthesized IVR voice prompts, active call workspace, recording playback).
- Inbound signed webhook ingestion pipeline (`/api/webhooks/v1/...`) with HMAC-SHA256 signature verification, idempotency tracking in `WebhookEvent`, and automated incident creation (IoT fall alert -> emergency ticket; missed hourly ping >75m -> routine ticket; partner loop-closed callback -> service request completion).
- Admin Portal Integration Health & Mock Management Dashboard (`/admin/integrations` and dev tools) with visual fault injection (latency slider 0-3000ms, failure rate 0-100%, error modes), scenario preset payload dispatcher, and dedicated Vitest test suite.

</domain>

<decisions>
## Implementation Decisions

### 1. Backend Stub Architecture & Partner Simulation Fidelity
- **D-01:** In-process NestJS mock adapters + dedicated mock HTTP endpoints (`packages/integrations`) implementing a common `IPartnerAdapter` interface, supporting both direct TypeScript service injection and HTTP mock server routes for end-to-end webhook/callback testing. — **Reversibility:** costly — changing adapter architecture touches API controllers and mock endpoints across 12 partners.
- **D-02:** Database-driven dynamic mock settings (`IntegrationPartner.mockSettings` JSON in PostgreSQL with in-process memory caching) configuring simulated latency (100-500ms), failure rates (0-100%), error modes (timeout, HTTP 500, invalid signature, rate limit), and response templates.
- **D-03:** Strongly-typed Zod schemas per partner in `@poco/validation/partners/*` providing exact request, response, and webhook DTOs with realistic fixture generators matching real-world API formats (Razorpay Order/Payment, Exotel Passthru/Call, ABHA M1/M2/M3, 1mg Order, Orange Labs Phlebotomy, Swiggy/Instamart Delivery). — **Reversibility:** costly — exported partner DTOs form the contract between stubs, webhooks, and UI testbenches.
- **D-04:** Configurable auto-callback timers with instant manual trigger: stubs schedule automatic webhook callbacks after a short delay (e.g. 5-30s in demo mode) and expose an instant `/api/test/integrations/:partner/callback` endpoint/button for automated tests and manual drills.
- **D-05:** Multi-stage emergency progression for Pococare stub simulating realistic lifecycle stages (`AMBULANCE_DISPATCHED` -> `PARAMEDIC_ASSIGNED` -> `ARRIVED_AT_SCENE` -> `HOSPITAL_ADMITTED`) with realistic ETA countdowns and driver/paramedic metadata.
- **D-06:** Complete ABDM milestone simulation (M1/M2/M3) in ABHA stub supporting ABHA ID creation/verification with mock OTP, patient consent request creation & auto-approval, and structured FHIR diagnostic/prescription record payloads.
- **D-07:** WhatsApp Business Cloud API template engine validating template parameters (family escalation alert, payment reminder, visit report), generating message IDs, tracking delivery receipts (`SENT`, `DELIVERED`, `READ`), and supporting simulated inbound family chat replies.
- **D-08:** Full outbound call logging in `OutboundIntegrationCall` model (`partnerCode`, `endpoint`, `requestPayload`, `responseStatus`, `durationMs`, correlation IDs `householdId`/`ticketId`/`serviceRequestId`) for ops auditability and health tracking.

### 2. Interactive Frontend Simulators (Razorpay & Exotel)
- **D-09:** High-fidelity multi-method Razorpay checkout modal simulating UPI (QR + App intent), Cards with 3DS/OTP verification step, Netbanking bank picker, simulated bank downtime/card decline errors, and instant wallet balance refresh.
- **D-10:** Interactive Exotel softphone & IVR flow simulator with floating incoming caller ID pop-up, senior/household auto-lookup, IVR menu routing ("Press 1 for Emergency, 2 for Care Officer, 3 for Routine Request"), live call timer, call transfer to Ops Executive, and audio recording player.
- **D-11:** Shared UI package placement (`@poco/ui/simulators/*` exporting `RazorpayCheckoutModal` and `ExotelTelephonySimulator`) with theme-aware styling reused across Family Portal (wallet top-up) and Admin Portal (dev tools & ops call handler).
- **D-12:** End-to-end webhook pipeline execution: simulators trigger real signed HMAC webhook requests (`/api/webhooks/v1/razorpay/*` and `/api/webhooks/v1/exotel/*`) to the backend API, verifying real signature validation, DB webhook event logging, and ticket/wallet ledger updates.
- **D-13:** Standard checkout UI fidelity without in-modal dev buttons; test scenarios (decline, timeout, invalid signature) are triggered cleanly from Admin Dev Tools / test harness to preserve realistic user experience in consumer surfaces.
- **D-14:** Web Audio API DTMF tones and synthesized voice prompts ("Welcome to Poco Care...") on IVR dialpad press with visual interactive transcript.
- **D-15:** Global floating softphone widget & banner alert in Admin Portal navigation bar displaying ringing animation, ringtone, caller/household summary, and expanding into active call workspace upon answering.
- **D-16:** Responsive modal-to-bottom-sheet transition using `@poco/ui` responsive dialog primitive (centered dialog on desktop `>=768px`, draggable slide-up bottom sheet on mobile `<768px`).

### 3. Webhook Ingestion & IoT Fall Alert Processing
- **D-17:** Transactional webhook ingestion pipeline (`/api/webhooks/v1/*`) verifying HMAC-SHA256 signature via `@poco/business-rules`, validating payload via Zod, enforcing idempotency key uniqueness in `WebhookEvent`, and tracking status (`PENDING` -> `PROCESSED` | `FAILED`).
- **D-18:** Immediate Emergency Ticket auto-creation on `FALL_DETECTED` or `SOS_BUTTON_PRESSED` IoT alerts (`raisedByType: 'webhook'`, `priority: EMERGENCY`, spawns initial `EMERGENCY_AMBULANCE` service request, and writes emergency event to household activity feed).
- **D-19:** Silent device heartbeat for hourly healthy wearable pings updating `SeniorMedicalProfile.lastWearablePingAt` without activity feed spam; periodic scanner checks devices missing pings > 75 minutes and auto-creates a `MISSED_WEARABLE_PING` routine ticket.
- **D-20:** Idempotent 200 OK with cached result on duplicate webhook deliveries sharing the same `idempotencyKey` without re-executing side-effects, preventing duplicate tickets or ledger double-entries.

### 4. Partner Test Harness & Mock Configuration UI
- **D-21:** Comprehensive Integration Health & Config Dashboard (`/admin/integrations`) with partner grid cards showing live status badge (`ACTIVE`, `MOCK_ONLY`, `DEGRADED`, `DOWN`), last ping time, error counters, inline JSON editor for `mockSettings`, and 1-click test ping trigger.
- **D-22:** Pre-populated scenario presets + custom JSON editor in test payload builder (e.g. "Pococare: Dispatch Ambulance", "1mg: Medicine Out for Delivery", "Orange Labs: Lipid Profile Ready", "Wearable: Fall Alert with High Heart Rate") with interactive form and raw JSON mode.
- **D-23:** Visual fault injection controls in Admin UI with interactive latency slider (0ms - 3000ms), failure rate slider (0% - 100%), and error mode dropdown (`NONE`, `TIMEOUT_GATEWAY`, `HTTP_500_SERVER_ERROR`, `INVALID_HMAC_SIGNATURE`, `RATE_LIMIT_429`) updating `mockSettings` in real time.
- **D-24:** Dedicated Vitest test harness (`packages/integrations/src/__tests__/*`) covering all 12 partner stubs, fault injection scenarios, webhook idempotency, and automated callback loops with 100% test coverage.

### the agent's Discretion
- Internal helper method naming and mock data generation utilities within `packages/integrations`.
- Default synthesized audio tone frequencies and default mock latency values (e.g. 150ms default).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Architecture & Requirements
- `docs/poco-elder-care-design-brief.md` §3.10, §3.14, §4.2, §6.11, §7.6 — Authoritative specifications for 12 integration partners, webhook signatures, fallback handling, and test harness requirements.
- `.planning/PROJECT.md` — Project context, 1GB DO droplet constraints, and active requirements.
- `.planning/REQUIREMENTS.md` §INTG-01 .. INTG-05 — Formal requirements for partner stubs, interactive UI modals, fall alerts, missed pings, and integration management dashboard.
- `.planning/research/ARCHITECTURE.md` — System architecture and modular backend design.
- `.planning/phases/01-monorepo-foundation-prisma-schema-dry-business-rules/01-CONTEXT.md` — Monorepo foundation decisions, Prisma schema models (`IntegrationPartner`, `WebhookEvent`, `OutboundIntegrationCall`), HMAC verification (`D-116`), and integer paise convention (`D-23`).

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `@poco/validation/src/webhooks/index.ts`: Existing baseline schemas (`razorpayWebhookSchema`, `exotelWebhookSchema`, `wearableAlertSchema`, `pococareSyncSchema`).
- `@poco/business-rules/src/auth/webhooks.ts`: Pure HMAC-SHA256 signature verification function (`verifyWebhookSignature`).
- `@poco/business-rules/testing`: Mock factories (`createMockRazorpayWebhook`, `createMockExotelCallEvent`, `createMockPococareSync`) and failure simulator (`simulatePartnerFailure`).
- `packages/database/prisma/schema/partner.prisma`: Prisma models for `IntegrationPartner`, `WebhookEvent`, and `MediaAttachment`.
- `@poco/ui`: Radix primitives, Dialog/Sheet modal component, Button, Badge, Card, and Lucide icons.

### Established Patterns
- Strongly-typed Zod schemas with inferred DTO types (`z.infer<typeof ...>`).
- Integer Paise currency representation (`1 INR = 100 paise`).
- Pure TypeScript business rules and calculators with tagged union result types (`Result<T, E>`).
- Database entity soft-deletes and immutable transaction/event logging.

### Integration Points
- Backend REST endpoints: `/api/webhooks/v1/...` and `/api/test/integrations/...` in NestJS backend.
- Shared simulator components: `@poco/ui/simulators/*` imported by `apps/family-portal` and `apps/admin-portal`.
- Admin Portal routes: `/admin/integrations` (health/config) and `/admin/dev-tools` (test harness).

</code_context>

<specifics>
## Specific Ideas

- Interactive Exotel telephony softphone floating in Admin Portal with Web Audio API DTMF dialpad tones and synthesized IVR speech prompt.
- High-fidelity Razorpay payment modal with realistic UPI QR/intent, Card 3DS verification, and Netbanking flow.
- Pre-populated test scenario templates for all 12 partners in Admin testbench allowing 1-click end-to-end webhook event dispatch.

</specifics>

<deferred>
## Deferred Ideas

- None — discussion stayed strictly within Phase 2 scope.

</deferred>

---

*Phase: 02-integration-partner-stubs-interactive-mocks*
*Context gathered: 2026-08-31*

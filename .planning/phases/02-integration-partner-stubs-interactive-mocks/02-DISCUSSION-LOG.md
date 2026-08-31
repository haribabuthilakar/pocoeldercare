# Phase 02: Integration Partner Stubs & Interactive Mocks - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-08-31
**Phase:** 02-integration-partner-stubs-interactive-mocks
**Areas discussed:** Backend Stub Architecture & Simulation Fidelity, Interactive Frontend Simulators (Razorpay & Exotel), Webhook Ingestion & IoT Fall Alert Processing, Partner Test Harness & Mock Configuration UI

---

## Backend Stub Architecture & Simulation Fidelity

| Option | Description | Selected |
|--------|-------------|----------|
| In-Process NestJS Mock Adapters + Dedicated Mock HTTP Endpoints | Stubs implement a common partner interface (`IPartnerAdapter`), with both direct TypeScript service injection and HTTP mock server routes for end-to-end webhook/callback testing. | ✓ |
| Isolated Mock HTTP Micro-Server | Separate lightweight mock server listening on a dedicated port simulating 3rd-party domains. | |
| Pure In-Memory Service Mocks Only | TypeScript classes replacing HTTP calls entirely with zero network overhead. | |

**User's choice:** In-Process NestJS Mock Adapters + Dedicated Mock HTTP Endpoints

---

| Option | Description | Selected |
|--------|-------------|----------|
| Database-Driven Dynamic Mock Settings (`IntegrationPartner.mockSettings`) | Configurable latency (e.g. 100-500ms), failure rates (0-100%), error modes (timeout, 500, invalid signature), and mock response templates stored in Postgres and cached in-memory. | ✓ |
| Static Environment Variable Configuration | Fixed latency and failure simulation toggled via `.env` flags. | |
| Hardcoded Deterministic Defaults | Fixed realistic latencies with programmatic override hooks in test suites only. | |

**User's choice:** Database-Driven Dynamic Mock Settings (`IntegrationPartner.mockSettings`)

---

| Option | Description | Selected |
|--------|-------------|----------|
| Strongly-Typed Zod Schemas per Partner in `@poco/validation/partners/*` | Exact request, response, and webhook DTOs with realistic fixture generators matching real-world API formats. | ✓ |
| Generic Key-Value JSON Payloads | A unified partner schema with flexible `metadata: Record<string, any>` payloads. | |

**User's choice:** Strongly-Typed Zod Schemas per Partner in `@poco/validation/partners/*`

---

| Option | Description | Selected |
|--------|-------------|----------|
| Configurable Auto-Callback Timers with Instant Manual Trigger | Stubs schedule an automatic webhook callback after a short delay (e.g., 5-30s in demo mode) AND expose an instant "Trigger Callback" endpoint/UI button for immediate automated tests and manual drills. | ✓ |
| Manual Admin Trigger Only | Webhooks are only dispatched when explicitly fired from the Admin Portal / test harness. | |
| Synchronous Immediate Callback | Webhooks are emitted in the same request execution cycle before returning. | |

**User's choice:** Configurable Auto-Callback Timers with Instant Manual Trigger

---

| Option | Description | Selected |
|--------|-------------|----------|
| Multi-Stage Emergency Event Progression | Pococare stub simulates realistic emergency lifecycle stages (`AMBULANCE_DISPATCHED` -> `PARAMEDIC_ASSIGNED` -> `ARRIVED_AT_SCENE` -> `HOSPITAL_ADMITTED`) with realistic ETA countdowns and driver/paramedic contact details. | ✓ |
| Binary Status Only (`DISPATCHED` -> `COMPLETED`) | Simplified two-state emergency dispatch simulation. | |

**User's choice:** Multi-Stage Emergency Event Progression

---

| Option | Description | Selected |
|--------|-------------|----------|
| Complete ABDM Milestone Simulation (M1/M2/M3) | Stub simulates ABHA ID creation/verification with mock Aadhaar/Mobile OTP, patient consent request creation & auto-approval, and structured FHIR diagnostic/prescription record retrieval. | ✓ |
| Simplified ABHA ID Verification Only | Validates 14-digit ABHA ID format without full multi-step ABDM consent artifact simulation. | |

**User's choice:** Complete ABDM Milestone Simulation (M1/M2/M3)

---

| Option | Description | Selected |
|--------|-------------|----------|
| Cloud API Template Engine with Status Webhooks | Validates template parameters (e.g. family escalation alert, payment reminder, visit report), generates message ID, logs delivery status receipts (`SENT`, `DELIVERED`, `READ`), and allows simulating inbound family WhatsApp replies. | ✓ |
| Silent Outbound Log Only | Writes outbound messages to database log with static `SENT` status without webhook callbacks. | |

**User's choice:** Cloud API Template Engine with Status Webhooks

---

| Option | Description | Selected |
|--------|-------------|----------|
| Full Outbound Call Logging (`OutboundIntegrationCall`) | Record partnerCode, endpoint/action, request payload, response status, durationMs, and correlation IDs (`householdId`, `ticketId`, `serviceRequestId`) for full ops auditability and health tracking. | ✓ |
| Lightweight In-Memory Ring Buffer | Keep only the last 100 outbound requests in memory for live admin inspection without database persistence. | |

**User's choice:** Full Outbound Call Logging (`OutboundIntegrationCall`)

---

## Interactive Frontend Simulators (Razorpay & Exotel)

| Option | Description | Selected |
|--------|-------------|----------|
| High-Fidelity Multi-Method Checkout Modal | Simulates Razorpay Standard Checkout with UPI (QR + Intent), Cards, and Netbanking, including a 3D-Secure / OTP verification step, simulated bank downtime / card decline errors, and instant wallet balance refresh. | ✓ |
| Minimal Quick-Topup Modal | Simplified amount entry with instant "Simulate Success" and "Simulate Failure" buttons without multi-step payment method simulation. | |

**User's choice:** High-Fidelity Multi-Method Checkout Modal

---

| Option | Description | Selected |
|--------|-------------|----------|
| Interactive Softphone & IVR Flow Simulator | Floating telephony dialer with incoming caller ID pop-up, senior/household auto-lookup, IVR menu routing ("Press 1 for Emergency, 2 for Care Officer, 3 for Routine Request"), live call timer, call transfer to Ops Executive, and audio recording playback player. | ✓ |
| Static Call Trigger Form | Simple admin form to submit fake call events with caller number and IVR selection without interactive floating phone UI. | |

**User's choice:** Interactive Softphone & IVR Flow Simulator

---

| Option | Description | Selected |
|--------|-------------|----------|
| Shared UI Package (`@poco/ui/simulators/*`) | Export `RazorpayCheckoutModal` and `ExotelTelephonySimulator` from `@poco/ui` with theme-aware styling, so both Family Portal (wallet top-up) and Admin Portal (dev tools & ops call handler) can reuse identical components. | ✓ |
| Portal-Specific Local Components | Keep Razorpay modal inside `apps/family-portal` and Exotel dialer inside `apps/admin-portal`. | |

**User's choice:** Shared UI Package (`@poco/ui/simulators/*`)

---

| Option | Description | Selected |
|--------|-------------|----------|
| End-to-End Webhook Pipeline Execution | Simulators trigger real signed HMAC webhook requests (`/api/webhooks/v1/razorpay/*` and `/api/webhooks/v1/exotel/*`) to the backend API, verifying real signature validation, DB webhook event logging, and ticket/wallet ledger updates. | ✓ |
| Client-Side State Mutation Only | Simulators mutate client state directly without hitting webhook endpoints. | |

**User's choice:** End-to-End Webhook Pipeline Execution

---

| Option | Description | Selected |
|--------|-------------|----------|
| Standard Checkout UI Only | Strict realistic UI without developer test buttons (test scenarios triggered only from Admin Dev Tools). | ✓ |
| In-Modal Developer Action Bar | Quick action chips at the bottom of the checkout modal (`Simulate Success`, `Bank Decline`, `UPI Timeout`, `Invalid Signature`) allowing instant test execution without manual form filling. | |

**User's choice:** Standard Checkout UI Only

---

| Option | Description | Selected |
|--------|-------------|----------|
| Web Audio API DTMF Tones & Interactive Voice Prompts | Realistic DTMF dialpad audio tones on keypad press + synthesized voice prompt speech ("Welcome to Poco Care. Press 1 for Emergency...") with visual interactive transcript. | ✓ |
| Visual Transcript Only (Muted) | Text prompts and transcript indicators without synthesized sound effects. | |

**User's choice:** Web Audio API DTMF Tones & Interactive Voice Prompts

---

| Option | Description | Selected |
|--------|-------------|----------|
| Global Floating Softphone Widget & Banner Alert | A persistent telephony widget in the Admin Portal navigation bar that displays a ringing animation, plays a ringtone, displays caller/household summary, and expands into the full active call workspace upon clicking "Answer". | ✓ |
| Static Page-Based Call Screen | Call view only accessible by navigating to a dedicated `/admin/calls` route. | |

**User's choice:** Global Floating Softphone Widget & Banner Alert

---

| Option | Description | Selected |
|--------|-------------|----------|
| Responsive Modal to Bottom-Sheet Transition | Uses `@poco/ui` responsive dialog primitive (centered modal with backdrop on desktop `>=768px`, draggable slide-up bottom sheet with swipe-down-to-dismiss on mobile `<768px`). | ✓ |
| Fixed Center Modal on All Screens | Centered modal with fixed width/height across both mobile and desktop viewports. | |

**User's choice:** Responsive Modal to Bottom-Sheet Transition

---

## Webhook Ingestion & IoT Fall Alert Processing

| Option | Description | Selected |
|--------|-------------|----------|
| Transactional Ingestion & DB Event Log | Endpoints (`/api/webhooks/v1/*`) verify per-partner HMAC-SHA256 signature, validate schema via Zod, enforce idempotency key uniqueness in `WebhookEvent`, and execute immediate domain handlers with status tracking (`PENDING` -> `PROCESSED` \| `FAILED`). | ✓ |
| Stateless In-Memory Webhook Handlers | Process payloads directly in controller without persisting raw incoming webhooks to the database. | |

**User's choice:** Transactional Ingestion & DB Event Log

---

| Option | Description | Selected |
|--------|-------------|----------|
| Immediate Emergency Ticket Auto-Creation & Feed Event | Auto-creates an Emergency Ticket with `raisedByType: 'webhook'`, `priority: EMERGENCY`, spawns initial `EMERGENCY_AMBULANCE` service request, and writes an emergency system event to the household activity feed. | ✓ |
| Pending Triage Ticket Only | Creates ticket in `Pending Triage` state awaiting manual Ops Executive confirmation before emergency service request creation. | |

**User's choice:** Immediate Emergency Ticket Auto-Creation & Feed Event

---

| Option | Description | Selected |
|--------|-------------|----------|
| Silent Device Heartbeat + Missed-Ping Scanner | Ingest hourly ping updating `SeniorMedicalProfile.lastWearablePingAt` silently (no activity feed spam); periodic scanner evaluates any device missing pings > 75 minutes and auto-creates a `MISSED_WEARABLE_PING` routine ticket. | ✓ |
| Activity Feed Heartbeat Logger | Log every hourly ping as a subtle timeline entry in the activity feed. | |

**User's choice:** Silent Device Heartbeat + Missed-Ping Scanner

---

| Option | Description | Selected |
|--------|-------------|----------|
| Idempotent 200 OK with Cached Result | If the idempotency key was already successfully processed, return `200 OK` with `{ status: 'ALREADY_PROCESSED', eventId }` without re-executing side-effects, preventing duplicate tickets or ledger double-entries. | ✓ |
| HTTP 409 Conflict | Reject duplicate requests with a 409 Conflict error response. | |

**User's choice:** Idempotent 200 OK with Cached Result

---

## Partner Test Harness & Mock Configuration UI

| Option | Description | Selected |
|--------|-------------|----------|
| Comprehensive Integration Health & Config Dashboard (`/admin/integrations`) | Partner grid cards showing live status badge (`ACTIVE`, `MOCK_ONLY`, `DEGRADED`, `DOWN`), last ping time, error counters, inline JSON editor for `mockSettings`, and 1-click test ping trigger. | ✓ |
| Minimal Raw Table Viewer | Basic tabular view with standard CRUD on `IntegrationPartner` table without dedicated cards or latency graphs. | |

**User's choice:** Comprehensive Integration Health & Config Dashboard (`/admin/integrations`)

---

| Option | Description | Selected |
|--------|-------------|----------|
| Pre-Populated Scenario Presets + Custom JSON Editor | Pre-built realistic templates (e.g. "Pococare: Dispatch Ambulance", "1mg: Medicine Out for Delivery", "Orange Labs: Lipid Profile Ready", "Wearable: Fall Alert with High Heart Rate") with interactive param form and raw JSON mode. | ✓ |
| Raw JSON Input Only | Blank code editor requiring manual JSON payload entry. | |

**User's choice:** Pre-Populated Scenario Presets + Custom JSON Editor

---

| Option | Description | Selected |
|--------|-------------|----------|
| Visual Fault Injection Controls | Interactive latency slider (0ms - 3000ms), failure rate slider (0% - 100%), and error mode dropdown (`NONE`, `TIMEOUT_GATEWAY`, `HTTP_500_SERVER_ERROR`, `INVALID_HMAC_SIGNATURE`, `RATE_LIMIT_429`) updating `mockSettings` in real time. | ✓ |
| JSON-Only Configuration | Manual editing of `mockSettings` JSON string with no dedicated sliders or toggles. | |

**User's choice:** Visual Fault Injection Controls

---

| Option | Description | Selected |
|--------|-------------|----------|
| Dedicated Vitest Test Harness (`packages/integrations/src/__tests__/*`) | Comprehensive unit and integration test suite covering all 12 partner stubs, fault injection scenarios (timeout, bad signature, 500), webhook idempotency, and automated callback loops with 100% test coverage. | ✓ |
| Basic Smoke Tests Only | Lightweight ping test checking 200 OK responses on mock endpoints. | |

**User's choice:** Dedicated Vitest Test Harness (`packages/integrations/src/__tests__/*`)

---

## the agent's Discretion

- Internal helper method naming and mock data generation utilities within `packages/integrations`.
- Default synthesized audio tone frequencies and default mock latency values (e.g. 150ms default).

## Deferred Ideas

- None — discussion stayed strictly within Phase 2 scope.

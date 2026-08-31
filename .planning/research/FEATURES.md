# Feature Research

**Domain:** Elder Care Operations & Technology Platform (India / NRI Families)  
**Researched:** 2026-08-31  
**Confidence:** HIGH  

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete or operationally unviable in elder care.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Family Portal Dashboard & Wellness Snapshot** | Family members (often living in distant cities or NRI time zones) expect an immediate, zero-click wellness status upon login. | MEDIUM | Mobile-first Next.js UI showing senior health summary, open tickets, assigned care officer card, and emergency SOS button. |
| **Vitals & Health Records Tracking** | Families expect digital storage and trend visualization for vitals (BP, sugar, pulse, SpO2) and prescription vaults. | MEDIUM | Aggregates field officer logs, partner diagnostics (Orange Labs), and manual vitals entries. |
| **Household & Senior Onboarding Flow** | Standard customer onboarding allowing primary payer to define household, add 1–4 seniors, record ICE medical profile, and input hospital preferences. | MEDIUM | Seamless signup creating a Person + Lead entity; immediate access while physical status remains Pending until visit completion. |
| **Role-Gated Family Membership Management** | Primary payer must control who has access to view parent records and approve costs. | LOW | Primary family member can invite/remove secondary family members; all invited members have identical viewing and payment authority. |
| **Per-Household Digital Wallet & Invoicing** | Families expect transparent wallet balance tracking, instant top-ups, and downloadable tax/GST invoices. | MEDIUM | Per-household wallet (never global family account). Auto-debit on service fulfillment with downloadable PDF/statement logs. |
| **Tiered Subscription Engine (Kavach, Sahara, Sampoorna)** | Elder care customers expect clear monthly/yearly plans with predictable service quotas. | MEDIUM | Quota allocation per billing cycle (monthly/yearly), cycle usage counters, and automated quota exhaustion checks. |
| **Emergency Negative-Balance Auto-Debit** | In life-critical situations (ambulance, hospital admission), care cannot be gated by zero wallet balances. | HIGH | Step 1 of the 3-step billing decision tree: emergency services are delivered unconditionally, debiting the wallet into a negative balance. |
| **Unified Ticket & Service Request Lifecycle** | Ops and families need transparent, deterministic tracking of requests from intake to resolution. | HIGH | Uniform finite state machine (Open -> Assigned -> In Progress -> Pending Approval -> Completed -> Closed, Cancelled, Waiting Ops Update) with automatic rollup from child service requests. |
| **Inbound Telephony Ticket Creation (Exotel)** | Seniors and frantic relatives frequently call helpline numbers directly rather than using app forms. | MEDIUM | Inbound IVR calls automatically spawn tickets with an ops handling UI and capture caller audio metadata. |
| **Offline-First Field App (WatermelonDB / SQLite)** | Field care officers visit households in basement apartments, elevators, and low-connectivity zones across Indian metros. | HIGH | Local-first datastore syncing assigned households, active SOPs, and visit schedules with client-generated UUIDs and conflict-resolution rules. |
| **Guided SOP Step Execution with Checklists** | Standardized, high-quality care delivery requires foolproof step-by-step checklists rather than free-form notes. | MEDIUM | Wizard-like choice-driven UI (step 1 of N), minimizing free text and mandating binary completions. |
| **Direct S3 Presigned URL Media Capture** | Proof-of-visit, vitals photos, and doctor prescriptions must be captured on the field without overloading the server. | MEDIUM | Field App captures photos/audio, uploads directly to S3-compatible cloud storage via backend presigned URLs, storing only URL pointers in PostgreSQL. |
| **Geofenced Visit Check-in & Scheduling** | Operations and family need verification that care officers physically visited the residence on time. | MEDIUM | GPS lat/lng capture on check-in/check-out with timestamp verification against scheduled visit windows. |
| **High-Density Admin Ops Queues** | Ops executives handling hundreds of daily service events require table-driven, keyboard-friendly triage. | HIGH | Dedicated queues for Pending Triage, Waiting Ops Update, and SLA At-Risk with inline decomposition and assignment actions. |
| **Customer Success & Sales Lead Handoff** | Structured conversion pipeline from marketing lead to active onboarded household. | MEDIUM | Explicit ownership transition: Sales owns lead from signup through onboarding form; Customer Success takes ownership for visit scheduling and officer assignment. |
| **Partner Integration Stubs (12 Partners)** | Elder care relies on ecosystem partners (ambulance, pharmacy, labs, home nursing, cabs, groceries, legal). | HIGH | Deterministic backend stubs for Pococare, Razorpay, ABHA, Exotel, WhatsApp, 1mg, Orange Labs, Health Services, Instamart, Swiggy, Urban Company, Ola. |

---

### Differentiators (Competitive Advantage)

Features that set Poco apart from traditional fragmented elder care agencies and tech competitors.

| Feature | Value Proposition | Complexity | Notes |
|---------|--------------|------------|-------|
| **AI-Assisted Chat Classification to Tickets** | Bridges unstructured, emotional family chat with rigid operational ticketing without alienating the user. | HIGH | Ingests free-form chat in the activity feed, enqueues `ai-classification` jobs via LLM, and auto-proposes structured tickets in `Pending Triage` state with human-in-the-loop validation. |
| **Unified Per-Household Activity Timeline** | Combines system events (vitals logged, SOP step completed, ambulance dispatched) with two-way family/officer messaging in a single scrollable feed. | MEDIUM | Eliminates fragmented communication across WhatsApp groups and separate ticketing portals; single source of truth for the senior's daily life. |
| **Dual Non-Intersecting Escalation Trees** | Decouples family customer-service notifications from internal operational life-safety escalations. | HIGH | **Family Tree**: configurable escalation delay for unacknowledged notifications & payment top-ups. **Internal Tree**: automatic SOP/SLA-driven escalation (Care Officer -> Senior Care Officer fallback). |
| **Strict 3-State SLA Tracking (Normal, At Risk, Breached)** | Provides predictable, automated escalation triggers before care delivery breaks down. | MEDIUM | Orthogonal state engine evaluated asynchronously via pg-boss background jobs without stalling transactional writes. |
| **Versioned Catalog & Package Grandfathering** | Protects existing customer contracts and grandfathered pricing while allowing catalog and pricing iteration. | HIGH | PackageVersion and ServiceCatalogVersion entities ensure existing subscriptions remain pinned to original terms upon renewal until explicit migration. |
| **Care Officer Manager Certification Gating** | Guarantees quality and compliance by cryptographically preventing assignment of unqualified field officers. | MEDIUM | Backend business rule prevents CareOfficerAssignment unless the officer possesses non-expired records for all mandatory certifications. |
| **Dedicated 1:1 Care Officer Relationship** | Ensures emotional trust and single-point accountability for families, rather than impersonal gig-worker dispatching. | MEDIUM | Strict 1:1 household-to-officer assignment invariant enforced at the database and service layers, reassignable only by Care Officer Manager. |
| **Realistic Integration Stubs & Test Harness UI** | Enables full end-to-end operational dry runs, mock emergency drills, and automated regression testing without third-party sandboxes. | HIGH | Admin Portal dashboard to view integration health, modify latency/error simulation configs, fire simulated webhooks, and trigger Playwright e2e suites. |
| **Interactive Frontend Mocks (Razorpay & Exotel)** | Allows complete simulation of external payment modal and inbound call telephony handling in development/staging. | MEDIUM | Standalone interactive UI overlays simulating payment success/failure webhooks and softphone call popups. |

---

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem appealing on the surface but introduce severe operational hazards, memory bloat, or premature complexity in this phase.

| Feature | Why Requested | Why Problematic | Alternative / Intentional Boundary |
|---------|---------------|-----------------|-----------------------------------|
| **Nivas (High-Dependency / Long-Term Care)** | Families often ask for live-in attendants, 24/7 GNM nurses, bed rentals, and palliative care. | High clinical liability, intensive staffing logistics, high turnover, and distinct operational dynamics that dilute focus on assisted living and active elder care. | Excluded entirely from v1. No database tables, schemas, or UI placeholders created. |
| **Real-Time WebSockets / Push Messaging for Chat** | Modern chat apps (WhatsApp/Slack) use WebSockets for instant message delivery. | High persistent connection memory footprint on a 1GB DigitalOcean droplet; complex connection state and reconnection logic. | Polling-based Activity Feed (GET /households/current/feed) on screen open and periodic interval (10–15s). Chat feels fast without socket overhead. |
| **Multi-Household Aggregated Family Dashboard** | Paying family members with multiple households (e.g. parents in Chennai, in-laws in Pune) want a single consolidated view. | Multiplies query complexity, introduces confusing permission rollups, and compromises the per-household wallet and 1:1 care officer relationship invariants. | Strict per-household scoping. Users with >1 household use an explicit household switcher dropdown in the navigation header. |
| **Live Third-Party Production API Calls** | Stakeholders may want live API connections to 1mg, Swiggy, Uber/Ola, or hospitals immediately. | Third-party sandboxes in India are notoriously flaky, require contractual lead times, incur per-call costs, and introduce unpredictable network failures during development. | Realistic, self-contained mock stubs with full schema validation and Admin Portal simulation harnesses. |
| **Mid-Cycle Subscription Package Upgrades/Downgrades** | Families might want to switch between Sahara and Sampoorna mid-month. | Causes complex proration calculations, fractional quota adjustments, and edge cases in billing refunds. | Subscription plan changes take effect strictly at the start of the next billing cycle. |
| **Direct Standalone Redis / Heavy Message Broker (Kafka/RabbitMQ)** | Standard enterprise backend architectures default to Redis/BullMQ and Kafka for queues and caching. | Running separate Redis/RabbitMQ containers exceeds the 1GB RAM ceiling of the single-droplet target environment. | Use PostgreSQL-backed pg-boss for queues (zero extra processes, transactional enqueue) and in-process LRU cache for read paths. |
| **Direct AI Ticket Auto-Execution (No Human-in-the-Loop)** | Desire to fully automate service creation from family chat directly to partner dispatch. | LLM hallucinations could dispatch ambulances or bill families for casual remarks (e.g., 'Dad felt dizzy yesterday'). | AI only proposes tickets in Pending Triage state. Operations executives must confirm, decompose, or dismiss before service requests activate. |
| **Direct Care Officer Reassignment by Field Staff or Seniors** | Care officers or senior care officers might want to reassign accounts when busy. | Destroys workload balance, breaks accountability, and undermines Care Officer Manager operational governance. | Only internal users holding the Care Officer Manager role can create or mutate CareOfficerAssignment records. |

---

## Feature Dependencies

```
[Identity & External/Internal Auth]
    └──requires──> [Household & Senior Domain Models]
                       ├──requires──> [1:1 Care Officer Assignment (Manager Gated)]
                       │                  └──requires──> [Certification Compliance Engine]
                       │
                       ├──requires──> [Versioned Package & Subscription Engine]
                       │                  ├──requires──> [Versioned Service Catalog & Unit Pricing]
                       │                  └──requires──> [Per-Household Wallet & 3-Step Billing Engine]
                       │
                       ├──requires──> [Unified Ticket & Service Request Engine]
                       │                  ├──requires──> [Standard Lifecycle State Machine]
                       │                  ├──requires──> [3-State SLA Tracking Engine]
                       │                  │                  └──requires──> [Internal Senior Care Officer Fallback]
                       │                  ├──requires──> [Family Notification Escalation Tree]
                       │                  └──requires──> [Partner Integration Stubs & SOPs]
                       │
                       └──requires──> [Unified Activity Feed]
                                          ├──enhances──> [Care Officer Field Interactions]
                                          └──requires──> [Async pg-boss AI Classification Queue]
                                                             └──proposes──> [Pending Triage Tickets in Ops Queue]
```

### Dependency Notes

- **1:1 Care Officer Assignment requires Certification Compliance:** A Care Officer Manager cannot assign an officer to a household until the officer's CertificationRecord has completed all mandatory certifications (isMandatoryForAssignment = true).
- **Service Request Billing requires Versioned Service Catalog:** When a quota is exhausted, the billing engine evaluates the specific ServiceCatalogVersion.priceInr pinned to the household's subscription cycle, preventing pricing discrepancies.
- **Internal Escalation requires Reporting Line Hierarchy:** When a service request breaches its delivery SLA, the SLA engine automatically re-routes the task to the officer's designated Senior Care Officer via the ReportingLine table.
- **Family Notification Escalation requires Family Escalation Tree:** If a wallet top-up request or critical non-emergency notice is unacknowledged after delayMinutes, it escalates to the next family member defined in FamilyEscalationEntry.
- **AI Ticket Proposal requires Activity Feed & Ops Triage:** AI classification never executes mutations directly; it reads from ActivityFeedItem, runs via pg-boss, and outputs to AIClassificationResult with a Pending Triage ticket for human review.
- **Offline SOP Completion requires S3 Presigned URL Architecture:** Field App logs step completions locally, uploads photos directly to S3 via presigned URLs upon reconnect, and submits metadata to the backend batch sync endpoint (/api/field/v1/sync/batch).

---

## MVP Definition

### Launch With (v1)

Minimum viable product required for end-to-end care coordination and validation across Family, Field, and Ops surfaces.

- [ ] **Monorepo Architecture & Shared Business Rules** — @poco/types, @poco/validation, @poco/business-rules, @poco/constants, @poco/design-tokens, @poco/ui.
- [ ] **Dual Authentication & Role-Based Authorization** — External JWT (Person, HouseholdMembership) and Internal Multi-Role JWT (InternalUser, UserRole).
- [ ] **Relational Data Model & Prisma Schema** — Full entity schema with strict 1:1 household assignment, grandfathered versioning, and wallet isolation.
- [ ] **Uniform Ticket & Service Request Lifecycle** — 6-state lifecycle engine with Waiting Ops Update exception handling and automatic status rollup.
- [ ] **Dual SLA & Escalation Engine** — Orthogonal Normal -> At Risk -> Breached evaluation with automatic internal Senior Care Officer escalation and family escalation ladder.
- [ ] **Versioned Catalog & 3-Step Billing Engine** — Emergency auto-debit (negative balance permitted), positive auto-debit for requested services, and family approval holds.
- [ ] **Care Officer Manager Assignment & Certification Gating** — Mandatory certification validation prior to assignment.
- [ ] **Lead Lifecycle & Field Activation** — Sales -> Customer Success handoff, in-person onboarding visit recording, and field activation.
- [ ] **Unified Activity Feed & Async AI Classification** — Polling feed, pg-boss LLM classification queue, and ops human-in-the-loop triage UI.
- [ ] **Offline-First Field App with Guided SOPs** — Local SQLite storage, choice-driven checklist UI, geofenced visits, and S3 presigned photo uploads.
- [ ] **Family Portal Dashboard** — Wellness snapshot, vitals trends, emergency contacts/ICE, wallet top-up mock, and family invites.
- [ ] **Admin Portal Operations Suite** — High-density queues (Pending Triage, Waiting Ops Update, SLA At-Risk), catalog/package manager, raw DB viewer, and test dashboard.
- [ ] **Realistic Integration Stubs (12 Partners) & UI Mocks** — Complete backend stubs + Razorpay/Exotel frontend simulation modals.
- [ ] **Seed Data & Automated Test Suite** — Seed generator (50 officers, 200 households), Vitest unit tests, and Playwright e2e tests.

### Add After Validation (v1.x)

Features to introduce once initial households and field operations are running smoothly.

- [ ] **AI-Drafted Monthly Care Reports** — LLM pre-aggregates activity feed milestones and vitals into a structured draft for Care Officer review before publishing to the family.
- [ ] **Smart Visit Route Optimization** — Geographic clustering of daily visit schedules for Care Officers to minimize transit time across Indian metro traffic.
- [ ] **Voice-to-Text Clinical Note Dictation** — Speech-to-text in the Field App for vernacular Hindi/Tamil/Kannada/Bengali care notes.
- [ ] **Automated Bank Statement OCR for Financial SOPs** — Automated extraction of pension/utility payment receipts uploaded by Care Officers.

### Future Consideration (v2+)

Features deferred until product-market fit is established and infrastructure scale permits.

- [ ] **Nivas (High-Dependency & Palliative Care)** — Live-in caregiver tracking, 24/7 ICU nurse rosters, and medical equipment rental logistics.
- [ ] **Wearable Continuous Stream Ingestion** — Live telemetry (ECG, continuous SpO2, heart rate variability) from certified medical wearables.
- [ ] **Senior-Specific Voice/Tablet Surface** — Simplified senior-friendly voice UI or tablet console using reserved senior credentials.
- [ ] **AI Clinical Deterioration Alerts** — Multi-signal predictive analytics flagging subtle geriatric declines (mobility slowing, vitals variance) across IHI 4Ms reviews.

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| **Core Relational Schema & Auth** | HIGH | MEDIUM | P1 |
| **Ticket & Service Request Lifecycle** | HIGH | HIGH | P1 |
| **Dual SLA & Escalation Engine** | HIGH | MEDIUM | P1 |
| **3-Step Billing & Wallet Engine** | HIGH | HIGH | P1 |
| **Officer Assignment & Certification Gate** | HIGH | MEDIUM | P1 |
| **Unified Activity Feed & AI Triage** | HIGH | HIGH | P1 |
| **12 Partner Integration Stubs & Mocks** | HIGH | HIGH | P1 |
| **Single-Droplet Tech Stack & Queue** | HIGH | HIGH | P1 |
| **Unified REST API Layer** | HIGH | MEDIUM | P1 |
| **Design Tokens & Navigation Maps** | HIGH | MEDIUM | P1 |
| **Surface UIs (Family, Field, Admin)** | HIGH | HIGH | P1 |
| **Seed Generator & Playwright E2E** | HIGH | MEDIUM | P1 |
| **AI Monthly Care Report Summarizer** | MEDIUM | MEDIUM | P2 |
| **Vernacular Speech-to-Text Notes** | MEDIUM | HIGH | P2 |
| **Nivas Long-Term Care Module** | HIGH | VERY HIGH | P3 |
| **Continuous Real-Time WebSockets** | LOW | HIGH | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

---

## Competitor Feature Analysis

| Feature | Emoha Elder Care | Anvayaa Care | Our Approach |
|---------|------------------|--------------|--------------|
| **Care Delivery Model** | Emergency coordination + app community; heavy reliance on third-party aggregators. | Relationship manager + field coordinators; fragmented WhatsApp coordination. | **Dedicated 1:1 Care Officer ownership** per household with strict Care Officer Manager governance and mandatory certification gating. |
| **Family Communication** | Generic ticketing portal + manual call center updates. | Dedicated WhatsApp groups; updates get buried in chat history. | **Unified per-household Activity Feed**: single stream blending vitals/SOP milestones with family chat, backed by AI message classification. |
| **Emergency Handling** | 24/7 call desk; dispatches local ambulances, requires upfront payment or insurance pre-auth. | Emergency response button; coordinates with empanelled hospitals and family. | **Unconditional Emergency Auto-Debit**: ambulance dispatched instantly via Pococare; wallet auto-debited even into negative balance. |
| **Field Tech & Compliance** | Basic mobile attendance check-in. | Mobile coordinator app with manual status updates. | **Offline-First Guided Field App**: local SQLite sync, checklist-driven SOP execution, GPS geofencing, and direct S3 presigned photo proof. |
| **Billing & Grandfathering** | Fixed annual plans; pricing updates disrupt renewing members. | Monthly/annual retainers with manual invoice adjustments. | **Versioned Catalog & Packages**: Household subscriptions pinned to exact PackageVersion terms with automated quota counters and 3-step billing hierarchy. |
| **Escalation Hierarchy** | Single customer support escalation queue. | Ad-hoc call escalation to city head. | **Dual Non-Intersecting Trees**: Family-configured payment/ack delays vs. Automated SOP/SLA breach fallback to Senior Care Officer. |

---

## Sources

- docs/poco-elder-care-design-brief.md (Authoritative system design, business invariants, and architecture)
- .planning/PROJECT.md (Scope boundaries, deployment constraints, 1GB DO droplet profile)
- IHI 4Ms Framework (What Matters, Medication, Mentation, Mobility)
- ABHA (Ayushman Bharat Digital Mission) Health Data Specifications
- Competitor benchmarks: Emoha, Anvayaa, Samarth Care

---
*Feature research for: Elder Care Operations & Technology Platform*  
*Researched: 2026-08-31*

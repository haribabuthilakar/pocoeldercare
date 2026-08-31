# Requirements: Poco Elder Care Platform

**Defined:** 2026-08-31
**Core Value:** Reliable, transparent, and empathetic elder care delivery where families have continuous peace of mind and field officers have streamlined tools to deliver coordinated care.

## v1 Requirements

### Authentication, Multi-Role Access & Household Context

- [ ] **AUTH-01**: External users (family members/seniors) can sign up with phone/email and authenticate via JWT.
- [ ] **AUTH-02**: Internal staff can authenticate with role-based JWT supporting multiple simultaneous roles (e.g. Care Officer + Training Manager).
- [ ] **AUTH-03**: Primary family members can invite and remove family members for their specific household.
- [ ] **AUTH-04**: Invited family members have full access to view wellness, pay invoices, and approve services, but cannot administer family membership.
- [ ] **AUTH-05**: Users associated with multiple households can switch their active household context via a dropdown selector.
- [ ] **AUTH-06**: Field App access is automatically granted to any internal user holding the Care Officer role.

### Onboarding, Sales-to-CS Handoff & Activation

- [ ] **ONBD-01**: New customer signups automatically create a Lead record owned initially by the Sales Executive role.
- [ ] **ONBD-02**: Users can onboard a household and add 1 to 4 seniors with emergency medical ICE, insurance, and preferred hospital details.
- [ ] **ONBD-03**: Submitting the onboarding form transitions the lead ownership from Sales to Customer Success in `Pending` onboarding status.
- [ ] **ONBD-04**: Care Officers can log the mandatory in-person onboarding visit on the Field App.
- [ ] **ONBD-05**: Care Officers can explicitly activate the household on the Field App upon visit completion, transitioning household status to `Active`.

### Care Officer Assignment, Certifications & Fallback

- [ ] **CARE-01**: System enforces a strict 1:1 active mapping between each household and exactly one assigned Care Officer.
- [ ] **CARE-02**: Only internal users holding the Care Officer Manager role can create or modify household care officer assignments.
- [ ] **CARE-03**: Care Officer assignment is strictly blocked by the backend unless the officer has active, non-expired records for all mandatory certifications.
- [ ] **CARE-04**: Senior Care Officers can view households and performance metrics for all Care Officers reporting to them via `ReportingLine`.
- [ ] **CARE-05**: When an assigned Care Officer is unresponsive or breaches service delivery SLAs, the supervising Senior Care Officer is automatically assigned as fallback.

### Ticket & Service Request Lifecycle & Operations Triage

- [ ] **TCKT-01**: Tickets can be raised by seniors, family members, Care Officers, inbound Exotel phone-in IVR, missed wearable pings, or AI classification.
- [ ] **TCKT-02**: Operations Executives can triage tickets into 1 to N child Service Requests, each referencing an immutable `ServiceCatalogVersion`.
- [ ] **TCKT-03**: Service Requests follow a uniform lifecycle state machine (`Open -> Assigned -> In Progress -> Pending Approval -> Completed -> Closed`, `Cancelled`, `Waiting Ops Update`).
- [ ] **TCKT-04**: Parent ticket status automatically aggregates from child service request states using standard rollup rules.
- [ ] **TCKT-05**: Inbound phone calls via Exotel stub automatically create a ticket and open an active handling UI for the Operations Executive.
- [ ] **TCKT-06**: When child service requests produce conflicting or ambiguous rollup states, parent ticket automatically transitions to `Waiting Ops Update`.
- [ ] **TCKT-07**: Operations Executives can triage and resolve `Waiting Ops Update` tickets directly from the Admin Portal queue.

### Dual SLA State Machine & Escalation

- [ ] **SLA-01**: System evaluates response SLA and delivery SLA clocks independently for each active Service Request.
- [ ] **SLA-02**: Orthogonal SLA state machine tracks exactly three states: `Normal`, `At Risk`, and `Breached`.
- [ ] **SLA-03**: Scheduled background worker (`sla-transition` queue) transitions SLA states as due times approach or expire.
- [ ] **SLA-04**: Service delivery SLA breach triggers internal escalation to the assigned officer's supervising Senior Care Officer.
- [ ] **SLA-05**: Family Portal provides a separate, family-configurable escalation tree for unacknowledged notifications and pending payment chasing.

### Versioned Service Catalog, Packages & Grandfathering

- [ ] **CATL-01**: Service Catalog items are versioned (`ServiceCatalogVersion`) with unit pricing (`priceInr`), default emergency flags, and owner types.
- [ ] **CATL-02**: Packages (Kavach, Sahara, Sampoorna) are versioned (`PackageVersion`) with configurable monthly/yearly rates and per-service quotas (`PackageServiceQuota`).
- [ ] **CATL-03**: Household subscriptions pin to the specific `packageVersionId` in effect at subscription or renewal, preserving grandfathered terms.
- [ ] **CATL-04**: Service Requests pin to the specific `serviceCatalogVersionId` in effect at creation time, preserving historical SOP terms and pricing.
- [ ] **CATL-05**: Administrators can publish new catalog and package versions without altering existing active subscriptions.

### Billing, Quotas & Household Wallet Engine

- [ ] **BILL-01**: Each household has exactly one dedicated digital wallet with a ledger audit trail (`WalletTransaction`).
- [ ] **BILL-02**: Service usage first decrements available `QuotaUsage` against the household's active package quota for the active billing cycle.
- [ ] **BILL-03**: For out-of-quota or pay-per-use services, emergency services (catalog default or ops override) auto-debit the wallet, allowing negative balances.
- [ ] **BILL-04**: For non-emergency user-requested services, the system auto-debits the wallet if balance is sufficient.
- [ ] **BILL-05**: For services with insufficient balance or staff-suggested services, the system places the request in `Pending Approval` and notifies the family.
- [ ] **BILL-06**: Family members can initiate wallet top-ups via the Razorpay payment gateway integration mock.
- [ ] **BILL-07**: System generates downloadable invoices for all subscription renewals and wallet transactions.

### Unified Activity Feed & Async AI Classification

- [ ] **FEED-01**: System provides a single unified per-household activity feed blending system events (vitals, visits, tickets) and two-way chat.
- [ ] **FEED-02**: Family members and assigned Care Officers can post free-form chat messages visible identically in Family Portal and Field App.
- [ ] **FEED-03**: Clients poll the activity feed endpoint while active on screen to fetch new messages and timeline events.
- [ ] **FEED-04**: Posting a free-form message enqueues an asynchronous `ai-classification` job in `pg-boss`.
- [ ] **FEED-05**: AI worker analyzes message intent, extracts suggested service catalog items, and assigns a confidence score using Claude structured JSON output.
- [ ] **FEED-06**: High-confidence messages auto-create a ticket in `Pending Triage` state with a status chip rendered in the activity feed.
- [ ] **FEED-07**: Operations Executives in the Admin Portal can confirm `Pending Triage` tickets into service requests or dismiss false positives.

### Field Mobile App, Guided SOPs & Offline Sync

- [ ] **FLD-01**: Field App operates offline-first using local SQLite / WatermelonDB data storage.
- [ ] **FLD-02**: Care Officers can view assigned households, senior health profiles, and scheduled visits without network connectivity.
- [ ] **FLD-03**: Care Officers execute SOPs using guided checklist wizards with step-level done/not-done verification.
- [ ] **FLD-04**: Photo and media attachments upload directly to S3 via presigned URLs; only presigned S3 URLs are submitted to the backend.
- [ ] **FLD-05**: Care Officers perform GPS geofenced check-in and check-out for household visits.
- [ ] **FLD-06**: Offline actions queue locally with client-generated UUIDs and push to backend on reconnect via `POST /api/field/v1/sync/batch`.
- [ ] **FLD-07**: Server enforces authoritative validation on sync, rejecting illegal state transitions and surfacing conflict resolution UI.

### Admin Portal & Operations Queues

- [ ] **ADMN-01**: Admin Portal provides high-density, keyboard-friendly queues for `Pending Triage`, `Waiting Ops Update`, and `SLA At Risk` tickets.
- [ ] **ADMN-02**: Operations Executives can apply emergency overrides and reassign dynamic service request owners across workflow stages.
- [ ] **ADMN-03**: Care Officer Manager interface enables household assignments with automated pre-assignment certification checks.
- [ ] **ADMN-04**: Admin Portal provides a lead pipeline management view with Sales-to-CS ownership transitions and payment reminder triggers.
- [ ] **ADMN-05**: Admin Portal provides a read-only, paginated raw database table viewer for administrative inspection.

### 12-Partner Integration Stubs & Interactive UI Mocks

- [ ] **INTG-01**: Backend provides realistic stubs for Pococare, Razorpay, ABHA, Exotel, WhatsApp, 1mg, Orange Labs, Health Services, Instamart, Swiggy, Urban Company, and Ola.
- [ ] **INTG-02**: System provides interactive frontend modal mocks for Razorpay payment checkout and Exotel telephony IVR.
- [ ] **INTG-03**: Hourly healthy wearable ping webhooks are ingested silently; missed pings automatically generate an alert ticket for operations.
- [ ] **INTG-04**: Real-time wearable fall alert webhooks immediately auto-create an emergency ticket and trigger ops alerting.
- [ ] **INTG-05**: Admin Portal integration management interface displays stub health, allows JSON stub config editing, and supports sending test payloads.

### Testing Harness, Seed Data & Droplet Deployment

- [ ] **TEST-01**: Database seed script populates >=2 users per internal role, ~50 care officers, and ~200 households (1-4 seniors each) with realistic clinical/financial data.
- [ ] **TEST-02**: Comprehensive Vitest unit and integration test suite verifies state machines, SLA timers, billing rules, and RBAC security.
- [ ] **TEST-03**: Playwright end-to-end test suite covers complete customer journeys across Family Portal, Field App, and Admin Portal.
- [ ] **TEST-04**: Admin Portal includes a test runner dashboard displaying test execution history, status, and failed background jobs.
- [ ] **TEST-05**: Single Docker Compose stack packages Nginx, NestJS (with in-process `pg-boss` workers), and PostgreSQL 16 tuned for a 1GB DigitalOcean droplet.

## v2 Requirements

### Wearable & Clinical Intelligence

- **CLIN-01**: Native hardware/wearable direct device token authentication for seniors.
- **CLIN-02**: Real-time biometric streaming and AI-driven clinical deterioration alerts from continuous vitals.
- **CLIN-03**: AI-drafted monthly wellness report summaries for care officer review before family delivery.

### Doctor Teleconsultation Workflows

- **DOC-01**: Real-time video teleconsultation room integration with empanelled doctors.
- **DOC-02**: In-app digital prescription generation and automated pharmacy dispatch loop.

## Out of Scope

| Feature | Reason |
|---------|--------|
| **Nivas (High-Dependency Long-Term Care)** | Live-in attendants, GNM nurses, equipment rental, and palliative care excluded from v1 MVP. |
| **Aggregated Cross-Household Views** | Financial and clinical liability is strictly household-scoped; context switching via dropdown is required. |
| **Real-Time WebSocket Server** | High RAM connection overhead on 1GB droplet; client-side polling on active screens is sufficient. |
| **Live 3rd-Party Production APIs** | High-fidelity realistic stubs with admin test harnesses used to ensure deterministic execution. |
| **Mid-Cycle Plan Changes** | Quota changes and plan upgrades/downgrades apply strictly at monthly/yearly billing renewal boundaries. |
| **Standalone Redis / RabbitMQ** | Memory footprint exceeds 1GB droplet budget; in-process `pg-boss` and memory LRU cache used. |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 .. AUTH-06 | Phase 1, Phase 3 | Pending |
| ONBD-01 .. ONBD-05 | Phase 3, Phase 4, Phase 6 | Pending |
| CARE-01 .. CARE-05 | Phase 1, Phase 3, Phase 4 | Pending |
| TCKT-01 .. TCKT-07 | Phase 1, Phase 3, Phase 4 | Pending |
| SLA-01 .. SLA-05 | Phase 1, Phase 3, Phase 5 | Pending |
| CATL-01 .. CATL-05 | Phase 1, Phase 3, Phase 4 | Pending |
| BILL-01 .. BILL-07 | Phase 1, Phase 3, Phase 5 | Pending |
| FEED-01 .. FEED-07 | Phase 3, Phase 5, Phase 7 | Pending |
| FLD-01 .. FLD-07 | Phase 6 | Pending |
| ADMN-01 .. ADMN-05 | Phase 4 | Pending |
| INTG-01 .. INTG-05 | Phase 2, Phase 4 | Pending |
| TEST-01 .. TEST-05 | Phase 8 | Pending |

**Coverage:**
- v1 requirements: 65 total
- Mapped to roadmap: 65
- Unmapped: 0 ✓

---
*Requirements defined: 2026-08-31*
*Last updated: 2026-08-31 after initial definition*

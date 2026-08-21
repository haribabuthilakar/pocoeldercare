# Requirements: Pococare Elder Care Platform

**Defined:** 2026-08-21
**Core Value:** Uncompromising reliability and peace of mind for families through rapid, SLA-backed emergency coordination, verified in-person care officer visits, and transparent operational visibility.

## v1 Requirements

### 1. Foundation & Core Backend API (FND)

- [ ] **FND-01**: Monorepo workspace setup with Turborepo, pnpm, NestJS REST API, Next.js web applications, and React Native mobile app.
- [ ] **FND-02**: PostgreSQL and Prisma schema modeling Households, Members, Roles, 90-Service Catalog, SOP Templates, Subscriptions, Wallets, and Service Executions.
- [ ] **FND-03**: Authentication and Role-Based Access Control (RBAC) supporting family members, care officers, dispatchers, ops admins, and doctors.
- [ ] **FND-04**: REST API endpoints for member onboarding, household management, and ICE emergency medical profile CRUD with <2s target retrieval.
- [ ] **FND-05**: REST API endpoints for dynamic SOP template versioning and checklist execution lifecycle.
- [ ] **FND-06**: REST API for Doctor Home Visit and GP/Specialist Teleconsultation scheduling, clinical notes, and prescription attachment.
- [ ] **FND-07**: In-app INR wallet balance ledger, debit/credit audit logging, and monthly automated invoice generation.
- [ ] **FND-08**: Comprehensive test suite with Vitest (unit & integration) and Docker local containerization.

### 2. Family Portal Web Application (FAM)

- [ ] **FAM-01**: Secure login and multi-household dashboard for family members (primary child and invited viewers).
- [ ] **FAM-02**: Vitals trend visualization (BP, SpO2, Blood Sugar, Pulse, Weight) with baseline comparison and plain-language summary.
- [ ] **FAM-03**: Dual-timezone interactive calendar showing upcoming doctor visits, care officer visits, and diagnostics in IST and family local time.
- [ ] **FAM-04**: Service request catalog for booking included and pay-per-use services with upfront pricing.
- [ ] **FAM-05**: Wallet top-up via domestic payment gateway, balance tracking, and itemized billing invoice download.
- [ ] **FAM-06**: Monthly value digest view showcasing completed visits, clinical catches, and quantified savings.
- [ ] **FAM-07**: Named Care Officer profile display including photo, bio, direct contact, and published caseload.

### 3. Field App for Care Officers (FLD)

- [ ] **FLD-01**: Mobile authentication and daily visit schedule with optimized route sequencing.
- [ ] **FLD-02**: Offline-first visit execution with local SQLite caching and automatic background sync.
- [ ] **FLD-03**: Dynamic SOP checklist runner rendering required step types (binary, photo, numeric, signature) in < 5 minutes.
- [ ] **FLD-04**: Vitals recording module supporting manual entry and Bluetooth RPM device auto-capture.
- [ ] **FLD-05**: Household medication review and refill status checklist.
- [ ] **FLD-06**: Guided insurance and cashless claims document capture workflow.
- [ ] **FLD-07**: Emergency dry-run drill mode to simulate an emergency response end-to-end with the household.

### 4. Operations CRM & Admin Hub (OPS)

- [ ] **OPS-01**: Live multi-city operations monitoring dashboard for scheduled visits, open requests, and SLA statuses.
- [ ] **OPS-02**: Household CRM timeline capturing all calls, visits, complaints, and at-risk churn indicators.
- [ ] **OPS-03**: Doctor panel and third-party partner organisation management with availability rosters.
- [ ] **OPS-04**: Intelligent field task auto-assignment with score breakdown and reason-mandated manual override.
- [ ] **OPS-05**: Visual catalog composer and SOP template version editor.
- [ ] **OPS-06**: Partner payout reconciliation engine rolling up completed field executions.
- [ ] **OPS-07**: Centralized deterioration alert view triggering proactive care officer visit dispatch.

### 5. Emergency Dispatcher Command Centre (EMG)

- [x] **EMG-01**: Real-time emergency queue with priority ranking for device alerts (fall/SOS) and inbound PSTN calls.
- [x] **EMG-02**: Exotel CTI caller ID mapping displaying member identification and ICE profile in < 2 seconds.
- [x] **EMG-03**: One-click BLS ambulance dispatch and hospital pre-brief sheet transmission.
- [x] **EMG-04**: Live visual countdown timer against published response SLAs with supervisor auto-escalation.
- [x] **EMG-05**: Timezone-aware automated family escalation call tree.
- [x] **EMG-06**: Emergency event closure logging (resolved, hospitalized, false alarm) and weekly SLA performance rollup.

### 6. Telephony Voice Ingestion & Integrations (INT)

- [ ] **INT-01**: Dedicated phone line recording webhook via Exotel for elder non-emergency requests.
- [ ] **INT-02**: Speech-to-text pipeline using Google Cloud STT v2 for Indian regional languages (Hindi, Tamil, Telugu, Kannada, etc.).
- [ ] **INT-03**: LLM-powered structured extraction converting elder voicemails into categorized CRM tasks.
- [ ] **INT-04**: ABHA (Ayushman Bharat Health Account) sync status monitoring per household.
- [ ] **INT-05**: Community & Content lead mobile interface for rapid event and photo logging.
- [ ] **INT-06**: Diagnostic lab partner webhook integration for automated test report ingestion.

---

## v2 Requirements

### High Dependency & Advanced Integrations

- **NIVAS-01**: Live-in 24x7 attendant scheduling, biometric shift verification, and replacement bench management.
- **FOREX-01**: Multi-currency international payment gateway integration (USD, GBP, EUR, SGD, AED) for NRI children.
- **WEAR-01**: Direct OEM cloud sync for commercial wearable ecosystems (Apple HealthKit, Google Health Connect, Fitbit).

---

## Out of Scope

| Feature | Reason |
|---------|--------|
| Live-in 24x7 attendant service (Nivas tier) | High operational risk and live-in caregiver staffing overhead; deferred to future milestone |
| International Forex payment handling | Adds unnecessary cross-border payment gateway friction for initial launch; INR used initially |
| Custom wearable device manufacturing | High capex and regulatory burden; platform integrates with existing certified medical IoT devices |

---

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| FND-01 | Phase 1 | Pending |
| FND-02 | Phase 1 | Pending |
| FND-03 | Phase 1 | Pending |
| FND-04 | Phase 1 | Pending |
| FND-05 | Phase 1 | Pending |
| FND-06 | Phase 1 | Pending |
| FND-07 | Phase 1 | Pending |
| FND-08 | Phase 1 | Pending |
| FAM-01 | Phase 2 | Pending |
| FAM-02 | Phase 2 | Pending |
| FAM-03 | Phase 2 | Pending |
| FAM-04 | Phase 2 | Pending |
| FAM-05 | Phase 2 | Pending |
| FAM-06 | Phase 2 | Pending |
| FAM-07 | Phase 2 | Pending |
| FLD-01 | Phase 3 | Pending |
| FLD-02 | Phase 3 | Pending |
| FLD-03 | Phase 3 | Pending |
| FLD-04 | Phase 3 | Pending |
| FLD-05 | Phase 3 | Pending |
| FLD-06 | Phase 3 | Pending |
| FLD-07 | Phase 3 | Pending |
| OPS-01 | Phase 4 | Pending |
| OPS-02 | Phase 4 | Pending |
| OPS-03 | Phase 4 | Pending |
| OPS-04 | Phase 4 | Pending |
| OPS-05 | Phase 4 | Pending |
| OPS-06 | Phase 4 | Pending |
| OPS-07 | Phase 4 | Pending |
| EMG-01 | Phase 5 | Satisfied |
| EMG-02 | Phase 5 | Satisfied |
| EMG-03 | Phase 5 | Satisfied |
| EMG-04 | Phase 5 | Satisfied |
| EMG-05 | Phase 5 | Satisfied |
| EMG-06 | Phase 5 | Satisfied |
| INT-01 | Phase 6 | Pending |
| INT-02 | Phase 6 | Pending |
| INT-03 | Phase 6 | Pending |
| INT-04 | Phase 6 | Pending |
| INT-05 | Phase 6 | Pending |
| INT-06 | Phase 6 | Pending |

**Coverage:**
- v1 requirements: 37 total
- Mapped to phases: 37
- Unmapped: 0 ✓

---
*Requirements defined: 2026-08-21*
*Last updated: 2026-08-21 after initialization*

# Roadmap: Poco Elder Care Platform

## Overview

Poco Elder Care is built in a sequenced execution architecture: first constructing the shared monorepo, data models, canonical business rules, and integration stubs; then building the authoritative NestJS backend services with comprehensive seed data; followed by building the three specialized user surfaces in order (Admin Portal, Field App, Family Portal); and culminating in end-to-end multi-surface verification and single 1GB droplet Docker deployment.

## Phases

- [x] **Phase 1: Monorepo Foundation, Prisma Schema & DRY Business Rules** - Set up Turborepo workspace, PostgreSQL Prisma schema, and canonical `@poco/*` business logic packages.
- [ ] **Phase 2: Integration Partner Stubs & Interactive Mocks** - Build 12 backend integration partner stubs and interactive UI simulators for Razorpay and Exotel.
- [ ] **Phase 3: Common NestJS Backend & Business Services** - Build dual-auth REST API, ticket/SLA/billing engines, pg-boss job queues, and async Claude AI classification worker.
- [ ] **Phase 4: Realistic Seed Data & Backend Verification** - Generate realistic database seed data (~50 officers, ~200 households) and verify all backend services with Vitest.
- [ ] **Phase 5: Admin Portal (Next.js)** - Build high-density operations queues, Care Officer Manager assignment UI with certification gating, catalog versioning, and integration test harness.
- [ ] **Phase 6: Field Mobile App (React Native & WatermelonDB)** - Build offline-first mobile app with guided SOP checklists, direct S3 presigned URL media capture, geofenced visits, and batch sync.
- [ ] **Phase 7: Family Portal (Next.js)** - Build reassuring consumer portal with wellness dashboard, shared activity feed / chat, wallet management, service approvals, and family escalation tree.
- [ ] **Phase 8: End-to-End Testing & Single-Droplet Production Deployment** - Implement Playwright e2e test suite, admin test dashboard, and 1GB DigitalOcean Docker Compose deployment with Nginx.

## Phase Details

### Phase 1: Monorepo Foundation, Prisma Schema & DRY Business Rules
**Goal**: Establish the Turborepo monorepo, complete PostgreSQL Prisma schema, and shared `@poco/*` packages implementing canonical business logic.
**Depends on**: Nothing (first phase)
**Requirements**: AUTH-01, AUTH-02, AUTH-05, CARE-01, CARE-03, TCKT-03, SLA-02, CATL-01, CATL-02, CATL-03, CATL-04, BILL-01, BILL-03, BILL-04, BILL-05
**Success Criteria**:
  1. Monorepo builds cleanly with `@poco/types`, `@poco/validation`, `@poco/business-rules`, `@poco/constants`, and `@poco/design-tokens`.
  2. Prisma schema defines all entities (Identity, Households, Seniors, Tickets, Service Requests, Versioned Catalogs/Packages, Wallets, Activity Feed, Certifications, Integrations) and runs migrations against PostgreSQL.
  3. Canonical state machine in `@poco/business-rules` handles uniform ticket/service request transitions and exception rollups.
  4. 3-step billing hierarchy and dual SLA state machine rules execute with 100% unit test coverage.
**Plans**: 8 plans (COMPLETED)

### Phase 2: Integration Partner Stubs & Interactive Mocks
**Goal**: Build realistic backend mocks for all 12 partner integrations and interactive frontend simulators for payments and telephony.
**Depends on**: Phase 1
**Requirements**: INTG-01, INTG-02, INTG-03, INTG-04
**Success Criteria**:
  1. Backend provides realistic mock endpoints for Pococare, Razorpay, ABHA, Exotel, WhatsApp, 1mg, Orange Labs, Health Services, Instamart, Swiggy, Urban Company, and Ola.
  2. Interactive Razorpay payment checkout modal mock simulates successful and failed wallet top-ups.
  3. Interactive Exotel telephony modal mock simulates incoming phone-in calls and IVR events.
  4. Webhook ingestion handlers process simulated partner callbacks and wearable fall alerts.
**Plans**: 6 plans

### Phase 3: Common NestJS Backend & Business Services
**Goal**: Implement the authoritative NestJS REST API, business service layer, in-process pg-boss background workers, and async AI message classification.
**Depends on**: Phase 1, Phase 2
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, AUTH-06, ONBD-01, ONBD-02, ONBD-03, CARE-01, CARE-02, CARE-03, CARE-04, CARE-05, TCKT-01, TCKT-02, TCKT-03, TCKT-04, TCKT-05, TCKT-06, TCKT-07, SLA-01, SLA-02, SLA-03, SLA-04, SLA-05, CATL-01, CATL-02, CATL-03, CATL-04, CATL-05, BILL-01, BILL-02, BILL-03, BILL-04, BILL-05, BILL-06, BILL-07, FEED-01, FEED-02, FEED-03, FEED-04, FEED-05, FEED-06, FEED-07
**Success Criteria**:
  1. REST API endpoints (`/api/family/v1`, `/api/field/v1`, `/api/admin/v1`, `/api/webhooks/v1`) enforce dual JWT authentication and role-based authorization.
  2. In-process `pg-boss` queues process background jobs (`sla-transition`, `notification-dispatch`, `ai-classification`, `billing`, `webhook-ingestion`).
  3. Asynchronous Claude AI worker classifies activity feed messages and auto-creates `Pending Triage` tickets above confidence thresholds.
  4. SLA evaluator automatically triggers Senior Care Officer fallback escalation on service delivery breach.
**Plans**: 4 plans

### Phase 4: Realistic Seed Data & Backend Verification
**Goal**: Populate the database with comprehensive realistic test data and verify all backend workflows with automated unit/integration tests.
**Depends on**: Phase 3
**Requirements**: TEST-01, TEST-02
**Success Criteria**:
  1. Database seed script populates >=2 users per internal role, ~50 care officers, and ~200 households (1-4 seniors each) with realistic profiles and history.
  2. Vitest test suite verifies auth, ticket lifecycle rollup, SLA transitions, wallet debits, and grandfathered versioning with 0 failures.
  3. S3 presigned URL generation and direct upload validation verified.
**Plans**: 2 plans

### Phase 5: Admin Portal (Next.js)
**Goal**: Build the operational control center for internal staff with high-density queues, Care Officer Manager assignments, catalog versioning, and integration health tools.
**Depends on**: Phase 4
**Requirements**: ADMN-01, ADMN-02, ADMN-03, ADMN-04, ADMN-05, CARE-02, CARE-03, TCKT-02, TCKT-06, TCKT-07, CATL-05, INTG-05
**Success Criteria**:
  1. Operations Executives can triage `Pending Triage` tickets, resolve `Waiting Ops Update` exceptions, and manage SLA At-Risk queues.
  2. Care Officer Manager interface enforces mandatory certification gating before allowing household assignments or reassignments.
  3. Administrators can publish versioned service catalogs and package rates with unit pricing.
  4. Integration dashboard displays partner stub health, allows editing stub configurations, and executes test payload pings.
  5. Paginated raw database table viewer renders all entity tables for administrative audit.
**Plans**: 3 plans

### Phase 6: Field Mobile App (React Native & WatermelonDB)
**Goal**: Build the offline-first mobile application for Care Officers to conduct home visits, execute guided SOPs, capture S3 media, and sync data.
**Depends on**: Phase 4
**Requirements**: FLD-01, FLD-02, FLD-03, FLD-04, FLD-05, FLD-06, FLD-07, ONBD-04, ONBD-05, CARE-04, FEED-02
**Success Criteria**:
  1. Care Officers can view assigned households, senior profiles, and SOP checklists without network connectivity.
  2. Guided checklist wizard walks officers through SOP steps and captures photos directly to S3 via presigned URLs.
  3. Geofenced visit tracking logs GPS coordinates and check-in/out timestamps.
  4. Batch sync pushes offline records with client UUIDs to backend on reconnect and cleanly surfaces conflict resolution.
  5. Care Officers can explicitly activate households upon completing onboarding visits.
**Plans**: 3 plans

### Phase 7: Family Portal (Next.js)
**Goal**: Build the consumer-facing web portal for family members to track senior wellness, communicate in the activity feed, manage wallets, and approve services.
**Depends on**: Phase 4
**Requirements**: AUTH-03, AUTH-04, AUTH-05, ONBD-02, FEED-01, FEED-02, FEED-03, FEED-06, BILL-05, BILL-06, BILL-07, SLA-05
**Success Criteria**:
  1. Family dashboard displays senior wellness snapshot, vitals trend graphs, and emergency contact/ICE preferences.
  2. Unified activity feed renders system events alongside two-way chat messages with real-time polling and AI triage status chips.
  3. Primary family members can manage household digital wallet, top up funds via Razorpay mock, and download invoices.
  4. Family members can approve paid services pending authorization and configure the family notification escalation tree.
  5. Multi-household switcher dropdown enables seamless context switching for users managing multiple households.
**Plans**: 3 plans

### Phase 8: End-to-End Testing & Single-Droplet Production Deployment
**Goal**: Implement comprehensive Playwright end-to-end tests across all surfaces and package the production stack for a 1GB DigitalOcean droplet.
**Depends on**: Phase 5, Phase 6, Phase 7
**Requirements**: TEST-03, TEST-04, TEST-05
**Success Criteria**:
  1. Playwright end-to-end tests cover complete user journeys across Family Portal, Field App, and Admin Portal.
  2. Admin Portal test runner dashboard displays test history, run results, and failed background job queues.
  3. Docker Compose stack builds and runs Nginx, NestJS (with in-process workers), and PostgreSQL within the 1GB RAM budget on DigitalOcean.
**Plans**: 2 plans

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7 -> 8

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Monorepo Foundation, Prisma Schema & DRY Business Rules | 8/8 | Completed | 2026-08-31 |
| 2. Integration Partner Stubs & Interactive Mocks | 0/2 | Not started | - |
| 3. Common NestJS Backend & Business Services | 0/4 | Not started | - |
| 4. Realistic Seed Data & Backend Verification | 0/2 | Not started | - |
| 5. Admin Portal (Next.js) | 0/3 | Not started | - |
| 6. Field Mobile App (React Native & WatermelonDB) | 0/3 | Not started | - |
| 7. Family Portal (Next.js) | 0/3 | Not started | - |
| 8. End-to-End Testing & Single-Droplet Production Deployment | 0/2 | Not started | - |

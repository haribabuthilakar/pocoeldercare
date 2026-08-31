# Project Research Summary

**Project:** Poco Elder Care — Operations & Technology Platform
**Domain:** Elder Care Operations & Technology Platform (Hybrid Service Delivery)
**Researched:** 2026-08-31
**Confidence:** HIGH

## Executive Summary

Poco Elder Care is an integrated operations and technology platform designed to coordinate first-party elder care services (via dedicated Care Officers) and outsourced integrations (pharmacy, diagnostic phlebotomy, nursing, ambulance, quick commerce) for seniors in India, paid for and monitored by their families.

The system is architected as a pnpm/turbo monorepo featuring a shared NestJS backend with PostgreSQL/Prisma, a warm and reassuring Next.js Family Portal, an offline-first React Native Field App, and a high-density Next.js Admin Portal. The entire platform is specifically designed to run reliably on a single 1GB DigitalOcean droplet through strict memory governance: in-process `pg-boss` job queues, in-memory LRU caching, direct S3 presigned URL media uploads, and Nginx reverse-proxy static asset offloading.

Key architectural guardrails have been established to mitigate critical domain risks: immutable catalog and package versioning ensures grandfathered subscription terms; a dual orthogonal SLA engine drives automated internal fallback to Senior Care Officers; a 3-step billing hierarchy permits emergency negative-balance overdrafts while safeguarding against unauthorized pay-per-use debits; and an asynchronous Claude-powered AI triage pipeline parses free-form activity feed messages into `Pending Triage` tickets for human operations verification.

## Key Findings

### Recommended Stack

The architecture leverages a Turborepo monorepo with strict package boundaries (`@poco/types`, `@poco/validation`, `@poco/business-rules`, `@poco/constants`, `@poco/design-tokens`, `@poco/ui`).

**Core technologies:**
- **NestJS 10.x + Prisma ORM + PostgreSQL 16**: Powers the central backend, relational data model, ACID transactional consistency, and row-level locking.
- **pg-boss (PostgreSQL Queue) + In-Memory LRU Cache**: Zero-daemon async background execution and caching tuned specifically for 1GB single-droplet hosting.
- **Next.js 14/15 + Tailwind CSS + Shadcn UI**: Clean, responsive, and role-tailored web interfaces for families and administrative operators.
- **React Native + WatermelonDB (SQLite) + AWS S3 Presigned URLs**: Robust offline-first field mobile client with direct-to-cloud media upload capabilities.
- **Anthropic Claude SDK**: Structured JSON output extraction for asynchronous chat message classification.

### Expected Features

**Must have (table stakes):**
- Dual authentication system (external family vs internal multi-role staff) with household context switcher.
- Multi-senior household onboarding with medical ICE, insurance, and hospital preferences synced to Pococare stubs.
- Strict 1:1 Care Officer to Household mapping gated by Care Officer Manager role and mandatory certifications.
- Unified Ticket & Service Request lifecycle state machine with child rollup and `Waiting Ops Update` exception handling.
- Dual orthogonal SLA engine (`Normal`, `At Risk`, `Breached`) driving automated internal fallback escalation.
- Versioned Service Catalog & Packages with grandfathered quotas, unit pricing, and 3-step wallet debit priorities.
- Offline-first Field App with guided SOP step checklists, geofenced visits, and S3 photo captures.
- High-density Admin Portal queues (`Pending Triage`, `Waiting Ops Update`, SLA At-Risk) and lead pipeline.
- 12 realistic backend integration partner stubs.

**Should have (competitive differentiators):**
- Unified per-household Activity Feed mixing system events and free-form chat.
- Asynchronous AI message classification proposing `Pending Triage` tickets for human ops confirmation.
- Separate family-configurable escalation tree for notification acknowledgments and payment chasing.
- Interactive frontend UI mocks for Razorpay payment checkout and Exotel telephony.
- Integration test harness and test execution monitor in Admin Portal.

**Defer (v2+ / anti-features):**
- Nivas (high-dependency long-term care: live-in attendants, GNM nurses, palliative care) — strictly out of scope.
- Cross-household aggregated family accounts (strict household isolation required).
- Real-time WebSocket infrastructure (client-side polling is sufficient).
- Live third-party API dependencies (realistic mocks utilized).
- Standalone Redis or external message broker daemons.

### Architecture Approach

The platform enforces a single source of truth: all state machines, SLA timers, billing rules, and validation logic reside in `@poco/business-rules` and `@poco/validation` within the monorepo, executed authoritatively by the common NestJS backend. Frontends import these shared packages to guarantee consistent UI rendering without duplicate business logic.

**Major components:**
1. **Shared Monorepo Packages (`@poco/*`)**: Houses types, Zod schemas, state machines, design tokens, and shared UI primitives.
2. **Common NestJS Backend**: Core REST API, dual JWT auth, business logic engines, and in-process `pg-boss` queues.
3. **Family Portal (Next.js)**: Reassuring client-facing portal for wellness tracking, activity feed messaging, wallet top-ups, and service approvals.
4. **Field App (React Native)**: Offline-first mobile tool for Care Officers with WatermelonDB SQLite storage, guided SOP execution, and presigned S3 media capture.
5. **Admin Portal (Next.js)**: Operational control center for ticket triage, Care Officer Manager assignments, lead handoffs, catalog versioning, and integration stubs.
6. **12 Integration Stubs & Mocks**: Realistic backend partner endpoints and interactive frontend test harnesses.

### Critical Pitfalls

1. **Memory Exhaustion on 1GB Droplet**: Prevented by running `pg-boss` in-process, using in-memory LRU cache (no Redis container), tuning Postgres buffers (`shared_buffers=128MB`), and setting Node heap limit to 384MB.
2. **Offline Data Sync Conflicts**: Prevented by maintaining server authority over financial and state transitions, using UUID client-generation, and surfacing conflict resolution queues when server state has evolved.
3. **Grandfathering & Subscription Drift**: Prevented by immutable `ServiceCatalogVersion` and `PackageVersion` records pinned to active subscriptions and service requests.
4. **AI Synchronous Blocking & Hallucinations**: Prevented by 100% asynchronous processing in background queues and human-in-the-loop triage (`Pending Triage` status) before any service request is created.
5. **Emergency Wallet Overdrafts vs Lockouts**: Prevented by a 3-step billing hierarchy allowing emergency negative balances while requiring approvals for non-emergency out-of-quota requests.

## Implications for Roadmap

Based on research, a sequenced 8-phase execution architecture is recommended:

### Phase 1: Foundation, Monorepo & Core Domain Rules
**Rationale:** Establishes shared types, Zod schemas, and canonical business rules (`@poco/business-rules`) before any backend or frontend code is written.
**Delivers:** Turborepo structure, Prisma schema, `@poco/*` packages (state machines, SLA, billing, types, validation, design tokens).
**Addresses:** Data model, uniform state machines, 3-tier billing rules.
**Avoids:** Duplicated validation logic, version drift, and data model inconsistencies.

### Phase 2: Integration Partner Stubs & Interactive Mocks
**Rationale:** Creates high-fidelity backend stubs and interactive UI mocks (Razorpay, Exotel) so backend and frontend workflows can be built and tested end-to-end without external dependencies.
**Delivers:** 12 backend partner stubs, frontend payment/telephony mocks, admin stub health configuration.
**Addresses:** All 12 integration specifications.
**Avoids:** External API downtime and live credential complexity.

### Phase 3: Common NestJS Backend & Business Services
**Rationale:** Implements the authoritative API and business service layer enforcing all domain rules, authentication, and background job queues.
**Delivers:** Dual auth modules (external JWT vs internal multi-role RBAC), ticket decomposition, 1:1 care assignment, billing/wallet engine, `pg-boss` queue setup, and REST API controllers.
**Uses:** NestJS, Prisma, PostgreSQL, `pg-boss`, `@poco/business-rules`.
**Avoids:** Memory bloat (in-process workers), authorization leaks.

### Phase 4: Admin Portal
**Rationale:** Operational staff need high-density queues to triage tickets, manage leads, assign Care Officers, and configure catalog versions.
**Delivers:** Next.js Admin Portal with `Pending Triage` and `Waiting Ops Update` queues, Care Officer Manager assignment interface with certification checks, catalog/package version manager, and raw DB viewer.
**Implements:** High-density admin UX, bulk actions, and RBAC visibility controls.
**Avoids:** Uncertified officer assignments, missed exception tickets.

### Phase 5: Family Portal
**Rationale:** Enables family members to onboard seniors, track wellness, engage in the activity feed, manage wallets, and approve services.
**Delivers:** Warm, reassuring Next.js Family Portal, household wellness dashboard, vitals trends, activity feed with client-side polling, wallet top-up, and family escalation tree.
**Implements:** Consumer-friendly UX, mobile-first responsive layouts, and household context switching.
**Avoids:** Information burying, cross-household data leakage.

### Phase 6: Field Mobile App & Offline Synchronization
**Rationale:** Care Officers require a specialized offline-first mobile application to conduct home visits and execute guided SOPs.
**Delivers:** React Native app with WatermelonDB SQLite storage, batch sync protocol, guided checklist-style SOP execution, direct S3 presigned media upload client, and geofenced visit check-in.
**Implements:** Wizard-style choice-driven mobile UI, offline conflict resolution.
**Avoids:** Offline state corruption, droplet bandwidth saturation from media streaming.

### Phase 7: AI Message Classification & Background Automation
**Rationale:** Automates intelligence across the platform while strictly preserving human-in-the-loop operational safety.
**Delivers:** Asynchronous Claude classification worker (`ai-classification` queue), structured JSON extraction, automated `Pending Triage` ticket generation, and monthly report drafting.
**Addresses:** Activity feed message classification, automated SLA breach escalations.
**Avoids:** Synchronous HTTP blocking, hallucinations, and unvetted service dispatches.

### Phase 8: Seed Data, Automated Testing & Single-Droplet Deployment
**Rationale:** Validates the complete system under realistic operational volume and packages it for deployment on a 1GB DigitalOcean server.
**Delivers:** Comprehensive seed generator (>=2 users/role, ~50 care officers, ~200 households with 1-4 seniors), Vitest unit tests, Playwright e2e test suite, Admin test dashboard, and Docker Compose single-droplet production stack with Nginx.
**Avoids:** Production OOM crashes, unverified end-to-end flows.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Validated against 1GB DO droplet constraints, NestJS/Prisma ecosystem, and React Native offline patterns. |
| Features | HIGH | Fully aligned with authoritative system design brief (`docs/poco-elder-care-design-brief.md`). |
| Architecture | HIGH | Clear separation of concerns, DRY monorepo structure, and server-authoritative state transitions. |
| Pitfalls | HIGH | Specific mitigations identified for memory limits, offline conflicts, versioning, and AI latency. |

**Overall confidence:** HIGH

---
*Research completed: 2026-08-31*
*Ready for roadmap: yes*

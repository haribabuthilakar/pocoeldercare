# Project Research Summary

**Project:** Poco Elder Care — Operations & Technology Platform
**Domain:** Elder Care Operations & Technology Platform (India / NRI Families SaaS-Operations Hybrid)
**Researched:** 2026-08-31
**Confidence:** HIGH

## Executive Summary

Poco is an elder care service and operations platform operating in India that coordinates first-party service delivery (via its own dedicated care officers) and outsourced/partner-delivered services (via integration partners) on behalf of seniors, funded and monitored by their families (including NRI children). The platform provides three specialized user-facing surfaces—a warm, reassuring Next.js Family Portal, an offline-first React Native Field App for care officers, and a high-density Next.js Admin Portal for operations executives—all powered by a shared NestJS backend with PostgreSQL (Prisma ORM) and deployed on a single 1GB DigitalOcean droplet.

Experts build hybrid operational platforms like Poco by strictly decoupling domain invariants and business rules into shared packages within a monorepo, enforcing single-source-of-truth state machines, dual SLA tracking, and multi-tenant household scoping on the backend. The recommended architecture leverages a PostgreSQL-backed job queue (`pg-boss`) and in-process LRU caching to eliminate external memory-heavy brokers (such as standalone Redis or RabbitMQ), direct S3 presigned URL uploads to offload media traffic from the server, and an asynchronous LLM activity feed classification queue with mandatory human-in-the-loop triage to prevent hallucinated dispatch.

The primary operational risks center on memory exhaustion on the 1GB server constraint, state drift and conflicting mutations from offline field officers, unauthorized care officer assignment bypassing compliance, and broken billing terms when service catalog prices evolve. These risks are completely mitigated through lean container topology, server-authoritative conflict resolution, strict Care Officer Manager role-gating with pre-assignment certification checks, and versioned, grandfathered package and service catalog entities.

## Key Findings

### Recommended Stack

The platform is organized as a pnpm/Turborepo monorepo with end-to-end TypeScript 5.5+. The backend uses NestJS 10.x/11.x and Prisma ORM against PostgreSQL 16. The web applications (Family Portal and Admin Portal) utilize Next.js (App Router) with Tailwind CSS, Shadcn UI / Radix UI, and TanStack Query for polling and client caching. The mobile Field App uses React Native 0.74+ / Expo with WatermelonDB over SQLite for robust offline relational storage.

To meet the hard constraint of running the entire infrastructure (Postgres, NestJS, in-process workers, Nginx) on a single 1GB DigitalOcean droplet, the architecture avoids separate Redis or RabbitMQ containers. Instead, it employs `pg-boss` (running in-process with NestJS workers for transactional job enqueue) and in-process LRU memory caching via `cache-manager`. Media captures from the field are uploaded directly from mobile clients to S3-compatible cloud storage via backend-generated presigned URLs.

**Core technologies:**
- **Turborepo + pnpm (v9.x)**: Monorepo orchestration — Enforces strict workspace boundaries across shared packages (`@poco/*`) and applications with zero-overhead caching.
- **NestJS (10.x/11.x) + TypeScript (5.5+)**: Backend framework — Modular dependency-injected enterprise service layer housing all canonical business rules.
- **PostgreSQL 16 + Prisma ORM (5.x/6.x)**: Relational database — ACID transactional guarantees, JSONB support, relational integrity, and native queue engine.
- **Next.js (App Router 14.x/15.x)**: Web portals — Powering the Family Portal (warm, responsive, mobile-first) and Admin Portal (high-density, keyboard-friendly).
- **React Native + WatermelonDB / SQLite**: Mobile Field App — Provides offline-first relational query performance, local persistence, and background sync.
- **pg-boss (9.x/10.x)**: In-process job queue — PostgreSQL-backed queue eliminating separate broker memory footprint while offering transactional enqueue.
- **Anthropic Claude SDK (`@anthropic-ai/sdk`)**: AI classification engine — Asynchronously extracts service request proposals from unstructured activity feed messages with structured JSON outputs.
- **AWS SDK S3 Client & Request Presigner**: Cloud media storage — Direct client-to-S3 photo/audio uploads, storing only URL pointers in Postgres to protect server bandwidth.

### Expected Features

Poco combines core table stakes necessary for reliable elder care operations with powerful differentiators that build family trust and field efficiency.

**Must have (table stakes):**
- **Family Portal Dashboard & Wellness Snapshot** — Immediate, zero-click senior health summary, open tickets, assigned care officer card, and emergency SOS button.
- **Vitals & Health Records Tracking** — Digital storage and trend visualization for vitals (BP, sugar, pulse, SpO2) and prescription vault.
- **Household & Senior Onboarding Flow** — Seamless customer registration creating Person and Lead records, onboarding 1–4 seniors with ICE emergency profiles.
- **Role-Gated Family Membership Management** — Primary payer controls membership invites/removals; all family members share identical viewing and approval powers.
- **Per-Household Digital Wallet & Invoicing** — Per-household wallet isolation (no global family aggregation) with automated statement and invoice generation.
- **Tiered Subscription Engine (Kavach, Sahara, Sampoorna)** — Configurable monthly/yearly subscription tiers with automated quota tracking and cycle resets.
- **Emergency Negative-Balance Auto-Debit** — Unconditional service fulfillment during emergencies (ambulance/hospitalization) debiting wallet into negative balances.
- **Unified Ticket & Service Request Lifecycle** — Uniform finite state machine with automatic rollup and `Waiting Ops Update` exception handling.
- **Inbound Telephony Ticket Creation (Exotel)** — Automated ticket generation and handling UI popup for incoming helpline calls.
- **Offline-First Field App with Guided SOPs** — Local SQLite sync, choice-driven wizard checklists, geofenced GPS check-in, and direct S3 photo uploads.
- **High-Density Admin Ops Queues** — Table-driven triage queues for `Pending Triage`, `Waiting Ops Update`, and `SLA At-Risk` requests.
- **Partner Integration Stubs (12 Partners)** — Realistic backend stubs and interactive frontend mocks for payments (Razorpay) and telephony (Exotel).

**Should have (competitive):**
- **AI-Assisted Chat Classification to Tickets** — Enqueues LLM jobs on activity feed messages to propose structured tickets in `Pending Triage` state with human ops validation.
- **Unified Per-Household Activity Timeline** — Blends system events (vitals, SOP milestones, ambulance dispatches) with two-way messaging in a single feed.
- **Dual Non-Intersecting Escalation Trees** — Family-configurable notification/payment escalation tree decoupled from internal Care Officer → Senior Care Officer SLA breach fallback.
- **Strict 3-State SLA Tracking (Normal, At Risk, Breached)** — Independent SLA state machine evaluated asynchronously to trigger automated internal escalation.
- **Versioned Catalog & Package Grandfathering** — Household subscriptions pinned to exact `PackageVersion` and `ServiceCatalogVersion` terms to preserve pricing agreements.
- **Care Officer Manager Certification Gating** — Cryptographically prevents assigning field officers who have not completed all mandatory certifications.
- **Dedicated 1:1 Care Officer Relationship** — Strict 1:1 household-to-officer invariant enforced at schema and service layers, editable only by Care Officer Manager.
- **Realistic Integration Stubs & Test Harness UI** — In-browser Admin Portal tools to toggle stub latency, simulate errors, trigger webhooks, and view test runs.

**Defer (v2+):**
- **Nivas (High-Dependency / Long-Term Care)** — Excluded entirely from v1 (no live-in attendants, GNM nurses, palliative care, or schema placeholders).
- **Real-Time WebSockets / Push Messaging** — Excluded in favor of client-side polling on active screens to conserve server memory on 1GB droplet.
- **Cross-Household Aggregated Dashboards** — Replaced with an explicit household switcher dropdown to preserve strict wallet and officer ownership boundaries.
- **Live Third-Party Production API Calls** — Replaced by high-fidelity deterministic stubs during v1.
- **Mid-Cycle Plan Changes** — Changes apply strictly on next billing cycle start to avoid fractional proration edge cases.
- **Direct Autonomous AI Ticket Execution** — AI proposals strictly require human ops triage before service activation.

### Architecture Approach

The platform follows a modular monolith pattern inside a pnpm/Turborepo monorepo. Shared packages (`@poco/types`, `@poco/validation`, `@poco/business-rules`, `@poco/constants`, `@poco/design-tokens`, `@poco/ui`) guarantee that domain invariants, validation rules, state machines, and design systems are implemented once and shared across backend and frontend surfaces. The NestJS backend provides versioned REST APIs (`/api/family/v1`, `/api/field/v1`, `/api/admin/v1`, `/api/webhooks/v1`) enforcing dual authentication (External JWT vs. Internal Multi-Role JWT) and hosting in-process `pg-boss` background workers.

```
                    ┌─────────────────────────────────────────────────────────────┐
                    │                 Nginx Reverse Proxy & TLS                   │
                    └───────┬──────────────────────┬──────────────────────┬───────┘
                            │                      │                      │
         /api/family/v1     │   /api/field/v1      │   /api/admin/v1      │   /api/webhooks/v1
       ┌────────────────────┴──────────────────────┴──────────────────────┴────────────────┐
       │                          NestJS Common Backend Application                         │
       │  ┌──────────────────────┬─────────────────────────┬─────────────────────────────┐  │
       │  │ External Auth Guard  │ Internal Role-RBAC Guard│ Partner Webhook HMAC Guard  │  │
       │  ├──────────────────────┴─────────────────────────┴─────────────────────────────┤  │
       │  │                     Shared Service & Business Rules Layer                    │  │
       │  │    (Ticket State Machine, Dual SLA Engine, 3-Step Billing, 1:1 Assignment)   │  │
       │  ├────────────────────────────────────────┬─────────────────────────────────────┤  │
       │  │   In-Process In-Memory LRU Cache       │    In-Process pg-boss Workers       │  │
       │  │ (Catalog Versions, Packages, Roles)    │  (Webhooks, SLA, AI Triage, Billing)│  │
       │  └────────────────────────────────────────┴─────────────────────────────────────┘  │
       └────────────────────────┬───────────────────────────────────┬───────────────────────┘
                                │                                   │
                    Prisma ORM Queries / Mutations       Direct Presigned URLs
                                │                                   │
               ┌────────────────┴───────────────┐        ┌──────────┴───────────────┐
               │    PostgreSQL 16 Database      │        │ S3-Compatible Storage    │
               │ (App Schema + pgboss Queue)   │        │ (Photos, Audio, Media)   │
               └────────────────────────────────┘        └──────────────────────────┘
```

**Major components:**
1. **NestJS Modular Backend & In-Process Workers** — Executes REST APIs, hosts `pg-boss` job processors (webhook ingestion, SLA evaluation, notification dispatch, AI triage), and provides Prisma-backed data access.
2. **Family Portal (Next.js)** — Responsive, mobile-first web app providing wellness snapshot, vitals trends, activity feed polling, wallet management, and family invitations.
3. **Field App (React Native + WatermelonDB)** — Offline-first mobile app featuring local SQLite sync, checklist-driven SOP execution wizard, geofenced check-in, and S3 presigned photo uploads.
4. **Admin Portal (Next.js)** — High-density operations console providing triage queues (`Pending Triage`, `Waiting Ops Update`, `SLA At-Risk`), Care Officer Manager assignments, versioned catalog editor, integration health dashboard, and test harness.
5. **Shared Monorepo Libraries (`@poco/*`)** — Canonical types, Zod schemas, state machine definitions, billing trees, design tokens, and UI components.

### Critical Pitfalls

1. **Memory Exhaustion on 1GB Single Droplet** — *Mitigation*: Run queue workers (`pg-boss`) in-process within the NestJS app; use in-memory LRU caching rather than standalone Redis/RabbitMQ; tune PostgreSQL `shared_buffers` and `work_mem`; offload media directly to S3 via presigned URLs.
2. **State Drift & Inconsistencies from Offline Field Actions** — *Mitigation*: Server remains strictly authoritative for financial debits, ticket status transitions, and assignments. Offline actions use client-generated UUIDs, queuing proposed state transitions that are validated server-side during batch sync with field-level last-write-wins applied only to non-critical logs.
3. **AI Hallucinations & Unintended Emergency Dispatches** — *Mitigation*: The LLM is never in the synchronous write path and never executes state mutations autonomously. Activity feed classification runs asynchronously via `pg-boss`, proposing tickets strictly in `Pending Triage` status for mandatory human operations executive triage.
4. **Subscription Contract Invalidation & Price Drift** — *Mitigation*: Implement versioned entities (`PackageVersion`, `ServiceCatalogVersion`, `PackageServiceQuota`). Subscriptions are immutable and pinned to specific version IDs at cycle start, preserving grandfathered terms.
5. **Unauthorized Field Officer Assignment & Compliance Violations** — *Mitigation*: Role-gate assignment mutations exclusively to the `Care Officer Manager` role at the backend service layer, enforcing non-expired mandatory `CertificationRecord` validation prior to assignment.

## Implications for Roadmap

Based on research and domain dependencies, the suggested 12-phase delivery roadmap is structured as follows:

### Phase 1: Core Foundation, Domain Data Model & Dual Authentication
**Rationale:** The relational data model and authentication boundaries are the fundamental foundation upon which all state machines, business rules, and surface APIs depend.
**Delivers:** Turborepo monorepo setup, Prisma schema with all 20+ entities, initial migrations, external JWT auth (`Person`, `HouseholdMembership`), internal multi-role JWT auth (`InternalUser`, `UserRole`, `ReportingLine`), and seed baseline.
**Addresses:** Household/Senior data structure, role-gated family access, internal role system.
**Avoids:** Schema fragmentation, cross-household data leakage, and insecure authentication coupling.

### Phase 2: Business Rules, State Machines & Dual SLA Escalation Engine
**Rationale:** Core state machines and SLA engines must be codified in `@poco/business-rules` before implementing billing, triage, or field workflows.
**Delivers:** Canonical 6-state ticket lifecycle state machine with child rollup and `Waiting Ops Update` exception handling; orthogonal 3-state SLA tracking engine (`Normal`, `At Risk`, `Breached`); dual non-intersecting escalation ladders (Family tree vs Internal Senior Care Officer fallback).
**Addresses:** Unified Ticket & Service Request Lifecycle, Dual SLA Tracking, Dual Escalation Trees.
**Avoids:** Business logic drift between frontends and backend; missed SLA escalations.

### Phase 3: Versioned Catalog, Packages & 3-Step Billing Engine
**Rationale:** Service delivery and ticket completion depend on quota checks, pricing lookups, and wallet debits.
**Delivers:** Versioned catalog and package schemas (`ServiceCatalogVersion`, `PackageVersion`, `PackageServiceQuota`), grandfathered subscription binding, quota usage counter, 3-step billing hierarchy (emergency negative auto-debit -> requested positive auto-debit -> approval hold), wallet transaction ledger, and PDF invoice generator.
**Addresses:** Tiered Subscription Engine, Emergency Negative Auto-Debit, Digital Wallet & Invoicing, Catalog Grandfathering.
**Avoids:** Pricing drift on grandfathered subscriptions; life-safety care blocked by zero balances.

### Phase 4: Care Officer Assignment, Certification Compliance & Lead/Household Lifecycle
**Rationale:** Establishes governance over who can deliver care, verifying qualifications before households are activated.
**Delivers:** Care Officer Manager assignment service with strict 1:1 household mapping invariant; pre-assignment mandatory certification compliance gating; Sales-to-Customer Success lead handoff workflow; field onboarding visit tracking and explicit household activation.
**Addresses:** Care Officer Manager Assignment, Mandatory Certification Gating, Lead Handoff & Household Activation.
**Avoids:** Unqualified officer assignment; uncoordinated multi-officer household confusion.

### Phase 5: Unified Activity Feed & Async AI Classification Pipeline
**Rationale:** The communication timeline connects families and care officers and feeds the async AI triage loop.
**Delivers:** Paginated Activity Feed API (`chat_message` and `system_event` streams), client polling mechanism, in-process `pg-boss` queue worker for `ai-classification`, Anthropic Claude SDK structured JSON prompt extraction, confidence scoring, `AIClassificationResult` logging, and auto-creation of `Pending Triage` tickets.
**Addresses:** Unified Activity Feed, AI-Assisted Chat Classification, Human-in-the-Loop Triage.
**Avoids:** Synchronous LLM latency blocking chat writes; uncontrolled AI ticket auto-dispatch.

### Phase 6: Partner Integration Stubs & Interactive Frontend Mocks
**Rationale:** External dependencies must be deterministically simulated so that end-to-end workflows and UI surfaces can execute reliably without third-party sandboxes.
**Delivers:** Realistic backend stubs for 12 partners (Pococare, Razorpay, ABHA, Exotel, WhatsApp, 1mg, Orange Labs, Health Services, Instamart, Swiggy, Urban Company, Ola); interactive frontend simulation modals for Razorpay (payments) and Exotel (inbound IVR call popups); Admin Portal stub configuration and test-ping harness.
**Addresses:** 12 Partner Integration Stubs, Inbound Telephony Ticket Creation, Interactive Razorpay/Exotel Mocks.
**Avoids:** Unreliable third-party API dependencies during development; untested failure paths.

### Phase 7: Unified REST API Layer & Monorepo Architecture
**Rationale:** Provides the secure, versioned contracts required by the Family Portal, Field App, and Admin Portal.
**Delivers:** Surface-versioned REST controllers (`/api/family/v1`, `/api/field/v1`, `/api/admin/v1`, `/api/webhooks/v1`), Zod validation pipes (`@poco/validation`), typed DTOs (`@poco/types`), signed webhook handlers, rate limiters, and in-memory LRU caching (`cache-manager`).
**Addresses:** Unified REST API Layer, Monorepo DRY Architecture, 1GB droplet caching strategy.
**Avoids:** Redundant route validation logic; memory bloat from external cache daemons.

### Phase 8: Shared Design Tokens, UI Component Library & Navigation Maps
**Rationale:** Design tokens and base components must precede screen construction to prevent visual fragmentation and ad-hoc styling.
**Delivers:** `@poco/design-tokens` (color palettes, spacing, typography, standardized SLA/ticket status colors), `@poco/ui` component library (Tailwind + Shadcn/Radix for web, React Native primitives for mobile), and documented Information Architecture / Navigation Maps for all three surfaces.
**Addresses:** Cross-surface design consistency, standardized status badges, responsive layouts.
**Avoids:** Visual inconsistency across surfaces; duplicate UI components.

### Phase 9: Family Portal Web Application
**Rationale:** Customer-facing surface enabling families to monitor care, communicate, and manage finances.
**Delivers:** Next.js Family Portal application featuring warm, reassuring wellness snapshot dashboard, vitals trends and health vault, unified activity feed with polling chat, wallet top-up (with Razorpay mock modal), approval of pending services, family member invitation management, and emergency escalation settings.
**Addresses:** Family Portal Dashboard, Vitals Trends, Family Chat, Wallet Management, Service Approvals.
**Avoids:** Cluttered, anxiety-inducing clinical UI; buried critical emergency contacts.

### Phase 10: Offline-First Care Officer Field Mobile App
**Rationale:** Care officers require an on-device tool capable of operating in zero-connectivity environments.
**Delivers:** React Native mobile application with WatermelonDB / SQLite local datastore, batch sync protocol (`/api/field/v1/sync/batch`), wizard-style choice-driven SOP step checklists, geofenced GPS check-in/out, direct S3 presigned photo capture, multi-household assigned dashboard, and read-only Senior Care Officer reporting line view.
**Addresses:** Offline-First Field App, Guided SOP Checklists, Geofenced Visits, Direct S3 Media Uploads.
**Avoids:** Blocked care delivery during network drops; heavy image uploads saturating server CPU.

### Phase 11: High-Density Admin Operations Suite & Management Portals
**Rationale:** Internal operations staff need a fast, keyboard-friendly command center for daily service triage and governance.
**Delivers:** Next.js Admin Portal application featuring high-density ops queues (`Pending Triage` with AI confidence review, `Waiting Ops Update`, `SLA At-Risk`), Sales/CS Lead management, Care Officer Manager assignment interface, versioned Catalog and Package editors, empanelled doctor/hospital directories, integration health monitor, and raw database table viewer.
**Addresses:** High-Density Ops Queues, Lead Handoff Management, Versioned Catalog Editor, Integration Manager.
**Avoids:** Slow multi-click modal workflows for high-volume ops; unauthorized reassignment actions.

### Phase 12: Seed Data Generator, E2E Test Suite & Single-Droplet Deployment Harness
**Rationale:** Verifies complete system integrity, populates realistic staging environments, and provides a turnkey single-server deployment.
**Delivers:** Realistic seed script (≥2 users/role, ~50 care officers, ~200 households with 1–4 seniors), Vitest unit test suite, Playwright multi-browser e2e test suite, Admin Portal test dashboard (displaying test runs and failed background jobs), and Docker Compose + Nginx deployment harness configured for a 1GB DO droplet.
**Addresses:** Seed Data Generator, Vitest & Playwright Test Suites, Admin Test Dashboard, 1GB Droplet Docker Compose Deployment.
**Avoids:** Unverified edge cases; deployment memory crashes in production.

### Phase Ordering Rationale

- **Foundation Before Logic (Phases 1 → 2 → 3 → 4)**: The relational schema and dual authentication must exist before state machines can be codified; state machines and SLA logic must exist before billing and quota rules can execute; billing and assignment rules must exist before lifecycle workflows activate.
- **Async Pipelines & Integrations Before Frontends (Phases 5 → 6 → 7)**: The activity feed, AI triage queue, partner stubs, and unified REST API layer must be operational so that client applications connect to fully functioning backend contracts.
- **Design System Before UI Construction (Phase 8 → 9 → 10 → 11)**: Shared design tokens, standardized state badges, and navigation maps are established before building Family, Field, and Admin screens, ensuring visual coherence and eliminating duplicate UI code.
- **End-to-End Verification & Deployment (Phase 12)**: Comprehensive seed data generation, Playwright e2e tests, and Docker container tuning wrap the build to prove stability within the 1GB droplet memory ceiling.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 5 (Unified Activity Feed & Async AI Classification Pipeline):** Requires careful prompt engineering and JSON schema tuning with Anthropic Claude SDK to achieve high precision in extracting service requests and confidence scores from conversational Hindi/English chat.
- **Phase 10 (Offline-First Care Officer Field Mobile App):** WatermelonDB synchronization schema and SQLite migration handling in React Native requires rigorous protocol design for conflict resolution and background S3 presigned URL retries.

Phases with standard patterns (skip research-phase):
- **Phase 1 (Core Foundation & Dual Auth):** Standard NestJS, Prisma, and JWT authentication patterns.
- **Phase 2 (State Machines & SLA Engine):** Pure deterministic TypeScript state machines and date-arithmetic SLA clocks in `@poco/business-rules`.
- **Phase 3 (Billing Engine & Grandfathered Catalog):** Relational ledger patterns and transactional auto-debit hierarchies.
- **Phase 7 (Unified REST API Layer):** Standard NestJS controllers, Zod validation pipes, and route guards.
- **Phase 8 & 9 (Design System & Family Portal):** Standard Next.js App Router, Tailwind CSS, and Shadcn UI components.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Architecture fully tailored to single 1GB droplet constraint (pg-boss + in-memory LRU + S3 presigned uploads). |
| Features | HIGH | Comprehensive breakdown of table stakes, differentiators, and explicit anti-feature boundaries based on design brief. |
| Architecture | HIGH | Monorepo structure, dual auth schemes, versioned REST endpoints, and domain models thoroughly defined. |
| Pitfalls | HIGH | Critical failure modes (memory limits, offline drift, AI hallucination, price drift) identified with concrete architectural mitigations. |

**Overall confidence:** HIGH

### Gaps to Address

- **Empanelled Doctor Scheduling Details**: While doctor directories and basic dispatch are modeled, complex scheduling workflows for specialist home visits are left as an open design item to be finalized during Phase 11.
- **Offline Sync Conflict Edge Cases**: The offline batch sync endpoint must handle rare edge cases where a ticket is closed by ops while an offline care officer completes an SOP step; the server will reject the mutation and return a structured conflict object for field resolution.
- **Activity Feed Polling Frequency Tuning**: Polling intervals (10–15s) need validation under simulated multi-user traffic on the 1GB droplet to balance chat responsiveness with CPU load.

## Sources

### Primary (HIGH confidence)
- `docs/poco-elder-care-design-brief.md` — Authoritative baseline system design, resolved business decisions, architecture, and service catalog.
- `.planning/PROJECT.md` — Project definition, core value, active requirements, scope boundaries, and key architectural decisions.
- `.planning/research/STACK.md` — Technology choices, runtime constraints, and single 1GB droplet optimization.
- `.planning/research/FEATURES.md` — Feature landscape, table stakes, differentiators, anti-features, and competitor analysis.

### Secondary (MEDIUM confidence)
- Official NestJS, Prisma, Next.js, WatermelonDB, and pg-boss documentation.
- IHI 4Ms Framework (What Matters, Medication, Mentation, Mobility) guidelines for geriatric care workflows.
- ABHA (Ayushman Bharat Digital Mission) health record specifications.

### Tertiary (LOW confidence)
- Competitor feature benchmarks (Emoha, Anvayaa, Samarth Care) for operational standard comparisons.

---
*Research completed: 2026-08-31*
*Ready for roadmap: yes*

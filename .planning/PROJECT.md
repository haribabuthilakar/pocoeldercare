# Poco Elder Care — Operations & Technology Platform

## What This Is

Poco is an elder care service platform in India that coordinates first-party service delivery (via its own dedicated care officers) and outsourced/partner-delivered services (via integration partners) on behalf of seniors, funded and monitored by their families. The system comprises a Next.js Family Portal, a React Native offline-first Field App, a Next.js Admin Portal, and a shared NestJS + PostgreSQL (Prisma) backend deployed in a pnpm/turbo monorepo on a single 1GB DigitalOcean droplet.

## Core Value

Reliable, transparent, and empathetic elder care delivery where families have continuous peace of mind and field officers have streamlined tools to deliver coordinated care.

## Business Context

- **Customer**: Families with aging parents in India (including NRI children) paying for structured elder care.
- **Revenue model**: Tiered subscription packages (Kavach ₹500/mo, Sahara ₹3,000/mo, Sampoorna ₹12,500/mo) with per-service quotas, plus pay-per-use out-of-quota services billed against a per-household wallet.
- **Success metric**: Timely service delivery within strict SLAs, zero dropped emergencies, and high family retention.
- **Strategy notes**: Authoritative baseline in [docs/poco-elder-care-design-brief.md](file:///c:/Users/harib/work/pocoeldercare/docs/poco-elder-care-design-brief.md).

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] **Data Model & Prisma Schema**: Full relational schema across Identity, Households/Seniors, Care Officer Assignments, Tickets, Service Requests, Versioned Service Catalog & SOPs, Versioned Packages & Quotas, Per-Household Wallets, Activity Feed, Escalation Trees, Certifications, and Integration Partners.
- [ ] **Ticket & Service Request Lifecycle**: Uniform state machine (`Open -> Assigned -> In Progress -> Pending Approval -> Completed -> Closed`, `Cancelled`, `Waiting Ops Update`) with automatic rollup from child service requests and exception handling.
- [ ] **Dual SLA & Escalation System**: Orthogonal 3-state SLA tracking (`Normal`, `At Risk`, `Breached`) driving automated internal escalation (Care Officer -> Senior Care Officer fallback), separate from the family-configurable notification/payment escalation tree.
- [ ] **Billing, Quotas & Wallet Engine**: 3-step billing priority (Emergency negative-balance auto-debit -> User-requested positive-balance auto-debit -> Family approval hold), monthly/yearly cycle resets, unit pricing, and version grandfathering.
- [ ] **Care Officer Assignment & Activation**: Care Officer Manager role-gated 1:1 household assignment with mandatory certification checks, lead handoff from Sales to Customer Success, and in-person field onboarding visit activation.
- [ ] **Activity Feed with AI Message Classification**: Shared per-household timeline with client polling, async LLM classification (`ai-classification` queue) proposing `Pending Triage` tickets for ops confirmation, and human-in-the-loop triage.
- [ ] **Integration Stubs & Mock UIs**: Realistic backend stubs for 12 partners (Pococare, Razorpay, ABHA, Exotel, WhatsApp, 1mg, Orange Labs, Health Services, Instamart, Swiggy, Urban Company, Ola), plus interactive frontend mocks for Razorpay and Exotel, with Admin Portal stub health/config management.
- [ ] **Tech Building Blocks & Monorepo Architecture**: pnpm/turbo monorepo (`@poco/types`, `@poco/validation`, `@poco/business-rules`, `@poco/constants`, `@poco/design-tokens`, `@poco/ui`), pg-boss in-process queue, in-memory LRU caching, and S3 presigned URL media uploads.
- [ ] **Unified REST API**: Surface-versioned endpoints (`/api/family/v1`, `/api/field/v1`, `/api/admin/v1`, `/api/webhooks/v1`) with dual JWT auth (external vs internal multi-role) and signed webhook secrets.
- [ ] **Design System & UX Surfaces**:
  - **Family Portal**: Warm, reassuring dashboard, activity feed, vitals trends, wallet management, emergency/SOP tracking, family invites.
  - **Field App**: Offline-first (WatermelonDB/SQLite sync), wizard-style choice-driven SOP completion, geofenced visits, photo uploads, reporting line view.
  - **Admin Portal**: High-density ops queues (`Pending Triage`, `Waiting Ops Update`, SLA At-Risk), lead/customer management, officer assignments, versioned catalog/package manager, integration health, raw DB viewer, and test runners.
- [ ] **Seed Data & Automated Testing**: Realistic seed generator (>=2 users/role, ~50 care officers, ~200 households with 1-4 seniors), Vitest unit tests, Playwright e2e test suite, and Admin Portal test dashboard.

### Out of Scope

- **Nivas (High-Dependency & Long-Term Care)**: Live-in attendants, GNM nurses, equipment rentals, wound/palliative care excluded from this phase — no tables or scaffolding.
- **Cross-Household Family Aggregation**: Family accounts cannot view aggregate dashboards across multiple households; household switcher dropdown required.
- **Real-Time WebSocket Chat**: Real-time push messaging is not required; client-side polling on active screens is sufficient.
- **Live Third-Party API Calls**: External integrations are strictly realistic stubs/mocks in this phase.
- **Mid-Cycle Package Changes**: Mid-cycle upgrades/downgrades are not permitted.
- **Direct Redis / External Message Broker**: Kept in-process (in-memory cache and Postgres pg-boss queue) to fit within a 1GB DO droplet.

## Context

- **Deployment Constraint**: Single 1GB DigitalOcean droplet running Docker Compose (Postgres, NestJS + in-process workers, Nginx, pre-rendered Next.js frontends).
- **Offline Field Requirements**: Field officers often operate in low-connectivity environments, requiring local SQLite sync and presigned S3 media uploads.
- **Regulatory & Clinical Baseline**: ABHA integration stubbing, senior medical ICE profiles synced to Pococare, IHI 4Ms reviews, and geriatric assessment workflows.

## Constraints

- **Deployment / Resource Ceiling**: 1GB RAM total server capacity — no separate Redis container or multi-container Node workers.
- **Data Model Invariants**: Strict 1:1 household-to-care-officer mapping; only Care Officer Manager can reassign; grandfathered package/service versions.
- **Auth Separation**: Independent external (`Person` + `HouseholdMembership`) and internal (`InternalUser` + multi-`UserRole`) authentication schemes.
- **DRY Single-Source-of-Truth**: Business rules, state machines, SLA timers, and billing logic implemented once in `@poco/business-rules` and enforced strictly on backend.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Postgres-backed job queue (`pg-boss`) | Eliminates extra broker processes on 1GB droplet while providing transactional enqueue | — Pending |
| In-process LRU cache (no Redis) | Conserves memory on 1GB DO droplet for MVP scale | — Pending |
| Asynchronous AI classification via queue | Prevents blocking chat posting; decouples third-party LLM latency from write path | — Pending |
| S3 Direct Presigned URLs for Media | Offloads binary payload handling and storage from backend server to cloud storage | — Pending |
| Versioned Catalog & Packages | Guarantees existing customer subscription terms and pricing remain grandfathered | — Pending |
| 1:1 Care Officer Household Mapping | Clear accountability and trusted relationship for senior care delivery | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-08-31 after initialization*

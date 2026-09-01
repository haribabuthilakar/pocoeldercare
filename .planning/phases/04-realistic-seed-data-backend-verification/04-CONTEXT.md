# Phase 04: Realistic Seed Data & Backend Verification - Context

**Gathered:** 2026-09-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 4 generates comprehensive realistic test data and verifies all backend services, business rules, and security boundaries with automated Vitest integration suites for Poco Elder Care:
- Database seed scripts producing >=2 users per internal role, ~50 care officers with supervisor hierarchies, and ~200 households (1-4 seniors each) populated with rich clinical profiles, Indian context, emergency ICE records, wallet histories, and grandfathered package versions.
- Dual-tier seed execution: Full dataset (pnpm db:seed) for production-grade testing/demo and quick dataset (pnpm db:seed:quick) for fast CI/local startup.
- Curated mock media fixture library (avatars, SOP checklist proof photos, prescriptions, audio voice notes, ICE documents) linked via the in-app local media server without AWS dependencies.
- Comprehensive Vitest integration test suite executing against real PostgreSQL validating end-to-end multi-actor workflows, 3-step billing hierarchy, SLA state machine timers & supervisor fallback escalations, AI triage classification, and dual JWT security boundaries.
</domain>

<decisions>
## Implementation Decisions

### 1. Scenario Diversity & Realism
- **D-01:** Distribution focused heavily on active edge cases: 50% Active households with complex open tickets and SLA breaches, 30% Onboarding (leads, pending visits), 20% Inactive/Paused, distributed across Kavach, Sahara, Sampoorna packages including grandfathered v1 versions. — **Reversibility:** reversible — seed generation parameters.
- **D-02:** Comprehensive geriatric cohorts: Rich clinical profiles featuring common Indian geriatric conditions (Diabetes, Hypertension, Cardiac, Dementia, Osteoarthritis), realistic historical vitals trends (BP, blood glucose, SpO2), authentic Indian names and major cities (Bengaluru, Delhi NCR, Mumbai, Chennai, Hyderabad), and verified emergency ICE and local hospital details (Apollo, Fortis, Manipal). — **Reversibility:** reversible — seed data templates.
- **D-03:** Full spectrum of operational ticket states: Seeded tickets explicitly covering Pending Triage (AI-suggested from chat), SLA At-Risk (approaching response/delivery deadlines), Breached (escalated to Senior Care Officer), Waiting Ops Update (conflicting child service requests), Pending Approval (insufficient wallet funds), and completed multi-service tickets. — **Reversibility:** reversible — operational seed models.
- **D-04:** Natural Indian multilingual mix: Realistic English, Hindi, and Hinglish family & Care Officer chat messages blended with system audit events, vitals alerts, and AI triage status chips in the activity feed. — **Reversibility:** reversible — conversational seed templates.

### 2. Seed Script Performance & Execution Modes
- **D-05:** Dual-tier seed scripts: pnpm db:seed (full realistic dataset: ~50 care officers, ~200 households, rich operational history) and pnpm db:seed:quick (fast dev dataset: ~5 officers, ~10 households for rapid CI & local startup). — **Reversibility:** costly — package.json scripts and CI pipelines reference seed command conventions.
- **D-06:** Fast clean truncate & repopulate: Cleanly wipes existing tables in foreign-key safe topological order before seeding, guaranteeing a completely predictable, pristine state without orphan records. — **Reversibility:** reversible — seed reset lifecycle.
- **D-07:** Deterministic seeded generator: Uses fixed-seed pseudorandom generation (faker with fixed seed 42) and static anchor IDs/phones so test assertions, IDs, and snapshots are 100% reproducible every run. — **Reversibility:** costly — test suites rely on deterministic entity IDs and phone numbers.
- **D-08:** Predictable role accounts & universal test password: Clear email conventions (dmin@poco.care, manager@poco.care, ops@poco.care, leadcare@poco.care, officer1@poco.care, amily1@poco.care) with standard bcrypt hash password (PocoCare123!) for instant login across web and mobile surfaces. — **Reversibility:** reversible — authentication seed constants.

### 3. Backend Test Suite Architecture
- **D-09:** Real PostgreSQL test DB: Run integration test suites against the real PostgreSQL container, validating actual Prisma queries, transactions, constraints, and foreign key cascades. — **Reversibility:** costly — test runner configuration and setup harnesses.
- **D-10:** Comprehensive end-to-end workflow matrix: Multi-actor journey test suites covering (1) Lead to Onboarded & Activated Household, (2) Certification-gated Care Officer Assignment, (3) Service Request creation & 3-step billing hierarchy (quota -> auto-debit -> approval), (4) SLA state transitions & fallback supervisor escalation, (5) AI activity feed intent classification into pending triage tickets. — **Reversibility:** costly — test suite structure and coverage contracts.
- **D-11:** Strict security boundary matrix: Explicit negative authorization tests verifying external token forbidden on Admin API, internal non-Care Officer blocked from Field API, cross-household data leakage blocked when X-Household-Id does not match user\'s membership, and non-Care Officer Manager blocked from reassignments. — **Reversibility:** costly — security audit matrix.
- **D-12:** Deterministic fake timers & pg-boss job processor tests: Use Vitest fake timers (i.useFakeTimers()) to advance SLA response and delivery clocks into At-Risk and Breached states, directly triggering worker handlers deterministically in milliseconds without flaky timeouts. — **Reversibility:** reversible — test time-advancement utilities.

### 4. Mock Media & S3 Presigned Upload Fixtures
- **D-13:** Curated asset fixtures library: Pre-packaged realistic lightweight test fixtures (optimized JPGs/PNGs of medicine trays, vitals monitors, prescription slips, senior avatars, sample PDF health records, and short AAC audio clips) stored in packages/database/fixtures/media. — **Reversibility:** reversible — static media assets.
- **D-14:** In-app local file server: Seed script copies fixture files to the local uploads directory and populates DB rows with local endpoints (/api/common/media/view/:key or /uploads/:key), rendering immediately in UI without AWS credentials. — **Reversibility:** costly — media URL formatting and asset resolution paths.
- **D-15:** Thorough presigned flow verification: Automated tests verifying presigned PUT URL generation with key prefixing, strict MIME validation, max file size limit enforcement (10MB photos, 25MB audio/PDF), expiration window (15 mins), and direct upload completion confirmation hook. — **Reversibility:** costly — media API contracts.
- **D-16:** Comprehensive entity attachment linking: Seeded media attached to senior identity/ICE docs, Care Officer KYC & certification certificates, completed Home Visit SOP step proofs, activity feed chat photo/voice messages, and medical prescriptions. — **Reversibility:** reversible — seed entity relation linkages.

### the agent\'s Discretion
- Exact directory organization for database seeders (packages/database/src/seed/*).
- Synthetic Indian name lists and address generators for Indian cities.
- Specific fixture file dimensions and compression ratios to keep monorepo footprint minimal.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Architecture & Requirements
- docs/poco-elder-care-design-brief.md §3, §4, §5, §6, §7 — Authoritative design brief defining dual auth, pg-boss, 3-step billing hierarchy, dual SLA tracking, 1:1 Care Officer mapping, and offline sync.
- .planning/PROJECT.md — Project context, 1GB DO droplet constraints, and active requirements.
- .planning/REQUIREMENTS.md — Formal requirements matrix (TEST-01, TEST-02, AUTH-01..AUTH-06, CARE-01..CARE-05, TCKT-01..TCKT-07, SLA-01..SLA-05, CATL-01..CATL-05, BILL-01..BILL-07, FEED-01..FEED-07).
- .planning/research/ARCHITECTURE.md — Detailed system architecture, container topology, package graph, and service boundaries.
- .planning/research/STACK.md — Technology stack versions, compatibility matrix, and banned anti-patterns.
- .planning/phases/01-monorepo-foundation-prisma-schema-dry-business-rules/01-CONTEXT.md — Foundation decisions, Prisma schema models, integer paise convention (D-23), and pure business rules.
- .planning/phases/02-integration-partner-stubs-interactive-mocks/02-CONTEXT.md — 12 partner stubs, fault injection, webhooks, and test harnesses.
- .planning/phases/03-common-nestjs-backend-business-services/03-CONTEXT.md — Backend API architecture, dual JWT auth, pluggable AI classification, pg-boss workers, and local media fallback.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- @poco/database: PrismaClient with models for InternalUser, Person, Household, Senior, Ticket, ServiceRequest, HouseholdWallet, WalletTransaction, ActivityFeedItem, VisitReport, Certification, etc.
- @poco/business-rules: Pure functions for state machine transitions, SLA deadline/status evaluations, 3-step billing hierarchy, and certification validation.
- @poco/validation: Surface-scoped Zod schemas for input validation across all surfaces.
- @poco/integrations: 12 partner stubs with FaultInjectorService and webhook delivery handlers.
- apps/api: NestJS controllers, guards, services, and in-process pg-boss background workers.

### Established Patterns
- DRY Single-Source-of-Truth: Pure business logic executed from @poco/business-rules.
- Integer paise arithmetic for all wallet, billing, and pricing operations.
- Surface-scoped REST API route prefixing (/api/family/v1, /api/field/v1, /api/admin/v1, /api/webhooks/v1, /api/common/v1).
- In-process local media file server fallback for local testing without AWS S3.

### Integration Points
- packages/database/src/seed: Database seed scripts and fixture loaders.
- apps/api/test: Vitest backend integration test suites.
- vitest.workspace.ts: Monorepo test runner orchestration.

</code_context>

<specifics>
## Specific Ideas

- Fast dual-tier seeding with pnpm db:seed (full 200 households) and pnpm db:seed:quick (10 households).
- Deterministic faker generator with fixed seed 42 and predictable credentials (dmin@poco.care / PocoCare123!).
- Comprehensive Indian geriatric medical profiles with chronic condition vitals histories and authentic hospital/ICE references.
- Natural Hinglish/Hindi/English conversation threads in activity feeds with AI classification status chips.
- Vitest fake timer acceleration for testing 1-minute cron SLA transitions and 24-hour delivery escalations in milliseconds.

</specifics>

<deferred>
## Deferred Ideas

- None — discussion stayed strictly within Phase 4 scope.

</deferred>

---

*Phase: 04-realistic-seed-data-backend-verification*
*Context gathered: 2026-09-01*

# Phase 04: Realistic Seed Data & Backend Verification - Research

**Researched:** 2026-09-01
**Domain:** Database Seeding, Synthetic Indian Geriatric Data Generation, Media Upload Fixture Architecture, Vitest PostgreSQL Integration Testing
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### 1. Scenario Diversity & Realism
- **D-01:** Distribution focused heavily on active edge cases: 50% Active households with complex open tickets and SLA breaches, 30% Onboarding (leads, pending visits), 20% Inactive/Paused, distributed across Kavach, Sahara, Sampoorna packages including grandfathered v1 versions.
- **D-02:** Comprehensive geriatric cohorts: Rich clinical profiles featuring common Indian geriatric conditions (Diabetes, Hypertension, Cardiac, Dementia, Osteoarthritis), realistic historical vitals trends (BP, blood glucose, SpO2), authentic Indian names and major cities (Bengaluru, Delhi NCR, Mumbai, Chennai, Hyderabad), and verified emergency ICE and local hospital details (Apollo, Fortis, Manipal).
- **D-03:** Full spectrum of operational ticket states: Seeded tickets explicitly covering Pending Triage (AI-suggested from chat), SLA At-Risk (approaching response/delivery deadlines), Breached (escalated to Senior Care Officer), Waiting Ops Update (conflicting child service requests), Pending Approval (insufficient wallet funds), and completed multi-service tickets.
- **D-04:** Natural Indian multilingual mix: Realistic English, Hindi, and Hinglish family & Care Officer chat messages blended with system audit events, vitals alerts, and AI triage status chips in the activity feed.

#### 2. Seed Script Performance & Execution Modes
- **D-05:** Dual-tier seed scripts: pnpm db:seed (full realistic dataset: ~50 care officers, ~200 households, rich operational history) and pnpm db:seed:quick (fast dev dataset: ~5 officers, ~10 households for rapid CI & local startup).
- **D-06:** Fast clean truncate & repopulate: Cleanly wipes existing tables in foreign-key safe topological order before seeding, guaranteeing a completely predictable, pristine state without orphan records.
- **D-07:** Deterministic seeded generator: Uses fixed-seed pseudorandom generation (faker with fixed seed 42) and static anchor IDs/phones so test assertions, IDs, and snapshots are 100% reproducible every run.
- **D-08:** Predictable role accounts & universal test password: Clear email conventions (dmin@pocoeldercare.com, manager@pocoeldercare.com, ops@pocoeldercare.com, leadcare@pocoeldercare.com, officer1@pocoeldercare.com, amily1@pocoeldercare.com) with standard bcrypt hash password (PocoCare123!) for instant login across web and mobile surfaces.

#### 3. Backend Test Suite Architecture
- **D-09:** Real PostgreSQL test DB: Run integration test suites against the real PostgreSQL container, validating actual Prisma queries, transactions, constraints, and foreign key cascades.
- **D-10:** Comprehensive end-to-end workflow matrix: Multi-actor journey test suites covering (1) Lead to Onboarded & Activated Household, (2) Certification-gated Care Officer Assignment, (3) Service Request creation & 3-step billing hierarchy (quota -> auto-debit -> approval), (4) SLA state transitions & fallback supervisor escalation, (5) AI activity feed intent classification into pending triage tickets.
- **D-11:** Strict security boundary matrix: Explicit negative authorization tests verifying external token forbidden on Admin API, internal non-Care Officer blocked from Field API, cross-household data leakage blocked when X-Household-Id does not match user's membership, and non-Care Officer Manager blocked from reassignments.
- **D-12:** Deterministic fake timers & pg-boss job processor tests: Use Vitest fake timers (i.useFakeTimers()) to advance SLA response and delivery clocks into At-Risk and Breached states, directly triggering worker handlers deterministically in milliseconds without flaky timeouts.

#### 4. Mock Media & S3 Presigned Upload Fixtures
- **D-13:** Curated asset fixtures library: Pre-packaged realistic lightweight test fixtures (optimized JPGs/PNGs of medicine trays, vitals monitors, prescription slips, senior avatars, sample PDF health records, and short AAC audio clips) stored in packages/database/fixtures/media.
- **D-14:** In-app local file server: Seed script copies fixture files to the local uploads directory and populates DB rows with local endpoints (/api/test/media/files/:key or /uploads/:key), rendering immediately in UI without AWS credentials.
- **D-15:** Thorough presigned flow verification: Automated tests verifying presigned PUT URL generation with key prefixing, strict MIME validation, max file size limit enforcement (10MB photos, 25MB audio/PDF), expiration window (15 mins), and direct upload completion confirmation hook.
- **D-16:** Comprehensive entity attachment linking: Seeded media attached to senior identity/ICE docs, Care Officer KYC & certification certificates, completed Home Visit SOP step proofs, activity feed chat photo/voice messages, and medical prescriptions.

</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|---|---|---|
| **TEST-01** | Database seed script populates >=2 users per internal role, ~50 care officers, and ~200 households (1-4 seniors each) with realistic clinical/financial data. | Implemented via modular seeders in packages/database/src/seed/ with @faker-js/faker (seed 42), generating full hierarchy, senior medical profiles, vitals, tickets, SLA states, and grandfathered subscriptions. |
| **TEST-02** | Comprehensive Vitest unit and integration test suite verifies state machines, SLA timers, billing rules, and RBAC security. | Implemented in pps/api/test/ with real PostgreSQL execution covering multi-actor workflows, 3-step billing hierarchy, SLA cron advancement & fallback escalation, and cross-surface security boundaries. |
</phase_requirements>

## Summary & Architectural Findings

Phase 4 bridges the completed backend infrastructure (Phase 3) and upcoming frontend portals (Admin Phase 5, Field App Phase 6, Family Portal Phase 7) by:
1. Building a deterministic, dual-tier database seeder (pnpm db:seed and pnpm db:seed:quick) that creates authentic Indian elder care data with 50 care officers, 200 households, rich geriatric histories, Hinglish activity feed conversations, and media fixture attachments.
2. Packaging a lightweight fixture media library (packages/database/fixtures/media) and syncing it to the local uploads disk for immediate zero-cloud media rendering across portals.
3. Constructing an authoritative integration testing harness in pps/api/test executing against real PostgreSQL that verifies the end-to-end multi-actor lifecycles, 3-step billing hierarchy, SLA time-travel transitions, and multi-tenant security guards.

## Validation Architecture

### Test Infrastructure
| Property | Value |
|---|---|
| Framework | Vitest 3.x |
| Config file | apps/api/vitest.config.ts |
| Quick run command | pnpm --filter @poco/api test |
| Full suite command | pnpm test |
| Estimated runtime | ~15 seconds |

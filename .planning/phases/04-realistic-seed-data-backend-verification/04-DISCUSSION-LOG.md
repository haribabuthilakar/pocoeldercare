# Phase 04: Realistic Seed Data & Backend Verification - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-09-01
**Phase:** 04-realistic-seed-data-backend-verification
**Areas discussed:** Scenario Diversity & Realism, Seed Script Performance & Execution Modes, Backend Test Suite Architecture, Mock Media & S3 Presigned Upload Fixtures

---

## Scenario Diversity & Realism

| Option | Description | Selected |
|--------|-------------|----------|
| Weighted Realistic Distribution | 70% Active, 15% Onboarding, 10% At-Risk, 5% Paused/Churned | |
| Even Distribution | Uniformly distribute equal counts across all lifecycle states | |
| Focus heavily on active edge cases | 50% Active with complex open tickets/breaches, 30% Onboarding, 20% Inactive | ✓ |

**User's choice:** Focus heavily on active edge cases — 50% Active with complex open tickets/breaches, 30% Onboarding, 20% Inactive
**Notes:** Maximizes test surface and UI badge rendering for edge cases across admin/family portals.

| Option | Description | Selected |
|--------|-------------|----------|
| Comprehensive Geriatric Cohorts | Rich clinical profiles (Diabetes, Hypertension, Cardiac, Dementia, Osteoarthritis), realistic vitals trends, authentic Indian names/cities, hospital ICE | ✓ |
| Simplified Profiles | Basic names and condition tags without historical vitals | |
| You decide | Flexible | |

**User's choice:** (Recommended) Comprehensive Geriatric Cohorts
**Notes:** Provides authentic clinical depth for charts and medical records.

| Option | Description | Selected |
|--------|-------------|----------|
| Full Spectrum of Operational States | Pending Triage, SLA At-Risk, Breached, Waiting Ops Update, Pending Approval, completed multi-service | ✓ |
| Standard Operations Only | Mostly completed and in-progress tickets | |
| You decide | Flexible | |

**User's choice:** (Recommended) Full Spectrum of Operational States
**Notes:** Ensures every state machine path and admin triage queue is populated.

| Option | Description | Selected |
|--------|-------------|----------|
| Natural Indian Multilingual Mix | Realistic English, Hindi, and Hinglish family conversations blended with audit events and AI status chips | ✓ |
| Standard English Only | Formal English text only | |
| You decide | Flexible | |

**User's choice:** (Recommended) Natural Indian Multilingual Mix
**Notes:** Reflects authentic Indian elder care communication patterns.

---

## Seed Script Performance & Execution Modes

| Option | Description | Selected |
|--------|-------------|----------|
| Dual-Tier Seed Scripts | 'pnpm db:seed' (full ~200 households) + 'pnpm db:seed:quick' (fast ~10 households) | ✓ |
| Single Full Seed Script Only | Monolithic script only | |
| Configurable CLI Flag | Granular flags | |

**User's choice:** (Recommended) Dual-Tier Seed Scripts
**Notes:** Fast dev loop without sacrificing full dataset for staging/demos.

| Option | Description | Selected |
|--------|-------------|----------|
| Fast Clean Truncate & Repopulate | Cleanly wipes tables in FK-safe topological order before inserting | ✓ |
| Upsert-Only Incremental Seeding | Prisma upsert on unique keys without deletion | |
| Interactive / Flagged Reset | Default truncate with optional preservation flag | |

**User's choice:** (Recommended) Fast Clean Truncate & Repopulate
**Notes:** Guaranteed pristine state with 0 orphan relations.

| Option | Description | Selected |
|--------|-------------|----------|
| Deterministic Seeded Generator | Fixed-seed pseudorandom generator (faker seed 42) and static anchor IDs/phones | ✓ |
| Fully Random Generation | Randomizes on every run | |
| You decide | Flexible | |

**User's choice:** (Recommended) Deterministic Seeded Generator
**Notes:** 100% reproducible test assertions across environments.

| Option | Description | Selected |
|--------|-------------|----------|
| Predictable Role Accounts & Universal Test Password | Clear email conventions (admin@poco.care, ops@poco.care, etc.) with password 'PocoCare123!' | ✓ |
| Randomly Generated Passwords | Credentials manifest per run | |
| You decide | Flexible | |

**User's choice:** (Recommended) Predictable Role Accounts & Universal Test Password
**Notes:** Instant login for developers and automated testing.

---

## Backend Test Suite Architecture

| Option | Description | Selected |
|--------|-------------|----------|
| Real PostgreSQL Test DB | Run integration tests against real PostgreSQL container | ✓ |
| Mocked Prisma Layer | Mock Prisma methods | |
| Hybrid Strategy | Mocked unit + selective PostgreSQL | |

**User's choice:** (Recommended) Real PostgreSQL Test DB
**Notes:** Validates actual SQL constraints, transactions, and foreign keys.

| Option | Description | Selected |
|--------|-------------|----------|
| Comprehensive End-to-End Workflow Matrix | Multi-actor journey test suites across onboarding, assignments, 3-step billing, SLA escalation, AI triage | ✓ |
| Targeted Component Integration Tests | Isolated services only | |
| You decide | Flexible | |

**User's choice:** (Recommended) Comprehensive End-to-End Workflow Matrix
**Notes:** Complete end-to-end multi-actor coverage.

| Option | Description | Selected |
|--------|-------------|----------|
| Strict Security Boundary Matrix | Negative authorization tests verifying external forbidden on admin, non-officer blocked from field, household isolation | ✓ |
| Basic Happy-Path Auth Tests | Login and token generation only | |
| You decide | Flexible | |

**User's choice:** (Recommended) Strict Security Boundary Matrix
**Notes:** Strict multi-role and dual JWT security posture.

| Option | Description | Selected |
|--------|-------------|----------|
| Deterministic Fake Timers & Mocked Boss Queue Runner | Vitest fake timers ('vi.useFakeTimers()') advancing SLA response and delivery clocks in milliseconds | ✓ |
| Real Delay Timeouts | Real timeout intervals | |
| You decide | Flexible | |

**User's choice:** (Recommended) Deterministic Fake Timers & Mocked Boss Queue Runner
**Notes:** Fast, deterministic background job verification without flaky delays.

---

## Mock Media & S3 Presigned Upload Fixtures

| Option | Description | Selected |
|--------|-------------|----------|
| Curated Asset Fixtures Library | Pre-packaged lightweight test fixtures (medicine trays, vitals monitors, prescription slips, senior avatars, audio) | ✓ |
| Placeholder URLs Only | Dummy binary buffers and placeholder domains | |
| You decide | Flexible | |

**User's choice:** (Recommended) Curated Asset Fixtures Library
**Notes:** Authentic UI visual presentation across all surfaces.

| Option | Description | Selected |
|--------|-------------|----------|
| In-App Local File Server | Seed script copies fixtures to local uploads and populates local endpoints without AWS credentials | ✓ |
| Direct Remote Cloud S3 Storage | Real AWS S3 required | |
| You decide | Flexible | |

**User's choice:** (Recommended) In-App Local File Server
**Notes:** Seamless local offline development without AWS setup.

| Option | Description | Selected |
|--------|-------------|----------|
| Thorough Presigned Flow Verification | Automated tests verifying presigned PUT generation, MIME validation, file size limits, expiration, confirmation hook | ✓ |
| Basic Presign Contract Test | URL string check only | |
| You decide | Flexible | |

**User's choice:** (Recommended) Thorough Presigned Flow Verification
**Notes:** Guarantees direct upload security contracts.

| Option | Description | Selected |
|--------|-------------|----------|
| Comprehensive Entity Attachment Linking | Seeded media attached to senior ICE, Care Officer KYC/certifications, visit SOP proof photos, chat voice/photos, prescriptions | ✓ |
| Minimal Attachments | Profile avatars only | |
| You decide | Flexible | |

**User's choice:** (Recommended) Comprehensive Entity Attachment Linking
**Notes:** Rich visual proof across all operational touchpoints.

---

## the agent's Discretion

- Exact directory structure for database seeders (packages/database/src/seed/*).
- Synthetic Indian names and address generators for Indian cities.
- Specific media fixture compression and dimensions to keep repo lightweight.

## Deferred Ideas

- None — discussion stayed strictly within Phase 4 scope.

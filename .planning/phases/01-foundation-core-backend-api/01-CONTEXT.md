# Phase 1: Foundation & Core Backend API - Context

**Gathered:** 2026-08-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Establishes the Turborepo monorepo workspace, PostgreSQL & Prisma relational schema modeling all 90 services, households, members, and ICE profiles; dynamic versioned SOP template engine; authentication and RBAC with phone/email support; doctor home visits and teleconsultations API; in-app INR wallet balance ledger; and comprehensive Vitest unit and integration test suite.
</domain>

<decisions>
## Implementation Decisions

### Auth & Session Strategy
- **D-01:** Primary login authentication via Phone Number (with mockable OTP for local dev/testing) and Email & Password fallback. — **Reversibility:** costly — changing identity model touches all auth guards and user tables.
- **D-02:** Dual Bearer JWT token architecture: short-lived Access Token in memory/Authorization header (15m) + long-lived Refresh Token (30d) in Authorization header/cookie to support both Next.js web portals and React Native mobile clients uniformly.
- **D-03:** Multi-role user model with context switching: a single user profile can hold multiple roles across households (e.g., primary adult child on Household A, secondary viewer on Household B, or Care Officer on assigned households).

### 90-Service Catalog & Plan Quota Schema
- **D-04:** Explicit Subscription Quota Ledger: subscriptions (Kavach, Sahara, Sampoorna) track included visit allowances in a relational quota ledger and automatically decrement balance upon service execution completion. — **Reversibility:** one-way — database schema migration for quota accounting.
- **D-05:** Pre-funded INR Wallet with Atomic Holds & Deductions: pay-per-use and overage services pre-check wallet balance, create an atomic hold on booking, and finalize debit on verified service completion.
- **D-06:** First-class Clinical Entities: dedicated ClinicalConsult and Prescription database models linked to ServiceExecution to store structured doctor home visit and teleconsultation clinical notes, diagnoses, and medication attachments.

### Dynamic SOP & Checklist Engine
- **D-07:** Versioned JSON-Schema Step Definitions: SOP templates define checklist steps with typed input definitions (binary yes/no, number, photo upload URL, vitals measurement, signature) allowing dynamic mobile UI rendering and immutable historical snapshots.
- **D-08:** Relational ICE Medical Profile with In-Memory/Redis Fast Cache: structured, encrypted database records for conditions, allergies, baseline vitals, and preferred hospitals with pre-cached Redis payloads to guarantee sub-2-second retrieval on inbound emergency calls.
- **D-09:** Explicit Drill Mode Flag (is_drill: true): Care Officer emergency drills execute the full workflow end-to-end while preventing actual external ambulance dispatches.

### Seed Data & Mock Environment
- **D-10:** Complete 90-Service Catalog Seed: all 90 services populated from docs/Pococare_Elder_90_Services_Matrix.md with exact matrix pricing, plan quotas, and default SOP templates on database initialization.
- **D-11:** Realistic Multi-City Indian Personas: mock seed dataset featuring realistic households across Bangalore, Chennai, Mumbai, and Delhi with senior members, NRI children in US/UK time zones, Care Officers, and panel Doctors with historical vitals.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Product & Service Specifications
- docs/Pococare_Elder_90_Services_Matrix.md — Complete 90-service catalog, plan availability (Kavach, Sahara, Sampoorna, Nivas), quotas, and unit pricing.
- docs/Pococare_User_Stories.md — User stories and acceptance criteria across Dispatcher, Senior Voice, Family Portal, Field App, and Ops CRM.
- docs/Ops_and_Tech_Capabilities.md — Ops & tech capabilities, workflow responsibilities, and architectural boundaries.

### Project & Research Contracts
- .planning/PROJECT.md — Project context, core value, constraints, and locked decisions.
- .planning/REQUIREMENTS.md — Scoped v1 requirements (FND-01 through FND-08 for Phase 1).
- .planning/research/SUMMARY.md — Architectural topology, monorepo layout, and pitfall mitigations.
- .planning/research/STACK.md — Specific stack choices: NestJS, Prisma, PostgreSQL 16, Turborepo, pnpm.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- Greenfield workspace. Turborepo structure to be established with @poco/database, @poco/types, and @poco/config shared packages.

### Established Patterns
- Modular NestJS structure (pps/api/src/modules/auth, pps/api/src/modules/members, pps/api/src/modules/catalog, pps/api/src/modules/sop, pps/api/src/modules/billing).
- Prisma Client exported from @poco/database for use across NestJS backend and seed scripts.

### Integration Points
- REST API endpoints consumed by upcoming Family Portal (Phase 2), Field App (Phase 3), Ops CRM (Phase 4), and Emergency Dispatcher (Phase 5).

</code_context>

<specifics>
## Specific Ideas

- Ensure Phone Number authentication includes a mock OTP generator for dev/test environments (e.g. fixed OTP 123456 in development mode).
- Dual timezone support should be built into date utilities at the shared types layer.

</specifics>

<deferred>
## Deferred Ideas

- 24x7 live-in attendant service (Nivas tier) — deferred to v2.
- International multi-currency Forex payments — deferred to v2.

</deferred>

---

*Phase: 01-Foundation & Core Backend API*
*Context gathered: 2026-08-21*

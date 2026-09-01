---
phase: 05-admin-portal-next-js
plan: "04"
subsystem: admin-portal
tags:
  - pg-boss-inspector
  - synthetic-dispatcher
  - partner-diagnostics
  - e2e-verification
  - admin-workflows
requires:
  - Phase 01: Core Architecture & Data Modeling
  - Phase 02: Business Rules & Workflow Engine
  - Phase 05 Plan 01: App Shell & Operations Queues
  - Phase 05 Plan 02: Care Officers & Catalog Studio
  - Phase 05 Plan 03: Lead Pipeline, Billing & Database Explorer
provides:
  - pg-boss queue inspector with failed task table, 1-click retry, and confirmation modal purge
  - Synthetic test dispatcher with pre-configured scenario presets and live HTTP response preview
  - Comprehensive end-to-end test suite for all 8 administrative workflows (TEST-04)
affects:
  - apps/admin-portal
  - apps/api
tech-stack:
  added: []
  patterns:
    - Background job queue telemetry and failed task replay
    - Synthetic webhook simulation with JSON syntax validation
    - In-process end-to-end testing with zero external network dependencies
key-files:
  created:
    - apps/admin-portal/src/app/admin/integrations/components/pg-boss-inspector.tsx
    - apps/admin-portal/src/app/admin/integrations/components/synthetic-payload-dispatcher.tsx
    - apps/admin-portal/test/components/pg-boss-inspector.spec.tsx
    - apps/admin-portal/test/components/synthetic-dispatcher.spec.tsx
    - apps/api/test/admin-portal-e2e.spec.ts
  modified:
    - apps/admin-portal/src/app/admin/integrations/page.tsx
key-decisions:
  - "D-17 / INTG-05: pg-boss background queue inspector with metric cards, retry buttons, and purge dialog"
  - "D-18 / INTG-05: Synthetic webhook test dispatcher with scenario presets (Wearable SOS, 0-quota emergency, expired cert)"
  - "TEST-04 / ADMN-01..05: 8-workflow end-to-end admin integration test suite executing with zero external network dependencies"
requirements:
  - INTG-05
  - TEST-04
  - ADMN-01
  - ADMN-02
  - ADMN-03
  - ADMN-04
  - ADMN-05
coverage:
  - deliverable: "pg-boss Queue Inspector & Job Retry / Purge"
    verification:
      kind: test
      ref: "apps/admin-portal/test/components/pg-boss-inspector.spec.tsx"
      status: pass
    human_judgment: false
  - deliverable: "Synthetic Test Dispatcher & Live HTTP Preview"
    verification:
      kind: test
      ref: "apps/admin-portal/test/components/synthetic-dispatcher.spec.tsx"
      status: pass
    human_judgment: false
  - deliverable: "Admin Operations End-to-End Test Suite"
    verification:
      kind: test
      ref: "apps/api/test/admin-portal-e2e.spec.ts"
      status: pass
    human_judgment: false
duration: 5 min
completed: 2026-09-01T09:14:00Z
---

# Phase 05 Plan 04: Diagnostics Expansion, pg-boss Inspector & Admin E2E Suite Summary

## Accomplishments
- **pg-boss Background Queue Inspector (`/admin/integrations`)**: Implemented background job telemetry (Active, Completed 24h, Failed counts), failed task inspector table with error descriptions, 1-click retry mutations, and destructive queue purge confirmation modal.
- **Synthetic Webhook Test Dispatcher**: Built scenario preset runner (Wearable Fall SOS, Out-of-Quota Emergency Service, Expired BLS Certification) with custom JSON editor, target endpoint selector, and live HTTP status/body response viewer.
- **Admin Operations End-to-End Suite (`apps/api/test/admin-portal-e2e.spec.ts`)**: Built automated integration tests validating all 8 core admin workflows:
  1. Triage Quick Approve & Service Request Decomposition
  2. Rollup Exception Resolution & Audit Logging
  3. Care Officer Certification Gating & Manager Override
  4. SLA Breach & Supervisor Escalation Tree
  5. Catalog Version Immutability & Grandfathered Rate Protection
  6. Lead Management Pipeline & Sales-to-CS Handoff
  7. Financial Emergency Overdraft & Low Balance Alert
  8. Diagnostics & Synthetic Webhook Dispatcher
- **Test Verification**: 42 tests passing across 12 spec files in `@poco/admin-portal`, and 49 tests passing across 12 spec files in `@poco/api`.

## Self-Check: PASSED
- Key files created and verified on disk
- Vitest suites passing cleanly: `pnpm --filter @poco/admin-portal test` and `pnpm --filter @poco/api test`

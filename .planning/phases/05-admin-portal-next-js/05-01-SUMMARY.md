---
phase: 05-admin-portal-next-js
plan: "01"
subsystem: admin-portal
tags:
  - nextjs15
  - tanstack-query
  - omni-role
  - triage
  - exceptions
  - sla-risk
requires:
  - Phase 01: Core Architecture & Data Modeling
  - Phase 02: Business Rules & Workflow Engine
  - Phase 03: Unified REST API & Service Layer
provides:
  - Next.js 15 App Shell with multi-role staff navigation layout
  - High-density Operations Triage queue with 5-second polling and 1-click Quick Approve
  - Rollup Exception reconciliation tree modal with mandatory audit note
  - SLA At-Risk dual timer queue with supervisor fallback escalation
affects:
  - apps/admin-portal
tech-stack:
  added:
    - "@tanstack/react-query@^5.62.0"
    - "@testing-library/react@^16.1.0"
    - "@testing-library/jest-dom@^6.6.3"
    - "jsdom@^26.0.0"
  patterns:
    - Omni-role navigation union with header role badge chips
    - 5-second client-side polling with TanStack React Query under 1GB DO droplet constraints
    - 1-click inline Quick Approve for high-confidence AI-classified tickets
    - Hierarchical child service request conflict tree modal
key-files:
  created:
    - apps/admin-portal/vitest.config.ts
    - apps/admin-portal/test/setup.ts
    - apps/admin-portal/test/fixtures/staff-session.fixture.ts
    - apps/admin-portal/test/fixtures/tickets.fixture.ts
    - apps/admin-portal/src/lib/api-client.ts
    - apps/admin-portal/src/app/layout.tsx
    - apps/admin-portal/src/app/admin/layout.tsx
    - apps/admin-portal/src/app/admin/providers.tsx
    - apps/admin-portal/src/app/admin/triage/page.tsx
    - apps/admin-portal/src/app/admin/triage/components/triage-edit-modal.tsx
    - apps/admin-portal/src/app/admin/exceptions/page.tsx
    - apps/admin-portal/src/app/admin/exceptions/components/rollup-resolution-modal.tsx
    - apps/admin-portal/src/app/admin/sla-risk/page.tsx
    - apps/admin-portal/test/components/admin-shell.spec.tsx
    - apps/admin-portal/test/components/triage-queue.spec.tsx
    - apps/admin-portal/test/components/exception-resolution.spec.tsx
    - apps/admin-portal/test/components/sla-risk.spec.tsx
  modified:
    - apps/admin-portal/package.json
    - apps/admin-portal/tsconfig.json
key-decisions:
  - "D-01: Omni-role merged sidebar computing the union of all assigned staff roles with badge chips in header"
  - "D-02 / D-07: TanStack Query 5s polling for operations queues instead of heavy WebSockets"
  - "D-03 / ADMN-01: 1-click inline Quick Approve on high-confidence AI triage suggestions"
  - "D-05 / TCKT-07: Hierarchical rollup reconciliation tree modal with mandatory audit note"
requirements:
  - ADMN-01
  - ADMN-02
  - TCKT-02
  - TCKT-06
  - TCKT-07
  - AUTH-02
  - AUTH-06
coverage:
  - deliverable: "Next.js 15 App Shell & Omni-Role Navigation Layout"
    verification:
      kind: test
      ref: "apps/admin-portal/test/components/admin-shell.spec.tsx"
      status: pass
    human_judgment: false
  - deliverable: "High-Density Operations Triage Queue with 5s Polling & 1-Click Quick Approve"
    verification:
      kind: test
      ref: "apps/admin-portal/test/components/triage-queue.spec.tsx"
      status: pass
    human_judgment: false
  - deliverable: "Rollup Exception Reconciliation Tree Modal"
    verification:
      kind: test
      ref: "apps/admin-portal/test/components/exception-resolution.spec.tsx"
      status: pass
    human_judgment: false
  - deliverable: "SLA At-Risk Dual Timer Operations Queue"
    verification:
      kind: test
      ref: "apps/admin-portal/test/components/sla-risk.spec.tsx"
      status: pass
    human_judgment: false
duration: 4 min
completed: 2026-09-01T09:05:00Z
---

# Phase 05 Plan 01: Admin Portal App Shell & Operations Queues Summary

## Accomplishments
- **Next.js 15 App Shell & Omni-Role Staff Navigation (`/admin/*`)**: Implemented omni-role layout that computes the union of permitted routes for multi-role staff members (`SUPER_ADMIN`, `OPS_MANAGER`, `CARE_MANAGER`, `SALES_LEAD`) and renders active role badge chips in the header.
- **Operations Triage Queue (`/admin/triage`)**: Built high-density data table polling `/api/admin/v1/tickets?triageStatus=PENDING_TRIAGE` every 5 seconds via TanStack React Query v5, supporting 1-click inline Quick Approve of AI suggestions and modal-based multi-request decomposition.
- **Emergency Items Handling**: Displayed SOS and fall alert items with red alert badges and prominent priority styling.
- **Rollup Exceptions Queue & Tree Modal (`/admin/exceptions`)**: Implemented exception management with hierarchical child service request status tree and mandatory resolution audit notes.
- **SLA At-Risk Queue (`/admin/sla-risk`)**: Implemented dual timer monitoring (Triage SLA and Delivery SLA) with percentage elapsed visual indicators and supervisor fallback escalation triggering.
- **Automated Vitest Test Suite**: 15 component tests passing across all shell and queue surfaces.

## Self-Check: PASSED
- Key files created and verified on disk
- Vitest suite (15 tests) passing cleanly: `pnpm --filter @poco/admin-portal test`

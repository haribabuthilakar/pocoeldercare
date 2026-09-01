---
phase: "05"
slug: "admin-portal-next-js"
status: approved
nyquist_compliant: true
wave_0_complete: false
created: "2026-09-01"
---

# Phase 05 — Validation Strategy: Admin Operations Portal (Next.js)

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest (^2.1.8 / ^3.0.0) & playwright (^1.49.1) |
| **Config file** | `apps/admin-portal/vitest.config.ts`, `apps/api/vitest.config.ts` |
| **Quick run command** | `pnpm --filter @poco/api test` & `pnpm --filter @poco/admin-portal test` |
| **Full suite command** | `pnpm test` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm --filter @poco/admin-portal test` / `pnpm --filter @poco/api test`
- **After every plan wave:** Run `pnpm test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 05-01-01 | 01 | 1 | ADMN-01, AUTH-02 | SEC-01 | Omni-role navigation and JWT auth session handling | unit | `pnpm --filter @poco/admin-portal test layout auth` | ❌ W0 | ⬜ pending |
| 05-01-02 | 01 | 1 | ADMN-01, TCKT-02 | SEC-01 | High-density Triage queue with 5s polling & inline quick approve | component | `pnpm --filter @poco/admin-portal test triage-queue` | ❌ W0 | ⬜ pending |
| 05-01-03 | 01 | 1 | ADMN-02, TCKT-06 | SEC-01 | Rollup exception resolution modal & SLA at-risk queue | component | `pnpm --filter @poco/admin-portal test exception-resolution sla-risk` | ❌ W0 | ⬜ pending |
| 05-02-01 | 02 | 2 | ADMN-03, CARE-02, CARE-03 | SEC-02 | Care Officer roster, certification gating & manager override | component | `pnpm --filter @poco/admin-portal test care-officers assignment` | ❌ W0 | ⬜ pending |
| 05-02-02 | 02 | 2 | CATL-05 | SEC-03 | Service catalog & package version studio with integer paise math | component | `pnpm --filter @poco/admin-portal test catalog-studio versioning` | ❌ W0 | ⬜ pending |
| 05-03-01 | 03 | 3 | ADMN-04 | SEC-01 | Lead management pipeline & Sales-to-CS ownership transition | component | `pnpm --filter @poco/admin-portal test leads-pipeline` | ❌ W0 | ⬜ pending |
| 05-03-02 | 03 | 3 | BILL-01..07 | SEC-01 | Financial billing dashboard, negative balance alerts & invoices | component | `pnpm --filter @poco/admin-portal test billing-dashboard` | ❌ W0 | ⬜ pending |
| 05-03-03 | 03 | 3 | ADMN-05 | SEC-04 | Paginated raw database explorer with PII masking & JSON viewer | component | `pnpm --filter @poco/admin-portal test database-explorer` | ❌ W0 | ⬜ pending |
| 05-04-01 | 04 | 4 | INTG-05, TEST-04 | SEC-01 | Diagnostics grid, pg-boss job retry/purge & synthetic dispatcher | component | `pnpm --filter @poco/admin-portal test integrations diagnostics` | ❌ W0 | ⬜ pending |
| 05-04-02 | 04 | 4 | ALL | SEC-01..05 | End-to-end admin workflow validation suite | e2e | `pnpm test` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `apps/admin-portal/vitest.config.ts` — vitest configuration for React testing library / component tests
- [ ] `apps/admin-portal/test/setup.ts` — mock service worker / fetch setup for TanStack Query
- [ ] Shared mock fixtures for internal users, tickets, care officers, and rate cards

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Audio note player in KYC/Visit preview | FLD-04 | Audio playback hardware buffer in browser | Click voice note preview in visit modal and verify in-browser audio playback control responds |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 15s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-09-01

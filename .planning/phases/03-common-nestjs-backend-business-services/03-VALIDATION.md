---
phase: "03"
slug: "common-nestjs-backend-business-services"
status: draft
nyquist_compliant: false
wave_0_complete: false
created: "2026-09-01"
---

# Phase 03 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 3.0.5 |
| **Config file** | `apps/api/vitest.config.ts` |
| **Quick run command** | `pnpm --filter @poco/api test` |
| **Full suite command** | `pnpm test` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm --filter @poco/api test`
- **After every plan wave:** Run `pnpm test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 1 | AUTH-01..06 | T-03-01 | Dual JWT authentication, role authorization, and household context validation | integration | `pnpm --filter @poco/api test auth` | ❌ W0 | ⬜ pending |
| 03-01-02 | 01 | 1 | ONBD-01..03 | T-03-02 | Lead onboarding and sales-to-CS transition state validation | integration | `pnpm --filter @poco/api test onboarding` | ❌ W0 | ⬜ pending |
| 03-02-01 | 02 | 2 | CARE-01..05 | T-03-03 | 1:1 Care Officer mapping, certification validation, and supervisor escalation | integration | `pnpm --filter @poco/api test care-officers` | ❌ W0 | ⬜ pending |
| 03-02-02 | 02 | 2 | CATL-01..05 | T-03-04 | Immutable catalog & grandfathered subscription versioning | integration | `pnpm --filter @poco/api test catalog` | ❌ W0 | ⬜ pending |
| 03-03-01 | 03 | 3 | TCKT-01..07 | T-03-05 | Universal ticket creation, service request triage, and state rollups | integration | `pnpm --filter @poco/api test tickets` | ❌ W0 | ⬜ pending |
| 03-03-02 | 03 | 3 | SLA-01..05 | T-03-06 | Dual SLA clocks, 60s cron evaluation, and breach fallback reassignment | integration | `pnpm --filter @poco/api test sla` | ❌ W0 | ⬜ pending |
| 03-04-01 | 04 | 4 | BILL-01..07 | T-03-07 | Deterministic 3-step billing hierarchy, wallet ledger, negative balance overdraft | integration | `pnpm --filter @poco/api test billing` | ❌ W0 | ⬜ pending |
| 03-04-02 | 04 | 4 | FEED-01..07 | T-03-08 | Activity feed delta polling, in-process AI triage worker, mock provider | integration | `pnpm --filter @poco/api test activity-feed` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `apps/api/test/auth.spec.ts` — covers AUTH-01..06
- [ ] `apps/api/test/care-officers.spec.ts` — covers CARE-01..05
- [ ] `apps/api/test/tickets-sla.spec.ts` — covers TCKT-01..07 & SLA-01..05
- [ ] `apps/api/test/billing.spec.ts` — covers BILL-01..07
- [ ] `apps/api/test/activity-feed-ai.spec.ts` — covers FEED-01..07
- [ ] `apps/api/vitest.config.ts` — test configuration for backend test suite

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| None | — | All phase behaviors have automated verification | Unit and integration test suites cover API endpoints, guards, services, and workers |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

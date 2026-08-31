---
phase: "01"
slug: "monorepo-foundation-prisma-schema-dry-business-rules"
status: draft
nyquist_compliant: true
wave_0_complete: false
created: "2026-08-31"
---

# Phase 01 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution of Monorepo Foundation, Prisma Schema & DRY Business Rules.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest `^2.1.8` |
| **Config file** | `packages/business-rules/vitest.config.ts`, `vitest.workspace.ts` |
| **Quick run command** | `pnpm --filter @poco/business-rules test` |
| **Full suite command** | `pnpm turbo test` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm --filter @poco/business-rules test`
- **After every plan wave:** Run `pnpm turbo test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | Foundation | T-01-SC | Dependency integrity and clean build outputs | build | `pnpm build` | ❌ W0 | ⬜ pending |
| 01-01-02 | 01 | 1 | CATL-01, CATL-02 | T-01-05 | Versioned package & catalog models with integer paise | unit | `pnpm --filter @poco/database test` | ❌ W0 | ⬜ pending |
| 01-02-01 | 02 | 2 | AUTH-01, AUTH-02, AUTH-05 | T-01-01 | Disjoint JWT token contracts & role capability matrix | unit | `pnpm --filter @poco/business-rules test auth` | ❌ W0 | ⬜ pending |
| 01-02-02 | 02 | 2 | CARE-01, CARE-03 | T-01-03 | 1:1 Care Officer household constraint & certification gating | unit | `pnpm --filter @poco/business-rules test assignments` | ❌ W0 | ⬜ pending |
| 01-03-01 | 03 | 2 | TCKT-03, SLA-02 | T-01-02 | Ticket state transitions & dual SLA status calculation | unit | `pnpm --filter @poco/business-rules test state-machine` | ❌ W0 | ⬜ pending |
| 01-03-02 | 03 | 2 | BILL-01, BILL-03, BILL-04, BILL-05 | T-01-02 | 3-step billing hierarchy (Quota -> Negative Emergency -> Wallet Auto -> Hold) | unit | `pnpm --filter @poco/business-rules test billing` | ❌ W0 | ⬜ pending |
| 01-04-01 | 04 | 3 | CATL-03, CATL-04 | T-01-05 | Immutable version grandfathered pricing & SOP resolution | unit | `pnpm --filter @poco/business-rules test grandfathering` | ❌ W0 | ⬜ pending |
| 01-04-02 | 04 | 3 | Foundation | T-01-04 | Database migrations & baseline idempotent seed execution | smoke | `pnpm --filter @poco/database db:seed` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `packages/business-rules/vitest.config.ts` — package test config
- [ ] `packages/business-rules/test/state-machine.spec.ts` — covers TCKT-03, exceptions
- [ ] `packages/business-rules/test/billing.spec.ts` — covers BILL-01, BILL-03, BILL-04, BILL-05
- [ ] `packages/business-rules/test/sla.spec.ts` — covers SLA-02
- [ ] `packages/business-rules/test/assignments.spec.ts` — covers CARE-01, CARE-03
- [ ] `packages/business-rules/test/invariants.spec.ts` — property tests with `fast-check`

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Docker Compose Windows multi-service startup | Foundation | Local container daemon lifecycle | Run `docker-compose up -d` and verify Postgres (5432) and Adminer (8080) respond |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 10s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** verified 2026-08-31
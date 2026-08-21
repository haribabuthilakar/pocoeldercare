---
phase: 1
slug: foundation-core-backend-api
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-08-21
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|---|---|
| **Framework** | Vitest 2.x + Supertest |
| **Config file** | itest.config.ts |
| **Quick run command** | pnpm test:unit |
| **Full suite command** | pnpm test |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run pnpm test:unit
- **After every plan wave:** Run pnpm test
- **Before /gsd-verify-work:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---|---|---|---|---|---|---|---|---|---|
| 01-01-01 | 01 | 1 | FND-01 | — | Monorepo build and package linking | integration | pnpm build | ❌ W0 | ⬜ pending |
| 01-01-02 | 01 | 1 | FND-02 | T-01-01 | Type-safe schema with relational integrity | integration | pnpm --filter @poco/database test | ❌ W0 | ⬜ pending |
| 01-01-03 | 01 | 1 | FND-08 | — | Docker compose spins up PostgreSQL & Redis | e2e | docker compose ps | ❌ W0 | ⬜ pending |
| 01-02-01 | 02 | 2 | FND-03 | T-01-02 | Bearer JWT validation & RBAC guards | unit | pnpm --filter api test auth | ❌ W0 | ⬜ pending |
| 01-02-02 | 02 | 2 | FND-04 | T-01-03 | ICE medical profile CRUD & sub-2s query | integration | pnpm --filter api test ice | ❌ W0 | ⬜ pending |
| 01-02-03 | 02 | 2 | FND-05 | T-01-04 | Dynamic SOP template versioning & validation | unit | pnpm --filter api test sop | ❌ W0 | ⬜ pending |
| 01-03-01 | 03 | 3 | FND-06 | — | Doctor visit booking and prescription recording | integration | pnpm --filter api test clinical | ❌ W0 | ⬜ pending |
| 01-03-02 | 03 | 3 | FND-07 | T-01-05 | Atomic wallet holds, deductions & invoice rollup | unit | pnpm --filter api test billing | ❌ W0 | ⬜ pending |
| 01-03-03 | 03 | 3 | FND-08 | — | Full suite automated regression pass | integration | pnpm test | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] packages/database/prisma/schema.prisma — Core models (User, Household, Member, IceProfile, ServiceCatalog, Subscription, Wallet, SopTemplate)
- [ ] pps/api/test/setup.ts — Shared test database harness
- [ ] docker-compose.yml — Local PostgreSQL 16 and Redis 7 definitions

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|---|---|---|---|
| None | — | All Phase 1 foundation behaviors have automated Vitest verifications | Run pnpm test |

---

## Validation Sign-Off

- [x] All tasks have <automated> verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 15s
- [x] 
yquist_compliant: true set in frontmatter

**Approval:** approved 2026-08-21

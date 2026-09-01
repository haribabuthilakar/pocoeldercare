---
phase: 04
slug: realistic-seed-data-backend-verification
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-09-01
---

# Phase 04 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 3.x |
| **Config file** | pps/api/vitest.config.ts |
| **Quick run command** | pnpm --filter @poco/api test |
| **Full suite command** | pnpm test |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run pnpm --filter @poco/api test
- **After every plan wave:** Run pnpm test
- **Before /gsd-verify-work:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 04-01-01 | 01 | 1 | TEST-01 | — | N/A (Seed data generator) | integration | pnpm db:seed:quick | ✅ | ⬜ pending |
| 04-01-02 | 01 | 1 | TEST-01 | — | N/A (Full scaled seed & fixtures) | integration | pnpm db:seed | ✅ | ⬜ pending |
| 04-02-01 | 02 | 2 | TEST-02 | T-04-01 | Multi-actor journey verification | integration | pnpm --filter @poco/api test onboarding care-officers tickets-sla billing | ✅ | ⬜ pending |
| 04-02-02 | 02 | 2 | TEST-02 | T-04-02 | Strict security & isolation matrix | integration | pnpm --filter @poco/api test auth | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- Existing infrastructure covers all phase requirements.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Media asset rendering | TEST-01 | Visual fixture verification | Verify sample avatar and SOP images render in browser |

---

## Validation Sign-Off

- [x] All tasks have <automated> verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 15s
- [x] 
yquist_compliant: true set in frontmatter

**Approval:** approved 2026-09-01

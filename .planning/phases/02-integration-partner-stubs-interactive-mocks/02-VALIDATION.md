---
phase: "02"
slug: "integration-partner-stubs-interactive-mocks"
status: draft
nyquist_compliant: false
wave_0_complete: false
created: "2026-08-31"
---

# Phase 02 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 3.x |
| **Config file** | packages/integrations/vitest.config.ts |
| **Quick run command** | `pnpm --filter @poco/integrations test` |
| **Full suite command** | `pnpm --filter @poco/integrations test && pnpm --filter @poco/ui test` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm --filter @poco/integrations test`
- **After every plan wave:** Run `pnpm --filter @poco/integrations test && pnpm --filter @poco/ui test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | INTG-01 | T-02-01 | Zod partner contract DTO schemas & fixture generators | unit | `pnpm --filter @poco/validation test` | ❌ W0 | ⬜ pending |
| 02-01-02 | 01 | 1 | INTG-01 | T-02-02 | Fault injection & base partner adapter interface | unit | `pnpm --filter @poco/integrations test packages/integrations/src/__tests__/fault-injector.spec.ts` | ❌ W0 | ⬜ pending |
| 02-02-01 | 02 | 1 | INTG-01 | T-02-03 | 12 Partner Stubs (Pococare, Razorpay, ABHA, Exotel, etc.) | unit | `pnpm --filter @poco/integrations test packages/integrations/src/__tests__/adapters.spec.ts` | ❌ W0 | ⬜ pending |
| 02-02-02 | 02 | 1 | INTG-01 | T-02-04 | Automatic and manual callback progression scheduler | unit | `pnpm --filter @poco/integrations test packages/integrations/src/__tests__/callback-scheduler.spec.ts` | ❌ W0 | ⬜ pending |
| 02-03-01 | 03 | 2 | INTG-02 | T-02-05 | Interactive Razorpay Checkout Simulator component | component | `pnpm --filter @poco/ui test packages/ui/src/simulators/__tests__/razorpay.spec.tsx` | ❌ W0 | ⬜ pending |
| 02-03-02 | 03 | 2 | INTG-02 | T-02-06 | Interactive Exotel Telephony IVR Simulator with DTMF tones | component | `pnpm --filter @poco/ui test packages/ui/src/simulators/__tests__/exotel.spec.tsx` | ❌ W0 | ⬜ pending |
| 02-04-01 | 04 | 2 | INTG-03 | T-02-07 | Silent hourly wearable telemetry ping & missed ping scanner | integration | `pnpm --filter @poco/integrations test packages/integrations/src/__tests__/wearable-monitoring.spec.ts` | ❌ W0 | ⬜ pending |
| 02-04-02 | 04 | 2 | INTG-04 | T-02-08 | Fall detection webhook -> Emergency ticket & ambulance request | integration | `pnpm --filter @poco/integrations test packages/integrations/src/__tests__/webhook-ingestion.spec.ts` | ❌ W0 | ⬜ pending |
| 02-05-01 | 05 | 3 | INTG-05 | T-02-09 | Admin Integration Health, Fault Sliders & Preset Dispatcher | component | `pnpm --filter @poco/ui test` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `packages/integrations/vitest.config.ts` — package test config
- [ ] `packages/integrations/src/__tests__/setup.ts` — shared fixtures and mocks
- [ ] `pnpm --filter @poco/integrations add -D vitest @types/node` — test framework setup

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Audio DTMF tones & voice prompt playback | INTG-02 | Web Audio API / SpeechSynthesis hardware speaker verification | Click dialpad digits on Exotel simulator in browser, verify tone pitch and speech synthesis output |

---

## Validation Sign-Off

- [ ] All tasks have <automated> verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending 2026-08-31

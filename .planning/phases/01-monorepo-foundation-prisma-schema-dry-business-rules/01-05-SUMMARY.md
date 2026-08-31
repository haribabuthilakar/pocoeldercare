---
phase: 01-monorepo-foundation-prisma-schema-dry-business-rules
plan: "05"
subsystem: billing
tags: [billing, financial-math, integer-paise, gst, subscriptions, assignments, certifications]

requires:
  - phase: 01-monorepo-foundation-prisma-schema-dry-business-rules
    provides: "@poco/constants, @poco/types, and @poco/business-rules state machines"
provides:
  - Deterministic 3-step billing hierarchy evaluator (AUTO_DEBIT_QUOTA -> EMERGENCY_NEGATIVE_DEBIT -> AUTO_DEBIT_WALLET -> REQUIRE_FAMILY_APPROVAL)
  - Exact integer paise financial arithmetic (GST 18% half-up, wallet debits, holds, settlements, INR formatting)
  - Subscription quota rollover engine with Use-It-or-Lose-It period reset
  - Care Officer assignment validator with role authorization (Care Manager/Admin), 1:1 household exclusivity, and mandatory unexpired certification gating
  - Grandfathered service pricing resolver and lead conversion initializer
affects:
  - 01-06-PLAN.md
  - apps/api
  - apps/admin-portal
  - apps/family-portal
  - apps/field-app

actuals:
  tokens: 25000
  tasks: 2
  commits: 1

tech-stack:
  added: []
  patterns:
    - 3-step billing hierarchy execution contract (BILL-03, BILL-04, BILL-05)
    - Exact 64-bit integer paise arithmetic (1 INR = 100 paise) eliminating float rounding
    - Role and unexpired certification gating on Care Officer assignments (CARE-01, CARE-03)

key-files:
  created:
    - packages/business-rules/src/billing/money.ts
    - packages/business-rules/src/billing/evaluator.ts
    - packages/business-rules/src/billing/holds.ts
    - packages/business-rules/src/billing/subscription.ts
    - packages/business-rules/src/assignments/validator.ts
    - packages/business-rules/src/assignments/reassignment.ts
    - packages/business-rules/src/catalog/pricing.ts
    - packages/business-rules/src/sales/lead-conversion.ts
  modified:
    - packages/business-rules/src/index.ts

key-decisions:
  - "Enforced integer paise calculations for all financial amounts with deterministic half-up GST rounding."
  - "Implemented strict 3-step billing hierarchy: (1) Quota, (2) Emergency Overdraft, (3) Wallet Auto-Debit, (4) Family Approval Required."
  - "Mandated Care Manager/Admin caller role and unexpired certification verification for all Care Officer assignments."
  - "Built Use-It-or-Lose-It subscription quota reset logic resetting unused units to package baseline each period."

patterns-established:
  - "evaluateBillingAction(ctx) returns complete BillingDecision with action, paise breakdown, and approval requirements."
  - "formatInr(paise) produces canonical INR currency strings with Indian grouping (e.g. ₹12,500.50)."

requirements-completed:
  - BILL-01
  - BILL-03
  - BILL-04
  - BILL-05
  - CARE-01
  - CARE-03
  - CATL-03
  - CATL-04

coverage:
  - id: D1
    description: "Deterministic 3-step billing hierarchy evaluator and integer paise financial arithmetic"
    requirement: "BILL-03"
    verification:
      - kind: other
        ref: "pnpm --filter @poco/business-rules build"
        status: pass
    human_judgment: false
  - id: D2
    description: "Care Officer assignment validator with 1:1 exclusivity and certification gating"
    requirement: "CARE-01"
    verification:
      - kind: other
        ref: "pnpm --filter @poco/business-rules build"
        status: pass
    human_judgment: false

duration: 12 min
completed: 2026-08-31
status: complete
---

# Phase 01 Plan 05: Billing Engine & Assignments Summary

**Deterministic 3-step billing hierarchy evaluator, integer paise financial mathematics (GST, wallet debits, holds, settlements), subscription quota rollover, and Care Officer assignment validation with certification gating in @poco/business-rules.**

## Performance

- **Duration:** 12 min
- **Started:** 2026-08-31T11:56:30Z
- **Completed:** 2026-08-31T12:08:45Z
- **Tasks:** 2
- **Files created:** 9

## Accomplishments

- Implemented pure 3-step billing hierarchy evaluator (`evaluateBillingAction`) enforcing: (1) Quota Deduction, (2) Emergency Overdraft, (3) Wallet Auto-Debit, (4) Family Approval Request per BILL-03, BILL-04, BILL-05.
- Implemented integer paise arithmetic (`calculateGst`, `calculateWalletDebit`, `formatInr`) with zero floating point errors per D-23, D-55.
- Implemented wallet pre-authorization hold and settlement calculators per D-67.
- Implemented subscription quota rollover engine enforcing "Use-It-or-Lose-It" resets per D-57.
- Built Care Officer assignment and reassignment validators verifying Manager/Admin caller permissions, 1:1 household exclusivity, and mandatory unexpired certification gating per CARE-01, CARE-03, D-52.
- Built grandfathered pricing resolver and lead conversion validators.

## Task Commits

1. **Task 1 & 2: 3-Step Billing Engine, Financial Math, Subscriptions & Assignments** - `dbc4eae` (feat)

## Files Created/Modified

- `packages/business-rules/src/billing/*` - Money math, billing evaluator, holds, and subscription rollovers
- `packages/business-rules/src/assignments/*` - Officer assignment and reassignment validators
- `packages/business-rules/src/catalog/*` - Grandfathered price resolution
- `packages/business-rules/src/sales/*` - Lead conversion validation

## Decisions Made

- Standardized all monetary calculations strictly on Integer in Paise (1 INR = 100 paise).
- Enforced strict 1:1 household exclusivity and certification checks directly in pure assignment validation functions.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None.

## Next Phase Readiness

- All business logic algorithms are compiled.
- Ready for `01-08-PLAN.md` (Database Seeds & Docker Configuration) and `01-06-PLAN.md` (Vitest Testing Harness & 100% Invariant Test Suites).

---
*Phase: 01-monorepo-foundation-prisma-schema-dry-business-rules*
*Completed: 2026-08-31*

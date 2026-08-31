---
phase: 01-monorepo-foundation-prisma-schema-dry-business-rules
plan: "03"
subsystem: validation
tags: [zod, validation, dto, json-schema, claude-tools, auth, webhooks]

requires:
  - phase: 01-monorepo-foundation-prisma-schema-dry-business-rules
    provides: "@poco/constants, @poco/types, and @poco/business-rules"
provides:
  - Surface-namespaced Zod 3.24+ runtime validation schemas (auth, family, field, admin, webhooks, common formats)
  - Inferred TypeScript DTOs and Zod error formatters
  - Anthropic Claude SDK tool JSON schema converter (convertZodToClaudeToolSchema)
  - Multi-role domain authorization capability matrix and timing-safe HMAC webhook signature validator
affects:
  - 01-05-PLAN.md
  - 01-06-PLAN.md
  - apps/api
  - apps/family-portal
  - apps/admin-portal
  - apps/field-app

actuals:
  tokens: 24000
  tasks: 2
  commits: 1

tech-stack:
  added:
    - zod@^3.24.1
    - zod-to-json-schema@^3.24.1
  patterns:
    - Surface-namespaced validation modules (src/family/*, src/field/*, src/admin/*, src/webhooks/*, src/auth/*)
    - Discriminated union schemas for clinical vitals and ticket types
    - Timing-safe HMAC signature verification for partner webhooks

key-files:
  created:
    - packages/validation/src/common/formats.ts
    - packages/validation/src/common/pagination.ts
    - packages/validation/src/common/errors.ts
    - packages/validation/src/auth/index.ts
    - packages/validation/src/family/index.ts
    - packages/validation/src/field/index.ts
    - packages/validation/src/admin/index.ts
    - packages/validation/src/webhooks/index.ts
    - packages/validation/src/tools/json-schema.ts
    - packages/validation/src/index.ts
    - packages/business-rules/src/auth/jwt.ts
    - packages/business-rules/src/auth/capabilities.ts
    - packages/business-rules/src/auth/webhooks.ts
  modified:
    - packages/constants/src/statuses.ts
    - packages/business-rules/src/index.ts

key-decisions:
  - "Built surface-namespaced Zod schemas matching REST API route groups."
  - "Enforced integer paise limits in wallet validation (min 10,000 paise = ₹100, max 10,000,000 paise = ₹1,00,000)."
  - "Integrated zod-to-json-schema for Anthropic Claude SDK structured tool calling."
  - "Implemented timing-safe HMAC-SHA256 signature verification for partner webhooks."

patterns-established:
  - "z.infer<typeof schema> used to produce canonical TypeScript DTO types."
  - "formatZodError transforms Zod validation failures into normalized field-level error arrays."

requirements-completed:
  - AUTH-01
  - AUTH-02
  - AUTH-05

coverage:
  - id: D1
    description: "Surface-namespaced Zod validation schemas, inferred DTOs, and Claude tool JSON Schema converter"
    requirement: "AUTH-01"
    verification:
      - kind: other
        ref: "pnpm --filter @poco/validation build"
        status: pass
    human_judgment: false
  - id: D2
    description: "Multi-role capability matrix and HMAC webhook signature validator in @poco/business-rules"
    requirement: "AUTH-02"
    verification:
      - kind: other
        ref: "pnpm --filter @poco/business-rules build"
        status: pass
    human_judgment: false

duration: 12 min
completed: 2026-08-31
status: complete
---

# Phase 01 Plan 03: Zod Validation & Auth Rules Summary

**Surface-namespaced Zod 3.24+ schemas across Auth, Family, Field, Admin, and Webhooks with inferred DTOs, Claude tool JSON Schema generator, multi-role capability matrix, and HMAC webhook verifiers.**

## Performance

- **Duration:** 12 min
- **Started:** 2026-08-31T11:44:15Z
- **Completed:** 2026-08-31T11:56:30Z
- **Tasks:** 2
- **Files created:** 20

## Accomplishments

- Created `@poco/validation` with surface-namespaced modules: `auth`, `family`, `field`, `admin`, `webhooks`, and `common`.
- Implemented Indian format validators (phone with +91 normalization, 14-digit ABHA ID, 6-digit PIN code).
- Implemented discriminated union vital reading schemas with clinical bounds (BP systolic > diastolic, SpO2 50-100%, glucose 20-600 mg/dL).
- Implemented `convertZodToClaudeToolSchema` for Anthropic Claude AI activity feed triage integration.
- Implemented multi-role domain capability evaluator (`hasCapability`) and timing-safe HMAC webhook signature validator (`verifyWebhookSignature`) in `@poco/business-rules`.

## Task Commits

1. **Task 1 & 2: Zod Validation Schemas, DTO Inference & Auth Capability Rules** - `086d253` (feat)

## Files Created/Modified

- `packages/validation/src/*` - Zod schemas and inferred DTOs
- `packages/business-rules/src/auth/*` - JWT builders, multi-role capability matrix, and HMAC webhook verification

## Decisions Made

- Grouped schemas by surface consumer to simplify controller imports and bundle splitting.
- Used timing-safe buffer comparison to prevent timing attacks on webhook signature checks.

## Deviations from Plan

- Added `LeadStage` and `SopProofType` enums to `@poco/constants` for unified enum exports.

## Issues Encountered

None.

## User Setup Required

None.

## Next Phase Readiness

- `@poco/validation` is built and ready.
- Ready for `01-05-PLAN.md` (3-Step Billing Engine & Assignments) and `01-08-PLAN.md` (Seeds & Docker).

---
*Phase: 01-monorepo-foundation-prisma-schema-dry-business-rules*
*Completed: 2026-08-31*

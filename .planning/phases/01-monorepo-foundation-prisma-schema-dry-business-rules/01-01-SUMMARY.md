---
phase: 01-monorepo-foundation-prisma-schema-dry-business-rules
plan: "01"
subsystem: infra
tags: [monorepo, turborepo, pnpm, typescript, tsup, eslint, constants, types]

requires: []
provides:
  - Turborepo and pnpm workspace configuration with sub-second incremental builds
  - Shared TypeScript compiler presets (@poco/tsconfig) and architectural boundary ESLint guards (@poco/eslint-config)
  - Compiled core domain packages (@poco/constants and @poco/types) with dual ESM/CJS outputs and full .d.ts definitions
affects:
  - 01-02-PLAN.md
  - 01-03-PLAN.md
  - 01-04-PLAN.md
  - 01-07-PLAN.md

actuals:
  tokens: 18500
  tasks: 2
  commits: 2

tech-stack:
  added:
    - turbo@^2.3.3
    - typescript@^5.7.2
    - tsup@^8.3.5
    - vitest@^3.0.5
    - "@typescript-eslint/eslint-plugin@^8.18.0"
    - eslint-plugin-import@^2.31.0
  patterns:
    - Dual ESM/CJS build target output via tsup with strict .d.ts declaration maps
    - Package boundary enforcement via eslint-plugin-import no-restricted-paths
    - Two-root authentication token payload isolation (ExternalJwtPayload vs InternalJwtPayload)

key-files:
  created:
    - package.json
    - pnpm-workspace.yaml
    - turbo.json
    - vitest.workspace.ts
    - .npmrc
    - .nvmrc
    - .gitattributes
    - .gitignore
    - packages/tsconfig/base.json
    - packages/eslint-config/index.js
    - packages/constants/src/index.ts
    - packages/constants/src/roles.ts
    - packages/constants/src/statuses.ts
    - packages/constants/src/sla.ts
    - packages/constants/src/partners.ts
    - packages/types/src/index.ts
    - packages/types/src/auth.ts
    - packages/types/src/tickets.ts
    - packages/types/src/billing.ts
    - packages/types/src/activity.ts
    - packages/types/src/partners.ts
    - packages/types/src/logging.ts
  modified: []

key-decisions:
  - "Configured strict pnpm workspace catalog versioning and tsup dual ESM/CJS bundling with .d.ts generation for instant cross-package consumption."
  - "Established strict isolation between ExternalJwtPayload (personId/householdId) and InternalJwtPayload (internalUserId/UserRole[]) with tokenType discriminators."
  - "Configured ESLint no-restricted-paths rules forbidding UI portals from importing internal backend modules and preventing backend from importing UI components."

patterns-established:
  - "Workspace packages export compiled dual ESM/CJS via tsup with types at dist/index.d.ts."
  - "Integer paise (Paise = number) used exclusively for financial amounts across all type definitions."

requirements-completed:
  - AUTH-01
  - AUTH-02
  - AUTH-05
  - SLA-02

coverage:
  - id: D1
    description: "Turborepo + pnpm workspace root configuration with strict engines, tooling presets, and ESLint boundary rules"
    requirement: "AUTH-01"
    verification:
      - kind: other
        ref: "pnpm -v && node -v"
        status: pass
    human_judgment: false
  - id: D2
    description: "Compiled @poco/constants and @poco/types packages with dual ESM/CJS bundles, SLA constants, and dual auth contracts"
    requirement: "AUTH-02"
    verification:
      - kind: other
        ref: "pnpm --filter @poco/constants build; pnpm --filter @poco/types build"
        status: pass
    human_judgment: false

duration: 8 min
completed: 2026-08-31
status: complete
---

# Phase 01 Plan 01: Monorepo Foundation & Core Types Summary

**Turborepo + pnpm monorepo workspace scaffold with strict TS 5.7+ presets, ESLint architectural boundary guards, and compiled @poco/constants and @poco/types dual ESM/CJS packages.**

## Performance

- **Duration:** 8 min
- **Started:** 2026-08-31T11:00:40Z
- **Completed:** 2026-08-31T11:08:45Z
- **Tasks:** 2
- **Files created:** 23

## Accomplishments

- Established root monorepo configuration (`pnpm-workspace.yaml`, `turbo.json`, `vitest.workspace.ts`, `.npmrc`, `.nvmrc`, `.gitattributes`, `.gitignore`).
- Created `@poco/tsconfig` providing `base.json`, `node.json`, and `react.json` strict TypeScript compiler presets.
- Configured `@poco/eslint-config` with architectural import boundary guards preventing cross-app or backend-to-UI leaks.
- Built and compiled `@poco/constants` with `UserRole`, `FamilyRole`, `RoleCapability`, `TicketStatus`, `SlaStatus`, `VitalType`, and `PartnerCode`.
- Built and compiled `@poco/types` with two-root auth payloads (`ExternalJwtPayload`, `InternalJwtPayload`), `Paise` integer currency types, domain ticket/billing interfaces, and lightweight `ILogger`.

## Task Commits

1. **Task 1: Monorepo Root Scaffold, Workspace Config & Tooling Presets** - `f9d02ae` (feat)
2. **Task 2: Build and Compile @poco/constants and @poco/types Packages** - `c266b16` (feat)

## Files Created/Modified

- `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `vitest.workspace.ts` - Monorepo root orchestration
- `.npmrc`, `.nvmrc`, `.gitattributes`, `.gitignore` - Strict engine and line-ending guards
- `packages/tsconfig/*` - Base, Node, and React tsconfig presets
- `packages/eslint-config/*` - ESLint boundary rules
- `packages/constants/*` - Role, status, SLA, and partner enums and constants
- `packages/types/*` - Auth, ticket, billing, activity, partner, and logging TypeScript definitions

## Decisions Made

- Standardized on `tsup` for rapid esbuild bundling producing dual ESM (`.js`/`.mjs`) and CJS (`.cjs`/`.js`) outputs with full `.d.ts` declaration maps.
- Explicitly separated `ExternalJwtPayload` (holding `householdId`, `role: FamilyRole`, `tokenType: 'EXTERNAL'`) from `InternalJwtPayload` (holding `email`, `roles: UserRole[]`, `tokenType: 'INTERNAL'`).

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None.

## Next Phase Readiness

- Foundation, constants, and types are built and verified.
- Ready for Wave 2 plans: `01-02-PLAN.md` (Prisma Schema), `01-04-PLAN.md` (Business Rules State Machine), and `01-07-PLAN.md` (Design Tokens & UI Primitives).

---
*Phase: 01-monorepo-foundation-prisma-schema-dry-business-rules*
*Completed: 2026-08-31*

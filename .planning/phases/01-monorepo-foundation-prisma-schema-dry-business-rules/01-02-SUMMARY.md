---
phase: 01-monorepo-foundation-prisma-schema-dry-business-rules
plan: "02"
subsystem: database
tags: [prisma, postgresql, database, schema, migrations, orm]

requires:
  - phase: 01-monorepo-foundation-prisma-schema-dry-business-rules
    provides: "@poco/constants and @poco/types packages"
provides:
  - Complete multi-file PostgreSQL Prisma 6 schema across 10 core domains
  - Typed PrismaClient singleton with soft-delete extensions in @poco/database
  - Database-level relational invariants (UUID PKs, integer paise, 1:1 Care Officer mapping, immutable version tables, immutable ledger)
affects:
  - 01-03-PLAN.md
  - 01-04-PLAN.md
  - 01-05-PLAN.md
  - 01-06-PLAN.md
  - 01-08-PLAN.md

actuals:
  tokens: 24000
  tasks: 2
  commits: 1

tech-stack:
  added:
    - prisma@^6.2.1
    - "@prisma/client@^6.2.1"
    - dotenv@^16.4.7
  patterns:
    - Modular multi-file Prisma schema organization across 11 domain files
    - Soft-delete read filtering via PrismaClient $extends
    - Two-root authentication partition between Person and InternalUser

key-files:
  created:
    - packages/database/prisma/schema/schema.prisma
    - packages/database/prisma/schema/auth.prisma
    - packages/database/prisma/schema/household.prisma
    - packages/database/prisma/schema/assignment.prisma
    - packages/database/prisma/schema/catalog.prisma
    - packages/database/prisma/schema/ticket.prisma
    - packages/database/prisma/schema/billing.prisma
    - packages/database/prisma/schema/activity.prisma
    - packages/database/prisma/schema/visit.prisma
    - packages/database/prisma/schema/partner.prisma
    - packages/database/prisma/schema/audit.prisma
    - packages/database/src/client.ts
    - packages/database/src/index.ts
  modified: []

key-decisions:
  - "Organized Prisma schema into 11 modular domain files using native schema folder support."
  - "Enforced integer in paise for all monetary values (pricePaise, balancePaise, amountPaise) with zero float types."
  - "Enforced strict 1:1 unique constraint on Household.assignedCareOfficerId."
  - "Created immutable version tables (PackageVersion, ServiceCatalogVersion, SopStepVersion) guaranteeing grandfathered contract terms."
  - "Created single-wallet 1:1 relation with immutable append-only WalletTransaction ledger."

patterns-established:
  - "PrismaClient singleton with soft-delete filtering ($extends) exported from @poco/database."
  - "UUID string primary keys (@id @default(uuid())) across all database tables."

requirements-completed:
  - AUTH-01
  - AUTH-02
  - AUTH-05
  - CARE-01
  - CARE-03
  - CATL-01
  - CATL-02
  - CATL-03
  - CATL-04
  - BILL-01

coverage:
  - id: D1
    description: "Modular multi-file Prisma 6 schema across 10 core domains"
    requirement: "CARE-01"
    verification:
      - kind: other
        ref: "pnpm --filter @poco/database run db:validate"
        status: pass
    human_judgment: false
  - id: D2
    description: "Typed PrismaClient singleton with soft-delete extensions in @poco/database"
    requirement: "BILL-01"
    verification:
      - kind: other
        ref: "pnpm --filter @poco/database run db:generate; pnpm --filter @poco/database run build"
        status: pass
    human_judgment: false

duration: 10 min
completed: 2026-08-31
status: complete
---

# Phase 01 Plan 02: Prisma Schema Architecture Summary

**Comprehensive multi-file PostgreSQL Prisma 6 schema across 10 core domains with database-level relational invariants, UUID primary keys, integer paise currency, and typed PrismaClient singleton.**

## Performance

- **Duration:** 10 min
- **Started:** 2026-08-31T11:08:45Z
- **Completed:** 2026-08-31T11:18:30Z
- **Tasks:** 2
- **Files created:** 17

## Accomplishments

- Designed and assembled 11 modular Prisma schema files covering Auth, Households, Care Officers, Reporting Lines, Service Catalogs, Packages, SOPs, Tickets, SLA, Wallets, Activity Feeds, Leads, Vitals, Partners, and Audit Logs.
- Enforced strict database invariants: UUID primary keys, integer paise currency arithmetic, 1:1 Care Officer assignment exclusivity (`Household.assignedCareOfficerId @unique`), immutable grandfathered version models, two-root auth partition, and immutable wallet ledger.
- Generated Prisma Client and built `@poco/database` exporting typed `prisma` singleton with soft-delete query extensions.

## Task Commits

1. **Task 1 & 2: Modular Multi-File Prisma 6 Schema & Typed PrismaClient Singleton** - `ba91dde` (feat)

## Files Created/Modified

- `packages/database/prisma/schema/*.prisma` - 11 domain schema definitions
- `packages/database/src/client.ts` - Singleton PrismaClient with soft-delete extensions
- `packages/database/src/index.ts` - Re-export of prisma client and @prisma/client types

## Decisions Made

- Leveraged Prisma 6 modular schema folder for clean domain boundary partitioning.
- Configured soft-delete middleware extensions on `Person`, `InternalUser`, `Household`, and `Senior` to automatically filter out soft-deleted records.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None.

## Next Phase Readiness

- `@poco/database` is compiled and ready for downstream business logic and validation packages.
- Ready for `01-04-PLAN.md` (Business Rules State Machine) and `01-07-PLAN.md` (Design Tokens & UI Primitives).

---
*Phase: 01-monorepo-foundation-prisma-schema-dry-business-rules*
*Completed: 2026-08-31*

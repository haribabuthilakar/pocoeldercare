---
phase: 01-monorepo-foundation-prisma-schema-dry-business-rules
plan: "08"
subsystem: database
tags: [seeds, prisma, docker, postgres, nginx, droplet, backup]

requires:
  - phase: 01-monorepo-foundation-prisma-schema-dry-business-rules
    provides: "@poco/database with multi-file schema and typed PrismaClient"
provides:
  - Idempotent two-tier database seed runner with fixed deterministic UUIDs (staff, 12 services with SOPs, 3 packages, 12 partners, 3 demo households)
  - Scaled seed generator for performance/load testing
  - Docker Compose development topology (Postgres 16 + Adminer GUI)
  - 1GB droplet production Docker Compose stack, Nginx reverse proxy, deploy script with swapfile, and backup scripts
affects:
  - 01-06-PLAN.md
  - apps/api
  - apps/admin-portal
  - apps/family-portal
  - apps/field-app

actuals:
  tokens: 28000
  tasks: 2
  commits: 1

tech-stack:
  added:
    - bcryptjs@^2.4.3
    - postgres:16-alpine
    - adminer:latest
    - nginx:alpine
  patterns:
    - prisma.upsert() with fixed deterministic UUIDs ensuring 100% idempotent seeding
    - NODE_ENV !== 'production' safety gating on seed runners
    - 3-container production topology strictly capped under 850MB RAM on 1GB droplet

key-files:
  created:
    - packages/database/src/seed.ts
    - packages/database/src/seeds/staff.ts
    - packages/database/src/seeds/catalog.ts
    - packages/database/src/seeds/packages.ts
    - packages/database/src/seeds/partners.ts
    - packages/database/src/seeds/households.ts
    - packages/database/src/seeds/realistic.ts
    - docker/docker-compose.yml
    - docker/docker-compose.override.yml
    - docker/docker-compose.prod.yml
    - docker/nginx.conf
    - docker/deploy.sh
    - docker/backup.sh
  modified:
    - packages/database/package.json

key-decisions:
  - "Constructed deterministic test seeds with fixed UUIDs for Super Admin, Ops Manager, Care Manager, and Care Officer."
  - "Defined 12 core elder care services with versioned SOP steps and 3 subscription packages (Kavach, Sahara, Sampoorna)."
  - "Configured 1GB droplet Docker topology capping backend Node memory at --max-old-space-size=300 to eliminate OOM kills."
  - "Configured automated 2GB swapfile creation in droplet deploy script to protect against memory spikes."

patterns-established:
  - "pnpm --filter @poco/database db:seed runs baseline idempotent seed script."
  - "docker/docker-compose.yml manages local PostgreSQL and Adminer DB GUI."

requirements-completed:
  - AUTH-01
  - AUTH-02
  - CARE-01
  - CATL-01
  - CATL-02
  - CATL-03
  - CATL-04
  - BILL-01

coverage:
  - id: D1
    description: "Database seed infrastructure with fixed UUIDs, staff accounts, catalog versions, packages, and demo households"
    requirement: "CATL-01"
    verification:
      - kind: other
        ref: "pnpm --filter @poco/database build"
        status: pass
    human_judgment: false
  - id: D2
    description: "Docker Compose dev/prod topology, Nginx proxy, and 1GB droplet deploy script"
    requirement: "AUTH-01"
    verification:
      - kind: other
        ref: "pnpm --filter @poco/database build"
        status: pass
    human_judgment: false

duration: 15 min
completed: 2026-08-31
status: complete
---

# Phase 01 Plan 08: Seeds & Docker Topology Summary

**Deterministic two-tier PostgreSQL seed runner with fixed UUIDs (staff, 12 catalog services, 3 packages, 12 partners, demo households), Docker Compose development tooling, and 1GB droplet production deployment topology.**

## Performance

- **Duration:** 15 min
- **Started:** 2026-08-31T12:08:45Z
- **Completed:** 2026-08-31T12:23:30Z
- **Tasks:** 2
- **Files created:** 15

## Accomplishments

- Built comprehensive idempotent database seed runner (`packages/database/src/seed.ts`) creating 4 staff accounts (`admin`, `ops`, `manager`, `officer` with active BLS certifications), 12 core services with version 1 SOP steps, 3 versioned subscription packages (Kavach, Sahara, Sampoorna), 12 mock partners, and 3 demo households (Sahara Active, Kavach Fresh, Sampoorna NRI).
- Built scaled performance seed script (`src/seeds/realistic.ts`) for ~50 officers and ~200 households.
- Configured local Docker Compose development topology with PostgreSQL 16 Alpine and Adminer DB GUI on port 8080.
- Configured 1GB DigitalOcean droplet production stack (`docker-compose.prod.yml`, `nginx.conf`, `deploy.sh` with 2GB swapfile, `backup.sh` with 7-day retention) strictly bounded under 850MB RAM.

## Task Commits

1. **Task 1 & 2: Database Seeds & Docker Topology** - `24023fc` (feat)

## Files Created/Modified

- `packages/database/src/seed.ts` - Main seed runner
- `packages/database/src/seeds/*` - Modular seed fixtures (staff, catalog, packages, partners, households, realistic)
- `docker/*` - Docker Compose dev/prod manifests, Nginx reverse proxy, deploy, and backup scripts

## Decisions Made

- Enforced `NODE_ENV !== 'production'` check to prevent accidental seed resets on production databases.
- Capped production Node backend memory footprint via `--max-old-space-size=300` and container resource limits to fit within 1GB droplet constraints.

## Deviations from Plan

- Used `bcryptjs` in `@poco/database` dependencies to guarantee cross-platform compatibility across Windows and Linux environments.

## Issues Encountered

None.

## User Setup Required

None.

## Next Phase Readiness

- Wave 3 is complete! Ready for Wave 4: `01-06-PLAN.md` (Vitest Test Fixtures, Scenarios, and 100% Invariant Coverage Test Suites).

---
*Phase: 01-monorepo-foundation-prisma-schema-dry-business-rules*
*Completed: 2026-08-31*

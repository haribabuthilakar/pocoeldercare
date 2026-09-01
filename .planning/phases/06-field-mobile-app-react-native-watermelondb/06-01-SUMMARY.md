---
phase: 06-field-mobile-app-react-native-watermelondb
plan: "01"
subsystem: field-mobile-app
tags:
  - react-native
  - watermelondb
  - offline-first
  - sync-engine
  - auth
  - pin-lock
requires:
  - 01-monorepo-foundation-prisma-schema-dry-business-rules
  - 03-common-nestjs-backend-business-services
provides:
  - apps/field-app harness and build system
  - WatermelonDB 9-table offline schema and domain models
  - Hardware-backed SecureStore session persistence with 4-digit PIN unlock
  - Two-phase batch sync engine with client UUID outbox
  - Live Sync Status Pill and interactive Conflict Review Drawer
affects:
  - apps/field-app
  - packages/types
tech-stack:
  added:
    - "@poco/field-app"
    - "WatermelonDB offline database adapter"
    - "Two-phase batch sync engine"
  patterns:
    - "Client UUID outbox staging (uuidv4)"
    - "4-digit PIN session unlock with indicator dots"
    - "Dual SQLite / in-memory database adapter"
    - "Server-authoritative conflict resolution with visual diff drawer"
key-files:
  created:
    - apps/field-app/package.json
    - apps/field-app/tsconfig.json
    - apps/field-app/vitest.config.ts
    - apps/field-app/test/setup.ts
    - apps/field-app/test/fixtures/field-session.fixture.ts
    - apps/field-app/test/fixtures/database.fixture.ts
    - apps/field-app/src/index.ts
    - apps/field-app/src/context/auth-context.tsx
    - apps/field-app/src/components/navigation/drawer-menu.tsx
    - apps/field-app/src/components/sync/sync-status-pill.tsx
    - apps/field-app/src/components/sync/conflict-review-drawer.tsx
    - apps/field-app/src/db/schema.ts
    - apps/field-app/src/db/database.ts
    - apps/field-app/src/db/models/household.ts
    - apps/field-app/src/db/models/senior.ts
    - apps/field-app/src/db/models/ticket.ts
    - apps/field-app/src/db/models/service-request.ts
    - apps/field-app/src/db/models/sop-step.ts
    - apps/field-app/src/db/models/sop-progress.ts
    - apps/field-app/src/db/models/activity-feed-item.ts
    - apps/field-app/src/db/models/sync-outbox.ts
    - apps/field-app/src/db/models/media-upload.ts
    - apps/field-app/src/sync/sync-engine.ts
    - apps/field-app/src/app/_layout.tsx
    - apps/field-app/src/app/index.tsx
    - apps/field-app/src/app/login.tsx
    - apps/field-app/src/app/pin-lock.tsx
    - apps/field-app/src/app/conflicts/index.tsx
    - apps/field-app/test/components/shell-auth.spec.tsx
    - apps/field-app/test/unit/database-models.spec.ts
    - apps/field-app/test/integration/sync-engine.spec.tsx
  modified:
    - pnpm-lock.yaml
key-decisions:
  - "D-01 & D-04: WatermelonDB local database schema with client-generated RFC4122 v4 UUIDs and outbox mutation staging guarantees deterministic offline write operations."
  - "D-02 & D-03: Two-phase batch sync pushes structured records via POST /api/field/v1/sync/batch and presents server-rejected conflicts in an interactive Conflict Review Drawer."
  - "D-19: Persistent JWT session caching in SecureStore paired with 4-digit PIN unlock screen enables rapid secure re-entry for Care Officers in field conditions."
requirements:
  - FLD-01
  - FLD-06
  - FLD-07
  - AUTH-06
duration: 12 min
completed: "2026-09-01T09:45:00.000Z"
coverage:
  - name: "React Native / Expo Field App Harness & Navigation Drawer"
    verification:
      kind: automated
      ref: "apps/field-app/test/components/shell-auth.spec.tsx"
      status: pass
    human_judgment: false
  - name: "Persistent JWT Auth & 4-Digit PIN Unlock"
    verification:
      kind: automated
      ref: "apps/field-app/test/components/shell-auth.spec.tsx"
      status: pass
    human_judgment: false
  - name: "WatermelonDB 9-Table Schema & Model Classes"
    verification:
      kind: automated
      ref: "apps/field-app/test/unit/database-models.spec.ts"
      status: pass
    human_judgment: false
  - name: "Two-Phase Batch Sync Engine with Client UUID Outbox"
    verification:
      kind: automated
      ref: "apps/field-app/test/integration/sync-engine.spec.tsx"
      status: pass
    human_judgment: false
  - name: "Sync Status Pill & Visual Conflict Review Drawer"
    verification:
      kind: automated
      ref: "apps/field-app/test/integration/sync-engine.spec.tsx"
      status: pass
    human_judgment: false
---

# Phase 06 Plan 01: Field App Harness, WatermelonDB & Sync Engine Summary

Implemented the offline-first foundation for the Poco Field Mobile App (`apps/field-app`), establishing the WatermelonDB database layer with 9 domain tables, SecureStore session persistence with 4-digit numeric PIN unlock, and the two-phase batch sync engine with visual conflict resolution.

## Key Deliverables

1. **Mobile Application Shell & Navigation:**
   - Modular application layout (`_layout.tsx`) with conditional routing between Login, PIN Unlock, and authenticated screens.
   - Slide-out Navigation Drawer (`drawer-menu.tsx`) featuring Care Officer identity details, cluster tagging, fast navigation links, and session lock/logout triggers.
   - Touch-friendly 4-digit PIN Lock Screen (`pin-lock.tsx`) with 10-key numeric keypad, 4 indicator dots, and setup/verification flows.

2. **WatermelonDB Offline Database Layer:**
   - 9-table schema (`schema.ts`) covering `households`, `seniors`, `tickets`, `service_requests`, `sop_steps`, `sop_progress`, `activity_feed_items`, `sync_outbox`, and `media_uploads`.
   - Dual database adapter (`database.ts`) with reactive subscription capabilities, client UUID generation (`uuidv4()`), and outbox mutation staging (`stageMutation()`).
   - Strongly typed model classes with helper methods (`fullAddress`, `allergies`, status checks).

3. **Two-Phase Batch Sync & Conflict Resolution:**
   - `SyncEngine` (`sync-engine.ts`) with online/offline detection, batch packaging, and automatic background replay on reconnect.
   - `SyncStatusPill` (`sync-status-pill.tsx`) displaying real-time synchronization state ("Syncing...", "Up to date", "X Pending", "X Conflicts", "Offline").
   - `ConflictReviewDrawer` (`conflict-review-drawer.tsx`) rendering side-by-side diff comparisons of client mutations vs server state with "Keep Server Version" and "Override Server" actions.

## Self-Check: PASSED
- All 34 automated unit and integration tests across 3 suites pass in 2.5s.

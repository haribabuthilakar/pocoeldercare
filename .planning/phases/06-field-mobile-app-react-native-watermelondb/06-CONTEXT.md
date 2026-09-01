# Phase 06: Field Mobile App (React Native & WatermelonDB) - Context

**Gathered:** 2026-09-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 6 builds the offline-first mobile application for Care Officers (apps/field-app) operating on Indian mobile networks:
- Offline-first local database storage powered by WatermelonDB / SQLite, caching assigned households, seniors, emergency medical details, active tickets, and catalog SOP definitions.
- Guided SOP checklist wizard walking Care Officers through mandatory visit procedures with done/not-done verification, structured notes, choices, and photo/proof capture.
- S3 presigned URL direct media upload pipeline (local device storage queue while offline -> batch upload to S3 on reconnect -> immutable URL proof linkage).
- Visit lifecycle tracking with geofenced GPS check-in/out logging (coordinates sent silently for backend post-audit without client blocking) and single-click Start Visit / Finish Visit interactions.
- Robust two-phase batch sync (POST /api/field/v1/sync/batch) using client-generated UUIDs, outbox mutation queues, and server-authoritative validation with a visual conflict drawer.
- Explicit household activation CTA upon completing initial onboarding visits (transitioning status to Active).
- Offline-ready unified Activity Feed / Chat with local outbox queueing for caregiver notes, auto-triggering background AI triage when synced.
- Mobile application shell built with Expo 52, Expo Router, NativeWind styling (sharing @poco/design-tokens), drawer navigation, and SecureStore session persistence with 4-digit PIN unlock.
</domain>

<decisions>
## Implementation Decisions

### 1. Offline Sync & Conflict Resolution (FLD-01, FLD-06, FLD-07)
- **D-01:** Background automatic sync on network reconnect + pull-to-refresh & manual sync action with persistent status indicator pill (Syncing / Up to date / X changes pending). — **Reversibility:** reversible — client sync polling and event listener design.
- **D-02:** Server-authoritative conflict resolution with visual review drawer: If a ticket or service request was modified/cancelled/reassigned on the server during offline work, the server rejects conflicting transitions and the mobile app highlights them in a dedicated conflict review drawer for officer inspection. — **Reversibility:** costly — sync contract and backend rejection payload schema.
- **D-03:** Two-phase sync pipeline: Structured records/mutations sync immediately via POST /api/field/v1/sync/batch, while photo/audio binary uploads are dispatched asynchronously via background upload queue using direct S3 presigned URLs. — **Reversibility:** costly — media upload queue and sync state machine.
- **D-04:** WatermelonDB local mutation outbox table using client-generated UUIDs (uuidv4()) and sync status flags (synced: boolean) to guarantee deterministic offline creation and idempotent server replay. — **Reversibility:** one-way — database schema and sync protocol architecture.

### 2. Guided SOP Checklist & Visit Execution (FLD-02, FLD-03, FLD-05, ONBD-04, ONBD-05)
- **D-05:** Silent GPS geofence auditing: Device captures GPS coordinates and check-in/out timestamps on client check-in without blocking the officer if outside radius; coordinates and distance are recorded for backend operations audit. — **Reversibility:** reversible — client check-in validation rules.
- **D-06:** Sequential step-by-step wizard: SOP checklist renders as a focused step-by-step wizard with visual progress bar, done/not-done toggles, mandatory photo/proof gating, and structured input fields for clinical values. — **Reversibility:** reversible — checklist UI component.
- **D-07:** In-app photo picker with presigned URL upload: Camera/gallery picker saves locally to device filesystem when offline, queues for background presigned PUT URL upload, and links the S3 URL to the SOP step proof. — **Reversibility:** costly — media capture and storage pipeline.
- **D-08:** Explicit Activate Household CTA: At the conclusion of mandatory onboarding visits, a prominent CTA with a safety confirmation modal allows the officer to flip the household status to Active. — **Reversibility:** costly — onboarding lifecycle state transition.
- **D-09:** Prominent Report Exception action: Sticky exception button in the SOP header allowing officers to flag blockers (e.g. Senior Hospitalized, Access Denied, Equipment Missing) to pause work and transition the ticket to Waiting Ops Update. — **Reversibility:** reversible — visit exception interaction pattern.
- **D-10:** Simplified visit lifecycle actions: Clear Start Visit and Finish Visit action buttons, collapsing transit and intermediate steps while recording timestamps. — **Reversibility:** reversible — visit execution state transitions.

### 3. Mobile Shell, Architecture & Navigation (AUTH-06, FLD-01)
- **D-11:** Expo 52 + Expo Router file-based navigation with web preview support (allowing rapid development and verification via browser preview as well as native mobile runtimes). — **Reversibility:** costly — mobile framework and build tooling.
- **D-12:** Drawer navigation (hamburger menu) providing clean, ergonomic access to Today Visits, Assigned Households, Activity Feed / Messages, Conflict Drawer, and Profile/Sync Settings. — **Reversibility:** reversible — navigation layout.
- **D-13:** NativeWind / Tailwind CSS styling consuming shared design tokens (@poco/design-tokens) for 100% visual consistency with Admin and Family portals. — **Reversibility:** reversible — styling system.
- **D-14:** Dual-adapter storage strategy: SQLite (via WatermelonDB / expo-sqlite) on native mobile runtimes, with in-memory / localStorage storage adapter fallback when running in web browser preview mode. — **Reversibility:** costly — local database adapter layer.

### 4. Household & Senior Profiles Offline Access (FLD-02, FEED-02, FEED-04)
- **D-15:** Emergency-first senior profile card: Senior profile features a prominent red emergency banner with vital alert chips, blood group, allergies, preferred hospital, and 1-tap ICE emergency contact calling buttons. — **Reversibility:** reversible — screen layout.
- **D-16:** Offline two-way activity feed with local outbox: Officers can view recent feed messages and compose notes/updates while offline; pending items display a clock icon and sync automatically upon reconnect, triggering async AI triage on the backend. — **Reversibility:** costly — activity feed caching and background AI pipeline.
- **D-17:** Scope-limited sync footprint: Initial login pulls only assigned households, seniors, active tickets, and catalog SOP versions relevant to the logged-in Care Officer (and supervised tree if Senior Care Officer), conserving mobile bandwidth and storage. — **Reversibility:** costly — sync query optimization and security scoping.
- **D-18:** Structured inline vitals recording: Standardized entry form for Blood Pressure, Pulse, Blood Sugar, SpO2, and Temperature with client-side physiological range validation before saving to WatermelonDB. — **Reversibility:** reversible — form schema and input validation.

### 5. Mobile Security & Offline Media Pipeline (AUTH-06, FLD-04)
- **D-19:** Persistent JWT session in SecureStore with 4-digit PIN unlock / Biometric option for quick re-entry in low-connectivity field environments. — **Reversibility:** reversible — auth storage and PIN lock screen.
- **D-20:** Local filesystem media staging: Offline photos are cached in the device filesystem (cacheDirectory/documentDirectory), tracked in a WatermelonDB media_uploads queue, and uploaded to S3 via presigned PUT URLs once connectivity is restored. — **Reversibility:** costly — offline file management and upload queue.

### the agent Discretion
- Component breakdown, icon selections (Lucide React Native / Lucide Icons), and loading skeleton states.
- Exact styling and micro-interactions of the SOP checklist wizard steps.
- Web-fallback mock data providers for seamless Turborepo workspace builds and browser previews.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Architecture & Requirements
- docs/poco-elder-care-design-brief.md §4, §5, §6 — Authoritative design brief specifying offline-first WatermelonDB, delta sync protocol, direct S3 uploads, guided SOP checklists, and dual auth.
- .planning/PROJECT.md — Core values, constraints, and active requirements.
- .planning/REQUIREMENTS.md — Requirements matrix (FLD-01..07, ONBD-04..05, CARE-04, FEED-02, AUTH-06).
- .planning/research/ARCHITECTURE.md — System architecture, monorepo packages, and mobile surface design.
- .planning/research/STACK.md — Technology stack versions (Expo 52, React Native 0.76, WatermelonDB 0.27, NativeWind/Tailwind).
- .planning/phases/01-monorepo-foundation-prisma-schema-dry-business-rules/01-CONTEXT.md — Data models (Household, Senior, Ticket, ServiceRequest, CareOfficerProfile, SopStepVersion, SopProgress).
- .planning/phases/03-common-nestjs-backend-business-services/03-CONTEXT.md — REST APIs (/api/field/v1/tickets, /api/field/v1/service-requests/:id/*, /api/field/v1/sync/batch, S3 presigned URL generator).
- .planning/phases/04-realistic-seed-data-backend-verification/04-CONTEXT.md — Seed credentials for Care Officers (care.officer.1@poco.care / PocoCare123!).
- .planning/phases/05-admin-portal-next-js/05-CONTEXT.md — Admin Portal patterns, certification gating, and operations exception rollups.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- @poco/database: Complete schema with models for CareOfficerProfile, Household, Senior, Ticket, ServiceRequest, ServiceCatalogVersion, SopStepVersion, SopProgress, ActivityFeedItem.
- @poco/business-rules: Canonical state transitions (transitionServiceRequest, recordSopProgress, evaluateSlaStatus).
- @poco/validation: Field-scoped Zod schemas for status transitions and SOP progress recording.
- @poco/design-tokens: Colors, font weights, border radius, and status badge color definitions.
- apps/api/src/modules/tickets/field-tickets.controller.ts: Existing endpoints for fetching assigned tickets, updating service request status, and recording SOP step progress.
- apps/api/src/modules/storage/storage.service.ts: Presigned PUT URL generator for direct S3 media uploads.

### Established Patterns
- JWT bearer authentication with FieldAuthGuard enforcing CareOfficer internal user role.
- Integer paise arithmetic for financial representations (if displayed).
- Client-generated UUIDs (uuidv4) for offline-created records.
- Structured SOP step completion (isCompleted, proofUrl, notes, choiceValue).

### Integration Points
- apps/field-app: Mobile application workspace in Turborepo.
- apps/api/src/modules/field/*: Backend field endpoints including ticket operations, SOP recording, activity feed posting, and batch sync (POST /api/field/v1/sync/batch).

</code_context>

<specifics>
## Specific Ideas

- Drawer navigation (hamburger menu) containing Today Visits, Assigned Households, Activity Feed / Messages, Conflict Drawer, and Settings.
- Quick 4-digit PIN unlock for Care Officers on the go.
- Clear Start Visit and Finish Visit single-click actions with silent GPS audit coordinates.
- Two-phase sync engine: instantaneous JSON metadata sync via /api/field/v1/sync/batch paired with background S3 presigned URL upload worker.
- Senior profile emergency card with 1-tap dial buttons for ICE contacts and doctor preferences.

</specifics>

<deferred>
## Deferred Ideas

- None — discussion stayed strictly within Phase 6 scope.

</deferred>

---

*Phase: 06-field-mobile-app-react-native-watermelondb*
*Context gathered: 2026-09-01*
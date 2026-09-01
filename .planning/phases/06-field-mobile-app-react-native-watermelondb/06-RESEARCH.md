# Phase 06: Field Mobile App (React Native & WatermelonDB) — Technical Research

## 1. Architecture & Domain Analysis

The Poco Field Mobile App (`apps/field-app`) is a cross-platform mobile application engineered specifically for Care Officers conducting home visits in India. Operating environments feature intermittent, spotty 4G/5G cellular connectivity, requiring an uncompromising **offline-first** architecture where all read and write operations execute against a local SQLite database (via WatermelonDB) and sync asynchronously with the NestJS backend.

### Key Operational Capabilities & Constraints:
- **Zero-Latency Offline Reads/Writes:** Care Officers can load assigned households, seniors, emergency medical details, active tickets, and catalog SOP definitions without active internet.
- **Two-Phase Batch Sync:** Structured mutations queue locally with client-generated UUIDs (`uuidv4()`) and push atomically to `POST /api/field/v1/sync/batch`. Server validates state transitions against `@poco/business-rules`; rejections surface in an interactive Conflict Review Drawer.
- **Direct Cloud Media Pipeline:** Photo and audio notes captured during SOP checklist steps or KYC are staged in local device filesystem cache, tracked in a `media_uploads` WatermelonDB table, and uploaded directly to S3 via presigned PUT URLs (`apps/api/src/modules/storage/storage.service.ts`) without passing through or consuming droplet RAM.
- **Silent Geofenced Audit:** Check-in and check-out capture device GPS coordinates and distance relative to the household address silently for backend operational audit without blocking the officer if GPS drifts.
- **Guided SOP Checklist Wizard:** Step-by-step wizard guiding Care Officers through mandatory SOP actions, capturing done/not-done verification, structured clinical vitals, custom choice inputs, and photo proof.
- **Emergency Senior Profile:** Red ICE (In Case of Emergency) banner with blood group, allergies, preferred hospital, and 1-tap emergency dial buttons.

---

## 2. Technology Stack & Package Architecture

| Layer | Package / Tool | Version | Purpose |
|-------|----------------|---------|---------|
| **Mobile Runtime** | `expo` / `react-native` | `~52.0.0` / `~0.76.0` | Cross-platform mobile foundation with Expo Router and web preview support. |
| **Local Database** | `@nozbe/watermelondb` + `expo-sqlite` | `^0.27.1` | Local SQLite reactive database with schema migrations, model observables, and outbox tables. |
| **Styling & Tokens** | `nativewind` + `@poco/design-tokens` | `^4.0.0` | Tailwind-compatible utility styling sharing canonical color palettes, spacing, and typography. |
| **Icons** | `lucide-react-native` & `lucide-react` | `^0.468.0` | Consistent medical, operational, and navigation iconography across native and web previews. |
| **Auth & Security** | `expo-secure-store` | `~14.0.0` | Hardware-backed secure storage for JWT bearer tokens and 4-digit PIN verification hashes. |
| **Media & Filesystem** | `expo-image-picker` & `expo-file-system` | `~16.0.0` | Camera capture, photo picker, and local media file staging. |
| **Location & Geofencing**| `expo-location` | `~18.0.0` | Accurate GPS coordinates extraction on visit check-in/out. |
| **Testing** | `vitest` + `@testing-library/react-native` | `^3.0.0` | Fast unit and component test harness running in milliseconds. |

---

## 3. Data Models & WatermelonDB Schema

### Local Tables:
1. `households`: `id`, `name`, `address_line1`, `address_line2`, `city`, `pincode`, `latitude`, `longitude`, `status`, `assigned_care_officer_id`, `created_at`, `updated_at`.
2. `seniors`: `id`, `household_id`, `full_name`, `date_of_birth`, `gender`, `blood_group`, `allergies`, `preferred_hospital`, `emergency_contact_name`, `emergency_contact_phone`, `is_primary`.
3. `tickets`: `id`, `household_id`, `senior_id`, `category`, `status`, `triage_status`, `assigned_care_officer_id`, `description`, `created_at`.
4. `service_requests`: `id`, `ticket_id`, `service_catalog_version_id`, `status`, `scheduled_for`, `sop_version_id`.
5. `sop_steps`: `id`, `sop_version_id`, `step_index`, `title`, `description`, `input_type`, `is_mandatory`.
6. `sop_progress`: `id`, `service_request_id`, `sop_step_id`, `is_completed`, `proof_url`, `notes`, `choice_value`, `completed_at`, `synced`.
7. `activity_feed_items`: `id`, `household_id`, `author_id`, `author_role`, `content`, `media_url`, `created_at`, `synced`.
8. `sync_outbox`: `id`, `mutation_type`, `entity_name`, `entity_id`, `payload`, `status`, `created_at`, `retry_count`, `error_message`.
9. `media_uploads`: `id`, `local_uri`, `s3_key`, `presigned_url`, `status`, `entity_type`, `entity_id`, `progress`.

---

## 4. Sync Protocol & Mutation Lifecycle

```
[Care Officer Action (e.g. Complete SOP Step / Start Visit / Send Note)]
                      │
                      ▼
[Write to Local WatermelonDB (synced: false)]
                      │
                      ▼
[Record Mutation Entry in sync_outbox (status: 'pending')]
                      │
       ┌──────────────┴──────────────┐
       ▼                             ▼
[Network Available]           [Offline]
       │                             │
       │                      (Retain in Local DB)
       ▼                             │
[POST /api/field/v1/sync/batch]       │ (Network Restored)
       │                             │
       ├─────────────────────────────┘
       ▼
[Backend Validation with @poco/business-rules]
       │
   ┌───┴─────────────────────────────┐
   ▼                                 ▼
[Success]                      [Conflict / Business Violation]
   │                                 │
   ├─► Mark local synced: true       ├─► Record in conflict review drawer
   ├─► Dispatch background S3        ├─► Highlight entity for officer review
   │   media upload queue            └─► Offer reload or override option
   └─► Auto-trigger AI triage
       (if feed note)
```

---

## 5. Validation Architecture (Nyquist Compliance)

### Automated Test Matrix:
- **WatermelonDB & Schema Unit Tests:** Schema validation, client UUID generation, outbox entry queueing, and model serialization.
- **Sync Engine Integration Tests:** Batch sync payload generation, conflict handling, status transitions, and network state recovery.
- **UI & Component Specs:**
  - App shell, drawer navigation, and PIN unlock authentication modal.
  - Today Visits list, visit lifecycle buttons (Start/Finish), and silent GPS distance calculation.
  - Sequential SOP checklist wizard with done/not-done verification, vitals validation, and exception reporting.
  - Emergency Senior Profile card with ICE phone dial triggers.
  - Offline Activity Feed with optimistic outbox items.
- **End-to-End Suite:** Complete simulated offline visit workflow from login to SOP completion, media staging, and reconnection sync.

### Fast Test Command:
`pnpm --filter @poco/field-app test` (runs under 10 seconds via Vitest).

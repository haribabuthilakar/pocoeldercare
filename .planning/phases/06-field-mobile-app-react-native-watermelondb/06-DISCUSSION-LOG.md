# Phase 06: Field Mobile App (React Native & WatermelonDB) - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-09-01
**Phase:** 06-field-mobile-app-react-native-watermelondb
**Areas discussed:** Offline Sync & Conflict Resolution, Guided SOP Checklist & Check-in UX, Mobile App Shell Navigation & Dev Ergonomics, Household & Senior Profiles Offline Access, Auth Persistence & Offline Media Pipeline

---

## Offline Sync & Conflict Resolution

| Option | Description | Selected |
|--------|-------------|----------|
| Background auto + pull-to-refresh | Automatic sync on reconnect + pull-to-refresh & manual sync pill | ✓ |
| Manual-only sync | Explicit control over sync timing | |
| Periodic polling sync | Fixed 60-second sync intervals | |

**User choice:** Background automatic sync on reconnect + pull-to-refresh & manual sync button with status pill (Syncing / Up to date / X changes pending)

| Option | Description | Selected |
|--------|-------------|----------|
| Server-authoritative + conflict drawer | Server rejects invalid transitions; app surfaces conflict review drawer | ✓ |
| Last-write-wins | Overwrite server data silently | |
| Strict abort & freeze | Block all offline actions on conflict | |

**User choice:** Server-authoritative with visual conflict drawer

| Option | Description | Selected |
|--------|-------------|----------|
| Two-phase queue | Metadata JSON sync first, then async S3 presigned URL binary uploads | ✓ |
| Single-phase | Media uploads must complete before metadata sync | |
| Inline base64 payload | Direct base64 embedding | |

**User choice:** Two-phase queue: structured records sync immediately via POST /api/field/v1/sync/batch, while photo/audio uploads queue in background upload worker

| Option | Description | Selected |
|--------|-------------|----------|
| Client UUIDs + outbox table | uuidv4() + synced boolean flag + local mutation outbox table | ✓ |
| Event sourcing / action replay | Array of dispatched actions | |
| Direct WatermelonDB sync adapter | Generic adapter mapping | |

**User choice:** Client UUIDs (uuidv4) with sync status flag (synced: boolean) and local mutation outbox table in WatermelonDB

---

## Guided SOP Checklist & Check-in UX

| Option | Description | Selected |
|--------|-------------|----------|
| No geofence check on client | Send coordinates silently on check-in for backend-only post-audit | ✓ |
| Soft geofence with override | Warning banner with mandatory override reason | |
| Strict hard geofence | Block check-in completely unless within radius | |

**User choice:** No geofence check on client: Send coordinates silently on check-in for backend-only post-audit

| Option | Description | Selected |
|--------|-------------|----------|
| Step-by-step sequential wizard | Progress bar, done/not-done toggles, mandatory proof gating | ✓ |
| Freeform checklist view | Single scrollable checklist page | |
| Voice-driven assistant | Audio transcription check-off | |

**User choice:** Step-by-step sequential wizard with progress bar, done/not-done toggles, mandatory photo/proof gating per step, and notes/choice input fields

| Option | Description | Selected |
|--------|-------------|----------|
| In-app camera/photo picker with presigned PUT | Direct upload to S3 via presigned URLs | ✓ |
| Device camera only with watermark | Camera only with GPS/time overlay | |
| Voice notes & document attachments | Rich multi-media attachments | |

**User choice:** In-app camera/photo picker requesting presigned PUT URL from API, uploading directly to S3/mock storage, and attaching final URL to SOP step proof

| Option | Description | Selected |
|--------|-------------|----------|
| Prominent Activate Household CTA | Button at end of onboarding checklist with confirmation modal | ✓ |
| Automatic activation | Flipped automatically upon checklist completion | |
| Admin Portal confirmation only | Ops Executive confirms activation in Admin | |

**User choice:** Prominent Activate Household CTA appearing at end of onboarding SOP checklist, triggering confirmation modal before flipping household to Active

| Option | Description | Selected |
|--------|-------------|----------|
| Prominent Report Exception button | Header button to select blocker and transition to Waiting Ops Update | ✓ |
| Cancel visit only | Cancel entire service request | |
| Free-text comment box | Post-visit comment | |

**User choice:** Prominent Report Exception button in SOP header allowing officer to select exception reason (Senior Unwell, Access Denied, Equipment Missing) and pause/transition to Waiting Ops Update

| Option | Description | Selected |
|--------|-------------|----------|
| Single-click Start Visit and Finish Visit | Collapsing transit and intermediate steps | ✓ |
| Multi-stage buttons | Explicit buttons for Accept, Transit, Arrive, Start, Complete | |
| Automated motion tracking | GPS motion detection | |

**User choice:** Single-click Start Visit and Finish Visit buttons, collapsing transit and intermediate steps

---

## Mobile App Shell, Navigation & Dev Ergonomics

| Option | Description | Selected |
|--------|-------------|----------|
| Expo 52 + Expo Router + web preview | File-based routing with web preview support | ✓ |
| React Native CLI bare | Standard bare React Native | |
| Expo 52 with imperative React Navigation | Standard React Navigation stack/tabs | |

**User choice:** Expo 52 + Expo Router (file-based routing) with web preview support (pnpm dev runs in browser or Expo Go on iOS/Android)

| Option | Description | Selected |
|--------|-------------|----------|
| Drawer navigation (hamburger menu) | Menu containing all screens and settings | ✓ |
| Bottom tab navigation | 4-tab bar layout | |
| Single dashboard feed | Single scrollable view | |

**User choice:** Drawer navigation (hamburger menu) containing all screens and settings

| Option | Description | Selected |
|--------|-------------|----------|
| NativeWind / Tailwind CSS | Reusing @poco/design-tokens | ✓ |
| StyleSheet.create with theme | Standard StyleSheet with theme constants | |
| Restyle component library | Shopify Restyle | |

**User choice:** NativeWind / Tailwind CSS styling reusing @poco/design-tokens (consistent colors, typography, status badges across web and mobile)

| Option | Description | Selected |
|--------|-------------|----------|
| SQLite native + in-memory web fallback | WatermelonDB/SQLite native with web fallback adapter | ✓ |
| Mock data only on web | No DB on browser preview | |
| Native mobile only | No web preview support | |

**User choice:** SQLite on native mobile (WatermelonDB / expo-sqlite) with an in-memory/indexedDB/localStorage fallback adapter when running in web browser preview mode

---

## Household & Senior Profiles Offline Access

| Option | Description | Selected |
|--------|-------------|----------|
| Emergency-first snapshot card | Red banner, vital alert chips, blood group, allergies, ICE 1-tap dial | ✓ |
| Minimal profile | Name, address, visit time only | |
| Full clinical chart | Complete vitals history graphs | |

**User choice:** Offline snapshot with red emergency banner: Senior card displays vital alert chips, blood group, allergies, preferred hospital, ICE emergency contacts with 1-tap call buttons, and chronic conditions

| Option | Description | Selected |
|--------|-------------|----------|
| Cached local thread with outbox indicator | View feed offline, compose notes with clock icon, auto-sync | ✓ |
| Read-only feed offline | No offline message composition | |
| Visit checklist notes only | No feed integration | |

**User choice:** Cached local message thread with pending outbox indicator: Officer can compose messages offline; items show a clock icon and auto-post/sync when back online, triggering backend AI triage

| Option | Description | Selected |
|--------|-------------|----------|
| Scope-limited to assigned officer | Sync only assigned households, seniors, tickets, and SOPs | ✓ |
| Sync city/zone | Download all households in operating city | |
| Full database download | Download entire org database | |

**User choice:** Strict scope-limiting: Sync only households, seniors, tickets, and catalog SOPs assigned to the currently logged-in Care Officer (plus fallback supervisor tree if Senior Care Officer)

| Option | Description | Selected |
|--------|-------------|----------|
| Structured inline vitals form | BP, Pulse, Blood Sugar, SpO2, Temp with physiological range validation | ✓ |
| Free-text vitals note | Unstructured text | |
| Bluetooth device pairing only | Hardware biometric streaming | |

**User choice:** Inline vitals entry form (BP, Pulse, Blood Sugar, SpO2, Temperature) with immediate range validation and local delta storage in WatermelonDB

---

## Auth Persistence & Offline Media Pipeline

| Option | Description | Selected |
|--------|-------------|----------|
| SecureStore + 4-digit PIN unlock | Persistent JWT with quick PIN unlock for field convenience | ✓ |
| Full login on each open | Standard email/password screen | |
| SMS OTP only | OTP login | |

**User choice:** Persistent JWT session in SecureStore with quick 4-digit PIN unlock / Biometric option for field convenience and quick resumption in low-connectivity areas

| Option | Description | Selected |
|--------|-------------|----------|
| Filesystem cache + background upload queue | Cache image locally, request presigned URL on reconnect, upload | ✓ |
| Block photo capture offline | Require active internet for camera | |
| Base64 inline in sync payload | Base64 strings in sync JSON | |

**User choice:** Store captured photos locally in device file system (cache/documents) with a pending-upload queue; when online, request presigned PUT URL from API, upload binary directly to S3, and update record with final URL

## the agent Discretion
- Component breakdown, loading skeletons, icon mappings (Lucide React Native).
- Micro-interactions on checklist steps.
- Mock storage fallback for browser development environment.

## Deferred Ideas
- None — discussion stayed strictly within Phase 6 scope.
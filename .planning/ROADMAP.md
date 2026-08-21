# Roadmap: Pococare Elder Care Platform

## Overview

Pococare is delivered in six structured phases following a modular horizontal-layer architecture. Starting with a rock-solid NestJS REST API and PostgreSQL database modeling the 90-service catalog, the platform sequentially delivers the subscriber-facing Family Portal, offline-first Care Officer Field App, Operations CRM, low-latency Emergency Dispatcher Command Centre, and telephony speech-to-text integration for elder voice requests.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [x] **Phase 1: Foundation & Core Backend API** - Turborepo monorepo, NestJS REST API, Prisma schema, auth/RBAC, ICE medical profile, and 90-service catalog engine.
- [x] **Phase 2: Family Portal Web Application** - Next.js portal for family/NRI children with vitals trends, dual-timezone calendar, wallet top-up, and monthly value digest.
- [x] **Phase 3: Field App for Care Officers** - React Native (Expo) mobile app with offline SQLite sync, route sequencing, dynamic SOP checklists, vitals capture, and dry-run drills.
- [x] **Phase 4: Operations CRM & Admin Hub** - Next.js ops dashboard for multi-city monitoring, partner panels, auto-assignment with override audit logs, and payout reconciliation.
- [x] **Phase 5: Emergency Dispatcher Command Centre** - Low-latency Dispatcher UI with Exotel CTI caller ID mapping, <2s ICE lookup, live SLA countdowns, and hospital pre-briefs.
- [x] **Phase 6: Telephony Voice Ingestion & Integrations** - Exotel voicemail recording + Google Cloud STT in Indian languages, ABHA sync monitor, and community lead interface.

---

## Phase Details

### Phase 1: Foundation & Core Backend API
**Goal**: Establish the Turborepo monorepo, PostgreSQL & Prisma data models, authentication/RBAC, and tested REST APIs across the 90-service catalog, households, ICE profiles, doctor visits, and wallet billing.
**Depends on**: Nothing (first phase)
**Requirements**: FND-01, FND-02, FND-03, FND-04, FND-05, FND-06, FND-07, FND-08
**Success Criteria** (what must be TRUE):
  1. Turborepo workspace builds cleanly with shared database (@poco/database) and TypeScript contracts (@poco/types).
  2. Prisma schema migrates cleanly on local Docker PostgreSQL.
  3. NestJS REST endpoints handle auth, household onboarding, ICE profile CRUD (<2s response), and dynamic SOP versioning.
  4. Doctor home visit and teleconsult scheduling API records bookings and clinical notes.
  5. Vitest test suite passes with full coverage on auth, catalog, and wallet ledger logic.
**Plans**: 3 plans

Plans:
- [x] 01-01: Turborepo workspace setup, Prisma database schema, and Docker compose environment.
- [x] 01-02: Authentication/RBAC, Household onboarding, ICE profile CRUD, and versioned SOP catalog REST APIs.
- [x] 01-03: Doctor visits, teleconsults, and INR wallet billing APIs with comprehensive Vitest suite.

### Phase 2: Family Portal Web Application
**Goal**: Deliver a Next.js web application for family members and NRI children featuring vitals trend visualization, dual-timezone appointment calendar, service booking, INR wallet management, and monthly value digests.
**Depends on**: Phase 1
**Requirements**: FAM-01, FAM-02, FAM-03, FAM-04, FAM-05, FAM-06, FAM-07
**Success Criteria** (what must be TRUE):
  1. Family members can log in, view multiple households, and review vitals trends with baseline comparisons.
  2. Dual-timezone calendar displays upcoming visits in both IST and family local time.
  3. Users can book pay-per-use services with upfront pricing and pre-funded wallet debits.
  4. Monthly narrative value digest displays clinical interventions and quantified savings.
  5. Named Care Officer bio, photo, and caseload transparency are clearly presented.
**Plans**: 3 plans

Plans:
- [x] 02-01: Family auth, multi-household switcher, and vitals trend visualization dashboard.
- [x] 02-02: Dual-timezone interactive calendar and pay-per-use service booking workflow.
- [x] 02-03: In-app wallet top-up, monthly value digest, and Care Officer profile display.

### Phase 3: Field App for Care Officers
**Goal**: Deliver a React Native (Expo) mobile app for field Care Officers with offline-first SQLite synchronization, daily route sequencing, dynamic SOP checklists (<5 min execution), vitals capture, and dry-run drill mode.
**Depends on**: Phase 1
**Requirements**: FLD-01, FLD-02, FLD-03, FLD-04, FLD-05, FLD-06, FLD-07
**Success Criteria** (what must be TRUE):
  1. Care Officer can view daily route-sequenced visit schedule and execute visits offline.
  2. Dynamic SOP checklists adapt to versioned templates with photo/binary/numeric step types.
  3. Vitals and medication adherence can be logged and synced automatically when back online.
  4. Emergency dry-run drill mode executes full simulated response without triggering actual dispatch.
**Plans**: 3 plans

Plans:
- [x] 03-01: React Native Expo setup, mobile auth, and offline SQLite data sync engine.
- [x] 03-02: Daily route schedule view and dynamic SOP checklist runner.
- [x] 03-03: Vitals capture, medication checklist, claims capture, and dry-run emergency drill mode.

### Phase 4: Operations CRM & Admin Hub
**Goal**: Deliver a Next.js Operations CRM dashboard for live multi-city monitoring, household CRM timeline management, partner & doctor panels, intelligent auto-assignment with override audit logs, and payout reconciliation.
**Depends on**: Phase 1
**Requirements**: OPS-01, OPS-02, OPS-03, OPS-04, OPS-05, OPS-06, OPS-07
**Success Criteria** (what must be TRUE):
  1. Ops managers can view live multi-city open requests, visit statuses, and SLA metrics.
  2. Household CRM timeline captures unified call, visit, and complaint history.
  3. Auto-assignment engine displays candidate scores and logs mandatory reasons on manual override.
  4. Visual catalog and SOP editor allows publishing new template versions without mobile app updates.
  5. Partner consumption records roll up automatically into reconcilable payout statements.
**Plans**: 3 plans

Plans:
- [x] 04-01: Multi-city live operations dashboard and unified household CRM timeline.
- [x] 04-02: Doctor/partner panel management and auto-assignment engine with override audit logging.
- [x] 04-03: Visual catalog/SOP version editor and partner payout reconciliation reporting.

### Phase 5: Emergency Dispatcher Command Centre
**Goal**: Deliver a low-latency Next.js Dispatcher interface with Exotel CTI caller ID mapping, sub-2-second ICE medical profile pull, live SLA countdown timers, ambulance dispatch, and hospital pre-brief workflows.
**Depends on**: Phase 1, Phase 4
**Requirements**: EMG-01, EMG-02, EMG-03, EMG-04, EMG-05, EMG-06
**Success Criteria** (what must be TRUE):
  1. Inbound helpline calls trigger instant caller ID lookup displaying member ICE profile in < 2 seconds.
  2. Visual SLA countdown timers track response progress with supervisor alert before breach.
  3. Dispatcher can trigger ambulance coordination and transmit pre-filled hospital briefing sheets in one click.
  4. Time-zone aware family escalation call tree automatically notifies family members.
  5. Emergency events close with structured resolution logs and roll up into SLA performance reports.
**Plans**: 3 plans

Plans:
- [x] 05-01: Exotel CTI integration, screen pop takeover, and sub-2-second ICE emergency profile display.
- [x] 05-02: Live SLA countdown timers, tiered ambulance dispatch workflow, and clinical hospital pre-brief sheet.
- [x] 05-03: Timezone-aware family escalation call tree, 4-state incident closure, and SLA audit analytics.

### Phase 6: Telephony Voice Ingestion & Integrations
**Goal**: Deliver a dedicated voicemail line with Exotel + Google Cloud Speech-to-Text in Indian languages, LLM structured ticket extraction, ABHA sync monitoring, and Community Lead interface.
**Depends on**: Phase 1, Phase 4
**Requirements**: INT-01, INT-02, INT-03, INT-04, INT-05, INT-06
**Success Criteria** (what must be TRUE):
  1. Elders can call a dedicated phone line, leave a voice request in regional languages, and have it transcribed accurately by Google Cloud STT.
  2. Transcribed audio is parsed into structured service requests and routed to the Ops CRM.
  3. ABHA sync status is monitored per household with failure alerts.
  4. Community & Content lead can log events and photos in under 1 minute from mobile.
  5. Diagnostic lab partner webhooks automatically ingest and attach test reports to member records.
**Plans**: 2 plans

Plans:
- [x] 06-01: Exotel voicemail recording webhook + Google Cloud STT Indian languages transcription and NLU parser.
- [x] 06-02: ABHA sync monitor, Community & Content lead mobile logging UI, and diagnostic lab webhooks.

---

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6

| Phase | Plans Complete | Status | Completed |
|---|---|---|---|
| 1. Foundation & Core Backend API | 3/3 | Completed | 2026-08-21 |
| 2. Family Portal Web Application | 3/3 | Completed | 2026-08-21 |
| 3. Field App for Care Officers | 3/3 | Completed | 2026-08-21 |
| 4. Operations CRM & Admin Hub | 3/3 | Completed | 2026-08-21 |
| 5. Emergency Dispatcher Command Centre | 3/3 | Completed | 2026-08-21 |
| 6. Telephony Voice Ingestion & Integrations | 2/2 | Completed | 2026-08-21 |

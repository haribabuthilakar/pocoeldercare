# Project Research Summary

**Project:** Pococare Elder Care Platform
**Domain:** Elder Care Tech & Operations Platform (India)
**Researched:** 2026-08-21
**Confidence:** HIGH

## Executive Summary

Pococare is an integrated elder care technology and operations ecosystem for India. It addresses the critical challenges faced by aging parents living independently and their children (especially NRIs) who require peace of mind, high operational transparency, and rapid emergency intervention.

The platform combines an emergency spine (24x7 helpline, CTI caller ID mapping, <2s ICE medical profile display, ambulance/hospital coordination) with scheduled primary care (doctor home visits, teleconsults, care officer visits with dynamic SOPs), a family portal with dual-timezone visibility, and an offline-ready mobile field application. Non-emergency requests from seniors are captured via a familiar phone/voicemail interface processed by Google Cloud Speech-to-Text in Indian languages.

The recommended architecture is a Turborepo monorepo with a modular NestJS REST backend, PostgreSQL with Prisma ORM, Next.js web applications, and a React Native Expo mobile field application. Development is containerized via Docker on Windows 11, targeting production on AWS Mumbai (ap-south-1).

## Key Findings

### Recommended Stack

- **Monorepo**: Turborepo + pnpm with shared packages for Prisma database models, TypeScript API contracts, and UI components.
- **Backend API**: NestJS (TypeScript) exposing modular REST endpoints, WebSockets for emergency dispatch, and Redis for low-latency ICE caching.
- **Database & Storage**: PostgreSQL 16 managed via Prisma ORM; AWS S3 for audio recordings and medical documents.
- **Frontend Applications**: Next.js (App Router, Tailwind CSS) for Family Portal, Ops CRM, and Emergency Dispatcher.
- **Mobile Application**: React Native (Expo) with local SQLite persistence for the Care Officer Field App.
- **Telephony & Voice**: Exotel CTI integration for inbound 24x7 emergency helpline and Google Cloud Speech-to-Text (v2 Indian languages) for elder voicemail parsing.

### Expected Features

**Must have (Table stakes):**
- 24x7 Emergency line with Exotel CTI Caller ID and sub-2-second ICE medical profile lookup.
- Ambulance coordination, hospital pre-briefing sheet, and live SLA countdown timer.
- Doctor Home Visit and GP/Specialist Video Call scheduling with clinical note capture.
- Scheduled Care Officer visits with dynamic, versioned SOP checklists and dry-run drill mode.
- Vitals logging (manual and connected RPM) with deterioration alerts.
- Family Portal with dual-timezone calendar, vitals trends, wallet management, and monthly value digests.
- Operations CRM with live multi-city queue, partner management, and assignment override logging.

**Should have (Differentiators):**
- Published penalty-bearing SLA tracking and auto-escalation.
- Care Officer bio and caseload transparency displayed to families.
- Elder Voicemail-to-Action pipeline using Google STT in Indian regional languages.
- Comprehensive Geriatric Assessment and IHI 4Ms protocol tracking.

**Defer (v2+ / Out of Scope):**
- 24x7 live-in attendant management (Nivas tier).
- Multi-currency Forex transactions (INR domestic billing first).
- Custom hardware design.

### Critical Pitfalls & Mitigation

1. **Emergency Latency**: Pre-cache ICE profiles in Redis on CTI webhook arrival to beat the 2-second display target.
2. **Field Documentation Overhead**: Keep SOP checklist execution under 5 minutes per visit using high-efficiency binary inputs and photo uploads.
3. **Time-Zone Mismatches**: Use UTC storage with explicit dual-timezone displays (IST and NRI local).
4. **Vernacular Speech Accuracy**: Route extracted voice requests to CRM queues with human verification before clinical execution.

## Implications for Roadmap

The user-requested phased roadmap aligns directly with the architectural dependencies:

### Phase 1: Core Backend & Domain Data Model
**Rationale:** Establishes the monorepo foundation, Prisma schema, PostgreSQL database, authentication/RBAC, and tested REST APIs across the 90-service catalog, households, ICE profiles, and billing ledgers.
**Delivers:** Turborepo workspace, @poco/database, @poco/types, NestJS REST API with comprehensive Vitest suite.

### Phase 2: Family Portal Web Application
**Rationale:** Exposes the core subscriber experience, providing value transparency, vitals visualization, appointment calendar, and wallet management for NRI children.
**Delivers:** Next.js Family Portal application with dual-timezone scheduling and monthly value digest views.

### Phase 3: Field App for Care Officers
**Rationale:** Equips field personnel with mobile tools to execute protocol-driven visits, capture vitals, and record adherence offline.
**Delivers:** React Native (Expo) mobile app with offline SQLite sync, dynamic SOP checklist runner, and emergency dry-run drill mode.

### Phase 4: Operations CRM & Admin Hub
**Rationale:** Enables ops managers to monitor visit schedules, manage partner panels, supervise auto-assignment, and reconcile billing/payouts.
**Delivers:** Next.js Ops CRM interface with live multi-city operational dashboards and override audit logging.

### Phase 5: Emergency Dispatcher Command Centre
**Rationale:** Implements the high-stakes emergency spine on top of the established backend and ops infrastructure.
**Delivers:** Next.js low-latency Dispatcher UI, Exotel CTI integration, Redis ICE caching (<2s lookup), live SLA timers, and hospital pre-brief workflows.

### Phase 6: Telephony Voice Ingestion, ABHA & Advanced Integrations
**Rationale:** Layers on the elder voicemail speech-to-text pipeline, national health ID (ABHA) tracking, and external device webhooks.
**Delivers:** Exotel voicemail webhook handler + Google Cloud STT Indian languages parser, ABHA sync monitor, and Community & Content logging interface.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Validated modern enterprise stack (NestJS + Prisma + Next.js + React Native) |
| Features | HIGH | Directly synthesized from Pococare 90-service matrix and user stories |
| Architecture | HIGH | Clear monorepo topology with decoupled REST and WebSocket boundaries |
| Pitfalls | HIGH | Specific operational and clinical risk mitigations defined |

**Overall confidence:** HIGH

---
*Research completed: 2026-08-21*
*Ready for roadmap: yes*

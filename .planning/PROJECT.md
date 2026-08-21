# Pococare Elder Care Platform

## What This Is

A comprehensive technology and operations platform for elder care in India, serving seniors living independently and their families (including NRI children). The platform unifies 24x7 emergency response with published SLAs, primary and continuing medical care (including doctor home visits, teleconsultations, and diagnostics), dedicated field Care Officer visits, and daily living assistance. It operates across an Emergency Dispatcher Command Centre, Care Officer Field App, Family Portal, Operations CRM, and an Elder Voicemail/Phone Interface.

## Core Value

Uncompromising reliability and peace of mind for families through rapid, SLA-backed emergency coordination, verified in-person care officer visits, and transparent operational visibility.

## Business Context

- **Customer**: NRI and domestic adult children purchasing comprehensive elder care subscriptions for aging parents in India.
- **Revenue model**: Tiered subscription plans (Kavach, Sahara, Sampoorna) with included visit quotas and pay-per-use wallet debits.
- **Success metric**: Emergency response SLA adherence (>99%), Field visit completion rate (>98%), and subscription renewal retention.
- **Strategy notes**: Catalog defined in docs/Pococare_Elder_90_Services_Matrix.md, backlog in docs/Pococare_User_Stories.md, ops in docs/Ops_and_Tech_Capabilities.md.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Monorepo setup with Turborepo, pnpm, NestJS backend, Next.js web applications, and React Native mobile app
- [ ] Core domain data model with PostgreSQL and Prisma ORM (Households, Members, ICE Profiles, 90-Service Catalog, SOP Templates, Subscriptions, Wallets, Service Executions)
- [ ] Modular REST API endpoints for authentication, role-based access control, and master data management
- [ ] Emergency readiness & ICE medical profile management with sub-2-second retrieval target
- [ ] Dynamic, versioned SOP checklist engine for standardizing field visits across the 90-service catalog
- [ ] Doctor Home Visits & GP/Specialist Video Call scheduling, notes, and clinical coordination
- [ ] Vitals and Remote Patient Monitoring (RPM) data logging with threshold-based deterioration alerting
- [ ] Family Portal (Next.js) with time-zone aware scheduling, vitals trend graphs, wallet top-up, and monthly value digest
- [ ] Field App (React Native) for Care Officers with offline-first SOP execution, daily route sequencing, and dry-run emergency drills
- [ ] Operations CRM & Dispatch Hub (Next.js) with live SLA dashboards, intelligent auto-assignment with reason-based manual override, and partner payout reconciliation
- [ ] Emergency Dispatcher Command Centre with Exotel CTI caller ID mapping, live countdown timers, and hospital pre-brief workflows
- [ ] Elder Non-Emergency Voice/Phone capture via Exotel recording + Google Cloud Speech-to-Text in Indian languages with structured backend extraction
- [ ] ABHA (Ayushman Bharat Health Account) sync monitoring and digital health records vault
- [ ] In-app wallet ledger for INR payments and automated monthly usage invoicing

### Out of Scope

- 24x7 High-dependency live-in attendant service (Nivas plan) — deferred to a subsequent milestone due to operational complexity and heavy live-in caregiver management.
- Multi-currency / Forex payment gateway processing — initial release targets domestic INR transactions; multi-currency deferred.
- Custom hardware manufacturing — utilizing certified off-the-shelf RPM devices (BP monitors, glucometers, fall detectors) and Exotel telephony integration.

## Context

- Target operating ecosystem is urban India across tier-1 and tier-2 cities.
- Primary purchasers are often NRI children in different time zones (US, UK, Middle East, Singapore) requiring time-zone aware scheduling, proactive async summaries, and caseload transparency.
- End-users (seniors) have varying levels of digital literacy; non-emergency requests are captured via familiar phone/voicemail channels in Indian languages (Hindi, Tamil, Telugu, Kannada, etc.) and transcribed via Google Cloud Speech-to-Text.
- Field Care Officers are dedicated personnel (often ex-servicemen) executing protocol-driven visits with strict time and quality constraints.

## Constraints

- **Tech Stack**: Turborepo + pnpm monorepo; NestJS (REST API); PostgreSQL + Prisma ORM; Next.js (Web Portals); React Native / Expo (Mobile); Vitest + Playwright for testing.
- **Environment**: Local Windows 11 Docker environment for development and testing; AWS Mumbai (ap-south-1) for production.
- **Telephony & Voice**: Exotel for CTI/IVR telephony; Google Cloud Speech-to-Text for Indian languages.
- **Security & Privacy**: Indian health data privacy compliance with role-based access control and encrypted ICE storage.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Monorepo with Turborepo, NestJS REST backend, Next.js web, React Native mobile | Unified TypeScript ecosystem, shared validation types, and high developer velocity | — Pending |
| Reintroduce Doctor Home Visits & Teleconsults into core scope | Critical clinical differentiator requested for primary and continuing care | — Pending |
| Defer Nivas (live-in 24x7) plan to later phase | Minimizes high-risk live-in caregiver logistical overhead for initial launch | — Pending |
| Dedicated phone/voicemail line with Google STT for elder voice requests | Low barrier to entry for seniors; converts voice into structured backend tasks without forcing complex app UI | — Pending |
| Domestic INR payments and pre-funded wallet first | Simplifies launch billing and removes foreign exchange integration friction | — Pending |
| Phased milestone sequence (1: Core Backend, 2: Family Portal, 3: Field App, 4: Ops CRM, 5: Emergency Dispatcher, 6: Integrations/Voice) | Ensures rock-solid data and API foundation before exposing client interfaces | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via /gsd-transition):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. " What This Is\ still accurate? → Update if drifted

**After each milestone** (via /gsd-complete-milestone):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-08-21 after initialization*

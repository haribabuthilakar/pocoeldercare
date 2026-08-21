# Phase 5: Emergency Dispatcher Command Centre — Context & Implementation Decisions

## Overview
Phase 5 delivers the mission-critical 24x7 Emergency Dispatcher Command Centre application for Pococare. It unites low-latency Exotel CTI caller ID mapping, sub-2-second Senior ICE medical profile retrieval, live visual SLA response countdowns, tiered ambulance dispatch, hospital pre-brief transmission, timezone-aware family escalation call trees, and comprehensive post-incident SLA compliance auditing.

---

## 1. Domain Boundary & Scope
- **In-Scope**:
  - Live 24x7 Emergency Dispatcher UI with WebSocket low-latency state synchronization.
  - Exotel CTI caller ID mapping auto-triggering urgent screen pop and < 2s ICE medical profile pull.
  - Multi-senior household disambiguation tabs.
  - Tiered 1-click ambulance dispatch (Empanelled private ALS fleet + 108 emergency fallback).
  - Standardized clinical PDF summary generation & hospital ER desk email dispatch.
  - Real-time SLA response countdown timers with audio/visual breach alerts and supervisor escalation.
  - Timezone-aware automated family call tree (instant WhatsApp/SMS + sequential voice calls with 3-minute timeout).
  - 4-state incident resolution lifecycle with mandatory clinical outcome logs and weekly SLA audit rollups.
- **Design Language & Theme**:
  - Pococare Bento Light Design System (Background: #f8fafc / #f8fbfb, Primary Mint #12C395, Secondary Magenta #FE1D8F, Poppins + JetBrains Mono for timers, crisp floating ento-card containers).

---

## 2. Canonical References
- REQUIREMENTS.md — Requirements EMG-01, EMG-02, EMG-03, EMG-04, EMG-05, EMG-06
- ROADMAP.md — Phase 5 Success Criteria & Milestones
- packages/database/prisma/schema.prisma — EmergencyIncident, SeniorMedicalProfile, Household, User, CareOfficer
- pps/api/src/modules/ — Emergency triage & notification backend services
- pps/ops-crm/src/ — Operations CRM reference patterns and shared UI tokens

---

## 3. Locked Implementation Decisions

### Pillar 1: Exotel CTI Inbound Screen Pop & Caller Disambiguation (EMG-01, EMG-02)
- **Urgent Screen Pop Modal**: Inbound emergency helpline calls trigger an instant high-visibility takeover modal with a pulsating #FE1D8F glowing border, audio chime, Exotel caller ID number, and sub-2-second ICE medical profile.
- **Multi-Senior Household Disambiguation**: When an inbound call originates from a shared family line or multi-senior residence, the primary senior is pre-loaded by default, with one-click selector tabs for all other household members.

### Pillar 2: Tiered 1-Click Ambulance Dispatch & Hospital Pre-Brief (EMG-03)
- **Tiered Dispatch Engine**:
  1. *Tier 1 (Empanelled ALS Fleet)*: Contracted private ALS/BLS hospital fleets (e.g., Apollo, Manipal, Fortis) with published <15 min arrival SLAs.
  2. *Tier 2 (Government Emergency 108/112)*: One-click fallback dialer and GPS coordinate transmission if private ambulances are constrained.
- **Hospital Pre-Brief Sheet Handover**: Generates a standardized clinical PDF emergency summary containing blood group, chronic conditions, active medications, known drug allergies, and current dispatcher triage notes, dispatched directly to the destination trauma ER receiving desk via email and printable dispatch sheet.

### Pillar 3: Live Visual SLA Response Timers & Supervisor Escalation (EMG-04)
- **Monospace Tabular Timers**: Displayed in ont-mono tabular-nums tracking Call-to-Pickup (<10s), ICE Profile Retrieval (<2s), Ambulance Dispatch (<3 mins), and On-Ground Arrival (<15 mins Golden Hour).
- **Audio & Visual Breach Alerts**: Visual color shift to glowing #FE1D8F and supervisor dashboard escalation if SLA reaches the critical 3-minute warning threshold.

### Pillar 4: Timezone-Aware Family Escalation Call Tree (EMG-05)
- **Dual Instant Alerting**: Dispatches instant WhatsApp and SMS incident notifications to registered NRI sponsors immediately upon incident creation, regardless of their local timezone.
- **Sequential Voice Call Tree**: Initiates voice calls to the Primary NRI Sponsor first. If unacknowledged within 3 minutes, automatically escalates to the Secondary Sponsor and the local on-ground emergency contact. Respects nighttime quiet hours for non-life-threatening standard notifications while bypassing for urgent emergencies.

### Pillar 5: 4-State Incident Lifecycle & SLA Audit Analytics (EMG-06)
- **Structured Resolution States**:
  1. RESOLVED_AT_HOME — Senior stabilized on-ground by attending Care Officer / GP.
  2. HOSPITALIZED_AND_ADMITTED — Senior transferred to hospital ER; Care Officer assigned bedside.
  3. SPECIALIST_TRANSFER — Senior transitioned to specialized clinical facility.
  4. FALSE_ALARM_SOS — Accidental trigger or non-emergency inquiry.
- **Mandatory Closure Fields**: Attending hospital name, admitting physician, discharge/stabilization clinical notes, and scheduled Care Officer post-emergency follow-up visit.
- **SLA Performance Rollup**: Weekly and monthly analytics tracking Golden Hour arrival percentage, average ICE query latency, dispatcher response times, and downloadable family post-mortem incident reports.

---

## 4. Code & Architecture Context
- **Web Portal**: Dedicated Next.js application at pps/dispatcher (or integrated high-speed command console at port 3004 / shared monorepo package).
- **State Management & Live WebSockets**: Low-latency Socket.io / SSE client receiving real-time Exotel call events and emergency device SOS webhooks.
- **Testing**: Comprehensive Vitest test suite validating <2s ICE lookups, SLA countdown arithmetic, escalation timeout sequences, and 4-state lifecycle transitions.

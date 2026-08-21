# Architecture & System Design

**Project:** Pococare Elder Care Platform
**Researched:** 2026-08-21
**Confidence:** HIGH

## Component Boundaries & Monorepo Topology

`
pocoeldercare/
├── apps/
│   ├── api/                    # NestJS REST Backend
│   ├── family-portal/          # Next.js Web App for Family / NRI Children
│   ├── field-app/              # React Native (Expo) Mobile App for Care Officers
│   ├── ops-crm/                # Next.js Web App for Ops Managers & Supervisors
│   └── emergency-dispatcher/   # Next.js Low-Latency Dispatcher Command Centre
├── packages/
│   ├── database/               # Prisma Schema, Migrations, Seeders
│   ├── shared-types/           # DTOs, Enums, REST API Contracts
│   ├── ui/                     # Shared Tailwind / UI Components
│   └── config/                 # ESLint, TypeScript, Tailwind shared configs
`

## Data Flow & Integration Pipelines

### 1. Inbound Emergency & Caller ID Mapping
`
Incoming Call (Exotel PSTN) 
   ──> Exotel Webhook 
   ──> NestJS CTI Gateway 
   ──> Redis ICE Pre-cache 
   ──> WebSocket Broadcast 
   ──> Emergency Dispatcher UI (<2s screen pop)
`

### 2. Elder Voice / Voicemail Pipeline
`
Elder Voicemail Call (Dedicated Phone Line)
   ──> Exotel Call Recording Webhook 
   ──> S3 Audio Storage 
   ──> Google Cloud Speech-to-Text (v2 Indian Languages)
   ──> LLM NLU Service (Structured Service Request / Triage)
   ──> Ops CRM Queue & Care Officer Task
`

### 3. Field App Offline-First Visit Execution
`
Care Officer Field App (SQLite local)
   ──> Check-in & Dynamic SOP Checklist Execution
   ──> Vitals Capture (Manual or Bluetooth RPM)
   ──> Offline Queue ──[Network Available]──> Sync Endpoint 
   ──> PostgreSQL Database
   ──> Deterioration Rule Engine ──> Family & Ops Alerts
`

### 4. Family Portal & Billing Pipeline
`
Family Member (Web/Mobile)
   ──> Vitals & Calendar Views (Dual Timezone IST + Local)
   ──> Pay-per-Use Service Request
   ──> Wallet Ledger Debit (or PG Top-Up)
   ──> Service Execution Scheduled
`

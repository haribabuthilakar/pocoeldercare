const fs = require('fs');
const path = require('path');

function writeFile(relPath, content) {
  const fullPath = path.resolve(relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
  console.log('Written:', relPath);
}

writeFile('.planning/phases/04-operations-crm-and-admin-hub/04-CONTEXT.md', `# Phase 4 Context: Operations CRM & Admin Hub

## 1. Executive Summary & Core Intent
The **Operations CRM & Admin Hub** (\`apps/ops-crm\`) is the central operational command centre for Pococare, built as a Next.js 14 web application unified with the Family Portal design system (Clean light \`#f8fbfb\` background, crisp white floating cards, glassmorphic navigation, \`#12C395\` primary mint green, \`#FE1D8F\` secondary magenta, and \`Poppins, sans-serif\` typography). It empowers central dispatchers, care operations managers, clinical coordinators, and financial admins to manage multi-city operations with zero blind spots.

---

## 2. Locked Functional Decisions Across All 7 Pillars

### Pillar 1: Live Multi-City Command Center & Dispatch Console
- **Dual View Layout (\`/\`)**:
  - **Left / Top Pane**: Interactive City Map visualizer featuring real-time Care Officer GPS markers (with active route polyline indicators) and pending household markers across **Bangalore**, **Chennai**, **Hyderabad**, **Mumbai**, and **Delhi-NCR**.
  - **Right / Bottom Pane**: Live auto-refreshing request queue with real-time SLA countdown timers, pulsating \`#FE1D8F\` alert badges on breach, and audible alarm chimes for critical escalations.
  - **City Filter Switcher**: 1-click tab switching between operational metro clusters.
  - **Telemetry Summary Cards**: Active requests, on-ground officers, 35-family caseload utilization gauges, and clinical escalations.

### Pillar 2: Care Officer Capacity, Caseload & Auto-Assignment Engine
- **Multi-Factor AI Candidate Scoring**:
  - Scoring weightage: **Proximity & Transit Time (40%)**, **Caseload Availability vs 35-Cap (30%)**, **Language Fluency Match (20%)**, and **Family Satisfaction Rating (10%)**.
  - 1-Click **"AI Auto-Dispatch"** to immediately assign the top-ranked candidate.
- **Mandatory Override Audit Policy (\`OPS-07\`)**:
  - If a manager selects any officer other than the AI top match, the system triggers a **Mandatory Override Modal**.
  - Requires selecting a structured reason category (\`FAMILY_PREFERENCE\`, \`TRAFFIC_PROXIMITY_ANOMALY\`, \`SPECIALIZED_CLINICAL_SKILL\`, \`OFFICER_EMERGENCY_REASSIGNMENT\`) plus mandatory free-text justification notes.
  - Logged immutably in the system audit trail.

### Pillar 3: Household CRM 360° Profile & Multi-Channel Timeline
- **Single Pane of Glass (\`/households/[id]\`)**:
  - **Senior Profile Card**: Age, address, assigned Care Officer, active subscription plan, INR wallet balance, and primary NRI sponsor contacts.
  - **1-Click Senior ICE Emergency Drawer**: Sub-2s encrypted query displaying blood group, chronic conditions, drug allergies/contraindications, preferred trauma ER, and emergency escalation call trees.
  - **360° Unified Multi-Channel Timeline**: Chronological stream combining:
    - *Exotel Telephony Calls* (with embedded inline audio players & transcribed sentiments).
    - *Care Officer In-Person Visit Proofs* (with verified photo proof galleries, elapsed checklist speed, and notes).
    - *Doctor Teleconsultations* (with clinical assessment summaries, Rx prescriptions, and follow-up dates).
    - *INR Wallet Movements* (with auto-topups, emergency holds, and pay-per-use deductions).
  - **Family Ticket & Grievance Manager**: Log and resolve service tickets.
  - **1-Click Visit Digest Export**: Generates shareable WhatsApp and PDF family visit summaries.

### Pillar 4: Empanelled Doctor & Healthcare Partner Network
- **Provider Panel Directory (\`/partners\`)**:
  - Categorized directory for **Geriatricians**, **General Physicians**, **ALS Ambulances**, **Diagnostic Labs**, and **Home Nursing Bureaus**.
  - **Live Shift Availability Toggles**: Real-time on-duty / off-duty switches.
  - **Contracted Rate Cards**: Configurable per-unit rates in INR (e.g. ₹1,200/consult, ₹2,500/emergency trip, ₹350/blood pickup).
  - **SLA & Compliance Tracking**: Response time commitments and credential verifications.
  - **Direct CTI Dialing**: Integrated click-to-call.

### Pillar 5: 90-Service Catalog & Dynamic SOP Template Studio
- **Dynamic SOP Studio (\`/catalog\`)**:
  - Full catalog browser for all 90 services across Emergency, Medical, Care Officer Visits, Daily Assistance, and Diagnostics.
  - **Visual Step Builder**: Add, edit, reorder, or remove checklist verification steps.
  - **Step Proof Modifiers**: Toggle mandatory photo proofs, voice notes, and clinical vital measurement thresholds.
  - **Semantic Versioning (\`v1.0.0\` -> \`v1.1.0\`)**: 1-click publishing releasing Over-The-Air (OTA) JSON schemas directly to Care Officer Field Apps without requiring mobile app store releases.

### Pillar 6: Partner Payouts, Billing Ledger & Financial Reconciliation
- **Financial Reconciliation Ledger (\`/payouts\`)**:
  - **Automated Monthly Rollup**: Aggregates completed service volume against contracted rate cards.
  - **Automated TDS Calculation**: 10% for professional clinical services (doctors), 2% for contractors/agencies (ambulances, labs).
  - **1-Click Batch Approval**: Single-click bulk approval for monthly payout statements.
  - **Voucher Previews & Exports**: Individual provider payout breakdowns, downloadable GST reconciliation CSV, and bank NEFT/IMPS payout batch export.

### Pillar 7: Care Officer Profile, Fleet Roster & Caseload Management
- **Dedicated Fleet Roster Hub (\`/officers\`)**:
  - **Officer Profile Cards & Directory**: Personal details, assigned operational zone/cluster (e.g. Bangalore East), languages spoken, emergency phone, and photo ID.
  - **Compliance & Credential Tracking**: Police verification ID, Aadhaar KYC verification status badge, CPR/AED and Basic Life Support (BLS) geriatric care training certifications.
  - **Live Shift & Caseload Telemetry**: Real-time On-Duty / Off-Duty / Leave toggles, active caseload progress meter against the strict **35-Family Cap**, and live battery/GPS status.
  - **Assigned Household Portfolio**: 1-click view of all elderly households assigned to the Care Officer with primary medical concerns and scheduled visit dates.
  - **Performance Metrics**: Customer satisfaction score (e.g. 4.9/5.0), on-time SLA arrival rate (98.6%), average SOP completion speed (< 5:00 min target), and completed visit counts.

---

## 3. Technology & Design System Alignment
- **Framework**: Next.js 14 (App Router), TypeScript, React 18
- **Styling**: Tailwind CSS with custom glassmorphism utilities (\`glass-card\`, \`glow-primary\`, \`glow-secondary\`, \`glow-dual\`)
- **Theme**: Light \`#f8fbfb\` background, \`#12C395\` Primary (Mint), \`#FE1D8F\` Secondary (Magenta), \`Poppins, sans-serif\` font
- **Port**: \`http://localhost:3003\`
`);

console.log('Finished writing updated 04-CONTEXT.md with 7 Pillars');



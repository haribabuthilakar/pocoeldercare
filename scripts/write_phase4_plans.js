const fs = require('fs');
const path = require('path');

function writeFile(relPath, content) {
  const fullPath = path.resolve(relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
  console.log('Written:', relPath);
}

// -------------------------------------------------------------
// 1. PLAN 04-01: DUAL-VIEW LIVE COMMAND CENTER & AUTO-ASSIGNMENT
// -------------------------------------------------------------

writeFile('.planning/phases/04-operations-crm-and-admin-hub/04-01-PLAN.md', `# Plan 04-01: Dual-View Live Command Center & Auto-Assignment Engine

## Goal
Implement the Next.js 14 Operations Command Center with a dual-view layout (interactive city map with live Care Officer GPS pins and household markers alongside an auto-refreshing request queue with real-time SLA countdown timers) and an Intelligent Auto-Assignment modal with mandatory override audit logging.

## Requirements
- \`OPS-01\`: Multi-city live operations monitoring with SLA countdown timers and breach alerts.
- \`OPS-04\`: Auto-assignment recommendation engine ranking candidate officers.
- \`OPS-07\`: Mandatory audit logging for manual assignment overrides.

## User Decisions & Constraints
- **Design System**: Light \`#f8fbfb\` background, \`#12C395\` Primary (Mint), \`#FE1D8F\` Secondary (Magenta), \`Poppins, sans-serif\` font.
- **Dual-View Layout**: Interactive city map pins alongside auto-refreshing request queue.
- **Auto-Assignment**: Multi-factor AI scoring (Proximity 40%, Caseload vs 35-Cap 30%, Language Fluency 20%, Rating 10%) with mandatory override justification modal.

## Detailed Tasks
1. **Scaffold Ops CRM Architecture**:
   - Create Next.js 14 project at \`apps/ops-crm\` with shared TypeScript configs and Tailwind glassmorphism tokens.
   - Configure global theme in \`apps/ops-crm/src/app/globals.css\` matching the Family Portal styling.
2. **Build Navigation & Multi-City Switcher**:
   - Create \`apps/ops-crm/src/components/layout/ops-header.tsx\` with frosted glass styling and city tabs for Bangalore, Chennai, Hyderabad, Mumbai, Delhi-NCR.
3. **Build Live Command Dashboard & Dual View**:
   - Create \`apps/ops-crm/src/components/dashboard/live-request-table.tsx\` with SLA countdowns, priority triage badges, and caseload gauges.
   - Assemble live dashboard in \`apps/ops-crm/src/app/page.tsx\`.
4. **Implement Auto-Assignment Engine & Override Modal**:
   - Create \`apps/ops-crm/src/components/assignment/auto-assign-modal.tsx\` ranking officers by weighted score and prompting for structured reason + free-text justification notes on manual override.

## Verification
- Run Vitest tests verifying candidate scoring formula and override audit logging.
`);

// -------------------------------------------------------------
// 2. PLAN 04-02: HOUSEHOLD CRM 360 & CARE OFFICER FLEET HUB
// -------------------------------------------------------------

writeFile('.planning/phases/04-operations-crm-and-admin-hub/04-02-PLAN.md', `# Plan 04-02: Household CRM 360° Profile & Care Officer Fleet Hub

## Goal
Deliver a unified 360° Household CRM timeline (with Exotel call playback, field visit photo proofs, teleconsult Rx, and 1-click encrypted ICE sheet) and a dedicated Care Officer Fleet Hub for managing officer profiles, compliance badges, live shift statuses, and 35-family caseload caps.

## Requirements
- \`OPS-02\`: Household CRM timeline capturing unified call, visit, and medical history.
- \`Pillar 7\`: Dedicated Care Officer fleet roster with compliance verification, live shift status, and strict 35-family caseload cap meters.

## User Decisions & Constraints
- **Household CRM**: Single pane of glass synthesizing call recordings, visit photo galleries, teleconsult notes, and wallet balance movements with a 1-click Senior ICE Emergency Drawer.
- **Care Officer Fleet Hub**: \`/officers\` page with police verification badges, KYC status, CPR/BLS certifications, live shift toggles, and assigned household portfolio dropdowns.

## Detailed Tasks
1. **Build 1-Click Senior ICE Emergency Drawer**:
   - Create \`apps/ops-crm/src/components/households/ice-quick-drawer.tsx\` with blood group, chronic conditions, drug allergies, preferred trauma ER, and NRI call escalation trees.
2. **Build Unified 360° Household Timeline**:
   - Create \`apps/ops-crm/src/components/households/timeline-feed.tsx\` integrating audio playback, visit photo proofs, and clinical metrics.
   - Assemble household detail page in \`apps/ops-crm/src/app/households/[id]/page.tsx\`.
3. **Build Care Officer Fleet Roster Hub**:
   - Create \`apps/ops-crm/src/components/officers/officer-roster-card.tsx\` displaying officer profile, verified KYC/CPR badges, 35-family caseload meter, and shift toggles.
   - Assemble fleet roster directory in \`apps/ops-crm/src/app/officers/page.tsx\`.

## Verification
- Test 1-click ICE drawer opening and verify officer caseload cap visual warnings.
`);

// -------------------------------------------------------------
// 3. PLAN 04-03: PARTNERS, DYNAMIC SOP STUDIO & PAYOUT RECONCILIATION
// -------------------------------------------------------------

writeFile('.planning/phases/04-operations-crm-and-admin-hub/04-03-PLAN.md', `# Plan 04-03: Partner Panel, Dynamic SOP Studio & Payout Reconciliation

## Goal
Implement the Doctor & Healthcare Partner Panel, the Visual 90-Service Catalog & Dynamic SOP Studio with Over-The-Air (OTA) schema publishing, the Monthly Partner Payout Reconciliation Ledger with TDS deductions, and automated end-to-end Vitest tests.

## Requirements
- \`OPS-03\`: Healthcare partner and doctor panel management with contracted rate cards.
- \`OPS-05\`: Visual 90-service catalog and SOP template editor with semantic versioning and OTA publishing.
- \`OPS-06\`: Partner consumption ledgers and financial payout reconciliation with TDS and GST export.

## User Decisions & Constraints
- **Partner Panel**: Provider directory with live shift availability toggles and contracted INR rate cards.
- **Dynamic SOP Studio**: Visual step builder with photo/voice proof modifiers and semantic versioning (\`v1.0.0\` -> \`v1.1.0\`).
- **Payout Reconciliation**: Monthly rollups against contracted rate cards, automated 10%/2% TDS calculation, 1-click batch approval, and GST reconciliation CSV export.

## Detailed Tasks
1. **Build Doctor & Healthcare Partner Directory**:
   - Create \`apps/ops-crm/src/components/partners/partner-card.tsx\` and \`apps/ops-crm/src/app/partners/page.tsx\`.
2. **Build Visual Dynamic SOP Studio & 90-Service Catalog**:
   - Create \`apps/ops-crm/src/components/catalog/sop-editor-modal.tsx\` and \`apps/ops-crm/src/app/catalog/page.tsx\`.
3. **Build Partner Payout Reconciliation Hub**:
   - Create \`apps/ops-crm/src/components/payouts/payout-statement-table.tsx\` and \`apps/ops-crm/src/app/payouts/page.tsx\`.
4. **Automated Test Suite**:
   - Create \`apps/ops-crm/src/__tests__/ops-workflows.spec.tsx\` verifying candidate ranking, override audit logging, and TDS payout rollups.

## Verification
- Run \`pnpm test\` across all workspaces and verify 100% test pass rate and full Next.js static build.
`);

console.log('Finished writing updated Phase 4 plans (04-01, 04-02, 04-03)');


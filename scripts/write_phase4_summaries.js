const fs = require('fs');
const path = require('path');

function writeFile(relPath, content) {
  const fullPath = path.resolve(relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
  console.log('Written:', relPath);
}

writeFile('.planning/phases/04-operations-crm-and-admin-hub/04-01-SUMMARY.md', `# Summary: Plan 04-01 - Ops CRM Scaffold, Multi-City Live Command Dashboard & Auto-Assignment Engine

- Files Created:
  - \`apps/ops-crm/package.json\`, \`tsconfig.json\`, \`tailwind.config.ts\`, \`vitest.config.ts\`
  - \`apps/ops-crm/src/app/globals.css\`, \`src/app/layout.tsx\`
  - \`apps/ops-crm/src/components/layout/ops-header.tsx\` (Multi-city switcher & navigation)
  - \`apps/ops-crm/src/components/assignment/auto-assign-modal.tsx\` (Candidate ranking & override audit prompt)
  - \`apps/ops-crm/src/components/dashboard/live-request-table.tsx\` (SLA countdowns & category filter)
  - \`apps/ops-crm/src/app/page.tsx\`

- Key Accomplishments:
  1. Scaffolded Next.js 14 Ops CRM with brand design tokens (#12C395 Primary, #FE1D8F Secondary, Poppins typography).
  2. Built Live Multi-City Command Dashboard with active SLA countdown timers, breach alerts, and officer caseload monitoring.
  3. Implemented Intelligent Auto-Assignment modal scoring candidates by proximity, shift workload, and rating.
  4. Enforced Mandatory Override Audit policy (OPS-07) capturing structured reason + justification notes before re-assignment.
`);

writeFile('.planning/phases/04-operations-crm-and-admin-hub/04-02-SUMMARY.md', `# Summary: Plan 04-02 - Unified Household CRM 360° Timeline & Partner/Doctor Panel Management

- Files Created:
  - \`apps/ops-crm/src/components/households/ice-quick-drawer.tsx\` (1-click encrypted ICE sheet query)
  - \`apps/ops-crm/src/components/households/timeline-feed.tsx\` (Chronological telephony, visit photos, consults & wallet feeds)
  - \`apps/ops-crm/src/app/households/[id]/page.tsx\`
  - \`apps/ops-crm/src/components/partners/partner-card.tsx\`
  - \`apps/ops-crm/src/app/partners/page.tsx\`

- Key Accomplishments:
  1. Delivered 360° Unified Household CRM Timeline bringing together call audio, field visit photo proofs, teleconsult prescriptions, and wallet movements.
  2. Built 1-click Senior ICE Emergency Drawer displaying blood group, chronic conditions, drug allergies, preferred trauma ER, and NRI call trees.
  3. Created Doctor & Partner Panel Directory with shift availability toggles, specializations, and contracted INR rate cards.
`);

writeFile('.planning/phases/04-operations-crm-and-admin-hub/04-03-SUMMARY.md', `# Summary: Plan 04-03 - Visual 90-Service Catalog & SOP Editor, Partner Payout Reconciliation & End-to-End Tests

- Files Created:
  - \`apps/ops-crm/src/components/catalog/sop-editor-modal.tsx\` (Visual step builder & version bumper)
  - \`apps/ops-crm/src/app/catalog/page.tsx\`
  - \`apps/ops-crm/src/components/payouts/payout-statement-table.tsx\` (Monthly rollup, TDS & CSV export)
  - \`apps/ops-crm/src/app/payouts/page.tsx\`
  - \`apps/ops-crm/src/__tests__/ops-workflows.spec.tsx\`

- Key Accomplishments:
  1. Built Visual 90-Service Catalog & SOP Template Editor with semantic versioning (v1.0.0 -> v1.1.0) and instant OTA JSON schema publishing.
  2. Implemented Monthly Partner & Doctor Payout Reconciliation Ledger with 1-click batch approval, automated TDS calculation, and GST reconciliation CSV export.
  3. Verified full Next.js static production build across all 7 routes and 100% test pass rate.
`);


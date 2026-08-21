const fs = require('fs');
const path = require('path');

function writeFile(relPath, content) {
  const fullPath = path.resolve(relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
  console.log('Written:', relPath);
}

writeFile('.planning/phases/02-family-portal-web-application/02-01-SUMMARY.md', `# Summary: Plan 02-01 - Next.js Family Portal Scaffold, Auth & Vitals Dashboard

- Files Modified / Created:
  - \`apps/family-portal/package.json\`, \`tsconfig.json\`, \`next.config.mjs\`, \`tailwind.config.ts\`
  - \`apps/family-portal/src/lib/api-client.ts\`, \`apps/family-portal/src/lib/auth-context.tsx\`
  - \`apps/family-portal/src/app/layout.tsx\`, \`apps/family-portal/src/app/login/page.tsx\`, \`apps/family-portal/src/app/dashboard/page.tsx\`
  - \`apps/family-portal/src/components/vitals/vitals-trend-chart.tsx\`, \`health-summary-badge.tsx\`

- Key Accomplishments:
  1. Scaffolded Next.js 14 App Router frontend with Tailwind CSS, Lucide, and Recharts.
  2. Implemented dual authentication for local family (Phone OTP with dev bypass) and NRI children (Email/Password) with JWT auto-refresh client.
  3. Built Multi-Household Switcher supporting NRIs supporting multiple households across Indian cities.
  4. Delivered Geriatric Vitals Trend Charts for Blood Pressure, SpO2, Glucose, and Pulse with green safe-zone family reference bands and plain-language health status badges ("Vitals Stable", doctor review attribution).
`);

writeFile('.planning/phases/02-family-portal-web-application/02-02-SUMMARY.md', `# Summary: Plan 02-02 - Dual-Timezone Interactive Calendar & 90-Service Catalog Booking

- Files Modified / Created:
  - \`apps/family-portal/src/app/calendar/page.tsx\`
  - \`apps/family-portal/src/components/calendar/dual-timezone-badge.tsx\`, \`appointment-card.tsx\`
  - \`apps/family-portal/src/app/services/page.tsx\`
  - \`apps/family-portal/src/components/services/quota-pricing-badge.tsx\`, \`service-booking-modal.tsx\`

- Key Accomplishments:
  1. Implemented Dual-Timezone Interactive Calendar rendering both Indian Standard Time (IST) and local NRI viewer timezones (PDT, EDT, GMT, GST, SGT) to eliminate multi-timezone scheduling confusion.
  2. Built 90-Service Catalog Browser with category filters (A-L) and instant search.
  3. Implemented Service Booking Modal with quota-first deduction checks (₹0 charge if quota available), transparent INR pricing for pay-per-use extras, and atomic wallet booking holds.
`);

writeFile('.planning/phases/02-family-portal-web-application/02-03-SUMMARY.md', `# Summary: Plan 02-03 - INR Wallet Management, Monthly Value Digest & Care Officer Card

- Files Modified / Created:
  - \`apps/family-portal/src/app/wallet/page.tsx\`
  - \`apps/family-portal/src/components/wallet/wallet-topup-modal.tsx\`, \`transaction-ledger.tsx\`
  - \`apps/family-portal/src/app/digest/page.tsx\`, \`monthly-value-digest.tsx\`
  - \`apps/family-portal/src/components/care-officer/named-care-officer-card.tsx\`
  - \`apps/family-portal/src/__tests__/portal-workflows.spec.tsx\`

- Key Accomplishments:
  1. Built INR Wallet Management with balance display, quick top-up modal (₹1,000, ₹5,000, ₹10,000), and immutable transaction audit ledger.
  2. Implemented Monthly Value Digest quantifying visits met, daily vitals, preventive clinical catches, savings, with one-click downloadable/printable invoice.
  3. Created NamedCareOfficerCard providing direct dial, military/healthcare background, and published caseload ratio transparency (35 families/officer).
  4. Built Vitest frontend test suite verifying dual-timezone formatting, quota-first booking pricing, and health status badges.
`);


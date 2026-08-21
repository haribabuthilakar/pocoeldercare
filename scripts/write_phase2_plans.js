const fs = require('fs');
const path = require('path');

function writeFile(relPath, content) {
  const fullPath = path.resolve(relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
  console.log('Written:', relPath);
}

// -------------------------------------------------------------
// Plan 02-01: Family Portal Scaffold, Auth & Vitals Visualizer
// -------------------------------------------------------------
writeFile('.planning/phases/02-family-portal-web-application/02-01-PLAN.md', `---
phase: 02-family-portal-web-application
plan: 01
wave: 1
depends_on:
  - 01-03
  - 01-02
files_modified:
  - apps/family-portal/package.json
  - apps/family-portal/tsconfig.json
  - apps/family-portal/next.config.mjs
  - apps/family-portal/tailwind.config.ts
  - apps/family-portal/src/app/layout.tsx
  - apps/family-portal/src/app/page.tsx
  - apps/family-portal/src/app/login/page.tsx
  - apps/family-portal/src/app/dashboard/page.tsx
  - apps/family-portal/src/lib/api-client.ts
  - apps/family-portal/src/lib/auth-context.tsx
  - apps/family-portal/src/components/vitals/vitals-trend-chart.tsx
  - apps/family-portal/src/components/vitals/health-summary-badge.tsx
autonomous: true
requirements:
  - FAM-01
  - FAM-02

must_haves:
  truths:
    - Family members can log in via Phone OTP (with dev bypass) or Email/Password and switch between multiple households.
    - Dashboard renders elderly member profiles with plain-language health status badges ("Vitals Stable", "Glucose Within Target").
    - Interactive Recharts charts display 7d/30d/90d blood pressure, SpO2, glucose, and pulse with geriatric safe-zone reference bands.
  artifacts:
    - apps/family-portal/src/lib/api-client.ts
    - apps/family-portal/src/components/vitals/vitals-trend-chart.tsx
---

# Plan 02-01: Family Portal Scaffold, Auth & Vitals Visualization Dashboard

<objective>
Scaffold the Next.js App Router Family Portal in apps/family-portal, implement OTP/Email authentication with token management and multi-household switching, and build interactive vitals trend charting with safe-zone reference bands.
</objective>

<tasks>

<task id="02-01-01" wave="1">
<title>Scaffold Next.js App Router Family Portal</title>
<action>
In apps/family-portal:
1. Initialize package.json with Next.js, React 18, Tailwind CSS, Lucide React, and Recharts.
2. Configure tsconfig.json, tailwind.config.ts, and global CSS with medical-grade soft theming (Slate / Emerald / Rose).
3. Create ApiClient utility in src/lib/api-client.ts with auto-bearer header injection and token refresh.
</action>
<verify>
<automated>pnpm --filter family-portal build</automated>
</verify>
</task>

<task id="02-01-02" wave="1">
<title>Implement Authentication & Multi-Household Switcher</title>
<action>
In apps/family-portal/src/app/login and src/lib/auth-context.tsx:
1. Implement Phone OTP login with 6-digit dev-bypass and Email/Password login.
2. Implement AuthContext provider persisting JWT access & refresh tokens, active user role, and active household state.
3. Create HouseholdSwitcher component for NRI children supporting parents in different cities (Bangalore, Chennai, Hyderabad).
</action>
<verify>
<automated>pnpm --filter family-portal test auth</automated>
</verify>
</task>

<task id="02-01-03" wave="1">
<title>Implement Vitals Trend Charts & Health Summaries</title>
<action>
In apps/family-portal/src/components/vitals/:
1. Build VitalsTrendChart using Recharts for Blood Pressure (Systolic/Diastolic), SpO2 %, Blood Glucose (Fasting & Random), Pulse, and Weight.
2. Implement green geriatric safe-zone reference bands with auto-flagged amber/red markers for abnormal readings.
3. Build HealthSummaryBadge component presenting plain-language health status to families ("Vitals Stable", "Glucose Within Target", "Reviewed by Dr. Anand").
</action>
<verify>
<automated>pnpm --filter family-portal test vitals</automated>
</verify>
</task>

</tasks>
`);

// -------------------------------------------------------------
// Plan 02-02: Dual-Timezone Calendar & 90-Service Catalog Booking
// -------------------------------------------------------------
writeFile('.planning/phases/02-family-portal-web-application/02-02-PLAN.md', `---
phase: 02-family-portal-web-application
plan: 02
wave: 2
depends_on:
  - 02-01
files_modified:
  - apps/family-portal/src/app/calendar/page.tsx
  - apps/family-portal/src/components/calendar/dual-timezone-badge.tsx
  - apps/family-portal/src/components/calendar/appointment-card.tsx
  - apps/family-portal/src/app/services/page.tsx
  - apps/family-portal/src/components/services/service-booking-modal.tsx
  - apps/family-portal/src/components/services/quota-pricing-badge.tsx
autonomous: true
requirements:
  - FAM-03
  - FAM-04

must_haves:
  truths:
    - Appointments in the calendar prominently display both IST and the family member's local timezone with an instant timezone switcher.
    - Families can browse the 90-service catalog filtered by category (A-L) and active plan tier quotas.
    - Service booking auto-detects available subscription quotas (books at ₹0) or places an atomic wallet hold for pay-per-use extras.
  artifacts:
    - apps/family-portal/src/components/calendar/dual-timezone-badge.tsx
    - apps/family-portal/src/components/services/service-booking-modal.tsx
---

# Plan 02-02: Dual-Timezone Interactive Calendar & 90-Service Booking

<objective>
Deliver the dual-timezone interactive appointment calendar for NRI families, and build the 90-service catalog browser with quota-first checks and atomic wallet booking holds.
</objective>

<tasks>

<task id="02-02-01" wave="2">
<title>Implement Dual-Timezone Interactive Calendar</title>
<action>
In apps/family-portal/src/app/calendar and src/components/calendar/:
1. Build DualTimezoneBadge formatting dates in both IST and viewer timezone (e.g. "Tomorrow 10:30 AM IST (Today 10:00 PM PDT)").
2. Implement TimezoneSwitcher component with browser auto-detection and quick override list (PST, EST, GMT, GST, SGT, IST).
3. Render monthly and weekly agenda grids marking Doctor Home Visits, Teleconsults, Care Officer Visits, and Diagnostics.
</action>
<verify>
<automated>pnpm --filter family-portal test calendar</automated>
</verify>
</task>

<task id="02-02-02" wave="2">
<title>Implement 90-Service Catalog Browser & Booking Modal</title>
<action>
In apps/family-portal/src/app/services and src/components/services/:
1. Build CatalogBrowser featuring all 90 services grouped by categories A-L, with search and plan tier filters.
2. Implement QuotaPricingBadge displaying if the service is included in family plan quota (₹0) or pay-per-use extra.
3. Build ServiceBookingModal scheduling visits, verifying wallet balance, and executing atomic holds via NestJS billing API.
</action>
<verify>
<automated>pnpm --filter family-portal test services</automated>
</verify>
</task>

</tasks>
`);

// -------------------------------------------------------------
// Plan 02-03: Wallet Management, Monthly Value Digest & Care Officer Card
// -------------------------------------------------------------
writeFile('.planning/phases/02-family-portal-web-application/02-03-PLAN.md', `---
phase: 02-family-portal-web-application
plan: 03
wave: 3
depends_on:
  - 02-02
files_modified:
  - apps/family-portal/src/app/wallet/page.tsx
  - apps/family-portal/src/components/wallet/wallet-topup-modal.tsx
  - apps/family-portal/src/components/wallet/transaction-ledger.tsx
  - apps/family-portal/src/app/digest/page.tsx
  - apps/family-portal/src/components/digest/monthly-value-digest.tsx
  - apps/family-portal/src/components/care-officer/named-care-officer-card.tsx
  - apps/family-portal/src/__tests__/portal-workflows.spec.tsx
autonomous: true
requirements:
  - FAM-05
  - FAM-06
  - FAM-07

must_haves:
  truths:
    - Families can view INR wallet balance, execute successful top-ups, and filter transaction ledgers.
    - Monthly Value Digest quantifies completed visits, preventive catches, emergency readiness, and savings with invoice download.
    - Named Care Officer card displays photo, bio, direct phone, and published caseload transparency.
    - Vitest frontend test suite verifies all Family Portal dashboards, calendars, and booking flows.
  artifacts:
    - apps/family-portal/src/components/wallet/wallet-topup-modal.tsx
    - apps/family-portal/src/components/digest/monthly-value-digest.tsx
    - apps/family-portal/src/components/care-officer/named-care-officer-card.tsx
---

# Plan 02-03: Wallet Management, Monthly Value Digest & Care Officer Card

<objective>
Build the INR Wallet balance and top-up interface, the Monthly Value Digest with invoice generation, the Named Care Officer profile card, and the regression test suite.
</objective>

<tasks>

<task id="02-03-01" wave="3">
<title>Implement INR Wallet Management & Top-Up</title>
<action>
In apps/family-portal/src/app/wallet and src/components/wallet/:
1. Display active wallet balance in both INR (₹) and paise transaction logs.
2. Build WalletTopupModal allowing smooth top-ups (₹1,000, ₹5,000, ₹10,000) with payment reference generation.
3. Build TransactionLedger component filtering CREDIT, HOLD, DEBIT, and REFUND entries.
</action>
<verify>
<automated>pnpm --filter family-portal test wallet</automated>
</verify>
</task>

<task id="02-03-02" wave="3">
<title>Implement Monthly Value Digest & Named Care Officer Card</title>
<action>
In apps/family-portal/src/app/digest and src/components/:
1. Build MonthlyValueDigest showcasing preventive catches, visits met, and quantified savings with downloadable invoice link.
2. Build NamedCareOfficerCard showing officer photo, military/healthcare background, direct dial button, and published caseload ratio.
</action>
<verify>
<automated>pnpm --filter family-portal test digest</automated>
</verify>
</task>

<task id="02-03-03" wave="3">
<title>Build comprehensive Vitest frontend test suite</title>
<action>
In apps/family-portal/src/__tests__/:
1. Write tests for Family auth with OTP & Email.
2. Write tests for dual-timezone badge and calendar rendering.
3. Write tests for vitals trend dashboard and safe-zone bands.
4. Write tests for wallet top-up and quota-first service booking.
</action>
<verify>
<automated>pnpm test</automated>
</verify>
</task>

</tasks>
`);

console.log('Finished writing all 3 Phase 2 plans');


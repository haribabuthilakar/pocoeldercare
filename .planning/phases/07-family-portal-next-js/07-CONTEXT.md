# Phase 7: Family Portal (Next.js) - Context

**Gathered:** 2026-09-01
**Status:** Ready for planning

<domain>
## Phase Boundary

The Family Portal is the consumer-facing Next.js web application used by family members and seniors. It provides a reassuring, empathetic interface for tracking senior wellness, viewing biometric trends and visit reports, communicating with assigned Care Officers via a unified activity feed, managing the household digital wallet, approving out-of-quota services, configuring family notification escalations, and managing multi-senior households.

</domain>

<decisions>
## Implementation Decisions

### 1. Wellness Dashboard & Vitals Visualization
- **D-01:** **Holistic Wellness Landing View** — Reassuring hero card per senior with wellness status badge (Normal/At-Risk), latest vitals snapshot, assigned Care Officer contact card with quick-call/chat actions, and persistent emergency ICE drawer trigger.
- **D-02:** **Interactive Trend Charts with Normal Ranges** — Timeframe toggles (7D / 30D / 90D) displaying green/amber/red healthy baseline bands and hover tooltips for BP (Systolic/Diastolic), Blood Glucose (Fasting/PP), SpO2, and Heart Rate.
- **D-03:** **Quick-Access Emergency Card Drawer + Profile View** — Persistent 1-tap "Emergency / ICE" action in the top navigation/header opening instant call buttons for Care Officer & Ambulance, preferred hospital, blood group, critical allergies, and insurance policy ID, plus a full editable profile tab.
- **D-04:** **Senior Selector Tabs with Status Badges** — Top avatar tabs (e.g. "Papa [Normal]", "Maa [At-Risk]") enabling 1-click switching between seniors in multi-senior households (1 to 4 seniors) while maintaining persistent health status awareness across all seniors.

### 2. Activity Feed & Chat Layout
- **D-05:** **Unified Stream with Rich Event Cards** — Single interleaved timeline blending two-way chat bubbles with structured system event cards (visit completions with photo thumbnails, vitals alerts, ticket updates, invoices).
- **D-06:** **Inline Status Badge with Real-Time Updates** — Subtle badge attached to chat bubbles (e.g., '🤖 Ticket #104: Under Review' transitioning to '✅ Service Scheduled: General Physician') linking directly to ticket tracking.
- **D-07:** **Periodic Refresh (10s) with Pulse Indicator** — 10-second polling interval via TanStack Query when the screen is active, accompanied by a subtle live dot indicator and pull-to-refresh/manual refresh button.
- **D-08:** **Quick Filter Pills + Search Bar** — Top filter chips ('All', '💬 Chat', '🩺 Vitals', '🏠 Visits', '📋 Services') with keyword search to instantly filter and search the activity stream.

### 3. Service Approvals & Wallet Top-up UX
- **D-09:** **Dedicated Approvals Inbox Page** — Separate 'Pending Approvals' tab in the navigation with itemized cost breakdowns, Care Officer notes, and historical approval audit trail.
- **D-10:** **Quick Top-Up Presets + Direct Deficit Top-Up** — Preset amount chips (₹1,000, ₹3,000, ₹5,000, Custom) on Wallet page, plus 'Top up exact needed amount' when approving an unfunded service, launching the interactive Razorpay mock modal.
- **D-11:** **In-Browser Invoice Viewer + PDF/Print Download** — Clean ledger of all wallet transactions and subscription renewals, with an interactive modal previewing the formatted tax invoice and 1-click Print/Download.
- **D-12:** **Visual Quota Meter Cards with Renewal Clocks** — Cards showing active package tier (e.g. Sahara), billing renewal date, and visual progress meters for each service quota (e.g. 'Companion Visits: 3 of 4 remaining') plus overage unit pricing notice.

### 4. Family Escalation Tree & Member Management
- **D-13:** **Ordered Priority List with Global Timeout** — Drag-and-drop ranking of family members with a single dropdown for escalation interval (e.g. escalate every 15 mins if unacknowledged).
- **D-14:** **Compact Member Table with Action Menu** — Tabular list with columns for Name, Relationship, Contact, Role ('Primary Payer' badge), and three-dots action menu (Resend Invite, Make Primary, Remove).
- **D-15:** **Top Nav Dropdown (Hidden if Single Household)** — Prominent selector in the top navigation showing Household Name and Senior avatars (e.g. 'Sharma Residence — Papa & Maa'); only visible when user has 2+ household memberships; instantly switches session context.
- **D-16:** **4-Step Guided Wizard for Onboarding** — Step 1: Household & City -> Step 2: Senior Profiles (1-4 seniors: Age, Conditions, Allergies) -> Step 3: Emergency ICE, Hospital & Insurance -> Step 4: Select Care Package (Kavach/Sahara/Sampoorna) & Review.

### the agent's Discretion
- Micro-interactions, exact chart styling (using Tailwind & Lucide icons), loading skeletons, and empty state illustrations.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Core Specifications & Design
- `docs/poco-elder-care-design-brief.md` — Authoritative design brief (§1-3, §3.6 billing/quotas, §3.8 auth/roles, §3.9 onboarding, §3.12 activity feed, §3.14 Razorpay mock)
- `.planning/REQUIREMENTS.md` — Requirements AUTH-03, AUTH-04, AUTH-05, ONBD-02, FEED-01, FEED-02, FEED-03, FEED-06, BILL-05, BILL-06, BILL-07, SLA-05
- `.planning/ROADMAP.md` — Phase 7 scope and success criteria
- `.planning/STATE.md` — Current platform implementation state

### Shared Packages & Contracts
- `packages/types` — Data contracts for Household, Senior, Vitals, ActivityFeedItem, Ticket, ServiceRequest, WalletTransaction, QuotaUsage, PackageVersion, ServiceCatalogVersion
- `packages/business-rules` — State machines, billing hierarchy, 3-step quota evaluation, SLA rules
- `packages/design-tokens` — Shared colors, typography, spacing, and status token definitions
- `packages/ui` — Shared UI primitives (buttons, dialogs, cards, badges, tabs)
- `packages/integrations` — Razorpay payment modal mock definitions

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `packages/ui`: Shared Radix/Tailwind components (Button, Card, Dialog, Badge, Tabs, DropdownMenu, Avatar, Table, Input, Select).
- `packages/integrations/src/mocks/razorpay.ts`: Razorpay payment modal mockup supporting interactive top-up simulations.
- `apps/api/src/modules/activity-feed`: API controller and service for fetching feed items and posting chat messages.
- `apps/api/src/modules/billing`: API endpoints for wallet balance, top-up, invoices, and quota usage.
- `apps/api/src/modules/tickets`: Family ticket raising and approval endpoints.

### Established Patterns
- Next.js 15 App Router with Tailwind CSS and TanStack Query for client-side state and periodic polling.
- External Auth with JWT stored in secure session cookie or localStorage, setting `personId` and active `householdId` headers.
- Multi-household context switching via active household header (`x-household-id`).

### Integration Points
- Backend endpoints under `/api/family/v1/*` and shared `/api/v1/*` modules (activity-feed, tickets, billing, onboarding, seniors, households).

</code_context>

<specifics>
## Specific Ideas

- Reassuring, warm aesthetic emphasizing peace of mind for adult children caring for elderly parents remotely.
- Prominent Emergency / ICE drawer accessible in 1-tap from anywhere in the portal.
- Clean separation between primary payer controls (inviting/removing members) and shared family capabilities (chat, viewing vitals, approving services, topping up wallet).

</specifics>

<deferred>
## Deferred Ideas

- None — discussion stayed within phase scope.

</deferred>

---

*Phase: 07-family-portal-next-js*
*Context gathered: 2026-09-01*

# Phase 7: Family Portal (Next.js) - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-09-01
**Phase:** 07-family-portal-next-js
**Areas discussed:** Wellness Dashboard & Vitals Visualization, Activity Feed & Chat Layout, Service Approvals & Wallet Top-up UX, Family Escalation Tree & Member Management

---

## Wellness Dashboard & Vitals Visualization

| Option | Description | Selected |
|--------|-------------|----------|
| Holistic Wellness Overview | Reassuring hero card per senior with wellness status badge, latest vitals snapshot, assigned Care Officer contact card, and quick emergency ICE actions. | ✓ |
| Clinical Vitals-First View | Focus immediately on multi-metric biometric charts (BP, Blood Glucose, SpO2, Heart Rate, Weight) with trend sparklines. | |
| Timeline & Feed First | Recent care visits, photos, and messages dominate the homepage with vitals summarized in a collapsible side sheet. | |

**User's choice:** Holistic Wellness Overview
**Notes:** Reassuring consumer experience focused on peace of mind and quick emergency actions.

| Option | Description | Selected |
|--------|-------------|----------|
| Interactive Trend Charts with Normal Ranges | Timeframe toggles (7D / 30D / 90D) showing green/amber/red healthy baseline bands and data point tooltips for BP, Glucose, SpO2, and Pulse. | ✓ |
| Tabular Health Record Table | High-density, chronological list of all logged biometric readings with normal/high/low status tags and CSV/PDF export. | |
| Metric Cards with Mini-Sparklines | Grid of cards per biometric showing latest reading, delta vs previous, and 7-day mini sparkline graph. | |

**User's choice:** Interactive Trend Charts with Normal Ranges
**Notes:** Visual clarity on healthy baseline bands helps non-medical family members quickly understand trends.

| Option | Description | Selected |
|--------|-------------|----------|
| Quick-Access Emergency Card Drawer + Profile View | Persistent 1-tap "Emergency / ICE" action in the header opening instant call buttons, hospital preferences, blood group, allergies, and insurance policy, plus full editable profile tab. | ✓ |
| Dedicated Senior Medical Profile Page Only | Standard navigation tab under Senior details covering clinical history, insurance documents, and ICE contacts without persistent top header shortcut. | |

**User's choice:** Quick-Access Emergency Card Drawer + Profile View
**Notes:** 1-tap emergency access from any screen in the portal.

| Option | Description | Selected |
|--------|-------------|----------|
| Senior Selector Tabs with Status Badges | Top avatar tabs (e.g. "Papa [Normal]", "Maa [At-Risk]") allowing 1-click focus on a specific senior, while maintaining awareness of all seniors in the household. | ✓ |
| Stacked Senior Overview Cards | Vertical layout showing condensed overview cards for all seniors in the household simultaneously, expandable for full vitals. | |

**User's choice:** Senior Selector Tabs with Status Badges
**Notes:** Keeps the dashboard clean and focused on one senior at a time while maintaining ambient awareness of health status across all seniors.

---

## Activity Feed & Chat Layout

| Option | Description | Selected |
|--------|-------------|----------|
| Unified Stream with Rich Event Cards | Interleaved timeline where two-way chat bubbles blend naturally with rich system event cards (visit completions with photo thumbnails, vitals alerts, ticket updates, invoice generation). | ✓ |
| Tabbed Split View (Chat vs Timeline) | Separate 'Family & Care Chat' tab for messaging and 'Care Timeline' tab for system events, reports, and service milestones. | |
| Collapsible Side-by-Side View | Activity timeline on the main canvas with a collapsible floating/docked care officer chat panel on the right. | |

**User's choice:** Unified Stream with Rich Event Cards
**Notes:** WhatsApp-style conversational flow integrated with rich system cards.

| Option | Description | Selected |
|--------|-------------|----------|
| Inline Status Badge with Real-Time Updates | A subtle badge attached to the chat bubble (e.g., '🤖 Ticket #104: Under Review' transitioning to '✅ Service Scheduled: General Physician') that links directly to ticket tracking. | ✓ |
| Separate Linked Service Request Card | Below the message, render a standalone action card showing the detected service, estimated cost, and status. | |
| Minimal Tag with Side Drawer | Small chip on the bubble that opens a slide-over panel displaying the full ticket details and SOP stage. | |

**User's choice:** Inline Status Badge with Real-Time Updates
**Notes:** Provides real-time reassurance that AI-detected requests are being handled by operations.

| Option | Description | Selected |
|--------|-------------|----------|
| Periodic Refresh (10s) with Pulse Indicator | 10-second polling interval with a subtle live dot indicator and pull-to-refresh / manual refresh button. | ✓ |
| Active-Screen Polling (3-5s) with Smart Scroll | TanStack Query auto-polls every 3-5s while active tab; smoothly appends messages and shows a floating '↓ New Updates' pill if scrolled up. | |

**User's choice:** Periodic Refresh (10s) with Pulse Indicator
**Notes:** 10s interval is battery and server efficient for the 1GB droplet while keeping state fresh.

| Option | Description | Selected |
|--------|-------------|----------|
| Quick Filter Pills + Search Bar | Top filter chips ('All', '💬 Chat', '🩺 Vitals', '🏠 Visits', '📋 Services') with keyword search to instantly narrow the feed. | ✓ |
| Date & Senior Dropdown Filters | Header controls to filter by specific date range (e.g. This Week, Last Month) and specific Senior. | |
| Pure Chronological Stream | No filter chips, infinite scroll with date dividers (Today, Yesterday, Aug 28). | |

**User's choice:** Quick Filter Pills + Search Bar
**Notes:** Fast access to specific types of history (e.g. looking for past vitals or visit photos).

---

## Service Approvals & Wallet Top-up UX

| Option | Description | Selected |
|--------|-------------|----------|
| Dedicated Approvals Inbox Page | A separate 'Pending Approvals' tab in the navigation with full itemized cost breakdowns, Care Officer notes, and historical approval audit trail. | ✓ |
| Action Banner + Interactive Feed Card | Prominent banner on the dashboard + highlighted card in the activity feed showing service details, price, reason for approval, and 1-tap 'Approve & Pay' or 'Decline' buttons. | |
| Slide-Over Review Drawer | Clicking any pending service notification opens a detailed review modal with quota balance, pricing breakdown, and payment confirmation. | |

**User's choice:** Dedicated Approvals Inbox Page
**Notes:** Complete oversight and audit trail of financial authorizations.

| Option | Description | Selected |
|--------|-------------|----------|
| Quick Top-Up Presets + Direct Deficit Top-Up | Preset amount chips (₹1,000, ₹3,000, ₹5,000, Custom) on Wallet page, plus 'Top up exact needed amount' when approving an unfunded service, launching the interactive Razorpay mock modal. | ✓ |
| Wallet Page Top-Up Only | Top-ups can only be initiated from the dedicated Wallet page, requiring separate manual balance addition before approving services. | |

**User's choice:** Quick Top-Up Presets + Direct Deficit Top-Up
**Notes:** Seamless flow when funding specific out-of-quota service approvals.

| Option | Description | Selected |
|--------|-------------|----------|
| In-Browser Invoice Viewer + PDF/Print Download | Clean ledger of all wallet transactions and subscription renewals, with an interactive modal previewing the formatted tax invoice and 1-click Print/Download. | ✓ |
| Direct File Download Only | Simple download icon on each transaction line item that triggers an immediate download without in-browser modal preview. | |
| Monthly Consolidated Statements | Monthly billing statements combining all subscription fees, service overages, and wallet reloads into a single monthly statement. | |

**User's choice:** In-Browser Invoice Viewer + PDF/Print Download
**Notes:** Instant preview without requiring downloading separate files to check charges.

| Option | Description | Selected |
|--------|-------------|----------|
| Visual Quota Meter Cards with Renewal Clocks | Cards showing active package tier (e.g. Sahara), billing renewal date, and visual progress meters for each service quota (e.g., 'Companion Visits: 3 of 4 remaining') plus overage price notice. | ✓ |
| Tabular Quota Ledger | Detailed table with Service Category, Total Quota, Used This Month, Remaining, and Unit Price per extra request. | |

**User's choice:** Visual Quota Meter Cards with Renewal Clocks
**Notes:** Easy-to-understand visual indicators for non-technical family members.

---

## Family Escalation Tree & Member Management

| Option | Description | Selected |
|--------|-------------|----------|
| Ordered Priority List with Global Timeout | Drag-and-drop ranking of family members with a single dropdown for escalation interval (e.g., escalate every 15 mins if unacknowledged). | ✓ |
| Visual Step Ladder with Delay Timers & Channels | Step-by-step visual chain (Step 1: Notify Primary via WhatsApp/App -> 15 min wait -> Step 2: Notify Secondary Family via SMS -> 30 min wait -> Step 3: Trigger Phone Call to ICE Contact) with add/edit step controls. | |
| Matrix View by Alert Severity | Table configuring different recipient lists and intervals for 'High Priority Approvals' vs 'Routine Notifications'. | |

**User's choice:** Ordered Priority List with Global Timeout
**Notes:** Simple, intuitive setup for families without overly complex configuration overhead.

| Option | Description | Selected |
|--------|-------------|----------|
| Compact Member Table with Action Menu | Tabular list with columns for Name, Relationship, Contact, Role, and three-dots action menu (Resend Invite, Make Primary, Remove). | ✓ |
| Member Cards Grid with Primary Badge & Invite Modal | Visual cards displaying member names, relationship tag, phone, email, and 'Primary Payer' badge; Primary user has an 'Invite Member' button and member removal controls. | |

**User's choice:** Compact Member Table with Action Menu
**Notes:** Clean administrative management of family access and roles.

| Option | Description | Selected |
|--------|-------------|----------|
| Top Nav Dropdown (Hidden if Single Household) | Prominent selector in the top navigation showing Household Name and Senior avatars (e.g. 'Sharma Residence — Papa & Maa'); only visible when user has 2+ household memberships; instantly switches session context. | ✓ |
| Sidebar Account Menu Selector | Household switcher embedded inside the user profile avatar menu in the navigation bar. | |

**User's choice:** Top Nav Dropdown (Hidden if Single Household)
**Notes:** Clean and unobtrusive for single-household families while offering instant 1-click switching for multi-household users.

| Option | Description | Selected |
|--------|-------------|----------|
| 4-Step Guided Wizard | Step 1: Household & City -> Step 2: Senior Profiles (1-4 seniors: Age, Conditions, Allergies) -> Step 3: Emergency ICE, Hospital & Insurance -> Step 4: Select Care Package (Kavach/Sahara/Sampoorna) & Review. | ✓ |
| 2-Step Fast Setup + Dashboard Reminders | Rapid initial setup with name, location, and seniors, with clinical history and insurance gathered via prominent completion checklist cards on the dashboard. | |
| Single-Page Structured Form | All onboarding sections laid out in structured accordion panels on a single page with a sticky progress tracker. | |

**User's choice:** 4-Step Guided Wizard
**Notes:** Structured onboarding process ensuring all required emergency and clinical information is captured before Care Officer activation.

---

## the agent's Discretion

- Micro-interactions, chart styling, loading states, and responsive mobile adaptations.

## Deferred Ideas

- None — discussion stayed within phase scope.

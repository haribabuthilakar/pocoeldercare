# Phase 05: Admin Portal (Next.js) - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-09-01
**Phase:** 05-admin-portal-next-js
**Areas discussed:** Multi-Role UX, Operations Queues, AI Confirmation, Emergency Overrides, Exception Rollup, SLA Escalation, Media Inspection, Catalog Versioning, Lead Pipeline, Billing Dashboard, Raw DB Explorer, Diagnostics & Synthetic Payloads

---

## 1. Multi-Role Access & Internal Auth UX (AUTH-02, AUTH-06)

| Option | Description | Selected |
|--------|-------------|----------|
| Omni-Role Unified Navigation with Role Badges | Staff user gets all navigation items permitted by any of their active assigned roles simultaneously with active role chips in header. | ✓ |
| Explicit Active-Role Switcher Dropdown | Staff user must switch active role perspective from header dropdown. | |

**User's choice:** Omni-Role Unified Navigation with Role Badges
**Notes:** Unified role-based access without friction of context switching.

---

## 2. Operations & Ticket Triage Queues (ADMN-01, ADMN-02, TCKT-06, TCKT-07)

| Option | Description | Selected |
|--------|-------------|----------|
| Tabbed Multi-Page Queues with Modal Actions | Dedicated routes (/admin/triage, /admin/exceptions, /admin/sla-risk) with standard data tables and modal dialogs. | ✓ |
| Unified Split-Pane Queue with Hotkey Triage | Master-detail split-pane with j/k hotkey navigation. | |
| Kanban Workflow Board | Drag-and-drop columns with slide-over inspector drawer. | |

**User's choice:** Tabbed Multi-Page Queues with Modal Actions

---

## 3. AI Triage to Child Service Request Confirmation (FEED-06, FEED-07, TCKT-02)

| Option | Description | Selected |
|--------|-------------|----------|
| Pre-filled Catalog Item Chooser | Modal displays AI-extracted service with confidence score and metadata tweaks. | |
| Freeform Service Request Builder | Ops Exec manually selects service type from scratch. | |
| Inline Quick-Approve Button | 1-click button directly in table row that approves AI default suggestion. | ✓ |

**User's choice:** Inline Quick-Approve Button

---

## 4. Emergency Billing Overrides (BILL-03, ADMN-02)

| Option | Description | Selected |
|--------|-------------|----------|
| Toggle Switch with Warning Badge & Audit Reason | Warning badge that wallet auto-debit will allow negative balance, requiring audit note. | |
| Silent Emergency Flag Checkbox | Simple checkbox during ticket/service creation or edit setting isEmergency: true. | ✓ |
| Two-Person / Manager Approval Required | Requires separate manager approval queue. | |

**User's choice:** Silent Emergency Flag Checkbox

---

## 5. Child Service Request Exception Rollup Resolution (TCKT-02, TCKT-06, TCKT-07)

| Option | Description | Selected |
|--------|-------------|----------|
| Visual Service Tree with Conflict Badges & Target State Selector | Tree view of child requests with conflict badges; Ops Exec selects target rollup state with note. | ✓ |
| Flat Step-by-Step Resolution Wizard | 3-step wizard to resolve child requests. | |
| Action Buttons per Child Request | Force uniform statuses per child request. | |

**User's choice:** Visual Service Tree with Conflict Badges & Target State Selector

---

## 6. Telephony & Real-Time Wearable Alert Presentation (TCKT-05, INTG-03, INTG-04)

| Option | Description | Selected |
|--------|-------------|----------|
| Global Persistent Urgent Banner + Screen-Pop Drawer | Floating banner with pulsing red beacon + call screen-pop toast. | |
| Modal Takeover Dialog for Emergencies | Inescapable full-screen modal alert. | |
| Queue-Only Ingestion | Emergency alerts and calls route purely into standard triage table with high-priority red badge. | ✓ |

**User's choice:** Queue-Only Ingestion

---

## 7. Polling Strategy for 1GB Droplet (FEED-03, ADMN-01)

| Option | Description | Selected |
|--------|-------------|----------|
| Direct Client-Side Polling (5s interval) | TanStack Query polls tickets endpoint with 'Updated just now' pill and refresh button. | ✓ |
| On-Demand Manual Refresh Only | Updates only on manual button click or mutating action. | |
| Exponential Backoff Polling | 3s active polling backing off to 30s idle. | |

**User's choice:** Direct Client-Side Polling (5s interval)

---

## 8. Care Officer Assignment & Certification Gating (CARE-02, CARE-03, ADMN-03)

| Option | Description | Selected |
|--------|-------------|----------|
| Actionable Warning Banner + Manager Bypass Option | Highlights missing certificate with disabled button; provides Manager Override checkbox. | ✓ |
| Strict Hard Block (No Overrides) | Strictly disabled button with no overrides permitted. | |
| Allow Assignment in 'Pending Certification' Status | Allows assignment but blocks field dispatch. | |

**User's choice:** Actionable Warning Banner + Manager Bypass Option

---

## 9. SLA Escalation & Dynamic Owner Reassignments (ADMN-02, SLA-04, CARE-05)

| Option | Description | Selected |
|--------|-------------|----------|
| Dedicated Escalation Queue with 1-Click Fallback Reassignment | Manual 1-click fallback queue for managers. | |
| Inline Reassignment in Detail Modal | Reassignment strictly within ticket detail modal. | |
| Automatic Background Fallback Only | Reassignments happen purely via background cron with audit notification banner in Admin Portal. | ✓ |

**User's choice:** Automatic Background Fallback Only

---

## 10. KYC & Visit SOP Media Inspection (FLD-04, ADMN-03)

| Option | Description | Selected |
|--------|-------------|----------|
| Direct Client-Side S3 / Local Media Viewer with Presigned Thumbnails | Direct rendering with zoomable lightbox modals for photos and in-browser audio players for voice notes. | ✓ |
| Embedded Iframe / Document Previewer Drawer | Slide-over drawer with full PDF/media viewer. | |
| Simple Download Links | Minimal table column with file download links. | |

**User's choice:** Direct Client-Side S3 / Local Media Viewer with Presigned Thumbnails

---

## 11. Catalog & Package Versioning (CATL-01..05)

| Option | Description | Selected |
|--------|-------------|----------|
| Simple Edit Form with Automatic Version Bumping | Form fields; clicking 'Save & Publish' increments version number and preserves grandfathered records. | ✓ |
| Modal with Live Quota / Package Impact Preview | Form with live impact preview box. | |
| Draft Staging with 'Publish Live' Step | Separate draft and publish states. | |

**User's choice:** Simple Edit Form with Automatic Version Bumping

---

## 12. Lead Management & Sales-to-CS Handoff (ONBD-01..03, ADMN-04)

| Option | Description | Selected |
|--------|-------------|----------|
| Inline Status Dropdown | Changing status dropdown from 'Contacted' to 'Onboarding Pending' automatically shifts role ownership. | ✓ |
| Dedicated Lead Detail Drawer | Slide-over drawer with explicit 'Hand off to CS' button. | |
| Batch Handoff Action | Checkboxes for bulk lead assignment. | |

**User's choice:** Inline Status Dropdown

---

## 13. Financial Billing & Ledger Dashboard (BILL-01..07)

| Option | Description | Selected |
|--------|-------------|----------|
| Dedicated Financial Billing Dashboard (/admin/billing) | High-level finance view showing MRR, negative balances, pending approval invoices, and ledger export. | ✓ |
| Inline Filterable Transaction Ledger + Top-Up Modal | Simple ledger table with Razorpay top-up button. | |
| Read-Only Ledger with Admin Adjustments | Ledger with finance manager credit/debit adjustments. | |

**User's choice:** Dedicated Financial Billing Dashboard (/admin/billing)

---

## 14. Raw Database Table Explorer (ADMN-05)

| Option | Description | Selected |
|--------|-------------|----------|
| Tabbed Table Explorer | Horizontal tab bar for top core entities with simple flat tables, column sort, and pagination. | ✓ |
| Filterable Multi-Entity Data Grid with JSON Inspector Modal | Dropdown table selector with JSON inspection modal. | |
| Embedded Prisma Studio Style Interface | Spreadsheet-style editable grid. | |

**User's choice:** Tabbed Table Explorer

---

## 15. Diagnostics, Background Job Queue & Synthetic Webhook Dispatcher (INTG-05, TEST-04)

| Option | Description | Selected |
|--------|-------------|----------|
| Integrated into Existing /admin/integrations with Synthetic Scenario Preset Injection | Extend partner health dashboard with pg-boss job inspector, automated test logs, and preset webhook dispatcher. | ✓ |
| Consolidated Diagnostics & Job Queue Inspector (/admin/diagnostics) | Separate diagnostics route. | |
| Minimal Job Stats Widget | Compact dashboard card. | |

**User's choice:** Integrated into Existing /admin/integrations with Synthetic Scenario Preset Injection

---

## the agent's Discretion

- Tailwind CSS styling and design token usage matching @poco/design-tokens.
- Layout chrome, sidebar navigation links, and internal authentication redirects.
- Breadcrumb navigation and responsive table overflow scrollbars.

## Deferred Ideas

- None — discussion stayed strictly within Phase 5 scope.

# Phase 05: Admin Portal (Next.js) - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-09-01
**Phase:** 05-admin-portal-next-js
**Areas discussed:** Operations & Ticket Triage Queues, Care Officer Manager Assignment UI, Catalog & Package Versioning Management, Lead Pipeline & Raw DB Viewer / Diagnostics

---

## Operations & Ticket Triage Queues (ADMN-01, ADMN-02, TCKT-06, TCKT-07)

| Option | Description | Selected |
|--------|-------------|----------|
| Tabbed Multi-Page Queues with Modal Actions | Dedicated routes (/admin/triage, /admin/exceptions, /admin/sla-risk) with standard data tables, modal dialogs for approvals/overrides, and standard pagination. | ✓ |
| Unified Split-Pane Queue with Hotkey Triage | Left master queue with live SLA/status counters and keyboard navigation, Right detail pane showing full activity feed context, AI confidence reasoning, senior medical ICE summary, and child service request rollup controls. | |
| Kanban Workflow Board | Drag-and-drop columns (Pending Triage -> Waiting Ops -> In Progress -> Escalated / Breached) with quick-action cards and slide-over inspector drawer. | |

**User's choice:** Tabbed Multi-Page Queues with Modal Actions
**Notes:** Reconfirmed selection of multi-page dedicated queues with modal action triggers.

---

## Care Officer Manager Assignment UI (CARE-02, CARE-03, ADMN-03)

| Option | Description | Selected |
|--------|-------------|----------|
| Officer-Centric Profile & Roster View | Care Officer roster listing each officer's active caseload, supervisor reporting line, expiring certifications, and a modal to assign/reassign households. | ✓ |
| Interactive Two-Column Assignment Matrix | Left column shows unassigned/reassignment-eligible households; Right column displays Care Officers ranked by capacity with real-time badge indicators. | |
| Wizard-based Multi-Step Assignment | Step 1 select household, Step 2 filter certified officers, Step 3 confirm handoff and notify supervisor. | |

**User's choice:** Officer-Centric Profile & Roster View
**Notes:** Reconfirmed officer roster with caseload counts, reporting lines, and certification gating.

---

## Catalog & Package Versioning Management (CATL-01..05)

| Option | Description | Selected |
|--------|-------------|----------|
| In-Place Quick Editor with Immediate Version Bumping | Simple forms that automatically increment version number and set effective timestamp on save, with a version history dropdown. | ✓ |
| Draft -> Version Comparison Diff -> Atomic Publish | Admins edit draft catalog/packages, inspect a side-by-side visual diff, and publish atomically to create new immutable versions with grandfathering badge indicators. | |
| Form-based Catalog Builder with JSON export/import | Form fields with raw JSON definition toggle for power-admin rate card and quota adjustments. | |

**User's choice:** In-Place Quick Editor with Immediate Version Bumping
**Notes:** Reconfirmed form editor with automatic version increments and historical lookup.

---

## Lead Pipeline & Raw DB Viewer / Diagnostics (ONBD-01..03, ADMN-04, ADMN-05)

| Option | Description | Selected |
|--------|-------------|----------|
| Tabular Lead Pipeline Table + Schema-Driven Entity Data Grid | Flat table for leads with quick status dropdowns and reminder buttons; and a generic read-only admin data grid with pagination and row expanders for Prisma tables. | ✓ |
| Sales-to-CS Kanban Pipeline + Filterable Multi-Entity Table Viewer | Funnel board for leads with 1-click WhatsApp/SMS reminder triggers; plus a dedicated DB Inspector page supporting table selection, search/sort, and CSV export. | |
| Consolidated Operations & Diagnostics Hub | Combined dashboard with lead funnel metrics, payment chasing queue, and database table stats with direct row drill-down. | |

**User's choice:** Tabular Lead Pipeline Table + Schema-Driven Entity Data Grid
**Notes:** Reconfirmed high-density data grid tables with expandable rows for auditing raw database entities.

---

## the agent's Discretion

- Tailwind CSS styling and design token usage matching @poco/design-tokens.
- Layout chrome, sidebar navigation links, and internal authentication redirects.
- Breadcrumb navigation and responsive table overflow scrollbars.

## Deferred Ideas

- None — discussion stayed strictly within Phase 5 scope.

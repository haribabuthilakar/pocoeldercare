# Phase 05: Admin Portal (Next.js) - Context

**Gathered:** 2026-09-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 5 builds the full-featured Next.js Admin Operations Portal for Poco Elder Care:
- High-density operations queues for Operations Executives to triage incoming Pending Triage tickets, resolve Waiting Ops Update rollups, and manage SLA At Risk queues.
- Care Officer Manager interface to manage Care Officer rosters, track caseloads/reporting hierarchies, and execute household assignments/reassignments with automated, strict certification gating.
- Service Catalog & Package versioning management to configure, preview, and bump versioned rate cards (ServiceCatalogVersion, PackageVersion, PackageServiceQuota) while strictly preserving grandfathered subscriptions and historical service requests.
- Lead pipeline management table tracking Sales-to-CS ownership transitions with payment reminder triggers.
- Read-only, paginated raw database table viewer for all Prisma entities to support administrative inspection, diagnostic audits, and testing.
- Dedicated Financial Billing Dashboard (/admin/billing) for inspecting household wallets, tracking negative balances from emergency auto-debits, and downloading invoices.
- Integrated diagnostics and partner health dashboard (/admin/integrations) featuring in-process pg-boss background job inspectors, webhook logs, and synthetic test payload dispatchers.
</domain>

<decisions>
## Implementation Decisions

### 1. Multi-Role Navigation & Internal Auth UX (AUTH-02, AUTH-06)
- **D-01:** Omni-role unified navigation: Internal staff users holding multiple simultaneous roles (e.g. Care Officer + Care Officer Manager + Operations Executive) see a merged navigation sidebar containing all permitted pages without switching contexts, with active role chips displayed in the header. — **Reversibility:** reversible — app layout and navigation permission filtering.

### 2. Operations & Ticket Triage Queues (ADMN-01, ADMN-02, TCKT-02, TCKT-06, TCKT-07, FEED-06, FEED-07)
- **D-02:** Tabbed multi-page queue architecture: Dedicated high-density routes (/admin/triage, /admin/exceptions, /admin/sla-risk) with standardized data tables, status badge indicators, and pagination. — **Reversibility:** reversible — routing and page hierarchy structure.
- **D-03:** Inline quick-approve for AI suggestions: 1-click button directly in the table row to approve the AI's default suggested service into an immutable ServiceCatalogVersion child request without opening a modal, with a secondary 'Edit' modal for edge cases. — **Reversibility:** reversible — UI action interaction pattern.
- **D-04:** Silent emergency flag checkbox: A simple checkbox during ticket/service creation or edit that sets isEmergency: true without additional confirmation steps. — **Reversibility:** reversible — form input handling.
- **D-05:** Visual service tree exception resolution: For Waiting Ops Update tickets with conflicting child request states, modal renders parent ticket and indented tree of child requests with conflict warning icons; Ops Exec selects target rollup state (e.g. 'Completed with Exceptions' or 'Closed') with a mandatory resolution note. — **Reversibility:** reversible — exception resolution workflow.
- **D-06:** Queue-only emergency ingestion: Real-time wearable fall alerts and incoming Exotel calls route purely into the standard triage queue table with a high-priority red badge filter, without intrusive full-screen takeovers or modal popups. — **Reversibility:** reversible — alert presentation pattern.
- **D-07:** Direct client-side polling (5s interval): TanStack Query polls /api/admin/v1/tickets?status=pending_triage,waiting_ops,sla_at_risk with a visual 'Updated just now' indicator and manual 'Refresh' button, maintaining fresh state while conserving droplet RAM/CPU. — **Reversibility:** costly — client state management and backend polling load.

### 3. Care Officer Manager Assignment & Certifications (CARE-02, CARE-03, ADMN-03, FLD-04)
- **D-08:** Officer-centric profile & roster view: Roster table listing all Care Officers, active household caseload count, supervisor reporting hierarchy, and active/expiring certification badges. — **Reversibility:** reversible — dashboard view layout.
- **D-09:** Actionable certification warning banner with manager bypass: Assignment modal highlights missing or expired certificates in red with an 'Officer Ineligible' disabled button; provides a 'Manager Override' checkbox (restricted strictly to Care Officer Manager role with audit note) for exceptional temporary assignments. — **Reversibility:** costly — business-rules integration and assignment workflow contracts.
- **D-10:** Automatic background fallback only: SLA breaches automatically reassign to supervising Senior Care Officers via background cron, with audit notification banners in the Admin Portal. — **Reversibility:** costly — SLA evaluation and escalation architecture.
- **D-11:** Direct client-side S3 / local media viewer: KYC documents, certifications, and field visit SOP photos/audio notes render directly in the admin portal with thumbnail previews, zoomable lightbox modals for images, and in-browser audio players for voice notes. — **Reversibility:** costly — media asset rendering and presigned URL pipelines.

### 4. Catalog & Package Versioning Management (CATL-01..05)
- **D-12:** Simple edit form with automatic version bumping: Standard form fields for base price, emergency defaults, and package quotas; clicking 'Save & Publish' immediately creates the new immutable version row (ersionNumber++, effectiveFrom = now()) and redirects to catalog list, preserving grandfathered subscriptions automatically. — **Reversibility:** costly — catalog mutation services and grandfathered integrity guarantees.
- **D-13:** Historical version selector dropdown: Version history switcher allowing administrators to review past rates and inspect active grandfathered subscription counts. — **Reversibility:** reversible — catalog inspection view.

### 5. Lead Management & Sales-to-CS Handoff (ONBD-01..03, ADMN-04)
- **D-14:** Tabular lead pipeline with inline status transitions: Flat table for leads showing status (New, Contacted, Onboarding Pending, Activated); changing the status dropdown directly in the table row from 'Contacted' to 'Onboarding Pending' automatically shifts role ownership from Sales Executive to Customer Success without extra steps. — **Reversibility:** reversible — lead management table.

### 6. Billing & Financial Dashboard (BILL-01..07)
- **D-15:** Dedicated financial billing dashboard (/admin/billing): High-level finance view showing MRR, negative balance accounts from emergency auto-debits, pending approval services, downloadable invoices, and aggregate ledger audit export. — **Reversibility:** costly — finance reporting and transaction inspection module.

### 7. Diagnostics, Raw DB Viewer & Synthetic Webhooks (ADMN-05, TEST-04, INTG-05)
- **D-16:** Tabbed raw database table explorer (/admin/database): Horizontal tab bar for top core entities (Users, Households, Seniors, Tickets, Wallets, AuditLogs) with simple flat data tables, column sort, and pagination. — **Reversibility:** costly — admin diagnostics component architecture.
- **D-17:** Integrated diagnostics & background job inspector (/admin/integrations): Extend the Phase 2 Partner Health dashboard with additional tabs for pg-boss background job queues (failed job inspection and 1-click retry/purge) and automated test execution logs. — **Reversibility:** costly — background job and test observability dashboard.
- **D-18:** Dynamic synthetic test payload injection: Dynamic form with pre-configured scenario presets (e.g. 'Trigger Wearable Fall', 'Trigger Out-of-Quota Ticket', 'Trigger Expired Certification') that post directly to /api/webhooks/v1/*. — **Reversibility:** reversible — test payload dispatching UI.

### the agent's Discretion
- Layout spacing, typography, and color tokens using @poco/design-tokens and Tailwind CSS.
- Integration of existing components from @poco/ui and /admin/integrations (already built in Phase 2).
- Breadcrumbs, sidebar navigation styling, and internal auth guard redirects (/admin/login).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Architecture & Requirements
- docs/poco-elder-care-design-brief.md §3, §4, §5, §6, §7 — Authoritative design brief defining dual auth, pg-boss, 3-step billing hierarchy, dual SLA tracking, 1:1 Care Officer mapping, and catalog grandfathering.
- .planning/PROJECT.md — Project context, 1GB DO droplet constraints, and active requirements.
- .planning/REQUIREMENTS.md — Formal requirements matrix (ADMN-01..05, CARE-02..03, TCKT-02, TCKT-06..07, CATL-05, INTG-05, BILL-01..07, TEST-04).
- .planning/research/ARCHITECTURE.md — System architecture, container topology, package graph, and surface boundaries.
- .planning/research/STACK.md — Technology stack versions, compatibility matrix, and banned anti-patterns.
- .planning/phases/01-monorepo-foundation-prisma-schema-dry-business-rules/01-CONTEXT.md — Data models, integer paise convention, and pure business rules.
- .planning/phases/02-integration-partner-stubs-interactive-mocks/02-CONTEXT.md — 12 partner stubs, fault injection, and /admin/integrations health dashboard components.
- .planning/phases/03-common-nestjs-backend-business-services/03-CONTEXT.md — Backend REST API (/api/admin/v1/*), RBAC guards, and pg-boss queue handlers.
- .planning/phases/04-realistic-seed-data-backend-verification/04-CONTEXT.md — Realistic seed data conventions, role credentials (dmin@poco.care, manager@poco.care, ops@poco.care / PocoCare123!), and fixture media paths.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- @poco/database: PrismaClient models for InternalUser, UserRole, Household, Senior, CareOfficerProfile, Certification, Ticket, ServiceRequest, ServiceCatalogVersion, PackageVersion, Lead, AuditLog, HouseholdWallet, WalletTransaction, etc.
- @poco/business-rules: Canonical functions for ticket state transitions (	ransitionTicket), SLA status evaluations (evaluateSlaStatus), 3-step billing hierarchy, and certification gating (alidateCareOfficerCertifications).
- @poco/validation: Surface-scoped Zod schemas for Admin DTOs (createServiceCatalogVersionSchema, ssignCareOfficerSchema, esolveWaitingOpsSchema, etc.).
- @poco/design-tokens: Colors, typography, spacing, and status badge color definitions.
- pps/admin-portal/src/app/admin/integrations: Existing integration health grid, fault injection drawer, and payload dispatcher built during Phase 2.

### Established Patterns
- High-density administrative UX with accessible Shadcn / Radix primitives and Tailwind styling.
- Internal JWT authentication storing internalUserId and multiple oles in session cookies / auth context.
- Surface-scoped REST API consumption hitting /api/admin/v1/* with bearer token authentication.
- Integer paise arithmetic formatted cleanly to INR (₹XX.XX) in table views.

### Integration Points
- pps/admin-portal/src/app/admin: Main app router layout, sidebar navigation, and sub-route pages.
- pps/api/src/modules/*: Admin controllers (/api/admin/v1/tickets, /api/admin/v1/care-officers, /api/admin/v1/catalog, /api/admin/v1/leads, /api/admin/v1/billing, /api/admin/v1/database).

</code_context>

<specifics>
## Specific Ideas

- Tabbed multi-page queue navigation (/admin/triage, /admin/exceptions, /admin/sla-risk) with distinct filters and count badges.
- 1-click inline quick-approve on AI-suggested tickets.
- Dedicated Care Officer Roster with visual certification badges and manager bypass override checkbox.
- Simple catalog form editor with automatic version incrementing and historical dropdown.
- Dedicated /admin/billing financial dashboard for MRR, negative balance tracking, and invoices.
- Tabbed raw database table viewer for top core Prisma entities.
- Partner health dashboard tabs for pg-boss queue observability and synthetic test scenario injection.

</specifics>

<deferred>
## Deferred Ideas

- None — discussion stayed strictly within Phase 5 scope.

</deferred>

---

*Phase: 05-admin-portal-next-js*
*Context gathered: 2026-09-01*

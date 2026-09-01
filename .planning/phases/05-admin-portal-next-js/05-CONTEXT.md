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
</domain>

<decisions>
## Implementation Decisions

### 1. Operations & Ticket Triage Queues (ADMN-01, ADMN-02, TCKT-06, TCKT-07)
- **D-01:** Tabbed multi-page queue architecture: Dedicated routes (/admin/triage, /admin/exceptions, /admin/sla-risk) with standardized high-density data tables, status badge indicators, and pagination. — **Reversibility:** reversible — routing and page hierarchy structure.
- **D-02:** Modal dialog workflow actions: Individual ticket triage actions (confirming child service requests, dismissing false positives, emergency overrides, manual owner reassignment, exception resolution) execute via focused modal dialogs with clear state confirmation. — **Reversibility:** reversible — UI action interaction pattern.
- **D-03:** Live status polling: TanStack Query polling (every 5 seconds when active) to keep queue counts and SLA clocks up to date without WebSocket server overhead. — **Reversibility:** costly — client state management and backend polling load.

### 2. Care Officer Manager Assignment UI (CARE-02, CARE-03, ADMN-03)
- **D-04:** Officer-centric profile & roster view: Roster table listing all Care Officers, active household caseload count, supervising Senior Care Officer, and active/expiring certification badges. — **Reversibility:** reversible — dashboard view layout.
- **D-05:** Modal assignment with strict certification gating: Assign/reassign household action opens a modal that filters and validates officer certifications (First Aid, Geriatric Care, BLS, Police Verification), strictly disabling assignment and displaying explicit missing certification alerts if requirements are unfulfilled. — **Reversibility:** costly — business-rules integration and assignment workflow contracts.

### 3. Catalog & Package Versioning Management (CATL-01..05)
- **D-06:** In-place quick editor with immediate version bumping: Form-based rate card and quota editor that automatically increments ersionNumber, sets effectiveFrom, and retains prior versions as immutable records. — **Reversibility:** costly — catalog mutation services and grandfathered integrity guarantees.
- **D-07:** Historical version selector dropdown: Version history switcher allowing administrators to view past package/service rates and active subscription counts attached to grandfathered versions. — **Reversibility:** reversible — catalog inspection view.

### 4. Lead Pipeline & Raw DB Viewer / Diagnostics (ONBD-01..03, ADMN-04, ADMN-05)
- **D-08:** Tabular lead pipeline view: Flat table for leads showing status (New, Contacted, Onboarding Pending, Activated), assigned owner (Sales / CS), quick status dropdown transitions, and simulated WhatsApp/SMS payment reminder triggers. — **Reversibility:** reversible — lead management table.
- **D-09:** Schema-driven generic DB data grid: Generic read-only entity table viewer (/admin/database) with entity dropdown selector, column sorting, pagination, and expandable row details for inspecting raw database state across all Prisma models. — **Reversibility:** costly — admin diagnostics component architecture.

### the agent's Discretion
- Exact layout spacing, typography, and color tokens using @poco/design-tokens and Tailwind CSS.
- Integration of existing components from @poco/ui and /admin/integrations (already built in Phase 2).
- Breadcrumbs, sidebar navigation styling, and internal auth guard redirects (/admin/login).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Architecture & Requirements
- docs/poco-elder-care-design-brief.md §3, §4, §5, §6, §7 — Authoritative design brief defining dual auth, pg-boss, 3-step billing hierarchy, dual SLA tracking, 1:1 Care Officer mapping, and catalog grandfathering.
- .planning/PROJECT.md — Project context, 1GB DO droplet constraints, and active requirements.
- .planning/REQUIREMENTS.md — Formal requirements matrix (ADMN-01..05, CARE-02..03, TCKT-02, TCKT-06..07, CATL-05, INTG-05).
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
- @poco/database: PrismaClient models for InternalUser, UserRole, Household, Senior, CareOfficerProfile, Certification, Ticket, ServiceRequest, ServiceCatalogVersion, PackageVersion, Lead, AuditLog, etc.
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
- pps/api/src/modules/*: Admin controllers (/api/admin/v1/tickets, /api/admin/v1/care-officers, /api/admin/v1/catalog, /api/admin/v1/leads, /api/admin/v1/database).

</code_context>

<specifics>
## Specific Ideas

- Tabbed multi-page queue navigation (/admin/triage, /admin/exceptions, /admin/sla-risk) with distinct filters and count badges in navigation.
- Dedicated Care Officer Roster with visual certification badges and blocked assignment triggers when certifications are missing.
- In-place version bumping editor with clear indicator of grandfathered subscription protections.
- Schema-driven database table viewer with column sorting and JSON cell inspection modal for rapid operational audits.

</specifics>

<deferred>
## Deferred Ideas

- None — discussion stayed strictly within Phase 5 scope.

</deferred>

---

*Phase: 05-admin-portal-next-js*
*Context gathered: 2026-09-01*

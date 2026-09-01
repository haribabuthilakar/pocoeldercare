# Phase 05: Admin Portal (Next.js) - Research Findings

**Phase:** 05  
**Phase Slug:** `admin-portal-next-js`  
**Status:** Completed  
**Author:** GSD Phase Researcher  
**Target Output:** `.planning/phases/05-admin-portal-next-js/05-RESEARCH.md`  

---

## 1. Executive Summary & Phase Boundary

Phase 5 delivers the comprehensive **Next.js Admin Operations Portal** for Poco Elder Care. The Admin Portal is the central operational command center for Operations Executives, Care Officer Managers, Sales Leads, and System Administrators.

### Core Capabilities Delivered:
1. **High-Density Operations Queues** (`/admin/triage`, `/admin/exceptions`, `/admin/sla-risk`):
   - Direct client-side 5-second polling via TanStack Query v5 to conserve droplet RAM/CPU while ensuring real-time operational responsiveness.
   - Inline 1-click quick-approve action for AI triage suggestions, converting incoming tickets into immutable `ServiceCatalogVersion` child requests.
   - Visual parent-child request rollup reconciliation modal for `WAITING_OPS_UPDATE` tickets with conflicting or stalled child statuses.
   - Emergency ingestion queue with high-visibility emergency badge chips (wearable fall alerts and urgent calls).
2. **Care Officer Roster & Manager Assignment Studio** (`/admin/care-officers`):
   - Officer roster tracking caseloads, reporting hierarchies, and live certification status badges (`ACTIVE`, `EXPIRING_SOON`, `EXPIRED`).
   - Assignment modal with automated certification gating (e.g. BLS/CPR, Geriatric Core) preventing uncertified assignments, plus an authorized Care Officer Manager bypass with mandatory security audit logging.
   - Manual & automated Supervisor Fallback trigger escalating breached tickets to Senior Care Officers.
   - In-portal media asset viewer for KYC documents, certificates, and SOP visit photos/audio notes.
3. **Service Catalog & Package Studio** (`/admin/catalog`):
   - Rate card configuration with unit prices in integer paise (₹), emergency defaults, and package quotas.
   - Form-based version incrementing (`versionNumber++`, `effectiveFrom = now()`) preserving historical pricing and grandfathered subscriptions.
   - Historical version selector for inspecting past rates and grandfathered subscription counts.
4. **Lead Pipeline Management** (`/admin/leads`):
   - Flat tabular pipeline with inline dropdown transitions (`NEW` → `CONTACTED` → `ONBOARDING_PENDING` → `CONVERTED`).
   - Automated Sales-to-CS ownership handoff upon status change without multi-step wizard overhead.
5. **Financial Billing & Invoice Dashboard** (`/admin/billing`):
   - High-level MRR, active subscription counters, and wallet health metrics.
   - Tracking of negative wallet balances resulting from emergency auto-debits (`EMERGENCY_OVERDRAFT`).
   - Invoice viewer and download action for monthly statements.
6. **Paginated Raw Database Explorer** (`/admin/database`):
   - Tabbed administrative inspector for core Prisma models (`users`, `households`, `seniors`, `tickets`, `service_requests`, `wallets`, `wallet_transactions`, `audit_logs`, `care_officer_profiles`, `leads`).
   - Column sorting, pagination, and collapsible monospace JSON blocks for nested objects.
7. **Diagnostics & Job Queue Observability** (`/admin/integrations`):
   - Expanded 13-partner integration grid with runtime fault injection drawer.
   - pg-boss background job inspector with failed task table, 1-click retry, and bulk purge.
   - Synthetic test payload dispatcher with scenario presets (`Trigger Wearable Fall`, `Trigger Out-of-Quota Ticket`, `Trigger Expired Certification`).
8. **Omni-Role Navigation & Multi-Role Auth**:
   - Merged navigation sidebar dynamically computing permitted links across all assigned roles (`SUPER_ADMIN`, `OPS_MANAGER`, `CARE_MANAGER`, `CARE_OFFICER`, `SALES_LEAD`).
   - Role badges in top header and server-side RBAC route protection.

---

## 2. User Constraints & Phase Requirements

### Formal Requirements Matrix
| Requirement ID | Description | Phase 5 Boundary & UI / Backend Mapping |
|---|---|---|
| **ADMN-01** | Triage queue for operations executive to review and approve AI-categorized tickets into ServiceCatalogVersion child requests with default emergency flags. | `/admin/triage` with inline 1-click Quick Approve button, category selector, emergency checkbox, hitting `POST /api/admin/v1/tickets/:id/triage`. |
| **ADMN-02** | Exception queue for operations executive to resolve Waiting Ops Update tickets where child request states conflict or stall. | `/admin/exceptions` table with rollup resolution modal rendering parent-child service tree and target state selector (`PATCH /api/admin/v1/tickets/:id/resolve-ops`). |
| **ADMN-03** | Care Officer assignment interface allowing Care Officer Managers to manage reporting relationships, assign households to officers, and trigger supervisor fallback on SLA breach. | `/admin/care-officers` roster table, supervisor tree, assignment modal with certification gating, and supervisor fallback trigger (`POST /api/admin/v1/care-officers/assign`, `POST /api/admin/v1/care-officers/tickets/:id/fallback`). |
| **ADMN-04** | Lead management pipeline tracking sales-to-CS ownership transitions and payment reminders. | `/admin/leads` table with inline stage transition dropdown and CS assignment trigger. |
| **ADMN-05** | Read-only raw database table viewer for all core Prisma entities for administrative inspection and diagnostic audits. | `/admin/database` tabbed viewer for 10 core Prisma tables with server-side pagination and column sorting. |
| **CARE-02** | Officer assignment validation against required certifications for specific elder needs (e.g. BLS, dementia training), blocking uncertified assignment. | In-portal validation using pure business rule `validateCareOfficerAssignment` and API error response display. |
| **CARE-03** | Care Officer Manager supervision hierarchy allowing managers to override assignments with audit notes and review unassigned household queues. | Manager override checkbox restricted strictly to `CARE_MANAGER` / `SUPER_ADMIN` with mandatory audit rationale. |
| **TCKT-02** | AI triage auto-classification of tickets to category/urgency and auto-drafting response or service request decomposition. | AI triage confidence badges (Green >= 75%, Amber < 75%) and auto-suggested service catalog items in triage queue. |
| **TCKT-06** | Emergency override flag enabling bypass of standard triage with immediate priority routing and concurrent notification dispatch. | Silent emergency checkbox (`isEmergency: true`), red alert badges, and priority sorting. |
| **TCKT-07** | Parent-child request lifecycle rollup keeping parent ticket in Waiting Ops Update until all child requests reach terminal state. | Tree visualization in exception modal using `calculateTicketRollupStatus` logic. |
| **CATL-05** | Grandfathered rate cards preserving original subscription pricing while new subscribers pay current active catalog pricing. | Version bumping form (`POST /api/admin/v1/catalog/services/:id/versions`) and historical version selector. |
| **INTG-05** | Diagnostic dashboard for integration health, failure simulation controls, outbound API audit logs, and test payload dispatch. | `/admin/integrations` tabbed view with partner grid, fault injection drawer, pg-boss job inspector, and synthetic scenario presets. |
| **BILL-01..07**| Household wallet balances, 3-step billing hierarchy, negative balances from emergency auto-debit, and invoice downloads. | `/admin/billing` financial overview, negative balance accounts table, and invoice downloader. |
| **TEST-04** | Automated integration test harness validating end-to-end flows against in-process stubs with zero external network dependencies. | Vitest / Playwright test suites covering full administrative operations. |

---

## 3. Standard Stack & Package Legitimacy Audit

### Package Audit & Compatibility Matrix
| Package / Dependency | Permitted Version | Purpose | Legitimacy & Verification Status |
|---|---|---|---|
| `next` | `^15.1.4` (or `^15.0.0`) | App Router, Server Actions, Route Handlers, SSR/SSG | ✅ Verified. Modern Next.js 15 App Router architecture. |
| `react` / `react-dom` | `^19.0.0` | Frontend UI runtime | ✅ Verified in monorepo root. Matches Next.js 15. |
| `@tanstack/react-query` | `^5.62.0` | Client-side 5s polling, query caching, mutation states | ✅ Verified. Industry standard for real-time polling without WebSocket memory footprint. |
| `lucide-react` | `^0.468.0` | Icons for operations, badges, tables, and actions | ✅ Verified in `packages/ui` and `apps/admin-portal`. |
| `@radix-ui/react-*` | `^1.1.0` | Headless accessible primitives wrapped in `@poco/ui` | ✅ Verified in `@poco/ui` (Dialog, Dropdown, Avatar, etc.). |
| `zod` | `^3.24.1` | DTO validation for forms, search params, and server actions | ✅ Verified in `@poco/validation`. |
| `clsx` / `tailwind-merge` | `^2.1.1` | Dynamic className utilities | ✅ Verified via `@poco/ui/src/lib/utils.ts`. |
| `@poco/ui` | `workspace:*` | Shared component library (DataTable, Badge, Card, Dialog, etc.) | ✅ Verified (11 core components + simulators + icons). |
| `@poco/business-rules` | `workspace:*` | Pure business rules for triage, SLA, rollup, and certification | ✅ Verified in monorepo. |
| `@poco/database` | `workspace:*` | PrismaClient and schema definitions | ✅ Verified in monorepo. |
| `@poco/design-tokens` | `workspace:*` | Colors, typography, spacing tokens | ✅ Verified in monorepo. |
| `@poco/constants` | `workspace:*` | Enums, statuses, roles, capabilities | ✅ Verified in monorepo. |

---

## 4. Architectural Responsibility Map

```
┌──────────────────────────────────────────────────────────────────────────┐
│                   NEXT.JS 15 ADMIN PORTAL (apps/admin-portal)           │
│                                                                          │
│  ┌─────────────────────────────────┐   ┌──────────────────────────────┐  │
│  │   Server Components (RSC)       │   │  Client Components ('use...') │  │
│  │   - Omni-Role Shell Layout      │   │  - TanStack 5s Poll Tables   │  │
│  │   - Initial Session Validation  │   │  - Inline Action Buttons     │  │
│  │   - Page Metadata & Headers     │   │  - Dialog Modals & Drawers   │  │
│  └────────────────┬────────────────┘   └──────────────┬───────────────┘  │
│                   │                                   │                  │
│                   ▼                                   ▼                  │
│  ┌──────────────────────────────────────────────────────────────────┐    │
│  │   Admin API Client & Server Actions (Next.js Route Handlers)     │    │
│  │   - Cookie-based Bearer Token Injection                          │    │
│  │   - Zod Payload Validation                                       │    │
│  │   - Direct Prisma Queries for /admin/database (Fast read-only)   │    │
│  └────────────────────────────────┬─────────────────────────────────┘    │
└───────────────────────────────────┼──────────────────────────────────────┘
                                    │ HTTP / Bearer Auth
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                      NESTJS REST API (apps/api)                          │
│                                                                          │
│  - /api/admin/v1/tickets        (Triage, Resolve Ops, Rollup, Details)   │
│  - /api/admin/v1/care-officers  (Supervised Roster, Assign, Fallback)    │
│  - /api/admin/v1/catalog        (Version Publishing, Grandfathering)     │
│  - /api/admin/v1/leads          (Pipeline, Stage Transition, CS Handoff) │
│  - /api/admin/v1/billing        (Ledger, Wallets, Overdrafts, Invoices)  │
│  - /api/admin/v1/integrations   (Health, Fault Injections, pg-boss jobs) │
│  - /api/webhooks/v1/*           (Synthetic Webhook Ingestion)            │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 5. In-Depth Domain Architecture Patterns

### Pattern 1: High-Density Operations Queues (`/admin/triage`, `/admin/exceptions`, `/admin/sla-risk`)
- **Direct 5-Second Polling:**
  TanStack Query `useQuery` configured with `refetchInterval: 5000`, `refetchOnWindowFocus: true`, and manual refresh button.
  ```typescript
  const { data: tickets, isLoading, refetch } = useQuery({
    queryKey: ['admin-tickets', { status, slaStatus, triageStatus }],
    queryFn: () => fetchAdminTickets({ status, slaStatus, triageStatus }),
    refetchInterval: 5000,
    staleTime: 4000,
  });
  ```
- **Inline 1-Click Quick Approve (AI Triage):**
  For tickets with `triageStatus: 'PENDING_TRIAGE'`, if AI suggested service exists:
  - Button directly on table row: `"Quick Approve"`.
  - Mutation calls `POST /api/admin/v1/tickets/:id/triage` with `items: [{ serviceCatalogVersionId: defaultVersionId }]`.
  - Optimistic UI updates badge to `CONFIRMED` immediately.
  - Secondary `"Edit"` button opens Dialog for multi-service decomposition or category changes.
- **Rollup Exception Resolution Modal:**
  For `WAITING_OPS_UPDATE` tickets (where child service requests have exceptions or conflict):
  - Dialog renders parent ticket header + hierarchical tree of child requests with conflict badges (`amber` for `EXCEPTION`, `red` for `CANCELLED`, `green` for `COMPLETED`).
  - Ops Executive selects target action: `RESUME_IN_PROGRESS`, `RESOLVE`, or `CANCEL`.
  - Mandatory resolution note textarea validated via Zod.
  - Calls `PATCH /api/admin/v1/tickets/:id/resolve-ops`.

### Pattern 2: Care Officer Roster & Manager Assignment Studio (`/admin/care-officers`)
- **Roster & Caseload View:**
  - Standard `DataTable` listing: Officer Name, Email/Phone, Availability Switch, Cluster Code, Assigned Household (1:1), Active Tickets Count, Supervisor Name.
  - Live Certification Badges: `ACTIVE` (green), `EXPIRING_SOON` (amber, <30 days), `EXPIRED` (red).
- **Assignment Modal & Certification Gating:**
  - Modal lists available Care Officers with candidate profile verification.
  - Evaluates `validateCareOfficerAssignment(callerRoles, household, candidateOfficer, requiredCertCodes)`.
  - If certifications missing/expired: Submit button disabled (`"Officer Ineligible"`), red alert box lists missing cert codes (e.g. `BLS_CPR`).
  - **Manager Override Audit:** If caller possesses `CARE_MANAGER` or `SUPER_ADMIN` role:
    - Checkbox: `"Manager Override (Exceptional Temporary Assignment)"`.
    - Unlocks submit button.
    - Prompts mandatory override reason text.
    - Writes immutable `AuditLog` entry with `{ actorType: 'INTERNAL_USER', actorId, action: 'CARE_OFFICER_ASSIGNMENT_OVERRIDE', beforeState, afterState: { householdId, officerId, overrideReason } }`.
- **Supervisor Fallback Trigger:**
  - In ticket detail or roster view, 1-click `"Escalate to Supervisor"` triggers `POST /api/admin/v1/care-officers/tickets/:id/fallback`, reassigning to senior manager in `CareOfficerReportingLine`.

### Pattern 3: Service Catalog & Package Studio (`/admin/catalog`)
- **Immutable Version Bumping:**
  - Form allows editing: Base Price (entered in ₹, converted to integer paise `pricePaise = priceRupees * 100`), Estimated Duration (minutes), Required Certifications (multi-select), SOP Steps (ordered list with proof types: `PHOTO`, `CHOICE`, `TEXT`, `NONE`).
  - Clicking `"Publish New Catalog Version"` calls `POST /api/admin/v1/catalog/services/:id/versions`.
  - Automatically sets `version = previousVersion + 1`, `effectiveFrom = new Date()`, `effectiveTo = null`, leaving past version records intact.
- **Grandfathered Rate Inspection:**
  - Historical version dropdown allows viewing active subscriptions pinned to legacy `PackageVersion` / `ServiceCatalogVersion` IDs.
  - Displays count of active households currently grandfathered on that historical rate.

### Pattern 4: Lead Pipeline Manager (`/admin/leads`)
- **Inline Stage Transition:**
  - Pipeline table displays lead contact name, phone, city, notes, and current stage badge.
  - Interactive stage dropdown directly in table row (`NEW` → `CONTACTED` → `VISIT_SCHEDULED` → `CONVERTED` → `LOST`).
  - Transitioning to `CONVERTED` / `ONBOARDING_PENDING` automatically shifts ownership to Customer Success and prompts Household Creation link.
  - Quick action: `"Send Payment Reminder"` logs audit trail and dispatches SMS/WhatsApp notification via partner stubs.

### Pattern 5: Financial Billing & Invoice Dashboard (`/admin/billing`)
- **Financial KPI Cards:**
  - Total MRR (Monthly Recurring Revenue in ₹), Total Household Wallets, Total Active Subscriptions, Total Overdraft Debt.
- **Negative Balance & Overdraft Table:**
  - Filtered table highlighting households with `balancePaise < 0` (resulting from emergency auto-debits / `EMERGENCY_OVERDRAFT`).
  - Displays: Household Name, Current Negative Balance (₹), Last Emergency Ticket ID, Date of Overdraft.
  - Action button: `"Send Low Balance Alert"`.
- **Invoice Inspection & Download:**
  - Ledger transaction list with `QUOTA_DEBIT`, `WALLET_DEBIT`, `WALLET_CREDIT`, `HOLD_CREATE`, `HOLD_RELEASE`, `EMERGENCY_OVERDRAFT`, `REFUND`.
  - Action `"Download Monthly Invoice"` renders printable HTML/PDF invoice summary with breakdown of quota vs wallet charges.

### Pattern 6: Paginated Raw Database Explorer (`/admin/database`)
- **Tabbed Model Selector:**
  Horizontal tab bar:
  1. `Users` (`InternalUser`, `Person`)
  2. `Households` (`Household`, `HouseholdMembership`, `Senior`)
  3. `Tickets` (`Ticket`, `ServiceRequest`)
  4. `Billing` (`HouseholdWallet`, `WalletTransaction`, `HouseholdSubscription`)
  5. `Care Officers` (`CareOfficerProfile`, `CareOfficerCertification`)
  6. `Leads` (`Lead`, `OnboardingVisit`)
  7. `Audit Logs` (`AuditLog`)
  8. `Partner Calls` (`OutboundIntegrationCall`, `WebhookEvent`)
- **Capabilities:**
  - Server-side pagination (25 / 50 / 100 rows per page).
  - Search by primary key ID or phone/name.
  - Collapsible monospace JSON viewer for complex fields (`metadata`, `mockSettings`, `chronicConditions`, `beforeState`, `afterState`) with copy button.

### Pattern 7: Diagnostics & Background Job Inspector (`/admin/integrations`)
- **Partner Health & Fault Injection (Phase 2 integration):**
  - 13-partner grid with status chips (`ACTIVE`, `MOCK_ONLY`, `DEGRADED`, `DOWN`).
  - Slide-out drawer for adjusting latency (0-3000ms), failure rate (0-100%), and error status codes.
- **pg-boss Background Job Inspector Tab:**
  - Queue metric cards: Active Jobs, Completed (24h), Failed Jobs.
  - Failed job table: Job Name (e.g. `sla-transition-checker`, `wearable-ping-scanner`), Job ID, Error Stack, Retry Count, Failed At.
  - Action buttons: `"Retry Failed Job"` and `"Purge Failed Jobs"`.
- **Synthetic Webhook Test Dispatcher Tab:**
  - Scenario Presets:
    - `"Trigger Wearable Fall Alert"` -> dispatches to `/api/webhooks/v1/wearable` with high acceleration + heart spike.
    - `"Trigger Out-of-Quota Emergency Service"` -> dispatches ticket with `isEmergency: true` on 0-quota household.
    - `"Trigger Expired BLS Certification"` -> forces officer certificate expiry to test assignment blocking.
  - Live HTTP status code and response payload preview.

### Pattern 8: Omni-Role Navigation Layout & Auth State
- **Multi-Role Session Model:**
  Internal staff session decoded from JWT cookie containing:
  ```typescript
  interface InternalSession {
    sub: string;
    email: string;
    name: string;
    roles: UserRole[]; // e.g. ['CARE_OFFICER', 'CARE_MANAGER', 'OPS_MANAGER']
  }
  ```
- **Unified Omni-Navigation Sidebar:**
  - Computes union of allowed navigation routes based on all assigned roles.
  - Role chips displayed in top bar: `[Care Officer Manager] [Operations Manager]`.
  - Zero context switching needed; all authorized tools accessible in single interface.

---

## 6. Validation Architecture & Test Map

### 1. Pure Unit Tests (`packages/business-rules`, `@poco/validation`)
- Certification validator tests (`test/assignments.spec.ts`):
  - Validates blocking uncertified officers.
  - Validates 1:1 household mapping invariant.
  - Validates manager override capability.
- Ticket Rollup & SLA tests (`test/state-machine.spec.ts`, `test/sla.spec.ts`):
  - Rollup calculation across multiple child request states.
  - SLA at-risk calculation at 75% elapsed duration.

### 2. Component & Hook Tests (`apps/admin-portal`)
- `DataTable` compact rendering with 36px density.
- Quick Approve mutation trigger and optimistic state update.
- Certification warning banner and Manager Override checkbox toggle.
- Rollup resolution modal form validation.

### 3. API & E2E Integration Tests (`apps/api`, Playwright)
- Full triage workflow: `ActivityFeedItem` -> AI Triage -> `Ticket` -> `POST /api/admin/v1/tickets/:id/triage` -> `ServiceRequest` creation.
- Assignment workflow: Care Officer roster -> missing certification block -> Manager Override with audit log verification.
- Grandfathered billing workflow: Version publishing -> subscription retention on v1 while new purchases execute on v2.

---

## 7. ASVS Security Threat Modeling & Defense In Depth

| Threat ID | Threat Category | Attack Vector / Scenario | Architectural Defense & Mitigation |
|---|---|---|---|
| **SEC-01** | Privilege Escalation | Sales Lead or Care Officer attempts to access `/admin/triage` or `/admin/catalog` version publishing endpoints. | Strict server-side `@UseGuards(JwtAuthGuard, RolesGuard)` with `@Roles(UserRole.OPS_MANAGER, UserRole.SUPER_ADMIN)`. Client sidebar filters links; API independently rejects unauthorized JWTs with `403 Forbidden`. |
| **SEC-02** | Unauthorized Manager Override | Field officer attempts to assign uncertified peer by forging `managerOverride: true` in payload. | Backend `CareOfficersService.assignCareOfficer` verifies caller possesses `CARE_MANAGER` or `SUPER_ADMIN` before permitting override; writes mandatory `AuditLog` entry. |
| **SEC-03** | Rate Card Tampering / Price Corruption | Malicious or buggy client submits negative price or floating point rupee values. | Zod schema `createServiceCatalogVersionSchema` enforces `pricePaise: z.number().int().min(0)`. All financial math executed in integer paise. |
| **SEC-04** | PII / Medical Data Leakage in Raw DB Viewer | Admin queries `/admin/database` and exposes sensitive unmasked Aadhaar or payment card numbers. | Outbound call logging and database serializer sanitize/mask sensitive PII (Aadhaar 12-digit masking, card number masking) before sending to client. |
| **SEC-05** | CSRF / Session Hijacking | Cross-site request attempting administrative actions. | `SameSite=Strict`, `HttpOnly` session cookies combined with Authorization Bearer header tokens and CORS lockdown. |

---

## 8. Recommended Implementation Waves for Planner

To ensure modular, testable execution, Phase 5 should be organized into **4 structured plans**:

1. **Plan 01: Core Layout, Omni-Role Shell, and Operations Queues**
   - Setup Next.js 15 App Router shell, auth guard context, and omni-role merged sidebar.
   - Implement high-density Operations Queues (`/admin/triage`, `/admin/exceptions`, `/admin/sla-risk`) with 5s TanStack Query polling, inline 1-click Quick Approve, and Exception Rollup Modal.
2. **Plan 02: Care Officer Roster & Service Catalog Studio**
   - Implement Care Officer Roster & Caseload view (`/admin/care-officers`) with certification badges, assignment modal with certification gating, manager override audit logging, and supervisor fallback.
   - Implement Service Catalog & Package Versioning Studio (`/admin/catalog`) with integer paise rate cards, version incrementing, and grandfathered rate inspection.
3. **Plan 03: Lead Pipeline, Financial Billing, and Raw Database Explorer**
   - Implement Lead Management Pipeline (`/admin/leads`) with inline stage transitions and Sales-to-CS handoff.
   - Implement Financial Billing Dashboard (`/admin/billing`) with MRR cards, negative balance tracking, ledger viewer, and invoice download.
   - Implement Tabbed Raw Database Explorer (`/admin/database`) with server-side pagination, column sorting, and JSON viewer.
4. **Plan 04: Diagnostics Expansion, Synthetic Dispatcher, and Verification Test Suite**
   - Expand Integration Health Dashboard (`/admin/integrations`) with pg-boss background job inspector (failed task retry/purge) and synthetic scenario preset runner.
   - Comprehensive Vitest and Playwright test suite validating all 8 administrative workflows.

---

## RESEARCH COMPLETE

# Phase 01: Monorepo Foundation, Prisma Schema & DRY Business Rules - Context

**Gathered:** 2026-08-31
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 1 establishes the foundational monorepo infrastructure, complete PostgreSQL Prisma schema, and DRY business logic packages for Poco Elder Care:
- Turborepo + pnpm workspace containing shared packages (`@poco/database`, `@poco/types`, `@poco/validation`, `@poco/business-rules`, `@poco/constants`, `@poco/design-tokens`, `@poco/ui`, `@poco/tsconfig`, `@poco/eslint-config`).
- Comprehensive PostgreSQL Prisma schema across all core domains (Two-root Auth/Identity, Households & Seniors, 1:1 Care Officer Assignments, Reporting Lines, Versioned Packages, Versioned Catalogs/SOPs, Wallets & Transactions, Tickets & Service Requests, Dual SLA tracking, Activity Feed, Certifications, and Integration Partners).
- Pure TypeScript business rules package (`@poco/business-rules`) containing the uniform ticket/service request state machine, deterministic 3-step billing hierarchy engine, dual SLA transition calculator, and Care Officer assignment validation.
- Complete Docker Compose development environment for Windows with hot-reload and baseline 1GB DigitalOcean production configuration.

</domain>

<decisions>
## Implementation Decisions

### 1. Monorepo Package Structure & Build Tooling
- **D-01:** `tsup` for shared package bundling — Fast esbuild-based compilation with dual ESM/CJS outputs, source maps, and `.d.ts` generation, enabling seamless consumption across NestJS (CJS), Next.js (ESM), and React Native (Expo). — **Reversibility:** costly — changing build tools across all packages requires updating package.json scripts and tsconfig paths.
- **D-02:** Dedicated `@poco/database` package (`packages/database`) housing `prisma/schema/*.prisma`, migrations, seed runners, and re-exporting the typed `PrismaClient` singleton across the monorepo. — **Reversibility:** costly — imports of Prisma client touch all backend services.
- **D-03:** Shared tooling workspace packages (`@poco/tsconfig`, `@poco/eslint-config`) providing base presets for Node, React, and NestJS with strict TypeScript 5.7+ compiler flags.
- **D-04:** Strict package `exports` maps with `tsup --watch` in dev mode for live cross-package hot-reloading during `turbo dev`.
- **D-05:** UI package partitioning: `@poco/design-tokens` provides pure design tokens and Tailwind theme presets; `@poco/ui` provides shared web component primitives (Shadcn/Radix for Next.js portals); mobile components remain in `apps/field-app`.
- **D-06:** Synchronized dependency versions using pnpm workspace catalog (`React 19`, `Prisma 6`, `TypeScript 5.7+`, `Zod 3.24+`).
- **D-07:** Package-level Vitest configs (`packages/*/vitest.config.ts`) extending a shared preset, orchestrated in parallel via `turbo test`.
- **D-08:** Developer workflow and local development orchestrated with Docker Compose.
- **D-09:** Full multi-service Docker Compose configuration (Postgres 16, NestJS backend, Next.js Family & Admin portals, and Adminer DB GUI).
- **D-10:** Husky + lint-staged + Commitlint enforcing conventional commit messages (`feat:`, `fix:`, `docs:`), formatting, and linting.
- **D-11:** Distinct package boundaries: `@poco/constants` (frozen values, SLA defaults, route strings), `@poco/types` (interfaces/types), `@poco/business-rules` (executable logic & calculators).
- **D-12:** `turbo.json` task dependency pipeline with `dependsOn: ["^db:generate"]` ensuring Prisma Client is built before dependent packages compile.
- **D-13:** Strict runtime engine enforcement (`.nvmrc` v22, `.npmrc` `engine-strict=true`, `package.json` `engines`).
- **D-14:** Unified `@poco/*` npm package scope across all internal packages.
- **D-15:** Standard Expo Metro configuration in `apps/field-app/metro.config.js` with `watchFolders` resolving `@poco/*` symlinks.
- **D-16:** ESLint boundary rules (`import/no-restricted-paths`) in `@poco/eslint-config` strictly forbidding cross-app imports and backend-to-UI dependencies.
- **D-17:** In-app UI showcase / dev preview pages inside Admin and Family portals (no extra Storybook build overhead).
- **D-18:** Synchronized `0.0.0` versioning with `workspace:*` references across internal packages.
- **D-19:** Lightweight logger types in `@poco/types` and structured `DomainError` classes in `@poco/business-rules`; concrete logging configured in runtime apps.
- **D-20:** `tsup` configured with `sourcemap: true`, `dts: true`, `clean: true`, and dual ESM/CJS output.

### 2. Prisma Schema Architecture & ID/Money Conventions
- **D-21:** Modular Prisma schema using Prisma 6 `prismaSchemaFolder` (`packages/database/prisma/schema/*.prisma`: `auth.prisma`, `household.prisma`, `ticket.prisma`, `billing.prisma`, `catalog.prisma`, `partner.prisma`, etc.). — **Reversibility:** costly — reorganizing schema files requires updating Prisma CLI configs.
- **D-22:** UUID string primary keys (`@id @default(uuid())`) across all database models, guaranteeing full compatibility with WatermelonDB offline client UUIDs, S3 keys, and REST APIs. — **Reversibility:** one-way — database schema PK type changes require full data migration.
- **D-23:** Financial amounts represented strictly as Integer in Paise (`1 INR = 100 paise`), eliminating floating-point rounding bugs and matching Razorpay API payloads directly. — **Reversibility:** one-way — currency integer representation defines database column types and calculation contracts.
- **D-24:** UTC `DateTime` timestamps with soft-deletes (`deletedAt DateTime?`) on core entities, formatted to Indian Standard Time (IST) at application/UI layers.
- **D-25:** Immutable Version Tables (`PackageVersion`, `ServiceCatalogVersion`, `SopStepVersion`) where subscriptions and service requests store exact version foreign keys, permanently grandfathering existing terms and pricing. — **Reversibility:** one-way — schema design for immutable version relations.
- **D-26:** Direct 1:1 unique foreign key constraint (`Household.assignedCareOfficerId @unique`) + `CareOfficerProfile` self-relation (`managerId`) for reporting lines. — **Reversibility:** one-way — database constraint enforcing 1:1 business invariant.
- **D-27:** Native PostgreSQL Enums (`enum TicketStatus`, `enum SlaStatus`, `enum UserRole`, `enum BillingTransactionType`, etc.) with generated TypeScript enum types.
- **D-28:** Explicit Composite B-Tree indexes: `@@index([householdId, createdAt(sort: Desc)])` on ActivityFeed, `@@index([slaStatus, responseDueAt])` on Tickets, `@@index([assignedCareOfficerId, status])` on field tasks.
- **D-29:** Strict Two-Root Auth Schema: `Person` + `HouseholdMembership` for external families/seniors; `InternalUser` + `InternalUserRole` for internal staff (Super Admin, Ops, Manager, Care Officer, Sales). — **Reversibility:** one-way — auth separation prevents table merging and secures boundary.
- **D-30:** Immutable Transaction Ledger (`HouseholdWallet` + `WalletTransaction` with `balanceAfterPaise` and reference FKs) ensuring complete financial auditability.
- **D-31:** Structured Certification & Join Table (`Certification` + `CareOfficerCertification` + `requiredCertifications` on Service/Package) enabling programmatic assignment gating.
- **D-32:** Unified `IntegrationPartner` table (`partnerCode` enum, `status: ACTIVE | DEGRADED | DOWN | MOCK_ONLY`, `mockSettings` Json, `lastPingAt`) for central health and stub management.
- **D-33:** Unified `ActivityFeedItem` model for chat messages, system events, vitals, visit reports, with `aiTriageStatus` and `linkedTicketId`.
- **D-34:** 1-to-Many relational hierarchy (`Ticket` -> `ServiceRequest[]`) where Ticket tracks overall incident SLA and priority, and child ServiceRequests track individual SOP progress and unit costs.
- **D-35:** Dedicated `SeniorMedicalProfile` relation separating clinical baseline (blood group, allergies, chronic conditions, ABHA ID, ICE contacts, Pococare sync) from basic demographics.
- **D-36:** Relational `FamilyEscalationTier` model (`tierOrder`, `personId`, `contactMethods`, `delayMinutes`) enabling configurable multi-tier family escalation.
- **D-37:** Distinct `Lead` and `OnboardingVisit` models tracking the sales funnel and Care Officer in-person visit activation.
- **D-38:** Relational `QuotaAllocation` records per subscription billing cycle (`serviceCatalogVersionId`, `allocatedUnits`, `usedUnits`, `billingPeriodStart/End`).
- **D-39:** Narrow `SeniorVitalReading` model (`seniorId`, `vitalType`, `numericValue`, `unit`, `recordedAt`, `source`) indexed for fast wellness charting.
- **D-40:** `CareOfficerVisitLog` model with GPS check-in/out coordinates, distance calculation, and `isGeofenceVerified` flag.
- **D-41:** `WebhookEvent` table (`source`, `idempotencyKey @unique`, `payload Json`, `status`, `errorMessage`) preventing duplicate processing.
- **D-42:** Central `MediaAttachment` model (`s3Key`, `mimeType`, `fileSize`, `entityType`, `entityId`, `uploaderId`) for presigned S3 uploads.
- **D-43:** Centralized `AuditLog` model (`actorType`, `actorId`, `action`, `entityType`, `entityId`, `beforeState/afterState` diff Json) for ops compliance.
- **D-44:** Key-value `SystemConfig` model cached with in-process LRU cache for dynamic runtime settings.
- **D-45:** Strict `Restrict`/`NoAction` onDelete referential integrity on financial and operational records; `Cascade` strictly limited to ephemeral progress/joins.
- **D-46:** Standard `public` schema in PostgreSQL for application models + `pgboss` schema for background job queues.
- **D-47:** Typed `PrismaClient` singleton with soft-delete extensions and connection pooling configured in `@poco/database`.
- **D-48:** Standard `prisma migrate` with `tsx src/seed.ts` script in `@poco/database`.

### 3. Business Rules & State Machine API Contracts
- **D-49:** Pure functional state transitions (`transitionTicket(currentState, event, ctx): TransitionResult`) in `@poco/business-rules` returning next state, side-effects, and validation status with 100% deterministic testability.
- **D-50:** Pure Billing Decision Evaluator (`evaluateBillingAction(context): BillingDecision`) implementing the 3-step billing hierarchy (`AUTO_DEBIT_QUOTA`, `AUTO_DEBIT_WALLET`, `REQUIRE_FAMILY_APPROVAL`, `EMERGENCY_NEGATIVE_DEBIT`).
- **D-51:** Pure SLA Calculators (`calculateSlaDeadlines`, `evaluateSlaStatus`) with 75% At-Risk threshold and automated Senior Care Officer fallback escalation trigger upon breach.
- **D-52:** Pure Care Officer Assignment Validator (`validateCareOfficerAssignment`) strictly enforcing Manager caller role, 1:1 exclusivity, and unexpired certification matching.
- **D-53:** Deterministic Status Rollup Calculator (`calculateTicketRollupStatus`) auto-computing parent ticket status (e.g., any child exception -> `WAITING_OPS_UPDATE`; all done -> `COMPLETED`).
- **D-54:** Tagged Union Result Pattern (`Result<T, E> = { success: true, data: T } | { success: false, error: DomainError }`) across all business rule functions.
- **D-55:** Dedicated Financial Math Module (`calculateGst`, `calculateWalletDebit`, `formatInr`) using exact integer paise arithmetic with zero float imprecision.
- **D-56:** AI Triage Decision Rule function (`evaluateAiClassificationResult`) evaluating 0.75 confidence threshold for auto-proposing `Pending Triage` tickets.
- **D-57:** Strict "Use-It-or-Lose-It" subscription cycle reset rule (`evaluateSubscriptionRollover`) where unused quotas reset to package baseline each period.
- **D-58:** Pure Haversine formula functions (`calculateDistanceMeters`, `validateGeofence` with default 200m radius) with zero external library dependencies.
- **D-59:** Pure Family Escalation Evaluator (`evaluateFamilyEscalation`) calculating active tier and notification recipients based on elapsed minutes.
- **D-60:** Pure SOP Progress Validator (`validateSopProgress`) verifying required checklist steps, photo proofs, and choice selections.
- **D-61:** Deterministic Vital Severity Evaluator (`evaluateVitalReadingSeverity`) checking clinical threshold boundaries (BP, SpO2, pulse, glucose, fall alerts) and emergency ticket triggers.
- **D-62:** Pure Lead Conversion Validator (`validateLeadConversion`) checking sales prerequisites, initial package, and primary family contact.
- **D-63:** Grandfathered Price Resolver (`resolveServicePricing`) looking up immutable version rates & quota allowances based on subscription creation date.
- **D-64:** State Transition Guards returning typed domain errors (`CANNOT_COMPLETE_UNVERIFIED_GEOFENCE`, `CANNOT_CLOSE_OPEN_CHILDREN`).
- **D-65:** Centralized Role Capability Matrix (`hasCapability(roles, capability)`) in `@poco/business-rules` mapping multi-roles to domain capabilities.
- **D-66:** Care Officer Reassignment Rule Evaluator (`evaluateCareOfficerReassignment`) validating Manager role, checking new officer certifications, and re-routing active tickets.
- **D-67:** Wallet Hold & Settlement Calculators (`calculateWalletHold`, `calculateHoldSettlement`) calculating hold pre-authorizations and exact debit vs refund settlements.
- **D-68:** Dedicated Indian Format Validators (`validateIndianPhoneNumber`, `validateAbhaId`, `validatePinCode`) matching national formatting standards.

### 4. Zod Validation & Type Derivation Strategy
- **D-69:** Hand-crafted Zod 3.24+ schemas in `@poco/validation` tailored for REST endpoints and React Hook Form with inferred TypeScript DTO types via `z.infer`.
- **D-70:** Three-layer type architecture: (1) `@poco/database` (Prisma models), (2) `@poco/validation` (inferred DTOs), (3) `@poco/types` (domain contracts, JWTs, API responses).
- **D-71:** Lightweight `ZodValidationPipe` in NestJS applying `@poco/validation` schemas declaratively in controllers (`@UsePipes(new ZodValidationPipe(schema))`).
- **D-72:** Zod schemas converted to JSON Schema via `zod-to-json-schema` for Anthropic Claude SDK structured tool output contracts.
- **D-73:** Surface-namespaced module organization in `@poco/validation`: `src/family/*`, `src/field/*`, `src/admin/*`, `src/webhooks/*`, `src/auth/*`, and `src/common/*`.
- **D-74:** Reusable Pagination & Filter Schemas (`paginationQuerySchema`, `dateRangeSchema`) with strict limit caps (default 20, max 100).
- **D-75:** Normalized Error Transformer (`formatZodError`) returning structured field-level error arrays (`{ field, message, code }`).
- **D-76:** Strict Partner Webhook Schemas in `src/webhooks/*` (`razorpayWebhookSchema`, `exotelWebhookSchema`, `wearableAlertSchema`, `pococareSyncSchema`).
- **D-77:** Discriminated Union Schemas (`createRoutineTicketSchema | createEmergencyTicketSchema`) via `z.discriminatedUnion('category', ...)`.
- **D-78:** Strict integer paise currency bounds in wallet validation schemas (min 10,000 paise = ₹100, max 10,000,000 paise = ₹1,00,000).
- **D-79:** `dateRangeSchema` with `.refine(endDate >= startDate)` pointing validation errors directly to the `endDate` field path.
- **D-80:** Discriminated Union Vital Schemas with clinical bounds (BP systolic > diastolic, SpO2 50-100%, Glucose 20-600 mg/dL).

### 5. Design Tokens & Tailwind Preset Architecture
- **D-81:** Semantic Design Tokens with CSS Variables exported as a Tailwind preset plugin (`pocoPreset` in `@poco/design-tokens/tailwind`).
- **D-82:** Brand color palette anchored by `#12C395` (vibrant mint/emerald primary), `#FE1D8F` (vibrant rose/magenta accent/alert), and `#6BAAD0` (soft cerulean blue secondary/info).
- **D-83:** Senior-friendly typography scale (18px base font size for Family/Senior views, 14px for Admin ops tables) with WCAG AAA high-contrast color pairings.
- **D-84:** Shared Tailwind Preset imported via `presets: [require('@poco/design-tokens/tailwind')]` in Next.js portal apps.
- **D-85:** Semantic keyframe animations (`pulse-subtle` for at-risk tickets, `fade-in-warm` for activity feeds, smooth accordion transitions).
- **D-86:** Dual density token presets: `density: 'comfortable'` (>= 48px touch targets for Family/Senior) and `density: 'compact'` (for Admin ops data tables).
- **D-87:** Semantic Status Color Maps (`slaStatusTokens`, `ticketStatusTokens`, `triageStatusTokens`) mapping statuses to styling.
- **D-88:** Class/data-theme dark mode with CSS variables in Tailwind preset (defaulting to warm calming light theme).
- **D-89:** Curated Lucide Icon wrappers in `@poco/ui` (1.75px stroke width, consistent sizing presets, accessible labels).
- **D-90:** Surface-aware border radius and shadows: soft `rounded-2xl` with ambient shadows for Family/Senior; crisp `rounded-lg` with subtle borders for Admin tables.
- **D-91:** CVA component variants in `@poco/ui` (Primary `#12C395`, Accent `#FE1D8F`, Info/Secondary `#6BAAD0`) with focus rings and loading states.
- **D-92:** Sonner Toast System themed with brand tokens (`#12C395` success, `#FE1D8F` alert, `#6BAAD0` info).
- **D-93:** Semantic Chart Palette (`vitals.bpSystolic #FE1D8F`, `vitals.bpDiastolic #6BAAD0`, `vitals.pulse #12C395`, quota progress tokens) for Recharts & SVG charts.
- **D-94:** `data-contrast="high"` senior readability overrides (2px solid borders, bold weights, 10:1+ contrast ratios).
- **D-95:** Dual exports from `@poco/design-tokens`: `pocoPreset` for Tailwind web + pure JS token objects (colors, spacing, typography) for React Native mobile.
- **D-96:** Dedicated `IceBadge` & `EmergencyAlertCard` components in `@poco/ui` with `#FE1D8F` accents and clinical callouts.
- **D-97:** Activity Feed bubble variants: Family `#12C395`, Officer `#6BAAD0`, System slate, Emergency `#FE1D8F`, AI triage pill.
- **D-98:** High-Density `DataTable` in `@poco/ui` (compact 8px padding, sticky header, row hover tint, monospace IDs, SLA badge cells).
- **D-99:** Responsive `Modal`/`Sheet` component: Centered Dialog on desktop (`>= 768px`), Bottom Slide-Up Sheet on mobile (`< 768px`).
- **D-100:** Standardized 2px `#12C395` keyboard focus rings (`focus-visible:ring-2`) + Radix ARIA accessibility primitives.
- **D-101:** Warm Shimmer Skeletons (`SkeletonCard`, `SkeletonVitalsChart`, `SkeletonFeedItem`) with gentle pulse animations.
- **D-102:** Form Field error states with `#FE1D8F` border, error shake animation, and accessible error text with `IconAlertCircle`.
- **D-103:** Built-in `isLoading` prop on `Button` (shows centered spinner, disables clicks, sets `aria-busy="true"`).
- **D-104:** Radix `DropdownMenu` with `rounded-xl`, scale-in animation, icon slots, and subtle `#12C395` focus highlight.
- **D-105:** CVA `Card` variants (`default`, `elevated`, `outlined`, `urgent` with `#FE1D8F` left border & glow).
- **D-106:** CVA `Badge` variants (`primary #12C395`, `secondary #6BAAD0`, `destructive #FE1D8F`, `warning`, `outline`, `dot`).
- **D-107:** `Avatar` component with initials fallback and health `statusRing` (`active`, `at_risk`, `emergency`).
- **D-108:** `WizardStepper` component with circular status pills and filled `#12C395` progress track.
- **D-109:** Reassuring `EmptyState` component (gentle icon, empathetic title, description, action button).
- **D-110:** Radix Tabs with `pill` and `underline` variants.
- **D-111:** Radix `Switch` and `Checkbox` primitives with `#12C395` active state and smooth 150ms spring transitions.
- **D-112:** Radix `Tooltip` and `Popover` with dark slate background, white text, arrow pointer, and 200ms delay.

### 6. Dual JWT Auth Payload Types & Token Contracts
- **D-113:** `ExternalJwtPayload` contract in `@poco/types`: `{ sub: personId, householdId: string, role: FamilyRole, phone: string, tokenType: 'EXTERNAL' }`.
- **D-114:** `InternalJwtPayload` contract in `@poco/types`: `{ sub: internalUserId, email: string, roles: UserRole[], tokenType: 'INTERNAL', assignedTerritories?: string[] }`.
- **D-115:** Dual Access + Refresh Token contracts (15m web / 7d mobile access token + rotating `RefreshTokenPayload`).
- **D-116:** Typed `WebhookVerificationContext` + pure HMAC-SHA256 signature verification functions in `@poco/business-rules`.

### 7. Mock Data Factories & Test Fixture Helpers
- **D-117:** Dedicated `@poco/business-rules/testing` export with strongly-typed factory functions (`createMockTicket`, `createMockHousehold`, `createMockWallet`, etc.) supporting partial overrides.
- **D-118:** Curated Indian Elder Care Fixtures (Kavach/Sahara/Sampoorna packages, realistic Indian seniors/ICE, Bangalore/Chennai test addresses).
- **D-119:** Scenario Helper Functions (`setupAtRiskTicketScenario`, `setupEmergencyNegativeBalanceScenario`) assembling rich test state in 1-2 lines.
- **D-120:** Vitest fake timers (`vi.useFakeTimers()`) + explicit `now: Date` injection in all business-rule calculation functions.
- **D-121:** Deterministic UUID helper (`mockUuid(seedName)`) producing predictable valid UUIDv4s for readable test diffs.
- **D-122:** Custom Vitest Matchers (`expect(result).toBeSuccess()`, `expect(ticket).toBeInSlaStatus('AT_RISK')`).
- **D-123:** Strict 100% test coverage threshold on `@poco/business-rules` core algorithms (state machine, SLA timers, billing rules).
- **D-124:** Comprehensive Edge Case Fixtures (expired certs, negative wallet exceeding credit limit, leap-year rollover, vital alert spikes, exception rollups).
- **D-125:** Property-based invariant testing with `fast-check` (verifying money conservation, GST rounding, state graph integrity).
- **D-126:** `TestTime` helper module (`BASE_TEST_TIME` + `timeAfter`, `timeBefore`) for readable timestamp math.
- **D-127:** Vitest worker thread pool (sub-100ms execution, isolated test environments, instant watch mode).
- **D-128:** Deterministic Snapshot Serializer normalizing timestamps/memory IDs for cross-platform stability on Windows and Linux CI.
- **D-129:** Typed Partner Mock Factories (`createMockRazorpayWebhook`, `createMockExotelCallEvent`, `createMockPococareSync`) in testing module.
- **D-130:** Transaction Rollback Utility (`withTestDatabaseTransaction`) executing integration tests inside an uncommitted transaction with zero cleanup overhead.
- **D-131:** Vitest Benchmark Suites (`bench()` in `*.bench.ts`) verifying microsecond execution throughput for state machines and SLA scanners.
- **D-132:** Partner Failure Simulator (`simulatePartnerFailure` for timeouts, signature mismatch, 500 errors, network drops).

### 8. Database Migration Baseline & CI Seed Strategy
- **D-133:** Clean initial baseline migration (`0_init` via `prisma migrate dev --name init`) with complete schema, composite indexes, and foreign keys.
- **D-134:** `prisma.upsert()` with deterministic fixed UUIDs in `src/seed.ts` ensuring idempotent repeated seed execution.
- **D-135:** Two-Tier Seed System: `pnpm db:seed` (minimal baseline: catalog, 3 packages, 12 partners, admin, 3 demo households) vs `pnpm db:seed:realistic` (~50 officers, ~200 households for Phase 4 scale).
- **D-136:** `pnpm db:reset` (`prisma migrate reset --force + seed`) with strict `NODE_ENV !== 'production'` safety check.
- **D-137:** Seed all role-specialized staff accounts (`admin@pocoeldercare.com`, `ops@pocoeldercare.com`, `manager@pocoeldercare.com`, `officer@pocoeldercare.com`) with bcrypt hashes and fixed UUIDs for instant local login.
- **D-138:** Seed all 12 core elder care services with structured SOP steps in `ServiceCatalogVersion` v1.
- **D-139:** Seed 3 baseline packages in `PackageVersion` v1 (Kavach ₹500, Sahara ₹3,000, Sampoorna ₹12,500) with quota allocations.
- **D-140:** Seed all 12 `IntegrationPartner` rows with `status: 'MOCK_ONLY'` and default mock latency/secret configurations.
- **D-141:** Seed 3 representative demo households (Sahara active with vitals, Kavach fresh, Sampoorna NRI with open ticket) in baseline seed for immediate manual testing.
- **D-142:** Post-seed sanity check & console summary table verifying entity counts, admin login readiness, and active catalog status.
- **D-143:** Conservative PostgreSQL connection pool (`connection_limit=10`, `pool_timeout=15s`) in `DATABASE_URL` to conserve memory on 1GB droplet.
- **D-144:** Docker healthcheck with `pg_isready` and `condition: service_healthy` on dependent containers.

### 9. Local Windows/Docker Dev Workflow, Manual Testability & 1GB Droplet Deployment
- **D-145:** `docker-compose.yml` (production baseline) + `docker-compose.override.yml` for local Windows dev (volume mounts for `./apps/*` and `./packages/*`, polling watch mode, exposed ports: 3000 Admin, 3001 Family, 4000 NestJS API, 5432 Postgres, 8080 Adminer DB GUI).
- **D-146:** 3-Container 1GB DigitalOcean Droplet topology: (1) `postgres:16-alpine` (max 200MB RAM), (2) `backend` NestJS + `pg-boss` + LRU cache (max 350MB RAM via Node `--max-old-space-size=300`), (3) `web` Nginx + Next.js standalone build (max 200MB RAM), leaving 250MB buffer for OS kernel and disk cache.
- **D-147:** In-Portal Dev Testbench (`/admin/dev-tools` with 1-click actor switcher between Admin/Ops/Manager/Officer/Family, simulated partner callback triggers, and seed reset button) for rapid manual testing.
- **D-148:** Single `deploy.sh` script + `docker-compose.prod.yml` configuring 2GB swapfile, Docker install, Prisma migrations, Nginx SSL, and `/api/health` verification endpoint.
- **D-149:** Strict `.gitattributes` (`* text=auto eol=lf`) preventing Windows CRLF bash execution errors + WSL 2 Docker backend with `CHOKIDAR_USEPOLLING=true` for reliable file watching.
- **D-150:** Production Nginx reverse proxy with path routing (`/api/* -> 4000`, `/admin/* -> 3000`, `/ -> 3001`), rate limits (auth 20/min), and security headers.
- **D-151:** Docker `json-file` log rotation (`max-size: 10m`, `max-file: 3`) on all containers capping total disk logging below 100MB permanently.
- **D-152:** Automated Nightly `backup.sh` cron job (`pg_dump` compressed to S3/Spaces bucket with 7-day retention).

### the agent's Discretion
- Exact naming and placement of internal utility helper functions within `@poco/business-rules` and `@poco/database`.
- Specific Tailwind plugin hook names in `@poco/design-tokens`.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Architecture & Requirements
- `docs/poco-elder-care-design-brief.md` — Authoritative baseline design brief defining 1GB droplet constraints, 3-step billing hierarchy, dual SLA tracking, 1:1 Care Officer mapping, and offline sync.
- `.planning/PROJECT.md` — Project context, active requirements, scope boundaries, and core value propositions.
- `.planning/REQUIREMENTS.md` — Formal requirements matrix (AUTH, CARE, TCKT, SLA, CATL, BILL, FEED, FLD, ADMN, INTG, TEST).
- `.planning/research/ARCHITECTURE.md` — Detailed system architecture, container topology, package graph, and service boundaries.
- `.planning/research/STACK.md` — Technology stack versions, compatibility matrix, and banned anti-patterns (no Redis container, no multi-container Node workers).

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- Greenfield workspace — All packages (`packages/*`) and shared tooling are created cleanly in Phase 1 following the pnpm/turbo architecture.

### Established Patterns
- DRY Single-Source-of-Truth: Business rules, state machines, and calculations reside exclusively in `@poco/business-rules` and are enforced on backend.
- Pure functional core: All calculators and state machines in `@poco/business-rules` are pure functions with tagged union returns and zero external side-effects.

### Integration Points
- PostgreSQL 16 database instance connected via `@poco/database` typed PrismaClient singleton.
- Turborepo task pipeline orchestrating `build`, `dev`, `test`, `lint`, and `db:generate`.

</code_context>

<specifics>
## Specific Ideas

- Primary brand palette: `#12C395` (vibrant mint/emerald green), `#FE1D8F` (vibrant magenta/rose alert), and `#6BAAD0` (soft sky/cerulean blue secondary).
- Interactive In-Portal Dev Testbench at `/admin/dev-tools` with quick actor switchers and partner event simulators.
- Full Docker Compose local development environment for Windows with Adminer DB GUI on port 8080 and hot-reload volume mounts.

</specifics>

<deferred>
## Deferred Ideas

- None — discussion stayed within phase scope.

</deferred>

---

*Phase: 01-monorepo-foundation-prisma-schema-dry-business-rules*
*Context gathered: 2026-08-31*

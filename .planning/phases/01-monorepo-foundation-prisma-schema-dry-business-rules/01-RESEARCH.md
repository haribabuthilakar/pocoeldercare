# Phase 01: Monorepo Foundation, Prisma Schema & DRY Business Rules - Research

**Researched:** 2026-08-31
**Domain:** Monorepo Workspace, Multi-File Prisma 6 Schema, Pure Functional Business Rules & Deterministic State Engines
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### 1. Monorepo Package Structure & Build Tooling
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

#### 2. Prisma Schema Architecture & ID/Money Conventions
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

#### 3. Business Rules & State Machine API Contracts
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

#### 4. Zod Validation & Type Derivation Strategy
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

#### 5. Design Tokens & Tailwind Preset Architecture
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

#### 6. Dual JWT Auth Payload Types & Token Contracts
- **D-113:** `ExternalJwtPayload` contract in `@poco/types`: `{ sub: personId, householdId: string, role: FamilyRole, phone: string, tokenType: 'EXTERNAL' }`.
- **D-114:** `InternalJwtPayload` contract in `@poco/types`: `{ sub: internalUserId, email: string, roles: UserRole[], tokenType: 'INTERNAL', assignedTerritories?: string[] }`.
- **D-115:** Dual Access + Refresh Token contracts (15m web / 7d mobile access token + rotating `RefreshTokenPayload`).
- **D-116:** Typed `WebhookVerificationContext` + pure HMAC-SHA256 signature verification functions in `@poco/business-rules`.

#### 7. Mock Data Factories & Test Fixture Helpers
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

#### 8. Database Migration Baseline & CI Seed Strategy
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

#### 9. Local Windows/Docker Dev Workflow, Manual Testability & 1GB Droplet Deployment
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

### Deferred Ideas (OUT OF SCOPE)
- None — discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|---|---|---|
| **AUTH-01** | External users (family members/seniors) can sign up with phone/email and authenticate via JWT. | `Person` and `HouseholdMembership` models in `packages/database/prisma/schema/auth.prisma`, `ExternalJwtPayload` contract in `@poco/types`, and phone/email validation schemas in `@poco/validation`. |
| **AUTH-02** | Internal staff can authenticate with role-based JWT supporting multiple simultaneous roles (e.g. Care Officer + Training Manager). | `InternalUser` and `InternalUserRole` models in `packages/database/prisma/schema/auth.prisma`, `InternalJwtPayload` contract supporting `roles: UserRole[]` in `@poco/types`, and capability evaluation rules in `@poco/business-rules`. |
| **AUTH-05** | Users associated with multiple households can switch their active household context via a dropdown selector. | Relational `HouseholdMembership` join table with `role` and `householdId` scoped context switches defined in `@poco/database` and `@poco/types`. |
| **CARE-01** | System enforces a strict 1:1 active mapping between each household and exactly one assigned Care Officer. | Unique foreign key `Household.assignedCareOfficerId @unique` in `household.prisma` and pure `validateCareOfficerAssignment` validator in `@poco/business-rules`. |
| **CARE-03** | Care Officer assignment is strictly blocked by the backend unless the officer has active, non-expired records for all mandatory certifications. | Certification relational join tables (`Certification`, `CareOfficerCertification`) in Prisma schema and unexpired certification check algorithm in `validateCareOfficerAssignment` (`@poco/business-rules`). |
| **TCKT-03** | Service Requests follow a uniform lifecycle state machine (`Open -> Assigned -> In Progress -> Pending Approval -> Completed -> Closed`, `Cancelled`, `Waiting Ops Update`). | Pure functional state machine `transitionServiceRequest` and `transitionTicket` in `@poco/business-rules`, status enums in `@poco/constants` and Prisma schema. |
| **SLA-02** | Orthogonal SLA state machine tracks exactly three states: `Normal`, `At Risk`, and `Breached`. | `SlaStatus` enum in `@poco/constants`, `evaluateSlaStatus` and `calculateSlaDeadlines` pure functions in `@poco/business-rules` evaluating 75% threshold and 100% breach point. |
| **CATL-01** | Service Catalog items are versioned (`ServiceCatalogVersion`) with unit pricing (`priceInr`), default emergency flags, and owner types. | Immutable `ServiceCatalog` and `ServiceCatalogVersion` models in `catalog.prisma` with integer `priceInr` in paise, emergency flags, and baseline seed fixtures. |
| **CATL-02** | Packages (Kavach, Sahara, Sampoorna) are versioned (`PackageVersion`) with configurable monthly/yearly rates and per-service quotas (`PackageServiceQuota`). | Immutable `Package` and `PackageVersion` models in `catalog.prisma` linked to `PackageServiceQuota` allocations with baseline seed data. |
| **CATL-03** | Household subscriptions pin to the specific `packageVersionId` in effect at subscription or renewal, preserving grandfathered terms. | `HouseholdSubscription` model storing foreign key `packageVersionId` in `billing.prisma`, and `resolveServicePricing` pricing lookup rule in `@poco/business-rules`. |
| **CATL-04** | Service Requests pin to the specific `serviceCatalogVersionId` in effect at creation time, preserving historical SOP terms and pricing. | `ServiceRequest` model storing `serviceCatalogVersionId` in `ticket.prisma`, locking unit costs and SOP steps at the moment of request dispatch. |
| **BILL-01** | Each household has exactly one dedicated digital wallet with a ledger audit trail (`WalletTransaction`). | 1:1 `HouseholdWallet` relation on `Household` model and append-only `WalletTransaction` ledger with `balanceAfterPaise` in `billing.prisma`. |
| **BILL-03** | For out-of-quota or pay-per-use services, emergency services (catalog default or ops override) auto-debit the wallet, allowing negative balances. | `evaluateBillingAction` pure engine in `@poco/business-rules` returning `EMERGENCY_NEGATIVE_DEBIT` action and calculating updated balance. |
| **BILL-04** | For non-emergency user-requested services, the system auto-debits the wallet if balance is sufficient. | `evaluateBillingAction` pure engine in `@poco/business-rules` verifying wallet balance >= price and returning `AUTO_DEBIT_WALLET`. |
| **BILL-05** | For services with insufficient balance or staff-suggested services, the system places the request in `Pending Approval` and notifies the family. | `evaluateBillingAction` pure engine in `@poco/business-rules` returning `REQUIRE_FAMILY_APPROVAL` action and hold state metadata. |
</phase_requirements>

## Summary

Phase 01 establishes the foundational monorepo infrastructure, multi-file PostgreSQL Prisma 6 schema, and zero-dependency, pure functional DRY business rules for the Poco Elder Care platform. The repository is structured as a Turborepo + pnpm workspace containing 9 shared packages: `@poco/constants`, `@poco/types`, `@poco/validation`, `@poco/business-rules`, `@poco/database`, `@poco/design-tokens`, `@poco/ui`, `@poco/tsconfig`, and `@poco/eslint-config`.

By isolating all business logic (the uniform ticket/service request state machine, deterministic 3-step billing hierarchy, dual SLA response/delivery calculator, and Care Officer assignment validator) inside `@poco/business-rules`, we guarantee 100% testable, portable logic executed authoritatively on the backend and imported safely by frontend surfaces without logic duplication or drift.

All database models across the 10 core domains (Auth, Households/Seniors, Assignments, Catalog, Tickets/SOPs, Billing, Activity Feeds, Field Visits, Partners, and Auditing) are organized modularly using Prisma 6 `prismaSchemaFolder`. Currency is stored strictly as 64-bit integer paise (`1 INR = 100 paise`), UUIDv4 primary keys are utilized for universal offline-sync compatibility, and immutable version tables (`PackageVersion`, `ServiceCatalogVersion`, `SopStepVersion`) permanently preserve grandfathered pricing and terms.

**Primary recommendation:** Build the foundational packages bottom-up (`@poco/constants` → `@poco/types` → `@poco/validation` → `@poco/business-rules` → `@poco/database` → `@poco/design-tokens` → `@poco/ui`), write comprehensive pure-function test suites with Vitest and `fast-check`, execute the initial clean migration (`0_init`) with baseline seeds, and verify local Docker Compose functionality on Windows.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|---|---|---|---|
| **State Machine Execution** | Backend API & Queue (`@poco/business-rules`) | Frontend UI (`@poco/business-rules`) | Backend is the sole authoritative state mutator; Frontends consume pure functions read-only to render allowed actions. |
| **3-Step Billing Engine** | Backend API (`@poco/business-rules`) | Database (`@poco/database`) | Pure evaluator determines debit vs hold; database executes transactional ledger entries and quota decrements. |
| **Dual SLA Calculations** | Backend Queue Worker (`@poco/business-rules`) | Admin Portal (UI SLA badges) | Background workers scan target timestamps and flip `SlaStatus`; UI renders badges based on calculated state. |
| **Care Officer Assignment Validation** | Backend API (`@poco/business-rules`) | Admin Portal (Manager UI) | Manager-only permission and unexpired certification checks are validated synchronously before database write. |
| **Database Persistence & Schemas** | Database (`@poco/database` / Postgres) | Backend API (Prisma Client) | PostgreSQL 16 enforces UUID primary keys, 1:1 unique constraints, foreign keys, and transaction atomicity. |
| **DTO Validation & Schema Parsing** | Shared Validation (`@poco/validation`) | Backend API (Pipes) & Web Forms | Zod schemas validate inbound payloads across HTTP controllers, Claude AI outputs, and React Hook Forms. |
| **Design Tokens & Component Styling** | Shared Design Tokens (`@poco/design-tokens`, `@poco/ui`) | Next.js Portals / Field App | Semantic tokens and Tailwind presets maintain brand consistency (`#12C395`, `#FE1D8F`, `#6BAAD0`) across web and mobile. |

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---|---|---|---|
| **Turborepo** | `^2.3.0` [VERIFIED: npm registry] | Monorepo orchestration & build pipeline | High-speed task caching, dependency graph execution (`dependsOn: ["^db:generate"]`), and parallel testing. |
| **pnpm** | `^9.15.0` / `10.30.x` [VERIFIED: local & registry] | Workspace package manager | Strict dependency isolation, zero-duplication hard links, and workspace catalogs (`pnpm-workspace.yaml`). |
| **Node.js** | `22.x LTS` [VERIFIED: local node v22.16.0] | Server runtime engine | Modern V8 runtime, native web APIs, low memory footprint (~30-50MB base RSS), and strict engine enforcement. |
| **TypeScript** | `^5.7.2` [VERIFIED: npm registry] | Static type safety | Strict typechecking across packages, native TS 5.7 const type parameters, and `.d.ts` declaration maps. |
| **Prisma ORM** | `^6.2.0` [VERIFIED: npm registry] | Relational ORM & migrations | Declarative multi-file schema (`prismaSchemaFolder`), zero-leak connection pooling, and fully typed client generation. |
| **Zod** | `^3.24.1` [VERIFIED: npm registry] | Runtime validation & DTO inference | Single source of truth for DTO schemas, form validation, and Claude structured JSON extraction via `zod-to-json-schema`. |
| **tsup** | `^8.3.5` [VERIFIED: npm registry] | Package compilation & bundling | Fast esbuild bundler producing dual ESM/CJS outputs and type definitions with live `--watch` rebuilds. |
| **Vitest** | `^2.1.8` [VERIFIED: npm registry] | Blazing fast unit & invariant testing | Native ESM execution, sub-100ms test runner, fake timers, and benchmark suites. |

### Supporting

| Library | Version | Purpose | When to Use |
|---|---|---|---|
| **fast-check** | `^3.23.2` [VERIFIED: npm registry] | Property-based testing | Validating state machine graph completeness, money conservation, and GST calculation invariants. |
| **date-fns** | `^4.1.0` [VERIFIED: npm registry] | Immutable date math | Pure SLA duration elapsed calculations, billing renewal dates, and IST time conversions. |
| **zod-to-json-schema** | `^3.24.1` [VERIFIED: npm registry] | Zod to JSON Schema bridge | Converting validation schemas into tool schemas for Claude structured output contracts. |
| **Tailwind CSS** | `^3.4.17` [VERIFIED: npm registry] | Utility styling preset | Providing theme tokens, custom animations, and high-contrast color utilities. |
| **class-variance-authority** | `^0.7.1` [VERIFIED: npm registry] | Component variant builder | Type-safe variant management for CVA Button, Badge, Card, and Alert primitives. |
| **clsx** & **tailwind-merge** | `^2.1.1` & `^2.6.0` [VERIFIED: npm registry] | Class name utility merger | Safe merging of conditional Tailwind classes without specificity conflicts. |
| **Lucide Icons** | `^0.468.0` [VERIFIED: npm registry] | Accessible iconography | Curated 1.75px stroke icons across web and mobile surfaces. |
| **bcrypt** / `@types/bcrypt` | `^5.1.1` [VERIFIED: npm registry] | Password hashing | Deterministic password hashing for seeded staff credentials (`admin@pocoeldercare.com`). |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|---|---|---|
| **Modular Prisma Schema (`prismaSchemaFolder`)** | Single giant `schema.prisma` file | A 1,500+ line single schema is difficult to maintain and merge; Prisma 6 native folder structure cleanly separates domains into `auth.prisma`, `billing.prisma`, etc. |
| **Integer Paise (`BigInt` / `Int`)** | Floating point numbers (`Float` / `Double`) | Floats suffer from precision rounding bugs (e.g. `0.1 + 0.2 !== 0.3`). Integer paise eliminates rounding errors and directly matches Razorpay INR payloads. |
| **`tsup`** | Raw `tsc` or `babel` | `tsup` bundles dependencies, generates dual ESM/CJS formats for NestJS and Next.js, and bundles `.d.ts` cleanly in milliseconds. |
| **Pure State Machine Functions** | XState or NestJS Finite State Machine services | Pure TypeScript functions with tagged union returns have zero runtime dependencies, run in <1ms, and execute identically in React Native, Next.js, and NestJS. |

## Package Legitimacy Audit

| Package | Registry | Age | Downloads | Source Repo | Verdict | Disposition |
|---|---|---|---|---|---|---|
| `turbo` | npm | 4 yrs | 4.2M/wk | `github.com/vercel/turborepo` | `[OK]` | Approved |
| `tsup` | npm | 4 yrs | 5.8M/wk | `github.com/egoist/tsup` | `[OK]` | Approved |
| `prisma` | npm | 6 yrs | 3.9M/wk | `github.com/prisma/prisma` | `[OK]` | Approved |
| `@prisma/client` | npm | 6 yrs | 4.5M/wk | `github.com/prisma/prisma` | `[OK]` | Approved |
| `typescript` | npm | 12 yrs | 65M/wk | `github.com/microsoft/TypeScript` | `[OK]` | Approved |
| `zod` | npm | 5 yrs | 24M/wk | `github.com/colinhacks/zod` | `[OK]` | Approved |
| `vitest` | npm | 3 yrs | 7.8M/wk | `github.com/vitest-dev/vitest` | `[OK]` | Approved |
| `fast-check` | npm | 7 yrs | 8.5M/wk | `github.com/dubzzz/fast-check` | `[OK]` | Approved |
| `date-fns` | npm | 10 yrs | 32M/wk | `github.com/date-fns/date-fns` | `[OK]` | Approved |
| `tailwindcss` | npm | 7 yrs | 14M/wk | `github.com/tailwindlabs/tailwindcss` | `[OK]` | Approved |
| `class-variance-authority` | npm | 3 yrs | 5.1M/wk | `github.com/joe-bell/cva` | `[OK]` | Approved |
| `clsx` | npm | 6 yrs | 62M/wk | `github.com/lukeed/clsx` | `[OK]` | Approved |
| `tailwind-merge` | npm | 4 yrs | 22M/wk | `github.com/dcastil/tailwind-merge` | `[OK]` | Approved |
| `lucide-react` | npm | 3 yrs | 3.1M/wk | `github.com/lucide-icons/lucide` | `[OK]` | Approved |
| `zod-to-json-schema` | npm | 4 yrs | 1.8M/wk | `github.com/StefanTerdell/zod-to-json-schema` | `[OK]` | Approved |
| `bcrypt` | npm | 13 yrs | 10M/wk | `github.com/kelektiv/node.bcrypt.js` | `[OK]` | Approved |

**Packages removed due to [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none

## Architecture Patterns

### System Architecture Diagram

```mermaid
flowchart TD
    subgraph MonorepoPackages [Shared Packages (@poco/*)]
        CONST[@poco/constants<br/>Enums, SLA limits, Defaults]
        TYPES[@poco/types<br/>Interfaces, DTOs, JWT payloads]
        VAL[@poco/validation<br/>Zod schemas, DTO inference]
        RULES[@poco/business-rules<br/>Pure state machines, 3-tier billing, SLA timers]
        DB[@poco/database<br/>Prisma 6 schema, migrations, seed]
        TOKENS[@poco/design-tokens<br/>Brand tokens, Tailwind preset]
        UI[@poco/ui<br/>Shadcn/Radix components]
    end

    CONST --> TYPES
    TYPES --> VAL
    VAL --> RULES
    CONST --> DB
    TYPES --> DB
    CONST --> TOKENS
    TOKENS --> UI

    subgraph Runtimes [Monorepo Consumers]
        API[apps/api<br/>NestJS Backend]
        ADMIN[apps/admin-portal<br/>Next.js 15 Ops Dashboard]
        FAMILY[apps/family-portal<br/>Next.js 15 Family Portal]
        MOBILE[apps/field-app<br/>React Native Field App]
    end

    DB --> API
    RULES --> API
    VAL --> API
    TYPES --> API

    RULES --> ADMIN
    UI --> ADMIN
    VAL --> ADMIN

    RULES --> FAMILY
    UI --> FAMILY
    VAL --> FAMILY

    RULES --> MOBILE
    TOKENS --> MOBILE
    VAL --> MOBILE
```

### Recommended Project Structure

```
pocoeldercare/
├── .github/
├── .husky/
├── docker/
│   ├── Dockerfile.api
│   ├── Dockerfile.web
│   ├── docker-compose.yml
│   ├── docker-compose.override.yml
│   ├── docker-compose.prod.yml
│   └── nginx.conf
├── packages/
│   ├── constants/               # @poco/constants
│   │   ├── src/
│   │   │   ├── roles.ts
│   │   │   ├── statuses.ts
│   │   │   ├── sla.ts
│   │   │   ├── partners.ts
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── types/                   # @poco/types
│   │   ├── src/
│   │   │   ├── auth.ts
│   │   │   ├── tickets.ts
│   │   │   ├── billing.ts
│   │   │   ├── activity.ts
│   │   │   ├── partners.ts
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── validation/              # @poco/validation
│   │   ├── src/
│   │   │   ├── auth/
│   │   │   ├── family/
│   │   │   ├── field/
│   │   │   ├── admin/
│   │   │   ├── webhooks/
│   │   │   ├── common/
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── business-rules/          # @poco/business-rules
│   │   ├── src/
│   │   │   ├── state-machine/   # Ticket & Service Request transitions
│   │   │   ├── billing/         # 3-step billing evaluator & paise math
│   │   │   ├── sla/             # Dual SLA timer calculation & breach scanner
│   │   │   ├── assignments/     # Care Officer 1:1 & certification validator
│   │   │   ├── rollup/          # Aggregate parent ticket state calculator
│   │   │   ├── geofence/        # Haversine distance calculator
│   │   │   ├── testing/         # Mock data factories & scenario fixtures
│   │   │   ├── errors.ts        # Structured DomainError definitions
│   │   │   ├── results.ts       # Tagged Union Result<T, E> pattern
│   │   │   └── index.ts
│   │   ├── test/
│   │   │   ├── state-machine.spec.ts
│   │   │   ├── billing.spec.ts
│   │   │   ├── sla.spec.ts
│   │   │   ├── assignments.spec.ts
│   │   │   └── invariants.spec.ts
│   │   ├── package.json
│   │   └── vitest.config.ts
│   ├── database/                # @poco/database
│   │   ├── prisma/
│   │   │   ├── schema/          # Prisma 6 prismaSchemaFolder
│   │   │   │   ├── schema.prisma
│   │   │   │   ├── auth.prisma
│   │   │   │   ├── household.prisma
│   │   │   │   ├── assignment.prisma
│   │   │   │   ├── catalog.prisma
│   │   │   │   ├── ticket.prisma
│   │   │   │   ├── billing.prisma
│   │   │   │   ├── activity.prisma
│   │   │   │   ├── visit.prisma
│   │   │   │   ├── partner.prisma
│   │   │   │   └── audit.prisma
│   │   │   └── migrations/
│   │   ├── src/
│   │   │   ├── client.ts        # Typed PrismaClient singleton with soft deletes
│   │   │   ├── seed.ts          # Two-tier deterministic seed runner
│   │   │   ├── seeds/           # Fixture files (catalog, packages, partners)
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── design-tokens/           # @poco/design-tokens
│   │   ├── src/
│   │   │   ├── colors.ts
│   │   │   ├── typography.ts
│   │   │   ├── spacing.ts
│   │   │   ├── tailwind/        # Tailwind preset plugin
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── ui/                      # @poco/ui
│   │   ├── src/
│   │   │   ├── components/      # Button, Badge, Card, Modal, DataTable, etc.
│   │   │   ├── icons/           # Lucide icon wrappers
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── tsconfig/                # @poco/tsconfig
│   │   ├── base.json
│   │   ├── react.json
│   │   ├── node.json
│   │   └── package.json
│   └── eslint-config/           # @poco/eslint-config
│       ├── index.js
│       └── package.json
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
└── vitest.workspace.ts
```

### Pattern 1: Modular Multi-File Prisma 6 Schema (`prismaSchemaFolder`)
**What:** Rather than a monolithic 1,500-line `schema.prisma`, Prisma 6 enables splitting models across separate `.prisma` files in `packages/database/prisma/schema/`.
**When to use:** All database modeling across Auth, Households, Tickets, Billing, and Integration domains.
**Configuration:** In `packages/database/prisma/schema/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["prismaSchemaFolder"]
}
```

### Pattern 2: Tagged Union Result Pattern
**What:** Pure business functions never throw unhandled exceptions. They return a deterministic `Result<T, DomainError>` tagged union.
**When to use:** All state transitions, billing decisions, SLA calculations, and assignment validations in `@poco/business-rules`.
```typescript
export type Result<T, E = DomainError> =
  | { success: true; data: T }
  | { success: false; error: E };

export const ok = <T>(data: T): Result<T, never> => ({ success: true, data });
export const fail = <E extends DomainError>(error: E): Result<never, E> => ({ success: false, error });
```

### Pattern 3: 3-Step Billing Hierarchy Evaluator
**What:** Pure functional decision tree determining how a service request is funded:
1. Deduct from active package quota if available (`AUTO_DEBIT_QUOTA`).
2. If quota is exhausted and service is tagged Emergency, auto-debit the household wallet allowing negative balance (`EMERGENCY_NEGATIVE_DEBIT`).
3. If requested by user and wallet has sufficient balance, auto-debit wallet (`AUTO_DEBIT_WALLET`).
4. If unfunded non-emergency or staff suggested, require family approval hold (`REQUIRE_FAMILY_APPROVAL`).

### Anti-Patterns to Avoid
- **Floating Point Currency:** Never store currency in INR floats (e.g. `₹500.50`). Store strictly as integer paise (`50050`).
- **Client-Side State Mutation:** Never allow frontends to mutate ticket status directly. Frontends send intent events to backend; backend executes `@poco/business-rules` state machine.
- **Cross-Household Aggregation:** Never merge wallets or activity feeds across households. Financial and medical liability is strictly household-scoped.
- **Direct S3 File Uploads via Server:** Never stream binary image files through NestJS. Generate backend presigned URLs; upload directly from browser/mobile.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---|---|---|---|
| **State Machine Validation** | Ad-hoc `if (status === 'X')` conditionals across backend | Pure state machine graph in `@poco/business-rules` | Ad-hoc logic creates orphaned states and contradictory transitions across multiple controllers. |
| **Money / GST Calculations** | Ad-hoc float multiplication (`price * 1.18`) | Pure integer paise arithmetic functions in `@poco/business-rules` | Float multiplication causes sub-paise rounding discrepancies with Razorpay and invoices. |
| **Geo-Distance Calculations** | Third-party heavy GIS libraries | Clean Haversine pure formula in `@poco/business-rules` | Only 20 lines of pure math needed for 200m geofence validation with zero dependency overhead. |
| **DTO Schema Validation** | Manual type guards and regex checks | Zod 3.24+ schemas in `@poco/validation` | Zod automatically generates TypeScript types, validates inputs, and converts to JSON Schema for Claude SDK. |
| **Monorepo Build Orchestration** | Custom bash scripts or npm run chains | Turborepo 2 + pnpm workspaces | Turborepo handles task graph dependencies, topological sorting, and build artifact caching. |

## Common Pitfalls

### Pitfall 1: Prisma Client Build Order in Monorepo
**What goes wrong:** Dependent packages fail to compile because `@prisma/client` types have not been generated yet.
**Why it happens:** Package compilation happens concurrently without topological build ordering.
**How to avoid:** In `turbo.json`, define task dependencies with `"dependsOn": ["^db:generate"]` and `"outputs": ["node_modules/.prisma/client/**"]`.
**Warning signs:** `Cannot find module '@poco/database'` or type errors referencing missing Prisma model types.

### Pitfall 2: Floating Point Rounding in Financial Ledgers
**What goes wrong:** Wallet transaction ledgers diverge from real payment gateway settlements by a few cents/paise.
**Why it happens:** JavaScript `Number` IEEE 754 floating-point arithmetic (`0.1 + 0.2 = 0.30000000000000004`).
**How to avoid:** Store all amounts as `Int` (or `BigInt`) representing integer paise in PostgreSQL, and perform all arithmetic using integer math (`Math.round((basePaise * gstRate) / 100)`).
**Warning signs:** Invoices showing `₹500.000000001` or reconciliation errors with Razorpay webhooks.

### Pitfall 3: Timezone Divergence in SLA Clocks
**What goes wrong:** SLA deadlines evaluate differently depending on server timezone vs client local time.
**Why it happens:** Comparing naive date strings or formatting dates without explicit UTC / IST conversions.
**How to avoid:** Store all database timestamps strictly as UTC `DateTime` in PostgreSQL. Convert to Indian Standard Time (`Asia/Kolkata`, UTC+05:30) exclusively at the presentation/UI layer.
**Warning signs:** SLA timers prematurely jumping to `BREACHED` by exactly 5.5 hours.

### Pitfall 4: Non-Deterministic Seed Data
**What goes wrong:** Re-running seeds creates duplicate records or fails due to foreign key uniqueness violations.
**Why it happens:** Generating random UUIDs on each seed execution instead of fixed deterministic UUIDs.
**How to avoid:** Use `prisma.upsert()` with fixed deterministic UUID constants for all core roles, services, packages, and demo households.

## Code Examples

### 1. Pure State Machine Transition Function (`@poco/business-rules`)
```typescript
import { TicketStatus, ServiceRequestStatus, UserRole } from '@poco/constants';
import { Result, ok, fail } from '../results';
import { DomainError } from '../errors';

export interface TransitionContext {
  actorId: string;
  actorRoles: UserRole[];
  reason?: string;
  isEmergencyOverride?: boolean;
}

export type TicketEvent =
  | { type: 'ASSIGN'; assignedToId: string }
  | { type: 'START_EXECUTION' }
  | { type: 'HOLD_FOR_APPROVAL' }
  | { type: 'APPROVE_BY_FAMILY' }
  | { type: 'COMPLETE'; verificationProofUrl?: string }
  | { type: 'CLOSE' }
  | { type: 'CANCEL'; reason: string }
  | { type: 'FLAG_OPS_EXCEPTION'; reason: string };

const ALLOWED_TICKET_TRANSITIONS: Record<TicketStatus, TicketEvent['type'][]> = {
  [TicketStatus.OPEN]: ['ASSIGN', 'CANCEL', 'FLAG_OPS_EXCEPTION'],
  [TicketStatus.ASSIGNED]: ['START_EXECUTION', 'CANCEL', 'FLAG_OPS_EXCEPTION'],
  [TicketStatus.IN_PROGRESS]: ['HOLD_FOR_APPROVAL', 'COMPLETE', 'CANCEL', 'FLAG_OPS_EXCEPTION'],
  [TicketStatus.PENDING_APPROVAL]: ['APPROVE_BY_FAMILY', 'CANCEL', 'FLAG_OPS_EXCEPTION'],
  [TicketStatus.WAITING_OPS_UPDATE]: ['ASSIGN', 'START_EXECUTION', 'COMPLETE', 'CANCEL'],
  [TicketStatus.COMPLETED]: ['CLOSE', 'FLAG_OPS_EXCEPTION'],
  [TicketStatus.CLOSED]: [],
  [TicketStatus.CANCELLED]: [],
};

export function transitionTicket(
  currentStatus: TicketStatus,
  event: TicketEvent,
  ctx: TransitionContext
): Result<TicketStatus, DomainError> {
  const allowed = ALLOWED_TICKET_TRANSITIONS[currentStatus];
  if (!allowed || !allowed.includes(event.type)) {
    return fail(
      new DomainError(
        'INVALID_STATE_TRANSITION',
        `Cannot transition ticket from ${currentStatus} via event ${event.type}`
      )
    );
  }

  switch (event.type) {
    case 'ASSIGN':
      return ok(TicketStatus.ASSIGNED);
    case 'START_EXECUTION':
      return ok(TicketStatus.IN_PROGRESS);
    case 'HOLD_FOR_APPROVAL':
      return ok(TicketStatus.PENDING_APPROVAL);
    case 'APPROVE_BY_FAMILY':
      return ok(TicketStatus.IN_PROGRESS);
    case 'COMPLETE':
      return ok(TicketStatus.COMPLETED);
    case 'CLOSE':
      return ok(TicketStatus.CLOSED);
    case 'CANCEL':
      return ok(TicketStatus.CANCELLED);
    case 'FLAG_OPS_EXCEPTION':
      return ok(TicketStatus.WAITING_OPS_UPDATE);
    default:
      return fail(new DomainError('UNKNOWN_EVENT', 'Unhandled state event'));
  }
}
```

### 2. Pure 3-Step Billing Evaluator (`@poco/business-rules`)
```typescript
import { Result, ok, fail } from '../results';
import { DomainError } from '../errors';

export type BillingActionType =
  | 'AUTO_DEBIT_QUOTA'
  | 'AUTO_DEBIT_WALLET'
  | 'EMERGENCY_NEGATIVE_DEBIT'
  | 'REQUIRE_FAMILY_APPROVAL';

export interface BillingEvaluationContext {
  householdId: string;
  serviceCatalogVersionId: string;
  pricePaise: number;
  availableQuotaUnits: number;
  walletBalancePaise: number;
  isEmergencyService: boolean;
  isEmergencyOverride: boolean;
  isUserRequested: boolean;
}

export interface BillingDecision {
  action: BillingActionType;
  debitAmountPaise: number;
  deductQuotaUnits: number;
  resultingWalletBalancePaise: number;
  requiresApproval: boolean;
  reason: string;
}

export function evaluateBillingAction(
  ctx: BillingEvaluationContext
): Result<BillingDecision, DomainError> {
  if (ctx.pricePaise < 0) {
    return fail(new DomainError('INVALID_AMOUNT', 'Service price cannot be negative'));
  }

  // Step 1: Quota Coverage
  if (ctx.availableQuotaUnits > 0) {
    return ok({
      action: 'AUTO_DEBIT_QUOTA',
      debitAmountPaise: 0,
      deductQuotaUnits: 1,
      resultingWalletBalancePaise: ctx.walletBalancePaise,
      requiresApproval: false,
      reason: 'Service covered by active package quota allowance.',
    });
  }

  // Step 2: Emergency Service (Negative Balance Permitted)
  if (ctx.isEmergencyService || ctx.isEmergencyOverride) {
    return ok({
      action: 'EMERGENCY_NEGATIVE_DEBIT',
      debitAmountPaise: ctx.pricePaise,
      deductQuotaUnits: 0,
      resultingWalletBalancePaise: ctx.walletBalancePaise - ctx.pricePaise,
      requiresApproval: false,
      reason: 'Emergency service delivered immediately; wallet debited allowing negative balance.',
    });
  }

  // Step 3: User-Requested with Sufficient Balance
  if (ctx.isUserRequested && ctx.walletBalancePaise >= ctx.pricePaise) {
    return ok({
      action: 'AUTO_DEBIT_WALLET',
      debitAmountPaise: ctx.pricePaise,
      deductQuotaUnits: 0,
      resultingWalletBalancePaise: ctx.walletBalancePaise - ctx.pricePaise,
      requiresApproval: false,
      reason: 'User-requested service auto-debited from available wallet funds.',
    });
  }

  // Step 4: Unfunded Non-Emergency / Staff Suggested -> Hold for Approval
  return ok({
    action: 'REQUIRE_FAMILY_APPROVAL',
    debitAmountPaise: 0,
    deductQuotaUnits: 0,
    resultingWalletBalancePaise: ctx.walletBalancePaise,
    requiresApproval: true,
    reason: 'Insufficient wallet balance or staff-suggested service requiring family authorization.',
  });
}
```

### 3. Dual SLA Calculator (`@poco/business-rules`)
```typescript
import { SlaStatus } from '@poco/constants';
import { addMinutes, differenceInMilliseconds } from 'date-fns';

export interface SlaCalculationParams {
  startedAt: Date;
  targetMinutes: number;
  atRiskRatio?: number; // Default: 0.75 (75%)
  now?: Date;
}

export interface SlaEvaluationResult {
  status: SlaStatus;
  dueAt: Date;
  elapsedMs: number;
  remainingMs: number;
  progressRatio: number;
  isBreached: boolean;
  shouldEscalateToSCO: boolean;
}

export function evaluateSlaStatus(params: SlaCalculationParams): SlaEvaluationResult {
  const { startedAt, targetMinutes, atRiskRatio = 0.75, now = new Date() } = params;
  const dueAt = addMinutes(startedAt, targetMinutes);
  const totalDurationMs = targetMinutes * 60 * 1000;
  const elapsedMs = Math.max(0, differenceInMilliseconds(now, startedAt));
  const remainingMs = differenceInMilliseconds(dueAt, now);
  const progressRatio = totalDurationMs > 0 ? elapsedMs / totalDurationMs : 1;

  let status = SlaStatus.NORMAL;
  let isBreached = false;
  let shouldEscalateToSCO = false;

  if (progressRatio >= 1.0) {
    status = SlaStatus.BREACHED;
    isBreached = true;
    shouldEscalateToSCO = true;
  } else if (progressRatio >= atRiskRatio) {
    status = SlaStatus.AT_RISK;
  }

  return {
    status,
    dueAt,
    elapsedMs,
    remainingMs,
    progressRatio: Number(progressRatio.toFixed(4)),
    isBreached,
    shouldEscalateToSCO,
  };
}
```

### 4. Care Officer Assignment Validator (`@poco/business-rules`)
```typescript
import { UserRole } from '@poco/constants';
import { Result, ok, fail } from '../results';
import { DomainError } from '../errors';

export interface ActiveCertification {
  certificationId: string;
  code: string;
  expiresAt: Date;
}

export interface AssignmentValidationParams {
  callerRoles: UserRole[];
  householdId: string;
  careOfficerId: string;
  requiredCertificationCodes: string[];
  officerCertifications: ActiveCertification[];
  now?: Date;
}

export function validateCareOfficerAssignment(
  params: AssignmentValidationParams
): Result<true, DomainError> {
  const { callerRoles, requiredCertificationCodes, officerCertifications, now = new Date() } = params;

  // Rule 1: Caller must have CARE_OFFICER_MANAGER role
  if (!callerRoles.includes(UserRole.CARE_OFFICER_MANAGER) && !callerRoles.includes(UserRole.SUPER_ADMIN)) {
    return fail(
      new DomainError(
        'UNAUTHORIZED_ASSIGNMENT_CALLER',
        'Only Care Officer Managers or Super Admins can assign or reassign Care Officers.'
      )
    );
  }

  // Rule 2: Officer must possess all mandatory, unexpired certifications
  const activeCerts = officerCertifications.filter((c) => c.expiresAt > now);
  const activeCodes = new Set(activeCerts.map((c) => c.code));

  const missingCertCodes = requiredCertificationCodes.filter((code) => !activeCodes.has(code));
  if (missingCertCodes.length > 0) {
    return fail(
      new DomainError(
        'MISSING_MANDATORY_CERTIFICATIONS',
        `Care Officer is missing unexpired mandatory certifications: ${missingCertCodes.join(', ')}`
      )
    );
  }

  return ok(true);
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|---|---|---|---|
| **Prisma Single File Schema** | Multi-File Schema via `prismaSchemaFolder` | Prisma 5.15 / 6.0 | Clean separation of domains (`auth.prisma`, `billing.prisma`, `ticket.prisma`) without merge collisions. |
| **Float Currency Math** | Integer Paise Math (`BigInt` / `Int`) | Industry Standard | Zero rounding divergence between internal ledgers and payment gateway webhooks. |
| **Client-Heavy State Logic** | DRY Pure State Machine in `@poco/business-rules` | Architecture Standard | 100% testable, portable logic executed authoritatively by backend and shared with UI. |
| **Storybook Build Overhead** | In-Portal Dev Testbench (`/admin/dev-tools`) | Phase 1 Standard | Fast manual testing and mock switching without maintaining a separate Storybook build pipeline. |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|---|---|---|
| A1 | Node 22 LTS, pnpm 9/10, and Docker are available on Windows dev host. | Environment Availability | Host configuration blocks development environment. (VERIFIED: Node 22.16.0, pnpm 10.30.1, Docker 29.2.1 present on host). |
| A2 | Turborepo and tsup produce valid ESM/CJS outputs without cross-package runtime issues. | Standard Stack | Build step errors during cross-package imports in NestJS/Next.js. (Mitigated by strict exports maps and tsup config). |

## Open Questions (RESOLVED)

1. **How should Prisma 6 schema files be organized across domains?**
   - **Resolution:** Placed in `packages/database/prisma/schema/` with separate `.prisma` files for `schema.prisma`, `auth.prisma`, `household.prisma`, `assignment.prisma`, `catalog.prisma`, `ticket.prisma`, `billing.prisma`, `activity.prisma`, `visit.prisma`, `partner.prisma`, and `audit.prisma`.
2. **How to ensure zero floating-point errors in wallet and billing transactions?**
   - **Resolution:** All money fields in Prisma are modeled as `Int` paise (`balancePaise`, `amountPaise`, `pricePaise`). All calculations in `@poco/business-rules` perform integer arithmetic.
3. **How should Care Officer certifications gate household assignments?**
   - **Resolution:** Relational join table `CareOfficerCertification` tracks expiration timestamps. Pure validator `validateCareOfficerAssignment` rejects assignments if any required certification is missing or expired.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|---|---|---|---|---|
| **Node.js** | Monorepo runtime & scripts | ✓ | `v22.16.0` | — |
| **pnpm** | Package manager | ✓ | `10.30.1` | — |
| **Git** | Version control & hooks | ✓ | `2.33.0` | — |
| **Docker & Compose** | Local dev Postgres & deployment | ✓ | `29.2.1` | Local Postgres install |
| **PostgreSQL 16** | Relational Database & Queues | ✓ (via Docker) | `16-alpine` | — |

**Missing dependencies with no fallback:** None.
**Missing dependencies with fallback:** None.

## Validation Architecture

### Test Framework
| Property | Value |
|---|---|
| Framework | Vitest `^2.1.8` |
| Config file | `packages/business-rules/vitest.config.ts`, `vitest.workspace.ts` |
| Quick run command | `pnpm --filter @poco/business-rules test` |
| Full suite command | `pnpm turbo test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|---|---|---|---|---|
| **AUTH-01** | External user JWT token contracts & role parsing | unit | `pnpm --filter @poco/business-rules test auth` | Wave 0 Gap |
| **AUTH-02** | Internal staff multi-role JWT contracts & capability matrix | unit | `pnpm --filter @poco/business-rules test capabilities` | Wave 0 Gap |
| **AUTH-05** | Multi-household membership scoping types & join validation | unit | `pnpm --filter @poco/business-rules test household-scope` | Wave 0 Gap |
| **CARE-01** | 1:1 active Care Officer household mapping constraint | unit | `pnpm --filter @poco/business-rules test assignments` | Wave 0 Gap |
| **CARE-03** | Mandatory unexpired certification assignment gating | unit | `pnpm --filter @poco/business-rules test certifications` | Wave 0 Gap |
| **TCKT-03** | Uniform lifecycle state machine transitions & exception rollups | unit / invariant | `pnpm --filter @poco/business-rules test state-machine` | Wave 0 Gap |
| **SLA-02** | Dual SLA calculations (Normal, 75% At-Risk, 100% Breached) | unit | `pnpm --filter @poco/business-rules test sla` | Wave 0 Gap |
| **CATL-01** | Service catalog versioning & pricing paise models | unit | `pnpm --filter @poco/business-rules test pricing` | Wave 0 Gap |
| **CATL-02** | Package versioning & quota allocation contracts | unit | `pnpm --filter @poco/business-rules test quotas` | Wave 0 Gap |
| **CATL-03** | Grandfathered subscription package version terms resolver | unit | `pnpm --filter @poco/business-rules test grandfathering` | Wave 0 Gap |
| **CATL-04** | Service request pinned catalog version resolution | unit | `pnpm --filter @poco/business-rules test service-versioning` | Wave 0 Gap |
| **BILL-01** | 1:1 household wallet balance & immutable transaction ledger | unit | `pnpm --filter @poco/business-rules test wallet-ledger` | Wave 0 Gap |
| **BILL-03** | 3-step billing: Emergency negative-balance auto-debit | unit | `pnpm --filter @poco/business-rules test billing` | Wave 0 Gap |
| **BILL-04** | 3-step billing: Non-emergency user-requested wallet auto-debit | unit | `pnpm --filter @poco/business-rules test billing` | Wave 0 Gap |
| **BILL-05** | 3-step billing: Insufficient balance approval hold requirement | unit | `pnpm --filter @poco/business-rules test billing` | Wave 0 Gap |

### Sampling Rate
- **Per task commit:** `pnpm --filter @poco/business-rules test`
- **Per wave merge:** `pnpm turbo test`
- **Phase gate:** All Vitest suites green with 100% statement and branch coverage on business rules algorithms.

### Wave 0 Gaps
- [ ] `packages/business-rules/vitest.config.ts` — package test config
- [ ] `packages/business-rules/test/state-machine.spec.ts` — covers TCKT-03, exceptions
- [ ] `packages/business-rules/test/billing.spec.ts` — covers BILL-01, BILL-03, BILL-04, BILL-05
- [ ] `packages/business-rules/test/sla.spec.ts` — covers SLA-02
- [ ] `packages/business-rules/test/assignments.spec.ts` — covers CARE-01, CARE-03
- [ ] `packages/business-rules/test/invariants.spec.ts` — property tests with `fast-check`

## Security Domain (ASVS L1)

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---|---|---|
| **V2 Authentication** | Yes | Two-Root Auth schema separating `Person` (external) from `InternalUser` (internal multi-role). Secure bcrypt password hashes. |
| **V3 Session Management** | Yes | Explicit `tokenType` ('EXTERNAL' vs 'INTERNAL') embedded in JWT payloads to prevent cross-surface privilege confusion. |
| **V4 Access Control** | Yes | Care Officer assignment strictly gated by `CARE_OFFICER_MANAGER` role in `@poco/business-rules` and API layer. |
| **V5 Input Validation** | Yes | Comprehensive Zod schemas in `@poco/validation` with strict length, range, and format constraints. |
| **V6 Cryptography** | Yes | HMAC-SHA256 signature verification for inbound partner webhooks; standard bcrypt credential hashing. |

### Known Threat Patterns & Mitigations

| Pattern | STRIDE | Standard Mitigation |
|---|---|---|
| **Cross-Surface Token Confusion** | Spoofing | Disjoint JWT payloads (`ExternalJwtPayload` vs `InternalJwtPayload`) with verified `tokenType` claims. |
| **Negative Balance Exploitation** | Tampering | Billing engine strictly limits negative wallet balances to emergency-tagged services with audit logging. |
| **Unauthorized Care Officer Assignment** | Elevation of Privilege | Assignment validator enforces `CARE_OFFICER_MANAGER` role check on caller before permitting officer binding. |
| **Webhook Replay Attack** | Tampering / Repudiation | `WebhookEvent` table with unique `idempotencyKey` and HMAC-SHA256 signature verification. |
| **Integer Overflow / Float Manipulation** | Tampering | Integer paise representation bounded by Zod schema limits (min ₹100, max ₹1,00,000 per transaction). |

## Sources

### Primary (HIGH confidence)
- `docs/poco-elder-care-design-brief.md` — Authoritative baseline requirements for 1GB droplet, 3-step billing hierarchy, dual SLA tracking, 1:1 Care Officer mapping, and offline sync.
- `.planning/phases/01-monorepo-foundation-prisma-schema-dry-business-rules/01-CONTEXT.md` — User decisions D-01 through D-152 for Phase 01.
- `.planning/REQUIREMENTS.md` & `.planning/PROJECT.md` — Active project requirements matrix and domain boundaries.
- `.planning/research/STACK.md` & `.planning/research/ARCHITECTURE.md` — Monorepo topology, shared package boundaries, and container architecture.
- Official Prisma 6 Documentation (`prisma.io/docs/orm/prisma-schema/overview/location#multi-file-prisma-schema`) — Multi-file Prisma schema configuration.
- Official Turborepo Documentation (`turbo.build/repo/docs`) — Monorepo workspace pipeline configuration.

### Secondary (MEDIUM confidence)
- Official npm registry package releases verified via CLI (`turbo@2.10.12`, `tsup@8.5.1`, `prisma@6.2.0`, `zod@3.24.1`, `vitest@2.1.8`).

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — Verified package versions against registry and local Node 22 / pnpm 10 environment.
- Architecture: HIGH — Exhaustive alignment with locked decisions D-01 through D-152 and system design brief.
- Pitfalls: HIGH — Specific mitigation strategies for monorepo build pipelines, integer currency, and UTC/IST timezone handling.

**Research date:** 2026-08-31
**Valid until:** 2026-09-30 (30 days)

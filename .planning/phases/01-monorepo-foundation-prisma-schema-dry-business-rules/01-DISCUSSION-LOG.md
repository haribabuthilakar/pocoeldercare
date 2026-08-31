# Phase 01: Monorepo Foundation, Prisma Schema & DRY Business Rules - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-08-31
**Phase:** 01-monorepo-foundation-prisma-schema-dry-business-rules
**Areas discussed:** Monorepo Package Structure & Build Tooling, Prisma Schema Architecture & ID/Money Conventions, Business Rules & State Machine API Contracts, Zod Validation & Type Derivation Strategy, Design Tokens & Tailwind Preset Architecture, Dual JWT Auth Payload Types & Token Contracts, Mock Data Factories & Test Fixture Helpers, Database Migration Baseline & CI Seed Strategy, Cross-Field Zod Validation Refinements, Local Windows/Docker Dev Workflow & 1GB Droplet Deployment

---

## 1. Monorepo Package Structure & Build Tooling

| Option | Description | Selected |
|--------|-------------|----------|
| `tsup` | Fast esbuild-based dual ESM/CJS bundling with DTS generation | ✓ |
| Dedicated `@poco/database` package | Houses schema.prisma, migrations, seeds, typed PrismaClient | ✓ |
| Shared tooling packages (`@poco/tsconfig`, `@poco/eslint-config`) | Base presets extended across all packages/apps | ✓ |
| Strict package exports map with `tsup --watch` in dev | Enables live cross-package hot-reloading | ✓ |
| Pure `@poco/design-tokens` + `@poco/ui` web + `field-app` mobile | Tokens shared, web primitives in @poco/ui, mobile in field-app | ✓ |
| pnpm catalog / synchronized versions | Unified React 19, Prisma 6, TS 5.7, Zod 3.24 across workspace | ✓ |
| Package-level Vitest configs | Each package has vitest.config.ts orchestrated via turbo test | ✓ |
| Docker Compose required for dev | All local development and migrations inside Docker containers | ✓ |
| Full multi-service Docker Compose | Postgres, NestJS backend, Next.js portals, Adminer DB GUI | ✓ |
| Husky + lint-staged + Commitlint | Formats, lints, and checks conventional commits before git commit | ✓ |
| Distinct package boundaries | @poco/constants, @poco/types, @poco/business-rules | ✓ |
| `turbo.json` pipeline dependency (`dependsOn: ["^db:generate"]`) | Automatically generates Prisma Client before build/dev | ✓ |
| Strict engine enforcement (`.nvmrc` v22 + `.npmrc` + `engines`) | Pins Node 22 LTS across all developer environments | ✓ |
| `@poco/*` scope | @poco/database, @poco/types, @poco/validation, etc. | ✓ |
| Standard Expo Metro config with `watchFolders` | Resolves @poco/* symlinks and exports in pnpm monorepo | ✓ |
| ESLint boundary rules (`import/no-restricted-paths`) | Forbids cross-app imports and backend-to-UI dependencies | ✓ |
| In-app UI showcase / dev preview pages | Inside Admin and Family portals (lightweight, zero extra build overhead) | ✓ |
| Synchronized `0.0.0` with `workspace:*` | Zero-overhead internal linkage | ✓ |
| Lightweight logger types & `DomainError` classes | Pure interfaces in shared packages, concrete logging in apps | ✓ |
| `tsup` with sourcemap: true, dts: true, clean: true, dual ESM/CJS | Full debugging support and cross-platform compatibility | ✓ |

---

## 2. Prisma Schema Architecture & ID/Money Conventions

| Option | Description | Selected |
|--------|-------------|----------|
| Modular `prismaSchemaFolder` | packages/database/prisma/schema/*.prisma (auth, household, ticket, billing, etc.) | ✓ |
| UUID strings (`@id @default(uuid())`) | Compatible with WatermelonDB offline UUIDs, S3 keys, and REST APIs | ✓ |
| Integer in Paise (`1 INR = 100 paise`) | Exact integer math, zero float rounding bugs, matches Razorpay | ✓ |
| UTC DateTime with soft-deletes (`deletedAt DateTime?`) | Stored in UTC, formatted to IST in UI, soft-deletes on core models | ✓ |
| Immutable Version Tables (`PackageVersion`, `ServiceCatalogVersion`, `SopStepVersion`) | Subscriptions & tickets link to version FKs, grandfathering rates | ✓ |
| Direct 1:1 Unique FK (`Household.assignedCareOfficerId @unique`) + reporting line `managerId` | Strict 1:1 household mapping with self-relation for managers | ✓ |
| Native PostgreSQL Enums in Prisma schema | PostgreSQL native enum types with auto-generated TypeScript enums | ✓ |
| Explicit Composite Indexes | @@index([householdId, createdAt(Desc)]), @@index([slaStatus, responseDueAt]) | ✓ |
| Strict Two-Root Auth Schema | Person + HouseholdMembership (external); InternalUser + InternalUserRole (internal) | ✓ |
| Immutable Transaction Ledger (`HouseholdWallet` + `WalletTransaction`) | Audit-safe ledger with balanceAfterPaise and reference FKs | ✓ |
| Structured Certification & Join Table | Certification + CareOfficerCertification + requiredCertifications on Service/Package | ✓ |
| Unified `IntegrationPartner` table | partnerCode enum, status, mockSettings Json, lastPingAt | ✓ |
| Unified `ActivityFeedItem` model | Single timeline for chats, events, vitals, visit reports with aiTriageStatus | ✓ |
| 1-to-Many (`Ticket` -> `ServiceRequest[]`) | Parent incident/SLA tracking 1..N child catalog service requests with SOPs | ✓ |
| Dedicated `SeniorMedicalProfile` relation | Separates clinical baseline (blood group, allergies, ICE, ABHA) from demographics | ✓ |
| Relational `FamilyEscalationTier` model | Configurable multi-tier escalation hierarchy per household | ✓ |
| Distinct `Lead` & `OnboardingVisit` models | Lead tracks sales funnel -> convertedHouseholdId; OnboardingVisit tracks activation | ✓ |
| Relational `QuotaAllocation` records per billing cycle | Tracks allocatedUnits, usedUnits, and cycle dates for immediate quota checks | ✓ |
| Narrow `SeniorVitalReading` model | Indexed on seniorId, recordedAt(Desc) for fast wellness charting | ✓ |
| `CareOfficerVisitLog` model | GPS coordinates, distanceMeters, isGeofenceVerified linked to visit | ✓ |
| `WebhookEvent` table | source, idempotencyKey @unique, payload Json, status, errorMessage | ✓ |
| Central `MediaAttachment` model | Tracks s3Key, mimeType, fileSize, entityType, entityId, uploaderId | ✓ |
| Centralized `AuditLog` model | Tracks actor, action, beforeState/afterState diff Json for compliance | ✓ |
| Key-value `SystemConfig` model | Cached in LRU cache for dynamic runtime adjustment | ✓ |
| Strict Restrict/NoAction on business & financial entities | Cascade strictly limited to ephemeral progress/joins | ✓ |
| Standard `public` schema + `pgboss` queue schema | Low overhead on 1GB droplet | ✓ |
| Typed `PrismaClient` singleton with extensions | Soft-delete extensions and connection pooling in @poco/database | ✓ |
| Standard `prisma migrate` with `tsx src/seed.ts` | Reproducible migrations and test data runner | ✓ |

---

## 3. Business Rules & State Machine API Contracts

| Option | Description | Selected |
|--------|-------------|----------|
| Pure functional transition functions | `transitionTicket(currentState, event, ctx)` returning `TransitionResult` | ✓ |
| Pure Billing Decision Evaluator (`evaluateBillingAction`) | Returns structured action (AUTO_DEBIT_QUOTA, AUTO_DEBIT_WALLET, etc.) | ✓ |
| Pure SLA Calculators (`calculateSlaDeadlines`, `evaluateSlaStatus`) | 75% At-Risk threshold + Senior Care Officer fallback escalation | ✓ |
| Pure Assignment Validator (`validateCareOfficerAssignment`) | Enforces Manager role, 1:1 exclusivity, unexpired certifications | ✓ |
| Deterministic Rollup Calculator (`calculateTicketRollupStatus`) | Any child exception -> WAITING_OPS_UPDATE; all done -> COMPLETED | ✓ |
| Tagged Union Result Pattern (`{ success: true, data: T } | { success: false, error: DomainError }`) | Pure, testable functional returns | ✓ |
| Dedicated Financial Math Module (`calculateGst`, `calculateWalletDebit`, `formatInr`) | Exact integer paise arithmetic | ✓ |
| AI Triage Rule function (`evaluateAiClassificationResult`) | 0.75 confidence threshold and priority mapping in business rules | ✓ |
| Strict "Use-It-or-Lose-It" subscription cycle reset | Unused quotas reset to package baseline every period start | ✓ |
| Pure Haversine formula functions | calculateDistanceMeters & validateGeofence (200m radius) with zero deps | ✓ |
| Pure Family Escalation Evaluator (`evaluateFamilyEscalation`) | Computes active tier and notification recipients based on elapsed minutes | ✓ |
| Pure SOP Progress Validator (`validateSopProgress`) | Verifies checklist steps, photo proofs, and choice selections | ✓ |
| Deterministic Vital Severity Evaluator (`evaluateVitalReadingSeverity`) | Checks clinical boundaries (BP, SpO2, pulse, glucose, fall alerts) | ✓ |
| Pure Lead Conversion Validator (`validateLeadConversion`) | Verifies sales requirements, senior details, package, and primary family | ✓ |
| Grandfathered Price Resolver (`resolveServicePricing`) | Resolves rates from immutable version based on subscription creation date | ✓ |
| Transition Guards returning typed domain errors | CANNOT_COMPLETE_UNVERIFIED_GEOFENCE, CANNOT_CLOSE_OPEN_CHILDREN | ✓ |
| Centralized Capability Matrix (`hasCapability(roles, capability)`) | Maps multi-roles to domain capabilities in business rules | ✓ |
| Reassignment Rule Evaluator (`evaluateCareOfficerReassignment`) | Validates Manager role, checks certifications, re-routes active tickets | ✓ |
| Wallet Hold & Settlement Calculators | Exact hold, debit, and refund amount calculations | ✓ |
| Dedicated Indian Format Validators | validateIndianPhoneNumber (+91), validateAbhaId, validatePinCode (6-digit) | ✓ |

---

## 4. Zod Validation & Type Derivation Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Hand-crafted Zod 3.24+ schemas in `@poco/validation` | Explicit contracts for REST API and React Hook Form with `z.infer` | ✓ |
| Three-layer type architecture | @poco/database (Prisma), @poco/validation (DTOs), @poco/types (domain/JWT) | ✓ |
| Lightweight `ZodValidationPipe` in NestJS | Controllers use @UsePipes(new ZodValidationPipe(schema)) | ✓ |
| Zod schemas with `zod-to-json-schema` for Claude | Converts Zod schemas to structured tool output JSON Schema | ✓ |
| Surface-namespaced modules (`src/family/*`, `src/field/*`, `src/admin/*`, `src/webhooks/*`) | Directly mirrors surface-versioned REST API | ✓ |
| Reusable Pagination & Filter Schemas | `paginationQuerySchema` (default 20, max 100), `dateRangeSchema` | ✓ |
| Normalized Error Transformer (`formatZodError`) | Returns structured field-level error arrays `{ field, message, code }` | ✓ |
| Strict Partner Webhook Schemas in `src/webhooks/*` | Validates Razorpay, Exotel, Wearable, Pococare payload structures | ✓ |
| Discriminated Union Schemas (`createRoutineTicketSchema | createEmergencyTicketSchema`) | Cleanest type narrowing and auto-complete | ✓ |
| Strict Paise Integer bounds in wallet schemas | Min 10,000 paise (₹100), Max 10,000,000 paise (₹1,00,000) | ✓ |
| `dateRangeSchema` with `.refine(endDate >= startDate)` | Points validation errors directly to `endDate` field path | ✓ |
| Discriminated Union Vital Schemas with clinical bounds | BP systolic > diastolic, SpO2 50-100%, Glucose 20-600 | ✓ |

---

## 5. Design Tokens & Tailwind Preset Architecture

| Option | Description | Selected |
|--------|-------------|----------|
| Semantic Design Tokens with CSS Variables in Tailwind preset | Warm elder-care palette with theme variable abstraction | ✓ |
| Senior-friendly typography scale | 18px base for senior views, 14px for ops admin; WCAG AAA 7:1 contrast | ✓ |
| Shared Tailwind Preset (`pocoPreset`) | Both Next.js apps inherit identical colors, radius, fonts, animations | ✓ |
| Semantic Keyframe Animations in Tailwind preset | `pulse-subtle` for at-risk tickets, `fade-in-warm` for feeds | ✓ |
| Dual Density Tokens | `compact` for Admin data tables vs `comfortable` (>=48px touch targets) for Family/Senior | ✓ |
| Semantic Status Color Maps | `slaStatusTokens`, `ticketStatusTokens`, `triageStatusTokens` | ✓ |
| Class/data-theme dark mode with CSS variables | Defaults to warm calming light theme with dark mode support | ✓ |
| Curated Lucide Icon Wrappers in `@poco/ui` | 1.75px stroke width, accessible labels, consistent sizing presets | ✓ |
| Surface-aware Radius & Shadows | Soft `rounded-2xl` for Family/Senior; crisp `rounded-lg` for Admin tables | ✓ |
| Custom Brand Palette: `#12C395`, `#FE1D8F`, `#6BAAD0` | Vibrant mint/emerald primary, vibrant magenta/rose alert, soft cerulean blue | ✓ |
| CVA component variants in `@poco/ui` | Primary `#12C395`, Accent `#FE1D8F`, Info `#6BAAD0` with focus rings | ✓ |
| Sonner Toast System themed with Poco brand tokens | `#12C395` success, `#FE1D8F` alert, `#6BAAD0` info with ARIA live regions | ✓ |
| Semantic Chart Palette | Vitals: BP Systolic `#FE1D8F`, BP Diastolic `#6BAAD0`, Pulse `#12C395`, Quota progress tokens | ✓ |
| `data-contrast="high"` senior readability overrides | 2px solid borders, bold weights, 10:1+ contrast ratios | ✓ |
| Dual exports from `@poco/design-tokens` | `pocoPreset` for Tailwind web + pure JS token objects for React Native | ✓ |
| Dedicated `IceBadge` & `EmergencyAlertCard` in `@poco/ui` | `#FE1D8F` accents, pulse animations, high-visibility clinical callouts | ✓ |
| Distinct Activity Feed Bubble Variants | Family `#12C395`, Officer `#6BAAD0`, System slate, Emergency `#FE1D8F`, AI triage pill | ✓ |
| High-Density `DataTable` in `@poco/ui` | Compact 8px padding, sticky header, row hover tint, monospace IDs, SLA badge cells | ✓ |
| Responsive Modal/Sheet component | Centered Dialog on desktop (`>= 768px`), Bottom Slide-Up Sheet on mobile (`< 768px`) | ✓ |
| Standardized 2px `#12C395` keyboard focus rings | `focus-visible:ring-2` with Radix ARIA accessibility primitives | ✓ |
| Warm Shimmer Skeletons | `SkeletonCard`, `SkeletonVitalsChart`, `SkeletonFeedItem` with gentle pulse animations | ✓ |
| Form Field error states | `#FE1D8F` border, error shake animation, accessible error text with `IconAlertCircle` | ✓ |
| Built-in `isLoading` prop on `Button` | Centered spinner, disables clicks, sets `aria-busy="true"` | ✓ |
| Radix `DropdownMenu` with `rounded-xl` | Scale-in animation, icon slots, subtle `#12C395` focus highlight | ✓ |
| CVA `Card` variants | `default`, `elevated`, `outlined`, `urgent` with `#FE1D8F` left border & glow | ✓ |
| CVA `Badge` variants | `primary #12C395`, `secondary #6BAAD0`, `destructive #FE1D8F`, warning, outline, dot | ✓ |
| `Avatar` with health `statusRing` | Initials fallback + ring indicator (active, at_risk, emergency) for seniors | ✓ |
| `WizardStepper` component | Circular status pills, filled `#12C395` progress track, ARIA step attributes | ✓ |
| Reassuring `EmptyState` component | Gentle icon, empathetic title ("All quiet & well"), description, action button | ✓ |
| Radix Tabs with `pill` and `underline` variants | Segmented `#12C395` toggle pill and clean bottom border indicator | ✓ |
| Radix `Switch` & `Checkbox` primitives | `#12C395` active state, white checkmark/thumb, smooth 150ms transition | ✓ |
| Radix `Tooltip` & `Popover` | Dark slate background, white text, arrow pointer, 200ms delay prevention | ✓ |

---

## 6. Dual JWT Auth Payload Types & Token Contracts

| Option | Description | Selected |
|--------|-------------|----------|
| `ExternalJwtPayload` in `@poco/types` | `{ sub: personId, householdId, role: FamilyRole, phone, tokenType: 'EXTERNAL' }` | ✓ |
| `InternalJwtPayload` in `@poco/types` | `{ sub: internalUserId, email, roles: UserRole[], tokenType: 'INTERNAL', assignedTerritories }` | ✓ |
| Dual Access + Refresh Token contracts | 15m web / 7d mobile access token + rotating `RefreshTokenPayload` | ✓ |
| Typed `WebhookVerificationContext` + HMAC-SHA256 | Pure HMAC-SHA256 signature verification in `@poco/business-rules` | ✓ |

---

## 7. Mock Data Factories & Test Fixture Helpers

| Option | Description | Selected |
|--------|-------------|----------|
| Dedicated `@poco/business-rules/testing` export | Strongly-typed factory functions (createMockTicket, createMockHousehold, createMockWallet) with partial overrides | ✓ |
| Curated Indian Elder Care Fixtures | Kavach/Sahara/Sampoorna packages, realistic Indian seniors/ICE, Bangalore/Chennai test addresses | ✓ |
| Scenario Helper Functions | `setupAtRiskTicketScenario`, `setupEmergencyNegativeBalanceScenario` assembling rich test state in 1-2 lines | ✓ |
| Vitest fake timers (`vi.useFakeTimers`) + `now: Date` parameter | Explicit now parameter injection in business rule functions for deterministic time testing | ✓ |
| Deterministic UUID helper (`mockUuid('household-1')`) | Predictable valid UUIDv4s for readable and stable test diffs | ✓ |
| Custom Vitest Matchers (`expect(result).toBeSuccess()`, `expect(ticket).toBeInSlaStatus('AT_RISK')`) | Readable domain-specific assertion matchers | ✓ |
| Strict 100% test coverage threshold on `@poco/business-rules` | Enforced on state machines, SLA timers, billing rules | ✓ |
| Comprehensive Edge Case Fixtures | Expired certs, negative wallet exceeding limit, leap-year rollover, vital alert spikes, exception rollups | ✓ |
| Property-based invariant testing with `fast-check` | Verifying money conservation, GST rounding, state graph integrity | ✓ |
| `TestTime` helper module (`BASE_TEST_TIME` + `timeAfter`, `timeBefore`) | Readable relative timestamp math for SLA tests | ✓ |
| Vitest worker thread pool (`pool: 'threads'`, isolated test environments) | Sub-100ms execution for all unit test suites | ✓ |
| Deterministic Snapshot Serializer | Normalizes timestamps/memory IDs for cross-platform stability on Windows and Linux CI | ✓ |
| Typed Partner Mock Factories | `createMockRazorpayWebhook`, `createMockExotelCallEvent`, `createMockPococareSync` in testing module | ✓ |
| Transaction Rollback Utility (`withTestDatabaseTransaction`) | Runs tests inside an uncommitted transaction with zero cleanup overhead | ✓ |
| Vitest Benchmark Suites (`bench()` in `*.bench.ts`) | Verifies microsecond execution throughput for state machines and SLA scanners | ✓ |
| Partner Failure Simulator (`simulatePartnerFailure`) | Realistic failure payloads for timeouts, signature mismatch, 500 errors, network drops | ✓ |

---

## 8. Database Migration Baseline & CI Seed Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Clean initial baseline migration (`0_init` via `prisma migrate dev --name init`) | Complete schema and composite indexes | ✓ |
| `prisma.upsert()` with deterministic fixed UUIDs in `src/seed.ts` | Completely idempotent; running db:seed multiple times safely updates records without duplicates | ✓ |
| Two-Tier Seed System (`db:seed` minimal baseline vs `db:seed:realistic` Phase 4 scale) | Clean separation of baseline vs heavy test data | ✓ |
| `pnpm db:reset` (`prisma migrate reset --force + seed`) with strict `NODE_ENV !== 'production'` check | Safe, reproducible database reset workflow | ✓ |
| Seed all role-specialized staff accounts (`admin@`, `ops@`, `manager@`, `officer@`) with bcrypt hashes & fixed UUIDs | Instant local login for all roles | ✓ |
| Seed all 12 core elder care services with structured SOP steps in `ServiceCatalogVersion` v1 | Complete operational service baseline | ✓ |
| Seed 3 baseline packages in `PackageVersion` v1 (Kavach ₹500, Sahara ₹3,000, Sampoorna ₹12,500) | Quota allocations and grandfathered pricing baseline | ✓ |
| Seed all 12 `IntegrationPartner` rows with `status: 'MOCK_ONLY'` | Default mock latency and webhook secret configurations | ✓ |
| Seed 3 representative demo households in baseline seed | Sahara active with vitals, Kavach fresh, Sampoorna NRI with open ticket for immediate manual testing | ✓ |
| Post-seed sanity check & console summary table | Verifies entity counts, admin login readiness, active catalog status | ✓ |
| Conservative PostgreSQL connection pool (`connection_limit=10`, `pool_timeout=15s`) in `DATABASE_URL` | Conserves memory on 1GB DigitalOcean droplet (~20MB pool footprint) | ✓ |
| Docker healthcheck with `pg_isready` and `condition: service_healthy` | Zero startup race conditions during container boot | ✓ |

---

## 9. Local Windows/Docker Dev Workflow, Manual Testability & 1GB Droplet Deployment

| Option | Description | Selected |
|--------|-------------|----------|
| `docker-compose.yml` + `docker-compose.override.yml` for local Windows dev | Volume mounts, polling watch, ports 3000/3001/4000/5432/8080 for instant manual testing | ✓ |
| 3-Container 1GB DO Topology (Postgres 200MB + NestJS 350MB + Nginx/Next.js standalone 200MB) | Strict memory limits, 2GB swapfile, fits within 1GB droplet | ✓ |
| In-Portal Dev Testbench (`/admin/dev-tools`) | 1-click actor switcher (Admin/Ops/Manager/Officer/Family), simulated partner triggers, seed reset button | ✓ |
| Single `deploy.sh` script + `docker-compose.prod.yml` | 2GB swapfile setup, Docker install, Prisma migrations, Nginx SSL, /api/health verification | ✓ |
| Strict `.gitattributes` (`* text=auto eol=lf`) + WSL 2 Docker backend with `CHOKIDAR_USEPOLLING=true` | Reliable Windows file watching and zero CRLF script execution failures | ✓ |
| Production Nginx reverse proxy with path routing (`/api -> 4000`, `/admin -> 3000`, `/ -> 3001`) | Security headers, gzip compression, rate limits (auth 20/min) | ✓ |
| Docker `json-file` log rotation (`max-size: 10m`, `max-file: 3`) on all containers | Caps total disk logging below 100MB permanently on 25GB droplet SSD | ✓ |
| Automated Nightly `backup.sh` cron (`pg_dump` compressed -> S3/Spaces bucket with 7-day retention) | Automated database backup and disaster recovery snapshots | ✓ |

---

## the agent's Discretion

- Exact naming and placement of internal utility helper functions within `@poco/business-rules` and `@poco/database`.
- Specific Tailwind plugin hook names in `@poco/design-tokens`.

## Deferred Ideas

- None — discussion stayed within phase scope.

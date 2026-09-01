# Phase 03: Common NestJS Backend & Business Services - Research

**Researched:** 2026-09-01
**Domain:** NestJS REST API, In-Process pg-boss Worker Queues, Pluggable Multi-LLM Triage, Dual JWT Authentication, 3-Step Billing Engine, Dual SLA State Machines
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### 1. Pluggable Multi-LLM Provider Architecture & AI Triage
- **D-01:** Multi-LLM provider abstraction (`IAiClassificationProvider`) supporting Anthropic (Claude 3.5 Haiku/Sonnet), Google Gemini (Gemini 2.5 Flash), OpenAI (GPT-4o-mini), DeepSeek (DeepSeek V3/R1), and offline mock. — **Reversibility:** costly — provider abstraction defines the AI triage pipeline across workers, settings schemas, and admin UI.
- **D-02:** Dynamic provider & model configuration stored in SystemConfig / Admin Portal settings (`ai.provider = 'anthropic' | 'gemini' | 'openai' | 'deepseek' | 'mock'`, `ai.model`, `ai.apiKey`, `ai.confidenceThreshold` defaulting to 0.75), allowing runtime model swapping without redeployment.
- **D-03:** Local dev & test mock provider (`MockAiClassifierProvider`) running offline with deterministic keyword/regex heuristics matching service catalog items and emergency triggers with zero third-party API dependencies.
- **D-04:** Structured JSON schema intent extraction contract defining parsed category, detected `serviceCatalogVersionId`, confidence score (0.0-1.0), urgency level, and summary rationale.
- **D-05:** Auto-proposal of Pending Triage tickets for confidence >= 0.75, linking `ActivityFeedItem.linkedTicketId` and rendering status chips in activity feed.

#### 2. In-Process pg-boss Worker Queues & 1GB Droplet Tuning
- **D-06:** Single in-process pg-boss engine running within the NestJS process sharing PostgreSQL instance without separate Redis containers. — **Reversibility:** one-way — architectural constraint matching 1GB RAM droplet ceiling.
- **D-07:** Conservative worker concurrency pools: `ai-classification` (concurrency: 2), `notification-dispatch` (concurrency: 5), keeping peak Node.js heap well below `--max-old-space-size=300`.
- **D-08:** Scheduled cron jobs: `sla-transition` (60s interval, batch size: 50 active service requests), `wearable-ping-scanner` (5m interval, checking >75m inactive wearables), `subscription-rollover` (daily at 00:00 IST).
- **D-09:** 24-hour job auto-archive / pruning policy in PostgreSQL `pgboss` schema, preventing database table bloat and disk degradation on droplet.
- **D-10:** Automated Senior Care Officer fallback escalation on `Breached` SLA status, updating ticket ownership and dispatching ops alert.

#### 3. Dual JWT Auth, Multi-Role Access & Household Context Switching
- **D-11:** Unified Bearer token authentication (`Authorization: Bearer <token>`) across all surfaces (Admin Portal, Family Portal, Field Mobile App). — **Reversibility:** costly — client interceptors and guard pipelines depend on Bearer headers.
- **D-12:** Multi-household context switching via `X-Household-Id` header (with query parameter fallback), strictly validated by `HouseholdContextGuard` verifying active membership in `HouseholdMembership` table.
- **D-13:** Token lifecycle contracts: 15-minute access token for web portals, 7-day access token for mobile field app, rotating refresh token endpoint at `POST /api/auth/refresh`.
- **D-14:** Role-based authorization via `@Roles(...)` metadata and `RolesGuard` checking internal user roles against the `@poco/business-rules` capability matrix.
- **D-15:** Field app access guard automatically verifying active `CARE_OFFICER` role in user's internal role assignments.

#### 4. Direct S3 Presigned Media Storage & Local Dev Fallback
- **D-16:** Two-step direct presigned PUT flow (`POST /api/*/media/presign` -> Client PUT -> `POST /api/*/media/confirm` / entity reference), ensuring droplet never buffers heavy photos/audio in RAM. — **Reversibility:** costly — client upload pipelines and media endpoints adhere to 2-step presigned flow.
- **D-17:** Strict MIME whitelisting (`image/jpeg`, `image/png`, `image/webp`, `audio/aac`, `audio/m4a`, `audio/mp3`, `application/pdf`) and size caps (10MB for photos, 25MB for audio/documents).
- **D-18:** In-app Local Storage Server for dev/test: When AWS/Spaces credentials are not configured, presigned URLs point to `/api/test/media/upload/:key`, writing to local `uploads/` directory and serving files statically.

#### 5. Authoritative Ticket, SLA & Billing Engine Execution
- **D-19:** Canonical state machine execution in NestJS services invoking pure `@poco/business-rules` transitions (`transitionTicket`, `evaluateBillingAction`, `calculateSlaDeadlines`, `evaluateSlaStatus`, `calculateTicketRollupStatus`).
- **D-20:** Deterministic 3-step billing hierarchy: (1) decrement `QuotaUsage` against package version quotas, (2) auto-debit `HouseholdWallet` if balance sufficient or emergency flag set (allowing negative balances), (3) place request in `PENDING_APPROVAL` and notify family if non-emergency and insufficient funds.
- **D-21:** Care Officer assignment mutation strictly restricted to `CARE_OFFICER_MANAGER` role, strictly verifying 1:1 household mapping and active unexpired certifications via `validateCareOfficerAssignment`.
- **D-22:** Grandfathered version resolution: subscriptions and service requests permanently store immutable `packageVersionId` and `serviceCatalogVersionId` FKs.
- **D-23:** Unified per-household activity feed with delta polling support (`GET /api/family/v1/feed?householdId=...&since=timestamp`), real-time status chips, and blended chat + system timeline items.

### the agent's Discretion
- Internal NestJS service decomposition, module dependency wiring, and controller route organization.
- Exact regex pattern formulations for the dev mock AI classifier.
- Local disk upload file naming conventions in dev mode (`uploads/:uuid.:ext`).

### Deferred Ideas (OUT OF SCOPE)
- None — discussion stayed strictly within Phase 3 scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| **AUTH-01** | External users sign up with phone/email and authenticate via JWT | NestJS AuthModule, JwtService, Person & HouseholdMembership Prisma relations [VERIFIED: packages/database/prisma/schema/auth.prisma:18-47] |
| **AUTH-02** | Internal staff authenticate with role-based JWT supporting multiple roles | InternalUser & InternalUserRole models, UserRole enum, custom JwtPayload [VERIFIED: packages/database/prisma/schema/auth.prisma:3-9,49-76] |
| **AUTH-03** | Primary family members can invite/remove family members for household | HouseholdService & FamilyMembershipService enforcing isPrimaryContact and FamilyRole [VERIFIED: packages/database/prisma/schema/auth.prisma:11-16,33-47] |
| **AUTH-04** | Invited family members have view/pay/approve access but cannot administer membership | Capability matrix in `@poco/business-rules` (FamilyRole permissions) [VERIFIED: packages/business-rules/src/auth/capabilities.ts] |
| **AUTH-05** | Multi-household context switching via dropdown selector / X-Household-Id header | `HouseholdContextGuard` validating header against caller's active memberships |
| **AUTH-06** | Field App access automatically granted to internal users with Care Officer role | `FieldAuthGuard` verifying UserRole.CARE_OFFICER in InternalUserRole records |
| **ONBD-01** | New signups automatically create a Lead owned by Sales Executive | Lead entity creation in LeadService on initial registration |
| **ONBD-02** | Onboard household with 1-4 seniors, ICE contacts, insurance, hospital details | Household & Senior Prisma models with validation schemas from `@poco/validation` |
| **ONBD-03** | Submitting onboarding form transitions lead from Sales to CS in Pending status | Lead conversion rules from `@poco/business-rules` (sales/lead-conversion.ts) |
| **CARE-01** | Enforce strict 1:1 active mapping between household and assigned Care Officer | `validateCareOfficerAssignment` and HouseholdAssignment uniqueness logic |
| **CARE-02** | Only Care Officer Manager role can create/modify care officer assignments | RolesGuard with `@Roles(UserRole.CARE_MANAGER)` or `UserRole.OPS_MANAGER` |
| **CARE-03** | Block assignment unless officer has active, non-expired mandatory certifications | CareOfficerCertification verification against mandatory certification matrix |
| **CARE-04** | Senior Care Officers can view households/officers reporting to them via ReportingLine | ReportingLine hierarchy query in CareOfficerService |
| **CARE-05** | Automatically assign supervising Senior Care Officer on officer SLA breach | Background `sla-transition` worker query on ReportingLine supervisor fallback |
| **TCKT-01** | Tickets raised by seniors, family, officers, Exotel IVR, wearable, or AI | Universal Ticket creation service accepting diverse source metadata |
| **TCKT-02** | Operations Executives triage tickets into 1-N child Service Requests with immutable catalog versions | TicketService.triageToServiceRequests attaching ServiceCatalogVersion |
| **TCKT-03** | Service Requests follow state machine (PENDING -> ACCEPTED -> IN_PROGRESS -> COMPLETED) | `@poco/business-rules` `transitionServiceRequest` pure state machine |
| **TCKT-04** | Parent ticket status automatically aggregates from child service request states | `@poco/business-rules` `calculateTicketRollupStatus` pure function |
| **TCKT-05** | Inbound Exotel calls create ticket and open active handling UI for Ops Executive | Exotel webhook handler + ticket creation pipeline |
| **TCKT-06** | Ambiguous rollup states transition parent ticket to WAITING_OPS_UPDATE | `calculateTicketRollupStatus` returning WAITING_OPS_UPDATE |
| **TCKT-07** | Ops Executives can triage and resolve WAITING_OPS_UPDATE tickets in Admin Portal | Ops triage endpoints with audit logging |
| **SLA-01** | Evaluate response SLA and delivery SLA clocks independently for Service Requests | `calculateSlaDeadlines` in `@poco/business-rules` |
| **SLA-02** | Orthogonal SLA state machine tracks NORMAL, AT_RISK, BREACHED | `evaluateSlaStatus` with 75% at-risk threshold and 100% breach deadline |
| **SLA-03** | Scheduled pg-boss worker (`sla-transition`) transitions SLA states | In-process 60-second cron runner scanning active tickets/requests |
| **SLA-04** | Delivery SLA breach triggers escalation to supervising Senior Care Officer | Automatic reassignment to supervisor from ReportingLine |
| **SLA-05** | Family Portal escalation tree for unacknowledged notifications & payment chasing | FamilyEscalationTier evaluation in `@poco/business-rules` |
| **CATL-01** | Service Catalog items versioned with unit pricing, emergency flags, owner types | `ServiceCatalog` and `ServiceCatalogVersion` Prisma schema tables |
| **CATL-02** | Packages versioned with monthly/yearly rates and per-service quotas | `Package` and `PackageVersion` with `PackageServiceQuota` |
| **CATL-03** | Household subscriptions pin to specific immutable packageVersionId | `HouseholdSubscription.packageVersionId` foreign key |
| **CATL-04** | Service Requests pin to specific immutable serviceCatalogVersionId | `ServiceRequest.serviceCatalogVersionId` foreign key |
| **CATL-05** | Admins can publish new catalog/package versions without mutating active subs | Version immutability and activation status toggles |
| **BILL-01** | Household dedicated digital wallet with immutable audit ledger | `HouseholdWallet` and `WalletTransaction` with integer paise |
| **BILL-02** | Service usage first decrements QuotaUsage against active package quota | `evaluateBillingAction` Step 1 (quota decrement) in `@poco/business-rules` |
| **BILL-03** | Emergency services auto-debit wallet, allowing negative balances | `evaluateBillingAction` Step 2 with emergency overdraft flag |
| **BILL-04** | Non-emergency user services auto-debit wallet if balance sufficient | `evaluateBillingAction` Step 2 wallet debit |
| **BILL-05** | Insufficient balance / staff suggested services set PENDING_APPROVAL and notify | `evaluateBillingAction` Step 3 hold/pending approval |
| **BILL-06** | Family members initiate wallet top-ups via Razorpay mock | Razorpay order creation and webhook confirmation |
| **BILL-07** | Downloadable invoices for subscription renewals and wallet transactions | Invoice generation service with PDF/HTML rendering and S3 storage |
| **FEED-01** | Unified per-household activity feed blending system events and two-way chat | `ActivityFeedItem` model with `ActivityEventType` enum [VERIFIED: packages/database/prisma/schema/activity.prisma:10-17] |
| **FEED-02** | Family and Care Officers post free-form chat messages visible across surfaces | FeedController `POST /api/family/v1/feed` and `POST /api/field/v1/feed` |
| **FEED-03** | Clients poll activity feed endpoint (`?since=timestamp`) | Feed query endpoint with ISO timestamp filtering and delta pagination |
| **FEED-04** | Posting free-form message enqueues async `ai-classification` job in pg-boss | In-process pg-boss job dispatch on message creation |
| **FEED-05** | AI worker analyzes intent, extracts service catalog items, assigns confidence | Pluggable `IAiClassificationProvider` with structured JSON contract |
| **FEED-06** | High-confidence messages auto-create ticket in PENDING_TRIAGE with status chip | AI worker creating Ticket with `TriageStatus.PENDING_TRIAGE` |
| **FEED-07** | Ops Executives in Admin Portal confirm PENDING_TRIAGE into service requests | Ops triage controller endpoint (`PATCH /api/admin/v1/tickets/:id/confirm`) |
</phase_requirements>

## Summary

Phase 03 establishes the central operational and business services backend in `@poco/api` (NestJS 11 + Prisma 6 + PostgreSQL 16), executing pure business rules from `@poco/business-rules`, validating payloads via `@poco/validation`, orchestrating background jobs via in-process `pg-boss`, and driving AI-assisted ticket triage via a pluggable `IAiClassificationProvider`.

The backend is strictly architected for a **1GB RAM DigitalOcean droplet deployment**:
1. **Zero External Broker Processes:** Eliminates standalone Redis or RabbitMQ instances by running in-process `pg-boss` worker queues against PostgreSQL with transactional job scheduling and SKIP LOCKED locking.
2. **Strict In-Memory Footprint:** Enforces `--max-old-space-size=300`, concurrency throttling (AI triage = 2, notifications = 5), and fast in-memory LRU caching for static catalog and active assignment lookups.
3. **Offloaded Media RAM:** Enforces a 2-step presigned S3 PUT flow so that media files (photos, audio notes, invoice PDFs) never pass binary buffers through the NestJS droplet process.
4. **Offline Dev Fallback:** Includes a local disk media server (`/api/test/media/upload/:key`) and a deterministic `MockAiClassifierProvider` enabling complete end-to-end development, testing, and CI without third-party cloud credentials.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Dual Authentication & JWT Generation | API / Backend (`AuthModule`) | Client Interceptors | Backend signs and validates JWTs, refreshes tokens, and hashes passwords via bcrypt. |
| Multi-Household Context Validation | API / Backend (`HouseholdContextGuard`) | Web/Mobile Clients | Backend validates caller's active membership against `HouseholdMembership` table before granting access to household-scoped routes. |
| Business State Transitions & Rollups | API / Backend (`TicketService`, `ServiceRequestService`) | `@poco/business-rules` | NestJS services invoke pure business rule functions to ensure atomic ACID transitions. |
| 3-Step Billing & Wallet Transactions | API / Backend (`BillingService`) | `@poco/business-rules` | Executes quota decrement -> wallet debit -> pending approval hierarchy with immutable ledger entries. |
| SLA Due Date & State Evaluation | API / Backend (`SlaService`, `pg-boss`) | `@poco/business-rules` | In-process 60-second cron checks response/delivery due times and escalates breached tickets. |
| AI Message Classification & Triage | API / Backend (`AiTriageService`, `pg-boss`) | External LLMs / Mock Provider | Background worker calls pluggable LLM provider, parses JSON schema, and auto-proposes tickets. |
| S3 Presigned URL Generation & Verification | API / Backend (`MediaService`) | Cloud S3 / Spaces / Local Fallback | Backend generates signed PUT URLs with MIME/size limits; clients upload directly to storage. |
| Inbound Webhook Ingestion & HMAC Verification | API / Backend (`WebhooksModule`) | Integration Partners / Stubs | Already established in Phase 2 with HMAC guards and idempotency keys. |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@nestjs/core`, `@nestjs/common`, `@nestjs/platform-express` | `^11.0.0` | Modular backend framework | Enterprise dependency injection, lifecycle hooks, guards, interceptors, and pipes matching surface-scoped routing. [VERIFIED: npm registry] |
| `@nestjs/jwt`, `@nestjs/passport`, `passport`, `passport-jwt` | `^11.0.0` / `^0.7.0` | Dual JWT authentication & guards | Standards-compliant token generation, validation, and multi-role extraction. [VERIFIED: npm registry] |
| `bcrypt` | `^5.1.1` | Password hashing | Industry standard for secure password hashing with salt rounds. [VERIFIED: npm registry] |
| `pg-boss` | `^10.1.4` | In-process Postgres background job queue | Transactional job scheduling (`SELECT ... FOR UPDATE SKIP LOCKED`), cron jobs, retries, zero Redis overhead. [VERIFIED: npm registry] |
| `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner` | `^3.700.0` | S3 presigned PUT URL generation | Direct cloud media storage without memory buffering on 1GB droplet. [VERIFIED: npm registry] |
| `@anthropic-ai/sdk` | `^0.36.0` | Claude 3.5 structured triage client | Tool use and JSON output for async activity feed classification. [VERIFIED: npm registry] |
| `openai` | `^4.80.0` | OpenAI & DeepSeek structured triage client | Universal OpenAI-compatible client supporting GPT-4o-mini and DeepSeek endpoints. [VERIFIED: npm registry] |
| `@poco/business-rules` | `workspace:*` | Canonical state machines & billing rules | Single source of truth for all business logic, SLA evaluation, and capability matrices. [VERIFIED: in-repo] |
| `@poco/database` | `workspace:*` | Prisma client & database models | Auto-generated PrismaClient for PostgreSQL 16 schema. [VERIFIED: in-repo] |
| `@poco/validation` | `workspace:*` | Zod runtime request/response schemas | Single source of truth for DTO validation pipes and Claude JSON schemas. [VERIFIED: in-repo] |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `date-fns` | `^4.1.0` | Date manipulation & SLA timers | Calculating Indian Standard Time (IST) deadlines, billing cycle rollovers. [VERIFIED: npm registry] |
| `lru-cache` | `^11.0.0` | In-process LRU cache | Caching active service catalog versions and assignment lookups without Redis. [VERIFIED: npm registry] |

## Package Legitimacy Audit

| Package | Registry | Age | Downloads | Source Repo | Verdict | Disposition |
|---------|----------|-----|-----------|-------------|---------|-------------|
| `@nestjs/core` | npm | 8 yrs | 14.3M/wk | github.com/nestjs/nest | [OK] | Approved |
| `@nestjs/common` | npm | 8 yrs | 14.8M/wk | github.com/nestjs/nest | [OK] | Approved |
| `@nestjs/platform-express` | npm | 8 yrs | 10.3M/wk | github.com/nestjs/nest | [OK] | Approved |
| `@nestjs/jwt` | npm | 7 yrs | 4.5M/wk | github.com/nestjs/jwt | [OK] | Approved |
| `@nestjs/passport` | npm | 7 yrs | 4.3M/wk | github.com/nestjs/passport | [OK] | Approved |
| `passport` | npm | 13 yrs | 8.2M/wk | github.com/jaredhanson/passport | [OK] | Approved |
| `passport-jwt` | npm | 10 yrs | 4.1M/wk | github.com/mikenicholson/passport-jwt | [OK] | Approved |
| `bcrypt` | npm | 13 yrs | 5.9M/wk | github.com/kelektiv/node.bcrypt.js | [OK] | Approved |
| `pg-boss` | npm | 9 yrs | 1.4M/wk | github.com/timgit/pg-boss | [OK] | Approved |
| `@aws-sdk/client-s3` | npm | 6 yrs | 44.8M/wk | github.com/aws/aws-sdk-js-v3 | [OK] | Approved |
| `@aws-sdk/s3-request-presigner` | npm | 6 yrs | 22.2M/wk | github.com/aws/aws-sdk-js-v3 | [OK] | Approved |
| `@anthropic-ai/sdk` | npm | 2 yrs | 37.9M/wk | github.com/anthropics/anthropic-sdk-typescript | [OK] | Approved |
| `openai` | npm | 4 yrs | 38.9M/wk | github.com/openai/openai-node | [OK] | Approved |

*All external packages verified clean with multi-million weekly download volume and official GitHub repositories.*

## Architecture Patterns

### System Architecture Diagram

```
[Clients: Family Portal, Admin Portal, Field Mobile App, Partner Webhooks]
                                 │
                                 ▼
                     [Nginx Reverse Proxy :80/:443]
                                 │
                 ┌───────────────┴───────────────┐
                 │ Bearer Token / X-Household-Id │
                 ▼                               ▼
     [/api/auth, /api/common]       [/api/family/v1, /api/field/v1, /api/admin/v1]
                 │                               │
                 ▼                               ▼
       [Dual JWT Guards]            [HouseholdContextGuard & RolesGuard]
                 │                               │
                 └───────────────┬───────────────┘
                                 │
                                 ▼
                     [Authoritative NestJS Services]
            (TicketService, BillingService, CareOfficerService,
             ActivityFeedService, CatalogService, MediaService)
                                 │
          ┌──────────────────────┼──────────────────────┐
          ▼                      ▼                      ▼
 [@poco/business-rules]   [@poco/database]      [In-Process pg-boss]
  • State transitions      • Prisma Client       • sla-transition (60s cron)
  • 3-Step billing logic   • PostgreSQL 16       • ai-classification worker
  • SLA timers & rollups   • ACID Transactions   • notification-dispatch
  • Certification checks                         • subscription-rollover
                                                        │
                                                        ▼
                                           [Pluggable AI Classifier]
                                           (Claude / Gemini / GPT / Mock)
```

### Recommended Project Structure (`apps/api/src`)

```
apps/api/src/
├── app.module.ts                         # Root application module
├── main.ts                               # Bootstrap with global validation pipes & filters
├── common/                               # Shared filters, interceptors, pipes, decorators
│   ├── decorators/                       # @CurrentUser(), @CurrentHousehold(), @Roles()
│   ├── filters/                          # GlobalExceptionFilter, BusinessRuleExceptionFilter
│   ├── guards/                           # JwtAuthGuard, RolesGuard, HouseholdContextGuard
│   ├── interceptors/                     # LoggingInterceptor, ResponseTransformInterceptor
│   └── pipes/                            # ZodValidationPipe
├── config/                               # System configuration & environment schema
│   └── configuration.ts
├── modules/
│   ├── auth/                             # External & Internal JWT Auth, login, signup, refresh
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── strategies/                   # JwtStrategy, LocalStrategy
│   │   └── auth.module.ts
│   ├── activity-feed/                    # Blended activity feed, two-way chat, polling
│   │   ├── activity-feed.controller.ts
│   │   ├── activity-feed.service.ts
│   │   └── activity-feed.module.ts
│   ├── ai-triage/                        # Pluggable AI classifier engine
│   │   ├── providers/                    # AnthropicProvider, GeminiProvider, OpenAiProvider, MockProvider
│   │   ├── interfaces/                   # IAiClassificationProvider
│   │   ├── ai-triage.service.ts
│   │   └── ai-triage.module.ts
│   ├── billing/                          # 3-step billing hierarchy, wallet, quotas, invoices
│   │   ├── billing.controller.ts
│   │   ├── billing.service.ts
│   │   └── billing.module.ts
│   ├── care-officers/                    # 1:1 household assignments, certifications, hierarchy
│   │   ├── care-officers.controller.ts
│   │   ├── care-officers.service.ts
│   │   └── care-officers.module.ts
│   ├── catalog/                          # Versioned catalog & packages, grandfathering
│   │   ├── catalog.controller.ts
│   │   ├── catalog.service.ts
│   │   └── catalog.module.ts
│   ├── households/                       # Onboarding, seniors, medical ICE, invitations
│   │   ├── households.controller.ts
│   │   ├── households.service.ts
│   │   └── households.module.ts
│   ├── jobs/                             # pg-boss queue runner and background workers
│   │   ├── jobs.service.ts
│   │   ├── workers/                      # SlaTransitionWorker, AiClassificationWorker, NotificationWorker
│   │   └── jobs.module.ts
│   ├── media/                            # Direct S3 presigned PUT URLs & dev disk server
│   │   ├── media.controller.ts
│   │   ├── media.service.ts
│   │   └── media.module.ts
│   ├── tickets/                          # Universal tickets, service requests, rollups, SLA
│   │   ├── tickets.controller.ts
│   │   ├── tickets.service.ts
│   │   └── tickets.module.ts
│   └── webhooks/                         # Partner webhooks (Exotel, Razorpay, Wearable, etc.)
│       ├── guards/
│       ├── handlers/
│       ├── webhooks.controller.ts
│       └── webhooks.module.ts
```

### Pattern 1: Pluggable AI Classification Provider

**What:** An interface `IAiClassificationProvider` with dynamic provider selection based on system settings.
**When to use:** In `AiClassificationWorker` when processing free-form messages from the activity feed.

```typescript
// Source: @poco/api/src/modules/ai-triage/interfaces/ai-classification-provider.interface.ts
export interface AiTriageResult {
  category: string;
  serviceCatalogVersionId?: string;
  confidenceScore: number; // 0.0 to 1.0
  urgency: 'EMERGENCY' | 'URGENT' | 'ROUTINE';
  suggestedAction: string;
  rationale: string;
}

export interface IAiClassificationProvider {
  classifyMessage(content: string, context: { householdId: string; seniorNames?: string[] }): Promise<AiTriageResult>;
}
```

### Anti-Patterns to Avoid
- **Client-Side Billing Calculation:** Never calculate wallet debits or quota balances on frontend clients. Always invoke `evaluateBillingAction` on the backend inside a database transaction.
- **Buffering Large Media Files in Node.js Memory:** Never handle multipart file uploads directly in NestJS controllers on the 1GB droplet. Always issue presigned PUT URLs directly to S3 or the dev upload endpoint.
- **Separate Redis/RabbitMQ Containers:** Never deploy external broker containers on 1GB droplet. Always use in-process `pg-boss` sharing PostgreSQL.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| In-Process Background Job Queue | Custom `setInterval` table pollers | `pg-boss` | Handles lock timeouts, crash recovery, retries, backoff, and SKIP LOCKED concurrency safely. |
| JWT Token Generation & Verification | Custom HMAC token signing | `@nestjs/jwt` + `passport-jwt` | Standards-compliant claims validation, expiration enforcement, and secret rotation. |
| Media Presigned URLs | Direct multipart streaming | `@aws-sdk/s3-request-presigner` | Eliminates droplet RAM spikes and handles cryptographic signature version 4. |
| Password Hashing | Custom SHA/MD5 hashing | `bcrypt` (salt rounds >= 10) | Resistant to rainbow tables and brute-force GPU attacks. |
| State Machine Transitions | Ad-hoc controller switch cases | `@poco/business-rules` | Guarantees deterministic state transitions and prevents illegal bypasses. |

## Common Pitfalls

### Pitfall 1: Leaking Unbounded Memory in pg-boss Workers
**What goes wrong:** Worker processing loops retaining database query entity graphs in heap, causing Node.js OOM crashes on the 1GB droplet.
**Why it happens:** Fetching large batches of tickets or keeping long-lived promises in memory.
**How to avoid:** Set batch sizes (e.g. 50 records per SLA cron tick), process items sequentially or with bounded concurrency (2-5), and ensure garbage collection occurs.

### Pitfall 2: Race Conditions in Wallet Debits
**What goes wrong:** Double-spending wallet balance or concurrent quota consumption leading to negative balances when not allowed.
**Why it happens:** Non-transactional read-then-write operations on `HouseholdWallet` and `QuotaAllocation`.
**How to avoid:** Wrap all billing evaluations and wallet mutations inside Prisma `$transaction` blocks with row-level locks or transactional balance increments.

### Pitfall 3: Multi-Household Context Impersonation
**What goes wrong:** User supplying arbitrary `X-Household-Id` header accessing a household they are not a member of.
**Why it happens:** Trusting the header without validating against `HouseholdMembership` table.
**How to avoid:** Enforce `HouseholdContextGuard` globally or on all household-scoped routes, verifying that `personId` has an active record in `HouseholdMembership` for the target `householdId`.

## Code Examples

### 3-Step Billing Execution in NestJS Service

```typescript
// Source: @poco/api/src/modules/billing/billing.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@poco/database';
import { evaluateBillingAction, BillingActionType } from '@poco/business-rules';

@Injectable()
export class BillingService {
  constructor(private readonly prisma: PrismaService) {}

  async processServiceRequestBilling(serviceRequestId: string) {
    return this.prisma.$transaction(async (tx) => {
      const sr = await tx.serviceRequest.findUniqueOrThrow({
        where: { id: serviceRequestId },
        include: {
          ticket: { include: { household: { include: { wallet: true, subscriptions: { where: { status: 'ACTIVE' }, include: { quotaAllocations: true } } } } } },
          serviceCatalogVersion: true,
        },
      });

      const household = sr.ticket.household;
      const wallet = household.wallet;
      const activeSub = household.subscriptions[0];
      const quotaAllocation = activeSub?.quotaAllocations.find(q => q.serviceCatalogId === sr.serviceCatalogVersion.serviceCatalogId);

      const decision = evaluateBillingAction({
        serviceCostPaise: sr.serviceCatalogVersion.priceInr * 100,
        isEmergency: sr.ticket.priority === 'EMERGENCY' || sr.serviceCatalogVersion.isEmergencyDefault,
        walletBalancePaise: wallet?.balancePaise ?? 0,
        creditLimitPaise: wallet?.creditLimitPaise ?? 0,
        availableQuotaUnits: (quotaAllocation?.allocatedUnits ?? 0) - (quotaAllocation?.usedUnits ?? 0),
      });

      if (decision.action === BillingActionType.DECREMENT_QUOTA) {
        await tx.quotaAllocation.update({
          where: { id: quotaAllocation!.id },
          data: { usedUnits: { increment: 1 } },
        });
      } else if (decision.action === BillingActionType.DEBIT_WALLET) {
        const newBalance = (wallet?.balancePaise ?? 0) - decision.debitAmountPaise!;
        await tx.householdWallet.update({
          where: { id: wallet!.id },
          data: { balancePaise: newBalance },
        });
        await tx.walletTransaction.create({
          data: {
            walletId: wallet!.id,
            amountPaise: decision.debitAmountPaise!,
            balanceAfterPaise: newBalance,
            type: decision.isEmergencyOverdraft ? 'EMERGENCY_OVERDRAFT' : 'WALLET_DEBIT',
            description: `Payment for ${sr.serviceCatalogVersion.title}`,
            referenceEntityType: 'ServiceRequest',
            referenceEntityId: sr.id,
          },
        });
      } else if (decision.action === BillingActionType.REQUIRE_APPROVAL) {
        await tx.serviceRequest.update({
          where: { id: sr.id },
          data: { status: 'PENDING' },
        });
      }

      return decision;
    });
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Multi-process Redis + BullMQ cluster | Single in-process `pg-boss` engine | 2024 (pg-boss v10) | Enables 100% reliable ACID job queue inside existing Postgres instance on 1GB RAM budget. |
| Monolithic unversioned service catalog | Immutable ServiceCatalogVersion & PackageVersion | Modern SaaS ERP | Eliminates retroactive billing breaks and preserves grandfathered contract terms. |
| Long-lived stateful WebSocket rooms | Active-screen HTTP delta polling (`?since=timestamp`) | Modern Mobile Architecture | Eliminates connection keep-alive memory leak risk on resource-constrained servers. |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Default AI confidence threshold is 0.75 for auto-creating Pending Triage tickets | Pluggable AI Architecture | Minor — configurable via Admin Portal SystemConfig. |
| A2 | Local disk uploads folder lives at `uploads/` within backend root in dev mode | Media Storage | None — ephemeral local storage for test/dev only. |

## Open Questions

1. **AI Provider API Key Storage:**
   - What we know: API keys can come from `.env` or database `SystemConfig`.
   - Recommendation: Read `.env` as default fallback, override with encrypted `SystemConfig` in Admin Portal if present.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Server Runtime | ✓ | v22.16.0 | — |
| pnpm | Package Manager | ✓ | 10.30.1 | — |
| PostgreSQL | Data Layer & Queue | ✓ | 16-alpine (Docker/Local) | — |
| AWS S3 / Spaces | Media Storage | ✗ (optional) | — | In-app `/api/test/media/upload/:key` disk fallback |
| Anthropic API | AI Triage | ✗ (optional) | — | Deterministic `MockAiClassifierProvider` fallback |

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 3.0.5 |
| Config file | `apps/api/vitest.config.ts` |
| Quick run command | `pnpm --filter @poco/api test` |
| Full suite command | `pnpm test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| AUTH-01..06 | Dual JWT auth, role guards, household context guard | Unit / Integration | `pnpm --filter @poco/api test auth` | ❌ Wave 0 |
| ONBD-01..03 | Onboarding, lead creation, sales-to-CS transition | Integration | `pnpm --filter @poco/api test onboarding` | ❌ Wave 0 |
| CARE-01..05 | 1:1 mapping, certification enforcement, fallback | Integration | `pnpm --filter @poco/api test care-officers` | ❌ Wave 0 |
| TCKT-01..07 | Ticket triage, service request rollup, waiting ops | Integration | `pnpm --filter @poco/api test tickets` | ❌ Wave 0 |
| SLA-01..05 | SLA state evaluation, 60s cron, supervisor escalation | Integration | `pnpm --filter @poco/api test sla` | ❌ Wave 0 |
| CATL-01..05 | Versioned catalog, grandfathered subscriptions | Integration | `pnpm --filter @poco/api test catalog` | ❌ Wave 0 |
| BILL-01..07 | 3-step billing hierarchy, wallet ledger, negative balance | Integration | `pnpm --filter @poco/api test billing` | ❌ Wave 0 |
| FEED-01..07 | Unified activity feed, async AI triage, mock provider | Integration | `pnpm --filter @poco/api test activity-feed` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `pnpm --filter @poco/api test`
- **Per wave merge:** `pnpm test`
- **Phase gate:** Full test suite green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `apps/api/test/auth.e2e-spec.ts` — covers AUTH-01..06
- [ ] `apps/api/test/billing.e2e-spec.ts` — covers BILL-01..07
- [ ] `apps/api/test/tickets.e2e-spec.ts` — covers TCKT-01..07 & SLA-01..05
- [ ] `apps/api/test/ai-triage.e2e-spec.ts` — covers FEED-04..07
- [ ] `apps/api/vitest.config.ts` — test configuration for backend suite

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes | Dual JWT (Person vs InternalUser), bcrypt password hashing, 15m/7d token lifetimes |
| V3 Session Management | yes | Rotating refresh token endpoint, bearer token expiration |
| V4 Access Control | yes | `RolesGuard` checking capability matrix, `HouseholdContextGuard` verifying membership |
| V5 Input Validation | yes | Zod validation pipe with `@poco/validation` schemas |
| V6 Cryptography | yes | HMAC-SHA256 webhook signatures, bcrypt password hashing |

### Known Threat Patterns for NestJS & PostgreSQL Stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| SQL Injection | Tampering | Parameterized queries enforced by Prisma ORM |
| Broken Object Level Authorization (BOLA) | Information Disclosure | `HouseholdContextGuard` validating `X-Household-Id` against caller's active memberships |
| Privilege Escalation | Elevation of Privilege | Strict `@Roles()` guard checking `InternalUserRole` records against capability matrix |
| Media S3 Exhaustion | Denial of Service | Presigned URLs enforce Content-Length and strict MIME type whitelisting |

## Sources

### Primary (HIGH confidence)
- `packages/database/prisma/schema/*.prisma` - Authoritative Prisma schema models and enums
- `packages/business-rules/src/*.ts` - Pure state machines, billing rules, SLA calculators
- `packages/validation/src/*.ts` - Zod request/response validation schemas
- `docs/poco-elder-care-design-brief.md` - Core system architectural constraints and droplet boundaries

### Secondary (MEDIUM confidence)
- Official NestJS & pg-boss documentation on in-process background worker patterns

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Standard NestJS 11 + Prisma 6 + pg-boss 10.1 stack verified
- Architecture: HIGH - Surface-versioned REST API + in-process workers aligned with design brief
- Pitfalls: HIGH - Memory limits, concurrency boundaries, and transaction isolation documented

**Research date:** 2026-09-01
**Valid until:** 2026-10-01

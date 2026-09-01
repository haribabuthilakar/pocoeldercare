# Phase 03: Common NestJS Backend & Business Services - Context

**Gathered:** 2026-09-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 3 implements the common NestJS backend, surface-versioned REST APIs, business service layer, in-process pg-boss background workers, and async AI message classification for Poco Elder Care:
- Surface-partitioned REST APIs (/api/family/v1, /api/field/v1, /api/admin/v1, /api/webhooks/v1, /api/auth, /api/common) with dual JWT authentication and role-based access control.
- Core business services executing canonical @poco/business-rules for tickets, service requests, status rollups, Care Officer assignments, 3-step billing hierarchy, and dual SLA state machines.
- Pluggable Multi-LLM AI Classification Engine (IAiClassificationProvider) supporting Anthropic, Gemini, OpenAI, DeepSeek, and offline mock classification with structured intent extraction.
- In-process pg-boss background job queues running within the NestJS process (sla-transition, ai-classification, notification-dispatch, wearable-ping-scanner, subscription-rollover) tuned for 1GB droplet memory constraints.
- Direct S3/Spaces presigned media upload flow (/api/*/media/presign) with in-app local disk fallback for dev/testing environments without AWS credentials.
- Multi-household context switching via X-Household-Id header and delta polling for unified activity feeds.

</domain>

<decisions>
## Implementation Decisions

### 1. Pluggable Multi-LLM Provider Architecture & AI Triage
- **D-01:** Multi-LLM provider abstraction (IAiClassificationProvider) supporting Anthropic (Claude 3.5 Haiku/Sonnet), Google Gemini (Gemini 2.5 Flash), OpenAI (GPT-4o-mini), DeepSeek (DeepSeek V3/R1), and offline mock. — **Reversibility:** costly — provider abstraction defines the AI triage pipeline across workers, settings schemas, and admin UI.
- **D-02:** Dynamic provider & model configuration stored in SystemConfig / Admin Portal settings (ai.provider = 'anthropic' | 'gemini' | 'openai' | 'deepseek' | 'mock', ai.model, ai.apiKey, ai.confidenceThreshold defaulting to 0.75), allowing runtime model swapping without redeployment.
- **D-03:** Local dev & test mock provider (MockAiClassifierProvider) running offline with deterministic keyword/regex heuristics matching service catalog items and emergency triggers with zero third-party API dependencies.
- **D-04:** Structured JSON schema intent extraction contract defining parsed category, detected serviceCatalogVersionId, confidence score (0.0-1.0), urgency level, and summary rationale.
- **D-05:** Auto-proposal of Pending Triage tickets for confidence >= 0.75, linking ActivityFeedItem.linkedTicketId and rendering status chips in activity feed.

### 2. In-Process pg-boss Worker Queues & 1GB Droplet Tuning
- **D-06:** Single in-process pg-boss engine running within the NestJS process sharing PostgreSQL instance without separate Redis containers. — **Reversibility:** one-way — architectural constraint matching 1GB RAM droplet ceiling.
- **D-07:** Conservative worker concurrency pools: ai-classification (concurrency: 2), notification-dispatch (concurrency: 5), keeping peak Node.js heap well below --max-old-space-size=300.
- **D-08:** Scheduled cron jobs: sla-transition (60s interval, batch size: 50 active service requests), wearable-ping-scanner (5m interval, checking >75m inactive wearables), subscription-rollover (daily at 00:00 IST).
- **D-09:** 24-hour job auto-archive / pruning policy in PostgreSQL pgboss schema, preventing database table bloat and disk degradation on droplet.
- **D-10:** Automated Senior Care Officer fallback escalation on Breached SLA status, updating ticket ownership and dispatching ops alert.

### 3. Dual JWT Auth, Multi-Role Access & Household Context Switching
- **D-11:** Unified Bearer token authentication (Authorization: Bearer <token>) across all surfaces (Admin Portal, Family Portal, Field Mobile App). — **Reversibility:** costly — client interceptors and guard pipelines depend on Bearer headers.
- **D-12:** Multi-household context switching via X-Household-Id header (with query parameter fallback), strictly validated by HouseholdContextGuard verifying active membership in HouseholdMembership table.
- **D-13:** Token lifecycle contracts: 15-minute access token for web portals, 7-day access token for mobile field app, rotating refresh token endpoint at POST /api/auth/refresh.
- **D-14:** Role-based authorization via @Roles(...) metadata and RolesGuard checking internal user roles against the @poco/business-rules capability matrix.
- **D-15:** Field app access guard automatically verifying active CARE_OFFICER role in user's internal role assignments.

### 4. Direct S3 Presigned Media Storage & Local Dev Fallback
- **D-16:** Two-step direct presigned PUT flow (POST /api/*/media/presign -> Client PUT -> POST /api/*/media/confirm / entity reference), ensuring droplet never buffers heavy photos/audio in RAM. — **Reversibility:** costly — client upload pipelines and media endpoints adhere to 2-step presigned flow.
- **D-17:** Strict MIME whitelisting (image/jpeg, image/png, image/webp, audio/aac, audio/m4a, audio/mp3, application/pdf) and size caps (10MB for photos, 25MB for audio/documents).
- **D-18:** In-app Local Storage Server for dev/test: When AWS/Spaces credentials are not configured, presigned URLs point to /api/test/media/upload/:key, writing to local uploads/ directory and serving files statically.

### 5. Authoritative Ticket, SLA & Billing Engine Execution
- **D-19:** Canonical state machine execution in NestJS services invoking pure @poco/business-rules transitions (transitionTicket, evaluateBillingAction, calculateSlaDeadlines, evaluateSlaStatus, calculateTicketRollupStatus).
- **D-20:** Deterministic 3-step billing hierarchy: (1) decrement QuotaUsage against package version quotas, (2) auto-debit HouseholdWallet if balance sufficient or emergency flag set (allowing negative balances), (3) place request in PENDING_APPROVAL and notify family if non-emergency and insufficient funds.
- **D-21:** Care Officer assignment mutation strictly restricted to CARE_OFFICER_MANAGER role, strictly verifying 1:1 household mapping and active unexpired certifications via validateCareOfficerAssignment.
- **D-22:** Grandfathered version resolution: subscriptions and service requests permanently store immutable packageVersionId and serviceCatalogVersionId FKs.
- **D-23:** Unified per-household activity feed with delta polling support (GET /api/family/v1/feed?householdId=...&since=timestamp), real-time status chips, and blended chat + system timeline items.

### the agent's Discretion
- Internal NestJS service decomposition, module dependency wiring, and controller route organization.
- Exact regex pattern formulations for the dev mock AI classifier.
- Local disk upload file naming conventions in dev mode (uploads/:uuid.:ext).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Architecture & Requirements
- docs/poco-elder-care-design-brief.md ?3, ?4, ?5, ?6, ?7 — Authoritative design brief defining dual auth, pg-boss, 3-step billing hierarchy, dual SLA tracking, 1:1 Care Officer mapping, and offline sync.
- .planning/PROJECT.md — Project context, 1GB DO droplet constraints, and active requirements.
- .planning/REQUIREMENTS.md — Formal requirements matrix (AUTH-01..AUTH-06, ONBD-01..ONBD-03, CARE-01..CARE-05, TCKT-01..TCKT-07, SLA-01..SLA-05, CATL-01..CATL-05, BILL-01..BILL-07, FEED-01..FEED-07).
- .planning/research/ARCHITECTURE.md — Detailed system architecture, container topology, package graph, and service boundaries.
- .planning/research/STACK.md — Technology stack versions, compatibility matrix, and banned anti-patterns (no Redis container, no multi-container Node workers).
- .planning/phases/01-monorepo-foundation-prisma-schema-dry-business-rules/01-CONTEXT.md — Foundation decisions, Prisma schema models, integer paise convention (D-23), and pure business rules.
- .planning/phases/02-integration-partner-stubs-interactive-mocks/02-CONTEXT.md — 12 partner stubs, fault injection, webhooks, and test harnesses.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- @poco/business-rules: State machines (transitionTicket), billing hierarchy evaluator (evaluateBillingAction), SLA calculators (calculateSlaDeadlines, evaluateSlaStatus, calculateTicketRollupStatus), certification validators (validateCareOfficerAssignment), and HMAC helpers.
- @poco/validation: Surface-scoped Zod schemas (family, field, admin, webhooks, auth, common).
- @poco/database: PrismaClient with full models for all entities (InternalUser, Person, Household, Senior, Ticket, ServiceRequest, HouseholdWallet, WalletTransaction, ActivityFeedItem, etc.).
- @poco/integrations: 12 partner stubs with FaultInjectorService and webhook delivery handlers.
- apps/api/src/modules/webhooks: Complete signed webhook ingestion controllers and handlers.

### Established Patterns
- DRY Single-Source-of-Truth: Pure business logic executed from @poco/business-rules.
- In-process memory caching via @nestjs/cache-manager / lru-cache.
- Integer paise arithmetic for all wallet and billing operations.
- Surface-scoped REST API route prefixing (/api/family/v1, /api/field/v1, /api/admin/v1, /api/webhooks/v1).

### Integration Points
- apps/api/src/app.module.ts: Root module importing feature modules.
- apps/api/src/modules/jobs: In-process pg-boss queue runner and job handlers.
- packages/database/prisma/schema/*.prisma: Database entities and relations.

</code_context>

<specifics>
## Specific Ideas

- Pluggable AI classifier engine supporting Anthropic, Gemini, OpenAI, DeepSeek, and offline mock with dynamic model switcher in Admin Portal.
- Deterministic MockAiClassifierProvider for local development and test automation.
- In-app local media server fallback (/api/test/media/upload/:key) simulating direct S3 PUT uploads when AWS credentials are not set.
- 60-second in-process pg-boss cron job evaluating SLA timers and triggering supervisor fallback on breach.

</specifics>

<deferred>
## Deferred Ideas

- None — discussion stayed strictly within Phase 3 scope.

</deferred>

---

*Phase: 03-common-nestjs-backend-business-services*
*Context gathered: 2026-09-01*

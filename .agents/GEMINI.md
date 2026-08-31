<!-- GSD:project-start source:PROJECT.md -->

## Project

**Poco Elder Care — Operations & Technology Platform**

Poco is an elder care service platform in India that coordinates first-party service delivery (via its own dedicated care officers) and outsourced/partner-delivered services (via integration partners) on behalf of seniors, funded and monitored by their families. The system comprises a Next.js Family Portal, a React Native offline-first Field App, a Next.js Admin Portal, and a shared NestJS + PostgreSQL (Prisma) backend deployed in a pnpm/turbo monorepo on a single 1GB DigitalOcean droplet.

**Core Value:** Reliable, transparent, and empathetic elder care delivery where families have continuous peace of mind and field officers have streamlined tools to deliver coordinated care.

### Constraints

- **Deployment / Resource Ceiling**: 1GB RAM total server capacity — no separate Redis container or multi-container Node workers.
- **Data Model Invariants**: Strict 1:1 household-to-care-officer mapping; only Care Officer Manager can reassign; grandfathered package/service versions.
- **Auth Separation**: Independent external (`Person` + `HouseholdMembership`) and internal (`InternalUser` + multi-`UserRole`) authentication schemes.
- **DRY Single-Source-of-Truth**: Business rules, state machines, SLA timers, and billing logic implemented once in `@poco/business-rules` and enforced strictly on backend.

<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->

## Technology Stack

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **Turborepo** + **pnpm** | `turbo@^2.3.0`, `pnpm@^9.15.0` | Monorepo orchestration & package management | Provides fast workspace caching, remote task execution, zero-overhead cross-package linking (`@poco/*`), and efficient disk usage across web, mobile, and backend. |
| **Node.js** | `22.x LTS (Iron)` | Server-side runtime | Native performance, stable V8 engine, low memory footprint (~30-50MB base RSS), and long-term security support for the 1GB droplet deployment. |
| **NestJS** | `^10.4.0` / `^11.0.0` | Common backend API & modular business logic | Enterprise modular architecture (Dependency Injection, Guards, Interceptors, Pipes) matching surface-versioned REST APIs (`/api/family/v1`, `/api/field/v1`, `/api/admin/v1`, `/api/webhooks/v1`). |
| **PostgreSQL** | `16-alpine` | Primary ACID relational database & queue persistence | Rock-solid ACID guarantees for financial wallets, SLA timers, and dual escalation trees. Powers `pg-boss` without extra server processes. |
| **Prisma ORM** | `^6.2.0` | Database modeling, migrations & type generation | Declarative schema, robust migration engine (`prisma migrate`), zero-leak connection pooling, and auto-generated TypeScript types feeding `@poco/types`. |
| **pg-boss** | `^10.1.0` | Postgres-backed in-process background job queue | Eliminates external message brokers (Redis/RabbitMQ) on the 1GB RAM droplet. Provides transactional enqueue (`SELECT ... FOR UPDATE SKIP LOCKED`), cron jobs, and retries. |
| **Next.js (App Router)** | `^15.1.0` | Web application framework (Family & Admin Portals) | React Server Components, standalone Docker output (`output: 'standalone'`), route handlers, and SEO/performance optimization for customer and ops dashboards. |
| **React** | `^19.0.0` | UI component library | Foundation for Next.js 15 and React Native; modern hook-based architecture and concurrent rendering. |
| **React Native (Expo)** | `expo@~52.0.0`, `react-native@~0.76.0` | Cross-platform mobile field application | High-performance mobile runtime supporting background geofencing, hardware camera/audio capture, and native SQLite acceleration via Expo prebuild. |
| **WatermelonDB** | `^0.27.1` | Local offline-first reactive database for Field App | Built on top of SQLite (`@op-engineering/op-sqlite` / `expo-sqlite`), provides lazy-loading, observables, and delta sync protocols for spotty Indian cellular networks. |
| **Anthropic Claude SDK** | `@anthropic-ai/sdk@^0.36.0` | Async AI activity feed classification | Claude 3.5 Sonnet / Claude 3.5 Haiku structured output (`tool_choice` or JSON mode) for human-in-the-loop triage into `Pending Triage` tickets. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **Zod** | `^3.24.1` | Runtime schema validation & DTO inference | Used in `@poco/validation` as the single source of truth for API payloads, NestJS validation pipes, React Hook Form, and Claude JSON schema contracts. |
| **Cache-Manager & LRU-Cache** | `@nestjs/cache-manager@^2.3.0`, `cache-manager@^5.7.0`, `lru-cache@^11.0.0` | In-process memory caching | Caching static service catalog versions, active package definitions, and household-to-care-officer mappings without Redis overhead. |
| **AWS SDK v3 S3 & Presigner** | `@aws-sdk/client-s3@^3.700.0`, `@aws-sdk/s3-request-presigner@^3.700.0` | Direct cloud media storage via presigned URLs | When field officers upload visit photos, audio notes, or identity documents directly to S3/DigitalOcean Spaces without loading droplet RAM. |
| **Passport & NestJS JWT** | `@nestjs/passport@^10.0.3`, `@nestjs/jwt@^10.2.0`, `passport-jwt@^4.0.1` | Dual authentication token management | External JWT (Family/Senior with `personId` + `householdId`) and Internal multi-role JWT (Staff with `internalUserId` + `roles`). |
| **Bcrypt** | `bcrypt@^5.1.1` (or `@node-rs/bcrypt@^1.10.0`) | Secure password hashing | Staff credential and external password encryption. |
| **Tailwind CSS** | `^3.4.17` (or `^4.0.0`) | Utility-first CSS styling | Consistent, lightweight design token implementation across Family Portal and Admin Portal. |
| **Shadcn UI & Radix Primitives** | `@radix-ui/react-*`, `class-variance-authority@^0.7.1`, `clsx@^2.1.1`, `tailwind-merge@^2.6.0` | Accessible component system | High-density tables, dialogs, dropdowns, and form primitives for Admin Portal and Family Portal. |
| **Lucide Icons** | `lucide-react@^0.468.0` / `lucide-react-native@^0.468.0` | Consistent iconography | Clean medical, operational, and navigation icons across web and mobile. |
| **TanStack React Query** | `@tanstack/react-query@^5.62.0` | Client-side state & polling engine | Polling activity feed items, ticket statuses, and SLA states on open client screens. |
| **React Hook Form** | `react-hook-form@^7.54.0`, `@hookform/resolvers@^3.9.1` | Form state management | Multi-step onboarding wizards, service request forms, and admin catalog editing. |
| **Date-fns** | `date-fns@^4.1.0` | Date manipulation & SLA timers | Calculating SLA breach deadlines, billing cycle rollovers, and Indian timezone (IST) formatting. |

### Development & Operational Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| **Vitest** | Fast unit and integration testing (`^2.1.8` / `^3.0.0`) | Runs `@poco/business-rules` state machine tests, SLA calculation tests, and billing engine tests in milliseconds with full TypeScript support. |
| **Playwright** | End-to-end browser automation (`^1.49.1`) | Validates multi-actor workflows (Lead signup -> Onboarding -> Assignment -> Ticket creation -> Billing debit -> Resolving in Admin). |
| **Docker & Docker Compose** | Multi-container local & droplet deployment | 3 container topology: `postgres:16-alpine`, `backend` (NestJS + pg-boss), and `nginx` + static/SSR frontends. |
| **Nginx (Alpine)** | Reverse proxy, static asset server, and TLS termination | Routes `/api/*` to NestJS, serves pre-built Next.js static assets, enforces security headers and rate limits. |
| **ESLint & Prettier** | Code quality, DRY enforcement, and formatting | Flat config (`eslint.config.js`) with custom monorepo boundary rules preventing forbidden cross-app imports. |

## Shared Workspace Packages Architecture (`@poco/*`)

## Installation Commands

# ==============================================================================

# Monorepo Root Setup (pnpm + Turborepo)

# ==============================================================================

# ==============================================================================

# Backend Dependencies (apps/api)

# ==============================================================================

# ==============================================================================

# Web Portals Dependencies (apps/family-portal & apps/admin-portal)

# ==============================================================================

# ==============================================================================

# Mobile Field App Dependencies (apps/field-app)

# ==============================================================================

# ==============================================================================

# Testing & QA (Root / Packages)

# ==============================================================================

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| **pg-boss (Postgres Queue)** | Redis + BullMQ | When Redis is already deployed for multi-node caching and backend runs on >=4GB RAM cluster with horizontal worker pods. |
| **pg-boss (Postgres Queue)** | RabbitMQ / Kafka | In massive distributed systems (>100k events/sec) requiring multi-broker partition streaming across microservices. |
| **In-Process LRU Cache** | Distributed Redis / Memcached | When horizontally scaling NestJS across multiple VM instances where shared cache invalidation is required. |
| **Direct S3 Presigned URLs** | NestJS Multipart/Streaming Proxy | Only for tiny temporary file conversions or when strict in-flight antivirus scanning is required before S3 storage. |
| **WatermelonDB (SQLite)** | Redux-Persist / AsyncStorage | For simple key-value state persistence that doesn't need relational queries, 10,000+ local rows, or delta sync. |
| **WatermelonDB (SQLite)** | PowerSync / ElectricSQL | When adopting managed real-time Postgres-to-SQLite sync engines with dedicated sync server containers. |
| **TanStack Polling** | WebSocket / Socket.io / SSE | When true bi-directional millisecond-latency streaming (e.g. live video call signaling, stock trading) is required. |
| **Hosted Anthropic Claude** | Self-Hosted Ollama / vLLM | When private cloud on-prem data residency prohibits cloud API usage and GPU hardware is available. |

## What NOT to Use (Anti-Patterns & Exclusions)

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| **Standalone Redis Container** | Consumes 80–150MB+ RSS RAM on a 1GB DigitalOcean droplet, risking Linux OOM-killer termination of Postgres or NestJS. | **In-memory LRU (`cache-manager`)** for hot reads + **Postgres (`pg-boss`)** for queues. |
| **RabbitMQ / Apache Kafka** | Heavy JVM / Erlang runtimes require 300MB–1GB+ RAM, impossible on a 1GB droplet. | **`pg-boss`** running in-process on existing PostgreSQL instance. |
| **BullMQ** | Requires a live Redis server connection, bringing back the Redis memory overhead. | **`pg-boss`** (Postgres native queue). |
| **Direct Binary File Streaming via Droplet API** | Uploading photos/videos through NestJS buffers spikes Node.js memory (`Buffer.from`) and consumes droplet bandwidth. | **Direct S3 / Spaces Presigned PUT URLs** from browser & mobile clients. |
| **Real-time WebSockets for Chat** | Long-lived WebSocket connection pools require stateful socket server clustering, heartbeats, and memory buffers. | **TanStack Query client polling (3–5s on active screen)** matching brief spec. |
| **Live External Partner API Calls** | Third-party partner APIs (Swiggy, 1mg, Ola, Razorpay) introduce network flakiness and billing in dev/test. | **Realistic NestJS stubs + Admin Portal mock UI testbench**. |
| **Client-Side Business Rule Execution** | Executing billing debits, quota reductions, or SLA transitions in frontend clients risks data tampering and divergence. | **Canonical `@poco/business-rules` executed strictly by backend API & queue workers**. |
| **Nivas Domain Scaffolding** | High-dependency & long-term care (live-in attendants, GNM nurses, palliative care) is explicitly out of scope. | **Strictly exclude Nivas tables, enums, and components**. |

## Stack Patterns by Variant

- Deploy via **Docker Compose**:
- Because this keeps total memory footprint under 850MB, leaving 150MB buffer for OS kernel and disk I/O buffers.
- Read/Write to local **WatermelonDB (SQLite)**.
- Assign client-generated UUIDs (`id: uuidv4()`) and mark `synced: false`.
- Queue photo media uploads locally.
- On connectivity restoration, push structured sync payload first (`POST /api/field/v1/sync`), then upload pending media to S3 via presigned URLs.
- Write `ActivityFeedItem` to Postgres immediately.
- Enqueue `ai-classification` job in `pg-boss` transactionally.
- Background worker invokes Claude API with structured JSON schema.
- If confidence >= 0.75, auto-create Ticket with `triageStatus: 'pending_triage'`.
- Ops Executive confirms/edits ticket in Admin Portal.
- Because this guarantees zero write-path latency for family and care officer chat.
- Run scheduled `sla-transition` cron worker in `pg-boss` (every 1 minute).
- Check `responseDueAt` and `deliveryDueAt` against `now()`.
- Flip status: `Normal` -> `At Risk` (at 75% threshold) -> `Breached` (at 100%).
- On `Breached`, trigger internal escalation: query `ReportingLine` and assign fallback to Senior Care Officer.
- Execute 3-step billing hierarchy from `@poco/business-rules`:

## Version Compatibility Matrix

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| `next@15.1.x` | `react@19.0.0`, `react-dom@19.0.0` | Next.js 15 default peer dependency is React 19. |
| `prisma@6.2.x` | `postgresql@16`, `typescript@5.7.x` | Prisma 6 supports PostgreSQL 16 features and strict TS 5.7 typings. |
| `@nestjs/core@10.4.x / 11.0.x` | `rxjs@7.8.x`, `reflect-metadata@0.2.x` | Standard NestJS 10/11 dependency tree. |
| `pg-boss@10.1.x` | `pg@8.13.x`, `postgresql@16` | Requires Postgres schema creation privileges (`pgboss` schema created automatically). |
| `@nozbe/watermelondb@0.27.x` | `react-native@0.76.x`, `expo@52.x` | Uses JSI / SQLite native bindings. Requires Expo Config Plugin for native build step. |
| `@anthropic-ai/sdk@0.36.x` | `node@22.x`, `zod@3.24.x` | Works seamlessly with Zod-to-JSON-Schema for Claude tool calling & structured responses. |
| `vitest@2.1.x / 3.0.x` | `vite@6.x`, `typescript@5.7.x` | ESM-first blazing fast test runner across all monorepo packages. |

## Sources

- `c:/Users/harib/work/pocoeldercare/docs/poco-elder-care-design-brief.md` — Authoritative baseline decisions (1GB DO constraint, pg-boss queue, in-process cache, offline WatermelonDB, versioned catalog, 3-step billing).
- `c:/Users/harib/work/pocoeldercare/.planning/PROJECT.md` — Core value, active requirements, scope boundaries (exclusion of Nivas, direct S3 uploads).
- Official Documentation & Release Feeds:

<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->

## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->

## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->

## Project Skills

No project skills found. Add skills to any of: `.agents/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->

## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:

- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->

## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->

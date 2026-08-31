# Stack Research

**Domain:** Elder Care Operations & Multi-Surface Coordination Platform (India)
**Researched:** 2026-08-31
**Confidence:** HIGH

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

---

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

---

### Development & Operational Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| **Vitest** | Fast unit and integration testing (`^2.1.8` / `^3.0.0`) | Runs `@poco/business-rules` state machine tests, SLA calculation tests, and billing engine tests in milliseconds with full TypeScript support. |
| **Playwright** | End-to-end browser automation (`^1.49.1`) | Validates multi-actor workflows (Lead signup -> Onboarding -> Assignment -> Ticket creation -> Billing debit -> Resolving in Admin). |
| **Docker & Docker Compose** | Multi-container local & droplet deployment | 3 container topology: `postgres:16-alpine`, `backend` (NestJS + pg-boss), and `nginx` + static/SSR frontends. |
| **Nginx (Alpine)** | Reverse proxy, static asset server, and TLS termination | Routes `/api/*` to NestJS, serves pre-built Next.js static assets, enforces security headers and rate limits. |
| **ESLint & Prettier** | Code quality, DRY enforcement, and formatting | Flat config (`eslint.config.js`) with custom monorepo boundary rules preventing forbidden cross-app imports. |

---

## Shared Workspace Packages Architecture (`@poco/*`)

To enforce the DRY (Don't Repeat Yourself) principle across the Turborepo monorepo:

```
pocoeldercare/
├── apps/
│   ├── api/                 # NestJS 10/11 Backend (REST API + pg-boss workers)
│   ├── family-portal/       # Next.js 15 Family Portal (App Router)
│   ├── admin-portal/        # Next.js 15 Admin Operations Portal (App Router)
│   └── field-app/           # React Native / Expo Mobile App (WatermelonDB offline sync)
└── packages/
    ├── types/               # @poco/types (Prisma DTOs, API contracts, Role enums, Error envelopes)
    ├── validation/          # @poco/validation (Zod schemas for DTOs, forms, and LLM structured outputs)
    ├── business-rules/      # @poco/business-rules (Ticket/SR state machines, SLA timers, 3-step billing engine)
    ├── constants/           # @poco/constants (Role permissions, Service categories, SLA defaults, Partner IDs)
    ├── design-tokens/       # @poco/design-tokens (Color palette, typography, spacing tokens)
    └── ui/                  # @poco/ui (Shared Tailwind configs, Radix/Shadcn primitives)
```

---

## Installation Commands

```bash
# ==============================================================================
# Monorepo Root Setup (pnpm + Turborepo)
# ==============================================================================
pnpm add -Dw turbo@^2.3.0 typescript@^5.7.2 @types/node@^22.10.2 eslint@^9.17.0 prettier@^3.4.2

# ==============================================================================
# Backend Dependencies (apps/api)
# ==============================================================================
pnpm --filter api add @nestjs/core@^10.4.15 @nestjs/common@^10.4.15 @nestjs/platform-express@^10.4.15 \
  @nestjs/config@^3.3.0 @nestjs/jwt@^10.2.0 @nestjs/passport@^10.0.3 passport@^0.7.0 passport-jwt@^4.0.1 \
  @nestjs/cache-manager@^2.3.0 cache-manager@^5.7.0 lru-cache@^11.0.2 \
  @prisma/client@^6.2.0 pg-boss@^10.1.0 @aws-sdk/client-s3@^3.719.0 @aws-sdk/s3-request-presigner@^3.719.0 \
  @anthropic-ai/sdk@^0.36.1 date-fns@^4.1.0 bcrypt@^5.1.1 zod@^3.24.1

pnpm --filter api add -D prisma@^6.2.0 @types/passport-jwt@^4.0.1 @types/bcrypt@^5.0.2 vitest@^2.1.8

# ==============================================================================
# Web Portals Dependencies (apps/family-portal & apps/admin-portal)
# ==============================================================================
pnpm --filter family-portal --filter admin-portal add next@^15.1.3 react@^19.0.0 react-dom@^19.0.0 \
  @tanstack/react-query@^5.62.8 zod@^3.24.1 react-hook-form@^7.54.2 @hookform/resolvers@^3.9.1 \
  lucide-react@^0.468.0 clsx@^2.1.1 tailwind-merge@^2.6.0 class-variance-authority@^0.7.1 \
  @radix-ui/react-dialog@^1.1.2 @radix-ui/react-dropdown-menu@^2.1.2 @radix-ui/react-select@^2.1.2 \
  @radix-ui/react-tabs@^1.1.1 @radix-ui/react-toast@^1.2.2 date-fns@^4.1.0

pnpm --filter family-portal --filter admin-portal add -D tailwindcss@^3.4.17 postcss@^8.4.49 autoprefixer@^10.4.20 \
  @types/react@^19.0.2 @types/react-dom@^19.0.2

# ==============================================================================
# Mobile Field App Dependencies (apps/field-app)
# ==============================================================================
pnpm --filter field-app add expo@~52.0.0 react-native@~0.76.5 @nozbe/watermelondb@^0.27.1 \
  @nozbe/with-observables@^1.4.0 @op-engineering/op-sqlite@^8.0.0 expo-camera@~16.0.0 \
  expo-location@~18.0.0 expo-file-system@~18.0.0 @tanstack/react-query@^5.62.8 zod@^3.24.1 \
  date-fns@^4.1.0 lucide-react-native@^0.468.0

# ==============================================================================
# Testing & QA (Root / Packages)
# ==============================================================================
pnpm add -Dw vitest@^2.1.8 @playwright/test@^1.49.1
```

---

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

---

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

---

## Stack Patterns by Variant

**If running on a Single 1GB DigitalOcean Droplet:**
- Deploy via **Docker Compose**:
  - `postgres:16-alpine` (Memory limit: 256MB, `shared_buffers = 128MB`, `work_mem = 4MB`)
  - `poco-backend` (NestJS API + in-process `pg-boss` workers, memory limit: 450MB, `NODE_OPTIONS="--max-old-space-size=384"`)
  - `poco-nginx` (Reverse proxy + Next.js standalone build / static cache, memory limit: 128MB)
- Because this keeps total memory footprint under 850MB, leaving 150MB buffer for OS kernel and disk I/O buffers.

**If Field App is completely Offline (No Network):**
- Read/Write to local **WatermelonDB (SQLite)**.
- Assign client-generated UUIDs (`id: uuidv4()`) and mark `synced: false`.
- Queue photo media uploads locally.
- On connectivity restoration, push structured sync payload first (`POST /api/field/v1/sync`), then upload pending media to S3 via presigned URLs.

**If Activity Feed Receives Free-Form Chat Message:**
- Write `ActivityFeedItem` to Postgres immediately.
- Enqueue `ai-classification` job in `pg-boss` transactionally.
- Background worker invokes Claude API with structured JSON schema.
- If confidence >= 0.75, auto-create Ticket with `triageStatus: 'pending_triage'`.
- Ops Executive confirms/edits ticket in Admin Portal.
- Because this guarantees zero write-path latency for family and care officer chat.

**If Evaluating SLAs on Service Requests:**
- Run scheduled `sla-transition` cron worker in `pg-boss` (every 1 minute).
- Check `responseDueAt` and `deliveryDueAt` against `now()`.
- Flip status: `Normal` -> `At Risk` (at 75% threshold) -> `Breached` (at 100%).
- On `Breached`, trigger internal escalation: query `ReportingLine` and assign fallback to Senior Care Officer.

**If Processing Out-of-Quota Billing:**
- Execute 3-step billing hierarchy from `@poco/business-rules`:
  1. *Emergency Tagged*: Auto-debit wallet (allow negative balance), deliver immediately.
  2. *User-Requested & Sufficient Balance*: Auto-debit wallet, proceed to dispatch.
  3. *Unfunded Non-Emergency*: Put on `Pending Approval` hold and notify Primary Family Member.

---

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

---

## Sources

- `c:/Users/harib/work/pocoeldercare/docs/poco-elder-care-design-brief.md` — Authoritative baseline decisions (1GB DO constraint, pg-boss queue, in-process cache, offline WatermelonDB, versioned catalog, 3-step billing).
- `c:/Users/harib/work/pocoeldercare/.planning/PROJECT.md` — Core value, active requirements, scope boundaries (exclusion of Nivas, direct S3 uploads).
- Official Documentation & Release Feeds:
  - NestJS 10/11 Docs (`docs.nestjs.com`)
  - Prisma 6 Docs (`prisma.io/docs`)
  - pg-boss Documentation (`github.com/timgit/pg-boss`)
  - Next.js 15 Docs (`nextjs.org/docs`)
  - WatermelonDB Guides (`watermelondb.dev`)
  - Anthropic SDK Docs (`docs.anthropic.com`)

---
*Stack research for: Poco Elder Care Operations & Technology Platform*
*Researched: 2026-08-31*

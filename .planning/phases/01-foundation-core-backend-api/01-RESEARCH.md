# Phase 1: Foundation & Core Backend API - Research

**Researched:** 2026-08-21
**Domain:** Enterprise Monorepo, NestJS REST API, PostgreSQL/Prisma Data Modeling, Auth & RBAC, Dynamic SOP Engine
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Primary login authentication via Phone Number (with mockable OTP for dev/test) and Email & Password fallback.
- **D-02:** Dual Bearer JWT token architecture: short-lived Access Token in memory/Authorization header (15m) + long-lived Refresh Token (30d) in Authorization header/cookie.
- **D-03:** Multi-role user model with context switching across households.
- **D-04:** Explicit Subscription Quota Ledger: subscriptions (Kavach, Sahara, Sampoorna) track included visit allowances and auto-decrement balance upon service completion.
- **D-05:** Pre-funded INR Wallet with Atomic Holds & Deductions on pay-per-use and overage bookings.
- **D-06:** First-class Clinical Entities: dedicated ClinicalConsult and Prescription database models linked to ServiceExecution.
- **D-07:** Versioned JSON-Schema Step Definitions for dynamic mobile rendering and immutable historical snapshots.
- **D-08:** Relational ICE Medical Profile with in-memory / Redis fast caching to guarantee sub-2-second retrieval.
- **D-09:** Explicit Drill Mode Flag (is_drill: true) for simulated Care Officer drills.
- **D-10:** Complete 90-Service Catalog Seed populated from docs/Pococare_Elder_90_Services_Matrix.md.
- **D-11:** Realistic Multi-City Indian Personas (Bangalore, Chennai, Mumbai, Delhi) with active senior members, NRI children, Care Officers, and panel Doctors.

### the agent'\''s Discretion
- Prisma schema field naming, relational indices, and foreign key cascades.
- NestJS dependency injection modular structure and middleware organization.
- Test fixture composition and Vitest configuration.

### Deferred Ideas (OUT OF SCOPE)
- Live-in 24x7 attendant management (Nivas tier).
- International multi-currency Forex payment gateways.
</user_constraints>

<architectural_responsibility_map>
## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|---|---|---|---|
| Monorepo & Build System | Build / Tooling | — | Turborepo orchestrates incremental builds and shared package compilation |
| Schema & Persistence | Database / PostgreSQL | ORM / Prisma | Relational integrity for 90-service catalog, quota accounting, and ICE records |
| Auth & RBAC | API / Backend (NestJS) | Redis (tokens/OTP) | Passport JWT strategy and OTP validation with role-based guards |
| Dynamic SOP Engine | API / Backend (NestJS) | Database / JSON | Validates checklist step schemas and stores versioned execution logs |
| Clinical Records & ICE | API / Backend (NestJS) | Redis / In-Memory | High-speed cache for sub-2s emergency lookup and relational DB storage |
| Wallet Ledger | Database (PostgreSQL) | API / Backend | Atomic transactional holds and balance debit/credit ledger |
| Test Suite | CI / Testing (Vitest) | Docker (PostgreSQL/Redis) | Fast automated unit & integration test execution against real database |
</architectural_responsibility_map>

<research_summary>
## Summary

Phase 1 establishes the foundational infrastructure for the entire Pococare ecosystem. A Turborepo monorepo with pnpm workspaces provides structured code sharing between the NestJS backend and future Next.js and React Native client applications.

The core data model in PostgreSQL via Prisma ORM encompasses the complete 90-service catalog from docs/Pococare_Elder_90_Services_Matrix.md, versioned SOP templates with JSON-Schema step definitions, subscription quota ledgers for tiered plans (Kavach, Sahara, Sampoorna), an immutable double-entry wallet ledger, and structured medical/ICE profiles.

Authentication uses NestJS Passport with dual JWT tokens (15-minute access token, 30-day refresh token) supporting both Phone/OTP for Indian users and Email/Password for overseas NRI family members. All APIs are strictly validated via DTOs, modularized by domain, and backed by a comprehensive Vitest test suite running against local Docker container services.

**Primary recommendation:** Build @poco/database and @poco/types first, verify schema migrations with full 90-service seed data, then construct modular NestJS controllers and services with Vitest integration tests for auth, ICE lookup (<2s), dynamic SOPs, and atomic wallet operations.
</research_summary>

<standard_stack>
## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---|---|---|---|
| @nestjs/core & @nestjs/common | ^10.4.0 | Backend application framework | Enterprise TypeScript structure with DI |
| @prisma/client & prisma | ^5.22.0 | ORM & database migrations | End-to-end type safety, reliable migrations |
| 	urbo & pnpm | ^2.3.0 | Monorepo orchestration | Blazing fast incremental caching and workspace linking |
| @nestjs/passport & passport-jwt | ^10.0.0 | Authentication & session guards | Standard modular auth strategies |
| crypt | ^5.1.1 | Password & sensitive data hashing | Industry standard security |
| zod / class-validator | ^0.14.0 | Input validation & JSON-Schema | Dynamic schema validation for SOP checklists |
| itest & supertest | ^2.1.0 | Fast unit & integration testing | Modern ESM native test runner |

### Supporting
| Library | Version | Purpose | When to Use |
|---|---|---|---|
| ioredis | ^5.4.0 | Fast in-memory cache | Emergency ICE profile pre-caching (<2s lookup) |
| date-fns & date-fns-tz | ^4.1.0 | Timezone utilities | UTC storage and IST/NRI local time conversions |

**Installation:**
`ash
pnpm add @nestjs/core @nestjs/common @nestjs/platform-express @prisma/client @nestjs/passport passport passport-jwt bcrypt class-validator class-transformer ioredis date-fns
pnpm add -D prisma vitest supertest @types/passport-jwt @types/bcrypt @types/supertest turbo typescript
`
</standard_stack>

<architecture_patterns>
## Architecture Patterns

### Recommended Monorepo Structure
`
pocoeldercare/
├── apps/
│   └── api/                    # NestJS Backend Application
│       ├── src/
│       │   ├── modules/
│       │   │   ├── auth/       # Phone/OTP & Email JWT Authentication
│       │   │   ├── users/      # Multi-role User Management
│       │   │   ├── households/ # Households, Members & ICE Profiles
│       │   │   ├── catalog/    # 90-Service Catalog & Plan Quotas
│       │   │   ├── sop/        # Dynamic SOP Templates & Versioning
│       │   │   ├── clinical/   # Doctor Visits, Consults & Prescriptions
│       │   │   ├── vitals/     # Vitals Readings & Alerts
│       │   │   └── billing/    # In-App Wallet Ledger & Invoicing
│       │   ├── common/         # Guards, Interceptors, Filters, Decorators
│       │   ├── app.module.ts
│       │   └── main.ts
│       ├── test/               # Integration & E2E Tests
│       └── package.json
├── packages/
│   ├── database/               # Prisma Schema, Migrations, Seed Script
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── seed.ts         # 90 Services + Multi-City Mock Seed
│   │   └── package.json
│   ├── shared-types/           # DTOs, Enums, REST API Contracts
│   │   └── src/index.ts
│   └── config/                 # ESLint, TypeScript shared configs
├── docker-compose.yml          # PostgreSQL 16 + Redis 7
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
`

### Pattern 1: Atomic Wallet Pre-Hold and Settlement
`	ypescript
// Transactional wallet ledger pattern for pay-per-use bookings
await prisma.(async (tx) => {
  const wallet = await tx.wallet.findUnique({ where: { householdId } });
  if (wallet.balance < requiredAmount) {
    throw new BadRequestException( Insufficient wallet balance);
  }
  await tx.wallet.update({
    where: { id: wallet.id },
    data: { balance: { decrement: requiredAmount } },
  });
  await tx.walletTransaction.create({
    data: {
      walletId: wallet.id,
      amount: requiredAmount,
      type: HOLD,
      serviceExecutionId: execution.id,
    },
  });
});
`

### Pattern 2: Versioned JSON-Schema SOP Checklist Runner
`	ypescript
// Dynamic SOP Checklist Step Evaluation
interface SopStepDefinition {
  id: string;
  title: string;
  type: BOOLEAN | NUMBER | PHOTO_URL | VITALS | SIGNATURE | TEXT;
  required: boolean;
  validationRule?: { min?: number; max?: number };
}
`

### Anti-Patterns to Avoid
- **Mutating Active SOP Templates**: Never edit an active SOP template in place; always increment version number so existing visit audits remain linked to the exact protocol followed.
- **Float Arithmetic for Money**: Always store currency balances and transaction amounts in integer minor units (paise in INR) to eliminate floating point rounding bugs.
- **Unindexed Emergency Queries**: Always maintain compound indices on Member(householdId, phone) and IceProfile(memberId) with Redis cache mirroring to satisfy <2s SLA.
</architecture_patterns>

<dont_hand_roll>
## Don'\''t Hand-Roll

| Problem | Don'\''t Build | Use Instead | Why |
|---|---|---|---|
| Monorepo build orchestration | Custom shell / npm scripts | Turborepo | Caching, dependency graph execution, clean package boundaries |
| Database migration & typing | Custom SQL scripts / query builder | Prisma ORM | Automated migrations, type-safe query client, seed tooling |
| JWT validation & auth lifecycle | Custom token validation middleware | Passport JWT Strategy & NestJS Guards | Standardized token extraction, error handling, and role verification |
| DTO payload validation | Manual if/else checks | class-validator + NestJS ValidationPipe | Declarative validation decorators, automated error formatting |
| Date & Timezone math | Native JavaScript Date | date-fns + date-fns-tz | Handles leap years, daylight savings for NRI timezones, ISO formatting |
</dont_hand_roll>

<common_pitfalls>
## Common Pitfalls

### Pitfall 1: Emergency Profile Latency
**What goes wrong:** High database load slows down ICE retrieval past 2 seconds during inbound call triage.
**How to avoid:** Store pre-serialized ICE payloads in Redis on creation/update; read from Redis first, falling back to PostgreSQL if cache misses.
**Warning signs:** DB connection pool spikes during emergency queue spikes.

### Pitfall 2: Double-spending on Service Bookings
**What goes wrong:** Multiple rapid pay-per-use bookings exceed the member'\''s wallet balance.
**How to avoid:** Wrap balance checks and debit transactions in Prisma interactive transactions with row-level locks.
**Warning signs:** Negative wallet balances or untracked transactions.

### Pitfall 3: SOP Template Inconsistency
**What goes wrong:** Updating an SOP breaks unfinished visits or historical audit records.
**How to avoid:** Make SOP templates immutable upon publishing. New edits create a new version; active executions reference their scheduled version ID.
</common_pitfalls>

<sources>
## Sources

### Primary (HIGH confidence)
- docs/Pococare_Elder_90_Services_Matrix.md — Complete 90-service catalog, plan quotas, and unit pricing.
- docs/Pococare_User_Stories.md — User story specifications and acceptance criteria.
- docs/Ops_and_Tech_Capabilities.md — Operations & technology architectural capabilities.
- NestJS Documentation (v10) & Prisma Documentation (v5/v6) — Enterprise monorepo and data modeling best practices.

### Secondary (MEDIUM confidence)
- Exotel CTI integration guidelines for sub-2-second caller ID webhooks.
- Reserve Bank of India (RBI) prepaid wallet regulatory framework guidelines for domestic closed/semi-closed ledgers.
</sources>

<metadata>
## Metadata
**Research date:** 2026-08-21
**Valid until:** 2026-09-21
</metadata>

---
*Phase: 01-Foundation & Core Backend API*
*Research completed: 2026-08-21*
*Ready for planning: yes*

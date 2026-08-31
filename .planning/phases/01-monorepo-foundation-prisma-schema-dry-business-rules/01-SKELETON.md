# Walking Skeleton — Poco Elder Care

**Phase:** 1
**Generated:** 2026-08-31

## Capability Proven End-to-End

A shared TypeScript monorepo workspace successfully compiles constants, types, domain validation schemas, pure state-machine business rules, and multi-file PostgreSQL Prisma schemas, executing deterministic business rule calculations and seeding initial staff, packages, and integration partner fixtures through Dockerized PostgreSQL.

## Architectural Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Workspace Manager | pnpm workspaces + Turborepo (`^2.3.0`) | Strict dependency isolation, shared workspace catalogs, fast cached pipeline tasks (`dependsOn: ["^db:generate"]`), and parallel execution. |
| Compilation & Bundling | `tsup` (esbuild) | Dual ESM/CJS outputs, `.d.ts` declaration maps, and sub-second rebuilds consumed across NestJS (CJS), Next.js (ESM), and React Native (Expo). |
| Data Layer | PostgreSQL 16 + Prisma ORM 6 (`prismaSchemaFolder`) | Multi-file schema modularity, UUID primary keys for offline sync, integer paise currency, immutable version grandfathering, and 1:1 Care Officer relational constraints. |
| Business Logic | Zero-dependency pure TypeScript (`@poco/business-rules`) | 100% deterministic testability, zero float math precision bugs, tagged union results, and zero drift between backend enforcement and frontend preview. |
| Validation Layer | Hand-crafted Zod 3.24+ (`@poco/validation`) | Single source of truth for DTO inference, NestJS validation pipes, React Hook Forms, and Claude AI tool schema extraction via `zod-to-json-schema`. |
| Design Tokens & UI | Tailwind Presets + Radix/CVA (`@poco/design-tokens`, `@poco/ui`) | Senior-friendly typography (18px base / 14px compact admin), high-contrast accessibility (WCAG AAA), and branded palette (`#12C395`, `#FE1D8F`, `#6BAAD0`). |
| Development Topology | Docker Compose (Postgres 16 + Adminer) | Deterministic Windows dev environment, volume-mounted hot reloads, and 1GB RAM droplet deployment baseline (<850MB total footprint). |

## Stack Touched in Phase 1

- [x] Project scaffold (pnpm workspace, Turborepo pipeline, strict TypeScript 5.7+ presets, ESLint boundaries, Vitest workspace)
- [x] Shared Packages (`@poco/constants`, `@poco/types`, `@poco/validation`, `@poco/business-rules`, `@poco/database`, `@poco/design-tokens`, `@poco/ui`)
- [x] Database Schema (10 core domains across 11 Prisma schema files with UUID primary keys and integer paise)
- [x] Pure Business Logic (Ticket/Service Request state machines, 3-step billing hierarchy, dual SLA timer calculators, Care Officer assignment validator)
- [x] Testing Harness (Mock factories, scenario helpers, Vitest matchers, and fast-check property-based invariant suites)
- [x] Database Migrations & Seeds (`0_init` migration, idempotent baseline seed with 4 staff roles, 12 services, 3 packages, 12 partners, 3 demo households)
- [x] Container Topology (Multi-service Docker Compose for Windows dev and production 1GB droplet configuration)

## Out of Scope (Deferred to Later Slices)

- HTTP REST Controllers & NestJS application boots (Phase 2)
- Next.js Admin Ops Portal pages & interactive screens (Phase 2 & Phase 3)
- Next.js Family Portal dashboard & WhatsApp magic link auth (Phase 3)
- React Native / Expo Field App screens & WatermelonDB sync engine (Phase 4)
- Live Razorpay payment gateway webhooks & Exotel IVR calling (Phase 5)
- Anthropic Claude AI triage pipeline & WhatsApp automated agents (Phase 5)

## Subsequent Slice Plan

Each later phase builds vertical slices on top of this skeleton without altering its core architectural decisions:

- Phase 2: Internal Staff Auth & Operations Dispatch (NestJS API auth, Admin Portal ticket dispatcher, Care Officer assignment dashboard)
- Phase 3: Family Portal & Senior Care Management (Family authentication, vitals charting, activity feed, ticket creation, wallet top-up)
- Phase 4: Field Officer Mobile App & Offline Sync (React Native offline WatermelonDB sync, GPS geofence check-ins, SOP checklist execution)
- Phase 5: External Integrations & AI Triage (Razorpay payments, Exotel calling, Claude AI activity feed triage, WhatsApp automation)
- Phase 6: Production Hardening & Droplet Deployment (1GB DigitalOcean deployment, automated daily S3 backups, security auditing, end-to-end rehearsal)

<!-- GSD:project-start source:PROJECT.md -->

## Project

A comprehensive technology and operations platform for elder care in India, serving seniors living independently and their families (including NRI children). The platform unifies 24x7 emergency response with published SLAs, primary and continuing medical care (including doctor home visits, teleconsultations, and diagnostics), dedicated field Care Officer visits, and daily living assistance. It operates across an Emergency Dispatcher Command Centre, Care Officer Field App, Family Portal, Operations CRM, and an Elder Voicemail/Phone Interface.

**Core Value:** Uncompromising reliability and peace of mind for families through rapid, SLA-backed emergency coordination, verified in-person care officer visits, and transparent operational visibility.

### Constraints

- **Tech Stack**: Turborepo + pnpm monorepo; NestJS (REST API); PostgreSQL + Prisma ORM; Next.js (Web Portals); React Native / Expo (Mobile); Vitest + Playwright for testing.
- **Environment**: Local Windows 11 Docker environment for development and testing; AWS Mumbai (ap-south-1) for production.
- **Telephony & Voice**: Exotel for CTI/IVR telephony; Google Cloud Speech-to-Text for Indian languages.
- **Security & Privacy**: Indian health data privacy compliance with role-based access control and encrypted ICE storage.

<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->

## Technology Stack

## Core Technologies

### 1. Monorepo & Build System

- **Turborepo + pnpm**: High-performance monorepo management with incremental builds and shared TypeScript packages (@poco/database, @poco/types, @poco/ui, @poco/config).
- **Rationale**: Enables end-to-end type safety between the NestJS REST API and Next.js / React Native client applications.

### 2. Backend & Core API

- **NestJS (TypeScript)**: Modular, enterprise-grade Node.js framework using Express under the hood.
- **REST over JSON**: Predictable, standard contract for all web portals and mobile clients.
- **PostgreSQL 16 + Prisma ORM**: Relational schema modeling for complex household hierarchies, versioned SOP templates, subscription quotas, and immutable service execution ledgers.

### 3. Client Applications

- **Family Portal & Ops CRM**: **Next.js (App Router, React 18/19, Tailwind CSS, Lucide Icons, Shadcn UI)**.
- **Emergency Dispatcher**: **Next.js + WebSocket client** with low-latency state synchronization.
- **Field App (Care Officers)**: **React Native with Expo** + SQLite / WatermelonDB for robust offline-first synchronization.

### 4. Telephony, Voice & AI

- **Exotel Telephony**: CTI, programmable voice, automated outbound call trees, and call recording in India.
- **Google Cloud Speech-to-Text (v2)**: Accurate transcription for Indian languages and accents (Hindi, Tamil, Telugu, Kannada, Bengali, Marathi, Indian English).
- **LLM Intent Extractor (LangChain / OpenAI / Gemini API)**: Extracts structured service tickets, household IDs, and urgency ratings from transcribed audio.

### 5. Testing & Quality Assurance

- **Vitest**: Fast unit and integration testing across backend modules and React components.
- **Playwright**: End-to-end browser automation testing for critical dispatcher, family portal, and ops workflows.

### 6. Infrastructure & Deployment

- **Local Dev**: Docker Compose (PostgreSQL, Redis, Mock Telephony service) on Windows 11.
- **Production**: AWS Mumbai (p-south-1) utilizing Amazon ECS / EKS, RDS PostgreSQL, Amazon S3 for documents/recordings, and CloudFront.

## Technology Comparison & Alternatives

| Layer | Chosen | Alternative Considered | Why Chosen |
|---|---|---|---|
| Backend | NestJS (TS) | Python/FastAPI | Shared types with Next.js/RN, structured DI architecture |
| ORM | Prisma | TypeORM / Drizzle | Schema clarity, type generation, migration tooling |
| Mobile | React Native (Expo) | Flutter | Unified TS ecosystem, shared business logic/validation |
| Voice | Exotel + Google STT | Twilio + Whisper | Indian telephony compliance, proven vernacular accuracy |
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

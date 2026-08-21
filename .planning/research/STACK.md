# Technology Stack Selection

**Project:** Pococare Elder Care Platform
**Researched:** 2026-08-21
**Confidence:** HIGH

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

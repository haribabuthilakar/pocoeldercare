---
phase: 02-integration-partner-stubs-interactive-mocks
plan: "01"
subsystem: integrations
tags: [integrations, validation, zod, adapters, fault-injection, mock-stubs]
requires:
  - phase: "01"
    subsystem: architecture-monorepo
provides:
  - "@poco/validation/partners/* with Zod schemas and fixture generators for 12 partners and wearable IoT"
  - "@poco/integrations package with IPartnerAdapter, BasePartnerAdapter, FaultInjectorService, and OutboundLoggerService"
affects:
  - "@poco/validation"
  - "@poco/integrations"
  - "@poco/database"
  - "@poco/constants"
tech-stack:
  added:
    - "@poco/integrations"
  patterns:
    - "BasePartnerAdapter abstract class with Result<T, E> error handling"
    - "FaultInjectorService with in-process LRU cache and dynamic PostgreSQL settings"
    - "OutboundLoggerService with PII sanitization (Aadhaar, cards, CVV, passwords)"
key-files:
  created:
    - packages/validation/src/partners/index.ts
    - packages/validation/src/partners/fixtures.ts
    - packages/validation/src/partners/pococare.schema.ts
    - packages/validation/src/partners/razorpay.schema.ts
    - packages/validation/src/partners/abha.schema.ts
    - packages/validation/src/partners/exotel.schema.ts
    - packages/validation/src/partners/whatsapp.schema.ts
    - packages/validation/src/partners/one-mg.schema.ts
    - packages/validation/src/partners/orange-labs.schema.ts
    - packages/validation/src/partners/health-services.schema.ts
    - packages/validation/src/partners/instamart.schema.ts
    - packages/validation/src/partners/swiggy.schema.ts
    - packages/validation/src/partners/urban-company.schema.ts
    - packages/validation/src/partners/ola.schema.ts
    - packages/validation/src/partners/wearable-iot.schema.ts
    - packages/integrations/package.json
    - packages/integrations/tsconfig.json
    - packages/integrations/tsup.config.ts
    - packages/integrations/vitest.config.ts
    - packages/integrations/src/index.ts
    - packages/integrations/src/interfaces/partner-adapter.interface.ts
    - packages/integrations/src/interfaces/mock-settings.interface.ts
    - packages/integrations/src/core/base-partner.adapter.ts
    - packages/integrations/src/core/fault-injector.service.ts
    - packages/integrations/src/core/outbound-logger.service.ts
    - packages/integrations/src/integrations.module.ts
  modified:
    - packages/validation/src/index.ts
    - packages/constants/src/partners.ts
    - packages/database/prisma/schema/partner.prisma
key-decisions:
  - "D-01: Built extensible BasePartnerAdapter implementing IPartnerAdapter with Result<T, E> response wrapping and outbound call logging."
  - "D-02: Created FaultInjectorService with in-process memory caching and dynamic PostgreSQL IntegrationPartner.mockSettings evaluation."
  - "D-03: Authored comprehensive Zod schemas and deterministic fixtures for all 12 partners plus Wearable IoT."
  - "D-08: Added OutboundLoggerService with automatic PII masking (Aadhaar, card numbers, CVV, passwords) and OutboundIntegrationCall persistence."
requirements-completed:
  - INTG-01
duration: "6 min"
completed: "2026-08-31T17:30:00Z"
coverage:
  - deliverable: "Zod schemas and DTOs for 12 partners and Wearable IoT"
    verification:
      kind: "command"
      ref: "pnpm --filter @poco/validation build"
      status: "pass"
    human_judgment: false
  - deliverable: "@poco/integrations package with BasePartnerAdapter, FaultInjectorService, OutboundLoggerService"
    verification:
      kind: "command"
      ref: "pnpm --filter @poco/integrations build"
      status: "pass"
    human_judgment: false
---

# Phase 02 Plan 01: Partner Contracts, Base Adapters & Fault Injector Summary

Scaffolded the `@poco/integrations` monorepo package and authored strongly-typed Zod contracts, deterministic mock fixture factories, and core adapter infrastructure for all 12 external integration partners and wearable IoT devices.

## Accomplishments
- **Zod 3.24+ Partner Contracts (`@poco/validation/src/partners/*`)**: Authored request, response, and webhook schemas for Pococare, Razorpay, ABHA (M1/M2/M3), Exotel, WhatsApp Business, 1mg Pharmacy, Orange Labs, Health Services, Instamart, Swiggy, Urban Company, Ola, and Wearable IoT telemetry/alerts.
- **Deterministic Fixture Generators (`fixtures.ts`)**: Built realistic mock factory functions (`createMockPococareDispatch`, `createMockRazorpayOrder`, `createMockAbhaProfile`, `createMockExotelCall`, `createMockWearableAlert`, etc.) conforming strictly to partner schemas.
- **`@poco/integrations` Package Infrastructure**: Initialized package with dual ESM/CJS build via `tsup`, workspace links, and Vitest test config.
- **`IPartnerAdapter` & `BasePartnerAdapter` Core**: Implemented generic abstract base class handling dynamic latency delay, failure rate evaluation, outbound call audit logging, and `Result<T, E>` tagged union error handling.
- **Dynamic `FaultInjectorService`**: Built in-process memory cached service querying `IntegrationPartner.mockSettings` with synthetic error modes (`TIMEOUT_GATEWAY`, `HTTP_500_SERVER_ERROR`, `INVALID_HMAC_SIGNATURE`, `RATE_LIMIT_429`).
- **`OutboundLoggerService`**: Built audit logger persisting call records to `OutboundIntegrationCall` model with automatic PII sanitization for Aadhaar numbers, credit cards, CVVs, and secrets.

## Verification
- `pnpm --filter @poco/validation build` passed with exit code 0.
- `pnpm --filter @poco/integrations build` passed with exit code 0.
- `pnpm --filter @poco/database build` passed with Prisma Client generation including `OutboundIntegrationCall`.

## Deviations from Plan
None - plan executed exactly as written.

## Self-Check: PASSED
- [x] All 12 partner Zod schemas & fixtures authored and compiled.
- [x] `@poco/integrations` builds cleanly with DTS.
- [x] BasePartnerAdapter, FaultInjectorService, OutboundLoggerService implemented.
- [x] Commit hash: ffbf52c

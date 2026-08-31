---
phase: 02-integration-partner-stubs-interactive-mocks
plan: "05"
subsystem: admin-portal
tags: [admin-portal, health-grid, fault-injection, mock-settings, scenario-presets, raw-dispatcher, call-audit, webhook-logs]
requires:
  - phase: "02-02"
    subsystem: integrations
  - phase: "02-03"
    subsystem: api
provides:
  - "Admin Portal Integration Health & Mock Management Dashboard at /admin/integrations"
  - "Responsive PartnerHealthGrid with status badges, live latency/error metrics, and test pings"
  - "Interactive FaultInjectionDrawer with latency (0-3000ms) & failure (0-100%) sliders and error modes"
  - "ScenarioPresetRunner with 1-click test templates for key multi-actor workflows"
  - "RawPayloadDispatcher and audit log inspectors for OutboundIntegrationCall and WebhookEvent"
affects:
  - "@poco/admin-portal"
tech-stack:
  added:
    - "@poco/admin-portal"
  patterns:
    - "Next.js Server Actions querying and updating database mock configurations"
    - "Interactive fault injection drawers dynamically updating PostgreSQL IntegrationPartner.mockSettings"
    - "Tabbed integration testbench (scenario presets, raw webhook dispatcher, outbound/inbound log inspectors)"
key-files:
  created:
    - apps/admin-portal/package.json
    - apps/admin-portal/tsconfig.json
    - apps/admin-portal/tsup.config.ts
    - apps/admin-portal/src/app/admin/integrations/actions.ts
    - apps/admin-portal/src/app/admin/integrations/components/partner-health-card.tsx
    - apps/admin-portal/src/app/admin/integrations/components/partner-health-grid.tsx
    - apps/admin-portal/src/app/admin/integrations/components/fault-injection-drawer.tsx
    - apps/admin-portal/src/app/admin/integrations/components/mock-settings-editor.tsx
    - apps/admin-portal/src/app/admin/integrations/components/scenario-preset-runner.tsx
    - apps/admin-portal/src/app/admin/integrations/components/raw-payload-dispatcher.tsx
    - apps/admin-portal/src/app/admin/integrations/components/outbound-call-audit-table.tsx
    - apps/admin-portal/src/app/admin/integrations/components/webhook-event-log-table.tsx
    - apps/admin-portal/src/app/admin/integrations/page.tsx
    - apps/admin-portal/src/index.ts
key-decisions:
  - "D-21: Built full integration dashboard at /admin/integrations showing 13 partner cards with live metrics, fault alerts, and 1-click test pings."
  - "D-22: Created ScenarioPresetRunner with pre-populated scenario templates and RawPayloadDispatcher for custom webhook payloads."
  - "D-23: Built FaultInjectionDrawer with interactive latency slider (0-3000ms), failure rate slider (0-100%), error mode dropdown, and custom JSON editor."
requirements-completed:
  - INTG-05
duration: "7 min"
completed: "2026-08-31T19:51:30Z"
coverage:
  - deliverable: "Admin Portal Integration Health Dashboard & Testbench"
    verification:
      kind: "command"
      ref: "pnpm --filter @poco/admin-portal build"
      status: "pass"
    human_judgment: false
---

# Phase 02 Plan 05: Admin Portal Integration Dashboard Summary

Built the Admin Portal Integration Health & Mock Management Dashboard (`/admin/integrations`), complete with the 13-card responsive partner health grid, interactive fault injection drawer (latency, failure rate, error mode injection, custom JSON templates), scenario preset testbench, raw webhook dispatcher, and outbound call / inbound webhook audit log viewers in `apps/admin-portal`.

## Accomplishments
- **`apps/admin-portal` Package Scaffold**: Initialized Next.js Admin Portal app workspace with React 19, TypeScript, tsup build pipeline, and shared package linking.
- **`PartnerHealthGrid` & `PartnerHealthCard`**:
  - Displays all 12 partners plus IoT Wearables with live status badges (`ACTIVE`, `MOCK_ONLY`, `DEGRADED`, `DOWN`).
  - Highlights active fault injection rules (e.g. `TIMEOUT_GATEWAY` or `25% Fail`).
  - Summarizes latency, fail rate, and 24h call volume with 1-click test ping trigger.
- **`FaultInjectionDrawer` & `MockSettingsEditor`**:
  - Sliders for simulated network latency (0ms to 3000ms) and failure rate (0% to 100%).
  - Error mode injection dropdown (`TIMEOUT_GATEWAY`, `HTTP_500_SERVER_ERROR`, `INVALID_HMAC_SIGNATURE`, `RATE_LIMIT_429`).
  - Configures auto-callback stage delays and custom response JSON overrides directly in PostgreSQL.
- **`ScenarioPresetRunner`**:
  - Pre-populated test scenario templates (Pococare ambulance dispatch, Razorpay payment capture/fail, Exotel emergency hotline call, ABHA consent auto-grant, 1mg delivery, Orange Labs lab report PDF, Wearable fall alert, and silent heartbeat ping).
- **`RawPayloadDispatcher` & Audit Inspectors**:
  - `RawPayloadDispatcher`: Interactive custom webhook builder with partner selector, endpoint path, and response inspector.
  - `OutboundCallAuditTable`: Real-time audit log of external partner calls with masked PII and duration metrics.
  - `WebhookEventLogTable`: Transactional idempotency audit log tracking status transitions (`PROCESSED`, `FAILED`, `PENDING`).

## Verification
- `pnpm --filter @poco/admin-portal build` passed with exit code 0 and generated DTS type declarations.

## Deviations from Plan
None - plan executed exactly as written.

## Self-Check: PASSED
- [x] Admin integration health dashboard renders all 13 partners.
- [x] Fault injection drawer provides interactive latency and failure rate sliders.
- [x] Scenario preset runner and raw webhook dispatcher built.
- [x] Outbound call audit and webhook event logs inspectable with EmptyState fallbacks.
- [x] Commit hash: 5900a74

# Phase 03: Common NestJS Backend & Business Services - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-09-01
**Phase:** 03-common-nestjs-backend-business-services
**Areas discussed:** AI Classification Engine, In-Process pg-boss Queues & 1GB Droplet Tuning, Dual JWT Auth & Multi-Surface API Design, S3 Presigned Media & Local Dev Fallback

---

## AI Classification Engine

| Option | Description | Selected |
|---|---|---|
| Claude 3.5 Haiku as primary + Rule-based keyword fallback | Sub-second Claude Haiku for production + local regex keyword heuristics for offline/dev. | |
| Claude 3.5 Sonnet as primary + Rule-based fallback | Maximum nuance and reasoning at slightly higher latency/cost. | |
| Strict Claude API with no keyword fallback | Fail triage if API key is missing or Anthropic returns error. | |
| **Pluggable Multi-LLM Provider Engine** | Swappable providers (Anthropic, Gemini, OpenAI, DeepSeek) via Admin Portal config, with built-in mock classifier for dev/test. | — |

**User's choice:** Design it in such a way that AI models from Anthropic, Gemini, OpenAI, DeepSeek etc. can be swapped via a configuration on the admin portal. For dev, the response should be mocked.
**Notes:** Created provider abstraction (IAiClassificationProvider) with dynamic runtime config in SystemConfig and deterministic MockAiClassifierProvider for offline dev/test environments.

---

## In-Process pg-boss Queues & 1GB Droplet Tuning

| Option | Description | Selected |
|---|---|---|
| Conservative worker concurrency + 24h prune (Recommended) | Concurrency 2 for AI, 5 for notifications, 60s SLA cron (batch 50), 24h job retention. | — |
| Higher concurrency pool + 7-day retention | Concurrency 5 for AI, 10 for notifications, 30s SLA cron, 7-day retention. | |
| Single serial worker queue + immediate purging | Concurrency 1 across all queues, immediate job deletion. | |

**User's choice:** Conservative single-worker concurrency with tuned batch sizes (ai-classification: concurrency 2, notification-dispatch: concurrency 5, sla-transition: 60s cron with batch size 50). Auto-archive completed jobs after 24h to keep PostgreSQL database size minimal on the 1GB droplet.
**Notes:** Ensures Node memory stays capped well under 350MB limit with zero risk of droplet OOM.

---

## Dual JWT Auth & Multi-Surface API Design

| Option | Description | Selected |
|---|---|---|
| Unified Bearer tokens + X-Household-Id header (Recommended) | Authorization: Bearer <token> for all surfaces + X-Household-Id header for switching + refresh rotation. | — |
| Dual Mode: HTTP-only Cookies for Web + Bearer for Mobile | Cookies for web portals, Bearer header for React Native. | |
| Session-scoped JWTs | Household ID embedded in JWT; switching requests new token from /api/auth/switch-household. | |

**User's choice:** Unified Bearer tokens in Authorization header for all surfaces (Web + Mobile) + X-Household-Id header validated against user memberships for multi-household switching. Refresh token rotation endpoint (/api/auth/refresh).
**Notes:** Provides a unified, clean contract across Next.js web portals and React Native mobile field app.

---

## S3 Presigned Media & Local Dev Fallback

| Option | Description | Selected |
|---|---|---|
| In-app Local Storage Server for Dev (Recommended) | When S3 credentials unset, presigned URLs point to /api/test/media/upload/:key which writes to local disk and serves statically. | — |
| Mock Direct Bypass | Dev mode presign instantly returns static placeholder image URLs without binary uploads. | |
| Require Local MinIO Container | Require MinIO S3 container in Docker Compose. | |

**User's choice:** In-app Local Storage Server for Dev: When S3 credentials are unset, presigned URLs point to /api/test/media/upload/:key which writes to local disk (uploads/ dir) and serves media statically. Preserves identical 2-step presign->PUT flow for clients in both dev and production.
**Notes:** Clients use the exact same 2-step presign and PUT flow in dev and production with zero cloud dependencies.

---

## the agent's Discretion

- Internal NestJS service decomposition, module dependency wiring, and controller route organization.
- Exact regex pattern formulations for the dev mock AI classifier.
- Local disk upload file naming conventions in dev mode (uploads/:uuid.:ext).

## Deferred Ideas

None — discussion stayed strictly within Phase 3 scope.

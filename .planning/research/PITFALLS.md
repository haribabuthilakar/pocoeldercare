# Pitfalls Research

**Domain:** Elder Care Operations & Technology Platform
**Researched:** 2026-08-31
**Confidence:** HIGH

## Critical Pitfalls & Mitigation Strategies

### 1. Memory Exhaustion on 1GB DigitalOcean Droplet

- **Failure Mode**: Running separate Node background worker processes, Redis containers, or unconstrained database queries triggers the Linux OOM (Out Of Memory) killer, terminating the backend container.
- **Warning Signs**: Container restarts, response latency spikes, high swap memory usage.
- **Prevention Strategy**:
  - Run `pg-boss` background workers in-process within the NestJS runtime (single Node process).
  - Use in-memory LRU cache (`cache-manager`) rather than deploying a standalone Redis container.
  - Set Node `--max-old-space-size=384MB` and tune PostgreSQL `shared_buffers=128MB`, `work_mem=4MB`.
  - Cap pg-boss queue worker concurrency to 2-4 jobs.
  - Enforce cursor-based pagination and selective field fetching on all list queries.
- **Roadmap Phase**: Addressed in Phase 1 (Foundation/Infra) & Phase 3 (Backend).

### 2. Offline Data Sync Conflicts & State Corruption

- **Failure Mode**: Field Officers working in offline areas overwrite authoritative state (e.g. ticket status, wallet deductions, assignments) when syncing back to the server.
- **Warning Signs**: Reverted ticket statuses, duplicate service completions, inconsistent audit logs.
- **Prevention Strategy**:
  - The server is strictly authoritative for financial, assignment, and state machine transitions.
  - Client actions generate UUIDs and queue *proposed* state transitions.
  - Use field-level Last-Write-Wins (LWW) only for non-critical attributes (e.g. notes).
  - If a ticket was modified/closed while the officer was offline, reject the conflicting transition and present a clear conflict resolution UI.
- **Roadmap Phase**: Addressed in Phase 6 (Field App & Sync).

### 3. Grandfathering & Version Drift in Catalog and Subscriptions

- **Failure Mode**: Editing a service catalog item or package price directly updates existing customer subscriptions or active service requests, breaking pricing guarantees and historic audits.
- **Warning Signs**: Customer invoices changing unexpectedly, discrepancies between contracted package terms and current pricing.
- **Prevention Strategy**:
  - Service catalog items and packages are versioned with immutable `ServiceCatalogVersion` and `PackageVersion` rows.
  - `HouseholdSubscription` foreign keys pin to the specific `packageVersionId` in effect at renewal.
  - `ServiceRequest` records pin to the specific `serviceCatalogVersionId`.
  - Version records are published copy-on-write; active versions are never mutated in place.
- **Roadmap Phase**: Addressed in Phase 1 (Data Model) & Phase 3 (Billing/Catalog).

### 4. Synchronous Blocking & Hallucinations in AI Message Classification

- **Failure Mode**: Calling the LLM synchronously during chat posting introduces 2-5s latency spikes. If the LLM auto-dispatches services without human verification, seniors receive unintended visits or billing charges.
- **Warning Signs**: Chat message submission lag, false service dispatch tickets, unexpected wallet charges.
- **Prevention Strategy**:
  - Free-form chat messages are saved immediately and return 201 Created; AI classification runs asynchronously via `pg-boss`.
  - AI outputs structured JSON with confidence scoring.
  - High-confidence messages auto-create a ticket tagged **`Pending Triage`** — no services are dispatched until an Operations Executive explicitly confirms and decomposes the ticket in the Admin Portal.
  - Low-confidence messages remain plain chat messages.
- **Roadmap Phase**: Addressed in Phase 7 (AI Classification Pipeline).

### 5. SLA State Race Conditions & Escalation Storms

- **Failure Mode**: Multiple workers or race conditions triggering redundant escalation alerts or cascading notifications to Senior Care Officers and families simultaneously.
- **Warning Signs**: Duplicate fallback notifications, erratic state changes between `Normal` and `At Risk`.
- **Prevention Strategy**:
  - Dedicated `sla-transition` queue job runs on scheduled intervals with database advisory locking.
  - Strictly separate family-configurable escalation (notification acks + payments) from internal delivery escalation (Care Officer -> Senior Care Officer fallback).
  - SLA state transitions (`Normal` -> `At Risk` -> `Breached`) are idempotent and log audit timestamps (`respondedAt`, `deliveredAt`).
- **Roadmap Phase**: Addressed in Phase 3 (SLA Engine).

### 6. Emergency Wallet Overdraft Handling vs Non-Emergency Service Lockouts

- **Failure Mode**: Senior in critical medical need blocked from ambulance dispatch due to empty wallet, or non-emergency services draining wallet without payer authorization.
- **Warning Signs**: Delayed emergency response, family disputes over unexpected debit charges.
- **Prevention Strategy**:
  - Enforce the 3-step billing hierarchy in `@poco/business-rules`:
    1. Emergency tagged (catalog default or ops override) -> Auto-debit wallet (allow negative balance), dispatch immediately.
    2. Non-emergency + User requested + Sufficient funds -> Auto-debit wallet, dispatch.
    3. Else -> Hold service in `Pending Approval` and trigger family top-up notification.
- **Roadmap Phase**: Addressed in Phase 1 (Business Rules) & Phase 3 (Billing Engine).

### 7. Care Officer Multi-Role Authorization Leaks

- **Failure Mode**: Internal users holding multiple roles (e.g. Care Officer + Training Manager) bypassing household assignment gates or reassigning households without Care Officer Manager role.
- **Warning Signs**: Uncertified officers assigned to households, non-managers executing reassignments.
- **Prevention Strategy**:
  - Strict database constraint: exactly one active Care Officer assignment per household (`endedAt IS NULL`).
  - Household assignment mutation endpoint restricted exclusively to `Care Officer Manager` role at the NestJS service layer.
  - Mandatory certification check enforced in the assignment service before any assignment transaction commits.
- **Roadmap Phase**: Addressed in Phase 1 (Data Model/Rules) & Phase 4 (Admin Portal).

---
*Pitfalls research for: Poco Elder Care*
*Researched: 2026-08-31*

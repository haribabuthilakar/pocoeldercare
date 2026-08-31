# Poco Elder Care — System Design Brief

**Purpose of this document:** This is the authoritative brief for an AI design agent tasked with iteratively designing the operations and technology layer for Poco, an elder care startup. It combines the original product/business specification with a set of clarifying decisions made by the founder to resolve ambiguities. Treat every item under "Resolved Decisions" as a hard constraint, not a suggestion — where it conflicts with anything in the "Original Specification" section, the resolved decision wins.

**How to use this document:** Work through the "Design Tasks" section at the end in order. Each task should produce a concrete artifact (schema, diagram, API contract, etc.) that is internally consistent with every decision recorded here. Where you find a genuine ambiguity not covered below, flag it explicitly as an open question rather than silently assuming an answer.

\---

## 1\. Business Overview

Poco is an elder care service business operating in India. It coordinates a mix of **first-party service delivery** (via its own care officers) and **outsourced/partner-delivered services** (via integration partners) on behalf of seniors, paid for and monitored by their families. The system has three user-facing surfaces plus a backend:

* **Family Portal** (Next.js web app) — used by family members and (in future) seniors
* **Field App** (React Native mobile app) — used by care officers and internal roles with the Care Officer role
* **Admin Portal** (Next.js web app) — used by internal operations, sales, customer success, finance, training, and admin roles
* **Common Backend** (NestJS + Postgres/Prisma) — serves all three surfaces, owns all business logic and integrations

Revenue comes from three subscription packages (Kavach, Sahara, Sampoorna) with per-service quotas, plus pay-per-use overage billed against a per-household wallet.

\---

## 2\. Actors

|Actor|Summary|
|-|-|
|Senior|Recipient of services. Has own login credentials (unused today; reserved for future device/wearable auth).|
|Primary family member|Pays for services, has full wellness access, is the only one who can administer family membership (invite/remove members).|
|Family member|Invited by the primary member. Has **identical** access to the primary member except cannot administer family membership — includes payment and approval authority.|
|Senior care officer|Delivers services to their own assigned households; additionally mentors a small group of care officers and acts as automatic fallback if an assigned officer is unavailable/unresponsive. Can view (not reassign) the households of officers reporting to them.|
|Care officer|Delivers services; is the fixed owner of everything each of their assigned households needs (each household maps to exactly one care officer, but a care officer is responsible for multiple households).|
|Operations executive|Triages and manages tickets; can override a service's emergency flag when creating a request.|
|Sales executive|Owns a lead from signup until an in-person onboarding visit is completed, at which point ownership transfers to customer success.|
|Customer success executive|Owns a household from onboarding-visit-complete through care officer assignment; also handles payment reminders, mock drills.|
|Finance executive|Manages payouts.|
|Care officer manager|The **only** role that can assign or reassign a care officer to a household.|
|Training manager|Creates trainings/certifications; tracks completion.|
|Admin|Manages users/roles; full access.|

**Note on roles:** Internal auth is role-based, and a single internal user may hold multiple roles simultaneously (e.g. someone could be both a Care Officer and a Training Manager). Field App access is granted to any internal user holding the "Care Officer" role, regardless of their other roles.

\---

## 3\. Resolved Decisions

These were clarified through a Q\&A process and should be treated as binding requirements.

### 3.1 Tickets \& Service Requests

* A **ticket** is any event or need raised by a senior or family member (e.g. an emergency call, a medicine request). It can be raised directly by the senior, by a family member, or by a care officer on the senior's behalf.
* A ticket can **decompose into one or more service requests** — e.g. an emergency ticket might spawn an "ambulance dispatch" service request and an "admission paperwork" service request. Or it can map 1:1 to a single service (e.g. "medicine delivery").
* Each service type has its own SOP and execution flow. The owner of a service request is not static and can change from one person to another depending on the workflow stage (e.g., from an ops executive coordinating a third party to a care officer executing on-site). Regardless of ownership, all service requests for a household remain visible to that household's assigned care officer.
* **Ticket status aggregation \& exceptions**: A ticket's overall status is derived through a standard rollup rule over its child service requests. If child states produce an exception or ambiguous rollup condition, the ticket automatically transitions to a `Waiting Ops Update` status, surfacing immediately in the operations queue for manual resolution.
* **Phone-in tickets**: an inbound call (via Exotel) automatically creates a ticket and opens a handling UI for the operations executive — it is not a fully automated ticket, but the ticket creation itself is automatic and immediate.

### 3.2 State Machines

* Design **one ticket/service-request lifecycle state machine** that works uniformly across all service types (e.g. something like `Open → Assigned → In Progress → Pending Approval → Completed → Closed`, with room for `Cancelled` and exception states like `Waiting Ops Update`).
* Design a **separate, orthogonal SLA-tracking state machine** with exactly three states: `Normal`, `At Risk`, `Breached`. This tracks response/delivery SLA compliance independently of the lifecycle state, and drives automatic escalation (see 3.3).

### 3.3 Escalation

* Escalation is **automatic and SOP/SLA-driven** — never a manual "notice and step in" process. Every service has a defined SOP with response and delivery SLAs; breaching these drives escalation per the SLA state machine above.
* There are **two escalation trees that never intersect**:

  1. **Family-configurable escalation tree**: used only for (a) notification acknowledgements and (b) pending payment/wallet-approval chasing. Configured by the family within their portal.
  2. **Internal escalation tree**: used for service delivery SLA breaches. Governed by the care officer → senior care officer fallback structure. May or may not result in a family notification, but is structurally separate from tree #1.

### 3.4 Care Officer Assignment

* There is a **strict 1:1 mapping from a household to a care officer** at all times (each household has exactly one assigned officer; a given officer is responsible for multiple households). That officer is responsible for everything the household needs, regardless of the nature of the ticket/service — there is no per-ticket or availability-based routing.
* Only the **Care Officer Manager** can create or change this assignment (initial assignment or reassignment). No one else — not even a Senior Care Officer — can reassign.
* A **Senior Care Officer** can view the households/details of officers reporting to them, and automatically acts as fallback if the assigned officer is unavailable/unresponsive (per the SLA-driven escalation in 3.3) — but cannot perform reassignments.

### 3.5 Certification Gating

* Care officers must complete a **mandatory set of certifications** before they can be assigned to any household by the Care Officer Manager.
* All other trainings/certifications are optional and tracked for compliance/reporting only.
* Once an officer is assigned to a household, there are **no further runtime restrictions** on which services/SOPs they can execute for that household.

### 3.6 Billing, Quotas \& Wallet

* **Wallet and family/household relationship is always scoped to a single household** — not to a "family account." One person can be a (even primary) family member for multiple households, but must switch between them via a dropdown (shown only when the user belongs to more than one household). There is no aggregate/cross-household view planned.
* **Billing cycles \& Quota Validity**: Billing can be monthly or yearly. Service quotas are valid strictly for the active billing period. There are no mid-cycle plan changes allowed at this time.
* Each package (Kavach, Sahara, Sampoorna) defines a **per-service quota**, drawn down first for each service use.
* Each service catalog item defines a specific **unit price** (`priceInr`) applied when service quotas are exhausted or for pay-per-use requests.
* Once a service's quota is exhausted, apply this priority order:

  1. If the service is tagged **emergency** (see 3.7), it is delivered regardless of wallet balance, and the wallet is debited by the service unit price — going negative if necessary.
  2. Else, if the wallet has sufficient balance **and** the service was explicitly requested by the senior or family (not proactively suggested by staff), auto-debit the wallet.
  3. Else, notify the primary family member (payer) to top up the wallet and approve the service before it is delivered.
* **Services and Packages are version-controlled and grandfathered** — this is the mechanism for handling package upgrades/downgrades and catalog changes over time without breaking existing subscriptions. Design entities so that a household's active package/service terms are pinned to the version in effect when they subscribed/renewed, not a live-editable global record.
* **Package pricing is configurable per package version** (e.g. current: Kavach ₹500/mo, Sahara ₹3,000/mo, Sampoorna ₹12,500/mo — but these are data, not constants).

### 3.7 Emergency Tagging

* Emergency status is captured at **two levels**:

  1. A **default emergency flag** set on certain services in the catalog (data-level default).
  2. An **override** that an operations executive or care officer (never a family member) can apply when creating a specific service request, regardless of the catalog default.

### 3.8 Auth \& Permissions

* Two separate authentication/authorization systems: **internal** (staff, role-based, multi-role support) and **external** (family/senior).
* **Seniors have their own credentials** in the external system today, with no active use case — reserved for a future simplified app or device/wearable-based authentication (not necessarily password/PIN — could be a device token or hardware).
* **All invited family members** (primary and non-primary) have **identical full access**, including payments and service approvals. The **only** exception: administering family membership (inviting/removing members) is restricted to the primary family member.

### 3.9 Onboarding / Lead Flow \& Household Activation

* On signup, a user gets **immediate full feature access** — they can add households, seniors, family members, and make payments right away.
* However, the household's **onboarding status remains "Pending"** and services do not start until: (a) a care officer is assigned, and (b) an in-person visit is completed to collect documents, etc.
* The Field App includes functionality for the care officer to explicitly **activate the household** upon completing the onboarding process, updating the household's status to `Active`.
* **Ownership handoff**: the lead sits with **Sales** from signup through onboarding-form completion; once onboarding is "Pending" awaiting a visit/care-officer-assignment, ownership moves to **Customer Success**.

### 3.10 Wearable / Fall Detection

* Hourly "healthy" pings from the wearable are **not surfaced on any dashboard or report** — they are a pure backend signal.
* A **missed ping automatically creates a ticket** and alerts both the operations team and the assigned care officer.
* This ticket **is visible** to the family in their portal but **does not trigger a notification** to them.
* If triage of that ticket confirms a genuine emergency, the standard internal escalation and family notification ladder (per 3.3) applies from that point.

### 3.11 Service Catalog Corrections \& Open Items

* **Comprehensive geriatric assessment** (listed under "Primary and continuing care") does **not** simply route to the phlebotomy partner as the original catalog table implies. It has its own elaborate SOP **coordinated by the care officer**, and may involve multiple phlebotomy services and doctor consultations as sub-components.
* **Doctor consultation workflows**: Detailed dispatch, assignment, and consultation workflows for empanelled doctors are left as an open design item for now.

### 3.12 Activity Feed / Chat (Family + Field App)

* Build a **unified, per-household activity feed** that mixes system-generated events (vitals logged, ticket created, service delivered, appointment scheduled, etc.) with free-form chat messages.
* The feed is **not intended to be a true real-time messaging system**, but is designed to provide the visual comfort and familiarity of a chat app. Client-side polling when the screen is open is sufficient.
* **Any party can post**: family members and the assigned care officer. This is a **single shared thread per household**, visible identically in the Family Portal and the Field App — there is no separate internal-only thread.
* **Internal-only organizational activity/events are excluded** from this thread entirely (it is a user-facing feature, not an ops log).
* An **AI/classification layer** monitors new free-form messages in the thread and proposes converting relevant ones into tickets or service requests (e.g. a family member typing "can we get a nurse to visit tomorrow?" should be flagged as a candidate service request). Design the human-in-the-loop mechanics for confirming/rejecting these AI-proposed conversions.

### 3.13 Scope Exclusions

* **Nivas** (high-dependency/long-term care: live-in attendants, GNM nurses, equipment rental, palliative care, etc.) is **entirely out of scope** for this phase. Do not create scaffolding, tables, or placeholder entities for it.

### 3.14 Integration Strategy

* Build **realistic stubs/mocks for every external integration** listed (Pococare, Razorpay, ABHA, Exotel, WhatsApp, 1mg, Orange Labs, health services partner, Instamart, Swiggy, Urban Company, Ola) — no real API calls in this build.
* For integrations that involve **user-facing UI flows** (notably **Razorpay** payment UI and **Exotel** telephony UI), also build **frontend mocks** of those flows, not just backend stub endpoints.
* The Admin Portal must include an interface to **view integration health, edit stub configs, and send/receive realistic test data** through each stub.
* Wherever official integration documentation exists publicly, follow it for stub fidelity; otherwise, design and document a plausible integration contract before stubbing it.

### 3.15 Non-Functional / Tech Building Blocks

The following building blocks must be explicitly designed, not left implicit:

* **AI**: primarily for the activity-feed message classification (3.12); also, consider proactive uses (e.g. deterioration alerts, monthly report generation) if time-boxed appropriately.
* **Queueing system**: needed for async processing — e.g. webhook ingestion (fall alerts, missed pings, Pococare callbacks), SLA state transitions, notification dispatch, AI classification jobs. Choose and justify a specific technology compatible with the existing stack (NestJS + Postgres + Digital Ocean single-server deployment).
* **Caching**: identify where needed (e.g. service catalog/package version lookups, dashboard aggregates) and choose a lightweight solution appropriate to a 1GB DO droplet.
* **Field App offline capability \& Media Storage**: care officers must be able to work (view assigned households, log visit data, follow SOPs) without connectivity, syncing when back online. Media uploads (photos/audio/video) use S3-compatible cloud storage, with only the resulting public/presigned URL stored in the Postgres database.
* **DRY principle**: business logic (state machines, SLA rules, billing rules, permission checks) should live once in the shared backend, not be duplicated across Family Portal, Field App, and Admin Portal front ends. Favor shared validation/type packages within the pnpm/turbo monorepo.

\---

## 4\. Original Specification (Reference)

*The following sections are carried over from the source specification document. Where anything here conflicts with Section 3 above, Section 3 governs.*

### 4.1 Tech Components

Admin portal, Field App, Family portal, Common backend.

### 4.2 External Integrations

All integrations happen via the backend:

* **Pococare emergency services**: 24x7 helpline + ambulance dispatch (handled directly, webhook for details); emergency profile/ICE/insurance (API to update); teleconsultation (handled directly, webhook); other data — hospital network, doctor panel, etc. (API).
* **Razorpay** — payments
* **ABHA** (Ayushman Bharat Health Account) — health records
* **Exotel** — telephony
* **WhatsApp** (etc.) — notifications
* **1mg** — pharmacy/medicine delivery
* **Orange Labs** — phlebotomy services
* **Health services partner** — nursing/physiotherapy
* **Instamart** — quick commerce
* **Swiggy** — food delivery
* **Urban Company** — home services
* **Ola** — transportation
* **Fall detection wearable** — hourly healthy pings; real-time fall alert via webhook (see 3.10 for resolved handling)

### 4.3 Tech Stack

NestJS · Postgres/Prisma · Next.js/Tailwind/Shadcn · React Native · JSON over REST · Vitest + Playwright · Nginx · Docker · Digital Ocean 1GB server · pnpm/turbo monorepo · Two separate auth/authz systems (internal, external).

### 4.4 Features by Surface

**Family Portal**: landing page for unauthenticated users; login/signup (signup creates a lead + optional onboarding form); onboard household; onboard senior within household; switch households/seniors (via a dropdown, shown only when the user belongs to more than one household — see 3.6); vitals trend dashboard; emergency contact/hospital preferences; insurance details view/edit; contact dedicated care officer; **unified per-household activity feed / chat** — clickable timeline of vitals, tickets, and service requests, with free-form messaging to the care officer and AI-assisted conversion of messages into tickets/service requests (see 3.12); view health records; view medication schedule/records; approve paid services; request services; view calendar/appointments; view monthly report; manage wallet/payments (wallet is per-household, see 3.6); view/download invoices; invite family members (primary member only, per 3.8); manage escalation tree (family-facing tree only — notification acknowledgements and pending payments, see 3.3).

**Field App**: onboard senior/household (collect docs); activate household (see 3.9); view assigned seniors across all of the officer's assigned households (see 4.4 note on multi-household ownership); view tickets; follow SOPs (visit, enter details, upload media to S3, provide services, request additional services); view/manage visit schedule; geofenced visit tracking; birthday/anniversary/festival reminders; **same shared per-household activity feed / chat as the Family Portal** — client polling, no separate internal-only thread (see 3.12); create monthly report; view/access trainings; complete certifications (mandatory set gates household assignment, see 3.5); view officers reporting to them, act as automatic fallback on SLA breach *(reassignment itself restricted to Care Officer Manager per 3.4)*.

**Admin Portal**: ticket management (1 assignee per ticket; can spawn service requests; emergency flag override by ops executive, see 3.7; triage `Waiting Ops Update` tickets, see 3.1); mock drills; customer management (households, payment reminders, messaging); lead management (sales owns lead through onboarding-form completion, then hands off to customer success, see 3.9); field officer management (assign/reassign — *restricted to Care Officer Manager per 3.4* — track performance, SLAs, reporting structure); service catalog management (versioned, unit pricing, see 3.6); package management (Kavach, Sahara, Sampoorna — versioned inclusions/rates, see 3.6); empanelled doctor list management; network hospital management; integrations management (health, configs, test pings); raw DB table viewer.

### 4.5 Development Requirements

* Realistic stubs for all external integrations (see 3.14)
* Admin Portal UI to send/receive realistic data through stubs
* Seed script: ≥2 users per internal role, \~50 care officers, \~200 households (1–4 seniors each) with realistic fake data
* Comprehensive unit testing (Vitest)
* Comprehensive e2e testing (Playwright) + Admin Portal UI to view test runs/results/history
* Deployment script for a single DO/Nginx server; seed script runs only on fresh install

### 4.6 Service Catalog

*(Full catalog carried from source doc — categories: Emergency Response; Primary \& Continuing Care; Diagnostics \& Monitoring; Medication Management; Therapy/Rehab/Mental Health; ~~High Dependency \& Long-Term Care (Nivas — excluded, see 3.13)~~; Records/Insurance/Advocacy; Home \& Daily Living; Financial/Legal/Compliance; Mobility/Travel/Accompaniment; Companionship \& Engagement; Family Layer. Each item is tagged NA (no direct servicing) or mapped to an owner: Care Officer / Operations Executive / a named integration partner / an empanelled doctor. See original spec for the full item-by-item list — reproduce verbatim from `Poco\_Elder\_Care\_Specs\_V2.md` when the design agent needs it; not repeated here to avoid duplication, since it should be treated as <b>source data to be loaded into the versioned service catalog</b>, not spec prose.). The full service catalog is listed in section 10*

### 4.7 Packages

* **Kavach** — ₹500/mo — emergency helpline only; most services pay-per-use
* **Sahara** — ₹3,000/mo — limited quota of services; some pay-per-use only
* **Sampoorna** — ₹12,500/mo — generous quota across all services

*(All three are subject to 3.6's version-control/grandfathering requirement — treat the above as the current version's data, not hardcoded values.)*

\---

## 5\. Tech Building Blocks — Detailed Design

This section resolves the high-level building blocks flagged in 3.15 into concrete technology choices and architecture, all constrained by the actual deployment target: a **single 1GB Digital Ocean droplet**, running the whole stack (Postgres, the NestJS backend, background workers, and Nginx) via **Docker**. RAM is the binding constraint throughout — every choice below favors solutions that avoid running an additional heavyweight service (e.g. a separate Redis instance, a separate message broker) unless there's no reasonable alternative.

### 5.1 Queueing System

**Choice: Postgres-backed job queue (e.g. `pg-boss` or equivalent), not a separate broker like RabbitMQ/Kafka, and not Redis-backed BullMQ.**

* Rationale: a Postgres-native queue uses the database that's already running, adding no new process and no new memory footprint — critical on a 1GB droplet. It also gives transactional enqueue-with-your-write-for-free (e.g. "create the ticket and enqueue the notification job in the same DB transaction"), which a separate broker can't offer without extra plumbing.
* Run queue **workers in-process** with the main NestJS application (not as a separate container) to avoid the overhead of a second Node runtime. Use a small worker concurrency limit (e.g. 2–4) appropriate to the droplet's CPU.
* **Queue topics/job types to design for:**

  * `webhook-ingestion` — Pococare callbacks, wearable fall alerts, missed-ping events, partner "loop closed" callbacks (phlebotomy, pharmacy, health services partner, etc.)
  * `sla-transition` — scheduled/triggered jobs that evaluate each open service request against its SLA clock and flip its SLA state (Normal → At Risk → Breached), firing internal escalation on breach
  * `notification-dispatch` — outbound WhatsApp/SMS/push notifications (family escalation tree acknowledgements, payment reminders, service updates)
  * `ai-classification` — activity feed message → ticket/service-request proposal (see 5.3)
  * `billing` — wallet debits, overage checks, quota resets on package renewal
  * `reporting` — monthly report generation, aggregate rollups
* Each job type should have a bounded retry policy with backoff, and failures should surface in the Admin Portal (ties into Design Task 10's test/health reporting UI — extend it to show failed/stuck jobs too).

### 5.2 Caching

**Choice: in-process caching only (e.g. NestJS's built-in `CacheModule` backed by an in-memory LRU store), no standalone Redis for this phase.**

* Rationale: Redis is the standard choice at scale, but running it as a second process on a 1GB droplet is expensive relative to the payoff at Poco's likely MVP traffic. In-process memory caching, scoped carefully, covers the real hot paths without the extra footprint.
* **What to cache:**

  * Active **service catalog** and **package** version lookups (3.6) — these change rarely (only on new version publish) and are read on almost every ticket/billing operation. Invalidate on publish, not on a TTL, to avoid ever serving a stale version.
  * Household → care officer assignment lookups (3.4) — changes only via explicit Care Officer Manager action; invalidate on write.
  * Any precomputed dashboard aggregates (e.g. vitals trend summaries) — these can tolerate a short TTL (e.g. 5 minutes) rather than event-based invalidation.
* **Explicitly do not cache**: wallet balances, ticket/service-request state, or anything SLA-related — these must always be read fresh from Postgres, since staleness there has direct financial or care-delivery consequences.
* Revisit Redis if/when the droplet is upsized or traffic patterns show in-process caching isn't sufficient (e.g. multi-instance horizontal scaling, which would break in-process cache consistency across instances).

### 5.3 AI

**Choice: calls to a hosted LLM API (e.g. the Claude API) from a backend service, invoked asynchronously via the `ai-classification` queue — never synchronously in the request path of a user action.**

* **Primary use case — activity feed classification (3.12):** when a free-form message is posted to a household's activity feed, enqueue an `ai-classification` job. The job sends the message (plus relevant recent context — e.g. the last few feed items, the household's active services) to the LLM with a structured-output prompt, asking it to return: (a) whether this looks like a service request or informational, (b) which catalog service(s) it most likely maps to, (c) a confidence score.

  * **Human-in-the-loop mechanics:** above a confidence threshold, the classification job **auto-creates a ticket** directly from the message — no confirmation prompt is shown in the messaging UI, since that UI is family/care-officer-facing and should never surface an internal operational question like "create ticket?". The auto-created ticket is tagged **Pending Triage** and shown as such in the activity feed (e.g. a small status chip on the corresponding feed item), so family and the care officer can see something was picked up. On the backend/Admin Portal side, an **operations executive triages** every Pending Triage ticket — reviewing the source message and confidence/suggested-service output, then deciding whether to decompose it into one or more actual service requests (per 3.1) or dismiss it as a false positive. Below the confidence threshold, no ticket is created and the message just sits in the feed as a plain chat message.
  * Log every classification decision (message, model output, confidence, human action taken) — this becomes training/eval data for tuning the prompt or threshold over time.
* **Secondary/future use cases** (design for extensibility, don't build yet): AI-drafted monthly report summaries from the activity feed + structured data (care officer reviews/edits before sending); deterioration alerts from vitals trends (explicitly marked NA/out-of-scope in the service catalog today — do not build this without an explicit product decision).
* Keep the AI call **fully decoupled from the write path** — if the AI API is slow or down, feed messages must still post immediately; classification is a best-effort, eventually-consistent enhancement layered on top.

### 5.4 Field App Offline Capability \& Media Uploads

**Choice: an offline-first local datastore on-device (e.g. WatermelonDB or a similar SQLite-backed sync layer for React Native), direct S3-compatible cloud storage for media, with an explicit sync protocol against the backend.**

* **What must work offline:** viewing assigned households and their details, viewing/following SOPs already downloaded, logging visit data (notes, local media capture references), completing checklist-style SOP steps, viewing the activity feed as of last sync (read-only when offline).
* **What requires connectivity:** posting new activity feed messages/chat (queue locally, send on reconnect — see below), uploading media to S3, anything requiring a fresh server read (e.g. real-time ticket assignment changes).
* **Media Upload Architecture:** Media (photos/audio/video captured during visits or SOP completions) is uploaded directly to S3 storage via presigned URLs. Only the final S3 media URLs are submitted to the backend API and stored in Postgres, avoiding binary payload handling on the droplet.
* **Sync protocol:**

  * Every offline-created record (a visit log, an uploaded photo reference, a completed SOP step) is created locally with a **client-generated UUID** and an `synced: false` flag, then pushed to the backend on reconnect via a batch sync endpoint.
  * **Conflict resolution:** favor a **field-level last-write-wins by timestamp** for simple fields, but for anything that affects money, state machines, or assignment (ticket status, service request status, wallet transactions), the **server is always authoritative** — offline actions of that kind should be queued as *proposed* transitions that the backend validates and can reject (e.g. if the ticket was already closed by someone else while the officer was offline), surfacing a clear conflict resolution UI to the officer rather than silently dropping or overwriting.
  * Large media (photos/video) sync opportunistically in the background, prioritized after the smaller structured data syncs first, so a spotty connection doesn't block getting critical state (like "visit completed") to the server.
* **Design note:** this is the one component where relaxing the "everything lives once in the backend" DRY principle (5.5) is unavoidable — the Field App necessarily duplicates a subset of validation logic locally (e.g. "is this SOP step complete") so it can function fully offline. Keep this duplicated surface as small as possible, and always re-validate server-side on sync.

### 5.5 DRY Architecture Across the Monorepo

* Structure the **pnpm/turbo monorepo** with shared packages that both the backend and (where applicable) the frontends import, rather than reimplementing logic per app:

  * `@poco/types` — shared TypeScript types/DTOs for every entity (Ticket, ServiceRequest, Household, Visit, etc.), generated from or kept in sync with the Prisma schema.
  * `@poco/validation` — shared Zod (or similar) schemas for request/response validation, usable both server-side (NestJS pipes) and client-side (form validation) so validation rules are defined once.
  * `@poco/business-rules` — the **canonical, single implementation** of the ticket/service-request state machine, the SLA state machine, and the billing decision tree (3.6). The backend is the only place these are ever *executed* against real state (per 5.4's note above), but frontends import the same package purely to render correct UI states (e.g. greying out an action that isn't valid in the current state) without redefining the rules.
  * `@poco/constants` — role names, permission flags, service catalog category enums, etc., defined once.
* Enforce via code review / CI lint rule that no app-level package reimplements a state transition, permission check, or billing calculation that already exists in `@poco/business-rules` — the backend API is always the source of truth at runtime; shared packages exist to keep everyone's *understanding* of the rules in sync, not to create a second execution path.

### 5.6 Deployment Topology (1GB Droplet)

* **Single Docker Compose stack** on the droplet: one container for Postgres, one for the NestJS app (serving the API and running the in-process queue workers described in 5.1), one for Nginx (reverse proxy + static asset serving for the Next.js apps, and TLS termination).
* Next.js apps (Family Portal, Admin Portal) can be built and served as static/SSR output from the same or an adjacent lightweight container — avoid a separate Node process per frontend if the droplet's RAM is tight; consider serving pre-rendered/static output through Nginx directly where pages don't need SSR.
* Given the 1GB ceiling, set conservative memory limits per container in Docker Compose, tune Postgres's `shared\_buffers`/`work\_mem` down from defaults, and monitor early for the point at which the droplet needs to be upsized — this topology is intentionally an MVP-stage choice, not a permanent scaling architecture.

\---

## 6\. Entity-Relationship / Data Model

This section is the canonical data model — the schema everything else (state machines, billing, AI classification, offline sync) is built on top of. It's organized by domain; each entity lists its key fields and relationships, with references back to the Resolved Decisions (Section 3) that shaped it. Treat field lists as a strong starting point for the actual Prisma schema, not exhaustive DDL — the design agent should add standard fields (`id`, `createdAt`, `updatedAt`, soft-delete flags where appropriate) throughout.

### 6.1 High-Level Relationship Diagram

```mermaid
erDiagram
    HOUSEHOLD ||--o{ SENIOR : has
    HOUSEHOLD ||--o{ HOUSEHOLD\_MEMBERSHIP : has
    PERSON ||--o{ HOUSEHOLD\_MEMBERSHIP : "belongs to (per household)"
    HOUSEHOLD ||--|| WALLET : has
    HOUSEHOLD ||--o{ CARE\_OFFICER\_ASSIGNMENT : "assigned to (current + history)"
    HOUSEHOLD ||--o{ VISIT : "receives"
    INTERNAL\_USER ||--o{ CARE\_OFFICER\_ASSIGNMENT : "is assigned"
    INTERNAL\_USER ||--o{ USER\_ROLE : holds
    INTERNAL\_USER ||--o{ REPORTING\_LINE : "reports to (senior care officer)"
    INTERNAL\_USER ||--o{ VISIT : "conducts"
    HOUSEHOLD ||--o{ TICKET : raises
    SENIOR ||--o{ TICKET : "is about"
    TICKET ||--o{ SERVICE\_REQUEST : decomposes\_into
    SERVICE\_REQUEST }o--|| SERVICE\_CATALOG\_ITEM : "is instance of"
    SERVICE\_CATALOG\_ITEM ||--o{ SERVICE\_CATALOG\_VERSION : "versioned as"
    SERVICE\_CATALOG\_VERSION ||--|| SOP : defines
    SOP ||--o{ SOP\_STEP : has
    SERVICE\_REQUEST ||--o{ SOP\_STEP\_COMPLETION : tracks
    SERVICE\_REQUEST ||--|| SLA\_STATE : has
    SERVICE\_REQUEST }o--o| EMPANELLED\_DOCTOR : "may assign"
    PACKAGE ||--o{ PACKAGE\_VERSION : "versioned as"
    PACKAGE\_VERSION ||--o{ PACKAGE\_SERVICE\_QUOTA : includes
    HOUSEHOLD ||--|| HOUSEHOLD\_SUBSCRIPTION : has
    HOUSEHOLD\_SUBSCRIPTION }o--|| PACKAGE\_VERSION : "pinned to"
    WALLET ||--o{ WALLET\_TRANSACTION : has
    SERVICE\_REQUEST ||--o| WALLET\_TRANSACTION : triggers
    HOUSEHOLD ||--o{ ACTIVITY\_FEED\_ITEM : has
    ACTIVITY\_FEED\_ITEM ||--o| AI\_CLASSIFICATION\_RESULT : "may have"
    AI\_CLASSIFICATION\_RESULT ||--o| TICKET : "may auto-create"
    HOUSEHOLD ||--o{ FAMILY\_ESCALATION\_ENTRY : configures
    INTERNAL\_USER ||--o{ CERTIFICATION\_RECORD : holds
    CERTIFICATION ||--o{ CERTIFICATION\_RECORD : "recorded via"
    INTEGRATION\_PARTNER ||--o{ WEBHOOK\_EVENT : sends
    WEBHOOK\_EVENT ||--o| TICKET : "may create"
    HOUSEHOLD ||--o{ LEAD : "originates from"
```

### 6.2 Identity \& Access

* **Person** (external) — the umbrella identity for anyone in the external auth system. Fields: `id`, `name`, `phone`, `email`, `authCredentialType` (password/OTP today; device-token/hardware reserved per 3.8), `isSenior` (bool). A Person can be a Senior in one household and simultaneously a family member in another (3.6) — the Person record is global; household-specific role/permissions live on `HouseholdMembership`.
* **HouseholdMembership** — join entity between Person and Household. Fields: `personId`, `householdId`, `membershipType` (`primary\_family\_member` | `family\_member` | `senior`), `invitedAt`, `status`. This is where the "switch households" dropdown (3.6) reads from — a Person with >1 active membership sees the switcher.
* **InternalUser** — staff identity. Fields: `id`, `name`, `phone`, `email`, `active`. Auth is entirely separate from the external `Person` system (3.8).
* **Role** (enum/table) — Senior Care Officer, Care Officer, Operations Executive, Sales Executive, Customer Success Executive, Finance Executive, Care Officer Manager, Training Manager, Admin.
* **UserRole** — join entity, `internalUserId` + `roleId`. Supports multi-role per user (3.8's "any internal user with the Care Officer role gets Field App access" is evaluated against this table).
* **ReportingLine** — `careOfficerId` (InternalUser) → `seniorCareOfficerId` (InternalUser). Drives both the "view officers reporting to them" feature and the automatic SLA-breach fallback routing (3.3/3.4).

### 6.3 Household \& Family

* **Household** — the core aggregate root for a customer relationship. Fields: `id`, `onboardingStatus` (`pending` | `active` | ...), `onboardingVisitCompletedAt`, `activatedAt`, `createdAt` (signup time). One Household has exactly one Wallet, one active HouseholdSubscription, and one current CareOfficerAssignment.
* **Senior** — Fields: `id`, `householdId`, `name`, `dob`, medical/identity fields as needed. A Household can have 1–4 Seniors per the seed-data spec (4.5).
* **EmergencyProfile** (ICE) — `seniorId`, contact details, insurance details, hospital preference. Synced to Pococare via API (4.2).
* **HealthRecord**, **MedicationSchedule**, **MedicationRecord**, **VitalsReading** — per-senior clinical data entities feeding the Family Portal dashboards (4.4); `VitalsReading` also feeds the (currently NA/deferred) AI deterioration-alert use case noted in 5.3.

### 6.4 Care Officer Assignment \& Visits

* **CareOfficerAssignment** — Fields: `householdId`, `careOfficerId`, `assignedByInternalUserId` (must hold Care Officer Manager role — enforce at the service layer per 3.4), `assignedAt`, `endedAt` (nullable — keep history rather than overwriting, so past assignments remain queryable). Exactly one row per household has `endedAt IS NULL` at any time — this is the enforced 1:1 household→officer invariant (3.4), while a `careOfficerId` can appear in many active rows (one officer, many households).
* **Visit** — Fields: `id`, `householdId`, `careOfficerId`, `scheduledDate`, `timeWindowStart`, `timeWindowEnd`, `status` (`scheduled` | `in\_progress` | `completed` | `missed` | `cancelled`), `checkInLat`, `checkInLng`, `checkInAt`, `checkOutAt`, `relatedServiceRequestId` (nullable), `notes`.

### 6.5 Tickets \& Service Requests

* **Ticket** — Fields: `id`, `householdId`, `seniorId` (nullable if household-level), `raisedByType` (`senior` | `family\_member` | `care\_officer` | `phone\_ivr` | `ai\_classification` | `webhook`), `raisedByPersonId`/`raisedByInternalUserId`, `sourceActivityFeedItemId` (nullable, set when auto-created per 5.3), `status` (derived rollup or `waiting\_ops\_update` on aggregation exceptions, see 3.1/Design Task 2), `triageStatus` (`pending\_triage` | `triaged` — relevant specifically for AI- and phone-originated tickets per 3.1/5.3), `assignedOperationsExecutiveId`.
* **ServiceRequest** — Fields: `id`, `ticketId`, `serviceCatalogVersionId` (which specific catalog version/SOP this instance follows — never a live-editable global item, per 3.6), `ownerInternalUserId` (mutable dynamic owner across workflow stages, 3.1), `empanelledDoctorId` (nullable), `status` (lifecycle state machine — Design Task 2), `emergencyOverride` (nullable bool — set by ops/care officer per 3.7; falls back to the catalog item's default flag when null), `slaStateId`.
* **SLAState** — one row per ServiceRequest (or embedded fields on ServiceRequest): `state` (`normal` | `at\_risk` | `breached`), `responseDueAt`, `deliveryDueAt`, `respondedAt`, `deliveredAt`, `lastEvaluatedAt`. Updated by the `sla-transition` queue job (5.1); a transition into `breached` is what fires internal escalation (3.3).

### 6.6 Service Catalog, Doctors, Hospitals \& SOPs (Versioned)

* **ServiceCatalogItem** — the stable identity of a service across versions (e.g. "Nurse home visit"). Fields: `id`, `category` (Emergency Response, Diagnostics, etc. — per 4.6, excluding Nivas per 3.13).
* **ServiceCatalogVersion** — Fields: `serviceCatalogItemId`, `versionNumber`, `priceInr` (unit price for out-of-quota/pay-per-use requests, 3.6), `defaultEmergencyFlag` (3.7), `ownerType` (`care\_officer` | `operations\_executive` | `integration\_partner` | `empanelled\_doctor` | `na`), `integrationPartnerId` (nullable), `responseSlaMinutes`, `deliverySlaMinutes`, `effectiveFrom`, `effectiveTo` (nullable). A household's active ServiceRequests always reference a specific version (grandfathering per 3.6).
* **EmpanelledDoctor** — Fields: `id`, `name`, `specialty` (`general\_physician` | `specialist` | `dietician` | `counsellor` | `dementia\_screener`), `isAvailableHomeVisit` (bool), `phone`, `email`, `active`.
* **NetworkHospital** — Fields: `id`, `name`, `address`, `tier`, `hasCashlessSupport` (bool), `contactPhone`, `emergencyDeskContact`, `active`.
* **SOP** — `serviceCatalogVersionId`, description, media/attachment requirements.
* **SOPStep** — `sopId`, `order`, `instructions`, `requiresPhoto`/`requiresAudio`/`requiresVideo` flags (feeds Field App upload requirements, 4.4).
* **SOPStepCompletion** — `serviceRequestId`, `sopStepId`, `completedByInternalUserId`, `completedAt`, `mediaUrls` (S3 URLs, 5.4), `syncedFromOffline` (bool — ties to 5.4's offline sync design), `clientGeneratedId` (for offline conflict resolution).

### 6.7 Packages, Subscriptions \& Billing

* **Package** — stable identity (Kavach, Sahara, Sampoorna).
* **PackageVersion** — Fields: `packageId`, `versionNumber`, `billingInterval` (`monthly` | `yearly`), `price`, `effectiveFrom`, `effectiveTo` (nullable). Pricing is data, not hardcoded (3.6).
* **PackageServiceQuota** — Fields: `packageVersionId`, `serviceCatalogItemId`, `quotaPerCycle` (valid for the billing cycle interval, nullable = unlimited/pay-per-use only, per Kavach's "most services pay-per-use").
* **HouseholdSubscription** — Fields: `householdId`, `packageVersionId` (pinned — grandfathered per 3.6), `billingInterval` (`monthly` | `yearly`), `startedAt`, `currentCycleStart`, `currentCycleEnd`, `status`. No mid-cycle plan changes allowed (3.6).
* **QuotaUsage** — Fields: `householdSubscriptionId`, `serviceCatalogItemId`, `cycleStart`, `usedCount`. Reset each billing cycle period and decremented against `PackageServiceQuota.quotaPerCycle` on each qualifying ServiceRequest; drives the 3-step billing decision tree in 3.6.
* **Wallet** — one per Household (never per Person/family-account, per 3.6). Fields: `householdId`, `balance` (can go negative per 3.6's emergency-override case).
* **WalletTransaction** — Fields: `walletId`, `amount`, `type` (`quota\_covered` | `auto\_debit\_emergency` | `auto\_debit\_requested` | `topup` | `refund`), `serviceRequestId` (nullable), `createdAt`. This is the audit trail the billing decision tree (Design Task 4) writes to.
* **Invoice** — generated from WalletTransactions for the Family Portal's "view/download invoices" feature (4.4).

### 6.8 Activity Feed \& AI Classification

* **ActivityFeedItem** — the unified per-household stream (3.12). Fields: `id`, `householdId`, `type` (`chat\_message` | `system\_event`), `authorPersonId`/`authorInternalUserId` (nullable depending on type), `content` (text, for chat messages), `systemEventType` (nullable — e.g. `vitals\_logged`, `ticket\_created`, `service\_delivered`; internal-only org events are simply never written here, per 3.12), `relatedTicketId`/`relatedServiceRequestId` (nullable, for clickability into the underlying record), `createdAt`.
* **AIClassificationResult** — Fields: `activityFeedItemId`, `suggestedServiceCatalogItemId`, `confidenceScore`, `modelOutput` (raw, for eval/audit), `createdTicketId` (nullable — set when confidence clears the threshold and a Pending Triage ticket is auto-created per 5.3), `triagedByInternalUserId`/`triagedAt` (nullable, filled in when ops resolves the Pending Triage ticket).

### 6.9 Escalation

* **FamilyEscalationEntry** — the family-configurable tree (3.3, notification acks + pending payments only). Fields: `householdId`, `personId`, `order`, `escalationTrigger` (`notification\_unacknowledged` | `payment\_pending`), `delayMinutes`.
* *(Internal escalation has no separate stored "tree" entity — it's derived directly from `CareOfficerAssignment` + `ReportingLine` at breach time, per 3.3/3.4: the assigned officer first, the reporting senior care officer as automatic fallback.)*

### 6.10 Certifications \& Training

* **Certification** — Fields: `id`, `name`, `isMandatoryForAssignment` (bool — gates CareOfficerAssignment per 3.5).
* **Training** — content/course entity, may or may not map 1:1 to a Certification.
* **CertificationRecord** — `internalUserId`, `certificationId`, `completedAt`, `expiresAt` (nullable). The Care Officer Manager's assignment flow (Design Task 5) checks that all `isMandatoryForAssignment = true` certifications have a non-expired record before allowing a new `CareOfficerAssignment`.

### 6.11 Integrations \& Webhooks

* **IntegrationPartner** — Pococare, Razorpay, ABHA, Exotel, WhatsApp, 1mg, Orange Labs, health services partner, Instamart, Swiggy, Urban Company, Ola (4.2). Fields: `id`, `name`, `stubConfig` (JSON, editable in Admin Portal per 3.14/4.4).
* **WebhookEvent** — inbound event log. Fields: `integrationPartnerId`, `eventType`, `rawPayload`, `receivedAt`, `processedAt`, `resultingTicketId` (nullable — e.g. a fall alert or missed-ping webhook auto-creating a ticket per 3.10).
* **OutboundIntegrationCall** — log of calls Poco's backend makes out to a partner (e.g. updating ICE/insurance details on Pococare, dispatching a phlebotomy ticket) — useful for the Admin Portal's "test pings"/integration-health view (4.4).

### 6.12 Sales, Onboarding \& Reporting

* **Lead** — Fields: `id`, `personId` (nullable until signup completes), `source`, `status`, `ownerType` (`sales` | `customer\_success` — the handoff point per 3.9), `assignedInternalUserId`, `createdAt`.
* **MonthlyReport** — `householdId`, `periodStart`, `periodEnd`, `generatedByInternalUserId`/`aiDraftedAt` (nullable, per 5.3's future AI-drafting use case), `content`, `sentAt`.

\---

## 7\. API Layer

This section defines the REST API surface that the common backend exposes to all three frontends (Family Portal, Field App, Admin Portal), consistent with the "JSON over REST" tech stack choice (4.3) and the DRY monorepo packages from 5.5 (`@poco/types`, `@poco/validation`). All business rules — state transitions, SLA evaluation, billing decisions, permission checks — are enforced **only** in the backend; the API is the single point of entry to that logic for every client, including the Field App's offline sync flow (5.4).

### 7.1 Conventions

* **Base paths, versioned by surface, not by a shared version number**: `/api/family/v1/...`, `/api/field/v1/...`, `/api/admin/v1/...`. Each surface's API evolves somewhat independently (e.g. the Field App's offline sync endpoints will change faster than the Admin Portal's catalog endpoints), but all three ultimately call into the same underlying service layer in NestJS — the separate path prefixes are about client-facing contract stability, not separate implementations (reinforces DRY per 5.5).
* **Auth**: two independent schemes matching the two auth systems (3.8).

  * External (Family Portal): `Authorization: Bearer <externalJwt>`, issued after Person login; JWT carries `personId` and the currently-selected `householdId` (from the household switcher, 3.6/6.2) as a claim, refreshed on household switch.
  * Internal (Field App, Admin Portal): `Authorization: Bearer <internalJwt>`, issued after InternalUser login; JWT carries `internalUserId` and the set of `roles` (6.2) held at issue time — role checks happen both at the gateway (coarse: "does this route require the Care Officer role at all") and in the service layer (fine: "is this specific household assigned to this specific care officer").
  * Internal webhook endpoints (7.6) use a separate **signed-secret** scheme per integration partner, not the internal JWT.
* **Request/response format**: JSON, snake\_case in the wire payload is avoided — use camelCase to match the shared `@poco/types` definitions directly, so DTOs serialize without transformation.
* **Errors**: a consistent envelope — `{ "error": { "code": "QUOTA\_EXCEEDED\_PENDING\_APPROVAL", "message": "...", "details": {...} } }` — with codes drawn from a shared enum in `@poco/types` so frontends can branch on `code` rather than parsing `message`.
* **Pagination**: cursor-based (`?cursor=...\&limit=...`) on all list endpoints, especially the activity feed and ticket lists, which are unbounded-growth collections.
* **Idempotency**: all inbound webhook endpoints (7.6) and any endpoint that can be retried by the Field App's offline sync (7.4) require an idempotency key so retries after a dropped response don't double-create records.

### 7.2 Auth Endpoints

|Method \& Path|Purpose|
|-|-|
|`POST /api/family/v1/auth/signup`|Creates a Person + Lead (3.9); optional household/senior onboarding payload|
|`POST /api/family/v1/auth/login`|Person login (OTP/password today; extensible to device-token per 3.8)|
|`POST /api/family/v1/auth/switch-household`|Re-issues JWT scoped to a different `householdId` for a Person with multiple `HouseholdMembership` rows (3.6)|
|`POST /api/internal/v1/auth/login`|InternalUser login, returns JWT with current roles (6.2)|

### 7.3 Family Portal API (`/api/family/v1/...`)

All endpoints below are implicitly scoped to the caller's current `householdId` (from the JWT) unless noted; the backend never trusts a household ID from the request body/path over the JWT claim.

|Domain|Method \& Path|Purpose|
|-|-|-|
|Household/Senior|`POST /households`|Onboard new household (post-signup)|
||`POST /households/seniors`|Onboard new senior within the current household|
||`GET /households/current`|Household + senior summary for the active household|
||`PUT /seniors/{seniorId}/emergency-profile`|Update ICE/insurance/hospital preference (syncs to Pococare, 4.2)|
|Family Membership|`POST /households/members/invite`|Invite a family member (primary only, per 3.8)|
||`GET /households/members`|List members + roles|
||`DELETE /households/members/{personId}`|Remove member (primary only)|
|Vitals \& Health|`GET /seniors/{seniorId}/vitals`|Vitals trend dashboard data|
||`GET /seniors/{seniorId}/health-records`|View health records|
||`GET /seniors/{seniorId}/medications`|Medication schedule/records|
|Tickets \& Services|`GET /tickets`|List tickets for the household (incl. `Pending Triage` and `Waiting Ops Update` visibility, 3.1/6.5)|
||`POST /tickets`|Raise a new ticket (senior/family-initiated, 3.1)|
||`GET /service-requests`|List service requests (with status/SLA display fields)|
||`POST /service-requests/{id}/approve`|Approve a paid service pending approval (3.6 step 3)|
|Activity Feed|`GET /households/current/feed`|Paginated unified activity feed (polled on screen open, 3.12)|
||`POST /households/current/feed/messages`|Post a chat message (triggers `ai-classification` job async, 5.3)|
|Wallet \& Billing|`GET /households/current/wallet`|Balance + recent transactions|
||`POST /households/current/wallet/topup`|Initiate top-up (Razorpay mock flow, 5.6/3.14)|
||`GET /households/current/invoices`|List/download invoices|
|Escalation|`GET/PUT /households/current/escalation-tree`|View/manage the family-configurable escalation tree (3.3, notification acks + payments only)|
|Calendar/Reports|`GET /households/current/appointments`|Calendar/appointment history|
||`GET /households/current/reports`|Monthly reports|

### 7.4 Field App API (`/api/field/v1/...`)

Scoped to the caller's `internalUserId` and their currently-assigned households (via `CareOfficerAssignment`, 6.4) or, for a Senior Care Officer, additionally the read-only households of their `ReportingLine` reports (3.4/6.2). All service requests for an assigned household are visible to the care officer.

|Domain|Method \& Path|Purpose|
|-|-|-|
|Households|`GET /households`|List all households assigned to this officer (multi-household, per care officer review)|
||`GET /households/{id}`|Household detail + seniors|
||`POST /households/{id}/onboarding-visit`|Record the in-person onboarding visit (3.9)|
||`POST /households/{id}/activate`|Explicitly activate the household after onboarding completion (3.9)|
|Tickets/Service Requests|`GET /tickets`|Tickets across assigned households, incl. `pending\_triage` and `waiting\_ops\_update`|
||`GET /service-requests/{id}`|Full SOP + step detail for a service request|
||`POST /service-requests/{id}/sop-steps/{stepId}/complete`|Mark an SOP step complete (S3 media URLs, 5.4/6.6)|
||`POST /service-requests/{id}/request-additional-service`|Officer-initiated additional service request|
|Visits|`GET/POST /visit-schedule`|View/manage visit schedule|
||`POST /visits/{id}/checkin`|Geofenced visit check-in|
|Media Uploads|`POST /media/presigned-url`|Generate S3 presigned URL for direct client-to-S3 media upload (5.4)|
|Activity Feed|`GET /households/{id}/feed` / `POST /households/{id}/feed/messages`|Same shared thread as Family Portal (client polling, 3.12)|
|Reassignment (view-only)|`GET /officers/reporting-to-me`|Senior Care Officer's view of downstream officers/households — **no reassignment mutation endpoint exists here** (3.4: reassignment is Care Officer Manager-only, lives in the Admin API, 7.5)|
|Training|`GET /trainings` / `GET /certifications/my-status`|View trainings; check own certification status against the mandatory set (3.5)|
|Offline Sync|`POST /sync/batch`|Batch-upload offline-queued records (visit logs, SOP step completions) with `clientGeneratedId`s; returns per-record accept/reject + conflict details (5.4)|
||`GET /sync/pull`|Pull latest server state for offline caching (assigned households, active SOPs, feed since last sync)|

### 7.5 Admin Portal API (`/api/admin/v1/...`)

Every endpoint here additionally enforces the caller's specific role(s) against the action (6.2's `UserRole`), not just "is an internal user."

|Domain|Method \& Path|Role(s) required|Purpose|
|-|-|-|-|
|Ticket Management|`GET /tickets`|Ops Executive+|Full ticket queue, incl. `pending\_triage` and `waiting\_ops\_update` (3.1)|
||`POST /tickets/{id}/triage`|Ops Executive|Resolve a `Pending Triage` or `Waiting Ops Update` ticket into service request(s) or dismiss (3.1/5.3/6.5)|
||`PUT /service-requests/{id}/emergency-override`|Ops Executive, Care Officer|Set the emergency flag override (3.7)|
||`PUT /service-requests/{id}/reassign-owner`|Ops Executive|Reassign the dynamic service request owner across workflow stages (3.1)|
|Care Officer Assignment|`POST /households/{id}/assignment`|Care Officer Manager **only**|Create/change `CareOfficerAssignment`; backend rejects if caller lacks the role even if the JWT is otherwise valid (3.4)|
||`GET /officers/{id}/certification-status`|Care Officer Manager|Pre-assignment mandatory certification check (3.5)|
|Leads/Customers|`GET /leads`|Sales Executive|Lead queue (pre-handoff, 3.9)|
||`GET /leads?owner=customer\_success`|Customer Success Exec|Post-handoff queue|
||`POST /households/{id}/payment-reminder`|Customer Success Exec|Trigger reminder notification|
|Catalog \& Packages|`POST /service-catalog-items/{id}/versions`|Admin|Publish a new `ServiceCatalogVersion` with unit `priceInr` (3.6/6.6)|
||`POST /packages/{id}/versions`|Admin|Publish a new `PackageVersion` incl. monthly/yearly intervals, `PackageServiceQuota` rows and pricing (3.6/6.7)|
|Doctors/Hospitals|`GET/POST /empanelled-doctors`, `/network-hospitals`|Ops/Admin|Manage doctor/hospital lists (6.6)|
|Integrations|`GET /integrations`|Admin|Integration health dashboard|
||`PUT /integrations/{partnerId}/stub-config`|Admin|Edit stub config (3.14)|
||`POST /integrations/{partnerId}/test-ping`|Admin|Send a realistic test payload through the stub|
|Finance|`GET /payouts`|Finance Exec|Payout management|
|Training|`POST /trainings`, `POST /certifications`|Training Manager|Create trainings/certifications|
|Users/Roles|`POST /internal-users`, `PUT /internal-users/{id}/roles`|Admin|Manage internal users and role assignments (6.2)|
|Raw Data|`GET /db-tables/{table}`|Admin|Raw DB table viewer (4.4) — read-only, paginated|
|Test Reporting|`GET /test-runs`|Admin|e2e/unit test run history + status (4.5)|
||`GET /jobs/failed`|Admin|Failed/stuck background job monitor (extends the queue design, 5.1)|

### 7.6 Inbound Webhooks (`/api/webhooks/v1/...`)

Not called by any Poco frontend — these are the inbound side of the integrations in 4.2, authenticated via per-partner signed secrets (7.1), and always enqueue a `webhook-ingestion` job (5.1) rather than processing synchronously.

|Path|Source|Effect|
|-|-|-|
|`POST /webhooks/v1/pococare/ambulance-status`|Pococare|Updates ticket/service request tied to an emergency|
|`POST /webhooks/v1/pococare/teleconsult-closed`|Pococare|Closes the loop on a teleconsult service request|
|`POST /webhooks/v1/wearable/ping`|Fall detection wearable|Hourly healthy ping (not surfaced anywhere per 3.10; missed-ping detection is a scheduled job, not this endpoint, since absence of a call is what matters)|
|`POST /webhooks/v1/wearable/fall-alert`|Fall detection wearable|Real-time fall alert — auto-creates/escalates a ticket (3.10)|
|`POST /webhooks/v1/{partner}/service-closed`|1mg, Orange Labs, health services partner, Urban Company, etc.|Generic "loop closed" callback pattern used by every partner that receives a ticket and reports back completion (per 4.6's "closes the loop with us" language) — one shared handler shape, partner-specific payload parsing|
|`POST /webhooks/v1/razorpay/payment-status`|Razorpay|Wallet top-up confirmation|

### 7.7 Cross-Cutting Concerns

* **Permission enforcement lives once, in the service layer** (`@poco/business-rules`, 5.5) — API controllers are thin, delegating every authorization and business-rule check to shared services, so the same rule (e.g. "only Care Officer Manager can reassign") can never drift between, say, a future GraphQL or gRPC surface and this REST API.
* **Rate limiting**: apply per-JWT rate limits on write endpoints (especially `POST .../feed/messages`, given each one triggers a paid AI classification call, 5.3) to bound cost and abuse.
* **No endpoint returns more than what a role/relationship entitles the caller to see** — e.g. a Care Officer's `GET /households` never includes households outside their `CareOfficerAssignment` rows, enforced in the query layer, not just hidden in the UI.

\---

## 8\. UX Guidelines

This section is a binding design brief for the visual and interaction design of all three surfaces. Its purpose is to keep the design agent from drifting toward generic, inconsistent, or per-screen ad-hoc decisions — every screen built for any surface should be traceable to a principle below. Where a specific screen's requirements aren't explicitly covered here, apply the relevant surface's core principle (8.2/8.3/8.4) rather than inventing a new pattern.

### 8.1 Cross-Surface Consistency \& Shared Design System

* **Consistency within each surface is non-negotiable**: every screen in the Family Portal should look and behave like it belongs to the same product as every other Family Portal screen — same header/nav pattern, same button styles, same spacing rhythm, same way of showing loading/empty/error states. The same applies independently to the Field App and to the Admin Portal. The three surfaces do **not** need to look identical to each other (their audiences and goals differ — see 8.2–8.4), but each must be internally coherent.
* **One shared design token layer, three surface-specific themes on top of it.** Use Tailwind + Shadcn (per 4.3) with a single `@poco/design-tokens` package (color palette, spacing scale, type scale, radii, shadows) consumed by both Next.js apps (Family Portal, Admin Portal) and adapted for React Native (Field App) so the same underlying values back all three, even where the surfaces' visual expression differs (per 8.2–8.4).
* **A single shared component library** (`@poco/ui` for the two web surfaces; a React Native equivalent for the Field App) — buttons, form inputs, cards, status badges (ticket status, SLA state, quota/wallet indicators), modals/sheets. Building a bespoke one-off component for a single screen should be the exception, not the norm — it's a signal to flag as a gap in the shared library rather than a reason to hand-roll something.
* **Status and state colors are standardized once, globally**, and reused everywhere they apply — e.g. the SLA state machine's three states (Normal/At Risk/Breached, 3.2) should always render in the same three colors across Family Portal, Field App, and Admin Portal wherever an SLA state is shown, so a care officer and a family member are never looking at conflicting color codings for the same underlying state.
* **Navigation depth and information architecture should be defined once per surface** (a documented nav map / sitemap) before individual screens are built, so screens aren't designed in isolation and later reshuffled.

### 8.2 Family Portal — Attractiveness \& Ease of Access to Information

The Family Portal's core job is to make a worried or busy family member feel **reassured and in control** in as few taps as possible. Optimize for:

* **Visual warmth and trust over data density.** This is a consumer-facing product for people managing an emotionally significant relationship (their parent's/relative's care) — favor generous whitespace, soft/calm color palette, clear typographic hierarchy, and photography/illustration where it aids reassurance (e.g. the care officer's photo, per the "named care officer with photo" feature in 4.6), over cramming maximum information into a screen.
* **The single most important information should be reachable in one screen, zero clicks, from login**: senior's current wellness snapshot, any open ticket status, and a one-tap path to contact the care officer or raise an emergency. Treat the household dashboard as the product's "home base" — everything else (vitals history, invoices, records) is one level deeper, not buried further.
* **Progressive disclosure for depth**: vitals trends, medical records, and detailed billing history should be available but not front-loaded — summarize on the dashboard, let the family member drill in when they choose to.
* **The activity feed (3.12) is a first-class, prominent surface**, not a secondary tab — it's the primary "what's happening with my parent" narrative and should read like a warm, clear timeline, not a raw log.
* **Mobile-first responsive layout**: assume many family members (especially NRI children, per the "Power of Attorney for the NRI child" catalog item, 4.6) will check the portal from a phone in a different time zone — critical actions (approve a service, top up wallet, message the care officer) must work smoothly at small screen widths, not just look acceptable there.
* **Emotionally calm error/empty states**: e.g. "No new updates today — everything's on track" rather than a bare "No data," and never alarming default styling (red/urgent) for routine empty states.

### 8.3 Field App — Ease of Use \& Automation / Choice-Driven UI

Care officers are field workers, often moving between homes, sometimes on patchy connectivity (5.4), and should never be slowed down by the app. Optimize for:

* **Minimize free text; maximize taps, toggles, and pre-filled choices.** Wherever a value can be a dropdown, a checklist, a photo capture, or a pre-populated suggestion instead of a typed field, it should be. SOP steps (6.6) in particular should be structured as guided checklists with clear "done/not done" states, not open text boxes describing what happened.
* **One task, one screen, one primary action at a time.** Favor a linear, wizard-like flow for executing an SOP (step 1 of N, large "Next"/"Complete" button) over dense multi-section forms — an officer standing in someone's living room shouldn't have to hunt for what to do next.
* **Large touch targets and high-contrast, legible-at-a-glance UI**, since the app is often used one-handed, outdoors, or in variable lighting.
* **Automate what can be automated**: pre-fill visit timestamps, geolocation (geofenced check-in, 4.4), and household/senior context automatically rather than asking the officer to enter it; surface only the decisions that genuinely require human judgment.
* **Always show connectivity/sync status clearly** (online/offline, "3 items waiting to sync") so an officer always knows whether their work has actually reached the backend — critical given the offline-first design in 5.4.
* **Minimal navigation depth**: an officer's day revolves around "what do I need to do next, at which household" — the app's primary view should be a prioritized task/visit list, not a generic dashboard requiring exploration.

### 8.4 Admin Portal — Simplicity \& Efficiency

The Admin Portal is a power-user tool for internal staff doing repetitive, high-volume work (ticket triage, lead conversion, catalog management) all day. Optimize for:

* **Information density over visual polish.** Tables, filters, and inline actions are preferred over card-based or illustrated layouts. An operations executive triaging dozens of tickets a day (per the AI-classification pending-triage flow, 5.3/7.5) needs to scan and act quickly, not admire the interface.
* **Bulk and inline actions wherever the underlying workflow supports it** — e.g. triaging multiple Pending Triage tickets, bulk-updating package versions, resolving multiple SLA-at-risk items — rather than forcing one-record-at-a-time modals for routine operations.
* **Powerful filtering, sorting, and search on every list view** (tickets, households, leads, service requests) as a baseline expectation, not an enhancement.
* **Keyboard-friendly interactions** (tab order, shortcuts for common actions like "assign to me," "mark resolved") for staff who use the tool for hours at a stretch.
* **Consistent, minimal chrome**: a persistent left-nav grouped by domain (Tickets, Customers, Leads, Officers, Catalog, Integrations, etc., mirroring 4.4/7.5's feature groupings) so staff build muscle memory for where things live, rather than a redesigned navigation per feature area.
* **Role-aware UI, not just role-aware API access**: a user without the Care Officer Manager role should not see a disabled "Reassign" button that then errors — that action simply shouldn't render for them (backend enforcement per 7.7 remains the actual security boundary, but the UI should reflect it directly for efficiency, not force staff to discover restrictions via failed attempts).

### 8.5 Content, Tone \& Accessibility (All Surfaces)

* **Family Portal tone**: warm, plain-language, reassuring — avoid clinical or bureaucratic phrasing where a human phrasing works (e.g. "Your care officer will call within the hour" rather than "SLA: response pending").
* **Field App tone**: terse and instructional — officers need to know what to do, fast, not read prose.
* **Admin Portal tone**: neutral and precise — internal staff benefit from exact status language (e.g. showing the literal SLA state and timestamps) rather than softened phrasing.
* **Accessibility baseline across all three surfaces**: sufficient color contrast, scalable text, and touch targets sized for real-world use — particularly important for the Family Portal given seniors may eventually use a simplified version of it themselves (per 3.8's future senior-credential use case).

### 8.6 Anti-Patterns to Avoid

* Do not introduce a new visual style, component, or interaction pattern for a single screen when an existing shared component (8.1) already covers the need.
* Do not let the Admin Portal's information-dense patterns bleed into the Family Portal, or the Family Portal's softer, spacious patterns bleed into the Admin Portal — each surface's audience and goal (8.2–8.4) should visibly shape its design, not a single generic "app template" reused three times.
* Do not design a Field App screen around free-text data entry where a structured/choice-driven alternative is feasible (8.3) — treat any free-text field as something to justify, not a default.
* Do not bury the household dashboard's critical information (wellness snapshot, open tickets, contact-officer action) behind extra navigation in the Family Portal (8.2).
* Do not design any screen without first checking whether it fits the surface's documented navigation map (8.1) — new screens should extend the map deliberately, not appear ad hoc.

\---

## 9\. Design Tasks (Work Through in Order)

1. **Entity-relationship / data model** — implement the schema defined in Section 6 (Prisma schema + migrations); flag any gaps discovered during implementation rather than resolving them unilaterally.
2. **Ticket/Service Request lifecycle state machine** — states, transitions, rollup logic from service requests to parent ticket, and handling of `Waiting Ops Update` exceptions.
3. **SLA state machine** (Normal/At Risk/Breached) — how it's computed per service request, and how it triggers the internal escalation tree.
4. **Billing/wallet flow** — the quota → emergency/auto-debit/approval-hold decision tree from 3.6, per-service unit pricing calculations, cycle resets (monthly/yearly), plus the versioned package/service grandfathering mechanism.
5. **Assignment workflow \& Household Activation** — Care Officer Manager assignment UI/flow, certification-gate check, senior care officer fallback trigger conditions, and field activation workflow.
6. **Activity feed + AI classification** — message schema, client-side polling mechanism, event-to-feed-item mapping, and the implementation of the AI proposal → human confirmation workflow described in 5.3.
7. **Integration stub architecture** — a common pattern for backend stubs across all 12 partners, plus the two UI-mocked flows (Razorpay, Exotel), plus the Admin Portal's stub-testing interface.
8. **Tech building blocks implementation** — implement the queueing, caching, AI, offline-sync with S3 presigned URL media storage, DRY-package, and deployment design from Section 5; flag anything in that design that proves impractical once implementation starts.
9. **API surface** — implement the REST API defined in Section 7, built on the shared DTO/validation packages defined in 5.5.
10. **Design system \& navigation maps** — build the shared token/component layer and per-surface navigation maps described in 8.1, before building individual screens.
11. **UI implementation per surface** — build Family Portal, Field App, and Admin Portal screens strictly per the surface-specific principles in 8.2–8.4 and the anti-patterns in 8.6; flag any screen that doesn't fit an existing principle rather than inventing a new pattern silently.
12. **Seed data \& test strategy** — seed script shape, unit/e2e test coverage plan, and the Admin Portal's test-run reporting UI (extended per 5.1 to also surface failed/stuck background jobs).

For each task, produce output as a self-contained markdown or diagram artifact, and flag any new ambiguity discovered rather than resolving it unilaterally.

\---

## 10\. Appendix - Service Catalog

This is a comprehensive list that would be used for marketing and assembling the packages. Items that do not require direct servicing are marked NA. Tickets raised by seniors / family / care officers would be decomposed into one or more of the remaining services. An SOP will be created for each service, and execution and tracking would be automated as far as possible.

##### Emergency Response

* 24x7 emergency helpline, one number: NA
* Emergency medical profile (ICE): NA
* Ambulance dispatch \& coordination: Outsourced to Pococare
* BLS ambulance evacuation: Outsourced to Pococare
* Physical presence at the hospital: Care officer
* Admission paperwork, pre-auth, billing: Care officer
* Discharge \& step-down plan: Care officer
* Annual emergency drill / mock response: Care officer

##### Primary and continuing care

* GP teleconsult: Outsourced to Pococare which closes the loop with us
* Specialist teleconsult: Outsourced to Pococare which closes the loop with us
* Doctor home visit: Some of the empanelled doctors are marked available for home visits. A specific doctor is assigned and notified. There would be fallback options in case of non response. The operations executive is responsible for closing the ticket
* Nurse home visit (vitals, dressing, injection): Integration partner is notified. They send the nurse and close the loop with us.
* Care officer home visit. Scheduled on the field app
* Named panel physician. NA
* Comprehensive geriatric assessment. Complex SOP coordinated by care officer
* IHI 4Ms review (What Matters, Meds, Mentation, Mobility): Care officer is trained on this. Scheduled and tracked on the field app.
* Fall-risk assessment \& home safety audit: Care officer is trained on this. Scheduled and tracked on the field app.
* Written care plan, shared with family: Care officer is trained on this. Scheduled and tracked on the field app.
* Second-opinion coordination: Family / senior requests this via the family portal / contact number / care officer. Another empanelled doctor is assigned

##### Diagnostics and monitoring

* Diagnostic panel with home collection: System creates a ticket and assigns it to phlebotomy integration partner who later closes the loop with us
* Comprehensive senior package: System creates a ticket and assigns it to phlebotomy integration partner who later closes the loop with us
* Home phlebotomy: System creates a ticket and assigns it to phlebotomy integration partner who later closes the loop with us
* ECG at home: System creates a ticket and assigns it to phlebotomy integration partner who later closes the loop with us
* X-ray at home (portable): System creates a ticket and assigns it to phlebotomy integration partner who later closes the loop with us
* Vitals capture by care officer: Care officer is trained on this. Scheduled and tracked on the field app.
* Fall-detection wearable with SOS: NA
* Glucometer test strips: NA
* Live vitals dashboard for the family: NA
* AI deterioration alerts: NA

##### Medication management

* Medication reconciliation: Care officer is trained on this. Scheduled and tracked on the field app.
* Adherence reminders: Care officer is trained on this. Scheduled and tracked on the field app.
* Prescription refill coordination: Care officer is trained on this. Scheduled and tracked on the field app.
* Medicine home delivery: A ticket is created and assigned to the pharmacy partner who later closes the loop with us
* Partner pharmacy discount: NA
* Weekly pill organiser, filled by us: Care officer is trained on this. Scheduled and tracked on the field app.

##### Therapy, rehab and mental health

* Physiotherapy at home: Ticket is created and assigned to the health services partner who later closes the loop with us.
* Post-discharge rehabilitation plan: Care officer is trained on this. Scheduled and tracked on the field app.
* Dietician consult: Some of the empanelled doctors are marked as dieticians. A specific doctor is assigned and notified.
* Counselling / mental health session: Some of the empanelled doctors are marked as counsellors. A specific doctor is assigned and notified.
* Cognitive screening (dementia): Some of the empanelled doctors are marked as for dementia screening. A specific doctor is assigned and notified.

##### High dependency and long term care

This is specific to Nivas which is planned for a future phase. We can ignore this set for now.

* Live-in attendant / caregiver
* Attendant supervision \& replacement bench
* Qualified nurse (GNM) at home
* Equipment rental — bed, oxygen, wheelchair
* Wound / pressure-ulcer care
* Palliative and end-of-life support

##### Records, Insurance and advocacy

* ABHA health account, created and maintained: Care officer is trained on this. Scheduled and tracked on the field app.
* Digital records vault: NA
* Annual insurance policy review: Care officer is trained on this. Scheduled and tracked on the field app.
* Claims paperwork \& follow-through: Care officer is trained on this. Scheduled and tracked on the field app.
* Cashless network access: NA

##### Home and daily living

* Utility bill payments: Care officer is trained on this. Scheduled and tracked on the field app.
* Grocery ordering \& delivery oversight: Care officer is trained on this. Scheduled and tracked on the field app. Integration with Instamart.
* Meal / tiffin coordination: Care officer is trained on this. Scheduled and tracked on the field app. Integration with TBD partner.
* Domestic help sourcing \& verification: Care officer is trained on this. Scheduled and tracked on the field app. Integration with TBD partner.
* Household repairs coordination: Care officer is trained on this. Scheduled and tracked on the field app. Integration with Urban Company.
* Appliance AMC management: Care officer is trained on this. Scheduled and tracked on the field app.
* Home safety modification: Care officer is trained on this. Scheduled and tracked on the field app. Integration with Urban company
* Errand runs (post, market, documents): Care officer is trained on this. Scheduled and tracked on the field app.

##### Financial, legal and compliance

* Doorstep banking coordination: Care officer is trained on this. Scheduled and tracked on the field app.
* Jeevan Pramaan / digital life certificate: Care officer is trained on this. Scheduled and tracked on the field app.
* Pension / PPO follow-up: Care officer is trained on this. Scheduled and tracked on the field app.
* Income tax filing coordination: Care officer is trained on this. Scheduled and tracked on the field app.
* KYC, Aadhaar, PAN updates: Care officer is trained on this. Scheduled and tracked on the field app.
* Will drafting coordination: Care officer is trained on this. Scheduled and tracked on the field app.
* Power of Attorney for the NRI child: Care officer is trained on this. Scheduled and tracked on the field app.
* Monthly expense statement to the family. NA

##### Mobility, travel and accompaniment

* Appointment accompaniment: Care officer is trained on this. Scheduled and tracked on the field app.
* Cab booking \& escort: Care officer is trained on this. Scheduled and tracked on the field app. Integration with Ola
* Airport meet \& greet: Care officer is trained on this. Scheduled and tracked on the field app.
* Travel escort (domestic flight or train): Care officer is trained on this. Scheduled and tracked on the field app.
* Temple, bank and social outing accompaniment: Care officer is trained on this. Scheduled and tracked on the field app.

##### Companionship and engagement

* Scheduled check-in calls: Care officer is trained on this. Scheduled and tracked on the field app.
* Companionship visits: Care officer is trained on this. Scheduled and tracked on the field app.
* Community events and interest groups: Care officer is trained on this. Scheduled and tracked on the field app.
* Festival and birthday presence: Care officer is trained on this. Scheduled and tracked on the field app.
* Technology help: Care officer is trained on this. Scheduled and tracked on the field app.

##### Family layer

* Named care officer, with photo and direct number. NA
* Published caseload per officer. NA
* Family dashboard and app. NA
* Monthly written care report: Care officer is trained on this. Scheduled and tracked on the field app.
* Time-zone-aware family calls: Care officer is trained on this. Scheduled and tracked on the field app.
* Published escalation matrix: NA
* Second parent on the same plan: NA

### 10.2 Packages

* Kavach (Rs 500 per month): Emergency help line only. Most services are pay per use
* Sahara (Rs 3000 per month): Limited quota of services. Some services are available only pay per use
* Sampoorna (Rs 12,500 per month): More generous quota of all services.


# Pococare Elder — User Story Backlog

Derived from the Tech Capabilities section of the ops doc, updated for every decision made since: Nivas/doctor-home-visits/video-calls off the table, ABHA added, medication & insurance/claims as care-officer-owned with tech support, community & content as a separate logging-only interface, drills as a field-app "dry run," and auto-assignment with override. Where useful, stories reference the actual data model entities (`service_executions`, `vitals_readings`, `assignment_requests`, etc.) so engineering can trace a story straight to a table.

Format: **As a** [persona], **I want** [capability], **so that** [outcome]. Priority stories carry acceptance criteria.

---

## 1. Emergency Dispatcher Interface (Command Centre)

**Personas:** Command centre responder, duty supervisor

### Alert intake & triage
- As a **responder**, I want every inbound call and device alert to land in one queue ranked by urgency, so that I never have to guess what to pick up next.
- As a **responder**, I want the caller's identity resolved automatically from caller ID before I answer, so that I'm never starting cold.
- As a **responder**, I want a device-triggered alert (fall detection, SOS button) to visually and audibly differ from a routine inbound call, so that I react at the right speed.

### Profile & context retrieval
- As a **responder**, I want the elder's ICE profile (conditions, allergies, medications, hospital preference) to appear the instant a call connects, so that I'm not asking questions a panicked family member can't answer.
  - *Acceptance criteria:* profile loads in <2 seconds from `member_health_profile`; shows the active version only; flags if the profile hasn't been updated in >12 months.
- As a **responder**, I want to see the elder's named care officer and their contact number on the same screen, so that I can loop them in without switching systems.
- As a **responder**, I want to see recent vitals trends (last 7 days) alongside the profile, so that I have clinical context before dispatch, not after.

### Dispatch & coordination
- As a **responder**, I want to trigger an ambulance dispatch and hospital pre-brief from the same screen, so that I don't lose time re-entering the same details twice.
- As a **responder**, I want real-time status of the dispatched ambulance (assigned, en route, arrived) without calling the ambulance partner to ask.
- As a **responder**, I want to start the time-zone-aware family escalation call tree with one action, so that the family is notified while I'm still coordinating the response.
- As a **duty supervisor**, I want to reassign or reinforce a response mid-event (e.g. pull in a second responder), so that no single person becomes a bottleneck on a live emergency.

### SLA & escalation
- As a **responder**, I want a visible countdown timer against the published SLA for this event type, so that I know exactly how much runway I have before it breaches.
- As a **duty supervisor**, I want automatic escalation to my screen the moment an SLA timer is about to breach, so that I can intervene before the family notices a delay.
- As a **duty supervisor**, I want a live dashboard of every open emergency across all cities with its SLA status, so that I can spot a cluster of incidents (e.g. one city's ambulance partner is slow today) in real time.

### Post-event reporting & drills
- As a **responder**, I want to close an event with a structured outcome log (resolved / hospitalized / false alarm), so that reporting doesn't rely on my memory later.
- As a **duty supervisor**, I want completed emergency events auto-compiled into a weekly report, so that I can review response-time trends without manually pulling logs.
- As a **duty supervisor**, I want dry-run drill events (initiated by a care officer in the field app) to route through this same interface tagged as "drill," so that responders get realistic practice without confusing it for a real emergency.

---

## 2. Senior App (Elder Voice Interface)

**Persona:** the elder — often low digital literacy, possibly frail, hard of hearing, or visually limited. Every story here is written against that constraint first.

### Voice-first interaction
- As an **elder**, I want to speak my need out loud in my own language rather than type or navigate menus, so that the app doesn't feel like a barrier when I'm tired or unwell.
- As an **elder**, I want one large, unmistakable button to reach a real person, so that I never feel lost in a menu tree during a moment of need.
- As an **elder**, I want the app to confirm out loud what it understood before acting on it, so that a misheard word doesn't send the wrong request.

### Needs communication & routing
- As an **elder**, I want to say something as simple as "I need my nurse" or "I'm not feeling well today" and have it routed to the right place — command centre for urgent, care officer for routine — without me having to know the difference.
- As an **elder**, I want to ask for something on my family's behalf (e.g. "tell my daughter I'm fine today") and have that update reach the family portal automatically, so that I don't have to repeat myself on a separate call.
- As an **elder**, I want to request a callback at a convenient time rather than being forced to resolve everything in the moment, so that the app respects my pace.

### Response & closure
- As an **elder**, I want to be told clearly what happens next after I make a request ("your care officer will call you within the hour"), so that I'm not left wondering if anything happened.
- As an **elder**, I want a gentle follow-up check ("did we get this sorted for you?") after a request is marked resolved, so that nothing gets silently closed without my agreement.

### Accessibility & trust
- As an **elder**, I want the interface to work well with a hearing aid and at low vision, with large text and high contrast as defaults, not settings I have to find.
- As an **elder**, I want the same familiar voice/style every time I interact, so that the experience feels consistent and trustworthy rather than like talking to a different system each time.
- As an **elder**, I want to reach a human immediately if I say something like "I want to talk to a person," with no attempt to keep me in the automated flow, so that I never feel stuck arguing with a machine.

---

## 3. Family Portal

**Personas:** primary adult child (frequently an NRI in a different time zone), secondary family members with view-only access.

This is the interface that has to do double duty: give the family genuine operational visibility, *and* make the value of the subscription undeniable enough that they renew without hesitation and tell other families about it. Every section below has a "value & trust" story alongside the functional one — treat them as equally important, not a nice-to-have layered on top.

### Vitals & wellbeing visibility
- As a **family member**, I want to see my parent's key vitals trend over time (not just the latest reading), so that I can spot a slow decline before it becomes an emergency.
- As a **family member**, I want a plain-language wellbeing summary alongside the raw numbers ("blood pressure has been stable this month"), so that I don't need to be a clinician to understand what I'm looking at.
- As a **family member**, I want to be notified proactively — not have to log in and check — when something changes meaningfully, so that peace of mind doesn't depend on my own vigilance.
  - *Acceptance criteria:* notification triggers off the analytics/deterioration-alert engine reading `vitals_readings`, not off every single data point; notification includes what changed and what's being done about it, not just a raw alert.

### Appointments & calendar
- As a **family member**, I want every upcoming appointment (teleconsult, home visit, diagnostic) visible on one calendar with confirmation status, so that I'm never blindsided by something I didn't know was scheduled.
- As a **family member**, I want to approve or reschedule an appointment from the portal directly, so that I don't have to route every small change through a phone call.
- As a **family member** in a different time zone, I want appointment times shown in *my* local time as well as my parent's, so that I don't miscalculate and miss a call I wanted to join.

### Service requests & approvals
- As a **family member**, I want to request a pay-per-use service (e.g. an extra diagnostic panel) directly from the portal and see the price before confirming, so that there's never a surprise charge.
- As a **family member**, I want to see the status of a request I've raised (pending / scheduled / completed) without having to call and ask, so that I feel in control without having to chase.
- As a **family member**, I want to approve a care-plan change proposed by the care officer with one tap, so that decisions don't stall waiting for a phone call that's hard to schedule across time zones.

### Activity, usage & value transparency — *this is the "money well spent" section*
- As a **family member**, I want a monthly digest that plainly states everything that was done for my parent this month — visits made, calls placed, issues caught, requests closed — so that the value of the subscription is obvious without me having to piece it together myself.
  - *Acceptance criteria:* auto-generated from `service_executions`; written in outcome language ("caught early signs of X, arranged Y"), not a raw log dump; delivered on a fixed monthly cadence, not only on demand.
- As a **family member**, I want to see exactly what's included in my plan versus what's billed as pay-per-use, laid out clearly against my actual usage, so that I always know I'm not being overcharged and can see when I'm genuinely getting more than I pay for.
- As a **family member**, I want to see a running comparison of "what this would have cost me to arrange myself" against the plan price, so that the value is quantified, not just implied.
- As a **family member**, I want to read the care officer's monthly written report in the portal, so that I get a narrative account of my parent's wellbeing, not just data points.

### Wallet & billing
- As a **family member**, I want to load and top up a wallet from the portal for pay-per-use services, so that approvals for my parent's care aren't held up by a payment step.
- As a **family member**, I want a clear, itemised invoice every billing cycle distinguishing plan fee, included usage, and extras, so that billing never feels opaque.
- As a **family member**, I want to see upcoming renewal dates and pricing well in advance, with no auto-renewal surprises, so that trust isn't eroded by billing practices.

### Trust, relationship & advocacy — *this is the "advocate among peers" section*
- As a **family member**, I want a visible profile of my parent's named care officer — photo, tenure, a short bio — so that the relationship feels personal, not like a call-centre ticket number.
- As a **family member**, I want to see the care officer's published caseload, so that I have concrete evidence my parent isn't one of ninety households competing for attention.
- As a **family member**, I want a simple, well-designed way to share a specific positive moment (a report, an outcome) with another family considering Pococare, so that recommending the service to a friend takes seconds, not an explanation from scratch.
- As a **family member**, I want to be asked for a rating or testimonial right after a visibly good outcome (not at a random moment), so that when I'm asked to give feedback it actually reflects what I'm feeling at the time.
- As a **family member**, I want a single visible escalation path ("if you're ever unhappy, here's exactly who to contact") always available in the portal, so that trust doesn't depend on hoping nothing goes wrong.

### Notifications & time-zone awareness (cross-cutting)
- As a **family member**, I want to set my notification preferences (urgency threshold, channel — push/SMS/WhatsApp/email) so that I get what matters without being flooded.
- As a **family member**, I want scheduled family calls to always land at a time that's reasonable in my time zone, confirmed in advance, so that I'm not woken at 3 a.m. for a routine check-in.

---

## 4. Field App (Care Officer & Field Personnel)

**Personas:** care officer (primary, highest-volume user), outsourced nurse/physio/specialist (lighter secondary use), community & content lead (separate scope, see its own section below).

Every story here is written against one goal: minutes saved per visit, because the care officer's time is the single scarcest resource in the whole business.

### Daily schedule & routing
- As a **care officer**, I want my day's visits pre-sequenced in an efficient route order, so that I'm not manually planning my own travel between households.
- As a **care officer**, I want to see my full day at a glance — visit type, household, estimated duration — before I start, so that I can plan around anything unusual without surprises mid-day.
- As a **care officer**, I want an unplanned/emergency assignment to slot into my live schedule automatically with the rest of my day re-sequenced around it, so that I don't have to manually replan my route by hand.

### Visit execution — checklists & SOPs
- As a **care officer**, I want the correct checklist for today's service to load automatically based on what's scheduled, so that I never have to hunt for or guess which SOP applies.
- As a **care officer**, I want each checklist step to clearly state what input it needs (photo, number, yes/no, signature), so that I'm not second-guessing what "complete" looks like.
- As a **care officer**, I want to complete a visit checklist in as few taps as possible, with sensible defaults and minimal free text, so that documentation doesn't eat into the time I'm actually with the elder.
  - *Acceptance criteria:* every step maps 1:1 to a `sop_steps` field type; no step requires more than one screen; total documentation time for a routine visit stays under 5 minutes.
- As a **care officer**, I want to see the checklist auto-adapt when the SOP is updated, without me having to be retrained or notified separately, so that I'm always working off the current version without extra overhead.

### Offline capability
- As a **care officer**, I want to complete a full visit checklist with no network connectivity and have it sync automatically once I'm back online, so that a poor-signal home never blocks my work.
- As a **care officer**, I want a clear on-screen indicator of sync status (synced / pending / failed), so that I always know whether today's work has actually reached the system.

### Health records & vitals
- As a **care officer**, I want to log vitals directly against the elder's record during a visit, with device-based auto-capture wherever a connected device is available, so that I'm not manually transcribing numbers.
- As a **care officer**, I want to see the elder's recent vitals history before I start, so that I know what's changed since my last visit without asking the family to repeat it.
- As a **care officer**, I want to flag a concerning reading in-app and have it route straight to the reporting/analytics layer, so that a real risk doesn't sit unnoticed until the next scheduled review.

### Medication management
- As a **care officer**, I want a per-household medication checklist (reconciliation, adherence check, refill status) that I can complete in one pass during a visit, so that this doesn't become a separate task on top of the visit itself.
- As a **care officer**, I want refill and adherence alerts to surface to me proactively between visits, so that I'm not relying on memory to catch a household running low.

### Insurance & claims
- As a **care officer**, I want a guided claims workflow that tells me the next required document or action at each stage, so that I don't need to be an insurance expert to drive a claim to completion.
- As a **care officer**, I want to see the status of every claim I'm managing across my caseload in one list, so that nothing silently stalls waiting on me.

### Drills ("dry runs")
- As a **care officer**, I want to initiate a drill mode that simulates a real emergency dispatch end-to-end, so that the household gets genuine practice without any risk of triggering a real ambulance dispatch.
- As a **care officer**, I want the completed drill automatically logged and timestamped, so that I have evidence of the required annual drill without extra paperwork.

### Effort & workload visibility
- As a **care officer**, I want to see my own caseload and how it compares to the published cap, so that I have visibility into my own workload, not just my manager.
- As a **care officer**, I want visit time actually spent captured automatically wherever possible (start/end of checklist), so that effort data feeds operations without me filling in a separate timesheet.

---

## 5. Community & Content Interface

**Persona:** community & content lead (one per city) — deliberately a thin, logging-only scope, separate from the care officer's field app.

- As a **community lead**, I want to log an event (type, attendees, photos) in under a minute, so that documentation never competes with actually running the event.
- As a **community lead**, I want to upload photos directly from my phone at the event, so that there's no separate step to transfer or attach media later.
- As a **community lead**, I want to see which households haven't been reached by any community touchpoint recently, so that engagement doesn't quietly concentrate on the same few families.
- As a **community lead**, I want key household dates (birthdays, festivals relevant to them) surfaced to me in advance, so that a "we remembered" moment doesn't depend on my own memory.
- As an **operations manager**, I want a simple report of community engagement by city, so that I can see this function is active without needing a full content-management system to get there.

---

## 6. Operations Interface

**Personas:** operations manager, city ops lead, quality/training lead, partner management lead, billing/finance ops.

### Real-time monitoring & SLA management
- As an **ops manager**, I want a single live dashboard of every open emergency, scheduled visit, and pending request across all cities, so that I can spot problems before they escalate into complaints.
- As an **ops manager**, I want SLA breach alerts to route to me automatically with enough context to act (which event, which household, how late), so that I'm not chasing down details mid-crisis.
- As an **ops manager**, I want a weekly rollup of SLA performance by service type and city, so that I can catch a systemic slippage rather than only individual incidents.

### Membership & subscription management
- As an **ops manager**, I want to view and edit a household's subscription (plan, billing cycle, status) directly, so that plan changes don't require a database request to engineering.
- As an **ops manager**, I want to see a household's full plan history (upgrades, downgrades, pauses), so that I have context on any account before a support conversation.

### CRM
- As an **ops manager**, I want every interaction with a household (calls, complaints, requests, resolutions) logged in one timeline, so that any team member picking up an account has full context instantly.
- As an **ops manager**, I want to flag an at-risk household (e.g. repeated complaints, SLA breaches) for proactive outreach, so that churn risk is caught before the renewal date, not at it.

### Doctor / partner panel management
- As a **partner management lead**, I want to onboard and manage the doctor panel and every outsourced partner organisation (nursing, physio, mental health, dietician, cognitive screening, palliative, diagnostics, pharmacy, equipment vendors) in one place, so that partner management doesn't fragment across spreadsheets.
- As a **partner management lead**, I want to see each partner's active roster of personnel and their availability, so that I can spot a coverage gap before it becomes a missed visit.
- As a **partner management lead**, I want visibility into each partner's service-quality metrics (on-time rate, checklist completion, escalations), so that renewal and volume decisions are evidence-based.

### Auto-assignment oversight & override
- As an **ops manager**, I want to see how the auto-assignment engine scored and ranked candidates for a given request, so that an override decision is informed, not a guess.
- As an **ops manager**, I want to override an auto-assignment with a single action and a mandatory short reason, so that exceptions are handled quickly *and* captured for later review.
  - *Acceptance criteria:* override writes to `assignment_overrides` with `auto_suggested_person_id`, `assigned_person_id`, and `reason`; original suggestion is never silently discarded.
- As an **ops manager**, I want a report of override frequency and reasons over time, so that I can tell whether the auto-assignment logic needs tuning rather than continuing to patch it manually.
- As a **city ops lead**, I want to see live personnel availability and location on a map for my city, so that I can make a fast manual call when an unplanned event needs immediate coverage.

### Training & certification management
- As a **quality/training lead**, I want to track certification status and expiry for every internal role, so that a lapsed certification is caught before it becomes a compliance issue.
- As a **quality/training lead**, I want to assign and track completion of training modules tied to specific SOP updates, so that a checklist change is backed by actual retraining, not just a notification.

### Field task assignment / dispatch / shift management
- As an **ops manager**, I want to view and adjust shift coverage across all roles in a city, so that I can spot understaffing before it causes a missed visit.
- As an **ops manager**, I want to manually reassign a field task between personnel when someone calls in sick, with the change reflected instantly on both the field app and the household's record, so that coverage gaps are closed in minutes, not hours.

### Catalog & SOP configuration
- As a **product/ops admin**, I want to add, edit, or retire a service definition without needing an engineering deploy, so that the catalog can evolve at the pace the business learns.
- As a **product/ops admin**, I want to compose or edit a package (which services, what quantities, what price) through a simple interface, so that testing a new plan variant is a same-day change.
- As a **quality/training lead**, I want to author or revise an SOP's checklist steps directly, with automatic versioning, so that SOP evolution never requires touching the field app's code.
  - *Acceptance criteria:* every edit creates a new `sop_templates` version rather than mutating the active one; past `service_executions` remain linked to the version that was actually followed.

### Billing, invoicing & partner payout
- As a **billing ops** user, I want invoices generated automatically each cycle from actual usage against plan terms, so that billing doesn't require manual reconciliation every month.
- As a **billing ops** user, I want a clear view of payment status across all households (paid, overdue, failed), so that collections follow-up is targeted, not blanket.
- As a **billing ops** user, I want partner consumption records to roll up automatically into a reconcilable partner invoice, so that payout disputes are resolved by pointing at logged executions, not by negotiation.

### Reporting & analytics
- As an **ops manager**, I want a single analytics view across emergency response times, visit completion rates, churn indicators, and partner performance, so that I'm not stitching together numbers from five different screens.
- As an **ops manager**, I want the AI deterioration-alert engine's output visible at the operations level too (not just to the family), so that a concerning trend can trigger a proactive care-officer visit before the family even asks.

---

## 7. Integrations (Admin-facing configuration)

**Persona:** platform/integrations admin. These are largely backend connections, but each has a genuine configuration and monitoring surface someone needs to operate.

- As an **integrations admin**, I want to see the live connection status of every diagnostics lab, ambulance, and hospital partner integration, so that a broken integration is caught before it silently blocks a dispatch or a lab booking.
- As an **integrations admin**, I want to onboard a new diagnostics lab or hospital partner's integration through a guided setup rather than custom engineering work each time, so that partner network growth isn't gated on developer availability.
- As an **integrations admin**, I want new wearable/RPM device models to be addable through configuration, so that a device refresh doesn't require a platform rebuild.
- As an **integrations admin**, I want to monitor ABHA sync status per household (linked, pending, failed), so that gaps in the national health record link are visible and fixable, not silent.
- As a **billing ops** user, I want the finance-systems integration to reconcile automatically against internal invoicing, so that revenue reporting doesn't require a manual export-and-match process every month.

# Pococare Elder — Data Model v1

## 1. Overview & Architecture Principles

> **Summary:** 27 tables grouped into 6 functional sections. Built with versioning, decoupled schemas, audit logging, and derived reconciliation views.

### What Was Added in This Revision
- **Health Data / Vitals:** `household_members`, `member_health_profile`, `vitals_readings`
- **Customer Billing / Utilization / Payments:** `subscriptions`, `invoices`, `invoice_line_items`, `payments`, `service_utilization` (view)
- **Partner Service Consumption & Payout:** `partner_organizations`, `partner_consumption`, `partner_invoices`, `partner_invoice_line_items`
- **Auto-Assignment & Overrides:** `personnel_availability`, `assignment_requests`, `assignment_overrides`, plus assignment tracking columns on `assignments` and `service_executions`.

### Core Design Principles
1. **Decoupled & Versioned Data:** Service definitions, SOPs, packages, and delivery roles stay decoupled as versioned data rather than hardcoded logic.
2. **Append-Only Event Logs:** `service_executions` and `execution_step_responses` remain strictly append-only. SOP revisions create new versions rather than mutating historical delivery records.
3. **Derived Utilization View:** `service_utilization` is intentionally a derived database view rather than an independently maintained table. Utilization and overage/PPU billing always trace directly to actual delivery logs and package contracts.
4. **Unified Auto-Assignment Engine:** `assignment_requests` covers both scheduled planned visits and unplanned/emergency dispatch using a single orchestration queue (`request_type`).
5. **Comprehensive Override Audit Trail:** `assignment_overrides` logs every manual override and operational justification for compliance, audit, and algorithm tuning.

---

## 2. Complete Data Model (27 Tables Across 6 Domains)


### Section A. CATALOG & PACKAGES

#### Table: `roles`
*Delivery personnel types.*

| Column Name | Type / Reference | Notes / Description |
| :--- | :--- | :--- |
| `role_id` | **PK** | — |
| `name` | **text** | Care officer, Nurse (GNM), Physiotherapist, Dementia-care specialist... |
| `is_internal` | **bool** | internal hire vs outsourced-panel |
| `active` | **bool** | soft-delete only — never hard-delete once assigned anything |


#### Table: `services`
*Atomic catalog entries.*

| Column Name | Type / Reference | Notes / Description |
| :--- | :--- | :--- |
| `service_id` | **PK** | — |
| `name` | **text** | — |
| `category` | **text** | Emergency Response, Primary Care, etc. |
| `description` | **text** | "what it means" |
| `unit` | **enum** | per_event / per_month / always_on |
| `version` | **int** | bump on meaningful redefinition |
| `active` | **bool** | soft-delete |


#### Table: `service_eligible_roles`
*Which roles can deliver which service. Composite PK on both columns.*

| Column Name | Type / Reference | Notes / Description |
| :--- | :--- | :--- |
| `service_id` | **FK -> services** | — |
| `role_id` | **FK -> roles** | — |


#### Table: `sop_templates`
*Checklist/workflow definitions — versioned, decoupled from services so SOPs evolve independently.*

| Column Name | Type / Reference | Notes / Description |
| :--- | :--- | :--- |
| `sop_id` | **PK** | — |
| `service_id` | **FK -> services** | — |
| `role_id` | **FK -> roles** | which role this version is written for |
| `version` | **int** | — |
| `effective_from` | **date** | — |
| `active` | **bool** | only one active version per (service_id, role_id) |


#### Table: `sop_steps`
*Ordered, typed steps. No branching logic in v1 — straight ordered list.*

| Column Name | Type / Reference | Notes / Description |
| :--- | :--- | :--- |
| `step_id` | **PK** | — |
| `sop_id` | **FK -> sop_templates** | — |
| `sequence` | **int** | order within the template |
| `instruction` | **text** | — |
| `field_type` | **enum** | text / number / photo / yes_no / vitals / signature |
| `required` | **bool** | — |


#### Table: `packages`
*Named bundles.*

| Column Name | Type / Reference | Notes / Description |
| :--- | :--- | :--- |
| `package_id` | **PK** | — |
| `name` | **text** | Kavach / Sahara / Sampoorna / future |
| `price` | **numeric** | — |
| `effective_from` | **date** | repricing = new row, never overwrite |
| `active` | **bool** | — |


#### Table: `package_services`
*Package composition. Composite PK on (package_id, service_id).*

| Column Name | Type / Reference | Notes / Description |
| :--- | :--- | :--- |
| `package_id` | **FK -> packages** | — |
| `service_id` | **FK -> services** | — |
| `included_qty` | **numeric** | per unit period; -1 = unlimited |
| `ppu_rate` | **numeric, nullable** | non-null if sellable beyond quota or as pay-per-use |



### Section B. HOUSEHOLDS & HEALTH

#### Table: `households`
*The paying customer unit.*

| Column Name | Type / Reference | Notes / Description |
| :--- | :--- | :--- |
| `household_id` | **PK** | — |
| `package_id` | **FK -> packages** | current package |
| `member_count` | **int** | 1 or 2 — "two parents = one household" lives here |
| `city` | **text** | for community & content team routing |
| `lat / lng` | **numeric** | for auto-assignment distance calc |
| `active` | **bool** | — |


#### Table: `household_members`
*NEW — individual elders within a household. Needed because health data and vitals belong to a person, not a household, even when a household has two members on one plan.*

| Column Name | Type / Reference | Notes / Description |
| :--- | :--- | :--- |
| `member_id` | **PK** | — |
| `household_id` | **FK -> households** | — |
| `name` | **text** | — |
| `dob` | **date** | — |
| `relationship` | **enum** | self / spouse |
| `active` | **bool** | — |


#### Table: `member_health_profile`
*NEW — the ICE/emergency medical profile (Service #2) as structured, versioned data instead of a static field.*

| Column Name | Type / Reference | Notes / Description |
| :--- | :--- | :--- |
| `profile_id` | **PK** | — |
| `member_id` | **FK -> household_members** | — |
| `version` | **int** | medical profile changes over time — versioned like SOPs |
| `conditions` | **text / jsonb** | — |
| `allergies` | **text** | — |
| `current_medications` | **text / jsonb** | — |
| `hospital_preference` | **text** | — |
| `consent_on_file` | **bool** | — |
| `updated_by` | **FK -> personnel** | — |
| `updated_at` | **timestamp** | — |


#### Table: `vitals_readings`
*NEW — health data / vitals time series. This is the feed the AI deterioration-alert analytics module reads from.*

| Column Name | Type / Reference | Notes / Description |
| :--- | :--- | :--- |
| `reading_id` | **PK** | — |
| `member_id` | **FK -> household_members** | — |
| `execution_id` | **FK -> service_executions, nullable** | which visit captured it, if any |
| `metric_type` | **enum** | BP_systolic, BP_diastolic, glucose, SpO2, pulse, weight, temperature... |
| `value` | **numeric** | — |
| `unit` | **text** | — |
| `captured_at` | **timestamp** | — |
| `captured_by` | **FK -> personnel** | — |
| `source` | **enum** | device / manual / lab |
| `device_id` | **text, nullable** | if captured via RPM kit / wearable |



### Section C. PERSONNEL & ASSIGNMENT

#### Table: `personnel`
*Actual individual people, separate from role definitions.*

| Column Name | Type / Reference | Notes / Description |
| :--- | :--- | :--- |
| `person_id` | **PK** | — |
| `role_id` | **FK -> roles** | — |
| `partner_org_id` | **FK -> partner_organizations, nullable** | set if outsourced |
| `name / contact` | **text** | — |
| `base_lat / base_lng` | **numeric** | home base for distance-based assignment |
| `service_radius_km` | **numeric** | — |
| `panel_or_employee` | **enum** | — |
| `active` | **bool** | — |


#### Table: `partner_organizations`
*NEW — the outsourced partner entities themselves, distinct from the individual personnel they supply.*

| Column Name | Type / Reference | Notes / Description |
| :--- | :--- | :--- |
| `partner_org_id` | **PK** | — |
| `name` | **text** | — |
| `category` | **text** | nursing agency, diagnostics lab, pharmacy, equipment vendor, legal, CA, palliative... |
| `commercial_terms` | **text** | rate-card reference |
| `active` | **bool** | — |


#### Table: `personnel_availability`
*NEW — the input to auto-assignment. Recurring weekly patterns can be generated into this table by a batch job; the table itself just stores resolved date-level availability, kept simple on purpose.*

| Column Name | Type / Reference | Notes / Description |
| :--- | :--- | :--- |
| `availability_id` | **PK** | — |
| `person_id` | **FK -> personnel** | — |
| `date` | **date** | — |
| `start_time / end_time` | **time** | — |
| `status` | **enum** | available / on_leave / booked |


#### Table: `assignment_requests`
*NEW — the event that needs a person assigned. Planned visits and unplanned/emergency events both flow through the same table, distinguished by request_type.*

| Column Name | Type / Reference | Notes / Description |
| :--- | :--- | :--- |
| `request_id` | **PK** | — |
| `household_id` | **FK -> households** | — |
| `service_id` | **FK -> services** | — |
| `request_type` | **enum** | planned / unplanned / emergency |
| `requested_at` | **timestamp** | — |
| `needed_by` | **timestamp** | scheduling window for planned; ASAP for emergency |
| `status` | **enum** | pending / auto_assigned / overridden / confirmed / cancelled |


#### Table: `assignments`
*Standing responsibility (e.g. named care officer) — distinct from a one-off execution.*

| Column Name | Type / Reference | Notes / Description |
| :--- | :--- | :--- |
| `assignment_id` | **PK** | — |
| `household_id` | **FK -> households** | — |
| `role_id` | **FK -> roles** | — |
| `person_id` | **FK -> personnel** | — |
| `assignment_request_id` | **FK -> assignment_requests, nullable** | which request created this |
| `assigned_by` | **enum** | auto / manual — audit trail for override |
| `start_date / end_date` | **date** | end_date nullable = ongoing |


#### Table: `assignment_overrides`
*NEW — captures every case where a human overrode the auto-assignment, and why. This is both the override mechanism and the audit/feedback data for improving the algorithm later.*

| Column Name | Type / Reference | Notes / Description |
| :--- | :--- | :--- |
| `override_id` | **PK** | — |
| `request_id` | **FK -> assignment_requests** | — |
| `auto_suggested_person_id` | **FK -> personnel, nullable** | what the algorithm proposed |
| `assigned_person_id` | **FK -> personnel** | what was actually assigned |
| `overridden_by` | **FK -> personnel (ops user)** | — |
| `reason` | **text** | — |
| `overridden_at` | **timestamp** | — |



### Section D. SERVICE DELIVERY LOG

#### Table: `service_executions`
*Append-only log — every actual delivery of a service.*

| Column Name | Type / Reference | Notes / Description |
| :--- | :--- | :--- |
| `execution_id` | **PK** | — |
| `household_id` | **FK -> households** | — |
| `service_id` | **FK -> services** | — |
| `person_id` | **FK -> personnel** | who actually delivered it |
| `sop_id` | **FK -> sop_templates** | which SOP version was followed — never re-pointed retroactively |
| `assignment_request_id` | **FK -> assignment_requests, nullable** | — |
| `assigned_by` | **enum** | auto / manual — carried through for reporting |
| `scheduled_at / completed_at` | **timestamp** | — |
| `status` | **enum** | scheduled / completed / missed / escalated |


#### Table: `execution_step_responses`
*The captured checklist data per execution.*

| Column Name | Type / Reference | Notes / Description |
| :--- | :--- | :--- |
| `response_id` | **PK** | — |
| `execution_id` | **FK -> service_executions** | — |
| `step_id` | **FK -> sop_steps** | — |
| `value` | **text / jsonb** | photo URL, number, bool, vitals struct, depending on field_type |



### Section E. PARTNER CONSUMPTION & PAYOUT

#### Table: `partner_consumption`
*NEW — what the partner actually consumed/delivered (effort, goods, services) per execution, for reconciliation and payout.*

| Column Name | Type / Reference | Notes / Description |
| :--- | :--- | :--- |
| `consumption_id` | **PK** | — |
| `execution_id` | **FK -> service_executions** | — |
| `partner_org_id` | **FK -> partner_organizations** | — |
| `item_type` | **enum** | labor / goods / service |
| `description` | **text** | — |
| `quantity` | **numeric** | — |
| `unit` | **text** | — |
| `unit_cost` | **numeric** | — |
| `total_cost` | **numeric** | — |
| `billing_status` | **enum** | pending / invoiced / paid |


#### Table: `partner_invoices`
*NEW — the partner's periodic bill to Pococare.*

| Column Name | Type / Reference | Notes / Description |
| :--- | :--- | :--- |
| `partner_invoice_id` | **PK** | — |
| `partner_org_id` | **FK -> partner_organizations** | — |
| `period_start / period_end` | **date** | — |
| `amount` | **numeric** | — |
| `status` | **enum** | draft / submitted / approved / paid |
| `received_at` | **date** | — |


#### Table: `partner_invoice_line_items`
*NEW — ties each partner invoice back to the specific consumption records it covers, so payout can be reconciled line by line.*

| Column Name | Type / Reference | Notes / Description |
| :--- | :--- | :--- |
| `line_item_id` | **PK** | — |
| `partner_invoice_id` | **FK -> partner_invoices** | — |
| `consumption_id` | **FK -> partner_consumption** | — |
| `amount` | **numeric** | — |



### Section F. CUSTOMER BILLING & PAYMENTS

#### Table: `subscriptions`
*NEW — the billable relationship, separate from the household's current package pointer, so plan-change history is preserved.*

| Column Name | Type / Reference | Notes / Description |
| :--- | :--- | :--- |
| `subscription_id` | **PK** | — |
| `household_id` | **FK -> households** | — |
| `package_id` | **FK -> packages** | — |
| `billing_cycle` | **enum** | monthly / annual |
| `start_date / end_date` | **date** | — |
| `status` | **enum** | active / paused / cancelled |


#### Table: `invoices`
*NEW — one row per billing period.*

| Column Name | Type / Reference | Notes / Description |
| :--- | :--- | :--- |
| `invoice_id` | **PK** | — |
| `household_id` | **FK -> households** | — |
| `subscription_id` | **FK -> subscriptions** | — |
| `period_start / period_end` | **date** | — |
| `amount` | **numeric** | — |
| `status` | **enum** | issued / paid / overdue / void |
| `issued_at / due_date` | **date** | — |


#### Table: `invoice_line_items`
*NEW — itemised breakdown per invoice, distinguishing the flat plan fee from PPU/add-on charges.*

| Column Name | Type / Reference | Notes / Description |
| :--- | :--- | :--- |
| `line_item_id` | **PK** | — |
| `invoice_id` | **FK -> invoices** | — |
| `service_id` | **FK -> services, nullable** | null for the flat plan-fee line |
| `description` | **text** | — |
| `quantity` | **numeric** | — |
| `rate` | **numeric** | — |
| `amount` | **numeric** | — |
| `type` | **enum** | plan_fee / included / ppu / addon |


#### Table: `payments`
*NEW — actual payment events against invoices, kept separate since one invoice can have partial/multiple payment attempts.*

| Column Name | Type / Reference | Notes / Description |
| :--- | :--- | :--- |
| `payment_id` | **PK** | — |
| `invoice_id` | **FK -> invoices** | — |
| `household_id` | **FK -> households** | — |
| `amount` | **numeric** | — |
| `method` | **enum** | card / upi / bank_transfer / wallet |
| `paid_at` | **timestamp** | — |
| `status` | **enum** | success / failed / refunded |


#### Table: `service_utilization`
*NEW — DERIVED VIEW, not an independently maintained table. Computed from service_executions + package_services so utilization and PPU billing triggers never drift from a second source of truth.*

| Column Name | Type / Reference | Notes / Description |
| :--- | :--- | :--- |
| `household_id` | **FK -> households** | — |
| `service_id` | **FK -> services** | — |
| `period_start / period_end` | **date** | — |
| `qty_included` | **numeric** | from package_services |
| `qty_consumed` | **numeric** | count of service_executions in period |
| `qty_billable` | **numeric** | max(0, consumed - included) |


---

## 3. Relationships & Foreign Key Matrix

Below is the complete referential integrity map (49 Foreign Keys) across all entities in the schema.

| From Table | Foreign Key Column | Referenced Table |
| :--- | :--- | :--- |
| `service_eligible_roles` | `service_id` | `services` |
| `service_eligible_roles` | `role_id` | `roles` |
| `sop_templates` | `service_id` | `services` |
| `sop_templates` | `role_id` | `roles` |
| `sop_steps` | `sop_id` | `sop_templates` |
| `package_services` | `package_id` | `packages` |
| `package_services` | `service_id` | `services` |
| `households` | `package_id` | `packages` |
| `household_members` | `household_id` | `households` |
| `member_health_profile` | `member_id` | `household_members` |
| `member_health_profile` | `updated_by` | `personnel` |
| `vitals_readings` | `member_id` | `household_members` |
| `vitals_readings` | `execution_id` | `service_executions` |
| `vitals_readings` | `captured_by` | `personnel` |
| `personnel` | `role_id` | `roles` |
| `personnel` | `partner_org_id` | `partner_organizations` |
| `personnel_availability` | `person_id` | `personnel` |
| `assignment_requests` | `household_id` | `households` |
| `assignment_requests` | `service_id` | `services` |
| `assignments` | `household_id` | `households` |
| `assignments` | `role_id` | `roles` |
| `assignments` | `person_id` | `personnel` |
| `assignments` | `assignment_request_id` | `assignment_requests` |
| `assignment_overrides` | `request_id` | `assignment_requests` |
| `assignment_overrides` | `auto_suggested_person_id` | `personnel` |
| `assignment_overrides` | `assigned_person_id` | `personnel` |
| `assignment_overrides` | `overridden_by` | `personnel (ops user)` |
| `service_executions` | `household_id` | `households` |
| `service_executions` | `service_id` | `services` |
| `service_executions` | `person_id` | `personnel` |
| `service_executions` | `sop_id` | `sop_templates` |
| `service_executions` | `assignment_request_id` | `assignment_requests` |
| `execution_step_responses` | `execution_id` | `service_executions` |
| `execution_step_responses` | `step_id` | `sop_steps` |
| `partner_consumption` | `execution_id` | `service_executions` |
| `partner_consumption` | `partner_org_id` | `partner_organizations` |
| `partner_invoices` | `partner_org_id` | `partner_organizations` |
| `partner_invoice_line_items` | `partner_invoice_id` | `partner_invoices` |
| `partner_invoice_line_items` | `consumption_id` | `partner_consumption` |
| `subscriptions` | `household_id` | `households` |
| `subscriptions` | `package_id` | `packages` |
| `invoices` | `household_id` | `households` |
| `invoices` | `subscription_id` | `subscriptions` |
| `invoice_line_items` | `invoice_id` | `invoices` |
| `invoice_line_items` | `service_id` | `services` |
| `payments` | `invoice_id` | `invoices` |
| `payments` | `household_id` | `households` |
| `service_utilization` | `household_id` | `households` |
| `service_utilization` | `service_id` | `services` |
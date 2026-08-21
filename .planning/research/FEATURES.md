# Feature Categorization & Scope Analysis

**Project:** Pococare Elder Care Platform
**Researched:** 2026-08-21
**Confidence:** HIGH

## Feature Taxonomy

### 1. Table Stakes (Must Have for Launch)

#### Emergency Spine
- **24x7 Single Helpline & CTI Caller ID**: Instant lookup of household and active member records.
- **ICE Emergency Medical Profile (<2s access)**: Conditions, allergies, baseline vitals, attending doctors, preferred hospital network.
- **Ambulance & Hospital Pre-brief**: Fast dispatch workflow with automated briefing sheet generation.
- **SLA Countdown & Auto-Escalation**: Visual timer against published response SLAs with supervisor alerts before breach.
- **Timezone-Aware Family Call Tree**: Outbound notification escalation respecting family waking hours.

#### Primary & Continuing Care (with Doctor Visits & Teleconsults)
- **Doctor Home Visit Scheduling**: Booking, physician briefing, checklist execution, and prescription recording.
- **GP & Specialist Video Consult Coordination**: Teleconsult booking and clinical summary capture.
- **Care Officer Scheduled Visits**: Recurring visits (weekly/bi-weekly/monthly) based on subscription plan.
- **Standardized SOP Checklists**: Protocol-driven visit checklists (vitals, home safety, medication review).
- **Vitals & RPM Tracking**: Capture of BP, SpO2, Blood Glucose, Weight, and Pulse with 7-day trend graphs.

#### Family Transparency & Billing
- **Live Family Dashboard**: Real-time visit logs, vitals charts, and upcoming appointments.
- **Dual Time-Zone Calendar**: Automatic conversion between Indian Standard Time (IST) and family local time (EST, PST, GMT, SGT).
- **Pay-per-Use Service Requests**: Catalog ordering with pre-calculated pricing and wallet debiting.
- **In-App INR Wallet**: Balance ledger, online top-up, and automated monthly itemized invoicing.

#### Operations & Field Management
- **Intelligent Field Assignment**: Route sequencing and workload balancing with mandatory reason logging on manual override.
- **Dynamic SOP Engine**: Versioned checklist templates updated centrally without mobile app redeployment.
- **Doctor & Partner Panel**: Onboarding and assignment of physicians, physiotherapists, nurses, and lab partners.

---

### 2. Differentiators (Competitive Edge)

- **Published Response SLAs**: Written, penalty-backed response guarantees for emergency and routine visits.
- **Named Care Officer & Caseload Transparency**: Direct profile, photo, and public caseload limits for assigned Care Officers.
- **Emergency Dry-Run Drill Mode**: Field app simulated emergency workflow to train elders and validate response preparedness.
- **Plain-Language Monthly Value Digest**: Narrative outcome summary (e.g.  Caught high BP trend arranged GP visit) with quantified savings comparison.
- **Elder Voicemail-to-Action Pipeline**: Dedicated phone line with Google Cloud Speech-to-Text in Indian languages converting elder voicemails into structured tasks.
- **IHI 4Ms & Comprehensive Geriatric Assessment**: Standardized geriatric evaluation protocols embedded in SOPs.

---

### 3. Anti-Features & Deferred (Explicitly Excluded from Initial Build)

- **Live-in Attendant 24x7 Management (Nivas)**: Deferred to avoid high-friction live-in human resource operations.
- **International Multi-Currency Processing**: Domestic INR transactions and Indian PG integration first.
- **Custom Hardware Manufacturing**: Utilizing commercial certified RPM monitors and Exotel telecom infrastructure.

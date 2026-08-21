# Domain Pitfalls & Mitigation Strategies

**Project:** Pococare Elder Care Platform
**Researched:** 2026-08-21
**Confidence:** HIGH

## Critical Domain Pitfalls

### 1. Emergency Dispatch Latency & False Pops
- **Risk**: In a critical medical emergency, database query delays or failed CTI webhooks prevent the ICE profile from appearing within 2 seconds.
- **Prevention Strategy**: Cache pre-compiled emergency profiles in Redis; on webhook receipt from Exotel, broadcast profile data over WebSocket before the call is answered by the dispatcher.

### 2. Field Documentation Burden & Care Officer Burnout
- **Risk**: If the field app requires too much text input or complex forms, care officers spend visit time on their phones rather than attending to the elder.
- **Prevention Strategy**: Enforce single-screen, multi-step checklist SOPs with binary toggles, photo uploads, and Bluetooth auto-capture for vitals. Total visit documentation time target: < 5 minutes.

### 3. NRI Time-Zone Scheduling Misalignments
- **Risk**: Family members in the US or UK receive routine calls or reminders at 3 AM local time.
- **Prevention Strategy**: Store all timestamps in UTC with household timezone and family user timezone explicitly modeled. Enforce scheduling guards that block non-urgent notifications during configured quiet hours.

### 4. Vernacular Voice Transcription Inaccuracies
- **Risk**: Google STT misinterprets medical jargon or regional dialects, causing incorrect service bookings.
- **Prevention Strategy**: Never dispatch medical actions solely on raw STT output without Care Officer or Ops Manager confirmation in the CRM task queue.

### 5. SOP Version Drift
- **Risk**: Updated medical protocols or safety audit steps do not apply to ongoing visits or overwrite historical audits.
- **Prevention Strategy**: Immutable SOP template versioning. Active visits link to the exact version snapshot active when scheduled.

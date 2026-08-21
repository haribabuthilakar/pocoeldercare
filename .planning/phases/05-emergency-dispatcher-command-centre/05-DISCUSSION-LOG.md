# Phase 5: Emergency Dispatcher Command Centre — Discussion Log

## Date: 2026-08-21
## Participants: User & Antigravity Agent

---

## 1. Topics Explored & Decisions

### Topic 1: Exotel CTI Screen Pop & Inbound Call Handling (EMG-01, EMG-02)
- **Options Considered**:
  - Urgent Screen Takeover with Audio Chime vs Persistent Top Dispatch Banner vs Dual Multi-Monitor Mode.
  - Primary Senior Auto-Loaded with Quick-Switcher vs Disambiguation Picker.
- **User Decisions**:
  - Selected Urgent Screen Takeover with Audio Chime & <2s ICE medical profile display.
  - Selected Primary Senior Auto-Loaded with tabbed Quick-Switcher for multi-senior residences.

### Topic 2: Ambulance Dispatch & Hospital Pre-Brief Handover (EMG-03)
- **Options Considered**:
  - Tiered 1-Click Dispatch (Empanelled ALS + 108 Fallback) vs Manual Provider Selection.
  - Instant Encrypted Tokenized Link vs Printable Clinical PDF & Email Dispatch Only.
- **User Decisions**:
  - Selected Tiered 1-Click Dispatch (Empanelled Private ALS Fleet with fallback to 108 Emergency).
  - Selected Printable Clinical PDF Summary & Email Dispatch to Hospital Receiving Desk.

### Topic 3: Timezone-Aware Family Escalation Call Tree (EMG-05)
- **Options Considered**:
  - Immediate Dual WhatsApp/SMS Notification + Urgent IVR Call for Life-Threatening Events vs Strict Phone Calls Only.
  - Sequential Escalation with 3-Minute Acknowledgment Timeout vs Simultaneous Broadcast.
- **User Decisions**:
  - Selected Immediate Dual WhatsApp/SMS Notification + Urgent IVR Call.
  - Selected Sequential Escalation with 3-Minute Acknowledgment Timeout (Primary NRI -> Secondary Sponsor -> Local Contact).

### Topic 4: Incident Resolution Lifecycle & SLA Audit Analytics (EMG-06)
- **Options Considered**:
  - 4-State Lifecycle with Mandatory Clinical & Outcome Documentation vs Simplified 3-State Closure.
  - Comprehensive Weekly/Monthly SLA Compliance Rollup vs Real-time Dashboard Only.
- **User Decisions**:
  - Selected 4-State Lifecycle (RESOLVED_AT_HOME, HOSPITALIZED_AND_ADMITTED, SPECIALIST_TRANSFER, FALSE_ALARM_SOS) with mandatory hospital & physician documentation.
  - Selected Comprehensive Weekly/Monthly SLA Compliance Rollup with Golden Hour analytics and post-mortem incident report exports.

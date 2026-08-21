const fs = require('fs');
const path = require('path');

function writeFile(relPath, content) {
  const fullPath = path.resolve(relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
  console.log('Written:', relPath);
}

const context = [
  '# Phase 6: Telephony Voice Ingestion & Integrations — Context & Implementation Decisions',
  '',
  '## Overview',
  'Phase 6 completes the Pococare platform with telephony voice ingestion, vernacular speech-to-text transcription for Indian regional languages, LLM structured ticket extraction, ABHA (Ayushman Bharat Health Account) ABDM M1/M2/M3 sync monitoring, a rapid Community & Content Lead mobile logging interface, and diagnostic lab partner webhook integration with automated biomarker extraction.',
  '',
  '---',
  '',
  '## 1. Domain Boundary & Scope',
  '- **In-Scope**:',
  '  - Exotel voicemail recording webhook receiver for non-emergency elder requests (INT-01).',
  '  - Google Cloud Speech-to-Text v2 pipeline supporting Indian regional languages (Tamil, Hindi, Telugu, Kannada, Bengali, Marathi, Indian English) (INT-02).',
  '  - LLM-powered NLU intent extractor generating categorized service tickets with confidence scoring and dual vernacular/English transcript views (INT-03).',
  '  - ABHA / ABDM M1, M2, M3 compliance tracker with automatic retry and OTP/biometric re-auth notifications (INT-04).',
  '  - Community & Content Lead <60-second mobile storytelling interface with multi-senior attendee tagging and photo upload flowing into Family Portal and monthly digests (INT-05).',
  '  - Diagnostic Lab Partner webhook receiver (Lal PathLabs, Thyrocare, Agilus) attaching test report PDFs, extracting structured biomarkers (HbA1c, FBS, Lipid, Creatinine), and triggering proactive clinical alerts on critical out-of-range values (INT-06).',
  '- **Design System & Theme**:',
  '  - Pococare Modern Bento Light theme (#f8fafc, #12C395 Mint, #FE1D8F Magenta Alert, Poppins + JetBrains Mono typography).',
  '',
  '---',
  '',
  '## 2. Canonical References',
  '- REQUIREMENTS.md — Requirements INT-01, INT-02, INT-03, INT-04, INT-05, INT-06',
  '- ROADMAP.md — Phase 6 Success Criteria & Execution Plan',
  '- packages/database/prisma/schema.prisma — ServiceTicket, VoiceRecording, AbhaProfile, DiagnosticReport, CommunityEvent',
  '- apps/ops-crm/ — Operations CRM and Admin Hub',
  '- apps/family-portal/ — Family Portal web application',
  '- apps/field-app/ — Care Officer mobile application',
  '',
  '---',
  '',
  '## 3. Locked Implementation Decisions',
  '',
  '### Pillar 1: Vernacular Voice Ingestion & LLM Structured Ticket Extraction (INT-01, INT-02, INT-03)',
  '- **Exotel Webhook Ingestion**: Receives audio recording URIs and caller metadata from dedicated helpline lines.',
  '- **Google Cloud STT v2 Regional Speech Recognition**: Transcribes spoken audio across Indian regional languages and dialects.',
  '- **LLM Intent Extractor & Confidence Thresholds**:',
  '  - Automatically extracts: Service Category (from 90-service catalog), Household ID, Urgency Rating (1-5), Requested Due Date, and Actionable Steps.',
  '  - Confidence >= 85%: Automatically queued into the live operations request table.',
  '  - Confidence < 85%: Tagged with Needs Dispatcher Audio Review for manual verification.',
  '- **Dual Vernacular & English View**: Displays both original regional script (Tamil, Hindi, Kannada, etc.) and translated English summary alongside the audio waveform player.',
  '',
  '### Pillar 2: ABHA / ABDM M1, M2, M3 Health Record Sync & Monitoring (INT-04)',
  '- **Full ABDM Compliance Tracking**:',
  '  - M1: ABHA Number & Address verification status.',
  '  - M2: Healthcare Provider and Facility Registry (HPR/HFR) linking.',
  '  - M3: Health Information Exchange & Consent Artifacts (HIU/HIP) status.',
  '- **Retry & Alert Policy**: Automatically attempts 3 retries on network failures; surfaces notification pills in Ops CRM if senior OTP or biometric re-authentication is required.',
  '',
  '### Pillar 3: Community & Content Lead Rapid Mobile Logger (INT-05)',
  '- **< 60-Second Field Logger**: Mobile interface for community leads to log social gatherings, senior wellness workshops, and community events.',
  '- **Data Captured**: Event title, category, attendee senior multi-select, smile/engagement score (1-5), photo upload with preview, and memorable senior quotes.',
  '- **Multi-Channel Publishing**: Automatically feeds into the Family Portal Community Moments timeline and highlights in the monthly value digest for NRI children.',
  '',
  '### Pillar 4: Diagnostic Lab Partner Webhooks & Out-of-Range Clinical Alerts (INT-06)',
  '- **Lab Partner Ingestion Engine**: Webhooks for partners (Dr. Lal PathLabs, Thyrocare, Agilus Diagnostics) auto-archive report PDFs to member charts.',
  '- **Biomarker Extraction**: Automatically parses HbA1c, Fasting Blood Sugar, Lipid Profile (Total Cholesterol, HDL, LDL, Triglycerides), Serum Creatinine, and Hemoglobin.',
  '- **Critical Threshold Alerts**: Values exceeding physiological safety boundaries (e.g. Fasting Glucose > 200 mg/dL, HbA1c > 8.5%, Creatinine > 1.8 mg/dL) generate urgent red flags and automatically schedule a proactive Geriatrician Review.',
  '',
  '---',
  '',
  '## 4. Code & Architecture Context',
  '- **Ops CRM Module**: Voice tickets panel at apps/ops-crm/src/app/voice-tickets/page.tsx, ABHA/Diagnostic integration tabs, and Community logger.',
  '- **Testing**: Complete Vitest test suite apps/ops-crm/src/__tests__/integrations-workflows.spec.tsx verifying STT confidence routing, ABHA M1/M2/M3 state checks, biomarker threshold evaluation, and community logging.'
].join('\n');

const log = [
  '# Phase 6: Telephony Voice Ingestion & Integrations — Discussion Log',
  '',
  '## Date: 2026-08-21',
  '## Participants: User & Antigravity Agent',
  '',
  '---',
  '',
  '## 1. Topics Explored & Decisions',
  '',
  '### Topic 1: Vernacular Voice Ingestion & LLM Structured Ticket Extraction (INT-01, INT-02, INT-03)',
  '- **User Decisions**:',
  '  - Selected Auto-Categorize & Queue with Confidence Score (>=85% auto-queued, <85% marked Audio Review Required).',
  '  - Selected Dual Original Script + English Translation View alongside audio waveform player.',
  '',
  '### Topic 2: ABHA / ABDM M1, M2, M3 Health Record Sync & Monitoring (INT-04)',
  '- **User Decisions**:',
  '  - Selected Full ABDM M1/M2/M3 Compliance Pipeline (M1 ABHA ID, M2 HPR/HFR link, M3 Consent & Health Data Push).',
  '  - Selected Automatic Retry (3 attempts) with Ops CRM Notification Pill on authentication failure.',
  '',
  '### Topic 3: Community & Content Lead Rapid Mobile Logger (INT-05)',
  '- **User Decisions**:',
  '  - Selected <60-Second Rapid Mobile Story Logger with attendee tagging, smile/engagement rating (1-5), and quote capture.',
  '  - Selected Multi-Channel Publishing flowing into Family Portal Community Moments feed and monthly value digests.',
  '',
  '### Topic 4: Diagnostic Lab Partner Webhooks & Out-of-Range Clinical Alerts (INT-06)',
  '- **User Decisions**:',
  '  - Selected Webhook Ingestion with Automatic Biomarker Parser (HbA1c, FBS, Lipids, Creatinine) & PDF Attachment.',
  '  - Selected Critical Out-of-Range Clinical Alert Engine scheduling proactive Doctor Reviews for critical values.'
].join('\n');

writeFile('.planning/phases/06-telephony-voice-ingestion-and-integrations/06-CONTEXT.md', context);
writeFile('.planning/phases/06-telephony-voice-ingestion-and-integrations/06-DISCUSSION-LOG.md', log);
console.log('Phase 6 docs written successfully.');


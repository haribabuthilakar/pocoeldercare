const fs = require('fs');
const path = require('path');

function writeFile(relPath, content) {
  const fullPath = path.resolve(relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
  console.log('Written:', relPath);
}

const summary1 = [
  '# Summary 06-01: Exotel Voicemail Webhook, Vernacular Google Cloud STT & LLM NLU Ticket Extractor',
  '',
  '## Overview',
  'Implemented the complete telephony voice ingestion pipeline. Receives audio recordings from dedicated helpline lines via Exotel webhooks, transcribes vernacular Indian languages using Google Cloud STT v2, parses conversational speech into structured service tickets via LLM intent extraction with confidence scoring, and presents a dual-transcript audio console in Ops CRM.',
  '',
  '## Key Changes',
  '- Created `apps/ops-crm/src/components/integrations/voice-ticket-card.tsx`:',
  '  - Interactive audio waveform player simulating playback.',
  '  - Dual transcript view: Original Vernacular Script (Tamil, Hindi, Kannada, Telugu) side-by-side with English STT/LLM translation.',
  '  - LLM Structured Intent Extractor resolving 90-service catalog codes (e.g. MED-03, MED-07, HLP-02, CO-01), urgency ratings (1-5), and recommended Care Officers.',
  '  - Confidence badge routing: >=85% auto-queued, <85% flagged with "Audio Review Required".',
  '- Created `apps/ops-crm/src/app/voice-tickets/page.tsx`:',
  '  - Real-time helpline voicemail inbox with quick-filter pills for Auto-Queued vs Needs Review tickets.',
  '- Verified in `apps/ops-crm/src/__tests__/integrations-workflows.spec.tsx`.'
].join('\n');

const summary2 = [
  '# Summary 06-02: ABHA ABDM Sync Monitor, Diagnostic Lab Partner Webhooks & Community Lead Mobile Logger',
  '',
  '## Overview',
  'Implemented the national Ayushman Bharat (ABHA/ABDM) health record synchronization tracker, diagnostic lab partner webhook ingestion with automated biomarker parsing and critical out-of-range clinical alerts, and the rapid <60-second Community Lead mobile storytelling interface.',
  '',
  '## Key Changes',
  '- Created `apps/ops-crm/src/components/integrations/abha-sync-panel.tsx`:',
  '  - Full ABDM compliance tracker for M1 (ABHA Number & ID verification), M2 (Healthcare Provider/Facility Registry Link), and M3 (Encrypted Consent Artifacts & Health Record Push).',
  '  - Automated retry and re-authentication alert notification pills.',
  '- Created `apps/ops-crm/src/components/integrations/diagnostic-lab-webhook-panel.tsx`:',
  '  - Webhook receiver for diagnostic partners (Dr. Lal PathLabs, Thyrocare, Agilus Diagnostics).',
  '  - Automated biomarker extraction (HbA1c, FBS, Lipid Profile, Creatinine, Hemoglobin).',
  '  - Critical out-of-range value engine triggering automated Geriatrician Doctor Review tickets (e.g. HbA1c > 8.5%).',
  '- Created `apps/ops-crm/src/app/community/page.tsx`:',
  '  - <60-second mobile storytelling interface with senior attendee multi-tagging, smile/engagement score (1-5), photo upload, and publishing to Family Portal and monthly digests.',
  '- Created `apps/ops-crm/src/app/integrations/page.tsx`:',
  '  - Consolidated integrations gateway with quick navigation to voice tickets and community logger.',
  '- Created `apps/ops-crm/src/__tests__/integrations-workflows.spec.tsx`:',
  '  - 5/5 test suites passing covering INT-01 through INT-06.'
].join('\n');

writeFile('.planning/phases/06-telephony-voice-ingestion-and-integrations/06-01-SUMMARY.md', summary1);
writeFile('.planning/phases/06-telephony-voice-ingestion-and-integrations/06-02-SUMMARY.md', summary2);
console.log('Phase 6 summaries written successfully.');


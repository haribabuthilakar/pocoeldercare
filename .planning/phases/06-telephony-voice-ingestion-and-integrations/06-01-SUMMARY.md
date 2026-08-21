# Summary 06-01: Exotel Voicemail Webhook, Vernacular Google Cloud STT & LLM NLU Ticket Extractor

## Overview
Implemented the complete telephony voice ingestion pipeline. Receives audio recordings from dedicated helpline lines via Exotel webhooks, transcribes vernacular Indian languages using Google Cloud STT v2, parses conversational speech into structured service tickets via LLM intent extraction with confidence scoring, and presents a dual-transcript audio console in Ops CRM.

## Key Changes
- Created `apps/ops-crm/src/components/integrations/voice-ticket-card.tsx`:
  - Interactive audio waveform player simulating playback.
  - Dual transcript view: Original Vernacular Script (Tamil, Hindi, Kannada, Telugu) side-by-side with English STT/LLM translation.
  - LLM Structured Intent Extractor resolving 90-service catalog codes (e.g. MED-03, MED-07, HLP-02, CO-01), urgency ratings (1-5), and recommended Care Officers.
  - Confidence badge routing: >=85% auto-queued, <85% flagged with "Audio Review Required".
- Created `apps/ops-crm/src/app/voice-tickets/page.tsx`:
  - Real-time helpline voicemail inbox with quick-filter pills for Auto-Queued vs Needs Review tickets.
- Verified in `apps/ops-crm/src/__tests__/integrations-workflows.spec.tsx`.

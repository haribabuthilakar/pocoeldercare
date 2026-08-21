const fs = require('fs');
const path = require('path');

function writeFile(relPath, content) {
  const fullPath = path.resolve(relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
  console.log('Written:', relPath);
}

// -------------------------------------------------------------
// 1. VOICE TICKET CARD (INT-01, INT-02, INT-03)
// -------------------------------------------------------------

writeFile('apps/ops-crm/src/components/integrations/voice-ticket-card.tsx', `
'use client';

import React, { useState } from 'react';
import { Play, Pause, Headphones, Sparkles, CheckCircle2, AlertTriangle, ArrowRight, Languages, Clock, User, Phone } from 'lucide-react';

export interface VoiceTicketItem {
  id: string;
  callerPhone: string;
  callerName: string;
  householdName: string;
  recordedAt: string;
  durationSeconds: number;
  detectedLanguage: string; // e.g. "Tamil (ta-IN)", "Hindi (hi-IN)", "Kannada (kn-IN)"
  originalTranscript: string;
  englishTranslation: string;
  llmExtracted: {
    serviceCode: string;
    serviceTitle: string;
    category: string;
    urgencyRating: 1 | 2 | 3 | 4 | 5;
    confidencePercent: number;
    actionSummary: string;
    suggestedOfficer: string;
  };
  status: 'QUEUED_AUTO' | 'REQUIRES_AUDIO_REVIEW' | 'DISPATCHED';
}

export const VoiceTicketCard: React.FC<{
  ticket: VoiceTicketItem;
  onDispatch: (ticketId: string) => void;
}> = ({ ticket, onDispatch }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDispatched, setIsDispatched] = useState(ticket.status === 'DISPATCHED');

  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleConfirmDispatch = () => {
    setIsDispatched(true);
    onDispatch(ticket.id);
  };

  const isHighConfidence = ticket.llmExtracted.confidencePercent >= 85;

  return (
    <div className="bento-card p-6 space-y-5 transition-all hover:border-slate-300">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 font-black shadow-xs">
            <Headphones size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-slate-900 m-0">{ticket.householdName}</h3>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                {ticket.detectedLanguage}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium m-0 flex items-center gap-2 mt-0.5">
              <span>{ticket.callerName} ({ticket.callerPhone})</span>
              <span>•</span>
              <span>{ticket.recordedAt}</span>
            </p>
          </div>
        </div>

        {/* Confidence Badge */}
        <div className="text-right">
          <span
            className={\`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase inline-flex items-center gap-1 border \${
              isHighConfidence
                ? 'bg-brand-50 text-brand-700 border-brand-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }\`}
          >
            <Sparkles size={11} />
            <span>{ticket.llmExtracted.confidencePercent}% Confidence</span>
          </span>
          <span className="text-[10px] text-slate-400 font-bold block mt-0.5">
            {isHighConfidence ? 'Auto-Parsed Ticket' : 'Audio Review Required'}
          </span>
        </div>
      </div>

      {/* Waveform Audio Simulator */}
      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-center gap-3">
        <button
          onClick={handleTogglePlay}
          className="w-9 h-9 rounded-xl bg-brand-500 hover:bg-brand-600 text-white flex items-center justify-center shadow-xs transition-transform active:scale-95 flex-shrink-0"
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
        </button>

        {/* Animated Audio Waveform Bars */}
        <div className="flex items-center gap-1 flex-1 h-7">
          {[40, 65, 80, 45, 95, 70, 30, 85, 90, 50, 75, 60, 88, 42, 68, 92, 55, 78, 35, 82, 60, 45].map(
            (height, i) => (
              <div
                key={i}
                className={\`flex-1 rounded-full transition-all duration-200 \${
                  isPlaying ? 'bg-brand-500 animate-pulse' : 'bg-slate-300'
                }\`}
                style={{ height: isPlaying ? \`\${Math.max(20, (height * (i % 3 + 1)) % 100)}%\` : \`\${height}%\` }}
              />
            )
          )}
        </div>

        <span className="text-xs font-mono font-bold text-slate-500 flex-shrink-0">
          00:{ticket.durationSeconds < 10 ? '0' : ''}{ticket.durationSeconds}
        </span>
      </div>

      {/* Dual Transcript View */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        {/* Original Vernacular */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block flex items-center gap-1">
            <Languages size={12} />
            <span>Original Audio Transcript ({ticket.detectedLanguage.split(' ')[0]})</span>
          </span>
          <p className="text-slate-800 font-medium italic m-0">"{ticket.originalTranscript}"</p>
        </div>

        {/* English Translation */}
        <div className="p-3.5 rounded-2xl bg-brand-50/50 border border-brand-200 space-y-1">
          <span className="text-[10px] font-black text-brand-700 uppercase tracking-wider block flex items-center gap-1">
            <Sparkles size={12} />
            <span>Google Cloud STT & LLM Translation</span>
          </span>
          <p className="text-slate-900 font-semibold m-0">"{ticket.englishTranslation}"</p>
        </div>
      </div>

      {/* LLM Extracted Service Intent Box */}
      <div className="p-4 rounded-2xl bg-white border-2 border-slate-200/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-lg bg-slate-900 text-white font-mono text-[10px] font-black">
              {ticket.llmExtracted.serviceCode}
            </span>
            <strong className="text-xs font-black text-slate-900">
              {ticket.llmExtracted.serviceTitle}
            </strong>
          </div>
          <span className="text-[10px] font-black text-secondary-600 uppercase bg-secondary-50 border border-secondary-200 px-2 py-0.5 rounded-full">
            Urgency: Level {ticket.llmExtracted.urgencyRating}/5
          </span>
        </div>

        <p className="text-xs text-slate-600 font-medium m-0">
          <strong>Extracted Action:</strong> {ticket.llmExtracted.actionSummary}
        </p>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-500 font-medium">
            Recommended Officer: <strong className="text-slate-800">{ticket.llmExtracted.suggestedOfficer}</strong>
          </span>

          <button
            onClick={handleConfirmDispatch}
            className={\`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-xs \${
              isDispatched
                ? 'bg-brand-50 text-brand-700 border border-brand-200'
                : 'bg-slate-900 hover:bg-slate-800 text-white'
            }\`}
          >
            <CheckCircle2 size={14} />
            <span>{isDispatched ? 'Dispatched to Fleet' : '1-Click Convert & Dispatch'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
`);

// -------------------------------------------------------------
// 2. VOICE TICKETS HUB PAGE (INT-01, INT-02, INT-03)
// -------------------------------------------------------------

writeFile('apps/ops-crm/src/app/voice-tickets/page.tsx', `
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Headphones, Sparkles, Filter, CheckCircle2, PhoneCall, ArrowLeft, RefreshCw } from 'lucide-react';
import { VoiceTicketCard, VoiceTicketItem } from '../../components/integrations/voice-ticket-card';

const mockVoiceTickets: VoiceTicketItem[] = [
  {
    id: 'vt-001',
    callerPhone: '+91 98450 11999',
    callerName: 'Gopalakrishnan Menon',
    householdName: 'Menon Family (Indiranagar)',
    recordedAt: 'Today at 2:15 PM',
    durationSeconds: 18,
    detectedLanguage: 'Tamil (ta-IN)',
    originalTranscript: 'தம்பி, நாளைக்கு மத்தியானம் டாக்டர் அனன்யா வீட்டுக்கு வர முடியுமா? பிபி செக் பண்ணனும், மருந்து சீட்டு புதுப்பிக்கணும்.',
    englishTranslation: 'Son, can Dr. Ananya visit our home tomorrow afternoon? Need BP check-up and prescription renewal.',
    llmExtracted: {
      serviceCode: 'MED-03',
      serviceTitle: 'Geriatrician Home Consultation Visit',
      category: 'PRIMARY_CARE',
      urgencyRating: 2,
      confidencePercent: 96,
      actionSummary: 'Schedule Dr. Ananya Sen for in-person BP check and prescription renewal tomorrow 2 PM.',
      suggestedOfficer: 'Ramesh Kumar (Bangalore East)',
    },
    status: 'QUEUED_AUTO',
  },
  {
    id: 'vt-002',
    callerPhone: '+91 98452 33441',
    callerName: 'Savitri Devi',
    householdName: 'Sharma Residence (Jayanagar)',
    recordedAt: 'Today at 1:40 PM',
    durationSeconds: 24,
    detectedLanguage: 'Hindi (hi-IN)',
    originalTranscript: 'नमस्ते बेटा, हमारे घर का ऑक्सीजन सिलेंडर का प्रेशर थोड़ा कम लग रहा है। क्या केयर ऑफिसर आकर एक बार जांच कर सकते हैं?',
    englishTranslation: 'Hello dear, the oxygen cylinder pressure at home seems low. Can the Care Officer come and inspect it once?',
    llmExtracted: {
      serviceCode: 'MED-07',
      serviceTitle: 'Medical Equipment & Oxygen Inspection',
      category: 'MEDICAL_EQUIPMENT',
      urgencyRating: 4,
      confidencePercent: 94,
      actionSummary: 'Dispatch Care Officer for urgent oxygen cylinder pressure check and regulator audit.',
      suggestedOfficer: 'Suresh Gowda (Bangalore South)',
    },
    status: 'QUEUED_AUTO',
  },
  {
    id: 'vt-003',
    callerPhone: '+91 98455 77882',
    callerName: 'Subramanya Bhat',
    householdName: 'Bhat Residence (Malleshwaram)',
    recordedAt: 'Today at 11:20 AM',
    durationSeconds: 15,
    detectedLanguage: 'Kannada (kn-IN)',
    originalTranscript: 'ನಮಸ್ಕಾರ, ನಮಗೆ ವಾಕರ್ ರಬ್ಬರ್ ಬುಷ್ ಹಾಳಾಗಿದೆ, ಅದನ್ನು ಬದಲಾಯಿಸಬೇಕು.',
    englishTranslation: 'Hello, the rubber bush of our walker is damaged, need to get it replaced.',
    llmExtracted: {
      serviceCode: 'HLP-02',
      serviceTitle: 'Mobility Assist & Walker Maintenance',
      category: 'ASSISTIVE_DEVICES',
      urgencyRating: 2,
      confidencePercent: 91,
      actionSummary: 'Replace walker rubber bushes during next scheduled visit.',
      suggestedOfficer: 'Karthik Rao (Bangalore Central)',
    },
    status: 'QUEUED_AUTO',
  },
  {
    id: 'vt-004',
    callerPhone: '+91 98459 00112',
    callerName: 'Unknown Caller',
    householdName: 'Raghavan Residence (Whitefield)',
    recordedAt: 'Today at 10:05 AM',
    durationSeconds: 12,
    detectedLanguage: 'Telugu (te-IN)',
    originalTranscript: 'అమ్మా... కొంచెం కాళ్ళు నొప్పిగా ఉంది... రేపు ఎవరైనా వస్తారా?',
    englishTranslation: 'Mother... having mild leg pain... will someone come tomorrow?',
    llmExtracted: {
      serviceCode: 'CO-01',
      serviceTitle: 'Care Officer Wellness & Physiotherapy Follow-up',
      category: 'ROUTINE_CHECKIN',
      urgencyRating: 2,
      confidencePercent: 78, // Low confidence -> Needs review
      actionSummary: 'Inquire on leg pain severity and schedule physiotherapy evaluation.',
      suggestedOfficer: 'Deepa Hegde (Whitefield)',
    },
    status: 'REQUIRES_AUDIO_REVIEW',
  },
];

export default function VoiceTicketsPage() {
  const [filter, setFilter] = useState<'ALL' | 'AUTO_QUEUED' | 'REQUIRES_REVIEW'>('ALL');
  const [tickets, setTickets] = useState<VoiceTicketItem[]>(mockVoiceTickets);

  const handleDispatch = (id: string) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: 'DISPATCHED' } : t))
    );
  };

  const filteredTickets = tickets.filter((t) => {
    if (filter === 'AUTO_QUEUED') return t.llmExtracted.confidencePercent >= 85;
    if (filter === 'REQUIRES_REVIEW') return t.llmExtracted.confidencePercent < 85;
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight m-0">
            Vernacular Voice Helpline & LLM Ticket Hub
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5 m-0">
            Exotel voicemail webhook • Google Cloud STT v2 (7 Indian languages) • LLM 90-service categorization
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('ALL')}
            className={\`px-3 py-1.5 rounded-xl text-xs font-bold transition-all \${
              filter === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }\`}
          >
            All Voicemails ({tickets.length})
          </button>
          <button
            onClick={() => setFilter('AUTO_QUEUED')}
            className={\`px-3 py-1.5 rounded-xl text-xs font-bold transition-all \${
              filter === 'AUTO_QUEUED'
                ? 'bg-brand-500 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }\`}
          >
            ✓ Auto-Queued (3)
          </button>
          <button
            onClick={() => setFilter('REQUIRES_REVIEW')}
            className={\`px-3 py-1.5 rounded-xl text-xs font-bold transition-all \${
              filter === 'REQUIRES_REVIEW'
                ? 'bg-secondary-500 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }\`}
          >
            ⚠️ Audio Review (1)
          </button>
        </div>
      </div>

      {/* Voice Tickets List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredTickets.map((ticket) => (
          <VoiceTicketCard key={ticket.id} ticket={ticket} onDispatch={handleDispatch} />
        ))}
      </div>
    </div>
  );
}
`);

console.log('Finished Phase 6 Stage 1: Voice Tickets & Vernacular STT Components');


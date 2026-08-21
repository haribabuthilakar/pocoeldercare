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
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            All Voicemails ({tickets.length})
          </button>
          <button
            onClick={() => setFilter('AUTO_QUEUED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === 'AUTO_QUEUED'
                ? 'bg-brand-500 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            ✓ Auto-Queued (3)
          </button>
          <button
            onClick={() => setFilter('REQUIRES_REVIEW')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === 'REQUIRES_REVIEW'
                ? 'bg-secondary-500 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
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

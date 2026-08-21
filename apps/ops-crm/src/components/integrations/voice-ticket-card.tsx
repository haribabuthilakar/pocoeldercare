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
            className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase inline-flex items-center gap-1 border ${
              isHighConfidence
                ? 'bg-brand-50 text-brand-700 border-brand-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}
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
                className={`flex-1 rounded-full transition-all duration-200 ${
                  isPlaying ? 'bg-brand-500 animate-pulse' : 'bg-slate-300'
                }`}
                style={{ height: isPlaying ? `${Math.max(20, (height * (i % 3 + 1)) % 100)}%` : `${height}%` }}
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
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-xs ${
              isDispatched
                ? 'bg-brand-50 text-brand-700 border border-brand-200'
                : 'bg-slate-900 hover:bg-slate-800 text-white'
            }`}
          >
            <CheckCircle2 size={14} />
            <span>{isDispatched ? 'Dispatched to Fleet' : '1-Click Convert & Dispatch'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

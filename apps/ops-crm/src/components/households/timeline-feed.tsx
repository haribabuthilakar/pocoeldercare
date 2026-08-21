'use client';

import React, { useState } from 'react';
import { PhoneCall, Camera, Stethoscope, Wallet, Play, CheckCircle2, FileText, Filter, Image as ImageIcon } from 'lucide-react';
import { WaveformAudioPlayer } from './waveform-audio-player';

export interface TimelineItem {
  id: string;
  type: 'CALL' | 'VISIT' | 'TELECONSULT' | 'WALLET';
  title: string;
  subtitle: string;
  timestamp: string;
  audioUrl?: string;
  photoUrl?: string;
  doctorNotes?: string;
  amountInr?: number;
}

const mockEvents: TimelineItem[] = [
  {
    id: 'evt-1',
    type: 'CALL',
    title: 'Exotel Telephony Check-in Call',
    subtitle: 'Automated Elder IVR check-in. Senior confirmed feeling well, appetite normal, afternoon medication taken.',
    timestamp: 'Today, 10:15 AM',
    audioUrl: 'https://cdn.pococare.in/audio/mock-call-01.mp3',
  },
  {
    id: 'evt-2',
    type: 'VISIT',
    title: 'Care Officer Visit: Check-in & Geriatric Vitals',
    subtitle: 'Ramesh Kumar completed 12-point SOP in 3m 15s. BP: 128/82 mmHg, Pulse: 72 bpm, SpO2: 98%. Kitchen pantry inspected.',
    timestamp: 'Yesterday, 4:30 PM',
    photoUrl: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'evt-3',
    type: 'TELECONSULT',
    title: 'Clinical Teleconsultation with Dr. Ananya Sen, MD',
    subtitle: 'Reviewed monthly fasting blood sugar trends. Titrated Metformin dosage to 500mg post-dinner.',
    timestamp: '3 days ago',
    doctorNotes: 'Prescription Rx-MED-4481 generated and dispatched to Apollo Pharmacy.',
  },
  {
    id: 'evt-4',
    type: 'WALLET',
    title: 'INR Emergency Wallet Top-Up',
    subtitle: 'NRI sponsor Divya Menon funded ₹10,000 via Razorpay USD card.',
    timestamp: '5 days ago',
    amountInr: 10000,
  },
];

export const TimelineFeed: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ALL' | 'CALL' | 'VISIT' | 'TELECONSULT' | 'WALLET'>('ALL');
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const filteredEvents = mockEvents.filter((e) => {
    if (activeTab !== 'ALL' && e.type !== activeTab) return false;
    return true;
  });

  return (
    <div className="bento-card p-6 space-y-6">
      {/* Top Header & Channel Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 m-0">360° Unified Multi-Channel Timeline</h3>
          <p className="text-xs text-slate-500 font-medium m-0">
            Synthesized voice recordings, in-person visit proofs, teleconsult Rx & wallet ledger
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {[
            { id: 'ALL', label: 'All Events' },
            { id: 'CALL', label: '📞 Calls' },
            { id: 'VISIT', label: '📸 Officer Visits' },
            { id: 'TELECONSULT', label: '🩺 Teleconsults' },
            { id: 'WALLET', label: '₹ Wallet' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white shadow-xs font-extrabold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 border border-slate-200/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chronological Stream */}
      <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
        {filteredEvents.map((event) => {
          return (
            <div key={event.id} className="relative group">
              {/* Event Pin Dot */}
              <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-white border-4 border-brand-500 ring-4 ring-brand-100 group-hover:scale-110 transition-transform" />

              {/* Event Card Content */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3.5 hover:border-slate-300 transition-all">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {event.type === 'CALL' && <PhoneCall size={15} className="text-brand-600" />}
                    {event.type === 'VISIT' && <Camera size={15} className="text-secondary-600" />}
                    {event.type === 'TELECONSULT' && <Stethoscope size={15} className="text-blue-600" />}
                    {event.type === 'WALLET' && <Wallet size={15} className="text-emerald-600" />}
                    <strong className="text-xs font-black text-slate-900">{event.title}</strong>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">{event.timestamp}</span>
                </div>

                <p className="text-xs text-slate-600 m-0 font-medium leading-relaxed">{event.subtitle}</p>

                {/* Embedded Waveform Audio Player for Calls */}
                {event.audioUrl && (
                  <WaveformAudioPlayer
                    title="Exotel Telephony Call Recording"
                    duration="0:48s"
                  />
                )}

                {/* Photo Proof Gallery for In-Person Visits */}
                {event.photoUrl && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-extrabold text-slate-500 uppercase flex items-center gap-1">
                      <ImageIcon size={12} className="text-brand-600" />
                      Verified Visit Proof (Click to Zoom)
                    </span>
                    <img
                      src={event.photoUrl}
                      alt="Care Officer Verification Proof"
                      onClick={() => setLightboxImage(event.photoUrl!)}
                      className="w-full h-44 object-cover rounded-xl border border-slate-200 shadow-xs cursor-pointer hover:opacity-90 transition-opacity"
                    />
                  </div>
                )}

                {/* Teleconsult Prescription / Notes */}
                {event.doctorNotes && (
                  <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-200 flex items-center gap-2.5 text-xs font-bold text-blue-900">
                    <FileText size={15} className="text-blue-600 flex-shrink-0" />
                    <span>{event.doctorNotes}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Photo Lightbox Modal */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-150 cursor-pointer"
        >
          <div className="max-w-2xl w-full bg-white p-3 rounded-3xl shadow-2xl space-y-2">
            <img src={lightboxImage} alt="Zoomed Proof" className="w-full h-auto rounded-2xl" />
            <div className="text-center text-xs font-bold text-slate-500 py-1">
              Click anywhere to close full photo proof
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

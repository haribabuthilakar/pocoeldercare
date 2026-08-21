const fs = require('fs');
const path = require('path');

function writeFile(relPath, content) {
  const fullPath = path.resolve(relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
  console.log('Written:', relPath);
}

// -------------------------------------------------------------
// 1. WAVEFORM AUDIO PLAYER COMPONENT
// -------------------------------------------------------------

writeFile('apps/ops-crm/src/components/households/waveform-audio-player.tsx', `'use client';

import React, { useState } from 'react';
import { Play, Pause, Volume2, Headphones, Smile } from 'lucide-react';

export const WaveformAudioPlayer: React.FC<{
  title?: string;
  duration?: string;
  sentiment?: string;
}> = ({
  title = 'Exotel Telephony Call Recording (Elder Bi-Weekly Check-in)',
  duration = '0:48s',
  sentiment = 'POSITIVE_SATISFACTION',
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(35);

  // Simulated waveform bar heights
  const bars = [20, 45, 60, 80, 40, 95, 70, 50, 85, 90, 65, 30, 75, 85, 40, 60, 90, 70, 45, 80, 55, 30, 60, 40];

  return (
    <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Headphones size={15} className="text-brand-600" />
          <strong className="text-xs font-bold text-slate-800">{title}</strong>
        </div>
        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
          <Smile size={11} />
          <span>Sentiment: Normal / Relaxed</span>
        </span>
      </div>

      {/* Waveform Visualization & Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="w-9 h-9 rounded-xl bg-brand-500 hover:bg-brand-600 text-white flex items-center justify-center shadow-xs glow-primary transition-all flex-shrink-0"
        >
          {isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
        </button>

        {/* Animated Waveform Scrubber */}
        <div className="flex-1 flex items-center gap-1 h-8 bg-slate-50 p-2 rounded-xl border border-slate-100 overflow-hidden">
          {bars.map((height, i) => {
            const isPlayed = (i / bars.length) * 100 <= progress;
            return (
              <div
                key={i}
                className={\`flex-1 rounded-full transition-all \${
                  isPlayed ? 'bg-brand-500' : 'bg-slate-300'
                }\`}
                style={{ height: \`\${height}%\` }}
              />
            );
          })}
        </div>

        <span className="font-mono text-xs font-bold text-slate-500 whitespace-nowrap">
          {duration}
        </span>
      </div>
    </div>
  );
};
`);

// -------------------------------------------------------------
// 2. 1-CLICK SENIOR ICE EMERGENCY DRAWER
// -------------------------------------------------------------

writeFile('apps/ops-crm/src/components/households/ice-quick-drawer.tsx', `'use client';

import React from 'react';
import { X, ShieldAlert, Phone, HeartPulse, AlertTriangle, Hospital, ShieldCheck, User } from 'lucide-react';

export interface SeniorIceData {
  seniorName: string;
  age: number;
  bloodGroup: string;
  chronicConditions: string[];
  allergies: string[];
  preferredHospital: string;
  erPhone: string;
  nriSponsorName: string;
  nriSponsorPhone: string;
  nriSponsorRelation: string;
  lastConsultDate: string;
  primaryPhysician: string;
}

export const IceQuickDrawer: React.FC<{
  ice: SeniorIceData;
  isOpen: boolean;
  onClose: () => void;
}> = ({ ice, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white border-l border-slate-200 w-full max-w-md h-full flex flex-col shadow-2xl p-6 overflow-y-auto space-y-6 text-slate-800 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-secondary-50 flex items-center justify-center text-secondary-500 font-black shadow-xs glow-secondary">
              <ShieldAlert size={22} />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 m-0">Senior ICE Emergency Sheet</h2>
              <span className="text-[10px] font-extrabold text-secondary-600 bg-secondary-50 px-2 py-0.5 rounded-full border border-secondary-200 inline-block mt-0.5">
                SUB-2S ENCRYPTED LEDGER
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Vital Blood & Age Alert */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-2xl bg-brand-50/80 border border-brand-200 space-y-1 text-center">
            <span className="text-[10px] font-extrabold text-brand-700 uppercase tracking-wider block">Blood Group</span>
            <span className="text-2xl font-black text-brand-700">{ice.bloodGroup}</span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 text-center">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Senior Age</span>
            <span className="text-2xl font-black text-slate-900">{ice.age} yrs</span>
          </div>
        </div>

        {/* Chronic Conditions */}
        <div className="space-y-2">
          <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
            <HeartPulse size={14} className="text-brand-600" />
            Chronic Conditions
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {ice.chronicConditions.map((cond) => (
              <span key={cond} className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
                {cond}
              </span>
            ))}
          </div>
        </div>

        {/* Known Allergies & Contraindications */}
        <div className="space-y-2">
          <h4 className="text-xs font-black text-secondary-600 flex items-center gap-1.5 uppercase tracking-wider">
            <AlertTriangle size={14} />
            Critical Allergies / Contraindications
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {ice.allergies.map((allg) => (
              <span key={allg} className="px-3 py-1 rounded-xl bg-secondary-50 text-secondary-600 text-xs font-extrabold border border-secondary-200">
                ⚠️ {allg}
              </span>
            ))}
          </div>
        </div>

        {/* Preferred Emergency Trauma Center */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
          <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
            <Hospital size={14} className="text-brand-600" />
            Preferred Trauma ER
          </h4>
          <p className="text-xs font-extrabold text-slate-800 m-0">{ice.preferredHospital}</p>
          <a
            href={\`tel:\${ice.erPhone}\`}
            className="inline-flex items-center gap-2 text-xs font-black text-secondary-600 hover:underline pt-1"
          >
            <Phone size={13} />
            <span>Direct ER Line: {ice.erPhone}</span>
          </a>
        </div>

        {/* Primary NRI Sponsor Escalation */}
        <div className="p-4 rounded-2xl bg-brand-50/80 border border-brand-200 space-y-2">
          <h4 className="text-xs font-black text-brand-800 flex items-center gap-1.5 uppercase tracking-wider">
            <ShieldCheck size={14} />
            NRI Primary Sponsor Escalation
          </h4>
          <div className="flex items-center justify-between text-xs">
            <div>
              <strong className="text-slate-900 block">{ice.nriSponsorName} ({ice.nriSponsorRelation})</strong>
              <span className="text-slate-600 text-[11px] font-mono">{ice.nriSponsorPhone}</span>
            </div>
            <a
              href={\`tel:\${ice.nriSponsorPhone}\`}
              className="p-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-xs shadow-xs glow-primary"
            >
              <Phone size={14} />
            </a>
          </div>
        </div>

        {/* Footer Close */}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-extrabold transition-colors mt-auto"
        >
          Close Emergency Sheet
        </button>
      </div>
    </div>
  );
};
`);

// -------------------------------------------------------------
// 3. MULTI-CHANNEL TIMELINE FEED WITH FILTER TABS
// -------------------------------------------------------------

writeFile('apps/ops-crm/src/components/households/timeline-feed.tsx', `'use client';

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
              className={\`px-3 py-1.5 rounded-xl text-xs font-bold transition-all \${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white shadow-xs font-extrabold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 border border-slate-200/60'
              }\`}
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
`);

// -------------------------------------------------------------
// 4. HOUSEHOLD 360 BENTO DASHBOARD PAGE
// -------------------------------------------------------------

writeFile('apps/ops-crm/src/app/households/[id]/page.tsx', `'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  HeartPulse,
  User,
  MapPin,
  Phone,
  Wallet,
  FileText,
  ChevronLeft,
  CheckCircle2,
  Activity,
  Calendar,
  Share2
} from 'lucide-react';
import { IceQuickDrawer, SeniorIceData } from '../../../components/households/ice-quick-drawer';
import { TimelineFeed } from '../../../components/households/timeline-feed';

const mockIceData: SeniorIceData = {
  seniorName: 'Gopalakrishnan Menon',
  age: 79,
  bloodGroup: 'O+',
  chronicConditions: ['Hypertension', 'Type 2 Diabetes', 'Mild Osteoarthritis'],
  allergies: ['Penicillin', 'Sulfa Drugs'],
  preferredHospital: 'Manipal Hospital Old Airport Road',
  erPhone: '+91 80 2502 4444',
  nriSponsorName: 'Divya Menon',
  nriSponsorPhone: '+1 408 555 0192',
  nriSponsorRelation: 'Daughter (San Jose, CA)',
  lastConsultDate: '18 Aug 2026',
  primaryPhysician: 'Dr. Ananya Sen (Geriatrician)',
};

export default function HouseholdDetailPage({ params }: { params: { id: string } }) {
  const [isIceOpen, setIsIceOpen] = useState(false);
  const [digestExported, setDigestExported] = useState(false);

  const handleExportDigest = () => {
    setDigestExported(true);
    setTimeout(() => setDigestExported(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 rounded-xl text-slate-500 hover:bg-white hover:text-slate-900 transition-all border border-slate-200 bg-white shadow-xs"
          >
            <ChevronLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-900 m-0">Menon Family Household</h2>
              <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                ACTIVE ANNUAL PLAN
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 mb-0 font-medium flex items-center gap-1.5">
              <MapPin size={12} className="text-brand-600" />
              <span>Indiranagar 100ft Rd, Bangalore East • Household ID: {params.id || 'hh-blr-001'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportDigest}
            className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
          >
            <Share2 size={14} className="text-slate-500" />
            <span>{digestExported ? '✓ WhatsApp Digest Dispatched!' : 'Export Visit Digest (PDF/WhatsApp)'}</span>
          </button>

          <button
            onClick={() => setIsIceOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary-500 hover:bg-secondary-600 text-white text-xs font-black shadow-xs glow-secondary transition-all"
          >
            <ShieldAlert size={16} />
            <span>1-Click Senior ICE Sheet</span>
          </button>
        </div>
      </div>

      {/* Bento Grid: 3 Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Senior Identity & Assigned Officer Card */}
        <div className="bento-card p-5 space-y-3">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Primary Senior</span>
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white font-black text-lg shadow-xs glow-primary">
              GM
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-slate-900 m-0">Gopalakrishnan Menon</h4>
              <span className="text-xs text-slate-500 font-medium">79 yrs • Blood Group O+</span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Assigned Officer</span>
            <strong className="text-brand-700 font-extrabold">Ramesh Kumar (Bangalore East)</strong>
          </div>
        </div>

        {/* Emergency INR Wallet Balance Card */}
        <div className="bento-card p-5 space-y-3">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Emergency Wallet Balance</span>
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-black text-lg">
              ₹
            </div>
            <div>
              <h4 className="text-xl font-black text-slate-900 m-0">₹14,500</h4>
              <span className="text-xs text-emerald-600 font-bold">Auto-Topup Active (₹5,000 threshold)</span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Monthly Quota</span>
            <strong className="text-slate-900 font-extrabold">4 / 4 Free Visits Utilized</strong>
          </div>
        </div>

        {/* NRI Sponsor Contact Card */}
        <div className="bento-card p-5 space-y-3">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">NRI Sponsor Contact</span>
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 font-black text-lg">
              <User size={20} />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-slate-900 m-0">Divya Menon (Daughter)</h4>
              <span className="text-xs text-slate-500 font-medium">San Jose, CA (PST -12.5 hrs)</span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Phone</span>
            <a href="tel:+14085550192" className="text-brand-600 font-extrabold hover:underline font-mono">
              +1 408 555 0192
            </a>
          </div>
        </div>
      </div>

      {/* Multi-Channel 360 Feed */}
      <TimelineFeed />

      {/* Slide-over ICE Emergency Drawer */}
      <IceQuickDrawer ice={mockIceData} isOpen={isIceOpen} onClose={() => setIsIceOpen(false)} />
    </div>
  );
}
`);

console.log('Finished Option 1 Part 3: Waveform Player, ICE Drawer, Timeline Feed, and Household 360 Bento Hub');


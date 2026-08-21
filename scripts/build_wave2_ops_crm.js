const fs = require('fs');
const path = require('path');

function writeFile(relPath, content) {
  const fullPath = path.resolve(relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
  console.log('Written:', relPath);
}

// -------------------------------------------------------------
// 1. ICE DRAWER & UNIFIED CRM TIMELINE
// -------------------------------------------------------------

writeFile('apps/ops-crm/src/components/households/ice-quick-drawer.tsx', `
'use client';

import React from 'react';
import { ShieldAlert, X, Phone, Heart, Hospital, AlertOctagon, User } from 'lucide-react';

interface IceQuickDrawerProps {
  onClose: () => void;
  seniorName: string;
  age: number;
  bloodGroup: string;
  conditions: string[];
  allergies: string[];
  preferredHospital: string;
  erPhone: string;
  nriContact: { name: string; relation: string; phone: string; timezone: string };
  localNeighborContact: { name: string; phone: string };
}

export const IceQuickDrawer: React.FC<IceQuickDrawerProps> = ({
  onClose,
  seniorName,
  age,
  bloodGroup,
  conditions,
  allergies,
  preferredHospital,
  erPhone,
  nriContact,
  localNeighborContact,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-navy-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-navy-900 border-l border-white/15 h-full p-6 overflow-y-auto shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5 text-secondary-400">
            <ShieldAlert size={22} />
            <div>
              <h3 className="text-base font-black text-white m-0">Verified Senior ICE Emergency Sheet</h3>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Sub-2s Query Encrypted Store</span>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg bg-white/5">
            <X size={18} />
          </button>
        </div>

        {/* Vital Snapshot */}
        <div className="bg-navy-800/80 border border-white/10 p-4 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="text-base font-extrabold text-white m-0">{seniorName}</h4>
              <span className="text-xs text-slate-400 font-medium">Age: {age} • Blood Group: <strong className="text-brand-400">{bloodGroup}</strong></span>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-brand-500/20 text-brand-400 border border-brand-500/30 text-[10px] font-black">
              ICE ACTIVE
            </span>
          </div>
        </div>

        {/* Chronic Conditions & Drug Allergies */}
        <div className="space-y-3">
          <div className="bg-navy-800/80 border border-white/10 p-4 rounded-2xl">
            <span className="text-[11px] font-extrabold text-slate-300 uppercase tracking-wider block mb-2">
              Chronic Medical Conditions
            </span>
            <div className="flex flex-wrap gap-1.5">
              {conditions.map((c, i) => (
                <span key={i} className="text-xs font-bold px-2.5 py-1 rounded-lg bg-white/5 text-slate-200 border border-white/10">
                  {c}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-secondary-500/10 border border-secondary-500/30 p-4 rounded-2xl">
            <span className="text-[11px] font-extrabold text-secondary-400 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
              <AlertOctagon size={14} />
              Known Drug Allergies & Contraindications
            </span>
            <div className="flex flex-wrap gap-1.5">
              {allergies.map((a, i) => (
                <span key={i} className="text-xs font-black px-2.5 py-1 rounded-lg bg-secondary-500/20 text-secondary-300 border border-secondary-500/40">
                  {a}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Hospital Trauma Pre-Brief */}
        <div className="bg-navy-800/80 border border-white/10 p-4 rounded-2xl space-y-2">
          <span className="text-[11px] font-extrabold text-slate-300 uppercase tracking-wider block">
            Preferred Hospital & Trauma ER
          </span>
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Hospital size={16} className="text-brand-400" />
            <span>{preferredHospital}</span>
          </div>
          <a
            href={\`tel:\${erPhone}\`}
            className="inline-flex items-center gap-2 text-xs font-bold text-brand-400 hover:underline pt-1"
          >
            <Phone size={12} />
            <span>Direct ER Line: {erPhone}</span>
          </a>
        </div>

        {/* Emergency Call Trees */}
        <div className="bg-navy-800/80 border border-white/10 p-4 rounded-2xl space-y-3">
          <span className="text-[11px] font-extrabold text-slate-300 uppercase tracking-wider block">
            Emergency Call Escalation Tree
          </span>
          
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-white block">{nriContact.name} ({nriContact.relation})</span>
              <span className="text-[10px] text-slate-400">{nriContact.timezone} • {nriContact.phone}</span>
            </div>
            <a href={\`tel:\${nriContact.phone}\`} className="p-2 rounded-lg bg-brand-500 text-navy-950">
              <Phone size={13} />
            </a>
          </div>

          <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-white block">{localNeighborContact.name} (Key Holder Neighbor)</span>
              <span className="text-[10px] text-slate-400">{localNeighborContact.phone}</span>
            </div>
            <a href={\`tel:\${localNeighborContact.phone}\`} className="p-2 rounded-lg bg-brand-500 text-navy-950">
              <Phone size={13} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
`);

writeFile('apps/ops-crm/src/components/households/timeline-feed.tsx', `
'use client';

import React from 'react';
import { PhoneCall, MapPin, Stethoscope, AlertTriangle, Wallet, Camera, Mic, CheckCircle2, Clock } from 'lucide-react';

export interface TimelineEvent {
  id: string;
  type: 'TELEPHONY_CALL' | 'CARE_VISIT' | 'TELECONSULT' | 'INCIDENT' | 'WALLET_TOPUP';
  title: string;
  timestamp: string;
  officerOrDoctorName: string;
  summary: string;
  audioRecordingUrl?: string;
  photoProofs?: string[];
  metrics?: { [key: string]: string | number };
  status: 'COMPLETED' | 'ACTION_REQUIRED' | 'LOGGED';
}

const mockEvents: TimelineEvent[] = [
  {
    id: 'evt-001',
    type: 'CARE_VISIT',
    title: 'In-Person Care Officer Monthly Safety & Adherence Visit',
    timestamp: 'Today at 10:30 AM',
    officerOrDoctorName: 'Ramesh Kumar (Care Officer)',
    summary: 'Completed 5-minute dynamic SOP. Pillbox refilled for 14 days, bathroom grab bars verified stable, senior cheerful.',
    photoProofs: ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300', 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=300'],
    metrics: { 'BP': '128/82 mmHg', 'SpO2': '98%', 'Pulse': '74 bpm', 'SOP Speed': '2m 45s' },
    status: 'COMPLETED',
  },
  {
    id: 'evt-002',
    type: 'TELEPHONY_CALL',
    title: 'IVR Telephony Check-in Call (Exotel)',
    timestamp: 'Yesterday at 04:15 PM',
    officerOrDoctorName: 'Automated Elder Voice Tree',
    summary: 'Senior pressed 1 to confirm evening BP medication taken. Transcription sentiment: Positive, calm.',
    audioRecordingUrl: 'mock-audio-recording.mp3',
    status: 'COMPLETED',
  },
  {
    id: 'evt-003',
    type: 'TELECONSULT',
    title: 'Geriatric Specialist Teleconsultation (MED-04)',
    timestamp: '18 Aug 2026 at 11:00 AM',
    officerOrDoctorName: 'Dr. Arvind Swamy (Geriatrician)',
    summary: 'Reviewed quarterly HbA1c and lipid profiles. Adjusted metformin dosage, requested follow-up in 90 days.',
    metrics: { 'Prescription': 'Rx Issued (3 items)', 'Follow-up': '18 Nov 2026' },
    status: 'COMPLETED',
  },
  {
    id: 'evt-004',
    type: 'WALLET_TOPUP',
    title: 'In-App INR Wallet Auto-Topup by NRI Daughter',
    timestamp: '15 Aug 2026 at 02:00 PM',
    officerOrDoctorName: 'Divya Menon (California, USA)',
    summary: 'Auto-replenishment of ₹10,000 for emergency dispatch holds and pay-per-use diagnostic requests.',
    metrics: { 'Amount': '+₹10,000.00', 'Balance': '₹14,500.00' },
    status: 'LOGGED',
  },
];

export const TimelineFeed: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-black text-white m-0">360° Unified Timeline</h3>
        <span className="text-xs text-slate-400 font-medium">Chronological Multi-Channel Ledger</span>
      </div>

      <div className="relative border-l-2 border-white/10 ml-4 pl-6 space-y-8">
        {mockEvents.map((evt) => {
          const getIcon = () => {
            switch (evt.type) {
              case 'CARE_VISIT': return <MapPin size={16} className="text-brand-400" />;
              case 'TELEPHONY_CALL': return <PhoneCall size={16} className="text-sky-400" />;
              case 'TELECONSULT': return <Stethoscope size={16} className="text-secondary-400" />;
              case 'WALLET_TOPUP': return <Wallet size={16} className="text-emerald-400" />;
              default: return <Clock size={16} className="text-slate-400" />;
            }
          };

          return (
            <div key={evt.id} className="relative group">
              {/* Event Icon Pin */}
              <div className="absolute -left-[35px] top-1 w-8 h-8 rounded-full bg-navy-950 border-2 border-white/20 flex items-center justify-center shadow-lg group-hover:border-brand-500 transition-colors">
                {getIcon()}
              </div>

              {/* Event Card */}
              <div className="bg-navy-800/70 border border-white/10 rounded-2xl p-5 shadow-xl hover:border-white/20 transition-all">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div>
                    <h4 className="text-sm font-black text-white m-0">{evt.title}</h4>
                    <span className="text-xs text-slate-400 font-medium">{evt.officerOrDoctorName}</span>
                  </div>
                  <span className="text-[11px] font-bold text-slate-400 px-2.5 py-1 rounded-lg bg-navy-900 border border-white/5">
                    {evt.timestamp}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed my-3 font-normal">
                  {evt.summary}
                </p>

                {/* Metrics Pill Grid */}
                {evt.metrics && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                    {Object.entries(evt.metrics).map(([k, v]) => (
                      <div key={k} className="p-2 rounded-xl bg-navy-900/60 border border-white/5">
                        <span className="text-[10px] text-slate-400 block font-bold uppercase">{k}</span>
                        <span className="text-xs font-black text-white">{v}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Photo Proof Gallery */}
                {evt.photoProofs && (
                  <div className="flex items-center gap-3 pt-2 border-t border-white/5">
                    <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                      <Camera size={13} className="text-brand-400" />
                      Verified Visit Photos:
                    </span>
                    <div className="flex gap-2">
                      {evt.photoProofs.map((src, i) => (
                        <img
                          key={i}
                          src={src}
                          alt="Proof"
                          className="w-12 h-12 rounded-xl object-cover border border-white/20 hover:scale-105 transition-transform"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Telephony Audio Memo Player */}
                {evt.audioRecordingUrl && (
                  <div className="flex items-center gap-3 pt-2 border-t border-white/5 text-xs text-slate-300">
                    <Mic size={14} className="text-sky-400" />
                    <span className="font-bold">Call Audio Recording Attached (1:12)</span>
                    <button className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-[11px]">
                      Play Audio
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
`);

writeFile('apps/ops-crm/src/app/households/[id]/page.tsx', `
'use client';

import React, { useState } from 'react';
import { TimelineFeed } from '../../../components/households/timeline-feed';
import { IceQuickDrawer } from '../../../components/households/ice-quick-drawer';
import { ShieldAlert, Phone, MapPin, Calendar, Heart, ArrowLeft, Wallet } from 'lucide-react';
import Link from 'next/link';

export default function HouseholdDetailPage({ params }: { params: { id: string } }) {
  const [showIceDrawer, setShowIceDrawer] = useState(false);

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white">
          <ArrowLeft size={14} />
          <span>Back to Live Command</span>
        </Link>

        <button
          onClick={() => setShowIceDrawer(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-secondary-500 to-secondary-600 hover:opacity-90 text-white text-xs font-black shadow-lg shadow-secondary-500/25 transition-all"
        >
          <ShieldAlert size={16} />
          <span>1-Click Senior ICE Emergency Sheet</span>
        </button>
      </div>

      {/* Household Profile Hero Card */}
      <div className="bg-navy-800/80 border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-black text-white m-0">Menon Household</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-400 border border-brand-500/30 text-xs font-bold">
                Sampoorna Plan (Active)
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 mb-0 flex items-center gap-2">
              <MapPin size={13} className="text-brand-400" />
              #402, 12th Main, HAL 2nd Stage, Indiranagar, Bangalore 560038
            </p>
          </div>

          <div className="flex gap-4 text-right">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Assigned Officer</span>
              <span className="text-sm font-extrabold text-white">Ramesh Kumar</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Wallet Balance</span>
              <span className="text-sm font-black text-brand-400">₹14,500.00</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/10 text-xs">
          <div>
            <span className="text-slate-400 block font-medium">Senior Resident:</span>
            <strong className="text-white">Gopalakrishnan Menon (79 yrs)</strong>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Primary Emergency Sponsor:</span>
            <strong className="text-white">Divya Menon (Daughter • California, USA)</strong>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Preferred Trauma Center:</span>
            <strong className="text-white">Manipal Hospital Old Airport Rd (1.8 km)</strong>
          </div>
        </div>
      </div>

      {/* 360 Timeline Feed */}
      <TimelineFeed />

      {/* ICE Drawer Modal */}
      {showIceDrawer && (
        <IceQuickDrawer
          onClose={() => setShowIceDrawer(false)}
          seniorName="Gopalakrishnan Menon"
          age={79}
          bloodGroup="O+ Positive"
          conditions={['Hypertension', 'Type 2 Diabetes', 'Mild Osteoarthritis']}
          allergies={['Penicillin / Amoxicillin', 'Sulfa Drugs']}
          preferredHospital="Manipal Hospital Old Airport Rd"
          erPhone="+91 80 2502 4444"
          nriContact={{
            name: 'Divya Menon',
            relation: 'Daughter (NRI)',
            phone: '+1 408 555 0192',
            timezone: 'PST (UTC-8)',
          }}
          localNeighborContact={{
            name: 'Col. K. R. Sharma (Retd.)',
            phone: '+91 98450 77112',
          }}
        />
      )}
    </div>
  );
}
`);

// -------------------------------------------------------------
// 2. DOCTOR & PARTNER PANEL DIRECTORY
// -------------------------------------------------------------

writeFile('apps/ops-crm/src/components/partners/partner-card.tsx', `
'use client';

import React, { useState } from 'react';
import { ShieldCheck, Phone, MapPin, Clock, DollarSign, Stethoscope, Truck, Check } from 'lucide-react';

export interface PartnerProvider {
  id: string;
  name: string;
  category: 'DOCTOR' | 'AMBULANCE' | 'DIAGNOSTICS' | 'HOME_NURSE';
  specialization: string;
  city: string;
  phone: string;
  contractedRateINR: number;
  rateUnit: string;
  isAvailable: boolean;
  slaMinutes: number;
}

export const PartnerCard: React.FC<{ partner: PartnerProvider }> = ({ partner }) => {
  const [isOnline, setIsOnline] = useState(partner.isAvailable);

  return (
    <div className="bg-navy-800/80 border border-white/10 rounded-3xl p-5 shadow-xl hover:border-white/20 transition-all space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-400 border border-brand-500/30">
            {partner.category}
          </span>
          <h3 className="text-base font-extrabold text-white mt-1.5 mb-0.5">{partner.name}</h3>
          <p className="text-xs text-slate-400 m-0">{partner.specialization}</p>
        </div>

        <button
          onClick={() => setIsOnline(!isOnline)}
          className={\`px-2.5 py-1 rounded-xl text-[11px] font-black transition-all \${
            isOnline
              ? 'bg-brand-500/20 text-brand-400 border border-brand-500/40'
              : 'bg-white/5 text-slate-500 border border-white/10'
          }\`}
        >
          {isOnline ? 'Active on Shift' : 'Off-Duty'}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 py-3 border-y border-white/5">
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-bold block">City & SLA</span>
          <strong>{partner.city} • &lt;{partner.slaMinutes}m</strong>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Contracted Rate</span>
          <strong className="text-brand-400">₹{partner.contractedRateINR} / {partner.rateUnit}</strong>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs pt-1">
        <a href={\`tel:\${partner.phone}\`} className="flex items-center gap-1.5 text-brand-400 font-bold hover:underline">
          <Phone size={13} />
          <span>{partner.phone}</span>
        </a>

        <span className="text-[11px] text-slate-400 font-medium">Verified Partner</span>
      </div>
    </div>
  );
};
`);

writeFile('apps/ops-crm/src/app/partners/page.tsx', `
'use client';

import React, { useState } from 'react';
import { PartnerCard, PartnerProvider } from '../../components/partners/partner-card';
import { ShieldCheck, Plus, Search, Filter } from 'lucide-react';

const mockPartners: PartnerProvider[] = [
  {
    id: 'part-001',
    name: 'Dr. Arvind Swamy (MD Geriatrics)',
    category: 'DOCTOR',
    specialization: 'Geriatric Medicine & Cognitive Health',
    city: 'Bangalore',
    phone: '+91 98450 33445',
    contractedRateINR: 1200,
    rateUnit: 'Consultation',
    isAvailable: true,
    slaMinutes: 30,
  },
  {
    id: 'part-002',
    name: 'MedPlus Advanced ALS Ambulance #14',
    category: 'AMBULANCE',
    specialization: 'Advanced Cardiac Life Support (ACLS)',
    city: 'Bangalore East',
    phone: '+91 80 6165 9999',
    contractedRateINR: 2500,
    rateUnit: 'Emergency Trip',
    isAvailable: true,
    slaMinutes: 15,
  },
  {
    id: 'part-003',
    name: 'Apollo Diagnostics Mobile Phlebotomy',
    category: 'DIAGNOSTICS',
    specialization: 'Home Fasting Blood & Urine Sample Pickup',
    city: 'Bangalore',
    phone: '+91 80 4433 2211',
    contractedRateINR: 350,
    rateUnit: 'Home Collection',
    isAvailable: true,
    slaMinutes: 60,
  },
  {
    id: 'part-004',
    name: 'Nightingales Home Care Nursing',
    category: 'HOME_NURSE',
    specialization: 'Post-Op Wound Dressing & IV Administration',
    city: 'Bangalore',
    phone: '+91 80 7788 9900',
    contractedRateINR: 800,
    rateUnit: 'Nursing Visit',
    isAvailable: false,
    slaMinutes: 120,
  },
];

export default function PartnerDirectoryPage() {
  const [selectedCat, setSelectedCat] = useState<string>('ALL');

  const filtered = mockPartners.filter((p) => {
    if (selectedCat !== 'ALL' && p.category !== selectedCat) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white m-0">Empanelled Doctor & Partner Panel</h2>
          <p className="text-xs text-slate-400 mt-1 mb-0">Verified clinical specialists, ambulance fleets, and contracted rate cards</p>
        </div>

        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500 text-navy-950 text-xs font-black shadow-lg shadow-brand-500/20 hover:bg-brand-400 transition-all">
          <Plus size={15} />
          <span>Empanel New Partner</span>
        </button>
      </div>

      {/* Category Switcher */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {['ALL', 'DOCTOR', 'AMBULANCE', 'DIAGNOSTICS', 'HOME_NURSE'].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCat(cat)}
            className={\`px-3 py-1.5 rounded-xl text-xs font-bold transition-all \${
              selectedCat === cat
                ? 'bg-brand-500 text-navy-950 shadow-md'
                : 'bg-navy-800 text-slate-300 hover:bg-navy-700'
            }\`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid of Partner Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((partner) => (
          <PartnerCard key={partner.id} partner={partner} />
        ))}
      </div>
    </div>
  );
}
`);

console.log('Finished generating Wave 2 360 CRM Timeline and Partner Directory components');


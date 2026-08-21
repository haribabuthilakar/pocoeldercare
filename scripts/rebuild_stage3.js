const fs = require('fs');
const path = require('path');

function writeFile(relPath, content) {
  const fullPath = path.resolve(relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
  console.log('Written:', relPath);
}

// -------------------------------------------------------------
// 1. 1-CLICK SENIOR ICE EMERGENCY DRAWER
// -------------------------------------------------------------

writeFile('apps/ops-crm/src/components/households/ice-quick-drawer.tsx', `'use client';

import React from 'react';
import { X, ShieldAlert, Phone, HeartPulse, AlertTriangle, Hospital, ShieldCheck } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border-l border-slate-200 w-full max-w-md h-full flex flex-col shadow-2xl p-6 overflow-y-auto space-y-6 text-slate-800 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-secondary-50 flex items-center justify-center text-secondary-500 font-black glow-secondary">
              <ShieldAlert size={22} />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 m-0">Senior ICE Emergency Sheet</h2>
              <span className="text-[10px] font-extrabold text-secondary-600 bg-secondary-50 px-2 py-0.5 rounded-full border border-secondary-200 inline-block mt-0.5">
                SUB-2S ENCRYPTED ACCESS
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Vital Blood & Age Alert */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-2xl bg-brand-50 border border-brand-200 space-y-1 text-center">
            <span className="text-[10px] font-extrabold text-brand-700 uppercase tracking-wider block">Blood Group</span>
            <span className="text-xl font-black text-brand-700">{ice.bloodGroup}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 text-center">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Senior Age</span>
            <span className="text-xl font-black text-slate-900">{ice.age} yrs</span>
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
              <span key={cond} className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
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
              <span key={allg} className="px-2.5 py-1 rounded-xl bg-secondary-50 text-secondary-600 text-xs font-extrabold border border-secondary-200">
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
        <div className="p-4 rounded-2xl bg-brand-50 border border-brand-200 space-y-2">
          <h4 className="text-xs font-black text-brand-800 flex items-center gap-1.5 uppercase tracking-wider">
            <ShieldCheck size={14} />
            NRI Primary Contact Escalation
          </h4>
          <div className="flex items-center justify-between text-xs">
            <div>
              <strong className="text-slate-900 block">{ice.nriSponsorName} ({ice.nriSponsorRelation})</strong>
              <span className="text-slate-600 text-[11px]">{ice.nriSponsorPhone}</span>
            </div>
            <a
              href={\`tel:\${ice.nriSponsorPhone}\`}
              className="p-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-xs shadow-sm glow-primary"
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
          Close ICE Sheet
        </button>
      </div>
    </div>
  );
};
`);

// -------------------------------------------------------------
// 2. TIMELINE FEED (AUDIO CALLS, PHOTO PROOFS, TELECONSULT RX)
// -------------------------------------------------------------

writeFile('apps/ops-crm/src/components/households/timeline-feed.tsx', `'use client';

import React from 'react';
import { PhoneCall, Camera, Stethoscope, Wallet, Play, CheckCircle2, FileText } from 'lucide-react';

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
    subtitle: 'Automated Elder IVR check-in. Senior confirmed feeling well, appetite normal.',
    timestamp: 'Today, 10:15 AM',
    audioUrl: 'https://cdn.pococare.in/audio/mock-call-01.mp3',
  },
  {
    id: 'evt-2',
    type: 'VISIT',
    title: 'Care Officer Visit: Check-in & Vital Signs',
    subtitle: 'Ramesh Kumar completed full 12-point SOP in 3m 15s. BP: 128/82 mmHg, Pulse: 72 bpm, SpO2: 98%.',
    timestamp: 'Yesterday, 4:30 PM',
    photoUrl: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'evt-3',
    type: 'TELECONSULT',
    title: 'Clinical Teleconsultation with Dr. Ananya Sen',
    subtitle: 'Reviewed monthly sugar trends. Prescribed Metformin 500mg titration.',
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
  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-base font-black text-slate-900 m-0">360° Unified Multi-Channel Timeline</h3>
          <p className="text-xs text-slate-500 m-0 font-medium">Consolidated voice calls, field visit proofs, teleconsult Rx & wallet ledger</p>
        </div>
      </div>

      <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
        {mockEvents.map((event) => {
          return (
            <div key={event.id} className="relative group">
              {/* Event Pin Dot */}
              <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-white border-4 border-brand-500 ring-2 ring-brand-100 group-hover:scale-110 transition-transform" />

              {/* Event Card Content */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3 hover:border-slate-300 transition-all">
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

                {/* Embedded Audio Player for Calls */}
                {event.audioUrl && (
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-slate-200">
                    <button className="w-7 h-7 rounded-lg bg-brand-500 text-white flex items-center justify-center shadow-sm glow-primary">
                      <Play size={12} className="ml-0.5" />
                    </button>
                    <span className="text-[11px] font-bold text-slate-700">Listen Exotel Call Recording (0:48s)</span>
                  </div>
                )}

                {/* Photo Proof Gallery for In-Person Visits */}
                {event.photoUrl && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-extrabold text-slate-500 uppercase">Verified Visit Proof</span>
                    <img
                      src={event.photoUrl}
                      alt="Care Officer Verification Proof"
                      className="w-full h-36 object-cover rounded-xl border border-slate-200 shadow-sm"
                    />
                  </div>
                )}

                {/* Teleconsult Prescription / Notes */}
                {event.doctorNotes && (
                  <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200 flex items-center gap-2 text-xs font-bold text-blue-800">
                    <FileText size={14} className="text-blue-600 flex-shrink-0" />
                    <span>{event.doctorNotes}</span>
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

// -------------------------------------------------------------
// 3. HOUSEHOLD DETAIL PAGE (apps/ops-crm/src/app/households/[id]/page.tsx)
// -------------------------------------------------------------

writeFile('apps/ops-crm/src/app/households/[id]/page.tsx', `'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShieldAlert, HeartPulse, User, MapPin, Phone, Wallet, FileText, ChevronLeft, CheckCircle2 } from 'lucide-react';
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
      {/* Top Breadcrumb & Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 rounded-xl text-slate-400 hover:bg-white hover:text-slate-900 transition-all border border-slate-200">
            <ChevronLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-900 m-0">Menon Family Household</h2>
              <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                ACTIVE ANNUAL PLAN
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 mb-0 font-medium flex items-center gap-1.5">
              <MapPin size={12} className="text-brand-600" />
              <span>Indiranagar 100ft Rd, Bangalore East • ID: {params.id || 'hh-blr-001'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportDigest}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-sm transition-all"
          >
            {digestExported ? '✓ WhatsApp Digest Dispatched!' : 'Export Visit Digest (PDF/WhatsApp)'}
          </button>

          <button
            onClick={() => setIsIceOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary-500 hover:bg-secondary-600 text-white text-xs font-black shadow-sm glow-secondary transition-all"
          >
            <ShieldAlert size={16} />
            <span>1-Click Senior ICE Sheet</span>
          </button>
        </div>
      </div>

      {/* Senior Overview Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Senior Card */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-sm space-y-3">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Primary Senior</span>
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white font-black text-lg shadow-sm glow-primary">
              GM
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-slate-900 m-0">Gopalakrishnan Menon</h4>
              <span className="text-xs text-slate-500 font-medium">79 yrs • Blood Group O+</span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Assigned Officer</span>
            <strong className="text-brand-700 font-extrabold">Ramesh Kumar</strong>
          </div>
        </div>

        {/* Wallet Balance Card */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-sm space-y-3">
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
            <span className="text-slate-500 font-medium">Monthly Digest</span>
            <strong className="text-slate-900 font-extrabold">4/4 Quotas Utilized</strong>
          </div>
        </div>

        {/* NRI Sponsor Card */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-sm space-y-3">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">NRI Sponsor Contact</span>
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 font-black text-lg">
              <User size={20} />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-slate-900 m-0">Divya Menon (Daughter)</h4>
              <span className="text-xs text-slate-500 font-medium">San Jose, CA (PST)</span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Phone</span>
            <a href="tel:+14085550192" className="text-brand-600 font-extrabold hover:underline">
              +1 408 555 0192
            </a>
          </div>
        </div>
      </div>

      {/* Multi-Channel Timeline Stream */}
      <TimelineFeed />

      {/* ICE Drawer */}
      <IceQuickDrawer ice={mockIceData} isOpen={isIceOpen} onClose={() => setIsIceOpen(false)} />
    </div>
  );
}
`);

// -------------------------------------------------------------
// 4. OFFICER ROSTER CARD & FLEET ROSTER PAGE (apps/ops-crm/src/app/officers/page.tsx)
// -------------------------------------------------------------

writeFile('apps/ops-crm/src/components/officers/officer-roster-card.tsx', `'use client';

import React, { useState } from 'react';
import { ShieldCheck, Phone, MapPin, Users, Star } from 'lucide-react';

export interface OfficerProfile {
  id: string;
  name: string;
  phone: string;
  city: string;
  zone: string;
  currentCaseload: number;
  maxCaseload: number;
  shiftStatus: 'ON_DUTY' | 'OFF_DUTY' | 'ON_LEAVE';
  policeVerificationNo: string;
  kycVerified: boolean;
  certifications: string[];
  languages: string[];
  rating: number;
  onTimeSlaPercent: number;
  avgSopDuration: string;
  assignedHouseholds: { id: string; name: string; senior: string; condition: string }[];
}

export const OfficerRosterCard: React.FC<{ officer: OfficerProfile }> = ({ officer }) => {
  const [shiftStatus, setShiftStatus] = useState(officer.shiftStatus);
  const [showHouseholds, setShowHouseholds] = useState(false);

  const caseloadPercentage = (officer.currentCaseload / officer.maxCaseload) * 100;
  const isNearCapacity = officer.currentCaseload >= officer.maxCaseload - 3;

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all space-y-5">
      {/* Top Profile Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white font-black text-lg shadow-sm glow-primary">
            {officer.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-slate-900 m-0">{officer.name}</h3>
              {officer.kycVerified && (
                <span className="p-0.5 rounded-full bg-brand-50 text-brand-600" title="Police & KYC Verified">
                  <ShieldCheck size={16} />
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 m-0 font-medium flex items-center gap-1.5 mt-0.5">
              <MapPin size={12} className="text-brand-600" />
              <span>{officer.city} • {officer.zone}</span>
            </p>
          </div>
        </div>

        {/* Shift Toggle */}
        <select
          value={shiftStatus}
          onChange={(e) => setShiftStatus(e.target.value as any)}
          className={\`text-xs font-extrabold px-3 py-1.5 rounded-xl border outline-none cursor-pointer \${
            shiftStatus === 'ON_DUTY'
              ? 'bg-brand-50 text-brand-700 border-brand-200'
              : shiftStatus === 'ON_LEAVE'
              ? 'bg-amber-50 text-amber-700 border-amber-200'
              : 'bg-slate-100 text-slate-600 border-slate-200'
          }\`}
        >
          <option value="ON_DUTY">● On-Duty</option>
          <option value="OFF_DUTY">○ Off-Duty</option>
          <option value="ON_LEAVE">✕ On Leave</option>
        </select>
      </div>

      {/* Caseload Utilization Progress */}
      <div className="space-y-1.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-slate-600 flex items-center gap-1.5">
            <Users size={13} className="text-brand-600" />
            Family Caseload
          </span>
          <span className={isNearCapacity ? 'text-secondary-600 font-extrabold' : 'text-slate-900 font-black'}>
            {officer.currentCaseload} / {officer.maxCaseload} Families
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
          <div
            className={\`h-full rounded-full transition-all \${
              isNearCapacity ? 'bg-secondary-500' : 'bg-brand-500'
            }\`}
            style={{ width: \`\${caseloadPercentage}%\` }}
          />
        </div>
      </div>

      {/* Badges: Languages & Certifications */}
      <div className="space-y-2">
        <div className="flex flex-wrap gap-1.5">
          {officer.languages.map((lang) => (
            <span key={lang} className="text-[11px] font-bold px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
              🗣 {lang}
            </span>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {officer.certifications.map((cert) => (
            <span key={cert} className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-brand-50 text-brand-700 border border-brand-200">
              ✓ {cert}
            </span>
          ))}
        </div>
      </div>

      {/* Performance Score Grid */}
      <div className="grid grid-cols-3 gap-2 text-center py-3 border-y border-slate-100">
        <div>
          <span className="text-[10px] text-slate-500 font-bold uppercase block">Rating</span>
          <span className="text-xs font-black text-slate-900 flex items-center justify-center gap-1">
            <Star size={11} className="text-amber-500 fill-amber-500" />
            {officer.rating} / 5.0
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 font-bold uppercase block">On-Time SLA</span>
          <span className="text-xs font-black text-brand-600">{officer.onTimeSlaPercent}%</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 font-bold uppercase block">Avg Speed</span>
          <span className="text-xs font-black text-slate-900">{officer.avgSopDuration}</span>
        </div>
      </div>

      {/* Assigned Households Accordion */}
      <div>
        <button
          onClick={() => setShowHouseholds(!showHouseholds)}
          className="w-full text-xs font-extrabold text-brand-600 hover:text-brand-700 flex items-center justify-between py-1"
        >
          <span>Assigned Household Roster ({officer.assignedHouseholds.length})</span>
          <span>{showHouseholds ? '▲ Hide' : '▼ View'}</span>
        </button>

        {showHouseholds && (
          <div className="mt-2 space-y-1.5 pt-2 border-t border-slate-100">
            {officer.assignedHouseholds.map((hh) => (
              <div key={hh.id} className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <strong className="text-slate-900 block">{hh.name}</strong>
                  <span className="text-[11px] text-slate-500">{hh.senior} ({hh.condition})</span>
                </div>
                <span className="text-[10px] font-bold text-slate-500">Scheduled Visit</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Contact & Police ID */}
      <div className="flex items-center justify-between text-xs pt-1">
        <a href={\`tel:\${officer.phone}\`} className="flex items-center gap-1.5 text-brand-600 font-extrabold hover:underline">
          <Phone size={13} />
          <span>{officer.phone}</span>
        </a>
        <span className="text-[10px] text-slate-400 font-medium">PV: {officer.policeVerificationNo}</span>
      </div>
    </div>
  );
};
`);

writeFile('apps/ops-crm/src/app/officers/page.tsx', `'use client';

import React, { useState } from 'react';
import { OfficerRosterCard, OfficerProfile } from '../../components/officers/officer-roster-card';
import { Users, Plus, ShieldCheck, Search, Filter } from 'lucide-react';

const mockOfficers: OfficerProfile[] = [
  {
    id: 'off-001',
    name: 'Ramesh Kumar',
    phone: '+91 98450 99888',
    city: 'Bangalore',
    zone: 'East (Indiranagar / HAL)',
    currentCaseload: 26,
    maxCaseload: 35,
    shiftStatus: 'ON_DUTY',
    policeVerificationNo: 'BLR-PV-2024-8891',
    kycVerified: true,
    certifications: ['CPR/AED Certified', 'BLS Life Support', 'Geriatric Care Trained'],
    languages: ['Kannada', 'English', 'Tamil'],
    rating: 4.9,
    onTimeSlaPercent: 98.6,
    avgSopDuration: '3m 15s',
    assignedHouseholds: [
      { id: 'hh-1', name: 'Menon Family', senior: 'Gopalakrishnan Menon (79)', condition: 'Hypertension, Diabetes' },
      { id: 'hh-2', name: 'Raghavan Family', senior: 'Kalyani Raghavan (82)', condition: 'Post-Op Knee Rehab' },
    ],
  },
  {
    id: 'off-002',
    name: 'Suresh Gowda',
    phone: '+91 98450 11223',
    city: 'Bangalore',
    zone: 'South (Jayanagar / JP Nagar)',
    currentCaseload: 22,
    maxCaseload: 35,
    shiftStatus: 'ON_DUTY',
    policeVerificationNo: 'BLR-PV-2024-7712',
    kycVerified: true,
    certifications: ['CPR/AED Certified', 'Geriatric Care Trained'],
    languages: ['Kannada', 'Telugu'],
    rating: 4.7,
    onTimeSlaPercent: 97.4,
    avgSopDuration: '4m 02s',
    assignedHouseholds: [
      { id: 'hh-3', name: 'Anantharaman Family', senior: 'S. Anantharaman (84)', condition: 'Cardiac Care' },
    ],
  },
  {
    id: 'off-003',
    name: 'Meenakshi Iyer',
    phone: '+91 98450 44556',
    city: 'Chennai',
    zone: 'Adyar / Besant Nagar',
    currentCaseload: 32,
    maxCaseload: 35,
    shiftStatus: 'ON_DUTY',
    policeVerificationNo: 'CHN-PV-2025-1092',
    kycVerified: true,
    certifications: ['CPR/AED Certified', 'BLS Life Support', 'Dementia Care Specialist'],
    languages: ['Tamil', 'Hindi', 'English'],
    rating: 4.95,
    onTimeSlaPercent: 99.1,
    avgSopDuration: '2m 50s',
    assignedHouseholds: [
      { id: 'hh-4', name: 'Sundaram Residence', senior: 'Padma Sundaram (76)', condition: 'Mild Dementia' },
    ],
  },
  {
    id: 'off-004',
    name: 'Prashant Patil',
    phone: '+91 98200 66778',
    city: 'Mumbai',
    zone: 'Bandra / Khar',
    currentCaseload: 18,
    maxCaseload: 35,
    shiftStatus: 'OFF_DUTY',
    policeVerificationNo: 'MUM-PV-2024-4431',
    kycVerified: true,
    certifications: ['CPR/AED Certified', 'Geriatric First Aid'],
    languages: ['Marathi', 'Hindi', 'English'],
    rating: 4.8,
    onTimeSlaPercent: 96.8,
    avgSopDuration: '3m 45s',
    assignedHouseholds: [
      { id: 'hh-5', name: 'Deshmukh Household', senior: 'Suresh Deshmukh (81)', condition: 'Hypertension' },
    ],
  },
];

export default function CareOfficerRosterPage() {
  const [selectedCity, setSelectedCity] = useState('ALL');

  const filtered = mockOfficers.filter((off) => {
    if (selectedCity !== 'ALL' && off.city !== selectedCity) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 m-0">Care Officer Fleet & Caseload Roster</h2>
          <p className="text-xs text-slate-500 mt-1 mb-0 font-medium">
            Verified field officers, strict 35-family cap monitoring, live shift status, and credential badges
          </p>
        </div>

        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500 text-white text-xs font-black shadow-sm glow-primary hover:bg-brand-600 transition-all">
          <Plus size={15} />
          <span>Onboard New Officer</span>
        </button>
      </div>

      {/* City Switcher */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {['ALL', 'Bangalore', 'Chennai', 'Mumbai'].map((city) => (
          <button
            key={city}
            onClick={() => setSelectedCity(city)}
            className={\`px-3 py-1.5 rounded-xl text-xs font-bold transition-all \${
              selectedCity === city
                ? 'bg-brand-500 text-white shadow-sm glow-primary font-extrabold'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }\`}
          >
            {city}
          </button>
        ))}
      </div>

      {/* Officer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((officer) => (
          <OfficerRosterCard key={officer.id} officer={officer} />
        ))}
      </div>
    </div>
  );
}
`);

console.log('Finished Stage 3: Household CRM 360, ICE drawer, Timeline Feed, Officer Fleet Roster Hub');


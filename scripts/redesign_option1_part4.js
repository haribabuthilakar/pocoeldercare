const fs = require('fs');
const path = require('path');

function writeFile(relPath, content) {
  const fullPath = path.resolve(relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
  console.log('Written:', relPath);
}

// -------------------------------------------------------------
// 1. OFFICER ROSTER CARD & FLEET HUB
// -------------------------------------------------------------

writeFile('apps/ops-crm/src/components/officers/officer-roster-card.tsx', `'use client';

import React, { useState } from 'react';
import { ShieldCheck, Phone, MapPin, Users, Star, Clock, Battery, ChevronDown, ChevronUp } from 'lucide-react';

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
    <div className="bento-card p-6 space-y-5">
      {/* Top Profile Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white font-black text-lg shadow-xs glow-primary">
            {officer.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-slate-900 m-0">{officer.name}</h3>
              {officer.kycVerified && (
                <span className="p-0.5 rounded-full bg-brand-50 text-brand-600" title="Police & KYC Verified">
                  <ShieldCheck size={16} />
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 m-0 font-medium flex items-center gap-1 mt-0.5">
              <MapPin size={11} className="text-brand-600" />
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
      <div className="space-y-1.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-slate-600 flex items-center gap-1.5">
            <Users size={13} className="text-brand-600" />
            Family Caseload
          </span>
          <span className={isNearCapacity ? 'text-secondary-600 font-black' : 'text-slate-900 font-black'}>
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

      {/* Languages & Certifications Badges */}
      <div className="space-y-2">
        <div className="flex flex-wrap gap-1.5">
          {officer.languages.map((lang) => (
            <span key={lang} className="text-[11px] font-bold px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200/80">
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
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Rating</span>
          <span className="text-xs font-black text-slate-900 flex items-center justify-center gap-1">
            <Star size={11} className="text-amber-500 fill-amber-500" />
            {officer.rating} / 5.0
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 font-bold uppercase block">On-Time SLA</span>
          <span className="text-xs font-black text-brand-600 font-mono">{officer.onTimeSlaPercent}%</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Avg Speed</span>
          <span className="text-xs font-black text-slate-900 font-mono">{officer.avgSopDuration}</span>
        </div>
      </div>

      {/* Assigned Households Accordion */}
      <div>
        <button
          onClick={() => setShowHouseholds(!showHouseholds)}
          className="w-full text-xs font-extrabold text-brand-600 hover:text-brand-700 flex items-center justify-between py-1"
        >
          <span>Assigned Household Roster ({officer.assignedHouseholds.length})</span>
          {showHouseholds ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {showHouseholds && (
          <div className="mt-2 space-y-1.5 pt-2 border-t border-slate-100 animate-in fade-in duration-150">
            {officer.assignedHouseholds.map((hh) => (
              <div key={hh.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <strong className="text-slate-900 block">{hh.name}</strong>
                  <span className="text-[11px] text-slate-500">{hh.senior} ({hh.condition})</span>
                </div>
                <span className="text-[10px] font-extrabold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                  Scheduled
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Contact & Police Verification ID */}
      <div className="flex items-center justify-between text-xs pt-1">
        <a href={\`tel:\${officer.phone}\`} className="flex items-center gap-1.5 text-brand-600 font-extrabold hover:underline font-mono">
          <Phone size={13} />
          <span>{officer.phone}</span>
        </a>
        <span className="text-[10px] text-slate-400 font-mono">PV: {officer.policeVerificationNo}</span>
      </div>
    </div>
  );
};
`);

writeFile('apps/ops-crm/src/app/officers/page.tsx', `'use client';

import React, { useState } from 'react';
import { OfficerRosterCard, OfficerProfile } from '../../components/officers/officer-roster-card';
import { Users, Plus, ShieldCheck, Search, Filter, Activity, Zap } from 'lucide-react';

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
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = mockOfficers.filter((off) => {
    if (selectedCity !== 'ALL' && off.city !== selectedCity) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return off.name.toLowerCase().includes(q) || off.zone.toLowerCase().includes(q) || off.city.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 m-0">Care Officer Fleet & Caseload Roster</h2>
          <p className="text-xs text-slate-500 mt-1 mb-0 font-medium">
            Verified field officers, strict 35-family cap monitoring, live shift telemetry, and credential badges
          </p>
        </div>

        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 text-white text-xs font-black shadow-xs glow-primary hover:bg-brand-600 transition-all">
          <Plus size={15} />
          <span>Onboard New Officer</span>
        </button>
      </div>

      {/* Filter Bar & City Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {['ALL', 'Bangalore', 'Chennai', 'Mumbai'].map((city) => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={\`px-3 py-1.5 rounded-xl text-xs font-bold transition-all \${
                selectedCity === city
                  ? 'bg-slate-900 text-white shadow-xs font-extrabold'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }\`}
            >
              {city}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search officer name, zone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs font-medium pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 outline-none focus:border-brand-400 shadow-xs"
          />
        </div>
      </div>

      {/* Officer Bento Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((officer) => (
          <OfficerRosterCard key={officer.id} officer={officer} />
        ))}
      </div>
    </div>
  );
}
`);

// -------------------------------------------------------------
// 2. PARTNER CARD & PARTNER DIRECTORY
// -------------------------------------------------------------

writeFile('apps/ops-crm/src/components/partners/partner-card.tsx', `'use client';

import React, { useState } from 'react';
import { Phone, ShieldCheck, Clock, MapPin, Stethoscope, Truck, Activity } from 'lucide-react';

export interface PartnerProvider {
  id: string;
  name: string;
  category: 'GERIATRICIAN' | 'GENERAL_PHYSICIAN' | 'AMBULANCE' | 'DIAGNOSTICS' | 'HOME_NURSE';
  city: string;
  zone: string;
  phone: string;
  rateInr: number;
  rateUnit: string;
  isAvailable: boolean;
  slaCommitment: string;
  verifiedBadge: boolean;
  rating: number;
}

export const PartnerCard: React.FC<{ partner: PartnerProvider }> = ({ partner }) => {
  const [isAvailable, setIsAvailable] = useState(partner.isAvailable);

  const getCategoryIcon = () => {
    switch (partner.category) {
      case 'GERIATRICIAN':
      case 'GENERAL_PHYSICIAN':
        return <Stethoscope size={18} className="text-brand-600" />;
      case 'AMBULANCE':
        return <Truck size={18} className="text-secondary-600" />;
      default:
        return <Activity size={18} className="text-blue-600" />;
    }
  };

  return (
    <div className="bento-card p-6 space-y-4">
      {/* Top Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-brand-50 flex items-center justify-center shadow-xs">
            {getCategoryIcon()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-slate-900 m-0">{partner.name}</h3>
              {partner.verifiedBadge && (
                <span className="p-0.5 rounded-full bg-brand-50 text-brand-600" title="Empanelled & Verified">
                  <ShieldCheck size={16} />
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium m-0 flex items-center gap-1 mt-0.5">
              <MapPin size={11} className="text-brand-600" />
              <span>{partner.city} • {partner.zone}</span>
            </p>
          </div>
        </div>

        {/* Live Availability Toggle */}
        <button
          onClick={() => setIsAvailable(!isAvailable)}
          className={\`px-3 py-1 rounded-xl text-xs font-bold transition-all \${
            isAvailable
              ? 'bg-brand-50 text-brand-700 border border-brand-200 font-extrabold'
              : 'bg-slate-100 text-slate-500 border border-slate-200'
          }\`}
        >
          {isAvailable ? '● On-Duty' : '○ Off-Duty'}
        </button>
      </div>

      {/* Contracted Rate & SLA */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase block">Contracted Rate</span>
          <strong className="text-sm text-slate-900 font-black">₹{partner.rateInr.toLocaleString('en-IN')}</strong>
          <span className="text-[10px] text-slate-500 font-medium block">/ {partner.rateUnit}</span>
        </div>

        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase block">SLA Commitment</span>
          <strong className="text-sm text-brand-600 font-black flex items-center gap-1">
            <Clock size={13} />
            {partner.slaCommitment}
          </strong>
          <span className="text-[10px] text-slate-500 font-medium block">{partner.rating} ★ Rating</span>
        </div>
      </div>

      {/* CTI Dial Button */}
      <div className="pt-1">
        <a
          href={\`tel:\${partner.phone}\`}
          className="w-full py-2.5 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 font-extrabold text-xs flex items-center justify-center gap-2 border border-brand-200 transition-colors font-mono"
        >
          <Phone size={14} className="text-brand-600" />
          <span>Direct CTI Dispatch ({partner.phone})</span>
        </a>
      </div>
    </div>
  );
};
`);

writeFile('apps/ops-crm/src/app/partners/page.tsx', `'use client';

import React, { useState } from 'react';
import { PartnerCard, PartnerProvider } from '../../components/partners/partner-card';
import { ShieldCheck, Plus, Filter } from 'lucide-react';

const mockPartners: PartnerProvider[] = [
  {
    id: 'p-01',
    name: 'Dr. Ananya Sen, MD',
    category: 'GERIATRICIAN',
    city: 'Bangalore',
    zone: 'East (Indiranagar)',
    phone: '+91 98450 12345',
    rateInr: 1200,
    rateUnit: 'Consult',
    isAvailable: true,
    slaCommitment: '< 45 mins',
    verifiedBadge: true,
    rating: 4.9,
  },
  {
    id: 'p-02',
    name: 'Dr. Vikramaditya Rao, MBBS',
    category: 'GENERAL_PHYSICIAN',
    city: 'Bangalore',
    zone: 'South (Jayanagar)',
    phone: '+91 98450 23456',
    rateInr: 800,
    rateUnit: 'Home Visit',
    isAvailable: true,
    slaCommitment: '< 60 mins',
    verifiedBadge: true,
    rating: 4.8,
  },
  {
    id: 'p-03',
    name: 'Apollo ALS Emergency Ambulance Fleet',
    category: 'AMBULANCE',
    city: 'Bangalore',
    zone: 'All Clusters (Central/East/South)',
    phone: '+91 80 2502 9999',
    rateInr: 2500,
    rateUnit: 'Emergency Trip',
    isAvailable: true,
    slaCommitment: '< 15 mins (Golden Hour)',
    verifiedBadge: true,
    rating: 4.95,
  },
  {
    id: 'p-04',
    name: 'Thyrocare Home Diagnostics Hub',
    category: 'DIAGNOSTICS',
    city: 'Bangalore',
    zone: 'Domlur / Koramangala',
    phone: '+91 98450 88990',
    rateInr: 350,
    rateUnit: 'Sample Collection',
    isAvailable: false,
    slaCommitment: '< 120 mins',
    verifiedBadge: true,
    rating: 4.7,
  },
];

export default function PartnersDirectoryPage() {
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  const filtered = mockPartners.filter((p) => {
    if (filterCategory !== 'ALL' && p.category !== filterCategory) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 m-0">Empanelled Doctor & Healthcare Partner Panel</h2>
          <p className="text-xs text-slate-500 mt-1 mb-0 font-medium">
            Contracted clinical providers, ambulance fleets, and diagnostic networks with live shift status
          </p>
        </div>

        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 text-white text-xs font-black shadow-xs glow-primary hover:bg-brand-600 transition-all">
          <Plus size={15} />
          <span>Empanel New Provider</span>
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['ALL', 'GERIATRICIAN', 'GENERAL_PHYSICIAN', 'AMBULANCE', 'DIAGNOSTICS'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={\`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all \${
              filterCategory === cat
                ? 'bg-slate-900 text-white shadow-xs font-extrabold'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }\`}
          >
            {cat.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Partner Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((partner) => (
          <PartnerCard key={partner.id} partner={partner} />
        ))}
      </div>
    </div>
  );
}
`);

console.log('Finished Option 1 Part 4: Officers, Partners, and Directory layouts');


const fs = require('fs');
const path = require('path');

function writeFile(relPath, content) {
  const fullPath = path.resolve(relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
  console.log('Written:', relPath);
}

// -------------------------------------------------------------
// 1. OFFICER ROSTER CARD
// -------------------------------------------------------------

writeFile('apps/ops-crm/src/components/officers/officer-roster-card.tsx', `'use client';

import React, { useState } from 'react';
import { ShieldCheck, Phone, MapPin, Award, CheckCircle2, Battery, AlertTriangle, Users, Star } from 'lucide-react';

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

// -------------------------------------------------------------
// 2. CARE OFFICER FLEET PAGE
// -------------------------------------------------------------

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

// -------------------------------------------------------------
// 3. UPDATE OPS HEADER WITH OFFICERS TAB
// -------------------------------------------------------------

writeFile('apps/ops-crm/src/components/layout/ops-header.tsx', `'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, Users, ShieldAlert, FileCode2, Wallet, UserCheck } from 'lucide-react';

export const OpsHeader: React.FC = () => {
  const pathname = usePathname();
  const [selectedCity, setSelectedCity] = useState('Bangalore');

  const navLinks = [
    { name: 'Live Command', href: '/', icon: Activity },
    { name: 'Household CRM', href: '/households/hh-blr-001', icon: Users },
    { name: 'Officer Fleet', href: '/officers', icon: UserCheck },
    { name: 'Doctor & Partner Panel', href: '/partners', icon: ShieldAlert },
    { name: 'SOP & Catalog Editor', href: '/catalog', icon: FileCode2 },
    { name: 'Payout Reconciliation', href: '/payouts', icon: Wallet },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-slate-200/80 px-4 md:px-8 py-3.5 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Logo & City Selector */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3 no-underline">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-500 to-secondary-500 flex items-center justify-center font-black text-xl text-white shadow-lg glow-dual">
              P
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-slate-900 tracking-tight">Pococare</span>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                  OPS HUB
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-semibold block -mt-0.5">Multi-City Operations Engine</span>
            </div>
          </Link>

          {/* Multi-City Switcher */}
          <div className="hidden md:flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200">
            {['Bangalore', 'Chennai', 'Hyderabad', 'Mumbai', 'Delhi-NCR'].map((city) => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={\`px-3 py-1 text-xs font-bold rounded-lg transition-all \${
                  selectedCity === city
                    ? 'bg-white text-brand-700 shadow-sm border border-slate-200/60 font-extrabold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }\`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={\`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all \${
                  isActive
                    ? 'bg-brand-50 text-brand-700 border border-brand-200 font-extrabold shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }\`}
              >
                <Icon size={14} className={isActive ? 'text-brand-600' : 'text-slate-400'} />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
`);

console.log('Finished generating Pillar 7 Care Officer Fleet management files');


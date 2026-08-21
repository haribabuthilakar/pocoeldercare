'use client';

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
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedCity === city
                  ? 'bg-slate-900 text-white shadow-xs font-extrabold'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
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

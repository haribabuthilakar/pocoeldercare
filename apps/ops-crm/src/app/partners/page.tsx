'use client';

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

        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500 text-white text-xs font-black shadow-sm glow-primary hover:bg-brand-600 transition-all">
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
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterCategory === cat
                ? 'bg-brand-500 text-white shadow-sm glow-primary font-extrabold'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
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

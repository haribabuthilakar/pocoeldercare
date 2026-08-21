'use client';

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

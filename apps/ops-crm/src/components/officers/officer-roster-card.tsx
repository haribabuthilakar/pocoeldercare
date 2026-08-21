'use client';

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
          className={`text-xs font-extrabold px-3 py-1.5 rounded-xl border outline-none cursor-pointer ${
            shiftStatus === 'ON_DUTY'
              ? 'bg-brand-50 text-brand-700 border-brand-200'
              : shiftStatus === 'ON_LEAVE'
              ? 'bg-amber-50 text-amber-700 border-amber-200'
              : 'bg-slate-100 text-slate-600 border-slate-200'
          }`}
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
            className={`h-full rounded-full transition-all ${
              isNearCapacity ? 'bg-secondary-500' : 'bg-brand-500'
            }`}
            style={{ width: `${caseloadPercentage}%` }}
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
        <a href={`tel:${officer.phone}`} className="flex items-center gap-1.5 text-brand-600 font-extrabold hover:underline font-mono">
          <Phone size={13} />
          <span>{officer.phone}</span>
        </a>
        <span className="text-[10px] text-slate-400 font-mono">PV: {officer.policeVerificationNo}</span>
      </div>
    </div>
  );
};

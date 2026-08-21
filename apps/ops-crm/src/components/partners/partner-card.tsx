'use client';

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
    <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all space-y-4">
      {/* Top Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-brand-50 flex items-center justify-center shadow-sm">
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
          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
            isAvailable
              ? 'bg-brand-50 text-brand-700 border border-brand-200 font-extrabold'
              : 'bg-slate-100 text-slate-500 border border-slate-200'
          }`}
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
          <span className="text-[10px] text-slate-500 font-medium block">{partner.rating} ★ Provider Rating</span>
        </div>
      </div>

      {/* CTI Dial Button */}
      <div className="pt-1">
        <a
          href={`tel:${partner.phone}`}
          className="w-full py-2.5 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 font-extrabold text-xs flex items-center justify-center gap-2 border border-brand-200 transition-colors"
        >
          <Phone size={14} className="text-brand-600" />
          <span>Direct CTI Dispatch ({partner.phone})</span>
        </a>
      </div>
    </div>
  );
};

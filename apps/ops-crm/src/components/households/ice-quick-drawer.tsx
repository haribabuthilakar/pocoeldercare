'use client';

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
            href={`tel:${ice.erPhone}`}
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
              href={`tel:${ice.nriSponsorPhone}`}
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

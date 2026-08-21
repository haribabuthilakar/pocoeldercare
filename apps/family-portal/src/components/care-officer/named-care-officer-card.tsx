'use client';

import React from 'react';
import { Phone, ShieldCheck, Heart, Sparkles, Award } from 'lucide-react';

export const NamedCareOfficerCard: React.FC = () => {
  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#12C395]/15 to-transparent rounded-bl-full pointer-events-none" />

      <div className="flex items-center space-x-4 mb-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#12C395] to-[#0ba17a] text-white flex items-center justify-center font-black text-2xl shadow-lg glow-primary animate-float">
          RK
        </div>
        <div>
          <span className="text-[10px] font-black text-[#12C395] uppercase tracking-widest block">
            Dedicated Care Officer
          </span>
          <h3 className="text-xl font-extrabold text-slate-900">Ramesh Kumar</h3>
          <p className="text-xs text-slate-500 font-medium">Ex-Armed Forces Medical Corps (12 yrs)</p>
        </div>
      </div>

      <p className="text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-100 leading-relaxed mb-4 font-medium">
        "I conduct regular in-person vitals checks, coordinate doctor house calls, and verify emergency readiness for Gopalakrishnan-ji."
      </p>

      <div className="flex items-center justify-between text-xs text-slate-600 pt-3 border-t border-slate-100 font-medium">
        <span className="font-bold text-slate-700">Caseload Transparency:</span>
        <span className="bg-[#edfaf5] text-[#0ba17a] px-3 py-1 rounded-xl font-extrabold border border-[#12C395]/30">
          35 Families Max
        </span>
      </div>

      <a
        href="tel:+919845099888"
        className="mt-5 w-full py-3.5 bg-slate-900 hover:bg-gradient-to-r hover:from-[#12C395] hover:to-[#0ba17a] text-white text-xs font-bold rounded-2xl transition-all duration-300 flex items-center justify-center space-x-2 shadow-md hover:scale-[1.02] active:scale-[0.98]"
      >
        <Phone className="w-4 h-4" />
        <span>Direct Contact (+91 98450 99888)</span>
      </a>
    </div>
  );
};

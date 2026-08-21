'use client';

import React from 'react';
import { Award, CheckCircle2, HeartPulse, ShieldAlert, Download, Sparkles } from 'lucide-react';

export const MonthlyValueDigest: React.FC = () => {
  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-10 shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-black text-[#12C395] uppercase tracking-wider">Peace of Mind Report</span>
            <Sparkles className="w-4 h-4 text-[#FE1D8F]" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mt-1 tracking-tight">August 2026 Monthly Care Summary</h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Household: Menon Residence (Bangalore) • Sampoorna Plan</p>
        </div>

        <button
          onClick={() => window.print()}
          className="px-5 py-3 bg-slate-900 hover:bg-gradient-to-r hover:from-[#12C395] hover:to-[#0ba17a] text-white text-xs font-bold rounded-2xl transition-all duration-300 shadow flex items-center space-x-2"
        >
          <Download className="w-4 h-4" />
          <span>Print / PDF Invoice</span>
        </button>
      </div>

      {/* Metrics Highlights with Vibrant Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100 text-center hover:-translate-y-1 transition duration-300">
          <span className="text-3xl font-black text-[#12C395]">4</span>
          <p className="text-xs font-bold text-slate-700 mt-1">In-Person Visits Met</p>
        </div>
        <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100 text-center hover:-translate-y-1 transition duration-300">
          <span className="text-3xl font-black text-[#12C395]">28</span>
          <p className="text-xs font-bold text-slate-700 mt-1">Daily Vitals Logged</p>
        </div>
        <div className="p-5 bg-[#fee5f2]/40 rounded-3xl border border-[#FE1D8F]/20 text-center hover:-translate-y-1 transition duration-300">
          <span className="text-3xl font-black text-[#FE1D8F]">1</span>
          <p className="text-xs font-bold text-[#830a43] mt-1">Preventive Catch (BP)</p>
        </div>
        <div className="p-5 bg-[#edfaf5] rounded-3xl border border-[#12C395]/30 text-center hover:-translate-y-1 transition duration-300">
          <span className="text-3xl font-black text-[#0ba17a]">100%</span>
          <p className="text-xs font-bold text-[#0e5443] mt-1">Emergency Readiness</p>
        </div>
      </div>

      {/* Narrative Section */}
      <div className="space-y-4 text-xs text-slate-700 leading-relaxed font-medium">
        <div className="p-5 rounded-2xl bg-gradient-to-r from-[#edfaf5] to-[#d4f4ea]/40 border border-[#12C395]/30">
          <h4 className="font-black text-[#0e5443] text-sm mb-1.5">Clinical Intervention Summary</h4>
          <p>
            On Aug 18, Care Officer Ramesh Kumar noted morning systolic BP elevated at 130 mmHg. Dr. Anand Kulkarni reviewed telemetry, adjusted Amlodipine dosage, and scheduled a confirmatory follow-up, successfully stabilizing baseline pressure to 125/79 mmHg without hospital admission.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
          <h4 className="font-black text-slate-900 text-sm mb-1.5">Quantified Family Peace of Mind & Savings</h4>
          <p>
            Estimated hospitalization savings this month: <strong className="text-[#0ba17a]">₹45,000</strong> through timely medication review. All emergency access paths (ambulance priority route, ICE sheet, hospital pre-clearance) remain active.
          </p>
        </div>
      </div>
    </div>
  );
};

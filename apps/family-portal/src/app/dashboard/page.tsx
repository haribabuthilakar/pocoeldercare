'use client';

import React from 'react';
import { PortalHeader } from '@/components/layout/portal-header';
import { HealthSummaryBadge } from '@/components/vitals/health-summary-badge';
import { VitalsTrendChart } from '@/components/vitals/vitals-trend-chart';
import { NamedCareOfficerCard } from '@/components/care-officer/named-care-officer-card';
import { User, Phone, MapPin, Shield, ArrowUpRight, Heart, Activity } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#f8fbfb] pb-16">
      <PortalHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* Top Elderly Member Card with Glass Effect */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 shadow-sm mb-6 border border-white hover:shadow-lg transition-all duration-300">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center space-x-5">
              <div className="w-18 h-18 rounded-3xl bg-gradient-to-tr from-[#12C395] to-[#FE1D8F] p-1 shadow-lg glow-primary animate-float">
                <div className="w-full h-full bg-white rounded-[22px] flex items-center justify-center font-black text-2xl text-slate-900">
                  GM
                </div>
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    Gopalakrishnan Menon
                  </h1>
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-[#edfaf5] text-[#0ba17a] border border-[#12C395]/40 shadow-xs flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-[#12C395] animate-ping" />
                    <span>Sampoorna Care Active</span>
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2 font-medium">
                  <span className="flex items-center space-x-1.5">
                    <User className="w-4 h-4 text-[#12C395]" />
                    <span>Age: 79 • Blood Group: O+</span>
                  </span>
                  <span className="flex items-center space-x-1.5">
                    <MapPin className="w-4 h-4 text-[#FE1D8F]" />
                    <span>Indiranagar, Bangalore</span>
                  </span>
                  <span className="flex items-center space-x-1.5">
                    <Phone className="w-4 h-4 text-[#12C395]" />
                    <span>+91 98450 12345</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3 w-full md:w-auto">
              <Link
                href="/services"
                className="w-full md:w-auto px-6 py-3.5 bg-gradient-to-r from-[#12C395] to-[#0ba17a] hover:brightness-110 text-white text-xs font-bold rounded-2xl transition shadow-lg glow-primary flex items-center justify-center space-x-2 hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Book Included Service</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Health Summary Banner */}
        <div className="mb-6">
          <HealthSummaryBadge
            status="STABLE"
            label="Overall Vitals Status: Stable & Well-Controlled"
            doctorReviewed="Dr. Anand Kulkarni (MD Geriatrics)"
          />
        </div>

        {/* Two-Column Grid: Vitals Chart & Care Officer */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Vitals */}
          <div className="lg:col-span-2 space-y-6">
            <VitalsTrendChart />

            {/* Quick Metrics with Vibrant Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Blood Pressure</span>
                <div className="text-2xl font-black text-slate-900 mt-1">128/82</div>
                <span className="text-xs text-[#0ba17a] font-bold flex items-center space-x-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#12C395]" />
                  <span>Normal</span>
                </span>
              </div>
              <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">SpO2 Oxygen</span>
                <div className="text-2xl font-black text-slate-900 mt-1">98%</div>
                <span className="text-xs text-[#0ba17a] font-bold flex items-center space-x-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#12C395]" />
                  <span>Optimal</span>
                </span>
              </div>
              <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Blood Glucose</span>
                <div className="text-2xl font-black text-[#FE1D8F] mt-1">105</div>
                <span className="text-xs text-[#FE1D8F] font-bold flex items-center space-x-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FE1D8F]" />
                  <span>Fasting Target</span>
                </span>
              </div>
              <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Pulse Rate</span>
                <div className="text-2xl font-black text-slate-900 mt-1">74</div>
                <span className="text-xs text-[#0ba17a] font-bold flex items-center space-x-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#12C395]" />
                  <span>Resting BPM</span>
                </span>
              </div>
            </div>
          </div>

          {/* Right Col: Named Care Officer Card & Emergency Readiness */}
          <div className="space-y-6">
            <NamedCareOfficerCard />

            {/* ICE Emergency Card Quick View */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-[#FE1D8F]" />
                  <span>ICE Emergency Medical Sheet</span>
                </h3>
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-[#fee5f2] text-[#FE1D8F] border border-[#FE1D8F]/30">
                  &lt; 2s Cache Active
                </span>
              </div>

              <div className="space-y-3 text-xs text-slate-600 font-medium">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="font-bold text-slate-800 block">Preferred Hospital:</span>
                  <span>Manipal Hospital Old Airport Rd (+91 80 2502 4444)</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-red-50/70 border border-red-200/60">
                  <span className="font-bold text-red-800 block">Known Drug Allergies:</span>
                  <span className="text-red-700 font-semibold">Penicillin, Sulfa drugs</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="font-bold text-slate-800 block">Chronic Conditions:</span>
                  <span>Hypertension, Mild Osteoarthritis</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

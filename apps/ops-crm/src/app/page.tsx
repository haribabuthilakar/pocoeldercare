'use client';

import React from 'react';
import { TacticalGisMap } from '../components/dashboard/tactical-gis-map';
import { LiveRequestQueue } from '../components/dashboard/live-request-queue';
import { Activity, Users, ShieldCheck, AlertOctagon, TrendingUp, HeartPulse, PhoneCall } from 'lucide-react';

export default function OpsDashboardPage() {
  const metricCards = [
    { label: 'Active Service Tickets', val: '4', sub: '2 Pending Dispatch', icon: Activity, color: 'text-brand-600', bg: 'bg-brand-50' },
    { label: 'On-Ground Officers', val: '18 / 20', sub: '90% Shift Active', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: '35-Cap Caseload Load', val: '74.2%', sub: 'Healthy Capacity', icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'SLA Response Rate', val: '100%', sub: '0 Breaches Today', icon: AlertOctagon, color: 'text-secondary-600', bg: 'bg-secondary-50' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & Fast Telemetry Bento */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bento-card p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">{card.label}</span>
                <div className={`w-9 h-9 rounded-2xl ${card.bg} flex items-center justify-center ${card.color}`}>
                  <Icon size={18} />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 tracking-tight">{card.val}</div>
              <div className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                <TrendingUp size={12} className="text-brand-600" />
                <span>{card.sub}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Command Console: Tactical GIS Map + Live Request Queue */}
      <div className="space-y-6">
        <TacticalGisMap city="Bangalore" />
        <LiveRequestQueue />
      </div>
    </div>
  );
}

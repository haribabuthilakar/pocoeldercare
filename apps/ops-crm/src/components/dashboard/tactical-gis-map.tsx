'use client';

import React, { useState } from 'react';
import {
  Navigation,
  MapPin,
  UserCheck,
  Battery,
  Zap,
  Phone,
  ShieldAlert,
  Clock,
  Layers,
  Maximize2
} from 'lucide-react';

export interface TacticalMarker {
  id: string;
  type: 'OFFICER' | 'HOUSEHOLD_PENDING' | 'HOUSEHOLD_ACTIVE';
  name: string;
  subtext: string;
  city: string;
  zone: string;
  topPct: number;
  leftPct: number;
  status: string;
  phone?: string;
  batteryPct?: number;
  speedKmh?: number;
  caseloadText?: string;
  slaRemaining?: string;
  emergencyAlert?: boolean;
}

const initialMarkers: TacticalMarker[] = [
  {
    id: 'm-off-1',
    type: 'OFFICER',
    name: 'Ramesh Kumar (Care Officer)',
    subtext: 'Hero Splendor Plus • KA-03-EM-8891',
    city: 'Bangalore',
    zone: 'East (Indiranagar / Domlur)',
    topPct: 36,
    leftPct: 42,
    status: 'EN_ROUTE',
    phone: '+91 98450 99888',
    batteryPct: 88,
    speedKmh: 24,
    caseloadText: '26 / 35 Families',
  },
  {
    id: 'm-off-2',
    type: 'OFFICER',
    name: 'Suresh Gowda (Care Officer)',
    subtext: 'Honda Activa 6G • KA-05-JK-1122',
    city: 'Bangalore',
    zone: 'South (Jayanagar 4th Block)',
    topPct: 68,
    leftPct: 54,
    status: 'ON_DUTY',
    phone: '+91 98450 11223',
    batteryPct: 62,
    speedKmh: 0,
    caseloadText: '22 / 35 Families',
  },
  {
    id: 'm-hh-1',
    type: 'HOUSEHOLD_PENDING',
    name: 'Menon Family Residence',
    subtext: 'Gopalakrishnan Menon (79) • Urgent Geriatric Consult',
    city: 'Bangalore',
    zone: 'Domlur Layout 2nd Cross',
    topPct: 45,
    leftPct: 49,
    status: 'PENDING_DISPATCH',
    slaRemaining: '18m 40s',
    emergencyAlert: true,
  },
  {
    id: 'm-hh-2',
    type: 'HOUSEHOLD_ACTIVE',
    name: 'Raghavan Residence',
    subtext: 'Kalyani Raghavan (82) • Bi-Weekly Vitals',
    city: 'Bangalore',
    zone: 'Koramangala 5th Block',
    topPct: 58,
    leftPct: 64,
    status: 'VISIT_IN_PROGRESS',
    slaRemaining: '45m 00s',
    emergencyAlert: false,
  },
  {
    id: 'm-hh-3',
    type: 'HOUSEHOLD_PENDING',
    name: 'Sundaram Residence',
    subtext: 'Padma Sundaram (76) • Rx Refill & Pill Box Dispensing',
    city: 'Bangalore',
    zone: 'Whitefield EPIP Zone',
    topPct: 22,
    leftPct: 80,
    status: 'PENDING_DISPATCH',
    slaRemaining: '52m 10s',
    emergencyAlert: false,
  },
];

export const TacticalGisMap: React.FC<{ city?: string }> = ({ city = 'Bangalore' }) => {
  const [markers] = useState<TacticalMarker[]>(initialMarkers);
  const [selectedMarker, setSelectedMarker] = useState<TacticalMarker | null>(null);

  return (
    <div className="bento-card p-5 space-y-4">
      {/* Map Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 shadow-xs">
            <Navigation size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-slate-900 m-0">
                Tactical GIS Dispatch Radar ({city})
              </h3>
              <span className="flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
                Live GPS Telemetry
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium m-0">
              Active Care Officer vectors, route polylines & pending emergency households
            </p>
          </div>
        </div>

        {/* Legend Indicators */}
        <div className="flex items-center gap-4 text-xs font-bold">
          <span className="flex items-center gap-1.5 text-slate-700">
            <span className="w-3 h-3 rounded-full bg-brand-500 ring-4 ring-brand-100" />
            Care Officers (2 On-Ground)
          </span>
          <span className="flex items-center gap-1.5 text-slate-700">
            <span className="w-3 h-3 rounded-full bg-secondary-500 ring-4 ring-secondary-100" />
            Pending Visits (2)
          </span>
        </div>
      </div>

      {/* Map Interactive Canvas */}
      <div className="relative w-full h-80 rounded-2xl bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200 border border-slate-200 overflow-hidden shadow-inner select-none">
        {/* Vector Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#cbd5e1_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e1_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-35" />

        {/* Road & Transit Lines SVG */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {/* Outer Ring Road */}
          <path d="M 0 100 Q 250 80, 500 200 T 1000 250" fill="none" stroke="#cbd5e1" strokeWidth="6" opacity="0.6" />
          <path d="M 150 0 Q 300 200, 450 350 T 800 500" fill="none" stroke="#cbd5e1" strokeWidth="5" opacity="0.6" />

          {/* Active Dispatched Route Vector Line (Officer Ramesh -> Menon Family) */}
          <line
            x1="42%"
            y1="36%"
            x2="49%"
            y2="45%"
            stroke="#12C395"
            strokeWidth="3"
            strokeDasharray="6 4"
            className="animate-pulse"
          />

          {/* Active Dispatched Route Vector Line (Officer Suresh -> Raghavan Family) */}
          <line
            x1="54%"
            y1="68%"
            x2="64%"
            y2="58%"
            stroke="#12C395"
            strokeWidth="2.5"
            strokeDasharray="6 4"
          />
        </svg>

        {/* Dynamic Interactive Markers */}
        {markers.map((m) => {
          const isOfficer = m.type === 'OFFICER';
          const isUrgent = m.emergencyAlert;

          return (
            <div
              key={m.id}
              onClick={() => setSelectedMarker(m)}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-10"
              style={{ top: `${m.topPct}%`, left: `${m.leftPct}%` }}
            >
              {/* Radar Pulsing Rings */}
              {isUrgent && (
                <span className="absolute -inset-2 rounded-full bg-secondary-400 opacity-75 animate-ping" />
              )}
              {isOfficer && (
                <span className="absolute -inset-1.5 rounded-full bg-brand-400 opacity-40 animate-pulse" />
              )}

              {/* Pin Icon Bubble */}
              <div
                className={`w-9 h-9 rounded-2xl flex items-center justify-center shadow-md transition-all transform group-hover:scale-125 ${
                  isOfficer
                    ? 'bg-brand-500 text-white ring-4 ring-brand-100 shadow-brand-500/20'
                    : isUrgent
                    ? 'bg-secondary-500 text-white ring-4 ring-secondary-100 shadow-secondary-500/30 animate-bounce'
                    : 'bg-slate-800 text-white ring-4 ring-slate-200'
                }`}
              >
                {isOfficer ? <UserCheck size={16} /> : <MapPin size={16} />}
              </div>

              {/* Label Pill */}
              <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-sm border border-slate-200/90 text-slate-900 px-2.5 py-0.5 rounded-lg shadow-sm whitespace-nowrap text-[10px] font-extrabold flex items-center gap-1 group-hover:border-brand-300">
                <span>{m.name.split(' ')[0]}</span>
                {m.slaRemaining && (
                  <span className="font-mono text-secondary-600">({m.slaRemaining})</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Marker Detail Card (Bento Popover) */}
      {selectedMarker && (
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-4 animate-in fade-in duration-150">
          <div className="flex items-center gap-3.5">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white font-extrabold ${
                selectedMarker.type === 'OFFICER' ? 'bg-brand-500' : 'bg-secondary-500'
              }`}
            >
              {selectedMarker.type === 'OFFICER' ? <UserCheck size={18} /> : <MapPin size={18} />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <strong className="text-xs font-black text-slate-900">{selectedMarker.name}</strong>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                  {selectedMarker.zone}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium m-0 mt-0.5">{selectedMarker.subtext}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            {selectedMarker.caseloadText && (
              <div className="text-right">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Caseload Utilization</span>
                <strong className="font-black text-slate-900">{selectedMarker.caseloadText}</strong>
              </div>
            )}
            {selectedMarker.batteryPct && (
              <div className="flex items-center gap-1 font-mono font-bold text-slate-700 bg-white px-2.5 py-1 rounded-xl border border-slate-200">
                <Battery size={13} className="text-emerald-600" />
                <span>{selectedMarker.batteryPct}%</span>
              </div>
            )}
            {selectedMarker.phone && (
              <a
                href={`tel:${selectedMarker.phone}`}
                className="px-3 py-1.5 rounded-xl bg-brand-500 text-white font-extrabold text-xs shadow-xs hover:bg-brand-600 transition-colors flex items-center gap-1.5"
              >
                <Phone size={13} />
                <span>Call Officer</span>
              </a>
            )}
            <button
              onClick={() => setSelectedMarker(null)}
              className="text-xs font-bold text-slate-400 hover:text-slate-600 px-2"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

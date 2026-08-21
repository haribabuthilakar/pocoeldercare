'use client';

import React from 'react';
import { MapPin, Navigation, UserCheck, AlertCircle } from 'lucide-react';

export interface MapMarker {
  id: string;
  type: 'OFFICER' | 'HOUSEHOLD_PENDING' | 'HOUSEHOLD_ACTIVE';
  name: string;
  zone: string;
  latPct: number;
  lngPct: number;
  status: string;
  caseloadOrTime?: string;
}

const defaultMarkers: MapMarker[] = [
  { id: 'm1', type: 'OFFICER', name: 'Ramesh Kumar (Officer)', zone: 'Indiranagar', latPct: 35, lngPct: 40, status: 'EN_ROUTE', caseloadOrTime: '26/35 Families' },
  { id: 'm2', type: 'OFFICER', name: 'Suresh Gowda (Officer)', zone: 'Jayanagar', latPct: 65, lngPct: 55, status: 'ON_DUTY', caseloadOrTime: '22/35 Families' },
  { id: 'm3', type: 'HOUSEHOLD_PENDING', name: 'Menon Residence', zone: 'Domlur', latPct: 42, lngPct: 46, status: 'URGENT_MED', caseloadOrTime: 'SLA: 18m' },
  { id: 'm4', type: 'HOUSEHOLD_ACTIVE', name: 'Raghavan Residence', zone: 'Koramangala', latPct: 58, lngPct: 62, status: 'VISIT_IN_PROGRESS', caseloadOrTime: 'Elapsed: 2m 45s' },
  { id: 'm5', type: 'HOUSEHOLD_PENDING', name: 'Sundaram Residence', zone: 'Whitefield', latPct: 25, lngPct: 78, status: 'DAILY_ASSIST', caseloadOrTime: 'SLA: 42m' },
];

export const CityMapVisualizer: React.FC<{ city?: string }> = ({ city = 'Bangalore' }) => {
  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-sm space-y-4">
      {/* Map Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600">
            <Navigation size={16} />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 m-0">Live {city} Geo-Dispatch Grid</h3>
            <p className="text-[11px] text-slate-500 m-0 font-medium">Real-time GPS telemetry & household dispatch pins</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-bold">
          <span className="flex items-center gap-1.5 text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-500 ring-4 ring-brand-100 animate-pulse" />
            Care Officers (2 Active)
          </span>
          <span className="flex items-center gap-1.5 text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-secondary-500 ring-4 ring-secondary-100" />
            Pending Visits (2)
          </span>
        </div>
      </div>

      {/* Map Surface Canvas */}
      <div className="relative w-full h-64 rounded-2xl bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 border border-slate-200 overflow-hidden shadow-inner">
        {/* Subtle Map Grid lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#cbd5e1_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e1_1px,transparent_1px)] bg-[size:2.5rem_2.5rem] opacity-30" />

        {/* Route Polyline Simulation */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-brand-500/70" strokeWidth="2.5" strokeDasharray="6 4">
          <line x1="40%" y1="35%" x2="46%" y2="42%" />
          <line x1="55%" y1="65%" x2="62%" y2="58%" />
        </svg>

        {/* Dynamic Map Pins */}
        {defaultMarkers.map((marker) => {
          const isOfficer = marker.type === 'OFFICER';
          const isUrgent = marker.status === 'URGENT_MED';

          return (
            <div
              key={marker.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
              style={{ top: `${marker.latPct}%`, left: `${marker.lngPct}%` }}
            >
              {/* Pin Icon */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-transform transform group-hover:scale-125 ${
                  isOfficer
                    ? 'bg-brand-500 text-white ring-4 ring-brand-100'
                    : isUrgent
                    ? 'bg-secondary-500 text-white ring-4 ring-secondary-100 animate-bounce'
                    : 'bg-slate-800 text-white ring-4 ring-slate-200'
                }`}
              >
                {isOfficer ? <UserCheck size={15} /> : <MapPin size={15} />}
              </div>

              {/* Tooltip on Hover */}
              <div className="hidden group-hover:block absolute bottom-9 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[11px] font-bold py-1.5 px-3 rounded-xl shadow-xl whitespace-nowrap z-30 pointer-events-none">
                <div className="font-extrabold">{marker.name}</div>
                <div className="text-[10px] text-slate-300 font-medium">{marker.zone} • {marker.caseloadOrTime}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

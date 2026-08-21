const fs = require('fs');
const path = require('path');

function writeFile(relPath, content) {
  const fullPath = path.resolve(relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
  console.log('Written:', relPath);
}

// -------------------------------------------------------------
// 1. TACTICAL GIS MAP WITH INTERACTIVE RADAR MARKERS
// -------------------------------------------------------------

writeFile('apps/ops-crm/src/components/dashboard/tactical-gis-map.tsx', `'use client';

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
              style={{ top: \`\${m.topPct}%\`, left: \`\${m.leftPct}%\` }}
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
                className={\`w-9 h-9 rounded-2xl flex items-center justify-center shadow-md transition-all transform group-hover:scale-125 \${
                  isOfficer
                    ? 'bg-brand-500 text-white ring-4 ring-brand-100 shadow-brand-500/20'
                    : isUrgent
                    ? 'bg-secondary-500 text-white ring-4 ring-secondary-100 shadow-secondary-500/30 animate-bounce'
                    : 'bg-slate-800 text-white ring-4 ring-slate-200'
                }\`}
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
              className={\`w-10 h-10 rounded-2xl flex items-center justify-center text-white font-extrabold \${
                selectedMarker.type === 'OFFICER' ? 'bg-brand-500' : 'bg-secondary-500'
              }\`}
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
                href={\`tel:\${selectedMarker.phone}\`}
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
`);

// -------------------------------------------------------------
// 2. HIGH-DENSITY LIVE REQUEST QUEUE WITH FILTER TABS & SEARCH
// -------------------------------------------------------------

writeFile('apps/ops-crm/src/components/dashboard/live-request-queue.tsx', `'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Clock,
  Search,
  UserCheck,
  ChevronRight,
  Activity,
  AlertTriangle,
  Filter,
  CheckCircle2,
  Stethoscope,
  PhoneCall,
  Calendar
} from 'lucide-react';
import { AutoAssignModal } from '../assignment/auto-assign-modal';
import { ServiceTicket } from './live-request-table';

const initialTickets: ServiceTicket[] = [
  {
    id: 'req-001',
    householdId: 'hh-blr-001',
    householdName: 'Menon Family',
    seniorName: 'Gopalakrishnan Menon (79)',
    serviceCategory: 'DOCTOR_VISIT',
    serviceName: 'MED-03: Urgent Geriatric Doctor Home Visit',
    city: 'Bangalore',
    zone: 'East (Indiranagar / Domlur)',
    priority: 'URGENT',
    slaSecondsRemaining: 18 * 60 + 40,
    assignedOfficer: null,
    status: 'PENDING_DISPATCH',
    createdAt: '10 mins ago',
  },
  {
    id: 'req-002',
    householdId: 'hh-blr-002',
    householdName: 'Raghavan Family',
    seniorName: 'Kalyani Raghavan (82)',
    serviceCategory: 'CARE_OFFICER_VISIT',
    serviceName: 'CO-01: Bi-Weekly Check-in & Vitals',
    city: 'Bangalore',
    zone: 'South (Jayanagar 4th Block)',
    priority: 'STANDARD',
    slaSecondsRemaining: 45 * 60,
    assignedOfficer: 'Suresh Gowda',
    status: 'OFFICER_EN_ROUTE',
    createdAt: '25 mins ago',
  },
  {
    id: 'req-003',
    householdId: 'hh-chn-001',
    householdName: 'Sundaram Residence',
    seniorName: 'Padma Sundaram (76)',
    serviceCategory: 'DAILY_ASSIST',
    serviceName: 'DA-04: Prescription Refill & Pill Box Dispensing',
    city: 'Chennai',
    zone: 'Adyar / Besant Nagar',
    priority: 'STANDARD',
    slaSecondsRemaining: 90 * 60,
    assignedOfficer: 'Meenakshi Iyer',
    status: 'IN_PROGRESS',
    createdAt: '40 mins ago',
  },
  {
    id: 'req-004',
    householdId: 'hh-hyd-001',
    householdName: 'Reddy Household',
    seniorName: 'V. K. Reddy (84)',
    serviceCategory: 'TELECONSULT',
    serviceName: 'MED-04: Cardiologist Specialist Teleconsultation',
    city: 'Hyderabad',
    zone: 'Banjara Hills Road 12',
    priority: 'URGENT',
    slaSecondsRemaining: 12 * 60 + 15,
    assignedOfficer: null,
    status: 'PENDING_DISPATCH',
    createdAt: '5 mins ago',
  },
];

export const LiveRequestQueue: React.FC = () => {
  const [tickets, setTickets] = useState<ServiceTicket[]>(initialTickets);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'CRITICAL' | 'PENDING' | 'DISPATCHED' | 'IN_PROGRESS'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<ServiceTicket | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  // Live SLA Timer tick
  useEffect(() => {
    const timer = setInterval(() => {
      setTickets((prev) =>
        prev.map((t) => ({
          ...t,
          slaSecondsRemaining: Math.max(0, t.slaSecondsRemaining - 1),
        }))
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatSla = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return \`\${mins}m \${secs < 10 ? '0' : ''}\${secs}s\`;
  };

  const handleOpenAssign = (t: ServiceTicket) => {
    setSelectedTicket(t);
    setIsAssignModalOpen(true);
  };

  const handleAssignComplete = (ticketId: string, officerName: string) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? { ...t, assignedOfficer: officerName, status: 'OFFICER_EN_ROUTE' }
          : t
      )
    );
    setIsAssignModalOpen(false);
  };

  // Filtering
  const filteredTickets = tickets.filter((t) => {
    if (statusFilter === 'CRITICAL' && t.priority !== 'URGENT' && t.priority !== 'CRITICAL') return false;
    if (statusFilter === 'PENDING' && t.status !== 'PENDING_DISPATCH') return false;
    if (statusFilter === 'DISPATCHED' && t.status !== 'OFFICER_EN_ROUTE') return false;
    if (statusFilter === 'IN_PROGRESS' && t.status !== 'IN_PROGRESS') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.householdName.toLowerCase().includes(q) ||
        t.seniorName.toLowerCase().includes(q) ||
        t.serviceName.toLowerCase().includes(q) ||
        t.city.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="bento-card overflow-hidden space-y-4">
      {/* Top Header & Search Bar */}
      <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-secondary-50 flex items-center justify-center text-secondary-500 font-bold shadow-xs">
            <Activity size={20} />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 m-0">Live Operational Request Queue</h3>
            <p className="text-xs text-slate-500 font-medium m-0">
              Multi-city active dispatch pipeline with sub-second SLA countdowns
            </p>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Filter queue by name, city, service..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs font-medium pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50/70 text-slate-800 outline-none focus:border-brand-400 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-5 flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'ALL', label: 'All Requests', count: tickets.length },
          { id: 'CRITICAL', label: '🚨 Urgent / Critical', count: tickets.filter((t) => t.priority === 'URGENT' || t.priority === 'CRITICAL').length },
          { id: 'PENDING', label: 'Pending Dispatch', count: tickets.filter((t) => t.status === 'PENDING_DISPATCH').length },
          { id: 'DISPATCHED', label: 'Officer En-Route', count: tickets.filter((t) => t.status === 'OFFICER_EN_ROUTE').length },
          { id: 'IN_PROGRESS', label: 'In Progress', count: tickets.filter((t) => t.status === 'IN_PROGRESS').length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id as any)}
            className={\`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap \${
              statusFilter === tab.id
                ? 'bg-slate-900 text-white shadow-xs font-extrabold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 border border-slate-200/60'
            }\`}
          >
            <span>{tab.label}</span>
            <span className={\`text-[10px] font-mono px-1.5 py-0.2 rounded \${
              statusFilter === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
            }\`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Tactical High-Density Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-y border-slate-200/80 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              <th className="py-3 px-5">SLA Countdown</th>
              <th className="py-3 px-5">Household & Senior</th>
              <th className="py-3 px-5">Requested Service Protocol</th>
              <th className="py-3 px-5">Cluster</th>
              <th className="py-3 px-5">Assigned Officer</th>
              <th className="py-3 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {filteredTickets.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-xs text-slate-400 font-medium">
                  No service tickets match the selected filter.
                </td>
              </tr>
            ) : (
              filteredTickets.map((ticket) => {
                const isBreached = ticket.slaSecondsRemaining === 0;
                const isUrgent = ticket.priority === 'URGENT' || ticket.priority === 'CRITICAL';

                return (
                  <tr key={ticket.id} className="hover:bg-slate-50/80 transition-colors group">
                    {/* SLA Timer */}
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <span
                        className={\`px-2.5 py-1 rounded-xl text-[11px] font-black font-mono inline-flex items-center gap-1.5 tabular-nums \${
                          isBreached
                            ? 'bg-secondary-100 text-secondary-700 animate-pulse'
                            : isUrgent
                            ? 'bg-secondary-50 text-secondary-600 border border-secondary-200'
                            : 'bg-brand-50 text-brand-700 border border-brand-200'
                        }\`}
                      >
                        <Clock size={12} />
                        <span>{isBreached ? 'SLA BREACHED' : formatSla(ticket.slaSecondsRemaining)}</span>
                      </span>
                    </td>

                    {/* Household & Senior */}
                    <td className="py-3.5 px-5">
                      <Link
                        href={\`/households/\${ticket.householdId}\`}
                        className="font-extrabold text-slate-900 hover:text-brand-600 transition-colors block"
                      >
                        {ticket.householdName}
                      </Link>
                      <span className="text-[11px] text-slate-500 font-medium">{ticket.seniorName}</span>
                    </td>

                    {/* Service Protocol */}
                    <td className="py-3.5 px-5">
                      <span className="font-bold text-slate-800 block">{ticket.serviceName}</span>
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide">
                        {ticket.serviceCategory} • {ticket.createdAt}
                      </span>
                    </td>

                    {/* City & Zone */}
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <span className="font-extrabold text-slate-900 block">{ticket.city}</span>
                      <span className="text-[11px] text-slate-500">{ticket.zone}</span>
                    </td>

                    {/* Officer Dispatch Status */}
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      {ticket.assignedOfficer ? (
                        <div className="flex items-center gap-1.5 text-brand-700 font-extrabold">
                          <UserCheck size={14} className="text-brand-600" />
                          <span>{ticket.assignedOfficer}</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleOpenAssign(ticket)}
                          className="px-3 py-1.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-[11px] shadow-xs glow-primary transition-all flex items-center gap-1.5"
                        >
                          <UserCheck size={13} />
                          <span>AI Auto-Dispatch</span>
                        </button>
                      )}
                    </td>

                    {/* Quick 360 Action */}
                    <td className="py-3.5 px-5 text-right whitespace-nowrap">
                      <Link
                        href={\`/households/\${ticket.householdId}\`}
                        className="p-2 rounded-xl text-slate-400 hover:text-brand-600 hover:bg-slate-100 transition-all inline-flex items-center"
                        title="Open Household 360 CRM"
                      >
                        <ChevronRight size={18} />
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Auto-Assignment Modal */}
      {isAssignModalOpen && selectedTicket && (
        <AutoAssignModal
          ticket={selectedTicket}
          onClose={() => setIsAssignModalOpen(false)}
          onAssign={(officerName) => handleAssignComplete(selectedTicket.id, officerName)}
        />
      )}
    </div>
  );
};
`);

// -------------------------------------------------------------
// 3. LIVE COMMAND DASHBOARD (apps/ops-crm/src/app/page.tsx)
// -------------------------------------------------------------

writeFile('apps/ops-crm/src/app/page.tsx', `'use client';

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
                <div className={\`w-9 h-9 rounded-2xl \${card.bg} flex items-center justify-center \${card.color}\`}>
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
`);

console.log('Finished Option 1 Part 2: Tactical GIS Map, Live Request Queue, and Bento Dashboard Page');


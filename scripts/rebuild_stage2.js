const fs = require('fs');
const path = require('path');

function writeFile(relPath, content) {
  const fullPath = path.resolve(relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
  console.log('Written:', relPath);
}

// -------------------------------------------------------------
// 1. CITY MAP VISUALIZER
// -------------------------------------------------------------

writeFile('apps/ops-crm/src/components/dashboard/city-map-visualizer.tsx', `'use client';

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
              style={{ top: \`\${marker.latPct}%\`, left: \`\${marker.lngPct}%\` }}
            >
              {/* Pin Icon */}
              <div
                className={\`w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-transform transform group-hover:scale-125 \${
                  isOfficer
                    ? 'bg-brand-500 text-white ring-4 ring-brand-100'
                    : isUrgent
                    ? 'bg-secondary-500 text-white ring-4 ring-secondary-100 animate-bounce'
                    : 'bg-slate-800 text-white ring-4 ring-slate-200'
                }\`}
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
`);

// -------------------------------------------------------------
// 2. LIVE REQUEST TABLE
// -------------------------------------------------------------

writeFile('apps/ops-crm/src/components/dashboard/live-request-table.tsx', `'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Clock, AlertTriangle, ShieldCheck, UserCheck, PhoneCall, ChevronRight, Activity } from 'lucide-react';
import { AutoAssignModal } from '../assignment/auto-assign-modal';

export interface ServiceTicket {
  id: string;
  householdId: string;
  householdName: string;
  seniorName: string;
  serviceCategory: 'EMERGENCY' | 'DOCTOR_VISIT' | 'CARE_OFFICER_VISIT' | 'DAILY_ASSIST' | 'TELECONSULT';
  serviceName: string;
  city: string;
  zone: string;
  priority: 'CRITICAL' | 'URGENT' | 'STANDARD';
  slaSecondsRemaining: number;
  assignedOfficer: string | null;
  status: 'PENDING_DISPATCH' | 'OFFICER_EN_ROUTE' | 'IN_PROGRESS' | 'RESOLVED';
  createdAt: string;
}

const mockTickets: ServiceTicket[] = [
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
    serviceName: 'CO-01: Scheduled Bi-Weekly Senior Check-in & Vitals',
    city: 'Bangalore',
    zone: 'South (Jayanagar)',
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
    serviceName: 'DA-04: Prescription Medicine Refill & Delivery',
    city: 'Chennai',
    zone: 'Adyar',
    priority: 'STANDARD',
    slaSecondsRemaining: 90 * 60,
    assignedOfficer: 'Meenakshi Iyer',
    status: 'IN_PROGRESS',
    createdAt: '40 mins ago',
  },
];

export const LiveRequestTable: React.FC = () => {
  const [tickets, setTickets] = useState<ServiceTicket[]>(mockTickets);
  const [selectedTicket, setSelectedTicket] = useState<ServiceTicket | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  // SLA countdown timer
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

  const handleOpenAssign = (ticket: ServiceTicket) => {
    setSelectedTicket(ticket);
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

  return (
    <div className="space-y-4">
      {/* Table Container */}
      <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600">
              <Activity size={20} />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 m-0">Live Operational Queue & SLA Stream</h3>
              <p className="text-xs text-slate-500 m-0 font-medium">Real-time service tickets across operational metro clusters</p>
            </div>
          </div>
          <span className="text-xs font-black px-3 py-1 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
            {tickets.length} Active Tickets
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-5">Priority & SLA</th>
                <th className="py-3.5 px-5">Household & Senior</th>
                <th className="py-3.5 px-5">Requested Service</th>
                <th className="py-3.5 px-5">Location</th>
                <th className="py-3.5 px-5">Officer Dispatch</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {tickets.map((ticket) => {
                const isBreached = ticket.slaSecondsRemaining === 0;
                const isUrgent = ticket.priority === 'URGENT' || ticket.priority === 'CRITICAL';

                return (
                  <tr key={ticket.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* SLA Column */}
                    <td className="py-4 px-5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span
                          className={\`px-2.5 py-1 rounded-xl text-[11px] font-black flex items-center gap-1.5 \${
                            isBreached
                              ? 'bg-secondary-100 text-secondary-700 animate-pulse-slow'
                              : isUrgent
                              ? 'bg-secondary-50 text-secondary-600 border border-secondary-200'
                              : 'bg-brand-50 text-brand-700 border border-brand-200'
                          }\`}
                        >
                          <Clock size={12} />
                          <span>{isBreached ? 'SLA BREACHED' : formatSla(ticket.slaSecondsRemaining)}</span>
                        </span>
                      </div>
                    </td>

                    {/* Household Column */}
                    <td className="py-4 px-5">
                      <Link
                        href={\`/households/\${ticket.householdId}\`}
                        className="font-extrabold text-slate-900 hover:text-brand-600 transition-colors block"
                      >
                        {ticket.householdName}
                      </Link>
                      <span className="text-[11px] text-slate-500 font-medium">{ticket.seniorName}</span>
                    </td>

                    {/* Service Column */}
                    <td className="py-4 px-5">
                      <span className="font-bold text-slate-800 block">{ticket.serviceName}</span>
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide">
                        {ticket.serviceCategory} • {ticket.createdAt}
                      </span>
                    </td>

                    {/* City / Zone */}
                    <td className="py-4 px-5 whitespace-nowrap">
                      <span className="font-extrabold text-slate-900 block">{ticket.city}</span>
                      <span className="text-[11px] text-slate-500">{ticket.zone}</span>
                    </td>

                    {/* Officer Status */}
                    <td className="py-4 px-5 whitespace-nowrap">
                      {ticket.assignedOfficer ? (
                        <div className="flex items-center gap-1.5 text-brand-700 font-extrabold">
                          <UserCheck size={14} className="text-brand-600" />
                          <span>{ticket.assignedOfficer}</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleOpenAssign(ticket)}
                          className="px-3 py-1.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-[11px] shadow-sm glow-primary transition-all flex items-center gap-1.5"
                        >
                          <UserCheck size={13} />
                          <span>Auto-Assign</span>
                        </button>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-5 text-right whitespace-nowrap">
                      <Link
                        href={\`/households/\${ticket.householdId}\`}
                        className="p-2 rounded-xl text-slate-400 hover:text-brand-600 hover:bg-slate-100 transition-all inline-flex items-center"
                        title="Open 360 CRM"
                      >
                        <ChevronRight size={18} />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
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
// 3. AUTO-ASSIGN MODAL WITH OVERRIDE AUDIT LOG (OPS-07)
// -------------------------------------------------------------

writeFile('apps/ops-crm/src/components/assignment/auto-assign-modal.tsx', `'use client';

import React, { useState } from 'react';
import { X, Sparkles, Check, AlertTriangle, ShieldCheck, MapPin, User, Star } from 'lucide-react';
import { ServiceTicket } from '../dashboard/live-request-table';

interface CandidateOfficer {
  id: string;
  name: string;
  phone: string;
  proximityKm: number;
  transitTimeMins: number;
  currentCaseload: number;
  maxCaseload: number;
  languages: string[];
  rating: number;
  isAiTopMatch: boolean;
  score: number;
}

const mockCandidates: CandidateOfficer[] = [
  {
    id: 'off-001',
    name: 'Ramesh Kumar',
    phone: '+91 98450 99888',
    proximityKm: 2.1,
    transitTimeMins: 8,
    currentCaseload: 26,
    maxCaseload: 35,
    languages: ['Kannada', 'English', 'Tamil'],
    rating: 4.9,
    isAiTopMatch: true,
    score: 94,
  },
  {
    id: 'off-002',
    name: 'Suresh Gowda',
    phone: '+91 98450 11223',
    proximityKm: 4.8,
    transitTimeMins: 16,
    currentCaseload: 22,
    maxCaseload: 35,
    languages: ['Kannada', 'Telugu'],
    rating: 4.7,
    isAiTopMatch: false,
    score: 82,
  },
  {
    id: 'off-003',
    name: 'Anand Varma',
    phone: '+91 98450 33445',
    proximityKm: 7.2,
    transitTimeMins: 24,
    currentCaseload: 31,
    maxCaseload: 35,
    languages: ['Malayalam', 'English', 'Tamil'],
    rating: 4.85,
    isAiTopMatch: false,
    score: 68,
  },
];

export const AutoAssignModal: React.FC<{
  ticket: ServiceTicket;
  onClose: () => void;
  onAssign: (officerName: string) => void;
}> = ({ ticket, onClose, onAssign }) => {
  const [selectedOfficerId, setSelectedOfficerId] = useState<string>(mockCandidates[0].id);
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);
  const [overrideReason, setOverrideReason] = useState('FAMILY_PREFERENCE');
  const [overrideNotes, setOverrideNotes] = useState('');

  const topMatch = mockCandidates.find((c) => c.isAiTopMatch)!;
  const isOverriding = selectedOfficerId !== topMatch.id;

  const handleConfirmAssignment = () => {
    if (isOverriding && !isOverrideModalOpen) {
      setIsOverrideModalOpen(true);
      return;
    }

    const officer = mockCandidates.find((c) => c.id === selectedOfficerId);
    if (officer) {
      onAssign(officer.name);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200/90 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 text-slate-800">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-brand-50 text-brand-600">
                <Sparkles size={16} />
              </span>
              <h2 className="text-lg font-black text-slate-900 m-0">Intelligent Field Auto-Assignment</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1 mb-0 font-medium">
              Multi-factor match for <strong className="text-slate-700">{ticket.householdName}</strong> ({ticket.zone})
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 text-slate-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Candidate List */}
        <div className="space-y-2.5">
          {mockCandidates.map((candidate) => {
            const isSelected = selectedOfficerId === candidate.id;

            return (
              <div
                key={candidate.id}
                onClick={() => setSelectedOfficerId(candidate.id)}
                className={\`p-4 rounded-2xl border transition-all cursor-pointer \${
                  isSelected
                    ? 'bg-brand-50/70 border-brand-400 ring-2 ring-brand-200'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }\`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white font-extrabold text-sm shadow-sm">
                      {candidate.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-sm text-slate-900">{candidate.name}</strong>
                        {candidate.isAiTopMatch && (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-brand-500 text-white shadow-sm glow-primary">
                            AI TOP MATCH (94%)
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 font-medium m-0 flex items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-1"><MapPin size={12} className="text-brand-600" /> {candidate.proximityKm} km ({candidate.transitTimeMins} mins)</span>
                        <span>•</span>
                        <span>Load: {candidate.currentCaseload}/{candidate.maxCaseload} Families</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-black text-slate-900 flex items-center gap-1 justify-end">
                      <Star size={12} className="text-amber-500 fill-amber-500" />
                      {candidate.rating}
                    </span>
                    <span className="text-[11px] text-slate-400 font-bold block mt-0.5">{candidate.score} pts</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Override Modal Overlay if Manual Selection */}
        {isOverrideModalOpen && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-3">
            <div className="flex items-center gap-2 text-amber-800 font-extrabold text-xs">
              <AlertTriangle size={15} />
              <span>Mandatory Override Audit Prompt (OPS-07)</span>
            </div>
            <p className="text-[11px] text-amber-700 m-0">
              You are manually overriding the AI recommended candidate. Please specify a justification:
            </p>

            <select
              value={overrideReason}
              onChange={(e) => setOverrideReason(e.target.value)}
              className="w-full text-xs font-bold p-2.5 rounded-xl border border-amber-300 bg-white text-slate-800 outline-none"
            >
              <option value="FAMILY_PREFERENCE">Senior / Family specifically requested this officer</option>
              <option value="TRAFFIC_PROXIMITY_ANOMALY">Local road closure or real-time transit advantage</option>
              <option value="SPECIALIZED_CLINICAL_SKILL">Officer has specialized clinical / language rapport</option>
              <option value="OFFICER_EMERGENCY_REASSIGNMENT">Emergency re-route for load balancing</option>
            </select>

            <textarea
              placeholder="Enter mandatory audit notes (min 10 characters)..."
              value={overrideNotes}
              onChange={(e) => setOverrideNotes(e.target.value)}
              rows={2}
              className="w-full text-xs p-2.5 rounded-xl border border-amber-300 bg-white text-slate-800 outline-none"
            />
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmAssignment}
            disabled={isOverrideModalOpen && overrideNotes.trim().length < 10}
            className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-extrabold text-xs shadow-sm glow-primary transition-all flex items-center gap-2"
          >
            <Check size={15} />
            <span>{isOverriding ? 'Confirm Override & Dispatch' : '1-Click Auto-Dispatch'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
`);

// -------------------------------------------------------------
// 4. LIVE COMMAND DASHBOARD (apps/ops-crm/src/app/page.tsx)
// -------------------------------------------------------------

writeFile('apps/ops-crm/src/app/page.tsx', `'use client';

import React from 'react';
import { LiveRequestTable } from '../components/dashboard/live-request-table';
import { CityMapVisualizer } from '../components/dashboard/city-map-visualizer';
import { Activity, Users, ShieldCheck, AlertOctagon, TrendingUp } from 'lucide-react';

export default function OpsDashboardPage() {
  const metricCards = [
    { label: 'Active Requests', val: '8', change: '2 Pending Dispatch', icon: Activity, color: 'text-brand-600', bg: 'bg-brand-50' },
    { label: 'On-Ground Officers', val: '18 / 20', change: '90% Shift Active', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: '35-Cap Caseload Load', val: '74.2%', change: 'Normal Capacity', icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'SLA Breach Warnings', val: '0', change: '100% On-Time Today', icon: AlertOctagon, color: 'text-secondary-600', bg: 'bg-secondary-50' },
  ];

  return (
    <div className="space-y-6">
      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">{card.label}</span>
                <div className={\`w-9 h-9 rounded-2xl \${card.bg} flex items-center justify-center \${card.color}\`}>
                  <Icon size={18} />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 tracking-tight">{card.val}</div>
              <div className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                <TrendingUp size={12} className="text-brand-600" />
                <span>{card.change}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dual View Layout: City Map & Live Queue */}
      <div className="space-y-6">
        <CityMapVisualizer city="Bangalore" />
        <LiveRequestTable />
      </div>
    </div>
  );
}
`);

console.log('Finished Stage 2: City Map, Live Request Table, Auto-Assign Modal, Live Command Dashboard Page');


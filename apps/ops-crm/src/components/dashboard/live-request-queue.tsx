'use client';

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
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
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
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              statusFilter === tab.id
                ? 'bg-slate-900 text-white shadow-xs font-extrabold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 border border-slate-200/60'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
              statusFilter === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
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
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-black font-mono inline-flex items-center gap-1.5 tabular-nums ${
                          isBreached
                            ? 'bg-secondary-100 text-secondary-700 animate-pulse'
                            : isUrgent
                            ? 'bg-secondary-50 text-secondary-600 border border-secondary-200'
                            : 'bg-brand-50 text-brand-700 border border-brand-200'
                        }`}
                      >
                        <Clock size={12} />
                        <span>{isBreached ? 'SLA BREACHED' : formatSla(ticket.slaSecondsRemaining)}</span>
                      </span>
                    </td>

                    {/* Household & Senior */}
                    <td className="py-3.5 px-5">
                      <Link
                        href={`/households/${ticket.householdId}`}
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
                        href={`/households/${ticket.householdId}`}
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

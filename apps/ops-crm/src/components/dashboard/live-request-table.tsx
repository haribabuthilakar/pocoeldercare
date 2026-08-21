'use client';

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
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
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
                          className={`px-2.5 py-1 rounded-xl text-[11px] font-black flex items-center gap-1.5 ${
                            isBreached
                              ? 'bg-secondary-100 text-secondary-700 animate-pulse-slow'
                              : isUrgent
                              ? 'bg-secondary-50 text-secondary-600 border border-secondary-200'
                              : 'bg-brand-50 text-brand-700 border border-brand-200'
                          }`}
                        >
                          <Clock size={12} />
                          <span>{isBreached ? 'SLA BREACHED' : formatSla(ticket.slaSecondsRemaining)}</span>
                        </span>
                      </div>
                    </td>

                    {/* Household Column */}
                    <td className="py-4 px-5">
                      <Link
                        href={`/households/${ticket.householdId}`}
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
                        href={`/households/${ticket.householdId}`}
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

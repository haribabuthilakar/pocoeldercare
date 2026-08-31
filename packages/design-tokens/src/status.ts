import { SlaStatus, TicketStatus, TriageStatus, TicketPriority } from '@poco/constants';

export interface StatusToken {
  label: string;
  bg: string;
  text: string;
  border: string;
  dotColor: string;
  animatePulse?: boolean;
}

/**
 * Visual styling maps for SLA statuses per D-87.
 */
export const slaStatusTokens: Record<SlaStatus, StatusToken> = {
  [SlaStatus.NORMAL]: {
    label: 'Normal',
    bg: 'bg-emerald-50 text-emerald-700',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dotColor: 'bg-emerald-500'
  },
  [SlaStatus.AT_RISK]: {
    label: 'At Risk',
    bg: 'bg-amber-50 text-amber-700',
    text: 'text-amber-700',
    border: 'border-amber-200',
    dotColor: 'bg-amber-500',
    animatePulse: true
  },
  [SlaStatus.BREACHED]: {
    label: 'Breached',
    bg: 'bg-rose-50 text-rose-700',
    text: 'text-rose-700',
    border: 'border-rose-200',
    dotColor: 'bg-rose-500',
    animatePulse: true
  }
};

/**
 * Visual styling maps for Ticket statuses.
 */
export const ticketStatusTokens: Record<TicketStatus, StatusToken> = {
  [TicketStatus.OPEN]: {
    label: 'Open',
    bg: 'bg-blue-50 text-blue-700',
    text: 'text-blue-700',
    border: 'border-blue-200',
    dotColor: 'bg-blue-500'
  },
  [TicketStatus.ASSIGNED]: {
    label: 'Assigned',
    bg: 'bg-indigo-50 text-indigo-700',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
    dotColor: 'bg-indigo-500'
  },
  [TicketStatus.IN_PROGRESS]: {
    label: 'In Progress',
    bg: 'bg-emerald-50 text-emerald-700',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dotColor: 'bg-emerald-500'
  },
  [TicketStatus.WAITING_FAMILY_INPUT]: {
    label: 'Waiting Family',
    bg: 'bg-purple-50 text-purple-700',
    text: 'text-purple-700',
    border: 'border-purple-200',
    dotColor: 'bg-purple-500'
  },
  [TicketStatus.WAITING_OPS_UPDATE]: {
    label: 'Waiting Ops',
    bg: 'bg-amber-50 text-amber-700',
    text: 'text-amber-700',
    border: 'border-amber-200',
    dotColor: 'bg-amber-500',
    animatePulse: true
  },
  [TicketStatus.RESOLVED]: {
    label: 'Resolved',
    bg: 'bg-teal-50 text-teal-700',
    text: 'text-teal-700',
    border: 'border-teal-200',
    dotColor: 'bg-teal-500'
  },
  [TicketStatus.CLOSED]: {
    label: 'Closed',
    bg: 'bg-slate-100 text-slate-700',
    text: 'text-slate-700',
    border: 'border-slate-200',
    dotColor: 'bg-slate-400'
  },
  [TicketStatus.CANCELLED]: {
    label: 'Cancelled',
    bg: 'bg-slate-100 text-slate-500',
    text: 'text-slate-500',
    border: 'border-slate-200',
    dotColor: 'bg-slate-300'
  }
};

/**
 * Visual styling maps for Ticket priorities.
 */
export const ticketPriorityTokens: Record<TicketPriority, StatusToken> = {
  [TicketPriority.EMERGENCY]: {
    label: 'Emergency',
    bg: 'bg-rose-100 text-rose-800 font-bold',
    text: 'text-rose-800',
    border: 'border-rose-300',
    dotColor: 'bg-rose-600',
    animatePulse: true
  },
  [TicketPriority.URGENT]: {
    label: 'Urgent',
    bg: 'bg-amber-50 text-amber-800',
    text: 'text-amber-800',
    border: 'border-amber-200',
    dotColor: 'bg-amber-500'
  },
  [TicketPriority.ROUTINE]: {
    label: 'Routine',
    bg: 'bg-slate-50 text-slate-700',
    text: 'text-slate-700',
    border: 'border-slate-200',
    dotColor: 'bg-slate-400'
  }
};

/**
 * Visual styling maps for AI Triage review status.
 */
export const triageStatusTokens: Record<TriageStatus, StatusToken> = {
  [TriageStatus.PENDING_TRIAGE]: {
    label: 'Pending Triage',
    bg: 'bg-purple-50 text-purple-700',
    text: 'text-purple-700',
    border: 'border-purple-200',
    dotColor: 'bg-purple-500',
    animatePulse: true
  },
  [TriageStatus.CONFIRMED]: {
    label: 'Confirmed',
    bg: 'bg-emerald-50 text-emerald-700',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dotColor: 'bg-emerald-500'
  },
  [TriageStatus.DISMISSED]: {
    label: 'Dismissed',
    bg: 'bg-slate-100 text-slate-500',
    text: 'text-slate-500',
    border: 'border-slate-200',
    dotColor: 'bg-slate-400'
  },
  [TriageStatus.AUTO_CONVERTED]: {
    label: 'Auto Converted',
    bg: 'bg-blue-50 text-blue-700',
    text: 'text-blue-700',
    border: 'border-blue-200',
    dotColor: 'bg-blue-500'
  }
};

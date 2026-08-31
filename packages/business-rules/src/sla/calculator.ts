import { TicketPriority, DEFAULT_SLA_CONFIG } from '@poco/constants';
import { addMinutes } from 'date-fns';

export interface SlaDeadlines {
  responseDueAt: Date;
  deliveryDueAt: Date;
}

/**
 * Pure function calculating SLA response and resolution deadlines from ticket creation time.
 */
export function calculateSlaDeadlines(
  createdAt: Date,
  priority: TicketPriority = TicketPriority.ROUTINE
): SlaDeadlines {
  const config = DEFAULT_SLA_CONFIG[priority] ?? DEFAULT_SLA_CONFIG[TicketPriority.ROUTINE];

  return {
    responseDueAt: addMinutes(createdAt, config.responseMinutes),
    deliveryDueAt: addMinutes(createdAt, config.resolutionMinutes)
  };
}

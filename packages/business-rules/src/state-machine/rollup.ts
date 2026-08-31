import { ServiceRequestStatus, TicketStatus } from '@poco/constants';

/**
 * Pure function to calculate parent Ticket status based on child Service Request states per D-53.
 */
export function calculateTicketRollupStatus(
  childStatuses: ServiceRequestStatus[],
  fallbackStatus: TicketStatus = TicketStatus.OPEN
): TicketStatus {
  if (childStatuses.length === 0) {
    return fallbackStatus;
  }

  // 1. If any child has an exception, parent ticket needs ops attention
  if (childStatuses.some((status) => status === ServiceRequestStatus.EXCEPTION)) {
    return TicketStatus.WAITING_OPS_UPDATE;
  }

  // 2. If all children are cancelled, ticket is cancelled
  if (childStatuses.every((status) => status === ServiceRequestStatus.CANCELLED)) {
    return TicketStatus.CANCELLED;
  }

  // 3. If all children are completed or cancelled (with at least one completed), ticket is resolved
  const hasCompleted = childStatuses.some((status) => status === ServiceRequestStatus.COMPLETED);
  const allFinalized = childStatuses.every(
    (status) => status === ServiceRequestStatus.COMPLETED || status === ServiceRequestStatus.CANCELLED
  );
  if (hasCompleted && allFinalized) {
    return TicketStatus.RESOLVED;
  }

  // 4. If any child is actively being worked on (in progress, on site, or in transit)
  if (
    childStatuses.some(
      (status) =>
        status === ServiceRequestStatus.IN_PROGRESS ||
        status === ServiceRequestStatus.ON_SITE ||
        status === ServiceRequestStatus.IN_TRANSIT
    )
  ) {
    return TicketStatus.IN_PROGRESS;
  }

  // 5. If any child is accepted by an officer
  if (childStatuses.some((status) => status === ServiceRequestStatus.ACCEPTED)) {
    return TicketStatus.ASSIGNED;
  }

  // 6. Default to OPEN if pending
  return TicketStatus.OPEN;
}

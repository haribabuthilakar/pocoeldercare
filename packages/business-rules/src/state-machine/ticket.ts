import { TicketStatus, ServiceRequestStatus } from '@poco/constants';
import type { Result } from '../common/result';
import { ok, err } from '../common/result';
import { DomainError, DomainErrorCode } from '../common/errors';
import { areAllChildRequestsFinished } from './guards';

export type TicketEvent =
  | { type: 'ASSIGN_OFFICER'; officerId: string }
  | { type: 'START_WORK' }
  | { type: 'REQUEST_FAMILY_INPUT'; reason: string }
  | { type: 'RECEIVE_FAMILY_INPUT'; response: string }
  | { type: 'REQUEST_OPS_UPDATE'; reason: string }
  | { type: 'RECEIVE_OPS_UPDATE' }
  | { type: 'RESOLVE'; childStatuses: ServiceRequestStatus[] }
  | { type: 'CLOSE' }
  | { type: 'CANCEL'; reason: string };

export interface TicketTransitionContext {
  userId?: string;
  notes?: string;
}

export interface TicketTransitionResult {
  previousStatus: TicketStatus;
  nextStatus: TicketStatus;
  resolvedAt?: Date;
  closedAt?: Date;
  sideEffects?: string[];
}

/**
 * Pure functional state machine transition for Tickets.
 */
export function transitionTicket(
  currentStatus: TicketStatus,
  event: TicketEvent,
  _context?: TicketTransitionContext
): Result<TicketTransitionResult, DomainError> {
  switch (event.type) {
    case 'ASSIGN_OFFICER': {
      if (
        currentStatus !== TicketStatus.OPEN &&
        currentStatus !== TicketStatus.ASSIGNED &&
        currentStatus !== TicketStatus.WAITING_OPS_UPDATE
      ) {
        return err(
          new DomainError(
            DomainErrorCode.INVALID_STATE_TRANSITION,
            `Cannot ASSIGN_OFFICER to ticket in status ${currentStatus}`
          )
        );
      }
      return ok({
        previousStatus: currentStatus,
        nextStatus: TicketStatus.ASSIGNED,
        sideEffects: ['NOTIFY_CARE_OFFICER_ASSIGNED']
      });
    }

    case 'START_WORK': {
      if (currentStatus !== TicketStatus.ASSIGNED && currentStatus !== TicketStatus.OPEN) {
        return err(
          new DomainError(
            DomainErrorCode.INVALID_STATE_TRANSITION,
            `Cannot START_WORK on ticket in status ${currentStatus}`
          )
        );
      }
      return ok({
        previousStatus: currentStatus,
        nextStatus: TicketStatus.IN_PROGRESS
      });
    }

    case 'REQUEST_FAMILY_INPUT': {
      if (
        currentStatus === TicketStatus.RESOLVED ||
        currentStatus === TicketStatus.CLOSED ||
        currentStatus === TicketStatus.CANCELLED
      ) {
        return err(
          new DomainError(
            DomainErrorCode.INVALID_STATE_TRANSITION,
            `Cannot request family input on finalized ticket (${currentStatus})`
          )
        );
      }
      return ok({
        previousStatus: currentStatus,
        nextStatus: TicketStatus.WAITING_FAMILY_INPUT,
        sideEffects: ['NOTIFY_FAMILY_INPUT_REQUESTED']
      });
    }

    case 'RECEIVE_FAMILY_INPUT': {
      if (currentStatus !== TicketStatus.WAITING_FAMILY_INPUT) {
        return err(
          new DomainError(
            DomainErrorCode.INVALID_STATE_TRANSITION,
            `Ticket is not currently waiting for family input (${currentStatus})`
          )
        );
      }
      return ok({
        previousStatus: currentStatus,
        nextStatus: TicketStatus.IN_PROGRESS,
        sideEffects: ['NOTIFY_OFFICER_FAMILY_RESPONDED']
      });
    }

    case 'REQUEST_OPS_UPDATE': {
      if (
        currentStatus === TicketStatus.RESOLVED ||
        currentStatus === TicketStatus.CLOSED ||
        currentStatus === TicketStatus.CANCELLED
      ) {
        return err(
          new DomainError(
            DomainErrorCode.INVALID_STATE_TRANSITION,
            `Cannot flag ops update on finalized ticket (${currentStatus})`
          )
        );
      }
      return ok({
        previousStatus: currentStatus,
        nextStatus: TicketStatus.WAITING_OPS_UPDATE,
        sideEffects: ['ALERT_OPS_MANAGER']
      });
    }

    case 'RECEIVE_OPS_UPDATE': {
      if (currentStatus !== TicketStatus.WAITING_OPS_UPDATE) {
        return err(
          new DomainError(
            DomainErrorCode.INVALID_STATE_TRANSITION,
            `Ticket is not currently waiting for ops update (${currentStatus})`
          )
        );
      }
      return ok({
        previousStatus: currentStatus,
        nextStatus: TicketStatus.IN_PROGRESS
      });
    }

    case 'RESOLVE': {
      if (
        currentStatus === TicketStatus.RESOLVED ||
        currentStatus === TicketStatus.CLOSED ||
        currentStatus === TicketStatus.CANCELLED
      ) {
        return err(
          new DomainError(
            DomainErrorCode.INVALID_STATE_TRANSITION,
            `Ticket is already finalized (${currentStatus})`
          )
        );
      }
      if (!areAllChildRequestsFinished(event.childStatuses)) {
        return err(
          new DomainError(
            DomainErrorCode.CANNOT_CLOSE_OPEN_CHILDREN,
            'Cannot resolve ticket while child service requests are active or in exception'
          )
        );
      }
      return ok({
        previousStatus: currentStatus,
        nextStatus: TicketStatus.RESOLVED,
        resolvedAt: new Date(),
        sideEffects: ['NOTIFY_FAMILY_TICKET_RESOLVED', 'CALCULATE_FINAL_BILLING']
      });
    }

    case 'CLOSE': {
      if (currentStatus !== TicketStatus.RESOLVED) {
        return err(
          new DomainError(
            DomainErrorCode.INVALID_STATE_TRANSITION,
            `Ticket must be in RESOLVED status before closing (current: ${currentStatus})`
          )
        );
      }
      return ok({
        previousStatus: currentStatus,
        nextStatus: TicketStatus.CLOSED,
        closedAt: new Date(),
        sideEffects: ['ARCHIVE_TICKET']
      });
    }

    case 'CANCEL': {
      if (currentStatus === TicketStatus.CLOSED || currentStatus === TicketStatus.CANCELLED) {
        return err(
          new DomainError(
            DomainErrorCode.INVALID_STATE_TRANSITION,
            `Ticket is already closed/cancelled (${currentStatus})`
          )
        );
      }
      return ok({
        previousStatus: currentStatus,
        nextStatus: TicketStatus.CANCELLED,
        sideEffects: ['CANCEL_ALL_CHILD_REQUESTS', 'NOTIFY_FAMILY_CANCELLATION']
      });
    }

    default: {
      return err(
        new DomainError(
          DomainErrorCode.INVALID_STATE_TRANSITION,
          `Unknown ticket event type ${(event as { type: string }).type}`
        )
      );
    }
  }
}

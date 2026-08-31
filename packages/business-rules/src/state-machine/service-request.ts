import { ServiceRequestStatus } from '@poco/constants';
import type { Result } from '../common/result';
import { ok, err } from '../common/result';
import { DomainError, DomainErrorCode } from '../common/errors';

export type ServiceRequestEvent =
  | { type: 'ACCEPT'; assignedOfficerId: string }
  | { type: 'START_TRANSIT' }
  | { type: 'ARRIVE_ON_SITE'; isGeofenceVerified: boolean; distanceMeters?: number }
  | { type: 'START_WORK' }
  | { type: 'COMPLETE_WORK'; allSopStepsCompleted: boolean; isGeofenceVerified?: boolean }
  | { type: 'FLAG_EXCEPTION'; reason: string }
  | { type: 'RESUME_WORK' }
  | { type: 'CANCEL'; reason: string };

export interface ServiceRequestTransitionContext {
  officerId?: string;
  notes?: string;
}

export interface ServiceRequestTransitionResult {
  previousStatus: ServiceRequestStatus;
  nextStatus: ServiceRequestStatus;
  completedAt?: Date;
  sideEffects?: string[];
}

/**
 * Pure state machine transition function for Service Requests.
 */
export function transitionServiceRequest(
  currentStatus: ServiceRequestStatus,
  event: ServiceRequestEvent,
  _context?: ServiceRequestTransitionContext
): Result<ServiceRequestTransitionResult, DomainError> {
  switch (event.type) {
    case 'ACCEPT': {
      if (currentStatus !== ServiceRequestStatus.PENDING) {
        return err(
          new DomainError(
            DomainErrorCode.INVALID_STATE_TRANSITION,
            `Cannot ACCEPT service request in status ${currentStatus}`
          )
        );
      }
      return ok({
        previousStatus: currentStatus,
        nextStatus: ServiceRequestStatus.ACCEPTED,
        sideEffects: ['NOTIFY_CARE_OFFICER_ASSIGNED']
      });
    }

    case 'START_TRANSIT': {
      if (currentStatus !== ServiceRequestStatus.ACCEPTED) {
        return err(
          new DomainError(
            DomainErrorCode.INVALID_STATE_TRANSITION,
            `Cannot START_TRANSIT for service request in status ${currentStatus}`
          )
        );
      }
      return ok({
        previousStatus: currentStatus,
        nextStatus: ServiceRequestStatus.IN_TRANSIT,
        sideEffects: ['NOTIFY_FAMILY_TRANSIT_STARTED']
      });
    }

    case 'ARRIVE_ON_SITE': {
      if (currentStatus !== ServiceRequestStatus.IN_TRANSIT && currentStatus !== ServiceRequestStatus.ACCEPTED) {
        return err(
          new DomainError(
            DomainErrorCode.INVALID_STATE_TRANSITION,
            `Cannot ARRIVE_ON_SITE for service request in status ${currentStatus}`
          )
        );
      }
      if (!event.isGeofenceVerified) {
        return err(
          new DomainError(
            DomainErrorCode.CANNOT_COMPLETE_UNVERIFIED_GEOFENCE,
            `Officer is not within 200m geofence radius (distance: ${event.distanceMeters ?? 'unknown'}m)`
          )
        );
      }
      return ok({
        previousStatus: currentStatus,
        nextStatus: ServiceRequestStatus.ON_SITE,
        sideEffects: ['LOG_GEOFENCE_CHECKIN']
      });
    }

    case 'START_WORK': {
      if (currentStatus !== ServiceRequestStatus.ON_SITE && currentStatus !== ServiceRequestStatus.ACCEPTED) {
        return err(
          new DomainError(
            DomainErrorCode.INVALID_STATE_TRANSITION,
            `Cannot START_WORK for service request in status ${currentStatus}`
          )
        );
      }
      return ok({
        previousStatus: currentStatus,
        nextStatus: ServiceRequestStatus.IN_PROGRESS
      });
    }

    case 'COMPLETE_WORK': {
      if (
        currentStatus !== ServiceRequestStatus.IN_PROGRESS &&
        currentStatus !== ServiceRequestStatus.ON_SITE
      ) {
        return err(
          new DomainError(
            DomainErrorCode.INVALID_STATE_TRANSITION,
            `Cannot COMPLETE_WORK for service request in status ${currentStatus}`
          )
        );
      }
      if (!event.allSopStepsCompleted) {
        return err(
          new DomainError(
            DomainErrorCode.INCOMPLETE_SOP_STEPS,
            'Cannot complete service request: one or more required SOP steps are incomplete'
          )
        );
      }
      if (event.isGeofenceVerified === false) {
        return err(
          new DomainError(
            DomainErrorCode.CANNOT_COMPLETE_UNVERIFIED_GEOFENCE,
            'Cannot complete service request: geofence checkout is unverified'
          )
        );
      }
      return ok({
        previousStatus: currentStatus,
        nextStatus: ServiceRequestStatus.COMPLETED,
        completedAt: new Date(),
        sideEffects: ['RECORD_SOP_COMPLETION', 'TRIGGER_TICKET_ROLLUP']
      });
    }

    case 'FLAG_EXCEPTION': {
      if (
        currentStatus === ServiceRequestStatus.COMPLETED ||
        currentStatus === ServiceRequestStatus.CANCELLED
      ) {
        return err(
          new DomainError(
            DomainErrorCode.INVALID_STATE_TRANSITION,
            `Cannot FLAG_EXCEPTION on terminal status ${currentStatus}`
          )
        );
      }
      return ok({
        previousStatus: currentStatus,
        nextStatus: ServiceRequestStatus.EXCEPTION,
        sideEffects: ['NOTIFY_OPS_EXCEPTION', 'TRIGGER_TICKET_ROLLUP']
      });
    }

    case 'RESUME_WORK': {
      if (currentStatus !== ServiceRequestStatus.EXCEPTION) {
        return err(
          new DomainError(
            DomainErrorCode.INVALID_STATE_TRANSITION,
            `Cannot RESUME_WORK on non-exception status ${currentStatus}`
          )
        );
      }
      return ok({
        previousStatus: currentStatus,
        nextStatus: ServiceRequestStatus.IN_PROGRESS,
        sideEffects: ['TRIGGER_TICKET_ROLLUP']
      });
    }

    case 'CANCEL': {
      if (
        currentStatus === ServiceRequestStatus.COMPLETED ||
        currentStatus === ServiceRequestStatus.CANCELLED
      ) {
        return err(
          new DomainError(
            DomainErrorCode.INVALID_STATE_TRANSITION,
            `Cannot CANCEL already finalized service request (${currentStatus})`
          )
        );
      }
      return ok({
        previousStatus: currentStatus,
        nextStatus: ServiceRequestStatus.CANCELLED,
        sideEffects: ['NOTIFY_CANCELLATION', 'TRIGGER_TICKET_ROLLUP']
      });
    }

    default: {
      return err(
        new DomainError(
          DomainErrorCode.INVALID_STATE_TRANSITION,
          `Unknown event type ${(event as { type: string }).type}`
        )
      );
    }
  }
}

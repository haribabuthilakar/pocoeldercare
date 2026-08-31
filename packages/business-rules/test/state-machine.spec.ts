import { describe, it, expect } from 'vitest';
import { TicketStatus, ServiceRequestStatus } from '@poco/constants';
import {
  transitionTicket,
  transitionServiceRequest,
  calculateTicketRollupStatus,
  DomainErrorCode
} from '../src';
import { assertSuccess, assertFailure } from '../src/testing';

describe('State Machine Rules (TCKT-03)', () => {
  describe('Ticket State Machine', () => {
    it('transitions OPEN -> ASSIGNED upon care officer assignment', () => {
      const result = transitionTicket(TicketStatus.OPEN, {
        type: 'ASSIGN_OFFICER',
        officerId: 'officer-123'
      });

      const transition = assertSuccess(result);
      expect(transition.nextStatus).toBe(TicketStatus.ASSIGNED);
    });

    it('transitions ASSIGNED -> IN_PROGRESS on START_WORK', () => {
      const result = transitionTicket(TicketStatus.ASSIGNED, { type: 'START_WORK' });
      expect(assertSuccess(result).nextStatus).toBe(TicketStatus.IN_PROGRESS);
    });

    it('blocks ticket resolution if child service requests are active', () => {
      const result = transitionTicket(
        TicketStatus.IN_PROGRESS,
        { type: 'RESOLVE', childStatuses: [ServiceRequestStatus.IN_PROGRESS] }
      );

      const error = assertFailure(result, DomainErrorCode.CANNOT_CLOSE_OPEN_CHILDREN);
      expect(error.message).toContain('Cannot resolve ticket while child service requests are active');
    });

    it('allows ticket resolution when all child service requests are finished', () => {
      const result = transitionTicket(
        TicketStatus.IN_PROGRESS,
        { type: 'RESOLVE', childStatuses: [ServiceRequestStatus.COMPLETED] }
      );

      expect(assertSuccess(result).nextStatus).toBe(TicketStatus.RESOLVED);
    });

    it('rejects invalid state jumps (e.g. OPEN -> CLOSE)', () => {
      const result = transitionTicket(TicketStatus.OPEN, { type: 'CLOSE' });
      assertFailure(result, DomainErrorCode.INVALID_STATE_TRANSITION);
    });
  });

  describe('Service Request State Machine', () => {
    it('transitions PENDING -> ACCEPTED -> IN_TRANSIT -> ON_SITE -> IN_PROGRESS -> COMPLETED', () => {
      let state = ServiceRequestStatus.PENDING;

      state = assertSuccess(
        transitionServiceRequest(state, { type: 'ACCEPT', assignedOfficerId: 'officer-1' })
      ).nextStatus;
      expect(state).toBe(ServiceRequestStatus.ACCEPTED);

      state = assertSuccess(transitionServiceRequest(state, { type: 'START_TRANSIT' })).nextStatus;
      expect(state).toBe(ServiceRequestStatus.IN_TRANSIT);

      state = assertSuccess(
        transitionServiceRequest(state, { type: 'ARRIVE_ON_SITE', isGeofenceVerified: true })
      ).nextStatus;
      expect(state).toBe(ServiceRequestStatus.ON_SITE);

      state = assertSuccess(transitionServiceRequest(state, { type: 'START_WORK' })).nextStatus;
      expect(state).toBe(ServiceRequestStatus.IN_PROGRESS);

      state = assertSuccess(
        transitionServiceRequest(state, {
          type: 'COMPLETE_WORK',
          isGeofenceVerified: true,
          allSopStepsCompleted: true
        })
      ).nextStatus;
      expect(state).toBe(ServiceRequestStatus.COMPLETED);
    });

    it('blocks COMPLETE_WORK transition if geofence is not verified', () => {
      const result = transitionServiceRequest(
        ServiceRequestStatus.IN_PROGRESS,
        { type: 'COMPLETE_WORK', isGeofenceVerified: false, allSopStepsCompleted: true }
      );

      assertFailure(result, DomainErrorCode.CANNOT_COMPLETE_UNVERIFIED_GEOFENCE);
    });

    it('blocks COMPLETE_WORK transition if SOP checklist has incomplete steps', () => {
      const result = transitionServiceRequest(
        ServiceRequestStatus.IN_PROGRESS,
        { type: 'COMPLETE_WORK', isGeofenceVerified: true, allSopStepsCompleted: false }
      );

      assertFailure(result, DomainErrorCode.INCOMPLETE_SOP_STEPS);
    });
  });

  describe('Parent Ticket Rollup Status Calculator', () => {
    it('returns IN_PROGRESS if any child request is IN_PROGRESS', () => {
      const rollup = calculateTicketRollupStatus([
        ServiceRequestStatus.COMPLETED,
        ServiceRequestStatus.IN_PROGRESS
      ]);
      expect(rollup).toBe(TicketStatus.IN_PROGRESS);
    });

    it('returns RESOLVED if all child requests are COMPLETED', () => {
      const rollup = calculateTicketRollupStatus([
        ServiceRequestStatus.COMPLETED,
        ServiceRequestStatus.COMPLETED
      ]);
      expect(rollup).toBe(TicketStatus.RESOLVED);
    });

    it('returns CANCELLED if all child requests are CANCELLED', () => {
      const rollup = calculateTicketRollupStatus([
        ServiceRequestStatus.CANCELLED,
        ServiceRequestStatus.CANCELLED
      ]);
      expect(rollup).toBe(TicketStatus.CANCELLED);
    });
  });
});

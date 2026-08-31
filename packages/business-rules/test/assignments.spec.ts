import { describe, it, expect } from 'vitest';
import { UserRole } from '@poco/constants';
import { validateCareOfficerAssignment, evaluateCareOfficerReassignment, DomainErrorCode } from '../src';
import { createMockCareOfficer, assertSuccess, assertFailure, BASE_TEST_TIME } from '../src/testing';

describe('Care Officer Assignment & Certification Gating (CARE-01, CARE-03, D-52)', () => {
  const authorizedRoles = [UserRole.CARE_MANAGER];
  const unauthorizedRoles = [UserRole.CARE_OFFICER];

  it('allows assignment by Care Manager when officer is available and has active certifications', () => {
    const officer = createMockCareOfficer();
    const result = validateCareOfficerAssignment(
      authorizedRoles,
      { id: 'house-1', assignedCareOfficerId: null },
      officer,
      ['BLS_CPR', 'GERIATRIC_FIRST_AID'],
      BASE_TEST_TIME
    );

    const data = assertSuccess(result);
    expect(data.isAllowed).toBe(true);
    expect(data.officerId).toBe(officer.id);
  });

  it('rejects assignment attempts by non-manager roles per D-52', () => {
    const officer = createMockCareOfficer();
    const result = validateCareOfficerAssignment(
      unauthorizedRoles,
      { id: 'house-1', assignedCareOfficerId: null },
      officer,
      [],
      BASE_TEST_TIME
    );

    assertFailure(result, DomainErrorCode.UNAUTHORIZED_ROLE);
  });

  it('enforces 1:1 exclusivity and blocks assignment if household has another officer assigned', () => {
    const officer = createMockCareOfficer({ id: 'officer-new' });
    const result = validateCareOfficerAssignment(
      authorizedRoles,
      { id: 'house-1', assignedCareOfficerId: 'officer-existing' },
      officer,
      [],
      BASE_TEST_TIME
    );

    assertFailure(result, DomainErrorCode.CARE_OFFICER_ALREADY_ASSIGNED);
  });

  it('blocks assignment if required certification is missing or expired per CARE-03', () => {
    const expiredOfficer = createMockCareOfficer({
      certifications: [
        {
          certificationCode: 'BLS_CPR',
          expiresAt: new Date('2025-01-01T00:00:00Z'), // Expired relative to BASE_TEST_TIME (2026)
          status: 'EXPIRED'
        }
      ]
    });

    const result = validateCareOfficerAssignment(
      authorizedRoles,
      { id: 'house-1', assignedCareOfficerId: null },
      expiredOfficer,
      ['BLS_CPR'],
      BASE_TEST_TIME
    );

    const error = assertFailure(result, DomainErrorCode.CERTIFICATION_MISSING_OR_EXPIRED);
    expect(error.message).toContain('missing mandatory unexpired certification');
  });

  it('evaluates reassignment and calculates open tickets to reroute', () => {
    const newOfficer = createMockCareOfficer({ id: 'officer-replacement' });
    const reassignment = evaluateCareOfficerReassignment(
      authorizedRoles,
      'officer-old',
      newOfficer,
      [
        { id: 'ticket-1', status: 'IN_PROGRESS' as any, title: 'Check-in' },
        { id: 'ticket-2', status: 'CLOSED' as any, title: 'Old completed' }
      ],
      ['BLS_CPR'],
      BASE_TEST_TIME
    );

    const data = assertSuccess(reassignment);
    expect(data.canReassign).toBe(true);
    expect(data.affectedTicketCount).toBe(1);
    expect(data.ticketsToRerouteIds).toEqual(['ticket-1']);
  });
});

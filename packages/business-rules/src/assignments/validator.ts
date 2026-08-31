import { UserRole } from '@poco/constants';
import type { Result } from '../common/result';
import { ok, err } from '../common/result';
import { DomainError, DomainErrorCode } from '../common/errors';

export interface CareOfficerCertificationRecord {
  certificationCode: string;
  expiresAt: Date;
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED';
}

export interface CandidateCareOfficer {
  id: string;
  isAvailable: boolean;
  certifications: CareOfficerCertificationRecord[];
}

export interface HouseholdAssignmentContext {
  id: string;
  assignedCareOfficerId?: string | null;
}

export interface AssignmentValidationResult {
  isAllowed: true;
  officerId: string;
  householdId: string;
}

/**
 * Pure function validating Care Officer assignment per CARE-01, CARE-03, and D-52.
 *
 * Invariants Enforced:
 * 1. Caller Role: Must be CARE_MANAGER, OPS_MANAGER, or SUPER_ADMIN.
 * 2. 1:1 Household Mapping: Household must not already have a different active care officer assigned.
 * 3. Officer Availability: Officer must be marked as available.
 * 4. Certification Gating: Officer must possess active, unexpired certifications for all required certifications at `now`.
 */
export function validateCareOfficerAssignment(
  callerRoles: UserRole[],
  household: HouseholdAssignmentContext,
  candidateOfficer: CandidateCareOfficer,
  requiredCertificationCodes: string[] = [],
  now = new Date()
): Result<AssignmentValidationResult, DomainError> {
  // 1. Verify Caller Role
  const isAuthorized =
    callerRoles.includes(UserRole.CARE_MANAGER) ||
    callerRoles.includes(UserRole.OPS_MANAGER) ||
    callerRoles.includes(UserRole.SUPER_ADMIN);

  if (!isAuthorized) {
    return err(
      new DomainError(
        DomainErrorCode.UNAUTHORIZED_ROLE,
        'Only Care Managers, Ops Managers, or Super Admins are authorized to assign Care Officers to households per D-52'
      )
    );
  }

  // 2. Verify 1:1 Household Exclusivity
  if (household.assignedCareOfficerId && household.assignedCareOfficerId !== candidateOfficer.id) {
    return err(
      new DomainError(
        DomainErrorCode.CARE_OFFICER_ALREADY_ASSIGNED,
        `Household is already assigned to officer ${household.assignedCareOfficerId}. Use reassignment workflow to reassign per CARE-01`
      )
    );
  }

  // 3. Verify Officer Availability
  if (!candidateOfficer.isAvailable) {
    return err(
      new DomainError(
        DomainErrorCode.INVALID_STATE_TRANSITION,
        `Care Officer ${candidateOfficer.id} is currently unavailable for new household assignments`
      )
    );
  }

  // 4. Verify Required Certifications
  const nowEpoch = now.getTime();
  const activeCertCodes = new Set(
    candidateOfficer.certifications
      .filter((c) => c.status === 'ACTIVE' && c.expiresAt.getTime() > nowEpoch)
      .map((c) => c.certificationCode)
  );

  const missingCerts = requiredCertificationCodes.filter((code) => !activeCertCodes.has(code));

  if (missingCerts.length > 0) {
    return err(
      new DomainError(
        DomainErrorCode.CERTIFICATION_MISSING_OR_EXPIRED,
        `Care Officer ${candidateOfficer.id} is missing mandatory unexpired certification(s): ${missingCerts.join(', ')} per CARE-03`,
        { missingCerts }
      )
    );
  }

  return ok({
    isAllowed: true,
    officerId: candidateOfficer.id,
    householdId: household.id
  });
}

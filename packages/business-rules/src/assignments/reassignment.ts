import { UserRole, TicketStatus } from '@poco/constants';
import type { Result } from '../common/result';
import { ok, err } from '../common/result';
import { DomainError, DomainErrorCode } from '../common/errors';
import type { CandidateCareOfficer } from './validator';

export interface ActiveTicketSummary {
  id: string;
  status: TicketStatus;
  title: string;
  assignedCareOfficerId?: string | null;
}

export interface ReassignmentEvaluationResult {
  canReassign: boolean;
  affectedTicketCount: number;
  ticketsToRerouteIds: string[];
  routingInstructions: string[];
}

/**
 * Evaluates Care Officer reassignment for a household per D-66.
 */
export function evaluateCareOfficerReassignment(
  callerRoles: UserRole[],
  currentOfficerId: string,
  newOfficer: CandidateCareOfficer,
  activeTickets: ActiveTicketSummary[],
  requiredCertCodes: string[] = [],
  now = new Date()
): Result<ReassignmentEvaluationResult, DomainError> {
  // 1. Verify Caller Role
  const isAuthorized =
    callerRoles.includes(UserRole.CARE_MANAGER) ||
    callerRoles.includes(UserRole.OPS_MANAGER) ||
    callerRoles.includes(UserRole.SUPER_ADMIN);

  if (!isAuthorized) {
    return err(
      new DomainError(
        DomainErrorCode.UNAUTHORIZED_ROLE,
        'Only Care Managers or Admins can reassign care officers per D-66'
      )
    );
  }

  // 2. Check Candidate Officer Availability
  if (!newOfficer.isAvailable) {
    return err(
      new DomainError(
        DomainErrorCode.INVALID_STATE_TRANSITION,
        `New care officer ${newOfficer.id} is marked as unavailable`
      )
    );
  }

  // 3. Verify Certifications
  const nowEpoch = now.getTime();
  const activeCertCodes = new Set(
    newOfficer.certifications
      .filter((c) => c.status === 'ACTIVE' && c.expiresAt.getTime() > nowEpoch)
      .map((c) => c.certificationCode)
  );

  const missingCerts = requiredCertCodes.filter((code) => !activeCertCodes.has(code));
  if (missingCerts.length > 0) {
    return err(
      new DomainError(
        DomainErrorCode.CERTIFICATION_MISSING_OR_EXPIRED,
        `New officer is missing required certifications: ${missingCerts.join(', ')}`,
        { missingCerts }
      )
    );
  }

  // 4. Identify Tickets to Reroute
  const openTickets = activeTickets.filter(
    (t) =>
      t.status !== TicketStatus.RESOLVED &&
      t.status !== TicketStatus.CLOSED &&
      t.status !== TicketStatus.CANCELLED
  );

  const ticketsToRerouteIds = openTickets.map((t) => t.id);

  return ok({
    canReassign: true,
    affectedTicketCount: ticketsToRerouteIds.length,
    ticketsToRerouteIds,
    routingInstructions: [
      `Transfer 1:1 household primary assignment from ${currentOfficerId} to ${newOfficer.id}`,
      `Reroute ${ticketsToRerouteIds.length} open/in-progress ticket(s) to officer ${newOfficer.id}`,
      `Notify previous care officer and family of transition`
    ]
  });
}

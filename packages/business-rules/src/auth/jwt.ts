import type { ExternalJwtPayload, InternalJwtPayload } from '@poco/types';
import type { FamilyRole, UserRole } from '@poco/constants';

/**
 * Builds a typed ExternalJwtPayload contract per AUTH-01 and AUTH-05.
 */
export function buildExternalJwtPayload(
  personId: string,
  householdId: string,
  role: FamilyRole,
  phone: string,
  seniorId?: string
): ExternalJwtPayload {
  return {
    sub: personId,
    householdId,
    role,
    phone,
    tokenType: 'EXTERNAL',
    seniorId
  };
}

/**
 * Builds a typed InternalJwtPayload contract per AUTH-02.
 */
export function buildInternalJwtPayload(
  internalUserId: string,
  email: string,
  roles: UserRole[],
  assignedTerritories?: string[]
): InternalJwtPayload {
  return {
    sub: internalUserId,
    email,
    roles,
    tokenType: 'INTERNAL',
    assignedTerritories
  };
}

/**
 * Type guard for external JWT payload.
 */
export function isExternalJwt(payload: unknown): payload is ExternalJwtPayload {
  if (typeof payload !== 'object' || payload === null) return false;
  const p = payload as Record<string, unknown>;
  return p['tokenType'] === 'EXTERNAL' && typeof p['householdId'] === 'string' && typeof p['sub'] === 'string';
}

/**
 * Type guard for internal staff JWT payload.
 */
export function isInternalJwt(payload: unknown): payload is InternalJwtPayload {
  if (typeof payload !== 'object' || payload === null) return false;
  const p = payload as Record<string, unknown>;
  return p['tokenType'] === 'INTERNAL' && Array.isArray(p['roles']) && typeof p['sub'] === 'string';
}

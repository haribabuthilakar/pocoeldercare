import type { FamilyRole, UserRole } from '@poco/constants';

/**
 * JWT payload contract for external consumers (Family members, Seniors).
 * Strict isolation per AUTH-01 and AUTH-05.
 */
export interface ExternalJwtPayload {
  /** Subject identifier: Person UUID */
  sub: string;
  /** Primary Household UUID */
  householdId: string;
  /** Role of the person within this household */
  role: FamilyRole;
  /** Primary contact phone number */
  phone: string;
  /** Token type discriminator */
  tokenType: 'EXTERNAL';
  /** Optional senior ID if logging in on behalf of specific senior */
  seniorId?: string;
}

/**
 * JWT payload contract for internal operations staff (Admins, Managers, Care Officers, Sales).
 * Strict isolation per AUTH-02.
 */
export interface InternalJwtPayload {
  /** Subject identifier: InternalUser UUID */
  sub: string;
  /** Work email address */
  email: string;
  /** Array of assigned user roles (multi-role support) */
  roles: UserRole[];
  /** Token type discriminator */
  tokenType: 'INTERNAL';
  /** Optional assigned territory or cluster codes */
  assignedTerritories?: string[];
}

/**
 * Generic Refresh Token Payload contract.
 */
export interface RefreshTokenPayload {
  /** Subject identifier */
  sub: string;
  /** Token type discriminator */
  tokenType: 'REFRESH';
  /** Unique refresh token session identifier */
  tokenId: string;
}

/**
 * Standard Authentication Token Response returned by auth endpoints.
 */
export interface AuthTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

/**
 * Discriminated union of all authenticated principal types.
 */
export type AuthenticatedPrincipal =
  | { type: 'EXTERNAL'; payload: ExternalJwtPayload }
  | { type: 'INTERNAL'; payload: InternalJwtPayload };

import { UserRole, RoleCapability, ROLE_CAPABILITIES_MAP } from '@poco/constants';

/**
 * Pure function evaluating whether an internal user with given multi-roles has a domain capability per D-65 and AUTH-02.
 */
export function hasCapability(roles: UserRole[], capability: RoleCapability): boolean {
  if (!roles || roles.length === 0) return false;

  // Super Admin has all capabilities
  if (roles.includes(UserRole.SUPER_ADMIN)) return true;

  // Check if any role granted to user possesses the capability
  return roles.some((role) => {
    const granted = ROLE_CAPABILITIES_MAP[role];
    return granted ? granted.includes(capability) : false;
  });
}

/**
 * Evaluates if user has ANY of the required capabilities.
 */
export function hasAnyCapability(roles: UserRole[], capabilities: RoleCapability[]): boolean {
  return capabilities.some((cap) => hasCapability(roles, cap));
}

/**
 * Evaluates if user has ALL of the required capabilities.
 */
export function hasAllCapabilities(roles: UserRole[], capabilities: RoleCapability[]): boolean {
  return capabilities.every((cap) => hasCapability(roles, cap));
}

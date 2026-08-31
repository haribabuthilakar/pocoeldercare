/**
 * User roles within the internal operations organization.
 */
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  OPS_MANAGER = 'OPS_MANAGER',
  CARE_MANAGER = 'CARE_MANAGER',
  CARE_OFFICER = 'CARE_OFFICER',
  SALES_LEAD = 'SALES_LEAD'
}

export const USER_ROLES = Object.values(UserRole) as readonly UserRole[];

/**
 * Roles for external family members and seniors within a household.
 */
export enum FamilyRole {
  PRIMARY_CAREGIVER = 'PRIMARY_CAREGIVER',
  SECONDARY_CAREGIVER = 'SECONDARY_CAREGIVER',
  SENIOR = 'SENIOR',
  GUARDIAN = 'GUARDIAN'
}

export const FAMILY_ROLES = Object.values(FamilyRole) as readonly FamilyRole[];

/**
 * Capability definitions mapped to internal staff roles.
 */
export enum RoleCapability {
  MANAGE_USERS = 'MANAGE_USERS',
  ASSIGN_CARE_OFFICER = 'ASSIGN_CARE_OFFICER',
  REASSIGN_CARE_OFFICER = 'REASSIGN_CARE_OFFICER',
  EDIT_SERVICE_CATALOG = 'EDIT_SERVICE_CATALOG',
  OVERRIDE_BILLING = 'OVERRIDE_BILLING',
  VIEW_AUDIT_LOGS = 'VIEW_AUDIT_LOGS',
  TRIAGE_TICKETS = 'TRIAGE_TICKETS',
  MANAGE_PARTNERS = 'MANAGE_PARTNERS',
  EXECUTE_VISIT = 'EXECUTE_VISIT',
  CONVERT_LEAD = 'CONVERT_LEAD'
}

export const ROLE_CAPABILITIES_MAP: Record<UserRole, readonly RoleCapability[]> = {
  [UserRole.SUPER_ADMIN]: Object.values(RoleCapability),
  [UserRole.OPS_MANAGER]: [
    RoleCapability.MANAGE_USERS,
    RoleCapability.ASSIGN_CARE_OFFICER,
    RoleCapability.REASSIGN_CARE_OFFICER,
    RoleCapability.EDIT_SERVICE_CATALOG,
    RoleCapability.OVERRIDE_BILLING,
    RoleCapability.VIEW_AUDIT_LOGS,
    RoleCapability.TRIAGE_TICKETS,
    RoleCapability.MANAGE_PARTNERS,
    RoleCapability.CONVERT_LEAD
  ],
  [UserRole.CARE_MANAGER]: [
    RoleCapability.ASSIGN_CARE_OFFICER,
    RoleCapability.REASSIGN_CARE_OFFICER,
    RoleCapability.TRIAGE_TICKETS,
    RoleCapability.CONVERT_LEAD
  ],
  [UserRole.CARE_OFFICER]: [
    RoleCapability.EXECUTE_VISIT
  ],
  [UserRole.SALES_LEAD]: [
    RoleCapability.CONVERT_LEAD
  ]
} as const;

// User & Access Roles
export enum UserRole {
  ADMIN = "ADMIN",
  OPS_MANAGER = "OPS_MANAGER",
  DISPATCHER = "DISPATCHER",
  CARE_OFFICER = "CARE_OFFICER",
  DOCTOR = "DOCTOR",
  NURSE = "NURSE",
  PHYSIOTHERAPIST = "PHYSIOTHERAPIST",
  FAMILY_PRIMARY_NRI = "FAMILY_PRIMARY_NRI",
  FAMILY_PRIMARY_LOCAL = "FAMILY_PRIMARY_LOCAL",
  FAMILY_VIEWER = "FAMILY_VIEWER",
  ELDER = "ELDER"
}

// Plan Tiers
export enum PlanTier {
  KAVACH = "KAVACH",
  SAHARA = "SAHARA",
  SAMPOORNA = "SAMPOORNA",
  NIVAS = "NIVAS"
}

// 90 Services Categories
export enum ServiceCategory {
  A_EMERGENCY = "A_EMERGENCY",
  B_PRIMARY_CARE = "B_PRIMARY_CARE",
  C_DIAGNOSTICS = "C_DIAGNOSTICS",
  D_MEDICATION = "D_MEDICATION",
  E_THERAPY = "E_THERAPY",
  F_HIGH_DEPENDENCY = "F_HIGH_DEPENDENCY",
  G_RECORDS_INSURANCE = "G_RECORDS_INSURANCE",
  H_DAILY_LIVING = "H_DAILY_LIVING",
  I_FINANCIAL_LEGAL = "I_FINANCIAL_LEGAL",
  J_MOBILITY_TRAVEL = "J_MOBILITY_TRAVEL",
  K_COMPANIONSHIP = "K_COMPANIONSHIP",
  L_FAMILY_LAYER = "L_FAMILY_LAYER"
}

// Execution Status
export enum ExecutionStatus {
  SCHEDULED = "SCHEDULED",
  EN_ROUTE = "EN_ROUTE",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  FAILED = "FAILED"
}

// Emergency Event Status
export enum EmergencyStatus {
  OPEN = "OPEN",
  DISPATCHED = "DISPATCHED",
  AT_SCENE = "AT_SCENE",
  HOSPITALIZED = "HOSPITALIZED",
  RESOLVED = "RESOLVED",
  FALSE_ALARM = "FALSE_ALARM"
}

// SOP Checklist Step Input Types
export enum SopStepType {
  BOOLEAN = "BOOLEAN",
  NUMBER = "NUMBER",
  PHOTO_URL = "PHOTO_URL",
  VITALS = "VITALS",
  SIGNATURE = "SIGNATURE",
  TEXT = "TEXT"
}

// Wallet Transaction Types
export enum TransactionType {
  CREDIT = "CREDIT",
  HOLD = "HOLD",
  DEBIT = "DEBIT",
  REFUND = "REFUND"
}

// Consult Types
export enum ConsultType {
  DOCTOR_HOME_VISIT = "DOCTOR_HOME_VISIT",
  GP_TELECONSULT = "GP_TELECONSULT",
  SPECIALIST_TELECONSULT = "SPECIALIST_TELECONSULT"
}

// ABHA Sync Status
export enum AbhaStatus {
  NOT_LINKED = "NOT_LINKED",
  PENDING = "PENDING",
  LINKED = "LINKED",
  FAILED = "FAILED"
}

// Common DTOs and Interfaces
export interface JwtPayload {
  sub: string;
  phone?: string;
  email?: string;
  name: string;
  roles: { role: UserRole; householdId?: string }[];
  activeHouseholdId?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
    roles: { role: UserRole; householdId?: string }[];
  };
}

export interface SopStepSchema {
  id: string;
  title: string;
  type: SopStepType;
  required: boolean;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface SopTemplateDefinition {
  version: number;
  title: string;
  description: string;
  steps: SopStepSchema[];
}

export interface IceProfileData {
  bloodGroup?: string;
  allergies: string[];
  chronicConditions: string[];
  currentMedications: {
    name: string;
    dosage: string;
    frequency: string;
  }[];
  baselineVitals: {
    systolicBp?: number;
    diastolicBp?: number;
    pulse?: number;
    sugarFasting?: number;
    sugarPp?: number;
  };
  preferredHospital: {
    name: string;
    phone: string;
    address?: string;
  };
  emergencyContacts: {
    name: string;
    relationship: string;
    phone: string;
    timeZone?: string;
    isPrimaryChild: boolean;
  }[];
  emergencyNotes?: string;
  lastReviewedAt: string;
}

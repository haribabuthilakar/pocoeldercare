/**
 * Ticket lifecycle statuses.
 */
export enum TicketStatus {
  OPEN = 'OPEN',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  WAITING_FAMILY_INPUT = 'WAITING_FAMILY_INPUT',
  WAITING_OPS_UPDATE = 'WAITING_OPS_UPDATE',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
  CANCELLED = 'CANCELLED'
}

export const TICKET_STATUSES = Object.values(TicketStatus) as readonly TicketStatus[];

/**
 * Service Request lifecycle statuses.
 */
export enum ServiceRequestStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  IN_TRANSIT = 'IN_TRANSIT',
  ON_SITE = 'ON_SITE',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  EXCEPTION = 'EXCEPTION',
  CANCELLED = 'CANCELLED'
}

export const SERVICE_REQUEST_STATUSES = Object.values(ServiceRequestStatus) as readonly ServiceRequestStatus[];

/**
 * Ticket Priority tiers.
 */
export enum TicketPriority {
  EMERGENCY = 'EMERGENCY',
  URGENT = 'URGENT',
  ROUTINE = 'ROUTINE'
}

export const TICKET_PRIORITIES = Object.values(TicketPriority) as readonly TicketPriority[];

/**
 * AI Triage review statuses for activity feed triage.
 */
export enum TriageStatus {
  PENDING_TRIAGE = 'PENDING_TRIAGE',
  CONFIRMED = 'CONFIRMED',
  DISMISSED = 'DISMISSED',
  AUTO_CONVERTED = 'AUTO_CONVERTED'
}

export const TRIAGE_STATUSES = Object.values(TriageStatus) as readonly TriageStatus[];

/**
 * Billing execution statuses.
 */
export enum BillingStatus {
  PENDING = 'PENDING',
  QUOTA_DEBITED = 'QUOTA_DEBITED',
  WALLET_DEBITED = 'WALLET_DEBITED',
  HOLD_PENDING = 'HOLD_PENDING',
  APPROVAL_REQUIRED = 'APPROVAL_REQUIRED',
  SETTLED = 'SETTLED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

/**
 * Immutable ledger transaction types.
 */
export enum BillingTransactionType {
  QUOTA_DEBIT = 'QUOTA_DEBIT',
  WALLET_DEBIT = 'WALLET_DEBIT',
  WALLET_CREDIT = 'WALLET_CREDIT',
  HOLD_CREATE = 'HOLD_CREATE',
  HOLD_RELEASE = 'HOLD_RELEASE',
  EMERGENCY_OVERDRAFT = 'EMERGENCY_OVERDRAFT',
  REFUND = 'REFUND'
}

/**
 * Partner operational and mock status.
 */
export enum PartnerStatus {
  ACTIVE = 'ACTIVE',
  DEGRADED = 'DEGRADED',
  DOWN = 'DOWN',
  MOCK_ONLY = 'MOCK_ONLY'
}

/**
 * Clinical vital measurement types.
 */
export enum VitalType {
  BLOOD_PRESSURE = 'BLOOD_PRESSURE',
  BLOOD_GLUCOSE = 'BLOOD_GLUCOSE',
  SPO2 = 'SPO2',
  HEART_RATE = 'HEART_RATE',
  BODY_TEMPERATURE = 'BODY_TEMPERATURE',
  WEIGHT = 'WEIGHT',
  FALL_ALERT = 'FALL_ALERT'
}

/**
 * Clinical vital severity classification.
 */
export enum VitalSeverity {
  NORMAL = 'NORMAL',
  ATTENTION = 'ATTENTION',
  CRITICAL = 'CRITICAL'
}

/**
 * Clinical vital source classification.
 */
export enum VitalSource {
  MANUAL = 'MANUAL',
  BLUETOOTH = 'BLUETOOTH',
  WEARABLE_IOT = 'WEARABLE_IOT',
  POCOCARE_EMR = 'POCOCARE_EMR'
}

/**
 * Activity Feed actor types.
 */
export enum ActivityActorType {
  CARE_OFFICER = 'CARE_OFFICER',
  PERSON = 'PERSON',
  INTERNAL_USER = 'INTERNAL_USER',
  SYSTEM = 'SYSTEM'
}

/**
 * Activity Feed event types.
 */
export enum ActivityEventType {
  MESSAGE = 'MESSAGE',
  VOICE_NOTE = 'VOICE_NOTE',
  CHECK_IN = 'CHECK_IN',
  CHECK_OUT = 'CHECK_OUT',
  VITALS_RECORDED = 'VITALS_RECORDED',
  SOP_STEP_COMPLETED = 'SOP_STEP_COMPLETED',
  TICKET_CREATED = 'TICKET_CREATED',
  TICKET_RESOLVED = 'TICKET_RESOLVED',
  BILLING_EVENT = 'BILLING_EVENT',
  INCIDENT_ALERT = 'INCIDENT_ALERT'
}

/**
 * Audit log actor types.
 */
export enum AuditActorType {
  INTERNAL_USER = 'INTERNAL_USER',
  FAMILY_MEMBER = 'FAMILY_MEMBER',
  SYSTEM = 'SYSTEM',
  PARTNER_WEBHOOK = 'PARTNER_WEBHOOK'
}

/**
 * Lead pipeline stages.
 */
export enum LeadStage {
  NEW = 'NEW',
  CONTACTED = 'CONTACTED',
  VISIT_SCHEDULED = 'VISIT_SCHEDULED',
  CONVERTED = 'CONVERTED',
  LOST = 'LOST'
}

export const LEAD_STAGES = Object.values(LeadStage) as readonly LeadStage[];

/**
 * SOP Step Proof Types.
 */
export enum SopProofType {
  NONE = 'NONE',
  PHOTO = 'PHOTO',
  CHOICE = 'CHOICE',
  TEXT = 'TEXT'
}

export const SOP_PROOF_TYPES = Object.values(SopProofType) as readonly SopProofType[];

/**
 * Service Categories.
 */
export enum ServiceCategory {
  CLINICAL = 'CLINICAL',
  COMPANIONSHIP = 'COMPANIONSHIP',
  LOGISTICS = 'LOGISTICS',
  EMERGENCY = 'EMERGENCY',
  HOUSEHOLD = 'HOUSEHOLD',
  ADVICE = 'ADVICE'
}

/**
 * Package Tiers.
 */
export enum PackageTier {
  KAVACH = 'KAVACH',
  SAHARA = 'SAHARA',
  SAMPOORNA = 'SAMPOORNA'
}

/**
 * Certification Statuses.
 */
export enum CertificationStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  REVOKED = 'REVOKED'
}

/**
 * Subscription Statuses.
 */
export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  CANCELLED = 'CANCELLED'
}

/**
 * Billing Cycles.
 */
export enum BillingCycle {
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY'
}

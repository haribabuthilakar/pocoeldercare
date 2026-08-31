import type {
  TicketStatus,
  ServiceRequestStatus,
  TicketPriority,
  SlaStatus,
  TriageStatus
} from '@poco/constants';

/**
 * Standard SOP Checklist Step Progress.
 */
export interface SopStepProgress {
  stepId: string;
  title: string;
  order: number;
  completed: boolean;
  completedAt?: string;
  notes?: string;
  photoS3Key?: string;
  selectedChoice?: string;
}

/**
 * Child Service Request Domain Contract.
 */
export interface ServiceRequestSummary {
  id: string;
  ticketId: string;
  serviceCatalogVersionId: string;
  serviceName: string;
  status: ServiceRequestStatus;
  basePricePaise: number;
  assignedOfficerId?: string;
  completedAt?: string;
  sopProgress: SopStepProgress[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Parent Ticket Domain Contract.
 */
export interface TicketSummary {
  id: string;
  householdId: string;
  seniorId?: string;
  title: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  slaStatus: SlaStatus;
  responseDueAt: string;
  deliveryDueAt: string;
  assignedCareOfficerId?: string;
  triageStatus?: TriageStatus;
  serviceRequests: ServiceRequestSummary[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  closedAt?: string;
}

/**
 * Ticket Rollup Calculation Input.
 */
export interface TicketRollupInput {
  currentTicketStatus: TicketStatus;
  childStatuses: ServiceRequestStatus[];
}

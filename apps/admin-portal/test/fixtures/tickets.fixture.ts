import {
  TicketPriority,
  TicketStatus,
  TriageStatus,
  SlaStatus,
  ServiceRequestStatus,
} from '@poco/constants';

export const mockPendingTriageTickets = [
  {
    id: 'tkt-001-emergency',
    title: 'Wearable Fall Alert Detected',
    description: 'Senior smart band detected possible fall event in bathroom.',
    priority: TicketPriority.EMERGENCY,
    status: TicketStatus.OPEN,
    triageStatus: TriageStatus.PENDING_TRIAGE,
    slaStatus: SlaStatus.NORMAL,
    isEmergency: true,
    householdId: 'hh-001',
    seniorId: 'snr-001',
    household: {
      name: 'Rao Household',
      city: 'Bengaluru',
    },
    senior: {
      name: 'K. V. Rao',
    },
    suggestedServiceVersionId: 'sv-version-emergency-01',
    suggestedServiceName: 'Emergency Medical SOS Response',
    aiConfidenceScore: 0.96,
    serviceRequests: [],
    createdAt: new Date('2026-09-01T08:30:00.000Z').toISOString(),
    responseDueAt: new Date('2026-09-01T08:45:00.000Z').toISOString(),
    deliveryDueAt: new Date('2026-09-01T09:30:00.000Z').toISOString(),
  },
  {
    id: 'tkt-002-medication',
    title: 'Monthly BP & Diabetes Refill Assistance',
    description: 'Family requested prescription medication delivery for 30 days.',
    priority: TicketPriority.ROUTINE,
    status: TicketStatus.OPEN,
    triageStatus: TriageStatus.PENDING_TRIAGE,
    slaStatus: SlaStatus.NORMAL,
    isEmergency: false,
    householdId: 'hh-002',
    seniorId: 'snr-002',
    household: {
      name: 'Menon Family',
      city: 'Kochi',
    },
    senior: {
      name: 'Leela Menon',
    },
    suggestedServiceVersionId: 'sv-version-pharma-01',
    suggestedServiceName: 'Pharmacy Prescription Delivery',
    aiConfidenceScore: 0.88,
    serviceRequests: [],
    createdAt: new Date('2026-09-01T08:15:00.000Z').toISOString(),
    responseDueAt: new Date('2026-09-01T10:15:00.000Z').toISOString(),
    deliveryDueAt: new Date('2026-09-01T16:15:00.000Z').toISOString(),
  },
  {
    id: 'tkt-003-low-confidence',
    title: 'Inquiry regarding mobility ramp installation',
    description: 'Family asking about wheelchair ramp estimate.',
    priority: TicketPriority.ROUTINE,
    status: TicketStatus.OPEN,
    triageStatus: TriageStatus.PENDING_TRIAGE,
    slaStatus: SlaStatus.NORMAL,
    isEmergency: false,
    householdId: 'hh-003',
    seniorId: null,
    household: {
      name: 'Chatterjee Residence',
      city: 'Kolkata',
    },
    senior: null,
    suggestedServiceVersionId: 'sv-version-home-01',
    suggestedServiceName: 'Home Modification Assessment',
    aiConfidenceScore: 0.62,
    serviceRequests: [],
    createdAt: new Date('2026-09-01T07:45:00.000Z').toISOString(),
    responseDueAt: new Date('2026-09-01T11:45:00.000Z').toISOString(),
    deliveryDueAt: new Date('2026-09-02T18:00:00.000Z').toISOString(),
  },
];

export const mockRollupExceptionTickets = [
  {
    id: 'tkt-rollup-001',
    title: 'Comprehensive Bi-Weekly Wellness Check & Diagnostic Panel',
    status: TicketStatus.WAITING_OPS_UPDATE,
    priority: TicketPriority.URGENT,
    householdId: 'hh-004',
    household: {
      name: 'Deshmukh Household',
      city: 'Pune',
    },
    stallReason: 'Diagnostic blood draw partner reported sample haemolysis; physiotherapy session completed.',
    serviceRequests: [
      {
        id: 'sr-001',
        title: 'Physiotherapy Mobility Session',
        status: ServiceRequestStatus.COMPLETED,
        serviceCatalogVersion: {
          serviceCatalog: { name: 'In-Home Physiotherapy' },
        },
      },
      {
        id: 'sr-002',
        title: 'Fasting Lipid & HbA1c Blood Panel',
        status: ServiceRequestStatus.EXCEPTION,
        serviceCatalogVersion: {
          serviceCatalog: { name: 'Diagnostic Blood Panel' },
        },
      },
    ],
  },
];

export const mockSlaRiskTickets = [
  {
    id: 'tkt-sla-001-atrisk',
    title: 'Urgent Oxygen Concentrator Delivery',
    priority: TicketPriority.URGENT,
    status: TicketStatus.IN_PROGRESS,
    slaStatus: SlaStatus.AT_RISK,
    triageSlaProgress: 0.82,
    deliverySlaProgress: 0.78,
    household: {
      name: 'Kapoor Family',
      city: 'Delhi NCR',
    },
    senior: {
      name: 'Ramesh Kapoor',
    },
    assignedCareOfficer: {
      name: 'Anil Kumar',
      phone: '+919876543210',
    },
    responseDueAt: new Date('2026-09-01T09:00:00.000Z').toISOString(),
    deliveryDueAt: new Date('2026-09-01T10:00:00.000Z').toISOString(),
  },
  {
    id: 'tkt-sla-002-breached',
    title: 'Scheduled Escorted Hospital Visit',
    priority: TicketPriority.ROUTINE,
    status: TicketStatus.IN_PROGRESS,
    slaStatus: SlaStatus.BREACHED,
    triageSlaProgress: 1.0,
    deliverySlaProgress: 1.15,
    household: {
      name: 'Iyer Household',
      city: 'Chennai',
    },
    senior: {
      name: 'Savitri Iyer',
    },
    assignedCareOfficer: {
      name: 'M. S. Karthik',
      phone: '+919840123456',
    },
    responseDueAt: new Date('2026-09-01T07:30:00.000Z').toISOString(),
    deliveryDueAt: new Date('2026-09-01T08:30:00.000Z').toISOString(),
  },
];

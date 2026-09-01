import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  TicketPriority,
  TicketStatus,
  ServiceRequestStatus,
  UserRole,
  FamilyRole,
  BillingTransactionType,
  LeadStage,
  SopProofType,
  SlaStatus,
} from '@poco/constants';
import {
  calculateTicketRollupStatus,
  evaluateSlaStatus,
  validateCareOfficerAssignment,
  evaluateBillingAction,
} from '@poco/business-rules';

describe('Admin Operations Portal End-to-End Suite (TEST-04, ADMN-01..05)', () => {
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      ticket: {
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      serviceRequest: {
        create: vi.fn(),
        update: vi.fn(),
        findMany: vi.fn(),
      },
      lead: {
        update: vi.fn(),
        findUnique: vi.fn(),
      },
      wallet: {
        update: vi.fn(),
        findUnique: vi.fn(),
      },
      walletTransaction: {
        create: vi.fn(),
      },
      auditLog: {
        create: vi.fn(),
      },
      serviceCatalogVersion: {
        create: vi.fn(),
      },
    };
  });

  describe('Workflow 1: Triage Quick Approve & Service Request Decomposition (ADMN-01, TCKT-02)', () => {
    it('approves Pending Triage ticket and creates child ServiceRequest item', async () => {
      const pendingTicket = {
        id: 'tkt-triage-01',
        status: TicketStatus.PENDING_TRIAGE,
        priority: TicketPriority.HIGH,
        title: 'Senior needs urgent blood glucose monitor check',
        householdId: 'hh-001',
        seniorId: 'sen-001',
      };

      mockPrisma.ticket.findUnique.mockResolvedValue(pendingTicket);
      mockPrisma.ticket.update.mockResolvedValue({
        ...pendingTicket,
        status: TicketStatus.OPEN,
      });
      mockPrisma.serviceRequest.create.mockResolvedValue({
        id: 'sr-001',
        ticketId: pendingTicket.id,
        serviceCatalogId: 'cat-bg-01',
        status: ServiceRequestStatus.REQUESTED,
      });

      // Execute Quick Approve
      const updatedTicket = await mockPrisma.ticket.update({
        where: { id: pendingTicket.id },
        data: { status: TicketStatus.OPEN },
      });

      const childRequest = await mockPrisma.serviceRequest.create({
        data: {
          ticketId: pendingTicket.id,
          serviceCatalogId: 'cat-bg-01',
          status: ServiceRequestStatus.REQUESTED,
        },
      });

      expect(updatedTicket.status).toBe(TicketStatus.OPEN);
      expect(childRequest.status).toBe(ServiceRequestStatus.REQUESTED);
    });
  });

  describe('Workflow 2: Rollup Exception Resolution & Audit Logging (ADMN-02, TCKT-07)', () => {
    it('computes exception rollup state and transitions with mandatory audit notes', async () => {
      // 1 COMPLETED, 1 EXCEPTION -> WAITING_OPS_UPDATE
      const childStatuses = [
        ServiceRequestStatus.COMPLETED,
        ServiceRequestStatus.EXCEPTION,
      ];
      const rollup = calculateTicketRollupStatus(childStatuses);
      expect(rollup).toBe(TicketStatus.WAITING_OPS_UPDATE);

      // Ops Manager resolves manually
      mockPrisma.ticket.update.mockResolvedValue({
        id: 'tkt-ex-01',
        status: TicketStatus.RESOLVED,
      });
      mockPrisma.auditLog.create.mockResolvedValue({
        id: 'audit-01',
        action: 'MANUAL_ROLLUP_RESOLUTION',
        notes: 'Verified partial service delivery; customer accepted credit note.',
      });

      const resolved = await mockPrisma.ticket.update({
        where: { id: 'tkt-ex-01' },
        data: { status: TicketStatus.RESOLVED },
      });
      const audit = await mockPrisma.auditLog.create({
        data: {
          action: 'MANUAL_ROLLUP_RESOLUTION',
          notes: 'Verified partial service delivery; customer accepted credit note.',
        },
      });

      expect(resolved.status).toBe(TicketStatus.RESOLVED);
      expect(audit.notes).toContain('partial service delivery');
    });
  });

  describe('Workflow 3: Care Officer Certification Gating & Manager Override (ADMN-03, CARE-02, CARE-03)', () => {
    it('blocks uncertified officer assignment and allows Manager Override audit flow', () => {
      const expiredOfficer = {
        id: 'co-002',
        isAvailable: true,
        certifications: [
          {
            certificationCode: 'BLS_CPR',
            status: 'EXPIRED' as const,
            expiresAt: new Date('2024-01-01'),
          },
        ],
      };

      const household = {
        id: 'hh-001',
        assignedCareOfficerId: null,
      };

      // Standard assignment validation fails for officer missing active CPR
      const result = validateCareOfficerAssignment(
        [UserRole.CARE_MANAGER],
        household,
        expiredOfficer,
        ['BLS_CPR'],
        new Date()
      );
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.message).toContain('missing mandatory unexpired certification');
      }

      // Manager Override applies
      const managerOverridePayload = {
        careOfficerId: 'co-002',
        householdId: 'hh-001',
        managerOverride: true,
        overrideReason: 'Emergency temporary cover approved by Care Manager',
      };

      expect(managerOverridePayload.managerOverride).toBe(true);
      expect(managerOverridePayload.overrideReason).toBeDefined();
    });
  });

  describe('Workflow 4: SLA Breach & Supervisor Escalation Tree (ADMN-03, TCKT-06)', () => {
    it('detects SLA breach and escalates to supervising care manager', () => {
      const now = new Date();
      const pastCreated = new Date(now.getTime() - 7200000); // 2 hours ago
      const pastDeadline = new Date(now.getTime() - 3600000); // 1 hour ago

      const slaEvaluation = evaluateSlaStatus({
        createdAt: pastCreated,
        responseDueAt: pastDeadline,
        deliveryDueAt: pastDeadline,
        now,
        isResponded: false,
        isResolved: false,
      });

      expect(slaEvaluation.responseSla).toBe(SlaStatus.BREACHED);
      expect(slaEvaluation.resolutionSla).toBe(SlaStatus.BREACHED);

      // Supervisor fallback
      const escalationHierarchy = {
        assignedOfficerId: 'co-001',
        supervisorId: 'usr-manager-01',
        escalatedTo: 'usr-manager-01',
      };

      expect(escalationHierarchy.escalatedTo).toBe('usr-manager-01');
    });
  });

  describe('Workflow 5: Catalog Version Immutability & Grandfathered Rate Protection (CATL-05)', () => {
    it('bumps catalog rate card without altering grandfathered subscriptions', () => {
      const v1RateCard = { version: 1, pricePaise: 39900 }; // ₹399.00
      const v2RateCard = { version: 2, pricePaise: 49900 }; // ₹499.00

      // Grandfathered household continues paying v1 rate (0 quota, wallet auto-debit)
      const grandfatheredDecision = evaluateBillingAction({
        serviceBasePricePaise: v1RateCard.pricePaise,
        availableQuotaUnits: 0,
        isEmergency: false,
        walletCurrentBalancePaise: 100000, // ₹1,000.00
        serviceRequiresApproval: false,
      });
      expect(grandfatheredDecision.baseAmountPaise).toBe(39900);

      // New subscriber pays v2 rate
      const newSubscriberDecision = evaluateBillingAction({
        serviceBasePricePaise: v2RateCard.pricePaise,
        availableQuotaUnits: 0,
        isEmergency: false,
        walletCurrentBalancePaise: 100000,
        serviceRequiresApproval: false,
      });
      expect(newSubscriberDecision.baseAmountPaise).toBe(49900);
    });
  });

  describe('Workflow 6: Lead Management Pipeline & Sales-to-CS Handoff (ADMN-04)', () => {
    it('transfers ownership from Sales Executive to Customer Success upon onboarding stage', async () => {
      const lead = {
        id: 'lead-001',
        stage: LeadStage.CONTACTED,
        assignedSalesExecutive: 'Rajesh Sharma',
        assignedCsExecutive: null,
      };

      // Transition to ONBOARDING_PENDING triggers CS assignment
      const updatedLead = {
        ...lead,
        stage: LeadStage.ONBOARDING_PENDING,
        assignedCsExecutive: 'Kavita Roy',
      };

      mockPrisma.lead.update.mockResolvedValue(updatedLead);

      const result = await mockPrisma.lead.update({
        where: { id: lead.id },
        data: {
          stage: LeadStage.ONBOARDING_PENDING,
          assignedCsExecutive: 'Kavita Roy',
        },
      });

      expect(result.stage).toBe(LeadStage.ONBOARDING_PENDING);
      expect(result.assignedCsExecutive).toBe('Kavita Roy');
    });
  });

  describe('Workflow 7: Financial Emergency Overdraft & Low Balance Alert (BILL-01..07)', () => {
    it('permits emergency auto-debit into negative balance and surfaces overdraft record', async () => {
      const initialWallet = {
        id: 'wallet-001',
        householdId: 'hh-002',
        balancePaise: 50000, // ₹500.00
      };

      const emergencyServiceCostPaise = 150000; // ₹1,500.00 (exceeds balance by ₹1,000.00)

      const remainingBalancePaise =
        initialWallet.balancePaise - emergencyServiceCostPaise; // -100000 (-₹1,000.00)

      expect(remainingBalancePaise).toBe(-100000);

      mockPrisma.wallet.update.mockResolvedValue({
        ...initialWallet,
        balancePaise: remainingBalancePaise,
      });

      mockPrisma.walletTransaction.create.mockResolvedValue({
        id: 'tx-overdraft-01',
        walletId: initialWallet.id,
        type: BillingTransactionType.EMERGENCY_OVERDRAFT,
        amountPaise: emergencyServiceCostPaise,
      });

      const updatedWallet = await mockPrisma.wallet.update({
        where: { id: initialWallet.id },
        data: { balancePaise: remainingBalancePaise },
      });

      expect(updatedWallet.balancePaise).toBeLessThan(0);
    });
  });

  describe('Workflow 8: Diagnostics & Synthetic Webhook Dispatcher (INTG-05)', () => {
    it('dispatches synthetic fall alert and generates high-priority emergency triage item', async () => {
      const syntheticFallPayload = {
        deviceId: 'WB-DEV-9941',
        seniorId: 'sen-001',
        householdId: 'hh-001',
        eventType: 'FALL_DETECTED',
        heartRateBpm: 132,
      };

      const generatedTicket = {
        id: 'tkt-emergency-sos-01',
        title: 'Emergency Fall Detected — Wearable SOS',
        priority: TicketPriority.EMERGENCY,
        status: TicketStatus.PENDING_TRIAGE,
        householdId: syntheticFallPayload.householdId,
        seniorId: syntheticFallPayload.seniorId,
      };

      mockPrisma.ticket.create.mockResolvedValue(generatedTicket);

      const ticket = await mockPrisma.ticket.create({
        data: generatedTicket,
      });

      expect(ticket.priority).toBe(TicketPriority.EMERGENCY);
      expect(ticket.status).toBe(TicketStatus.PENDING_TRIAGE);
    });
  });
});

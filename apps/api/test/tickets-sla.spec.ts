import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TicketsService } from '../src/modules/tickets/tickets.service';
import { ServiceRequestsService } from '../src/modules/tickets/service-requests.service';
import { SlaTransitionWorker } from '../src/modules/jobs/workers/sla-transition.worker';
import { TicketPriority, TicketStatus, SlaStatus, ServiceRequestStatus } from '@poco/constants';

describe('Tickets, Service Requests and SLA Engine Integration', () => {
  let ticketsService: TicketsService;
  let serviceRequestsService: ServiceRequestsService;
  let slaWorker: SlaTransitionWorker;
  let prismaMock: any;
  let careOfficersMock: any;

  beforeEach(() => {
    prismaMock = {
      household: { findUnique: vi.fn() },
      ticket: {
        create: vi.fn(),
        findUnique: vi.fn(),
        findMany: vi.fn(),
        update: vi.fn(),
      },
      serviceRequest: {
        create: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      serviceCatalogVersion: { findUniqueOrThrow: vi.fn() },
      ticketSopProgress: { upsert: vi.fn() },
      $transaction: vi.fn(async (cbin: any) => cbin(prismaMock)),
    };

    careOfficersMock = {
      executeSupervisorFallback: vi.fn(),
    };

    ticketsService = new TicketsService(prismaMock as any);
    serviceRequestsService = new ServiceRequestsService(prismaMock as any, ticketsService);
    slaWorker = new SlaTransitionWorker(prismaMock as any, careOfficersMock as any);
  });

  describe('TCKT-01 & SLA-01: Universal Ticket Creation & SLA Deadlines', () => {
    it('creates ticket with independent response and delivery SLA deadlines', async () => {
      prismaMock.household.findUnique.mockResolvedValue({
        id: 'hh-1',
        assignedCareOfficerId: 'officer-1',
      });

      prismaMock.ticket.create.mockImplementation(async (args: any) => ({
        id: 'ticket-1',
        ...args.data,
      }));

      const ticket = await ticketsService.createTicket({
        householdId: 'hh-1',
        title: 'Medical Evaluation Request',
        description: 'Senior feeling unwell after morning walk',
        priority: TicketPriority.URGENT,
      });

      expect(ticket.id).toBe('ticket-1');
      expect(ticket.priority).toBe(TicketPriority.URGENT);
      expect(ticket.responseDueAt.getTime()).toBeLessThan(ticket.deliveryDueAt.getTime());
      expect(prismaMock.ticket.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          householdId: 'hh-1',
          assignedCareOfficerId: 'officer-1',
          status: TicketStatus.OPEN,
          slaStatus: SlaStatus.NORMAL,
        }),
        include: expect.any(Object),
      });
    });
  });

  describe('TCKT-02, TCKT-03 & TCKT-04: Service Request Triage & Rollup States', () => {
    it('triages ticket into child service requests and updates ticket status', async () => {
      prismaMock.ticket.findUnique.mockResolvedValue({
        id: 'ticket-1',
        assignedCareOfficerId: 'officer-1',
      });

      prismaMock.serviceCatalogVersion.findUniqueOrThrow.mockResolvedValue({
        id: 'version-1',
        pricePaise: 75000,
      });

      prismaMock.serviceRequest.create.mockResolvedValue({ id: 'sr-1' });
      prismaMock.ticket.update.mockResolvedValue({ id: 'ticket-1', status: TicketStatus.ASSIGNED });

      const res = await ticketsService.triageToServiceRequests(
        'ticket-1',
        [{ serviceCatalogVersionId: 'version-1', notes: 'Doctor consultation' }],
        'ops-1',
      );

      expect(res.serviceRequests.length).toBe(1);
      expect(res.ticket.status).toBe(TicketStatus.ASSIGNED);
    });

    it('transitions parent ticket to RESOLVED when all children complete (TCKT-04)', async () => {
      prismaMock.ticket.findUnique.mockResolvedValue({
        id: 'ticket-1',
        status: TicketStatus.IN_PROGRESS,
        serviceRequests: [
          { status: ServiceRequestStatus.COMPLETED },
          { status: ServiceRequestStatus.COMPLETED },
        ],
      });

      prismaMock.ticket.update.mockResolvedValue({ id: 'ticket-1', status: TicketStatus.RESOLVED });

      const updated = await ticketsService.recalculateRollupStatus('ticket-1');
      expect(updated.status).toBe(TicketStatus.RESOLVED);
    });

    it('transitions parent ticket to WAITING_OPS_UPDATE upon child exception (TCKT-06)', async () => {
      prismaMock.ticket.findUnique.mockResolvedValue({
        id: 'ticket-1',
        status: TicketStatus.IN_PROGRESS,
        serviceRequests: [
          { status: ServiceRequestStatus.COMPLETED },
          { status: ServiceRequestStatus.EXCEPTION },
        ],
      });

      prismaMock.ticket.update.mockResolvedValue({ id: 'ticket-1', status: TicketStatus.WAITING_OPS_UPDATE });

      const updated = await ticketsService.recalculateRollupStatus('ticket-1');
      expect(updated.status).toBe(TicketStatus.WAITING_OPS_UPDATE);
    });
  });

  describe('SLA-02, SLA-03 & SLA-04: SLA Background Evaluation & Escalation', () => {
    it('evaluates SLA response and delivery timers, transitioning to AT_RISK at 75%', async () => {
      const createdAt = new Date(Date.now() - 1000 * 60 * 60);
      const responseDueAt = new Date(createdAt.getTime() + 1000 * 60 * 80);
      const deliveryDueAt = new Date(createdAt.getTime() + 1000 * 60 * 240);

      prismaMock.ticket.findMany.mockResolvedValue([
        {
          id: 'ticket-1',
          createdAt,
          responseDueAt,
          deliveryDueAt,
          status: TicketStatus.OPEN,
          slaStatus: SlaStatus.NORMAL,
          assignedCareOfficerId: 'officer-1',
        },
      ]);

      prismaMock.ticket.update.mockResolvedValue({ id: 'ticket-1', slaStatus: SlaStatus.AT_RISK });

      const result = await slaWorker.processSlaTransitions(50, new Date());
      expect(result.transitionedCount).toBe(1);
      expect(prismaMock.ticket.update).toHaveBeenCalledWith({
        where: { id: 'ticket-1' },
        data: { slaStatus: SlaStatus.AT_RISK },
      });
    });

    it('automatically escalates to Senior Care Officer on Breach (SLA-04, CARE-05)', async () => {
      const createdAt = new Date(Date.now() - 1000 * 60 * 120);
      const responseDueAt = new Date(createdAt.getTime() + 1000 * 60 * 15);
      const deliveryDueAt = new Date(createdAt.getTime() + 1000 * 60 * 60);

      prismaMock.ticket.findMany.mockResolvedValue([
        {
          id: 'ticket-1',
          createdAt,
          responseDueAt,
          deliveryDueAt,
          status: TicketStatus.OPEN,
          slaStatus: SlaStatus.NORMAL,
          assignedCareOfficerId: 'officer-1',
        },
      ]);

      prismaMock.ticket.update.mockResolvedValue({ id: 'ticket-1', slaStatus: SlaStatus.BREACHED });
      careOfficersMock.executeSupervisorFallback.mockResolvedValue({ success: true });

      const result = await slaWorker.processSlaTransitions(50, new Date());
      expect(result.breachedCount).toBe(1);
      expect(careOfficersMock.executeSupervisorFallback).toHaveBeenCalledWith('ticket-1');
    });
  });
});


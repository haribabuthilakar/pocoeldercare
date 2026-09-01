import { describe, it, expect, beforeAll } from 'vitest';
import { PrismaClient } from '@poco/database';
import { SlaTransitionWorker } from '../src/modules/jobs/workers/sla-transition.worker';
import { CareOfficersService } from '../src/modules/care-officers/care-officers.service';
import { SlaStatus, TicketStatus, TicketPriority } from '@poco/constants';

describe('Real PostgreSQL Integration: SLA Transitions & Escalations (TEST-03, D-09)', () => {
  let prisma: PrismaClient;
  let slaWorker: SlaTransitionWorker;
  let careOfficersService: CareOfficersService;

  beforeAll(() => {
    prisma = new PrismaClient();
    const prismaService = { client: prisma, ...prisma } as any;
    careOfficersService = new CareOfficersService(prismaService);
    slaWorker = new SlaTransitionWorker(prismaService, careOfficersService);
  });

  it('transitions ticket from NORMAL -> AT_RISK -> BREACHED and escalates to Senior Care Officer', async () => {
    // 1. Fetch supervisor and care officer
    const supervisor = await prisma.internalUser.findUnique({
      where: { email: 'leadcare@pocoeldercare.com' },
      include: { careOfficerProfile: true },
    });
    const officer = await prisma.internalUser.findUnique({
      where: { email: 'officer2@pocoeldercare.com' },
      include: { careOfficerProfile: true },
    });
    const household = await prisma.household.findFirst();

    expect(supervisor?.careOfficerProfile).toBeDefined();
    expect(officer?.careOfficerProfile).toBeDefined();
    expect(household).toBeDefined();

    const supervisorProfileId = supervisor!.careOfficerProfile!.id;
    const officerProfileId = officer!.careOfficerProfile!.id;

    // Link officer to supervisor
    await prisma.careOfficerProfile.update({
      where: { id: officerProfileId },
      data: { managerId: supervisorProfileId },
    });

    const now = Date.now();
    const createdAt = new Date(now - 1000 * 60 * 50); // Created 50m ago
    const responseDueAt = new Date(now - 1000 * 60 * 10); // Response overdue by 10m
    const deliveryDueAt = new Date(now + 1000 * 60 * 60); // Delivery due in 1 hr

    // 2. Create Open Ticket overdue for response
    const ticket = await prisma.ticket.create({
      data: {
        householdId: household!.id,
        title: 'Emergency Fall Alert Test Ticket',
        description: 'Automated fall detection sensor triggered in living room',
        category: 'EMERGENCY',
        priority: TicketPriority.EMERGENCY,
        status: TicketStatus.OPEN,
        slaStatus: SlaStatus.NORMAL,
        createdAt,
        responseDueAt,
        deliveryDueAt,
        assignedCareOfficerId: officerProfileId,
      },
    });

    // 3. Run SLA Transition Worker
    const result = await slaWorker.processSlaTransitions(50, new Date(now));
    expect(result.transitionedCount).toBeGreaterThan(0);

    // 4. Verify Ticket transitioned to BREACHED and re-assigned to supervisor (Major Arvind Swamy)
    const updatedTicket = await prisma.ticket.findUnique({
      where: { id: ticket.id },
    });

    expect(updatedTicket?.slaStatus).toBe(SlaStatus.BREACHED);
    expect(updatedTicket?.assignedCareOfficerId).toBe(supervisorProfileId);
  });
});

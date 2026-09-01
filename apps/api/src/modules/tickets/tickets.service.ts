import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.module';
import {
  TicketPriority,
  TicketStatus,
  SlaStatus,
  ServiceRequestStatus,
  TriageStatus,
} from '@poco/constants';
import {
  calculateSlaDeadlines,
  calculateTicketRollupStatus,
  transitionTicket,
} from '@poco/business-rules';

@Injectable()
export class TicketsService {
  constructor(private readonly prisma: PrismaService) {}

  async createTicket(data: {
    householdId: string;
    title: string;
    description: string;
    category?: string;
    priority?: TicketPriority;
    seniorId?: string;
    triageStatus?: TriageStatus;
  }) {
    const household = await this.prisma.household.findUnique({
      where: { id: data.householdId },
    });

    if (!household) {
      throw new NotFoundException('Household not found');
    }

    const priority = data.priority || TicketPriority.ROUTINE;
    const now = new Date();
    const deadlines = calculateSlaDeadlines(now, priority);

    const ticket = await this.prisma.ticket.create({
      data: {
        householdId: data.householdId,
        seniorId: data.seniorId,
        title: data.title,
        description: data.description,
        category: data.category || 'GENERAL',
        priority,
        status: TicketStatus.OPEN,
        slaStatus: SlaStatus.NORMAL,
        responseDueAt: deadlines.responseDueAt,
        deliveryDueAt: deadlines.deliveryDueAt,
        assignedCareOfficerId: household.assignedCareOfficerId,
        triageStatus: data.triageStatus,
      },
      include: {
        household: true,
        senior: true,
        assignedCareOfficer: {
          include: { internalUser: true },
        },
      },
    });

    return ticket;
  }

  async triageToServiceRequests(
    ticketId: string,
    items: Array<{ serviceCatalogVersionId: string; notes?: string }>,
    opsUserId: string,
  ) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { household: true },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    if (!items || items.length === 0) {
      throw new BadRequestException('At least one service item is required for triage');
    }

    return this.prisma.$transaction(async (tx) => {
      const createdRequests = [];

      for (const item of items) {
        const catalogVersion = await tx.serviceCatalogVersion.findUniqueOrThrow({
          where: { id: item.serviceCatalogVersionId },
        });

        const sr = await tx.serviceRequest.create({
          data: {
            ticketId,
            serviceCatalogVersionId: item.serviceCatalogVersionId,
            unitPricePaise: catalogVersion.pricePaise,
            status: ServiceRequestStatus.PENDING,
            assignedCareOfficerId: ticket.assignedCareOfficerId,
            notes: item.notes,
          },
          include: { serviceCatalogVersion: true },
        });

        createdRequests.push(sr);
      }

      // Update ticket status to ASSIGNED / IN_PROGRESS
      const updatedTicket = await tx.ticket.update({
        where: { id: ticketId },
        data: {
          status: ticket.assignedCareOfficerId ? TicketStatus.ASSIGNED : TicketStatus.OPEN,
          triageStatus: TriageStatus.CONFIRMED,
        },
        include: { serviceRequests: true },
      });

      return {
        ticket: updatedTicket,
        serviceRequests: createdRequests,
      };
    });
  }

  async recalculateRollupStatus(ticketId: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { serviceRequests: true },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    const childStatuses = ticket.serviceRequests.map((s) => s.status as ServiceRequestStatus);
    const rollupStatus = calculateTicketRollupStatus(childStatuses, ticket.status as TicketStatus);

    if (rollupStatus !== ticket.status) {
      const updated = await this.prisma.ticket.update({
        where: { id: ticketId },
        data: {
          status: rollupStatus,
          resolvedAt: rollupStatus === TicketStatus.RESOLVED ? new Date() : ticket.resolvedAt,
          closedAt: rollupStatus === TicketStatus.CLOSED ? new Date() : ticket.closedAt,
        },
      });
      return updated;
    }

    return ticket;
  }

  async resolveWaitingOpsUpdate(
    ticketId: string,
    action: 'RESUME_IN_PROGRESS' | 'RESOLVE' | 'CANCEL',
    opsUserId: string,
    notes?: string,
  ) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    let nextStatus: TicketStatus;
    if (action === 'RESUME_IN_PROGRESS') nextStatus = TicketStatus.IN_PROGRESS;
    else if (action === 'RESOLVE') nextStatus = TicketStatus.RESOLVED;
    else nextStatus = TicketStatus.CANCELLED;

    const updated = await this.prisma.ticket.update({
      where: { id: ticketId },
      data: {
        status: nextStatus,
        resolvedAt: nextStatus === TicketStatus.RESOLVED ? new Date() : ticket.resolvedAt,
      },
    });

    return updated;
  }

  async getAdminTickets(filters?: {
    status?: TicketStatus;
    slaStatus?: SlaStatus;
    triageStatus?: TriageStatus;
    householdId?: string;
  }) {
    return this.prisma.ticket.findMany({
      where: {
        status: filters?.status,
        slaStatus: filters?.slaStatus,
        triageStatus: filters?.triageStatus,
        householdId: filters?.householdId,
      },
      include: {
        household: true,
        senior: true,
        assignedCareOfficer: {
          include: { internalUser: true },
        },
        serviceRequests: {
          include: { serviceCatalogVersion: { include: { serviceCatalog: true } } },
        },
      },
      orderBy: [{ priority: 'asc' }, { responseDueAt: 'asc' }],
    });
  }

  async getTicketDetails(ticketId: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        household: true,
        senior: true,
        assignedCareOfficer: {
          include: { internalUser: true, manager: { include: { internalUser: true } } },
        },
        serviceRequests: {
          include: {
            serviceCatalogVersion: { include: { serviceCatalog: true } },
            sopProgress: { include: { sopStepVersion: true } },
          },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    return ticket;
  }
}

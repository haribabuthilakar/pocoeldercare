import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.module';
import { evaluateSlaStatus } from '@poco/business-rules';
import { SlaStatus, TicketStatus } from '@poco/constants';
import { CareOfficersService } from '../../care-officers/care-officers.service';

@Injectable()
export class SlaTransitionWorker {
  private readonly logger = new Logger(SlaTransitionWorker.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly careOfficersService: CareOfficersService,
  ) {}

  async processSlaTransitions(batchSize: number = 50, now: Date = new Date()) {
    // 1. Fetch active tickets that are not yet resolved/closed
    const activeTickets = await this.prisma.ticket.findMany({
      where: {
        status: {
          in: [
            TicketStatus.OPEN,
            TicketStatus.ASSIGNED,
            TicketStatus.IN_PROGRESS,
            TicketStatus.WAITING_FAMILY_INPUT,
            TicketStatus.WAITING_OPS_UPDATE,
          ],
        },
      },
      take: batchSize,
      orderBy: { createdAt: 'asc' },
    });

    let transitionedCount = 0;
    let breachedCount = 0;

    for (const ticket of activeTickets) {
      const evaluation = evaluateSlaStatus({
        createdAt: ticket.createdAt,
        responseDueAt: ticket.responseDueAt,
        deliveryDueAt: ticket.deliveryDueAt,
        now,
        isResponded: ticket.status !== TicketStatus.OPEN,
        isResolved: ticket.status === TicketStatus.RESOLVED || ticket.status === TicketStatus.CLOSED,
      });

      if (evaluation.overallSla !== ticket.slaStatus) {
        await this.prisma.ticket.update({
          where: { id: ticket.id },
          data: { slaStatus: evaluation.overallSla },
        });
        transitionedCount++;

        // If breached and has assigned officer, execute supervisor fallback escalation (SLA-04, CARE-05)
        if (evaluation.overallSla === SlaStatus.BREACHED && ticket.assignedCareOfficerId) {
          try {
            await this.careOfficersService.executeSupervisorFallback(ticket.id);
            breachedCount++;
            this.logger.warn(`Ticket ${ticket.id} breached SLA: escalated to supervising Senior Care Officer`);
          } catch (err: any) {
            this.logger.error(`Failed supervisor fallback for ticket ${ticket.id}: ${err.message}`);
          }
        }
      }
    }

    return {
      evaluatedCount: activeTickets.length,
      transitionedCount,
      breachedCount,
    };
  }
}

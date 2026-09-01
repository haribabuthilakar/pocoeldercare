import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.module';
import { AiTriageService } from '../ai-triage/ai-triage.service';
import { TicketsService } from '../tickets/tickets.service';
import { TicketPriority, TriageStatus } from '@poco/constants';

@Injectable()
export class ActivityFeedService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiTriageService: AiTriageService,
    private readonly ticketsService: TicketsService,
  ) {}

  async getHouseholdFeed(householdId: string, since?: Date) {
    const where: any = { householdId };
    if (since) {
      where.createdAt = { gt: since };
    }

    const items = await this.prisma.activityFeedItem.findMany({
      where,
      include: {
        authorPerson: true,
        authorInternalUser: true,
        ticket: true,
      },
      orderBy: { createdAt: 'asc' },
      take: 100,
    });

    return items.map((i) => ({
      id: i.id,
      householdId: i.householdId,
      eventType: i.eventType,
      author: i.authorPerson
        ? { id: i.authorPerson.id, name: i.authorPerson.name, type: 'PERSON' }
        : i.authorInternalUser
          ? { id: i.authorInternalUser.id, name: i.authorInternalUser.name, type: 'INTERNAL_USER' }
          : { id: 'system', name: 'Poco System', type: 'SYSTEM' },
      content: i.content,
      mediaUrls: i.mediaUrls,
      linkedTicketId: i.ticketId,
      triageStatus: i.aiTriageStatus,
      createdAt: i.createdAt,
    }));
  }

  async postFeedItem(data: {
    householdId: string;
    eventType: 'CHAT_MESSAGE' | 'VISIT_REPORT' | 'SYSTEM_EVENT' | 'VITAL_ALERT';
    authorPersonId?: string;
    authorInternalUserId?: string;
    content: string;
    mediaUrls?: string[];
  }) {
    const household = await this.prisma.household.findUnique({
      where: { id: data.householdId },
    });

    if (!household) {
      throw new NotFoundException('Household not found');
    }

    const item = await this.prisma.activityFeedItem.create({
      data: {
        householdId: data.householdId,
        eventType: data.eventType,
        authorPersonId: data.authorPersonId,
        authorInternalUserId: data.authorInternalUserId,
        content: data.content,
        mediaUrls: data.mediaUrls || [],
      },
    });

    // If chat message from family or staff, trigger AI classification triage
    if (data.eventType === 'CHAT_MESSAGE') {
      const classification = await this.aiTriageService.classifyMessage(data.content);

      if (classification.confidenceScore >= 0.75) {
        // Auto-create PENDING_TRIAGE ticket
        const ticket = await this.ticketsService.createTicket({
          householdId: data.householdId,
          title: classification.summary,
          description: data.content,
          priority: classification.priority as TicketPriority,
          triageStatus: TriageStatus.PENDING_TRIAGE,
        });

        await this.prisma.activityFeedItem.update({
          where: { id: item.id },
          data: {
            ticketId: ticket.id,
            aiTriageStatus: TriageStatus.PENDING_TRIAGE,
          },
        });
      }
    }

    return item;
  }
}

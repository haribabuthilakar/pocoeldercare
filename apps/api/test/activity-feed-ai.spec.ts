import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ActivityFeedService } from '../src/modules/activity-feed/activity-feed.service';
import { MockAiClassifierProvider } from '../src/modules/ai-triage/providers/mock.provider';
import { AnthropicAiClassifierProvider } from '../src/modules/ai-triage/providers/anthropic.provider';
import { OpenAiClassifierProvider } from '../src/modules/ai-triage/providers/openai.provider';
import { AiTriageService } from '../src/modules/ai-triage/ai-triage.service';
import { TicketsService } from '../src/modules/tickets/tickets.service';
import { TriageStatus } from '@poco/constants';

describe('Activity Feed & AI Triage Integration', () => {
  let feedService: ActivityFeedService;
  let aiTriageService: AiTriageService;
  let ticketsService: TicketsService;
  let prismaMock: any;

  beforeEach(() => {
    prismaMock = {
      household: { findUnique: vi.fn() },
      activityFeedItem: {
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      ticket: {
        create: vi.fn(),
      },
    };

    const mockProvider = new MockAiClassifierProvider();
    const anthropicProvider = new AnthropicAiClassifierProvider(mockProvider);
    const openAiProvider = new OpenAiClassifierProvider(mockProvider);
    aiTriageService = new AiTriageService(mockProvider, anthropicProvider, openAiProvider);
    ticketsService = new TicketsService(prismaMock as any);
    feedService = new ActivityFeedService(prismaMock as any, aiTriageService, ticketsService);
  });

  describe('FEED-01 & FEED-03: Activity Feed Retrieval & Delta Polling', () => {
    it('returns chronological blend of chat and system timeline events', async () => {
      const now = new Date();
      prismaMock.activityFeedItem.findMany.mockResolvedValue([
        {
          id: 'item-1',
          householdId: 'hh-1',
          eventType: 'SYSTEM_EVENT',
          content: 'Care officer assigned',
          mediaUrls: [],
          authorPerson: null,
          authorInternalUser: null,
          ticketId: null,
          aiTriageStatus: null,
          createdAt: new Date(now.getTime() - 1000 * 60 * 10),
        },
        {
          id: 'item-2',
          householdId: 'hh-1',
          eventType: 'CHAT_MESSAGE',
          content: 'Hello care officer!',
          mediaUrls: [],
          authorPerson: { id: 'p-1', name: 'Anand Rao' },
          authorInternalUser: null,
          ticketId: null,
          aiTriageStatus: null,
          createdAt: now,
        },
      ]);

      const feed = await feedService.getHouseholdFeed('hh-1');
      expect(feed.length).toBe(2);
      expect(feed[0].author.type).toBe('SYSTEM');
      expect(feed[1].author.name).toBe('Anand Rao');
      expect(feed[1].author.type).toBe('PERSON');
    });

    it('supports delta polling with since timestamp parameter', async () => {
      const since = new Date(Date.now() - 1000 * 60 * 5); // 5 min ago
      prismaMock.activityFeedItem.findMany.mockResolvedValue([]);

      await feedService.getHouseholdFeed('hh-1', since);
      expect(prismaMock.activityFeedItem.findMany).toHaveBeenCalledWith({
        where: { householdId: 'hh-1', createdAt: { gt: since } },
        include: expect.any(Object),
        orderBy: { createdAt: 'asc' },
        take: 100,
      });
    });
  });

  describe('FEED-04, FEED-05 & FEED-06: AI Classification & Auto Triage', () => {
    it('auto-creates PENDING_TRIAGE ticket when message contains high-confidence medical emergency', async () => {
      prismaMock.household.findUnique.mockResolvedValue({
        id: 'hh-1',
        assignedCareOfficerId: 'officer-1',
      });

      prismaMock.activityFeedItem.create.mockResolvedValue({
        id: 'item-alert-1',
        householdId: 'hh-1',
        content: 'Father has severe chest pain and breathlessness please help',
        eventType: 'CHAT_MESSAGE',
      });

      prismaMock.ticket.create.mockResolvedValue({
        id: 'ticket-emergency-1',
      });

      prismaMock.activityFeedItem.update.mockResolvedValue({
        id: 'item-alert-1',
        ticketId: 'ticket-emergency-1',
        aiTriageStatus: TriageStatus.PENDING_TRIAGE,
      });

      const posted = await feedService.postFeedItem({
        householdId: 'hh-1',
        eventType: 'CHAT_MESSAGE',
        authorPersonId: 'p-1',
        content: 'Father has severe chest pain and breathlessness please help',
      });

      expect(posted.id).toBe('item-alert-1');
      expect(prismaMock.ticket.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          householdId: 'hh-1',
          priority: 'EMERGENCY',
          triageStatus: TriageStatus.PENDING_TRIAGE,
        }),
        include: expect.any(Object),
      });
      expect(prismaMock.activityFeedItem.update).toHaveBeenCalledWith({
        where: { id: 'item-alert-1' },
        data: {
          ticketId: 'ticket-emergency-1',
          aiTriageStatus: TriageStatus.PENDING_TRIAGE,
        },
      });
    });

    it('does NOT create ticket for conversational casual message (confidence < 0.75)', async () => {
      prismaMock.household.findUnique.mockResolvedValue({
        id: 'hh-1',
        assignedCareOfficerId: 'officer-1',
      });

      prismaMock.activityFeedItem.create.mockResolvedValue({
        id: 'item-casual-1',
        householdId: 'hh-1',
        content: 'Thank you for the update Kavitha, have a great evening!',
        eventType: 'CHAT_MESSAGE',
      });

      await feedService.postFeedItem({
        householdId: 'hh-1',
        eventType: 'CHAT_MESSAGE',
        authorPersonId: 'p-1',
        content: 'Thank you for the update Kavitha, have a great evening!',
      });

      expect(prismaMock.ticket.create).not.toHaveBeenCalled();
    });
  });
});


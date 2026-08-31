import type { TriageStatus, TicketPriority } from '@poco/constants';

/**
 * Activity Feed Event Types.
 */
export type ActivityFeedEventType =
  | 'MESSAGE'
  | 'VISIT_REPORT'
  | 'VITAL_ALERT'
  | 'SYSTEM_EVENT'
  | 'TICKET_UPDATE'
  | 'BILLING_EVENT';

/**
 * Activity Feed Sender Classification.
 */
export type ActivityFeedSenderType = 'FAMILY' | 'CARE_OFFICER' | 'SYSTEM' | 'AI_BOT';

/**
 * Anthropic Claude AI Activity Feed Triage classification result.
 */
export interface AiTriageResult {
  confidence: number;
  isActionable: boolean;
  proposedCategory: string;
  proposedPriority: TicketPriority;
  suggestedAction: string;
  suggestedServiceCatalogCode?: string;
  reasoning: string;
  rawStructuredOutput?: Record<string, unknown>;
}

/**
 * Activity Feed Item domain contract.
 */
export interface ActivityFeedItemSummary {
  id: string;
  householdId: string;
  seniorId?: string;
  eventType: ActivityFeedEventType;
  senderType: ActivityFeedSenderType;
  senderId?: string;
  senderName: string;
  content: string;
  mediaUrls?: string[];
  metadata?: Record<string, unknown>;
  aiTriageStatus?: TriageStatus;
  aiTriageResult?: AiTriageResult;
  linkedTicketId?: string;
  createdAt: string;
}

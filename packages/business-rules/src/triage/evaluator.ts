import { TicketPriority, TriageStatus } from '@poco/constants';

export const AI_CONFIDENCE_THRESHOLD = 0.75;

export interface AiTriageInput {
  confidence: number;
  isActionable: boolean;
  predictedCategory?: string;
  predictedPriority?: TicketPriority;
  suggestedAction?: string;
}

export interface AiTriageDecision {
  action: 'AUTO_PROPOSE_TICKET' | 'REQUIRE_HUMAN_TRIAGE' | 'IGNORE';
  suggestedTriageStatus: TriageStatus;
  priority: TicketPriority;
  shouldAutoCreateTicket: boolean;
  reason: string;
}

/**
 * Pure function evaluating AI activity feed classification confidence score per D-56.
 */
export function evaluateAiClassificationResult(input: AiTriageInput): AiTriageDecision {
  const priority = input.predictedPriority ?? TicketPriority.ROUTINE;

  if (!input.isActionable) {
    return {
      action: 'IGNORE',
      suggestedTriageStatus: TriageStatus.DISMISSED,
      priority,
      shouldAutoCreateTicket: false,
      reason: 'AI classified message as non-actionable chatter'
    };
  }

  if (input.confidence >= AI_CONFIDENCE_THRESHOLD) {
    return {
      action: 'AUTO_PROPOSE_TICKET',
      suggestedTriageStatus: TriageStatus.PENDING_TRIAGE,
      priority,
      shouldAutoCreateTicket: true,
      reason: `High confidence (${(input.confidence * 100).toFixed(1)}% >= ${(AI_CONFIDENCE_THRESHOLD * 100)}%) - proposed for ops review`
    };
  }

  return {
    action: 'REQUIRE_HUMAN_TRIAGE',
    suggestedTriageStatus: TriageStatus.PENDING_TRIAGE,
    priority,
    shouldAutoCreateTicket: false,
    reason: `Low confidence (${(input.confidence * 100).toFixed(1)}% < ${(AI_CONFIDENCE_THRESHOLD * 100)}%) - requires manual ops review`
  };
}

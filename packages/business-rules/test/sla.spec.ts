import { describe, it, expect } from 'vitest';
import { TicketPriority, SlaStatus } from '@poco/constants';
import { calculateSlaDeadlines, evaluateSlaStatus } from '../src';
import { BASE_TEST_TIME, timeAfter } from '../src/testing';

describe('Dual SLA Engine & Escalations (SLA-02)', () => {
  describe('SLA Deadline Calculator', () => {
    it('calculates 15min response and 60min resolution for Emergency priorities', () => {
      const deadlines = calculateSlaDeadlines(BASE_TEST_TIME, TicketPriority.EMERGENCY);
      expect(deadlines.responseDueAt.getTime()).toBe(BASE_TEST_TIME.getTime() + 15 * 60 * 1000);
      expect(deadlines.deliveryDueAt.getTime()).toBe(BASE_TEST_TIME.getTime() + 60 * 60 * 1000);
    });

    it('calculates 240min (4hr) response and 1440min (24hr) resolution for Routine priorities', () => {
      const deadlines = calculateSlaDeadlines(BASE_TEST_TIME, TicketPriority.ROUTINE);
      expect(deadlines.responseDueAt.getTime()).toBe(BASE_TEST_TIME.getTime() + 240 * 60 * 1000);
      expect(deadlines.deliveryDueAt.getTime()).toBe(BASE_TEST_TIME.getTime() + 1440 * 60 * 1000);
    });
  });

  describe('SLA Status Evaluator', () => {
    const createdAt = BASE_TEST_TIME;
    const responseDueAt = timeAfter({ hours: 1 }, createdAt);
    const deliveryDueAt = timeAfter({ hours: 4 }, createdAt);

    it('evaluates NORMAL when elapsed time is under 75%', () => {
      const now = timeAfter({ hours: 1 }, createdAt); // 25% of delivery duration
      const result = evaluateSlaStatus({
        createdAt,
        responseDueAt,
        deliveryDueAt,
        now,
        isResponded: true,
        isResolved: false
      });

      expect(result.overallSla).toBe(SlaStatus.NORMAL);
      expect(result.requiresScoEscalation).toBe(false);
    });

    it('evaluates AT_RISK when elapsed time reaches 75% threshold', () => {
      const now = timeAfter({ hours: 3 }, createdAt); // 75% of 4 hours
      const result = evaluateSlaStatus({
        createdAt,
        responseDueAt,
        deliveryDueAt,
        now,
        isResponded: true,
        isResolved: false
      });

      expect(result.overallSla).toBe(SlaStatus.AT_RISK);
      expect(result.resolutionSla).toBe(SlaStatus.AT_RISK);
      expect(result.requiresScoEscalation).toBe(false);
    });

    it('evaluates BREACHED and flags Senior Care Officer escalation when overdue', () => {
      const now = timeAfter({ hours: 4, minutes: 15 }, createdAt); // Over 100%
      const result = evaluateSlaStatus({
        createdAt,
        responseDueAt,
        deliveryDueAt,
        now,
        isResponded: true,
        isResolved: false
      });

      expect(result.overallSla).toBe(SlaStatus.BREACHED);
      expect(result.resolutionSla).toBe(SlaStatus.BREACHED);
      expect(result.requiresScoEscalation).toBe(true); // Triggers SCO fallback escalation per SLA-02
    });
  });
});

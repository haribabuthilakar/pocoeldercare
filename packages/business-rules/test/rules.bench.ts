import { bench, describe } from 'vitest';
import { TicketStatus, TicketPriority } from '@poco/constants';
import {
  transitionTicket,
  evaluateSlaStatus,
  calculateDistanceMeters,
  evaluateBillingAction
} from '../src';
import { BASE_TEST_TIME, timeAfter } from '../src/testing';

describe('Performance Benchmarks (D-131)', () => {
  bench('transitionTicket: pure state transition', () => {
    transitionTicket(TicketStatus.OPEN, {
      type: 'ASSIGN_OFFICER',
      assignedCareOfficerId: 'officer-123'
    });
  });

  bench('evaluateSlaStatus: dual SLA temporal evaluator', () => {
    evaluateSlaStatus({
      createdAt: BASE_TEST_TIME,
      responseDueAt: timeAfter({ hours: 1 }, BASE_TEST_TIME),
      deliveryDueAt: timeAfter({ hours: 4 }, BASE_TEST_TIME),
      now: timeAfter({ hours: 3 }, BASE_TEST_TIME),
      isResponded: true,
      isDelivered: false
    });
  });

  bench('calculateDistanceMeters: pure Haversine calculation', () => {
    calculateDistanceMeters(12.9279, 77.6271, 12.9784, 77.6408);
  });

  bench('evaluateBillingAction: 3-step hierarchy evaluator', () => {
    evaluateBillingAction({
      serviceBasePricePaise: 40000,
      availableQuotaUnits: 1,
      walletCurrentBalancePaise: 50000,
      isEmergency: false
    });
  });
});

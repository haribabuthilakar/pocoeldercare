import { TicketStatus, TicketPriority } from '@poco/constants';
import { createMockTicket } from './factories';
import { BASE_TEST_TIME, timeAfter } from './time';

export function setupAtRiskTicketScenario() {
  const createdAt = BASE_TEST_TIME;
  const responseDueAt = timeAfter({ hours: 1 }, createdAt);
  const deliveryDueAt = timeAfter({ hours: 4 }, createdAt);

  // At 75% of delivery duration (3 hours elapsed out of 4)
  const evaluationTime = timeAfter({ hours: 3 }, createdAt);

  const ticket = createMockTicket({
    createdAt,
    responseDueAt,
    deliveryDueAt,
    status: TicketStatus.IN_PROGRESS
  });

  return { ticket, evaluationTime };
}

export function setupEmergencyBreachedScenario() {
  const createdAt = BASE_TEST_TIME;
  const responseDueAt = timeAfter({ minutes: 15 }, createdAt);
  const deliveryDueAt = timeAfter({ minutes: 45 }, createdAt);

  // At 50 minutes (100%+ breached)
  const evaluationTime = timeAfter({ minutes: 50 }, createdAt);

  const ticket = createMockTicket({
    createdAt,
    responseDueAt,
    deliveryDueAt,
    priority: TicketPriority.EMERGENCY,
    status: TicketPriority.EMERGENCY ? TicketStatus.OPEN : TicketStatus.IN_PROGRESS
  });

  return { ticket, evaluationTime };
}

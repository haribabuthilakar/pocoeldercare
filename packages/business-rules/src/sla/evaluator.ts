import { SlaStatus, SLA_THRESHOLDS } from '@poco/constants';

export interface SlaEvaluationInput {
  createdAt: Date;
  responseDueAt: Date;
  deliveryDueAt: Date;
  now?: Date;
  isResponded?: boolean;
  isResolved?: boolean;
}

export interface SlaEvaluationResult {
  overallSla: SlaStatus;
  responseSla: SlaStatus;
  resolutionSla: SlaStatus;
  requiresScoEscalation: boolean;
  timeRemainingMinutes: number;
}

/**
 * Pure function evaluating SLA status against current time.
 * Calculates NORMAL, AT_RISK (at 75% elapsed), and BREACHED (at 100%).
 * Triggers fallback Senior Care Officer escalation on breach per SLA-02 and D-51.
 */
export function evaluateSlaStatus(input: SlaEvaluationInput): SlaEvaluationResult {
  const now = input.now ?? new Date();
  const createdEpoch = input.createdAt.getTime();
  const responseEpoch = input.responseDueAt.getTime();
  const deliveryEpoch = input.deliveryDueAt.getTime();
  const nowEpoch = now.getTime();

  // 1. Evaluate Response SLA
  let responseSla = SlaStatus.NORMAL;
  if (input.isResponded) {
    responseSla = SlaStatus.NORMAL;
  } else {
    const totalResponseDuration = responseEpoch - createdEpoch;
    const elapsedResponse = nowEpoch - createdEpoch;

    if (nowEpoch >= responseEpoch) {
      responseSla = SlaStatus.BREACHED;
    } else if (totalResponseDuration > 0 && elapsedResponse / totalResponseDuration >= SLA_THRESHOLDS.AT_RISK_RATIO) {
      responseSla = SlaStatus.AT_RISK;
    }
  }

  // 2. Evaluate Resolution / Delivery SLA
  let resolutionSla = SlaStatus.NORMAL;
  if (input.isResolved) {
    resolutionSla = SlaStatus.NORMAL;
  } else {
    const totalDeliveryDuration = deliveryEpoch - createdEpoch;
    const elapsedDelivery = nowEpoch - createdEpoch;

    if (nowEpoch >= deliveryEpoch) {
      resolutionSla = SlaStatus.BREACHED;
    } else if (totalDeliveryDuration > 0 && elapsedDelivery / totalDeliveryDuration >= SLA_THRESHOLDS.AT_RISK_RATIO) {
      resolutionSla = SlaStatus.AT_RISK;
    }
  }

  // 3. Rollup Overall SLA (Worst of Response and Resolution)
  let overallSla = SlaStatus.NORMAL;
  if (responseSla === SlaStatus.BREACHED || resolutionSla === SlaStatus.BREACHED) {
    overallSla = SlaStatus.BREACHED;
  } else if (responseSla === SlaStatus.AT_RISK || resolutionSla === SlaStatus.AT_RISK) {
    overallSla = SlaStatus.AT_RISK;
  }

  const requiresScoEscalation = overallSla === SlaStatus.BREACHED;
  const timeRemainingMillis = Math.max(0, deliveryEpoch - nowEpoch);
  const timeRemainingMinutes = Math.round(timeRemainingMillis / (1000 * 60));

  return {
    overallSla,
    responseSla,
    resolutionSla,
    requiresScoEscalation,
    timeRemainingMinutes
  };
}

import { TicketPriority } from './statuses';

/**
 * SLA evaluation states.
 */
export enum SlaStatus {
  NORMAL = 'NORMAL',
  AT_RISK = 'AT_RISK',
  BREACHED = 'BREACHED'
}

export const SLA_STATUSES = Object.values(SlaStatus) as readonly SlaStatus[];

/**
 * SLA threshold ratios.
 */
export const SLA_THRESHOLDS = {
  AT_RISK_RATIO: 0.75, // 75% of time elapsed triggers AT_RISK state
  BREACH_RATIO: 1.0   // 100% of time elapsed triggers BREACHED state
} as const;

/**
 * Standard SLA duration configuration per ticket priority (in minutes).
 */
export interface SlaDurationConfig {
  responseMinutes: number;
  resolutionMinutes: number;
}

export const DEFAULT_SLA_CONFIG: Record<TicketPriority, SlaDurationConfig> = {
  [TicketPriority.EMERGENCY]: {
    responseMinutes: 15,
    resolutionMinutes: 60
  },
  [TicketPriority.URGENT]: {
    responseMinutes: 30,
    resolutionMinutes: 240
  },
  [TicketPriority.ROUTINE]: {
    responseMinutes: 240,
    resolutionMinutes: 1440
  }
} as const;

import type { PartnerCode, PartnerStatus, PartnerCategory } from '@poco/constants';

/**
 * Integration Partner Configuration and Status Contract.
 */
export interface IntegrationPartnerSummary {
  id: string;
  partnerCode: PartnerCode;
  name: string;
  category: PartnerCategory;
  status: PartnerStatus;
  mockSettings?: PartnerMockSettings;
  lastPingAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Mock settings for in-memory / development stubs.
 */
export interface PartnerMockSettings {
  simulatedLatencyMs: number;
  failureRatePercentage: number;
  mockResponseData?: Record<string, unknown>;
  autoAcknowledgeWebhooks: boolean;
}

/**
 * Standard Webhook Verification Context.
 */
export interface WebhookVerificationContext {
  rawBody: string;
  signatureHeader: string;
  secret: string;
  timestampHeader?: string;
}

/**
 * Standardized Partner Webhook Event Record.
 */
export interface PartnerWebhookEvent<T = Record<string, unknown>> {
  partnerCode: PartnerCode;
  eventId: string;
  eventType: string;
  payload: T;
  receivedAt: string;
}

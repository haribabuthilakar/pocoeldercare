import type { Result } from '@poco/business-rules';
import type { PartnerCode } from '@poco/constants';

export interface PartnerExecutionOptions {
  householdId?: string;
  ticketId?: string;
  serviceRequestId?: string;
  bypassFaultInjection?: boolean;
}

export interface PartnerExecutionError {
  partnerCode: PartnerCode;
  statusCode: number;
  errorCode: string;
  message: string;
  details?: unknown;
}

export interface WebhookDispatchResult {
  success: boolean;
  statusCode: number;
  responseBody?: unknown;
  error?: string;
}

export interface IPartnerAdapter<TRequest = unknown, TResponse = unknown> {
  readonly partnerCode: PartnerCode;
  readonly defaultEndpoint: string;

  execute(
    endpoint: string,
    payload: TRequest,
    options?: PartnerExecutionOptions
  ): Promise<Result<TResponse, PartnerExecutionError>>;

  triggerCallback(
    eventType: string,
    callbackPayload: Record<string, unknown>,
    delayMs?: number
  ): Promise<WebhookDispatchResult>;
}

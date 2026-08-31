import { ok, err } from '@poco/business-rules';
import type { Result } from '@poco/business-rules';
import type { PartnerCode } from '@poco/constants';
import type {
  IPartnerAdapter,
  PartnerExecutionOptions,
  PartnerExecutionError,
  WebhookDispatchResult
} from '../interfaces/partner-adapter.interface';
import type { FaultInjectorService } from './fault-injector.service';
import type { OutboundLoggerService } from './outbound-logger.service';

export abstract class BasePartnerAdapter<TRequest = unknown, TResponse = unknown>
  implements IPartnerAdapter<TRequest, TResponse>
{
  constructor(
    public readonly partnerCode: PartnerCode,
    public readonly defaultEndpoint: string,
    protected readonly faultInjector: FaultInjectorService,
    protected readonly outboundLogger: OutboundLoggerService
  ) {}

  /**
   * Concrete adapters implement this method to produce deterministic realistic payloads.
   */
  protected abstract handleMockExecution(
    endpoint: string,
    payload: TRequest,
    options?: PartnerExecutionOptions
  ): Promise<TResponse>;

  /**
   * Executes the partner API call with dynamic fault injection, latency delay, and outbound logging.
   */
  public async execute(
    endpoint: string = this.defaultEndpoint,
    payload: TRequest,
    options?: PartnerExecutionOptions
  ): Promise<Result<TResponse, PartnerExecutionError>> {
    const startTime = Date.now();

    try {
      // 1. Evaluate Dynamic Fault Injection
      if (!options?.bypassFaultInjection) {
        await this.faultInjector.evaluateAndDelay(this.partnerCode);
      }

      // 2. Execute Deterministic Mock Response
      const response = await this.handleMockExecution(endpoint, payload, options);
      const durationMs = Date.now() - startTime;

      // 3. Log Outbound Call Success
      await this.outboundLogger.logOutboundCall({
        partnerCode: this.partnerCode,
        endpoint,
        requestPayload: payload,
        responseStatus: 200,
        durationMs,
        householdId: options?.householdId,
        ticketId: options?.ticketId,
        serviceRequestId: options?.serviceRequestId
      });

      return ok(response);
    } catch (error: unknown) {
      const durationMs = Date.now() - startTime;
      let executionError: PartnerExecutionError;

      if (
        typeof error === 'object' &&
        error !== null &&
        'errorCode' in error &&
        'statusCode' in error
      ) {
        executionError = error as PartnerExecutionError;
      } else {
        executionError = {
          partnerCode: this.partnerCode,
          statusCode: 500,
          errorCode: 'UNEXPECTED_PARTNER_ERROR',
          message: error instanceof Error ? error.message : 'Unknown partner execution error',
          details: error
        };
      }

      // Log Outbound Call Failure
      await this.outboundLogger.logOutboundCall({
        partnerCode: this.partnerCode,
        endpoint,
        requestPayload: payload,
        responseStatus: executionError.statusCode,
        durationMs,
        errorMessage: executionError.message,
        householdId: options?.householdId,
        ticketId: options?.ticketId,
        serviceRequestId: options?.serviceRequestId
      });

      return err(executionError);
    }
  }

  /**
   * Dispatches or schedules a webhook callback.
   */
  public async triggerCallback(
    _eventType: string,
    _callbackPayload: Record<string, unknown>,
    _delayMs: number = 0
  ): Promise<WebhookDispatchResult> {
    return {
      success: true,
      statusCode: 200,
      responseBody: { message: 'Callback queued successfully' }
    };
  }
}

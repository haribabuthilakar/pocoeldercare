import { PartnerCode } from '@poco/constants';
import type {
  ExotelConnectCallReqDto,
  ExotelCallResDto,
  ExotelPassthruCallbackDto
} from '@poco/validation';
import {
  createMockExotelCall,
  createMockExotelPassthruCallback
} from '@poco/validation';
import { BasePartnerAdapter } from '../core/base-partner.adapter';
import type { FaultInjectorService } from '../core/fault-injector.service';
import type { OutboundLoggerService } from '../core/outbound-logger.service';
import type { CallbackSchedulerService } from '../core/callback-scheduler.service';
import type { PartnerExecutionOptions, WebhookDispatchResult } from '../interfaces/partner-adapter.interface';

export class ExotelAdapter extends BasePartnerAdapter<
  ExotelConnectCallReqDto | ExotelPassthruCallbackDto,
  ExotelCallResDto | { status: string; callSid: string }
> {
  constructor(
    faultInjector: FaultInjectorService,
    outboundLogger: OutboundLoggerService,
    private readonly scheduler?: CallbackSchedulerService
  ) {
    super(PartnerCode.EXOTEL, '/v1/Accounts/poco_exotel_sid/Calls/connect', faultInjector, outboundLogger);
  }

  protected async handleMockExecution(
    endpoint: string,
    payload: ExotelConnectCallReqDto | ExotelPassthruCallbackDto,
    _options?: PartnerExecutionOptions
  ): Promise<ExotelCallResDto | { status: string; callSid: string }> {
    if (endpoint.includes('Calls/connect') || 'from' in payload) {
      const req = payload as ExotelConnectCallReqDto;
      const res = createMockExotelCall({
        from: req.from,
        to: req.to
      });

      // Schedule call completed callback
      if (this.scheduler) {
        this.scheduler.scheduleCallback(
          PartnerCode.EXOTEL,
          'call-event',
          createMockExotelPassthruCallback({
            CallSid: res.callSid,
            From: req.from,
            To: req.to,
            Status: 'completed'
          }) as unknown as Record<string, unknown>,
          5000
        );
      }

      return res;
    }

    return { status: 'acknowledged', callSid: (payload as ExotelPassthruCallbackDto).CallSid };
  }

  /**
   * Simulates an inbound customer call with specific DTMF selection.
   */
  public async simulateInboundIvrCall(
    fromNumber: string,
    digitsPressed: string = '1',
    durationSeconds: number = 180
  ): Promise<WebhookDispatchResult> {
    const callbackPayload = createMockExotelPassthruCallback({
      From: fromNumber,
      Digits: digitsPressed,
      CallDuration: durationSeconds,
      DialCallDuration: durationSeconds - 5,
      Status: 'completed'
    });

    if (this.scheduler) {
      return this.scheduler.triggerInstantCallback(
        PartnerCode.EXOTEL,
        'call-event',
        callbackPayload as unknown as Record<string, unknown>
      );
    }

    return {
      success: true,
      statusCode: 200,
      responseBody: callbackPayload
    };
  }
}

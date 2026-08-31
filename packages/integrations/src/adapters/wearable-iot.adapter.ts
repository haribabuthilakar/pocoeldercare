import { PartnerCode } from '@poco/constants';
import type {
  WearableTelemetryPingDto,
  WearableAlertWebhookDto
} from '@poco/validation';
import {
  createMockWearablePing,
  createMockWearableAlert
} from '@poco/validation';
import { BasePartnerAdapter } from '../core/base-partner.adapter';
import type { FaultInjectorService } from '../core/fault-injector.service';
import type { OutboundLoggerService } from '../core/outbound-logger.service';
import type { CallbackSchedulerService } from '../core/callback-scheduler.service';
import type { PartnerExecutionOptions, WebhookDispatchResult } from '../interfaces/partner-adapter.interface';

export class WearableIotAdapter extends BasePartnerAdapter<
  WearableTelemetryPingDto | WearableAlertWebhookDto,
  { acknowledged: boolean; deviceId: string; eventType: string }
> {
  constructor(
    faultInjector: FaultInjectorService,
    outboundLogger: OutboundLoggerService,
    private readonly scheduler?: CallbackSchedulerService
  ) {
    super(PartnerCode.WEARABLE_IOT, '/api/webhooks/v1/wearable/ping', faultInjector, outboundLogger);
  }

  protected async handleMockExecution(
    endpoint: string,
    payload: WearableTelemetryPingDto | WearableAlertWebhookDto,
    _options?: PartnerExecutionOptions
  ): Promise<{ acknowledged: boolean; deviceId: string; eventType: string }> {
    const isAlert = endpoint.includes('fall-alert') || 'alertType' in payload;
    return {
      acknowledged: true,
      deviceId: payload.deviceId,
      eventType: isAlert ? 'FALL_ALERT' : 'TELEMETRY_PING'
    };
  }

  /**
   * Simulates an hourly silent heartbeat telemetry ping.
   */
  public async simulateHourlyPing(seniorId: string, deviceId: string = 'WR-SENIOR-1092'): Promise<WebhookDispatchResult> {
    const payload = createMockWearablePing(seniorId, { deviceId });

    if (this.scheduler) {
      return this.scheduler.triggerInstantCallback(
        PartnerCode.WEARABLE_IOT,
        'ping',
        payload as unknown as Record<string, unknown>
      );
    }

    return {
      success: true,
      statusCode: 200,
      responseBody: payload
    };
  }

  /**
   * Simulates a sudden real-time fall detection or physical SOS button press.
   */
  public async simulateFallAlert(
    seniorId: string,
    alertType: 'FALL_DETECTED' | 'SOS_BUTTON_PRESSED' = 'FALL_DETECTED',
    deviceId: string = 'WR-SENIOR-1092'
  ): Promise<WebhookDispatchResult> {
    const payload = createMockWearableAlert(seniorId, {
      deviceId,
      alertType,
      metrics: {
        impactGForce: alertType === 'FALL_DETECTED' ? 3.8 : 1.1,
        heartRateBpm: 135,
        spo2: 95
      }
    });

    if (this.scheduler) {
      return this.scheduler.triggerInstantCallback(
        PartnerCode.WEARABLE_IOT,
        'fall-alert',
        payload as unknown as Record<string, unknown>
      );
    }

    return {
      success: true,
      statusCode: 200,
      responseBody: payload
    };
  }
}

import { PartnerCode } from '@poco/constants';
import type {
  InstamartOrderReqDto,
  InstamartOrderResDto,
  InstamartTrackingWebhookDto
} from '@poco/validation';
import { createMockInstamartOrder } from '@poco/validation';
import { BasePartnerAdapter } from '../core/base-partner.adapter';
import type { FaultInjectorService } from '../core/fault-injector.service';
import type { OutboundLoggerService } from '../core/outbound-logger.service';
import type { CallbackSchedulerService } from '../core/callback-scheduler.service';
import type { PartnerExecutionOptions } from '../interfaces/partner-adapter.interface';

export class InstamartAdapter extends BasePartnerAdapter<
  InstamartOrderReqDto,
  InstamartOrderResDto
> {
  constructor(
    faultInjector: FaultInjectorService,
    outboundLogger: OutboundLoggerService,
    private readonly scheduler?: CallbackSchedulerService
  ) {
    super(PartnerCode.INSTAMART, '/api/v1/orders', faultInjector, outboundLogger);
  }

  protected async handleMockExecution(
    _endpoint: string,
    payload: InstamartOrderReqDto,
    _options?: PartnerExecutionOptions
  ): Promise<InstamartOrderResDto> {
    const totalPaise = payload.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPricePaise,
      0
    );

    const res = createMockInstamartOrder({
      totalPaise: totalPaise || 34500
    });

    if (this.scheduler) {
      this.scheduleTrackingStages(res.orderId, payload.serviceRequestId);
    }

    return res;
  }

  public scheduleTrackingStages(orderId: string, serviceRequestId?: string, delayScale: number = 1): void {
    if (!this.scheduler) return;

    const stages: Array<{ status: InstamartTrackingWebhookDto['status']; delay: number }> = [
      { status: 'PICKED_UP', delay: 3000 * delayScale },
      { status: 'ARRIVED_NEARBY', delay: 8000 * delayScale },
      { status: 'DELIVERED', delay: 15000 * delayScale }
    ];

    for (const { status, delay } of stages) {
      const payload: InstamartTrackingWebhookDto = {
        orderId,
        serviceRequestId,
        status,
        deliveryPartnerName: 'Santosh',
        deliveredAt: status === 'DELIVERED' ? new Date() : undefined,
        timestamp: new Date()
      };

      this.scheduler.scheduleCallback(
        PartnerCode.INSTAMART,
        'order-status',
        payload as unknown as Record<string, unknown>,
        delay
      );
    }
  }
}

import { PartnerCode } from '@poco/constants';
import type {
  SwiggyMealOrderReqDto,
  SwiggyOrderResDto,
  SwiggyDeliveryWebhookDto
} from '@poco/validation';
import { createMockSwiggyOrder } from '@poco/validation';
import { BasePartnerAdapter } from '../core/base-partner.adapter';
import type { FaultInjectorService } from '../core/fault-injector.service';
import type { OutboundLoggerService } from '../core/outbound-logger.service';
import type { CallbackSchedulerService } from '../core/callback-scheduler.service';
import type { PartnerExecutionOptions } from '../interfaces/partner-adapter.interface';

export class SwiggyAdapter extends BasePartnerAdapter<
  SwiggyMealOrderReqDto,
  SwiggyOrderResDto
> {
  constructor(
    faultInjector: FaultInjectorService,
    outboundLogger: OutboundLoggerService,
    private readonly scheduler?: CallbackSchedulerService
  ) {
    super(PartnerCode.SWIGGY, '/partner/order/create', faultInjector, outboundLogger);
  }

  protected async handleMockExecution(
    _endpoint: string,
    payload: SwiggyMealOrderReqDto,
    _options?: PartnerExecutionOptions
  ): Promise<SwiggyOrderResDto> {
    const totalPaise = payload.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPricePaise,
      0
    );

    const res = createMockSwiggyOrder({
      totalPaise: totalPaise || 42000
    });

    if (this.scheduler) {
      this.scheduleMealDeliveryStages(res.orderId, payload.serviceRequestId);
    }

    return res;
  }

  public scheduleMealDeliveryStages(orderId: string, serviceRequestId?: string, delayScale: number = 1): void {
    if (!this.scheduler) return;

    const stages: Array<{ status: SwiggyDeliveryWebhookDto['status']; delay: number }> = [
      { status: 'RIDER_ASSIGNED', delay: 3000 * delayScale },
      { status: 'OUT_FOR_DELIVERY', delay: 8000 * delayScale },
      { status: 'DELIVERED', delay: 18000 * delayScale }
    ];

    for (const { status, delay } of stages) {
      const payload: SwiggyDeliveryWebhookDto = {
        orderId,
        serviceRequestId,
        status,
        riderName: 'Manjunath K',
        riderPhone: '+919844001122',
        deliveredAt: status === 'DELIVERED' ? new Date() : undefined,
        timestamp: new Date()
      };

      this.scheduler.scheduleCallback(
        PartnerCode.SWIGGY,
        'order-status',
        payload as unknown as Record<string, unknown>,
        delay
      );
    }
  }
}

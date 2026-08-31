import { PartnerCode } from '@poco/constants';
import type {
  OneMgOrderCreateReqDto,
  OneMgOrderResDto,
  OneMgDeliveryWebhookDto
} from '@poco/validation';
import { createMockOneMgOrder } from '@poco/validation';
import { BasePartnerAdapter } from '../core/base-partner.adapter';
import type { FaultInjectorService } from '../core/fault-injector.service';
import type { OutboundLoggerService } from '../core/outbound-logger.service';
import type { CallbackSchedulerService } from '../core/callback-scheduler.service';
import type { PartnerExecutionOptions } from '../interfaces/partner-adapter.interface';

export class OneMgAdapter extends BasePartnerAdapter<
  OneMgOrderCreateReqDto,
  OneMgOrderResDto
> {
  constructor(
    faultInjector: FaultInjectorService,
    outboundLogger: OutboundLoggerService,
    private readonly scheduler?: CallbackSchedulerService
  ) {
    super(PartnerCode.ONE_MG, '/partner/v2/orders', faultInjector, outboundLogger);
  }

  protected async handleMockExecution(
    _endpoint: string,
    payload: OneMgOrderCreateReqDto,
    _options?: PartnerExecutionOptions
  ): Promise<OneMgOrderResDto> {
    const totalAmountPaise = payload.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPricePaise,
      0
    );

    const res = createMockOneMgOrder({
      totalAmountPaise: totalAmountPaise || 84000
    });

    if (this.scheduler) {
      this.scheduleDeliveryStages(res.orderId, payload.serviceRequestId);
    }

    return res;
  }

  /**
   * Schedules simulated 1mg delivery stages:
   * 1. PHARMACIST_VERIFIED (T+3s)
   * 2. DISPATCHED (T+8s)
   * 3. OUT_FOR_DELIVERY (T+15s)
   * 4. DELIVERED (T+25s)
   */
  public scheduleDeliveryStages(orderId: string, serviceRequestId?: string, delayScale: number = 1): void {
    if (!this.scheduler) return;

    const stages: Array<{ status: OneMgDeliveryWebhookDto['status']; delay: number }> = [
      { status: 'PHARMACIST_VERIFIED', delay: 3000 * delayScale },
      { status: 'DISPATCHED', delay: 8000 * delayScale },
      { status: 'OUT_FOR_DELIVERY', delay: 15000 * delayScale },
      { status: 'DELIVERED', delay: 25000 * delayScale }
    ];

    for (const { status, delay } of stages) {
      const payload: OneMgDeliveryWebhookDto = {
        orderId,
        serviceRequestId,
        status,
        deliveryRiderName: status === 'DELIVERED' || status === 'OUT_FOR_DELIVERY' ? 'Vikram Singh' : undefined,
        deliveryRiderPhone: status === 'DELIVERED' || status === 'OUT_FOR_DELIVERY' ? '+919877112233' : undefined,
        deliveredAt: status === 'DELIVERED' ? new Date() : undefined,
        timestamp: new Date()
      };

      this.scheduler.scheduleCallback(
        PartnerCode.ONE_MG,
        'order-status',
        payload as unknown as Record<string, unknown>,
        delay
      );
    }
  }
}

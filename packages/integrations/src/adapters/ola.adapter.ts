import { PartnerCode } from '@poco/constants';
import type {
  OlaRideBookingReqDto,
  OlaRideResDto,
  OlaRideStatusWebhookDto
} from '@poco/validation';
import { createMockOlaRide } from '@poco/validation';
import { BasePartnerAdapter } from '../core/base-partner.adapter';
import type { FaultInjectorService } from '../core/fault-injector.service';
import type { OutboundLoggerService } from '../core/outbound-logger.service';
import type { CallbackSchedulerService } from '../core/callback-scheduler.service';
import type { PartnerExecutionOptions } from '../interfaces/partner-adapter.interface';

export class OlaAdapter extends BasePartnerAdapter<
  OlaRideBookingReqDto,
  OlaRideResDto
> {
  constructor(
    faultInjector: FaultInjectorService,
    outboundLogger: OutboundLoggerService,
    private readonly scheduler?: CallbackSchedulerService
  ) {
    super(PartnerCode.OLA, '/v1/bookings/create', faultInjector, outboundLogger);
  }

  protected async handleMockExecution(
    _endpoint: string,
    payload: OlaRideBookingReqDto,
    _options?: PartnerExecutionOptions
  ): Promise<OlaRideResDto> {
    const res = createMockOlaRide();

    if (this.scheduler) {
      this.scheduleRideStages(res.bookingId, payload.serviceRequestId);
    }

    return res;
  }

  public scheduleRideStages(bookingId: string, serviceRequestId?: string, delayScale: number = 1): void {
    if (!this.scheduler) return;

    const stages: Array<{ status: OlaRideStatusWebhookDto['status']; delay: number }> = [
      { status: 'CAB_ARRIVED', delay: 3000 * delayScale },
      { status: 'TRIP_STARTED', delay: 7000 * delayScale },
      { status: 'TRIP_COMPLETED', delay: 18000 * delayScale }
    ];

    for (const { status, delay } of stages) {
      const payload: OlaRideStatusWebhookDto = {
        bookingId,
        serviceRequestId,
        status,
        currentLocation: { lat: 12.9716, lng: 77.5946 },
        finalFarePaise: status === 'TRIP_COMPLETED' ? 38000 : undefined,
        completedAt: status === 'TRIP_COMPLETED' ? new Date() : undefined,
        timestamp: new Date()
      };

      this.scheduler.scheduleCallback(
        PartnerCode.OLA,
        'ride-status',
        payload as unknown as Record<string, unknown>,
        delay
      );
    }
  }
}

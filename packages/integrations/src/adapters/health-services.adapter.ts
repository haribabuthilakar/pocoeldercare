import { PartnerCode } from '@poco/constants';
import type {
  HealthServicesAttendantReqDto,
  HealthServicesBookingResDto,
  HealthServicesShiftWebhookDto
} from '@poco/validation';
import { createMockHealthServicesBooking } from '@poco/validation';
import { BasePartnerAdapter } from '../core/base-partner.adapter';
import type { FaultInjectorService } from '../core/fault-injector.service';
import type { OutboundLoggerService } from '../core/outbound-logger.service';
import type { CallbackSchedulerService } from '../core/callback-scheduler.service';
import type { PartnerExecutionOptions } from '../interfaces/partner-adapter.interface';

export class HealthServicesAdapter extends BasePartnerAdapter<
  HealthServicesAttendantReqDto,
  HealthServicesBookingResDto
> {
  constructor(
    faultInjector: FaultInjectorService,
    outboundLogger: OutboundLoggerService,
    private readonly scheduler?: CallbackSchedulerService
  ) {
    super(PartnerCode.HEALTH_SERVICES, '/api/v1/teleconsult/schedule', faultInjector, outboundLogger);
  }

  protected async handleMockExecution(
    _endpoint: string,
    payload: HealthServicesAttendantReqDto,
    _options?: PartnerExecutionOptions
  ): Promise<HealthServicesBookingResDto> {
    const res = createMockHealthServicesBooking({
      chargePaise: payload.serviceType.includes('NURSING') ? 150000 : 80000
    });

    if (this.scheduler) {
      this.scheduleShiftStages(res.bookingId, payload.serviceRequestId);
    }

    return res;
  }

  /**
   * Schedules simulated nursing shift or teleconsult stages.
   */
  public scheduleShiftStages(bookingId: string, serviceRequestId?: string, delayScale: number = 1): void {
    if (!this.scheduler) return;

    const stages: Array<{ status: HealthServicesShiftWebhookDto['status']; delay: number }> = [
      { status: 'ATTENDANT_ASSIGNED', delay: 3000 * delayScale },
      { status: 'SHIFT_STARTED', delay: 8000 * delayScale },
      { status: 'SHIFT_ENDED', delay: 20000 * delayScale }
    ];

    for (const { status, delay } of stages) {
      const payload: HealthServicesShiftWebhookDto = {
        bookingId,
        serviceRequestId,
        status,
        vitalsObserved: status === 'SHIFT_ENDED' ? { bp: '128/82', pulse: 74, spo2: 98 } : undefined,
        doctorNotes: status === 'SHIFT_ENDED' ? 'Senior vitals stable throughout shift.' : undefined,
        completedAt: status === 'SHIFT_ENDED' ? new Date() : undefined,
        timestamp: new Date()
      };

      this.scheduler.scheduleCallback(
        PartnerCode.HEALTH_SERVICES,
        'consultation-summary',
        payload as unknown as Record<string, unknown>,
        delay
      );
    }
  }
}

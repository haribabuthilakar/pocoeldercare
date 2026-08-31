import { PartnerCode } from '@poco/constants';
import type {
  OrangeLabsPhlebotomyReqDto,
  OrangeLabsBookingResDto,
  OrangeLabsReportWebhookDto
} from '@poco/validation';
import { createMockOrangeLabsBooking } from '@poco/validation';
import { BasePartnerAdapter } from '../core/base-partner.adapter';
import type { FaultInjectorService } from '../core/fault-injector.service';
import type { OutboundLoggerService } from '../core/outbound-logger.service';
import type { CallbackSchedulerService } from '../core/callback-scheduler.service';
import type { PartnerExecutionOptions } from '../interfaces/partner-adapter.interface';

export class OrangeLabsAdapter extends BasePartnerAdapter<
  OrangeLabsPhlebotomyReqDto,
  OrangeLabsBookingResDto
> {
  constructor(
    faultInjector: FaultInjectorService,
    outboundLogger: OutboundLoggerService,
    private readonly scheduler?: CallbackSchedulerService
  ) {
    super(PartnerCode.ORANGE_LABS, '/api/v1/bookings', faultInjector, outboundLogger);
  }

  protected async handleMockExecution(
    _endpoint: string,
    payload: OrangeLabsPhlebotomyReqDto,
    _options?: PartnerExecutionOptions
  ): Promise<OrangeLabsBookingResDto> {
    const res = createMockOrangeLabsBooking({
      appointmentSlot: payload.appointmentSlot.toISOString()
    });

    if (this.scheduler) {
      this.scheduleReportStages(res.bookingId, payload.serviceRequestId);
    }

    return res;
  }

  /**
   * Schedules diagnostic sample & report stages.
   */
  public scheduleReportStages(bookingId: string, serviceRequestId?: string, delayScale: number = 1): void {
    if (!this.scheduler) return;

    const stages: Array<{ status: OrangeLabsReportWebhookDto['status']; delay: number }> = [
      { status: 'PHLEBOTOMIST_ASSIGNED', delay: 3000 * delayScale },
      { status: 'SAMPLE_COLLECTED', delay: 8000 * delayScale },
      { status: 'SAMPLE_IN_LAB', delay: 15000 * delayScale },
      { status: 'REPORT_READY', delay: 25000 * delayScale }
    ];

    for (const { status, delay } of stages) {
      const payload: OrangeLabsReportWebhookDto = {
        bookingId,
        serviceRequestId,
        status,
        reportPdfUrl: status === 'REPORT_READY' ? 'https://reports.orangelabs.in/pdf/OL-REP-8821.pdf' : undefined,
        biomarkers: status === 'REPORT_READY' ? [
          { testName: 'Total Cholesterol', value: 210, unit: 'mg/dL', referenceRange: '< 200', status: 'HIGH' },
          { testName: 'HbA1c', value: 6.8, unit: '%', referenceRange: '< 5.7', status: 'BORDERLINE' }
        ] : undefined,
        collectedAt: status !== 'PHLEBOTOMIST_ASSIGNED' ? new Date() : undefined,
        reportGeneratedAt: status === 'REPORT_READY' ? new Date() : undefined,
        timestamp: new Date()
      };

      this.scheduler.scheduleCallback(
        PartnerCode.ORANGE_LABS,
        'report-ready',
        payload as unknown as Record<string, unknown>,
        delay
      );
    }
  }
}

import { PartnerCode } from '@poco/constants';
import type {
  UrbanCompanyJobReqDto,
  UrbanCompanyJobResDto,
  UrbanCompanyJobStatusWebhookDto
} from '@poco/validation';
import { createMockUrbanCompanyJob } from '@poco/validation';
import { BasePartnerAdapter } from '../core/base-partner.adapter';
import type { FaultInjectorService } from '../core/fault-injector.service';
import type { OutboundLoggerService } from '../core/outbound-logger.service';
import type { CallbackSchedulerService } from '../core/callback-scheduler.service';
import type { PartnerExecutionOptions } from '../interfaces/partner-adapter.interface';

export class UrbanCompanyAdapter extends BasePartnerAdapter<
  UrbanCompanyJobReqDto,
  UrbanCompanyJobResDto
> {
  constructor(
    faultInjector: FaultInjectorService,
    outboundLogger: OutboundLoggerService,
    private readonly scheduler?: CallbackSchedulerService
  ) {
    super(PartnerCode.URBAN_COMPANY, '/partner/v1/job/book', faultInjector, outboundLogger);
  }

  protected async handleMockExecution(
    _endpoint: string,
    payload: UrbanCompanyJobReqDto,
    _options?: PartnerExecutionOptions
  ): Promise<UrbanCompanyJobResDto> {
    const res = createMockUrbanCompanyJob();

    if (this.scheduler) {
      this.scheduleJobStages(res.jobId, payload.serviceRequestId);
    }

    return res;
  }

  public scheduleJobStages(jobId: string, serviceRequestId?: string, delayScale: number = 1): void {
    if (!this.scheduler) return;

    const stages: Array<{ status: UrbanCompanyJobStatusWebhookDto['status']; delay: number }> = [
      { status: 'PROFESSIONAL_ASSIGNED', delay: 3000 * delayScale },
      { status: 'STARTED', delay: 8000 * delayScale },
      { status: 'COMPLETED', delay: 20000 * delayScale }
    ];

    for (const { status, delay } of stages) {
      const payload: UrbanCompanyJobStatusWebhookDto = {
        jobId,
        serviceRequestId,
        status,
        completionNotes: status === 'COMPLETED' ? 'Home safety check and grab bar installation completed successfully.' : undefined,
        completedAt: status === 'COMPLETED' ? new Date() : undefined,
        timestamp: new Date()
      };

      this.scheduler.scheduleCallback(
        PartnerCode.URBAN_COMPANY,
        'job-status',
        payload as unknown as Record<string, unknown>,
        delay
      );
    }
  }
}

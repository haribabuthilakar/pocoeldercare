import { PartnerCode } from '@poco/constants';
import type {
  PococareDispatchReqDto,
  PococareDispatchResDto,
  PococareMedicalProfileSyncDto,
  PococareAmbulanceWebhookDto
} from '@poco/validation';
import { createMockPococareDispatch } from '@poco/validation';
import { BasePartnerAdapter } from '../core/base-partner.adapter';
import type { FaultInjectorService } from '../core/fault-injector.service';
import type { OutboundLoggerService } from '../core/outbound-logger.service';
import type { CallbackSchedulerService } from '../core/callback-scheduler.service';
import type { PartnerExecutionOptions, WebhookDispatchResult } from '../interfaces/partner-adapter.interface';

export class PococareAdapter extends BasePartnerAdapter<
  PococareDispatchReqDto | PococareMedicalProfileSyncDto,
  PococareDispatchResDto | { synced: boolean; patientId: string }
> {
  constructor(
    faultInjector: FaultInjectorService,
    outboundLogger: OutboundLoggerService,
    private readonly scheduler?: CallbackSchedulerService
  ) {
    super(PartnerCode.POCOCARE, '/api/v1/emergency/dispatch', faultInjector, outboundLogger);
  }

  protected async handleMockExecution(
    endpoint: string,
    payload: PococareDispatchReqDto | PococareMedicalProfileSyncDto,
    _options?: PartnerExecutionOptions
  ): Promise<PococareDispatchResDto | { synced: boolean; patientId: string }> {
    if (endpoint.includes('medical-profile')) {
      const syncPayload = payload as PococareMedicalProfileSyncDto;
      return {
        synced: true,
        patientId: syncPayload.patientId
      };
    }

    const dispatchReq = payload as PococareDispatchReqDto;
    const dispatchRes = createMockPococareDispatch({
      status: 'AMBULANCE_DISPATCHED',
      etaMinutes: 12
    });

    // Auto-schedule multi-stage emergency progression if scheduler available
    if (this.scheduler) {
      this.scheduleProgressionStages(dispatchRes.dispatchId, dispatchReq.patientId);
    }

    return dispatchRes;
  }

  /**
   * Schedules multi-stage lifecycle callbacks:
   * 1. PARAMEDIC_ASSIGNED (T+5s)
   * 2. ARRIVED_AT_SCENE (T+15s)
   * 3. HOSPITAL_ADMITTED (T+30s)
   */
  public scheduleProgressionStages(dispatchId: string, patientId: string, delayScale: number = 1): void {
    if (!this.scheduler) return;

    const stages: Array<{ stage: PococareAmbulanceWebhookDto['stage']; delay: number; eta: number }> = [
      { stage: 'PARAMEDIC_ASSIGNED', delay: 5000 * delayScale, eta: 8 },
      { stage: 'ARRIVED_AT_SCENE', delay: 15000 * delayScale, eta: 0 },
      { stage: 'HOSPITAL_ADMITTED', delay: 30000 * delayScale, eta: 0 }
    ];

    for (const { stage, delay, eta } of stages) {
      const callbackPayload: PococareAmbulanceWebhookDto = {
        dispatchId,
        patientId,
        stage,
        etaMinutes: eta,
        currentLocation: { lat: 12.9716, lng: 77.5946 },
        hospitalAdmissionId: stage === 'HOSPITAL_ADMITTED' ? `ADM-${Math.floor(10000 + Math.random() * 90000)}` : undefined,
        hospitalName: stage === 'HOSPITAL_ADMITTED' ? 'Apollo Hospital Indiranagar' : undefined,
        timestamp: new Date()
      };

      this.scheduler.scheduleCallback(
        PartnerCode.POCOCARE,
        'ambulance-status',
        callbackPayload as unknown as Record<string, unknown>,
        delay
      );
    }
  }

  public override async triggerCallback(
    eventType: string,
    callbackPayload: Record<string, unknown>,
    delayMs: number = 0
  ): Promise<WebhookDispatchResult> {
    if (this.scheduler) {
      return this.scheduler.triggerInstantCallback(PartnerCode.POCOCARE, eventType, callbackPayload);
    }
    return super.triggerCallback(eventType, callbackPayload, delayMs);
  }
}

import { PartnerCode } from '@poco/constants';
import type { CallbackSchedulerService } from '../core/callback-scheduler.service';
import type { FaultInjectorService } from '../core/fault-injector.service';
import type { MockSettings } from '../interfaces/mock-settings.interface';

export interface TriggerCallbackReq {
  eventType?: string;
  payload?: Record<string, unknown>;
  targetUrl?: string;
}

export class TestHarnessController {
  constructor(
    private readonly callbackScheduler: CallbackSchedulerService,
    private readonly faultInjector: FaultInjectorService
  ) {}

  /**
   * Triggers an instant signed webhook callback for a partner.
   * Matches POST /api/test/integrations/:partner/callback
   */
  public async handleTriggerCallback(
    partnerCodeParam: string,
    body: TriggerCallbackReq
  ) {
    const partnerCode = partnerCodeParam.toUpperCase().replace(/-/g, '_') as PartnerCode;
    const eventType = body.eventType ?? 'default';
    const payload = body.payload ?? {};

    const result = await this.callbackScheduler.triggerInstantCallback(
      partnerCode,
      eventType,
      payload,
      body.targetUrl
    );

    return {
      partnerCode,
      eventType,
      dispatched: result.success,
      statusCode: result.statusCode,
      result: result.responseBody,
      error: result.error
    };
  }

  /**
   * Returns list of currently scheduled pending callbacks.
   * Matches GET /api/test/integrations/pending-callbacks
   */
  public handleGetPendingCallbacks() {
    const tasks = this.callbackScheduler.getPendingTasks();
    return {
      count: tasks.length,
      tasks: tasks.map((t) => ({
        id: t.id,
        partnerCode: t.partnerCode,
        eventType: t.eventType,
        executeAt: new Date(t.executeAt).toISOString(),
        targetUrl: t.targetUrl
      }))
    };
  }

  /**
   * Updates mock settings in-memory or in database.
   * Matches POST /api/test/integrations/mock-settings/:partner
   */
  public async handleUpdateMockSettings(
    partnerCodeParam: string,
    settings: Partial<MockSettings>
  ) {
    const partnerCode = partnerCodeParam.toUpperCase().replace(/-/g, '_') as PartnerCode;
    this.faultInjector.setMockSettings(partnerCode, settings);
    return {
      partnerCode,
      settings: await this.faultInjector.getMockSettings(partnerCode)
    };
  }
}

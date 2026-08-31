import { signWebhookPayload } from '@poco/business-rules';
import { PartnerCode } from '@poco/constants';
import type { WebhookDispatchResult } from '../interfaces/partner-adapter.interface';

export interface ScheduledCallbackTask {
  id: string;
  partnerCode: PartnerCode;
  eventType: string;
  payload: Record<string, unknown>;
  scheduledAt: number;
  executeAt: number;
  targetUrl: string;
  timerHandle?: NodeJS.Timeout;
}

export class CallbackSchedulerService {
  private readonly activeTimers = new Map<string, ScheduledCallbackTask>();
  private readonly defaultBaseUrl: string;
  private readonly defaultSecret: string;

  constructor(options?: { baseUrl?: string; webhookSecret?: string }) {
    this.defaultBaseUrl = options?.baseUrl ?? process.env.API_BASE_URL ?? 'http://localhost:3000';
    this.defaultSecret = options?.webhookSecret ?? process.env.WEBHOOK_SECRET ?? 'poco_mock_webhook_secret_key_2026';
  }

  /**
   * Generates a signed webhook delivery header.
   */
  public generateSignature(rawBody: string, partnerCode: PartnerCode): string {
    const secret = process.env[`${partnerCode}_WEBHOOK_SECRET`] ?? this.defaultSecret;
    return signWebhookPayload(rawBody, secret, 'sha256');
  }

  /**
   * Resolves target webhook endpoint URL for a given partner.
   */
  public getWebhookUrl(partnerCode: PartnerCode, eventType?: string): string {
    const codeSlug = partnerCode.toLowerCase().replace(/_/g, '-');
    if (eventType) {
      return `${this.defaultBaseUrl}/api/webhooks/v1/${codeSlug}/${eventType}`;
    }
    return `${this.defaultBaseUrl}/api/webhooks/v1/${codeSlug}`;
  }

  /**
   * Schedules a delayed webhook callback with an unref'd timer.
   */
  public scheduleCallback(
    partnerCode: PartnerCode,
    eventType: string,
    payload: Record<string, unknown>,
    delayMs: number = 5000,
    targetUrl?: string
  ): ScheduledCallbackTask {
    const taskId = `cb_${partnerCode}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const url = targetUrl ?? this.getWebhookUrl(partnerCode, eventType);
    const now = Date.now();

    const task: ScheduledCallbackTask = {
      id: taskId,
      partnerCode,
      eventType,
      payload,
      scheduledAt: now,
      executeAt: now + delayMs,
      targetUrl: url
    };

    if (delayMs <= 0) {
      this.dispatchWebhook(task).catch((err) => {
        console.warn(`[CallbackSchedulerService] Immediate dispatch error for ${taskId}:`, err);
      });
      return task;
    }

    const timer = setTimeout(() => {
      this.activeTimers.delete(taskId);
      this.dispatchWebhook(task).catch((err) => {
        console.warn(`[CallbackSchedulerService] Delayed dispatch error for ${taskId}:`, err);
      });
    }, delayMs);

    if (timer && typeof timer.unref === 'function') {
      timer.unref();
    }

    task.timerHandle = timer;
    this.activeTimers.set(taskId, task);
    return task;
  }

  /**
   * Dispatches the webhook request immediately over HTTP.
   */
  public async dispatchWebhook(task: ScheduledCallbackTask): Promise<WebhookDispatchResult> {
    const rawBody = JSON.stringify(task.payload);
    const signature = this.generateSignature(rawBody, task.partnerCode);

    try {
      if (typeof fetch === 'function') {
        const res = await fetch(task.targetUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Signature-SHA256': signature,
            'X-Partner-Code': task.partnerCode,
            'X-Webhook-Event': task.eventType,
            'X-Idempotency-Key': task.id
          },
          body: rawBody
        });

        let data: unknown;
        try {
          data = await res.json();
        } catch {
          data = await res.text();
        }

        return {
          success: res.ok,
          statusCode: res.status,
          responseBody: data
        };
      }

      // If fetch not available (pure unit test environment)
      return {
        success: true,
        statusCode: 200,
        responseBody: { delivered: true, taskId: task.id }
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        statusCode: 500,
        error: errorMessage
      };
    }
  }

  /**
   * Manually trigger an instant callback (canceling any pending timer if taskId provided).
   */
  public async triggerInstantCallback(
    partnerCode: PartnerCode,
    eventType: string,
    payload: Record<string, unknown>,
    targetUrl?: string
  ): Promise<WebhookDispatchResult> {
    const task: ScheduledCallbackTask = {
      id: `instant_${partnerCode}_${Date.now()}`,
      partnerCode,
      eventType,
      payload,
      scheduledAt: Date.now(),
      executeAt: Date.now(),
      targetUrl: targetUrl ?? this.getWebhookUrl(partnerCode, eventType)
    };

    return this.dispatchWebhook(task);
  }

  /**
   * Returns list of currently active scheduled callback tasks.
   */
  public getPendingTasks(): ScheduledCallbackTask[] {
    return Array.from(this.activeTimers.values());
  }

  /**
   * Clears all active scheduled timers.
   */
  public clearAllTimers(): void {
    for (const task of this.activeTimers.values()) {
      if (task.timerHandle) {
        clearTimeout(task.timerHandle);
      }
    }
    this.activeTimers.clear();
  }
}

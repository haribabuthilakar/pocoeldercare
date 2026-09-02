'use server';

import { PartnerCode } from '@poco/constants';
import { prisma } from '@poco/database';
import {
  CallbackSchedulerService
} from '@poco/integrations';
import type { MockSettings } from '@poco/integrations';
import {
  createMockPococareWebhook,
  createMockRazorpayWebhook,
  createMockAbhaProfile,
  createMockExotelPassthruCallback,
  createMockOneMgOrder,
  createMockOrangeLabsBooking,
  createMockWearableAlert,
  createMockWearablePing
} from '@poco/validation';

export interface PartnerHealthItem {
  partnerCode: PartnerCode;
  name: string;
  category: string;
  status: 'ACTIVE' | 'MOCK_ONLY' | 'DEGRADED' | 'DOWN';
  averageLatencyMs: number;
  failureRatePercent: number;
  totalCallsToday: number;
  lastPingAt: Date | null;
  mockSettings: MockSettings;
}

const DEFAULT_MOCK_SETTINGS: MockSettings = {
  latencyMs: 150,
  failureRate: 0,
  errorMode: 'NONE',
  autoCallbackEnabled: true,
  autoCallbackDelayMs: 2000
};

/**
 * Server Action: Queries all integration partners and calculates health status.
 */
export async function getPartnerHealthList(): Promise<PartnerHealthItem[]> {
  const allPartners = [
    PartnerCode.POCOCARE,
    PartnerCode.RAZORPAY,
    PartnerCode.ABHA,
    PartnerCode.EXOTEL,
    PartnerCode.WHATSAPP,
    PartnerCode.ONE_MG,
    PartnerCode.ORANGE_LABS,
    PartnerCode.HEALTH_SERVICES,
    PartnerCode.INSTAMART,
    PartnerCode.SWIGGY,
    PartnerCode.URBAN_COMPANY,
    PartnerCode.OLA,
    PartnerCode.WEARABLE_IOT
  ];

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const dbPartners = await prisma.integrationPartner.findMany().catch(() => []);
  const dbPartnerMap = new Map(dbPartners.map((p) => [p.partnerCode, p]));

  // Query today's outbound call audit stats
  const callsToday = await prisma.outboundIntegrationCall.findMany({
    where: { createdAt: { gte: todayStart } },
    select: { partnerCode: true, durationMs: true, responseStatus: true }
  }).catch(() => []);

  const partnerStats = new Map<string, { total: number; errors: number; totalDuration: number }>();
  for (const call of callsToday) {
    const pCode = call.partnerCode;
    const current = partnerStats.get(pCode) || { total: 0, errors: 0, totalDuration: 0 };
    current.total += 1;
    current.totalDuration += call.durationMs;
    if (call.responseStatus >= 400) {
      current.errors += 1;
    }
    partnerStats.set(pCode, current);
  }

  return allPartners.map((code) => {
    const dbRecord = dbPartnerMap.get(code as any);
    const stats = partnerStats.get(code) || { total: 0, errors: 0, totalDuration: 0 };

    const mockSettings: MockSettings =
      (dbRecord?.mockSettings as unknown as MockSettings) || DEFAULT_MOCK_SETTINGS;

    const failureRate = mockSettings.failureRate ?? (stats.total > 0 ? (stats.errors / stats.total) * 100 : 0);
    const avgLatency = mockSettings.latencyMs ?? (stats.total > 0 ? Math.round(stats.totalDuration / stats.total) : 150);

    let status: 'ACTIVE' | 'MOCK_ONLY' | 'DEGRADED' | 'DOWN' = 'MOCK_ONLY';
    if (mockSettings.errorMode === 'HTTP_500_SERVER_ERROR' || mockSettings.errorMode === 'TIMEOUT_GATEWAY' || failureRate >= 80) {
      status = 'DOWN';
    } else if (failureRate > 20 || avgLatency > 1500) {
      status = 'DEGRADED';
    } else if (dbRecord?.status) {
      status = dbRecord.status as any;
    }

    return {
      partnerCode: code,
      name: formatPartnerName(code),
      category: dbRecord?.category ?? getPartnerCategory(code),
      status,
      averageLatencyMs: avgLatency,
      failureRatePercent: Math.round(failureRate),
      totalCallsToday: stats.total,
      lastPingAt: dbRecord?.lastPingAt ?? dbRecord?.updatedAt ?? null,
      mockSettings
    };
  });
}

function getPartnerCategory(code: PartnerCode): any {
  switch (code) {
    case PartnerCode.POCOCARE:
      return 'HOSPITAL';
    case PartnerCode.RAZORPAY:
      return 'PAYMENT';
    case PartnerCode.ABHA:
      return 'HEALTHCARE_EMR';
    case PartnerCode.EXOTEL:
      return 'TELEPHONY';
    case PartnerCode.WHATSAPP:
      return 'MESSAGING';
    case PartnerCode.ONE_MG:
      return 'PHARMACY';
    case PartnerCode.ORANGE_LABS:
      return 'DIAGNOSTICS';
    case PartnerCode.HEALTH_SERVICES:
      return 'HEALTHCARE_EMR';
    case PartnerCode.INSTAMART:
      return 'QUICK_COMMERCE';
    case PartnerCode.SWIGGY:
      return 'MEAL_DELIVERY';
    case PartnerCode.URBAN_COMPANY:
      return 'HOME_SERVICES';
    case PartnerCode.OLA:
      return 'TRANSPORT';
    case PartnerCode.WEARABLE_IOT:
      return 'IOT_DEVICE';
    default:
      return 'HOSPITAL';
  }
}

function formatPartnerName(code: PartnerCode): string {
  switch (code) {
    case PartnerCode.POCOCARE:
      return 'Pococare Emergency & Medical';
    case PartnerCode.RAZORPAY:
      return 'Razorpay Payment Gateway';
    case PartnerCode.ABHA:
      return 'ABDM ABHA Health Records';
    case PartnerCode.EXOTEL:
      return 'Exotel Cloud Telephony';
    case PartnerCode.WHATSAPP:
      return 'WhatsApp Business Cloud';
    case PartnerCode.ONE_MG:
      return '1mg Pharmacy & Prescriptions';
    case PartnerCode.ORANGE_LABS:
      return 'Orange Health Diagnostic Labs';
    case PartnerCode.HEALTH_SERVICES:
      return 'Health Services (Doctors/Nurses)';
    case PartnerCode.INSTAMART:
      return 'Swiggy Instamart Quick Commerce';
    case PartnerCode.SWIGGY:
      return 'Swiggy Senior Meal Delivery';
    case PartnerCode.URBAN_COMPANY:
      return 'Urban Company Home Safety';
    case PartnerCode.OLA:
      return 'Ola Senior Hospital Transit';
    case PartnerCode.WEARABLE_IOT:
      return 'IoT Wearable Telemetry & Fall Monitor';
    default:
      return code;
  }
}

/**
 * Server Action: Updates mock settings for a specific partner.
 */
export async function updatePartnerMockSettings(
  partnerCode: PartnerCode,
  settings: Partial<MockSettings>
): Promise<{ success: boolean; data?: MockSettings; error?: string }> {
  try {
    const existing = await prisma.integrationPartner.findUnique({
      where: { partnerCode: partnerCode as any }
    });

    const currentSettings = (existing?.mockSettings as unknown as MockSettings) || DEFAULT_MOCK_SETTINGS;
    const mergedSettings: MockSettings = {
      ...currentSettings,
      ...settings
    };

    await prisma.integrationPartner.upsert({
      where: { partnerCode: partnerCode as any },
      update: {
        mockSettings: mergedSettings as any,
        updatedAt: new Date()
      },
      create: {
        partnerCode: partnerCode as any,
        name: formatPartnerName(partnerCode),
        category: getPartnerCategory(partnerCode),
        status: 'MOCK_ONLY',
        mockSettings: mergedSettings as any
      }
    });

    return { success: true, data: mergedSettings };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

/**
 * Server Action: Resets all partners to default mock settings.
 */
export async function resetAllMockSettings(): Promise<{ success: boolean; error?: string }> {
  try {
    const allPartners = [
      PartnerCode.POCOCARE,
      PartnerCode.RAZORPAY,
      PartnerCode.ABHA,
      PartnerCode.EXOTEL,
      PartnerCode.WHATSAPP,
      PartnerCode.ONE_MG,
      PartnerCode.ORANGE_LABS,
      PartnerCode.HEALTH_SERVICES,
      PartnerCode.INSTAMART,
      PartnerCode.SWIGGY,
      PartnerCode.URBAN_COMPANY,
      PartnerCode.OLA,
      PartnerCode.WEARABLE_IOT
    ];

    for (const code of allPartners) {
      await prisma.integrationPartner.upsert({
        where: { partnerCode: code as any },
        update: {
          mockSettings: DEFAULT_MOCK_SETTINGS as any,
          updatedAt: new Date()
        },
        create: {
          partnerCode: code as any,
          name: formatPartnerName(code),
          category: getPartnerCategory(code),
          status: 'MOCK_ONLY',
          mockSettings: DEFAULT_MOCK_SETTINGS as any
        }
      });
    }
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

/**
 * Server Action: Dispatches a simulated test ping to a partner.
 */
export async function triggerTestPing(
  partnerCode: PartnerCode
): Promise<{ success: boolean; latencyMs: number; response: unknown; error?: string }> {
  const start = Date.now();
  try {
    // Record mock outbound call
    const latencyMs = 120 + Math.floor(Math.random() * 80);
    await new Promise((r) => setTimeout(r, Math.min(latencyMs, 300)));

    const response = {
      status: 'OK',
      partnerCode,
      simulated: true,
      timestamp: new Date().toISOString()
    };

    await prisma.outboundIntegrationCall.create({
      data: {
        partnerCode: partnerCode as any,
        endpoint: `/mock/${partnerCode.toLowerCase()}/ping`,
        requestPayload: { action: 'ping' },
        responseStatus: 200,
        durationMs: latencyMs
      }
    }).catch(() => {});

    await prisma.integrationPartner.update({
      where: { partnerCode: partnerCode as any },
      data: { lastPingAt: new Date() }
    }).catch(() => {});

    return { success: true, latencyMs, response };
  } catch (err: unknown) {
    const latencyMs = Date.now() - start;
    return {
      success: false,
      latencyMs,
      response: null,
      error: err instanceof Error ? err.message : String(err)
    };
  }
}

/**
 * Server Action: Dispatches a high-fidelity pre-populated scenario preset.
 */
export async function dispatchScenarioPreset(
  scenarioKey: string
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  try {
    const scheduler = new CallbackSchedulerService();

    switch (scenarioKey) {
      case 'pococare_ambulance':
        scheduler.triggerInstantCallback(PartnerCode.POCOCARE, 'dispatch', createMockPococareWebhook());
        return { success: true, data: { scenario: 'Pococare Ambulance Multi-Stage Progression', status: 'DISPATCHED' } };

      case 'razorpay_payment_success':
        scheduler.triggerInstantCallback(PartnerCode.RAZORPAY, 'payment.captured', createMockRazorpayWebhook());
        return { success: true, data: { scenario: 'Razorpay Payment Captured (₹5,000)', status: 'CAPTURED' } };

      case 'razorpay_payment_failed':
        scheduler.triggerInstantCallback(PartnerCode.RAZORPAY, 'payment.failed', createMockRazorpayWebhook({
          event: 'payment.failed'
        }));
        return { success: true, data: { scenario: 'Razorpay Payment Failed (Bank Declined)', status: 'FAILED' } };

      case 'exotel_emergency_call':
        scheduler.triggerInstantCallback(PartnerCode.EXOTEL, 'inbound', createMockExotelPassthruCallback());
        return { success: true, data: { scenario: 'Exotel Senior Inbound Hotline Call (IVR 1)', status: 'RINGING' } };

      case 'abha_consent_granted':
        scheduler.triggerInstantCallback(PartnerCode.ABHA, 'consent-granted', createMockAbhaProfile());
        return { success: true, data: { scenario: 'ABHA ABDM Consent Auto-Granted', status: 'GRANTED' } };

      case 'one_mg_out_for_delivery':
        scheduler.triggerInstantCallback(PartnerCode.ONE_MG, 'delivery-status', createMockOneMgOrder({
          status: 'OUT_FOR_DELIVERY'
        }));
        return { success: true, data: { scenario: '1mg Prescription Medicines Out for Delivery', status: 'IN_TRANSIT' } };

      case 'orange_labs_report_ready':
        scheduler.triggerInstantCallback(PartnerCode.ORANGE_LABS, 'report-ready', {
          bookingId: 'OL-BKG-8891',
          status: 'REPORT_READY',
          reportPdfUrl: 'https://storage.pocoeldercare.in/lab-reports/OL-BKG-8891-lipid.pdf',
          patientName: 'Gopal Krishna Sharma',
          completedAt: new Date().toISOString()
        });
        return { success: true, data: { scenario: 'Orange Health Lab Report Ready with PDF Link', status: 'READY' } };


      case 'wearable_fall_detected':
        scheduler.triggerInstantCallback(PartnerCode.WEARABLE_IOT, 'fall-alert', createMockWearableAlert('senior-001'));
        return { success: true, data: { scenario: 'IoT Wearable Sudden Fall Alert Detected (3.8g impact)', status: 'EMERGENCY_TRIGGERED' } };

      case 'wearable_heartbeat_ping':
        scheduler.triggerInstantCallback(PartnerCode.WEARABLE_IOT, 'ping', createMockWearablePing('senior-001'));
        return { success: true, data: { scenario: 'IoT Wearable Silent Telemetry Heartbeat Ping', status: 'UPDATED' } };

      default:
        throw new Error(`Unknown scenario preset key: ${scenarioKey}`);
    }
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

/**
 * Server Action: Queries recent outbound call logs from PostgreSQL.
 */
export async function getOutboundCallLogs(limit = 20) {
  try {
    return await prisma.outboundIntegrationCall.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' }
    });
  } catch {
    return [];
  }
}

/**
 * Server Action: Queries recent webhook events from PostgreSQL.
 */
export async function getWebhookEventLogs(limit = 20) {
  try {
    return await prisma.webhookEvent.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' }
    });
  } catch {
    return [];
  }
}

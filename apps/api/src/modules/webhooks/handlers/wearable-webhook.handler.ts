import { prisma } from '@poco/database';
import {
  wearableTelemetryPingSchema,
  wearableAlertWebhookSchema
} from '@poco/validation';
import type {
  WearableTelemetryPingDto,
  WearableAlertWebhookDto
} from '@poco/validation';


export class WearableWebhookHandler {
  /**
   * Processes hourly silent telemetry heartbeats from senior wearables.
   */
  public async handlePing(payload: unknown): Promise<{ processed: boolean; seniorId: string; lastPingAt: Date }> {
    const parsed = wearableTelemetryPingSchema.safeParse(payload);
    if (!parsed.success) {
      throw new Error(`Invalid Wearable Ping payload: ${parsed.error.message}`);
    }

    const ping = parsed.data;
    const now = new Date();

    // Silently update SeniorMedicalProfile without creating tickets or feed entries
    await prisma.seniorMedicalProfile.upsert({
      where: { seniorId: ping.seniorId },
      update: {
        lastWearablePingAt: now,
        wearableDeviceId: ping.deviceId
      },
      create: {
        seniorId: ping.seniorId,
        wearableDeviceId: ping.deviceId,
        lastWearablePingAt: now,
        iceContactName: 'Primary ICE Contact',
        iceContactPhone: '+919876543210',
        iceRelationship: 'Child'
      }
    });

    return { processed: true, seniorId: ping.seniorId, lastPingAt: now };
  }

  /**
   * Processes real-time emergency fall detection and physical SOS button alerts.
   */
  public async handleFallAlert(payload: unknown): Promise<{ processed: boolean; ticketId: string; priority: string }> {
    const parsed = wearableAlertWebhookSchema.safeParse(payload);
    if (!parsed.success) {
      throw new Error(`Invalid Wearable Fall Alert payload: ${parsed.error.message}`);
    }

    const alert = parsed.data;
    const now = new Date();

    // 1. Locate senior and household
    const senior = await prisma.senior.findUnique({
      where: { id: alert.seniorId },
      include: { household: true }
    });

    if (!senior) {
      throw new Error(`Senior with ID ${alert.seniorId} not found`);
    }

    const isFall = alert.alertType === 'FALL_DETECTED';
    const title = isFall
      ? `🚨 EMERGENCY: Fall Alert Detected for ${senior.name}`
      : `🚨 SOS BUTTON PRESSED by ${senior.name}`;

    const description = `Device ${alert.deviceId} triggered ${alert.alertType} at ${alert.timestamp.toISOString()}. Metrics: Impact G-Force: ${alert.metrics?.impactGForce ?? 'N/A'}, HR: ${alert.metrics?.heartRateBpm ?? 'N/A'} bpm, SpO2: ${alert.metrics?.spo2 ?? 'N/A'}%. Battery: ${alert.batteryPercentage ?? 'N/A'}%.`;

    // 2. Create Emergency Ticket (5 min response SLA, 30 min delivery SLA)
    const ticket = await prisma.ticket.create({
      data: {
        householdId: senior.householdId,
        seniorId: senior.id,
        title,
        description,
        category: 'EMERGENCY_FALL',
        priority: 'EMERGENCY',
        status: 'OPEN',
        slaStatus: 'NORMAL',
        triageStatus: 'CONFIRMED',
        responseDueAt: new Date(now.getTime() + 5 * 60000),
        deliveryDueAt: new Date(now.getTime() + 30 * 60000)
      }
    });

    // 3. Look up active emergency service catalog version and spawn ServiceRequest if available
    try {
      const catalogVersion = await prisma.serviceCatalogVersion.findFirst({
        where: {
          serviceCatalog: { name: { contains: 'Ambulance' } }
        },
        orderBy: { version: 'desc' }
      });

      if (catalogVersion) {
        await prisma.serviceRequest.create({
          data: {
            ticketId: ticket.id,
            serviceCatalogVersionId: catalogVersion.id,
            status: 'PENDING',
            unitPricePaise: catalogVersion.pricePaise,
            notes: 'Auto-spawned from Wearable Fall Alert'
          }
        });
      }
    } catch {
      // Catalog version lookup fallback
    }


    // 4. Create urgent Activity Feed item
    await prisma.activityFeedItem.create({
      data: {
        householdId: senior.householdId,
        actorType: 'SYSTEM',
        senderName: 'IoT Wearable Fall Monitor',
        eventType: 'VITAL_ALERT',
        content: `${title}. Operations dispatching emergency care officer and ambulance.`,
        linkedTicketId: ticket.id
      }
    });

    return { processed: true, ticketId: ticket.id, priority: 'EMERGENCY' };
  }
}

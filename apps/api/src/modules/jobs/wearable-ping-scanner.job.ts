import { prisma } from '@poco/database';

export class WearablePingScannerJob {
  /**
   * Scans for paired senior wearable devices that have missed telemetry pings for >75 minutes.
   */
  public async scanForMissedPings(): Promise<{ scannedCount: number; ticketsCreated: number; alertedSeniorIds: string[] }> {
    const now = new Date();
    const thresholdDate = new Date(now.getTime() - 75 * 60000); // 75 minutes ago
    const twelveHoursAgo = new Date(now.getTime() - 12 * 3600000);

    // 1. Find seniors with paired wearable whose last ping is older than 75 minutes (or never pinged)
    const overdueProfiles = await prisma.seniorMedicalProfile.findMany({
      where: {
        wearableDeviceId: { not: null },
        OR: [
          { lastWearablePingAt: { lt: thresholdDate } },
          { lastWearablePingAt: null }
        ]
      },
      include: {
        senior: {
          include: { household: true }
        }
      }
    });

    let ticketsCreated = 0;
    const alertedSeniorIds: string[] = [];

    for (const profile of overdueProfiles) {
      const senior = profile.senior;
      if (!senior) continue;

      // 2. Check if a missed ping ticket was already created in the last 12 hours
      const existingTicket = await prisma.ticket.findFirst({
        where: {
          seniorId: senior.id,
          category: 'MISSED_WEARABLE_PING',
          createdAt: { gte: twelveHoursAgo }
        }
      });

      if (existingTicket) {
        continue; // Throttled to max 1 ticket per 12 hours
      }

      // 3. Create Routine Ops Ticket
      const lastPingText = profile.lastWearablePingAt
        ? profile.lastWearablePingAt.toISOString()
        : 'Never received';

      const ticket = await prisma.ticket.create({
        data: {
          householdId: senior.householdId,
          seniorId: senior.id,
          title: `⚠️ Wearable Device Offline (>75m): ${senior.name}`,
          description: `Wearable device ${profile.wearableDeviceId} has not sent telemetry since ${lastPingText}. Verify senior device battery/charging status.`,
          category: 'MISSED_WEARABLE_PING',
          priority: 'ROUTINE',
          status: 'OPEN',
          slaStatus: 'NORMAL',
          triageStatus: 'CONFIRMED',
          responseDueAt: new Date(now.getTime() + 60 * 60000), // 1 hour SLA
          deliveryDueAt: new Date(now.getTime() + 240 * 60000) // 4 hour SLA
        }
      });

      ticketsCreated++;
      alertedSeniorIds.push(senior.id);
    }

    return {
      scannedCount: overdueProfiles.length,
      ticketsCreated,
      alertedSeniorIds
    };
  }
}

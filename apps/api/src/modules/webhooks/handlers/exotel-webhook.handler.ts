import { prisma } from '@poco/database';
import { exotelPassthruCallbackSchema } from '@poco/validation';

export class ExotelWebhookHandler {
  /**
   * Processes incoming telephony/IVR callbacks from Exotel.
   */
  public async handle(payload: unknown): Promise<{ processed: boolean; ticketId?: string; callSid: string }> {
    const parsed = exotelPassthruCallbackSchema.safeParse(payload);
    if (!parsed.success) {
      throw new Error(`Invalid Exotel webhook payload: ${parsed.error.message}`);
    }

    const call = parsed.data;
    const now = new Date();

    // 1. Look up senior / household by caller phone number
    let matchedSenior = await prisma.senior.findFirst({
      where: {
        medicalProfile: {
          iceContactPhone: { contains: call.From.slice(-10) }
        }
      },
      include: { household: true }
    });

    let householdId = matchedSenior?.householdId;

    // Fallback: search household by any membership person phone if not found
    if (!householdId) {
      const membership = await prisma.householdMembership.findFirst({
        where: {
          person: { phone: { contains: call.From.slice(-10) } }
        }
      });
      householdId = membership?.householdId;
    }

    // Default household fallback if calling from unregistered phone
    if (!householdId) {
      const defaultHousehold = await prisma.household.findFirst();
      householdId = defaultHousehold?.id ?? 'default-household-001';
    }

    const isEmergency = call.Digits === '1';
    const priority = isEmergency ? 'EMERGENCY' : call.Digits === '2' ? 'URGENT' : 'ROUTINE';
    const responseMinutes = isEmergency ? 5 : 15;
    const deliveryMinutes = isEmergency ? 30 : 120;

    const ticket = await prisma.ticket.create({
      data: {
        householdId,
        seniorId: matchedSenior?.id ?? null,
        title: isEmergency
          ? `🚨 EMERGENCY CALL: Hotline IVR Option 1 (${call.From})`
          : `Inbound Call from ${call.From} (IVR Option ${call.Digits ?? '0'})`,
        description: `Caller ${call.From} connected via Exotel CallSid ${call.CallSid}. Duration: ${call.CallDuration ?? 0}s. Recording: ${call.RecordingUrl ?? 'None'}.`,
        category: isEmergency ? 'EMERGENCY_AMBULANCE' : 'INBOUND_PHONE_CALL',
        priority: priority as any,
        status: 'OPEN',
        slaStatus: 'NORMAL',
        triageStatus: 'PENDING_TRIAGE',
        responseDueAt: new Date(now.getTime() + responseMinutes * 60000),
        deliveryDueAt: new Date(now.getTime() + deliveryMinutes * 60000)
      }
    });

    // Write Activity Feed
    await prisma.activityFeedItem.create({
      data: {
        householdId,
        actorType: 'SYSTEM',
        senderName: 'Cloud Telephony (Exotel)',
        eventType: isEmergency ? 'VITAL_ALERT' : 'MESSAGE',
        content: `📞 Inbound call received from ${call.From}. Ticket #${ticket.id.slice(0, 8)} opened.`,
        linkedTicketId: ticket.id
      }
    });

    return { processed: true, ticketId: ticket.id, callSid: call.CallSid };
  }
}

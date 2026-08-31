import { prisma } from '@poco/database';
import { PartnerCode } from '@poco/constants';

export interface PartnerCallbackEvent {
  partnerCode: PartnerCode;
  serviceRequestId?: string;
  status?: string;
  stage?: string;
  reportPdfUrl?: string;
  notes?: string;
  timestamp?: string | Date;
  [key: string]: unknown;
}

export class LoopClosedWebhookHandler {
  /**
   * Automatically closes partner delivery/diagnostic/service loops.
   */
  public async handle(
    partnerCode: PartnerCode,
    payload: PartnerCallbackEvent
  ): Promise<{ processed: boolean; serviceRequestId?: string; updatedStatus?: string }> {
    const serviceRequestId = payload.serviceRequestId;
    const status = payload.status || payload.stage || 'COMPLETED';

    const isTerminalCompleted = [
      'DELIVERED',
      'REPORT_READY',
      'HOSPITAL_ADMITTED',
      'COMPLETED',
      'TRIP_COMPLETED',
      'SHIFT_ENDED',
      'CONSULTATION_COMPLETED'
    ].includes(status.toUpperCase());

    if (serviceRequestId) {
      try {
        const serviceReq = await prisma.serviceRequest.findUnique({
          where: { id: serviceRequestId },
          include: { ticket: true }
        });

        if (serviceReq) {
          const newStatus = isTerminalCompleted ? 'COMPLETED' : 'IN_PROGRESS';

          await prisma.serviceRequest.update({
            where: { id: serviceRequestId },
            data: {
              status: newStatus as any,
              completedAt: isTerminalCompleted ? new Date() : undefined,
              notes: payload.reportPdfUrl ? `Report PDF: ${payload.reportPdfUrl}` : undefined
            }
          });

          // Post progress to activity feed
          await prisma.activityFeedItem.create({
            data: {
              householdId: serviceReq.ticket.householdId,
              actorType: 'SYSTEM',
              senderName: `${partnerCode} Partner Service`,
              eventType: 'SYSTEM_EVENT',
              content: `Update from ${partnerCode}: Status changed to ${status}. ${payload.reportPdfUrl ? `Report: ${payload.reportPdfUrl}` : ''}`,
              linkedTicketId: serviceReq.ticketId
            }
          });

          return { processed: true, serviceRequestId, updatedStatus: newStatus };
        }
      } catch (err) {
        console.warn(`[LoopClosedWebhookHandler] Could not update service request ${serviceRequestId}:`, err);
      }
    }

    return { processed: true, updatedStatus: status };
  }
}

import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.module';
import { ServiceRequestStatus, SopProofType } from '@poco/constants';
import { transitionServiceRequest } from '@poco/business-rules';
import { TicketsService } from './tickets.service';

@Injectable()
export class ServiceRequestsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ticketsService: TicketsService,
  ) {}

  async transitionStatus(
    serviceRequestId: string,
    event: {
      type: 'ACCEPT' | 'START_TRANSIT' | 'ARRIVE_ON_SITE' | 'START_WORK' | 'COMPLETE_WORK' | 'FLAG_EXCEPTION' | 'RESUME_WORK' | 'CANCEL';
      assignedOfficerId?: string;
      isGeofenceVerified?: boolean;
      distanceMeters?: number;
      allSopStepsCompleted?: boolean;
      reason?: string;
    },
    actorId?: string,
  ) {
    const sr = await this.prisma.serviceRequest.findUnique({
      where: { id: serviceRequestId },
      include: {
        ticket: true,
        sopProgress: true,
        serviceCatalogVersion: {
          include: { sopSteps: true },
        },
      },
    });

    if (!sr) {
      throw new NotFoundException('Service Request not found');
    }

    const requiredStepsCount = sr.serviceCatalogVersion.sopSteps.filter((s) => s.isRequired).length;
    const completedRequiredSteps = sr.sopProgress.filter((p) => p.isCompleted).length;
    const allSopDone = completedRequiredSteps >= requiredStepsCount;

    const transitionResult = transitionServiceRequest(
      sr.status as ServiceRequestStatus,
      {
        type: event.type as any,
        assignedOfficerId: event.assignedOfficerId || sr.assignedCareOfficerId || '',
        isGeofenceVerified: event.isGeofenceVerified ?? true,
        distanceMeters: event.distanceMeters ?? 50,
        allSopStepsCompleted: event.allSopStepsCompleted ?? allSopDone,
        reason: event.reason || '',
      },
      { officerId: actorId },
    );

    if (!transitionResult.ok) {
      throw new BadRequestException(transitionResult.error.message);
    }

    const updated = await this.prisma.serviceRequest.update({
      where: { id: serviceRequestId },
      data: {
        status: transitionResult.value.nextStatus,
        completedAt: transitionResult.value.completedAt,
      },
    });

    // Recalculate parent ticket status rollup (TCKT-04)
    await this.ticketsService.recalculateRollupStatus(sr.ticketId);

    return updated;
  }

  async recordSopProgress(
    serviceRequestId: string,
    sopStepVersionId: string,
    data: { isCompleted: boolean; proofUrl?: string; notes?: string; choiceValue?: string },
  ) {
    const progress = await this.prisma.ticketSopProgress.upsert({
      where: {
        serviceRequestId_sopStepVersionId: {
          serviceRequestId,
          sopStepVersionId,
        },
      },
      create: {
        serviceRequestId,
        sopStepVersionId,
        isCompleted: data.isCompleted,
        completedAt: data.isCompleted ? new Date() : null,
        proofUrl: data.proofUrl,
        notes: data.notes,
        choiceValue: data.choiceValue,
      },
      update: {
        isCompleted: data.isCompleted,
        completedAt: data.isCompleted ? new Date() : null,
        proofUrl: data.proofUrl,
        notes: data.notes,
        choiceValue: data.choiceValue,
      },
    });

    return progress;
  }
}

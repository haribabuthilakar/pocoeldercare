import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { ServiceRequestsService } from './service-requests.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { FieldAuthGuard } from '../../common/guards/field-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PrismaService } from '../../common/prisma/prisma.module';

@Controller('field/v1')
@UseGuards(JwtAuthGuard, FieldAuthGuard)
export class FieldTicketsController {
  constructor(
    private readonly ticketsService: TicketsService,
    private readonly serviceRequestsService: ServiceRequestsService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('tickets')
  async getMyAssignedTickets(@CurrentUser() user: any) {
    const profile = await this.prisma.careOfficerProfile.findUnique({
      where: { internalUserId: user.sub },
    });

    if (!profile) return [];

    return this.prisma.ticket.findMany({
      where: { assignedCareOfficerId: profile.id },
      include: {
        household: true,
        senior: true,
        serviceRequests: {
          include: {
            serviceCatalogVersion: { include: { serviceCatalog: true } },
            sopProgress: true,
          },
        },
      },
      orderBy: [{ priority: 'asc' }, { responseDueAt: 'asc' }],
    });
  }

  @Patch('service-requests/:id/status')
  @HttpCode(HttpStatus.OK)
  async updateServiceRequestStatus(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body()
    body: {
      type: 'ACCEPT' | 'START_TRANSIT' | 'ARRIVE_ON_SITE' | 'START_WORK' | 'COMPLETE_WORK' | 'FLAG_EXCEPTION' | 'RESUME_WORK' | 'CANCEL';
      isGeofenceVerified?: boolean;
      distanceMeters?: number;
      allSopStepsCompleted?: boolean;
      reason?: string;
    },
  ) {
    return this.serviceRequestsService.transitionStatus(id, body, user.sub);
  }

  @Post('service-requests/:id/sop-progress')
  @HttpCode(HttpStatus.OK)
  async recordSopStep(
    @Param('id') id: string,
    @Body()
    body: {
      sopStepVersionId: string;
      isCompleted: boolean;
      proofUrl?: string;
      notes?: string;
      choiceValue?: string;
    },
  ) {
    return this.serviceRequestsService.recordSopProgress(id, body.sopStepVersionId, body);
  }
}

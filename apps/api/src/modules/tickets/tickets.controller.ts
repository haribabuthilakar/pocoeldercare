import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { ServiceRequestsService } from './service-requests.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole, TicketStatus, SlaStatus, TriageStatus } from '@poco/constants';

@Controller('admin/v1/tickets')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.OPS_MANAGER, UserRole.CARE_MANAGER, UserRole.SUPER_ADMIN)
export class TicketsController {
  constructor(
    private readonly ticketsService: TicketsService,
    private readonly serviceRequestsService: ServiceRequestsService,
  ) {}

  @Get()
  async getTickets(
    @Query('status') status?: TicketStatus,
    @Query('slaStatus') slaStatus?: SlaStatus,
    @Query('triageStatus') triageStatus?: TriageStatus,
    @Query('householdId') householdId?: string,
  ) {
    return this.ticketsService.getAdminTickets({ status, slaStatus, triageStatus, householdId });
  }

  @Get(':id')
  async getTicketDetails(@Param('id') id: string) {
    return this.ticketsService.getTicketDetails(id);
  }

  @Post(':id/triage')
  @HttpCode(HttpStatus.OK)
  async triageTicket(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() body: { items: Array<{ serviceCatalogVersionId: string; notes?: string }> },
  ) {
    return this.ticketsService.triageToServiceRequests(id, body.items, user.sub);
  }

  @Patch(':id/resolve-ops')
  @HttpCode(HttpStatus.OK)
  async resolveWaitingOps(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() body: { action: 'RESUME_IN_PROGRESS' | 'RESOLVE' | 'CANCEL'; notes?: string },
  ) {
    return this.ticketsService.resolveWaitingOpsUpdate(id, body.action, user.sub, body.notes);
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CareOfficersService } from './care-officers.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@poco/constants';

@Controller('admin/v1/care-officers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CareOfficersController {
  constructor(private readonly careOfficersService: CareOfficersService) {}

  @Post('assign')
  @Roles(UserRole.CARE_MANAGER, UserRole.OPS_MANAGER, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  async assign(
    @CurrentUser() user: any,
    @Body() body: { householdId: string; careOfficerId: string; requiredCerts?: string[] },
  ) {
    return this.careOfficersService.assignCareOfficer(
      body.householdId,
      body.careOfficerId,
      user,
      body.requiredCerts,
    );
  }

  @Get('supervised')
  @Roles(UserRole.CARE_MANAGER, UserRole.OPS_MANAGER, UserRole.SUPER_ADMIN)
  async getSupervised(@CurrentUser() user: any) {
    return this.careOfficersService.getSupervisedOfficers(user.sub);
  }

  @Get(':id/certifications')
  @Roles(UserRole.CARE_MANAGER, UserRole.OPS_MANAGER, UserRole.SUPER_ADMIN)
  async getCertifications(@Param('id') id: string) {
    return this.careOfficersService.getOfficerCertifications(id);
  }

  @Post(':id/certifications')
  @Roles(UserRole.CARE_MANAGER, UserRole.OPS_MANAGER, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  async updateCertification(
    @Param('id') id: string,
    @Body() body: { certificationCode: string; status: any; expiresAt?: string },
  ) {
    return this.careOfficersService.upsertOfficerCertification(
      id,
      body.certificationCode,
      body.status,
      body.expiresAt ? new Date(body.expiresAt) : new Date(),
    );
  }

  @Post('tickets/:ticketId/fallback')
  @Roles(UserRole.CARE_MANAGER, UserRole.OPS_MANAGER, UserRole.SUPER_ADMIN)
  async fallbackEscalate(@Param('ticketId') ticketId: string) {
    return this.careOfficersService.executeSupervisorFallback(ticketId);
  }
}


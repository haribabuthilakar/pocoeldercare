import { Controller, Post, Get, Body, Param, Query, UseGuards } from '@nestjs/common';
import { VitalsService } from './vitals.service';
import { RecordVitalsDto } from './dto/record-vitals.dto';
import { RunEmergencyDrillDto } from './dto/run-drill.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleType } from '@poco/database';

@Controller('vitals')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VitalsController {
  constructor(private readonly vitalsService: VitalsService) {}

  @Post('record')
  @Roles(RoleType.ADMIN, RoleType.CARE_OFFICER, RoleType.DOCTOR, RoleType.FAMILY_PRIMARY_LOCAL, RoleType.FAMILY_PRIMARY_NRI)
  async recordVitals(@Body() dto: RecordVitalsDto) {
    return this.vitalsService.recordVitals(dto);
  }

  @Get('members/:memberId/history')
  async getVitalsHistory(
    @Param('memberId') memberId: string,
    @Query('days') days?: string,
  ) {
    return this.vitalsService.getMemberVitalsHistory(memberId, days ? parseInt(days, 10) : 7);
  }

  @Post('drills/run')
  @Roles(RoleType.ADMIN, RoleType.OPS_MANAGER, RoleType.DISPATCHER)
  async runEmergencyDrill(@Body() dto: RunEmergencyDrillDto) {
    return this.vitalsService.runEmergencyDrill(dto);
  }
}

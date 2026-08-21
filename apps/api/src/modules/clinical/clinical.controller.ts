import { Controller, Post, Get, Put, Body, Param, UseGuards } from '@nestjs/common';
import { ClinicalService } from './clinical.service';
import { ScheduleConsultDto } from './dto/schedule-consult.dto';
import { SubmitConsultNotesDto } from './dto/submit-consult-notes.dto';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleType } from '@poco/database';

@Controller('clinical')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClinicalController {
  constructor(private readonly clinicalService: ClinicalService) {}

  @Post('schedule')
  @Roles(RoleType.ADMIN, RoleType.OPS_MANAGER, RoleType.FAMILY_PRIMARY_LOCAL, RoleType.FAMILY_PRIMARY_NRI, RoleType.CARE_OFFICER)
  async scheduleConsult(@Body() dto: ScheduleConsultDto) {
    return this.clinicalService.scheduleConsult(dto);
  }

  @Put('consults/:id/notes')
  @Roles(RoleType.DOCTOR, RoleType.ADMIN)
  async submitNotes(@Param('id') id: string, @Body() dto: SubmitConsultNotesDto) {
    return this.clinicalService.submitConsultNotes(id, dto);
  }

  @Post('consults/:id/prescriptions')
  @Roles(RoleType.DOCTOR, RoleType.ADMIN)
  async createPrescription(@Param('id') id: string, @Body() dto: CreatePrescriptionDto) {
    return this.clinicalService.createPrescription(id, dto);
  }

  @Get('consults/:id')
  async getConsultDetails(@Param('id') id: string) {
    return this.clinicalService.getConsultDetails(id);
  }

  @Get('members/:memberId/consults')
  async listMemberConsults(@Param('memberId') memberId: string) {
    return this.clinicalService.listMemberConsults(memberId);
  }
}

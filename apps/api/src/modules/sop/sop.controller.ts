import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { SopService } from './sop.service';
import { CreateSopTemplateDto } from './dto/create-sop.dto';
import { EvaluateChecklistDto } from './dto/evaluate-checklist.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleType } from '@poco/database';

@Controller('sop')
export class SopController {
  constructor(private readonly sopService: SopService) {}

  @Post('templates')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN, RoleType.OPS_MANAGER)
  async createTemplate(@Body() dto: CreateSopTemplateDto) {
    return this.sopService.createOrVersionSopTemplate(dto);
  }

  @Get('templates/:id')
  async getTemplate(@Param('id') id: string) {
    return this.sopService.getSopTemplate(id);
  }

  @Get('service/:serviceCode')
  async getLatestSopForService(@Param('serviceCode') serviceCode: string) {
    return this.sopService.getLatestSopForService(serviceCode);
  }

  @Post('evaluate')
  @UseGuards(JwtAuthGuard)
  async evaluateChecklist(@Body() dto: EvaluateChecklistDto) {
    return this.sopService.evaluateChecklist(dto);
  }
}

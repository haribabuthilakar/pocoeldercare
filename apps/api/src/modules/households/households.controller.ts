import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { HouseholdsService } from './households.service';
import { CreateHouseholdDto } from './dto/create-household.dto';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateIceProfileDto } from './dto/update-ice.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleType } from '@poco/database';

@Controller('households')
@UseGuards(JwtAuthGuard, RolesGuard)
export class HouseholdsController {
  constructor(private readonly householdsService: HouseholdsService) {}

  @Post()
  @Roles(RoleType.ADMIN, RoleType.OPS_MANAGER, RoleType.FAMILY_PRIMARY_LOCAL, RoleType.FAMILY_PRIMARY_NRI)
  async createHousehold(@Body() dto: CreateHouseholdDto) {
    return this.householdsService.createHousehold(dto);
  }

  @Get()
  @Roles(RoleType.ADMIN, RoleType.OPS_MANAGER, RoleType.DISPATCHER)
  async listHouseholds(@Query('city') city?: string) {
    return this.householdsService.listHouseholds(city);
  }

  @Get(':id')
  async getHousehold(@Param('id') id: string) {
    return this.householdsService.getHouseholdById(id);
  }

  @Post(':id/members')
  @Roles(RoleType.ADMIN, RoleType.OPS_MANAGER, RoleType.FAMILY_PRIMARY_LOCAL, RoleType.FAMILY_PRIMARY_NRI)
  async addMember(@Param('id') householdId: string, @Body() dto: CreateMemberDto) {
    return this.householdsService.addMember(householdId, dto);
  }

  @Get('members/:memberId/ice')
  async getMemberIce(@Param('memberId') memberId: string) {
    return this.householdsService.getMemberIceProfile(memberId);
  }

  @Put('members/:memberId/ice')
  @Roles(RoleType.ADMIN, RoleType.OPS_MANAGER, RoleType.CARE_OFFICER, RoleType.FAMILY_PRIMARY_LOCAL, RoleType.FAMILY_PRIMARY_NRI, RoleType.DOCTOR)
  async updateMemberIce(@Param('memberId') memberId: string, @Body() dto: UpdateIceProfileDto) {
    return this.householdsService.updateMemberIceProfile(memberId, dto);
  }
}

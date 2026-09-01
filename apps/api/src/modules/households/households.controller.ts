import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { HouseholdsService } from './households.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { HouseholdContextGuard } from '../../common/guards/household-context.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { FamilyRole } from '@poco/constants';

@Controller('family/v1/households')
@UseGuards(JwtAuthGuard)
export class HouseholdsController {
  constructor(private readonly householdsService: HouseholdsService) {}

  @Get()
  async getMyHouseholds(@CurrentUser() user: any) {
    return this.householdsService.getUserHouseholds(user.sub);
  }

  @Get(':householdId')
  @UseGuards(HouseholdContextGuard)
  async getHouseholdProfile(@Param('householdId') householdId: string) {
    return this.householdsService.getHouseholdProfile(householdId);
  }

  @Post(':householdId/members/invite')
  @UseGuards(HouseholdContextGuard)
  async inviteMember(
    @Param('householdId') householdId: string,
    @CurrentUser() user: any,
    @Body() body: { name: string; phone: string; email?: string; role?: FamilyRole },
  ) {
    return this.householdsService.inviteCaregiver(householdId, user.sub, body);
  }

  @Delete(':householdId/members/:personId')
  @UseGuards(HouseholdContextGuard)
  async removeMember(
    @Param('householdId') householdId: string,
    @CurrentUser() user: any,
    @Param('personId') personId: string,
  ) {
    return this.householdsService.removeCaregiver(householdId, user.sub, personId);
  }
}

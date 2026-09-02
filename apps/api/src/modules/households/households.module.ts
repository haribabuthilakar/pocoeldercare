import { Module } from '@nestjs/common';
import { HouseholdsService } from './households.service';
import { HouseholdsController } from './households.controller';
import { OnboardingController, AdminLeadsController } from './onboarding.controller';

@Module({
  controllers: [HouseholdsController, OnboardingController, AdminLeadsController],
  providers: [HouseholdsService],
  exports: [HouseholdsService],
})
export class HouseholdsModule {}

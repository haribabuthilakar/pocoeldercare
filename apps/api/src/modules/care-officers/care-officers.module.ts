import { Module } from '@nestjs/common';
import { CareOfficersService } from './care-officers.service';
import { CareOfficersController } from './care-officers.controller';

@Module({
  controllers: [CareOfficersController],
  providers: [CareOfficersService],
  exports: [CareOfficersService],
})
export class CareOfficersModule {}

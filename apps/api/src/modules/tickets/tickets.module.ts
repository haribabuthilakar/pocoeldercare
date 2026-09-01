import { Module } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { ServiceRequestsService } from './service-requests.service';
import { TicketsController } from './tickets.controller';
import { FamilyTicketsController } from './family-tickets.controller';
import { FieldTicketsController } from './field-tickets.controller';

@Module({
  controllers: [TicketsController, FamilyTicketsController, FieldTicketsController],
  providers: [TicketsService, ServiceRequestsService],
  exports: [TicketsService, ServiceRequestsService],
})
export class TicketsModule {}

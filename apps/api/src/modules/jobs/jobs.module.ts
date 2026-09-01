import { Module } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { SlaTransitionWorker } from './workers/sla-transition.worker';
import { WearablePingScannerJob } from './wearable-ping-scanner.job';
import { CareOfficersModule } from '../care-officers/care-officers.module';

@Module({
  imports: [CareOfficersModule],
  providers: [JobsService, SlaTransitionWorker, WearablePingScannerJob],
  exports: [JobsService, SlaTransitionWorker, WearablePingScannerJob],
})
export class JobsModule {}

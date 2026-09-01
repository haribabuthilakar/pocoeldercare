import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { SlaTransitionWorker } from './workers/sla-transition.worker';
import { WearablePingScannerJob } from './wearable-ping-scanner.job';

@Injectable()
export class JobsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(JobsService.name);
  private slaInterval: any;

  constructor(
    private readonly slaWorker: SlaTransitionWorker,
    private readonly wearableScanner: WearablePingScannerJob,
  ) {}

  async onModuleInit() {
    this.logger.log('Initializing in-process background job runners (1GB droplet tuned)...');

    // Run SLA transitions evaluation every 60 seconds (D-08)
    if (process.env.NODE_ENV !== 'test') {
      this.slaInterval = setInterval(async () => {
        try {
          await this.slaWorker.processSlaTransitions(50);
        } catch (err: any) {
          this.logger.error(`SLA cron tick error: ${err.message}`);
        }
      }, 60000);
    }
  }

  async onModuleDestroy() {
    if (this.slaInterval) clearInterval(this.slaInterval);
  }
}

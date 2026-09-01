import { Module } from '@nestjs/common';
import { ActivityFeedService } from './activity-feed.service';
import { ActivityFeedController } from './activity-feed.controller';
import { AiTriageModule } from '../ai-triage/ai-triage.module';
import { TicketsModule } from '../tickets/tickets.module';

@Module({
  imports: [AiTriageModule, TicketsModule],
  controllers: [ActivityFeedController],
  providers: [ActivityFeedService],
  exports: [ActivityFeedService],
})
export class ActivityFeedModule {}

import { Module } from '@nestjs/common';
import { PrismaModule } from './common/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { HouseholdsModule } from './modules/households/households.module';
import { CareOfficersModule } from './modules/care-officers/care-officers.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { TicketsModule } from './modules/tickets/tickets.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { BillingModule } from './modules/billing/billing.module';
import { MediaModule } from './modules/media/media.module';
import { ActivityFeedModule } from './modules/activity-feed/activity-feed.module';
import { AiTriageModule } from './modules/ai-triage/ai-triage.module';
import { IntegrationsModule } from '@poco/integrations';
import { WebhooksModule } from './modules/webhooks/webhooks.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    HouseholdsModule,
    CareOfficersModule,
    CatalogModule,
    TicketsModule,
    JobsModule,
    BillingModule,
    MediaModule,
    ActivityFeedModule,
    AiTriageModule,
    IntegrationsModule,
    WebhooksModule,
  ],
})
export class AppModule {}

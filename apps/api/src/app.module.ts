import { IntegrationsModule } from '@poco/integrations';
import { WebhooksModule } from './modules/webhooks/webhooks.module';

export class AppModule {
  public static readonly imports = [IntegrationsModule, WebhooksModule];
}

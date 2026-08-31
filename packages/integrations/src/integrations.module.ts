import { FaultInjectorService } from './core/fault-injector.service';
import { OutboundLoggerService } from './core/outbound-logger.service';

export interface IntegrationsModuleConfig {
  enableFaultInjection?: boolean;
}

export class IntegrationsModule {
  public static readonly providers = [FaultInjectorService, OutboundLoggerService];

  public static readonly exports = [FaultInjectorService, OutboundLoggerService];
}

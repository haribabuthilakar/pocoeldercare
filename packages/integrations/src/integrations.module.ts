import { FaultInjectorService } from './core/fault-injector.service';
import { OutboundLoggerService } from './core/outbound-logger.service';
import { CallbackSchedulerService } from './core/callback-scheduler.service';
import { PococareAdapter } from './adapters/pococare.adapter';
import { RazorpayAdapter } from './adapters/razorpay.adapter';
import { AbhaAdapter } from './adapters/abha.adapter';
import { ExotelAdapter } from './adapters/exotel.adapter';
import { WhatsAppAdapter } from './adapters/whatsapp.adapter';
import { OneMgAdapter } from './adapters/one-mg.adapter';
import { OrangeLabsAdapter } from './adapters/orange-labs.adapter';
import { HealthServicesAdapter } from './adapters/health-services.adapter';
import { InstamartAdapter } from './adapters/instamart.adapter';
import { SwiggyAdapter } from './adapters/swiggy.adapter';
import { UrbanCompanyAdapter } from './adapters/urban-company.adapter';
import { OlaAdapter } from './adapters/ola.adapter';
import { WearableIotAdapter } from './adapters/wearable-iot.adapter';
import { TestHarnessController } from './controllers/test-harness.controller';

export class IntegrationsModule {
  public static readonly coreProviders = [
    FaultInjectorService,
    OutboundLoggerService,
    CallbackSchedulerService
  ];

  public static readonly adapterProviders = [
    PococareAdapter,
    RazorpayAdapter,
    AbhaAdapter,
    ExotelAdapter,
    WhatsAppAdapter,
    OneMgAdapter,
    OrangeLabsAdapter,
    HealthServicesAdapter,
    InstamartAdapter,
    SwiggyAdapter,
    UrbanCompanyAdapter,
    OlaAdapter,
    WearableIotAdapter
  ];

  public static readonly controllers = [TestHarnessController];

  public static readonly providers = [
    ...IntegrationsModule.coreProviders,
    ...IntegrationsModule.adapterProviders
  ];

  public static readonly exports = [
    ...IntegrationsModule.coreProviders,
    ...IntegrationsModule.adapterProviders
  ];
}

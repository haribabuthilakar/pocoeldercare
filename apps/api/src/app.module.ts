import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './database/prisma.module';
import { RedisModule } from './redis/redis.module';
import { AuthModule } from './modules/auth/auth.module';
import { HouseholdsModule } from './modules/households/households.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { SopModule } from './modules/sop/sop.module';
import { ClinicalModule } from './modules/clinical/clinical.module';
import { BillingModule } from './modules/billing/billing.module';
import { VitalsModule } from './modules/vitals/vitals.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
    }),
    PrismaModule,
    RedisModule,
    HealthModule,
    AuthModule,
    HouseholdsModule,
    CatalogModule,
    SopModule,
    ClinicalModule,
    BillingModule,
    VitalsModule,
  ],
})
export class AppModule {}

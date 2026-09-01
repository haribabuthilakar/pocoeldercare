import { Injectable, OnModuleInit, OnModuleDestroy, Global, Module } from '@nestjs/common';
import { PrismaClient, prisma } from '@poco/database';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  public client: PrismaClient = prisma;

  async onModuleInit() {
    // Lazy or initialized
  }

  async onModuleDestroy() {
    await (this.client as any).$disconnect?.();
  }

  get person() { return this.client.person; }
  get internalUser() { return this.client.internalUser; }
  get internalUserRole() { return this.client.internalUserRole; }
  get household() { return this.client.household; }
  get householdMembership() { return this.client.householdMembership; }
  get senior() { return this.client.senior; }
  get seniorMedicalProfile() { return this.client.seniorMedicalProfile; }
  get familyEscalationTier() { return this.client.familyEscalationTier; }
  get careOfficerProfile() { return this.client.careOfficerProfile; }
  get certification() { return this.client.certification; }
  get careOfficerCertification() { return this.client.careOfficerCertification; }
  get lead() { return this.client.lead; }
  get onboardingVisit() { return this.client.onboardingVisit; }
  get ticket() { return this.client.ticket; }
  get serviceRequest() { return this.client.serviceRequest; }
  get serviceCatalog() { return this.client.serviceCatalog; }
  get serviceCatalogVersion() { return this.client.serviceCatalogVersion; }
  get package() { return this.client.package; }
  get packageVersion() { return this.client.packageVersion; }
  get householdSubscription() { return this.client.householdSubscription; }
  get quotaAllocation() { return this.client.quotaAllocation; }
  get householdWallet() { return this.client.householdWallet; }
  get walletTransaction() { return this.client.walletTransaction; }
  get activityFeedItem() { return this.client.activityFeedItem; }
  get careOfficerVisitLog() { return this.client.careOfficerVisitLog; }
  get seniorVitalReading() { return this.client.seniorVitalReading; }
  get auditLog() { return this.client.auditLog; }
  get systemConfig() { return this.client.systemConfig; }
  get $transaction() { return this.client.$transaction.bind(this.client); }
}

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}

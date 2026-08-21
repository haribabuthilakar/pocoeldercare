import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../database/prisma.module';
import { RedisModule } from '../redis/redis.module';
import { AuthService } from '../modules/auth/auth.service';
import { HouseholdsService } from '../modules/households/households.service';
import { CatalogService } from '../modules/catalog/catalog.service';
import { SopService } from '../modules/sop/sop.service';
import { ClinicalService } from '../modules/clinical/clinical.service';
import { BillingService } from '../modules/billing/billing.service';
import { VitalsService } from '../modules/vitals/vitals.service';
import { PrismaService } from '../database/prisma.service';
import { ConsultTypeEnum, RoleType, EmergencySeverity } from '@poco/database';

describe('End-to-End Pococare Platform Workflows', () => {
  let authService: AuthService;
  let householdsService: HouseholdsService;
  let catalogService: CatalogService;
  let sopService: SopService;
  let clinicalService: ClinicalService;
  let billingService: BillingService;
  let vitalsService: VitalsService;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env', '../../.env'] }),
        PrismaModule,
        RedisModule,
        JwtModule.register({}),
      ],
      providers: [
        AuthService,
        HouseholdsService,
        CatalogService,
        SopService,
        ClinicalService,
        BillingService,
        VitalsService,
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    householdsService = module.get<HouseholdsService>(HouseholdsService);
    catalogService = module.get<CatalogService>(CatalogService);
    sopService = module.get<SopService>(SopService);
    clinicalService = module.get<ClinicalService>(ClinicalService);
    billingService = module.get<BillingService>(BillingService);
    vitalsService = module.get<VitalsService>(VitalsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('Flow 1: Family Member Onboarding -> Household & Member Setup -> Sub-2s ICE Query', async () => {
    // 1. Register NRI Son
    const email = `nri.e2e.${Date.now()}@example.com`;
    const reg = await authService.register({
      name: 'Aditya Varma',
      email,
      password: 'StrongPassword2026!',
      phone: `+1650${Math.floor(1000000 + Math.random() * 9000000)}`,
      initialRole: RoleType.FAMILY_PRIMARY_NRI,
    });
    expect(reg.accessToken).toBeDefined();

    // 2. Create Household in Hyderabad
    const hhPhone = `+9194${Math.floor(10000000 + Math.random() * 90000000)}`;
    const household = await householdsService.createHousehold({
      name: 'Varma Villa',
      city: 'Hyderabad',
      addressLine: 'Plot 42, Jubilee Hills Road No. 36',
      postalCode: '500033',
      primaryContactPhone: hhPhone,
    });
    expect(household.id).toBeDefined();
    expect(household.city).toBe('Hyderabad');

    // 3. Add Elderly Father
    const member = await householdsService.addMember(household.id, {
      firstName: 'Ramachandra',
      lastName: 'Varma',
      relationship: 'FATHER',
      phone: hhPhone,
      bloodGroup: 'O_POSITIVE',
      dateOfBirth: '1947-08-15',
    });
    expect(member.id).toBeDefined();

    // 4. Update ICE profile
    await householdsService.updateMemberIceProfile(member.id, {
      chronicConditions: ['Type 2 Diabetes', 'Hypertension'],
      allergies: ['Aspirin', 'Iodine contrast'],
      preferredHospitalName: 'Apollo Hospitals Jubilee Hills',
      preferredHospitalPhone: '+914023607777',
      emergencyNotes: 'Key with neighbor in Flat 101 in emergency.',
    });

    // 5. Benchmark ICE retrieval latency (must be < 2000ms)
    const t0 = performance.now();
    const ice = await householdsService.getMemberIceProfile(member.id);
    const elapsedMs = performance.now() - t0;

    expect(ice.preferredHospitalName).toBe('Apollo Hospitals Jubilee Hills');
    expect(ice.chronicConditions).toContain('Type 2 Diabetes');
    expect(elapsedMs).toBeLessThan(2000);
  });

  it('Flow 2: Double-Spend Prevention under Concurrent Wallet Booking Holds', async () => {
    // Create a new household with exact ₹1,000 (100,000 paise) wallet
    const uniquePhone = `+9193${Math.floor(10000000 + Math.random() * 90000000)}`;
    const hh = await householdsService.createHousehold({
      name: 'Test Wallet Household',
      city: 'Bangalore',
      addressLine: 'Test Address',
      postalCode: '560001',
      primaryContactPhone: uniquePhone,
    });

    const wallet = await billingService.getWalletByHousehold(hh.id);
    await billingService.topupWallet(wallet.id, {
      amountPaise: 100000, // ₹1,000
      paymentReference: `PG-E2E-${Date.now()}`,
      description: 'Initial balance',
    });

    // Try two concurrent holds of ₹800 each (Total ₹1,600 > ₹1,000 balance)
    const hold1Promise = billingService.holdFunds({
      walletId: wallet.id,
      amountPaise: 80000,
      serviceExecutionId: `exec-conc-1-${Date.now()}`,
      description: 'Booking 1',
    });

    const hold2Promise = billingService.holdFunds({
      walletId: wallet.id,
      amountPaise: 80000,
      serviceExecutionId: `exec-conc-2-${Date.now()}`,
      description: 'Booking 2',
    });

    const results = await Promise.allSettled([hold1Promise, hold2Promise]);
    const fulfilled = results.filter((r) => r.status === 'fulfilled');
    const rejected = results.filter((r) => r.status === 'rejected');

    // Exactly one should succeed and one should fail with insufficient balance
    expect(fulfilled.length).toBe(1);
    expect(rejected.length).toBe(1);

    // Final balance must remain >= 0 (strictly ₹200 = 20,000 paise)
    const finalWallet = await billingService.getWalletByHousehold(hh.id);
    expect(finalWallet.balancePaise).toBe(20000);
  });

  it('Flow 3: Complete Doctor Home Visit -> Clinical Exam -> Prescription -> Fund Settlement', async () => {
    const doctor = await prisma.user.findFirst({ where: { email: 'dr.anand@pococare.in' } });
    const member = await prisma.member.findFirst({ where: { id: 'mem-blr-001' } });
    const wallet = await billingService.getWalletByHousehold(member!.householdId);

    // 1. Schedule Home Visit
    const execution = await clinicalService.scheduleConsult({
      householdId: member!.householdId,
      memberId: member!.id,
      doctorUserId: doctor!.id,
      consultType: ConsultTypeEnum.DOCTOR_HOME_VISIT,
      specialty: 'Geriatric Assessment',
      chiefComplaint: 'Post-viral fatigue and balance evaluation',
      scheduledAt: new Date().toISOString(),
    });

    expect(execution.id).toBeDefined();

    // 2. Hold Funds for visit (₹1,500 = 150,000 paise)
    await billingService.holdFunds({
      walletId: wallet.id,
      amountPaise: 150000,
      serviceExecutionId: execution.id,
      description: 'Hold for Doctor Home Visit #MED-03',
    });

    // 3. Record Vitals during visit
    const vitalsRes = await vitalsService.recordVitals({
      memberId: member!.id,
      serviceExecutionId: execution.id,
      systolicBp: 128,
      diastolicBp: 82,
      pulseBpm: 74,
      spo2Percent: 97,
      temperatureF: 98.4,
    });
    expect(vitalsRes.reading).toBeDefined();

    // 4. Doctor enters clinical notes & ICD-10 diagnosis
    const consultNotes = await clinicalService.submitConsultNotes(
      execution.clinicalConsult!.id,
      {
        clinicalNotes: 'Clear lung fields, normal gait and cognitive function.',
        diagnosisIcd10: 'R53.83 (Other fatigue)',
        followUpDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      },
    );
    expect(consultNotes.diagnosisIcd10).toContain('R53.83');

    // 5. Doctor issues digital prescription
    const rx = await clinicalService.createPrescription(execution.clinicalConsult!.id, {
      medicationItems: [
        {
          name: 'CoQ10 100mg',
          dosage: '1 capsule',
          frequency: 'Once daily with lunch',
          durationDays: 30,
        },
      ],
      pdfUrl: 'https://cdn.pococare.in/prescriptions/rx-e2e-001.pdf',
    });
    expect(rx.id).toBeDefined();

    // 6. Settle held funds into immutable DEBIT ledger
    const settleTx = await billingService.settleHold(execution.id);
    expect(settleTx.type).toBe('DEBIT');
    expect(settleTx.amountPaise).toBe(150000);
  });
});
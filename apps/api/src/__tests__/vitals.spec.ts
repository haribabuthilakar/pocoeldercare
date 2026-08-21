import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../database/prisma.module';
import { VitalsService } from '../modules/vitals/vitals.service';
import { PrismaService } from '../database/prisma.service';
import { EmergencySeverity } from '@poco/database';

describe('Vitals Ingestion & Emergency Drill Integration', () => {
  let vitalsService: VitalsService;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env', '../../.env'] }),
        PrismaModule,
      ],
      providers: [VitalsService],
    }).compile();

    vitalsService = module.get<VitalsService>(VitalsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should ingest vitals reading and compute 7-day trend statistics', async () => {
    const res = await vitalsService.recordVitals({
      memberId: 'mem-blr-001',
      systolicBp: 122,
      diastolicBp: 80,
      pulseBpm: 72,
      spo2Percent: 98,
      bloodGlucoseMgDl: 105,
      notes: 'Morning reading after light breakfast',
    });

    expect(res.reading).toBeDefined();
    expect(res.isAbnormal).toBe(false);

    const history = await vitalsService.getMemberVitalsHistory('mem-blr-001', 7);
    expect(history.readings.length).toBeGreaterThan(0);
    expect(history.averages.avgSystolicBp).toBeGreaterThan(0);
  });

  it('should flag abnormal vitals when exceeding geriatric thresholds', async () => {
    const res = await vitalsService.recordVitals({
      memberId: 'mem-blr-001',
      systolicBp: 165, // High
      diastolicBp: 98,  // High
      pulseBpm: 110,   // High
      spo2Percent: 89,  // Low
    });

    expect(res.isAbnormal).toBe(true);
    expect(res.alertMessage).toBeDefined();
  });

  it('should execute simulated quarterly emergency drill without live ambulance dispatch', async () => {
    const household = await prisma.household.findFirst({ where: { city: 'Bangalore' } });
    const drill = await vitalsService.runEmergencyDrill({
      householdId: household!.id,
      memberId: 'mem-blr-001',
      initiatedByPhone: '+919880011223',
      severity: EmergencySeverity.CRITICAL,
    });

    expect(drill.success).toBe(true);
    expect(drill.isDrill).toBe(true);
    expect(drill.status).toBe('RESOLVED');
  });
});

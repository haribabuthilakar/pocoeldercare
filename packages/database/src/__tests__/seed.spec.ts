import { describe, it, expect, afterAll } from 'vitest';
import { prisma } from '../index';
import { PlanTierName, ServiceCategoryName } from '@prisma/client';

describe('Database Seed Verification', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should have 4 plan tiers seeded', async () => {
    const count = await prisma.planTier.count();
    expect(count).toBe(4);
    const sampoorna = await prisma.planTier.findUnique({ where: { name: PlanTierName.SAMPOORNA } });
    expect(sampoorna).toBeDefined();
    expect(sampoorna?.annualPricePaise).toBe(8990000);
  });

  it('should have all 90 services seeded across categories A to L', async () => {
    const count = await prisma.serviceCatalog.count();
    expect(count).toBe(90);
    const emg01 = await prisma.serviceCatalog.findUnique({ where: { code: 'EMG-01' } });
    expect(emg01?.category).toBe(ServiceCategoryName.A_EMERGENCY);
  });

  it('should have versioned SOP templates created', async () => {
    const sops = await prisma.sopTemplate.findMany();
    expect(sops.length).toBeGreaterThanOrEqual(5);
  });

  it('should have Bangalore sample household with ICE profile and vitals', async () => {
    const household = await prisma.household.findUnique({
      where: { id: 'hh-blr-001' },
      include: { members: { include: { iceProfile: true, vitalsReadings: true } }, wallet: true }
    });
    expect(household).toBeDefined();
    expect(household?.city).toBe('Bangalore');
    expect(household?.wallet?.balancePaise).toBeGreaterThan(0);
    expect(household?.members.length).toBeGreaterThan(0);
    expect(household?.members[0].iceProfile?.allergies).toContain('Penicillin');
    expect(household?.members[0].vitalsReadings.length).toBeGreaterThanOrEqual(7);
  });
});

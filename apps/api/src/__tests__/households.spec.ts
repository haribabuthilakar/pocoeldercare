import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../database/prisma.module';
import { RedisModule } from '../redis/redis.module';
import { HouseholdsService } from '../modules/households/households.service';
import { PrismaService } from '../database/prisma.service';

describe('Households & ICE Profile Integration', () => {
  let householdsService: HouseholdsService;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env', '../../.env'] }),
        PrismaModule,
        RedisModule,
      ],
      providers: [HouseholdsService],
    }).compile();

    householdsService = module.get<HouseholdsService>(HouseholdsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should create a new household with zero initial wallet balance', async () => {
    const uniquePhone = `+9198${Math.floor(10000000 + Math.random() * 90000000)}`;
    const household = await householdsService.createHousehold({
      name: 'Iyer Residence',
      city: 'Chennai',
      addressLine: '14, 4th Cross St, Besant Nagar',
      postalCode: '600090',
      primaryContactPhone: uniquePhone,
    });

    expect(household).toBeDefined();
    expect(household.city).toBe('Chennai');
    expect(household.wallet?.balancePaise).toBe(0);
  });

  it('should add a senior member to household and auto-create ICE profile', async () => {
    const households = await householdsService.listHouseholds('Bangalore');
    const hh = households[0];
    expect(hh).toBeDefined();

    const member = await householdsService.addMember(hh.id, {
      firstName: 'Kalyani',
      lastName: 'Menon',
      relationship: 'MOTHER',
      phone: `+9197${Math.floor(10000000 + Math.random() * 90000000)}`,
      bloodGroup: 'B_POSITIVE',
    });

    expect(member).toBeDefined();
    expect(member.firstName).toBe('Kalyani');
    expect(member.iceProfile).toBeDefined();
  });

  it('should fetch and update ICE profile and cache in Redis', async () => {
    const member = await prisma.member.findFirst({
      where: { id: 'mem-blr-001' },
      include: { iceProfile: true },
    });
    expect(member).toBeDefined();

    const startTime = performance.now();
    const ice = await householdsService.getMemberIceProfile(member!.id);
    const durationMs = performance.now() - startTime;

    expect(ice).toBeDefined();
    expect(ice.preferredHospitalName).toContain('Manipal');
    // Ensure sub-2-second query performance
    expect(durationMs).toBeLessThan(2000);

    // Update ICE profile
    const updated = await householdsService.updateMemberIceProfile(member!.id, {
      emergencyNotes: 'Updated: Prefers morning teleconsults.',
      allergies: ['Penicillin', 'Sulfa drugs', 'Peanuts'],
    });

    expect(updated.emergencyNotes).toContain('Updated');
    expect(updated.allergies).toContain('Peanuts');
  });
});

const fs = require('fs');
const path = require('path');

function writeFile(relPath, content) {
  const fullPath = path.resolve(relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
  console.log('Created:', relPath);
}

// 1. Auth Tests
writeFile('apps/api/src/__tests__/auth.spec.ts', `
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../database/prisma.module';
import { RedisModule } from '../redis/redis.module';
import { AuthService } from '../modules/auth/auth.service';
import { RoleType } from '@poco/database';
import { PrismaService } from '../database/prisma.service';

describe('AuthService Integration', () => {
  let authService: AuthService;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env', '../../.env'] }),
        PrismaModule,
        RedisModule,
        JwtModule.register({}),
      ],
      providers: [AuthService],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should send OTP and return devOtp in development', async () => {
    const res = await authService.sendOtp({ phone: '+919999988888' });
    expect(res.success).toBe(true);
    expect(res.phone).toBe('+919999988888');
    expect(res.devOtp).toBe('123456');
  });

  it('should verify OTP and return dual JWT tokens and user payload', async () => {
    const res = await authService.verifyOtp({ phone: '+919999988888', otp: '123456' });
    expect(res.accessToken).toBeDefined();
    expect(res.refreshToken).toBeDefined();
    expect(res.user).toBeDefined();
    expect(res.user.phone).toBe('+919999988888');
  });

  it('should register a new NRI family member with email and password', async () => {
    const email = \`nri.\${Date.now()}@example.com\`;
    const res = await authService.register({
      name: 'Priya Sharma (NRI US)',
      email,
      password: 'SecurePassword123!',
      phone: \`+1415\${Math.floor(1000000 + Math.random() * 9000000)}\`,
      initialRole: RoleType.FAMILY_PRIMARY_NRI,
    });

    expect(res.accessToken).toBeDefined();
    expect(res.user.email).toBe(email);
    expect(res.user.activeRole).toBe(RoleType.FAMILY_PRIMARY_NRI);
  });

  it('should login with email and verify password hash', async () => {
    const res = await authService.loginWithEmail({
      email: 'admin@pococare.in',
      password: 'PocoCare@2026',
    });

    expect(res.accessToken).toBeDefined();
    expect(res.user.name).toBe('Radhakrishnan Nair');
  });

  it('should refresh access token using valid refresh token', async () => {
    const loginRes = await authService.loginWithEmail({
      email: 'dispatcher@pococare.in',
      password: 'PocoCare@2026',
    });

    const refreshRes = await authService.refreshToken({
      refreshToken: loginRes.refreshToken,
    });

    expect(refreshRes.accessToken).toBeDefined();
    expect(refreshRes.refreshToken).toBeDefined();
  });
});
`);

// 2. Households & ICE Profile Tests
writeFile('apps/api/src/__tests__/households.spec.ts', `
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
    const uniquePhone = \`+9198\${Math.floor(10000000 + Math.random() * 90000000)}\`;
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
      phone: \`+9197\${Math.floor(10000000 + Math.random() * 90000000)}\`,
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
`);

// 3. Catalog & Dynamic SOP Tests
writeFile('apps/api/src/__tests__/catalog-sop.spec.ts', `
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../database/prisma.module';
import { CatalogService } from '../modules/catalog/catalog.service';
import { SopService } from '../modules/sop/sop.service';
import { PrismaService } from '../database/prisma.service';
import { ServiceCategoryName, PlanTierName } from '@poco/database';

describe('Catalog & Dynamic SOP Engine Integration', () => {
  let catalogService: CatalogService;
  let sopService: SopService;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env', '../../.env'] }),
        PrismaModule,
      ],
      providers: [CatalogService, SopService],
    }).compile();

    catalogService = module.get<CatalogService>(CatalogService);
    sopService = module.get<SopService>(SopService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should list all 90 services and filter by category', async () => {
    const allServices = await catalogService.listServices();
    expect(allServices.length).toBe(90);

    const emergencyServices = await catalogService.listServices(ServiceCategoryName.A_EMERGENCY);
    expect(emergencyServices.length).toBe(12);
  });

  it('should filter services by PlanTier quota inclusion', async () => {
    const sampoornaServices = await catalogService.listServices(undefined, PlanTierName.SAMPOORNA);
    expect(sampoornaServices.length).toBeGreaterThan(20);
  });

  it('should create and version a dynamic SOP checklist template', async () => {
    const service = await prisma.serviceCatalog.findUnique({
      where: { code: 'MED-03' }, // Doctor Home Visit
    });
    expect(service).toBeDefined();

    const template = await sopService.createOrVersionSopTemplate({
      serviceCatalogId: service!.id,
      title: 'Geriatric Comprehensive Home Consult SOP',
      description: 'Step-by-step doctor clinical examination protocol',
      steps: [
        { id: 'vitals_eval', title: 'Measure and record 4 vital signs', type: 'VITALS', required: true },
        { id: '4ms_eval', title: 'Review What Matters & Medication adherence', type: 'TEXT', required: true },
        { id: 'clinical_notes', title: 'Enter physical examination summary', type: 'TEXT', required: true },
        { id: 'doctor_sign', title: 'Doctor digital signature', type: 'SIGNATURE', required: true },
      ],
    });

    expect(template).toBeDefined();
    expect(template.version).toBeGreaterThanOrEqual(1);
    expect(template.active).toBe(true);
  });

  it('should evaluate completed checklist against SOP schema and reject missing required steps', async () => {
    const service = await prisma.serviceCatalog.findUnique({
      where: { code: 'MED-03' },
      include: { sopTemplates: { orderBy: { version: 'desc' }, take: 1 } },
    });
    const sop = service!.sopTemplates[0];

    // Missing doctor_sign
    const partialSubmission = {
      sopTemplateId: sop.id,
      completedSteps: {
        vitals_eval: { systolic: 120, diastolic: 80 },
        '4ms_eval': 'Patient active and alert',
        clinical_notes: 'Lungs clear, cardiovascular normal',
      },
    };

    await expect(sopService.evaluateChecklist(partialSubmission)).rejects.toThrow();

    // Complete submission
    const completeSubmission = {
      sopTemplateId: sop.id,
      completedSteps: {
        ...partialSubmission.completedSteps,
        doctor_sign: 'data:image/png;base64,mockSignatureBytes...',
      },
    };

    const evaluation = await sopService.evaluateChecklist(completeSubmission);
    expect(evaluation.isValid).toBe(true);
    expect(evaluation.totalSteps).toBe(4);
  });
});
`);

console.log('Finished writing API test suites');


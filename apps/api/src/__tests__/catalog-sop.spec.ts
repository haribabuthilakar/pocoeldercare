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

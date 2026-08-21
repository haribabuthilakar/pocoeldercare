import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../database/prisma.module';
import { ClinicalService } from '../modules/clinical/clinical.service';
import { PrismaService } from '../database/prisma.service';
import { ConsultTypeEnum } from '@poco/database';

describe('Clinical Consultations & Prescriptions Integration', () => {
  let clinicalService: ClinicalService;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env', '../../.env'] }),
        PrismaModule,
      ],
      providers: [ClinicalService],
    }).compile();

    clinicalService = module.get<ClinicalService>(ClinicalService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should schedule a doctor home visit with structured clinical consult', async () => {
    const doctor = await prisma.user.findFirst({ where: { email: 'dr.anand@pococare.in' } });
    const member = await prisma.member.findFirst({ where: { id: 'mem-blr-001' } });
    expect(doctor).toBeDefined();
    expect(member).toBeDefined();

    const consult = await clinicalService.scheduleConsult({
      householdId: member!.householdId,
      memberId: member!.id,
      doctorUserId: doctor!.id,
      consultType: ConsultTypeEnum.DOCTOR_HOME_VISIT,
      specialty: 'Geriatric Medicine',
      chiefComplaint: 'Routine quarterly comprehensive geriatric assessment',
      scheduledAt: new Date().toISOString(),
    });

    expect(consult).toBeDefined();
    expect(consult.clinicalConsult).toBeDefined();
    expect(consult.clinicalConsult?.consultType).toBe(ConsultTypeEnum.DOCTOR_HOME_VISIT);
  });

  it('should submit clinical notes with ICD-10 diagnosis and issue digital prescription', async () => {
    const consult = await prisma.clinicalConsult.findFirst({
      where: { memberId: 'mem-blr-001' },
      orderBy: { createdAt: 'desc' },
    });
    expect(consult).toBeDefined();

    // 1. Submit notes
    const updatedNotes = await clinicalService.submitConsultNotes(consult!.id, {
      clinicalNotes: 'Blood pressure well-controlled on Telmisartan. Appetite good.',
      diagnosisIcd10: 'I10 (Essential hypertension)',
      followUpDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    });

    expect(updatedNotes.diagnosisIcd10).toContain('I10');

    // 2. Issue digital prescription
    const prescription = await clinicalService.createPrescription(consult!.id, {
      medicationItems: [
        {
          name: 'Telmisartan 40mg',
          dosage: '1 tablet',
          frequency: 'Once daily after breakfast',
          durationDays: 90,
        },
      ],
      pdfUrl: 'https://cdn.pococare.in/rx/rx-blr-001.pdf',
    });

    expect(prescription).toBeDefined();
    expect(prescription.medicationItems).toHaveLength(1);
  });
});

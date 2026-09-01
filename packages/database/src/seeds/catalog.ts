import type { PrismaClient } from '@prisma/client';
import { SopProofType, ServiceCategory } from '@poco/constants';

export const SEED_CATALOG = [
  {
    id: 'a0000001-0000-4000-a000-000000000001',
    code: 'EMERGENCY_RESPONSE',
    name: 'Emergency Response Coordination',
    category: ServiceCategory.EMERGENCY,
    defaultIsEmergency: true,
    pricePaise: 150000, // ₹1,500
    estimatedDurationMinutes: 45,
    requiredCertifications: ['BLS_CPR', 'GERIATRIC_FIRST_AID'],
    sopSteps: [
      { stepOrder: 1, title: 'Verify Senior Safety & Consciousness', proofType: SopProofType.CHOICE, choiceOptions: ['Conscious & Responsive', 'Disoriented', 'Unconscious'] },
      { stepOrder: 2, title: 'Measure Vital Signs (BP, SpO2, Pulse)', proofType: SopProofType.TEXT },
      { stepOrder: 3, title: 'Photograph Emergency Setting / Incident Location', proofType: SopProofType.PHOTO },
      { stepOrder: 4, title: 'Coordinate with ICE Family Contact & Dispatch Doctor/Ambulance', proofType: SopProofType.CHOICE, choiceOptions: ['Family Notified & Transport Dispatched', 'Family Managing Locally'] }
    ]
  },
  {
    id: 'a0000002-0000-4000-a000-000000000002',
    code: 'DOCTOR_HOME_VISIT',
    name: 'Doctor Home Consultation',
    category: ServiceCategory.CLINICAL,
    defaultIsEmergency: false,
    pricePaise: 120000, // ₹1,200
    estimatedDurationMinutes: 60,
    requiredCertifications: [],
    sopSteps: [
      { stepOrder: 1, title: 'Record Pre-Consultation Vitals', proofType: SopProofType.TEXT },
      { stepOrder: 2, title: 'Doctor Clinical Examination', proofType: SopProofType.TEXT },
      { stepOrder: 3, title: 'Upload Signed Prescription Photo', proofType: SopProofType.PHOTO }
    ]
  },
  {
    id: 'a0000003-0000-4000-a000-000000000003',
    code: 'NURSING_CARE',
    name: 'Dedicated Nursing Visit',
    category: ServiceCategory.CLINICAL,
    defaultIsEmergency: false,
    pricePaise: 80000, // ₹800
    estimatedDurationMinutes: 45,
    requiredCertifications: ['GERIATRIC_FIRST_AID'],
    sopSteps: [
      { stepOrder: 1, title: 'Record Vitals Pre-Procedure', proofType: SopProofType.TEXT },
      { stepOrder: 2, title: 'Perform Prescribed Nursing Procedure', proofType: SopProofType.CHOICE, choiceOptions: ['Wound Dressing', 'Injection / Medication', 'Catheter / Stoma Care'] },
      { stepOrder: 3, title: 'Post-Procedure Status & Patient Comfort Verification', proofType: SopProofType.CHOICE, choiceOptions: ['Comfortable', 'Mild Pain / Monitored', 'Adverse Reaction'] }
    ]
  },
  {
    id: 'a0000004-0000-4000-a000-000000000004',
    code: 'PHYSIOTHERAPY',
    name: 'Geriatric Physiotherapy Session',
    category: ServiceCategory.CLINICAL,
    defaultIsEmergency: false,
    pricePaise: 70000, // ₹700
    estimatedDurationMinutes: 45,
    requiredCertifications: [],
    sopSteps: [
      { stepOrder: 1, title: 'Check Baseline Joint Pain Score (0-10)', proofType: SopProofType.CHOICE, choiceOptions: ['0 - No Pain', '1-3 Mild', '4-6 Moderate', '7-10 Severe'] },
      { stepOrder: 2, title: 'Perform Range-of-Motion & Strength Exercises', proofType: SopProofType.TEXT },
      { stepOrder: 3, title: 'Record Post-Session Mobility Status', proofType: SopProofType.CHOICE, choiceOptions: ['Improved Range', 'Unchanged', 'Tired / Resting'] }
    ]
  },
  {
    id: 'a0000005-0000-4000-a000-000000000005',
    code: 'MEDICINE_DELIVERY',
    name: 'Prescription Medicine Delivery',
    category: ServiceCategory.LOGISTICS,
    defaultIsEmergency: false,
    pricePaise: 15000, // ₹150
    estimatedDurationMinutes: 30,
    requiredCertifications: [],
    sopSteps: [
      { stepOrder: 1, title: 'Verify Medicine Package Against Prescription', proofType: SopProofType.CHOICE, choiceOptions: ['All Items Matched', 'Partial / Substitute Approved'] },
      { stepOrder: 2, title: 'Upload Pharmacy Receipt & Medicine Box Photo', proofType: SopProofType.PHOTO }
    ]
  },
  {
    id: 'a0000006-0000-4000-a000-000000000006',
    code: 'LAB_TEST_SAMPLE',
    name: 'Home Diagnostic Lab Collection',
    category: ServiceCategory.CLINICAL,
    defaultIsEmergency: false,
    pricePaise: 25000, // ₹250
    estimatedDurationMinutes: 30,
    requiredCertifications: [],
    sopSteps: [
      { stepOrder: 1, title: 'Verify Fasting / Pre-test Condition Compliance', proofType: SopProofType.CHOICE, choiceOptions: ['Fasting Compliant (>10 hrs)', 'Non-Fasting Approved'] },
      { stepOrder: 2, title: 'Upload Sample Barcode / Vials Photo', proofType: SopProofType.PHOTO }
    ]
  },
  {
    id: 'a0000007-0000-4000-a000-000000000007',
    code: 'VITAL_MONITORING',
    name: 'Clinical Vital Signs Check',
    category: ServiceCategory.CLINICAL,
    defaultIsEmergency: false,
    pricePaise: 30000, // ₹300
    estimatedDurationMinutes: 30,
    requiredCertifications: [],
    sopSteps: [
      { stepOrder: 1, title: 'Record Blood Pressure & Heart Rate', proofType: SopProofType.TEXT },
      { stepOrder: 2, title: 'Record Blood Glucose (Fasting/PP/Random)', proofType: SopProofType.TEXT },
      { stepOrder: 3, title: 'Record Pulse Oximetry (SpO2)', proofType: SopProofType.TEXT }
    ]
  },
  {
    id: 'a0000008-0000-4000-a000-000000000008',
    code: 'AMBULANCE_COORDINATION',
    name: 'Emergency Ambulance Coordination',
    category: ServiceCategory.EMERGENCY,
    defaultIsEmergency: true,
    pricePaise: 250000, // ₹2,500
    estimatedDurationMinutes: 60,
    requiredCertifications: [],
    sopSteps: [
      { stepOrder: 1, title: 'Dispatch Confirmation & Ambulance ETA', proofType: SopProofType.TEXT },
      { stepOrder: 2, title: 'Handover to Paramedic Team Photo', proofType: SopProofType.PHOTO }
    ]
  },
  {
    id: 'a0000009-0000-4000-a000-000000000009',
    code: 'CAREGIVER_CHECKIN',
    name: 'Care Officer Wellness Visit',
    category: ServiceCategory.COMPANIONSHIP,
    defaultIsEmergency: false,
    pricePaise: 40000, // ₹400
    estimatedDurationMinutes: 45,
    requiredCertifications: [],
    sopSteps: [
      { stepOrder: 1, title: 'Record Senior Mood & Mental Well-being', proofType: SopProofType.CHOICE, choiceOptions: ['Cheerful & Engaging', 'Calm / Neutral', 'Anxious / Low Energy', 'Distressed'] },
      { stepOrder: 2, title: 'Check Medication Adherence & Pill Box Refill', proofType: SopProofType.CHOICE, choiceOptions: ['Adherent / Well Stocked', 'Missed Doses Detected', 'Pills Depleted'] },
      { stepOrder: 3, title: 'Upload Cheerful Visit Photo with Senior', proofType: SopProofType.PHOTO }
    ]
  },
  {
    id: 'a0000010-0000-4000-a000-000000000010',
    code: 'DIETICIAN_CONSULT',
    name: 'Geriatric Diet & Nutrition Plan',
    category: ServiceCategory.ADVICE,
    defaultIsEmergency: false,
    pricePaise: 60000, // ₹600
    estimatedDurationMinutes: 45,
    requiredCertifications: [],
    sopSteps: [
      { stepOrder: 1, title: 'Nutritional Intake & Weight Assessment', proofType: SopProofType.TEXT },
      { stepOrder: 2, title: 'Upload Customized Diet Plan Chart', proofType: SopProofType.PHOTO }
    ]
  },
  {
    id: 'a0000011-0000-4000-a000-000000000011',
    code: 'MENTAL_WELLNESS',
    name: 'Cognitive & Companion Engagement',
    category: ServiceCategory.COMPANIONSHIP,
    defaultIsEmergency: false,
    pricePaise: 40000, // ₹400
    estimatedDurationMinutes: 45,
    requiredCertifications: [],
    sopSteps: [
      { stepOrder: 1, title: 'Cognitive Engagement Activity Completed', proofType: SopProofType.CHOICE, choiceOptions: ['Crossword / Puzzle', 'Music & Reminiscence', 'Video Call with Grandchildren', 'Casual Storytelling'] }
    ]
  },
  {
    id: 'a0000012-0000-4000-a000-000000000012',
    code: 'HOSPITAL_ESCORT',
    name: 'Care Officer Hospital Escort',
    category: ServiceCategory.LOGISTICS,
    defaultIsEmergency: false,
    pricePaise: 100000, // ₹1,000
    estimatedDurationMinutes: 180,
    requiredCertifications: [],
    sopSteps: [
      { stepOrder: 1, title: 'Arrive at Hospital & Wheelchair Assistance', proofType: SopProofType.PHOTO },
      { stepOrder: 2, title: 'Record Doctor Summary Notes', proofType: SopProofType.TEXT },
      { stepOrder: 3, title: 'Safely Return Senior Home & Update Family', proofType: SopProofType.CHOICE, choiceOptions: ['Safely Returned Home', 'Admitted to Hospital'] }
    ]
  }
];

export const SEED_CERTIFICATIONS = [
  { id: 'c0000001-0000-4000-a000-000000000001', code: 'BLS_CPR', name: 'Basic Life Support & CPR', description: 'Certified in AHA emergency BLS and CPR resuscitation.', validityDays: 730 },
  { id: 'c0000002-0000-4000-a000-000000000002', code: 'GERIATRIC_FIRST_AID', name: 'Geriatric First Aid', description: 'Trained in fall mitigation, fracture stabilization, and acute geriatric care.', validityDays: 730 },
  { id: 'c0000003-0000-4000-a000-000000000003', code: 'DEMENTIA_CARE', name: 'Specialized Dementia & Cognitive Support', description: 'Certified in Alzheimer and dementia memory communication.', validityDays: 365 }
];

export async function seedCatalog(prisma: PrismaClient): Promise<void> {
  // 1. Seed Certifications
  for (const cert of SEED_CERTIFICATIONS) {
    await prisma.certification.upsert({
      where: { code: cert.code },
      update: { name: cert.name, description: cert.description, validityDays: cert.validityDays },
      create: { id: cert.id, code: cert.code, name: cert.name, description: cert.description, validityDays: cert.validityDays }
    });
  }

  // 2. Seed Service Catalog & SOPs
  for (const item of SEED_CATALOG) {
    const catalog = await prisma.serviceCatalog.upsert({
      where: { code: item.code },
      update: {
        name: item.name,
        category: item.category,
        defaultIsEmergency: item.defaultIsEmergency
      },
      create: {
        id: item.id,
        code: item.code,
        name: item.name,
        category: item.category,
        defaultIsEmergency: item.defaultIsEmergency
      }
    });

    const versionId = `b${item.id.slice(1)}`;
    const catalogVersion = await prisma.serviceCatalogVersion.upsert({
      where: {
        serviceCatalogId_version: {
          serviceCatalogId: catalog.id,
          version: 1
        }
      },
      update: {
        pricePaise: item.pricePaise,
        estimatedDurationMinutes: item.estimatedDurationMinutes,
        requiredCertifications: item.requiredCertifications ?? []
      },
      create: {
        id: versionId,
        serviceCatalogId: catalog.id,
        version: 1,
        pricePaise: item.pricePaise,
        estimatedDurationMinutes: item.estimatedDurationMinutes,
        requiredCertifications: item.requiredCertifications ?? [],
        effectiveFrom: new Date('2026-01-01T00:00:00Z')
      }
    });

    if (item.sopSteps && item.sopSteps.length > 0) {
      for (const step of item.sopSteps) {
        const stepId = `c${catalogVersion.id.slice(1, -2)}${step.stepOrder.toString().padStart(2, '0')}`;
        await prisma.sopStepVersion.upsert({
          where: {
            serviceCatalogVersionId_stepOrder: {
              serviceCatalogVersionId: catalogVersion.id,
              stepOrder: step.stepOrder
            }
          },
          update: {
            title: step.title,
            proofType: step.proofType,
            choiceOptions: step.choiceOptions ?? []
          },
          create: {
            id: stepId,
            serviceCatalogVersionId: catalogVersion.id,
            stepOrder: step.stepOrder,
            title: step.title,
            isRequired: true,
            proofType: step.proofType,
            choiceOptions: step.choiceOptions ?? []
          }
        });
      }
    }
  }
}

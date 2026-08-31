import type { PrismaClient } from '@prisma/client';
import { SopProofType } from '@poco/constants';

export const SEED_CATALOG = [
  {
    id: 'a0000001-0000-4000-a000-000000000001',
    code: 'EMERGENCY_RESPONSE',
    name: 'Emergency Response Coordination',
    category: 'EMERGENCY',
    description: 'Immediate dispatch and emergency escalation for senior falls, acute distress, or SOS triggers.',
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
    category: 'CLINICAL',
    description: 'General physician home consultation and prescription update.',
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
    category: 'CLINICAL',
    description: 'Wound dressing, IV/IM injections, catheter management, and post-surgical care.',
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
    category: 'WELLNESS',
    description: 'Mobility enhancement, balance training, joint mobilization, and post-stroke rehabilitation.',
    pricePaise: 70000, // ₹700
    estimatedDurationMinutes: 45,
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
    category: 'LOGISTICS',
    description: 'Doorstep delivery of monthly or acute prescription medicines with bill verification.',
    pricePaise: 15000, // ₹150
    estimatedDurationMinutes: 30,
    sopSteps: [
      { stepOrder: 1, title: 'Verify Medicine Package Against Prescription', proofType: SopProofType.CHOICE, choiceOptions: ['All Items Matched', 'Partial / Substitute Approved'] },
      { stepOrder: 2, title: 'Upload Pharmacy Receipt & Medicine Box Photo', proofType: SopProofType.PHOTO }
    ]
  },
  {
    id: 'a0000006-0000-4000-a000-000000000006',
    code: 'LAB_TEST_SAMPLE',
    name: 'Home Diagnostic Lab Collection',
    category: 'CLINICAL',
    description: 'Fasting blood draw, urine sample collection, and transport to NABL accredited diagnostic labs.',
    pricePaise: 25000, // ₹250
    estimatedDurationMinutes: 30,
    sopSteps: [
      { stepOrder: 1, title: 'Verify Fasting / Pre-test Condition Compliance', proofType: SopProofType.CHOICE, choiceOptions: ['Fasting Compliant (>10 hrs)', 'Non-Fasting Approved'] },
      { stepOrder: 2, title: 'Upload Sample Barcode / Vials Photo', proofType: SopProofType.PHOTO }
    ]
  },
  {
    id: 'a0000007-0000-4000-a000-000000000007',
    code: 'VITAL_MONITORING',
    name: 'Clinical Vital Signs Check',
    category: 'WELLNESS',
    description: 'Comprehensive vital signs recording: BP, Blood Glucose, SpO2, Heart Rate, and Weight.',
    pricePaise: 30000, // ₹300
    estimatedDurationMinutes: 30,
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
    category: 'EMERGENCY',
    description: 'Rapid dispatch of ALS/BLS equipped ambulance to senior residence.',
    pricePaise: 250000, // ₹2,500
    estimatedDurationMinutes: 60,
    sopSteps: [
      { stepOrder: 1, title: 'Dispatch Confirmation & Ambulance ETA', proofType: SopProofType.TEXT },
      { stepOrder: 2, title: 'Handover to Paramedic Team Photo', proofType: SopProofType.PHOTO }
    ]
  },
  {
    id: 'a0000009-0000-4000-a000-000000000009',
    code: 'CAREGIVER_CHECKIN',
    name: 'Care Officer Wellness Visit',
    category: 'WELLNESS',
    description: 'Dedicated in-person visit by assigned Care Officer to review welfare, home safety, and social connection.',
    pricePaise: 40000, // ₹400
    estimatedDurationMinutes: 45,
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
    category: 'WELLNESS',
    description: 'Personalized dietary planning for seniors with diabetes, hypertension, renal care, or dysphagia.',
    pricePaise: 60000, // ₹600
    estimatedDurationMinutes: 45,
    sopSteps: [
      { stepOrder: 1, title: 'Nutritional Intake & Weight Assessment', proofType: SopProofType.TEXT },
      { stepOrder: 2, title: 'Upload Customized Diet Plan Chart', proofType: SopProofType.PHOTO }
    ]
  },
  {
    id: 'a0000011-0000-4000-a000-000000000011',
    code: 'MENTAL_WELLNESS',
    name: 'Cognitive & Companion Engagement',
    category: 'WELLNESS',
    description: 'Interactive reminiscence therapy, memory games, and supportive companion conversation.',
    pricePaise: 40000, // ₹400
    estimatedDurationMinutes: 45,
    sopSteps: [
      { stepOrder: 1, title: 'Cognitive Engagement Activity Completed', proofType: SopProofType.CHOICE, choiceOptions: ['Crossword / Puzzle', 'Music & Reminiscence', 'Video Call with Grandchildren', 'Casual Storytelling'] }
    ]
  },
  {
    id: 'a0000012-0000-4000-a000-000000000012',
    code: 'HOSPITAL_ESCORT',
    name: 'Care Officer Hospital Escort',
    category: 'LOGISTICS',
    description: 'End-to-end hospital appointment escort: wheelchair assistance, doctor consultation notes, and pharmacy pickup.',
    pricePaise: 100000, // ₹1,000
    estimatedDurationMinutes: 180,
    sopSteps: [
      { stepOrder: 1, title: 'Arrive at Hospital & Wheelchair Assistance', proofType: SopProofType.PHOTO },
      { stepOrder: 2, title: 'Record Doctor Summary Notes', proofType: SopProofType.TEXT },
      { stepOrder: 3, title: 'Safely Return Senior Home & Update Family', proofType: SopProofType.CHOICE, choiceOptions: ['Safely Returned Home', 'Admitted to Hospital'] }
    ]
  }
];

export async function seedCatalog(prisma: PrismaClient): Promise<void> {
  for (const item of SEED_CATALOG) {
    // 1. Upsert base ServiceCatalog
    const catalog = await prisma.serviceCatalog.upsert({
      where: { code: item.code },
      update: {
        name: item.name,
        category: item.category,
        description: item.description,
        isEmergency: item.category === 'EMERGENCY'
      },
      create: {
        id: item.id,
        code: item.code,
        name: item.name,
        category: item.category,
        description: item.description,
        isEmergency: item.category === 'EMERGENCY',
        slaResponseMinutes: item.category === 'EMERGENCY' ? 15 : 60,
        slaResolutionMinutes: item.category === 'EMERGENCY' ? 60 : 480
      }
    });

    // 2. Upsert ServiceCatalogVersion v1
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
        isActive: true,
        effectiveFrom: new Date('2026-01-01T00:00:00Z')
      }
    });

    // Update active version pointer on catalog
    await prisma.serviceCatalog.update({
      where: { id: catalog.id },
      data: { activeVersionId: catalogVersion.id }
    });

    // 3. Upsert SOP Steps for Version 1
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

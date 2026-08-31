import { z } from 'zod';

// M1: Aadhaar OTP Registration & Profile
export const abhaGenerateOtpReqSchema = z.object({
  aadhaarNumber: z.string().regex(/^\d{12}$/, 'Must be a 12-digit Aadhaar number'),
  consent: z.literal(true)
});

export type AbhaGenerateOtpReqDto = z.infer<typeof abhaGenerateOtpReqSchema>;

export const abhaGenerateOtpResSchema = z.object({
  txnId: z.string(),
  message: z.string(),
  mobileMasked: z.string()
});

export type AbhaGenerateOtpResDto = z.infer<typeof abhaGenerateOtpResSchema>;

export const abhaVerifyOtpReqSchema = z.object({
  txnId: z.string(),
  otp: z.string().regex(/^\d{6}$/, 'Must be a 6-digit OTP')
});

export type AbhaVerifyOtpReqDto = z.infer<typeof abhaVerifyOtpReqSchema>;

export const abhaProfileResSchema = z.object({
  abhaNumber: z.string(),
  abhaAddress: z.string(),
  name: z.string(),
  gender: z.enum(['M', 'F', 'O']),
  dateOfBirth: z.string(),
  mobile: z.string(),
  address: z.string(),
  stateName: z.string(),
  districtName: z.string(),
  profilePhoto: z.string().optional(),
  jwtToken: z.string()
});

export type AbhaProfileResDto = z.infer<typeof abhaProfileResSchema>;

// M2: Consent Management
export const abhaConsentInitReqSchema = z.object({
  seniorAbhaAddress: z.string(),
  purpose: z.string().default('CAREGIVER_HEALTH_MONITORING'),
  hiTypes: z.array(z.enum(['DiagnosticReport', 'Prescription', 'DischargeSummary', 'OPConsultation'])).default(['DiagnosticReport', 'Prescription']),
  dateRange: z.object({
    from: z.coerce.date(),
    to: z.coerce.date()
  }),
  dataEraseAt: z.coerce.date().optional()
});

export type AbhaConsentInitReqDto = z.infer<typeof abhaConsentInitReqSchema>;

export const abhaConsentStatusSchema = z.object({
  consentRequestId: z.string(),
  status: z.enum(['REQUESTED', 'GRANTED', 'DENIED', 'EXPIRED', 'REVOKED']),
  consentArtefactId: z.string().optional(),
  seniorAbhaAddress: z.string(),
  grantedAt: z.coerce.date().optional()
});

export type AbhaConsentStatusDto = z.infer<typeof abhaConsentStatusSchema>;

// M3: FHIR R4 Health Information Records
export const abhaFhirDiagnosticReportSchema = z.object({
  resourceType: z.literal('DiagnosticReport'),
  id: z.string(),
  status: z.enum(['registered', 'preliminary', 'final', 'amended']),
  code: z.object({
    coding: z.array(
      z.object({
        system: z.string(),
        code: z.string(),
        display: z.string()
      })
    )
  }),
  subject: z.object({
    reference: z.string(),
    display: z.string()
  }),
  effectiveDateTime: z.string(),
  issued: z.string(),
  conclusion: z.string().optional(),
  results: z.array(
    z.object({
      testName: z.string(),
      value: z.union([z.string(), z.number()]),
      unit: z.string(),
      referenceRange: z.string().optional(),
      interpretation: z.enum(['NORMAL', 'HIGH', 'LOW', 'CRITICAL']).optional()
    })
  ).default([])
});

export type AbhaFhirDiagnosticReportDto = z.infer<typeof abhaFhirDiagnosticReportSchema>;

export const abhaFhirMedicationRequestSchema = z.object({
  resourceType: z.literal('MedicationRequest'),
  id: z.string(),
  status: z.enum(['active', 'on-hold', 'cancelled', 'completed', 'stopped']),
  intent: z.enum(['order', 'proposal', 'plan']),
  medicationCodeableConcept: z.object({
    coding: z.array(
      z.object({
        system: z.string(),
        code: z.string(),
        display: z.string()
      })
    ),
    text: z.string()
  }),
  subject: z.object({
    reference: z.string(),
    display: z.string()
  }),
  authoredOn: z.string(),
  requester: z.object({
    agentName: z.string(),
    registrationNumber: z.string().optional()
  }),
  dosageInstruction: z.array(
    z.object({
      text: z.string(),
      timing: z.string().optional(),
      route: z.string().optional(),
      doseAndRate: z.string().optional()
    })
  ).default([])
});

export type AbhaFhirMedicationRequestDto = z.infer<typeof abhaFhirMedicationRequestSchema>;

export const abhaFhirRecordSchema = z.object({
  resourceType: z.literal('Bundle'),
  id: z.string(),
  type: z.literal('collection'),
  entry: z.array(
    z.object({
      fullUrl: z.string(),
      resource: z.union([abhaFhirDiagnosticReportSchema, abhaFhirMedicationRequestSchema])
    })
  )
});

export type AbhaFhirRecordDto = z.infer<typeof abhaFhirRecordSchema>;

import { z } from 'zod';

export const orangeLabsPhlebotomyReqSchema = z.object({
  householdId: z.string().min(1),
  seniorId: z.string().min(1),
  serviceRequestId: z.string().optional(),
  patientName: z.string().min(1),
  patientAge: z.number().int().positive(),
  patientGender: z.enum(['M', 'F', 'O']),
  testCodes: z.array(z.string()).min(1), // e.g. ['LIPID_PROFILE', 'HBA1C', 'CBC']
  appointmentSlot: z.coerce.date(),
  address: z.string().min(1),
  specialInstructions: z.string().optional() // e.g. "12 hour fasting required"
});

export type OrangeLabsPhlebotomyReqDto = z.infer<typeof orangeLabsPhlebotomyReqSchema>;

export const orangeLabsBookingResSchema = z.object({
  bookingId: z.string(),
  status: z.enum(['CONFIRMED', 'SCHEDULED', 'CANCELLED']),
  appointmentSlot: z.string(),
  phlebotomistName: z.string(),
  phlebotomistPhone: z.string(),
  totalCostPaise: z.number().int()
});

export type OrangeLabsBookingResDto = z.infer<typeof orangeLabsBookingResSchema>;

export const orangeLabsBiomarkerResultSchema = z.object({
  testName: z.string(),
  value: z.number(),
  unit: z.string(),
  referenceRange: z.string(),
  status: z.enum(['NORMAL', 'BORDERLINE', 'HIGH', 'CRITICAL'])
});

export const orangeLabsReportWebhookSchema = z.object({
  bookingId: z.string(),
  serviceRequestId: z.string().optional(),
  status: z.enum([
    'PHLEBOTOMIST_ASSIGNED',
    'SAMPLE_COLLECTED',
    'SAMPLE_IN_LAB',
    'REPORT_READY',
    'REPORT_FAILED'
  ]),
  reportPdfUrl: z.string().url().optional(),
  biomarkers: z.array(orangeLabsBiomarkerResultSchema).optional(),
  collectedAt: z.coerce.date().optional(),
  reportGeneratedAt: z.coerce.date().optional(),
  timestamp: z.coerce.date()
});

export type OrangeLabsReportWebhookDto = z.infer<typeof orangeLabsReportWebhookSchema>;

import { z } from 'zod';

export const healthServicesAttendantReqSchema = z.object({
  householdId: z.string().min(1),
  seniorId: z.string().min(1),
  serviceRequestId: z.string().optional(),
  patientName: z.string().min(1),
  serviceType: z.enum([
    'DOCTOR_TELECONSULT',
    'PHYSIOTHERAPIST_HOME_VISIT',
    'NURSING_ATTENDANT_DAY_SHIFT',
    'NURSING_ATTENDANT_NIGHT_SHIFT',
    'MEDICAL_EQUIPMENT_RENTAL'
  ]),
  doctorSpecialty: z.string().optional(), // e.g. "CARDIOLOGY", "GERIATRIC"
  appointmentSlot: z.coerce.date(),
  clinicalNotes: z.string().optional()
});

export type HealthServicesAttendantReqDto = z.infer<typeof healthServicesAttendantReqSchema>;

export const healthServicesBookingResSchema = z.object({
  bookingId: z.string(),
  status: z.enum(['CONFIRMED', 'SCHEDULED', 'ACTIVE', 'CANCELLED']),
  providerName: z.string(),
  providerPhone: z.string().optional(),
  providerQualification: z.string().optional(),
  meetingUrl: z.string().url().optional(),
  chargePaise: z.number().int()
});

export type HealthServicesBookingResDto = z.infer<typeof healthServicesBookingResSchema>;

export const healthServicesShiftWebhookSchema = z.object({
  bookingId: z.string(),
  serviceRequestId: z.string().optional(),
  status: z.enum([
    'ATTENDANT_ASSIGNED',
    'SHIFT_STARTED',
    'SHIFT_ENDED',
    'CONSULTATION_COMPLETED',
    'CANCELLED'
  ]),
  vitalsObserved: z.record(z.string(), z.any()).optional(),
  doctorNotes: z.string().optional(),
  prescriptionPdfUrl: z.string().url().optional(),
  completedAt: z.coerce.date().optional(),
  timestamp: z.coerce.date()
});

export type HealthServicesShiftWebhookDto = z.infer<typeof healthServicesShiftWebhookSchema>;

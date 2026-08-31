import { z } from 'zod';
import { TicketPriority, VitalType } from '@poco/constants';
import { uuidSchema, indianPhoneSchema, abhaIdSchema } from '../common/formats';

/**
 * Family Ticket creation schema.
 */
export const ticketCreateSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters'),
  description: z.string().trim().min(10, 'Description must be at least 10 characters'),
  priority: z.nativeEnum(TicketPriority).default(TicketPriority.ROUTINE),
  seniorId: uuidSchema.optional(),
  serviceCatalogVersionId: uuidSchema.optional(),
  category: z.string().trim().default('GENERAL')
});

export type TicketCreateDto = z.infer<typeof ticketCreateSchema>;

/**
 * Wallet Top-Up Schema (Integer in Paise) per D-78.
 * Bounds: Min 10,000 paise (₹100), Max 10,000,000 paise (₹1,00,000).
 */
export const walletTopUpSchema = z.object({
  amountPaise: z
    .number()
    .int('Amount in paise must be an integer')
    .min(10000, 'Minimum top-up amount is ₹100 (10,000 paise)')
    .max(10000000, 'Maximum top-up amount is ₹1,00,000 (10,000,000 paise)')
});

export type WalletTopUpDto = z.infer<typeof walletTopUpSchema>;

/**
 * Senior Creation Schema.
 */
export const createSeniorSchema = z.object({
  name: z.string().trim().min(2, 'Senior name must be at least 2 characters'),
  dateOfBirth: z.coerce.date(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional()
});

export type CreateSeniorDto = z.infer<typeof createSeniorSchema>;

/**
 * Senior Medical Profile Update Schema.
 */
export const updateMedicalProfileSchema = z.object({
  allergies: z.array(z.string().trim()).default([]),
  chronicConditions: z.array(z.string().trim()).default([]),
  abhaId: abhaIdSchema.optional(),
  iceContactName: z.string().trim().min(2, 'ICE contact name is required'),
  iceContactPhone: indianPhoneSchema,
  iceRelationship: z.string().trim().min(2, 'ICE relationship is required'),
  notes: z.string().trim().optional()
});

export type UpdateMedicalProfileDto = z.infer<typeof updateMedicalProfileSchema>;

/**
 * Clinical Vital Reading Schemas with bounds per D-80.
 */
const bpVitalSchema = z.object({
  vitalType: z.literal(VitalType.BLOOD_PRESSURE),
  systolic: z.number().int().min(50, 'Systolic BP too low').max(260, 'Systolic BP too high'),
  diastolic: z.number().int().min(30, 'Diastolic BP too low').max(180, 'Diastolic BP too high'),
  unit: z.literal('mmHg').default('mmHg')
});

const spo2VitalSchema = z.object({
  vitalType: z.literal(VitalType.SPO2),
  numericValue: z.number().min(50, 'SpO2 must be at least 50%').max(100, 'SpO2 cannot exceed 100%'),
  unit: z.literal('%').default('%')
});

const glucoseVitalSchema = z.object({
  vitalType: z.literal(VitalType.BLOOD_GLUCOSE),
  numericValue: z.number().min(20, 'Glucose reading too low').max(600, 'Glucose reading too high'),
  unit: z.enum(['mg/dL', 'mmol/L']).default('mg/dL')
});

const heartRateVitalSchema = z.object({
  vitalType: z.literal(VitalType.HEART_RATE),
  numericValue: z.number().int().min(30, 'Heart rate too low').max(220, 'Heart rate too high'),
  unit: z.literal('bpm').default('bpm')
});

const temperatureVitalSchema = z.object({
  vitalType: z.literal(VitalType.BODY_TEMPERATURE),
  numericValue: z.number().min(90.0, 'Temperature too low').max(110.0, 'Temperature too high'),
  unit: z.enum(['°F', '°C']).default('°F')
});

const weightVitalSchema = z.object({
  vitalType: z.literal(VitalType.WEIGHT),
  numericValue: z.number().min(20.0).max(300.0),
  unit: z.literal('kg').default('kg')
});

const fallAlertVitalSchema = z.object({
  vitalType: z.literal(VitalType.FALL_ALERT),
  numericValue: z.literal(1),
  unit: z.literal('event').default('event')
});

export const vitalReadingInputSchema = z
  .discriminatedUnion('vitalType', [
    bpVitalSchema,
    spo2VitalSchema,
    glucoseVitalSchema,
    heartRateVitalSchema,
    temperatureVitalSchema,
    weightVitalSchema,
    fallAlertVitalSchema
  ])
  .superRefine((data, ctx) => {
    if (data.vitalType === VitalType.BLOOD_PRESSURE) {
      if (data.systolic <= data.diastolic) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Systolic blood pressure must be higher than diastolic blood pressure',
          path: ['systolic']
        });
      }
    }
  });

export type VitalReadingInputDto = z.infer<typeof vitalReadingInputSchema>;

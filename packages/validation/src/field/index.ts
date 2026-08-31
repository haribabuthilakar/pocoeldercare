import { z } from 'zod';
import { uuidSchema } from '../common/formats';
import { vitalReadingInputSchema } from '../family';

/**
 * Care Officer GPS Visit Check-In Schema.
 */
export const visitCheckInSchema = z.object({
  householdId: uuidSchema,
  ticketId: uuidSchema.optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracyMeters: z.number().positive().optional()
});

export type VisitCheckInDto = z.infer<typeof visitCheckInSchema>;

/**
 * Care Officer GPS Visit Check-Out Schema.
 */
export const visitCheckOutSchema = z.object({
  visitLogId: uuidSchema,
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  notes: z.string().trim().optional()
});

export type VisitCheckOutDto = z.infer<typeof visitCheckOutSchema>;

/**
 * SOP Step Progress Execution Schema.
 */
export const sopProgressUpdateSchema = z.object({
  serviceRequestId: uuidSchema,
  sopStepVersionId: uuidSchema,
  isCompleted: z.boolean(),
  proofUrl: z.string().url('Invalid proof S3 URL').optional(),
  choiceValue: z.string().trim().optional(),
  notes: z.string().trim().optional()
});

export type SopProgressUpdateDto = z.infer<typeof sopProgressUpdateSchema>;

/**
 * Care Officer Field Vital Recording Schema.
 */
export const recordFieldVitalSchema = z.object({
  seniorId: uuidSchema,
  vital: vitalReadingInputSchema
});

export type RecordFieldVitalDto = z.infer<typeof recordFieldVitalSchema>;

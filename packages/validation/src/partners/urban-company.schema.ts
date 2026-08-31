import { z } from 'zod';

export const urbanCompanyJobReqSchema = z.object({
  householdId: z.string().min(1),
  seniorId: z.string().min(1),
  serviceRequestId: z.string().optional(),
  serviceCategory: z.enum([
    'ELDERLY_PHYSIO_SESSION',
    'HOME_SAFETY_GRAB_BAR_INSTALLATION',
    'HOME_DEEP_CLEANING_SENIOR',
    'APPLIANCE_REPAIR_SAFETY_CHECK'
  ]),
  scheduledAt: z.coerce.date(),
  address: z.string().min(1),
  instructions: z.string().optional()
});

export type UrbanCompanyJobReqDto = z.infer<typeof urbanCompanyJobReqSchema>;

export const urbanCompanyJobResSchema = z.object({
  jobId: z.string(),
  status: z.enum(['REQUESTED', 'PROFESSIONAL_ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
  professionalName: z.string(),
  professionalPhone: z.string(),
  rating: z.number().min(0).max(5).default(4.9),
  totalChargePaise: z.number().int()
});

export type UrbanCompanyJobResDto = z.infer<typeof urbanCompanyJobResSchema>;

export const urbanCompanyJobStatusWebhookSchema = z.object({
  jobId: z.string(),
  serviceRequestId: z.string().optional(),
  status: z.enum(['PROFESSIONAL_ASSIGNED', 'STARTED', 'COMPLETED', 'CANCELLED']),
  completionNotes: z.string().optional(),
  completedAt: z.coerce.date().optional(),
  timestamp: z.coerce.date()
});

export type UrbanCompanyJobStatusWebhookDto = z.infer<typeof urbanCompanyJobStatusWebhookSchema>;

import { z } from 'zod';
import { LeadStage, SopProofType } from '@poco/constants';
import { uuidSchema, indianPhoneSchema } from '../common/formats';

/**
 * Assign Care Officer to Household Schema.
 */
export const assignCareOfficerSchema = z.object({
  householdId: uuidSchema,
  careOfficerId: uuidSchema
});

export type AssignCareOfficerDto = z.infer<typeof assignCareOfficerSchema>;

/**
 * Reassign Care Officer to Household Schema.
 */
export const reassignCareOfficerSchema = z.object({
  householdId: uuidSchema,
  newCareOfficerId: uuidSchema,
  reason: z.string().trim().min(5, 'Reassignment reason is required')
});

export type ReassignCareOfficerDto = z.infer<typeof reassignCareOfficerSchema>;

/**
 * Lead Creation Schema.
 */
export const createLeadSchema = z.object({
  contactName: z.string().trim().min(2, 'Contact name must be at least 2 characters'),
  phone: indianPhoneSchema,
  email: z.string().trim().email().optional(),
  addressLine1: z.string().trim().optional(),
  city: z.string().trim().optional(),
  state: z.string().trim().optional(),
  postalCode: z.string().trim().optional(),
  notes: z.string().trim().optional()
});

export type CreateLeadDto = z.infer<typeof createLeadSchema>;

/**
 * Update Lead Stage Schema.
 */
export const updateLeadStageSchema = z.object({
  leadId: uuidSchema,
  stage: z.nativeEnum(LeadStage),
  notes: z.string().trim().optional(),
  assignedOfficerId: uuidSchema.optional()
});

export type UpdateLeadStageDto = z.infer<typeof updateLeadStageSchema>;

/**
 * Create Service Catalog Version Schema.
 */
export const createServiceCatalogVersionSchema = z.object({
  serviceCatalogId: uuidSchema,
  pricePaise: z.number().int().min(0, 'Price must be non-negative'),
  estimatedDurationMinutes: z.number().int().min(5).default(60),
  requiredCertifications: z.array(z.string().trim()).default([]),
  sopSteps: z
    .array(
      z.object({
        stepOrder: z.number().int().min(1),
        title: z.string().trim().min(2),
        description: z.string().trim().optional(),
        isRequired: z.boolean().default(true),
        proofType: z.nativeEnum(SopProofType).default(SopProofType.NONE),
        choiceOptions: z.array(z.string().trim()).optional()
      })
    )
    .min(1, 'At least one SOP step is required')
});

export type CreateServiceCatalogVersionDto = z.infer<typeof createServiceCatalogVersionSchema>;

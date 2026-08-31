import { z } from 'zod';
import { FamilyRole } from '@poco/constants';
import { indianPhoneSchema, uuidSchema } from '../common/formats';

/**
 * External family signup schema per AUTH-01.
 */
export const externalSignUpSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  phone: indianPhoneSchema,
  email: z.string().trim().email('Invalid email address').optional(),
  role: z.nativeEnum(FamilyRole).default(FamilyRole.PRIMARY_CAREGIVER),
  householdName: z.string().trim().min(2).optional()
});

export type ExternalSignUpDto = z.infer<typeof externalSignUpSchema>;

/**
 * OTP Request schema for family login.
 */
export const sendOtpSchema = z.object({
  phone: indianPhoneSchema
});

export type SendOtpDto = z.infer<typeof sendOtpSchema>;

/**
 * External login with phone + OTP verification per AUTH-01.
 */
export const externalLoginSchema = z.object({
  phone: indianPhoneSchema,
  otp: z.string().trim().regex(/^\d{6}$/, 'OTP must be a 6-digit numeric code')
});

export type ExternalLoginDto = z.infer<typeof externalLoginSchema>;

/**
 * Internal staff password login schema per AUTH-02.
 */
export const internalLoginSchema = z.object({
  email: z.string().trim().email('Invalid work email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
});

export type InternalLoginDto = z.infer<typeof internalLoginSchema>;

/**
 * External user multi-household context switch schema per AUTH-05.
 */
export const switchHouseholdContextSchema = z.object({
  householdId: uuidSchema
});

export type SwitchHouseholdContextDto = z.infer<typeof switchHouseholdContextSchema>;

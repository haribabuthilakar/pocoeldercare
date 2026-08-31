import { z } from 'zod';

/**
 * Validates 10-digit Indian phone numbers (optional +91 or 0 prefix).
 */
export const indianPhoneSchema = z
  .string()
  .trim()
  .regex(
    /^(?:\+91|0)?[6-9]\d{9}$/,
    'Invalid Indian mobile number. Must be a 10-digit number starting with 6-9'
  )
  .transform((val) => {
    const cleaned = val.replace(/\D/g, '');
    return cleaned.length === 12 && cleaned.startsWith('91')
      ? cleaned.slice(2)
      : cleaned.length === 11 && cleaned.startsWith('0')
      ? cleaned.slice(1)
      : cleaned;
  });

/**
 * Validates Ayushman Bharat Health Account (ABHA) ID (14 digits with hyphens).
 */
export const abhaIdSchema = z
  .string()
  .trim()
  .regex(
    /^\d{2}-\d{4}-\d{4}-\d{4}$/,
    'Invalid ABHA ID format. Must follow standard 14-digit format: XX-XXXX-XXXX-XXXX'
  );

/**
 * Validates 6-digit Indian Postal PIN Code.
 */
export const pinCodeSchema = z
  .string()
  .trim()
  .regex(/^[1-9][0-9]{5}$/, 'Invalid Indian PIN code. Must be a 6-digit postal code');

/**
 * Validates UUID v4 strings.
 */
export const uuidSchema = z.string().uuid('Invalid UUID identifier');

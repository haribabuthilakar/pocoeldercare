/**
 * Supported integration partner codes.
 */
export enum PartnerCode {
  RAZORPAY = 'RAZORPAY',
  EXOTEL = 'EXOTEL',
  POCOCARE_EMR = 'POCOCARE_EMR',
  WEARABLE_IOT = 'WEARABLE_IOT',
  APOLLO_1MG = 'APOLLO_1MG',
  MAX_HEALTHCARE = 'MAX_HEALTHCARE',
  UBER_CARE = 'UBER_CARE',
  PORTER_LOGISTICS = 'PORTER_LOGISTICS'
}

export const PARTNER_CODES = Object.values(PartnerCode) as readonly PartnerCode[];

/**
 * Partner service category classification.
 */
export enum PartnerCategory {
  PAYMENT = 'PAYMENT',
  TELEPHONY = 'TELEPHONY',
  HEALTHCARE_EMR = 'HEALTHCARE_EMR',
  IOT_DEVICE = 'IOT_DEVICE',
  PHARMACY = 'PHARMACY',
  HOSPITAL = 'HOSPITAL',
  TRANSPORT = 'TRANSPORT',
  LOGISTICS = 'LOGISTICS'
}

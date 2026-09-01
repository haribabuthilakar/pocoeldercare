import type { PrismaClient } from '@prisma/client';
import { PartnerCode, PartnerStatus } from '@poco/constants';

export const SEED_PARTNERS = [
  { code: PartnerCode.RAZORPAY, name: 'Razorpay Payment Gateway', category: 'PAYMENT', webhookSecret: 'rzp_test_secret_key_12345' },
  { code: PartnerCode.EXOTEL, name: 'Exotel Telephony & Cloud IVR', category: 'TELEPHONY', webhookSecret: 'exo_test_secret_key_12345' },
  { code: PartnerCode.ONE_MG, name: 'Tata 1mg Pharmacy Fulfillment', category: 'PHARMACY', webhookSecret: '1mg_test_secret_key_12345' },
  { code: PartnerCode.APOLLO_1MG, name: 'Apollo Pharmacy Retail Deliveries', category: 'PHARMACY', webhookSecret: 'apl_test_secret_key_12345' },
  { code: PartnerCode.ORANGE_LABS, name: 'Orange Labs Diagnostics', category: 'DIAGNOSTICS', webhookSecret: 'ora_test_secret_key_12345' },
  { code: PartnerCode.HEALTH_SERVICES, name: 'Health Services Nursing Care', category: 'HOME_SERVICES', webhookSecret: 'hea_test_secret_key_12345' },
  { code: PartnerCode.MAX_HEALTHCARE, name: 'Max Healthcare Emergency Ambulances', category: 'HOSPITAL', webhookSecret: 'max_test_secret_key_12345' },
  { code: PartnerCode.INSTAMART, name: 'Swiggy Instamart Quick Commerce', category: 'QUICK_COMMERCE', webhookSecret: 'ins_test_secret_key_12345' },
  { code: PartnerCode.SWIGGY, name: 'Swiggy Meal Delivery', category: 'MEAL_DELIVERY', webhookSecret: 'swi_test_secret_key_12345' },
  { code: PartnerCode.URBAN_COMPANY, name: 'Urban Company Home Care', category: 'HOME_SERVICES', webhookSecret: 'urb_test_secret_key_12345' },
  { code: PartnerCode.OLA, name: 'Ola Mobility Transport', category: 'TRANSPORT', webhookSecret: 'ola_test_secret_key_12345' },
  { code: PartnerCode.POCOCARE_EMR, name: 'Pococare Clinical EMR Sync', category: 'HEALTHCARE_EMR', webhookSecret: 'poc_test_secret_key_12345' }
];

export async function seedPartners(prisma: PrismaClient): Promise<void> {
  for (const partner of SEED_PARTNERS) {
    await prisma.integrationPartner.upsert({
      where: { partnerCode: partner.code },
      update: {
        name: partner.name,
        category: partner.category,
        status: PartnerStatus.MOCK_ONLY,
        mockSettings: {
          webhookSecret: partner.webhookSecret,
          mockResponseDelayMs: 300,
          mockFailureRatePercent: 0
        }
      },
      create: {
        partnerCode: partner.code,
        name: partner.name,
        category: partner.category,
        status: PartnerStatus.MOCK_ONLY,
        mockSettings: {
          webhookSecret: partner.webhookSecret,
          mockResponseDelayMs: 300,
          mockFailureRatePercent: 0
        }
      }
    });
  }
}

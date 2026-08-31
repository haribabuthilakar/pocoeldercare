import type { PrismaClient } from '@prisma/client';
import { PartnerCode, PartnerStatus } from '@poco/constants';

export const SEED_PARTNERS = [
  { code: PartnerCode.RAZORPAY, name: 'Razorpay Payment Gateway', category: 'PAYMENT', webhookSecret: 'rzp_test_secret_key_12345' },
  { code: PartnerCode.EXOTEL, name: 'Exotel Telephony & Cloud IVR', category: 'TELEPHONY', webhookSecret: 'exo_test_secret_key_12345' },
  { code: PartnerCode.TATA_1MG, name: 'Tata 1mg Pharmacy Fulfillment', category: 'PHARMACY', webhookSecret: '1mg_test_secret_key_12345' },
  { code: PartnerCode.APOLLO_PHARMACY, name: 'Apollo Pharmacy Retail Deliveries', category: 'PHARMACY', webhookSecret: 'apl_test_secret_key_12345' },
  { code: PartnerCode.RED_HEALTH, name: 'Red Health Emergency Ambulances', category: 'AMBULANCE', webhookSecret: 'red_test_secret_key_12345' },
  { code: PartnerCode.MEDULANCE, name: 'Medulance Smart Ambulances', category: 'AMBULANCE', webhookSecret: 'med_test_secret_key_12345' },
  { code: PartnerCode.PORTAL_HEALTH, name: 'Portea Home Healthcare', category: 'NURSING', webhookSecret: 'por_test_secret_key_12345' },
  { code: PartnerCode.CALLHEALTH, name: 'CallHealth Diagnostics & Nursing', category: 'NURSING', webhookSecret: 'cal_test_secret_key_12345' },
  { code: PartnerCode.LAL_PATHLABS, name: 'Dr. Lal PathLabs Diagnostics', category: 'DIAGNOSTICS', webhookSecret: 'lal_test_secret_key_12345' },
  { code: PartnerCode.THYROCARE, name: 'Thyrocare Technologies', category: 'DIAGNOSTICS', webhookSecret: 'thy_test_secret_key_12345' },
  { code: PartnerCode.RAPIDO, name: 'Rapido Logistics & Hyperlocal', category: 'LOGISTICS', webhookSecret: 'rap_test_secret_key_12345' },
  { code: PartnerCode.POCOCARE_EMR, name: 'Pococare Clinical EMR Sync', category: 'EMR', webhookSecret: 'poc_test_secret_key_12345' }
];

export async function seedPartners(prisma: PrismaClient): Promise<void> {
  for (const partner of SEED_PARTNERS) {
    await prisma.integrationPartner.upsert({
      where: { code: partner.code },
      update: {
        name: partner.name,
        category: partner.category,
        webhookSecret: partner.webhookSecret,
        status: PartnerStatus.MOCK_ONLY
      },
      create: {
        code: partner.code,
        name: partner.name,
        category: partner.category,
        status: PartnerStatus.MOCK_ONLY,
        webhookSecret: partner.webhookSecret,
        mockResponseDelayMs: 300,
        mockFailureRatePercent: 0
      }
    });
  }
}

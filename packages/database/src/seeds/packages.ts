import type { PrismaClient } from '@prisma/client';
import { PackageTier } from '@poco/constants';

export const SEED_PACKAGES = [
  {
    id: 'd0000001-0000-4000-a000-000000000001',
    code: 'KAVACH',
    name: 'Poco Kavach (Emergency Safety)',
    tier: PackageTier.KAVACH,
    description: '24/7 Emergency response, SOS monitoring, and baseline vital check.',
    monthlyPricePaise: 50000, // ₹500/mo
    yearlyPricePaise: 500000, // ₹5,000/yr (2 months free)
    quotas: [
      { serviceCode: 'EMERGENCY_RESPONSE', monthlyUnits: 1 },
      { serviceCode: 'VITAL_MONITORING', monthlyUnits: 1 }
    ]
  },
  {
    id: 'd0000002-0000-4000-a000-000000000002',
    code: 'SAHARA',
    name: 'Poco Sahara (Assisted Care)',
    tier: PackageTier.SAHARA,
    description: 'Bi-weekly Care Officer wellness visits, vital checks, medicine deliveries, and doctor consultation.',
    monthlyPricePaise: 300000, // ₹3,000/mo
    yearlyPricePaise: 3000000, // ₹30,000/yr
    quotas: [
      { serviceCode: 'CAREGIVER_CHECKIN', monthlyUnits: 2 },
      { serviceCode: 'VITAL_MONITORING', monthlyUnits: 2 },
      { serviceCode: 'MEDICINE_DELIVERY', monthlyUnits: 2 },
      { serviceCode: 'DOCTOR_HOME_VISIT', monthlyUnits: 1 }
    ]
  },
  {
    id: 'd0000003-0000-4000-a000-000000000003',
    code: 'SAMPOORNA',
    name: 'Poco Sampoorna (Comprehensive Peace-of-Mind)',
    tier: PackageTier.SAMPOORNA,
    description: 'Weekly dedicated visits, physiotherapy, doctor consultations, hospital escorts, and complete care coordination.',
    monthlyPricePaise: 1250000, // ₹12,500/mo
    yearlyPricePaise: 12500000, // ₹1,25,000/yr
    quotas: [
      { serviceCode: 'CAREGIVER_CHECKIN', monthlyUnits: 8 },
      { serviceCode: 'VITAL_MONITORING', monthlyUnits: 4 },
      { serviceCode: 'PHYSIOTHERAPY', monthlyUnits: 4 },
      { serviceCode: 'DOCTOR_HOME_VISIT', monthlyUnits: 2 },
      { serviceCode: 'HOSPITAL_ESCORT', monthlyUnits: 2 },
      { serviceCode: 'MEDICINE_DELIVERY', monthlyUnits: 4 }
    ]
  }
];

export async function seedPackages(prisma: PrismaClient): Promise<void> {
  for (const pkg of SEED_PACKAGES) {
    const packageRecord = await prisma.package.upsert({
      where: { code: pkg.code },
      update: {
        name: pkg.name,
        tier: pkg.tier,
        description: pkg.description
      },
      create: {
        id: pkg.id,
        code: pkg.code,
        name: pkg.name,
        tier: pkg.tier,
        description: pkg.description
      }
    });

    const versionId = `e${pkg.id.slice(1)}`;
    const packageVersion = await prisma.packageVersion.upsert({
      where: {
        packageId_version: {
          packageId: packageRecord.id,
          version: 1
        }
      },
      update: {
        monthlyPricePaise: pkg.monthlyPricePaise,
        yearlyPricePaise: pkg.yearlyPricePaise
      },
      create: {
        id: versionId,
        packageId: packageRecord.id,
        version: 1,
        monthlyPricePaise: pkg.monthlyPricePaise,
        yearlyPricePaise: pkg.yearlyPricePaise,
        effectiveFrom: new Date('2026-01-01T00:00:00Z')
      }
    });

    for (const quota of pkg.quotas) {
      const service = await prisma.serviceCatalog.findUnique({
        where: { code: quota.serviceCode }
      });

      if (service) {
        await prisma.packageServiceQuota.upsert({
          where: {
            packageVersionId_serviceCatalogId: {
              packageVersionId: packageVersion.id,
              serviceCatalogId: service.id
            }
          },
          update: {
            monthlyUnits: quota.monthlyUnits
          },
          create: {
            packageVersionId: packageVersion.id,
            serviceCatalogId: service.id,
            monthlyUnits: quota.monthlyUnits
          }
        });
      }
    }
  }
}

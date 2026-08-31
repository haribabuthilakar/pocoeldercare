import { PrismaClient } from '@prisma/client';
import { seedStaff } from './seeds/staff';
import { seedCatalog } from './seeds/catalog';
import { seedPackages } from './seeds/packages';
import { seedPartners } from './seeds/partners';
import { seedHouseholds } from './seeds/households';

const prisma = new PrismaClient();

export async function main() {
  if (process.env.NODE_ENV === 'production' && !process.env.ALLOW_PROD_SEED) {
    console.error('❌ SEED ABORTED: Running seed scripts against production databases is strictly prohibited per D-136.');
    process.exit(1);
  }

  console.log('🚀 Starting Poco Elder Care database baseline seeding...\n');
  const startTime = Date.now();

  try {
    console.log('1/5 Seeding staff and roles...');
    await seedStaff(prisma);
    console.log('   ✅ 4 Staff accounts (Admin, Ops, Care Manager, Care Officer) seeded with BLS/First Aid certs.');

    console.log('2/5 Seeding service catalog and SOP steps...');
    await seedCatalog(prisma);
    console.log('   ✅ 12 Core services and version 1 SOP steps seeded.');

    console.log('3/5 Seeding subscription packages and quota definitions...');
    await seedPackages(prisma);
    console.log('   ✅ 3 Packages (Kavach ₹500, Sahara ₹3,000, Sampoorna ₹12,500) seeded with version 1 quotas.');

    console.log('4/5 Seeding integration partners...');
    await seedPartners(prisma);
    console.log('   ✅ 12 MOCK_ONLY integration partners seeded with default latency/secrets.');

    console.log('5/5 Seeding demo households, seniors, wallets, and subscriptions...');
    await seedHouseholds(prisma);
    console.log('   ✅ 3 Demo households (Sahara Active, Kavach Fresh, Sampoorna NRI) seeded.');

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n🎉 Seeding completed idempotently in ${elapsed}s!\n`);

    console.log('📋 DEMO CREDENTIALS:');
    console.log('------------------------------------------------------------');
    console.log('Super Admin:    admin@pocoeldercare.com    / Password@123');
    console.log('Ops Manager:    ops@pocoeldercare.com      / Password@123');
    console.log('Care Manager:   manager@pocoeldercare.com  / Password@123');
    console.log('Care Officer:   officer@pocoeldercare.com  / Password@123');
    console.log('Family (Sahara): Phone 9876500010 (Vikram Nair)');
    console.log('------------------------------------------------------------');
  } catch (error) {
    console.error('❌ Seeding failed with error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main()
    .catch(() => process.exit(1));
}
